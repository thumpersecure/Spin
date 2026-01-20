<script>
  import { privacy, notifications } from '../stores/app.js';

  export let closePanel;

  async function updateSetting(key, value) {
    try {
      await window.sandiego.setPrivacySetting(key, value);
    } catch (err) {
      console.error('Failed to set privacy setting:', err);
      notifications.show('error', 'Failed to update setting');
    }
  }

  async function clearBrowsingData() {
    try {
      await window.sandiego.clearBrowsingData();
      notifications.show('success', 'Browsing data cleared successfully');
    } catch (err) {
      console.error('Failed to clear data:', err);
      notifications.show('error', 'Failed to clear browsing data');
    }
  }

  async function checkTorStatus() {
    try {
      const status = await window.sandiego.checkTorStatus();
      if (status.available) {
        notifications.show('success', 'Tor service is running and ready');
      } else {
        notifications.show('warning', 'Tor service not detected. Please start Tor.');
      }
    } catch (err) {
      console.error('Failed to check Tor:', err);
      notifications.show('error', 'Failed to check Tor status');
    }
  }

  const privacyOptions = [
    { key: 'torEnabled', label: 'Tor Proxy', desc: 'Route traffic through Tor (requires Tor on port 9050)' },
    { key: 'blockTrackers', label: 'Block Trackers', desc: 'Block known tracking domains (60+ domains)' },
    { key: 'blockFingerprinting', label: 'Block Fingerprinting', desc: 'Randomize canvas, WebGL, and hardware fingerprints' },
    { key: 'blockThirdPartyCookies', label: 'Block Third-Party Cookies', desc: 'Prevent cross-site tracking cookies' },
    { key: 'blockWebRTC', label: 'Block WebRTC', desc: 'Prevent IP leaks via WebRTC' },
    { key: 'spoofUserAgent', label: 'Spoof User Agent', desc: 'Use platform-specific Firefox user agent' },
    { key: 'doNotTrack', label: 'Do Not Track', desc: 'Send DNT and Global Privacy Control headers' },
    { key: 'httpsUpgrade', label: 'HTTPS Upgrade', desc: 'Automatically upgrade HTTP to HTTPS' },
    { key: 'clearOnExit', label: 'Clear on Exit', desc: 'Clear all browsing data when closing' }
  ];
</script>

<div class="panel-content">
  <div class="panel-header">
    <span class="panel-title">Privacy Shield</span>
    <button class="panel-close" on:click={closePanel} aria-label="Close panel">
      <svg viewBox="0 0 12 12">
        <line x1="2" y1="2" x2="10" y2="10"/>
        <line x1="10" y1="2" x2="2" y2="10"/>
      </svg>
    </button>
  </div>

  <div class="panel-body">
    {#each privacyOptions as option}
      <div class="privacy-option">
        <div class="privacy-info">
          <div class="privacy-label">{option.label}</div>
          <div class="privacy-desc">{option.desc}</div>
        </div>
        <label class="toggle">
          <input
            type="checkbox"
            checked={$privacy[option.key]}
            on:change={(e) => updateSetting(option.key, e.target.checked)}
          >
          <span class="toggle-track"></span>
        </label>
      </div>
    {/each}

    <button class="shield-btn" on:click={clearBrowsingData}>
      Clear Browsing Data Now
    </button>
    <button class="shield-btn secondary" on:click={checkTorStatus}>
      Check Tor Status
    </button>
  </div>
</div>

<style>
  .panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-default);
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .panel-close {
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

  .panel-close:hover {
    background: var(--bg-hover);
  }

  .panel-close svg {
    width: 12px;
    height: 12px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .privacy-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: var(--bg-tertiary);
  }

  .privacy-info {
    flex: 1;
    margin-right: 12px;
  }

  .privacy-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .privacy-desc {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-track {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-overlay);
    border-radius: 22px;
    transition: background 0.2s;
  }

  .toggle-track::before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background: var(--text-secondary);
    border-radius: 50%;
    transition: transform 0.2s, background 0.2s;
  }

  .toggle input:checked + .toggle-track {
    background: var(--constantine-gold);
  }

  .toggle input:checked + .toggle-track::before {
    transform: translateX(18px);
    background: var(--abyss);
  }

  .shield-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: var(--constantine-gold);
    color: var(--abyss);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 8px;
  }

  .shield-btn:hover {
    background: var(--sulfur);
  }

  .shield-btn.secondary {
    background: var(--bg-overlay);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
  }

  .shield-btn.secondary:hover {
    background: var(--bg-hover);
  }
</style>
