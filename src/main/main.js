/**
 * SANDIEGO Browser - Carmen Sandiego Edition
 * Version: 3.0.0-sandiego
 * "Where in the World Will You Search?"
 *
 * A robust OSINT-focused web browser with built-in privacy protection
 */

const { app, BrowserWindow, BrowserView, ipcMain, session, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { PhoneFormatGenerator, PhoneIntelReport, COUNTRY_CODES } = require('../extensions/phone-intel');

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = {
  version: '3.0.0-sandiego',
  name: 'SANDIEGO Browser',
  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600
  },
  layout: {
    titleBarHeight: 36,
    tabBarHeight: 38,
    navBarHeight: 44,
    panelWidth: 340
  },
  privacy: {
    torProxy: 'socks5h://127.0.0.1:9050',
    defaultUserAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:115.0) Gecko/20100101 Firefox/115.0'
  }
};

// Tracker domains to block - comprehensive list
const TRACKER_DOMAINS = new Set([
  'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
  'doubleclick.net', 'googleadservices.com',
  'facebook.net', 'connect.facebook.net',
  'analytics.twitter.com', 'ads.twitter.com',
  'analytics.tiktok.com', 'ads.tiktok.com',
  'pixel.advertising.com', 'ads.linkedin.com',
  'bat.bing.com', 'clarity.ms',
  'hotjar.com', 'mouseflow.com', 'fullstory.com',
  'mixpanel.com', 'amplitude.com', 'segment.io', 'segment.com',
  'optimizely.com', 'crazyegg.com',
  'newrelic.com', 'nr-data.net',
  'sentry.io', 'bugsnag.com',
  'adroll.com', 'criteo.com', 'outbrain.com', 'taboola.com',
  'scorecardresearch.com', 'quantserve.com', 'comscore.com',
  'rubiconproject.com', 'pubmatic.com', 'openx.net',
  'casalemedia.com', 'moatads.com', 'omtrdc.net',
  'demdex.net', 'krxd.net', 'bluekai.com'
]);

// ============================================
// Application State Manager
// ============================================

class AppState {
  constructor() {
    this.store = new Store({
      name: 'sandiego-config',
      defaults: {
        privacy: {
          torEnabled: false,
          blockTrackers: true,
          blockFingerprinting: true,
          blockThirdPartyCookies: true,
          blockWebRTC: true,
          doNotTrack: true,
          spoofUserAgent: true,
          httpsUpgrade: true,
          clearOnExit: false
        },
        bookmarks: [],
        history: []
      }
    });

    this.mainWindow = null;
    this.tabs = new Map();
    this.activeTabId = null;
    this.tabCounter = 0;
    this.panelOpen = false;
    this.panelWidth = 0;
    this.privacyApplied = false;
  }

  get privacy() {
    return this.store.get('privacy');
  }

  setPrivacy(key, value) {
    const privacy = this.privacy;
    privacy[key] = value;
    this.store.set('privacy', privacy);
    return privacy;
  }

  generateTabId() {
    return `tab-${++this.tabCounter}-${Date.now()}`;
  }
}

const state = new AppState();

// ============================================
// Main Window Creation
// ============================================

function createMainWindow() {
  state.mainWindow = new BrowserWindow({
    width: CONFIG.window.width,
    height: CONFIG.window.height,
    minWidth: CONFIG.window.minWidth,
    minHeight: CONFIG.window.minHeight,
    frame: false,
    backgroundColor: '#0D0D0F',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false
  });

  state.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  state.mainWindow.once('ready-to-show', () => {
    state.mainWindow.show();
    applyPrivacySettings();
  });

  state.mainWindow.on('resize', debounce(() => {
    updateAllTabBounds();
  }, 16));

  state.mainWindow.on('closed', () => {
    state.mainWindow = null;
  });

  state.mainWindow.on('close', async () => {
    if (state.privacy.clearOnExit) {
      await clearBrowsingData();
    }
  });

  setupApplicationMenu();
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function setupApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: 'About SANDIEGO', role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => reloadActiveTab() },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => zoomActiveTab(0.5) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => zoomActiveTab(-0.5) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => zoomActiveTab(0, true) },
        { type: 'separator' },
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => toggleDevTools() }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ============================================
// Tab Management System
// ============================================

function createTab(tabId, url = null) {
  if (!state.mainWindow) return null;

  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, '../preload/webview-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  const tabData = {
    view,
    url: url || '',
    title: 'New Tab',
    favicon: null,
    loading: false,
    canGoBack: false,
    canGoForward: false
  };

  state.tabs.set(tabId, tabData);
  state.mainWindow.addBrowserView(view);

  updateTabBounds(tabId);
  applyPrivacyToView(view);
  setupViewEventHandlers(tabId, view);

  if (url) {
    navigateTab(tabId, url);
  }

  return tabId;
}

function setupViewEventHandlers(tabId, view) {
  const wc = view.webContents;

  wc.on('did-start-loading', () => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.loading = true;
      notifyRenderer('tab-loading', { tabId, loading: true });
    }
  });

  wc.on('did-stop-loading', () => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.loading = false;
      notifyRenderer('tab-loading', { tabId, loading: false });
    }
  });

  wc.on('did-navigate', (event, url) => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.url = url;
      tab.canGoBack = wc.canGoBack();
      tab.canGoForward = wc.canGoForward();
      notifyRenderer('tab-navigated', {
        tabId,
        url,
        canGoBack: tab.canGoBack,
        canGoForward: tab.canGoForward
      });
    }
  });

  wc.on('did-navigate-in-page', (event, url) => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.url = url;
      notifyRenderer('tab-navigated', { tabId, url });
    }
  });

  wc.on('page-title-updated', (event, title) => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.title = title || 'Untitled';
      notifyRenderer('tab-title-updated', { tabId, title: tab.title });
    }
  });

  wc.on('page-favicon-updated', (event, favicons) => {
    const tab = state.tabs.get(tabId);
    if (tab && favicons && favicons.length > 0) {
      tab.favicon = favicons[0];
      notifyRenderer('tab-favicon-updated', { tabId, favicon: tab.favicon });
    }
  });

  wc.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode !== -3) {
      notifyRenderer('tab-error', {
        tabId,
        error: errorDescription,
        url: validatedURL,
        code: errorCode
      });
    }
  });

  wc.setWindowOpenHandler(({ url }) => {
    const newTabId = state.generateTabId();
    createTab(newTabId, url);
    notifyRenderer('tab-created', { tabId: newTabId, url });
    return { action: 'deny' };
  });

  if (state.privacy.blockFingerprinting) {
    applyFingerprintProtection(wc);
  }
}

function updateTabBounds(tabId) {
  const tab = state.tabs.get(tabId);
  if (!tab || !state.mainWindow) return;

  const bounds = state.mainWindow.getContentBounds();
  const { titleBarHeight, tabBarHeight, navBarHeight } = CONFIG.layout;

  const topOffset = titleBarHeight + tabBarHeight + navBarHeight;
  const leftOffset = state.panelOpen ? state.panelWidth : 0;

  tab.view.setBounds({
    x: leftOffset,
    y: topOffset,
    width: Math.max(1, bounds.width - leftOffset),
    height: Math.max(1, bounds.height - topOffset)
  });
}

function updateAllTabBounds() {
  for (const tabId of state.tabs.keys()) {
    if (tabId === state.activeTabId) {
      updateTabBounds(tabId);
    }
  }
}

function showTab(tabId) {
  const tab = state.tabs.get(tabId);
  if (!tab || !state.mainWindow) return;

  // Hide other views by setting zero bounds
  for (const [id, t] of state.tabs) {
    if (id !== tabId) {
      t.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  }

  state.activeTabId = tabId;
  updateTabBounds(tabId);
  tab.view.webContents.focus();

  notifyRenderer('tab-activated', {
    tabId,
    url: tab.url,
    title: tab.title,
    canGoBack: tab.canGoBack,
    canGoForward: tab.canGoForward
  });
}

function closeTab(tabId) {
  const tab = state.tabs.get(tabId);
  if (!tab || !state.mainWindow) return;

  state.mainWindow.removeBrowserView(tab.view);

  if (tab.view.webContents && !tab.view.webContents.isDestroyed()) {
    tab.view.webContents.destroy();
  }

  state.tabs.delete(tabId);

  if (state.activeTabId === tabId) {
    const remaining = Array.from(state.tabs.keys());
    if (remaining.length > 0) {
      showTab(remaining[remaining.length - 1]);
    } else {
      state.activeTabId = null;
    }
  }
}

function navigateTab(tabId, url) {
  const tab = state.tabs.get(tabId);
  if (!tab) return;

  let processedUrl = processUrl(url);

  if (state.privacy.httpsUpgrade && processedUrl.startsWith('http://')) {
    const urlObj = new URL(processedUrl);
    if (urlObj.hostname !== 'localhost' && !urlObj.hostname.startsWith('127.')) {
      processedUrl = processedUrl.replace('http://', 'https://');
    }
  }

  tab.url = processedUrl;
  tab.view.webContents.loadURL(processedUrl).catch(err => {
    console.error(`Navigation error: ${err.message}`);
  });
}

function processUrl(input) {
  if (!input || typeof input !== 'string') return 'about:blank';
  input = input.trim();

  if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('file://')) {
    return input;
  }

  if (input.startsWith('localhost') || input.match(/^127\.\d+\.\d+\.\d+/)) {
    return `http://${input}`;
  }

  if (input.includes('.') && !input.includes(' ')) {
    return `https://${input}`;
  }

  return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
}

// ============================================
// Privacy Protection System
// ============================================

function applyPrivacySettings() {
  if (state.privacyApplied) return;
  state.privacyApplied = true;

  const ses = session.defaultSession;
  const privacy = state.privacy;

  // Block trackers
  if (privacy.blockTrackers) {
    ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      try {
        const url = new URL(details.url);
        const hostname = url.hostname;

        for (const tracker of TRACKER_DOMAINS) {
          if (hostname === tracker || hostname.endsWith(`.${tracker}`)) {
            callback({ cancel: true });
            return;
          }
        }
      } catch (e) {
        // Invalid URL, allow through
      }
      callback({ cancel: false });
    });
  }

  // Block third-party cookies
  if (privacy.blockThirdPartyCookies) {
    ses.webRequest.onHeadersReceived((details, callback) => {
      if (!state.privacy.blockThirdPartyCookies) {
        callback({ responseHeaders: details.responseHeaders });
        return;
      }

      try {
        const requestUrl = new URL(details.url);
        const requestDomain = getBaseDomain(requestUrl.hostname);
        let isThirdParty = false;

        if (details.referrer) {
          try {
            const referrerUrl = new URL(details.referrer);
            const referrerDomain = getBaseDomain(referrerUrl.hostname);
            isThirdParty = requestDomain !== referrerDomain;
          } catch (e) {
            // Ignore
          }
        }

        if (isThirdParty && details.responseHeaders) {
          const filtered = {};
          for (const [key, value] of Object.entries(details.responseHeaders)) {
            if (key.toLowerCase() !== 'set-cookie') {
              filtered[key] = value;
            }
          }
          callback({ responseHeaders: filtered });
        } else {
          callback({ responseHeaders: details.responseHeaders });
        }
      } catch (e) {
        callback({ responseHeaders: details.responseHeaders });
      }
    });
  }

  // Add privacy headers
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = { ...details.requestHeaders };
    const currentPrivacy = state.privacy;

    if (currentPrivacy.doNotTrack) {
      headers['DNT'] = '1';
      headers['Sec-GPC'] = '1';
    }

    if (currentPrivacy.spoofUserAgent) {
      headers['User-Agent'] = CONFIG.privacy.defaultUserAgent;
    }

    callback({ requestHeaders: headers });
  });

  // Configure Tor proxy if enabled
  applyTorProxy();
}

function applyTorProxy() {
  const ses = session.defaultSession;
  const privacy = state.privacy;

  if (privacy.torEnabled) {
    ses.setProxy({ proxyRules: CONFIG.privacy.torProxy }).then(() => {
      console.log('Tor proxy enabled');
      notifyRenderer('privacy-updated', { ...privacy, torConnected: true });
    }).catch(err => {
      console.error('Tor proxy error:', err);
      notifyRenderer('notification', {
        type: 'error',
        message: 'Failed to connect to Tor. Ensure Tor service is running.'
      });
    });
  } else {
    ses.setProxy({ proxyRules: '' }).catch(() => {});
  }
}

function applyPrivacyToView(view) {
  const privacy = state.privacy;

  if (privacy.blockWebRTC) {
    view.webContents.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');
  }
}

function applyFingerprintProtection(webContents) {
  webContents.on('dom-ready', () => {
    webContents.executeJavaScript(`
      (function() {
        'use strict';

        // Canvas fingerprint protection
        const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
          const ctx = this.getContext('2d');
          if (ctx) {
            try {
              const imageData = ctx.getImageData(0, 0, this.width, this.height);
              const data = imageData.data;
              for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i] ^ (Math.random() * 2 | 0);
              }
              ctx.putImageData(imageData, 0, 0);
            } catch(e) {}
          }
          return origToDataURL.apply(this, arguments);
        };

        // WebGL fingerprint protection
        const origGetParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(param) {
          if (param === 37445) return 'Intel Inc.';
          if (param === 37446) return 'Intel Iris OpenGL Engine';
          return origGetParameter.apply(this, arguments);
        };

        // Screen property standardization
        try {
          Object.defineProperty(screen, 'width', { value: 1920, configurable: true });
          Object.defineProperty(screen, 'height', { value: 1080, configurable: true });
          Object.defineProperty(screen, 'availWidth', { value: 1920, configurable: true });
          Object.defineProperty(screen, 'availHeight', { value: 1040, configurable: true });
          Object.defineProperty(screen, 'colorDepth', { value: 24, configurable: true });
          Object.defineProperty(screen, 'pixelDepth', { value: 24, configurable: true });
        } catch(e) {}

        // Remove battery API
        if (navigator.getBattery) {
          delete navigator.getBattery;
        }
      })();
    `).catch(() => {});
  });
}

function getBaseDomain(hostname) {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

async function clearBrowsingData() {
  const ses = session.defaultSession;
  try {
    await ses.clearCache();
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers']
    });
  } catch (err) {
    console.error('Clear data error:', err);
  }
}

// ============================================
// Navigation Helpers
// ============================================

function reloadActiveTab(ignoreCache = false) {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab) {
    if (ignoreCache) {
      tab.view.webContents.reloadIgnoringCache();
    } else {
      tab.view.webContents.reload();
    }
  }
}

function zoomActiveTab(delta, reset = false) {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab) {
    if (reset) {
      tab.view.webContents.setZoomLevel(0);
    } else {
      const current = tab.view.webContents.getZoomLevel();
      tab.view.webContents.setZoomLevel(Math.max(-5, Math.min(5, current + delta)));
    }
  }
}

function toggleDevTools() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab) {
    tab.view.webContents.toggleDevTools();
  }
}

// ============================================
// IPC Handlers
// ============================================

function setupIpcHandlers() {
  // Window controls
  ipcMain.on('window-minimize', () => state.mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (state.mainWindow?.isMaximized()) {
      state.mainWindow.unmaximize();
    } else {
      state.mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => state.mainWindow?.close());

  // Tab management
  ipcMain.handle('create-tab', (event, url) => {
    const tabId = state.generateTabId();
    createTab(tabId, url);
    return tabId;
  });

  ipcMain.on('show-tab', (event, tabId) => showTab(tabId));
  ipcMain.on('close-tab', (event, tabId) => closeTab(tabId));
  ipcMain.on('navigate', (event, tabId, url) => navigateTab(tabId, url));

  ipcMain.on('go-back', (event, tabId) => {
    const tab = state.tabs.get(tabId);
    if (tab && tab.view.webContents.canGoBack()) {
      tab.view.webContents.goBack();
    }
  });

  ipcMain.on('go-forward', (event, tabId) => {
    const tab = state.tabs.get(tabId);
    if (tab && tab.view.webContents.canGoForward()) {
      tab.view.webContents.goForward();
    }
  });

  ipcMain.on('reload', (event, tabId) => {
    const tab = state.tabs.get(tabId);
    if (tab) tab.view.webContents.reload();
  });

  // Panel management
  ipcMain.on('panel-toggle', (event, open, width) => {
    state.panelOpen = open;
    state.panelWidth = width || CONFIG.layout.panelWidth;
    updateAllTabBounds();
  });

  // Privacy settings
  ipcMain.handle('get-privacy-settings', () => state.privacy);

  ipcMain.handle('set-privacy-setting', (event, key, value) => {
    const privacy = state.setPrivacy(key, value);

    if (key === 'torEnabled') {
      applyTorProxy();
    }

    notifyRenderer('privacy-updated', privacy);
    return privacy;
  });

  // Bookmarks
  ipcMain.handle('get-bookmarks', () => state.store.get('bookmarks', []));

  ipcMain.handle('add-bookmark', (event, bookmark) => {
    const bookmarks = state.store.get('bookmarks', []);
    if (!bookmarks.some(b => b.url === bookmark.url)) {
      bookmarks.push({
        ...bookmark,
        id: `bm-${Date.now()}`,
        createdAt: Date.now()
      });
      state.store.set('bookmarks', bookmarks);
    }
    return bookmarks;
  });

  ipcMain.handle('remove-bookmark', (event, url) => {
    let bookmarks = state.store.get('bookmarks', []);
    bookmarks = bookmarks.filter(b => b.url !== url);
    state.store.set('bookmarks', bookmarks);
    return bookmarks;
  });

  // Clear data
  ipcMain.handle('clear-browsing-data', async () => {
    await clearBrowsingData();
    return true;
  });

  // Screenshot
  ipcMain.handle('capture-screenshot', async () => {
    if (!state.activeTabId) return null;
    const tab = state.tabs.get(state.activeTabId);
    if (!tab) return null;

    try {
      const image = await tab.view.webContents.capturePage();
      return image.toDataURL();
    } catch (err) {
      console.error('Screenshot error:', err);
      return null;
    }
  });

  // Get page info
  ipcMain.handle('get-page-info', async () => {
    if (!state.activeTabId) return null;
    const tab = state.tabs.get(state.activeTabId);
    if (!tab) return null;

    try {
      return await tab.view.webContents.executeJavaScript(`
        (function() {
          const meta = {};
          document.querySelectorAll('meta').forEach(m => {
            const name = m.getAttribute('name') || m.getAttribute('property');
            const content = m.getAttribute('content');
            if (name && content) meta[name] = content;
          });
          return {
            title: document.title,
            url: window.location.href,
            meta: meta
          };
        })()
      `);
    } catch (err) {
      return null;
    }
  });

  // ============================================
  // Phone Intelligence IPC Handlers
  // ============================================

  ipcMain.handle('phone-intel-get-countries', () => {
    return COUNTRY_CODES;
  });

  ipcMain.handle('phone-intel-generate-formats', (event, phoneNumber, countryCode) => {
    try {
      const generator = new PhoneFormatGenerator(phoneNumber, countryCode);
      return {
        formats: generator.generateFormats(),
        searchQueries: generator.generateSearchQueries(generator.generateFormats()),
        smartQuery: generator.generateSmartQuery()
      };
    } catch (err) {
      console.error('Phone format generation error:', err);
      return null;
    }
  });

  ipcMain.handle('phone-intel-open-search', async (event, searchUrl) => {
    // Create a new tab with the search URL
    const tabId = state.generateTabId();
    createTab(tabId, searchUrl);
    notifyRenderer('tab-created', { tabId, url: searchUrl });
    return tabId;
  });

  ipcMain.handle('phone-intel-batch-search', async (event, phoneNumber, countryCode, searchEngine) => {
    try {
      const generator = new PhoneFormatGenerator(phoneNumber, countryCode);
      const smartQuery = generator.generateSmartQuery();

      const searchUrl = searchEngine === 'duckduckgo'
        ? smartQuery.duckDuckGoUrl
        : smartQuery.googleUrl;

      const tabId = state.generateTabId();
      createTab(tabId, searchUrl);
      notifyRenderer('tab-created', { tabId, url: searchUrl });

      return { tabId, query: smartQuery.query };
    } catch (err) {
      console.error('Batch search error:', err);
      return null;
    }
  });
}

// ============================================
// Utility Functions
// ============================================

function notifyRenderer(channel, data) {
  if (state.mainWindow && !state.mainWindow.isDestroyed()) {
    state.mainWindow.webContents.send(channel, data);
  }
}

// ============================================
// Application Lifecycle
// ============================================

app.whenReady().then(() => {
  setupIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: prevent file:// navigation from web content
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault();
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
