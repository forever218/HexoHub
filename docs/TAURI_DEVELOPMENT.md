# Tauri 版本开发指南

## 概述

HexoHub 支持使用 Tauri 作为桌面应用框架！得益于在各平台的公共WEB框架上运行，保持良好兼容性的同时，Tauri 构建后的程序体积相比 Electron 小得多。

## 体积对比
我们在本项目的v2.6.1版本上进行了对比。

| 项目 | Electron | Tauri | 减少 |
|------|----------|-------|------|
| 构建后体积 | 254MB | 14MB | **94.5%** |
| 安装程序 | 77.8MB | 4.27MB | **94.5%** |

Tauri 版本相比 Electron 版本减少了 **94.5%** 的体积！

为了用户体验，我们毅然决然的开启Tauri分支。

## 环境要求

### 基础环境
- **Node.js**: `>=20`
- **npm**: `>=10`
- **Git**: 用于版本控制

### Tauri 特定要求
- **Rust**: `>=1.70` (自动安装)
- **Cargo**: Rust 包管理器 (随 Rust 一起安装)

> **注意**：Tauri 版本需要安装 Rust 工具链。首次运行时会自动下载安装。详细开发指南请参考 [Tauri 开发指南](./docs/TAURI_DEVELOPMENT.md)。

## 快速开始

### 1. 切换到 Tauri 分支

```bash
# 拉取远程分支
git fetch origin tauri

# 切换到 tauri 分支
git checkout tauri
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# Rust 依赖会自动在首次构建时安装
```

### 3. 开发模式运行

```bash
# 启动开发服务器
npm run tauri:dev
```

这个命令会：
- 启动 Next.js 开发服务器 (http://localhost:3000)
- 编译 Rust 后端
- 启动 Tauri 应用窗口

### 4. 构建生产版本

```bash
# 构建生产版本
npm run tauri:build
```

## 结构

```
HexoHub/
├── src/                    # Next.js 前端代码
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── lib/               # 工具库
│   └── utils/             # 工具函数
├── src-tauri/             # Tauri 后端代码
│   ├── src/               # Rust 源代码
│   │   ├── main.rs        # 主程序入口
│   │   └── lib.rs         # 库文件
│   ├── Cargo.toml         # Rust 依赖配置
│   ├── tauri.conf.json    # Tauri 配置
│   └── capabilities/      # 权限配置
└── package.json           # Node.js 配置
```

## 开发命令

| 命令 | 描述 |
|------|------|
| `npm run tauri:dev` | 开发模式运行 |
| `npm run tauri:build` | 构建生产版本 |
| `npm run tauri` | 直接调用 Tauri CLI |



## 常见问题

### 1. Rust 未安装或 PATH 问题
**错误**: `failed to run 'cargo metadata' command`

**解决方案**:
```bash
# 下载并安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 或者访问 https://rustup.rs/ 下载安装程序
```

**Windows PowerShell 环境变量问题**:
如果安装后仍然提示找不到 cargo，可能是当前 PowerShell 会话没有加载新的环境变量：

```powershell
# 方法1: 重启 PowerShell 终端（推荐）
# 关闭当前终端，重新打开

# 方法2: 手动刷新环境变量
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# 方法3: 重新加载用户环境变量
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

### 2. 构建失败
**错误**: `failed to compile`

**解决方案**:
```bash
# 清理构建缓存
cargo clean

# 重新构建
npm run tauri:build
```

### 3. 权限问题
**错误**: `Permission denied`

**解决方案**:
- 检查 `src-tauri/capabilities/default.json` 中的权限配置
- 确保请求的权限在允许列表中

### 3. 日志查看
```bash
# 查看构建日志
npm run tauri:build --verbose

# 查看开发日志
npm run tauri:dev --verbose
```


## 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b taurit`
3. 提交更改: `git commit -m 'Add tauri feature'`
4. 推送分支: `git push origin tauri`
5. 创建 Pull Request

## 参考资源

- [Tauri 官方文档](https://tauri.app/)
- [Rust 官方文档](https://doc.rust-lang.org/)
- [Next.js 文档](https://nextjs.org/docs)
- [项目 GitHub 仓库](https://github.com/forever218/HexoHub)


