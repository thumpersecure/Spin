// SPIN OSINT Browser - Main Renderer

// Tab Management
let tabs = [];
let activeTabId = null;
let tabIdCounter = 0;

// DOM Elements
const tabsContainer = document.getElementById('tabsContainer');
const urlInput = document.getElementById('urlInput');
const startPage = document.getElementById('startPage');
const sidebar = document.getElementById('sidebar');
const dorksToolbar = document.getElementById('dorksToolbar');
const privacyIndicator = document.getElementById('privacyIndicator');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeDorksToolbar();
  initializeBookmarks();
  initializePrivacySettings();
  loadPrivacyStatus();

  // Create initial tab
  createNewTab('https://duckduckgo.com');
});

function initializeEventListeners() {
  // Window controls
  document.getElementById('minimizeBtn').addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('maximizeBtn').addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('closeBtn').addEventListener('click', () => window.electronAPI.close());

  // Tab controls
  document.getElementById('newTabBtn').addEventListener('click', () => createNewTab());

  // Navigation controls
  document.getElementById('backBtn').addEventListener('click', () => goBack());
  document.getElementById('forwardBtn').addEventListener('click', () => goForward());
  document.getElementById('reloadBtn').addEventListener('click', () => reload());
  document.getElementById('homeBtn').addEventListener('click', () => goHome());

  // URL input
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigate(urlInput.value);
    }
  });

  urlInput.addEventListener('focus', () => {
    urlInput.select();
  });

  // Tool buttons
  document.getElementById('dorksBtn').addEventListener('click', toggleDorksToolbar);
  document.getElementById('bookmarksBtn').addEventListener('click', () => toggleSidebar('bookmarks'));
  document.getElementById('privacyBtn').addEventListener('click', () => toggleSidebar('privacy'));
  document.getElementById('bookmarkBtn').addEventListener('click', addCurrentPageToBookmarks);

  // Start page
  document.getElementById('startSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigate(`https://duckduckgo.com/?q=${encodeURIComponent(e.target.value)}`);
    }
  });

  document.querySelectorAll('.quick-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.url);
    });
  });

  // Close panel buttons
  document.querySelectorAll('.close-panel-btn').forEach(btn => {
    btn.addEventListener('click', () => closeSidebar());
  });

  // IPC listeners
  window.electronAPI.onTabLoading(({ tabId, loading }) => {
    updateTabLoading(tabId, loading);
  });

  window.electronAPI.onTabNavigated(({ tabId, url }) => {
    if (tabId === activeTabId) {
      urlInput.value = url;
      updateSecurityIndicator(url);
    }
  });

  window.electronAPI.onTabTitleUpdated(({ tabId, title }) => {
    updateTabTitle(tabId, title);
  });

  window.electronAPI.onTabFaviconUpdated(({ tabId, favicon }) => {
    updateTabFavicon(tabId, favicon);
  });

  window.electronAPI.onPrivacyUpdated((privacy) => {
    updatePrivacyIndicator(privacy);
    renderPrivacySettings(privacy);
  });

  window.electronAPI.onToggleBookmarks(() => toggleSidebar('bookmarks'));
  window.electronAPI.onToggleDorks(() => toggleDorksToolbar());

  window.electronAPI.onNewTab(() => createNewTab());
  window.electronAPI.onCloseTab(() => closeActiveTab());

  window.electronAPI.onOpenUrlInNewTab((url) => createNewTab(url));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 't':
          e.preventDefault();
          createNewTab();
          break;
        case 'w':
          e.preventDefault();
          closeActiveTab();
          break;
        case 'l':
          e.preventDefault();
          urlInput.focus();
          break;
        case 'r':
          e.preventDefault();
          reload();
          break;
      }
    }
  });
}

// Tab Functions
function createNewTab(url = null) {
  const tabId = `tab-${++tabIdCounter}`;
  const tab = {
    id: tabId,
    title: 'New Tab',
    url: url || '',
    favicon: null,
    loading: false
  };

  tabs.push(tab);
  renderTab(tab);
  activateTab(tabId);

  if (url) {
    window.electronAPI.createTab(tabId, url);
    startPage.style.display = 'none';
  } else {
    startPage.style.display = 'flex';
  }

  return tabId;
}

function renderTab(tab) {
  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.tabId = tab.id;
  tabEl.innerHTML = `
    <img class="tab-favicon" src="${tab.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236e7681"><circle cx="12" cy="12" r="10"/></svg>'}" alt="">
    <span class="tab-title">${tab.title}</span>
    <button class="tab-close">✕</button>
  `;

  tabEl.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-close')) {
      activateTab(tab.id);
    }
  });

  tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tab.id);
  });

  tabsContainer.appendChild(tabEl);
}

function activateTab(tabId) {
  activeTabId = tabId;
  const tab = tabs.find(t => t.id === tabId);

  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.querySelector(`.tab[data-tab-id="${tabId}"]`)?.classList.add('active');

  if (tab) {
    urlInput.value = tab.url;
    updateSecurityIndicator(tab.url);

    if (tab.url) {
      startPage.style.display = 'none';
      window.electronAPI.showTab(tabId);
    } else {
      startPage.style.display = 'flex';
    }
  }
}

function closeTab(tabId) {
  const index = tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;

  tabs.splice(index, 1);
  document.querySelector(`.tab[data-tab-id="${tabId}"]`)?.remove();
  window.electronAPI.closeTab(tabId);

  if (tabs.length === 0) {
    createNewTab();
  } else if (activeTabId === tabId) {
    const newActiveIndex = Math.min(index, tabs.length - 1);
    activateTab(tabs[newActiveIndex].id);
  }
}

function closeActiveTab() {
  if (activeTabId) {
    closeTab(activeTabId);
  }
}

function updateTabTitle(tabId, title) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.title = title;
    const titleEl = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
    if (titleEl) titleEl.textContent = title;
  }
}

function updateTabFavicon(tabId, favicon) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.favicon = favicon;
    const faviconEl = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-favicon`);
    if (faviconEl) faviconEl.src = favicon;
  }
}

function updateTabLoading(tabId, loading) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.loading = loading;
    const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabEl) {
      const faviconEl = tabEl.querySelector('.tab-favicon');
      if (loading) {
        faviconEl.outerHTML = '<div class="tab-loading"></div>';
      } else if (tab.favicon) {
        const loadingEl = tabEl.querySelector('.tab-loading');
        if (loadingEl) {
          loadingEl.outerHTML = `<img class="tab-favicon" src="${tab.favicon}" alt="">`;
        }
      }
    }
  }
}

// Navigation Functions
function navigate(url) {
  if (!url) return;

  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) {
    createNewTab(url);
    return;
  }

  // Check if it's a search or URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
    }
  }

  tab.url = url;
  urlInput.value = url;
  startPage.style.display = 'none';

  if (!tab.title || tab.title === 'New Tab') {
    window.electronAPI.createTab(activeTabId, url);
  } else {
    window.electronAPI.navigate(activeTabId, url);
  }
}

function goBack() {
  if (activeTabId) {
    window.electronAPI.goBack(activeTabId);
  }
}

function goForward() {
  if (activeTabId) {
    window.electronAPI.goForward(activeTabId);
  }
}

function reload() {
  if (activeTabId) {
    window.electronAPI.reload(activeTabId);
  }
}

function goHome() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (tab) {
    tab.url = '';
    tab.title = 'New Tab';
    urlInput.value = '';
    startPage.style.display = 'flex';
  }
}

function updateSecurityIndicator(url) {
  const indicator = document.getElementById('securityIndicator');
  if (url && url.startsWith('https://')) {
    indicator.classList.add('secure');
  } else {
    indicator.classList.remove('secure');
  }
}

// Sidebar Functions
function toggleSidebar(panel) {
  const isCurrentPanelActive = sidebar.classList.contains('visible') &&
    document.querySelector(`.sidebar-panel[id="${panel}Panel"]`)?.classList.contains('active');

  if (isCurrentPanelActive) {
    closeSidebar();
  } else {
    openSidebar(panel);
  }
}

function openSidebar(panel) {
  sidebar.classList.add('visible');
  document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`${panel}Panel`)?.classList.add('active');

  // Update button states
  document.getElementById('bookmarksBtn').classList.toggle('active', panel === 'bookmarks');
  document.getElementById('privacyBtn').classList.toggle('active', panel === 'privacy');
}

function closeSidebar() {
  sidebar.classList.remove('visible');
  document.getElementById('bookmarksBtn').classList.remove('active');
  document.getElementById('privacyBtn').classList.remove('active');
}

// Dorks Toolbar Functions
function toggleDorksToolbar() {
  dorksToolbar.classList.toggle('visible');
  document.getElementById('dorksBtn').classList.toggle('active');
}

// Google Dorks Data
const GOOGLE_DORKS = [
  { operator: 'site:', description: 'Search within a specific site', example: 'site:example.com' },
  { operator: 'inurl:', description: 'Search for URL containing term', example: 'inurl:admin' },
  { operator: 'intitle:', description: 'Search for title containing term', example: 'intitle:login' },
  { operator: 'intext:', description: 'Search for body text containing term', example: 'intext:password' },
  { operator: 'filetype:', description: 'Search for specific file type', example: 'filetype:pdf' },
  { operator: 'ext:', description: 'Search for file extension', example: 'ext:sql' },
  { operator: 'cache:', description: 'View cached version of site', example: 'cache:example.com' },
  { operator: 'link:', description: 'Find pages linking to URL', example: 'link:example.com' },
  { operator: 'related:', description: 'Find related sites', example: 'related:example.com' },
  { operator: 'info:', description: 'Get info about a page', example: 'info:example.com' },
  { operator: 'define:', description: 'Get definitions', example: 'define:osint' },
  { operator: 'allinurl:', description: 'All terms in URL', example: 'allinurl:admin login' },
  { operator: 'allintitle:', description: 'All terms in title', example: 'allintitle:index of' },
  { operator: 'allintext:', description: 'All terms in text', example: 'allintext:username password' },
  { operator: 'allinanchor:', description: 'All terms in anchor text', example: 'allinanchor:click here' },
  { operator: '"..."', description: 'Exact phrase match', example: '"exact phrase"' },
  { operator: '-', description: 'Exclude term', example: '-excluded' },
  { operator: 'OR', description: 'Either term', example: 'term1 OR term2' },
  { operator: '*', description: 'Wildcard', example: 'how to * a website' },
  { operator: '..', description: 'Number range', example: '2020..2024' },
  { operator: 'before:', description: 'Before date', example: 'before:2023-01-01' },
  { operator: 'after:', description: 'After date', example: 'after:2022-01-01' },
  { operator: 'AROUND(n)', description: 'Terms within n words', example: 'password AROUND(5) leaked' },
  { operator: 'inanchor:', description: 'Search anchor text', example: 'inanchor:click here' },
  { operator: 'numrange:', description: 'Number range search', example: 'numrange:1-100' }
];

// Common OSINT Dork Templates
const OSINT_DORK_TEMPLATES = [
  { name: 'Email Discovery', query: 'site:{domain} "@{domain}" OR "email" filetype:pdf OR filetype:doc' },
  { name: 'Document Leaks', query: 'site:{domain} filetype:pdf OR filetype:doc OR filetype:xls "confidential" OR "internal"' },
  { name: 'Login Pages', query: 'site:{domain} inurl:login OR inurl:admin OR inurl:signin' },
  { name: 'Exposed Files', query: 'site:{domain} intitle:"index of" OR inurl:backup OR inurl:old' },
  { name: 'Config Files', query: 'site:{domain} filetype:env OR filetype:cfg OR filetype:conf' },
  { name: 'Database Files', query: 'site:{domain} filetype:sql OR filetype:db OR filetype:mdb' },
  { name: 'API Keys', query: 'site:{domain} "api_key" OR "apikey" OR "api-key" filetype:json OR filetype:xml' },
  { name: 'Password Files', query: 'site:{domain} filetype:txt "password" OR "passwd" OR "credentials"' },
  { name: 'Subdomains', query: 'site:*.{domain} -www' },
  { name: 'Error Pages', query: 'site:{domain} "error" OR "exception" OR "stack trace" OR "debug"' }
];

let selectedDorks = [];
let searchTerm = '';

function initializeDorksToolbar() {
  const operatorsContainer = document.getElementById('dorksOperators');
  const searchInput = document.getElementById('dorksSearchInput');
  const previewEl = document.getElementById('dorksPreview');
  const executeBtn = document.getElementById('executeSearch');

  // Render operator buttons
  GOOGLE_DORKS.forEach(dork => {
    const btn = document.createElement('button');
    btn.className = 'dork-operator';
    btn.textContent = dork.operator;
    btn.title = dork.description;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        selectedDorks.push(dork.operator);
      } else {
        selectedDorks = selectedDorks.filter(d => d !== dork.operator);
      }
      updateDorksPreview();
    });
    operatorsContainer.appendChild(btn);
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    updateDorksPreview();
  });

  // Execute search
  executeBtn.addEventListener('click', executeGoogleDork);

  // Enter key in search input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeGoogleDork();
    }
  });

  function updateDorksPreview() {
    let query = searchTerm;
    if (selectedDorks.length > 0) {
      query = selectedDorks.join(' ') + ' ' + searchTerm;
    }
    previewEl.textContent = query || 'Enter search term and select operators...';
  }

  function executeGoogleDork() {
    const engine = document.getElementById('dorksEngineSelect').value;
    let query = searchTerm;
    if (selectedDorks.length > 0) {
      query = selectedDorks.join(' ') + ' ' + searchTerm;
    }

    if (!query.trim()) return;

    const searchUrls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      yandex: `https://yandex.com/search/?text=${encodeURIComponent(query)}`
    };

    navigate(searchUrls[engine]);
  }
}

// Bookmarks Functions
async function addCurrentPageToBookmarks() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (tab && tab.url) {
    await window.electronAPI.addBookmark({
      title: tab.title,
      url: tab.url,
      category: 'custom'
    });
    document.getElementById('bookmarkBtn').classList.add('active');
  }
}

async function initializeBookmarks() {
  // Category tabs
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBookmarksList(tab.dataset.category);
    });
  });

  // Search
  document.getElementById('bookmarkSearch').addEventListener('input', (e) => {
    const activeCategory = document.querySelector('.panel-tab.active')?.dataset.category || 'osint-framework';
    renderBookmarksList(activeCategory, e.target.value);
  });

  // Initial render
  renderBookmarksList('osint-framework');
}

function renderBookmarksList(category, searchQuery = '') {
  const container = document.getElementById('bookmarksList');
  let bookmarks;

  switch (category) {
    case 'osint-framework':
      bookmarks = OSINT_FRAMEWORK_BOOKMARKS;
      break;
    case 'awesome-osint':
      bookmarks = AWESOME_OSINT_BOOKMARKS;
      break;
    case 'kali-tools':
      bookmarks = KALI_OSINT_TOOLS;
      break;
    case 'custom':
      window.electronAPI.getBookmarks().then(customBookmarks => {
        renderCustomBookmarks(container, customBookmarks, searchQuery);
      });
      return;
    default:
      bookmarks = [];
  }

  container.innerHTML = '';

  const query = searchQuery.toLowerCase();

  Object.entries(bookmarks).forEach(([categoryName, items]) => {
    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );

    if (filteredItems.length === 0) return;

    const categoryEl = document.createElement('div');
    categoryEl.className = 'bookmark-category';
    categoryEl.innerHTML = `
      <div class="bookmark-category-title">
        <span class="arrow">▼</span>
        <span>${categoryName}</span>
        <span style="color: var(--text-muted); font-weight: normal; font-size: 11px;">(${filteredItems.length})</span>
      </div>
      <div class="bookmark-items"></div>
    `;

    const itemsContainer = categoryEl.querySelector('.bookmark-items');

    filteredItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'bookmark-item';
      itemEl.innerHTML = `
        <svg class="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <span class="bookmark-name" title="${item.description || item.name}">${item.name}</span>
      `;
      itemEl.addEventListener('click', () => navigate(item.url));
      itemsContainer.appendChild(itemEl);
    });

    categoryEl.querySelector('.bookmark-category-title').addEventListener('click', () => {
      categoryEl.classList.toggle('collapsed');
    });

    container.appendChild(categoryEl);
  });
}

function renderCustomBookmarks(container, bookmarks, searchQuery) {
  container.innerHTML = '';

  const query = searchQuery.toLowerCase();
  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(query) ||
    b.url.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">No bookmarks yet. Click the star icon to add the current page.</div>';
    return;
  }

  filtered.forEach(bookmark => {
    const itemEl = document.createElement('div');
    itemEl.className = 'bookmark-item';
    itemEl.innerHTML = `
      <svg class="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="bookmark-name" title="${bookmark.url}">${bookmark.title}</span>
    `;
    itemEl.addEventListener('click', () => navigate(bookmark.url));
    container.appendChild(itemEl);
  });
}

// Privacy Settings
async function initializePrivacySettings() {
  const settings = await window.electronAPI.getPrivacySettings();
  renderPrivacySettings(settings);
}

function renderPrivacySettings(settings) {
  const container = document.getElementById('privacySettings');
  container.innerHTML = `
    <div class="privacy-group">
      <div class="privacy-group-title">Anonymity</div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Tor Proxy</div>
          <div class="privacy-option-desc">Route traffic through Tor network (requires Tor running on port 9050)</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="torEnabled" ${settings.torEnabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Spoof User Agent</div>
          <div class="privacy-option-desc">Use Firefox-like user agent to blend in</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="spoofUserAgent" ${settings.spoofUserAgent ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="privacy-group">
      <div class="privacy-group-title">Tracking Protection</div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Block Trackers</div>
          <div class="privacy-option-desc">Block known tracking domains (Google Analytics, Facebook Pixel, etc.)</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="blockTrackers" ${settings.blockTrackers ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Block Third-Party Cookies</div>
          <div class="privacy-option-desc">Prevent cross-site tracking cookies</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="blockThirdPartyCookies" ${settings.blockThirdPartyCookies ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Do Not Track</div>
          <div class="privacy-option-desc">Send DNT and GPC headers (sites may ignore)</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="doNotTrack" ${settings.doNotTrack ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="privacy-group">
      <div class="privacy-group-title">Fingerprinting Protection</div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Block Fingerprinting</div>
          <div class="privacy-option-desc">Randomize canvas, WebGL, and audio fingerprints</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="blockFingerprinting" ${settings.blockFingerprinting ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Block WebRTC</div>
          <div class="privacy-option-desc">Prevent IP leaks through WebRTC</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="blockWebRTC" ${settings.blockWebRTC ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="privacy-group">
      <div class="privacy-group-title">Data Handling</div>
      <div class="privacy-option">
        <div class="privacy-option-info">
          <div class="privacy-option-label">Clear Data on Exit</div>
          <div class="privacy-option-desc">Automatically clear all browsing data when closing</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" data-setting="clearOnExit" ${settings.clearOnExit ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <button class="extreme-privacy-btn ${settings.extremePrivacyMode ? 'active' : ''}" id="extremePrivacyBtn">
      ${settings.extremePrivacyMode ? '🔒 Disable Extreme Privacy Mode' : '🛡️ Enable Extreme Privacy Mode'}
    </button>
  `;

  // Add event listeners
  container.querySelectorAll('input[data-setting]').forEach(input => {
    input.addEventListener('change', (e) => {
      window.electronAPI.setPrivacySetting(e.target.dataset.setting, e.target.checked);
    });
  });

  document.getElementById('extremePrivacyBtn').addEventListener('click', async () => {
    const newValue = !settings.extremePrivacyMode;
    await window.electronAPI.setPrivacySetting('extremePrivacyMode', newValue);
    if (newValue) {
      await window.electronAPI.setPrivacySetting('torEnabled', true);
      await window.electronAPI.setPrivacySetting('blockTrackers', true);
      await window.electronAPI.setPrivacySetting('blockFingerprinting', true);
      await window.electronAPI.setPrivacySetting('blockThirdPartyCookies', true);
      await window.electronAPI.setPrivacySetting('blockWebRTC', true);
      await window.electronAPI.setPrivacySetting('spoofUserAgent', true);
    }
  });
}

async function loadPrivacyStatus() {
  const settings = await window.electronAPI.getPrivacySettings();
  updatePrivacyIndicator(settings);
}

function updatePrivacyIndicator(settings) {
  const indicator = document.getElementById('privacyIndicator');
  const text = indicator.querySelector('.indicator-text');

  indicator.classList.remove('tor', 'extreme');

  if (settings.extremePrivacyMode) {
    indicator.classList.add('extreme');
    text.textContent = 'Extreme Privacy';
  } else if (settings.torEnabled) {
    indicator.classList.add('tor');
    text.textContent = 'Tor Active';
  } else if (settings.blockTrackers) {
    text.textContent = 'Protected';
  } else {
    text.textContent = 'Standard';
  }
}

// Privacy state for navigation checks
let currentPrivacySettings = { extremePrivacyMode: false };

// Update the privacy settings cache
window.electronAPI.onPrivacyUpdated((settings) => {
  currentPrivacySettings = settings;
});

// Load initial privacy settings
(async () => {
  currentPrivacySettings = await window.electronAPI.getPrivacySettings();
})();

// ============================================
// OSINT FRAMEWORK BOOKMARKS
// ============================================
const OSINT_FRAMEWORK_BOOKMARKS = {
  'Username Search': [
    { name: 'Namechk', url: 'https://namechk.com/', description: 'Check username availability across platforms' },
    { name: 'KnowEm', url: 'https://knowem.com/', description: 'Username search across 500+ social networks' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/', description: 'Username enumeration' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt down social media accounts' },
    { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Collect person info by username' },
    { name: 'UserSearch.org', url: 'https://usersearch.org/', description: 'Find anyone online' },
    { name: 'Instant Username', url: 'https://instantusername.com/', description: 'Check username availability instantly' }
  ],
  'Email Search': [
    { name: 'Hunter.io', url: 'https://hunter.io/', description: 'Find email addresses' },
    { name: 'Phonebook.cz', url: 'https://phonebook.cz/', description: 'Find emails and phone numbers' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', description: 'Check if email was in a breach' },
    { name: 'EmailRep', url: 'https://emailrep.io/', description: 'Email reputation lookup' },
    { name: 'Epieos', url: 'https://epieos.com/', description: 'Google account email lookup' },
    { name: 'Holehe', url: 'https://github.com/megadose/holehe', description: 'Check email registered accounts' },
    { name: 'Snov.io', url: 'https://snov.io/', description: 'Email finder and verifier' }
  ],
  'Phone Number': [
    { name: 'Truecaller', url: 'https://www.truecaller.com/', description: 'Phone number lookup' },
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Phone number investigation' },
    { name: 'Sync.me', url: 'https://sync.me/', description: 'Caller ID and spam blocker' },
    { name: 'NumLooker', url: 'https://www.numlooker.com/', description: 'Reverse phone lookup' }
  ],
  'Social Media': [
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/', description: 'Free social media search' },
    { name: 'Twint', url: 'https://github.com/twintproject/twint', description: 'Twitter scraping tool' },
    { name: 'InstaLoader', url: 'https://github.com/instaloader/instaloader', description: 'Instagram downloader' },
    { name: 'Osintgram', url: 'https://github.com/Datalux/Osintgram', description: 'Instagram OSINT tool' },
    { name: 'Who Posted What', url: 'https://whopostedwhat.com/', description: 'Facebook keyword search' },
    { name: 'Social Blade', url: 'https://socialblade.com/', description: 'Social media statistics' }
  ],
  'Domain & IP': [
    { name: 'Whois Lookup', url: 'https://whois.domaintools.com/', description: 'Domain registration info' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/', description: 'DNS and domain history' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/', description: 'DNS reconnaissance' },
    { name: 'Shodan', url: 'https://www.shodan.io/', description: 'Search engine for IoT devices' },
    { name: 'Censys', url: 'https://censys.io/', description: 'Internet-wide scanning' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Analyze files and URLs' },
    { name: 'URLScan', url: 'https://urlscan.io/', description: 'Website scanner' },
    { name: 'crt.sh', url: 'https://crt.sh/', description: 'Certificate Transparency logs' },
    { name: 'Subfinder', url: 'https://github.com/projectdiscovery/subfinder', description: 'Subdomain discovery' }
  ],
  'Image Analysis': [
    { name: 'TinEye', url: 'https://tineye.com/', description: 'Reverse image search' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/', description: 'Russian reverse image search' },
    { name: 'PimEyes', url: 'https://pimeyes.com/', description: 'Face recognition search' },
    { name: 'FaceCheck.ID', url: 'https://facecheck.id/', description: 'Face search engine' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/', description: 'Image forensics' },
    { name: 'Jeffrey EXIF Viewer', url: 'http://exif.regex.info/exif.cgi', description: 'EXIF metadata viewer' }
  ],
  'Geolocation': [
    { name: 'Google Maps', url: 'https://www.google.com/maps', description: 'Mapping and street view' },
    { name: 'Google Earth', url: 'https://earth.google.com/', description: 'Satellite imagery' },
    { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', description: 'Open source maps' },
    { name: 'Mapillary', url: 'https://www.mapillary.com/', description: 'Street-level imagery' },
    { name: 'SunCalc', url: 'https://www.suncalc.org/', description: 'Sun position calculator' },
    { name: 'FlightRadar24', url: 'https://www.flightradar24.com/', description: 'Live flight tracker' },
    { name: 'MarineTraffic', url: 'https://www.marinetraffic.com/', description: 'Ship tracking' }
  ],
  'People Search': [
    { name: 'Pipl', url: 'https://pipl.com/', description: 'People search engine' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/', description: 'Free people search' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/', description: 'People and phone lookup' },
    { name: 'FastPeopleSearch', url: 'https://www.fastpeoplesearch.com/', description: 'Free people finder' },
    { name: 'FamilyTreeNow', url: 'https://www.familytreenow.com/', description: 'Family tree and records' }
  ],
  'Archives & Cache': [
    { name: 'Wayback Machine', url: 'https://web.archive.org/', description: 'Historical web pages' },
    { name: 'Archive.org', url: 'https://archive.org/', description: 'Internet Archive' },
    { name: 'CachedView', url: 'https://cachedview.com/', description: 'View cached pages' },
    { name: 'Google Cache', url: 'https://webcache.googleusercontent.com/', description: 'Google cached pages' }
  ],
  'Business & Company': [
    { name: 'OpenCorporates', url: 'https://opencorporates.com/', description: 'Company database' },
    { name: 'Crunchbase', url: 'https://www.crunchbase.com/', description: 'Company information' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/', description: 'Professional network' },
    { name: 'SEC EDGAR', url: 'https://www.sec.gov/edgar/', description: 'SEC filings' },
    { name: 'ICIJ Offshore Leaks', url: 'https://offshoreleaks.icij.org/', description: 'Offshore company data' }
  ],
  'Threat Intelligence': [
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Malware analysis' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/', description: 'Malware sandbox' },
    { name: 'Any.run', url: 'https://any.run/', description: 'Interactive malware sandbox' },
    { name: 'AlienVault OTX', url: 'https://otx.alienvault.com/', description: 'Open threat exchange' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/', description: 'IP abuse database' }
  ],
  'Breach Data': [
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', description: 'Check breach status' },
    { name: 'DeHashed', url: 'https://dehashed.com/', description: 'Breach search engine' },
    { name: 'LeakCheck', url: 'https://leakcheck.io/', description: 'Data leak checker' },
    { name: 'IntelX', url: 'https://intelx.io/', description: 'Intelligence search engine' }
  ]
};

// ============================================
// AWESOME OSINT BOOKMARKS
// ============================================
const AWESOME_OSINT_BOOKMARKS = {
  'General Search': [
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', description: 'Privacy-focused search engine' },
    { name: 'Startpage', url: 'https://www.startpage.com/', description: 'Private Google results' },
    { name: 'Searx', url: 'https://searx.space/', description: 'Metasearch engine instances' },
    { name: 'Brave Search', url: 'https://search.brave.com/', description: 'Independent search engine' },
    { name: 'Mojeek', url: 'https://www.mojeek.com/', description: 'Independent search engine' }
  ],
  'Data Visualization': [
    { name: 'Maltego', url: 'https://www.maltego.com/', description: 'Link analysis tool' },
    { name: 'Gephi', url: 'https://gephi.org/', description: 'Graph visualization' },
    { name: 'yEd', url: 'https://www.yworks.com/products/yed', description: 'Graph editor' }
  ],
  'Geospatial': [
    { name: 'Sentinel Hub', url: 'https://www.sentinel-hub.com/', description: 'Satellite imagery' },
    { name: 'Zoom Earth', url: 'https://zoom.earth/', description: 'Live weather satellite' },
    { name: 'EOS Land Viewer', url: 'https://eos.com/landviewer/', description: 'Satellite imagery' }
  ],
  'Transportation': [
    { name: 'FlightAware', url: 'https://flightaware.com/', description: 'Flight tracking' },
    { name: 'ADS-B Exchange', url: 'https://www.adsbexchange.com/', description: 'Unfiltered flight data' },
    { name: 'VesselFinder', url: 'https://www.vesselfinder.com/', description: 'Ship tracking' },
    { name: 'Live ATC', url: 'https://www.liveatc.net/', description: 'ATC radio' }
  ],
  'Verification': [
    { name: 'InVID', url: 'https://www.invid-project.eu/', description: 'Video verification' },
    { name: 'Fake Image Detector', url: 'https://www.fakeimagedetector.com/', description: 'Image authenticity' },
    { name: 'Google Fact Check', url: 'https://toolbox.google.com/factcheck/', description: 'Fact checking tools' }
  ],
  'Government & Legal': [
    { name: 'PACER', url: 'https://pacer.uscourts.gov/', description: 'US court records' },
    { name: 'CourtListener', url: 'https://www.courtlistener.com/', description: 'Free court opinions' },
    { name: 'GovInfo', url: 'https://www.govinfo.gov/', description: 'US government publications' },
    { name: 'FOIA.gov', url: 'https://www.foia.gov/', description: 'Freedom of Information' }
  ],
  'Academic': [
    { name: 'Google Scholar', url: 'https://scholar.google.com/', description: 'Academic search' },
    { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/', description: 'AI research search' },
    { name: 'ResearchGate', url: 'https://www.researchgate.net/', description: 'Research network' },
    { name: 'arXiv', url: 'https://arxiv.org/', description: 'Preprint server' }
  ]
};

// ============================================
// KALI OSINT TOOLS
// ============================================
const KALI_OSINT_TOOLS = {
  'Reconnaissance': [
    { name: 'theHarvester', url: 'https://github.com/laramies/theHarvester', description: 'Email, subdomain, and name harvester' },
    { name: 'Recon-ng', url: 'https://github.com/lanmaster53/recon-ng', description: 'Web reconnaissance framework' },
    { name: 'SpiderFoot', url: 'https://github.com/smicallef/spiderfoot', description: 'Automated OSINT tool' },
    { name: 'Amass', url: 'https://github.com/owasp-amass/amass', description: 'Network mapping and attack surface' },
    { name: 'Sublist3r', url: 'https://github.com/aboul3la/Sublist3r', description: 'Subdomain enumeration' },
    { name: 'Photon', url: 'https://github.com/s0md3v/Photon', description: 'Fast crawler designed for OSINT' }
  ],
  'Username OSINT': [
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Username search' },
    { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Username lookup on many sites' },
    { name: 'WhatsMyName', url: 'https://github.com/WebBreacher/WhatsMyName', description: 'Username enumeration' },
    { name: 'social-analyzer', url: 'https://github.com/qeeqbox/social-analyzer', description: 'Analyze social media profiles' }
  ],
  'Email Analysis': [
    { name: 'Infoga', url: 'https://github.com/m4ll0k/Infoga', description: 'Email information gathering' },
    { name: 'holehe', url: 'https://github.com/megadose/holehe', description: 'Email registration checker' },
    { name: 'h8mail', url: 'https://github.com/khast3x/h8mail', description: 'Email OSINT and breach hunting' }
  ],
  'Phone OSINT': [
    { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Phone number information gathering' }
  ],
  'DNS & Domain': [
    { name: 'DNSenum', url: 'https://github.com/fwaeytens/dnsenum', description: 'DNS enumeration' },
    { name: 'DNSrecon', url: 'https://github.com/darkoperator/dnsrecon', description: 'DNS enumeration' },
    { name: 'Subfinder', url: 'https://github.com/projectdiscovery/subfinder', description: 'Subdomain discovery' },
    { name: 'Assetfinder', url: 'https://github.com/tomnomnom/assetfinder', description: 'Find domains and subdomains' },
    { name: 'Findomain', url: 'https://github.com/Findomain/Findomain', description: 'Subdomain finder' }
  ],
  'Image OSINT': [
    { name: 'Exiftool', url: 'https://github.com/exiftool/exiftool', description: 'Metadata reader/writer' },
    { name: 'Metagoofil', url: 'https://github.com/laramies/metagoofil', description: 'Metadata harvester' }
  ],
  'GitHub & Code': [
    { name: 'GitRob', url: 'https://github.com/michenriksen/gitrob', description: 'GitHub sensitive data finder' },
    { name: 'GitLeaks', url: 'https://github.com/gitleaks/gitleaks', description: 'Secret scanning' },
    { name: 'TruffleHog', url: 'https://github.com/trufflesecurity/trufflehog', description: 'Secret detection' },
    { name: 'GitDorker', url: 'https://github.com/obheda12/GitDorker', description: 'GitHub dorking' }
  ],
  'Automation': [
    { name: 'Osmedeus', url: 'https://github.com/j3ssie/osmedeus', description: 'Automated recon framework' },
    { name: 'Sn1per', url: 'https://github.com/1N3/Sn1per', description: 'Automated pentest framework' },
    { name: 'OWASP Maryam', url: 'https://github.com/saeeddhqan/Maryam', description: 'OSINT framework' }
  ],
  'Threat Intel': [
    { name: 'MISP', url: 'https://github.com/MISP/MISP', description: 'Threat intelligence platform' },
    { name: 'OpenCTI', url: 'https://github.com/OpenCTI-Platform/opencti', description: 'Cyber threat intelligence' },
    { name: 'Yeti', url: 'https://github.com/yeti-platform/yeti', description: 'Threat intelligence repository' }
  ]
};
