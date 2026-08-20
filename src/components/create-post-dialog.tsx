import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown, HelpCircle, Plus } from 'lucide-react';
import { Language, getTexts } from '@/utils/i18n';
import { isDesktopApp, getIpcRenderer } from '@/lib/desktop-api';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
    template?: string;
    customFields?: Record<string, string>;
  }) => void;
  isLoading?: boolean;
  availableTags?: string[];
  availableCategories?: string[];
  hexoPath?: string;
  language?: Language;
}

export function CreatePostDialog({ open, onOpenChange, onConfirm, isLoading = false, availableTags = [], availableCategories = [], hexoPath = '', language = 'zh' }: CreatePostDialogProps) {
  const texts = getTexts(language);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('post');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [customFields, setCustomFields] = useState<{key: string; defaultValue: string}[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [enableUserCustomFields, setEnableUserCustomFields] = useState(false);
  const [userCustomFields, setUserCustomFields] = useState<{key: string; value: string; persist: boolean}[]>([]);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleSelectExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories([...categories, trimmedCategory]);
      setCategoryInput('');
    }
  };

  const handleSelectExistingCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
    setShowCategoryDropdown(false);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCategoryInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      alert(texts.pleaseEnterArticleTitle);
      return;
    }

    // Collect non-empty custom field values from template fields
    const allCustomFields: Record<string, string> = {};
    Object.entries(customFieldValues).forEach(([key, value]) => {
      if (value.trim()) {
        allCustomFields[key] = value.trim();
      }
    });

    // Merge user-defined custom fields (override template fields on conflict)
    if (enableUserCustomFields) {
      userCustomFields.forEach(f => {
        if (f.key.trim() && f.value.trim()) {
          allCustomFields[f.key.trim()] = f.value.trim();
        }
      });
    }

    onConfirm({
      title: title.trim(),
      tags,
      categories,
      excerpt: excerpt.trim() || undefined,
      template: useCustomTemplate ? selectedTemplate : undefined,
      customFields: Object.keys(allCustomFields).length > 0 ? allCustomFields : undefined
    });

    // Save persisted custom fields to localStorage
    if (enableUserCustomFields) {
      const toPersist = userCustomFields
        .filter(f => f.persist && f.key.trim() && f.value.trim())
        .map(f => ({ key: f.key.trim(), value: f.value.trim() }));
      localStorage.setItem('persisted-custom-frontmatter', JSON.stringify(toPersist));
    } else {
      localStorage.removeItem('persisted-custom-frontmatter');
    }

    // 重置表单
    setTitle('');
    setTags([]);
    setCategories([]);
    setExcerpt('');
    setTagInput('');
    setCategoryInput('');
    setUseCustomTemplate(false);
    setSelectedTemplate('post');
    setCustomFieldValues({});
    setEnableUserCustomFields(false);
    setUserCustomFields([]);
  };

  // Built-in fields that are already handled by dedicated inputs
  const BUILTIN_FIELDS = ['title', 'date', 'tags', 'categories', 'excerpt'];

  // Parse front matter from template content to extract custom fields
  const parseTemplateFields = (content: string) => {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return [];

    const frontMatter = frontMatterMatch[1];
    const fields: {key: string; defaultValue: string}[] = [];

    const lines = frontMatter.split('\n');
    for (const line of lines) {
      // Match simple key: value pairs (skip list items like "  - xxx")
      const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2].trim();
        if (!BUILTIN_FIELDS.includes(key)) {
          fields.push({ key, defaultValue: value });
        }
      }
    }
    return fields;
  };

  // Load template content and extract custom fields
  const loadTemplateFields = async (templateName: string) => {
    if (!hexoPath || !isDesktopApp()) return;

    try {
      const ipcRenderer = await getIpcRenderer();
      const templatePath = `${hexoPath}/scaffolds/${templateName}.md`;
      const content = await ipcRenderer.invoke('read-file', templatePath);
      if (content) {
        const fields = parseTemplateFields(content);
        setCustomFields(fields);
        // Initialize custom field values with defaults
        const defaults: Record<string, string> = {};
        fields.forEach(f => {
          // Don't use template placeholders like {{ title }} as defaults
          if (f.defaultValue && !f.defaultValue.match(/\{\{.*\}\}/)) {
            defaults[f.key] = f.defaultValue;
          } else {
            defaults[f.key] = '';
          }
        });
        setCustomFieldValues(defaults);
      }
    } catch (error) {
      console.error('读取模板内容失败:', error);
    }
  };

  // 获取可用模板
  useEffect(() => {
    const loadTemplates = async () => {
      if (!hexoPath || !isDesktopApp()) return;
      
      try {
        const ipcRenderer = await getIpcRenderer();
        const scaffoldsPath = `${hexoPath}/scaffolds`;
        const files = await ipcRenderer.invoke('list-files', scaffoldsPath);
        
        if (files && files.length > 0) {
          const templates = files
            .filter((file: any) => file.name.endsWith('.md'))
            .map((file: any) => file.name.replace(/\.md$/, ''));
          
          setAvailableTemplates(templates);
          
          // 默认选择第一个模板，如果存在的话
          if (templates.length > 0) {
            setSelectedTemplate(templates[0]);
          }
        }
      } catch (error) {
        console.error('获取模板列表失败:', error);
      }
    };
    
    if (open && hexoPath) {
      loadTemplates();
    }
  }, [open, hexoPath]);

  // Load custom fields from the selected template (default: post)
  useEffect(() => {
    if (open && hexoPath) {
      const templateToLoad = useCustomTemplate ? selectedTemplate : 'post';
      loadTemplateFields(templateToLoad);
    }
  }, [open, hexoPath, useCustomTemplate, selectedTemplate]);

  // Load persisted custom front-matter fields from localStorage
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('persisted-custom-frontmatter');
        if (stored) {
          const persisted: {key: string; value: string}[] = JSON.parse(stored);
          if (persisted.length > 0) {
            setEnableUserCustomFields(true);
            setUserCustomFields(persisted.map(f => ({ key: f.key, value: f.value, persist: true })));
          }
        }
      } catch (e) {
        console.error('读取持久化自定义字段失败:', e);
      }
    }
  }, [open]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCancel = () => {
    // 重置表单
    setTitle('');
    setTags([]);
    setCategories([]);
    setExcerpt('');
    setTagInput('');
    setCategoryInput('');
    setUseCustomTemplate(false);
    setSelectedTemplate('post');
    setCustomFieldValues({});
    setEnableUserCustomFields(false);
    setUserCustomFields([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{texts.createNewArticle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文章标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">{texts.articleTitle} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={texts.pleaseEnterArticleTitle || "请输入文章标题"}
              disabled={isLoading}
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>{texts.tags}</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1" ref={tagDropdownRef}>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder={texts.pleaseEnterTags}
                  disabled={isLoading}
                  className="flex-1"
                  onFocus={() => setShowTagDropdown(true)}
                />
                {availableTags.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-0 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-0">
                    {showTagDropdown && availableTags
                      .map(tag => (
                        <div
                          key={tag}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 dark:text-white dark:hover:bg-gray-700"
                          onClick={() => handleSelectExistingTag(tag)}
                        >
                          {tag}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                disabled={isLoading || availableTags.length === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={isLoading || !tagInput.trim()}
              >
                {texts.add}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label>{texts.categories}</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1" ref={categoryDropdownRef}>
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleCategoryInputKeyPress}
                  placeholder={texts.pleaseEnterCategories}
                  disabled={isLoading}
                  className="flex-1"
                  onFocus={() => setShowCategoryDropdown(true)}
                />
                {availableCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-0 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-0">
                    {showCategoryDropdown && availableCategories
                      .map(category => (
                        <div
                          key={category}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 dark:text-white dark:hover:bg-gray-700"
                          onClick={() => handleSelectExistingCategory(category)}
                        >
                          {category}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={isLoading || availableCategories.length === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={isLoading || !categoryInput.trim()}
              >
                {texts.add}
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Badge key={category} variant="outline" className="flex items-center gap-1">
                    {category}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setCategories(categories.filter(c => c !== category))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 摘要 */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">{texts.excerpt}（{texts.optional || "可选"}）</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={texts.pleaseEnterExcerpt}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* 自定义字段 (from scaffolds template) */}
          {customFields.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {language === 'zh' ? '模板自定义字段' : 'Template Custom Fields'}
              </Label>
              {customFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`custom-${field.key}`} className="text-sm">{field.key}</Label>
                  <Input
                    id={`custom-${field.key}`}
                    value={customFieldValues[field.key] || ''}
                    onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.defaultValue || `${language === 'zh' ? '请输入' : 'Enter'} ${field.key}`}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 模板选项 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-custom-template"
                checked={useCustomTemplate}
                onCheckedChange={(checked) => setUseCustomTemplate(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor="use-custom-template">{texts.useCustomTemplate || "使用自定义模板"}</Label>
              <button
                type="button"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                onClick={async () => {
                  if (isDesktopApp()) {
                    const ipcRenderer = await getIpcRenderer();
                    await ipcRenderer.invoke('open-url', 'https://hexo.io/docs/writing.html');
                  } else {
                    window.open('https://hexo.io/docs/writing.html', '_blank');
                  }
                }}
                title={texts.learnMoreAboutTemplates || "了解更多关于模板的信息"}
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            
            {useCustomTemplate && (
              <div className="space-y-2 mt-2">
                <Label>{texts.selectTemplate || "选择模板"}</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1" ref={templateDropdownRef}>
                    <Input
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      placeholder={texts.selectTemplate || "选择模板"}
                      disabled={isLoading}
                      className="flex-1"
                      onFocus={() => setShowTemplateDropdown(true)}
                      readOnly
                    />
                    {availableTemplates.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-0 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-0">
                        {showTemplateDropdown && availableTemplates
                          .map(template => (
                            <div
                              key={template}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 dark:text-white dark:hover:bg-gray-700"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowTemplateDropdown(false);
                              }}
                            >
                              {template}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    disabled={isLoading || availableTemplates.length === 0}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 自定义 Front-Matter 字段 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-user-custom-fields"
                checked={enableUserCustomFields}
                onCheckedChange={(checked) => {
                  setEnableUserCustomFields(!!checked);
                  if (!checked) {
                    setUserCustomFields([]);
                  }
                }}
                disabled={isLoading}
              />
              <Label htmlFor="enable-user-custom-fields">{texts.customFrontMatter}</Label>
            </div>

            {enableUserCustomFields && (
              <div className="space-y-3 ml-6">
                {userCustomFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={field.key}
                      onChange={(e) => {
                        const newFields = [...userCustomFields];
                        newFields[index] = { ...newFields[index], key: e.target.value };
                        setUserCustomFields(newFields);
                      }}
                      placeholder={texts.fieldName}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...userCustomFields];
                        newFields[index] = { ...newFields[index], value: e.target.value };
                        setUserCustomFields(newFields);
                      }}
                      placeholder={texts.fieldValue}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <Checkbox
                        id={`persist-field-${index}`}
                        checked={field.persist}
                        onCheckedChange={(checked) => {
                          const newFields = [...userCustomFields];
                          newFields[index] = { ...newFields[index], persist: !!checked };
                          setUserCustomFields(newFields);
                        }}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`persist-field-${index}`} className="text-xs whitespace-nowrap">{texts.persistField}</Label>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => {
                        setUserCustomFields(userCustomFields.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUserCustomFields([...userCustomFields, { key: '', value: '', persist: false }]);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {texts.addCustomField}
                </Button>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  * {texts.persistFieldHint}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {texts.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? texts.creating : texts.createArticle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}