/**
 * SANDIEGO Browser - Preload Script
 * Version: 3.2.0
 *
 * Secure bridge between renderer and main process.
 * Implements context isolation for maximum security.
 */

const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// Secure API Exposure
// ============================================

contextBridge.exposeInMainWorld('sandiego', {
  // ============================================
  // Platform & System Information
  // ============================================
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  checkTorStatus: () => ipcRenderer.invoke('check-tor-status'),
  getNetworkStatus: () => ipcRenderer.invoke('get-network-status'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

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
  stopLoading: (tabId) => ipcRenderer.send('stop-loading', tabId),

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
  // History
  // ============================================
  getHistory: (limit) => ipcRenderer.invoke('get-history', limit),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // ============================================
  // Session Management
  // ============================================
  getLastSession: () => ipcRenderer.invoke('get-last-session'),
  restoreSession: () => ipcRenderer.invoke('restore-session'),

  // ============================================
  // OSINT Tools
  // ============================================
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  getPageInfo: () => ipcRenderer.invoke('get-page-info'),

  // ============================================
  // Phone Intelligence Module
  // ============================================
  phoneIntel: {
    getCountries: () => ipcRenderer.invoke('phone-intel-get-countries'),
    generateFormats: (phoneNumber, countryCode) => ipcRenderer.invoke('phone-intel-generate-formats', phoneNumber, countryCode),
    openSearch: (searchUrl) => ipcRenderer.invoke('phone-intel-open-search', searchUrl),
    batchSearch: (phoneNumber, countryCode, searchEngine) => ipcRenderer.invoke('phone-intel-batch-search', phoneNumber, countryCode, searchEngine)
  },

  // ============================================
  // Event Listeners
  // ============================================
  on: (channel, callback) => {
    const validChannels = [
      // Tab events
      'tab-loading', 'tab-navigated', 'tab-title-updated', 'tab-favicon-updated',
      'tab-activated', 'tab-created', 'tab-error', 'tab-crashed', 'tab-unresponsive',
      'tab-responsive',
      // Privacy events
      'privacy-updated', 'tor-status',
      // System events
      'notification', 'platform-info', 'fullscreen-change', 'window-focus',
      'network-status', 'session-available',
      // Navigation events
      'go-home', 'open-panel', 'zoom-changed',
      // Security events
      'certificate-error', 'context-menu',
      // OSINT events
      'screenshot-captured'
    ];
    if (validChannels.includes(channel)) {
      const listener = (event, data) => callback(data);
      ipcRenderer.on(channel, listener);
      // Return unsubscribe function
      return () => ipcRenderer.removeListener(channel, listener);
    }
    return () => {};
  },

  // One-time event listener
  once: (channel, callback) => {
    const validChannels = [
      'tab-loading', 'tab-navigated', 'tab-title-updated', 'tab-favicon-updated',
      'tab-activated', 'tab-created', 'tab-error', 'tab-crashed', 'tab-unresponsive',
      'tab-responsive', 'privacy-updated', 'tor-status', 'notification',
      'platform-info', 'fullscreen-change', 'window-focus', 'network-status',
      'session-available', 'go-home', 'open-panel', 'zoom-changed',
      'certificate-error', 'context-menu', 'screenshot-captured'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, data) => callback(data));
    }
  },

  // Legacy event listeners (for backward compatibility)
  onTabLoading: (callback) => ipcRenderer.on('tab-loading', (_, data) => callback(data)),
  onTabNavigated: (callback) => ipcRenderer.on('tab-navigated', (_, data) => callback(data)),
  onTabTitleUpdated: (callback) => ipcRenderer.on('tab-title-updated', (_, data) => callback(data)),
  onTabFaviconUpdated: (callback) => ipcRenderer.on('tab-favicon-updated', (_, data) => callback(data)),
  onTabActivated: (callback) => ipcRenderer.on('tab-activated', (_, data) => callback(data)),
  onTabCreated: (callback) => ipcRenderer.on('tab-created', (_, data) => callback(data)),
  onTabError: (callback) => ipcRenderer.on('tab-error', (_, data) => callback(data)),
  onPrivacyUpdated: (callback) => ipcRenderer.on('privacy-updated', (_, data) => callback(data)),
  onNotification: (callback) => ipcRenderer.on('notification', (_, data) => callback(data)),
  onGoHome: (callback) => ipcRenderer.on('go-home', (_, data) => callback(data)),

  // ============================================
  // Cleanup
  // ============================================
  removeListener: (channel) => {
    const allowedChannels = [
      'tab-loading', 'tab-navigated', 'tab-title-updated', 'tab-favicon-updated',
      'tab-activated', 'tab-created', 'tab-error', 'tab-crashed', 'tab-unresponsive',
      'tab-responsive', 'privacy-updated', 'tor-status', 'notification',
      'platform-info', 'fullscreen-change', 'window-focus', 'network-status',
      'session-available', 'go-home', 'open-panel', 'zoom-changed',
      'certificate-error', 'context-menu', 'screenshot-captured'
    ];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // Remove all listeners for cleanup
  removeAllListeners: () => {
    const channels = [
      'tab-loading', 'tab-navigated', 'tab-title-updated', 'tab-favicon-updated',
      'tab-activated', 'tab-created', 'tab-error', 'tab-crashed', 'tab-unresponsive',
      'tab-responsive', 'privacy-updated', 'tor-status', 'notification',
      'platform-info', 'fullscreen-change', 'window-focus', 'network-status',
      'session-available', 'go-home', 'open-panel', 'zoom-changed',
      'certificate-error', 'context-menu', 'screenshot-captured'
    ];
    channels.forEach(channel => ipcRenderer.removeAllListeners(channel));
  }
});
