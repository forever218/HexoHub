'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FolderOpen,
  FileText,
  Settings,
  Play,
  Save,
  Trash2,
  Plus,
  Eye,
  Edit,
  Globe,
  Terminal,
  Server,
  Square,
  Languages,
  Sun,
  Moon,
  Bold,
  Italic,
  Code,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  ChevronUp,
  Download,
  Upload,
  Lightbulb,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { Language, getTexts } from '@/utils/i18n';
import { MarkdownEditorWrapper } from '@/components/markdown-editor-wrapper';
import { MarkdownPreview } from '@/components/markdown-preview';
import { PostList } from '@/components/post-list';
import { HexoConfig } from '@/components/hexo-config';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { TagCloud } from '@/components/tag-cloud';
import { PublishStats } from '@/components/publish-stats';
import { PanelSettings } from '@/components/panel-settings';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ToastAction } from '@/components/ui/toast';
import { CreateHexoDialog } from '@/components/create-hexo-dialog';
import { CustomTitlebar } from '@/components/custom-titlebar';
import { AIInspirationDialog } from '@/components/ai-inspiration-dialog';
import { AIAnalysisDialog } from '@/components/ai-analysis-dialog';
import { getIpcRenderer, isDesktopApp, isTauri } from '@/lib/desktop-api';
import { commandOperations } from '@/lib/tauri-api';
import { normalizePath, normalizePathInternal } from '@/lib/utils';

interface Post {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export default function Home() {
  const [hexoPath, setHexoPath] = useState<string>('');
  const [isValidHexoProject, setIsValidHexoProject] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postContent, setPostContent] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [mainView, setMainView] = useState<string>('posts');
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const [serverProcess, setServerProcess] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('zh');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ type: 'tag' | 'category'; value: string } | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [allTagsForCloud, setAllTagsForCloud] = useState<string[]>([]);
  const [publishStatsData, setPublishStatsData] = useState<any[]>([]); // 发布统计数据
  // 面板设置相关状态
  const [postsPerPage, setPostsPerPage] = useState<number>(15); // 默认每页显示15篇文章
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(3); // 默认自动保存间隔为3分钟
  const [iframeUrlMode, setIframeUrlMode] = useState<'hexo' | 'root'>('hexo'); // iframe地址获取方式，默认为hexo标准地址
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null); // 自动保存定时器
  const [editorMode, setEditorMode] = useState<'mode1' | 'mode2'>('mode1'); // 编辑模式，默认为模式1
  const [isUsingExternalEditor, setIsUsingExternalEditor] = useState<boolean>(false); // 是否使用外部编辑器
  // 背景图相关状态
  const [backgroundImage, setBackgroundImage] = useState<string>(''); // 背景图片URL
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1); // 背景透明度
  
  // 更新检查相关状态
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateCheckInProgress, setUpdateCheckInProgress] = useState<boolean>(false);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState<boolean>(true);

  // 日志记录相关状态
  const [commandLogs, setCommandLogs] = useState<CommandResult[]>([]); // 存储所有命令执行结果
  const [showLogsDialog, setShowLogsDialog] = useState<boolean>(false); // 控制日志对话框显示
  

  // 推送设置相关状态
  const [enablePush, setEnablePush] = useState<boolean>(false); // 是否启用推送
  const [pushRepoUrl, setPushRepoUrl] = useState<string>(''); // 推送仓库地址
  const [pushBranch, setPushBranch] = useState<string>('main'); // 推送分支
  const [pushUsername, setPushUsername] = useState<string>(''); // 推送用户名
  const [pushEmail, setPushEmail] = useState<string>(''); // 推送邮箱

  // AI设置相关状态
  const [enableAI, setEnableAI] = useState<boolean>(false); // 是否启用AI
  const [enableEditorAI, setEnableEditorAI] = useState<boolean>(false); // 是否启用编辑器AI增强
  const [aiProvider, setAIProvider] = useState<'deepseek' | 'openai' | 'siliconflow'>('deepseek'); // AI提供商
  const [apiKey, setApiKey] = useState<string>(''); // API密钥
  const [prompt, setPrompt] = useState<string>('你是一个灵感提示机器人，我是一个独立博客的博主，我想写一篇博客，请你给我一个可写内容的灵感，不要超过200字，不要分段'); // 提示词
  const [analysisPrompt, setAnalysisPrompt] = useState<string>('你是一个文章分析机器人，以下是我的博客数据{content}，请你分析并给出鼓励性的话语，不要超过200字，不要分段'); // 分析提示词
  const [aiRewritePrompt, setAiRewritePrompt] = useState<string>('请直接重写以下文本，使其更清晰流畅，保持原意。只输出改写后的文本，不要添加任何解释或说明'); // AI重写提示词
  const [aiImprovePrompt, setAiImprovePrompt] = useState<string>('请直接改进以下文本，使其更专业、生动。只输出改进后的文本，不要添加任何解释或说明'); // AI改进提示词
  const [aiExpandPrompt, setAiExpandPrompt] = useState<string>('请扩展以下文本，适当添加细节。只输出扩展后的文本，不要添加解释或标注'); // AI扩展提示词
  const [aiTranslatePrompt, setAiTranslatePrompt] = useState<string>('请直接将以下文本翻译成英文。只输出翻译结果，不要添加任何解释或说明'); // AI翻译提示词
  const [openaiModel, setOpenaiModel] = useState<string>('gpt-3.5-turbo'); // OpenAI模型
  const [openaiApiEndpoint, setOpenaiApiEndpoint] = useState<string>('https://api.openai.com/v1'); // OpenAI API端点
  const [showInspirationDialog, setShowInspirationDialog] = useState<boolean>(false); // 是否显示灵感对话框
  const [showAnalysisDialog, setShowAnalysisDialog] = useState<boolean>(false); // 是否显示分析对话框
  // 预览模式相关状态
  const [previewMode, setPreviewMode] = useState<'static' | 'server'>('static'); // 预览模式，默认为静态预览
  const [forcePreviewRefresh, setForcePreviewRefresh] = useState<boolean>(false); // 控制预览框强制刷新

  // 获取当前语言的文本
  const t = getTexts(language);
  
  // 初始化 toast hook
  const { toast } = useToast();

  // 检查是否在桌面应用环境中（Electron 或 Tauri）
  const [isElectron, setIsElectron] = useState(false);
  
  useEffect(() => {
    // 在客户端检测桌面应用环境
    setIsElectron(isDesktopApp());
  }, []);

  // 处理每页显示文章数量变化
  const handlePostsPerPageChange = (value: number) => {
    setPostsPerPage(value);
    // 重置到第一页
    setCurrentPage(1);
  };

  // 处理自动保存间隔变化
  const handleAutoSaveIntervalChange = (value: number) => {
    setAutoSaveInterval(value);
    // 重新设置自动保存定时器
    setupAutoSaveTimer();
  };

  // 设置自动保存定时器
  const setupAutoSaveTimer = () => {
    // 清除现有定时器
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      setAutoSaveTimer(null);
    }

    // 设置新的定时器
    if (selectedPost && postContent) {
      const timer = setInterval(() => {
        savePost();
      }, autoSaveInterval * 60 * 1000); // 转换为毫秒
      setAutoSaveTimer(timer);
    }
  };

  // 当postContent变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost && postContent) {
      setupAutoSaveTimer();
    }
  }, [postContent]);

  // 组件卸载时清除自动保存定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // 当selectedPost变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost) {
      setupAutoSaveTimer();
    } else {
      // 如果没有选中的文章，清除自动保存定时器
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        setAutoSaveTimer(null);
      }
    }
  }, [selectedPost]);

  // 当autoSaveInterval变化时重置自动保存定时器
  useEffect(() => {
    if (selectedPost && postContent) {
      setupAutoSaveTimer();
    }
  }, [autoSaveInterval]);

  // 当backgroundImage变化时更新背景
  useEffect(() => {
    const updateBackgroundImage = async () => {
      if (typeof window !== 'undefined') {
        if (backgroundImage) {
          // 检测是否是本地文件路径（Windows或Unix路径）
          const isLocalPath = /^([a-zA-Z]:[\\/]|\/|\.\.?\/)/.test(backgroundImage) && 
                             !backgroundImage.startsWith('data:') &&
                             !backgroundImage.startsWith('http://') &&
                             !backgroundImage.startsWith('https://') &&
                             !backgroundImage.startsWith('asset://');
          
          if (isLocalPath && isDesktopApp()) {
            try {
              // 使用统一的环境检测函数
              const { isTauri } = await import('@/lib/desktop-api');
              const isTauriEnv = isTauri();
              
              console.log('环境检测结果:', {
                isTauri: isTauriEnv,
                backgroundImage
              });
              
              if (isTauriEnv) {
                // Tauri 环境使用 convertFileSrc（推荐方式，无需 base64 编码）
                const { convertFileSrc } = await import('@tauri-apps/api/core');
                const assetUrl = convertFileSrc(backgroundImage);
                document.documentElement.style.setProperty('--bg-image', `url(${assetUrl})`);
                console.log('设置背景图片 (Tauri asset URL):', assetUrl);
              } else {
                // Electron 环境使用 file:// 协议
                const normalizedPath = backgroundImage.replace(/\\/g, '/');
                const fileUrl = normalizedPath.startsWith('/') ? `file://${normalizedPath}` : `file:///${normalizedPath}`;
                document.documentElement.style.setProperty('--bg-image', `url(${fileUrl})`);
                console.log('设置背景图片 (Electron file://):', fileUrl);
              }
            } catch (error) {
              console.error('读取本地背景图片失败:', error);
              document.documentElement.style.setProperty('--bg-image', 'none');
            }
          } else {
            // URL或已经是base64格式，直接使用
            document.documentElement.style.setProperty('--bg-image', `url(${backgroundImage})`);
            console.log('设置背景图片:', backgroundImage);
          }
        } else {
          document.documentElement.style.setProperty('--bg-image', 'none');
          console.log('清除背景图片');
        }
      }
    };
    
    updateBackgroundImage();
  }, [backgroundImage]);

  // 当backgroundOpacity变化时更新背景透明度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--bg-opacity', backgroundOpacity.toString());
      console.log('设置背景透明度:', backgroundOpacity);
    }
  }, [backgroundOpacity]);



  // 组件加载时，尝试从localStorage加载上次选择的路径和语言设置，并检查更新
  useEffect(() => {
    const loadSavedSettings = async () => {
      // 从localStorage加载自动更新设置
      if (typeof window !== 'undefined') {
        const savedAutoCheckUpdates = localStorage.getItem('auto-check-updates');
        if (savedAutoCheckUpdates !== null) {
          setAutoCheckUpdates(savedAutoCheckUpdates === 'true');
        }
      }
      
      // 检查更新
      if (autoCheckUpdates) {
        await checkForUpdates(true); // 启动时静默检查
      }
      if (typeof window !== 'undefined') {
        // 加载语言设置
        const savedLanguage = localStorage.getItem('app-language') as Language;
        if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
        }

        // 加载主题设置
        const savedTheme = localStorage.getItem('app-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
        setIsDarkMode(shouldUseDark);

        // 应用主题到document
        if (shouldUseDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // 加载每页显示文章数量设置
        const savedPostsPerPage = localStorage.getItem('posts-per-page');
        if (savedPostsPerPage) {
          const value = parseInt(savedPostsPerPage, 10);
          if (!isNaN(value) && value >= 1 && value <= 100) {
            setPostsPerPage(value);
          }
        }

        // 加载自动保存间隔设置
        const savedAutoSaveInterval = localStorage.getItem('auto-save-interval');
        if (savedAutoSaveInterval) {
          const value = parseInt(savedAutoSaveInterval, 10);
          if (!isNaN(value) && value >= 1 && value <= 60) {
            setAutoSaveInterval(value);
          }
        } else {
          // 如果没有保存的设置，使用默认值3分钟
          setAutoSaveInterval(3);
        }

        // 加载编辑模式设置
        const savedEditorMode = localStorage.getItem('editor-mode');
        if (savedEditorMode === 'mode1' || savedEditorMode === 'mode2') {
          setEditorMode(savedEditorMode);
        } else {
          // 如果没有保存的设置，使用默认值mode1
          setEditorMode('mode1');
        }

        // 加载背景图设置
        const savedBackgroundImage = localStorage.getItem('background-image');
        if (savedBackgroundImage !== null) {
          setBackgroundImage(savedBackgroundImage);
        }

        // 加载背景透明度设置
        const savedBackgroundOpacity = localStorage.getItem('background-opacity');
        if (savedBackgroundOpacity !== null) {
          const value = parseFloat(savedBackgroundOpacity);
          if (!isNaN(value) && value >= 0 && value <= 1) {
            setBackgroundOpacity(value);
          }
        }
        
        // 加载推送设置
        const savedEnablePush = localStorage.getItem('enable-push');
        if (savedEnablePush !== null) {
          setEnablePush(savedEnablePush === 'true');
        }
        
        const savedPushRepoUrl = localStorage.getItem('push-repo-url');
        if (savedPushRepoUrl !== null) {
          setPushRepoUrl(savedPushRepoUrl);
        }
        
        const savedPushBranch = localStorage.getItem('push-branch');
        if (savedPushBranch !== null) {
          setPushBranch(savedPushBranch);
        }
        
        const savedPushUsername = localStorage.getItem('push-username');
        if (savedPushUsername !== null) {
          setPushUsername(savedPushUsername);
        }
        
        const savedPushEmail = localStorage.getItem('push-email');
        if (savedPushEmail !== null) {
          setPushEmail(savedPushEmail);
        }

        // 加载AI设置
        const savedEnableAI = localStorage.getItem('enable-ai');
        if (savedEnableAI !== null) {
          setEnableAI(savedEnableAI === 'true');
        }

        const savedEnableEditorAI = localStorage.getItem('enable-editor-ai');
        if (savedEnableEditorAI !== null) {
          setEnableEditorAI(savedEnableEditorAI === 'true');
        }

        const savedAIProvider = localStorage.getItem('ai-provider');
        if (savedAIProvider === 'deepseek' || savedAIProvider === 'openai' || savedAIProvider === 'siliconflow') {
          setAIProvider(savedAIProvider);
        }

        const savedApiKey = localStorage.getItem('api-key');
        if (savedApiKey !== null) {
          setApiKey(savedApiKey);
        }

        const savedPrompt = localStorage.getItem('prompt');
        if (savedPrompt !== null) {
          setPrompt(savedPrompt);
        } else {
          // 设置默认提示词
          setPrompt('你是一个灵感提示机器人，我是一个独立博客的博主，我想写一篇博客，请你给我一个可写内容的灵感，不要超过200字，不要分段');
        }

        const savedAnalysisPrompt = localStorage.getItem('analysis-prompt');
        if (savedAnalysisPrompt !== null) {
          setAnalysisPrompt(savedAnalysisPrompt);
        } else {
          // 设置默认分析提示词
          setAnalysisPrompt('你是一个文章分析机器人，以下是我的博客数据{content}，请你分析并给出鼓励性的话语，不要超过200字，不要分段');
        }

        const savedAiRewritePrompt = localStorage.getItem('ai-rewrite-prompt');
        if (savedAiRewritePrompt !== null) {
          setAiRewritePrompt(savedAiRewritePrompt);
        }

        const savedAiImprovePrompt = localStorage.getItem('ai-improve-prompt');
        if (savedAiImprovePrompt !== null) {
          setAiImprovePrompt(savedAiImprovePrompt);
        }

        const savedAiExpandPrompt = localStorage.getItem('ai-expand-prompt');
        if (savedAiExpandPrompt !== null) {
          setAiExpandPrompt(savedAiExpandPrompt);
        }

        const savedAiTranslatePrompt = localStorage.getItem('ai-translate-prompt');
        if (savedAiTranslatePrompt !== null) {
          setAiTranslatePrompt(savedAiTranslatePrompt);
        }

        const savedOpenaiModel = localStorage.getItem('openai-model');
        if (savedOpenaiModel !== null) {
          setOpenaiModel(savedOpenaiModel);
        }

        const savedOpenaiApiEndpoint = localStorage.getItem('openai-api-endpoint');
        if (savedOpenaiApiEndpoint !== null) {
          setOpenaiApiEndpoint(savedOpenaiApiEndpoint);
        }

        // 加载预览模式设置
        const savedPreviewMode = localStorage.getItem('preview-mode');
        if (savedPreviewMode === 'static' || savedPreviewMode === 'server') {
          setPreviewMode(savedPreviewMode);
        } else {
          // 如果没有保存的设置，使用默认值static
          setPreviewMode('static');
        }

        // 加载项目路径
        const savedPath = localStorage.getItem('hexo-project-path');
        if (savedPath && isElectron) {
          const normalizedPath = normalizePath(savedPath);
          setHexoPath(normalizedPath);
          // 同时更新 localStorage 中的路径
          localStorage.setItem('hexo-project-path', normalizedPath);
          await validateHexoProject(normalizedPath);
        }
      }
      
      // 检查更新
      await checkForUpdates(true); // 启动时静默检查
    };

    loadSavedSettings();
  }, [isElectron]);

  // 页面加载完成后显示窗口（仅 Tauri 环境）
  useEffect(() => {
    const showWindow = async () => {
      if (isTauri()) {
        try {
          const { windowControls } = await import('@/lib/tauri-api');
          // 等待一小段时间确保页面渲染完成
          setTimeout(async () => {
            await windowControls.show();
          }, 100);
        } catch (error) {
          console.error('Failed to show window:', error);
        }
      }
    };
    
    showWindow();
  }, []);

  // 监听筛选条件变化
  useEffect(() => {
    applyFilter();
  }, [currentFilter, posts]);

  // 切换语言
  const toggleLanguage = () => {
    const newLanguage: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', newLanguage);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (typeof window !== 'undefined') {
      // 保存主题设置
      localStorage.setItem('app-theme', newTheme ? 'dark' : 'light');

      // 应用主题到document
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // 清除保存的项目路径
  const clearSavedPath = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hexo-project-path');
    }
    setHexoPath('');
    setIsValidHexoProject(false);
    setValidationMessage('');
    setPosts([]);
    setSelectedPost(null);
    setPostContent('');
  };
  
  // 处理自动更新设置变化
  const handleAutoCheckUpdatesChange = (value: boolean) => {
    setAutoCheckUpdates(value);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auto-check-updates', value.toString());
    }
  };
  
  // 检查更新
  const checkForUpdates = async (silent = false) => {
    if (!isElectron) return;
    
    if (!silent) {
      setUpdateCheckInProgress(true);
    }
    
    try {
      const ipcRenderer = await getIpcRenderer();
      const result = await ipcRenderer.invoke('check-for-updates');
      
      if (result.success) {
        setUpdateInfo(result);
        setUpdateAvailable(result.updateAvailable);
        
        // 如果有更新且不是静默检查，显示通知
        if (result.updateAvailable && !silent) {
          toast({
            title: '发现新版本',
            description: `新版本 ${result.latestVersion} 已发布`,
            variant: 'default',
          });
        } else if (!result.updateAvailable && !silent) {
          toast({
            title: '已是最新版本',
            description: `当前版本 ${result.currentVersion} 已是最新`,
            variant: 'success',
          });
        }
        
        // 如果是静默检查且有更新，显示通知
        if (result.updateAvailable && silent) {
          toast({
            title: '发现新版本',
            description: `新版本 ${result.latestVersion} 已发布，点击设置查看详情`,
            variant: 'default',
          });
        }
      } else if (!silent) {
        toast({
          title: '检查更新失败',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      if (!silent) {
        toast({
          title: '检查更新失败',
          description: error instanceof Error ? error.message : '未知错误',
          variant: 'error',
        });
      }
    } finally {
      if (!silent) {
        setUpdateCheckInProgress(false);
      }
    }
  };

  // 选择Hexo项目目录
  const selectHexoDirectory = async () => {
    if (!isElectron) {
      toast({
        title: t.onlyAvailableInDesktop,
        variant: "destructive",
      });
      return;
    }

    try {
      const ipcRenderer = await getIpcRenderer();
      const selectedPath = await ipcRenderer.invoke('select-directory');

      if (selectedPath) {
        const normalizedPath = normalizePath(selectedPath);
        setHexoPath(normalizedPath);
        // 保存规范化后的路径到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('hexo-project-path', normalizedPath);
        }
        await validateHexoProject(normalizedPath);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
      setValidationMessage('选择目录失败: ' + error.message);
    }
  };

  // 验证Hexo项目
  const validateHexoProject = async (path: string) => {
    if (!isElectron) return;

    try {
      const ipcRenderer = await getIpcRenderer();
      const result = await ipcRenderer.invoke('validate-hexo-project', path, language);

      setIsValidHexoProject(result.valid);
      setValidationMessage(result.message);

      if (result.valid) {
        await loadPosts(path);
      }
    } catch (error) {
      console.error('验证项目失败:', error);
      setValidationMessage('验证项目失败: ' + error.message);
    }
  };

  // 提取文章中的标签和分类
  const extractTagsAndCategories = async (posts: Post[]) => {
    if (!isElectron) return;
    
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const allTagsList: string[] = []; // 收集所有标签（包括重复的）用于标签云
    
    try {
      const ipcRenderer = await getIpcRenderer();
      
      for (const post of posts) {
        try {
          // 读取文件内容
          const content = await ipcRenderer.invoke('read-file', post.path);
          
          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            
            // 提取标签 - 支持多种 Hexo 格式
            const parseTags = (text: string): string[] => {
              // 1. 先把整个 frontmatter 按行分割成数组
              // 例如：['title: 测试', 'date: 2025-10-07', 'tags:', '  - 测试1', '  - 测试2', ...]
              const lines = text.split('\n');
              const tags: string[] = [];  // 用来存储找到的标签
              let inTagsSection = false;  // 标记：我们是否在 tags 区域内？
              
              // 2. 逐行遍历
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];           // 原始行（保留缩进）
                const trimmedLine = line.trim(); // 去掉前后空格的行
                
                // === 第一步：找到 tags: 这一行 ===
                if (trimmedLine.startsWith('tags:')) {
                  const afterColon = trimmedLine.substring(5).trim();  // 取 "tags:" 后面的内容
                  
                  // 格式1: tags: [tag1, tag2, tag3] - 行内数组格式
                  if (afterColon.startsWith('[')) {
                    const arrayMatch = afterColon.match(/\[(.*?)\]/);
                    if (arrayMatch) {
                      return arrayMatch[1]
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag);
                    }
                  }
                  // 格式2: tags: single-tag - 单个标签在同一行
                  else if (afterColon.length > 0) {
                    return [afterColon];
                  }
                  // 格式3: tags: 后面是空的，说明标签在下面的行（多行列表格式）
                  // 例如：
                  // tags:
                  //   - tag1
                  //   - tag2
                  else {
                    inTagsSection = true;  // 设置标记：我们进入 tags 区域了！
                    continue;              // 看下一行
                  }
                }
                
                // === 第二步：如果我们在 tags 区域内，开始收集标签 ===
                if (inTagsSection) {
                  // 退出条件：遇到一行不是以 - 开头，也不是缩进的行
                  // 例如遇到 "categories:" 或其他字段就退出
                  if (trimmedLine && !trimmedLine.startsWith('-') && !line.startsWith(' ') && !line.startsWith('\t')) {
                    break;  // 退出循环，不再收集
                  }
                  
                  // 收集标签：如果这行以 - 开头
                  if (trimmedLine.startsWith('-')) {
                    const tag = trimmedLine.substring(1).trim();  // 去掉 "-" 和空格，得到标签内容
                    if (tag) tags.push(tag);  // 添加到结果数组
                  }
                }
              }
              
              return tags;
            };
            
            const tags = parseTags(frontMatter);
            tags.forEach(tag => {
              tagsSet.add(tag);
              allTagsList.push(tag);
            });
            
            // 提取分类 - 支持多种 Hexo 格式（逻辑同 parseTags）
            const parseCategories = (text: string): string[] => {
              // 1. 先把整个 frontmatter 按行分割成数组
              const lines = text.split('\n');
              const categories: string[] = [];  // 用来存储找到的分类
              let inCategoriesSection = false;  // 标记：我们是否在 categories 区域内？
              
              // 2. 逐行遍历
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];           // 原始行（保留缩进）
                const trimmedLine = line.trim(); // 去掉前后空格的行
                
                // === 第一步：找到 categories: 这一行 ===
                if (trimmedLine.startsWith('categories:')) {
                  const afterColon = trimmedLine.substring(11).trim();  // 取 "categories:" 后面的内容
                  
                  // 格式1: categories: [cat1, cat2, cat3] - 行内数组格式
                  if (afterColon.startsWith('[')) {
                    const arrayMatch = afterColon.match(/\[(.*?)\]/);
                    if (arrayMatch) {
                      return arrayMatch[1]
                        .split(',')
                        .map(cat => cat.trim())
                        .filter(cat => cat);
                    }
                  }
                  // 格式2: categories: single-category - 单个分类在同一行
                  else if (afterColon.length > 0) {
                    return [afterColon];
                  }
                  // 格式3: categories: 后面是空的，说明分类在下面的行（多行列表格式）
                  // 例如：
                  // categories:
                  //   - cat1
                  //   - cat2
                  else {
                    inCategoriesSection = true;  // 设置标记：我们进入 categories 区域了！
                    continue;                    // 跳过当前行，继续看下一行
                  }
                }
                
                // === 第二步：如果我们在 categories 区域内，开始收集分类 ===
                if (inCategoriesSection) {
                  // 退出条件：遇到一行不是以 - 开头，也不是缩进的行
                  // 例如遇到其他字段就退出
                  if (trimmedLine && !trimmedLine.startsWith('-') && !line.startsWith(' ') && !line.startsWith('\t')) {
                    break;  // 退出循环，不再收集
                  }
                  
                  // 收集分类：如果这行以 - 开头
                  if (trimmedLine.startsWith('-')) {
                    const cat = trimmedLine.substring(1).trim();  // 去掉 "-" 和空格，得到分类内容
                    if (cat) categories.push(cat);  // 添加到结果数组
                  }
                }
              }
              
              return categories;
            };
            
            const categories = parseCategories(frontMatter);
            categories.forEach(category => categoriesSet.add(category));
          }
        } catch (error) {
          console.error(`读取文章 ${post.name} 失败:`, error);
        }
      }
      
      setAvailableTags(Array.from(tagsSet));
      setAvailableCategories(Array.from(categoriesSet));
      setAllTagsForCloud(allTagsList); // 设置所有标签列表
    } catch (error) {
      console.error('提取标签和分类失败:', error);
    }
  };

  // 提取标签 - 支持多种 Hexo 格式
  const parseTags = (text: string): string[] => {
    // 1. 先把整个 frontmatter 按行分割成数组
    // 例如：['title: 测试', 'date: 2025-10-07', 'tags:', '  - 测试1', '  - 测试2', ...]
    const lines = text.split('\n');
    const tags: string[] = [];  // 用来存储找到的标签
    let inTagsSection = false;  // 标记：我们是否在 tags 区域内？

    // 2. 逐行遍历
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];           // 原始行（保留缩进）
      const trimmedLine = line.trim(); // 去掉前后空格的行

      // === 第一步：找到 tags: 这一行 ===
      if (trimmedLine.startsWith('tags:')) {
        const afterColon = trimmedLine.substring(5).trim();  // 取 "tags:" 后面的内容

        // 格式1: tags: [tag1, tag2, tag3] - 行内数组格式
        if (afterColon.startsWith('[')) {
          const arrayMatch = afterColon.match(/\[(.*?)\]/);
          if (arrayMatch) {
            return arrayMatch[1]
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag);
          }
        }
        // 格式2: tags: single-tag - 单个标签在同一行
        else if (afterColon.length > 0) {
          return [afterColon];
        }
        // 格式3: tags: 后面是空的，说明标签在下面的行（多行列表格式）
        // 例如：
        // tags:
        //   - tag1
        //   - tag2
        else {
          inTagsSection = true;  // 设置标记：我们进入 tags 区域了！
          continue;              // 看下一行
        }
      }

      // === 第二步：如果我们在 tags 区域内，开始收集标签 ===
      if (inTagsSection) {
        // 退出条件：遇到一行不是以 - 开头，也不是缩进的行
        // 例如遇到 "categories:" 或其他字段就退出
        if (trimmedLine && !trimmedLine.startsWith('-') && !line.startsWith(' ') && !line.startsWith('\t')) {
          break;  // 退出循环，不再收集
        }

        // 收集标签：如果这行以 - 开头
        if (trimmedLine.startsWith('-')) {
          const tag = trimmedLine.substring(1).trim();  // 去掉 "-" 和空格，得到标签内容
          if (tag) tags.push(tag);  // 添加到结果数组
        }
      }
    }

    return tags;
  };

  // 提取分类 - 支持多种 Hexo 格式（逻辑同 parseTags）
  const parseCategories = (text: string): string[] => {
    // 1. 先把整个 frontmatter 按行分割成数组
    const lines = text.split('\n');
    const categories: string[] = [];  // 用来存储找到的分类
    let inCategoriesSection = false;  // 标记：我们是否在 categories 区域内？

    // 2. 逐行遍历
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];           // 原始行（保留缩进）
      const trimmedLine = line.trim(); // 去掉前后空格的行

      // === 第一步：找到 categories: 这一行 ===
      if (trimmedLine.startsWith('categories:')) {
        const afterColon = trimmedLine.substring(11).trim();  // 取 "categories:" 后面的内容

        // 格式1: categories: [cat1, cat2, cat3] - 行内数组格式
        if (afterColon.startsWith('[')) {
          const arrayMatch = afterColon.match(/\[(.*?)\]/);
          if (arrayMatch) {
            return arrayMatch[1]
              .split(',')
              .map(cat => cat.trim())
              .filter(cat => cat);
          }
        }
        // 格式2: categories: single-category - 单个分类在同一行
        else if (afterColon.length > 0) {
          return [afterColon];
        }
        // 格式3: categories: 后面是空的，说明分类在下面的行（多行列表格式）
        // 例如：
        // categories:
        //   - cat1
        //   - cat2
        else {
          inCategoriesSection = true;  // 设置标记：我们进入 categories 区域了！
          continue;                    // 跳过当前行，继续看下一行
        }
      }

      // === 第二步：如果我们在 categories 区域内，开始收集分类 ===
      if (inCategoriesSection) {
        // 退出条件：遇到一行不是以 - 开头，也不是缩进的行
        // 例如遇到其他字段就退出
        if (trimmedLine && !trimmedLine.startsWith('-') && !line.startsWith(' ') && !line.startsWith('\t')) {
          break;  // 退出循环，不再收集
        }

        // 收集分类：如果这行以 - 开头
        if (trimmedLine.startsWith('-')) {
          const cat = trimmedLine.substring(1).trim();  // 去掉 "-" 和空格，得到分类内容
          if (cat) categories.push(cat);  // 添加到结果数组
        }
      }
    }

    return categories;
  };

  // 应用筛选
  const applyFilter = async () => {
    if (!currentFilter) {
      setFilteredPosts(posts);
      return;
    }
    
    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      const filtered: Post[] = [];
      
      for (const post of posts) {
        try {
          // 读取文件内容
          const content = await ipcRenderer.invoke('read-file', post.path);
          
          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            
            if (currentFilter.type === 'tag') {
              // 使用新的parseTags函数检查标签
              const tags = parseTags(frontMatter);
              if (tags.includes(currentFilter.value)) {
                filtered.push(post);
              }
            } else if (currentFilter.type === 'category') {
              // 使用新的parseCategories函数检查分类
              const categories = parseCategories(frontMatter);
              if (categories.includes(currentFilter.value)) {
                filtered.push(post);
              }
            }
          }
        } catch (error) {
          console.error(`读取文章 ${post.name} 失败:`, error);
        }
      }
      
      setFilteredPosts(filtered);
    } catch (error) {
      console.error('应用筛选失败:', error);
      setFilteredPosts(posts);
    } finally {
      setIsLoading(false);
    }
  };

  // 按标签筛选
  const filterByTag = (tag: string) => {
    setCurrentFilter({ type: 'tag', value: tag });
    // 重置页码到第一页
    setCurrentPage(1);
  };

  // 按分类筛选
  const filterByCategory = (category: string) => {
    setCurrentFilter({ type: 'category', value: category });
    // 重置页码到第一页
    setCurrentPage(1);
  };

  // 清除筛选
  const clearFilter = () => {
    setCurrentFilter(null);
    // 重置页码到第一页
    setCurrentPage(1);
  };

  // 加载文章列表
  const loadPosts = async (path: string) => {
    if (!isElectron) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      // 递归获取所有markdown文件
      const getAllMarkdownFiles = async (dirPath: string): Promise<any[]> => {
        const files = await ipcRenderer.invoke('list-files', dirPath);
        const markdownFiles: any[] = [];

        for (const file of files) {
          if (file.isDirectory) {
            // 如果是目录，递归获取子目录中的markdown文件
            const subDirFiles = await getAllMarkdownFiles(file.path);
            markdownFiles.push(...subDirFiles);
          } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
            // 如果是markdown文件，添加到结果列表
            markdownFiles.push(file);
          }
        }

        return markdownFiles;
      };

      const allMarkdownFiles = await getAllMarkdownFiles(path + '/source/_posts');

      const markdownFiles = allMarkdownFiles.map((file: any) => {
          // 兼容 Electron 和 Tauri 两种格式
          // Electron: modifiedTime 是 Date 对象
          // Tauri: modifiedTime 是时间戳字符串
          let modifiedTime: Date;
          
          if (file.modifiedTime instanceof Date) {
            // Electron 格式：直接使用 Date 对象
            modifiedTime = file.modifiedTime;
          } else if (typeof file.modifiedTime === 'string') {
            // Tauri 格式：从时间戳字符串转换
            modifiedTime = new Date(parseInt(file.modifiedTime, 10));
          } else {
            // 备用方案
            modifiedTime = new Date(0);
          }
          
          return {
            ...file,
            modifiedTime
          };
        });

      setPosts(markdownFiles);
      setFilteredPosts(markdownFiles);
      
      // 提取标签和分类
      await extractTagsAndCategories(markdownFiles);
    } catch (error) {
      console.error('加载文章失败:', error);
      setValidationMessage('加载文章失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新文章
  const createNewPost = () => {
    if (!isElectron || !hexoPath) {
      alert(t.selectValidHexoProject);
      return;
    }
    setShowCreateDialog(true);
  };

  // 处理文章创建确认
  const handleCreatePostConfirm = async (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
    template?: string;
  }) => {
    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();

      // 构建Hexo new命令
      let command = `new "${postData.title}"`;
      
      // 如果使用了自定义模板，则修改命令
      if (postData.template) {
        command = `new ${postData.template} "${postData.title}"`;
      }

      // 如果有标签或分类，创建文章后需要更新front matter
      const result = await ipcRenderer.invoke('execute-hexo-command', command, hexoPath);

      // 添加到日志
      const newLog = {
        ...result,
        timestamp: new Date().toLocaleString(),
        command: 'create post'
      };
      setCommandLogs(prev => [...prev, newLog]);
      setCommandResult(result);
      if (result.success) {
        // 显示成功通知
        toast({
          title: t.success,
          description: t.articleCreateSuccess,
          variant: 'success',
        });
        
        // 如果有额外的标签、分类或摘要，需要更新文件
        if (postData.tags.length > 0 || postData.categories.length > 0 || postData.excerpt) {
          await updatePostFrontMatter(postData);
        }

        // 延迟一点再加载文章列表，确保文件系统操作完成
        setTimeout(async () => {
          await loadPosts(hexoPath);
        }, 500);
      } else {
        // 显示失败通知
        toast({
          title: t.failed,
          description: t.createArticleFailedMsg,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('创建文章失败:', error);
      const createErrorResult = {
        success: false,
        error: '创建文章失败: ' + (error?.message || '未知错误'),
        timestamp: new Date().toLocaleString(),
        command: 'create post'
      };
      setCommandLogs(prev => [...prev, createErrorResult]);
      setCommandResult(createErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: t.createArticleFailedMsg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
      setShowCreateDialog(false);
    }
  };

  // 更新文章的front matter
  const updatePostFrontMatter = async (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
  }) => {
    try {
      const ipcRenderer = await getIpcRenderer();
      const postsDir = hexoPath + '/source/_posts';
      const fileName = postData.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-') + '.md';
      const filePath = `${postsDir}/${fileName}`;

      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', filePath);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 添加标签
        if (postData.tags.length > 0) {
          // 检查是否已有tags字段
          const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
          if (tagsMatch) {
            // 如果已有tags字段，替换它
            const tagsString = postData.tags.map(tag => `  - ${tag}`).join('\n');
            frontMatter = frontMatter.replace(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `tags:\n${tagsString}`);
          } else {
            // 如果没有tags字段，添加它
            const tagsString = postData.tags.map(tag => `  - ${tag}`).join('\n');
            frontMatter += `\ntags:\n${tagsString}`;
          }
        }

        // 添加分类
        if (postData.categories.length > 0) {
          const categoriesString = postData.categories.map(cat => `  - ${cat}`).join('\n');
          frontMatter += `\ncategories:\n${categoriesString}`;
        }

        // 添加摘要
        if (postData.excerpt) {
          frontMatter += `\nexcerpt: "${postData.excerpt}"`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', filePath, newContent);
        
        // 重新提取标签和分类
        await extractTagsAndCategories(posts);
      }
    } catch (error) {
      console.error('更新文章元数据失败:', error);
    }
  };

  // 选择文章
  const selectPost = async (post: Post) => {
    if (!isElectron) return;

    setSelectedPost(post);
    setIsLoading(true);

    try {
      const ipcRenderer = await getIpcRenderer();
      const content = await ipcRenderer.invoke('read-file', post.path);
      setPostContent(content);
    } catch (error) {
      console.error('读取文章失败:', error);
      const readErrorResult = {
        success: false,
        error: '读取文章失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'read post'
      };
      setCommandLogs(prev => [...prev, readErrorResult]);
      setCommandResult(readErrorResult);
    } finally {
      setIsLoading(false);
      // 选择文章后设置自动保存定时器
      setupAutoSaveTimer();
    }
  };

  // 保存文章
  const savePost = async () => {
    if (!isElectron || !selectedPost) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      await ipcRenderer.invoke('write-file', selectedPost.path, postContent);

      const saveResult = {
        success: true,
        stdout: '文章保存成功',
        timestamp: new Date().toLocaleString(),
        command: 'save post'
      };
      setCommandLogs(prev => [...prev, saveResult]);
      setCommandResult(saveResult);
      
      // 显示成功通知
      toast({
        title: t.success,
        description: t.articleSaveSuccess,
        variant: 'success',
      });
      
      // 如果是服务器预览模式，触发预览框强制刷新
      if (previewMode === 'server' && editorMode === 'mode2') {
        setForcePreviewRefresh(true);
      }
      
      // 保存后重新提取标签和分类
      await extractTagsAndCategories(posts);
    } catch (error) {
      console.error('保存文章失败:', error);
      const saveErrorResult = {
        success: false,
        error: '保存文章失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'save post'
      };
      setCommandLogs(prev => [...prev, saveErrorResult]);
      setCommandResult(saveErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: t.saveArticleFailedMsg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
      // 保存文章后重置自动保存定时器
      setupAutoSaveTimer();
    }
  };

  // 删除文章
  const deletePost = async () => {
    if (!isElectron || !selectedPost) return;

    if (!confirm(`确定要删除文章 "${selectedPost.name}" 吗？`)) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      await ipcRenderer.invoke('delete-file', selectedPost.path);

      const deleteResult = {
        success: true,
        stdout: '文章删除成功',
        timestamp: new Date().toLocaleString(),
        command: 'delete post'
      };
      setCommandLogs(prev => [...prev, deleteResult]);
      setCommandResult(deleteResult);

      setSelectedPost(null);
      setPostContent('');
      await loadPosts(hexoPath);
      
      // 显示成功通知
      toast({
        title: t.success,
        description: t.articleDeleteSuccess,
        variant: 'success',
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      const deleteErrorResult = {
        success: false,
        error: '删除文章失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'delete post'
      };
      setCommandLogs(prev => [...prev, deleteErrorResult]);
      setCommandResult(deleteErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '文章删除失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 批量删除文章
  const deletePosts = async (postsToDelete: Post[]) => {
    if (!isElectron || postsToDelete.length === 0) return;

    if (!confirm(`确定要删除选中的 ${postsToDelete.length} 篇文章吗？此操作不可撤销。`)) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();

      // 逐个删除文章
      for (const post of postsToDelete) {
        await ipcRenderer.invoke('delete-file', post.path);
      }

      const batchDeleteResult = {
        success: true,
        stdout: `成功删除 ${postsToDelete.length} 篇文章`,
        timestamp: new Date().toLocaleString(),
        command: 'batch delete posts'
      };
      setCommandLogs(prev => [...prev, batchDeleteResult]);
      setCommandResult(batchDeleteResult);

      // 如果当前选中的文章在被删除的文章中，清空选择
      if (selectedPost && postsToDelete.some(p => p.path === selectedPost.path)) {
        setSelectedPost(null);
        setPostContent('');
      }

      await loadPosts(hexoPath);
      
      // 显示成功通知
      toast({
        title: t.success,
        description: t.articlesDeleteSuccess.replace('{count}', postsToDelete.length),
        variant: 'success',
      });
    } catch (error) {
      console.error('批量删除文章失败:', error);
      const batchDeleteErrorResult = {
        success: false,
        error: '批量删除文章失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'batch delete posts'
      };
      setCommandLogs(prev => [...prev, batchDeleteErrorResult]);
      setCommandResult(batchDeleteErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '批量删除文章失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 批量添加标签到文章
  const addTagsToPosts = async (postsToUpdate: Post[], tags: string[]) => {
    if (!isElectron || postsToUpdate.length === 0 || tags.length === 0) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      let successCount = 0;

      // 逐个更新文章
      for (const post of postsToUpdate) {
        try {
          // 读取现有文件内容
          let content = await ipcRenderer.invoke('read-file', post.path);

          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            let frontMatter = frontMatterMatch[1];

            // 检查是否已有tags字段
            const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);

            if (tagsMatch) {
              // 已有tags字段，添加新标签
              const existingTags = tagsMatch[1].split('\n')
                .map(line => line.trim().replace(/^-\s*/, ''))
                .filter(tag => tag);

              // 合并标签，去重
              const allTags = [...new Set([...existingTags, ...tags])];
              const tagsString = allTags.map(tag => `  - ${tag}`).join('\n');

              // 替换原有tags字段
              frontMatter = frontMatter.replace(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `tags:\n${tagsString}`);
            } else {
              // 没有tags字段，添加新字段
              const tagsString = tags.map(tag => `  - ${tag}`).join('\n');
              frontMatter += `\\ntags:\\n${tagsString}`;
            }

            // 重新构建文件内容
const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);
            // 写回文件
            await ipcRenderer.invoke('write-file', post.path, newContent);
            successCount++;
          }
        } catch (error) {
          console.error(`更新文章 ${post.name} 失败:`, error);
        }
      }

      const batchTagResult = {
        success: true,
        stdout: t.tagsAddSuccess.replace('{successCount}', successCount).replace('{totalCount}', postsToUpdate.length),
        timestamp: new Date().toLocaleString(),
        command: 'batch add tags'
      };
      setCommandLogs(prev => [...prev, batchTagResult]);
      setCommandResult(batchTagResult);

      // 如果当前选中的文章在被更新的文章中，重新加载内容
      if (selectedPost && postsToUpdate.some(p => p.path === selectedPost.path)) {
        const content = await ipcRenderer.invoke('read-file', selectedPost.path);
        setPostContent(content);
      }
      
      // 重新提取标签和分类
      await extractTagsAndCategories(posts);
    } catch (error) {
      console.error('批量添加标签失败:', error);
      const batchTagErrorResult = {
        success: false,
        error: '批量添加标签失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'batch add tags'
      };
      setCommandLogs(prev => [...prev, batchTagErrorResult]);
      setCommandResult(batchTagErrorResult);
    } finally {
      setIsLoading(false);
    }
  };

  // 批量添加分类到文章
  const addCategoriesToPosts = async (postsToUpdate: Post[], categories: string[]) => {
    if (!isElectron || postsToUpdate.length === 0 || categories.length === 0) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      let successCount = 0;

      // 逐个更新文章
      for (const post of postsToUpdate) {
        try {
          // 读取现有文件内容
          let content = await ipcRenderer.invoke('read-file', post.path);

          // 解析front matter
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontMatterMatch) {
            let frontMatter = frontMatterMatch[1];

            // 检查是否已有categories字段
            const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);

            if (categoriesMatch) {
              // 已有categories字段，添加新分类
              const existingCategories = categoriesMatch[1].split('\n')
                .map(line => line.trim().replace(/^-\s*/, ''))
                .filter(cat => cat);

              // 合并分类，去重
              const allCategories = [...new Set([...existingCategories, ...categories])];
              const categoriesString = allCategories.map(cat => `  - ${cat}`).join('\n');

              // 替换原有categories字段
              frontMatter = frontMatter.replace(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `categories:\n${categoriesString}`);
            } else {
              // 没有categories字段，添加新字段
              const categoriesString = categories.map(cat => `  - ${cat}`).join('\n');
              frontMatter += `\ncategories:\n${categoriesString}`;
            }

            // 重新构建文件内容
const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontMatter}\n---`);


            // 写回文件
            await ipcRenderer.invoke('write-file', post.path, newContent);
            successCount++;
          }
        } catch (error) {
          console.error(`更新文章 ${post.name} 失败:`, error);
        }
      }

      setCommandResult({
        success: true,
        stdout: t.categoriesAddSuccess.replace('{successCount}', successCount).replace('{totalCount}', postsToUpdate.length)
      });

      // 如果当前选中的文章在被更新的文章中，重新加载内容
      if (selectedPost && postsToUpdate.some(p => p.path === selectedPost.path)) {
        const content = await ipcRenderer.invoke('read-file', selectedPost.path);
        setPostContent(content);
      }
      
      // 重新提取标签和分类
      await extractTagsAndCategories(posts);
    } catch (error) {
      console.error('批量添加分类失败:', error);
      const batchCategoryErrorResult = {
        success: false,
        error: '批量添加分类失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'batch add categories'
      };
      setCommandLogs(prev => [...prev, batchCategoryErrorResult]);
      setCommandResult(batchCategoryErrorResult);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除单篇文章
  const deleteSinglePost = async (postToDelete: Post) => {
    if (!isElectron || !postToDelete) return;

    if (!confirm(`确定要删除文章 "${postToDelete.name}" 吗？此操作不可撤销。`)) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      await ipcRenderer.invoke('delete-file', postToDelete.path);

      const deleteSingleResult = {
        success: true,
        stdout: '文章删除成功',
        timestamp: new Date().toLocaleString(),
        command: 'delete single post'
      };
      setCommandLogs(prev => [...prev, deleteSingleResult]);
      setCommandResult(deleteSingleResult);

      // 如果删除的是当前选中的文章，清空选择
      if (selectedPost && selectedPost.path === postToDelete.path) {
        setSelectedPost(null);
        setPostContent('');
      }
      
      await loadPosts(hexoPath);
      
      // 显示成功通知
      toast({
        title: t.success,
        description: t.articleDeleteSuccess,
        variant: 'success',
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      const deleteErrorResult = {
        success: false,
        error: '删除文章失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'delete post'
      };
      setCommandLogs(prev => [...prev, deleteErrorResult]);
      setCommandResult(deleteErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '删除文章失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 为单篇文章添加标签
  const addTagsToPost = async (postToUpdate: Post, tags: string[]) => {
    if (!isElectron || !postToUpdate || tags.length === 0) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      
      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', postToUpdate.path);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 检查是否已有tags字段
        const tagsMatch = frontMatter.match(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
        
        if (tagsMatch) {
          // 已有tags字段，添加新标签
          const existingTags = tagsMatch[1].split('\n')
            .map(line => line.trim().replace(/^\-\s*/, ''))
            .filter(tag => tag);
          
          // 合并标签，去重
          const allTags = [...new Set([...existingTags, ...tags])];
          const tagsString = allTags.map(tag => `  - ${tag}`).join('\n');
          
          // 替换原有tags字段
          frontMatter = frontMatter.replace(/^tags:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `tags:\n${tagsString}`);
        } else {
          // 没有tags字段，添加新字段
          const tagsString = tags.map(tag => `  - ${tag}`).join('\n');
          frontMatter += `\ntags:\n${tagsString}`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', postToUpdate.path, newContent);

        const addTagResult = {
          success: true,
          stdout: '标签添加成功',
          timestamp: new Date().toLocaleString(),
          command: 'add tags'
        };
        setCommandLogs(prev => [...prev, addTagResult]);
        setCommandResult(addTagResult);

        // 如果更新的是当前选中的文章，重新加载内容
        if (selectedPost && selectedPost.path === postToUpdate.path) {
          const content = await ipcRenderer.invoke('read-file', selectedPost.path);
          setPostContent(content);
        }
        
        // 重新提取标签和分类
        await extractTagsAndCategories(posts);
      }
    } catch (error) {
      console.error('添加标签失败:', error);
      setCommandResult({
        success: false,
        error: '添加标签失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 为单篇文章添加分类
  const addCategoriesToPost = async (postToUpdate: Post, categories: string[]) => {
    if (!isElectron || !postToUpdate || categories.length === 0) return;

    setIsLoading(true);
    try {
      const ipcRenderer = await getIpcRenderer();
      
      // 读取现有文件内容
      let content = await ipcRenderer.invoke('read-file', postToUpdate.path);

      // 解析front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        let frontMatter = frontMatterMatch[1];

        // 检查是否已有categories字段
        const categoriesMatch = frontMatter.match(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m);
        
        if (categoriesMatch) {
          // 已有categories字段，添加新分类
          const existingCategories = categoriesMatch[1].split('\n')
            .map(line => line.trim().replace(/^\-\s*/, ''))
            .filter(cat => cat);
          
          // 合并分类，去重
          const allCategories = [...new Set([...existingCategories, ...categories])];
          const categoriesString = allCategories.map(cat => `  - ${cat}`).join('\n');
          
          // 替换原有categories字段
          frontMatter = frontMatter.replace(/^categories:\s*([\s\S]*?)(?=\n\w|\n*$)/m, `categories:\n${categoriesString}`);
        } else {
          // 没有categories字段，添加新字段
          const categoriesString = categories.map(cat => `  - ${cat}`).join('\n');
          frontMatter += `\ncategories:\n${categoriesString}`;
        }

        // 重新构建文件内容
        const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontMatter}\n---`);

        // 写回文件
        await ipcRenderer.invoke('write-file', postToUpdate.path, newContent);

        const addCategoryResult = {
          success: true,
          stdout: '分类添加成功',
          timestamp: new Date().toLocaleString(),
          command: 'add categories'
        };
        setCommandLogs(prev => [...prev, addCategoryResult]);
        setCommandResult(addCategoryResult);

        // 如果更新的是当前选中的文章，重新加载内容
        if (selectedPost && selectedPost.path === postToUpdate.path) {
          const content = await ipcRenderer.invoke('read-file', selectedPost.path);
          setPostContent(content);
        }
        
        // 重新提取标签和分类
        await extractTagsAndCategories(posts);
      }
    } catch (error) {
      console.error('添加分类失败:', error);
      setCommandResult({
        success: false,
        error: '添加分类失败: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 执行Hexo命令
  const executeHexoCommand = async (command: string) => {
    if (!isElectron || !hexoPath) return;

    setIsLoading(true);
    
    // 显示开始执行命令的提示
    let commandName = '';
    if (command === 'clean') commandName = '清理缓存';
    else if (command === 'generate') commandName = '生成静态文件';
    else if (command === 'deploy') commandName = '部署网站';
    else commandName = `执行命令: ${command}`;
    
    // 显示开始执行的通知
    toast({
      title: t.executing,
      description: t.commandExecuting.replace('{command}', commandName),
      variant: 'default',
    });

    try {
      const ipcRenderer = await getIpcRenderer();
      const result = await ipcRenderer.invoke('execute-hexo-command', command, hexoPath);

      // 添加到日志
      const newLog = {
        ...result,
        timestamp: new Date().toLocaleString(),
        command: command
      };
      setCommandLogs(prev => [...prev, newLog]);
      setCommandResult(result);
      
      // 显示通知
      if (result.success) {
        let message = t.commandExecuteSuccess;
        if (command === 'clean') message = t.cleanCacheSuccess;
        else if (command === 'generate') {
          toast({
            title: t.success,
            description: (
              <div className="flex items-center justify-between">
                <span>{t.generateStaticFilesSuccess}</span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  onClick={async (e) => {
                    e.preventDefault();
                    
                    // 显示加载提示
                    const loadingToast = toast({
                      title: language === 'zh' ? '正在打开...' : 'Opening...',
                      description: language === 'zh' ? '正在打开文件夹' : 'Opening folder',
                      duration: 2000,
                    });
                    
                    try {
                      if (typeof window !== 'undefined' && ('require' in window || '__TAURI__' in window || '__TAURI_INTERNALS__' in window)) {
                        // 使用 normalizePathInternal 拼接路径，避免混合分隔符
                        const publicPath = normalizePathInternal(`${hexoPath}/public`);
                        console.log('[Open Folder] Attempting to open:', publicPath);
                        console.log('[Open Folder] Desktop environment:', isDesktopApp());
                        const ipcRenderer = await getIpcRenderer();
                        await ipcRenderer.invoke('open-url', publicPath);
                        console.log('[Open Folder] Successfully opened');
                        
                        // 成功提示
                        toast({
                          title: t.success,
                          description: language === 'zh' ? '文件夹已打开' : 'Folder opened',
                          variant: 'success',
                          duration: 1500,
                        });
                      } else {
                        console.log('[Open Folder] Not in desktop environment');
                        toast({
                          title: t.error,
                          description: language === 'zh' ? '仅在桌面应用中可用' : 'Only available in desktop app',
                          variant: 'error',
                        });
                      }
                    } catch (error) {
                      console.error('[Open Folder] Failed:', error);
                      toast({
                        title: t.error,
                        description: language === 'zh' ? `打开文件夹失败: ${error}` : `Failed to open folder: ${error}`,
                        variant: 'error',
                      });
                    }
                  }}
                >
                  [打开]
                </Button>
              </div>
            ),
            variant: 'success',
          });
        } else if (command === 'deploy') message = t.deploySuccess;
        
        // 对于generate命令，已经在上面显示了自定义通知，这里不再显示
        if (command !== 'generate') {
          toast({
            title: t.success,
            description: message,
            variant: 'success',
          });
        }
      } else {
        let message = t.commandExecuteFailed;
        if (command === 'clean') message = t.clean + t.error;
        else if (command === 'generate') message = t.generate + t.error;
        else if (command === 'deploy') message = t.deploy + t.error;
        
        // 提取详细错误信息
        let detailError = '';
        let fixCommand = ''; // 用于存储修复命令
        if (result.stderr) {
          // 尝试提取关键错误信息
          const stderr = result.stderr;
          
          // 检查是否是 git safe.directory 错误
          if (stderr.includes('dubious ownership') || stderr.includes('safe.directory')) {
            const match = stderr.match(/git config --global --add safe\.directory (.+)/);
            if (match) {
              detailError = `${t.gitSecurityError}：${t.gitSecurityErrorTrustDir}\n${t.gitSecurityErrorSuggest}：${match[0]}`;
              fixCommand = match[0]; // 保存修复命令
            } else {
              detailError = `${t.gitSecurityError}：${t.gitSecurityErrorOwnership}`;
            }
          } 
          // 检查是否是 git 认证错误
          else if (stderr.includes('Permission denied') || stderr.includes('authentication failed')) {
            detailError = t.gitAuthError;
          }
          // 检查是否是网络错误
          else if (stderr.includes('Could not resolve host') || stderr.includes('network')) {
            detailError = t.networkError;
          }
          // 其他错误，提取 FATAL 或 fatal 后的内容
          else if (stderr.includes('FATAL') || stderr.includes('fatal:')) {
            const fatalMatch = stderr.match(/fatal:\s*(.+?)(?:\n|$)/i);
            if (fatalMatch) {
              detailError = fatalMatch[1].trim();
            }
          }
          
          // 如果没有提取到特定错误，显示 stderr 的前 200 个字符
          if (!detailError && stderr.trim()) {
            // 移除 ANSI 颜色代码
            const cleanStderr = stderr.replace(/\u001b\[[0-9;]*m/g, '');
            detailError = cleanStderr.substring(0, 200).trim();
            if (cleanStderr.length > 200) detailError += '...';
          }
        }
        
        // 如果有详细错误，显示在描述中
        const errorMessage = detailError ? `${message}\n\n${detailError}` : message;
        
        toast({
          title: t.failed,
          description: (
            <div className="max-w-md">
              <div className="font-medium mb-2">{message}</div>
              {detailError && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded whitespace-pre-wrap font-mono">
                  {detailError}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                {fixCommand && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-3"
                    onClick={async () => {
                      try {
                        toast({
                          title: t.fixing,
                          description: fixCommand,
                          variant: 'default',
                        });
                        
                        const ipcRenderer = await getIpcRenderer();
                        const fixResult = await ipcRenderer.invoke('execute-command', fixCommand);
                        
                        // 添加到日志
                        const fixLog = {
                          ...fixResult,
                          timestamp: new Date().toLocaleString(),
                          command: `${t.autoFix}: ${fixCommand}`
                        };
                        setCommandLogs(prev => [...prev, fixLog]);
                        
                        if (fixResult.success) {
                          toast({
                            title: t.fixSuccess,
                            description: t.fixSuccessRetry,
                            variant: 'success',
                          });
                        } else {
                          toast({
                            title: t.fixFailed,
                            description: fixResult.error || fixResult.stderr,
                            variant: 'error',
                          });
                        }
                      } catch (error) {
                        // 添加错误日志
                        const fixErrorLog = {
                          success: false,
                          error: error instanceof Error ? error.message : String(error),
                          timestamp: new Date().toLocaleString(),
                          command: `${t.autoFix}: ${fixCommand}`
                        };
                        setCommandLogs(prev => [...prev, fixErrorLog]);
                        
                        toast({
                          title: t.fixFailed,
                          description: error instanceof Error ? error.message : String(error),
                          variant: 'error',
                        });
                      }
                    }}
                  >
                    {t.tryFix}
                  </Button>
                )}
                <div 
                  className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                  onClick={() => {
                    setMainView('logs');
                  }}
                >
                  {t.viewLogsDetail}
                </div>
              </div>
            </div>
          ),
          variant: 'error',
          duration: 10000, // 错误提示显示 10 秒，给用户足够时间阅读
        });
      }
    } catch (error) {
      console.error('执行命令失败:', error);
      const commandErrorResult = {
        success: false,
        error: '执行命令失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: command
      };
      setCommandLogs(prev => [...prev, commandErrorResult]);
      setCommandResult(commandErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '执行命令失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 启动Hexo服务器
  // 注意：Tauri 后端已经通过监听 Hexo 输出判断启动状态
  // 后端会在检测到 "Hexo is running at" 等标志后才返回成功
  const startHexoServer = async () => {
    if (!isElectron || !hexoPath || isServerRunning) return;

    setIsLoading(true);
    
    // 显示开始启动服务器的通知
    toast({
      title: t.starting,
      description: t.startingServer,
      variant: 'default',
    });

    try {
      const ipcRenderer = await getIpcRenderer();
      
      // Tauri 后端会等待服务器就绪后才返回
      // 这个调用可能需要几秒到十几秒（取决于 Hexo 启动速度）
      const result = await ipcRenderer.invoke('start-hexo-server', hexoPath);

      if (result.success) {
        setServerProcess(result.process);
        setIsServerRunning(true);
        
        const serverStartResult = {
          success: true,
          stdout: result.stdout || 'Hexo服务器已启动，访问 http://localhost:4000 预览网站',
          timestamp: new Date().toLocaleString(),
          command: 'start server'
        };
        setCommandLogs(prev => [...prev, serverStartResult]);
        setCommandResult(serverStartResult);

        // 显示成功通知
        toast({
          title: t.success,
          description: t.serverRunning,
          variant: 'success',
        });

        // 只有在非服务器预览模式下才打开浏览器预览
        if (previewMode !== 'server') {
          setTimeout(() => {
            ipcRenderer.invoke('open-url', 'http://localhost:4000');
          }, 1000);
        }
      } else {
        setCommandResult(result);
        
        // 检查是否是端口占用错误
        const isPortConflict = result.error && (
          result.error.includes('端口 4000 已被占用') ||
          result.error.includes('Port 4000 has been used') ||
          result.error.includes('EADDRINUSE')
        );
        
        if (isPortConflict) {
          // 端口占用错误 - 显示带修复按钮的提示
          toast({
            title: t.failed,
            description: result.error || '端口 4000 已被占用',
            variant: 'error',
            action: (
              <ToastAction 
                altText="立即修复" 
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const ipcRenderer = await getIpcRenderer();
                    const fixResult = await ipcRenderer.invoke('fix-port-conflict', 4000);
                    
                    if (fixResult.success) {
                      toast({
                        title: '✅ 修复成功',
                        description: fixResult.stdout || '端口已释放，请重新启动服务器',
                        variant: 'success',
                      });
                    } else {
                      toast({
                        title: '修复失败',
                        description: fixResult.error || '无法自动修复端口占用',
                        variant: 'error',
                      });
                    }
                  } catch (error) {
                    toast({
                      title: '修复失败',
                      description: error instanceof Error ? error.message : '发生错误',
                      variant: 'error',
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                立即修复
              </ToastAction>
            ),
          });
        } else {
          // 其他错误 - 普通提示
          toast({
            title: t.failed,
            description: result.error || 'Hexo服务器启动失败',
            variant: 'error',
          });
        }
      }
    } catch (error) {
      console.error('启动服务器失败:', error);
      setCommandResult({
        success: false,
        error: '启动服务器失败: ' + error.message
      });
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '启动服务器失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 推送项目到远程仓库
  const pushToRemote = async () => {
    if (!isElectron || !hexoPath) return;
    
    // 检查推送设置是否完整
    if (!pushRepoUrl || !pushUsername || !pushEmail) {
      toast({
        title: '错误',
        description: '请先在面板设置中配置推送信息',
        variant: 'error',
      });
      return;
    }
    
    setIsLoading(true);
    
    // 显示开始推送的通知
    toast({
      title: t.pushing,
      description: '正在将项目推送到远程仓库...',
      variant: 'default',
    });
    
    try {
      const ipcRenderer = await getIpcRenderer();
      
      // Tauri 环境使用 -C（大写）指定工作目录，Electron 保持原样，能跑就不改了
      const gitCParam = isTauri() ? '-C' : '-C';
      
      // 配置Git用户信息
      // Tauri: 使用 git -C 参数在指定目录下执行 git 命令（大写 ；
      // Electron: 保持原有的 -c 参数
      const configNameResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} config user.name "${pushUsername}"`);
      const configNameLog = {
        ...configNameResult,
        timestamp: new Date().toLocaleString(),
        command: `git config user.name "${pushUsername}"`
      };
      setCommandLogs(prev => [...prev, configNameLog]);
      
      // 检查配置用户名是否成功
      if (!configNameResult.success) {
        throw new Error(`配置Git用户名失败: ${configNameResult.stderr || configNameResult.error || '未知错误'}`);
      }
      
      const configEmailResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} config user.email "${pushEmail}"`);
      const configEmailLog = {
        ...configEmailResult,
        timestamp: new Date().toLocaleString(),
        command: `git config user.email "${pushEmail}"`
      };
      setCommandLogs(prev => [...prev, configEmailLog]);
      
      // 检查配置邮箱是否成功
      if (!configEmailResult.success) {
        throw new Error(`配置Git邮箱失败: ${configEmailResult.stderr || configEmailResult.error || '未知错误'}`);
      }
      
      // 添加远程仓库
      const remoteName = 'origin';
      const addRemoteResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} remote set-url ${remoteName} ${pushRepoUrl}`);
      const addRemoteLog = {
        ...addRemoteResult,
        timestamp: new Date().toLocaleString(),
        command: `git remote set-url ${remoteName} ${pushRepoUrl}`
      };
      setCommandLogs(prev => [...prev, addRemoteLog]);
      
      // 检查添加远程仓库是否成功
      // 注意：如果远程仓库已存在，命令会失败，但这不是致命错误，可以继续
      if (!addRemoteResult.success && !addRemoteResult.stderr?.includes('already exists')) {
        throw new Error(`添加远程仓库失败: ${addRemoteResult.stderr || addRemoteResult.error || '未知错误'}`);
      }
      
      // 添加所有文件到暂存区
      const addResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} add .`);
      const addLog = {
        ...addResult,
        timestamp: new Date().toLocaleString(),
        command: 'git add .'
      };
      setCommandLogs(prev => [...prev, addLog]);
      
      // 检查添加文件是否成功
      if (!addResult.success) {
        throw new Error(`添加文件到暂存区失败: ${addResult.stderr || addResult.error || '未知错误'}`);
      }
      
      // 提交更改
      const commitResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} commit -m Update`);
      const commitLog = {
        ...commitResult,
        timestamp: new Date().toLocaleString(),
        command: 'git commit -m Update'
      };
      setCommandLogs(prev => [...prev, commitLog]);
      
      // 检查提交是否成功
      // 注意：如果没有更改需要提交，git会返回非零状态码，但这不是错误
      if (!commitResult.success && !commitResult.stderr?.includes('nothing to commit')) {
        throw new Error(`提交更改失败: ${commitResult.stderr || commitResult.error || '未知错误'}`);
      }
      
      // 推送到远程仓库
      const pushResult = await ipcRenderer.invoke('execute-command', `git ${gitCParam} ${hexoPath} push -u ${remoteName} ${pushBranch}`);
      const pushLog = {
        ...pushResult,
        timestamp: new Date().toLocaleString(),
        command: `git push -u ${remoteName} ${pushBranch}`
      };
      setCommandLogs(prev => [...prev, pushLog]);
      
      // 检查推送是否成功
      if (!pushResult.success) {
        throw new Error(`推送到远程仓库失败: ${pushResult.stderr || pushResult.error || '未知错误'}`);
      }
      
      const pushSuccessResult = {
        success: true,
        stdout: '项目已成功推送到远程仓库',
        timestamp: new Date().toLocaleString(),
        command: 'push to remote'
      };
      setCommandLogs(prev => [...prev, pushSuccessResult]);
      setCommandResult(pushSuccessResult);
      
      // 显示成功通知
      toast({
        title: t.success,
        description: t.pushSuccess,
        variant: 'success',
      });
    } catch (error) {
      console.error('推送失败:', error);
      const pushErrorResult = {
        success: false,
        error: '推送失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'push to remote'
      };
      setCommandLogs(prev => [...prev, pushErrorResult]);
      setCommandResult(pushErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: t.pushFailed,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 停止Hexo服务器
  const stopHexoServer = async () => {
    if (!isElectron || !isServerRunning) return;

    setIsLoading(true);
    
    // 显示开始停止服务器的通知
    toast({
      title: t.stopping,
      description: t.stoppingServer,
      variant: 'default',
    });

    try {
      let result;
      
      // 判断是否在 Tauri 环境，使用对应的 API
      if (isTauri()) {
        // Tauri 环境：使用公共的 commandOperations
        result = await commandOperations.stopHexoServer();
      } else {
        // Electron 环境：使用 IPC
        const ipcRenderer = await getIpcRenderer();
        result = await ipcRenderer.invoke('stop-hexo-server');
      }

      if (result.success) {
        setIsServerRunning(false);
        setServerProcess(null);
        const serverStopResult = {
          success: true,
          stdout: result.stdout || 'Hexo服务器已停止',
          timestamp: new Date().toLocaleString(),
          command: 'stop server'
        };
        setCommandLogs(prev => [...prev, serverStopResult]);
        setCommandResult(serverStopResult);
        
        // 显示成功通知
        toast({
          title: t.success,
          description: t.serverStopped,
          variant: 'success',
        });
      } else {
        setCommandResult(result);
        
        // 显示失败通知
        toast({
          title: t.failed,
          description: result.error || 'Hexo服务器停止失败',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('停止服务器失败:', error);
      const serverStopErrorResult = {
        success: false,
        error: '停止服务器失败: ' + error.message,
        timestamp: new Date().toLocaleString(),
        command: 'stop server'
      };
      setCommandLogs(prev => [...prev, serverStopErrorResult]);
      setCommandResult(serverStopErrorResult);
      
      // 显示错误通知
      toast({
        title: t.failed,
        description: '停止服务器失败',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染命令结果
  const renderCommandResult = () => {
    if (!commandResult) return null;

    // 限制输出长度和宽度
    const truncateText = (text, maxLength = 500) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const formatOutput = (text) => {
      if (!text) return '';
      // 限制每行长度，避免过宽
      const lines = text.split('\n');
      const formattedLines = lines.map(line => {
        if (line.length > 80) {
          return line.substring(0, 80) + '...';
        }
        return line;
      });
      return truncateText(formattedLines.join('\n'));
    };

    return (
      <Alert className={commandResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <AlertDescription>
          <div className="font-mono text-xs whitespace-pre-wrap break-words overflow-hidden max-w-full">
            {commandResult.success ? (
              <div className="text-green-700">
                <div className="font-semibold">✓ {t.commandExecuteSuccess}</div>
                {commandResult.stdout && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.stdout)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-700">
                <div className="font-semibold">✗ {t.commandExecuteFailed}</div>
                {commandResult.error && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.error)}
                  </div>
                )}
                {commandResult.stderr && (
                  <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden">
                    {formatOutput(commandResult.stderr)}
                  </div>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 自定义标题栏 - 固定在顶部 */}
      <CustomTitlebar />
      
      {/* 顶部导航栏 - 添加顶部边距以避免被固定标题栏遮挡 */}
      <header className="border-b bg-card mt-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Hexo Hub</h1>
            {isValidHexoProject && (
              <Badge variant="default" className="bg-green-500">
                {language === 'zh' ? '已连接' : 'Connected'}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {enableAI && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInspirationDialog(true)}
                disabled={!isValidHexoProject || isLoading || !apiKey}
                title={t.getInspiration}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {t.getInspiration}
              </Button>
            )}
            <Button
              variant={mainView === 'posts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMainView('posts')}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t.articles}
            </Button>
            <Button
              variant={mainView === 'config' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMainView('config')}
              disabled={!isValidHexoProject}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t.hexoConfig}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('clean')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Terminal className="w-4 h-4 mr-2" />
              {t.clean}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('generate')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              {t.generate}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeHexoCommand('deploy')}
              disabled={!isValidHexoProject || isLoading}
            >
              <Globe className="w-4 h-4 mr-2" />
              {t.deploy}
            </Button>
            {enablePush && (
              <Button
                variant="outline"
                size="sm"
                onClick={pushToRemote}
                disabled={!isValidHexoProject || isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.push}
              </Button>
            )}
            <Button
              variant={isServerRunning ? "destructive" : "default"}
              size="sm"
              onClick={isServerRunning ? stopHexoServer : startHexoServer}
              disabled={!isValidHexoProject || isLoading}
            >
              {isServerRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  {t.stopServer}
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 mr-2" />
                  {t.startServer}
                </>
              )}
            </Button>

            {/* 语言切换按钮 */}
            <div className="border-l pl-2 ml-2 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Languages className="w-4 h-4 mr-1" />
                {language === 'zh' ? 'EN' : '中文'}
              </Button>

              {/* 主题切换按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                title={isDarkMode ? t.lightMode : t.darkMode}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* 侧边栏 */}
        {/* 左侧栏内容过多时，设置 overflow-y-auto，会在侧边栏内部滚动，而不会影响整个页面的大小 */}
        <aside className="w-80 border-r bg-background flex flex-col overflow-y-auto">
          {/* 项目选择 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                {t.hexoProject}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={hexoPath}
                  placeholder={t.selectHexoDirectory}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectHexoDirectory}
                  disabled={isLoading}
                >
                  {t.select}
                </Button>
                {hexoPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSavedPath}
                    disabled={isLoading}
                    title={t.clearSavedPath}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="flex space-x-2 mt-2">
                <CreateHexoDialog
                  onCreateSuccess={async (path) => {
                    const normalizedPath = normalizePath(path);
                    setHexoPath(normalizedPath);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('hexo-project-path', normalizedPath);
                    }
                    await validateHexoProject(normalizedPath);
                  }}
                  language={language}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    title="创建新的Hexo项目"
                    className="w-full"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t.createHexoProject}
                  </Button>
                </CreateHexoDialog>
              </div>

              {validationMessage && (
                <div className={`text-xs p-2 rounded ${
                  isValidHexoProject
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {validationMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文章列表按钮 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {t.articleList}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('posts');
                }}
                disabled={!isValidHexoProject || isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.viewArticleList}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  createNewPost();
                }}
                disabled={!isValidHexoProject || isLoading}
                title={t.createNewArticle}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.createNewArticle}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('statistics');
                }}
                disabled={!isValidHexoProject || isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.viewTagCloud}
              </Button>
            </CardContent>
          </Card>

          {/* 面板设置 */}
          <Card className="m-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                {t.panelSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('settings');
                }}
                disabled={isLoading}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.panelSettings}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPost(null);
                  setMainView('logs');
                }}
                disabled={isLoading}
              >
                <Terminal className="w-4 h-4 mr-2" />
                {t.viewLogs}
              </Button>
            </CardContent>
          </Card>


        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col">
          {mainView === 'statistics' ? (
            <div className="flex-1 p-6 overflow-auto">
              <TagCloud tags={allTagsForCloud} language={language} />
              <PublishStats 
                posts={posts} 
                language={language} 
                onStatsDataChange={setPublishStatsData} 
              />
              {enableAI && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                      {t.articleAnalysis}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' 
                          ? '使用AI分析您的博客数据，获得鼓励性的反馈和建议。' 
                          : 'Use AI to analyze your blog data and get encouraging feedback and suggestions.'}
                      </p>
                      <Button
                        onClick={() => setShowAnalysisDialog(true)}
                        disabled={!apiKey}
                        className="w-full"
                      >
                        {language === 'zh' ? '开始分析' : 'Start Analysis'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : mainView === 'settings' ? (
            <div className="flex-1 p-6 overflow-auto">
              <PanelSettings
                updateAvailable={updateAvailable}
                onUpdateCheck={() => checkForUpdates(false)}
                updateCheckInProgress={updateCheckInProgress}
                autoCheckUpdates={autoCheckUpdates}
                onAutoCheckUpdatesChange={handleAutoCheckUpdatesChange} 
              autoSaveInterval={autoSaveInterval}
              onAutoSaveIntervalChange={handleAutoSaveIntervalChange}

                postsPerPage={postsPerPage}
                onPostsPerPageChange={handlePostsPerPageChange}
                editorMode={editorMode}
                onEditorModeChange={setEditorMode}
                backgroundImage={backgroundImage}
                onBackgroundImageChange={setBackgroundImage}
                backgroundOpacity={backgroundOpacity}
                onBackgroundOpacityChange={setBackgroundOpacity}
                language={language}
                // 推送设置
                enablePush={enablePush}
                onEnablePushChange={setEnablePush}
                pushRepoUrl={pushRepoUrl}
                onPushRepoUrlChange={setPushRepoUrl}
                pushBranch={pushBranch}
                onPushBranchChange={setPushBranch}
                pushUsername={pushUsername}
                onPushUsernameChange={setPushUsername}
                pushEmail={pushEmail}
                onPushEmailChange={setPushEmail}
                // AI设置
                enableAI={enableAI}
                onEnableAIChange={setEnableAI}
                enableEditorAI={enableEditorAI}
                onEnableEditorAIChange={setEnableEditorAI}
                aiProvider={aiProvider}
                onAIProviderChange={setAIProvider}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                prompt={prompt}
                onPromptChange={setPrompt}
                analysisPrompt={analysisPrompt}
                onAnalysisPromptChange={setAnalysisPrompt}
                openaiModel={openaiModel}
                onOpenaiModelChange={setOpenaiModel}
                openaiApiEndpoint={openaiApiEndpoint}
                onOpenaiApiEndpointChange={setOpenaiApiEndpoint}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
                iframeUrlMode={iframeUrlMode}
                onIframeUrlModeChange={setIframeUrlMode}
              />
            </div>
          ) : mainView === 'logs' ? (
            <div className="flex-1 p-6 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    {t.operationLogs}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {commandLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t.noLogs}
                      </div>
                    ) : (
                      commandLogs.map((log, index) => (
                        <div key={index} className={`p-3 rounded-md border ${log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-black dark:text-black">{log.command}</div>
                            <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                          </div>
                          <div className={`text-sm ${log.success ? 'text-green-700' : 'text-red-700'}`}>
                            {log.success ? (
                              <div>
                                <div className="font-semibold">{t.commandExecutedSuccess}</div>
                                {log.stdout && (
                                  <div className="mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 p-2 rounded border font-mono text-xs whitespace-pre-wrap">
                                    {log.stdout}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold">{t.commandExecutedFailed}</div>
                                {log.error && (
                                  <div className="mt-1 text-red-800 dark:text-red-200 font-medium">
                                    {log.error}
                                  </div>
                                )}
                                {log.stderr && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">错误详情：</div>
                                    <div className="max-h-48 overflow-y-auto bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-300 dark:border-red-700 font-mono text-xs whitespace-pre-wrap">
                                      {/* 移除 ANSI 颜色代码 */}
                                      {log.stderr.replace(/\u001b\[[0-9;]*m/g, '')}
                                    </div>
                                  </div>
                                )}
                                {log.stdout && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">标准输出：</div>
                                    <div className="max-h-48 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded border font-mono text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                                      {/* 移除 ANSI 颜色代码 */}
                                      {log.stdout.replace(/\u001b\[[0-9;]*m/g, '')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {commandLogs.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCommandLogs([])}
                      >
                        {t.clearLogs}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : mainView === 'posts' ? (
            selectedPost ? (
              <div className="flex-1 flex flex-col">
                {/* 固定在顶部的编辑器控制栏 */}
                <div className="border-b bg-card p-3 flex flex-col space-y-2 sticky top-0 z-10">
                  {/* 文章标题栏 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-lg font-semibold">{selectedPost.name}</h2>
                      <Badge variant="outline">
                        {selectedPost.size} bytes
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isUsingExternalEditor ? (
                        // 外部编辑器模式：只显示重新加载按钮
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!selectedPost || !isElectron) return;

                            try {
                              if (isTauri()) {
                                const { invoke } = await import('@tauri-apps/api/core');
                                const content = await invoke('read_file', { filePath: selectedPost.path });
                                setPostContent(content as string);
                              } else {
                                const ipcRenderer = await getIpcRenderer();
                                const content = await ipcRenderer.invoke('read-file', selectedPost.path);
                                setPostContent(content);
                              }

                              setIsUsingExternalEditor(false);
                              toast({
                                title: t.contentReloaded,
                                description: t.contentReloadedDescription,
                              });
                            } catch (error) {
                              console.error('重新加载内容失败:', error);
                              toast({
                                title: t.reloadFailed,
                                description: error instanceof Error ? error.message : String(error),
                                variant: 'error',
                              });
                            }
                          }}
                          disabled={isLoading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t.reloadContent}
                        </Button>
                      ) : (
                        // 内部编辑器模式：显示所有按钮
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(null);
                            }}
                            disabled={isLoading}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {t.backToList}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!selectedPost || !isElectron) return;

                              try {
                                if (isTauri()) {
                                  // Tauri 环境
                                  const { invoke } = await import('@tauri-apps/api/core');
                                  await invoke('open_with', { filePath: selectedPost.path });
                                } else {
                                  // Electron 环境
                                  const ipcRenderer = await getIpcRenderer();
                                  await ipcRenderer.invoke('open-with', selectedPost.path);
                                }

                                // 设置为使用外部编辑器
                                setIsUsingExternalEditor(true);

                                // 提示用户
                                toast({
                                  title: t.externalEditorOpened,
                                  description: t.externalEditorDescription,
                                  duration: 5000,
                                });
                              } catch (error) {
                                console.error('打开文件失败:', error);
                                toast({
                                  title: '打开文件失败',
                                  description: error instanceof Error ? error.message : String(error),
                                  variant: 'error',
                                });
                              }
                            }}
                            disabled={isLoading}
                            title={t.openWithExternalEditor}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t.externalEditor}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={savePost}
                            disabled={isLoading}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t.saveArticle}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={deletePost}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.deleteArticle}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 编辑-预览转换栏和Markdown快捷语法栏 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="editor" className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            {t.edit}
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            {t.preview}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="flex items-center space-x-2 text-sm text-foreground">
                        <span className="text-xs bg-background border px-2 py-1 rounded">
                          {postContent.split('').length} 行
                        </span>
                      </div>
                    </div>

                    {/* Markdown快捷语法栏 */}
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = '# ';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="标题 1" className="h-8 w-8 p-0">
                        <Heading1 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = '## ';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="标题 2" className="h-8 w-8 p-0">
                        <Heading2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = '### ';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="标题 3" className="h-8 w-8 p-0">
                        <Heading3 className="w-4 h-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = postContent.substring(start, end);
                          const wrappedText = '**' + selectedText + '**';
                          const newValue = postContent.substring(0, start) + wrappedText + postContent.substring(end);
                          setPostContent(newValue);
                          setTimeout(() => {
                            if (selectedText.length === 0) {
                              const newPos = start + 2;
                              textarea.selectionStart = textarea.selectionEnd = newPos;
                            } else {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + wrappedText.length;
                            }
                            textarea.focus();
                          }, 0);
                        }
                      }} title="粗体" className="h-8 w-8 p-0">
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = postContent.substring(start, end);
                          const wrappedText = '*' + selectedText + '*';
                          const newValue = postContent.substring(0, start) + wrappedText + postContent.substring(end);
                          setPostContent(newValue);
                          setTimeout(() => {
                            if (selectedText.length === 0) {
                              const newPos = start + 1;
                              textarea.selectionStart = textarea.selectionEnd = newPos;
                            } else {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + wrappedText.length;
                            }
                            textarea.focus();
                          }, 0);
                        }
                      }} title="斜体" className="h-8 w-8 p-0">
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = postContent.substring(start, end);
                          const wrappedText = '`' + selectedText + '`';
                          const newValue = postContent.substring(0, start) + wrappedText + postContent.substring(end);
                          setPostContent(newValue);
                          setTimeout(() => {
                            if (selectedText.length === 0) {
                              const newPos = start + 1;
                              textarea.selectionStart = textarea.selectionEnd = newPos;
                            } else {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + wrappedText.length;
                            }
                            textarea.focus();
                          }, 0);
                        }
                      }} title="行内代码" className="h-8 w-8 p-0">
                        <Code className="w-4 h-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = ' - ';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="无序列表" className="h-8 w-8 p-0">
                        <List className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = ' 1. ';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="有序列表" className="h-8 w-8 p-0">
                        <ListOrdered className="w-4 h-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = postContent.substring(start, end);
                          const wrappedText = '[' + selectedText + '](url)';
                          const newValue = postContent.substring(0, start) + wrappedText + postContent.substring(end);
                          setPostContent(newValue);
                          setTimeout(() => {
                            if (selectedText.length === 0) {
                              const newPos = start + 1;
                              textarea.selectionStart = textarea.selectionEnd = newPos;
                            } else {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + wrappedText.length;
                            }
                            textarea.focus();
                          }, 0);
                        }
                      }} title="链接" className="h-8 w-8 p-0">
                        <Link className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = '![alt text](image-url)';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="图片" className="h-8 w-8 p-0">
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 单元格1 | 单元格2 | 单元格3 |
`;

                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="表格" className="h-8 w-8 p-0">
                        <Table className="w-4 h-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const selectedText = postContent.substring(textarea.selectionStart, textarea.selectionEnd) || 'code here';
                          const codeBlock = `\`\`\`js
${selectedText}
\`\`\`
`;
                          const newValue = postContent.substring(0, start) + codeBlock + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + codeBlock.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="代码块" className="h-8 w-8 p-0">
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = postContent.substring(start, end);
                          
                          // 如果没有选中文本，直接插入引用符号
                          if (!selectedText) {
                            const insertText = '> ';
                            const newValue = postContent.substring(0, start) + insertText + postContent.substring(end);
                            setPostContent(newValue);
                            setTimeout(() => {
                              textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                              textarea.focus();
                            }, 0);
                            return;
                          }
                          
                          // 如果有选中文本，为每行添加引用符号
                          const lines = selectedText.split('\n');
                          const quotedLines = lines.map(line => '> ' + line).join('\n');
                          const newValue = postContent.substring(0, start) + quotedLines + postContent.substring(end);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = start;
                            textarea.selectionEnd = start + quotedLines.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="引用" className="h-8 w-8 p-0">
                        <Quote className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const insertText = '---';
                          const newValue = postContent.substring(0, start) + insertText + postContent.substring(textarea.selectionEnd);
                          setPostContent(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
                            textarea.focus();
                          }, 0);
                        }
                      }} title="分割线" className="h-8 w-8 p-0">
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 编辑器区域 */}
                <div className="flex-1">
                  {isUsingExternalEditor ? (
                    // 使用外部编辑器时的提示信息
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="mb-4">
                        <ExternalLink className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{t.usingExternalEditor}</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        {t.externalEditorHint}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={async () => {
                            if (!selectedPost || !isElectron) return;

                            try {
                              if (isTauri()) {
                                const { invoke } = await import('@tauri-apps/api/core');
                                const content = await invoke('read_file', { filePath: selectedPost.path });
                                setPostContent(content as string);
                              } else {
                                const ipcRenderer = await getIpcRenderer();
                                const content = await ipcRenderer.invoke('read-file', selectedPost.path);
                                setPostContent(content);
                              }

                              setIsUsingExternalEditor(false);
                              toast({
                                title: t.contentReloaded,
                                description: t.contentReloadedDescription,
                              });
                            } catch (error) {
                              console.error('重新加载内容失败:', error);
                              toast({
                                title: t.reloadFailed,
                                description: error instanceof Error ? error.message : String(error),
                                variant: 'error',
                              });
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t.reloadContent}
                        </Button>

                      </div>
                    </div>
                  ) : editorMode === 'mode1' ? (
                    // 模式1：分离编辑和预览，需要手动切换
                    <>
                      {activeTab === 'editor' && (
                        <div className="h-full overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                          <MarkdownEditorWrapper
                            value={postContent}
                            onChange={setPostContent}
                            onSave={savePost}
                            isLoading={isLoading}
                            language={language}
                            hexoPath={hexoPath}
                            selectedPost={selectedPost}
                            posts={posts}
                            enableAI={enableEditorAI}
                            aiProvider={aiProvider}
                            apiKey={apiKey}
                            openaiModel={openaiModel}
                            openaiApiEndpoint={openaiApiEndpoint}
                          />
                        </div>
                      )}

                      {activeTab === 'preview' && (
                        <div className="h-full overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                          <MarkdownPreview
                            content={postContent}
                            className="p-6"
                            previewMode={previewMode}
                            hexoPath={hexoPath}
                            selectedPost={selectedPost}
                            isServerRunning={isServerRunning}
                            onStartServer={startHexoServer}
                            iframeUrlMode={iframeUrlMode}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    // 模式2：同时显示编辑和预览，左右分栏
                    <div className="h-full flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                      <div className="w-full md:w-1/2 h-1/2 md:h-full border-r overflow-hidden">
                        <div className="h-full overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                          <MarkdownEditorWrapper
                            value={postContent}
                            onChange={setPostContent}
                            onSave={savePost}
                            isLoading={isLoading}
                            language={language}
                            hexoPath={hexoPath}
                            selectedPost={selectedPost}
                            posts={posts}
                            enableAI={enableEditorAI}
                            aiProvider={aiProvider}
                            apiKey={apiKey}
                            openaiModel={openaiModel}
                            openaiApiEndpoint={openaiApiEndpoint}
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                        <MarkdownPreview
                          content={postContent}
                          className="p-4"
                          previewMode={previewMode}
                          hexoPath={hexoPath}
                          selectedPost={selectedPost}
                          isServerRunning={isServerRunning}
                          onStartServer={startHexoServer}
                          forceRefresh={forcePreviewRefresh}
                          onForceRefreshComplete={() => setForcePreviewRefresh(false)}
                          iframeUrlMode={iframeUrlMode}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* 文章列表头部 */}
                <div className="border-b p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t.articleList}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      createNewPost();
                    }}
                    disabled={!isValidHexoProject || isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createNewArticle}
                  </Button>
                </div>

                {/* 文章列表内容 */}
                <div className="flex-1 p-6 overflow-auto">
                  {isValidHexoProject ? (
                    <PostList
                      posts={filteredPosts}
                      selectedPost={selectedPost}
                      onPostSelect={(post) => {
                        selectPost(post);
                      }}
                      isLoading={isLoading}
                      onDeletePosts={deletePosts}
                      onAddTagsToPosts={addTagsToPosts}
                      onAddCategoriesToPosts={addCategoriesToPosts}
                      onDeletePost={deleteSinglePost}
                      onAddTagsToPost={addTagsToPost}
                      onAddCategoriesToPost={addCategoriesToPost}
                      availableTags={availableTags}
                      availableCategories={availableCategories}
                      onFilterByTag={filterByTag}
                      onFilterByCategory={filterByCategory}
                      onClearFilter={clearFilter}
                      currentFilter={currentFilter}
                      currentPage={currentPage}
                      postsPerPage={postsPerPage}
                      onPageChange={setCurrentPage}
                      language={language}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {t.selectProjectFirst}
                        </h3>
                        <p className="text-gray-500">
                          {t.clickSelectButton}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* 配置视图 */
            <div className="flex-1 p-6 overflow-auto">
              <HexoConfig
                hexoPath={hexoPath}
                onConfigUpdate={() => {
                  setCommandResult({
                    success: true,
                    stdout: '配置已更新'
                  });
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* 创建文章对话框 */}
      <CreatePostDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConfirm={handleCreatePostConfirm}
        isLoading={isLoading}
        availableTags={availableTags}
        availableCategories={availableCategories}
        hexoPath={hexoPath}
        language={language}
      />
      
      {/* 通知弹窗 */}
      <Toaster />

      {/* AI灵感对话框 */}
      <AIInspirationDialog
        open={showInspirationDialog}
        onOpenChange={setShowInspirationDialog}
        aiProvider={aiProvider}
        apiKey={apiKey}
        prompt={prompt}
        language={language}
        openaiModel={openaiModel}
        openaiApiEndpoint={openaiApiEndpoint}
      />

      {/* AI分析对话框 */}
      <AIAnalysisDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        aiProvider={aiProvider}
        apiKey={apiKey}
        analysisPrompt={analysisPrompt}
        language={language}
        tagsData={allTagsForCloud}
        publishStatsData={publishStatsData}
        openaiModel={openaiModel}
        openaiApiEndpoint={openaiApiEndpoint}
      />
      
    </div>
  );
}