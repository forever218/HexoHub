'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getTexts, Language } from '@/utils/i18n';
import { isDesktopApp } from '@/lib/desktop-api';
import { copyFileInElectron, writeFileFromBufferInElectron, ensureDirectoryExistsInElectron } from '@/lib/electron-image-api';
import { EditorContextMenu } from '@/components/editor-context-menu';
import { writeClipboardText, readClipboardText } from '@/lib/clipboard';
import {
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
  Minus
} from 'lucide-react';

interface Post {
  name: string;
  path: string;
  modifiedTime?: Date;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  isLoading?: boolean;
  language?: 'zh' | 'en';
  hexoPath?: string;
  selectedPost?: Post | null;
  posts?: Post[];
  // AI 配置
  enableAI?: boolean;
  aiProvider?: 'deepseek' | 'openai' | 'siliconflow';
  apiKey?: string;
  openaiModel?: string;
  openaiApiEndpoint?: string;
}

export function MarkdownEditorElectron({ 
  value, 
  onChange, 
  onSave, 
  isLoading = false, 
  language = 'zh', 
  hexoPath, 
  selectedPost,
  posts,
  enableAI = false,
  aiProvider = 'deepseek',
  apiKey = '',
  openaiModel = 'gpt-3.5-turbo',
  openaiApiEndpoint = 'https://api.openai.com/v1'
}: MarkdownEditorProps) {
  const [lineNumbers, setLineNumbers] = useState<string[]>(['1']);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const t = getTexts(language as Language);

  // 检查并提示启用 post_asset_folder
  const checkAndEnableAssetFolder = async () => {
    if (!hexoPath) return true;

    try {
      const { getIpcRenderer } = await import('@/lib/desktop-api');
      const ipcRenderer = await getIpcRenderer();
      const configPath = `${hexoPath}/_config.yml`;
      const content = await ipcRenderer.invoke('read-file', configPath);

      // 检查 post_asset_folder 是否为 false
      if (/post_asset_folder:\s*false/i.test(content)) {
        const confirmed = window.confirm(
          `${t.assetFolderDisabledWarning}\n\n${t.assetFolderDisabledConfirm}`
        );

        if (confirmed) {
          // 修改配置
          const newContent = content.replace(
            /post_asset_folder:\s*false/i,
            'post_asset_folder: true'
          );

          await ipcRenderer.invoke('write-file', configPath, newContent);

          alert(
            `${t.assetFolderEnabledSuccess}\n\n${t.assetFolderEnabledNextSteps}`
          );

          return true;
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error('[MarkdownEditor] 检查配置失败:', error);
      return true; // 检查失败时继续操作
    }
  };

  const insertTextAtCursor = (insertText: string, selectionStart?: number, selectionEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const wrapSelectedText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const wrappedText = prefix + selectedText + (suffix || prefix);

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      if (selectedText.length === 0) {
        const newPos = start + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        textarea.setSelectionRange(start, start + wrappedText.length);
      }
      textarea.focus();
    }, 0);
  };

  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleCode = () => wrapSelectedText('`');
  const handleCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const selectedText = value.substring(textarea.selectionStart, textarea.selectionEnd) || 'code here';
    const codeBlock = `
\`\`\`javascript
${selectedText}
\`\`\`
`;
    insertTextAtCursor(codeBlock, start, textarea.selectionEnd);
  };

  const handleQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const selectedText = value.substring(textarea.selectionStart, textarea.selectionEnd);
    const lines = selectedText.split('\n');
    const quotedLines = lines.map(line => '> ' + line).join('\n');
    const newValue = value.substring(0, start) + quotedLines + value.substring(textarea.selectionEnd);
    onChange(newValue);
  };

  const handleUnorderedList = () => insertTextAtCursor('\n- ');
  const handleOrderedList = () => insertTextAtCursor('\n1. ');
  const handleLink = () => wrapSelectedText('[', '](url)');
  const handleImage = () => insertTextAtCursor('![alt text](image-url)');
  const handleTable = () => {
    const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n';
    insertTextAtCursor(table);
  };
  const handleHeading1 = () => insertTextAtCursor('\n# ');
  const handleHeading2 = () => insertTextAtCursor('\n## ');
  const handleHeading3 = () => insertTextAtCursor('\n### ');
  const handleHorizontalRule = () => insertTextAtCursor('\n---\n');

  useEffect(() => {
    const lines = value.split('\n');
    setLineNumbers(lines.map((_, index) => (index + 1).toString()));
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersElement = document.getElementById('line-numbers');
    if (lineNumbersElement) {
      lineNumbersElement.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
    }
  };

  // 处理文本选择
  const handleTextareaSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    setSelectedText(selected);
  };

  // 处理 AI 重写后的文本替换
  const handleRewrite = (rewrittenText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + rewrittenText + value.substring(end);
    onChange(newValue);

    // 设置光标位置到重写文本的末尾
    setTimeout(() => {
      const newCursorPos = start + rewrittenText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 复制功能
  const handleCopy = async () => {
    if (!selectedText) return;
    
    try {
      // 使用统一的剪贴板工具（自动选择最优 API）
      await writeClipboardText(selectedText);
      // 恢复焦点
      const textarea = textareaRef.current;
      if (textarea) {
        setTimeout(() => textarea.focus(), 0);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 剪切功能
  const handleCut = async () => {
    if (!selectedText) return;
    
    try {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // 写入剪贴板
      await writeClipboardText(selectedText);
      
      // 删除选中的文本
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + value.substring(end);
      onChange(newValue);
      
      // 设置光标位置
      setTimeout(() => {
        textarea.setSelectionRange(start, start);
        textarea.focus();
      }, 0);
    } catch (error) {
      console.error('Failed to cut:', error);
    }
  };

  // 粘贴功能
  const handlePaste = async () => {
    try {
      // 使用统一的剪贴板工具读取内容
      const text = await readClipboardText();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        const newPos = start + text.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  // 全选功能
  const handleSelectAll = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(0, value.length);
  };

  // Markdown 格式化功能
  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        cursorOffset = selectedText ? newText.length - 4 : 1;
        break;
      case 'ul':
        newText = `\n- ${selectedText}`;
        cursorOffset = newText.length;
        break;
      case 'ol':
        newText = `\n1. ${selectedText}`;
        cursorOffset = newText.length;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  // 检测是否为 Electron 环境
  const isElectronEnv = typeof window !== 'undefined' && 'require' in window;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    console.log('[MarkdownEditor] dragEnter 事件触发');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    console.log('[MarkdownEditor] dragLeave 事件触发');
  };

  const insertImageAtCursor = (fileName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const imageTag = `{% asset_img ${fileName} "图片描述" %}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + imageTag + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + imageTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    console.log('[MarkdownEditor] HTML5 drop 事件触发');
    console.log('[MarkdownEditor] dataTransfer.files:', e.dataTransfer.files);
    console.log('[MarkdownEditor] hexoPath:', hexoPath);
    console.log('[MarkdownEditor] selectedPost:', selectedPost);

    const files = Array.from(e.dataTransfer.files);
    console.log('[MarkdownEditor] 拖入的文件:', files.map(f => ({ name: f.name, path: (f as any).path })));

    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)
    );

    console.log('[MarkdownEditor] 过滤后的图片文件:', imageFiles);

    if (imageFiles.length > 0) {
      // Electron 环境：可以从 File 对象获取路径
      if (hexoPath && selectedPost) {
        // 检查并提示启用 post_asset_folder
        const canProceed = await checkAndEnableAssetFolder();
        if (!canProceed) {
          console.log('[MarkdownEditor] 用户取消启用 post_asset_folder');
          return;
        }

        const postNameWithoutExt = selectedPost.name.replace(/\.(md|markdown)$/i, '');
        const assetFolderPath = `${hexoPath}/source/_posts/${postNameWithoutExt}`;

        console.log('[MarkdownEditor] 资源文件夹路径:', assetFolderPath);

        // 确保资源文件夹存在
        try {
          await ensureDirectoryExistsInElectron(assetFolderPath);
          console.log('[MarkdownEditor] 资源文件夹已确保存在');
        } catch (error) {
          console.error('[MarkdownEditor] 创建资源文件夹失败:', error);
        }

        for (let index = 0; index < imageFiles.length; index++) {
          const file = imageFiles[index];

          // 在 Electron 中，尝试获取文件路径
          let filePath = (file as any).path;

          // 如果无法直接获取路径，尝试通过其他方式获取
          if (!filePath) {
            try {
              // 尝试通过 HTML5 File API 获取文件内容并写入
              const fileContent = await file.arrayBuffer();
              const destinationPath = `${assetFolderPath}/${file.name}`;

              await writeFileFromBufferInElectron(destinationPath, new Uint8Array(fileContent));
              console.log(`[MarkdownEditor] 文件已写入到: ${destinationPath}`);

              // 插入标签
              setTimeout(() => {
                insertImageAtCursor(file.name);
              }, index * 50);

              continue; // 跳过下面的处理
            } catch (error) {
              console.error('[MarkdownEditor] 通过文件内容写入失败:', error);
            }
          }

          // 如果有文件路径，直接复制
          if (filePath) {
            try {
              const destinationPath = `${assetFolderPath}/${file.name}`;

              await copyFileInElectron(filePath, destinationPath);
              console.log(`[MarkdownEditor] 文件已复制到: ${destinationPath}`);
            } catch (error) {
              console.error('[MarkdownEditor] 复制文件失败:', error);
              alert(`复制文件失败: ${error}`);
            }
          }

          // 插入标签
          setTimeout(() => {
            insertImageAtCursor(file.name);
          }, index * 50);
        }
      } else {
        // 只插入文件名
        imageFiles.forEach((file, index) => {
          setTimeout(() => {
            insertImageAtCursor(file.name);
          }, index * 50);
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex-1 flex relative" style={{ minWidth: 0, maxWidth: '100%', height: 'calc(100vh - 200px)' }}>
        <div
          id="line-numbers"
          className="w-12 bg-background border-r text-muted-foreground text-sm font-mono text-right pr-2 pt-2 select-none overflow-hidden flex-shrink-0"
        >
          {lineNumbers.map((lineNumber, index) => (
            <div key={index} className="leading-6">
              {lineNumber}
            </div>
          ))}
        </div>

        <div
          ref={dropAreaRef}
          className={`flex-1 relative min-w-0 overflow-hidden \${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <EditorContextMenu
            selectedText={selectedText}
            onRewrite={handleRewrite}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            onSelectAll={handleSelectAll}
            onFormat={handleFormat}
            aiProvider={aiProvider}
            apiKey={apiKey}
            language={language}
            openaiModel={openaiModel}
            openaiApiEndpoint={openaiApiEndpoint}
            enableAI={enableAI}
            posts={posts || []}
            hexoPath={hexoPath}
            currentContent={value}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextareaChange}
              onScroll={handleTextareaScroll}
              onSelect={handleTextareaSelect}
              placeholder={t.editorPlaceholder}
              className="w-full h-full p-2 font-mono text-sm resize-none border-0 rounded-none focus:ring-0 overflow-x-auto"
              disabled={isLoading}
              style={{
                minHeight: '400px',
                lineHeight: '1.5',
                outline: 'none',
                width: '100%',
                minWidth: 0,
                overflow: 'auto',
                wordBreak: 'break-all',
                height: 'calc(100vh - 200px)'
              }}
            />
          </EditorContextMenu>
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-blue-600 text-lg font-medium">
                {t.dragImageHint}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
