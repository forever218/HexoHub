// 国际化配置
export type Language = 'zh' | 'en';

export interface I18nTexts {
  // 通用
  loading: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  create: string;
  clear: string;
  select: string;
  error: string;
  success: string;
  cleanCacheSuccess: string;
  generateStaticFilesSuccess: string;
  deploySuccess: string;
  articleCreateSuccess: string;
  articleSaveSuccess: string;
  articleDeleteSuccess: string;
  articlesDeleteSuccess: string;
  tagsAddSuccess: string;
  categoriesAddSuccess: string;
  configSaveSuccess: string;
  configImportSuccess: string;
  optional: string;
  creating: string;
  createArticle: string;
  postsPerPageRangeError: string;
  autoSaveIntervalRangeError: string;
  settingsSaved: string;

  // 项目管理
  hexoProject: string;
  selectHexoDirectory: string;
  clearSavedPath: string;
  validHexoProject: string;
  invalidHexoProject: string;

  // 文章管理
  articles: string;
  articleList: string;
  viewArticleList: string;
  createNewArticle: string;
  articleEditor: string;
  preview: string;

  // 文章统计
  articleStatistics: string;
  tagCloud: string;
  viewTagCloud: string;

  // 编辑器
  markdownEditor: string;
  lines: string;
  supportMarkdownSyntax: string;
  saving: string;
  dragImageHint: string;

  // 占位符文本
  editorPlaceholder: string;

  // 配置
  hexoConfig: string;
  exportConfig: string;
  importConfig: string;
  resetConfig: string;
  saveConfig: string;
  basicSettings: string;
  advancedSettings: string;
  websiteTitle: string;
  subtitle: string;
  author: string;
  language: string;
  timezone: string;
  theme: string;
  websiteDescription: string;
  websiteUrl: string;
  websiteRoot: string;
  permalinkFormat: string;
  rawConfig: string;
  yamlConfig: string;

  // 命令
  commands: string;
  generate: string;
  deploy: string;
  server: string;
  clean: string;
  startServer: string;
  stopServer: string;
  executing: string;
  commandExecuting: string;
  commandExecuteSuccess: string;
  commandExecuteFailed: string;
  startingServer: string;
  stoppingServer: string;

  // 状态
  serverRunning: string;
  serverStopped: string;

  // 消息
  selectValidHexoProject: string;
  onlyAvailableInDesktop: string;
  selectDirectoryFailed: string;
  validateProjectFailed: string;
  loadArticlesFailed: string;
  createArticleFailed: string;
  saveArticleFailed: string;
  deleteArticleFailed: string;

  // 文章创建
  articleTitle: string;
  tags: string;
  categories: string;
  excerpt: string;
  addTag: string;
  addCategory: string;
  pleaseEnterArticleTitle: string;
  pleaseEnterTags: string;
  pleaseEnterCategories: string;
  pleaseEnterExcerpt: string;

  // 操作按钮
  saveArticle: string;
  deleteArticle: string;
  viewInBrowser: string;

  // 编辑器提示文本
  selectArticleToEdit: string;
  selectProjectFirst: string;
  selectFromListOrCreate: string;
  clickSelectButton: string;

  // 主题切换
  lightMode: string;
  darkMode: string;
  toggleTheme: string;

  // 面板设置
  panelSettings: string;
  postsPerPage: string;
  postsPerPageDescription: string;
  autoSaveInterval: string;
  autoSaveIntervalDescription: string;
  editorMode: string;
  mode1: string;
  mode2: string;
  modeDescription: string;
  backgroundSettings: string;
  backgroundImageUrl: string;
  selectImage: string;
  clear: string;
  backgroundImageDescription: string;
  backgroundOpacity: string;
  backgroundOpacityDescription: string;
  saveSettings: string;
  about: string;
  versionInfo: string;
  projectAddress: string;
  contactMe: string;
  supportMessage: string;
  stopWarning: string;
  disappearWarning: string;

  // 更新检查
  updateCheck: string;
  checkForUpdates: string;
  autoCheckUpdates: string;
  autoCheckUpdatesDescription: string;
  toggleAutoCheckUpdates: string;
  currentVersion: string;
  lastCheckTime: string;
  latestVersion: string;
  newVersionAvailable: string;
  upToDate: string;
  publishTime: string;
  updateContent: string;
  downloadLinks: string;
  download: string;
  viewOnGitHub: string;
  newVersionFound: string;
  newVersionDescription: string;
  alreadyLatest: string;
  alreadyLatestDescription: string;
  checkUpdateFailed: string;
  unknownError: string;

  // 工具栏
  selected: string;
  selectAll: string;
  deselectAll: string;
  addTags: string;
  addCategories: string;
  totalArticles: string;
  filterByTagCategory: string;
  filterByTag: string;
  filterByCategory: string;
  clearFilter: string;
  sortByFileName: string;
  sortByModifiedTime: string;
  ascending: string;
  descending: string;
  previousPage: string;
  nextPage: string;

  // 日志记录
  viewLogs: string;
  operationLogs: string;
  noLogs: string;
  clearLogs: string;
  commandExecutedSuccess: string;
  commandExecutedFailed: string;

  // 对话框
  confirmDelete: string;
  deleteConfirmMessage: string;
  deleteConfirmMessageSingle: string;
  addTagsDialogTitle: string;
  addTagsDialogDescription: string;
  addTagsDialogDescriptionSingle: string;
  addCategoriesDialogTitle: string;
  addCategoriesDialogDescription: string;
  addCategoriesDialogDescriptionSingle: string;
  tagsPlaceholder: string;
  categoriesPlaceholder: string;
  operationIrreversible: string;
  add: string;

  // 推送设置
  enablePush: string;
  enablePushDescription: string;
  pushRepoUrl: string;
  pushRepoUrlPlaceholder: string;
  pushBranch: string;
  pushBranchPlaceholder: string;
  pushUsername: string;
  pushUsernamePlaceholder: string;
  pushEmail: string;
  pushEmailPlaceholder: string;
  push: string;
  pushSuccess: string;
  pushFailed: string;
  pushing: string;

  // AI设置
  enableAI: string;
  enableAIDescription: string;
  aiProvider: string;
  aiProviderDescription: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  prompt: string;
  promptPlaceholder: string;
  analysisPrompt: string;
  analysisPromptPlaceholder: string;
  
  // 预览模式设置
  previewMode: string;
  previewModeDescription: string;
  staticPreview: string;
  serverPreview: string;
  inspiration: string;
  generatingInspiration: string;
  getInspiration: string;
  aiInspiration: string;
  aiInspirationDescription: string;
  articleAnalysis: string;
  startAnalysis: string;

  // 创建Hexo项目
  createHexoProject: string;
  createHexoProjectDescription: string;
  checkingEnvironment: string;
  hexoProjectLocation: string;
  selectDirectory: string;
  projectFolderName: string;
  useTaobaoMirror: string;
  useTaobaoMirrorRecommended: string;
  installDeployPlugin: string;
  installDeployPluginDescription: string;
  installationProgress: string;
  commandOutput: string;
  cancel: string;
  close: string;
  creating: string;
  createProject: string;
  hexoAlreadyInstalled: string;
  hexoNotInstalled: string;
  installNpmAndGitFirst: string;
  settingTaobaoMirror: string;
  taobaoMirrorSetSuccess: string;
  installingHexoCli: string;
  hexoCliInstallSuccess: string;
  creatingHexoProject: string;
  hexoProjectCreatedSuccess: string;
  dependenciesInstalled: string;
  installingDeployPlugin: string;
  deployPluginInstallSuccess: string;
  hexoProjectCreationComplete: string;
  createSuccess: string;
  hexoProjectCreatedSuccessfully: string;
  createFailed: string;
  missingDependency: string;
  pleaseInstallNpm: string;
  pleaseInstallGit: string;
  selectDirectoryFailed: string;
  unknownError: string;
  checkingNpm: string;
  npmInstalled: string;
  npmNotInstalled: string;
  checkingGit: string;
  gitInstalled: string;
  gitNotInstalled: string;
  checkingHexo: string;
  hexoInstalled: string;
  hexoNotInstalled: string;
  environmentCheckFailed: string;

  // 插件管理
  plugins: string;
  themes: string;
  pluginManager: string;
  installedPlugins: string;
  installedThemes: string;
  activeTheme: string;
  installPlugin: string;
  uninstallPlugin: string;
  installingPlugin: string;
  uninstallingPlugin: string;
  pluginNamePlaceholder: string;
  refresh: string;
  noPlugins: string;
  noThemes: string;
  pluginInstallSuccess: string;
  pluginUninstallSuccess: string;
  pluginInstallFailed: string;
  pluginUninstallFailed: string;
}

export const i18nTexts: Record<Language, I18nTexts> = {
  zh: {
    // 通用
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    clear: '清除',
    select: '选择',
    error: '错误',
    success: '成功',
    cleanCacheSuccess: '清理缓存成功',
    generateStaticFilesSuccess: '生成静态文件成功',
    deploySuccess: '部署成功',
    articleCreateSuccess: '文章创建成功',
    articleSaveSuccess: '文章保存成功',
    articleDeleteSuccess: '文章删除成功',
    articlesDeleteSuccess: '成功删除 {count} 篇文章',
    tagsAddSuccess: '成功为 {successCount}/{totalCount} 篇文章添加标签',
    categoriesAddSuccess: '成功为 {successCount}/{totalCount} 篇文章添加分类',
    configSaveSuccess: '配置保存成功',
    configImportSuccess: '配置导入成功，请点击保存',
    optional: '可选',
    creating: '创建中...',
    createArticle: '创建文章',
    postsPerPageRangeError: '每页显示文章数量必须在1-100之间',
    autoSaveIntervalRangeError: '自动保存间隔必须在1-60分钟之间',
    settingsSaved: '设置已保存',

    // 项目管理
    hexoProject: 'Hexo项目',
    selectHexoDirectory: '选择Hexo项目目录',
    clearSavedPath: '清除保存的路径',
    validHexoProject: '有效的Hexo项目',
    invalidHexoProject: '不是有效的Hexo项目目录',

    // 文章管理
    articles: '文章',
    articleList: '文章列表',
    viewArticleList: '文章列表',
    createNewArticle: '创建新文章',
    articleEditor: '文章编辑器',
    preview: '预览',

    // 文章统计
    articleStatistics: '文章统计',
    tagCloud: '文章统计',
    viewTagCloud: '文章统计',

    // 编辑器
    markdownEditor: 'Markdown 编辑器',
    lines: '行',
    supportMarkdownSyntax: '支持标准 Markdown 语法',
    saving: '保存中...',
    dragImageHint: '拖放图片文件到此处插入 Hexo 图片标签',

    // 占位符文本
    editorPlaceholder: `# 标题

开始编写您的文章内容...

## Markdown 语法提示

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

### 列表
1. 有序列表项
2. 另一个项目

- 无序列表项
- 另一个项目

### 链接和图片
[链接文本](https://example.com)

![图片描述](image.jpg)

### 代码块
\`\`\`javascript
console.log('Hello, Hexo!');
\`\`\`

### 引用
> 这是一个引用块

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |`,

    // 配置
    hexoConfig: 'Hexo 配置',
    exportConfig: '导出',
    importConfig: '导入',
    resetConfig: '重置',
    saveConfig: '保存',
    basicSettings: '基本设置',
    advancedSettings: '高级设置',
    websiteTitle: '网站标题',
    subtitle: '副标题',
    author: '作者',
    language: '语言',
    timezone: '时区',
    theme: '主题',
    websiteDescription: '网站描述',
    websiteUrl: '网站 URL',
    websiteRoot: '网站根目录',
    permalinkFormat: '文章永久链接格式',
    rawConfig: '原始配置 (YAML)',
    yamlConfig: 'YAML 配置内容',

    // 命令
    commands: '命令',
    generate: '生成',
    deploy: '部署',
    server: '服务器',
    clean: '清理',
    startServer: '启动服务器',
    stopServer: '停止服务器',
    executing: '执行中',
    commandExecuting: '正在执行{command}...',
    commandExecuteSuccess: '命令执行成功',
    commandExecuteFailed: '命令执行失败',
    startingServer: '正在启动Hexo服务器...',
    stoppingServer: '正在停止Hexo服务器...',

    // 状态
    serverRunning: '服务器运行中',
    serverStopped: '服务器已停止',

    // 消息
    selectValidHexoProject: '请先选择有效的Hexo项目目录',
    onlyAvailableInDesktop: '此功能仅在桌面应用中可用',
    selectDirectoryFailed: '选择目录失败',
    validateProjectFailed: '验证项目失败',
    loadArticlesFailed: '加载文章失败',
    createArticleFailed: '创建文章失败',
    saveArticleFailed: '保存文章失败',
    deleteArticleFailed: '删除文章失败',

    // 文章创建
    articleTitle: '文章标题',
    tags: '标签',
    categories: '分类',
    excerpt: '摘要',
    addTag: '添加标签',
    addCategory: '添加分类',
    pleaseEnterArticleTitle: '请输入文章标题',
    pleaseEnterTags: '输入标签后按回车添加',
    pleaseEnterCategories: '输入分类后按回车添加',
    pleaseEnterExcerpt: '请输入文章摘要',

    // 操作按钮
    saveArticle: '保存文章',
    deleteArticle: '删除文章',
    viewInBrowser: '在浏览器中查看',

    // 编辑器提示文本
    selectArticleToEdit: '选择一篇文章开始编辑',
    selectProjectFirst: '请先选择Hexo项目目录',
    selectFromListOrCreate: '从左侧文章列表中选择一篇文章，或创建新文章',
    clickSelectButton: '点击"选择"按钮来选择您的Hexo项目目录',

    // 主题切换
    lightMode: '明亮模式',
    darkMode: '黑夜模式',
    toggleTheme: '切换主题模式',

    // 面板设置
    panelSettings: '面板设置',
    postsPerPage: '每页显示文章数量',
    postsPerPageDescription: '设置文章列表每页显示的文章数量，范围1-100',
    autoSaveInterval: '自动保存间隔（分钟）',
    autoSaveIntervalDescription: '设置文章自动保存的时间间隔，范围1-60分钟，默认为3分钟',
    editorMode: '编辑模式',
    mode1: '模式1',
    mode2: '模式2(beta)',
    modeDescription: '模式1：编辑和预览分离，需要手动切换；模式2：编辑和预览同时显示，左右分栏',
    backgroundSettings: '背景设置',
    backgroundImageUrl: '背景图片URL',
    selectImage: '选择图片',
    clear: '清除',
    backgroundImageDescription: '输入图片URL或从本地选择图片作为背景',
    backgroundOpacity: '背景透明度',
    backgroundOpacityDescription: '调整背景透明度，0为完全透明，1为完全不透明',
    saveSettings: '保存设置',
    about: '关于',
    versionInfo: '版本信息',
    projectAddress: '项目地址',
    contactMe: '联系我',
    supportMessage: '您的star⭐是对我最大的支持😊',
    stopWarning: '住手啊！',
    disappearWarning: '这样下去......会消失的喵！',

    // 更新检查
    updateCheck: '更新检查',
    checkForUpdates: '检查更新',
    autoCheckUpdates: '是否自动检查更新',
    autoCheckUpdatesDescription: '如果您被更新弹窗所困扰，可以选择关闭更新检查',
    toggleAutoCheckUpdates: '切换自动检查更新',
    currentVersion: '当前版本:',
    lastCheckTime: '上次检查时间:',
    latestVersion: '最新版本:',
    newVersionAvailable: '有新版本',
    upToDate: '已是最新',
    publishTime: '发布时间:',
    updateContent: '更新内容:',
    downloadLinks: '下载链接:',
    download: '下载',
    viewOnGitHub: '在GitHub上查看',
    newVersionFound: '发现新版本',
    newVersionDescription: '新版本 {version} 已发布',
    alreadyLatest: '已是最新版本',
    alreadyLatestDescription: '当前版本 {version} 已是最新',
    checkUpdateFailed: '检查更新失败',
    unknownError: '未知错误',

    // 工具栏
    selected: '已选 {count} 篇',
    selectAll: '全选',
    deselectAll: '取消全选',
    addTags: '添加标签',
    addCategories: '添加分类',
    totalArticles: '共 {count} 篇文章',
    filterByTagCategory: '按标签/分类显示',
    filterByTag: '按标签',
    filterByCategory: '按分类',
    clearFilter: '清除筛选',
    sortByFileName: '按文件名',
    sortByModifiedTime: '按修改时间',
    ascending: '升序',
    descending: '降序',
    previousPage: '上一页',
    nextPage: '下一页',

    // 日志记录
    viewLogs: '查看日志',
    operationLogs: '操作日志',
    noLogs: '暂无日志记录',
    clearLogs: '清空日志',
    commandExecutedSuccess: '✓ 命令执行成功',
    commandExecutedFailed: '✗ 命令执行失败',

    // 对话框
    confirmDelete: '确认删除',
    deleteConfirmMessage: '您确定要删除选中的 {count} 篇文章吗？此操作不可撤销。',
    deleteConfirmMessageSingle: '您确定要删除文章 "{title}" 吗？此操作不可撤销。',
    addTagsDialogTitle: '添加标签',
    addTagsDialogDescription: '为选中的 {count} 篇文章添加标签（多个标签用逗号分隔）',
    addTagsDialogDescriptionSingle: '为文章 "{title}" 添加标签（多个标签用逗号分隔）',
    addCategoriesDialogTitle: '添加分类',
    addCategoriesDialogDescription: '为选中的 {count} 篇文章添加分类（多个分类用逗号分隔）',
    addCategoriesDialogDescriptionSingle: '为文章 "{title}" 添加分类（多个分类用逗号分隔）',
    tagsPlaceholder: '例如：技术,教程,前端',
    categoriesPlaceholder: '例如：技术,教程',
    operationIrreversible: '此操作不可撤销。',
    add: '添加',

    // 推送设置
    enablePush: '启用推送',
    enablePushDescription: '启用后可以将Hexo项目推送到远程Git仓库',
    pushRepoUrl: '仓库地址',
    pushRepoUrlPlaceholder: '例如: https://github.com/username/repo.git',
    pushBranch: '分支名称',
    pushBranchPlaceholder: '例如: main',
    pushUsername: '用户名',
    pushUsernamePlaceholder: 'Git用户名',
    pushEmail: '邮箱',
    pushEmailPlaceholder: 'Git邮箱',
    push: '推送',
    pushSuccess: '推送成功',
    pushFailed: '推送失败',
    pushing: '推送中...',

    // AI设置
    enableAI: '启用AI',
    enableAIDescription: '启用后获得AI支持',
    aboutAILink: '[关于]',
    aiProvider: 'AI提供商',
    aiProviderDescription: '目前仅支持DeepSeek',
    apiKey: 'API密钥',
    apiKeyPlaceholder: '请输入您的API密钥',
    prompt: '灵感提示词',
    promptPlaceholder: '请输入灵感提示词',
    analysisPrompt: '分析提示词',
    analysisPromptPlaceholder: '请输入分析提示词',
    inspiration: '灵感',
    generatingInspiration: '生成灵感中...',
    getInspiration: '来点灵感',
    aiInspiration: 'AI灵感',
    aiInspirationDescription: 'AI生成的博客灵感内容',
    articleAnalysis: '文章分析',
    startAnalysis: '开始分析',
    
    // 预览模式设置
    previewMode: '预览模式',
    previewModeDescription: '选择文章预览的渲染方式',
    staticPreview: '静态预览',
    serverPreview: '服务器预览',

    // 创建Hexo项目
    createHexoProject: '创建 Hexo 项目',
    createHexoProjectDescription: '创建一个新的 Hexo 博客项目',
    checkingEnvironment: '正在检查环境...',
    hexoProjectLocation: 'Hexo 项目安装位置',
    selectDirectory: '选择目录',
    projectFolderName: '项目文件夹名称',
    useTaobaoMirror: '使用淘宝镜像源',
    useTaobaoMirrorRecommended: '使用淘宝镜像源 (推荐)',
    installDeployPlugin: '安装部署插件',
    installDeployPluginDescription: '安装部署插件 (hexo-deployer-git)',
    installationProgress: '安装进度',
    commandOutput: '命令输出将显示在这里...',
    cancel: '取消',
    close: '关闭',
    creating: '创建中...',
    createProject: '创建项目',
    hexoAlreadyInstalled: 'Hexo 已安装 (版本: {version})，将跳过 Hexo 安装步骤',
    hexoNotInstalled: 'Hexo 未安装，将自动安装 Hexo',
    installNpmAndGitFirst: '请先安装 npm 和 git',
    settingTaobaoMirror: '设置淘宝镜像源...',
    taobaoMirrorSetSuccess: '淘宝镜像源设置成功',
    installingHexoCli: '安装 hexo-cli...',
    hexoCliInstallSuccess: 'hexo-cli 安装成功',
    creatingHexoProject: '创建 Hexo 项目到 {path}...',
    hexoProjectCreatedSuccess: 'Hexo 项目创建成功',
    dependenciesInstalled: '项目依赖已自动安装',
    installingDeployPlugin: '安装部署插件...',
    deployPluginInstallSuccess: '部署插件安装成功',
    hexoProjectCreationComplete: 'Hexo 项目创建完成!',
    createSuccess: '创建成功',
    hexoProjectCreatedSuccessfully: 'Hexo 项目已成功创建',
    createFailed: '创建失败',
    missingDependency: '缺少依赖',
    pleaseInstallNpm: '请先安装 npm',
    pleaseInstallGit: '请先安装 git',
    selectDirectoryFailed: '选择目录失败',
    unknownError: '未知错误',
    checkingNpm: '检查 npm...',
    npmInstalled: 'npm 已安装: {version}',
    npmNotInstalled: 'npm 未安装: {error}',
    checkingGit: '检查 git...',
    gitInstalled: 'git 已安装: {version}',
    gitNotInstalled: 'git 未安装: {error}',
    checkingHexo: '检查 hexo...',
    hexoInstalled: 'hexo 已安装: {version}',
    hexoNotInstalled: 'hexo 未安装: {error}',
    environmentCheckFailed: '检查环境失败: {error}',
  // 插件管理
  plugins: '插件',
  themes: '主题',
  pluginManager: '插件管理',
  installedPlugins: '已安装插件',
  installedThemes: '已安装主题',
  activeTheme: '当前主题: {theme}',
  installPlugin: '安装',
  uninstallPlugin: '卸载',
  installingPlugin: '正在安装 {name}...',
  uninstallingPlugin: '正在卸载 {name}...',
  pluginNamePlaceholder: '输入插件名，例如 hexo-generator-feed',
  refresh: '刷新',
  noPlugins: '暂无插件',
  noThemes: '暂无主题',
  pluginInstallSuccess: '插件安装成功',
  pluginUninstallSuccess: '插件卸载成功',
  pluginInstallFailed: '插件安装失败: {error}',
  pluginUninstallFailed: '插件卸载失败: {error}',
  },

  en: {
    // 通用
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    clear: 'Clear',
    select: 'Select',
    error: 'Error',
    success: 'Success',
    cleanCacheSuccess: 'Cache cleaned successfully',
    generateStaticFilesSuccess: 'Static files generated successfully',
    deploySuccess: 'Deployed successfully',
    articleCreateSuccess: 'Article created successfully',
    articleSaveSuccess: 'Article saved successfully',
    articleDeleteSuccess: 'Article deleted successfully',
    articlesDeleteSuccess: 'Successfully deleted {count} articles',
    tagsAddSuccess: 'Successfully added tags to {successCount}/{totalCount} articles',
    categoriesAddSuccess: 'Successfully added categories to {successCount}/{totalCount} articles',
    configSaveSuccess: 'Configuration saved successfully',
    configImportSuccess: 'Configuration imported successfully, please click save',
    optional: 'Optional',
    creating: 'Creating...',
    createArticle: 'Create Article',
    postsPerPageRangeError: 'Posts per page must be between 1-100',
    autoSaveIntervalRangeError: 'Auto save interval must be between 1-60 minutes',
    settingsSaved: 'Settings saved',

    // 项目管理
    hexoProject: 'Hexo Project',
    selectHexoDirectory: 'Select Hexo Project Directory',
    clearSavedPath: 'Clear Saved Path',
    validHexoProject: 'Valid Hexo Project',
    invalidHexoProject: 'Not a valid Hexo project directory',

    // 文章管理
    articles: 'Articles',
    articleList: 'Articles',
    viewArticleList: 'Article List',
    createNewArticle: 'Create New Article',
    articleEditor: 'Article Editor',
    preview: 'Preview',

    // 文章统计
    articleStatistics: 'Article Statistics',
    tagCloud: 'Tag Cloud',
    viewTagCloud: 'Tag Cloud',

    // 编辑器
    markdownEditor: 'Markdown Editor',
    lines: 'lines',
    supportMarkdownSyntax: 'Standard Markdown syntax supported',
    saving: 'Saving...',
    dragImageHint: 'Drop image files here to insert Hexo image tags',

    // 占位符文本
    editorPlaceholder: `# Title

Start writing your article content...

## Markdown Syntax Guide

### Text Formatting
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`Inline code\`

### Lists
1. Ordered list item
2. Another item

- Unordered list item
- Another item

### Links and Images
[Link text](https://example.com)

![Image description](image.jpg)

### Code Blocks
\`\`\`javascript
console.log('Hello, Hexo!');
\`\`\`

### Quotes
> This is a quote block

### Tables
| Column1 | Column2 | Column3 |
|---------|---------|---------|
| Content1 | Content2 | Content3 |`,

    // 配置
    hexoConfig: 'Hexo Config',
    exportConfig: 'Export',
    importConfig: 'Import',
    resetConfig: 'Reset',
    saveConfig: 'Save',
    basicSettings: 'Basic Settings',
    advancedSettings: 'Advanced Settings',
    websiteTitle: 'Website Title',
    subtitle: 'Subtitle',
    author: 'Author',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    websiteDescription: 'Website Description',
    websiteUrl: 'Website URL',
    websiteRoot: 'Website Root',
    permalinkFormat: 'Permalink Format',
    rawConfig: 'Raw Config (YAML)',
    yamlConfig: 'YAML Configuration Content',

    // 命令
    commands: 'Commands',
    generate: 'Generate',
    deploy: 'Deploy',
    server: 'Server',
    clean: 'Clean',
    startServer: 'Start Server',
    stopServer: 'Stop Server',
    executing: 'Executing',
    commandExecuting: 'Executing {command}...',
    commandExecuteSuccess: 'Command executed successfully',
    commandExecuteFailed: 'Command execution failed',
    startingServer: 'Starting Hexo server...',
    stoppingServer: 'Stopping Hexo server...',

    // 状态
    serverRunning: 'Server Running',
    serverStopped: 'Server Stopped',

    // 消息
    selectValidHexoProject: 'Please select a valid Hexo project directory first',
    onlyAvailableInDesktop: 'This feature is only available in desktop app',
    selectDirectoryFailed: 'Failed to select directory',
    validateProjectFailed: 'Failed to validate project',
    loadArticlesFailed: 'Failed to load articles',
    createArticleFailed: 'Failed to create article',
    saveArticleFailed: 'Failed to save article',
    deleteArticleFailed: 'Failed to delete article',

    // 文章创建
    articleTitle: 'Article Title',
    tags: 'Tags',
    categories: 'Categories',
    excerpt: 'Excerpt',
    addTag: 'Add Tag',
    addCategory: 'Add Category',
    pleaseEnterArticleTitle: 'Please enter article title',
    pleaseEnterTags: 'Enter tags and press Enter to add',
    pleaseEnterCategories: 'Enter categories and press Enter to add',
    pleaseEnterExcerpt: 'Please enter article excerpt',

    // 操作按钮
    saveArticle: 'Save Article',
    deleteArticle: 'Delete Article',
    viewInBrowser: 'View in Browser',

    // 编辑器提示文本
    selectArticleToEdit: 'Select an article to start editing',
    selectProjectFirst: 'Please select a Hexo project directory first',
    selectFromListOrCreate: 'Select an article from the list on the left, or create a new one',
    clickSelectButton: 'Click the "Select" button to choose your Hexo project directory',

    // 主题切换
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    toggleTheme: 'Toggle Theme',

    // 面板设置
    panelSettings: 'Panel Settings',
    postsPerPage: 'Posts Per Page',
    postsPerPageDescription: 'Set the number of articles to display per page in the article list, range 1-100',
    autoSaveInterval: 'Auto Save Interval (minutes)',
    autoSaveIntervalDescription: 'Set the time interval for auto-saving articles, range 1-60 minutes, default is 3 minutes',
    editorMode: 'Editor Mode',
    mode1: 'Mode 1',
    mode2: 'Mode 2 (beta)',
    modeDescription: 'Mode 1: Edit and preview are separated, manual switching required; Mode 2: Edit and preview are displayed simultaneously, split left and right',
    backgroundSettings: 'Background Settings',
    backgroundImageUrl: 'Background Image URL',
    selectImage: 'Select Image',
    clear: 'Clear',
    backgroundImageDescription: 'Enter image URL or select an image from local as background',
    backgroundOpacity: 'Background Opacity',
    backgroundOpacityDescription: 'Adjust background opacity, 0 is completely transparent, 1 is completely opaque',
    saveSettings: 'Save Settings',
    about: 'About',
    versionInfo: 'Version Info',
    projectAddress: 'Project Address',
    contactMe: 'Contact Me',
    supportMessage: 'Your star⭐ is my biggest support😊',
    stopWarning: 'Stop it!',
    disappearWarning: 'This way... it will disappear, meow!',

    // 更新检查
    updateCheck: 'Update Check',
    checkForUpdates: 'Check for Updates',
    autoCheckUpdates: 'Auto Check Updates',
    autoCheckUpdatesDescription: 'If you are bothered by update pop-ups, you can turn off update checking',
    toggleAutoCheckUpdates: 'Toggle Auto Check Updates',
    currentVersion: 'Current Version:',
    lastCheckTime: 'Last Check Time:',
    latestVersion: 'Latest Version:',
    newVersionAvailable: 'New Version Available',
    upToDate: 'Up to Date',
    publishTime: 'Publish Time:',
    updateContent: 'Update Content:',
    downloadLinks: 'Download Links:',
    download: 'Download',
    viewOnGitHub: 'View on GitHub',
    newVersionFound: 'New Version Found',
    newVersionDescription: 'New version {version} has been released',
    alreadyLatest: 'Already Latest Version',
    alreadyLatestDescription: 'Current version {version} is already the latest',
    checkUpdateFailed: 'Failed to check for updates',
    unknownError: 'Unknown error',

    // 工具栏
    selected: '{count} selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    addTags: 'Add Tags',
    addCategories: 'Add Categories',
    totalArticles: 'Total {count} articles',
    filterByTagCategory: 'Filter by Tag/Category',
    filterByTag: 'Filter by Tag',
    filterByCategory: 'Filter by Category',
    clearFilter: 'Clear Filter',
    sortByFileName: 'Sort by File Name',
    sortByModifiedTime: 'Sort by Modified Time',
    ascending: 'Ascending',
    descending: 'Descending',
    previousPage: 'Previous Page',
    nextPage: 'Next Page',

    // 日志记录
    viewLogs: 'View Logs',
    operationLogs: 'Operation Logs',
    noLogs: 'No log records',
    clearLogs: 'Clear Logs',
    commandExecutedSuccess: '✓ Command executed successfully',
    commandExecutedFailed: '✗ Command execution failed',

    // 对话框
    confirmDelete: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete the selected {count} articles? This operation cannot be undone.',
    deleteConfirmMessageSingle: 'Are you sure you want to delete the article "{title}"? This operation cannot be undone.',
    addTagsDialogTitle: 'Add Tags',
    addTagsDialogDescription: 'Add tags to the selected {count} articles (separate multiple tags with commas)',
    addTagsDialogDescriptionSingle: 'Add tags to the article "{title}" (separate multiple tags with commas)',
    addCategoriesDialogTitle: 'Add Categories',
    addCategoriesDialogDescription: 'Add categories to the selected {count} articles (separate multiple categories with commas)',
    addCategoriesDialogDescriptionSingle: 'Add categories to the article "{title}" (separate multiple categories with commas)',
    tagsPlaceholder: 'e.g. Technology, Tutorial, Frontend',
    categoriesPlaceholder: 'e.g. Technology, Tutorial',
    operationIrreversible: 'This operation cannot be undone.',
    add: 'Add',
    
    // 推送设置
    enablePush: 'Enable Push',
    enablePushDescription: 'Enable to push Hexo project to remote Git repository',
    pushRepoUrl: 'Repository URL',
    pushRepoUrlPlaceholder: 'e.g. https://github.com/username/repo.git',
    pushBranch: 'Branch Name',
    pushBranchPlaceholder: 'e.g. main',
    pushUsername: 'Username',
    pushUsernamePlaceholder: 'Git username',
    pushEmail: 'Email',
    pushEmailPlaceholder: 'Git email',
    push: 'Push',
    pushSuccess: 'Push successful',
    pushFailed: 'Push failed',
    pushing: 'Pushing...',

    // AI设置
    enableAI: 'Enable AI',
    enableAIDescription: 'Enable to get AI support',
    aboutAILink: '[About]',
    aiProvider: 'AI Provider',
    aiProviderDescription: 'Currently only supports DeepSeek',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Please enter your API key',
    prompt: 'Inspiration Prompt',
    promptPlaceholder: 'Please enter an inspiration prompt',
    analysisPrompt: 'Analysis Prompt',
    analysisPromptPlaceholder: 'Please enter an analysis prompt',
    inspiration: 'Inspiration',
    generatingInspiration: 'Generating inspiration...',
    getInspiration: 'Get Inspiration',
    aiInspiration: 'AI Inspiration',
    aiInspirationDescription: 'Blog inspiration content generated by AI',
    articleAnalysis: 'Article Analysis',
    startAnalysis: 'Start Analysis',
    
    // 预览模式设置
    previewMode: 'Preview Mode',
    previewModeDescription: 'Choose the rendering method for article preview',
    staticPreview: 'Static Preview',
    serverPreview: 'Server Preview',

    // 创建Hexo项目
    createHexoProject: 'Create Hexo Project',
    createHexoProjectDescription: 'Create a new Hexo blog project',
    checkingEnvironment: 'Checking environment...',
    hexoProjectLocation: 'Hexo Project Installation Location',
    selectDirectory: 'Select Directory',
    projectFolderName: 'Project Folder Name',
    useTaobaoMirror: 'Use Taobao Mirror',
    useTaobaoMirrorRecommended: 'Use Taobao Mirror (Recommended)',
    installDeployPlugin: 'Install Deploy Plugin',
    installDeployPluginDescription: 'Install deploy plugin (hexo-deployer-git)',
    installationProgress: 'Installation Progress',
    commandOutput: 'Command output will be displayed here...',
    cancel: 'Cancel',
    close: 'Close',
    creating: 'Creating...',
    createProject: 'Create Project',
    hexoAlreadyInstalled: 'Hexo is already installed (version: {version}), will skip Hexo installation',
    hexoNotInstalled: 'Hexo is not installed, will install Hexo automatically',
    installNpmAndGitFirst: 'Please install npm and git first',
    settingTaobaoMirror: 'Setting Taobao mirror...',
    taobaoMirrorSetSuccess: 'Taobao mirror set successfully',
    installingHexoCli: 'Installing hexo-cli...',
    hexoCliInstallSuccess: 'hexo-cli installed successfully',
    creatingHexoProject: 'Creating Hexo project to {path}...',
    hexoProjectCreatedSuccess: 'Hexo project created successfully',
    dependenciesInstalled: 'Project dependencies installed automatically',
    installingDeployPlugin: 'Installing deploy plugin...',
    deployPluginInstallSuccess: 'Deploy plugin installed successfully',
    hexoProjectCreationComplete: 'Hexo project creation complete!',
    createSuccess: 'Create Success',
    hexoProjectCreatedSuccessfully: 'Hexo project created successfully',
    createFailed: 'Create Failed',
    missingDependency: 'Missing Dependency',
    pleaseInstallNpm: 'Please install npm first',
    pleaseInstallGit: 'Please install git first',
    selectDirectoryFailed: 'Failed to select directory',
    unknownError: 'Unknown error',
    checkingNpm: 'Checking npm...',
    npmInstalled: 'npm installed: {version}',
    npmNotInstalled: 'npm not installed: {error}',
    checkingGit: 'Checking git...',
    gitInstalled: 'git installed: {version}',
    gitNotInstalled: 'git not installed: {error}',
    checkingHexo: 'Checking hexo...',
    hexoInstalled: 'hexo installed: {version}',
    hexoNotInstalled: 'hexo not installed: {error}',
    environmentCheckFailed: 'Environment check failed: {error}',
    
    // 插件管理
    plugins: 'Plugins',
    themes: 'Themes',
    pluginManager: 'Plugin Manager',
    installedPlugins: 'Installed Plugins',
    installedThemes: 'Installed Themes',
    activeTheme: 'Active Theme: {theme}',
    installPlugin: 'Install',
    uninstallPlugin: 'Uninstall',
    installingPlugin: 'Installing {name}...',
    uninstallingPlugin: 'Uninstalling {name}...',
    pluginNamePlaceholder: 'Enter plugin name, e.g. hexo-generator-feed',
    refresh: 'Refresh',
    noPlugins: 'No plugins',
    noThemes: 'No themes',
    pluginInstallSuccess: 'Plugin installed successfully',
    pluginUninstallSuccess: 'Plugin uninstalled successfully',
    pluginInstallFailed: 'Plugin install failed: {error}',
    pluginUninstallFailed: 'Plugin uninstall failed: {error}',
  }
};

// 获取当前语言的文本
export const getTexts = (language: Language): I18nTexts => {
  return i18nTexts[language];
};