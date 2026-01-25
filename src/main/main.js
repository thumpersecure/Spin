/**
 * CONSTANTINE Browser - OSINT Investigation Suite
 * Version: 4.2.0 - The Exorcist's Edge
 *
 * A privacy-first browser engineered for Open Source Intelligence gathering.
 * Built for investigators, researchers, and privacy-conscious users.
 *
 * "Between Heaven and Hell, intelligence prevails."
 *
 * Platform Support: Windows 11, macOS (Intel/ARM), Parrot OS, Debian Linux
 *
 * Version History:
 * - v1.0: Dick Tracy Edition (Original SANDIEGO)
 * - v2.0: Tracey Edition (Hollywood Noir)
 * - v3.x: Carmen Sandiego Edition (International Investigation)
 * - v4.x: CONSTANTINE Edition (Supernatural Noir) - CURRENT
 */

const { app, BrowserWindow, BrowserView, ipcMain, session, Menu, nativeTheme, shell, dialog, clipboard, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const Store = require('electron-store');
const { PhoneFormatGenerator, COUNTRY_CODES } = require('../extensions/phone-intel');
const { AIResearchAssistant } = require('../extensions/ai-research-assistant');
const { AIPrivacyShield } = require('../extensions/ai-privacy-shield');
const { AIResearchTools } = require('../extensions/ai-research-tools');
const { AICognitiveTools } = require('../extensions/ai-cognitive-tools');

// Initialize AI modules
const aiResearchAssistant = new AIResearchAssistant();
const aiPrivacyShield = new AIPrivacyShield();
const aiResearchTools = new AIResearchTools();
const aiCognitiveTools = new AICognitiveTools();

// ============================================
// Platform Detection & Configuration
// ============================================

const Platform = {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',

  // Detailed OS info with caching
  _infoCache: null,
  get info() {
    if (this._infoCache) return this._infoCache;

    const info = {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion ? process.getSystemVersion() : 'unknown',
      isWindows11: false,
      isParrotOS: false,
      isDebian: false,
      isFedora: false,
      isArch: false,
      macVersion: null,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node
    };

    if (this.isWindows) {
      try {
        const version = info.version.split('.');
        const build = parseInt(version[2] || 0);
        info.isWindows11 = build >= 22000;
      } catch (_e) { /* ignore */ }
    }

    if (this.isLinux) {
      try {
        if (fs.existsSync('/etc/os-release')) {
          const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
          info.isParrotOS = /parrot/i.test(osRelease);
          info.isDebian = /debian/i.test(osRelease);
          info.isFedora = /fedora/i.test(osRelease);
          info.isArch = /arch/i.test(osRelease);
        }
      } catch (_e) { /* ignore */ }
    }

    if (this.isMac) {
      info.macVersion = info.version;
    }

    this._infoCache = info;
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
    return [
      '/usr/bin/tor',
      '/usr/sbin/tor',
      '/usr/local/bin/tor',
      '/snap/bin/tor'
    ];
  },

  // Check if Tor is running with timeout (async to avoid blocking main thread)
  async isTorRunning() {
    try {
      const cmd = this.isWindows
        ? 'netstat -an | findstr ":9050"'
        : 'lsof -i :9050 2>/dev/null || ss -tlnp 2>/dev/null | grep :9050';
      await execAsync(cmd, { timeout: 5000 });
      return true;
    } catch (_e) {
      return false;
    }
  },

  // Platform-specific user agents
  get userAgents() {
    if (this.isWindows) {
      return {
        firefox: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0`,
        chrome: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36`
      };
    }
    if (this.isMac) {
      return {
        firefox: `Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:122.0) Gecko/20100101 Firefox/122.0`,
        safari: `Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15`
      };
    }
    return {
      firefox: `Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0`,
      chrome: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36`
    };
  },

  get defaultUserAgent() {
    return this.userAgents.firefox;
  },

  // Platform-specific config paths
  get configPath() {
    if (this.isWindows) {
      return path.join(process.env.APPDATA || '', 'CONSTANTINE');
    }
    if (this.isMac) {
      return path.join(process.env.HOME || '', 'Library', 'Application Support', 'CONSTANTINE');
    }
    return path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || '', '.config'), 'constantine');
  },

  get cachePath() {
    if (this.isWindows) {
      return path.join(process.env.LOCALAPPDATA || '', 'CONSTANTINE', 'Cache');
    }
    if (this.isMac) {
      return path.join(process.env.HOME || '', 'Library', 'Caches', 'CONSTANTINE');
    }
    return path.join(process.env.XDG_CACHE_HOME || path.join(process.env.HOME || '', '.cache'), 'constantine');
  },

  get downloadPath() {
    if (this.isWindows) {
      return path.join(process.env.USERPROFILE || '', 'Downloads');
    }
    return path.join(process.env.HOME || '', 'Downloads');
  }
};

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = {
  version: '4.2.0',
  name: 'CONSTANTINE Browser',
  codename: 'The Exorcist\'s Edge',
  theme: 'constantine',
  tagline: 'Between Heaven and Hell, intelligence prevails.',

  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: Platform.isMac ? 'hiddenInset' : 'default',
    frame: Platform.isWindows ? false : false,
    roundedCorners: Platform.isWindows,
  },

  layout: {
    titleBarHeight: Platform.isMac ? 28 : (Platform.isWindows ? 32 : 36),
    tabBarHeight: 38,
    navBarHeight: 44,
    panelWidth: 340,
    trafficLightPosition: Platform.isMac ? { x: 12, y: 12 } : null
  },

  privacy: {
    torProxy: 'socks5h://127.0.0.1:9050',
    defaultUserAgent: Platform.defaultUserAgent,
    userAgentPool: Object.values(Platform.userAgents)
  },

  network: {
    requestTimeout: 30000,
    maxRetries: 3,
    retryDelay: 1000
  },

  platform: {
    os: process.platform,
    arch: process.arch,
    isWindows: Platform.isWindows,
    isMac: Platform.isMac,
    isLinux: Platform.isLinux,
    info: Platform.info
  }
};

// Comprehensive tracker domains list
const TRACKER_DOMAINS = new Set([
  // Google
  'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
  'doubleclick.net', 'googleadservices.com', 'google.com/pagead',
  'googletagservices.com', 'googleoptimize.com', 'googlevideo.com',
  // Meta/Facebook
  'facebook.net', 'connect.facebook.net', 'pixel.facebook.com',
  'facebook.com/tr', 'fbcdn.net/signals',
  // Twitter/X
  'analytics.twitter.com', 'ads.twitter.com', 'static.ads-twitter.com',
  'syndication.twitter.com', 't.co/i/adsct',
  // TikTok
  'analytics.tiktok.com', 'ads.tiktok.com', 'analytics-sg.tiktok.com',
  // Microsoft
  'bat.bing.com', 'clarity.ms', 'c.bing.com', 'c.msn.com',
  // LinkedIn
  'ads.linkedin.com', 'px.ads.linkedin.com', 'snap.licdn.com',
  // Analytics Platforms
  'hotjar.com', 'mouseflow.com', 'fullstory.com', 'logrocket.com',
  'mixpanel.com', 'amplitude.com', 'segment.io', 'segment.com', 'heap.io',
  'optimizely.com', 'crazyegg.com', 'luckyorange.com', 'inspectlet.com',
  'smartlook.com', 'usefathom.com',
  // APM/Error Tracking
  'newrelic.com', 'nr-data.net', 'sentry.io', 'bugsnag.com', 'raygun.com',
  'rollbar.com', 'track-js.com',
  // Ad Networks
  'adroll.com', 'criteo.com', 'outbrain.com', 'taboola.com', 'revcontent.com',
  'scorecardresearch.com', 'quantserve.com', 'comscore.com',
  'rubiconproject.com', 'pubmatic.com', 'openx.net', 'appnexus.com',
  'casalemedia.com', 'moatads.com', 'omtrdc.net', 'bidswitch.net',
  'demdex.net', 'krxd.net', 'bluekai.com', 'exelator.com',
  'adsrvr.org', 'adnxs.com', 'rlcdn.com', 'crwdcntrl.net',
  // CDN Tracking
  'cdn.mxpnl.com', 'cdn.heapanalytics.com', 'cdn.segment.com'
]);

// Known malicious domain patterns (for warning)
const SUSPICIOUS_PATTERNS = [
  /^[a-z0-9]{20,}\.(com|net|org)$/i,  // Random long domain
  /\.(tk|ml|ga|cf|gq)$/i,              // Free TLD often abused
  /bit\.ly|tinyurl|t\.co/i             // URL shorteners (warn only)
];

// ============================================
// Utility Functions
// ============================================

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

function safelyParseUrl(input) {
  if (!input || typeof input !== 'string') return null;
  try {
    return new URL(input);
  } catch (_e) {
    return null;
  }
}

function getBaseDomain(hostname) {
  if (!hostname) return '';
  const parts = hostname.split('.');
  // Handle two-letter TLDs with known second-level domains (co.uk, com.au, etc.)
  const twoLevelTlds = ['co.uk', 'com.au', 'co.nz', 'com.br', 'co.jp', 'com.mx', 'org.uk', 'net.au'];
  const lastTwo = parts.slice(-2).join('.');
  if (twoLevelTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

function isTrackerDomain(hostname) {
  if (!hostname) return false;
  for (const tracker of TRACKER_DOMAINS) {
    if (hostname === tracker || hostname.endsWith(`.${tracker}`)) {
      return true;
    }
  }
  return false;
}

function isSuspiciousDomain(hostname) {
  if (!hostname) return false;
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(hostname));
}

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
          clearOnExit: false,
          warnSuspiciousDomains: true
        },
        appearance: {
          theme: 'dark',
          accentColor: 'red'
        },
        bookmarks: [],
        history: [],
        downloads: [],
        sessions: [],
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
    this.torAvailable = false;
    this.isOnline = true;
    this.downloads = new Map();
    this.certificateErrors = new Map();
    this._initNetworkMonitoring();
  }

  async _initNetworkMonitoring() {
    // Check Tor availability on startup (async to avoid blocking)
    this.torAvailable = await Platform.isTorRunning();

    // Monitor network status
    this.isOnline = net.isOnline();
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

  async refreshTorStatus() {
    this.torAvailable = await Platform.isTorRunning();
    return this.torAvailable;
  }

  // Memory cleanup - prevent Map bloat
  cleanupCertificateErrors() {
    // Keep only errors from the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    for (const [url, error] of this.certificateErrors) {
      if (error.timestamp && error.timestamp < fiveMinutesAgo) {
        this.certificateErrors.delete(url);
      }
    }
  }

  cleanupDownloads() {
    // Remove completed/cancelled downloads older than 10 minutes
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    for (const [id, download] of this.downloads) {
      if (download.completed && download.timestamp < tenMinutesAgo) {
        this.downloads.delete(id);
      }
    }
  }

  // Session management
  saveSession() {
    const sessionData = [];
    for (const [tabId, tab] of this.tabs) {
      if (tab.url && !tab.url.startsWith('about:')) {
        sessionData.push({
          id: tabId,
          url: tab.url,
          title: tab.title,
          isActive: tabId === this.activeTabId
        });
      }
    }
    this.store.set('sessions', sessionData);
    return sessionData;
  }

  getLastSession() {
    return this.store.get('sessions', []);
  }

  // History management
  addToHistory(url, title) {
    if (!url || url.startsWith('about:') || url.startsWith('view-source:')) return;
    const history = this.store.get('history', []);
    const entry = {
      url,
      title: title || url,
      timestamp: Date.now()
    };
    // Remove duplicate if exists
    const filtered = history.filter(h => h.url !== url);
    filtered.unshift(entry);
    // Keep last 1000 entries
    this.store.set('history', filtered.slice(0, 1000));
  }

  getHistory(limit = 100) {
    const history = this.store.get('history', []);
    return history.slice(0, limit);
  }

  clearHistory() {
    this.store.set('history', []);
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
      spellcheck: true,
      enableWebSQL: false,
      webgl: true,
      experimentalFeatures: false
    },
    show: false
  };

  // Platform-specific window configuration
  if (Platform.isMac) {
    windowConfig.titleBarStyle = 'hiddenInset';
    windowConfig.trafficLightPosition = CONFIG.layout.trafficLightPosition;
    windowConfig.vibrancy = 'under-window';
    windowConfig.visualEffectState = 'active';
  } else if (Platform.isWindows) {
    windowConfig.frame = false;
    if (Platform.info.isWindows11) {
      windowConfig.backgroundMaterial = 'none';
    }
  } else {
    windowConfig.frame = false;
  }

  state.mainWindow = new BrowserWindow(windowConfig);

  // Load built Svelte app from dist folder
  state.mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));

  state.mainWindow.once('ready-to-show', () => {
    state.mainWindow.show();
    applyPrivacySettings();

    notifyRenderer('platform-info', CONFIG.platform);
    notifyRenderer('network-status', { online: state.isOnline });

    if (state.torAvailable) {
      notifyRenderer('notification', {
        type: 'info',
        message: 'Tor service detected. Enable in Privacy settings.'
      });
    }

    // Restore last session if available
    const lastSession = state.getLastSession();
    if (lastSession.length > 0) {
      notifyRenderer('session-available', { tabCount: lastSession.length });
    }
  });

  // Window event handlers with proper error handling
  state.mainWindow.on('resize', debounce(() => {
    try {
      updateAllTabBounds();
    } catch (err) {
      console.error('Error updating tab bounds:', err);
    }
  }, 16));

  state.mainWindow.on('closed', () => {
    state.mainWindow = null;
  });

  state.mainWindow.on('close', async (_event) => {
    try {
      // Save session before closing
      state.saveSession();

      if (state.privacy.clearOnExit) {
        await clearBrowsingData();
      }
    } catch (err) {
      console.error('Error during window close:', err);
    }
  });

  // Fullscreen handling
  state.mainWindow.on('enter-full-screen', () => {
    notifyRenderer('fullscreen-change', true);
  });

  state.mainWindow.on('leave-full-screen', () => {
    notifyRenderer('fullscreen-change', false);
  });

  // Focus handling
  state.mainWindow.on('focus', () => {
    notifyRenderer('window-focus', true);
  });

  state.mainWindow.on('blur', () => {
    notifyRenderer('window-focus', false);
  });

  setupApplicationMenu();
}

function setupApplicationMenu() {
  const template = [];

  if (Platform.isMac) {
    template.push({
      label: app.name,
      submenu: [
        { label: 'About CONSTANTINE', role: 'about' },
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

  template.push({
    label: 'File',
    submenu: [
      { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: () => createNewTabFromMenu() },
      { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => closeActiveTab() },
      { type: 'separator' },
      { label: 'New Window', accelerator: 'CmdOrCtrl+Shift+N', click: () => createMainWindow() },
      { type: 'separator' },
      { label: 'Restore Last Session', click: () => restoreLastSession() },
      { type: 'separator' },
      ...(Platform.isMac ? [] : [{ role: 'quit' }])
    ]
  });

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

  template.push({
    label: 'OSINT',
    submenu: [
      { label: 'Phone Intelligence...', accelerator: 'CmdOrCtrl+Shift+P', click: () => notifyRenderer('open-panel', 'phone-intel') },
      { label: 'OSINT Bookmarks', accelerator: 'CmdOrCtrl+Shift+B', click: () => notifyRenderer('open-panel', 'bookmarks') },
      { type: 'separator' },
      { label: 'Capture Screenshot', accelerator: 'CmdOrCtrl+Shift+S', click: () => captureScreenshot() },
      { label: 'View Page Source', accelerator: 'CmdOrCtrl+U', click: () => viewPageSource() },
      { type: 'separator' },
      { label: 'Copy Page as Markdown', click: () => copyPageAsMarkdown() },
      { label: 'Export Page as PDF', click: () => exportPageAsPDF() },
      { type: 'separator' },
      { label: 'Clear All Data', click: () => clearBrowsingData() }
    ]
  });

  template.push({
    label: 'Privacy',
    submenu: [
      { label: 'Privacy Dashboard...', accelerator: 'CmdOrCtrl+Shift+D', click: () => notifyRenderer('open-panel', 'privacy') },
      { type: 'separator' },
      { label: 'Toggle Tor', accelerator: 'CmdOrCtrl+Shift+T', click: () => toggleTor() },
      { label: 'Check Tor Status', click: () => checkTorAndNotify() },
      { type: 'separator' },
      { label: 'Clear Browsing Data', click: () => clearBrowsingData() },
      { label: 'Clear History', click: () => state.clearHistory() }
    ]
  });

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
      { label: `CONSTANTINE v${CONFIG.version}`, enabled: false },
      { label: `Platform: ${Platform.info.platform} ${Platform.info.arch}`, enabled: false }
    ]
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ============================================
// Menu Action Handlers
// ============================================

function createNewTabFromMenu() {
  try {
    const tabId = state.generateTabId();
    createTab(tabId, null);
    notifyRenderer('tab-created', { tabId, url: '' });
  } catch (err) {
    console.error('Error creating new tab:', err);
    notifyRenderer('notification', { type: 'error', message: 'Failed to create new tab' });
  }
}

function closeActiveTab() {
  if (state.activeTabId) {
    closeTab(state.activeTabId);
  }
}

function checkTorAndNotify() {
  try {
    const available = state.refreshTorStatus();
    notifyRenderer('notification', {
      type: available ? 'success' : 'warning',
      message: available ? 'Tor service is running and ready.' : 'Tor service not detected. Please start Tor.'
    });
    notifyRenderer('tor-status', { available });
  } catch (err) {
    console.error('Error checking Tor:', err);
  }
}

function toggleTor() {
  try {
    const current = state.privacy.torEnabled;
    state.setPrivacy('torEnabled', !current);
    applyTorProxy();
    notifyRenderer('privacy-updated', state.privacy);
  } catch (err) {
    console.error('Error toggling Tor:', err);
  }
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
    notifyRenderer('notification', { type: 'error', message: 'Failed to capture screenshot' });
  }
}

function viewPageSource() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab && tab.url && !tab.url.startsWith('view-source:')) {
    try {
      const sourceUrl = `view-source:${tab.url}`;
      const tabId = state.generateTabId();
      createTab(tabId, sourceUrl);
      notifyRenderer('tab-created', { tabId, url: sourceUrl });
    } catch (err) {
      console.error('Error viewing source:', err);
    }
  }
}

async function copyPageAsMarkdown() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (!tab) return;

  try {
    const markdown = await tab.view.webContents.executeJavaScript(`
      (function() {
        const title = document.title;
        const url = window.location.href;
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const h1 = document.querySelector('h1')?.textContent || '';
        return '# ' + title + '\\n\\n' +
               '**URL:** ' + url + '\\n\\n' +
               (description ? '**Description:** ' + description + '\\n\\n' : '') +
               (h1 && h1 !== title ? '## ' + h1 + '\\n\\n' : '');
      })()
    `);
    clipboard.writeText(markdown);
    notifyRenderer('notification', { type: 'success', message: 'Page copied as Markdown' });
  } catch (err) {
    console.error('Error copying as Markdown:', err);
    notifyRenderer('notification', { type: 'error', message: 'Failed to copy page' });
  }
}

async function exportPageAsPDF() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (!tab) return;

  try {
    const { filePath } = await dialog.showSaveDialog(state.mainWindow, {
      defaultPath: path.join(Platform.downloadPath, `${tab.title || 'page'}.pdf`),
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (filePath) {
      const data = await tab.view.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4'
      });
      fs.writeFileSync(filePath, data);
      notifyRenderer('notification', { type: 'success', message: 'PDF exported successfully' });
    }
  } catch (err) {
    console.error('Error exporting PDF:', err);
    notifyRenderer('notification', { type: 'error', message: 'Failed to export PDF' });
  }
}

function restoreLastSession() {
  try {
    const session = state.getLastSession();
    if (session.length === 0) {
      notifyRenderer('notification', { type: 'info', message: 'No previous session found' });
      return;
    }

    session.forEach(tabData => {
      const tabId = state.generateTabId();
      createTab(tabId, tabData.url);
      notifyRenderer('tab-created', { tabId, url: tabData.url });
    });

    notifyRenderer('notification', { type: 'success', message: `Restored ${session.length} tabs` });
  } catch (err) {
    console.error('Error restoring session:', err);
    notifyRenderer('notification', { type: 'error', message: 'Failed to restore session' });
  }
}

// ============================================
// Tab Management System
// ============================================

function createTab(tabId, url = null) {
  if (!state.mainWindow) return null;

  try {
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, '../preload/webview-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        spellcheck: true,
        enableWebSQL: false,
        webgl: true
      }
    });

    const tabData = {
      view,
      url: url || '',
      title: 'New Tab',
      favicon: null,
      loading: false,
      canGoBack: false,
      canGoForward: false,
      zoomLevel: 0,
      createdAt: Date.now(),
      lastAccessed: Date.now()
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
  } catch (err) {
    console.error('Error creating tab:', err);
    return null;
  }
}

function setupViewEventHandlers(tabId, view) {
  const wc = view.webContents;

  // Loading events
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

  // Navigation events
  wc.on('did-navigate', (event, url) => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.url = url;
      tab.canGoBack = wc.canGoBack();
      tab.canGoForward = wc.canGoForward();
      tab.lastAccessed = Date.now();

      // Add to history
      state.addToHistory(url, tab.title);

      notifyRenderer('tab-navigated', {
        tabId,
        url,
        canGoBack: tab.canGoBack,
        canGoForward: tab.canGoForward
      });
    }
  });

  wc.on('did-navigate-in-page', (event, url, isMainFrame) => {
    if (!isMainFrame) return;
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

  // Title update
  wc.on('page-title-updated', (event, title) => {
    const tab = state.tabs.get(tabId);
    if (tab) {
      tab.title = title || 'Untitled';
      notifyRenderer('tab-title-updated', { tabId, title: tab.title });
    }
  });

  // Favicon update
  wc.on('page-favicon-updated', (event, favicons) => {
    const tab = state.tabs.get(tabId);
    if (tab && favicons && favicons.length > 0) {
      tab.favicon = favicons[0];
      notifyRenderer('tab-favicon-updated', { tabId, favicon: tab.favicon });
    }
  });

  // Error handling
  wc.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame) return;
    if (errorCode === -3) return; // -3 is aborted, not an error

    console.error(`Tab ${tabId} load error: ${errorCode} - ${errorDescription} for ${validatedURL}`);
    notifyRenderer('tab-error', {
      tabId,
      error: errorDescription,
      url: validatedURL,
      code: errorCode
    });
  });

  // Crash handling
  wc.on('render-process-gone', (event, details) => {
    console.error(`Tab ${tabId} crashed:`, details);
    notifyRenderer('tab-crashed', {
      tabId,
      reason: details.reason,
      exitCode: details.exitCode
    });
  });

  // Unresponsive handling
  wc.on('unresponsive', () => {
    notifyRenderer('tab-unresponsive', { tabId });
  });

  wc.on('responsive', () => {
    notifyRenderer('tab-responsive', { tabId });
  });

  // Certificate error handling
  wc.on('certificate-error', (event, url, error, certificate, callback) => {
    event.preventDefault();

    // Check if webContents is still valid before proceeding
    const tab = state.tabs.get(tabId);
    if (!tab || wc.isDestroyed()) {
      callback(false);
      return;
    }

    // Generate a unique ID for this certificate error so the renderer can respond via IPC
    const requestId = `${tabId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    // Initialize pending cert decisions set if needed
    if (!tab.pendingCertDecisions) {
      tab.pendingCertDecisions = new Set();
    }
    tab.pendingCertDecisions.add(requestId);

    // Store the error for this URL (including requestId for potential lookups)
    state.certificateErrors.set(url, { error, certificate, requestId, timestamp: Date.now() });

    // Notify renderer so it can decide whether to proceed or block
    notifyRenderer('certificate-error', {
      tabId,
      url,
      error,
      issuer: certificate.issuerName,
      subject: certificate.subjectName,
      requestId
    });

    // Wait for renderer decision via a dedicated IPC channel.
    // Default to blocking if no decision is received in time.
    const decisionChannel = `certificate-error-decision-${requestId}`;
    let decided = false;

    const decisionHandler = (ipcEvent, decision) => {
      if (decided) return;
      decided = true;

      // Clean up tracking
      const currentTab = state.tabs.get(tabId);
      if (currentTab && currentTab.pendingCertDecisions) {
        currentTab.pendingCertDecisions.delete(requestId);
      }

      // Only call callback if webContents still exists
      if (!wc.isDestroyed()) {
        callback(!!decision);
      }
    };

    ipcMain.once(decisionChannel, decisionHandler);

    // Security: if the renderer never responds, block by default after a timeout
    const DECISION_TIMEOUT_MS = 30000;
    setTimeout(() => {
      if (decided) return;
      decided = true;

      // Clean up tracking and listener
      const currentTab = state.tabs.get(tabId);
      if (currentTab && currentTab.pendingCertDecisions) {
        currentTab.pendingCertDecisions.delete(requestId);
      }
      ipcMain.removeAllListeners(decisionChannel);

      // No decision received in time; block navigation (if still valid)
      if (!wc.isDestroyed()) {
        callback(false);
      }
    }, DECISION_TIMEOUT_MS);
  });

  // New window handling
  wc.setWindowOpenHandler(({ url, frameName: _frameName, features: _features }) => {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { action: 'deny' };
    }

    // Check for suspicious domains
    const parsedUrl = safelyParseUrl(url);
    if (parsedUrl && state.privacy.warnSuspiciousDomains && isSuspiciousDomain(parsedUrl.hostname)) {
      notifyRenderer('notification', {
        type: 'warning',
        message: `Blocked suspicious popup: ${parsedUrl.hostname}`
      });
      return { action: 'deny' };
    }

    const newTabId = state.generateTabId();
    createTab(newTabId, url);
    notifyRenderer('tab-created', { tabId: newTabId, url });
    return { action: 'deny' };
  });

  // Context menu
  wc.on('context-menu', (event, params) => {
    notifyRenderer('context-menu', {
      tabId,
      x: params.x,
      y: params.y,
      linkURL: params.linkURL,
      srcURL: params.srcURL,
      selectionText: params.selectionText,
      isEditable: params.isEditable,
      mediaType: params.mediaType
    });
  });

  // Apply fingerprint protection
  if (state.privacy.blockFingerprinting) {
    applyFingerprintProtection(wc);
  }
}

function updateTabBounds(tabId) {
  const tab = state.tabs.get(tabId);
  if (!tab || !state.mainWindow) return;

  try {
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
  } catch (err) {
    console.error('Error updating tab bounds:', err);
  }
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

  try {
    // Hide other views
    for (const [id, t] of state.tabs) {
      if (id !== tabId) {
        t.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
      }
    }

    state.activeTabId = tabId;
    tab.lastAccessed = Date.now();
    updateTabBounds(tabId);

    if (tab.view.webContents && !tab.view.webContents.isDestroyed()) {
      tab.view.webContents.focus();
    }

    notifyRenderer('tab-activated', {
      tabId,
      url: tab.url,
      title: tab.title,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward
    });
  } catch (err) {
    console.error('Error showing tab:', err);
  }
}

function closeTab(tabId) {
  const tab = state.tabs.get(tabId);
  if (!tab || !state.mainWindow) return;

  try {
    state.mainWindow.removeBrowserView(tab.view);

    if (tab.view.webContents && !tab.view.webContents.isDestroyed()) {
      // Remove all event listeners before destroying to prevent memory leaks
      tab.view.webContents.removeAllListeners();
      tab.view.webContents.destroy();
    }

    // Clean up any pending certificate decision handlers for this tab
    if (tab.pendingCertDecisions) {
      for (const requestId of tab.pendingCertDecisions) {
        ipcMain.removeAllListeners(`certificate-error-decision-${requestId}`);
      }
      tab.pendingCertDecisions.clear();
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
  } catch (err) {
    console.error('Error closing tab:', err);
  }
}

function navigateTab(tabId, url) {
  const tab = state.tabs.get(tabId);
  if (!tab) return;

  try {
    let processedUrl = processUrl(url);

    // HTTPS upgrade
    if (state.privacy.httpsUpgrade && processedUrl.startsWith('http://')) {
      const urlObj = safelyParseUrl(processedUrl);
      if (urlObj && urlObj.hostname !== 'localhost' && !urlObj.hostname.startsWith('127.')) {
        processedUrl = processedUrl.replace('http://', 'https://');
      }
    }

    // Warn about suspicious domains
    const parsedUrl = safelyParseUrl(processedUrl);
    if (parsedUrl && state.privacy.warnSuspiciousDomains && isSuspiciousDomain(parsedUrl.hostname)) {
      notifyRenderer('notification', {
        type: 'warning',
        message: `Navigating to potentially suspicious domain: ${parsedUrl.hostname}`
      });
    }

    tab.url = processedUrl;
    tab.view.webContents.loadURL(processedUrl).catch(err => {
      console.error(`Navigation error: ${err.message}`);
      notifyRenderer('tab-error', {
        tabId,
        error: err.message,
        url: processedUrl,
        code: -1
      });
    });
  } catch (err) {
    console.error('Error navigating tab:', err);
  }
}

function processUrl(input) {
  if (!input || typeof input !== 'string') return 'about:blank';
  input = input.trim();

  // Direct protocol URLs
  if (/^(https?|file|view-source|about):/.test(input)) {
    return input;
  }

  // Localhost variations
  if (/^localhost(:\d+)?/.test(input) || /^127\.\d+\.\d+\.\d+(:\d+)?/.test(input)) {
    return `http://${input}`;
  }

  // IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/.test(input)) {
    return `http://${input}`;
  }

  // Looks like a domain (contains dot, no spaces)
  if (input.includes('.') && !input.includes(' ') && /^[a-zA-Z0-9]/.test(input)) {
    // Handle www prefix
    if (input.startsWith('www.')) {
      return `https://${input}`;
    }
    // Check if it looks like a valid domain
    const parts = input.split('/')[0].split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    const validTlds = ['com', 'org', 'net', 'io', 'co', 'gov', 'edu', 'info', 'biz', 'uk', 'de', 'fr', 'jp', 'au', 'ca'];
    if (validTlds.includes(tld) || tld.length === 2) {
      return `https://${input}`;
    }
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

  // ============================================
  // Permission Handlers (Security Best Practice)
  // ============================================

  // Handle permission requests - deny by default, whitelist safe permissions
  ses.setPermissionRequestHandler((webContents, permission, callback, _details) => {
    const allowedPermissions = ['clipboard-read', 'clipboard-sanitized-write'];
    const promptPermissions = ['fullscreen'];

    // Always deny sensitive permissions for OSINT browser security
    const deniedPermissions = [
      'geolocation',
      'media',           // Camera/microphone
      'mediaKeySystem',  // DRM
      'midi',
      'midiSysex',
      'pointerLock',
      'openExternal',
      'notifications',
      'sensors',
      'bluetooth',
      'usb',
      'serial',
      'hid',
      'idle-detection',
      'window-management'
    ];

    if (deniedPermissions.includes(permission)) {
      console.log(`[Security] Denied permission: ${permission} for ${webContents.getURL()}`);
      callback(false);
      return;
    }

    if (allowedPermissions.includes(permission)) {
      callback(true);
      return;
    }

    if (promptPermissions.includes(permission)) {
      // Fullscreen is generally safe
      callback(true);
      return;
    }

    // Default: deny unknown permissions
    console.log(`[Security] Denied unknown permission: ${permission}`);
    callback(false);
  });

  // Check permissions - return denied for sensitive permissions
  ses.setPermissionCheckHandler((webContents, permission, _requestingOrigin) => {
    const deniedPermissions = [
      'geolocation',
      'media',
      'mediaKeySystem',
      'midi',
      'midiSysex',
      'pointerLock',
      'notifications',
      'sensors',
      'bluetooth',
      'usb',
      'serial',
      'hid',
      'idle-detection'
    ];

    if (deniedPermissions.includes(permission)) {
      return false;
    }

    // Allow clipboard operations
    if (permission === 'clipboard-read' || permission === 'clipboard-sanitized-write') {
      return true;
    }

    return false;
  });

  // Request interception for tracker blocking
  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    try {
      const url = safelyParseUrl(details.url);
      if (!url) {
        callback({ cancel: false });
        return;
      }

      const hostname = url.hostname;

      // Block trackers if enabled
      if (state.privacy.blockTrackers && isTrackerDomain(hostname)) {
        callback({ cancel: true });
        return;
      }

      callback({ cancel: false });
    } catch (_e) {
      callback({ cancel: false });
    }
  });

  // Response header modification
  ses.webRequest.onHeadersReceived((details, callback) => {
    try {
      const responseHeaders = { ...details.responseHeaders };

      // Block third-party cookies
      if (state.privacy.blockThirdPartyCookies) {
        const requestUrl = safelyParseUrl(details.url);
        const requestDomain = requestUrl ? getBaseDomain(requestUrl.hostname) : '';
        let isThirdParty = false;

        if (details.referrer) {
          const referrerUrl = safelyParseUrl(details.referrer);
          const referrerDomain = referrerUrl ? getBaseDomain(referrerUrl.hostname) : '';
          isThirdParty = requestDomain && referrerDomain && requestDomain !== referrerDomain;
        }

        if (isThirdParty) {
          delete responseHeaders['set-cookie'];
          delete responseHeaders['Set-Cookie'];
        }
      }

      // Add security headers
      responseHeaders['X-Content-Type-Options'] = ['nosniff'];
      responseHeaders['X-Frame-Options'] = ['SAMEORIGIN'];

      callback({ responseHeaders });
    } catch (_e) {
      callback({ responseHeaders: details.responseHeaders });
    }
  });

  // Request header modification
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    try {
      const headers = { ...details.requestHeaders };
      const currentPrivacy = state.privacy;

      // Add privacy headers
      if (currentPrivacy.doNotTrack) {
        headers['DNT'] = '1';
        headers['Sec-GPC'] = '1';
      }

      // Spoof user agent
      if (currentPrivacy.spoofUserAgent) {
        headers['User-Agent'] = CONFIG.privacy.defaultUserAgent;
      }

      // Remove tracking headers
      delete headers['X-Client-Data'];

      callback({ requestHeaders: headers });
    } catch (_e) {
      callback({ requestHeaders: details.requestHeaders });
    }
  });

  // Apply Tor proxy if enabled
  applyTorProxy();
}

async function applyTorProxy() {
  const ses = session.defaultSession;
  const privacy = state.privacy;

  if (privacy.torEnabled) {
    const torRunning = await Platform.isTorRunning();
    if (!torRunning) {
      const torMessage = Platform.isWindows
        ? 'Tor not running. Start tor.exe from your Tor installation.'
        : Platform.isMac
          ? 'Tor not running. Run: brew services start tor'
          : 'Tor not running. Run: sudo systemctl start tor';

      notifyRenderer('notification', { type: 'error', message: torMessage });
      state.setPrivacy('torEnabled', false);
      notifyRenderer('privacy-updated', state.privacy);
      return;
    }

    try {
      await ses.setProxy({ proxyRules: CONFIG.privacy.torProxy });
      console.log('Tor proxy enabled');
      notifyRenderer('privacy-updated', { ...privacy, torConnected: true });
      notifyRenderer('notification', {
        type: 'success',
        message: 'Connected to Tor network. Your traffic is now anonymized.'
      });
    } catch (err) {
      console.error('Tor proxy error:', err);
      state.setPrivacy('torEnabled', false);
      notifyRenderer('notification', { type: 'error', message: 'Failed to connect to Tor proxy.' });
    }
  } else {
    ses.setProxy({ proxyRules: '' }).catch(() => {});
  }
}

function applyPrivacyToView(view) {
  try {
    if (state.privacy.blockWebRTC) {
      view.webContents.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');
    }
  } catch (err) {
    console.error('Error applying privacy to view:', err);
  }
}

function applyFingerprintProtection(webContents) {
  webContents.on('dom-ready', () => {
    const platformMask = Platform.isWindows ? 'Win32' : (Platform.isMac ? 'MacIntel' : 'Linux x86_64');

    webContents.executeJavaScript(`
      (function() {
        'use strict';

        // Canvas fingerprint protection
        const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const origToBlob = HTMLCanvasElement.prototype.toBlob;
        const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;

        function addNoise(imageData) {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] ^ (Math.random() * 2 | 0);
          }
          return imageData;
        }

        HTMLCanvasElement.prototype.toDataURL = function() {
          const ctx = this.getContext('2d');
          if (ctx && this.width > 0 && this.height > 0) {
            try {
              const imageData = origGetImageData.call(ctx, 0, 0, this.width, this.height);
              addNoise(imageData);
              ctx.putImageData(imageData, 0, 0);
            } catch(e) {}
          }
          return origToDataURL.apply(this, arguments);
        };

        HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
          const ctx = this.getContext('2d');
          if (ctx && this.width > 0 && this.height > 0) {
            try {
              const imageData = origGetImageData.call(ctx, 0, 0, this.width, this.height);
              addNoise(imageData);
              ctx.putImageData(imageData, 0, 0);
            } catch(e) {}
          }
          return origToBlob.apply(this, arguments);
        };

        // WebGL fingerprint protection
        const glParams = {
          37445: 'Intel Inc.',
          37446: 'Intel Iris OpenGL Engine',
          7936: 'WebKit',
          7937: 'WebKit WebGL'
        };

        function interceptGetParameter(proto) {
          const orig = proto.getParameter;
          proto.getParameter = function(param) {
            if (glParams[param]) return glParams[param];
            return orig.apply(this, arguments);
          };
        }

        if (typeof WebGLRenderingContext !== 'undefined') {
          interceptGetParameter(WebGLRenderingContext.prototype);
        }
        if (typeof WebGL2RenderingContext !== 'undefined') {
          interceptGetParameter(WebGL2RenderingContext.prototype);
        }

        // Screen property standardization
        const screenProps = {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040,
          colorDepth: 24,
          pixelDepth: 24
        };

        Object.keys(screenProps).forEach(prop => {
          try {
            Object.defineProperty(screen, prop, { value: screenProps[prop], configurable: true });
          } catch(e) {}
        });

        // Navigator properties
        const navProps = {
          platform: '${platformMask}',
          hardwareConcurrency: 4,
          deviceMemory: 8,
          maxTouchPoints: 0,
          webdriver: false
        };

        Object.keys(navProps).forEach(prop => {
          try {
            Object.defineProperty(navigator, prop, { value: navProps[prop], configurable: true });
          } catch(e) {}
        });

        // Remove battery API
        if (navigator.getBattery) {
          Object.defineProperty(navigator, 'getBattery', { value: undefined, configurable: true });
        }

        // Timezone spoofing (UTC)
        const origDateGetTimezoneOffset = Date.prototype.getTimezoneOffset;
        Date.prototype.getTimezoneOffset = function() { return 0; };

        const origIntlDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat = function(locale, options) {
          options = options || {};
          options.timeZone = options.timeZone || 'UTC';
          return new origIntlDateTimeFormat(locale, options);
        };
        Object.setPrototypeOf(Intl.DateTimeFormat, origIntlDateTimeFormat);
      })();
    `).catch(() => {});
  });
}

async function clearBrowsingData() {
  const ses = session.defaultSession;
  try {
    await ses.clearCache();
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
    });
    state.clearHistory();
    notifyRenderer('notification', { type: 'success', message: 'All browsing data cleared.' });
  } catch (err) {
    console.error('Clear data error:', err);
    notifyRenderer('notification', { type: 'error', message: 'Failed to clear browsing data' });
  }
}

// ============================================
// Navigation Helpers
// ============================================

function reloadActiveTab(ignoreCache = false) {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
    try {
      if (ignoreCache) {
        tab.view.webContents.reloadIgnoringCache();
      } else {
        tab.view.webContents.reload();
      }
    } catch (err) {
      console.error('Error reloading tab:', err);
    }
  }
}

function zoomActiveTab(delta, reset = false) {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
    try {
      if (reset) {
        tab.view.webContents.setZoomLevel(0);
        tab.zoomLevel = 0;
      } else {
        const current = tab.view.webContents.getZoomLevel();
        const newLevel = Math.max(-5, Math.min(5, current + delta));
        tab.view.webContents.setZoomLevel(newLevel);
        tab.zoomLevel = newLevel;
      }
      notifyRenderer('zoom-changed', { tabId: state.activeTabId, level: tab.zoomLevel });
    } catch (err) {
      console.error('Error zooming tab:', err);
    }
  }
}

function toggleDevTools() {
  if (!state.activeTabId) return;
  const tab = state.tabs.get(state.activeTabId);
  if (tab && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
    try {
      tab.view.webContents.toggleDevTools();
    } catch (err) {
      console.error('Error toggling DevTools:', err);
    }
  }
}

// ============================================
// IPC Handlers
// ============================================

function setupIpcHandlers() {
  // Platform & System info
  ipcMain.handle('get-platform-info', () => CONFIG.platform);
  ipcMain.handle('check-tor-status', () => ({ available: state.refreshTorStatus() }));
  ipcMain.handle('get-network-status', () => ({ online: state.isOnline }));
  ipcMain.handle('get-app-version', () => CONFIG.version);

  // Window controls (silent failure if window destroyed)
  ipcMain.on('window-minimize', () => {
    try { state.mainWindow?.minimize(); } catch (_e) { /* Window may be destroyed */ }
  });
  ipcMain.on('window-maximize', () => {
    try {
      if (state.mainWindow?.isMaximized()) {
        state.mainWindow.unmaximize();
      } else {
        state.mainWindow?.maximize();
      }
    } catch (_e) { /* Window may be destroyed */ }
  });
  ipcMain.on('window-close', () => {
    try { state.mainWindow?.close(); } catch (_e) { /* Window may be destroyed */ }
  });

  // Tab management
  ipcMain.handle('create-tab', (event, url) => {
    try {
      const tabId = state.generateTabId();
      createTab(tabId, url);
      return tabId;
    } catch (err) {
      console.error('Error in create-tab handler:', err);
      return null;
    }
  });

  ipcMain.on('show-tab', (event, tabId) => {
    if (tabId && typeof tabId === 'string') {
      showTab(tabId);
    }
  });

  ipcMain.on('close-tab', (event, tabId) => {
    if (tabId && typeof tabId === 'string') {
      closeTab(tabId);
    }
  });

  ipcMain.on('navigate', (event, tabId, url) => {
    if (tabId && typeof tabId === 'string' && url && typeof url === 'string') {
      navigateTab(tabId, url);
    }
  });

  ipcMain.on('go-back', (event, tabId) => {
    try {
      const tab = state.tabs.get(tabId);
      if (tab && tab.view.webContents && tab.view.webContents.canGoBack()) {
        tab.view.webContents.goBack();
      }
    } catch (_e) { /* Tab may be destroyed */ }
  });

  ipcMain.on('go-forward', (event, tabId) => {
    try {
      const tab = state.tabs.get(tabId);
      if (tab && tab.view.webContents && tab.view.webContents.canGoForward()) {
        tab.view.webContents.goForward();
      }
    } catch (_e) { /* Tab may be destroyed */ }
  });

  ipcMain.on('reload', (event, tabId) => {
    try {
      const tab = state.tabs.get(tabId);
      if (tab && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
        tab.view.webContents.reload();
      }
    } catch (_e) { /* Tab may be destroyed */ }
  });

  ipcMain.on('stop-loading', (event, tabId) => {
    try {
      const tab = state.tabs.get(tabId);
      if (tab && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
        tab.view.webContents.stop();
      }
    } catch (_e) { /* Tab may be destroyed */ }
  });

  // Panel management
  ipcMain.on('panel-toggle', (event, open, width) => {
    state.panelOpen = Boolean(open);
    state.panelWidth = typeof width === 'number' ? width : CONFIG.layout.panelWidth;
    updateAllTabBounds();
  });

  // Privacy settings
  ipcMain.handle('get-privacy-settings', () => state.privacy);

  ipcMain.handle('set-privacy-setting', (event, key, value) => {
    if (typeof key !== 'string') return state.privacy;
    try {
      const privacy = state.setPrivacy(key, Boolean(value));
      if (key === 'torEnabled') {
        applyTorProxy();
      }
      notifyRenderer('privacy-updated', privacy);
      return privacy;
    } catch (err) {
      console.error('Error setting privacy:', err);
      return state.privacy;
    }
  });

  // Bookmarks
  ipcMain.handle('get-bookmarks', () => state.store.get('bookmarks', []));

  ipcMain.handle('add-bookmark', (event, bookmark) => {
    try {
      if (!bookmark || !bookmark.url || typeof bookmark.url !== 'string') return [];
      const bookmarks = state.store.get('bookmarks', []);
      if (!bookmarks.some(b => b.url === bookmark.url)) {
        bookmarks.push({
          title: String(bookmark.title || bookmark.url).slice(0, 200),
          url: bookmark.url.slice(0, 2000),
          id: `bm-${Date.now()}`,
          createdAt: Date.now()
        });
        state.store.set('bookmarks', bookmarks);
      }
      return bookmarks;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      return [];
    }
  });

  ipcMain.handle('remove-bookmark', (event, url) => {
    try {
      if (!url || typeof url !== 'string') return [];
      let bookmarks = state.store.get('bookmarks', []);
      bookmarks = bookmarks.filter(b => b.url !== url);
      state.store.set('bookmarks', bookmarks);
      return bookmarks;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      return [];
    }
  });

  // History
  ipcMain.handle('get-history', (event, limit) => {
    return state.getHistory(typeof limit === 'number' ? limit : 100);
  });

  ipcMain.handle('clear-history', () => {
    state.clearHistory();
    return true;
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
    if (!tab || !tab.view.webContents || tab.view.webContents.isDestroyed()) return null;

    try {
      const image = await tab.view.webContents.capturePage();
      return image.toDataURL();
    } catch (err) {
      console.error('Screenshot error:', err);
      return null;
    }
  });

  // Page info
  ipcMain.handle('get-page-info', async () => {
    if (!state.activeTabId) return null;
    const tab = state.tabs.get(state.activeTabId);
    if (!tab || !tab.view.webContents || tab.view.webContents.isDestroyed()) return null;

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
    } catch (_err) {
      return null;
    }
  });

  // Session management
  ipcMain.handle('get-last-session', () => state.getLastSession());
  ipcMain.handle('restore-session', () => {
    restoreLastSession();
    return true;
  });

  // Phone Intelligence IPC Handlers
  ipcMain.handle('phone-intel-get-countries', () => COUNTRY_CODES);

  ipcMain.handle('phone-intel-generate-formats', (event, phoneNumber, countryCode) => {
    try {
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

  ipcMain.handle('phone-intel-open-search', (_event, searchUrl) => {
    if (!searchUrl || typeof searchUrl !== 'string') return null;
    try {
      const url = safelyParseUrl(searchUrl);
      const allowedHosts = ['www.google.com', 'google.com', 'duckduckgo.com', 'www.duckduckgo.com'];
      if (!url || !allowedHosts.includes(url.hostname)) {
        console.warn(`Blocked search URL with untrusted host: ${url?.hostname}`);
        return null;
      }
      const tabId = state.generateTabId();
      createTab(tabId, searchUrl);
      notifyRenderer('tab-created', { tabId, url: searchUrl });
      return tabId;
    } catch (_e) {
      return null;
    }
  });

  ipcMain.handle('phone-intel-batch-search', (_event, phoneNumber, countryCode, searchEngine) => {
    try {
      if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length > 30) {
        return null;
      }
      if (searchEngine !== 'duckduckgo' && searchEngine !== 'google') {
        searchEngine = 'duckduckgo';
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

  // ============================================
  // AI Research Assistant IPC Handlers
  // ============================================

  ipcMain.handle('ai-research-initialize', () => {
    return aiResearchAssistant.initialize();
  });

  ipcMain.handle('ai-research-classify-tab', (event, tabId, url, title) => {
    return aiResearchAssistant.classifyTab(tabId, url, title);
  });

  ipcMain.handle('ai-research-get-groups', () => {
    return aiResearchAssistant.getTabGroups();
  });

  ipcMain.handle('ai-research-get-tab-topic', (event, tabId) => {
    return aiResearchAssistant.getTabTopic(tabId);
  });

  ipcMain.handle('ai-research-remove-tab', (event, tabId) => {
    aiResearchAssistant.removeTab(tabId);
    return { success: true };
  });

  ipcMain.handle('ai-research-get-suggestions', (event, url, title) => {
    return aiResearchAssistant.getSuggestions(url, title);
  });

  ipcMain.handle('ai-research-get-all-topics', () => {
    return aiResearchAssistant.getAllTopics();
  });

  ipcMain.handle('ai-research-start-session', (event, name) => {
    return aiResearchAssistant.startNewSession(name);
  });

  ipcMain.handle('ai-research-set-purpose', (event, purpose) => {
    aiResearchAssistant.setSessionPurpose(purpose);
    return { success: true };
  });

  ipcMain.handle('ai-research-add-note', (event, note) => {
    aiResearchAssistant.addSessionNote(note);
    return { success: true };
  });

  ipcMain.handle('ai-research-track-visit', (event, url, title, topic) => {
    aiResearchAssistant.trackPageVisit(url, title, topic);
    return { success: true };
  });

  ipcMain.handle('ai-research-get-session', () => {
    return aiResearchAssistant.getCurrentSession();
  });

  ipcMain.handle('ai-research-get-past-sessions', (event, limit) => {
    return aiResearchAssistant.getPastSessions(limit);
  });

  ipcMain.handle('ai-research-search-sessions', (event, query) => {
    return aiResearchAssistant.searchSessions(query);
  });

  // ============================================
  // AI Privacy Shield IPC Handlers
  // ============================================

  ipcMain.handle('ai-privacy-initialize', () => {
    return aiPrivacyShield.initialize(state.privacy);
  });

  ipcMain.handle('ai-privacy-analyze-url', (_event, url) => {
    return aiPrivacyShield.analyzeUrl(url);
  });

  ipcMain.handle('ai-privacy-get-exposure', () => {
    return aiPrivacyShield.getExposure();
  });

  ipcMain.handle('ai-privacy-update-protections', (event, settings) => {
    return aiPrivacyShield.updateProtections(settings);
  });

  ipcMain.handle('ai-privacy-set-auto-opsec', (event, enabled) => {
    return aiPrivacyShield.setAutoOpsec(enabled);
  });

  ipcMain.handle('ai-privacy-is-auto-opsec', () => {
    return aiPrivacyShield.isAutoOpsecEnabled();
  });

  ipcMain.handle('ai-privacy-set-opsec-level', (event, level) => {
    return aiPrivacyShield.setOpsecLevel(level);
  });

  ipcMain.handle('ai-privacy-get-opsec-level', () => {
    return aiPrivacyShield.getCurrentOpsecLevel();
  });

  ipcMain.handle('ai-privacy-get-all-levels', () => {
    return aiPrivacyShield.getAllOpsecLevels();
  });

  ipcMain.handle('ai-privacy-evaluate-url', (_event, url) => {
    return aiPrivacyShield.evaluateUrl(url);
  });

  ipcMain.handle('ai-privacy-get-status', () => {
    return aiPrivacyShield.getOpsecStatus();
  });

  ipcMain.handle('ai-privacy-get-history', () => {
    return aiPrivacyShield.getEscalationHistory();
  });

  // ============================================
  // AI Research Tools IPC Handlers
  // ============================================

  ipcMain.handle('ai-tools-initialize', () => {
    return aiResearchTools.initialize();
  });

  ipcMain.handle('ai-tools-extract-entities', (event, text, sourceInfo) => {
    return aiResearchTools.extractEntities(text, sourceInfo);
  });

  ipcMain.handle('ai-tools-get-entity-stats', () => {
    return aiResearchTools.getEntityStats();
  });

  ipcMain.handle('ai-tools-find-related', (event, value) => {
    return aiResearchTools.findRelatedEntities(value);
  });

  ipcMain.handle('ai-tools-capture-snapshot', (_event, pageData) => {
    return aiResearchTools.captureSnapshot(pageData);
  });

  ipcMain.handle('ai-tools-get-snapshot', (event, id) => {
    return aiResearchTools.getSnapshot(id);
  });

  ipcMain.handle('ai-tools-get-snapshots', (event, limit, offset) => {
    return aiResearchTools.getSnapshots(limit, offset);
  });

  ipcMain.handle('ai-tools-search-snapshots', (event, query) => {
    return aiResearchTools.searchSnapshots(query);
  });

  ipcMain.handle('ai-tools-delete-snapshot', (event, id) => {
    return aiResearchTools.deleteSnapshot(id);
  });

  ipcMain.handle('ai-tools-export-snapshot', (event, id, format) => {
    return aiResearchTools.exportSnapshot(id, format);
  });

  ipcMain.handle('ai-tools-add-snapshot-note', (event, snapshotId, note) => {
    return aiResearchTools.addSnapshotNote(snapshotId, note);
  });

  ipcMain.handle('ai-tools-register-tab-entities', (event, tabId, entities) => {
    aiResearchTools.registerTabEntities(tabId, entities);
    return { success: true };
  });

  ipcMain.handle('ai-tools-unregister-tab', (event, tabId) => {
    aiResearchTools.unregisterTab(tabId);
    return { success: true };
  });

  ipcMain.handle('ai-tools-get-alerts', (event, includeAcknowledged) => {
    return aiResearchTools.getAlerts(includeAcknowledged);
  });

  ipcMain.handle('ai-tools-acknowledge-alert', (event, alertId) => {
    return aiResearchTools.acknowledgeAlert(alertId);
  });

  ipcMain.handle('ai-tools-dismiss-alert', (event, alertId) => {
    return aiResearchTools.dismissAlert(alertId);
  });

  ipcMain.handle('ai-tools-get-alert-count', () => {
    return aiResearchTools.getUnacknowledgedAlertCount();
  });

  ipcMain.handle('ai-tools-get-crossref-report', () => {
    return aiResearchTools.getCrossReferenceReport();
  });

  // ============================================
  // AI Cognitive Tools IPC Handlers
  // ============================================

  ipcMain.handle('ai-cognitive-initialize', () => {
    return aiCognitiveTools.initialize();
  });

  ipcMain.handle('ai-cognitive-start-focus', (event, preset, customDuration, customBreak) => {
    return aiCognitiveTools.startFocusSession(preset, customDuration, customBreak);
  });

  ipcMain.handle('ai-cognitive-end-focus', (event, force) => {
    return aiCognitiveTools.endFocusSession(force);
  });

  ipcMain.handle('ai-cognitive-pause-focus', () => {
    return aiCognitiveTools.pauseFocusSession();
  });

  ipcMain.handle('ai-cognitive-resume-focus', () => {
    return aiCognitiveTools.resumeFocusSession();
  });

  ipcMain.handle('ai-cognitive-check-focus-url', (event, url) => {
    return aiCognitiveTools.checkFocusUrl(url);
  });

  ipcMain.handle('ai-cognitive-get-focus-status', () => {
    return aiCognitiveTools.getFocusStatus();
  });

  ipcMain.handle('ai-cognitive-get-focus-presets', () => {
    return aiCognitiveTools.getFocusPresets();
  });

  ipcMain.handle('ai-cognitive-get-focus-history', (event, limit) => {
    return aiCognitiveTools.getFocusHistory(limit);
  });

  ipcMain.handle('ai-cognitive-get-focus-stats', () => {
    return aiCognitiveTools.getFocusStats();
  });

  ipcMain.handle('ai-cognitive-add-focus-note', (event, note) => {
    return aiCognitiveTools.addFocusNote(note);
  });

  ipcMain.handle('ai-cognitive-add-bookmark', (event, bookmark) => {
    return aiCognitiveTools.addSmartBookmark(bookmark);
  });

  ipcMain.handle('ai-cognitive-remove-bookmark', (event, id) => {
    return aiCognitiveTools.removeSmartBookmark(id);
  });

  ipcMain.handle('ai-cognitive-update-bookmark', (event, id, updates) => {
    return aiCognitiveTools.updateSmartBookmark(id, updates);
  });

  ipcMain.handle('ai-cognitive-get-bookmarks', (event, options) => {
    return aiCognitiveTools.getSmartBookmarks(options);
  });

  ipcMain.handle('ai-cognitive-search-bookmarks', (event, query) => {
    return aiCognitiveTools.searchSmartBookmarks(query);
  });

  ipcMain.handle('ai-cognitive-get-bookmark-categories', () => {
    return aiCognitiveTools.getBookmarkCategories();
  });

  ipcMain.handle('ai-cognitive-get-bookmark-tags', () => {
    return aiCognitiveTools.getBookmarkTags();
  });

  ipcMain.handle('ai-cognitive-start-investigation', (event, name, description) => {
    return aiCognitiveTools.startInvestigation(name, description);
  });

  ipcMain.handle('ai-cognitive-end-investigation', (event, summary) => {
    return aiCognitiveTools.endInvestigation(summary);
  });

  ipcMain.handle('ai-cognitive-track-event', (event, eventData) => {
    return aiCognitiveTools.trackTimelineEvent(eventData);
  });

  ipcMain.handle('ai-cognitive-track-page-visit', (event, url, title, tabId) => {
    return aiCognitiveTools.trackPageVisit(url, title, tabId);
  });

  ipcMain.handle('ai-cognitive-track-search', (event, query, engine) => {
    return aiCognitiveTools.trackSearch(query, engine);
  });

  ipcMain.handle('ai-cognitive-get-timeline', (event, options) => {
    return aiCognitiveTools.getTimelineEvents(options);
  });

  ipcMain.handle('ai-cognitive-get-investigation', () => {
    return aiCognitiveTools.getCurrentInvestigation();
  });

  ipcMain.handle('ai-cognitive-get-timeline-viz', (event, limit) => {
    return aiCognitiveTools.getTimelineVisualization(limit);
  });

  ipcMain.handle('ai-cognitive-export-timeline', (event, investigationId) => {
    return aiCognitiveTools.exportTimeline(investigationId);
  });
}

// ============================================
// Utility Functions
// ============================================

function notifyRenderer(channel, data) {
  try {
    if (state.mainWindow && !state.mainWindow.isDestroyed()) {
      state.mainWindow.webContents.send(channel, data);
    }
  } catch (err) {
    console.error('Error notifying renderer:', err);
  }
}

// ============================================
// Application Lifecycle
// ============================================

// Set app user model ID for Windows
if (Platform.isWindows) {
  app.setAppUserModelId('com.constantine.browser');
}

// Handle single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    if (state.mainWindow) {
      if (state.mainWindow.isMinimized()) state.mainWindow.restore();
      state.mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  // Force dark mode for OSINT work
  nativeTheme.themeSource = 'dark';

  setupIpcHandlers();
  createMainWindow();

  // Periodic memory cleanup (every 5 minutes)
  setInterval(() => {
    state.cleanupCertificateErrors();
    state.cleanupDownloads();
  }, 5 * 60 * 1000);

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

// Cleanup before quit
app.on('before-quit', () => {
  try {
    state.saveSession();
  } catch (err) {
    console.error('Error saving session before quit:', err);
  }

  // Clean up all BrowserViews and their listeners to prevent memory leaks
  try {
    for (const [_tabId, tab] of state.tabs) {
      if (tab.view && tab.view.webContents && !tab.view.webContents.isDestroyed()) {
        tab.view.webContents.removeAllListeners();
        tab.view.webContents.destroy();
      }
      // Clean up pending certificate decisions
      if (tab.pendingCertDecisions) {
        for (const requestId of tab.pendingCertDecisions) {
          ipcMain.removeAllListeners(`certificate-error-decision-${requestId}`);
        }
      }
    }
    state.tabs.clear();

    // Shutdown AI modules
    aiResearchAssistant.shutdown();
    aiPrivacyShield.shutdown();
    aiResearchTools.shutdown();
    aiCognitiveTools.shutdown();
  } catch (err) {
    console.error('Error cleaning up before quit:', err);
  }
});

// Security: Comprehensive web content security
app.on('web-contents-created', (event, contents) => {
  // Prevent dangerous navigation
  contents.on('will-navigate', (navEvent, url) => {
    if (/^(file|javascript|data):/.test(url)) {
      navEvent.preventDefault();
    }
  });

  // Block new window creation to untrusted origins
  contents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Disable remote module
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
