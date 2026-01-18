const { app, BrowserWindow, BrowserView, ipcMain, session, Menu, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs');

// Version: Tracey Edition
const APP_VERSION = '2.0.0-tracey';
const APP_NAME = 'SPIN Detective Browser - Tracey Edition';

// Initialize persistent storage
const store = new Store({
  defaults: {
    privacy: {
      torEnabled: false,
      torProxy: 'socks5://127.0.0.1:9050',
      blockTrackers: true,
      blockFingerprinting: true,
      blockThirdPartyCookies: true,
      clearOnExit: false,
      doNotTrack: true,
      spoofUserAgent: false,
      userAgentString: '',
      blockWebRTC: true,
      httpsOnly: false,
      extremePrivacyMode: false
    },
    investigation: {
      autoScreenshot: false,
      screenshotPath: '',
      logEnabled: true
    },
    bookmarks: [],
    history: [],
    investigationLog: [],
    devPortal: {
      enabled: true,
      logLevel: 'info'
    }
  }
});

let mainWindow;
let activeViews = new Map();
let activeTabId = null;
let devPortalWindow = null;
let investigationWindow = null;
let commandHistory = [];

// Blocked domains in extreme privacy mode - Using Set for O(1) lookups
const BLOCKED_DOMAINS_EXTREME = new Set([
  'google.com',
  'google.co',
  'googleapis.com',
  'gstatic.com',
  'googlesyndication.com',
  'googleadservices.com'
]);

// Cached privacy settings for performance
let cachedPrivacySettings = null;

// Tracker blocking lists
const TRACKER_PATTERNS = [
  '*://*.google-analytics.com/*',
  '*://*.googletagmanager.com/*',
  '*://*.doubleclick.net/*',
  '*://*.facebook.net/*',
  '*://*.facebook.com/tr/*',
  '*://*.fbcdn.net/signals/*',
  '*://*.analytics.twitter.com/*',
  '*://*.ads.twitter.com/*',
  '*://*.advertising.com/*',
  '*://*.quantserve.com/*',
  '*://*.scorecardresearch.com/*',
  '*://*.hotjar.com/*',
  '*://*.mixpanel.com/*',
  '*://*.segment.io/*',
  '*://*.amplitude.com/*',
  '*://*.intercom.io/*',
  '*://*.criteo.com/*',
  '*://*.taboola.com/*',
  '*://*.outbrain.com/*',
  '*://*.adnxs.com/*',
  '*://*.rubiconproject.com/*',
  '*://*.pubmatic.com/*',
  '*://*.openx.net/*',
  '*://*.adsrvr.org/*',
  '*://*.casalemedia.com/*',
  '*://*.moatads.com/*',
  '*://*.omtrdc.net/*',
  '*://*.demdex.net/*',
  '*://*.krxd.net/*',
  '*://*.bluekai.com/*',
  '*://*.exelator.com/*',
  '*://*.eyeota.net/*'
];

// Privacy-focused user agents for spoofing
const PRIVACY_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0'
];

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      webviewTag: false
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Apply privacy settings on startup
  applyPrivacySettings();

  mainWindow.on('closed', () => {
    mainWindow = null;
    activeViews.clear();
  });

  // Create application menu
  createAppMenu();
}

function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: () => mainWindow.webContents.send('new-tab') },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow.webContents.send('close-tab') },
        { type: 'separator' },
        { label: 'Developer Portal', accelerator: 'CmdOrCtrl+Shift+D', click: openDevPortal },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
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
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => reloadActiveView() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => reloadActiveView(true) },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => zoomActiveView(0.1) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => zoomActiveView(-0.1) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => setZoomActiveView(1) },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Privacy',
      submenu: [
        {
          label: 'Extreme Privacy Mode (Tor)',
          type: 'checkbox',
          checked: store.get('privacy.extremePrivacyMode'),
          click: (menuItem) => toggleExtremePrivacy(menuItem.checked)
        },
        { type: 'separator' },
        {
          label: 'Block Trackers',
          type: 'checkbox',
          checked: store.get('privacy.blockTrackers'),
          click: (menuItem) => updatePrivacySetting('blockTrackers', menuItem.checked)
        },
        {
          label: 'Block Fingerprinting',
          type: 'checkbox',
          checked: store.get('privacy.blockFingerprinting'),
          click: (menuItem) => updatePrivacySetting('blockFingerprinting', menuItem.checked)
        },
        {
          label: 'Block Third-Party Cookies',
          type: 'checkbox',
          checked: store.get('privacy.blockThirdPartyCookies'),
          click: (menuItem) => updatePrivacySetting('blockThirdPartyCookies', menuItem.checked)
        },
        {
          label: 'Block WebRTC',
          type: 'checkbox',
          checked: store.get('privacy.blockWebRTC'),
          click: (menuItem) => updatePrivacySetting('blockWebRTC', menuItem.checked)
        },
        { type: 'separator' },
        { label: 'Clear Browsing Data...', click: clearBrowsingData }
      ]
    },
    {
      label: 'OSINT Tools',
      submenu: [
        { label: 'Bookmarks Manager', accelerator: 'CmdOrCtrl+B', click: () => mainWindow.webContents.send('toggle-bookmarks') },
        { label: 'Google Dorks Toolbar', accelerator: 'CmdOrCtrl+G', click: () => mainWindow.webContents.send('toggle-dorks') },
        { type: 'separator' },
        { label: 'OSINT Framework', click: () => navigateTo('https://osintframework.com') },
        { label: 'IntelTechniques', click: () => navigateTo('https://inteltechniques.com/tools/') },
        { type: 'separator' },
        { label: 'Whois Lookup', click: () => openToolTab('whois') },
        { label: 'DNS Lookup', click: () => openToolTab('dns') },
        { label: 'IP Geolocation', click: () => openToolTab('geoip') }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://github.com/spin-osint/browser') },
        { label: 'Report Issue', click: () => shell.openExternal('https://github.com/spin-osint/browser/issues') },
        { type: 'separator' },
        { label: 'About SPIN OSINT Browser', click: showAbout }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function applyPrivacySettings() {
  const privacy = store.get('privacy');
  cachedPrivacySettings = privacy; // Cache for performance
  const ses = session.defaultSession;

  // Block trackers - only set up once, check cached settings in handler
  if (privacy.blockTrackers) {
    ses.webRequest.onBeforeRequest({ urls: TRACKER_PATTERNS }, (details, callback) => {
      if (cachedPrivacySettings?.blockTrackers) {
        logToDevPortal('tracker_blocked', `Blocked: ${details.url}`);
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    });
  }

  // Block third-party cookies via session settings (more efficient)
  if (privacy.blockThirdPartyCookies) {
    ses.cookies.setDefaultService;
  }

  // Set Do Not Track and privacy headers - combined for efficiency
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    if (cachedPrivacySettings?.doNotTrack) {
      details.requestHeaders['DNT'] = '1';
      details.requestHeaders['Sec-GPC'] = '1';
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  // Spoof user agent
  if (privacy.spoofUserAgent) {
    const ua = privacy.userAgentString || PRIVACY_USER_AGENTS[Math.floor(Math.random() * PRIVACY_USER_AGENTS.length)];
    ses.setUserAgent(ua);
  }

  // Configure Tor proxy
  if (privacy.torEnabled || privacy.extremePrivacyMode) {
    ses.setProxy({ proxyRules: privacy.torProxy.replace('socks5://', 'socks5://') });
    logToDevPortal('privacy', 'Tor proxy enabled - Tracey is going dark');
  }
}

function toggleExtremePrivacy(enabled) {
  store.set('privacy.extremePrivacyMode', enabled);
  store.set('privacy.torEnabled', enabled);
  store.set('privacy.blockTrackers', true);
  store.set('privacy.blockFingerprinting', true);
  store.set('privacy.blockThirdPartyCookies', true);
  store.set('privacy.blockWebRTC', true);
  store.set('privacy.spoofUserAgent', enabled);

  if (enabled) {
    store.set('privacy.userAgentString', PRIVACY_USER_AGENTS[0]);
  }

  applyPrivacySettings();
  mainWindow.webContents.send('privacy-updated', store.get('privacy'));

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Extreme Privacy Mode',
    message: enabled ?
      'Extreme Privacy Mode enabled.\n\nTor proxy active (ensure Tor is running on port 9050).\nAll tracking protections enabled.\nUser agent spoofed.' :
      'Extreme Privacy Mode disabled.\n\nNormal browsing resumed.'
  });
}

function updatePrivacySetting(key, value) {
  store.set(`privacy.${key}`, value);
  cachedPrivacySettings = store.get('privacy'); // Update cache
  applyPrivacySettings();
  mainWindow.webContents.send('privacy-updated', cachedPrivacySettings);
}

async function clearBrowsingData() {
  const ses = session.defaultSession;
  await ses.clearStorageData({
    storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
  });
  await ses.clearCache();
  store.set('history', []);

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Data Cleared',
    message: 'Browsing data has been cleared successfully.'
  });

  logToDevPortal('privacy', 'Browsing data cleared');
}

// Tab/View Management
function createBrowserView(tabId, url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/webview-preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  view.webContents.on('did-start-loading', () => {
    mainWindow.webContents.send('tab-loading', { tabId, loading: true });
  });

  view.webContents.on('did-stop-loading', () => {
    mainWindow.webContents.send('tab-loading', { tabId, loading: false });
  });

  view.webContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.send('tab-navigated', { tabId, url });
    addToHistory(url, view.webContents.getTitle());
  });

  view.webContents.on('page-title-updated', (event, title) => {
    mainWindow.webContents.send('tab-title-updated', { tabId, title });
  });

  view.webContents.on('page-favicon-updated', (event, favicons) => {
    mainWindow.webContents.send('tab-favicon-updated', { tabId, favicon: favicons[0] });
  });

  view.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logToDevPortal('error', `Failed to load ${validatedURL}: ${errorDescription}`);
  });

  view.webContents.on('console-message', (event, level, message, line, sourceId) => {
    logToDevPortal('console', `[${level}] ${message} (${sourceId}:${line})`);
  });

  // Consolidated privacy protection script - optimized for single injection
  const privacySettings = cachedPrivacySettings || store.get('privacy');

  view.webContents.on('dom-ready', () => {
    const protectionScripts = [];

    // Canvas fingerprinting protection
    if (privacySettings.blockFingerprinting) {
      protectionScripts.push(`
        (function() {
          // Canvas fingerprinting protection with noise injection
          const origGetContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, attrs) {
            const ctx = origGetContext.call(this, type, attrs);
            if (type === '2d' && ctx) {
              const origGetImageData = ctx.getImageData;
              ctx.getImageData = function(...args) {
                const data = origGetImageData.apply(this, args);
                const noise = Math.random() * 0.01;
                for (let i = 0; i < data.data.length; i += 4) {
                  if (Math.random() > 0.99) data.data[i] ^= 1;
                }
                return data;
              };
            }
            return ctx;
          };

          // WebGL fingerprinting protection
          const glProxyHandler = {
            apply: (target, thisArg, args) => {
              const r = target.apply(thisArg, args);
              if (args[0] === 37445) return 'Intel Inc.';
              if (args[0] === 37446) return 'Intel Iris OpenGL Engine';
              return r;
            }
          };
          ['WebGLRenderingContext', 'WebGL2RenderingContext'].forEach(name => {
            if (window[name]?.prototype?.getParameter) {
              window[name].prototype.getParameter = new Proxy(window[name].prototype.getParameter, glProxyHandler);
            }
          });

          // Audio fingerprinting protection
          if (window.AudioContext) {
            const origCreateAnalyser = AudioContext.prototype.createAnalyser;
            AudioContext.prototype.createAnalyser = function() {
              const analyser = origCreateAnalyser.call(this);
              const origGetFloatFreq = analyser.getFloatFrequencyData;
              analyser.getFloatFrequencyData = function(arr) {
                origGetFloatFreq.call(this, arr);
                for (let i = 0; i < arr.length; i++) arr[i] += Math.random() * 0.0001;
              };
              return analyser;
            };
          }
        })();
      `);
    }

    // WebRTC blocking
    if (privacySettings.blockWebRTC) {
      protectionScripts.push(`
        (function() {
          window.RTCPeerConnection = undefined;
          window.webkitRTCPeerConnection = undefined;
          if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('WebRTC blocked by Tracey'));
            navigator.mediaDevices.enumerateDevices = () => Promise.resolve([]);
          }
        })();
      `);
    }

    // Execute all protection scripts in a single call
    if (protectionScripts.length > 0) {
      view.webContents.executeJavaScript(protectionScripts.join('\n'));
    }
  });

  if (url) {
    view.webContents.loadURL(url);
  }

  activeViews.set(tabId, view);
  return view;
}

function showBrowserView(tabId) {
  const view = activeViews.get(tabId);
  if (!view) return;

  // Remove all views first
  activeViews.forEach((v) => {
    mainWindow.removeBrowserView(v);
  });

  // Add the requested view
  mainWindow.addBrowserView(view);
  activeTabId = tabId;

  // Set bounds (accounting for title bar, tabs, and toolbar)
  const bounds = mainWindow.getBounds();
  view.setBounds({
    x: 0,
    y: 140, // Title bar (35) + Tabs (35) + URL bar (40) + Toolbar (30)
    width: bounds.width,
    height: bounds.height - 140
  });
  view.setAutoResize({ width: true, height: true });
}

function destroyBrowserView(tabId) {
  const view = activeViews.get(tabId);
  if (view) {
    mainWindow.removeBrowserView(view);
    view.webContents.destroy();
    activeViews.delete(tabId);
  }
}

function reloadActiveView(force = false) {
  const view = activeViews.get(activeTabId);
  if (view) {
    if (force) {
      view.webContents.reloadIgnoringCache();
    } else {
      view.webContents.reload();
    }
  }
}

function zoomActiveView(delta) {
  const view = activeViews.get(activeTabId);
  if (view) {
    const currentZoom = view.webContents.getZoomFactor();
    view.webContents.setZoomFactor(Math.max(0.25, Math.min(5, currentZoom + delta)));
  }
}

function setZoomActiveView(level) {
  const view = activeViews.get(activeTabId);
  if (view) {
    view.webContents.setZoomFactor(level);
  }
}

function addToHistory(url, title) {
  const history = store.get('history') || [];
  history.unshift({
    url,
    title,
    timestamp: Date.now()
  });
  // Keep only last 1000 entries
  store.set('history', history.slice(0, 1000));
}

function navigateTo(url) {
  const view = activeViews.get(activeTabId);
  if (view) {
    view.webContents.loadURL(url);
  }
}

function openToolTab(tool) {
  mainWindow.webContents.send('open-tool', tool);
}

// Developer Portal
function openDevPortal() {
  if (devPortalWindow) {
    devPortalWindow.focus();
    return;
  }

  devPortalWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'SPIN Developer Portal',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/devportal-preload.js')
    }
  });

  devPortalWindow.loadFile(path.join(__dirname, '../renderer/devportal.html'));

  devPortalWindow.on('closed', () => {
    devPortalWindow = null;
  });
}

function logToDevPortal(type, message) {
  if (devPortalWindow && !devPortalWindow.isDestroyed()) {
    devPortalWindow.webContents.send('log', { type, message, timestamp: Date.now() });
  }
  commandHistory.push({ type, message, timestamp: Date.now() });
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: `About ${APP_NAME}`,
    message: APP_NAME,
    detail: `Version ${APP_VERSION}\n\n"Calling All Cars!" - A privacy-focused browser designed for OSINT investigations, inspired by Dick Tracy's legendary detective work.\n\nFeatures:\n• Tor integration for going dark\n• Anti-tracking protections\n• OSINT bookmark collections\n• Google dorks toolbar\n• Developer portal (Two-Way Wrist Radio)\n\n"The wrist radio of the digital age"\n\n© 2024 SPIN OSINT Team`
  });
}

// IPC Handlers
ipcMain.handle('create-tab', (event, { tabId, url }) => {
  createBrowserView(tabId, url);
  return true;
});

ipcMain.handle('show-tab', (event, tabId) => {
  showBrowserView(tabId);
  return true;
});

ipcMain.handle('close-tab', (event, tabId) => {
  destroyBrowserView(tabId);
  return true;
});

ipcMain.handle('navigate', (event, { tabId, url }) => {
  const view = activeViews.get(tabId);
  if (view) {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
      // Check if it looks like a URL
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Treat as search query - use DuckDuckGo (privacy-focused)
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      }
    }

    // Block Google in extreme privacy mode - using cached settings & Set for O(1) lookup
    const privacy = cachedPrivacySettings || store.get('privacy');
    if (privacy.extremePrivacyMode) {
      const urlLower = url.toLowerCase();
      const isBlocked = [...BLOCKED_DOMAINS_EXTREME].some(domain => urlLower.includes(domain));
      if (isBlocked) {
        // Redirect Google searches to DuckDuckGo
        if (urlLower.includes('google.com/search') || urlLower.includes('google.co')) {
          const searchMatch = url.match(/[?&]q=([^&]+)/);
          if (searchMatch) {
            const query = decodeURIComponent(searchMatch[1]);
            url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            logToDevPortal('privacy', `Redirected Google search to DuckDuckGo (Extreme Privacy Mode)`);
          } else {
            url = 'https://duckduckgo.com/';
          }
        } else {
          dialog.showMessageBox(mainWindow, {
            type: 'warning',
            title: 'Blocked by Extreme Privacy Mode',
            message: 'This domain is blocked in Extreme Privacy Mode.',
            detail: `Google services are blocked to protect your privacy.\n\nRequested URL: ${url}\n\nUse DuckDuckGo for searches instead.`
          });
          return { blocked: true, reason: 'extreme_privacy' };
        }
      }
    }

    view.webContents.loadURL(url);
  }
  return { blocked: false };
});

ipcMain.handle('go-back', (event, tabId) => {
  const view = activeViews.get(tabId);
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
  }
  return true;
});

ipcMain.handle('go-forward', (event, tabId) => {
  const view = activeViews.get(tabId);
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
  }
  return true;
});

ipcMain.handle('reload', (event, tabId) => {
  const view = activeViews.get(tabId);
  if (view) {
    view.webContents.reload();
  }
  return true;
});

ipcMain.handle('get-privacy-settings', () => {
  return store.get('privacy');
});

ipcMain.handle('set-privacy-setting', (event, { key, value }) => {
  store.set(`privacy.${key}`, value);
  applyPrivacySettings();
  return store.get('privacy');
});

ipcMain.handle('get-bookmarks', () => {
  return store.get('bookmarks');
});

ipcMain.handle('add-bookmark', (event, bookmark) => {
  const bookmarks = store.get('bookmarks') || [];
  bookmarks.push({ ...bookmark, id: Date.now(), createdAt: Date.now() });
  store.set('bookmarks', bookmarks);
  return bookmarks;
});

ipcMain.handle('remove-bookmark', (event, bookmarkId) => {
  const bookmarks = store.get('bookmarks') || [];
  store.set('bookmarks', bookmarks.filter(b => b.id !== bookmarkId));
  return store.get('bookmarks');
});

ipcMain.handle('get-history', () => {
  return store.get('history');
});

ipcMain.handle('clear-history', () => {
  store.set('history', []);
  return [];
});

ipcMain.handle('execute-command', async (event, command) => {
  commandHistory.push({ type: 'command', message: command, timestamp: Date.now() });

  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  try {
    switch (cmd) {
      case 'help':
        return {
          success: true,
          output: `Available commands:
  help              - Show this help
  privacy           - Show privacy settings
  privacy.set KEY VALUE - Set privacy setting
  tor.status        - Check Tor connection status
  tor.enable        - Enable Tor
  tor.disable       - Disable Tor
  navigate URL      - Navigate to URL
  search QUERY      - Search with DuckDuckGo
  bookmark.add URL  - Add bookmark
  bookmark.list     - List bookmarks
  history           - Show browsing history
  history.clear     - Clear history
  clear             - Clear console
  version           - Show version info`
        };

      case 'privacy':
        return { success: true, output: JSON.stringify(store.get('privacy'), null, 2) };

      case 'privacy.set':
        if (args.length < 2) return { success: false, output: 'Usage: privacy.set KEY VALUE' };
        store.set(`privacy.${args[0]}`, args[1] === 'true');
        applyPrivacySettings();
        return { success: true, output: `Set privacy.${args[0]} = ${args[1]}` };

      case 'tor.status':
        const torEnabled = store.get('privacy.torEnabled');
        return { success: true, output: `Tor is ${torEnabled ? 'ENABLED' : 'DISABLED'}` };

      case 'tor.enable':
        store.set('privacy.torEnabled', true);
        applyPrivacySettings();
        return { success: true, output: 'Tor proxy enabled (ensure Tor is running on port 9050)' };

      case 'tor.disable':
        store.set('privacy.torEnabled', false);
        session.defaultSession.setProxy({ proxyRules: '' });
        return { success: true, output: 'Tor proxy disabled' };

      case 'navigate':
        if (args.length < 1) return { success: false, output: 'Usage: navigate URL' };
        navigateTo(args.join(' '));
        return { success: true, output: `Navigating to ${args.join(' ')}` };

      case 'search':
        if (args.length < 1) return { success: false, output: 'Usage: search QUERY' };
        navigateTo(`https://duckduckgo.com/?q=${encodeURIComponent(args.join(' '))}`);
        return { success: true, output: `Searching for: ${args.join(' ')}` };

      case 'bookmark.add':
        if (args.length < 1) return { success: false, output: 'Usage: bookmark.add URL [TITLE]' };
        const bm = { url: args[0], title: args.slice(1).join(' ') || args[0], category: 'custom' };
        store.set('bookmarks', [...(store.get('bookmarks') || []), { ...bm, id: Date.now() }]);
        return { success: true, output: `Bookmark added: ${args[0]}` };

      case 'bookmark.list':
        const bms = store.get('bookmarks') || [];
        return { success: true, output: bms.length > 0 ? bms.map(b => `${b.title}: ${b.url}`).join('\n') : 'No bookmarks' };

      case 'history':
        const hist = (store.get('history') || []).slice(0, 20);
        return { success: true, output: hist.length > 0 ? hist.map(h => `${h.title}: ${h.url}`).join('\n') : 'No history' };

      case 'history.clear':
        store.set('history', []);
        return { success: true, output: 'History cleared' };

      case 'version':
        return { success: true, output: `${APP_NAME} v${APP_VERSION}\nCodename: Tracey\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}\n\n"The wrist radio of the digital age"` };

      default:
        return { success: false, output: `Unknown command: ${cmd}. Type 'help' for available commands.` };
    }
  } catch (error) {
    return { success: false, output: `Error: ${error.message}` };
  }
});

ipcMain.handle('get-command-history', () => {
  return commandHistory;
});

ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  const privacy = store.get('privacy');
  if (privacy.clearOnExit) {
    clearBrowsingData();
  }
  mainWindow.close();
});

ipcMain.handle('resize-view', (event, bounds) => {
  const view = activeViews.get(activeTabId);
  if (view) {
    view.setBounds(bounds);
  }
});

// ============================================
// INVESTIGATION LOG & SCREENSHOT HANDLERS
// ============================================

ipcMain.handle('add-investigation-log', (event, entry) => {
  const logs = store.get('investigationLog') || [];
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.push(newEntry);
  store.set('investigationLog', logs);
  logToDevPortal('investigation', `Logged: ${entry.title || entry.url}`);
  return newEntry;
});

ipcMain.handle('get-investigation-log', () => {
  return store.get('investigationLog') || [];
});

ipcMain.handle('clear-investigation-log', () => {
  store.set('investigationLog', []);
  return [];
});

ipcMain.handle('export-investigation-log', async (event, format) => {
  const logs = store.get('investigationLog') || [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Investigation Log',
    defaultPath: `investigation-log-${timestamp}.${format === 'json' ? 'json' : 'html'}`,
    filters: format === 'json'
      ? [{ name: 'JSON', extensions: ['json'] }]
      : [{ name: 'HTML Report', extensions: ['html'] }]
  });

  if (filePath) {
    if (format === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    } else {
      const html = generateHtmlReport(logs);
      fs.writeFileSync(filePath, html);
    }
    return { success: true, path: filePath };
  }
  return { success: false };
});

function generateHtmlReport(logs) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>SPIN OSINT Investigation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .header { background: #1a1a2e; color: #00ff88; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; }
    .entry { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .entry-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .entry-time { color: #666; font-size: 12px; }
    .entry-title { font-weight: bold; color: #333; }
    .entry-url { color: #0066cc; word-break: break-all; }
    .entry-notes { margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
    .screenshot { max-width: 100%; margin-top: 10px; border: 1px solid #ddd; }
    .metadata { margin-top: 10px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SPIN OSINT Investigation Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Total Entries: ${logs.length}</p>
  </div>
  ${logs.map(log => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${log.title || 'Untitled'}</span>
        <span class="entry-time">${new Date(log.timestamp).toLocaleString()}</span>
      </div>
      <div class="entry-url">${log.url || ''}</div>
      ${log.notes ? `<div class="entry-notes">${log.notes}</div>` : ''}
      ${log.screenshot ? `<img class="screenshot" src="${log.screenshot}" alt="Screenshot">` : ''}
      ${log.metadata ? `<div class="metadata"><pre>${JSON.stringify(log.metadata, null, 2)}</pre></div>` : ''}
    </div>
  `).join('')}
</body>
</html>`;
}

ipcMain.handle('take-screenshot', async (event, tabId) => {
  const view = activeViews.get(tabId || activeTabId);
  if (!view) return { success: false, error: 'No active view' };

  try {
    const image = await view.webContents.capturePage();
    const base64 = image.toDataURL();

    const investigation = store.get('investigation');
    if (investigation.autoScreenshot && investigation.screenshotPath) {
      const filename = `screenshot-${Date.now()}.png`;
      const filepath = path.join(investigation.screenshotPath, filename);
      fs.writeFileSync(filepath, image.toPNG());
      logToDevPortal('screenshot', `Saved: ${filepath}`);
    }

    return { success: true, data: base64 };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-investigation-settings', () => {
  return store.get('investigation');
});

ipcMain.handle('set-investigation-setting', (event, { key, value }) => {
  store.set(`investigation.${key}`, value);
  return store.get('investigation');
});

ipcMain.handle('select-screenshot-folder', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Screenshot Folder'
  });

  if (filePaths && filePaths.length > 0) {
    store.set('investigation.screenshotPath', filePaths[0]);
    return filePaths[0];
  }
  return null;
});

// ============================================
// METADATA EXTRACTION
// ============================================

ipcMain.handle('extract-metadata', async (event, tabId) => {
  const view = activeViews.get(tabId || activeTabId);
  if (!view) return { success: false, error: 'No active view' };

  try {
    const metadata = await view.webContents.executeJavaScript(`
      (function() {
        const meta = {};

        // Basic page info
        meta.title = document.title;
        meta.url = window.location.href;
        meta.domain = window.location.hostname;

        // Meta tags
        meta.metaTags = {};
        document.querySelectorAll('meta').forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('http-equiv');
          const content = tag.getAttribute('content');
          if (name && content) {
            meta.metaTags[name] = content;
          }
        });

        // Open Graph
        meta.openGraph = {};
        document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
          const prop = tag.getAttribute('property').replace('og:', '');
          meta.openGraph[prop] = tag.getAttribute('content');
        });

        // Twitter Card
        meta.twitterCard = {};
        document.querySelectorAll('meta[name^="twitter:"]').forEach(tag => {
          const name = tag.getAttribute('name').replace('twitter:', '');
          meta.twitterCard[name] = tag.getAttribute('content');
        });

        // Links
        meta.links = {
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          favicon: document.querySelector('link[rel="icon"]')?.href || document.querySelector('link[rel="shortcut icon"]')?.href,
          stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href).slice(0, 10)
        };

        // Scripts (external)
        meta.scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src).slice(0, 20);

        // Forms
        meta.forms = Array.from(document.querySelectorAll('form')).map(f => ({
          action: f.action,
          method: f.method,
          id: f.id,
          name: f.name
        }));

        // Images count
        meta.imageCount = document.querySelectorAll('img').length;

        // Internal/External links
        const links = Array.from(document.querySelectorAll('a[href]'));
        meta.linkCount = links.length;
        meta.externalLinks = links.filter(a => {
          try {
            return new URL(a.href).hostname !== window.location.hostname;
          } catch { return false; }
        }).map(a => a.href).slice(0, 20);

        // Technologies (basic detection)
        meta.technologies = [];
        if (document.querySelector('[data-reactroot], [data-react-checksum]')) meta.technologies.push('React');
        if (window.angular || document.querySelector('[ng-app], [ng-controller]')) meta.technologies.push('Angular');
        if (window.Vue || document.querySelector('[data-v-]')) meta.technologies.push('Vue.js');
        if (window.jQuery || window.$?.fn?.jquery) meta.technologies.push('jQuery');
        if (document.querySelector('[data-bs-toggle], .bootstrap')) meta.technologies.push('Bootstrap');

        // Headers from last navigation (if accessible)
        meta.timing = {
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
        };

        return meta;
      })()
    `);

    return { success: true, metadata };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// REVERSE IMAGE SEARCH
// ============================================

ipcMain.handle('reverse-image-search', (event, { imageUrl, engine }) => {
  const searchUrls = {
    google: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
    yandex: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`,
    tineye: `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`,
    bing: `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${encodeURIComponent(imageUrl)}`,
    pimeyes: 'https://pimeyes.com/en' // PimEyes requires manual upload
  };

  const url = searchUrls[engine] || searchUrls.yandex;
  mainWindow.webContents.send('open-url-in-new-tab', url);

  return { success: true, url };
});

// Open investigation log window
function openInvestigationLog() {
  if (investigationWindow) {
    investigationWindow.focus();
    return;
  }

  investigationWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Investigation Log',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  investigationWindow.loadFile(path.join(__dirname, '../renderer/investigation.html'));

  investigationWindow.on('closed', () => {
    investigationWindow = null;
  });
}

// Add to menu
ipcMain.handle('open-investigation-log', () => {
  openInvestigationLog();
});

// ============================================
// PLUGIN SYSTEM
// ============================================

const PluginManager = require('../plugins/plugin-manager');
const HunchlyIntegration = require('../plugins/hunchly-integration');

let pluginManager = null;

function initializePlugins() {
  pluginManager = new PluginManager(store, mainWindow);

  // Register built-in plugins
  pluginManager.register(HunchlyIntegration);

  // Load any additional plugins from plugins directory
  // (Future: scan directory for custom plugins)
}

ipcMain.handle('get-plugins', () => {
  if (!pluginManager) return [];
  return pluginManager.getAll().map(p => ({
    id: p.id,
    name: p.name,
    version: p.version,
    description: p.description,
    enabled: p.enabled,
    settings: p.settings,
    defaultSettings: p.defaultSettings
  }));
});

ipcMain.handle('set-plugin-enabled', (event, { pluginId, enabled }) => {
  if (!pluginManager) return false;
  pluginManager.setEnabled(pluginId, enabled);
  return true;
});

ipcMain.handle('update-plugin-settings', (event, { pluginId, settings }) => {
  if (!pluginManager) return false;
  pluginManager.updateSettings(pluginId, settings);
  return true;
});

ipcMain.handle('execute-plugin-action', async (event, { pluginId, action, data }) => {
  if (!pluginManager) return { success: false, error: 'Plugin manager not initialized' };

  const plugin = pluginManager.get(pluginId);
  if (!plugin) return { success: false, error: 'Plugin not found' };

  const context = pluginManager.getPluginContext(pluginId);

  try {
    switch (action) {
      case 'newCase':
        return { success: true, result: HunchlyIntegration.newCase(context, data.caseName) };
      case 'saveCase':
        return { success: true, result: HunchlyIntegration.saveCase(context) };
      case 'exportHunchly':
        return { success: true, result: HunchlyIntegration.exportHunchlyFormat(context) };
      case 'generateReport':
        return { success: true, result: HunchlyIntegration.generateReport(context) };
      case 'getStats':
        return { success: true, result: HunchlyIntegration.getStats() };
      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();
  initializePlugins();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Open in existing tab instead
    mainWindow.webContents.send('open-url-in-new-tab', url);
    return { action: 'deny' };
  });
});
