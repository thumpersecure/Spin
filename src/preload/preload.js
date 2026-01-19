/**
 * CONSTANTINE Browser - Preload Script
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * Secure bridge between renderer and main process.
 * Implements context isolation for maximum security.
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// Secure API Exposure
// ============================================

// Expose as both 'constantine' (new) and 'sandiego' (legacy) for backwards compatibility
const api = {
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
  // AI Research Assistant Module
  // ============================================
  aiResearch: {
    initialize: () => ipcRenderer.invoke('ai-research-initialize'),
    classifyTab: (tabId, url, title) => ipcRenderer.invoke('ai-research-classify-tab', tabId, url, title),
    getGroups: () => ipcRenderer.invoke('ai-research-get-groups'),
    getTabTopic: (tabId) => ipcRenderer.invoke('ai-research-get-tab-topic', tabId),
    removeTab: (tabId) => ipcRenderer.invoke('ai-research-remove-tab', tabId),
    getSuggestions: (url, title) => ipcRenderer.invoke('ai-research-get-suggestions', url, title),
    getAllTopics: () => ipcRenderer.invoke('ai-research-get-all-topics'),
    startSession: (name) => ipcRenderer.invoke('ai-research-start-session', name),
    setPurpose: (purpose) => ipcRenderer.invoke('ai-research-set-purpose', purpose),
    addNote: (note) => ipcRenderer.invoke('ai-research-add-note', note),
    trackVisit: (url, title, topic) => ipcRenderer.invoke('ai-research-track-visit', url, title, topic),
    getSession: () => ipcRenderer.invoke('ai-research-get-session'),
    getPastSessions: (limit) => ipcRenderer.invoke('ai-research-get-past-sessions', limit),
    searchSessions: (query) => ipcRenderer.invoke('ai-research-search-sessions', query)
  },

  // ============================================
  // AI Privacy Shield Module
  // ============================================
  aiPrivacy: {
    initialize: () => ipcRenderer.invoke('ai-privacy-initialize'),
    analyzeUrl: (url) => ipcRenderer.invoke('ai-privacy-analyze-url', url),
    getExposure: () => ipcRenderer.invoke('ai-privacy-get-exposure'),
    updateProtections: (settings) => ipcRenderer.invoke('ai-privacy-update-protections', settings),
    setAutoOpsec: (enabled) => ipcRenderer.invoke('ai-privacy-set-auto-opsec', enabled),
    isAutoOpsec: () => ipcRenderer.invoke('ai-privacy-is-auto-opsec'),
    setOpsecLevel: (level) => ipcRenderer.invoke('ai-privacy-set-opsec-level', level),
    getOpsecLevel: () => ipcRenderer.invoke('ai-privacy-get-opsec-level'),
    getAllLevels: () => ipcRenderer.invoke('ai-privacy-get-all-levels'),
    evaluateUrl: (url) => ipcRenderer.invoke('ai-privacy-evaluate-url', url),
    getStatus: () => ipcRenderer.invoke('ai-privacy-get-status'),
    getHistory: () => ipcRenderer.invoke('ai-privacy-get-history')
  },

  // ============================================
  // AI Research Tools Module
  // ============================================
  aiTools: {
    initialize: () => ipcRenderer.invoke('ai-tools-initialize'),
    extractEntities: (text, sourceInfo) => ipcRenderer.invoke('ai-tools-extract-entities', text, sourceInfo),
    getEntityStats: () => ipcRenderer.invoke('ai-tools-get-entity-stats'),
    findRelated: (value) => ipcRenderer.invoke('ai-tools-find-related', value),
    captureSnapshot: (pageData) => ipcRenderer.invoke('ai-tools-capture-snapshot', pageData),
    getSnapshot: (id) => ipcRenderer.invoke('ai-tools-get-snapshot', id),
    getSnapshots: (limit, offset) => ipcRenderer.invoke('ai-tools-get-snapshots', limit, offset),
    searchSnapshots: (query) => ipcRenderer.invoke('ai-tools-search-snapshots', query),
    deleteSnapshot: (id) => ipcRenderer.invoke('ai-tools-delete-snapshot', id),
    exportSnapshot: (id, format) => ipcRenderer.invoke('ai-tools-export-snapshot', id, format),
    addSnapshotNote: (snapshotId, note) => ipcRenderer.invoke('ai-tools-add-snapshot-note', snapshotId, note),
    registerTabEntities: (tabId, entities) => ipcRenderer.invoke('ai-tools-register-tab-entities', tabId, entities),
    unregisterTab: (tabId) => ipcRenderer.invoke('ai-tools-unregister-tab', tabId),
    getAlerts: (includeAcknowledged) => ipcRenderer.invoke('ai-tools-get-alerts', includeAcknowledged),
    acknowledgeAlert: (alertId) => ipcRenderer.invoke('ai-tools-acknowledge-alert', alertId),
    dismissAlert: (alertId) => ipcRenderer.invoke('ai-tools-dismiss-alert', alertId),
    getAlertCount: () => ipcRenderer.invoke('ai-tools-get-alert-count'),
    getCrossRefReport: () => ipcRenderer.invoke('ai-tools-get-crossref-report')
  },

  // ============================================
  // AI Cognitive Tools Module
  // ============================================
  aiCognitive: {
    initialize: () => ipcRenderer.invoke('ai-cognitive-initialize'),
    startFocus: (preset, customDuration, customBreak) => ipcRenderer.invoke('ai-cognitive-start-focus', preset, customDuration, customBreak),
    endFocus: (force) => ipcRenderer.invoke('ai-cognitive-end-focus', force),
    pauseFocus: () => ipcRenderer.invoke('ai-cognitive-pause-focus'),
    resumeFocus: () => ipcRenderer.invoke('ai-cognitive-resume-focus'),
    checkFocusUrl: (url) => ipcRenderer.invoke('ai-cognitive-check-focus-url', url),
    getFocusStatus: () => ipcRenderer.invoke('ai-cognitive-get-focus-status'),
    getFocusPresets: () => ipcRenderer.invoke('ai-cognitive-get-focus-presets'),
    getFocusHistory: (limit) => ipcRenderer.invoke('ai-cognitive-get-focus-history', limit),
    getFocusStats: () => ipcRenderer.invoke('ai-cognitive-get-focus-stats'),
    addFocusNote: (note) => ipcRenderer.invoke('ai-cognitive-add-focus-note', note),
    addBookmark: (bookmark) => ipcRenderer.invoke('ai-cognitive-add-bookmark', bookmark),
    removeBookmark: (id) => ipcRenderer.invoke('ai-cognitive-remove-bookmark', id),
    updateBookmark: (id, updates) => ipcRenderer.invoke('ai-cognitive-update-bookmark', id, updates),
    getBookmarks: (options) => ipcRenderer.invoke('ai-cognitive-get-bookmarks', options),
    searchBookmarks: (query) => ipcRenderer.invoke('ai-cognitive-search-bookmarks', query),
    getBookmarkCategories: () => ipcRenderer.invoke('ai-cognitive-get-bookmark-categories'),
    getBookmarkTags: () => ipcRenderer.invoke('ai-cognitive-get-bookmark-tags'),
    startInvestigation: (name, description) => ipcRenderer.invoke('ai-cognitive-start-investigation', name, description),
    endInvestigation: (summary) => ipcRenderer.invoke('ai-cognitive-end-investigation', summary),
    trackEvent: (eventData) => ipcRenderer.invoke('ai-cognitive-track-event', eventData),
    trackPageVisit: (url, title, tabId) => ipcRenderer.invoke('ai-cognitive-track-page-visit', url, title, tabId),
    trackSearch: (query, engine) => ipcRenderer.invoke('ai-cognitive-track-search', query, engine),
    getTimeline: (options) => ipcRenderer.invoke('ai-cognitive-get-timeline', options),
    getInvestigation: () => ipcRenderer.invoke('ai-cognitive-get-investigation'),
    getTimelineViz: (limit) => ipcRenderer.invoke('ai-cognitive-get-timeline-viz', limit),
    exportTimeline: (investigationId) => ipcRenderer.invoke('ai-cognitive-export-timeline', investigationId)
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
      'screenshot-captured',
      // AI events
      'ai-tab-grouped', 'ai-suggestion-available', 'ai-risk-assessed',
      'ai-entity-found', 'ai-crossref-alert', 'ai-focus-tick',
      'ai-focus-complete', 'ai-focus-distraction', 'ai-opsec-escalated'
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
      'certificate-error', 'context-menu', 'screenshot-captured',
      'ai-tab-grouped', 'ai-suggestion-available', 'ai-risk-assessed',
      'ai-entity-found', 'ai-crossref-alert', 'ai-focus-tick',
      'ai-focus-complete', 'ai-focus-distraction', 'ai-opsec-escalated'
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
      'certificate-error', 'context-menu', 'screenshot-captured',
      'ai-tab-grouped', 'ai-suggestion-available', 'ai-risk-assessed',
      'ai-entity-found', 'ai-crossref-alert', 'ai-focus-tick',
      'ai-focus-complete', 'ai-focus-distraction', 'ai-opsec-escalated'
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
      'certificate-error', 'context-menu', 'screenshot-captured',
      'ai-tab-grouped', 'ai-suggestion-available', 'ai-risk-assessed',
      'ai-entity-found', 'ai-crossref-alert', 'ai-focus-tick',
      'ai-focus-complete', 'ai-focus-distraction', 'ai-opsec-escalated'
    ];
    channels.forEach(channel => ipcRenderer.removeAllListeners(channel));
  }
};

// Expose as primary 'constantine' API
contextBridge.exposeInMainWorld('constantine', api);

// Legacy 'sandiego' API for backwards compatibility
contextBridge.exposeInMainWorld('sandiego', api);
