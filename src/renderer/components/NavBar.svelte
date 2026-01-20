<script>
  import { activeTab, panelState } from '../stores/app.js';

  export let navigateToUrl;
  export let handleNavigation;
  export let handleGoHome;
  export let handleBookmarkPage;
  export let togglePanel;

  let urlValue = '';

  function handleUrlKeydown(e) {
    if (e.key === 'Enter') {
      navigateToUrl(urlValue);
    }
  }

  function handleUrlFocus(e) {
    e.target.select();
  }

  $: urlValue = $activeTab?.url || '';
  $: canGoBack = $activeTab?.canGoBack || false;
  $: canGoForward = $activeTab?.canGoForward || false;
  $: isSecure = urlValue.startsWith('https://');
  $: isInsecure = urlValue.startsWith('http://') && !urlValue.startsWith('https://');
</script>

<nav class="nav-bar">
  <div class="nav-controls">
    <button
      class="nav-btn"
      on:click={() => handleNavigation('back')}
      disabled={!canGoBack}
      title="Back (Alt+Left)"
      aria-label="Go Back"
    >
      <svg viewBox="0 0 20 20"><path d="M12 4l-6 6 6 6" fill="none"/></svg>
    </button>
    <button
      class="nav-btn"
      on:click={() => handleNavigation('forward')}
      disabled={!canGoForward}
      title="Forward (Alt+Right)"
      aria-label="Go Forward"
    >
      <svg viewBox="0 0 20 20"><path d="M8 4l6 6-6 6" fill="none"/></svg>
    </button>
    <button
      class="nav-btn"
      on:click={() => handleNavigation('reload')}
      title="Reload (Ctrl+R)"
      aria-label="Reload"
    >
      <svg viewBox="0 0 20 20">
        <path d="M3 10a7 7 0 1 1 1.5 4.3" fill="none"/>
        <path d="M3 15V10h5" fill="none"/>
      </svg>
    </button>
    <button
      class="nav-btn"
      on:click={handleGoHome}
      title="Home"
      aria-label="Home"
    >
      <svg viewBox="0 0 20 20">
        <path d="M3 10l7-7 7 7v8a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z" fill="none"/>
      </svg>
    </button>
  </div>

  <div class="url-bar">
    <div
      class="security-badge"
      class:secure={isSecure}
      class:insecure={isInsecure}
      title={isSecure ? 'Secure Connection (HTTPS)' : isInsecure ? 'Insecure Connection (HTTP)' : 'Connection Security'}
    >
      <svg viewBox="0 0 16 16">
        <rect x="3" y="7" width="10" height="7" rx="1" fill="none"/>
        <path d="M5 7V5a3 3 0 1 1 6 0v2" fill="none"/>
      </svg>
    </div>
    <input
      type="text"
      class="url-input"
      id="urlInput"
      bind:value={urlValue}
      on:keydown={handleUrlKeydown}
      on:focus={handleUrlFocus}
      placeholder="Search the world or enter URL..."
      autocomplete="off"
      spellcheck="false"
    >
    <button
      class="url-btn"
      on:click={handleBookmarkPage}
      title="Bookmark this page"
      aria-label="Bookmark"
    >
      <svg viewBox="0 0 16 16">
        <path d="M3 2h10a1 1 0 0 1 1 1v12l-6-3-6 3V3a1 1 0 0 1 1-1z" fill="none"/>
      </svg>
    </button>
  </div>

  <div class="nav-tools">
    <button
      class="nav-btn tool-btn"
      class:active={$panelState.activePanel === 'extensions'}
      on:click={() => togglePanel('extensions')}
      title="Extensions"
      aria-label="Extensions"
    >
      <svg viewBox="0 0 20 20">
        <rect x="3" y="3" width="6" height="6" rx="1" fill="none"/>
        <rect x="11" y="3" width="6" height="6" rx="1" fill="none"/>
        <rect x="3" y="11" width="6" height="6" rx="1" fill="none"/>
        <rect x="11" y="11" width="6" height="6" rx="1" fill="none"/>
      </svg>
    </button>
    <button
      class="nav-btn tool-btn"
      class:active={$panelState.activePanel === 'privacy'}
      on:click={() => togglePanel('privacy')}
      title="Privacy Shield"
      aria-label="Privacy Settings"
    >
      <svg viewBox="0 0 20 20">
        <path d="M10 2l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V5z" fill="none"/>
      </svg>
    </button>
    <button
      class="nav-btn tool-btn"
      title="Menu"
      aria-label="Menu"
    >
      <svg viewBox="0 0 20 20">
        <circle cx="10" cy="4" r="1.5"/>
        <circle cx="10" cy="10" r="1.5"/>
        <circle cx="10" cy="16" r="1.5"/>
      </svg>
    </button>
  </div>
</nav>

<style>
  .nav-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 12px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-default);
  }

  .nav-controls {
    display: flex;
    gap: 4px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nav-btn svg {
    width: 16px;
    height: 16px;
    stroke: var(--text-secondary);
    stroke-width: 1.5;
    fill: none;
  }

  .nav-btn.active {
    background: var(--bg-active);
  }

  .nav-btn.active svg {
    stroke: var(--constantine-gold);
  }

  .url-bar {
    flex: 1;
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    border-radius: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    transition: border-color 0.15s;
  }

  .url-bar:focus-within {
    border-color: var(--constantine-gold);
  }

  .security-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }

  .security-badge svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .security-badge.secure svg {
    stroke: var(--celestial);
  }

  .security-badge.insecure svg {
    stroke: var(--hellfire);
  }

  .url-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }

  .url-input::placeholder {
    color: var(--text-tertiary);
  }

  .url-btn {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .url-btn:hover {
    background: var(--bg-hover);
  }

  .url-btn svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .nav-tools {
    display: flex;
    gap: 4px;
  }

  .tool-btn svg circle {
    fill: var(--text-secondary);
  }
</style>
