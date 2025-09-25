"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Language, getTexts } from '@/utils/i18n';
import { PackagePlus, RefreshCw, Trash2, PlugZap, Palette } from 'lucide-react';

interface PluginManagerProps {
  projectPath: string;
  language: Language;
  disabled?: boolean;
}

interface ListedItem { name: string; version?: string; }

export const PluginManager: React.FC<PluginManagerProps> = ({ projectPath, language, disabled }) => {
  const [plugins, setPlugins] = useState<ListedItem[]>([]);
  const [themes, setThemes] = useState<ListedItem[]>([]);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [working, setWorking] = useState<string | null>(null); // plugin name
  const [installName, setInstallName] = useState<string>("");
  const { toast } = useToast();
  const t = getTexts(language);
  const isElectron = typeof window !== 'undefined' && (window as any).require;

  const loadData = async () => {
    if (!isElectron || !projectPath) return;
    setLoading(true);
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const res = await ipcRenderer.invoke('list-hexo-plugins', projectPath);
      if (res.success) {
        setPlugins(res.plugins || []);
        setThemes(res.themes || []);
        setActiveTheme(res.activeTheme || null);
      } else {
        toast({ title: t.error, description: res.error || 'List failed', variant: 'error' });
      }
    } catch (e: any) {
      toast({ title: t.error, description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [projectPath, language]);

  const install = async () => {
    if (!installName.trim()) return;
    if (!isElectron) return;
    setWorking(installName);
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const res = await ipcRenderer.invoke('install-hexo-plugin', projectPath, installName.trim());
      if (res.success) {
        toast({ title: t.success, description: t.pluginInstallSuccess, variant: 'success' });
        setInstallName('');
        loadData();
      } else {
        toast({ title: t.error, description: t.pluginInstallFailed.replace('{error}', res.error || ''), variant: 'error' });
      }
    } catch (e: any) {
      toast({ title: t.error, description: e.message, variant: 'error' });
    } finally {
      setWorking(null);
    }
  };

  const uninstall = async (name: string) => {
    if (!isElectron) return;
    setWorking(name);
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const res = await ipcRenderer.invoke('uninstall-hexo-plugin', projectPath, name);
      if (res.success) {
        toast({ title: t.success, description: t.pluginUninstallSuccess, variant: 'success' });
        loadData();
      } else {
        toast({ title: t.error, description: t.pluginUninstallFailed.replace('{error}', res.error || ''), variant: 'error' });
      }
    } catch (e: any) {
      toast({ title: t.error, description: e.message, variant: 'error' });
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <PlugZap className="w-4 h-4 mr-2" />
            {t.pluginManager}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading || disabled}>
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" style={{ display: loading ? 'block' : 'none' }} />
            {!loading && <RefreshCw className="w-4 h-4 mr-1" />}
            {t.refresh}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={installName}
              onChange={e => setInstallName(e.target.value)}
              placeholder={t.pluginNamePlaceholder}
              disabled={disabled || !!working}
            />
            <Button onClick={install} disabled={disabled || !installName.trim() || !!working}>
              <PackagePlus className="w-4 h-4 mr-2" />
              {t.installPlugin}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <PlugZap className="w-4 h-4 mr-2" />{t.installedPlugins}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="p-4 space-y-2">
                {plugins.length === 0 && (
                  <div className="text-xs text-muted-foreground">{t.noPlugins}</div>
                )}
                {plugins.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-sm border rounded px-2 py-1 bg-card/50">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="font-mono truncate" title={p.name}>{p.name}</span>
                      {p.version && <Badge variant="outline" className="text-xs">{p.version}</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => uninstall(p.name)} disabled={!!working}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Palette className="w-4 h-4 mr-2" />{t.installedThemes}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="p-4 space-y-2">
                {themes.length === 0 && (
                  <div className="text-xs text-muted-foreground">{t.noThemes}</div>
                )}
                {activeTheme && (
                  <div className="text-xs mb-2 text-green-600 font-medium">
                    {t.activeTheme.replace('{theme}', activeTheme)}
                  </div>
                )}
                {themes.map(th => (
                  <div key={th.name} className={`flex items-center justify-between text-sm border rounded px-2 py-1 bg-card/50 ${activeTheme === th.name ? 'border-green-400' : ''}`}>
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="font-mono truncate" title={th.name}>{th.name}</span>
                      {th.version && <Badge variant="outline" className="text-xs">{th.version}</Badge>}
                      {activeTheme === th.name && <Badge className="text-xs bg-green-500">Active</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
