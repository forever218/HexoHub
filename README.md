# HexoHub

[中文文档](https://github.com/forever218/HexoHub/blob/main/README.md)  |  [English](https://github.com/forever218/HexoHub/blob/main/docs/README.en.md)  |  [发布指南](https://github.com/forever218/HexoHub/blob/main/docs/RELEASE_GUIDE.md)  |  [Tauri 开发指南](https://github.com/forever218/HexoHub/blob/main/docs/TAURI_DEVELOPMENT.md)  


[![GitHub Stars](https://img.shields.io/github/stars/forever218/Hexohub)](https://github.com/forever218/Hexohub/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/forever218/Hexohub)](https://github.com/forever218/Hexohub/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/forever218/Hexohub)](https://github.com/forever218/Hexohub/issues)
[![GitHub License](https://img.shields.io/github/license/forever218/Hexohub)](https://github.com/forever218/Hexohub)
[![GitHub all releases](https://img.shields.io/github/downloads/forever218/Hexohub/total)](https://github.com/forever218/Hexohub/releases)

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/185d93c6-836b-434a-a9b8-55400dc25f3e" 
    alt="image" 
    width="80%" 
  />
</div>

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/10fadb85-4fb7-438f-884d-b80e90886e5e" 
    alt="image" 
    width="80%" 
  />
</div>


一个基于 Electron + Next.js 构建的Hexo博客管理桌面应用程序，提供图形化界面来替代传统的命令行操作  
> 告别繁琐的传统命令行方式（我已经厌倦了hexo xxxx🫠），以更优雅的方式管理您的hexo博客。


## 文章管理

在本应用程序中，您可以可视化的：**创建新文章**，**查看文章列表** ，**编辑文章**，**实时预览**，**启动本地预览**，**生成并推送静态文件**，**删除文章**

## 图片拖入
这或许是本应用程序的一大亮点，当您开启了hexo的资源文件夹后（[这是什么？](https://hexo.io/zh-cn/docs/asset-folders)），您就可以使用`{% asset_img example.jpg %}`标签，将本地的图片在博客中进行引用。  
但是，频繁的输入`{% asset_img example.jpg %}`显然是不尽如人意的（特别是当图片文件名很复杂的时候），所以在本应用程序中，您只需要将图片放入与文章同名的资源文件夹下（例如`\blog\source\_posts\测试文章`），然后将图片拖入编辑窗口，就能自动填入`{% asset_img example.jpg %}`标签，省去了输入文件名的烦恼    

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/2aced4e0-ef08-4daf-af8b-6a31f43a2d56" 
    alt="image" 
    width="80%" 
  />
</div>  

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/be796a74-7990-4780-a93e-4c3c72d07335" 
    alt="image" 
    width="80%" 
  />
</div>


## Hexo 操作 
**命令执行**：图形化执行常用 Hexo 命令，包括：  
  - `hexo clean` - 清理缓存文件
  - `hexo generate` - 生成静态文件
  - `hexo deploy` - 部署到远程服务器
  - `hexo se` - 启动本地预览   
**实时反馈**：显示命令执行结果和错误信息

## 配置管理
**基本设置**：网站标题、副标题、作者、语言  
**高级设置**：URL 配置、永久链接格式  
**YAML 编辑**：支持直接编辑原始配置文件  
**导入/导出**：配置文件的备份和恢复，更加方便您主题的迁移

#  快速开始  
## 使用

如果您只需“使用”本应用程序：   
- **操作系统**: Windows 10 或更高版本    
- **存储**: 建议 900MB 可用空间  
- **Hexo**：https://hexo.io/
- **Npm**：`npm>10`    👉https://www.npmjs.com/
- **Node.js**：`nodejs>20`    👉https://nodejs.org/zh-cn/   

随后到[Releases](https://github.com/forever218/HexoHub/releases/)下载最新版本。  
  
## 开发   

如果您需要"开发"本应用程序，以下是额外的需求：   
- **Git**：https://git-scm.com/   
- **nodejs**：`TypeScript>4.5`，`React>19`，`Next.js>15`   

⚠️ 出于速度考虑，我在开发过程中使用的是`cnpm`，并且修改了部分`package.json`内容，请您在使用时酌情考虑，如果要使用`cnpm`，请执行：  

```bash
npm install -g cnpm --registry=http://registry.npm.taobao.org
```

随后即可用`cnpm`代替`npm`

### Electron 版本开发

1. **克隆本仓库**
   ```bash
   git clone https://github.com/forever218/HexoHub.git
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**，到这一步就已经可以使用了
   ```bash
   npm run electron
   ```

4. **打包应用**（非必须）
   ```bash
   npm run build
   npm run make
   ```

> **注意**：本应用程序通过`electron-builder`封装，而不是`electron-forge`，在您修改相关配置文件时，请注意使用`electron-builder`的配置文件格式。[electron-builder](https://www.electron.build/)

### Tauri 版本开发

项目现在支持使用 Tauri 作为桌面应用框架，具有小得多的体积和更好的性能。

1. **切换到 Tauri 分支**
   ```bash
   git checkout tauri
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**
   ```bash
   npm run tauri:dev
   ```

4. **构建生产版本**
   ```bash
   npm run tauri:build
   ```

> **注意**：Tauri 版本需要安装 Rust 工具链。首次运行时会自动下载安装。详细开发指南请参考 [Tauri 开发指南](./docs/TAURI_DEVELOPMENT.md)。

### 📦 自动化发布流程

项目已配置 GitHub Actions 自动化发布流程。维护者在准备发布新版本时，只需推送版本标签即可自动构建和发布 Windows、Linux 安装包。详细步骤请参考 [📦 发布指南](./docs/RELEASE_GUIDE.md)。

## Linux 兼容性与故障排查
当前已经提供 AppImage（内部为 Electron 运行时）。在部分基于 Arch / Manjaro / Wayland 或 Mesa 驱动环境中，可能在终端看到：

```
GetVSyncParametersIfAvailable() failed for X times!
```

这一般是 Chromium 在获取 VSync 时间戳失败产生的日志，不影响核心功能。如果你希望减少或消除：

1. 已在程序内部默认添加了 `--disable-gpu-vsync` 等参数，正常情况下只是偶尔出现。
2. 如果仍大量出现或出现黑屏 / 空白窗口，可临时禁用 GPU：
  ```bash
  HEXOHUB_DISABLE_GPU=1 ./HexoHub-<版本>.AppImage
  ```
3. Wayland 会话下如果窗口行为异常，可尝试切换到 X11（或反之）。
4. 如果使用远程桌面 / 无物理 GPU（llvmpipe），建议直接使用上面禁用 GPU 的方式。

反馈 Bug 时请附上：
```
操作系统发行版/版本：
桌面环境（GNOME/KDE/...）及会话（X11/Wayland）：
是否使用独显/NVIDIA 专有驱动：
终端运行是否需要 HEXOHUB_DISABLE_GPU：是/否
``` 

如果确认禁用 GPU 后问题完全消失，可以提 Issue，我们会考虑自动检测更多场景。 


# 技术栈

- **Next.js 15** - React 全栈框架
- **React** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript  
- **Tailwind CSS** - CSS 框架  
- **Electron** - 跨平台桌面应用框架 (主分支)
- **Tauri** - 轻量级桌面应用框架 (tauri 分支)
- **Rust** - 系统编程语言 (Tauri 后端)
- **electron-builder** - Electron 应用打包工具
- **NSIS** - Windows 安装程序制作工具
- **remark-gfm** - GitHub 风格 Markdown 扩展
- [Hexo](https://hexo.io/) - 静态博客生成器


# 贡献指南

欢迎提交 Issue 和 Pull Request！  
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

---

我在开发过程中遇到了许多问题，如果您可以加入这个项目，成为志同道合的朋友，我会万分感激，给您点杯咖啡！☕
可以通过以下方式联系我：
- 邮箱3316703158@qq.com
- 我的博客https://2am.top
- github

## 国际化（i18n）
本项目使用`next-i18next`进行国际化处理，您可以在`i18n.js`中配置您的语言包，旨在帮助您的项目轻松支持多语言，让全世界的用户都能无障碍使用。   

-  多语言支持：轻松切换不同语言   
-  简单集成：快速上手，兼容主流框架   
-  可扩展：自定义翻译和语言包  

```bash
# 安装模块
npm install your-i18n-module
```

```typescript
// 初始化
import i18n from 'your-i18n-module';

i18n.init({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'zh', 'es', 'fr']
});
```


## 代码规范
没有规范（实际上本人代码一团糟👻），只要您写的东西是人类语言即可
 
#  LICENSE

本项目采用 [MIT](https://choosealicense.com/licenses/mit/) 许可证，请您在使用本项目时遵守相关法律法规。



# 更改日志
更多日志请移步release查看
## v3 (2025-08-16)
新功能：  
- 在“文章列表”界面加入右键逻辑，实现快速操作  
- 左侧加入“标签云图”  
 
BUG 修复： 
- 修复了hexo配置下，“网站标题”设置失败的问题   
- 修复了“按文章名排序”时，偶发的排序混乱问题  
- 修复了当“作者”为空时，生成静态文件报错的问题  

## v2 (2025-08-13)
新功能：  
- 重构”文章列表“功能，将其放在右侧主窗口   
- 加入“按标签/分类显示文章”功能   
- 加入文章批量处理功能（批量删除/添加标签/添加分类） 
- 添加国际化支持   

BUG 修复：  
- 修复了部分明暗转换异常  

## v1 (2025-08-10)
- 首次构建  
- 基本命令，文章按日期/名称排序  
- 基本功能实现  


