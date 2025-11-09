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
  failed: string;
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
  assetFolderDisabledWarning: string;
  assetFolderDisabledConfirm: string;
  assetFolderEnabledSuccess: string;
  assetFolderEnabledNextSteps: string;
  externalEditor: string;
  openWithExternalEditor: string;
  externalEditorOpened: string;
  externalEditorDescription: string;
  reloadContent: string;
  contentReloaded: string;
  contentReloadedDescription: string;
  reloadFailed: string;
  usingExternalEditor: string;
  externalEditorHint: string;

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
  starting: string;
  stopping: string;
  
  // 错误提示
  gitSecurityError: string;
  gitSecurityErrorTrustDir: string;
  gitSecurityErrorSuggest: string;
  gitSecurityErrorOwnership: string;
  gitAuthError: string;
  networkError: string;
  createArticleFailedMsg: string;
  saveArticleFailedMsg: string;
  deleteArticleFailedMsg: string;
  batchDeleteArticlesFailedMsg: string;
  executeCommandFailedMsg: string;
  hexoServerStartFailedMsg: string;
  startServerFailedMsg: string;
  stopServerFailedMsg: string;
  autoFix: string;
  tryFix: string;
  fixing: string;
  fixSuccess: string;
  fixFailed: string;
  fixSuccessRetry: string;

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
  useCustomTemplate: string;
  selectTemplate: string;
  learnMoreAboutTemplates: string;

  // 操作按钮
  saveArticle: string;
  deleteArticle: string;
  viewInBrowser: string;
  backToList: string;

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
  backgroundImageDescription: string;
  backgroundOpacity: string;
  backgroundOpacityDescription: string;
  readFileError: string;
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
  viewLogsDetail: string;

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
  enableEditorAI: string;
  enableEditorAIDescription: string;
  aboutAILink: string;
  aiProvider: string;
  aiProviderDescription: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  prompt: string;
  promptPlaceholder: string;
  analysisPrompt: string;
  analysisPromptPlaceholder: string;
  openaiModel: string;
  openaiModelPlaceholder: string;
  openaiApiEndpoint: string;
  openaiApiEndpointPlaceholder: string;
  siliconflow: string;
  siliconflowTooltip: string;
  siliconflowModel: string;
  siliconflowModelPlaceholder: string;
  loadModels: string;
  loadingModels: string;
  modelsLoaded: string;
  modelsLoadFailed: string;
  loadModelsDescription: string;
  testConnection: string;
  testing: string;
  testSuccess: string;
  testFailed: string;
  apiConnectionTest: string;
  
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
  
  // AI 编辑器右键菜单
  aiRewrite: string;
  aiImprove: string;
  aiExpand: string;
  aiTranslate: string;
  aiFeatureNotEnabled: string;
  pleaseConfigureApiKey: string;
  pleaseSelectText: string;
  rewriteTextError: string;
  aiRewritePrompt: string;
  aiImprovePrompt: string;
  aiExpandPrompt: string;
  aiTranslatePrompt: string;
  aiRewritePromptPlaceholder: string;
  aiImprovePromptPlaceholder: string;
  aiExpandPromptPlaceholder: string;
  aiTranslatePromptPlaceholder: string;

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
  close: string;
  createProject: string;
  hexoAlreadyInstalled: string;
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
  checkingNpm: string;
  npmInstalled: string;
  npmNotInstalled: string;
  checkingGit: string;
  gitInstalled: string;
  gitNotInstalled: string;
  checkingHexo: string;
  hexoInstalled: string;
  hexoCheckNotInstalled: string;
  hexoNotInstalled: string;
  environmentCheckFailed: string;
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
    failed: '失败',
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
    assetFolderDisabledWarning: '检测到您的 Hexo 配置中 post_asset_folder 为 false，图片可能无法正常显示。',
    assetFolderDisabledConfirm: '是否自动启用资源文件夹功能？\n（会修改 _config.yml 中的 post_asset_folder 为 true）',
    assetFolderEnabledSuccess: '已成功启用资源文件夹功能！',
    assetFolderEnabledNextSteps: '建议点击界面上的【清理】和【生成】按钮使更改生效。',
    externalEditor: '外部编辑器',
    openWithExternalEditor: '使用其他程序打开此文件',
    externalEditorOpened: '已使用外部编辑器打开',
    externalEditorDescription: '文件已使用系统默认程序打开，您可以在外部编辑器中进行编辑。编辑完成后，请点击"重新加载"按钮获取最新内容。',
    reloadContent: '重新加载',
    contentReloaded: '内容已重新加载',
    contentReloadedDescription: '已从文件重新加载最新内容',
    reloadFailed: '重新加载失败',
    usingExternalEditor: '正在使用外部编辑器',
    externalEditorHint: '文件已使用系统默认程序打开，您可以在外部编辑器中进行编辑。编辑完成后，请点击下方按钮重新加载内容。',

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
    starting: '启动中',
    stopping: '停止中',
    
    // 错误提示
    gitSecurityError: 'Git 安全错误',
    gitSecurityErrorTrustDir: '需要添加信任目录',
    gitSecurityErrorSuggest: '建议执行',
    gitSecurityErrorOwnership: '检测到可疑的目录所有权',
    gitAuthError: 'Git 认证失败：请检查仓库访问权限',
    networkError: '网络错误：无法连接到远程仓库',
    createArticleFailedMsg: '文章创建失败',
    saveArticleFailedMsg: '文章保存失败',
    deleteArticleFailedMsg: '文章删除失败',
    batchDeleteArticlesFailedMsg: '批量删除文章失败',
    executeCommandFailedMsg: '执行命令失败',
    hexoServerStartFailedMsg: 'Hexo服务器启动失败',
    startServerFailedMsg: '启动服务器失败',
    stopServerFailedMsg: '停止服务器失败',
    autoFix: '自动修复',
    tryFix: '尝试修复',
    fixing: '修复中...',
    fixSuccess: '修复成功',
    fixFailed: '修复失败',
    fixSuccessRetry: '问题已修复，请重试之前的操作',

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
    useCustomTemplate: '使用自定义模板',
    selectTemplate: '选择模板',
    learnMoreAboutTemplates: '了解更多关于模板的信息',

    // 操作按钮
    saveArticle: '保存文章',
    deleteArticle: '删除文章',
    viewInBrowser: '在浏览器中查看',
    backToList: '返回列表',

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
    backgroundImageDescription: '输入图片URL或从本地选择图片作为背景',
    backgroundOpacity: '背景透明度',
    backgroundOpacityDescription: '调整背景透明度，0为完全透明，1为完全不透明',
    readFileError: '读取文件失败，请确保文件路径正确且文件可访问',
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
    viewLogsDetail: '查看日志了解详情',

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
    enableEditorAI: '编辑器AI增强',
    enableEditorAIDescription: '启用后可在编辑器中使用右键AI改写功能',
    aboutAILink: '[关于]',
    aiProvider: 'AI提供商',
    aiProviderDescription: '选择您要使用的AI服务提供商',
    apiKey: 'API密钥',
    apiKeyPlaceholder: '请输入您的API密钥',
    prompt: '灵感提示词',
    promptPlaceholder: '请输入灵感提示词',
    analysisPrompt: '分析提示词',
    analysisPromptPlaceholder: '请输入分析提示词',
    openaiModel: 'OpenAI模型',
    openaiModelPlaceholder: '例如：gpt-3.5-turbo 或 gpt-4',
    openaiApiEndpoint: 'API端点',
    openaiApiEndpointPlaceholder: '默认：https://api.openai.com/v1',
    siliconflow: '硅基流动',
    siliconflowTooltip: '硅基流动是一个高性价比的 AI 推理平台，提供 Qwen、GLM、DeepSeek 等多种开源大模型服务。支持按需付费，性能稳定可靠。点击跳转至硅基流动官网了解更多',
    siliconflowModel: '模型',
    siliconflowModelPlaceholder: '例如：Qwen/Qwen2.5-7B-Instruct',
    loadModels: '加载模型列表',
    loadingModels: '加载中...',
    modelsLoaded: '成功加载',
    modelsLoadFailed: '加载模型列表失败',
    loadModelsDescription: '填写API密钥后点击"加载模型列表"自动获取最新模型',
    testConnection: '测试连接',
    testing: '测试中...',
    testSuccess: '连接测试成功！',
    testFailed: '连接测试失败',
    apiConnectionTest: 'API连接测试',
    inspiration: '灵感',
    generatingInspiration: '生成灵感中...',
    getInspiration: '来点灵感',
    aiInspiration: 'AI灵感',
    aiInspirationDescription: 'AI生成的博客灵感内容',
    articleAnalysis: '文章分析',
    startAnalysis: '开始分析',
    
    // AI 编辑器右键菜单
    aiRewrite: 'AI 重写',
    aiImprove: 'AI 改进',
    aiExpand: 'AI 扩展',
    aiTranslate: 'AI 翻译',
    aiFeatureNotEnabled: 'AI 功能未启用',
    pleaseConfigureApiKey: '请先配置 API Key',
    pleaseSelectText: '请先选择文本',
    rewriteTextError: '重写文本时出现错误，请检查API密钥是否正确。',
    aiRewritePrompt: 'AI重写提示词',
    aiImprovePrompt: 'AI改进提示词',
    aiExpandPrompt: 'AI扩展提示词',
    aiTranslatePrompt: 'AI翻译提示词',
    aiRewritePromptPlaceholder: '请直接重写以下文本，使其更清晰流畅，保持原意。只输出改写后的文本，不要添加任何解释或说明',
    aiImprovePromptPlaceholder: '请直接改进以下文本，使其更专业、生动。只输出改进后的文本，不要添加任何解释或说明',
    aiExpandPromptPlaceholder: '请扩展以下文本，适当添加细节。只输出扩展后的文本，不要添加解释或标注',
    aiTranslatePromptPlaceholder: '请直接将以下文本翻译成英文。只输出翻译结果，不要添加任何解释或说明',
    
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
    close: '关闭',
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
    checkingNpm: '检查 npm...',
    npmInstalled: 'npm 已安装: {version}',
    npmNotInstalled: 'npm 未安装: {error}',
    checkingGit: '检查 git...',
    gitInstalled: 'git 已安装: {version}',
    gitNotInstalled: 'git 未安装: {error}',
    checkingHexo: '检查 hexo...',
    hexoInstalled: 'hexo 已安装: {version}',
    hexoCheckNotInstalled: 'hexo 未安装: {error}',
    environmentCheckFailed: '检查环境失败: {error}',
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
    failed: 'Failed',
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
    assetFolderDisabledWarning: 'Detected that post_asset_folder is set to false in your Hexo config. Images may not display correctly.',
    assetFolderDisabledConfirm: 'Would you like to enable the asset folder feature automatically?\n(This will change post_asset_folder to true in _config.yml)',
    assetFolderEnabledSuccess: 'Asset folder feature enabled successfully!',
    assetFolderEnabledNextSteps: 'Please click the [Clean] and [Generate] buttons on the interface to apply changes.',
    externalEditor: 'External Editor',
    openWithExternalEditor: 'Open this file with another program',
    externalEditorOpened: 'Opened with external editor',
    externalEditorDescription: 'The file has been opened with the system default program. You can edit it in the external editor. After editing, please click the "Reload" button to get the latest content.',
    reloadContent: 'Reload',
    contentReloaded: 'Content reloaded',
    contentReloadedDescription: 'Latest content has been reloaded from the file',
    reloadFailed: 'Reload failed',
    usingExternalEditor: 'Using external editor',
    externalEditorHint: 'The file has been opened with the system default program. You can edit it in the external editor. After editing, please click the button below to reload the content.',

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
    starting: 'Starting',
    stopping: 'Stopping',
    
    // 错误提示
    gitSecurityError: 'Git Security Error',
    gitSecurityErrorTrustDir: 'Need to add trusted directory',
    gitSecurityErrorSuggest: 'Suggested command',
    gitSecurityErrorOwnership: 'Detected suspicious directory ownership',
    gitAuthError: 'Git authentication failed: Please check repository access permissions',
    networkError: 'Network error: Unable to connect to remote repository',
    createArticleFailedMsg: 'Failed to create article',
    saveArticleFailedMsg: 'Failed to save article',
    deleteArticleFailedMsg: 'Failed to delete article',
    batchDeleteArticlesFailedMsg: 'Failed to batch delete articles',
    executeCommandFailedMsg: 'Failed to execute command',
    hexoServerStartFailedMsg: 'Failed to start Hexo server',
    startServerFailedMsg: 'Failed to start server',
    stopServerFailedMsg: 'Failed to stop server',
    autoFix: 'Auto Fix',
    tryFix: 'Try Fix',
    fixing: 'Fixing...',
    fixSuccess: 'Fix successful',
    fixFailed: 'Fix failed',
    fixSuccessRetry: 'Issue fixed, please retry the previous operation',

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
    useCustomTemplate: 'Use Custom Template',
    selectTemplate: 'Select Template',
    learnMoreAboutTemplates: 'Learn more about templates',

    // 操作按钮
    saveArticle: 'Save Article',
    deleteArticle: 'Delete Article',
    viewInBrowser: 'View in Browser',
    backToList: 'Back to List',

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
    backgroundImageDescription: 'Enter image URL or select an image from local as background',
    backgroundOpacity: 'Background Opacity',
    backgroundOpacityDescription: 'Adjust background opacity, 0 is completely transparent, 1 is completely opaque',
    readFileError: 'Failed to read file, please ensure the file path is correct and accessible',
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
    viewLogsDetail: 'View logs for details',

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
    enableEditorAI: 'Editor AI Enhancement',
    enableEditorAIDescription: 'Enable AI rewrite features in editor context menu',
    aboutAILink: '[About]',
    aiProvider: 'AI Provider',
    aiProviderDescription: 'Choose your AI service provider',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Please enter your API key',
    prompt: 'Inspiration Prompt',
    promptPlaceholder: 'Please enter an inspiration prompt',
    analysisPrompt: 'Analysis Prompt',
    analysisPromptPlaceholder: 'Please enter an analysis prompt',
    openaiModel: 'OpenAI Model',
    openaiModelPlaceholder: 'e.g. gpt-3.5-turbo or gpt-4',
    openaiApiEndpoint: 'API Endpoint',
    openaiApiEndpointPlaceholder: 'Default: https://api.openai.com/v1',
    siliconflow: 'SiliconFlow',
    siliconflowTooltip: 'SiliconFlow is a cost-effective AI inference platform offering various open-source LLM services including Qwen, GLM, DeepSeek, etc. Pay-as-you-go pricing with stable and reliable performance. Click to learn more.',
    siliconflowModel: 'Model',
    siliconflowModelPlaceholder: 'e.g. Qwen/Qwen2.5-7B-Instruct',
    loadModels: 'Load Models',
    loadingModels: 'Loading...',
    modelsLoaded: 'Successfully loaded',
    modelsLoadFailed: 'Failed to load model list',
    loadModelsDescription: 'Click "Load Models" after entering API key to get the latest models',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    testSuccess: 'Connection test successful!',
    testFailed: 'Connection test failed',
    apiConnectionTest: 'API Connection Test',
    inspiration: 'Inspiration',
    generatingInspiration: 'Generating inspiration...',
    getInspiration: 'Get Inspiration',
    aiInspiration: 'AI Inspiration',
    aiInspirationDescription: 'Blog inspiration content generated by AI',
    articleAnalysis: 'Article Analysis',
    startAnalysis: 'Start Analysis',
    
    // AI 编辑器右键菜单
    aiRewrite: 'AI Rewrite',
    aiImprove: 'AI Improve',
    aiExpand: 'AI Expand',
    aiTranslate: 'AI Translate',
    aiFeatureNotEnabled: 'AI feature not enabled',
    pleaseConfigureApiKey: 'Please configure API Key first',
    pleaseSelectText: 'Please select text first',
    rewriteTextError: 'An error occurred while rewriting text, please check if the API key is correct.',
    aiRewritePrompt: 'AI Rewrite Prompt',
    aiImprovePrompt: 'AI Improve Prompt',
    aiExpandPrompt: 'AI Expand Prompt',
    aiTranslatePrompt: 'AI Translate Prompt',
    aiRewritePromptPlaceholder: 'Rewrite the following text to make it clearer and more fluent, while maintaining the original meaning. Only output the rewritten text, no explanations',
    aiImprovePromptPlaceholder: 'Improve the following text to make it more professional and engaging. Only output the improved text, no explanations',
    aiExpandPromptPlaceholder: 'Expand the following text with appropriate details. Only output the expanded text, no explanations or annotations',
    aiTranslatePromptPlaceholder: 'Translate the following text to Chinese. Only output the translation, no explanations',
    
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
    close: 'Close',
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
    checkingNpm: 'Checking npm...',
    npmInstalled: 'npm installed: {version}',
    npmNotInstalled: 'npm not installed: {error}',
    checkingGit: 'Checking git...',
    gitInstalled: 'git installed: {version}',
    gitNotInstalled: 'git not installed: {error}',
    checkingHexo: 'Checking hexo...',
    hexoInstalled: 'hexo installed: {version}',
    hexoCheckNotInstalled: 'hexo not installed: {error}',
    environmentCheckFailed: 'Environment check failed: {error}',
  }
};

// 获取当前语言的文本
export const getTexts = (language: Language): I18nTexts => {
  return i18nTexts[language];
};