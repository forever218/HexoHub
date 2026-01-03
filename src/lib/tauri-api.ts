// Tauri API 适配器 - 替代 Electron IPC
// 注意：这个文件只在 Tauri 环境中使用，使用动态导入避免构建错误

// 检测是否在 Tauri 环境 - 兼容 Tauri 2.x 的多种检测方法
function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(window as any).__TAURI__ || 
         !!(window as any).__TAURI_INTERNALS__ || 
         !!(window as any).ipc;
}

// 窗口控制
export const windowControls = {
  minimize: async () => {
    if (isTauriEnvironment()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    }
  },
  
  maximize: async () => {
    if (isTauriEnvironment()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      if (await appWindow.isMaximized()) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    }
  },
  
  close: async () => {
    if (isTauriEnvironment()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.close();
    }
  },
  
  show: async () => {
    if (isTauriEnvironment()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.show();
    }
  },
};

// 文件操作
export const fileOperations = {
  selectDirectory: async (): Promise<string | null> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      // 使用 Tauri 插件
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择Hexo项目目录',
      });
      return selected || null;
    }
    return null;
  },
  
  selectFile: async (): Promise<string | null> => {
    if (isTauriEnvironment()) {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [
          { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
          { name: '所有文件', extensions: ['*'] },
        ],
        title: '选择背景图片',
      });
      
      // Tauri 2.x 返回字符串路径或 null
      return (selected as string) || null;
    }
    return null;
  },
  
  readFile: async (filePath: string): Promise<string> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('read_file', { filePath });
    }
    throw new Error('Not in Tauri environment');
  },
  
  
  // 将本地文件路径转换为可在浏览器中使用的 asset URL
  // 这是 Tauri 推荐的方式，无需 base64 编码，性能更好
  convertFileSrc: async (filePath: string): Promise<string> => {
    if (isTauriEnvironment()) {
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      return convertFileSrc(filePath);
    }
    throw new Error('Not in Tauri environment');
  },
  
  writeFile: async (filePath: string, content: string): Promise<boolean> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('write_file', { filePath, content });
    }
    throw new Error('Not in Tauri environment');
  },
  
  copyFile: async (sourcePath: string, destinationPath: string): Promise<string> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('copy_file', { sourcePath, destinationPath });
    }
    throw new Error('Not in Tauri environment');
  },
  
  deleteFile: async (filePath: string): Promise<boolean> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('delete_file', { filePath });
    }
    throw new Error('Not in Tauri environment');
  },
  
  listFiles: async (directoryPath: string): Promise<any[]> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('list_files', { directoryPath });
    }
    throw new Error('Not in Tauri environment');
  },
};

// 命令执行
export const commandOperations = {
  execute: async (command: string): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('execute_command', { command });
    }
    throw new Error('Not in Tauri environment');
  },
  
  executeHexo: async (command: string, workingDir: string): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('execute_hexo_command', { command, workingDir });
    }
    throw new Error('Not in Tauri environment');
  },
  
  validateHexoProject: async (directoryPath: string, language: string): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('validate_hexo_project', { directoryPath, language });
    }
    throw new Error('Not in Tauri environment');
  },
  
  startHexoServer: async (workingDir: string): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('start_hexo_server', { workingDir });
    }
    throw new Error('Not in Tauri environment');
  },
  
  stopHexoServer: async (): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('stop_hexo_server');
    }
    throw new Error('Not in Tauri environment');
  },
  
  fixPortConflict: async (port: number): Promise<any> => {
    if (isTauriEnvironment()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('fix_port_conflict', { port });
    }
    throw new Error('Not in Tauri environment');
  },
};

// 剪贴板操作
export const clipboardOperations = {
  writeText: async (text: string): Promise<void> => {
    if (isTauriEnvironment()) {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(text);
    } else {
      throw new Error('Not in Tauri environment');
    }
  },
  
  readText: async (): Promise<string> => {
    if (isTauriEnvironment()) {
      const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
      return await readText() || '';
    }
    throw new Error('Not in Tauri environment');
  },
};

// 系统操作
export const systemOperations = {
  openUrl: async (url: string): Promise<void> => {
    if (isTauriEnvironment()) {
      // 判断是本地路径还是 URL
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
        // 打开外部 URL - 使用 shell.open
        console.log('[Tauri API] Opening URL with shell.open:', url);
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(url);
      } else {
        // 打开本地文件夹 - 使用自定义的 Rust 命令（基于 showfile crate）
        // 这个方案更可靠，参考: https://github.com/tauri-apps/plugins-workspace/issues/999
        console.log('[Tauri API] Opening folder with show_in_folder:', url);
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke('show_in_folder', { path: url });
        console.log('[Tauri API] show_in_folder result:', result);
      }
    }
  },
  
  // 在文件管理器中显示文件/文件夹（并选中）
  showInFolder: async (path: string): Promise<void> => {
    if (isTauriEnvironment()) {
      console.log('[Tauri API] showInFolder called with path:', path);
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke('show_in_folder', { path });
      console.log('[Tauri API] showInFolder result:', result);
    }
  },

  // 获取系统信息
  getSystemInfo: async (): Promise<any> => {
    if (isTauriEnvironment()) {
      try {
        // 使用新的 Tauri API
        const { type, version, arch } = await import('@tauri-apps/plugin-os');
        return {
          type: await type(),
          version: await version(),
          arch: await arch()
        };
      } catch (error) {
        console.error('Failed to get system info:', error);
        return null;
      }
    }
    return null;
  },
};

// 统一导出（兼容 Electron 风格）
export const ipcRenderer = {
  invoke: async (channel: string, ...args: any[]) => {
    switch (channel) {
      case 'select-directory':
        return fileOperations.selectDirectory();
      case 'select-file':
        return fileOperations.selectFile();
      case 'read-file':
        return fileOperations.readFile(args[0]);
      case 'convert-file-src':
        return fileOperations.convertFileSrc(args[0]);
      case 'write-file':
        return fileOperations.writeFile(args[0], args[1]);
      case 'copy-file':
        return fileOperations.copyFile(args[0], args[1]);
      case 'delete-file':
        return fileOperations.deleteFile(args[0]);
      case 'list-files':
        return fileOperations.listFiles(args[0]);
      case 'execute-command':
        return commandOperations.execute(args[0]);
      case 'execute-hexo-command':
        return commandOperations.executeHexo(args[0], args[1]);
      case 'validate-hexo-project':
        return commandOperations.validateHexoProject(args[0], args[1]);
      case 'start-hexo-server':
        return commandOperations.startHexoServer(args[0]);
      case 'stop-hexo-server':
        return commandOperations.stopHexoServer();
      case 'fix-port-conflict':
        return commandOperations.fixPortConflict(args[0]);
      case 'open-url':
        return systemOperations.openUrl(args[0]);
      case 'show-in-folder':
        return systemOperations.showInFolder(args[0]);
      case 'get-system-info':
        return systemOperations.getSystemInfo();
      default:
        throw new Error(`Unknown IPC channel: ${channel}`);
    }
  },
  
  send: (channel: string, ...args: any[]) => {
    // 同步发送（窗口控制）
    switch (channel) {
      case 'minimize-window':
        windowControls.minimize();
        break;
      case 'maximize-restore-window':
        windowControls.maximize();
        break;
      case 'close-window':
        windowControls.close();
        break;
      default:
        console.warn(`Unknown IPC send channel: ${channel}`);
    }
  },
};

// 获取应用版本号
export const getAppVersion = async (): Promise<string> => {
  if (isTauriEnvironment()) {
    try {
      const { getVersion } = await import('@tauri-apps/api/app');
      return await getVersion();
    } catch (error) {
      console.error('Failed to get Tauri version:', error);
      return 'Unknown';
    }
  }
  return 'Unknown';
};

// 检测运行环境
export const isTauri = isTauriEnvironment();
export const isElectron = typeof window !== 'undefined' && 'require' in window;
