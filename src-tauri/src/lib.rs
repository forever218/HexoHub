use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::time::SystemTime;
use tauri::State;

// 导入 Manager trait（用于 state、get_webview_window 等方法）
use tauri::Manager;

use serde::{Deserialize, Serialize};

// Windows 平台特定的导入，用于隐藏命令行窗口和处理编码
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
use encoding_rs::GBK;

// 存储 Hexo 服务器进程
struct HexoServer(Mutex<Option<std::process::Child>>);

#[derive(Debug, Serialize, Deserialize)]
struct CommandResult {
    success: bool,
    stdout: Option<String>,
    stderr: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValidationResult {
    valid: bool,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FileInfo {
    name: String,
    path: String,
    is_directory: bool,
    size: u64,
    modified_time: String,
}

// 将 SystemTime 转换为 ISO 8601 格式的字符串
fn format_system_time(time: SystemTime) -> String {
    match time.duration_since(SystemTime::UNIX_EPOCH) {
        Ok(duration) => {
            let timestamp_millis = duration.as_millis();
            // 返回 ISO 8601 格式的时间字符串
            // JavaScript 可以直接使用 new Date(timestamp) 解析
            timestamp_millis.to_string()
        }
        Err(_) => "0".to_string(),
    }
}

// 读取文件
#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| e.to_string())
}


// 写入文件
#[tauri::command]
async fn write_file(file_path: String, content: String) -> Result<bool, String> {
    fs::write(&file_path, content)
        .map(|_| true)
        .map_err(|e| e.to_string())
}

// 删除文件
#[tauri::command]
async fn delete_file(file_path: String) -> Result<bool, String> {
    fs::remove_file(&file_path)
        .map(|_| true)
        .map_err(|e| e.to_string())
}

// 复制文件
#[tauri::command]
async fn copy_file(source_path: String, destination_path: String) -> Result<String, String> {
    // 确保目标目录存在
    if let Some(parent) = PathBuf::from(&destination_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    // 复制文件
    fs::copy(&source_path, &destination_path)
        .map(|_| destination_path)
        .map_err(|e| e.to_string())
}

// 列出目录中的文件
#[tauri::command]
async fn list_files(directory_path: String) -> Result<Vec<FileInfo>, String> {
    let entries = fs::read_dir(&directory_path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_name = entry.file_name().to_string_lossy().to_string();
        
        // 忽略隐藏文件
        if file_name.starts_with('.') {
            continue;
        }
        
        // Windows 系统文件
        #[cfg(target_os = "windows")]
        {
            let system_files = ["desktop.ini", "thumbs.db", "folder.htt", "folder.ini"];
            if system_files.contains(&file_name.to_lowercase().as_str()) {
                continue;
            }
        }
        
        if metadata.is_file() {
            let modified_time = metadata.modified()
                .map(|t| format_system_time(t))
                .unwrap_or_else(|_| "0".to_string());
            
            files.push(FileInfo {
                name: file_name,
                path: entry.path().to_string_lossy().to_string(),
                is_directory: false,
                size: metadata.len(),
                modified_time,
            });
        }
    }
    
    Ok(files)
}

// 智能解码：优先尝试 UTF-8，失败则尝试 GBK（Windows）
#[cfg(target_os = "windows")]
fn smart_decode(bytes: &[u8]) -> String {
    // 首先尝试 UTF-8 解码
    if let Ok(utf8_str) = std::str::from_utf8(bytes) {
        return utf8_str.to_string();
    }
    
    // UTF-8 失败，尝试 GBK 解码（中文 Windows 默认编码）
    let (decoded, _, had_errors) = GBK.decode(bytes);
    if !had_errors {
        return decoded.into_owned();
    }
    
    // 都失败了，使用 lossy 转换
    String::from_utf8_lossy(bytes).to_string()
}

#[cfg(not(target_os = "windows"))]
fn smart_decode(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).to_string()
}

// 执行命令（使用 Tauri Shell 插件，自动处理参数和引号）
#[tauri::command]
async fn execute_command(command: String, app_handle: tauri::AppHandle) -> CommandResult {
    use tauri_plugin_shell::ShellExt;
    
    // 使用 Tauri Shell 插件执行命令
    // 优势：
    // 1. 自动处理引号和转义问题
    // 2. 跨平台兼容性好
    // 3. 正确处理带空格的路径
    let shell = app_handle.shell();
    
    let output_result = if cfg!(target_os = "windows") {
        // Windows: 使用 cmd /C 执行命令
        // Tauri shell 插件会正确处理参数，不会出现引号被当作路径的问题
        shell
            .command("cmd")
            .args(["/C", &command])
            .output()
            .await
    } else {
        // Unix: 使用 sh -c 执行命令
        shell
            .command("sh")
            .args(["-c", &command])
            .output()
            .await
    };
    
    match output_result {
        Ok(output) => {
            // 使用智能解码（自动检测 UTF-8/GBK）
            let stdout = smart_decode(&output.stdout);
            let stderr = smart_decode(&output.stderr);
            
            CommandResult {
                success: output.status.success(),
                stdout: Some(stdout.clone()),
                stderr: Some(stderr.clone()),
                error: if !output.status.success() && stdout.is_empty() && stderr.is_empty() {
                    Some("命令执行失败，未返回输出".to_string())
                } else {
                    None
                },
            }
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(format!("命令执行错误: {}", e)),
        },
    }
}

// 执行 Hexo 命令
#[tauri::command]
async fn execute_hexo_command(command: String, working_dir: String) -> CommandResult {
    let hexo_cmd = if cfg!(target_os = "windows") {
        "hexo.cmd"
    } else {
        "hexo"
    };
    
    // 解析命令参数，避免引号嵌套问题
    // 例如: command = "new \"测试\"" -> ["new", "测试"]
    let args: Vec<String> = shell_words::split(&command)
        .unwrap_or_else(|_| vec![command.clone()]);
    
    let output = if cfg!(target_os = "windows") {
        // 直接调用 hexo.cmd，传递解析后的参数
        // 这样可以避免 cmd /C 的引号转义问题
        let mut cmd = Command::new(hexo_cmd);
        cmd.args(&args)
           .current_dir(&working_dir);
        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.output()
    } else {
        // Unix 系统保持原有方式
        let full_command = format!("{} {}", hexo_cmd, command);
        Command::new("sh")
            .arg("-c")
            .arg(&full_command)
            .current_dir(&working_dir)
            .output()
    };
    
    match output {
        Ok(output) => {
            // 使用智能解码（自动检测 UTF-8/GBK）
            let stdout = smart_decode(&output.stdout);
            let stderr = smart_decode(&output.stderr);
            
            CommandResult {
                success: output.status.success(),
                stdout: Some(stdout.clone()),
                stderr: Some(stderr.clone()),
                error: if !output.status.success() && stdout.is_empty() && stderr.is_empty() {
                    Some("命令执行失败，未返回输出".to_string())
                } else {
                    None
                },
            }
        },
        Err(e) => CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some(format!("命令执行错误: {}", e)),
        },
    }
}

// 验证 Hexo 项目
#[tauri::command]
async fn validate_hexo_project(directory_path: String, language: String) -> ValidationResult {
    let config_path = PathBuf::from(&directory_path).join("_config.yml");
    let package_path = PathBuf::from(&directory_path).join("package.json");
    
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            if content.contains("title:") || content.contains("theme:") {
                let message = if language == "en" {
                    "Valid Hexo Project".to_string()
                } else {
                    "有效的Hexo项目".to_string()
                };
                return ValidationResult { valid: true, message };
            }
        }
        
        if package_path.exists() {
            if let Ok(content) = fs::read_to_string(&package_path) {
                if content.contains("hexo") {
                    let message = if language == "en" {
                        "Valid Hexo Project".to_string()
                    } else {
                        "有效的Hexo项目".to_string()
                    };
                    return ValidationResult { valid: true, message };
                }
            }
        }
        
        return ValidationResult {
            valid: true,
            message: "找到Hexo配置文件".to_string(),
        };
    }
    
    let message = if language == "en" {
        "Not a valid Hexo project directory".to_string()
    } else {
        "不是有效的Hexo项目目录".to_string()
    };
    ValidationResult { valid: false, message }
}

// 清理占用指定端口的进程（作为独立命令供前端调用）
#[tauri::command]
async fn fix_port_conflict(port: u16) -> Result<CommandResult, String> {
    println!("[端口修复] 开始清理端口 {}...", port);
    
    #[cfg(target_os = "windows")]
    {
        // Windows: 使用 netstat 查找占用端口的进程，然后杀死它
        let netstat_output = Command::new("cmd")
            .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
            .output();
        
        if let Ok(output) = netstat_output {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let mut killed_count = 0;
            
            // 解析 netstat 输出，提取 PID
            for line in output_str.lines() {
                if line.contains("LISTENING") {
                    // netstat 输出格式: TCP    0.0.0.0:4000    0.0.0.0:0    LISTENING    12345
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if let Some(pid_str) = parts.last() {
                        if let Ok(pid) = pid_str.parse::<u32>() {
                            println!("[端口修复] 发现进程 PID {} 占用端口 {}，尝试终止...", pid, port);
                            
                            // 使用 taskkill 终止进程
                            let kill_result = Command::new("taskkill")
                                .args(&["/F", "/PID", &pid.to_string()])
                                .output();
                            
                            match kill_result {
                                Ok(result) => {
                                    if result.status.success() {
                                        println!("[端口修复] 成功终止进程 PID {}", pid);
                                        killed_count += 1;
                                    } else {
                                        println!("[端口修复] 终止进程失败: {}", String::from_utf8_lossy(&result.stderr));
                                    }
                                }
                                Err(e) => {
                                    println!("[端口修复] 执行 taskkill 失败: {}", e);
                                }
                            }
                        }
                    }
                }
            }
            
            if killed_count > 0 {
                // 等待一下确保端口释放
                std::thread::sleep(std::time::Duration::from_millis(500));
                
                return Ok(CommandResult {
                    success: true,
                    stdout: Some(format!("已成功终止 {} 个占用端口 {} 的进程", killed_count, port)),
                    stderr: None,
                    error: None,
                });
            } else {
                return Ok(CommandResult {
                    success: true,
                    stdout: Some(format!("端口 {} 未被占用", port)),
                    stderr: None,
                    error: None,
                });
            }
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        // Unix/Linux/Mac: 使用 lsof 查找并杀死占用端口的进程
        let lsof_output = Command::new("lsof")
            .args(&["-ti", &format!(":{}", port)])
            .output();
        
        if let Ok(output) = lsof_output {
            let pid_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            
            if !pid_str.is_empty() {
                if let Ok(pid) = pid_str.parse::<u32>() {
                    println!("[端口修复] 发现进程 PID {} 占用端口 {}，尝试终止...", pid, port);
                    
                    let kill_result = Command::new("kill")
                        .args(&["-9", &pid.to_string()])
                        .output();
                    
                    match kill_result {
                        Ok(result) => {
                            if result.status.success() {
                                println!("[端口修复] 成功终止进程 PID {}", pid);
                                std::thread::sleep(std::time::Duration::from_millis(500));
                                
                                return Ok(CommandResult {
                                    success: true,
                                    stdout: Some(format!("已成功终止占用端口 {} 的进程 (PID: {})", port, pid)),
                                    stderr: None,
                                    error: None,
                                });
                            }
                        }
                        Err(e) => {
                            return Err(format!("执行 kill 失败: {}", e));
                        }
                    }
                }
            } else {
                return Ok(CommandResult {
                    success: true,
                    stdout: Some(format!("端口 {} 未被占用", port)),
                    stderr: None,
                    error: None,
                });
            }
        }
    }
    
    Err("无法检查或清理端口".to_string())
}

// 启动 Hexo 服务器（异步，监听输出判断启动状态）
#[tauri::command]
async fn start_hexo_server(working_dir: String, server_state: State<'_, HexoServer>) -> Result<CommandResult, String> {
    // 停止现有服务器
    let mut server = server_state.0.lock().unwrap();
    if let Some(mut child) = server.take() {
        let _ = child.kill();
    }
    drop(server); // 释放锁，避免后续阻塞
    
    let hexo_cmd = if cfg!(target_os = "windows") {
        "hexo.cmd"
    } else {
        "hexo"
    };
    
    let mut cmd = Command::new(hexo_cmd);
    cmd.arg("server")
        .current_dir(&working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    // 在 Windows 上隐藏窗口
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    
    let mut child = cmd.spawn().map_err(|e| e.to_string())?;
    
    // 尝试读取输出，判断服务器是否启动成功
    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    
    // 在后台线程监听输出，判断服务器是否启动成功
    use std::io::{BufRead, BufReader};
    use std::sync::Arc;
    use std::sync::atomic::{AtomicBool, Ordering};
    
    let server_ready = Arc::new(AtomicBool::new(false));
    let server_ready_clone = server_ready.clone();
    
    // 用于存储错误信息
    let error_message = Arc::new(Mutex::new(None::<String>));
    let error_message_clone = error_message.clone();
    
    // 监听 stdout
    if let Some(stdout) = stdout {
        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    println!("[Hexo stdout] {}", line);
                    // 检查是否包含启动成功的标志
                    if line.contains("Hexo is running at") || 
                       line.contains("INFO  Start processing") ||
                       line.contains("localhost:4000") {
                        server_ready_clone.store(true, Ordering::SeqCst);
                        println!("[Hexo] 检测到服务器启动成功标志");
                    }
                }
            }
        });
    }
    
    // 监听 stderr（Hexo 的错误输出）
    if let Some(stderr) = stderr {
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    println!("[Hexo stderr] {}", line);
                    
                    // 检测常见错误
                    if line.contains("FATAL") {
                        let mut err_msg = error_message_clone.lock().unwrap();
                        if err_msg.is_none() {
                            // 提取错误信息
                            if line.contains("Port 4000 has been used") || line.contains("EADDRINUSE") {
                                *err_msg = Some("端口 4000 已被占用，请先停止其他 Hexo 服务器或占用该端口的程序".to_string());
                            } else if line.contains("FATAL") {
                                // 提取 FATAL 后的错误信息
                                let error_text = line.split("FATAL").nth(1)
                                    .unwrap_or("启动失败")
                                    .trim()
                                    .to_string();
                                *err_msg = Some(error_text);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 等待服务器启动（最多等待 15 秒）
    let start_time = std::time::Instant::now();
    let timeout = std::time::Duration::from_secs(15);
    
    while start_time.elapsed() < timeout {
        // 优先检查是否有错误信息
        {
            let err_msg = error_message.lock().unwrap();
            if let Some(ref msg) = *err_msg {
                // 检测到错误，尝试终止进程
                let _ = child.kill();
                
                return Ok(CommandResult {
                    success: false,
                    stdout: None,
                    stderr: None,
                    error: Some(msg.clone()),
                });
            }
        }
        
        // 检查服务器是否就绪
        if server_ready.load(Ordering::SeqCst) {
            // 服务器启动成功
            let mut server = server_state.0.lock().unwrap();
            *server = Some(child);
            
            return Ok(CommandResult {
                success: true,
                stdout: Some("Hexo服务器已启动并就绪 http://localhost:4000".to_string()),
                stderr: None,
                error: None,
            });
        }
        
        // 检查子进程是否还在运行
        match child.try_wait() {
            Ok(Some(status)) => {
                // 进程已退出
                // 检查是否有捕获到的错误信息
                let err_msg = error_message.lock().unwrap();
                let error_text = if let Some(ref msg) = *err_msg {
                    msg.clone()
                } else {
                    format!("Hexo服务器启动失败，进程异常退出（状态码: {}）", 
                        status.code().map_or("未知".to_string(), |c| c.to_string()))
                };
                
                return Ok(CommandResult {
                    success: false,
                    stdout: None,
                    stderr: None,
                    error: Some(error_text),
                });
            }
            Ok(None) => {
                // 进程仍在运行，继续等待
            }
            Err(e) => {
                return Err(format!("检查进程状态失败: {}", e));
            }
        }
        
        // 短暂休眠后重试
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    
    // 超时：虽然没检测到启动成功的标志，但进程仍在运行
    // 保存进程，让前端可以继续使用
    let mut server = server_state.0.lock().unwrap();
    *server = Some(child);
    
    Ok(CommandResult {
        success: true,
        stdout: Some("Hexo服务器进程已启动（未检测到就绪标志，可能需要更长时间）".to_string()),
        stderr: None,
        error: None,
    })
}

// 停止 Hexo 服务器
#[tauri::command]
async fn stop_hexo_server(server_state: State<'_, HexoServer>, app_handle: tauri::AppHandle) -> Result<CommandResult, String> {
    use tauri_plugin_shell::ShellExt;
    
    // 获取进程 ID 和是否有服务器运行（在锁的作用域内完成）
    let pid_option = {
        let mut server = server_state.0.lock().unwrap();
        server.take().map(|child| child.id())
    }; // MutexGuard 在这里被释放
    
    if let Some(pid) = pid_option {
        println!("正在停止 Hexo 服务器进程 PID: {}", pid);
        
        let shell = app_handle.shell();
        
        #[cfg(target_os = "windows")]
        {
            // Windows: 使用 taskkill 杀死整个进程树（通过 Tauri shell 插件，自动隐藏窗口）
            // /T 参数会终止指定进程及其所有子进程
            // /F 参数强制终止
            let output = shell
                .command("taskkill")
                .args(&["/pid", &pid.to_string(), "/T", "/F"])
                .output()
                .await;
            
            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("成功终止进程树 PID: {}", pid);
                    } else {
                        eprintln!("taskkill 失败: {}", String::from_utf8_lossy(&result.stderr));
                    }
                },
                Err(e) => {
                    eprintln!("执行 taskkill 失败: {}", e);
                }
            }
            
            // 额外保险：杀死所有占用 4000 端口的进程（通过 Tauri shell，无弹窗）
            let _ = shell
                .command("cmd")
                .args(&["/C", "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do @taskkill /F /PID %a"])
                .output()
                .await;
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            // Linux/Mac: 使用 kill 命令（通过 Tauri shell，无弹窗）
            // 先尝试 SIGTERM（优雅终止）
            let _ = shell
                .command("kill")
                .args(&[&pid.to_string()])
                .output()
                .await;
            
            println!("发送 SIGTERM 信号到进程 {}", pid);
            
            // 等待进程退出
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
            
            // 检查进程是否还在运行（通过 Tauri shell，无弹窗）
            let check = shell
                .command("kill")
                .args(&["-0", &pid.to_string()])
                .output()
                .await;
            
            if let Ok(result) = check {
                if result.status.success() {
                    // 进程还在，使用 SIGKILL（通过 Tauri shell，无弹窗）
                    println!("进程仍在运行，发送 SIGKILL");
                    let _ = shell
                        .command("kill")
                        .args(&["-9", &pid.to_string()])
                        .output()
                        .await;
                } else {
                    println!("进程已终止");
                }
            }
        }
        
        Ok(CommandResult {
            success: true,
            stdout: Some("服务器已停止".to_string()),
            stderr: None,
            error: None,
        })
    } else {
        Ok(CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            error: Some("没有正在运行的服务器".to_string()),
        })
    }
}

// 窗口控制命令
#[tauri::command]
async fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
async fn maximize_restore_window(window: tauri::Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
async fn close_window(window: tauri::Window) {
    // 清理逻辑已由窗口事件监听器自动处理 (setup 中的 on_window_event)
    // 直接关闭窗口即可
    let _ = window.close();
}

#[tauri::command]
async fn show_in_folder(path: String) -> Result<(), String> {
    // 依据 https://github.com/tauri-apps/plugins-workspace/issues/999 解决本问题
    // 直接打开文件夹（而不是选中它）
    
    use std::path::Path;
    use std::process::Command;
    
    // 标准化路径（将正斜杠转换为反斜杠，仅在 Windows 上）
    #[cfg(target_os = "windows")]
    let normalized_path = path.replace("/", "\\");
    
    #[cfg(not(target_os = "windows"))]
    let normalized_path = path.clone();
    
    println!("[Rust] show_in_folder called with path: {}", path);
    println!("[Rust] Normalized path: {}", normalized_path);
    
    // 检查路径是否存在
    if !Path::new(&normalized_path).exists() {
        let error_msg = format!("Path does not exist: {}", normalized_path);
        println!("[Rust] Error: {}", error_msg);
        return Err(error_msg);
    }
    
    println!("[Rust] Path exists, opening folder...");
    
    // 使用系统命令直接打开文件夹
    #[cfg(target_os = "windows")]
    {
        println!("[Rust] Using Windows explorer to open folder...");
        match Command::new("explorer")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        println!("[Rust] Using macOS open command...");
        match Command::new("open")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        println!("[Rust] Using Linux xdg-open command...");
        match Command::new("xdg-open")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] Folder opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open folder: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
}

// 使用系统"打开方式"对话框打开文件
#[tauri::command]
async fn open_with(file_path: String) -> Result<(), String> {
    use std::path::Path;
    use std::process::Command;

    // 标准化路径（将正斜杠转换为反斜杠，仅在 Windows 上）
    #[cfg(target_os = "windows")]
    let normalized_path = file_path.replace("/", r"\");

    #[cfg(not(target_os = "windows"))]
    let normalized_path = file_path.clone();

    println!("[Rust] open_with called with path: {}", file_path);
    println!("[Rust] Normalized path: {}", normalized_path);

    // 检查路径是否存在
    if !Path::new(&normalized_path).exists() {
        let error_msg = format!("Path does not exist: {}", normalized_path);
        println!("[Rust] Error: {}", error_msg);
        return Err(error_msg);
    }

    println!("[Rust] Path exists, opening OpenWith dialog...");

    // 根据不同操作系统使用不同命令
    #[cfg(target_os = "windows")]
    {
        println!("[Rust] Using Windows OpenWith.exe command...");
        // Windows: 使用 OpenWith.exe 命令
        match Command::new(r"C:\Windows\System32\OpenWith.exe")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] OpenWith dialog opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open OpenWith dialog: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        println!("[Rust] Using macOS open command...");
        // macOS: 使用 open 命令
        match Command::new("open")
            .args(["-a", "TextEdit", &normalized_path])  // 默认使用 TextEdit 打开
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] File opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open file: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        println!("[Rust] Using Linux xdg-open command...");
        match Command::new("xdg-open")
            .arg(&normalized_path)
            .spawn()
        {
            Ok(_) => {
                println!("[Rust] File opened successfully");
                Ok(())
            },
            Err(e) => {
                let error_msg = format!("Failed to open file: {}", e);
                println!("[Rust] Error: {}", error_msg);
                Err(error_msg)
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .manage(HexoServer(Mutex::new(None)))
    .invoke_handler(tauri::generate_handler![
        read_file,
        write_file,
        delete_file,
        copy_file,
        list_files,
        execute_command,
        execute_hexo_command,
        validate_hexo_project,
        start_hexo_server,
        stop_hexo_server,
        fix_port_conflict,
        minimize_window,
        maximize_restore_window,
        close_window,
        show_in_folder,
        open_with,
    ])
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        // 配置日志插件
        // 将 tao 模块的日志级别设置为 Error，过滤掉 WARN 级别的事件循环警告
        // 这些警告在 Windows 上很常见且通常无害
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .target(tauri_plugin_log::Target::new(
              tauri_plugin_log::TargetKind::Stdout
            ))
            .level_for("tao", log::LevelFilter::Error)
            .build(),
        )?;
      }

      // 获取主窗口并监听关闭事件，确保清理 Hexo 服务器
      if let Some(window) = app.get_webview_window("main") {
        let app_handle = app.handle().clone();
        
        window.on_window_event(move |event| {
          if let tauri::WindowEvent::CloseRequested { .. } = event {
            println!("检测到窗口关闭请求，开始异步清理 Hexo 服务器...");
            
            // 获取 HexoServer 状态并异步清理进程
            if let Some(server_state) = app_handle.try_state::<HexoServer>() {
              if let Ok(mut server) = server_state.0.try_lock() {
                if let Some(child) = server.take() {
                  let pid = child.id();
                  println!("异步清理 Hexo 服务器进程 PID: {}", pid);
                  
                  // 在后台线程中异步清理，不阻塞关闭流程
                  std::thread::spawn(move || {
                    println!("开始后台清理进程 PID: {}", pid);
                    
                    #[cfg(target_os = "windows")]
                    {
                      // Windows: 先尝试优雅终止
                      let graceful_result = Command::new("taskkill")
                        .args(&["/pid", &pid.to_string(), "/T"])
                        .output();
                      
                      // 给进程一点时间优雅关闭
                      std::thread::sleep(std::time::Duration::from_millis(500));
                      
                      // 如果优雅终止失败，强制终止
                      if graceful_result.is_err() {
                        let _ = Command::new("taskkill")
                          .args(&["/pid", &pid.to_string(), "/T", "/F"])
                          .output();
                      }
                      
                      // 额外清理 4000 端口（异步，不等待结果）
                      let _ = Command::new("cmd")
                        .args(&["/C", "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do @taskkill /F /PID %a"])
                        .spawn();
                      
                      println!("Hexo 服务器进程已提交清理任务");
                    }
                    
                    #[cfg(not(target_os = "windows"))]
                    {
                      // Linux/Mac: 先尝试 SIGTERM（优雅终止）
                      let _ = Command::new("kill")
                        .args(&["-TERM", &pid.to_string()])
                        .output();
                      
                      // 等待一下，然后使用 SIGKILL 强制终止
                      std::thread::sleep(std::time::Duration::from_millis(500));
                      let _ = Command::new("kill")
                        .args(&["-9", &pid.to_string()])
                        .output();
                      
                      println!("Hexo 服务器进程已终止");
                    }
                  });
                }
              }
            }
          }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
