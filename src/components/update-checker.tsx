
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTexts } from '@/utils/i18n';
import { isDesktopApp, getDesktopEnvironment, isTauri } from '@/lib/desktop-api';
import { openExternalLink } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

interface UpdateCheckerProps {
  currentVersion: string;
  repoOwner: string;
  repoName: string;
  autoCheckUpdates?: boolean;
  onAutoCheckUpdatesChange?: (value: boolean) => void;
  language: 'zh' | 'en';
}

export function UpdateChecker({ currentVersion, repoOwner, repoName, autoCheckUpdates = true, onAutoCheckUpdatesChange, language }: UpdateCheckerProps) {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('browser');
  const { toast } = useToast();
  // 获取当前语言的文本
  const t = getTexts(language);

  // 从localStorage加载上次检查时间和自动更新设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 获取当前平台
      const env = getDesktopEnvironment();
      setPlatform(env);
      
      const savedLastChecked = localStorage.getItem('last-update-check');
      if (savedLastChecked) {
        setLastChecked(savedLastChecked);
      }
      
      const savedAutoCheckUpdates = localStorage.getItem('auto-check-updates');
      if (savedAutoCheckUpdates !== null) {
        const autoCheck = savedAutoCheckUpdates === 'true';
        if (onAutoCheckUpdatesChange && autoCheck !== autoCheckUpdates) {
          onAutoCheckUpdatesChange(autoCheck);
        }
      }
    }
  }, []);

  // 检查更新
  const checkForUpdates = async () => {
    setIsLoading(true);
    try {
      // 在 Tauri 环境下使用 Tauri HTTP 插件，在浏览器环境使用原生 fetch
      let response;
      if (isTauri()) {
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
        response = await tauriFetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        });
      } else {
        response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
      }
      
      if (!response.ok) {
        throw new Error(t.checkUpdateFailed);
      }

      const release: GitHubRelease = await response.json();
      setLatestRelease(release);

      // 保存检查时间
      const now = new Date().toISOString();
      setLastChecked(now);
      if (typeof window !== 'undefined') {
        localStorage.setItem('last-update-check', now);
      }

      // 比较版本号
      const isUpdateAvailable = compareVersions(currentVersion, release.tag_name);
      setUpdateAvailable(isUpdateAvailable);

      if (isUpdateAvailable) {
        toast({
          title: t.newVersionFound,
          description: t.newVersionDescription.replace('{version}', release.tag_name),
          variant: 'default',
        });
      } else {
        toast({
          title: t.alreadyLatest,
          description: t.alreadyLatestDescription.replace('{version}', currentVersion),
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      toast({
        title: t.checkUpdateFailed,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理自动更新设置变化
  const handleAutoCheckChange = (checked: boolean) => {
    if (onAutoCheckUpdatesChange) {
      onAutoCheckUpdatesChange(checked);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auto-check-updates', checked.toString());
    }
  };

  // 比较版本号
  const compareVersions = (current: string, latest: string): boolean => {
    // 移除'v'前缀并分割版本号
    const currentVersion = current.replace(/^v/i, '').split('.').map(Number);
    const latestVersion = latest.replace(/^v/i, '').split('.').map(Number);

    // 确保版本号格式正确
    if (currentVersion.some(isNaN) || latestVersion.some(isNaN)) {
      return false;
    }

    // 比较主版本号、次版本号和修订号
    for (let i = 0; i < Math.max(currentVersion.length, latestVersion.length); i++) {
      const currentPart = currentVersion[i] || 0;
      const latestPart = latestVersion[i] || 0;

      if (latestPart > currentPart) {
        return true;
      } else if (latestPart < currentPart) {
        return false;
      }
    }

    return false;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576 * 10) / 10 + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.updateCheck}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkForUpdates}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t.checkForUpdates}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 自动检查更新开关 */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">{t.autoCheckUpdates}</div>
            <p className="text-sm text-muted-foreground">
              {t.autoCheckUpdatesDescription}
            </p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${autoCheckUpdates ? 'bg-green-500' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={autoCheckUpdates}
            onClick={() => handleAutoCheckChange(!autoCheckUpdates)}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoCheckUpdates ? 'translate-x-5' : 'translate-x-0'}`}
            />
            <span className="sr-only">{t.toggleAutoCheckUpdates || t.autoCheckUpdates}</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span>{t.currentVersion}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentVersion}</Badge>
            {platform !== 'browser' && (
              <Badge variant="secondary" className="capitalize">
                {platform}
              </Badge>
            )}
          </div>
        </div>

        {lastChecked && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t.lastCheckTime}</span>
            <span>{new Date(lastChecked).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</span>
          </div>
        )}

        {latestRelease && (
          <>
            <div className="flex items-center justify-between">
              <span>{t.latestVersion}</span>
              <div className="flex items-center gap-2">
                <Badge variant={updateAvailable ? "default" : "secondary"}>
                  {latestRelease.tag_name}
                </Badge>
                {updateAvailable ? (
                  <Badge variant="default" className="bg-green-600">
                    {t.newVersionAvailable}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {t.upToDate}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {t.publishTime} {formatDate(latestRelease.published_at)}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t.updateContent}</h4>
              <div className="text-sm bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          className="!rounded-md !text-xs !my-3 !bg-background/80"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono font-semibold" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1({ children }: any) {
                      return <h1 className="text-lg font-bold mt-4 mb-2 text-foreground border-b pb-2">{children}</h1>;
                    },
                    h2({ children }: any) {
                      return <h2 className="text-base font-bold mt-3 mb-2 text-foreground">{children}</h2>;
                    },
                    h3({ children }: any) {
                      return <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>;
                    },
                    p({ children }: any) {
                      return <p className="mb-2 leading-relaxed text-foreground/90">{children}</p>;
                    },
                    ul({ children }: any) {
                      return <ul className="mb-2 ml-5 list-disc space-y-1.5 marker:text-primary">{children}</ul>;
                    },
                    ol({ children }: any) {
                      return <ol className="mb-2 ml-5 list-decimal space-y-1.5 marker:text-primary marker:font-semibold">{children}</ol>;
                    },
                    li({ children }: any) {
                      return <li className="leading-relaxed text-foreground/90 pl-1">{children}</li>;
                    },
                    blockquote({ children }: any) {
                      return (
                        <blockquote className="border-l-3 border-primary/50 bg-primary/5 pl-4 py-2 my-3 italic text-foreground/80">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ children, href }: any) {
                      return (
                        <a 
                          href={href} 
                          className="text-primary font-semibold hover:text-primary/80 underline decoration-2 underline-offset-2 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      );
                    },
                    img({ src, alt }: any) {
                      return (
                        <div className="my-4">
                          <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full h-auto rounded-lg border border-border shadow-md"
                          />
                        </div>
                      );
                    },
                    strong({ children }: any) {
                      return <strong className="font-bold text-foreground">{children}</strong>;
                    },
                    em({ children }: any) {
                      return <em className="italic text-foreground/90">{children}</em>;
                    },
                    hr() {
                      return <hr className="my-4 border-border" />;
                    },
                  }}
                >
                  {latestRelease.body}
                </ReactMarkdown>
              </div>
            </div>

            {updateAvailable && latestRelease.assets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">{t.downloadLinks}</h4>
                <div className="space-y-2">
                  {latestRelease.assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(asset.size)}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            await openExternalLink(asset.browser_download_url);
                          } catch (error) {
                            console.error('下载失败:', error);
                            toast({
                              title: t.downloadFailed || "下载失败",
                              description: error instanceof Error ? error.message : t.unknownError,
                              variant: "error",
                            });
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t.download}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async (e) => {
                  e.preventDefault();
                  await openExternalLink(latestRelease.html_url);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.viewOnGitHub}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
