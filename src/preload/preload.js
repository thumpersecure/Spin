/**
 * SANDIEGO Browser - Preload Script
 * Version: 3.0.0-sandiego
 * Secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer
contextBridge.exposeInMainWorld('sandiego', {
  // ============================================
  // Window Controls
  // ============================================
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // ============================================
  // Tab Management
  // ============================================
  createTab: (url) => ipcRenderer.invoke('create-tab', url),
  showTab: (tabId) => ipcRenderer.send('show-tab', tabId),
  closeTab: (tabId) => ipcRenderer.send('close-tab', tabId),
  navigate: (tabId, url) => ipcRenderer.send('navigate', tabId, url),
  goBack: (tabId) => ipcRenderer.send('go-back', tabId),
  goForward: (tabId) => ipcRenderer.send('go-forward', tabId),
  reload: (tabId) => ipcRenderer.send('reload', tabId),

  // ============================================
  // Panel Management
  // ============================================
  panelToggle: (open, width) => ipcRenderer.send('panel-toggle', open, width),

  // ============================================
  // Privacy Settings
  // ============================================
  getPrivacySettings: () => ipcRenderer.invoke('get-privacy-settings'),
  setPrivacySetting: (key, value) => ipcRenderer.invoke('set-privacy-setting', key, value),
  clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data'),

  // ============================================
  // Bookmarks
  // ============================================
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
  removeBookmark: (url) => ipcRenderer.invoke('remove-bookmark', url),

  // ============================================
  // Tools
  // ============================================
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  getPageInfo: () => ipcRenderer.invoke('get-page-info'),

  // ============================================
  // Event Listeners
  // ============================================
  onTabLoading: (callback) => {
    ipcRenderer.on('tab-loading', (event, data) => callback(data));
  },

  onTabNavigated: (callback) => {
    ipcRenderer.on('tab-navigated', (event, data) => callback(data));
  },

  onTabTitleUpdated: (callback) => {
    ipcRenderer.on('tab-title-updated', (event, data) => callback(data));
  },

  onTabFaviconUpdated: (callback) => {
    ipcRenderer.on('tab-favicon-updated', (event, data) => callback(data));
  },

  onTabActivated: (callback) => {
    ipcRenderer.on('tab-activated', (event, data) => callback(data));
  },

  onTabCreated: (callback) => {
    ipcRenderer.on('tab-created', (event, data) => callback(data));
  },

  onTabError: (callback) => {
    ipcRenderer.on('tab-error', (event, data) => callback(data));
  },

  onPrivacyUpdated: (callback) => {
    ipcRenderer.on('privacy-updated', (event, data) => callback(data));
  },

  onNotification: (callback) => {
    ipcRenderer.on('notification', (event, data) => callback(data));
  },

  onGoHome: (callback) => {
    ipcRenderer.on('go-home', (event, data) => callback(data));
  },

  // ============================================
  // Cleanup
  // ============================================
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Log preload completion
console.log('SANDIEGO preload script loaded');
