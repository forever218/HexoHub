# Electron 版本开发

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