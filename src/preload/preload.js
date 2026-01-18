const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Tab management
  createTab: (tabId, url) => ipcRenderer.invoke('create-tab', { tabId, url }),
  showTab: (tabId) => ipcRenderer.invoke('show-tab', tabId),
  closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
  navigate: (tabId, url) => ipcRenderer.invoke('navigate', { tabId, url }),
  goBack: (tabId) => ipcRenderer.invoke('go-back', tabId),
  goForward: (tabId) => ipcRenderer.invoke('go-forward', tabId),
  reload: (tabId) => ipcRenderer.invoke('reload', tabId),

  // Privacy settings
  getPrivacySettings: () => ipcRenderer.invoke('get-privacy-settings'),
  setPrivacySetting: (key, value) => ipcRenderer.invoke('set-privacy-setting', { key, value }),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
  removeBookmark: (id) => ipcRenderer.invoke('remove-bookmark', id),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  resizeView: (bounds) => ipcRenderer.invoke('resize-view', bounds),

  // Investigation Log
  addInvestigationLog: (entry) => ipcRenderer.invoke('add-investigation-log', entry),
  getInvestigationLog: () => ipcRenderer.invoke('get-investigation-log'),
  clearInvestigationLog: () => ipcRenderer.invoke('clear-investigation-log'),
  exportInvestigationLog: (format) => ipcRenderer.invoke('export-investigation-log', format),
  openInvestigationLog: () => ipcRenderer.invoke('open-investigation-log'),

  // Screenshots
  takeScreenshot: (tabId) => ipcRenderer.invoke('take-screenshot', tabId),
  getInvestigationSettings: () => ipcRenderer.invoke('get-investigation-settings'),
  setInvestigationSetting: (key, value) => ipcRenderer.invoke('set-investigation-setting', { key, value }),
  selectScreenshotFolder: () => ipcRenderer.invoke('select-screenshot-folder'),

  // Metadata extraction
  extractMetadata: (tabId) => ipcRenderer.invoke('extract-metadata', tabId),

  // Reverse image search
  reverseImageSearch: (imageUrl, engine) => ipcRenderer.invoke('reverse-image-search', { imageUrl, engine }),

  // Plugins
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  setPluginEnabled: (pluginId, enabled) => ipcRenderer.invoke('set-plugin-enabled', { pluginId, enabled }),
  updatePluginSettings: (pluginId, settings) => ipcRenderer.invoke('update-plugin-settings', { pluginId, settings }),
  executePluginAction: (pluginId, action, data) => ipcRenderer.invoke('execute-plugin-action', { pluginId, action, data }),

  // Event listeners
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onCloseTab: (callback) => ipcRenderer.on('close-tab', callback),
  onTabLoading: (callback) => ipcRenderer.on('tab-loading', (event, data) => callback(data)),
  onTabNavigated: (callback) => ipcRenderer.on('tab-navigated', (event, data) => callback(data)),
  onTabTitleUpdated: (callback) => ipcRenderer.on('tab-title-updated', (event, data) => callback(data)),
  onTabFaviconUpdated: (callback) => ipcRenderer.on('tab-favicon-updated', (event, data) => callback(data)),
  onPrivacyUpdated: (callback) => ipcRenderer.on('privacy-updated', (event, data) => callback(data)),
  onToggleBookmarks: (callback) => ipcRenderer.on('toggle-bookmarks', callback),
  onToggleDorks: (callback) => ipcRenderer.on('toggle-dorks', callback),
  onOpenTool: (callback) => ipcRenderer.on('open-tool', (event, tool) => callback(tool)),
  onOpenUrlInNewTab: (callback) => ipcRenderer.on('open-url-in-new-tab', (event, url) => callback(url)),
  onPluginLog: (callback) => ipcRenderer.on('plugin-log', (event, data) => callback(data)),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
