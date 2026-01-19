/**
 * SANDIEGO Browser - OSINT Investigation Suite
 * Version: 3.1.0
 *
 * A privacy-first browser engineered for Open Source Intelligence gathering.
 * Built for investigators, researchers, and privacy-conscious users.
 *
 * Platform Support: Windows 11, macOS (Intel/ARM), Debian/Ubuntu Linux
 */

const { app, BrowserWindow, BrowserView, ipcMain, session, Menu, nativeTheme, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Store = require('electron-store');
const { PhoneFormatGenerator, PhoneIntelReport, COUNTRY_CODES } = require('../extensions/phone-intel');

// ============================================
// Platform Detection & Configuration
// ============================================

const Platform = {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',

  // Detailed OS info
  get info() {
    const info = {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion ? process.getSystemVersion() : 'unknown',
      isWindows11: false,
      isDebian: false,
      isUbuntu: false,
      isFedora: false,
      isArch: false,
      macVersion: null
    };

    if (this.isWindows) {
      // Detect Windows 11 (build >= 22000)
      try {
        const version = info.version.split('.');
        const build = parseInt(version[2] || 0);
        info.isWindows11 = build >= 22000;
      } catch (e) { /* ignore */ }
    }

    if (this.isLinux) {
      // Detect Linux distribution
      try {
        if (fs.existsSync('/etc/os-release')) {
          const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
          info.isDebian = osRelease.includes('debian') || osRelease.includes('Debian');
          info.isUbuntu = osRelease.includes('ubuntu') || osRelease.includes('Ubuntu');
          info.isFedora = osRelease.includes('fedora') || osRelease.includes('Fedora');
          info.isArch = osRelease.includes('arch') || osRelease.includes('Arch');
        }
      } catch (e) { /* ignore */ }
    }

    if (this.isMac) {
      info.macVersion = info.version;
    }

    return info;
  },

  // Platform-specific Tor paths
  get torPaths() {
    if (this.isWindows) {
      return [
        'C:\\Tor\\tor.exe',
        'C:\\Program Files\\Tor\\tor.exe',
        'C:\\Program Files (x86)\\Tor Browser\\Browser\\TorBrowser\\Tor\\tor.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Tor Browser\\Browser\\TorBrowser\\Tor\\tor.exe'),
        path.join(process.env.PROGRAMFILES || '', 'Tor Browser\\Browser\\TorBrowser\\Tor\\tor.exe')
      ];
    }
    if (this.isMac) {
      return [
        '/usr/local/bin/tor',
        '/opt/homebrew/bin/tor',
        '/Applications/Tor Browser.app/Contents/MacOS/Tor/tor',
        path.join(process.env.HOME || '', 'Applications/Tor Browser.app/Contents/MacOS/Tor/tor')
      ];
    }
    // Linux (Debian, Ubuntu, Fedora, Arch)
    return [
      '/usr/bin/tor',
      '/usr/sbin/tor',
      '/usr/local/bin/tor',
      '/snap/bin/tor'
    ];
  },

  // Check if Tor is running
  isTorRunning() {
    try {
      if (this.isWindows) {
        execSync('netstat -an | findstr ":9050"', { stdio: 'pipe' });
        return true;
      } else {
        execSync('lsof -i :9050 2>/dev/null || ss -tlnp 2>/dev/null | grep :9050', { stdio: 'pipe' });
        return true;
      }
    } catch (e) {
      return false;
    }
  },

  // Platform-specific user agents (blend in with common browsers)
  get userAgents() {
    if (this.isWindows) {
      return {
        firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
    }
    if (this.isMac) {
      return {
        firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
        safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
      };
    }
    // Linux
    return {
      firefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
      chrome: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
  },

  // Get appropriate user agent for blending in
  get defaultUserAgent() {
    // Firefox is preferred for privacy - most common on each platform
    return this.userAgents.firefox;
  },

  // Platform-specific config paths
  get configPath() {
    if (this.isWindows) {
      return path.join(process.env.APPDATA || '', 'SANDIEGO');
    }
    if (this.isMac) {
      return path.join(process.env.HOME || '', 'Library', 'Application Support', 'SANDIEGO');
    }
    // Linux - follow XDG spec
    return path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || '', '.config'), 'sandiego');
  },

  // Platform-specific cache paths
  get cachePath() {
    if (this.isWindows) {
      return path.join(process.env.LOCALAPPDATA || '', 'SANDIEGO', 'Cache');
    }
    if (this.isMac) {
      return path.join(process.env.HOME || '', 'Library', 'Caches', 'SANDIEGO');
    }
    // Linux - follow XDG spec
    return path.join(process.env.XDG_CACHE_HOME || path.join(process.env.HOME || '', '.cache'), 'sandiego');
  }
};

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = {
  version: '3.1.0',
  name: 'SANDIEGO Browser',
  codename: 'OSINT Investigation Suite',

  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    // macOS specific: show traffic lights
    titleBarStyle: Platform.isMac ? 'hiddenInset' : 'default',
    // Windows 11: use native frame for snap layouts
    frame: Platform.isWindows ? false : false,
    // Windows 11 specific rounded corners
    roundedCorners: Platform.isWindows,
  },

  layout: {
    // Adjust title bar height for each platform
    titleBarHeight: Platform.isMac ? 28 : (Platform.isWindows ? 32 : 36),
    tabBarHeight: 38,
    navBarHeight: 44,
    panelWidth: 340,
    // macOS traffic light positioning
    trafficLightPosition: Platform.isMac ? { x: 12, y: 12 } : null
  },

  privacy: {
    // Tor proxy - uses socks5h for DNS resolution through Tor
    torProxy: 'socks5h://127.0.0.1:9050',
    // Platform-specific user agent
    defaultUserAgent: Platform.defaultUserAgent,
    // Alternative user agents for rotation
    userAgentPool: Object.values(Platform.userAgents)
  },

  // Platform info for renderer
  platform: {
    os: process.platform,
    arch: process.arch,
    isWindows: Platform.isWindows,
    isMac: Platform.isMac,
    isLinux: Platform.isLinux,
    info: Platform.info
  }
};

// Tracker domains to block - comprehensive OSINT-aware list
const TRACKER_DOMAINS = new Set([
  // Google
  'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
  'doubleclick.net', 'googleadservices.com', 'google.com/pagead',
  // Meta/Facebook
  'facebook.net', 'connect.facebook.net', 'pixel.facebook.com',
  // Twitter/X
  'analytics.twitter.com', 'ads.twitter.com', 'static.ads-twitter.com',
  // TikTok
  'analytics.tiktok.com', 'ads.tiktok.com',
  // Microsoft
  'bat.bing.com', 'clarity.ms', 'c.bing.com',
  // LinkedIn
  'ads.linkedin.com', 'px.ads.linkedin.com',
  // Analytics Platforms
  'hotjar.com', 'mouseflow.com', 'fullstory.com', 'logrocket.com',
  'mixpanel.com', 'amplitude.com', 'segment.io', 'segment.com', 'heap.io',
  'optimizely.com', 'crazyegg.com', 'luckyorange.com',
  // APM/Error Tracking
  'newrelic.com', 'nr-data.net', 'sentry.io', 'bugsnag.com', 'raygun.com',
  // Ad Networks
  'adroll.com', 'criteo.com', 'outbrain.com', 'taboola.com', 'revcontent.com',
  'scorecardresearch.com', 'quantserve.com', 'comscore.com',
  'rubiconproject.com', 'pubmatic.com', 'openx.net', 'appnexus.com',
  'casalemedia.com', 'moatads.com', 'omtrdc.net', 'bidswitch.net',
  'demdex.net', 'krxd.net', 'bluekai.com', 'exelator.com',
  // CDN Tracking
  'cdn.mxpnl.com', 'cdn.heapanalytics.com'
]);

// ============================================
// Application State Manager
// ============================================

class AppState {
  constructor() {
    this.store = new Store({
      name: 'sandiego-config',
      cwd: Platform.configPath,
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
        appearance: {
          theme: 'dark', // Always dark for OSINT work
          accentColor: 'red'
        },
        bookmarks: [],
        history: [],
        platform: Platform.info
      }
    });

    this.mainWindow = null;
    this.tabs = new Map();
    this.activeTabId = null;
    this.tabCounter = 0;
    this.panelOpen = false;
    this.panelWidth = 0;
    this.privacyApplied = false;
    this.torAvailable = Platform.isTorRunning();
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

  // Refresh Tor status
  refreshTorStatus() {
    this.torAvailable = Platform.isTorRunning();
    return this.torAvailable;
  }
}

const state = new AppState();

// ============================================
// Main Window Creation
// ============================================

function createMainWindow() {
  const windowConfig = {
    width: CONFIG.window.width,
    height: CONFIG.window.height,
    minWidth: CONFIG.window.minWidth,
    minHeight: CONFIG.window.minHeight,
    backgroundColor: '#0D0D0F',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    },
    show: false
  };

  // Platform-specific window configuration
  if (Platform.isMac) {
    // macOS: Hidden inset title bar with traffic lights
    windowConfig.titleBarStyle = 'hiddenInset';
    windowConfig.trafficLightPosition = CONFIG.layout.trafficLightPosition;
    windowConfig.vibrancy = 'under-window';
    windowConfig.visualEffectState = 'active';
  } else if (Platform.isWindows) {
    // Windows: Frameless with custom controls
    windowConfig.frame = false;
    // Windows 11 rounded corners
    if (Platform.info.isWindows11) {
      windowConfig.backgroundMaterial = 'none';
    }
  } else {
    // Linux: Frameless (works well on GNOME, KDE, XFCE)
    windowConfig.frame = false;
  }

  state.mainWindow = new BrowserWindow(windowConfig);

  state.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  state.mainWindow.once('ready-to-show', () => {
    state.mainWindow.show();
    applyPrivacySettings();

    // Send platform info to renderer
    notifyRenderer('platform-info', CONFIG.platform);

    // Check Tor availability and notify
    if (state.torAvailable) {
      notifyRenderer('notification', {
        type: 'info',
        message: 'Tor service detected. Enable in Privacy settings.'
      });
    }
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

  // macOS specific: handle window state
  if (Platform.isMac) {
    state.mainWindow.on('enter-full-screen', () => {
      notifyRenderer('fullscreen-change', true);
    });
    state.mainWindow.on('leave-full-screen', () => {
      notifyRenderer('fullscreen-change', false);
    });
  }

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
  const template = [];

  // macOS app menu
  if (Platform.isMac) {
    template.push({
      label: app.name,
      submenu: [
        { label: 'About SANDIEGO', role: 'about' },
        { type: 'separator' },
        { label: 'Check for Tor...', click: () => checkTorAndNotify() },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  // File menu
  template.push({
    label: 'File',
    submenu: [
      { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: () => createNewTabFromMenu() },
      { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => closeActiveTab() },
      { type: 'separator' },
      { label: 'New Window', accelerator: 'CmdOrCtrl+Shift+N', click: () => createMainWindow() },
      { type: 'separator' },
      ...(Platform.isMac ? [] : [{ role: 'quit' }])
    ]
  });

  // Edit menu
  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(Platform.isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  });

  // View menu
  template.push({
    label: 'View',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => reloadActiveTab() },
      { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => reloadActiveTab(true) },
      { type: 'separator' },
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => zoomActiveTab(0.5) },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => zoomActiveTab(-0.5) },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => zoomActiveTab(0, true) },
      { type: 'separator' },
      { label: 'Toggle DevTools', accelerator: Platform.isMac ? 'Cmd+Option+I' : 'F12', click: () => toggleDevTools() },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  });

  // OSINT menu (unique to this browser)
  template.push({
    label: 'OSINT',
    submenu: [
      { label: 'Phone Intelligence...', accelerator: 'CmdOrCtrl+Shift+P', click: () => notifyRenderer('open-panel', 'phone-intel') },
      { label: 'OSINT Bookmarks', accelerator: 'CmdOrCtrl+Shift+B', click: () => notifyRenderer('open-panel', 'bookmarks') },
      { type: 'separator' },
      { label: 'Capture Screenshot', accelerator: 'CmdOrCtrl+Shift+S', click: () => captureScreenshot() },
      { label: 'View Page Source', accelerator: 'CmdOrCtrl+U', click: () => viewPageSource() },
      { type: 'separator' },
      { label: 'Clear All Data', click: () => clearBrowsingData() }
    ]
  });

  // Privacy menu
  template.push({
    label: 'Privacy',
    submenu: [
      { label: 'Privacy Dashboard...', accelerator: 'CmdOrCtrl+Shift+D', click: () => notifyRenderer('open-panel', 'privacy') },
      { type: 'separator' },
      { label: 'Toggle Tor', accelerator: 'CmdOrCtrl+Shift+T', click: () => toggleTor() },
      { label: 'Check Tor Status', click: () => checkTorAndNotify() },
      { type: 'separator' },
      { label: 'Clear Browsing Data', click: () => clearBrowsingData() }
    ]
  });

  // Window menu (primarily macOS)
  if (Platform.isMac) {
    template.push({
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    });
  }

  // Help menu
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'OSINT Resources',
        click: async () => {
          await shell.openExternal('https://osintframework.com/');
        }
      },
      {
        label: 'Report Issue',
        click: async () => {
          await shell.openExternal('https://github.com/thumpersecure/Spin/issues');
        }
      },
      { type: 'separator' },
      { label: `SANDIEGO v${CONFIG.version}`, enabled: false },
      { label: `Platform: ${Platform.info.platform} ${Platform.info.arch}`, enabled: false }
    ]
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Helper functions for menu actions
function createNewTabFromMenu() {
  const tabId = state.generateTabId();
  createTab(tabId, null);
  notifyRenderer('tab-created', { tabId, url: '' });
}

function closeActiveTab() {
  if (state.activeTabId) {
    closeTab(state.activeTabId);
  }
}

function checkTorAndNotify() {
  const available = state.refreshTorStatus();
  notifyRenderer('notification', {
    type: available ? 'success' : 'warning',
    message: available ? 'Tor service is running and ready.' : 'Tor service not detected. Please start Tor.'
  });
  notifyRenderer('tor-status', { available });
}

function toggleTor() {
  const current = state.privacy.torEnabled;
  state.setPrivacy('torEnabled', !current);
  applyTorProxy();
  notifyRenderer('privacy-updated', state.privacy);
}

async function captureScreenshot() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (!tab) return;

  try {
    const image = await tab.view.webContents.capturePage();
    const dataUrl = image.toDataURL();
    notifyRenderer('screenshot-captured', { dataUrl });
  } catch (err) {
    console.error('Screenshot error:', err);
  }
}

function viewPageSource() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab && tab.url) {
    const sourceUrl = `view-source:${tab.url}`;
    const tabId = state.generateTabId();
    createTab(tabId, sourceUrl);
    notifyRenderer('tab-created', { tabId, url: sourceUrl });
  }
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
      allowRunningInsecureContent: false,
      // Platform-specific preferences
      spellcheck: true,
      enableWebSQL: false
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
    if (errorCode !== -3) { // -3 is aborted, not an error
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
    try {
      const urlObj = new URL(processedUrl);
      if (urlObj.hostname !== 'localhost' && !urlObj.hostname.startsWith('127.')) {
        processedUrl = processedUrl.replace('http://', 'https://');
      }
    } catch (e) { /* ignore invalid URLs */ }
  }

  tab.url = processedUrl;
  tab.view.webContents.loadURL(processedUrl).catch(err => {
    console.error(`Navigation error: ${err.message}`);
  });
}

function processUrl(input) {
  if (!input || typeof input !== 'string') return 'about:blank';
  input = input.trim();

  // Direct protocol URLs
  if (input.startsWith('http://') || input.startsWith('https://') ||
      input.startsWith('file://') || input.startsWith('view-source:')) {
    return input;
  }

  // Localhost
  if (input.startsWith('localhost') || input.match(/^127\.\d+\.\d+\.\d+/)) {
    return `http://${input}`;
  }

  // Looks like a domain
  if (input.includes('.') && !input.includes(' ')) {
    return `https://${input}`;
  }

  // Search query - use DuckDuckGo for privacy
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
    // Check if Tor is actually running first
    if (!Platform.isTorRunning()) {
      notifyRenderer('notification', {
        type: 'error',
        message: Platform.isWindows
          ? 'Tor not running. Start tor.exe from your Tor installation.'
          : Platform.isMac
            ? 'Tor not running. Run: brew services start tor'
            : 'Tor not running. Run: sudo systemctl start tor'
      });
      state.setPrivacy('torEnabled', false);
      notifyRenderer('privacy-updated', state.privacy);
      return;
    }

    ses.setProxy({ proxyRules: CONFIG.privacy.torProxy }).then(() => {
      console.log('Tor proxy enabled');
      notifyRenderer('privacy-updated', { ...privacy, torConnected: true });
      notifyRenderer('notification', {
        type: 'success',
        message: 'Connected to Tor network. Your traffic is now anonymized.'
      });
    }).catch(err => {
      console.error('Tor proxy error:', err);
      state.setPrivacy('torEnabled', false);
      notifyRenderer('notification', {
        type: 'error',
        message: 'Failed to connect to Tor proxy.'
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
    // Platform-aware fingerprint protection
    const platformMask = Platform.isWindows ? 'Win32' : (Platform.isMac ? 'MacIntel' : 'Linux x86_64');

    webContents.executeJavaScript(`
      (function() {
        'use strict';

        // Canvas fingerprint protection - add subtle noise
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

        // WebGL2 fingerprint protection
        if (typeof WebGL2RenderingContext !== 'undefined') {
          const origGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
          WebGL2RenderingContext.prototype.getParameter = function(param) {
            if (param === 37445) return 'Intel Inc.';
            if (param === 37446) return 'Intel Iris OpenGL Engine';
            return origGetParameter2.apply(this, arguments);
          };
        }

        // Screen property standardization (common resolution)
        try {
          Object.defineProperty(screen, 'width', { value: 1920, configurable: true });
          Object.defineProperty(screen, 'height', { value: 1080, configurable: true });
          Object.defineProperty(screen, 'availWidth', { value: 1920, configurable: true });
          Object.defineProperty(screen, 'availHeight', { value: 1040, configurable: true });
          Object.defineProperty(screen, 'colorDepth', { value: 24, configurable: true });
          Object.defineProperty(screen, 'pixelDepth', { value: 24, configurable: true });
        } catch(e) {}

        // Platform mask
        try {
          Object.defineProperty(navigator, 'platform', { value: '${platformMask}', configurable: true });
        } catch(e) {}

        // Remove battery API (privacy leak)
        if (navigator.getBattery) {
          Object.defineProperty(navigator, 'getBattery', { value: undefined, configurable: true });
        }

        // Spoof hardware concurrency (common value)
        try {
          Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4, configurable: true });
        } catch(e) {}

        // Spoof device memory (common value)
        try {
          Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
        } catch(e) {}

        // Hide automation indicators
        try {
          Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
        } catch(e) {}
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
      storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
    });
    notifyRenderer('notification', {
      type: 'success',
      message: 'All browsing data cleared.'
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
  // Platform info
  ipcMain.handle('get-platform-info', () => CONFIG.platform);
  ipcMain.handle('check-tor-status', () => ({ available: state.refreshTorStatus() }));

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
      // Input validation
      if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length > 30) {
        return null;
      }
      const generator = new PhoneFormatGenerator(phoneNumber, countryCode);
      const formats = generator.generateFormats();
      return {
        formats,
        searchQueries: generator.generateSearchQueries(formats),
        smartQuery: generator.generateSmartQuery()
      };
    } catch (err) {
      console.error('Phone format generation error:', err);
      return null;
    }
  });

  ipcMain.handle('phone-intel-open-search', async (event, searchUrl) => {
    // Validate URL - only allow trusted search engines
    if (!searchUrl || typeof searchUrl !== 'string') return null;
    try {
      const url = new URL(searchUrl);
      const allowedHosts = ['www.google.com', 'google.com', 'duckduckgo.com', 'www.duckduckgo.com'];
      if (!allowedHosts.includes(url.hostname)) {
        console.warn(`Blocked search URL with untrusted host: ${url.hostname}`);
        return null;
      }
    } catch {
      return null;
    }
    const tabId = state.generateTabId();
    createTab(tabId, searchUrl);
    notifyRenderer('tab-created', { tabId, url: searchUrl });
    return tabId;
  });

  ipcMain.handle('phone-intel-batch-search', async (event, phoneNumber, countryCode, searchEngine) => {
    try {
      // Input validation
      if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length > 30) {
        return null;
      }
      if (searchEngine !== 'duckduckgo' && searchEngine !== 'google') {
        searchEngine = 'duckduckgo'; // Default to privacy-respecting search
      }
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

// Set app user model ID for Windows
if (Platform.isWindows) {
  app.setAppUserModelId('com.sandiego.browser');
}

app.whenReady().then(() => {
  // Force dark mode for OSINT work
  nativeTheme.themeSource = 'dark';

  setupIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!Platform.isMac) {
    app.quit();
  }
});

// Security: Comprehensive web content security
app.on('web-contents-created', (event, contents) => {
  // Prevent file:// and javascript: navigation
  contents.on('will-navigate', (navEvent, url) => {
    if (url.startsWith('file://') || url.startsWith('javascript:') || url.startsWith('data:')) {
      navEvent.preventDefault();
    }
  });

  // Block new window creation to untrusted origins
  contents.setWindowOpenHandler(({ url }) => {
    // Only allow http/https URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Disable remote module (deprecated but ensure it's off)
  contents.on('remote-require', (event) => event.preventDefault());
  contents.on('remote-get-builtin', (event) => event.preventDefault());
  contents.on('remote-get-global', (event) => event.preventDefault());
  contents.on('remote-get-current-window', (event) => event.preventDefault());
  contents.on('remote-get-current-web-contents', (event) => event.preventDefault());
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
