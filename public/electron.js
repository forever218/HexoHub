const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// 获取应用版本号
ipcMain.handle('get-app-version', async () => {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read version from package.json:', error);
    return app.getVersion(); // fallback 到 electron 的版本
  }
});

// 图片处理相关的 IPC 处理程序
// 注册从缓冲区写入文件的 IPC 处理程序
ipcMain.handle('write-file-from-buffer', async (event, destinationPath, buffer) => {
  try {
    // 确保目标目录存在
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(destinationPath, Buffer.from(buffer));
    return { success: true };
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
});

// 注册确保目录存在的 IPC 处理程序
ipcMain.handle('ensure-directory-exists', async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    console.error('创建目录失败:', error);
    throw error;
  }
});

// ---------------------------------------------------------------------------
// Linux VSync / GPU 兼容性处理
// 在部分 Arch/Manjaro + Wayland/Mesa 环境下，Electron (Chromium) 会输出：
//   GetVSyncParametersIfAvailable() failed for N times!
// 这是由于底层 GL / VSync 提供方（尤其 Wayland 或无合适的 DRM/GLX 时间戳）返回空参数，
// 通常不影响功能，但大量日志会干扰用户。这里做几件事：
// 1. 默认添加 "disable-gpu-vsync" 减少相关调用频率。
// 2. Wayland 下尝试启用 ozone 自动平台提示，改进兼容性。
// 3. 提供环境变量 HEXOHUB_DISABLE_GPU=1 用于完全禁用硬件加速（最后兜底）。
// 4. 若在没有 DISPLAY 的环境（可能是打包或 CI）也自动禁用加速，避免初始化失败。
// 如果仍有问题，用户可以：
//   HEXOHUB_DISABLE_GPU=1 hexohub
// 或在 AUR 包装脚本里导出该变量。
// ---------------------------------------------------------------------------
const isLinux = process.platform === 'linux';
if (isLinux) {
  // 禁用 vsync 调用，降低 GetVSyncParametersIfAvailable 触发
  app.commandLine.appendSwitch('disable-gpu-vsync');

  // Wayland 环境尝试自动平台提示
  if (process.env.XDG_SESSION_TYPE === 'wayland') {
    app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
    // 可选：为部分环境增加装饰支持
    app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');
  }

  // 若用户显式要求禁用 GPU 或无图形显示变量
  if (process.env.HEXOHUB_DISABLE_GPU === '1' || !process.env.DISPLAY) {
    app.disableHardwareAcceleration();
  }
}

// 关闭 Electron 安全警告（已知我们在受控桌面环境中运行）
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Windows兼容性工具
const WindowsCompat = {
  isWindows: () => process.platform === 'win32',
  normalizePath: (p) => p.replace(/[\\/]/g, '/').replace(/\/+/g, '/'),
  toWindowsPath: (p) => p.replace(/\//g, '\\'),
  escapeShellArg: (arg) => {
    if (WindowsCompat.isWindows()) {
      if (arg.includes(' ') || arg.includes('"') || arg.includes('&') || arg.includes('|') || arg.includes('<') || arg.includes('>')) {
        return `"${arg.replace(/"/g, '""')}"`;
      }
      return arg;
    } else {
      if (arg.includes(' ') || arg.includes('"') || arg.includes("'") || arg.includes('\\')) {
        return `"${arg.replace(/(["\\$`!])/g, '\\$1')}"`;
      }
      return arg;
    }
  },
  shouldIgnoreFile: (filename) => {
    if (typeof filename !== 'string') return true;
    
    // 忽略隐藏文件（以点开头的文件）
    if (filename.startsWith('.')) return true;
    
    // Windows系统文件
    if (WindowsCompat.isWindows()) {
      const systemFiles = [
        'desktop.ini', 'thumbs.db', 'folder.htt', 'folder.ini'
      ];
      if (systemFiles.includes(filename.toLowerCase())) return true;
    }
    
    return false;
  },
  getHexoCommand: () => WindowsCompat.isWindows() ? 'hexo.cmd' : 'hexo',
  
  /**
   * 解码命令输出（PowerShell 输出 UTF-8，只需处理换行符）
   */
  decodeCommandOutput: (data) => {
    if (typeof data === 'string') {
      return data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    if (!Buffer.isBuffer(data) || data.length === 0) {
      return String(data || '');
    }
    return data.toString('utf8').replace(/\r\n/g, '\n');
  },
  
  /**
   * 获取执行命令的选项
   */
  getExecOptions: (options = {}) => {
    return {
      ...options,
      shell: true,
      windowsHide: true, // 隐藏命令行窗口
      encoding: 'utf8',
      env: { ...process.env, ...options.env, FORCE_COLOR: '0' }
    };
  },
  
  /**
   * 包装命令：Windows 用 PowerShell（UTF-8），其他平台直接返回
   */
  wrapCommand: (command) => {
    if (!WindowsCompat.isWindows()) {
      return command;
    }
    // 使用更安全的转义方式，避免影响标题内容
    const escaped = command.replace(/"/g, '""');
    return `powershell -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${escaped}"`;
  }
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 移除默认窗口框架
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    icon: path.join(__dirname, 'icon.ico'),
    show: false
  });

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('加载失败:', {
      errorCode,
      errorDescription,
      validatedURL,
      __dirname,
      expectedPath: path.join(__dirname, '../out/index.html')
    });
    
    // 尝试备用加载方式
    const backupPath = path.resolve(__dirname, '../out/index.html');

    mainWindow.loadFile(backupPath);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // 使用 loadFile 而不是 loadURL
    const indexPath = path.join(__dirname, '../out/index.html');
 
    
    // 检查文件是否存在
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {

      mainWindow.loadFile(indexPath);
    } else {
    
      // 尝试相对路径
      mainWindow.loadFile('./out/index.html');
    }
  }

  mainWindow.once('ready-to-show', () => {

    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
  
  });



  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 窗口控制IPC处理
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-restore-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// IPC handlers for file system operations
ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择Hexo项目目录'
  });
  
  if (canceled) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    throw error;
  }
});


ipcMain.handle('write-file', async (event, filePath, content) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('list-files', async (event, directoryPath) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // 使用Windows兼容性工具标准化路径
    const normalizedPath = WindowsCompat.normalizePath(directoryPath);
    const files = await fs.readdir(normalizedPath);
    const fileList = [];
    
    for (const file of files) {
      // 使用Windows兼容性工具检查是否应该忽略文件
      if (WindowsCompat.shouldIgnoreFile && WindowsCompat.shouldIgnoreFile(file)) continue;
      
      const fullPath = path.join(normalizedPath, file);
      const stats = await fs.stat(fullPath);
      
      // 无论是文件还是目录都添加到列表中
      fileList.push({
        name: file,
        path: fullPath,
        isDirectory: stats.isDirectory(),
        size: stats.isFile() ? stats.size : 0,
        modifiedTime: stats.mtime
      });
    }
    
    return fileList;
  } catch (error) {
    throw error;
  }
});

// Execute arbitrary command
ipcMain.handle('execute-command', async (event, command) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    // 包装命令（Windows 上使用 PowerShell 或 CMD+chcp）
    const wrappedCommand = WindowsCompat.wrapCommand(command);
    
    // 获取执行选项（PowerShell 使用 utf8，CMD 使用 buffer）
    const execOptions = WindowsCompat.getExecOptions({
      windowsHide: true // 隐藏命令行窗口
    });
    
    const result = await execPromise(wrappedCommand, execOptions);
    
    // 智能解码输出
    // PowerShell: 已经是 UTF-8 字符串，直接返回
    // CMD: buffer 模式，需要解码
    const stdout = WindowsCompat.decodeCommandOutput(result.stdout);
    const stderr = WindowsCompat.decodeCommandOutput(result.stderr);

    return {
      success: true,
      stdout: stdout,
      stderr: stderr
    };
  } catch (error) {
    // 智能解码错误输出（即使失败也要正确显示错误信息）
    const stdout = WindowsCompat.decodeCommandOutput(error.stdout || '');
    const stderr = WindowsCompat.decodeCommandOutput(error.stderr || '');
    
    return {
      success: false,
      error: error.message,
      stdout: stdout,
      stderr: stderr
    };
  }
});

// Execute hexo commands
ipcMain.handle('execute-hexo-command', async (event, command, workingDir) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    // 构建 Hexo 命令（Windows 使用 hexo.cmd）
    const hexoCommand = WindowsCompat.getHexoCommand();
    const baseCommand = `${hexoCommand} ${command}`;
    
    // 包装命令（Windows 上使用 PowerShell 或 CMD+chcp）
    const wrappedCommand = WindowsCompat.wrapCommand(baseCommand);
    
    // 获取执行选项（PowerShell 使用 utf8，CMD 使用 buffer）
    const execOptions = WindowsCompat.getExecOptions({
      cwd: workingDir,
      windowsHide: true // 隐藏命令行窗口
    });
    
    const result = await execPromise(wrappedCommand, execOptions);
    
    // 智能解码输出
    // PowerShell: 已经是 UTF-8 字符串，直接返回
    // CMD: buffer 模式，需要解码
    const stdout = WindowsCompat.decodeCommandOutput(result.stdout);
    const stderr = WindowsCompat.decodeCommandOutput(result.stderr);
    
    return {
      success: true,
      stdout: stdout,
      stderr: stderr
    };
  } catch (error) {
    // 智能解码错误输出（hexo 错误信息通常是中文）
    const stdout = WindowsCompat.decodeCommandOutput(error.stdout || '');
    const stderr = WindowsCompat.decodeCommandOutput(error.stderr || '');
    
    return {
      success: false,
      error: error.message,
      stdout: stdout,
      stderr: stderr
    };
  }
});

// Check if directory is a valid hexo project
ipcMain.handle('validate-hexo-project', async (event, directoryPath, language) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // 使用Windows兼容性工具标准化路径
    const normalizedPath = WindowsCompat.normalizePath(directoryPath);
    const packageJsonPath = path.join(normalizedPath, 'package.json');
    const configYmlPath = path.join(normalizedPath, '_config.yml');
    
    const [packageExists, configExists] = await Promise.all([
      fs.access(packageJsonPath).then(() => true).catch(() => false),
      fs.access(configYmlPath).then(() => true).catch(() => false)
    ]);
    
    if (configExists) {
      // 检查是否是有效的Hexo配置
      try {
        const configContent = await fs.readFile(configYmlPath, 'utf8');
        if (configContent.includes('title:') || configContent.includes('theme:')) {
          const validMessage = language === 'en' ? 'Valid Hexo Project' : '有效的Hexo项目';
          return { valid: true, message: validMessage };
        }
      } catch (configError) {
        // 配置文件读取失败，但存在，可能是权限问题
        return { valid: true, message: '找到Hexo配置文件（无法读取内容）' };
      }
      
      // 检查package.json是否包含hexo
      if (packageExists) {
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf8');
          if (packageContent.includes('hexo')) {
            const validMessage = language === 'en' ? 'Valid Hexo Project' : '有效的Hexo项目';
            return { valid: true, message: validMessage };
          }
        } catch (packageError) {
          // package.json读取失败，但配置文件存在
          return { valid: true, message: '找到Hexo配置文件' };
        }
      }
      
      return { valid: true, message: '找到Hexo配置文件' };
    }
    
    const invalidMessage = language === 'en' ? 'Not a valid Hexo project directory' : '不是有效的Hexo项目目录';
    return { valid: false, message: invalidMessage };
  } catch (error) {
    return { valid: false, message: '验证失败: ' + error.message };
  }
});

// 全局变量存储服务器进程
let hexoServerProcess = null;

// 启动Hexo服务器
ipcMain.handle('start-hexo-server', async (event, workingDir) => {
  const { spawn } = require('child_process');

  try {
    // 如果已经有服务器在运行，先停止它
    if (hexoServerProcess) {
      hexoServerProcess.kill();
      hexoServerProcess = null;
    }
    
    // 尝试杀死占用4000端口的进程
    const { exec } = require('child_process');
    if (WindowsCompat.isWindows()) {
      exec('netstat -ano | findstr :4000', (error, stdout, stderr) => {
        if (!error) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.includes(':4000') && line.includes('LISTENING')) {
              const parts = line.trim().split(/\s+/);
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(parseInt(pid))) {
                exec(`taskkill /F /PID ${pid}`, (killError) => {
                  if (killError) {
                  } else {
                  }
                });
              }
            }
          }
        }
      });
    } else {
      // Linux/Mac系统
      exec('lsof -ti:4000 | xargs kill -9', (error, stdout, stderr) => {
      });
    }

    // 使用Windows兼容性工具
    const hexoCommand = WindowsCompat.getHexoCommand();

    // 启动Hexo服务器

    hexoServerProcess = spawn(hexoCommand, ['server'], {
      cwd: workingDir,
      shell: true,
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    

    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';
      let serverStarted = false;

      // 监听标准输出
      hexoServerProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 检查服务器是否已启动
        if (text.includes('Hexo is running') || text.includes('localhost:4000') || text.includes('INFO  Hexo is running at http://localhost:4000/')) {
          if (!serverStarted) {
            serverStarted = true;
            resolve({
              success: true,
              stdout: 'Hexo服务器已启动在 http://localhost:4000',
              process: hexoServerProcess.pid
            });
          }
        }
      });

      // 监听错误输出
      hexoServerProcess.stderr.on('data', (data) => {
        const errorText = data.toString();
      });

      // 监听进程退出
      hexoServerProcess.on('exit', (code) => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: `服务器启动失败，退出码: ${code}`,
            stderr: errorOutput,
          });
        }
        hexoServerProcess = null;
      });

      // 监听错误
      hexoServerProcess.on('error', (error) => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: '启动服务器失败: ' + error.message,
          });
        }
        hexoServerProcess = null;
      });

      // 超时处理
      setTimeout(() => {
        if (!serverStarted) {
          resolve({
            success: false,
            error: '服务器启动超时',
          });
        }
      }, 10000); // 10秒超时
    });
  } catch (error) {
    return {
      success: false,
      error: '启动服务器失败: ' + error.message
    };
  }
});

// 停止Hexo服务器
ipcMain.handle('stop-hexo-server', async () => {
  try {
    if (hexoServerProcess) {
      // Windows下需要强制终止进程树
      if (WindowsCompat.isWindows()) {
        const { exec } = require('child_process');
        exec(`taskkill /pid ${hexoServerProcess.pid} /T /F`, (error) => {
          if (error) {
            console.error('强制终止进程失败:', error);
          }
        });
      } else {
        hexoServerProcess.kill('SIGTERM');
      }

      hexoServerProcess = null;

      return {
        success: true,
        stdout: '服务器已停止'
      };
    } else {
      return {
        success: false,
        error: '没有正在运行的服务器'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: '停止服务器失败: ' + error.message
    };
  }
});

// 打开URL
ipcMain.handle('open-url', async (event, url) => {
  const { shell } = require('electron');
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: '打开URL失败: ' + error.message
    };
  }
});

// 选择图片文件
ipcMain.handle('select-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    title: '选择背景图片'
  });

  if (canceled) {
    return null;
  }

  return filePaths[0];
});

// 使用系统"打开方式"对话框打开文件
ipcMain.handle('open-with', async (event, filePath) => {
  try {
    const { exec } = require('child_process');
    const path = require('path');

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    // 根据操作系统执行不同命令
    if (process.platform === 'win32') {
      // Windows: 使用 OpenWith.exe 命令
      exec(`"${path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'System32', 'OpenWith.exe')}" "${filePath}"`);
    } else if (process.platform === 'darwin') {
      // macOS: 使用 open 命令
      exec(`open -a TextEdit "${filePath}"`);
    } else {
      // Linux: 使用 xdg-open 命令
      exec(`xdg-open "${filePath}"`);
    }

    console.log(`已使用系统"打开方式"打开文件: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('打开文件失败:', error);
    return {
      success: false,
      error: '打开文件失败: ' + error.message
    };
  }
});

// 复制文件
ipcMain.handle('copy-file', async (event, sourcePath, destinationPath) => {
  try {
    const path = require('path');
    const destinationDir = path.dirname(destinationPath);
    
    // 确保目标目录存在
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`文件已复制: ${sourcePath} -> ${destinationPath}`);
    
    return destinationPath;
  } catch (error) {
    console.error('复制文件失败:', error);
    throw error;
  }
});

// 应用退出时清理所有子进程
app.on('before-quit', () => {
  // 清理hexo服务器进程
  if (hexoServerProcess) {
    try {
      if (WindowsCompat.isWindows()) {
        const { exec } = require('child_process');
        // 使用taskkill强制终止进程及其子进程
        exec(`taskkill /pid ${hexoServerProcess.pid} /T /F`, (error) => {
          if (error) {
            console.error('终止hexo服务器进程失败:', error);
          }
        });
      } else {
        hexoServerProcess.kill('SIGTERM');
      }
    } catch (error) {
      console.error('清理hexo服务器进程时出错:', error);
    }
    hexoServerProcess = null;
  }

  // 强制清理所有可能残留的子进程
  if (WindowsCompat.isWindows()) {
    const { exec } = require('child_process');
    // 查找并终止所有相关的node进程
    exec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq HexoHub*"', (error) => {
      if (error) {
        console.error('清理相关进程失败:', error);
      }
    });
  }
});

// 确保应用退出时彻底结束
app.on('will-quit', () => {
  // 在应用即将退出时做最后的清理
  if (hexoServerProcess) {
    try {
      hexoServerProcess.kill('SIGKILL');
      hexoServerProcess = null;
    } catch (error) {
      console.error('强制终止进程失败:', error);
    }
  }
});

// 检查更新
ipcMain.handle('check-for-updates', async () => {
  const https = require('https');
  const path = require('path');
  const { version } = require(path.join(__dirname, '..', 'package.json'));
  
  return new Promise((resolve) => {
    const repoOwner = 'forever218';
    const repoName = 'HexoHub';
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repoOwner}/${repoName}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'HexoHub'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name.replace(/^v/i, '');
            const currentVersionClean = version.replace(/^v/i, '');
            
            // 比较版本号
            const isUpdateAvailable = compareVersions(currentVersionClean, latestVersion);
            
            resolve({
              success: true,
              updateAvailable: isUpdateAvailable,
              currentVersion: version,
              latestVersion: release.tag_name,
              releaseNotes: release.body,
              downloadUrl: release.html_url,
              publishedAt: release.published_at,
              assets: release.assets
            });
          } else {
            resolve({
              success: false,
              error: `获取更新信息失败: HTTP ${res.statusCode}`
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: '解析更新信息失败: ' + error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: '网络请求失败: ' + error.message
      });
    });
    
    req.end();
  });
});

// 比较版本号函数
function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;
    
    if (latestPart > currentPart) {
      return true;
    } else if (latestPart < currentPart) {
      return false;
    }
  }
  
  return false;
}