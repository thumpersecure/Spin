<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    tabs, activeTabId, activeTab, privacy, panelState,
    platform, appStatus, notifications, protectionLevel,
    destroyAllStores
  } from './stores/app.js';
  import {
    createLogger,
    perfMonitor,
    memoryManager,
    getSessionInfo
  } from './lib/resilience.js';
  import IPC, {
    TabOps, PrivacyOps, SessionOps, WindowOps, PanelOps,
    TabEvents, PrivacyEvents, NotificationEvents,
    on as ipcOn, onIPCStatusChange, healthCheck
  } from './lib/ipc.js';

  import TitleBar from './components/TitleBar.svelte';
  import TabBar from './components/TabBar.svelte';
  import NavBar from './components/NavBar.svelte';
  import StartPage from './components/StartPage.svelte';
  import Notifications from './components/Notifications.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';

  // Logger for App
  const logger = createLogger('App');

  // Lazy load heavy components
  let ExtensionsPanel = null;
  let PrivacyPanel = null;
  let SessionRestoreBanner = null;
  let OfflineBanner = null;
  let CrashOverlay = null;

  // State
  let sessionData = null;
  let crashedTab = null;
  let keydownHandler = null;
  let cleanupFunctions = [];
  let isInitialized = false;
  let initError = null;

  // Lazy load panels on first open
  async function loadPanelComponents() {
    const endTimer = perfMonitor.startTimer('app.loadPanelComponents');

    try {
      if (!ExtensionsPanel) {
        const mod = await import('./components/ExtensionsPanel.svelte');
        ExtensionsPanel = mod.default;
      }
      if (!PrivacyPanel) {
        const mod = await import('./components/PrivacyPanel.svelte');
        PrivacyPanel = mod.default;
      }
    } catch (error) {
      logger.error('Failed to load panel components', { error: error.message });
      notifications.show('error', 'Failed to load panel components');
    }

    endTimer();
  }

  async function loadOverlayComponents() {
    const endTimer = perfMonitor.startTimer('app.loadOverlayComponents');

    try {
      const [sessionMod, offlineMod, crashMod] = await Promise.all([
        import('./components/SessionRestoreBanner.svelte'),
        import('./components/OfflineBanner.svelte'),
        import('./components/CrashOverlay.svelte')
      ]);

      SessionRestoreBanner = sessionMod.default;
      OfflineBanner = offlineMod.default;
      CrashOverlay = crashMod.default;

      logger.debug('Overlay components loaded');
    } catch (error) {
      logger.error('Failed to load overlay components', { error: error.message });
    }

    endTimer();
  }

  // Initialize app
  onMount(async () => {
    const endTimer = perfMonitor.startTimer('app.init');
    logger.info('CONSTANTINE Browser initializing...', getSessionInfo());

    try {
      // Load overlay components in background
      loadOverlayComponents();

      // Initialize in sequence
      await initializePlatform();
      await loadPrivacySettings();
      await createInitialTab();
      await checkSessionRestore();

      setupIPCListeners();
      setupNetworkMonitoring();
      setupKeyboardShortcuts();
      setupMemoryMonitoring();
      setupHealthChecks();

      isInitialized = true;
      logger.info('CONSTANTINE Browser v4.3.0 - Production Ready', {
        tabs: get(tabs).size,
        platform: get(platform)
      });

    } catch (error) {
      initError = error;
      logger.error('Initialization failed', { error: error.message, stack: error.stack });
      notifications.show('error', 'Failed to initialize browser. Some features may not work.', 10000);
    }

    endTimer();
  });

  async function initializePlatform() {
    try {
      const info = await WindowOps.getPlatformInfo();
      platform.set(info);
      logger.debug('Platform initialized', info);
    } catch (err) {
      logger.warn('Failed to get platform info, using fallback', { error: err.message });
      platform.set({
        isWindows: navigator.userAgent.includes('Windows'),
        isMac: navigator.userAgent.includes('Mac'),
        isLinux: navigator.userAgent.includes('Linux'),
        arch: 'unknown',
        version: 'unknown'
      });
    }
  }

  async function loadPrivacySettings() {
    try {
      const settings = await PrivacyOps.getSettings();
      privacy.set(settings);
      logger.debug('Privacy settings loaded', { torEnabled: settings.torEnabled });
    } catch (err) {
      logger.warn('Failed to load privacy settings', { error: err.message });
    }
  }

  async function createInitialTab() {
    try {
      const tabId = await TabOps.create(null);
      tabs.add(tabId, { title: 'New Tab', url: '' });
      activeTabId.set(tabId);
      logger.debug('Initial tab created', { tabId });
    } catch (err) {
      logger.error('Failed to create initial tab', { error: err.message });
      notifications.show('error', 'Failed to create initial tab');
    }
  }

  async function checkSessionRestore() {
    try {
      const session = await SessionOps.getLastSession();
      if (session && session.length > 0) {
        sessionData = { count: session.length, urls: session };
        appStatus.update(s => ({ ...s, hasSessionToRestore: true }));
        logger.info('Session available for restore', { tabCount: session.length });
      }
    } catch (err) {
      logger.warn('Failed to check session', { error: err.message });
    }
  }

  function setupIPCListeners() {
    // Tab events - using batched updates for high-frequency events
    const tabLoadingCleanup = TabEvents.onLoading?.(({ tabId, loading }) => {
      tabs.updateTab(tabId, { loading });
    });

    const tabNavigatedCleanup = TabEvents.onNavigated?.(({ tabId, url, canGoBack, canGoForward }) => {
      tabs.updateTab(tabId, { url, canGoBack, canGoForward, _lastNavigation: Date.now() });
    });

    const tabTitleCleanup = TabEvents.onTitleUpdated?.(({ tabId, title }) => {
      tabs.updateTab(tabId, { title });
    });

    const tabFaviconCleanup = TabEvents.onFaviconUpdated?.(({ tabId, favicon }) => {
      tabs.updateTab(tabId, { favicon });
    });

    const tabActivatedCleanup = TabEvents.onActivated?.(({ tabId, url, canGoBack, canGoForward }) => {
      activeTabId.set(tabId);
      tabs.updateTab(tabId, { url, canGoBack, canGoForward });
    });

    const tabCreatedCleanup = TabEvents.onCreated?.(({ tabId, url }) => {
      if (!tabs.has(tabId)) {
        tabs.add(tabId, { title: 'New Tab', url: url || '' });
      }
    });

    const tabErrorCleanup = TabEvents.onError?.(({ tabId, error }) => {
      tabs.incrementError(tabId);
      if (tabId === get(activeTabId)) {
        notifications.show('error', `Failed to load: ${error}`, 5000);
      }
    });

    const privacyCleanup = PrivacyEvents.onUpdated?.((settings) => {
      privacy.set(settings);
      logger.debug('Privacy settings updated via IPC');
    });

    const notificationCleanup = NotificationEvents.onNotification?.(({ type, message }) => {
      notifications.show(type, message);
    });

    // Platform events with logging
    const fullscreenCleanup = ipcOn('fullscreen-change', (isFullscreen) => {
      appStatus.setFullscreen(isFullscreen);
      logger.debug('Fullscreen changed', { isFullscreen });
    });

    const torStatusCleanup = ipcOn('tor-status', ({ available }) => {
      if (available) {
        notifications.show('info', 'Tor service detected and ready');
        logger.info('Tor service available');
      }
    });

    const tabCrashedCleanup = ipcOn('tab-crashed', ({ tabId, reason }) => {
      tabs.updateTabImmediate(tabId, { crashed: true });
      logger.error('Tab crashed', { tabId, reason });

      if (tabId === get(activeTabId)) {
        crashedTab = { tabId, reason };
      }
      notifications.show('error', `Tab ${reason === 'oom' ? 'ran out of memory' : 'crashed'}`, 5000);
    });

    const tabUnresponsiveCleanup = ipcOn('tab-unresponsive', ({ tabId }) => {
      tabs.updateTab(tabId, { unresponsive: true });
      logger.warn('Tab unresponsive', { tabId });

      if (tabId === get(activeTabId)) {
        notifications.show('warning', 'Tab is not responding...', 3000);
      }
    });

    const tabResponsiveCleanup = ipcOn('tab-responsive', ({ tabId }) => {
      tabs.updateTab(tabId, { unresponsive: false });
      logger.debug('Tab responsive again', { tabId });
    });

    const networkStatusCleanup = ipcOn('network-status', ({ isOnline }) => {
      handleNetworkChange(isOnline);
    });

    const openPanelCleanup = ipcOn('open-panel', async (panelType) => {
      await loadPanelComponents();
      if (panelType === 'phone-intel' || panelType === 'bookmarks') {
        panelState.set({ open: true, activePanel: 'extensions', width: 340 });
      } else if (panelType === 'privacy') {
        panelState.set({ open: true, activePanel: 'privacy', width: 340 });
      }
    });

    const screenshotCleanup = ipcOn('screenshot-captured', ({ dataUrl }) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `constantine-screenshot-${Date.now()}.png`;
      link.click();
      notifications.show('success', 'Screenshot saved');
      logger.info('Screenshot saved');
    });

    // IPC status monitoring
    const ipcStatusCleanup = onIPCStatusChange((status, error) => {
      appStatus.setIPCStatus(status);
      if (status === 'circuit_open') {
        notifications.show('warning', 'Connection issues detected. Some features may be slow.', 5000);
      }
    });

    // Store cleanup functions
    cleanupFunctions.push(
      tabLoadingCleanup, tabNavigatedCleanup, tabTitleCleanup, tabFaviconCleanup,
      tabActivatedCleanup, tabCreatedCleanup, tabErrorCleanup,
      privacyCleanup, notificationCleanup,
      fullscreenCleanup, torStatusCleanup, tabCrashedCleanup,
      tabUnresponsiveCleanup, tabResponsiveCleanup, networkStatusCleanup,
      openPanelCleanup, screenshotCleanup, ipcStatusCleanup
    );

    logger.debug('IPC listeners setup complete');
  }

  function setupNetworkMonitoring() {
    const handleOnline = () => handleNetworkChange(true);
    const handleOffline = () => handleNetworkChange(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    appStatus.setOnline(navigator.onLine);

    cleanupFunctions.push(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });

    logger.debug('Network monitoring setup');
  }

  function handleNetworkChange(isOnline) {
    const wasOnline = get(appStatus).isOnline;
    appStatus.setOnline(isOnline);

    if (!isOnline && wasOnline) {
      notifications.show('warning', 'You are offline. Some features may not work.', 0);
    } else if (isOnline && !wasOnline) {
      notifications.dismissType('warning');
      notifications.show('success', 'Connection restored');
    }
  }

  function setupKeyboardShortcuts() {
    keydownHandler = handleKeydown;
    document.addEventListener('keydown', keydownHandler);

    cleanupFunctions.push(() => {
      document.removeEventListener('keydown', keydownHandler);
    });

    logger.debug('Keyboard shortcuts setup');
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
      panelState.set({ open: false, activePanel: null, width: 340 });
    }
  }

  function setupMemoryMonitoring() {
    const stopMonitoring = memoryManager.startMonitoring(30000);

    memoryManager.onMemoryPressure((event, data) => {
      if (event === 'critical') {
        logger.warn('Critical memory pressure', data);
        notifications.show('warning', 'Running low on memory. Consider closing some tabs.', 10000);
      } else if (event === 'warning') {
        logger.info('Memory warning', data);
      }
    });

    cleanupFunctions.push(stopMonitoring);
    logger.debug('Memory monitoring setup');
  }

  function setupHealthChecks() {
    // Periodic health checks
    const healthCheckInterval = setInterval(async () => {
      const health = await healthCheck();
      if (!health.healthy) {
        logger.warn('Health check failed', health);
      }
    }, 60000); // Every minute

    cleanupFunctions.push(() => clearInterval(healthCheckInterval));
    logger.debug('Health checks setup');
  }

  // Exported functions for child components
  export async function handleNewTab() {
    const endTimer = perfMonitor.startTimer('app.newTab');

    try {
      const tabId = await TabOps.create(null);
      tabs.add(tabId, { title: 'New Tab', url: '' });
      activeTabId.set(tabId);
      document.getElementById('urlInput')?.focus();
      logger.debug('New tab created', { tabId });
    } catch (err) {
      logger.error('Failed to create new tab', { error: err.message });
      notifications.show('error', 'Failed to create new tab');
    }

    endTimer();
  }

  export function setActiveTab(tabId) {
    const endTimer = perfMonitor.startTimer('app.setActiveTab');

    activeTabId.set(tabId);
    TabOps.show(tabId).catch(err => {
      logger.error('Failed to show tab', { tabId, error: err.message });
    });

    endTimer();
  }

  export function closeTab(tabId) {
    const endTimer = perfMonitor.startTimer('app.closeTab');

    TabOps.close(tabId).catch(err => {
      logger.error('Failed to close tab via IPC', { tabId, error: err.message });
    });

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

    endTimer();
    logger.debug('Tab closed', { tabId });
  }

  export function navigateToUrl(input) {
    if (!input || !input.trim()) return;

    const currentActiveId = get(activeTabId);
    if (!currentActiveId) return;

    const endTimer = perfMonitor.startTimer('app.navigate');

    TabOps.navigate(currentActiveId, input.trim()).catch(err => {
      logger.error('Navigation failed', { error: err.message });
      notifications.show('error', 'Navigation failed');
    });

    endTimer();
  }

  export function handleNavigation(action) {
    const currentActiveId = get(activeTabId);
    if (!currentActiveId) return;

    const endTimer = perfMonitor.startTimer(`app.nav.${action}`);

    switch (action) {
      case 'back':
        TabOps.goBack(currentActiveId).catch(err => {
          logger.warn('Go back failed', { error: err.message });
        });
        break;
      case 'forward':
        TabOps.goForward(currentActiveId).catch(err => {
          logger.warn('Go forward failed', { error: err.message });
        });
        break;
      case 'reload':
        TabOps.reload(currentActiveId).catch(err => {
          logger.warn('Reload failed', { error: err.message });
        });
        break;
    }

    endTimer();
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
    logger.debug('Navigated to home');
  }

  export async function handleBookmarkPage() {
    const currentActiveId = get(activeTabId);
    const currentTab = get(activeTab);

    if (!currentActiveId || !currentTab?.url) {
      notifications.show('warning', 'No page to bookmark');
      return;
    }

    try {
      await IPC.bookmark.add({
        title: currentTab.title,
        url: currentTab.url
      });
      notifications.show('success', 'Page bookmarked');
      logger.debug('Page bookmarked', { url: currentTab.url });
    } catch (err) {
      logger.error('Failed to bookmark', { error: err.message });
      notifications.show('error', 'Failed to bookmark page');
    }
  }

  export async function togglePanel(panelType) {
    await loadPanelComponents();
    const current = get(panelState);

    if (current.open && current.activePanel === panelType) {
      panelState.set({ open: false, activePanel: null, width: 340 });
      PanelOps.toggle(false, 0).catch(() => {});
    } else {
      panelState.set({ open: true, activePanel: panelType, width: 340 });
      PanelOps.toggle(true, 340).catch(() => {});
    }
  }

  export function closePanel() {
    panelState.set({ open: false, activePanel: null, width: 340 });
    PanelOps.toggle(false, 0).catch(() => {});
  }

  async function handleSessionRestore() {
    sessionData = null;
    appStatus.update(s => ({ ...s, hasSessionToRestore: false }));

    try {
      await SessionOps.restore();
      notifications.show('success', 'Session restored');
      logger.info('Session restored');
    } catch (err) {
      logger.error('Failed to restore session', { error: err.message });
      notifications.show('error', 'Failed to restore session');
    }
  }

  function dismissSessionRestore() {
    sessionData = null;
    appStatus.update(s => ({ ...s, hasSessionToRestore: false }));
    logger.debug('Session restore dismissed');
  }

  function handleCrashReload() {
    if (!crashedTab) return;

    TabOps.reload(crashedTab.tabId, true).catch(err => {
      logger.error('Failed to reload crashed tab', { error: err.message });
    });

    tabs.updateTabImmediate(crashedTab.tabId, { crashed: false });
    crashedTab = null;
    logger.info('Crashed tab reload attempted');
  }

  function handleCrashClose() {
    if (!crashedTab) return;
    closeTab(crashedTab.tabId);
    crashedTab = null;
  }

  // Error handler for global errors
  function handleGlobalError(error, errorInfo) {
    logger.error('Global error caught', { error: error.message, ...errorInfo });
    appStatus.recordError(error);
    notifications.show('error', 'An error occurred. The browser will try to recover.', 5000);
  }

  // Reactive declarations
  $: showStartPage = !$activeTab?.url;
  $: platformClass = $platform.isWindows ? 'platform-windows' :
                     $platform.isMac ? 'platform-mac' :
                     $platform.isLinux ? 'platform-linux' : '';

  onDestroy(() => {
    logger.info('App destroying, cleaning up...');

    // Run all cleanup functions
    cleanupFunctions.forEach(cleanup => {
      try {
        if (typeof cleanup === 'function') cleanup();
      } catch (e) {
        logger.error('Cleanup error', { error: e.message });
      }
    });

    // Cleanup stores
    destroyAllStores();

    // Cleanup IPC
    IPC.cleanup();

    // Log performance summary
    perfMonitor.logSummary();

    logger.info('App cleanup complete');
  });
</script>

<ErrorBoundary
  name="App"
  fallbackMessage="The browser encountered an error"
  onError={handleGlobalError}
>
  <div class="app {platformClass}" class:fullscreen={$appStatus.isFullscreen}>
    <TitleBar />

    {#if sessionData && SessionRestoreBanner}
      <ErrorBoundary name="SessionRestore" canRetry={false}>
        <svelte:component
          this={SessionRestoreBanner}
          count={sessionData.count}
          on:restore={handleSessionRestore}
          on:dismiss={dismissSessionRestore}
        />
      </ErrorBoundary>
    {/if}

    {#if !$appStatus.isOnline && OfflineBanner}
      <svelte:component this={OfflineBanner} />
    {/if}

    <ErrorBoundary name="TabBar" fallbackMessage="Tab bar error">
      <TabBar
        {handleNewTab}
        {setActiveTab}
        {closeTab}
      />
    </ErrorBoundary>

    <ErrorBoundary name="NavBar" fallbackMessage="Navigation bar error">
      <NavBar
        {navigateToUrl}
        {handleNavigation}
        {handleGoHome}
        {handleBookmarkPage}
        {togglePanel}
      />
    </ErrorBoundary>

    <main class="main-container">
      {#if $panelState.open}
        <aside
          class="extensions-panel open"
          style="width: {$panelState.width}px"
        >
          <ErrorBoundary name="Panel" fallbackMessage="Panel error">
            {#if $panelState.activePanel === 'extensions' && ExtensionsPanel}
              <svelte:component this={ExtensionsPanel} {navigateToUrl} {closePanel} />
            {:else if $panelState.activePanel === 'privacy' && PrivacyPanel}
              <svelte:component this={PrivacyPanel} {closePanel} />
            {/if}
          </ErrorBoundary>
        </aside>
      {/if}

      <div class="browser-content">
        {#if showStartPage}
          <ErrorBoundary name="StartPage" fallbackMessage="Start page error">
            <StartPage {navigateToUrl} />
          </ErrorBoundary>
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

    <!-- Dev tools overlay (only in development) -->
    {#if import.meta.env.DEV}
      <div class="dev-overlay">
        <span>DEV</span>
        <span>Tabs: {$tabs.size}</span>
        <span>Protection: {$protectionLevel}</span>
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    contain: layout style;
    overflow: hidden;
  }

  .app.fullscreen {
    /* Adjust for fullscreen mode */
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
    flex-shrink: 0;
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

  .dev-overlay {
    position: fixed;
    bottom: 8px;
    right: 8px;
    display: flex;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid var(--constantine-gold);
    border-radius: 4px;
    font-size: 10px;
    color: var(--text-tertiary);
    z-index: 9999;
    pointer-events: none;
  }

  .dev-overlay span:first-child {
    color: var(--constantine-gold);
    font-weight: bold;
  }

  /* Platform-specific adjustments */
  .platform-mac {
    /* macOS specific styles */
  }

  .platform-windows {
    /* Windows specific styles */
  }

  .platform-linux {
    /* Linux specific styles */
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .extensions-panel {
      transition: none;
    }
  }
</style>
