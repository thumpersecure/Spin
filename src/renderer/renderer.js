/**
 * SANDIEGO Browser - Renderer Process
 * Version: 3.0.0-sandiego
 * Clean state management and robust UI handling
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
  bookmarks: []
};

// ============================================
// DOM Elements Cache
// ============================================

const DOM = {};

function cacheDOMElements() {
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
  setupEventListeners();
  renderQuickLinks();
  await loadPrivacySettings();
  await createInitialTab();

  console.log('SANDIEGO Browser initialized - Where in the World?');
});

async function createInitialTab() {
  try {
    const tabId = await window.sandiego.createTab(null);
    addTabToUI(tabId, 'New Tab', null, '');
    setActiveTab(tabId);
    showStartPage(true);
  } catch (err) {
    console.error('Failed to create initial tab:', err);
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
    addTabToUI(tabId, 'New Tab', null, url || '');
  });

  window.sandiego.onPrivacyUpdated((privacy) => {
    AppState.privacy = privacy;
    updateStatusIndicator(privacy);
  });

  window.sandiego.onNotification(({ type, message }) => {
    showNotification(type, message);
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
  }
}

function addTabToUI(tabId, title, favicon, url) {
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
    ${favicon ? `<img class="tab-favicon" src="${favicon}" alt="">` : ''}
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
  const tab = AppState.tabs.get(AppState.activeTabId);
  if (tab) {
    tab.url = '';
    tab.title = 'New Tab';
    DOM.urlInput.value = '';
    showStartPage(true);
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
  } else {
    DOM.securityBadge.classList.remove('secure');
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
    <div class="panel-search">
      <input type="text" class="panel-search-input" id="osintSearch" placeholder="Search tools...">
    </div>
    <div class="panel-body" id="osintList"></div>
  `;

  DOM.panelContent.querySelector('.panel-close')?.addEventListener('click', closePanel);

  const searchInput = DOM.panelContent.querySelector('#osintSearch');
  searchInput?.addEventListener('input', (e) => {
    renderOSINTBookmarks(e.target.value);
  });

  renderOSINTBookmarks('');
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
          <div class="privacy-desc">Block known tracking domains</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="blockTrackers" ${privacy.blockTrackers ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Block Fingerprinting</div>
          <div class="privacy-desc">Randomize canvas, WebGL, and audio fingerprints</div>
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
          <div class="privacy-desc">Use Firefox user agent to blend in</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-setting="spoofUserAgent" ${privacy.spoofUserAgent ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
      </div>

      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">Do Not Track</div>
          <div class="privacy-desc">Send DNT and GPC headers</div>
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
    </div>
  `;

  DOM.panelContent.querySelector('.panel-close')?.addEventListener('click', closePanel);

  // Privacy toggle handlers
  DOM.panelContent.querySelectorAll('input[data-setting]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const key = e.target.dataset.setting;
      const value = e.target.checked;
      await window.sandiego.setPrivacySetting(key, value);
    });
  });

  // Clear data button
  DOM.panelContent.querySelector('#clearDataBtn')?.addEventListener('click', async () => {
    await window.sandiego.clearBrowsingData();
    showNotification('success', 'Browsing data cleared successfully');
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
  if (!tab || !tab.url) return;

  try {
    await window.sandiego.addBookmark({
      title: tab.title,
      url: tab.url
    });
    DOM.bookmarkPageBtn?.classList.add('bookmarked');
    showNotification('success', 'Page bookmarked');
  } catch (err) {
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
  }

  // Escape to close panel
  if (e.key === 'Escape' && AppState.panelOpen) {
    closePanel();
  }
}

// ============================================
// Notifications
// ============================================

function showNotification(type, message, duration = 3000) {
  if (!DOM.notificationContainer) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <svg class="notification-icon" viewBox="0 0 20 20">
      ${type === 'success' ? '<path d="M16 5l-9 9-4-4" fill="none"/>' :
        type === 'error' ? '<circle cx="10" cy="10" r="8" fill="none"/><line x1="6" y1="6" x2="14" y2="14"/><line x1="14" y1="6" x2="6" y2="14"/>' :
        '<circle cx="10" cy="10" r="8" fill="none"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="14" r="1"/>'}
    </svg>
    <span class="notification-text">${escapeHtml(message)}</span>
    <button class="notification-close" aria-label="Close">
      <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
    </button>
  `;

  notification.querySelector('.notification-close')?.addEventListener('click', () => {
    notification.remove();
  });

  DOM.notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

// ============================================
// Utility Functions
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
