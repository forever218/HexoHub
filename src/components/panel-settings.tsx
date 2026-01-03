
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Loader2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdateChecker } from '@/components/update-checker';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getTexts } from '@/utils/i18n';
import { isDesktopApp, getIpcRenderer, isTauri } from '@/lib/desktop-api';
import { openExternalLink, getAppVersion } from '@/lib/utils';
import { copySystemInfo } from '@/lib/system-info';

interface PanelSettingsProps {
  postsPerPage: number;
  onPostsPerPageChange: (value: number) => void;
  autoSaveInterval: number;
  onAutoSaveIntervalChange: (value: number) => void;
  updateAvailable?: boolean;
  onUpdateCheck?: () => void;
  updateCheckInProgress?: boolean;
  autoCheckUpdates?: boolean;
  onAutoCheckUpdatesChange?: (value: boolean) => void;
  editorMode: 'mode1' | 'mode2';
  onEditorModeChange: (mode: 'mode1' | 'mode2') => void;
  backgroundImage?: string;
  onBackgroundImageChange?: (value: string) => void;
  backgroundOpacity?: number;
  onBackgroundOpacityChange?: (value: number) => void;
  language: 'zh' | 'en';
  // 推送设置
  enablePush?: boolean;
  onEnablePushChange?: (value: boolean) => void;
  pushRepoUrl?: string;
  onPushRepoUrlChange?: (value: string) => void;
  pushBranch?: string;
  onPushBranchChange?: (value: string) => void;
  pushUsername?: string;
  onPushUsernameChange?: (value: string) => void;
  pushEmail?: string;
  onPushEmailChange?: (value: string) => void;
  // AI设置
  enableAI?: boolean;
  onEnableAIChange?: (value: boolean) => void;
  enableEditorAI?: boolean;
  onEnableEditorAIChange?: (value: boolean) => void;
  aiProvider?: 'deepseek' | 'openai' | 'siliconflow';
  onAIProviderChange?: (value: 'deepseek' | 'openai' | 'siliconflow') => void;
  apiKey?: string;
  onApiKeyChange?: (value: string) => void;
  prompt?: string;
  onPromptChange?: (value: string) => void;
  analysisPrompt?: string;
  onAnalysisPromptChange?: (value: string) => void;
  aiRewritePrompt?: string;
  onAiRewritePromptChange?: (value: string) => void;
  aiImprovePrompt?: string;
  onAiImprovePromptChange?: (value: string) => void;
  aiExpandPrompt?: string;
  onAiExpandPromptChange?: (value: string) => void;
  aiTranslatePrompt?: string;
  onAiTranslatePromptChange?: (value: string) => void;
  openaiModel?: string;
  onOpenaiModelChange?: (value: string) => void;
  openaiApiEndpoint?: string;
  onOpenaiApiEndpointChange?: (value: string) => void;
  // 预览模式设置
  previewMode?: 'static' | 'server';
  onPreviewModeChange?: (value: 'static' | 'server') => void;
  // iframe地址获取方式设置
  iframeUrlMode?: 'hexo' | 'root';
  onIframeUrlModeChange?: (value: 'hexo' | 'root') => void;
}

export function PanelSettings({ postsPerPage, onPostsPerPageChange, autoSaveInterval, onAutoSaveIntervalChange, updateAvailable, onUpdateCheck, updateCheckInProgress, autoCheckUpdates = true, onAutoCheckUpdatesChange, editorMode, onEditorModeChange, backgroundImage = '', onBackgroundImageChange, backgroundOpacity = 1, onBackgroundOpacityChange, language, enablePush = false, onEnablePushChange, pushRepoUrl = '', onPushRepoUrlChange, pushBranch = 'main', onPushBranchChange, pushUsername = '', onPushUsernameChange, pushEmail = '', onPushEmailChange, enableAI = false, onEnableAIChange, enableEditorAI = false, onEnableEditorAIChange, aiProvider = 'deepseek', onAIProviderChange, apiKey = '', onApiKeyChange, prompt = '你是一个灵感提示机器人，我是一个独立博客的博主，我想写一篇博客，请你给我一个可写内容的灵感，不要超过200字，不要分段', onPromptChange, analysisPrompt = '你是一个文章分析机器人，以下是我的博客数据{content}，请你分析并给出鼓励性的话语，不要超过200字，不要分段', onAnalysisPromptChange, aiRewritePrompt = '请直接重写以下文本，使其更清晰流畅，保持原意。只输出改写后的文本，不要添加任何解释或说明', onAiRewritePromptChange, aiImprovePrompt = '请直接改进以下文本，使其更专业、生动。只输出改进后的文本，不要添加任何解释或说明', onAiImprovePromptChange, aiExpandPrompt = '请扩展以下文本，适当添加细节。只输出扩展后的文本，不要添加解释或标注', onAiExpandPromptChange, aiTranslatePrompt = '请直接将以下文本翻译成英文。只输出翻译结果，不要添加任何解释或说明', onAiTranslatePromptChange, openaiModel = 'gpt-3.5-turbo', onOpenaiModelChange, openaiApiEndpoint = 'https://api.openai.com/v1', onOpenaiApiEndpointChange, previewMode = 'static', onPreviewModeChange, iframeUrlMode = 'hexo', onIframeUrlModeChange }: PanelSettingsProps) {
  // 当前应用版本，从package.json动态获取
  const [currentVersion, setCurrentVersion] = useState<string>('Unknown');
  // 获取当前语言的文本
  const t = getTexts(language);
  // 检查是否为暗色模式
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // 检查系统主题
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const htmlElement = document.documentElement;
        setIsDarkMode(htmlElement.classList.contains('dark') || darkModePreference);
      }
    };
    
    checkDarkMode();
    
    // 监听主题变化
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => observer.disconnect();
    }
  }, []);
  const [tempPostsPerPage, setTempPostsPerPage] = useState<number>(postsPerPage);
  const [tempAutoSaveInterval, setTempAutoSaveInterval] = useState<number>(autoSaveInterval);
  const [tempEditorMode, setTempEditorMode] = useState<'mode1' | 'mode2'>(editorMode);
  const [tempBackgroundImage, setTempBackgroundImage] = useState<string>(backgroundImage);
  const [tempBackgroundOpacity, setTempBackgroundOpacity] = useState<number>(backgroundOpacity);
  const [showWarningToast, setShowWarningToast] = useState<boolean>(false);
  // 推送设置相关状态
  const [tempEnablePush, setTempEnablePush] = useState<boolean>(enablePush);
  const [tempPushRepoUrl, setTempPushRepoUrl] = useState<string>(pushRepoUrl);
  const [tempPushBranch, setTempPushBranch] = useState<string>(pushBranch);
  const [tempPushUsername, setTempPushUsername] = useState<string>(pushUsername);
  const [tempPushEmail, setTempPushEmail] = useState<string>(pushEmail);
  // AI设置相关状态
  const [tempEnableAI, setTempEnableAI] = useState<boolean>(enableAI);
  const [tempEnableEditorAI, setTempEnableEditorAI] = useState<boolean>(enableEditorAI);
  const [tempAIProvider, setTempAIProvider] = useState<'deepseek' | 'openai' | 'siliconflow'>(aiProvider);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [tempPrompt, setTempPrompt] = useState<string>(prompt);
  const [tempAnalysisPrompt, setTempAnalysisPrompt] = useState<string>('你是一个文章分析机器人，以下是我的博客数据{content}，请你分析并给出鼓励性的话语，不要超过200字，不要分段');
  const [tempOpenaiModel, setTempOpenaiModel] = useState<string>(openaiModel);
  const [tempOpenaiApiEndpoint, setTempOpenaiApiEndpoint] = useState<string>(openaiApiEndpoint);
  // 硅基流动模型列表
  const [siliconflowModels, setSiliconflowModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  // 预览模式相关状态
  const [tempPreviewMode, setTempPreviewMode] = useState<'static' | 'server'>(previewMode);
  const [tempIframeUrlMode, setTempIframeUrlMode] = useState<'hexo' | 'root'>(iframeUrlMode);
  // API测试相关状态
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const { toast } = useToast();

  // 获取应用版本号
  useEffect(() => {
    getAppVersion().then(version => {
      setCurrentVersion(version);
    });
  }, []);

  // 当传入的postsPerPage变化时，更新临时值
  useEffect(() => {
    setTempPostsPerPage(postsPerPage);
  }, [postsPerPage]);
  
  // 当传入的iframeUrlMode变化时，更新临时值
  useEffect(() => {
    setTempIframeUrlMode(iframeUrlMode);
  }, [iframeUrlMode]);

  // 当传入的autoSaveInterval变化时，更新临时值
  useEffect(() => {
    setTempAutoSaveInterval(autoSaveInterval);
  }, [autoSaveInterval]);

  // 当传入的editorMode变化时，更新临时值
  useEffect(() => {
    setTempEditorMode(editorMode);
  }, [editorMode]);

  // 当传入的backgroundImage变化时，更新临时值
  useEffect(() => {
    setTempBackgroundImage(backgroundImage);
  }, [backgroundImage]);

  // 当传入的backgroundOpacity变化时，更新临时值
  useEffect(() => {
    setTempBackgroundOpacity(backgroundOpacity);
  }, [backgroundOpacity]);

  // 当传入的enablePush变化时，更新临时值
  useEffect(() => {
    setTempEnablePush(enablePush);
  }, [enablePush]);

  // 当传入的pushRepoUrl变化时，更新临时值
  useEffect(() => {
    setTempPushRepoUrl(pushRepoUrl);
  }, [pushRepoUrl]);

  // 当传入的pushBranch变化时，更新临时值
  useEffect(() => {
    setTempPushBranch(pushBranch);
  }, [pushBranch]);

  // 当传入的pushUsername变化时，更新临时值
  useEffect(() => {
    setTempPushUsername(pushUsername);
  }, [pushUsername]);

  // 当传入的pushEmail变化时，更新临时值
  useEffect(() => {
    setTempPushEmail(pushEmail);
  }, [pushEmail]);

  // 当传入的enableAI变化时，更新临时值
  useEffect(() => {
    setTempEnableAI(enableAI);
  }, [enableAI]);

  // 当传入的aiProvider变化时，更新临时值
  useEffect(() => {
    setTempAIProvider(aiProvider);
  }, [aiProvider]);

  // 当传入的apiKey变化时，更新临时值
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  // 当传入的prompt变化时，更新临时值
  useEffect(() => {
    setTempPrompt(prompt);
  }, [prompt]);

  // 当传入的analysisPrompt变化时，更新临时值
  useEffect(() => {
    if (analysisPrompt) {
      setTempAnalysisPrompt(analysisPrompt);
    }
  }, [analysisPrompt]);

  // 当传入的openaiModel变化时，更新临时值
  useEffect(() => {
    setTempOpenaiModel(openaiModel);
  }, [openaiModel]);

  // 当传入的openaiApiEndpoint变化时，更新临时值
  useEffect(() => {
    setTempOpenaiApiEndpoint(openaiApiEndpoint);
  }, [openaiApiEndpoint]);

  // 当传入的previewMode变化时，更新临时值
  useEffect(() => {
    setTempPreviewMode(previewMode);
  }, [previewMode]);

  // 加载硅基流动模型列表
  const loadSiliconFlowModels = async (apiKeyToUse?: string) => {
    const keyToUse = apiKeyToUse || tempApiKey;
    if (!keyToUse) {
      toast({
        title: t.error,
        description: language === 'zh' ? '请先输入API密钥' : 'Please enter API key first',
        variant: 'error',
      });
      return;
    }

    setIsLoadingModels(true);
    try {
      const apiUrl = 'https://api.siliconflow.cn/v1/models?type=text&sub_type=chat';
      
      let response;
      if (isTauri()) {
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
        response = await tauriFetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${keyToUse}`
          }
        });
      } else {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${keyToUse}`
          }
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const modelIds = data.data.map((model: any) => model.id);
        setSiliconflowModels(modelIds);
        
        // 如果还没有选择模型，默认选择第一个
        if (!tempOpenaiModel && modelIds.length > 0) {
          setTempOpenaiModel(modelIds[0]);
        }
        
        toast({
          title: t.success,
          description: `${t.modelsLoaded} ${modelIds.length} ${language === 'zh' ? '个模型' : 'models'}`,
          variant: 'success',
        });
      }
    } catch (error: any) {
      console.error('Failed to load SiliconFlow models:', error);
      toast({
        title: t.error,
        description: error.message || t.modelsLoadFailed,
        variant: 'error',
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  // 测试API连接
  const testAPIConnection = async () => {
    if (!tempApiKey) {
      toast({
        title: t.error,
        description: language === 'zh' ? '请先输入API密钥' : 'Please enter API key first',
        variant: 'error',
      });
      return;
    }

    setIsTesting(true);
    try {
      // 根据提供商选择API端点和模型
      let apiUrl: string;
      let model: string;
      
      if (tempAIProvider === 'deepseek') {
        apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        model = 'deepseek-chat';
      } else if (tempAIProvider === 'siliconflow') {
        apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
        model = tempOpenaiModel || 'Qwen/Qwen2.5-7B-Instruct';
      } else {
        apiUrl = `${tempOpenaiApiEndpoint || 'https://api.openai.com/v1'}/chat/completions`;
        model = tempOpenaiModel || 'gpt-3.5-turbo';
      }

      // 调用AI API测试连接
      let response;
      if (isTauri()) {
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
        response = await tauriFetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tempApiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 5
          })
        });
      } else {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tempApiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 5
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        toast({
          title: t.success,
          description: t.testSuccess,
          variant: 'success',
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error: any) {
      console.error('API connection test failed:', error);
      toast({
        title: t.testFailed,
        description: error.message || (language === 'zh' ? '请检查API密钥和配置是否正确' : 'Please check if API key and configuration are correct'),
        variant: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 保存设置
  const saveSettings = () => {
    if (tempPostsPerPage < 1 || tempPostsPerPage > 100) {
      toast({
        title: t.error,
        description: t.postsPerPageRangeError || '每页显示文章数量必须在1-100之间',
        variant: 'error',
      });
      return;
    }

    if (tempAutoSaveInterval < 1 || tempAutoSaveInterval > 60) {
      toast({
        title: t.error,
        description: t.autoSaveIntervalRangeError,
        variant: 'error',
      });
      return;
    }

    onPostsPerPageChange(tempPostsPerPage);
    onAutoSaveIntervalChange(tempAutoSaveInterval);
    onEditorModeChange(tempEditorMode);
    if (onBackgroundImageChange) onBackgroundImageChange(tempBackgroundImage);
    if (onBackgroundOpacityChange) onBackgroundOpacityChange(tempBackgroundOpacity);
    // 保存推送设置
    if (onEnablePushChange) onEnablePushChange(tempEnablePush);
    if (onPushRepoUrlChange) onPushRepoUrlChange(tempPushRepoUrl);
    if (onPushBranchChange) onPushBranchChange(tempPushBranch);
    if (onPushUsernameChange) onPushUsernameChange(tempPushUsername);
    if (onPushEmailChange) onPushEmailChange(tempPushEmail);
    // 保存AI设置
    if (onEnableAIChange) onEnableAIChange(tempEnableAI);
    if (onEnableEditorAIChange) onEnableEditorAIChange(tempEnableEditorAI);
    if (onAIProviderChange) onAIProviderChange(tempAIProvider);
    if (onApiKeyChange) onApiKeyChange(tempApiKey);
    if (onPromptChange) onPromptChange(tempPrompt);
    if (onAnalysisPromptChange) onAnalysisPromptChange(tempAnalysisPrompt);
    if (onOpenaiModelChange) onOpenaiModelChange(tempOpenaiModel);
    if (onOpenaiApiEndpointChange) onOpenaiApiEndpointChange(tempOpenaiApiEndpoint);
    // 保存预览模式设置
    if (onPreviewModeChange) onPreviewModeChange(tempPreviewMode);
    // 保存iframe地址获取方式设置
    if (onIframeUrlModeChange) onIframeUrlModeChange(tempIframeUrlMode);

    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('posts-per-page', tempPostsPerPage.toString());
      localStorage.setItem('auto-save-interval', tempAutoSaveInterval.toString());
      localStorage.setItem('editor-mode', tempEditorMode);
      localStorage.setItem('background-image', tempBackgroundImage);
      localStorage.setItem('background-opacity', tempBackgroundOpacity.toString());
      // 保存推送设置
      localStorage.setItem('enable-push', tempEnablePush.toString());
      localStorage.setItem('push-repo-url', tempPushRepoUrl);
      localStorage.setItem('push-branch', tempPushBranch);
      localStorage.setItem('push-username', tempPushUsername);
      localStorage.setItem('push-email', tempPushEmail);
      // 保存AI设置
      localStorage.setItem('enable-ai', tempEnableAI.toString());
      localStorage.setItem('enable-editor-ai', tempEnableEditorAI.toString());
      localStorage.setItem('ai-provider', tempAIProvider);
      localStorage.setItem('api-key', tempApiKey);
      localStorage.setItem('prompt', tempPrompt);
      localStorage.setItem('analysis-prompt', tempAnalysisPrompt);
      localStorage.setItem('openai-model', tempOpenaiModel);
      localStorage.setItem('openai-api-endpoint', tempOpenaiApiEndpoint);
      // 保存预览模式设置
      localStorage.setItem('preview-mode', tempPreviewMode);
      // 保存iframe地址获取方式设置
      localStorage.setItem('iframe-url-mode', tempIframeUrlMode);
    }

    toast({
      title: t.success,
      description: t.settingsSaved,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {t.panelSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postsPerPage">{t.postsPerPage}</Label>
              <Input
                id="postsPerPage"
                type="number"
                min="1"
                max="100"
                value={tempPostsPerPage}
                onChange={(e) => setTempPostsPerPage(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                {t.postsPerPageDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">{t.autoSaveInterval}</Label>
              <Input
                id="autoSaveInterval"
                type="number"
                min="1"
                max="60"
                value={tempAutoSaveInterval}
                onChange={(e) => setTempAutoSaveInterval(e.target.value === "" ? 3 : Number(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                {t.autoSaveIntervalDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.editorMode}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mode1"
                    name="editorMode"
                    value="mode1"
                    checked={tempEditorMode === 'mode1'}
                    onChange={() => setTempEditorMode('mode1')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="mode1">{t.mode1}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mode2"
                    name="editorMode"
                    value="mode2"
                    checked={tempEditorMode === 'mode2'}
                    onChange={() => setTempEditorMode('mode2')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="mode2">{t.mode2}</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.modeDescription}
              </p>
            </div>

                      {/* 预览模式设置 */}
          <div className="space-y-2">
            <Label>{t.previewMode}</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="static"
                  name="previewMode"
                  value="static"
                  checked={tempPreviewMode === 'static'}
                  onChange={() => setTempPreviewMode('static')}
                  className="w-4 h-4"
                />
                <Label htmlFor="static">{t.staticPreview}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="server"
                  name="previewMode"
                  value="server"
                  checked={tempPreviewMode === 'server'}
                  onChange={() => setTempPreviewMode('server')}
                  className="w-4 h-4"
                />
                <Label htmlFor="server">{t.serverPreview}</Label>
              </div>
            </div>
            
            {/* 当预览模式为服务器时，显示iframe地址获取方式选项 */}
            {tempPreviewMode === 'server' && (
              <div className="mt-4 space-y-2">
                <Label className="text-base font-medium">iframe地址获取方式</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="hexo"
                    name="iframeUrlMode"
                    value="hexo"
                    checked={tempIframeUrlMode === 'hexo'}
                    onChange={() => setTempIframeUrlMode('hexo')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="hexo">Hexo标准地址</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="root"
                    name="iframeUrlMode"
                    value="root"
                    checked={tempIframeUrlMode === 'root'}
                    onChange={() => setTempIframeUrlMode('root')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="root">根地址</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  默认为“Hexo标准地址”，如果渲染失败请选择“根地址”
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              {t.previewModeDescription}
            </p>
          </div>

            <div className="space-y-2">
              <Label>{t.backgroundSettings}</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">{t.backgroundImageUrl}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="backgroundImage"
                      type="text"
                      value={tempBackgroundImage}
                      onChange={(e) => setTempBackgroundImage(e.target.value)}
                      placeholder={t.backgroundImageDescription}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (isDesktopApp()) {
                          const ipcRenderer = await getIpcRenderer();
                          ipcRenderer.invoke('select-file').then((filePath: string) => {
                            if (filePath) {
                              // 直接保存文件路径，不转换为base64
                              // 转换会在实际使用时自动进行
                              setTempBackgroundImage(filePath);
                            }
                          });
                        } else {
                          // 在浏览器环境中使用文件选择
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setTempBackgroundImage(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }
                      }}
                    >
                      {t.selectImage}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempBackgroundImage('');
                      }}
                    >
                      {t.clear}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.backgroundImageDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundOpacity">{t.backgroundOpacity} ({Math.round(tempBackgroundOpacity * 100)}%)</Label>
                  <div className="relative w-full">
                    <Input
                      id="backgroundOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={tempBackgroundOpacity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setTempBackgroundOpacity(value);
                      }}
                      className="w-full"
                      style={{
                        background: `linear-gradient(to right, 
                          #ef4444 0%, 
                          #ef4444 30%, 
                          ${tempBackgroundOpacity >= 0.3 ? "#3b82f6" : "#ef4444"} 30%, 
                          ${tempBackgroundOpacity >= 0.3 ? "#3b82f6" : "#ef4444"} 100%)
                        `
                      }}
                    />
                    <div 

                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.backgroundOpacityDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* 推送设置 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enablePush"
                  checked={tempEnablePush}
                  onChange={(e) => setTempEnablePush(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="enablePush">{t.enablePush || '启用推送'}</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.enablePushDescription || '启用后可以将Hexo项目推送到远程Git仓库'}
              </p>

              {tempEnablePush && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="pushRepoUrl">{t.pushRepoUrl || '仓库地址'}</Label>
                    <Input
                      id="pushRepoUrl"
                      type="text"
                      value={tempPushRepoUrl}
                      onChange={(e) => setTempPushRepoUrl(e.target.value)}
                      placeholder={t.pushRepoUrlPlaceholder || '例如: https://github.com/username/repo.git'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushBranch">{t.pushBranch || '分支名称'}</Label>
                    <Input
                      id="pushBranch"
                      type="text"
                      value={tempPushBranch}
                      onChange={(e) => setTempPushBranch(e.target.value)}
                      placeholder={t.pushBranchPlaceholder || '例如: main'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushUsername">{t.pushUsername || '用户名'}</Label>
                    <Input
                      id="pushUsername"
                      type="text"
                      value={tempPushUsername}
                      onChange={(e) => setTempPushUsername(e.target.value)}
                      placeholder={t.pushUsernamePlaceholder || 'Git用户名'}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pushEmail">{t.pushEmail || '邮箱'}</Label>
                    <Input
                      id="pushEmail"
                      type="email"
                      value={tempPushEmail}
                      onChange={(e) => setTempPushEmail(e.target.value)}
                      placeholder={t.pushEmailPlaceholder || 'Git邮箱'}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI设置 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableAI"
                checked={tempEnableAI}
                onChange={(e) => setTempEnableAI(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="enableAI">{t.enableAI}</Label>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground mr-2">
                {t.enableAIDescription}
              </p>
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  await openExternalLink('https://2am.top/2025/09/13/Hexohub%E5%BC%80%E5%8F%91%E6%97%A5%E5%BF%972/#AI%E5%8A%9F%E8%83%BD');
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {t.aboutAILink}
              </a>
            </div>

            {/* 编辑器AI增强 */}
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="enableEditorAI"
                checked={tempEnableEditorAI}
                onChange={(e) => setTempEnableEditorAI(e.target.checked)}
                className="w-4 h-4"
                disabled={!tempEnableAI}
              />
              <Label htmlFor="enableEditorAI" className={!tempEnableAI ? 'text-muted-foreground' : ''}>
                {t.enableEditorAI}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.enableEditorAIDescription}
            </p>

            {tempEnableAI && (
              <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">{t.aiProvider}</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="deepseek"
                        name="aiProvider"
                        value="deepseek"
                        checked={tempAIProvider === 'deepseek'}
                        onChange={() => setTempAIProvider('deepseek')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="deepseek">DeepSeek</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="openai"
                        name="aiProvider"
                        value="openai"
                        checked={tempAIProvider === 'openai'}
                        onChange={() => setTempAIProvider('openai')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="openai">OpenAI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="siliconflow"
                        name="aiProvider"
                        value="siliconflow"
                        checked={tempAIProvider === 'siliconflow'}
                        onChange={() => setTempAIProvider('siliconflow')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="siliconflow" className="flex items-center gap-1">
                        {t.siliconflow}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault();
                                await openExternalLink('https://siliconflow.cn');
                              }}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent 
                            className="w-[280px] !bg-slate-900 !text-white !border-slate-700 !px-3 !py-2.5 [&_svg]:!bg-slate-900 [&_svg]:!fill-slate-900"
                            sideOffset={5}
                          >
                            <p className="text-xs leading-relaxed text-justify">{t.siliconflowTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.aiProviderDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t.apiKey}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder={t.apiKeyPlaceholder}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testAPIConnection}
                      disabled={isTesting || !tempApiKey}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.testing}
                        </>
                      ) : (
                        t.testConnection
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' 
                      ? '点击"测试连接"按钮验证API配置是否正确'
                      : 'Click "Test Connection" button to verify API configuration'
                    }
                  </p>
                </div>

                {tempAIProvider === 'siliconflow' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="siliconflowModel">{t.siliconflowModel}</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSiliconFlowModels()}
                          disabled={isLoadingModels || !tempApiKey}
                        >
                          {isLoadingModels ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t.loadingModels}
                            </>
                          ) : (
                            t.loadModels
                          )}
                        </Button>
                      </div>
                      {siliconflowModels.length > 0 ? (
                        <select
                          id="siliconflowModel"
                          value={tempOpenaiModel}
                          onChange={(e) => setTempOpenaiModel(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                          }`}
                        >
                          {siliconflowModels.map((model) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="siliconflowModel"
                          type="text"
                          value={tempOpenaiModel}
                          onChange={(e) => setTempOpenaiModel(e.target.value)}
                          placeholder={t.siliconflowModelPlaceholder}
                          className="w-full"
                        />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {t.loadModelsDescription}
                      </p>
                    </div>
                  </>
                )}

                {tempAIProvider === 'openai' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="openaiModel">{t.openaiModel}</Label>
                      <Input
                        id="openaiModel"
                        type="text"
                        value={tempOpenaiModel}
                        onChange={(e) => setTempOpenaiModel(e.target.value)}
                        placeholder={t.openaiModelPlaceholder}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openaiApiEndpoint">{t.openaiApiEndpoint}</Label>
                      <Input
                        id="openaiApiEndpoint"
                        type="text"
                        value={tempOpenaiApiEndpoint}
                        onChange={(e) => setTempOpenaiApiEndpoint(e.target.value)}
                        placeholder={t.openaiApiEndpointPlaceholder}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' 
                          ? '支持OpenAI兼容的API端点，留空使用默认值'
                          : 'Supports OpenAI-compatible API endpoints, leave blank to use default'
                        }
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="prompt">{t.prompt}</Label>
                  <Textarea
                    id="prompt"
                    value={tempPrompt}
                    onChange={(e) => setTempPrompt(e.target.value)}
                    placeholder={t.promptPlaceholder}
                    className="w-full"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysisPrompt">{t.analysisPrompt}</Label>
                  <Textarea
                    id="analysisPrompt"
                    value={tempAnalysisPrompt}
                    onChange={(e) => setTempAnalysisPrompt(e.target.value)}
                    placeholder={t.analysisPromptPlaceholder}
                    className="w-full"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' 
                      ? '此提示词用于分析博客数据，{"{content}"}将被替换为实际数据'
                      : 'This prompt is used to analyze blog data, {"{content}"} will be replaced with actual data'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>



          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" />
              {t.saveSettings}
            </Button>
          </div>
        </CardContent>
      </Card>
      
            {/* 更新检查模块 */}
      <UpdateChecker 
        currentVersion={currentVersion}
        repoOwner="forever218"
        repoName="HexoHub"
        autoCheckUpdates={autoCheckUpdates}
        onAutoCheckUpdatesChange={onAutoCheckUpdatesChange}
        language={language}
      />

      {/* 关于模块 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {t.about}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.versionInfo}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const success = await copySystemInfo(language);
                  toast({
                    title: success ? t.success : t.error,
                    description: success 
                      ? (language === 'zh' ? '系统信息已复制到剪贴板' : 'System information copied to clipboard')
                      : (language === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again'),
                    variant: success ? 'success' : 'error',
                  });
                }}
              >
                {language === 'zh' ? '复制系统信息' : 'Copy System Info'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">HexoHub v{currentVersion}</p>
          </div>
          
          <div className="space-y-2">
            <Label>{t.projectAddress}</Label>
            <a 
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                await openExternalLink('https://github.com/forever218/HexoHub');
              }} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
            >
              https://github.com/forever218/HexoHub
            </a>
          </div>
          
          <div className="space-y-2">
            <Label>{t.contactMe}</Label>
            <a 
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                await openExternalLink('https://github.com/forever218');
              }} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
            >
              https://github.com/forever218
            </a>
          </div>
          
          <div className="pt-4 text-center text-muted-foreground">
            {t.supportMessage}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
