
// 系统信息工具函数

import { isDesktopApp, getDesktopEnvironment, getIpcRenderer } from './desktop-api';

/**
 * 获取系统信息
 * @returns Promise<string> 格式化的系统信息字符串
 */
export async function getSystemInfo(): Promise<string> {
  const env = getDesktopEnvironment();
  let systemInfo = '';

  // 获取软件版本
  try {
    const { getAppVersion } = await import('./utils');
    const appVersion = await getAppVersion();
    systemInfo += `软件版本: ${appVersion}\n`;
  } catch (error) {
    console.error('Failed to get app version:', error);
    systemInfo += `软件版本: Unknown\n`;
  }

  // 获取软件架构
  systemInfo += `软件架构: ${env === 'tauri' ? 'Tauri' : env === 'electron' ? 'Electron' : 'Browser'}\n`;

  // 获取操作系统信息
  if (isDesktopApp()) {
    try {
      const ipcRenderer = await getIpcRenderer();
      let osType = 'Unknown';
      let osVersion = 'Unknown';
      let arch = 'Unknown';
      
      // 尝试使用 Tauri API 获取系统信息
      if (env === 'tauri') {
        try {
          // 使用新的 Tauri API
          const { type, version, arch: tauriArch } = await import('@tauri-apps/plugin-os');
          osType = await type();
          osVersion = await version();
          arch = await tauriArch();
        } catch (error) {
          console.error('Failed to get Tauri system info:', error);
          // 如果 Tauri API 失败，尝试使用 IPC 命令
          try {
            const osInfo = await ipcRenderer.invoke('get-system-info');
            if (osInfo) {
              osType = osInfo.type || osType;
              osVersion = osInfo.version || osVersion;
              arch = osInfo.arch || arch;
            }
          } catch (ipcError) {
            console.error('Failed to get system info via IPC:', ipcError);
          }
        }
      } else if (env === 'electron') {
        // Electron 环境
        try {
          const osInfo = await ipcRenderer.invoke('get-system-info');
          if (osInfo) {
            osType = osInfo.type || osType;
            osVersion = osInfo.version || osVersion;
            arch = osInfo.arch || arch;
          }
        } catch (error) {
          console.error('Failed to get Electron system info:', error);
        }
      }
      
      // 如果仍然无法获取系统信息，使用浏览器API
      if (osType === 'Unknown') {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) osType = 'Windows';
        else if (userAgent.includes('Mac')) osType = 'macOS';
        else if (userAgent.includes('Linux')) osType = 'Linux';
        else osType = navigator.platform || 'Unknown';
      }
      
      systemInfo += `操作系统: ${osType}\n`;
      systemInfo += `系统版本: ${osVersion}\n`;
      systemInfo += `系统架构: ${arch}\n`;

      // 获取PowerShell版本（仅Windows）
      if (osType.toLowerCase().includes('win')) {
        try {
          // 使用更简单且可靠的方式获取 PowerShell 版本
          const psVersion = await ipcRenderer.invoke('execute-command', 'powershell -Command "$($PSVersionTable.PSVersion.ToString())"');
          if (psVersion && psVersion.stdout) {
            systemInfo += `PowerShell版本: ${psVersion.stdout.trim()}\n`;
          }
        } catch (error) {
          console.error('Failed to get PowerShell version:', error);
          systemInfo += `PowerShell版本: Unknown\n`;
        }
      }

      // 获取Git版本
      try {
        const gitVersion = await ipcRenderer.invoke('execute-command', 'git --version');
        if (gitVersion && gitVersion.stdout) {
          systemInfo += `Git版本: ${gitVersion.stdout.trim()}\n`;
        }
      } catch (error) {
        console.error('Failed to get Git version:', error);
        systemInfo += `Git版本: Unknown\n`;
      }

      // 获取Node.js版本
      try {
        const nodeVersion = await ipcRenderer.invoke('execute-command', 'node --version');
        if (nodeVersion && nodeVersion.stdout) {
          systemInfo += `Node.js版本: ${nodeVersion.stdout.trim()}\n`;
        }
      } catch (error) {
        console.error('Failed to get Node.js version:', error);
        systemInfo += `Node.js版本: Unknown\n`;
      }

      // 获取Hexo版本
      try {
        const hexoVersion = await ipcRenderer.invoke('execute-command', 'npx hexo --version');
        if (hexoVersion && hexoVersion.stdout) {
          // 提取Hexo版本行
          const hexoVersionLine = hexoVersion.stdout.split('\n')[0];
          systemInfo += `Hexo版本: ${hexoVersionLine.trim()}\n`;
        }
      } catch (error) {
        console.error('Failed to get Hexo version:', error);
        systemInfo += `Hexo版本: Unknown\n`;
      }
    } catch (error) {
      console.error('Failed to get system info:', error);
      systemInfo += `系统信息获取失败\n`;
    }
  } else {
    // 浏览器环境
    const userAgent = navigator.userAgent;
    let osType = 'Unknown';
    
    if (userAgent.includes('Windows')) osType = 'Windows';
    else if (userAgent.includes('Mac')) osType = 'macOS';
    else if (userAgent.includes('Linux')) osType = 'Linux';
    else osType = navigator.platform || 'Unknown';
    
    systemInfo += `操作系统: ${osType}\n`;
    systemInfo += `系统版本: Unknown\n`;
    systemInfo += `系统架构: Unknown\n`;
    systemInfo += `PowerShell版本: N/A (浏览器环境)\n`;
    systemInfo += `Git版本: N/A (浏览器环境)\n`;
    systemInfo += `Node.js版本: N/A (浏览器环境)\n`;
    systemInfo += `Hexo版本: N/A (浏览器环境)\n`;
  }

  return systemInfo;
}

/**
 * 复制系统信息到剪贴板
 * @param language 语言设置，用于显示提示信息
 * @returns Promise<boolean> 是否成功复制
 */
export async function copySystemInfo(language: 'zh' | 'en' = 'zh'): Promise<boolean> {
  try {
    const systemInfo = await getSystemInfo();

    if (isDesktopApp()) {
      const env = getDesktopEnvironment();

      if (env === 'tauri') {
        // Tauri环境
        const { clipboardOperations } = await import('./tauri-api');
        await clipboardOperations.writeText(systemInfo);
      } else if (env === 'electron') {
        // Electron环境
        const ipcRenderer = await getIpcRenderer();
        await ipcRenderer.invoke('copy-to-clipboard', systemInfo);
      } else {
        // 浏览器环境
        await navigator.clipboard.writeText(systemInfo);
      }
    } else {
      // 浏览器环境
      await navigator.clipboard.writeText(systemInfo);
    }

    return true;
  } catch (error) {
    console.error('Failed to copy system info:', error);
    return false;
  }
}
