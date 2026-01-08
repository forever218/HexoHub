# Linux 兼容性与故障排查
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