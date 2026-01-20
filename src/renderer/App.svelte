<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    tabs, activeTabId, activeTab, privacy, panelState,
    platform, appStatus, notifications, protectionLevel
  } from './stores/app.js';

  import TitleBar from './components/TitleBar.svelte';
  import TabBar from './components/TabBar.svelte';
  import NavBar from './components/NavBar.svelte';
  import StartPage from './components/StartPage.svelte';
  import Notifications from './components/Notifications.svelte';

  // Lazy load heavy components
  let ExtensionsPanel = null;
  let PrivacyPanel = null;
  let SessionRestoreBanner = null;
  let OfflineBanner = null;
  let CrashOverlay = null;

  let sessionData = null;
  let crashedTab = null;
  let keydownHandler = null;

  // Lazy load panels on first open
  async function loadPanelComponents() {
    if (!ExtensionsPanel) {
      const mod = await import('./components/ExtensionsPanel.svelte');
      ExtensionsPanel = mod.default;
    }
    if (!PrivacyPanel) {
      const mod = await import('./components/PrivacyPanel.svelte');
      PrivacyPanel = mod.default;
    }
  }

  async function loadOverlayComponents() {
    if (!SessionRestoreBanner) {
      const mod = await import('./components/SessionRestoreBanner.svelte');
      SessionRestoreBanner = mod.default;
    }
    if (!OfflineBanner) {
      const mod = await import('./components/OfflineBanner.svelte');
      OfflineBanner = mod.default;
    }
    if (!CrashOverlay) {
      const mod = await import('./components/CrashOverlay.svelte');
      CrashOverlay = mod.default;
    }
  }

  // Initialize app
  onMount(async () => {
    // Load overlay components in background
    loadOverlayComponents();

    await initializePlatform();
    await loadPrivacySettings();
    await createInitialTab();
    await checkSessionRestore();
    setupIPCListeners();
    setupNetworkMonitoring();
    setupKeyboardShortcuts();

    console.log("CONSTANTINE Browser v4.3.0 - Optimized Svelte Edition");
  });

  async function initializePlatform() {
    try {
      const info = await window.sandiego.getPlatformInfo();
      platform.set(info);
    } catch (err) {
      console.error('Failed to get platform info:', err);
      platform.set({
        isWindows: navigator.userAgent.includes('Windows'),
        isMac: navigator.userAgent.includes('Mac'),
        isLinux: navigator.userAgent.includes('Linux')
      });
    }
  }

  async function loadPrivacySettings() {
    try {
      const settings = await window.sandiego.getPrivacySettings();
      privacy.set(settings);
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
    }
  }

  async function createInitialTab() {
    try {
      const tabId = await window.sandiego.createTab(null);
      tabs.add(tabId, { title: 'New Tab', url: '' });
      activeTabId.set(tabId);
    } catch (err) {
      console.error('Failed to create initial tab:', err);
      notifications.show('error', 'Failed to create initial tab');
    }
  }

  async function checkSessionRestore() {
    try {
      const session = await window.sandiego.getLastSession();
      if (session && session.length > 0) {
        sessionData = { count: session.length, urls: session };
        appStatus.update(s => ({ ...s, hasSessionToRestore: true }));
      }
    } catch (err) {
      console.error('Failed to check session:', err);
    }
  }

  function setupIPCListeners() {
    // Tab events - using batched updates for high-frequency events
    window.sandiego.onTabLoading(({ tabId, loading }) => {
      tabs.updateTab(tabId, { loading });
    });

    window.sandiego.onTabNavigated(({ tabId, url, canGoBack, canGoForward }) => {
      tabs.updateTab(tabId, { url, canGoBack, canGoForward });
    });

    window.sandiego.onTabTitleUpdated(({ tabId, title }) => {
      tabs.updateTab(tabId, { title });
    });

    window.sandiego.onTabFaviconUpdated(({ tabId, favicon }) => {
      tabs.updateTab(tabId, { favicon });
    });

    window.sandiego.onTabActivated(({ tabId, url, canGoBack, canGoForward }) => {
      activeTabId.set(tabId);
      tabs.updateTab(tabId, { url, canGoBack, canGoForward });
    });

    window.sandiego.onTabCreated(({ tabId, url }) => {
      const currentTabs = get(tabs);
      if (!currentTabs.has(tabId)) {
        tabs.add(tabId, { title: 'New Tab', url: url || '' });
      }
    });

    window.sandiego.onTabError(({ tabId, error }) => {
      if (tabId === get(activeTabId)) {
        notifications.show('error', `Failed to load: ${error}`);
      }
    });

    window.sandiego.onPrivacyUpdated((settings) => {
      privacy.set(settings);
    });

    window.sandiego.onNotification(({ type, message }) => {
      notifications.show(type, message);
    });

    // Platform events
    window.sandiego.on('fullscreen-change', (isFullscreen) => {
      appStatus.update(s => ({ ...s, isFullscreen }));
    });

    window.sandiego.on('tor-status', ({ available }) => {
      if (available) {
        notifications.show('info', 'Tor service detected and ready');
      }
    });

    window.sandiego.on('tab-crashed', ({ tabId, reason }) => {
      tabs.updateTabImmediate(tabId, { crashed: true });
      if (tabId === get(activeTabId)) {
        crashedTab = { tabId, reason };
      }
      notifications.show('error', `Tab ${reason === 'oom' ? 'ran out of memory' : 'crashed'}`, 5000);
    });

    window.sandiego.on('tab-unresponsive', ({ tabId }) => {
      tabs.updateTab(tabId, { unresponsive: true });
      if (tabId === get(activeTabId)) {
        notifications.show('warning', 'Tab is not responding...', 3000);
      }
    });

    window.sandiego.on('tab-responsive', ({ tabId }) => {
      tabs.updateTab(tabId, { unresponsive: false });
    });

    window.sandiego.on('network-status', ({ isOnline }) => {
      handleNetworkChange(isOnline);
    });

    window.sandiego.on('open-panel', async (panelType) => {
      await loadPanelComponents();
      if (panelType === 'phone-intel' || panelType === 'bookmarks') {
        panelState.set({ open: true, activePanel: 'extensions' });
      } else if (panelType === 'privacy') {
        panelState.set({ open: true, activePanel: 'privacy' });
      }
    });

    window.sandiego.on('screenshot-captured', ({ dataUrl }) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `constantine-screenshot-${Date.now()}.png`;
      link.click();
      notifications.show('success', 'Screenshot saved');
    });
  }

  function setupNetworkMonitoring() {
    window.addEventListener('online', () => handleNetworkChange(true));
    window.addEventListener('offline', () => handleNetworkChange(false));
    appStatus.update(s => ({ ...s, isOnline: navigator.onLine }));
  }

  function handleNetworkChange(isOnline) {
    const wasOnline = get(appStatus).isOnline;
    appStatus.update(s => ({ ...s, isOnline }));

    if (!isOnline && wasOnline) {
      notifications.show('warning', 'You are offline. Some features may not work.');
    } else if (isOnline && !wasOnline) {
      notifications.show('success', 'Connection restored');
    }
  }

  function setupKeyboardShortcuts() {
    keydownHandler = handleKeydown;
    document.addEventListener('keydown', keydownHandler);
  }

  function handleKeydown(e) {
    const isModifier = e.ctrlKey || e.metaKey;

    if (isModifier) {
      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          handleNewTab();
          break;
        case 'w':
          e.preventDefault();
          const currentId = get(activeTabId);
          if (currentId) closeTab(currentId);
          break;
        case 'l':
          e.preventDefault();
          document.getElementById('urlInput')?.focus();
          document.getElementById('urlInput')?.select();
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

      if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
          case 'b':
            e.preventDefault();
            togglePanel('extensions');
            break;
          case 'd':
            e.preventDefault();
            togglePanel('privacy');
            break;
        }
      }
    }

    if (e.key === 'Escape' && get(panelState).open) {
      panelState.set({ open: false, activePanel: null });
    }
  }

  // Exported functions for child components
  export async function handleNewTab() {
    try {
      const tabId = await window.sandiego.createTab(null);
      tabs.add(tabId, { title: 'New Tab', url: '' });
      activeTabId.set(tabId);
      document.getElementById('urlInput')?.focus();
    } catch (err) {
      console.error('Failed to create new tab:', err);
      notifications.show('error', 'Failed to create new tab');
    }
  }

  export function setActiveTab(tabId) {
    activeTabId.set(tabId);
    window.sandiego.showTab(tabId);
  }

  export function closeTab(tabId) {
    window.sandiego.closeTab(tabId);
    tabs.remove(tabId);

    const currentTabs = get(tabs);
    const currentActiveId = get(activeTabId);

    if (currentTabs.size === 0) {
      handleNewTab();
    } else if (currentActiveId === tabId) {
      const remaining = Array.from(currentTabs.keys());
      const newActiveId = remaining[remaining.length - 1];
      setActiveTab(newActiveId);
    }
  }

  export function navigateToUrl(input) {
    if (!input || !input.trim()) return;
    const currentActiveId = get(activeTabId);
    if (!currentActiveId) return;
    window.sandiego.navigate(currentActiveId, input.trim());
  }

  export function handleNavigation(action) {
    const currentActiveId = get(activeTabId);
    if (!currentActiveId) return;

    switch (action) {
      case 'back':
        window.sandiego.goBack(currentActiveId);
        break;
      case 'forward':
        window.sandiego.goForward(currentActiveId);
        break;
      case 'reload':
        window.sandiego.reload(currentActiveId);
        break;
    }
  }

  export function handleGoHome() {
    const currentActiveId = get(activeTabId);
    if (!currentActiveId) return;

    tabs.updateTabImmediate(currentActiveId, {
      url: '',
      title: 'New Tab',
      canGoBack: false,
      canGoForward: false
    });
    document.getElementById('startSearch')?.focus();
  }

  export async function handleBookmarkPage() {
    const currentActiveId = get(activeTabId);
    const currentTab = get(activeTab);

    if (!currentActiveId || !currentTab?.url) {
      notifications.show('warning', 'No page to bookmark');
      return;
    }

    try {
      await window.sandiego.addBookmark({
        title: currentTab.title,
        url: currentTab.url
      });
      notifications.show('success', 'Page bookmarked');
    } catch (err) {
      console.error('Failed to bookmark:', err);
      notifications.show('error', 'Failed to bookmark page');
    }
  }

  export async function togglePanel(panelType) {
    await loadPanelComponents();
    const current = get(panelState);

    if (current.open && current.activePanel === panelType) {
      panelState.set({ open: false, activePanel: null });
      window.sandiego.panelToggle(false, 0);
    } else {
      panelState.set({ open: true, activePanel: panelType });
      window.sandiego.panelToggle(true, 340);
    }
  }

  export function closePanel() {
    panelState.set({ open: false, activePanel: null });
    window.sandiego.panelToggle(false, 0);
  }

  async function handleSessionRestore() {
    sessionData = null;
    appStatus.update(s => ({ ...s, hasSessionToRestore: false }));
    try {
      await window.sandiego.restoreSession();
      notifications.show('success', 'Session restored');
    } catch (err) {
      console.error('Failed to restore session:', err);
      notifications.show('error', 'Failed to restore session');
    }
  }

  function dismissSessionRestore() {
    sessionData = null;
    appStatus.update(s => ({ ...s, hasSessionToRestore: false }));
  }

  function handleCrashReload() {
    if (!crashedTab) return;
    window.sandiego.reload(crashedTab.tabId);
    tabs.updateTabImmediate(crashedTab.tabId, { crashed: false });
    crashedTab = null;
  }

  function handleCrashClose() {
    if (!crashedTab) return;
    closeTab(crashedTab.tabId);
    crashedTab = null;
  }

  // Reactive declarations
  $: showStartPage = !$activeTab?.url;
  $: platformClass = $platform.isWindows ? 'platform-windows' :
                     $platform.isMac ? 'platform-mac' :
                     $platform.isLinux ? 'platform-linux' : '';

  onDestroy(() => {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
  });
</script>

<div class="app {platformClass}" class:fullscreen={$appStatus.isFullscreen}>
  <TitleBar />

  {#if sessionData && SessionRestoreBanner}
    <svelte:component
      this={SessionRestoreBanner}
      count={sessionData.count}
      on:restore={handleSessionRestore}
      on:dismiss={dismissSessionRestore}
    />
  {/if}

  {#if !$appStatus.isOnline && OfflineBanner}
    <svelte:component this={OfflineBanner} />
  {/if}

  <TabBar
    {handleNewTab}
    {setActiveTab}
    {closeTab}
  />

  <NavBar
    {navigateToUrl}
    {handleNavigation}
    {handleGoHome}
    {handleBookmarkPage}
    {togglePanel}
  />

  <main class="main-container">
    {#if $panelState.open}
      <aside class="extensions-panel open">
        {#if $panelState.activePanel === 'extensions' && ExtensionsPanel}
          <svelte:component this={ExtensionsPanel} {navigateToUrl} {closePanel} />
        {:else if $panelState.activePanel === 'privacy' && PrivacyPanel}
          <svelte:component this={PrivacyPanel} {closePanel} />
        {/if}
      </aside>
    {/if}

    <div class="browser-content">
      {#if showStartPage}
        <StartPage {navigateToUrl} />
      {/if}
    </div>
  </main>

  {#if crashedTab && CrashOverlay}
    <svelte:component
      this={CrashOverlay}
      reason={crashedTab.reason}
      on:reload={handleCrashReload}
      on:close={handleCrashClose}
    />
  {/if}

  <Notifications />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    contain: layout style;
  }

  .main-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    contain: strict;
  }

  .extensions-panel {
    width: 0;
    overflow: hidden;
    transition: width 0.2s ease;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-default);
    contain: layout style paint;
    will-change: width;
  }

  .extensions-panel.open {
    width: 340px;
  }

  .browser-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    contain: strict;
  }
</style>
