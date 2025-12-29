'use client';

import { useState } from 'react';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Language, getTexts } from '@/utils/i18n';
import { FileText, Calendar, File, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Trash2, Tag, FolderOpen, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

interface PostListProps {
  posts: Post[];
  selectedPost: Post | null;
  onPostSelect: (post: Post) => void;
  isLoading?: boolean;
  onDeletePosts?: (posts: Post[]) => void;
  onAddTagsToPosts?: (posts: Post[], tags: string[]) => void;
  onAddCategoriesToPosts?: (posts: Post[], categories: string[]) => void;
  onDeletePost?: (post: Post) => void;
  onAddTagsToPost?: (post: Post, tags: string[]) => void;
  onAddCategoriesToPost?: (post: Post, categories: string[]) => void;
  availableTags?: string[];
  availableCategories?: string[];
  onFilterByTag?: (tag: string) => void;
  onFilterByCategory?: (category: string) => void;
  onClearFilter?: () => void;
  currentFilter?: { type: 'tag' | 'category'; value: string } | null;
  currentPage?: number;
  postsPerPage?: number;
  onPageChange?: (page: number) => void;
  language?: Language;
}

type SortField = 'name' | 'modifiedTime';
type SortOrder = 'asc' | 'desc';

export function PostList({ posts, selectedPost, onPostSelect, isLoading = false, onDeletePosts, onAddTagsToPosts, onAddCategoriesToPosts, onDeletePost, onAddTagsToPost, onAddCategoriesToPost, availableTags = [], availableCategories = [], onFilterByTag, onFilterByCategory, onClearFilter, currentFilter = null, currentPage = 1, postsPerPage = 15, onPageChange, language = 'zh' }: PostListProps) {
  const texts = getTexts(language);
  const [sortField, setSortField] = useState<SortField>('modifiedTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showTagsDialog, setShowTagsDialog] = useState<boolean>(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [categoriesInput, setCategoriesInput] = useState<string>('');
  const [contextMenuPost, setContextMenuPost] = useState<Post | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState<boolean>(false);
  const [showSingleTagsDialog, setShowSingleTagsDialog] = useState<boolean>(false);
  const [showSingleCategoriesDialog, setShowSingleCategoriesDialog] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: zhCN
      });
    } catch {
      return '未知时间';
    }
  };

  const sortPosts = (posts: Post[]) => {
    return [...posts].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'zh-CN');
      } else if (sortField === 'modifiedTime') {
        const aTime = new Date(a.modifiedTime).getTime();
        const bTime = new Date(b.modifiedTime).getTime();
        comparison = aTime - bTime;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'modifiedTime' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const getSortLabel = () => {
    const fieldName = sortField === 'name' ? texts.sortByFileName : texts.sortByModifiedTime;
    const orderName = sortOrder === 'asc' ? texts.ascending : texts.descending;
    return `${fieldName} (${orderName})`;
  };

  // 处理文章选择
  const handlePostSelect = (post: Post) => {
    if (selectionMode) {
      // 批量选择模式
      if (selectedPosts.some(p => p.path === post.path)) {
        setSelectedPosts(selectedPosts.filter(p => p.path !== post.path));
      } else {
        setSelectedPosts([...selectedPosts, post]);
      }
    } else {
      // 普通选择模式
      onPostSelect(post);
    }
  };

  // 切换选择模式
  const toggleSelectionMode = () => {
    if (selectionMode) {
      // 退出选择模式时清空选择
      setSelectedPosts([]);
    }
    setSelectionMode(!selectionMode);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedPosts.length === sortedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts([...sortedPosts]);
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedPosts.length > 0) {
      setShowDeleteDialog(true);
    }
  };

  // 确认批量删除
  const confirmBatchDelete = () => {
    if (onDeletePosts && selectedPosts.length > 0) {
      onDeletePosts(selectedPosts);
      setSelectedPosts([]);
      setSelectionMode(false);
      setShowDeleteDialog(false);
    }
  };

  // 处理批量添加标签
  const handleBatchAddTags = () => {
    if (selectedPosts.length > 0) {
      setShowTagsDialog(true);
    }
  };

  // 确认批量添加标签
  const confirmBatchAddTags = () => {
    if (onAddTagsToPosts && selectedPosts.length > 0 && tagsInput.trim()) {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 0) {
        onAddTagsToPosts(selectedPosts, tags);
        setTagsInput('');
        setShowTagsDialog(false);
      }
    }
  };

  // 处理批量添加分类
  const handleBatchAddCategories = () => {
    if (selectedPosts.length > 0) {
      setShowCategoriesDialog(true);
    }
  };

  // 确认批量添加分类
  const confirmBatchAddCategories = () => {
    if (onAddCategoriesToPosts && selectedPosts.length > 0 && categoriesInput.trim()) {
      const categories = categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat);
      if (categories.length > 0) {
        onAddCategoriesToPosts(selectedPosts, categories);
        setCategoriesInput('');
        setShowCategoriesDialog(false);
      }
    }
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    setContextMenuPost(post);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setShowContextMenu(false);
    setContextMenuPost(null);
  };

  // 处理单篇文章删除
  const handleSingleDelete = () => {
    if (contextMenuPost) {
      setShowSingleDeleteDialog(true);
      setShowContextMenu(false);
    }
  };

  // 确认单篇文章删除
  const confirmSingleDelete = () => {
    if (onDeletePost && contextMenuPost) {
      onDeletePost(contextMenuPost);
      setShowSingleDeleteDialog(false);
      setContextMenuPost(null);
    }
  };

  // 处理单篇文章添加标签
  const handleSingleAddTags = () => {
    if (contextMenuPost) {
      setShowSingleTagsDialog(true);
      setShowContextMenu(false);
    }
  };

  // 确认单篇文章添加标签
  const confirmSingleAddTags = () => {
    if (onAddTagsToPost && contextMenuPost && tagsInput.trim()) {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 0) {
        onAddTagsToPost(contextMenuPost, tags);
        setTagsInput('');
        setShowSingleTagsDialog(false);
        setContextMenuPost(null);
      }
    }
  };

  // 处理单篇文章添加分类
  const handleSingleAddCategories = () => {
    if (contextMenuPost) {
      setShowSingleCategoriesDialog(true);
      setShowContextMenu(false);
    }
  };

  // 确认单篇文章添加分类
  const confirmSingleAddCategories = () => {
    if (onAddCategoriesToPost && contextMenuPost && categoriesInput.trim()) {
      const categories = categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat);
      if (categories.length > 0) {
        onAddCategoriesToPost(contextMenuPost, categories);
        setCategoriesInput('');
        setShowSingleCategoriesDialog(false);
        setContextMenuPost(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <File className="w-8 h-8 mb-2" />
        <div className="text-sm">暂无文章</div>
        <div className="text-xs mt-1">点击 + 按钮创建新文章</div>
      </div>
    );
  }

  // 应用搜索过滤
  const filteredBySearch = posts.filter(post => 
    searchQuery === '' || 
    post.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedPosts = sortPosts(filteredBySearch);
  
  // 计算分页相关数据
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };
  
  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {texts.previousPage}
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // 显示第一页、最后一页、当前页及当前页附近的页码
              return page === 1 || 
                     page === totalPages || 
                     Math.abs(page - currentPage) <= 1;
            })
            .map((page, index, array) => {
              // 如果页码之间有间隔，显示省略号
              if (index > 0 && page - array[index - 1] > 1) {
                return (
                  <React.Fragment key={`ellipsis-${page}`}>
                    <span className="text-sm text-muted-foreground">...</span>
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {texts.nextPage}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-3 bg-background rounded-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className="h-8"
          >
            {selectionMode ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
            {selectionMode ? texts.selected.replace('{count}', selectedPosts.length.toString()) : texts.select}
          </Button>

          {selectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="h-8"
              >
                {selectedPosts.length === sortedPosts.length ? texts.deselectAll : texts.selectAll}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDelete}
                className="h-8 text-red-600 hover:text-red-700"
                disabled={selectedPosts.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {texts.delete}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchAddTags}
                className="h-8"
                disabled={selectedPosts.length === 0}
              >
                <Tag className="w-4 h-4 mr-1" />
                {texts.addTags}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchAddCategories}
                className="h-8"
                disabled={selectedPosts.length === 0}
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                {texts.addCategories}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder={texts.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-8"
          />
          <div className="text-sm text-muted-foreground">
            {texts.totalArticles.replace('{count}', posts.length.toString())}
          </div>
          
          {/* 筛选器 */}
          {(availableTags.length > 0 || availableCategories.length > 0) && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-sm">
                    <Filter className="w-4 h-4 mr-1" />
                    {currentFilter ? (
                      <span>
                        {currentFilter.type === 'tag' ? texts.filterByTag : texts.filterByCategory}: {currentFilter.value}
                      </span>
                    ) : (
                      <span>{texts.filterByTagCategory}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {currentFilter && (
                    <>
                      <DropdownMenuItem onClick={onClearFilter}>
                        <X className="w-4 h-4 mr-2" />
                        {texts.clearFilter}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {availableTags.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {texts.tags}
                      </div>
                      {availableTags.map((tag) => (
                        <DropdownMenuItem 
                          key={`tag-${tag}`} 
                          onClick={() => onFilterByTag && onFilterByTag(tag)}
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  {availableCategories.length > 0 && availableTags.length > 0 && (
                    <DropdownMenuSeparator />
                  )}
                  
                  {availableCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {texts.categories}
                      </div>
                      {availableCategories.map((category) => (
                        <DropdownMenuItem 
                          key={`category-${category}`} 
                          onClick={() => onFilterByCategory && onFilterByCategory(category)}
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          {category}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-sm">
                {getSortIcon(sortField)}
                <span className="ml-1">{getSortLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleSortChange('name')}
                className="flex items-center justify-between"
              >
                <span>{texts.sortByFileName}</span>
                {getSortIcon('name')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange('modifiedTime')}
                className="flex items-center justify-between"
              >
                <span>{texts.sortByModifiedTime}</span>
                {getSortIcon('modifiedTime')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPosts.map((post) => (
          <div
            key={post.path}
            className={`p-4 cursor-pointer border rounded-lg transition-colors hover:bg-muted/50 ${
              (selectedPost?.path === post.path || selectedPosts.some(p => p.path === post.path))
                ? 'bg-primary/10 border-primary/20 shadow-sm'
                : 'border-border hover:shadow-sm'
            }`}
            onClick={() => handlePostSelect(post)}
            onContextMenu={(e) => handleContextMenu(e, post)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {selectionMode && (
                    <div className="flex-shrink-0">
                      {selectedPosts.some(p => p.path === post.path) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <h3 className="text-base font-medium text-foreground truncate">
                    {post.name.replace(/\.(md|markdown)$/, '')}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.modifiedTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <File className="w-4 h-4" />
                    <span>{formatFileSize(post.size)}</span>
                  </div>
                </div>
              </div>

              {selectedPost?.path === post.path && (
                <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 无搜索结果提示 */}
      {searchQuery && filteredBySearch.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <div className="text-sm">{texts.noSearchResults}</div>
        </div>
      )}

      {/* 批量删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.confirmDelete}</DialogTitle>
            <DialogDescription>
              {texts.deleteConfirmMessage.replace('{count}', selectedPosts.length.toString())}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {texts.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmBatchDelete}>
              {texts.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量添加标签对话框 */}
      <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.addTagsDialogTitle}</DialogTitle>
            <DialogDescription>
              {texts.addTagsDialogDescription.replace('{count}', selectedPosts.length.toString())}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tags">{texts.tags}</Label>
              <Input
                id="tags"
                placeholder={texts.tagsPlaceholder}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagsDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={confirmBatchAddTags}>
              {texts.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量添加分类对话框 */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.addCategoriesDialogTitle}</DialogTitle>
            <DialogDescription>
              {texts.addCategoriesDialogDescription.replace('{count}', selectedPosts.length.toString())}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categories">{texts.categories}</Label>
              <Input
                id="categories"
                placeholder={texts.categoriesPlaceholder}
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoriesDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={confirmBatchAddCategories}>
              {texts.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 右键菜单 */}
      {showContextMenu && (
        <DropdownMenu open={showContextMenu} onOpenChange={setShowContextMenu}>
          <DropdownMenuContent
            className="w-48"
            style={{
              position: 'absolute',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <DropdownMenuItem onClick={handleSingleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              {texts.delete}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSingleAddTags}>
              <Tag className="w-4 h-4 mr-2" />
              {texts.addTags}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSingleAddCategories}>
              <FolderOpen className="w-4 h-4 mr-2" />
              {texts.addCategories}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 单篇文章删除确认对话框 */}
      <Dialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.confirmDelete}</DialogTitle>
            <DialogDescription>
              {texts.deleteConfirmMessageSingle.replace('{title}', contextMenuPost?.name.replace(/\.(md|markdown)$/, '') || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSingleDeleteDialog(false)}>
              {texts.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmSingleDelete}>
              {texts.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单篇文章添加标签对话框 */}
      <Dialog open={showSingleTagsDialog} onOpenChange={setShowSingleTagsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.addTagsDialogTitle}</DialogTitle>
            <DialogDescription>
              {texts.addTagsDialogDescriptionSingle.replace('{title}', contextMenuPost?.name.replace(/\.(md|markdown)$/, '') || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="single-tags">{texts.tags}</Label>
              <Input
                id="single-tags"
                placeholder={texts.tagsPlaceholder}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSingleTagsDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={confirmSingleAddTags}>
              {texts.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单篇文章添加分类对话框 */}
      <Dialog open={showSingleCategoriesDialog} onOpenChange={setShowSingleCategoriesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.addCategoriesDialogTitle}</DialogTitle>
            <DialogDescription>
              {texts.addCategoriesDialogDescriptionSingle.replace('{title}', contextMenuPost?.name.replace(/\.(md|markdown)$/, '') || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="single-categories">{texts.categories}</Label>
              <Input
                id="single-categories"
                placeholder={texts.categoriesPlaceholder}
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSingleCategoriesDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={confirmSingleAddCategories}>
              {texts.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 分页控件 */}
      {renderPagination()}
    </div>
  );
}