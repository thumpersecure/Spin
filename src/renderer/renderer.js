/**
 * CONSTANTINE Browser - Renderer Process
 * Version: 4.1.1 - The Exorcist's Edge
 * Clean state management and robust UI handling
 *
 * "Between Heaven and Hell, intelligence prevails."
 */

// ============================================
// Application State
// ============================================

const AppState = {
  tabs: new Map(),
  activeTabId: null,
  privacy: {},
  panelOpen: false,
  activePanel: null,
  bookmarks: [],
  platform: null,
  isFullscreen: false,
  isOnline: true,
  hasSessionToRestore: false,
  zoomLevel: 0
};

// ============================================
// DOM Elements Cache
// ============================================

const DOM = {};

function cacheDOMElements() {
  DOM.body = document.body;
  DOM.tabsWrapper = document.getElementById('tabsWrapper');
  DOM.newTabBtn = document.getElementById('newTabBtn');
  DOM.urlInput = document.getElementById('urlInput');
  DOM.backBtn = document.getElementById('backBtn');
  DOM.forwardBtn = document.getElementById('forwardBtn');
  DOM.reloadBtn = document.getElementById('reloadBtn');
  DOM.homeBtn = document.getElementById('homeBtn');
  DOM.securityBadge = document.getElementById('securityBadge');
  DOM.bookmarkPageBtn = document.getElementById('bookmarkPageBtn');
  DOM.extensionsBtn = document.getElementById('extensionsBtn');
  DOM.privacyBtn = document.getElementById('privacyBtn');
  DOM.menuBtn = document.getElementById('menuBtn');
  DOM.extensionsPanel = document.getElementById('extensionsPanel');
  DOM.panelContent = document.getElementById('panelContent');
  DOM.startPage = document.getElementById('startPage');
  DOM.startSearch = document.getElementById('startSearch');
  DOM.startSearchBtn = document.getElementById('startSearchBtn');
  DOM.quickGrid = document.getElementById('quickGrid');
  DOM.statusIndicator = document.getElementById('statusIndicator');
  DOM.statusText = DOM.statusIndicator?.querySelector('.status-text');
  DOM.minimizeBtn = document.getElementById('minimizeBtn');
  DOM.maximizeBtn = document.getElementById('maximizeBtn');
  DOM.closeBtn = document.getElementById('closeBtn');
  DOM.notificationContainer = document.getElementById('notificationContainer');
  DOM.titleBar = document.getElementById('titleBar');
}

// ============================================
// Quick Links Data
// ============================================

const QUICK_LINKS = [
  { title: 'OSINT Framework', url: 'https://osintframework.com', icon: '&#128269;' },
  { title: 'Shodan', url: 'https://www.shodan.io', icon: '&#127760;' },
  { title: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', icon: '&#128274;' },
  { title: 'Wayback Machine', url: 'https://web.archive.org', icon: '&#128197;' },
  { title: 'VirusTotal', url: 'https://www.virustotal.com', icon: '&#128737;' },
  { title: 'PimEyes', url: 'https://pimeyes.com', icon: '&#128065;' },
  { title: 'Hunter.io', url: 'https://hunter.io', icon: '&#128231;' },
  { title: 'Intelligence X', url: 'https://intelx.io', icon: '&#128373;' }
];

// ============================================
// OSINT Bookmarks Data
// ============================================

const OSINT_BOOKMARKS = {
  'Username Search': [
    { name: 'Namechk', url: 'https://namechk.com/' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock' },
    { name: 'UserSearch', url: 'https://usersearch.org/' }
  ],
  'Email Search': [
    { name: 'Hunter.io', url: 'https://hunter.io/' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/' },
    { name: 'Epieos', url: 'https://epieos.com/' },
    { name: 'EmailRep', url: 'https://emailrep.io/' }
  ],
  'Domain & IP': [
    { name: 'Shodan', url: 'https://www.shodan.io/' },
    { name: 'Censys', url: 'https://censys.io/' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/' },
    { name: 'crt.sh', url: 'https://crt.sh/' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' }
  ],
  'Image Analysis': [
    { name: 'TinEye', url: 'https://tineye.com/' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/' },
    { name: 'PimEyes', url: 'https://pimeyes.com/' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/' }
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/' },
    { name: 'Social Blade', url: 'https://socialblade.com/' }
  ],
  'Archives': [
    { name: 'Wayback Machine', url: 'https://web.archive.org/' },
    { name: 'Archive.org', url: 'https://archive.org/' },
    { name: 'CachedView', url: 'https://cachedview.com/' }
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com/' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/' }
  ],
  'Threat Intel': [
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/' },
    { name: 'Any.run', url: 'https://any.run/' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/' }
  ]
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  cacheDOMElements();
  await initializePlatform();
  setupEventListeners();
  renderQuickLinks();
  await loadPrivacySettings();
  await createInitialTab();

  // Check for previous session to restore
  checkSessionRestore();

  // Setup network status monitoring
  setupNetworkMonitoring();

  console.log('CONSTANTINE Browser v4.1.1 - The Exorcist\'s Edge initialized');
});

async function initializePlatform() {
  try {
    AppState.platform = await window.sandiego.getPlatformInfo();
    applyPlatformStyles();
  } catch (err) {
    console.error('Failed to get platform info:', err);
    // Fallback platform detection
    AppState.platform = {
      isWindows: navigator.userAgent.includes('Windows'),
      isMac: navigator.userAgent.includes('Mac'),
      isLinux: navigator.userAgent.includes('Linux')
    };
    applyPlatformStyles();
  }
}

function applyPlatformStyles() {
  if (!AppState.platform) return;

  const { isWindows, isMac, isLinux } = AppState.platform;

  // Add platform class to body for CSS targeting
  if (isWindows) DOM.body.classList.add('platform-windows');
  if (isMac) DOM.body.classList.add('platform-mac');
  if (isLinux) DOM.body.classList.add('platform-linux');

  // macOS: Hide window controls (use native traffic lights)
  if (isMac && DOM.titleBar) {
    const controls = DOM.titleBar.querySelector('.window-controls');
    if (controls) {
      controls.style.display = 'none';
    }
    // Add padding for traffic lights
    DOM.titleBar.style.paddingLeft = '80px';
  }
}

async function createInitialTab() {
  try {
    const tabId = await window.sandiego.createTab(null);
    addTabToUI(tabId, 'New Tab', null, '');
    setActiveTab(tabId);
    showStartPage(true);
  } catch (err) {
    console.error('Failed to create initial tab:', err);
    showNotification('error', 'Failed to create initial tab');
  }
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
  // Window controls
  DOM.minimizeBtn?.addEventListener('click', () => window.sandiego.minimize());
  DOM.maximizeBtn?.addEventListener('click', () => window.sandiego.maximize());
  DOM.closeBtn?.addEventListener('click', () => window.sandiego.close());

  // Tab controls
  DOM.newTabBtn?.addEventListener('click', handleNewTab);

  // Navigation
  DOM.backBtn?.addEventListener('click', () => handleNavigation('back'));
  DOM.forwardBtn?.addEventListener('click', () => handleNavigation('forward'));
  DOM.reloadBtn?.addEventListener('click', () => handleNavigation('reload'));
  DOM.homeBtn?.addEventListener('click', handleGoHome);

  // URL input
  DOM.urlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateToUrl(DOM.urlInput.value);
    }
  });

  DOM.urlInput?.addEventListener('focus', () => {
    DOM.urlInput.select();
  });

  // Start page search
  DOM.startSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateToUrl(DOM.startSearch.value);
    }
  });

  DOM.startSearchBtn?.addEventListener('click', () => {
    navigateToUrl(DOM.startSearch.value);
  });

  // Bookmark button
  DOM.bookmarkPageBtn?.addEventListener('click', handleBookmarkPage);

  // Panel toggles
  DOM.extensionsBtn?.addEventListener('click', () => togglePanel('extensions'));
  DOM.privacyBtn?.addEventListener('click', () => togglePanel('privacy'));

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // IPC listeners
  setupIPCListeners();
}

function setupIPCListeners() {
  // Tab events
  window.sandiego.onTabLoading(({ tabId, loading }) => {
    updateTabLoading(tabId, loading);
  });

  window.sandiego.onTabNavigated(({ tabId, url, canGoBack, canGoForward }) => {
    const tab = AppState.tabs.get(tabId);
    if (tab) {
      tab.url = url;
      tab.canGoBack = canGoBack;
      tab.canGoForward = canGoForward;
    }

    if (tabId === AppState.activeTabId) {
      DOM.urlInput.value = url || '';
      updateSecurityBadge(url);
      updateNavButtons(canGoBack, canGoForward);
      showStartPage(!url);
    }
  });

  window.sandiego.onTabTitleUpdated(({ tabId, title }) => {
    updateTabTitle(tabId, title);
  });

  window.sandiego.onTabFaviconUpdated(({ tabId, favicon }) => {
    updateTabFavicon(tabId, favicon);
  });

  window.sandiego.onTabActivated(({ tabId, url, title, canGoBack, canGoForward }) => {
    if (AppState.activeTabId !== tabId) {
      setActiveTab(tabId);
    }
    DOM.urlInput.value = url || '';
    updateSecurityBadge(url);
    updateNavButtons(canGoBack, canGoForward);
    showStartPage(!url);
  });

  window.sandiego.onTabCreated(({ tabId, url }) => {
    // Only add if not already in our state
    if (!AppState.tabs.has(tabId)) {
      addTabToUI(tabId, 'New Tab', null, url || '');
    }
  });

  window.sandiego.onTabError(({ tabId, error, url, code }) => {
    console.error(`Tab ${tabId} error:`, error, url, code);
    if (tabId === AppState.activeTabId) {
      showNotification('error', `Failed to load: ${error}`);
    }
  });

  window.sandiego.onPrivacyUpdated((privacy) => {
    AppState.privacy = privacy;
    updateStatusIndicator(privacy);
  });

  window.sandiego.onNotification(({ type, message }) => {
    showNotification(type, message);
  });

  // Platform events
  window.sandiego.on('platform-info', (info) => {
    AppState.platform = info;
    applyPlatformStyles();
  });

  window.sandiego.on('fullscreen-change', (isFullscreen) => {
    AppState.isFullscreen = isFullscreen;
    DOM.body.classList.toggle('fullscreen', isFullscreen);
  });

  window.sandiego.on('tor-status', ({ available }) => {
    if (available) {
      showNotification('info', 'Tor service detected and ready');
    }
  });

  window.sandiego.on('open-panel', (panelType) => {
    if (panelType === 'phone-intel') {
      openPanel('extensions');
      // Wait for panel to render, then switch to phone-intel tab
      setTimeout(() => {
        const phoneIntelTab = DOM.panelContent?.querySelector('[data-tab="phone-intel"]');
        phoneIntelTab?.click();
      }, 100);
    } else if (panelType === 'bookmarks') {
      openPanel('extensions');
    } else if (panelType === 'privacy') {
      openPanel('privacy');
    }
  });

  window.sandiego.on('screenshot-captured', ({ dataUrl }) => {
    // Create download link for screenshot
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `sandiego-screenshot-${Date.now()}.png`;
    link.click();
    showNotification('success', 'Screenshot saved');
  });

  // Tab crash handling
  window.sandiego.on('tab-crashed', ({ tabId, reason }) => {
    handleTabCrashed(tabId, reason);
  });

  window.sandiego.on('tab-unresponsive', ({ tabId }) => {
    handleTabUnresponsive(tabId);
  });

  window.sandiego.on('tab-responsive', ({ tabId }) => {
    handleTabResponsive(tabId);
  });

  // Network status
  window.sandiego.on('network-status', ({ isOnline }) => {
    handleNetworkStatusChange(isOnline);
  });

  // Session restore prompt
  window.sandiego.on('session-available', ({ count, urls }) => {
    handleSessionAvailable(count, urls);
  });

  // Certificate errors
  window.sandiego.on('certificate-error', ({ tabId, url, error }) => {
    handleCertificateError(tabId, url, error);
  });

  // Zoom level changes
  window.sandiego.on('zoom-changed', ({ tabId, zoomLevel }) => {
    if (tabId === AppState.activeTabId) {
      AppState.zoomLevel = zoomLevel;
      updateZoomIndicator(zoomLevel);
    }
  });

  // Context menu
  window.sandiego.on('context-menu', ({ x, y, hasSelection, selectionText }) => {
    showContextMenu(x, y, hasSelection, selectionText);
  });
}

// ============================================
// Tab Management
// ============================================

async function handleNewTab() {
  try {
    const tabId = await window.sandiego.createTab(null);
    addTabToUI(tabId, 'New Tab', null, '');
    setActiveTab(tabId);
    showStartPage(true);
    DOM.urlInput?.focus();
  } catch (err) {
    console.error('Failed to create new tab:', err);
    showNotification('error', 'Failed to create new tab');
  }
}

function addTabToUI(tabId, title, favicon, url) {
  // Prevent duplicate tabs
  if (AppState.tabs.has(tabId)) return;

  AppState.tabs.set(tabId, {
    title: title || 'New Tab',
    favicon: favicon,
    url: url || '',
    loading: false,
    canGoBack: false,
    canGoForward: false
  });

  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.tabId = tabId;
  tabEl.innerHTML = `
    ${favicon ? `<img class="tab-favicon" src="${escapeAttr(favicon)}" alt="">` : ''}
    <span class="tab-title">${escapeHtml(title || 'New Tab')}</span>
    <button class="tab-close" aria-label="Close tab">
      <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
    </button>
  `;

  tabEl.addEventListener('click', (e) => {
    if (!e.target.closest('.tab-close')) {
      setActiveTab(tabId);
      window.sandiego.showTab(tabId);
    }
  });

  tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  DOM.tabsWrapper?.appendChild(tabEl);
}

function setActiveTab(tabId) {
  AppState.activeTabId = tabId;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tabId === tabId);
  });

  const tab = AppState.tabs.get(tabId);
  if (tab) {
    DOM.urlInput.value = tab.url || '';
    updateSecurityBadge(tab.url);
    updateNavButtons(tab.canGoBack, tab.canGoForward);
    showStartPage(!tab.url);
  }
}

function closeTab(tabId) {
  window.sandiego.closeTab(tabId);

  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  tabEl?.remove();

  AppState.tabs.delete(tabId);

  // If no tabs left, create a new one
  if (AppState.tabs.size === 0) {
    handleNewTab();
  } else if (AppState.activeTabId === tabId) {
    // Activate the last tab
    const remaining = Array.from(AppState.tabs.keys());
    const newActiveId = remaining[remaining.length - 1];
    setActiveTab(newActiveId);
    window.sandiego.showTab(newActiveId);
  }
}

function updateTabTitle(tabId, title) {
  const tab = AppState.tabs.get(tabId);
  if (tab) {
    tab.title = title;
  }

  const titleEl = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
  if (titleEl) {
    titleEl.textContent = title || 'Untitled';
  }
}

function updateTabFavicon(tabId, favicon) {
  const tab = AppState.tabs.get(tabId);
  if (tab) {
    tab.favicon = favicon;
  }

  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (!tabEl) return;

  let faviconEl = tabEl.querySelector('.tab-favicon');
  if (favicon) {
    if (!faviconEl) {
      faviconEl = document.createElement('img');
      faviconEl.className = 'tab-favicon';
      tabEl.prepend(faviconEl);
    }
    faviconEl.src = favicon;
  } else if (faviconEl) {
    faviconEl.remove();
  }
}

function updateTabLoading(tabId, loading) {
  const tab = AppState.tabs.get(tabId);
  if (tab) {
    tab.loading = loading;
  }

  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (!tabEl) return;

  const existing = tabEl.querySelector('.tab-loading, .tab-favicon');

  if (loading) {
    if (existing) {
      const spinner = document.createElement('div');
      spinner.className = 'tab-loading';
      existing.replaceWith(spinner);
    }
  } else {
    const loadingEl = tabEl.querySelector('.tab-loading');
    if (loadingEl && tab?.favicon) {
      const img = document.createElement('img');
      img.className = 'tab-favicon';
      img.src = tab.favicon;
      loadingEl.replaceWith(img);
    } else if (loadingEl) {
      loadingEl.remove();
    }
  }
}

// ============================================
// Navigation
// ============================================

function navigateToUrl(input) {
  if (!input || !input.trim()) return;
  if (!AppState.activeTabId) return;

  window.sandiego.navigate(AppState.activeTabId, input.trim());
  showStartPage(false);
}

function handleNavigation(action) {
  if (!AppState.activeTabId) return;

  switch (action) {
    case 'back':
      window.sandiego.goBack(AppState.activeTabId);
      break;
    case 'forward':
      window.sandiego.goForward(AppState.activeTabId);
      break;
    case 'reload':
      window.sandiego.reload(AppState.activeTabId);
      break;
  }
}

function handleGoHome() {
  if (!AppState.activeTabId) return;

  const tab = AppState.tabs.get(AppState.activeTabId);
  if (tab) {
    tab.url = '';
    tab.title = 'New Tab';
    tab.canGoBack = false;
    tab.canGoForward = false;
    DOM.urlInput.value = '';
    updateNavButtons(false, false);
    updateSecurityBadge('');
    showStartPage(true);

    // Update tab title in UI
    updateTabTitle(AppState.activeTabId, 'New Tab');

    // Focus start page search
    DOM.startSearch?.focus();
  }
}

function updateNavButtons(canGoBack, canGoForward) {
  if (DOM.backBtn) DOM.backBtn.disabled = !canGoBack;
  if (DOM.forwardBtn) DOM.forwardBtn.disabled = !canGoForward;
}

function updateSecurityBadge(url) {
  if (!DOM.securityBadge) return;

  if (url && url.startsWith('https://')) {
    DOM.securityBadge.classList.add('secure');
    DOM.securityBadge.title = 'Secure Connection (HTTPS)';
  } else if (url && url.startsWith('http://')) {
    DOM.securityBadge.classList.remove('secure');
    DOM.securityBadge.title = 'Insecure Connection (HTTP)';
  } else {
    DOM.securityBadge.classList.remove('secure');
    DOM.securityBadge.title = 'Connection Security';
  }
}

function showStartPage(show) {
  if (DOM.startPage) {
    DOM.startPage.style.display = show ? 'flex' : 'none';
  }
}

// ============================================
// Panel Management
// ============================================

function togglePanel(panelType) {
  const isCurrentPanel = AppState.activePanel === panelType;

  if (AppState.panelOpen && isCurrentPanel) {
    closePanel();
  } else {
    openPanel(panelType);
  }
}

function openPanel(panelType) {
  AppState.panelOpen = true;
  AppState.activePanel = panelType;

  DOM.extensionsPanel?.classList.add('open');

  // Update button states
  DOM.extensionsBtn?.classList.toggle('active', panelType === 'extensions');
  DOM.privacyBtn?.classList.toggle('active', panelType === 'privacy');

  // Render panel content
  renderPanelContent(panelType);

  // Notify main process
  window.sandiego.panelToggle(true, 340);
}

function closePanel() {
  AppState.panelOpen = false;
  AppState.activePanel = null;

  DOM.extensionsPanel?.classList.remove('open');
  DOM.extensionsBtn?.classList.remove('active');
  DOM.privacyBtn?.classList.remove('active');

  window.sandiego.panelToggle(false, 0);
}

function renderPanelContent(panelType) {
  if (!DOM.panelContent) return;

  if (panelType === 'extensions') {
    renderExtensionsPanel();
  } else if (panelType === 'privacy') {
    renderPrivacyPanel();
  }
}

function renderExtensionsPanel() {
  DOM.panelContent.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">OSINT Tools</span>
      <button class="panel-close" aria-label="Close panel">
        <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
      </button>
    </div>
    <div class="panel-tabs">
      <button class="panel-tab active" data-tab="bookmarks">Bookmarks</button>
      <button class="panel-tab" data-tab="phone-intel">Phone Intel</button>
    </div>
    <div class="panel-tab-content" id="bookmarksTab">
      <div class="panel-search">
        <input type="text" class="panel-search-input" id="osintSearch" placeholder="Search tools...">
      </div>
      <div class="panel-body" id="osintList"></div>
    </div>
    <div class="panel-tab-content" id="phoneIntelTab" style="display: none;">
      <div class="phone-intel-container"></div>
    </div>
  `;

  DOM.panelContent.querySelector('.panel-close')?.addEventListener('click', closePanel);

  // Tab switching
  DOM.panelContent.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.panelContent.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.getElementById('bookmarksTab').style.display = tabName === 'bookmarks' ? 'flex' : 'none';
      document.getElementById('phoneIntelTab').style.display = tabName === 'phone-intel' ? 'flex' : 'none';

      if (tabName === 'phone-intel') {
        renderPhoneIntelPanel();
      }
    });
  });

  const searchInput = DOM.panelContent.querySelector('#osintSearch');
  // Debounced search for better performance
  let searchTimeout = null;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderOSINTBookmarks(e.target.value);
    }, 150); // 150ms debounce
  });

  renderOSINTBookmarks('');
}

// ============================================
// Phone Intelligence Panel
// ============================================

async function renderPhoneIntelPanel() {
  const container = DOM.panelContent.querySelector('.phone-intel-container');
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="phone-intel-loading">Loading countries...</div>';

  let countries = {};
  try {
    countries = await window.sandiego.phoneIntel.getCountries();
  } catch (err) {
    console.error('Failed to load countries:', err);
    container.innerHTML = '<div class="phone-intel-error">Failed to load countries. Please try again.</div>';
    return;
  }

  container.innerHTML = `
    <div class="phone-intel-header">
      <div class="phone-intel-icon">&#128222;</div>
      <div class="phone-intel-title">Phone Number Intelligence</div>
      <div class="phone-intel-subtitle">xTELENUMSINT Technology</div>
    </div>

    <div class="phone-intel-form">
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="tel" id="phoneNumber" class="form-input" placeholder="Enter phone number..." maxlength="30">
      </div>

      <div class="form-group">
        <label class="form-label">Country</label>
        <select id="countrySelect" class="form-select">
          ${Object.entries(countries).map(([code, data]) =>
            `<option value="${escapeAttr(code)}" ${code === 'US' ? 'selected' : ''}>${escapeHtml(data.name)} (${escapeHtml(data.code)})</option>`
          ).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Search Engine</label>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="searchEngine" value="duckduckgo" checked>
            <span class="radio-label">DuckDuckGo</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="searchEngine" value="google">
            <span class="radio-label">Google</span>
          </label>
        </div>
      </div>

      <button class="phone-intel-btn primary" id="generateFormatsBtn">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/></svg>
        <span class="btn-text">Generate Format Variations</span>
      </button>

      <button class="phone-intel-btn accent" id="smartSearchBtn">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <span class="btn-text">Smart OSINT Search</span>
      </button>
    </div>

    <div class="phone-intel-results" id="phoneIntelResults" style="display: none;">
      <div class="results-header">Format Variations</div>
      <div class="formats-list" id="formatsList"></div>
    </div>
  `;

  // Event handlers
  const generateBtn = container.querySelector('#generateFormatsBtn');
  const smartSearchBtn = container.querySelector('#smartSearchBtn');
  const phoneInput = container.querySelector('#phoneNumber');
  const countrySelect = container.querySelector('#countrySelect');

  generateBtn?.addEventListener('click', async () => {
    const phone = phoneInput?.value.trim();
    const country = countrySelect?.value || 'US';

    if (!phone) {
      showNotification('warning', 'Please enter a phone number');
      phoneInput?.focus();
      return;
    }

    // Show loading state
    const btnText = generateBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
      const result = await window.sandiego.phoneIntel.generateFormats(phone, country);
      if (result) {
        displayFormatResults(result);
      } else {
        showNotification('error', 'Failed to generate formats');
      }
    } catch (err) {
      console.error('Generate formats error:', err);
      showNotification('error', 'Failed to generate formats');
    } finally {
      btnText.textContent = originalText;
      generateBtn.disabled = false;
    }
  });

  smartSearchBtn?.addEventListener('click', async () => {
    const phone = phoneInput?.value.trim();
    const country = countrySelect?.value || 'US';
    const searchEngine = container.querySelector('input[name="searchEngine"]:checked')?.value || 'duckduckgo';

    if (!phone) {
      showNotification('warning', 'Please enter a phone number');
      phoneInput?.focus();
      return;
    }

    // Show loading state
    const btnText = smartSearchBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Searching...';
    smartSearchBtn.disabled = true;

    try {
      const result = await window.sandiego.phoneIntel.batchSearch(phone, country, searchEngine);
      if (result) {
        showNotification('success', 'OSINT search opened in new tab');
      } else {
        showNotification('error', 'Failed to execute search');
      }
    } catch (err) {
      console.error('Batch search error:', err);
      showNotification('error', 'Failed to execute search');
    } finally {
      btnText.textContent = originalText;
      smartSearchBtn.disabled = false;
    }
  });

  // Enter key support
  phoneInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      generateBtn?.click();
    }
  });
}

function displayFormatResults(result) {
  const resultsContainer = document.getElementById('phoneIntelResults');
  const formatsList = document.getElementById('formatsList');

  if (!resultsContainer || !formatsList) return;

  resultsContainer.style.display = 'block';
  formatsList.innerHTML = '';

  result.formats.forEach((format, index) => {
    const formatEl = document.createElement('div');
    formatEl.className = 'format-item';
    formatEl.innerHTML = `
      <div class="format-info">
        <span class="format-name">${escapeHtml(format.name)}</span>
        <span class="format-value">${escapeHtml(format.value)}</span>
      </div>
      <div class="format-actions">
        <button class="format-btn copy" title="Copy to clipboard" data-value="${escapeAttr(format.value)}">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
        </button>
        <button class="format-btn search" title="Search this format" data-url="${escapeAttr(result.searchQueries[index]?.duckDuckGoUrl || '')}">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    `;

    // Copy button handler
    formatEl.querySelector('.copy')?.addEventListener('click', async (e) => {
      const value = e.currentTarget.dataset.value;
      try {
        await navigator.clipboard.writeText(value);
        showNotification('success', 'Copied to clipboard');
      } catch (err) {
        console.error('Clipboard error:', err);
        showNotification('error', 'Failed to copy to clipboard');
      }
    });

    // Search button handler
    formatEl.querySelector('.search')?.addEventListener('click', async (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) {
        try {
          await window.sandiego.phoneIntel.openSearch(url);
          showNotification('success', 'Search opened in new tab');
        } catch (err) {
          console.error('Search error:', err);
          showNotification('error', 'Failed to open search');
        }
      }
    });

    formatsList.appendChild(formatEl);
  });
}

function renderOSINTBookmarks(filter = '') {
  const container = document.getElementById('osintList');
  if (!container) return;

  container.innerHTML = '';
  const query = filter.toLowerCase();

  for (const [category, items] of Object.entries(OSINT_BOOKMARKS)) {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) continue;

    const groupEl = document.createElement('div');
    groupEl.className = 'panel-group';
    groupEl.innerHTML = `
      <div class="panel-group-title">
        <svg class="arrow" viewBox="0 0 12 12"><path d="M4 2l4 4-4 4" fill="none"/></svg>
        <span>${escapeHtml(category)}</span>
        <span style="color: var(--text-tertiary); font-size: 11px; margin-left: auto;">${filtered.length}</span>
      </div>
      <div class="panel-group-items"></div>
    `;

    const titleEl = groupEl.querySelector('.panel-group-title');
    titleEl?.addEventListener('click', () => {
      groupEl.classList.toggle('collapsed');
    });

    const itemsContainer = groupEl.querySelector('.panel-group-items');
    filtered.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'panel-item';
      itemEl.innerHTML = `
        <svg class="panel-item-icon" viewBox="0 0 16 16">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none"/>
        </svg>
        <span class="panel-item-text">${escapeHtml(item.name)}</span>
      `;
      itemEl.addEventListener('click', () => navigateToUrl(item.url));
      itemsContainer?.appendChild(itemEl);
    });

    container.appendChild(groupEl);
  }
}

function renderPrivacyPanel() {
  const privacy = AppState.privacy;

  DOM.panelContent.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">Privacy Shield</span>
      <button class="panel-close" aria-label="Close panel">
        <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
      </button>
    </div>
    <div class="panel-body">
      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Tor Proxy</div>
          <div class="privacy-desc">Route traffic through Tor (requires Tor on port 9050)</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="torEnabled" ${privacy.torEnabled ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Block Trackers</div>
          <div class="privacy-desc">Block known tracking domains (60+ domains)</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="blockTrackers" ${privacy.blockTrackers ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Block Fingerprinting</div>
          <div class="privacy-desc">Randomize canvas, WebGL, and hardware fingerprints</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="blockFingerprinting" ${privacy.blockFingerprinting ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Block Third-Party Cookies</div>
          <div class="privacy-desc">Prevent cross-site tracking cookies</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="blockThirdPartyCookies" ${privacy.blockThirdPartyCookies ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Block WebRTC</div>
          <div class="privacy-desc">Prevent IP leaks via WebRTC</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="blockWebRTC" ${privacy.blockWebRTC ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Spoof User Agent</div>
          <div class="privacy-desc">Use platform-specific Firefox user agent</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="spoofUserAgent" ${privacy.spoofUserAgent ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Do Not Track</div>
          <div class="privacy-desc">Send DNT and Global Privacy Control headers</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="doNotTrack" ${privacy.doNotTrack ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">HTTPS Upgrade</div>
          <div class="privacy-desc">Automatically upgrade HTTP to HTTPS</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="httpsUpgrade" ${privacy.httpsUpgrade ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Clear on Exit</div>
          <div class="privacy-desc">Clear all browsing data when closing</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="clearOnExit" ${privacy.clearOnExit ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <button class="shield-btn" id="clearDataBtn">Clear Browsing Data Now</button>
      <button class="shield-btn secondary" id="checkTorBtn" style="margin-top: 8px; background: var(--bg-overlay); border: 1px solid var(--border-default);">Check Tor Status</button>
    </div>
  `;

  DOM.panelContent.querySelector('.panel-close')?.addEventListener('click', closePanel);

  // Privacy toggle handlers
  DOM.panelContent.querySelectorAll('input[data-setting]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const key = e.target.dataset.setting;
      const value = e.target.checked;
      try {
        await window.sandiego.setPrivacySetting(key, value);
      } catch (err) {
        console.error('Failed to set privacy setting:', err);
        e.target.checked = !value; // Revert on error
        showNotification('error', 'Failed to update setting');
      }
    });
  });

  // Clear data button
  DOM.panelContent.querySelector('#clearDataBtn')?.addEventListener('click', async () => {
    try {
      await window.sandiego.clearBrowsingData();
      showNotification('success', 'Browsing data cleared successfully');
    } catch (err) {
      console.error('Failed to clear data:', err);
      showNotification('error', 'Failed to clear browsing data');
    }
  });

  // Check Tor button
  DOM.panelContent.querySelector('#checkTorBtn')?.addEventListener('click', async () => {
    try {
      const status = await window.sandiego.checkTorStatus();
      if (status.available) {
        showNotification('success', 'Tor service is running and ready');
      } else {
        showNotification('warning', 'Tor service not detected. Please start Tor.');
      }
    } catch (err) {
      console.error('Failed to check Tor:', err);
      showNotification('error', 'Failed to check Tor status');
    }
  });
}

// ============================================
// Privacy & Status
// ============================================

async function loadPrivacySettings() {
  try {
    AppState.privacy = await window.sandiego.getPrivacySettings();
    updateStatusIndicator(AppState.privacy);
  } catch (err) {
    console.error('Failed to load privacy settings:', err);
  }
}

function updateStatusIndicator(privacy) {
  if (!DOM.statusIndicator || !DOM.statusText) return;

  DOM.statusIndicator.classList.remove('tor', 'protected');

  if (privacy.torEnabled) {
    DOM.statusIndicator.classList.add('tor');
    DOM.statusText.textContent = 'Tor Active';
  } else if (privacy.blockTrackers || privacy.blockFingerprinting) {
    DOM.statusIndicator.classList.add('protected');
    DOM.statusText.textContent = 'Protected';
  } else {
    DOM.statusText.textContent = 'Ready';
  }
}

// ============================================
// Quick Links
// ============================================

function renderQuickLinks() {
  if (!DOM.quickGrid) return;

  DOM.quickGrid.innerHTML = '';

  QUICK_LINKS.forEach(link => {
    const linkEl = document.createElement('div');
    linkEl.className = 'quick-link';
    linkEl.innerHTML = `
      <div class="quick-link-icon">${link.icon}</div>
      <span class="quick-link-title">${escapeHtml(link.title)}</span>
    `;
    linkEl.addEventListener('click', () => navigateToUrl(link.url));
    DOM.quickGrid.appendChild(linkEl);
  });
}

// ============================================
// Bookmarks
// ============================================

async function handleBookmarkPage() {
  if (!AppState.activeTabId) return;

  const tab = AppState.tabs.get(AppState.activeTabId);
  if (!tab || !tab.url) {
    showNotification('warning', 'No page to bookmark');
    return;
  }

  try {
    await window.sandiego.addBookmark({
      title: tab.title,
      url: tab.url
    });
    DOM.bookmarkPageBtn?.classList.add('bookmarked');
    showNotification('success', 'Page bookmarked');
  } catch (err) {
    console.error('Failed to bookmark:', err);
    showNotification('error', 'Failed to bookmark page');
  }
}

// ============================================
// Keyboard Shortcuts
// ============================================

function handleKeyboardShortcuts(e) {
  const isModifier = e.ctrlKey || e.metaKey;

  if (isModifier) {
    switch (e.key.toLowerCase()) {
      case 't':
        e.preventDefault();
        handleNewTab();
        break;
      case 'w':
        e.preventDefault();
        if (AppState.activeTabId) {
          closeTab(AppState.activeTabId);
        }
        break;
      case 'l':
        e.preventDefault();
        DOM.urlInput?.focus();
        DOM.urlInput?.select();
        break;
      case 'r':
        e.preventDefault();
        handleNavigation('reload');
        break;
      case 'd':
        e.preventDefault();
        handleBookmarkPage();
        break;
    }

    // Shift + Key shortcuts
    if (e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          openPanel('extensions');
          setTimeout(() => {
            const phoneIntelTab = DOM.panelContent?.querySelector('[data-tab="phone-intel"]');
            phoneIntelTab?.click();
          }, 100);
          break;
        case 'b':
          e.preventDefault();
          openPanel('extensions');
          break;
        case 'd':
          e.preventDefault();
          openPanel('privacy');
          break;
      }
    }
  }

  // Escape to close panel
  if (e.key === 'Escape' && AppState.panelOpen) {
    closePanel();
  }

  // F12 for DevTools (handled by main process, but prevent default)
  if (e.key === 'F12') {
    // Let it propagate to main process
  }
}

// ============================================
// Notifications
// ============================================

// Track active notifications for cleanup
const MAX_NOTIFICATIONS = 5;

function showNotification(type, message, duration = 3000) {
  if (!DOM.notificationContainer) return;

  // Limit notifications to prevent memory bloat
  const existing = DOM.notificationContainer.querySelectorAll('.notification');
  if (existing.length >= MAX_NOTIFICATIONS) {
    existing[0].remove(); // Remove oldest
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <svg class="notification-icon" viewBox="0 0 20 20">
      ${type === 'success' ? '<path d="M16 5l-9 9-4-4" fill="none"/>' :
        type === 'error' ? '<circle cx="10" cy="10" r="8" fill="none"/><line x1="6" y1="6" x2="14" y2="14"/><line x1="14" y1="6" x2="6" y2="14"/>' :
        type === 'warning' ? '<path d="M10 3L2 17h16L10 3z" fill="none"/><line x1="10" y1="9" x2="10" y2="12"/><circle cx="10" cy="15" r="0.5"/>' :
        '<circle cx="10" cy="10" r="8" fill="none"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="14" r="1"/>'}
    </svg>
    <span class="notification-text">${escapeHtml(message)}</span>
    <button class="notification-close" aria-label="Close">
      <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
    </button>
  `;

  // Store timeout ID to allow clearing it when manually closed
  let timeoutId = setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);

  notification.querySelector('.notification-close')?.addEventListener('click', () => {
    clearTimeout(timeoutId);
    notification.remove();
  });

  DOM.notificationContainer.appendChild(notification);
}

// ============================================
// Utility Functions
// ============================================

// Optimized HTML escape using cached template
const escapeEl = document.createElement('div');
function escapeHtml(text) {
  if (!text) return '';
  escapeEl.textContent = text;
  return escapeEl.innerHTML;
}

// Escape for use in attributes
function escapeAttr(text) {
  // Handle null and undefined
  if (text == null) return '';
  
  // Convert to string to handle numbers, booleans, and other types
  const str = String(text);
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================
// Session Restore
// ============================================

async function checkSessionRestore() {
  try {
    const session = await window.sandiego.getLastSession();
    if (session && session.length > 0) {
      AppState.hasSessionToRestore = true;
      handleSessionAvailable(session.length, session);
    }
  } catch (err) {
    console.error('Failed to check session:', err);
  }
}

function handleSessionAvailable(count, urls) {
  if (count === 0 || !urls || urls.length === 0) return;

  // Create session restore banner
  const banner = document.createElement('div');
  banner.className = 'session-restore-banner';
  banner.innerHTML = `
    <div class="session-restore-content">
      <svg class="session-restore-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
      </svg>
      <span class="session-restore-text">Restore ${count} tab${count > 1 ? 's' : ''} from your previous session?</span>
    </div>
    <div class="session-restore-actions">
      <button class="session-restore-btn restore" id="restoreSessionBtn">Restore</button>
      <button class="session-restore-btn dismiss" id="dismissSessionBtn">Dismiss</button>
    </div>
  `;

  // Insert after title bar
  const titleBar = document.getElementById('titleBar');
  if (titleBar && titleBar.nextSibling) {
    titleBar.parentNode.insertBefore(banner, titleBar.nextSibling);
  } else {
    document.body.prepend(banner);
  }

  // Event handlers
  banner.querySelector('#restoreSessionBtn')?.addEventListener('click', async () => {
    banner.remove();
    try {
      await window.sandiego.restoreSession();
      showNotification('success', `Restored ${count} tab${count > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Failed to restore session:', err);
      showNotification('error', 'Failed to restore session');
    }
  });

  banner.querySelector('#dismissSessionBtn')?.addEventListener('click', () => {
    banner.remove();
    AppState.hasSessionToRestore = false;
  });

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.remove();
    }
  }, 15000);
}

// ============================================
// Tab Crash Handling
// ============================================

function handleTabCrashed(tabId, reason) {
  const tab = AppState.tabs.get(tabId);
  if (!tab) return;

  // Mark tab as crashed in state
  tab.crashed = true;

  // Update tab UI
  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (tabEl) {
    tabEl.classList.add('crashed');
    const titleEl = tabEl.querySelector('.tab-title');
    if (titleEl) {
      titleEl.textContent = `⚠ ${tab.title || 'Crashed'}`;
    }
  }

  // Show notification
  const reasonText = reason === 'killed' ? 'was killed' :
                     reason === 'crashed' ? 'crashed unexpectedly' :
                     reason === 'oom' ? 'ran out of memory' :
                     'stopped working';
  showNotification('error', `Tab ${reasonText}. Click to reload.`, 5000);

  // If this is the active tab, show crash overlay
  if (tabId === AppState.activeTabId) {
    showCrashOverlay(tabId, reason);
  }
}

function showCrashOverlay(tabId, reason) {
  // Remove existing overlay if any
  document.querySelector('.crash-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'crash-overlay';
  overlay.innerHTML = `
    <div class="crash-content">
      <div class="crash-icon">&#128683;</div>
      <h2 class="crash-title">Tab Crashed</h2>
      <p class="crash-message">This tab ${reason === 'oom' ? 'ran out of memory' : 'stopped responding'}.</p>
      <div class="crash-actions">
        <button class="crash-btn primary" id="reloadCrashedTab">Reload Tab</button>
        <button class="crash-btn secondary" id="closeCrashedTab">Close Tab</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#reloadCrashedTab')?.addEventListener('click', () => {
    overlay.remove();
    window.sandiego.reload(tabId);
    const tab = AppState.tabs.get(tabId);
    if (tab) tab.crashed = false;
    const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    tabEl?.classList.remove('crashed');
  });

  overlay.querySelector('#closeCrashedTab')?.addEventListener('click', () => {
    overlay.remove();
    closeTab(tabId);
  });
}

function handleTabUnresponsive(tabId) {
  const tab = AppState.tabs.get(tabId);
  if (!tab) return;

  tab.unresponsive = true;

  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (tabEl) {
    tabEl.classList.add('unresponsive');
  }

  if (tabId === AppState.activeTabId) {
    showNotification('warning', 'Tab is not responding...', 3000);
  }
}

function handleTabResponsive(tabId) {
  const tab = AppState.tabs.get(tabId);
  if (!tab) return;

  tab.unresponsive = false;

  const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (tabEl) {
    tabEl.classList.remove('unresponsive');
  }
}

// ============================================
// Network Status Monitoring
// ============================================

function setupNetworkMonitoring() {
  // Use browser's online/offline events as backup
  window.addEventListener('online', () => handleNetworkStatusChange(true));
  window.addEventListener('offline', () => handleNetworkStatusChange(false));

  // Check initial state
  AppState.isOnline = navigator.onLine;
  if (!AppState.isOnline) {
    showOfflineBanner();
  }
}

function handleNetworkStatusChange(isOnline) {
  const wasOnline = AppState.isOnline;
  AppState.isOnline = isOnline;

  if (!isOnline && wasOnline) {
    // Just went offline
    showOfflineBanner();
    showNotification('warning', 'You are offline. Some features may not work.');
  } else if (isOnline && !wasOnline) {
    // Just came back online
    hideOfflineBanner();
    showNotification('success', 'Connection restored');
  }
}

function showOfflineBanner() {
  // Remove existing if any
  document.querySelector('.offline-banner')?.remove();

  const banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.innerHTML = `
    <svg class="offline-icon" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922c.05.062.105.118.168.167l6.91 6.911a1 1 0 001.415-1.414l-.675-.675a9.001 9.001 0 00-.668-11.982A1 1 0 1014.95 5.05a7.002 7.002 0 01.657 9.143l-1.435-1.435a5.002 5.002 0 00-.636-6.294A1 1 0 0012.12 7.88c.924.923 1.12 2.3.587 3.415l-1.992-1.992a.922.922 0 00-.018-.018l-6.99-6.991zM3.238 8.187a1 1 0 00-1.933-.518c-.006.012-.01.025-.014.037a9.004 9.004 0 002.497 8.062 1 1 0 001.414-1.414 7.002 7.002 0 01-1.964-6.167z" clip-rule="evenodd"/>
    </svg>
    <span>No internet connection</span>
  `;

  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    toolbar.parentNode.insertBefore(banner, toolbar.nextSibling);
  }
}

function hideOfflineBanner() {
  document.querySelector('.offline-banner')?.remove();
}

// ============================================
// Certificate Error Handling
// ============================================

function handleCertificateError(tabId, url, error) {
  const tab = AppState.tabs.get(tabId);
  if (!tab) return;

  // Mark tab with certificate error
  tab.certificateError = { url, error };

  // Show security warning
  showNotification('warning', `Certificate error on ${new URL(url).hostname}: ${error}`, 5000);

  // Update security badge
  if (tabId === AppState.activeTabId) {
    DOM.securityBadge?.classList.add('error');
    DOM.securityBadge.title = `Certificate Error: ${error}`;
  }

  // Show certificate error dialog
  showCertificateDialog(tabId, url, error);
}

function showCertificateDialog(tabId, url, error) {
  // Remove existing dialog if any
  document.querySelector('.certificate-dialog')?.remove();

  const hostname = new URL(url).hostname;
  const dialog = document.createElement('div');
  dialog.className = 'certificate-dialog';
  dialog.innerHTML = `
    <div class="certificate-dialog-content">
      <div class="certificate-icon">&#128274;</div>
      <h2 class="certificate-title">Connection Not Secure</h2>
      <p class="certificate-host">${escapeHtml(hostname)}</p>
      <p class="certificate-error">${escapeHtml(error)}</p>
      <p class="certificate-warning">This connection may be intercepted or the website's certificate may be invalid.</p>
      <div class="certificate-actions">
        <button class="certificate-btn primary" id="goBackBtn">Go Back (Recommended)</button>
        <button class="certificate-btn secondary" id="proceedUnsafeBtn">Proceed Anyway (Unsafe)</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  dialog.querySelector('#goBackBtn')?.addEventListener('click', () => {
    dialog.remove();
    handleNavigation('back');
  });

  dialog.querySelector('#proceedUnsafeBtn')?.addEventListener('click', async () => {
    dialog.remove();
    // Note: The main process has already blocked this. We'd need a dedicated
    // IPC call to proceed with the certificate error. For now, just notify.
    showNotification('warning', 'Cannot proceed - certificate blocked for security');
  });
}

// ============================================
// Zoom Level Indicator
// ============================================

function updateZoomIndicator(zoomLevel) {
  const percent = Math.round(Math.pow(1.2, zoomLevel) * 100);

  // Only show indicator if zoom is not 100%
  if (percent !== 100) {
    showZoomBadge(percent);
  } else {
    hideZoomBadge();
  }
}

function showZoomBadge(percent) {
  let badge = document.querySelector('.zoom-badge');

  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'zoom-badge';
    DOM.urlInput?.parentNode?.appendChild(badge);
  }

  badge.textContent = `${percent}%`;
  badge.style.display = 'flex';

  // Auto-hide after 2 seconds
  clearTimeout(badge._hideTimeout);
  badge._hideTimeout = setTimeout(() => {
    badge.style.display = 'none';
  }, 2000);
}

function hideZoomBadge() {
  const badge = document.querySelector('.zoom-badge');
  if (badge) {
    badge.style.display = 'none';
  }
}

// ============================================
// Context Menu
// ============================================

function showContextMenu(x, y, hasSelection, selectionText) {
  // Remove existing menu
  document.querySelector('.context-menu')?.remove();

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const items = [];

  if (hasSelection && selectionText) {
    items.push({
      label: 'Copy',
      action: async () => {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
          console.error('Clipboard API not available');
          showNotification('Clipboard is not available. Unable to copy selection.');
          return;
        }
        try {
          await navigator.clipboard.writeText(selectionText);
        } catch (err) {
          console.error('Failed to write text to clipboard:', err);
          showNotification('Failed to copy text to clipboard.');
        }
      }
    });
    items.push({
      label: `Search "${selectionText.slice(0, 30)}${selectionText.length > 30 ? '...' : ''}"`,
      action: () => {
        const searchUrl = new URL('https://duckduckgo.com/');
        searchUrl.searchParams.set('q', selectionText);
        navigateToUrl(searchUrl.toString());
      }
    });
    items.push({ divider: true });
  }

  items.push({
    label: 'Back',
    action: () => handleNavigation('back'),
    disabled: !AppState.tabs.get(AppState.activeTabId)?.canGoBack
  });
  items.push({
    label: 'Forward',
    action: () => handleNavigation('forward'),
    disabled: !AppState.tabs.get(AppState.activeTabId)?.canGoForward
  });
  items.push({
    label: 'Reload',
    action: () => handleNavigation('reload')
  });
  items.push({ divider: true });
  items.push({
    label: 'View Page Source',
    action: () => {
      const url = AppState.tabs.get(AppState.activeTabId)?.url;
      if (url) navigateToUrl(`view-source:${url}`);
    }
  });

  items.forEach(item => {
    if (item.divider) {
      const divider = document.createElement('div');
      divider.className = 'context-menu-divider';
      menu.appendChild(divider);
    } else {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      if (item.disabled) menuItem.classList.add('disabled');
      menuItem.textContent = item.label;
      if (!item.disabled) {
        menuItem.addEventListener('click', () => {
          item.action();
          menu.remove();
        });
      }
      menu.appendChild(menuItem);
    }
  });

  document.body.appendChild(menu);

  // Adjust position if menu goes off screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = `${window.innerWidth - rect.width - 10}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${window.innerHeight - rect.height - 10}px`;
  }

  // Close menu on click outside or escape
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', escHandler);
    }
  };

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      menu.remove();
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', escHandler);
    }
  };

  // Delay to prevent immediate close
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', escHandler);
  }, 10);
}
