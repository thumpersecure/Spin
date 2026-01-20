<script>
  import { privacy, platform } from '../stores/app.js';

  function minimize() {
    window.sandiego.minimize();
  }

  function maximize() {
    window.sandiego.maximize();
  }

  function close() {
    window.sandiego.close();
  }

  $: statusText = $privacy.torEnabled ? 'Tor Active' :
                  ($privacy.blockTrackers || $privacy.blockFingerprinting) ? 'Protected' : 'Ready';
  $: statusClass = $privacy.torEnabled ? 'tor' :
                   ($privacy.blockTrackers || $privacy.blockFingerprinting) ? 'protected' : '';
</script>

<header class="title-bar">
  <div class="title-bar-left">
    <div class="logo">
      <span class="logo-icon">&#9889;</span>
      <span class="logo-text">CONSTANTINE</span>
    </div>
    <div class="status-indicator {statusClass}">
      <span class="status-dot"></span>
      <span class="status-text">{statusText}</span>
    </div>
  </div>

  {#if !$platform.isMac}
    <div class="window-controls">
      <button class="win-btn" on:click={minimize} title="Minimize" aria-label="Minimize">
        <svg viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6"/></svg>
      </button>
      <button class="win-btn" on:click={maximize} title="Maximize" aria-label="Maximize">
        <svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="none"/></svg>
      </button>
      <button class="win-btn win-btn-close" on:click={close} title="Close" aria-label="Close">
        <svg viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
      </button>
    </div>
  {/if}
</header>

<style>
  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px;
    padding: 0 12px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-default);
    -webkit-app-region: drag;
    user-select: none;
  }

  :global(.platform-mac) .title-bar {
    padding-left: 80px;
  }

  .title-bar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--constantine-gold);
  }

  .logo-icon {
    font-size: 18px;
  }

  .logo-text {
    font-size: 13px;
    letter-spacing: 1px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    background: var(--bg-overlay);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-tertiary);
  }

  .status-indicator.protected .status-dot {
    background: var(--constantine-gold);
  }

  .status-indicator.tor .status-dot {
    background: var(--celestial);
    box-shadow: 0 0 6px var(--celestial);
  }

  .window-controls {
    display: flex;
    gap: 8px;
    -webkit-app-region: no-drag;
  }

  .win-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .win-btn:hover {
    background: var(--bg-hover);
  }

  .win-btn svg {
    width: 12px;
    height: 12px;
    stroke: var(--text-secondary);
    stroke-width: 1.5;
  }

  .win-btn-close:hover {
    background: var(--blood);
  }

  .win-btn-close:hover svg {
    stroke: white;
  }
</style>
