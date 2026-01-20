<script>
  import { onMount } from 'svelte';
  import { notifications } from '../stores/app.js';

  let countries = {};
  let phoneNumber = '';
  let selectedCountry = 'US';
  let searchEngine = 'duckduckgo';
  let loading = false;
  let searchLoading = false;
  let formats = null;
  let searchQueries = null;

  onMount(async () => {
    try {
      countries = await window.sandiego.phoneIntel.getCountries();
    } catch (err) {
      console.error('Failed to load countries:', err);
      notifications.show('error', 'Failed to load countries');
    }
  });

  async function generateFormats() {
    if (!phoneNumber.trim()) {
      notifications.show('warning', 'Please enter a phone number');
      return;
    }

    loading = true;
    try {
      const result = await window.sandiego.phoneIntel.generateFormats(phoneNumber, selectedCountry);
      if (result) {
        formats = result.formats;
        searchQueries = result.searchQueries;
      } else {
        notifications.show('error', 'Failed to generate formats');
      }
    } catch (err) {
      console.error('Generate formats error:', err);
      notifications.show('error', 'Failed to generate formats');
    } finally {
      loading = false;
    }
  }

  async function smartSearch() {
    if (!phoneNumber.trim()) {
      notifications.show('warning', 'Please enter a phone number');
      return;
    }

    searchLoading = true;
    try {
      const result = await window.sandiego.phoneIntel.batchSearch(phoneNumber, selectedCountry, searchEngine);
      if (result) {
        notifications.show('success', 'OSINT search opened in new tab');
      } else {
        notifications.show('error', 'Failed to execute search');
      }
    } catch (err) {
      console.error('Batch search error:', err);
      notifications.show('error', 'Failed to execute search');
    } finally {
      searchLoading = false;
    }
  }

  async function copyToClipboard(value) {
    try {
      await navigator.clipboard.writeText(value);
      notifications.show('success', 'Copied to clipboard');
    } catch (err) {
      console.error('Clipboard error:', err);
      notifications.show('error', 'Failed to copy to clipboard');
    }
  }

  async function searchFormat(index) {
    if (searchQueries && searchQueries[index]) {
      const url = searchQueries[index].duckDuckGoUrl;
      if (url) {
        try {
          await window.sandiego.phoneIntel.openSearch(url);
          notifications.show('success', 'Search opened in new tab');
        } catch (err) {
          console.error('Search error:', err);
          notifications.show('error', 'Failed to open search');
        }
      }
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      generateFormats();
    }
  }
</script>

<div class="phone-intel">
  <div class="phone-intel-header">
    <div class="phone-intel-icon">&#128222;</div>
    <div class="phone-intel-title">Phone Number Intelligence</div>
    <div class="phone-intel-subtitle">xTELENUMSINT Technology</div>
  </div>

  <div class="phone-intel-form">
    <div class="form-group">
      <label class="form-label" for="phoneNumber">Phone Number</label>
      <input
        type="tel"
        id="phoneNumber"
        class="form-input"
        bind:value={phoneNumber}
        on:keydown={handleKeydown}
        placeholder="Enter phone number..."
        maxlength="30"
      >
    </div>

    <div class="form-group">
      <label class="form-label" for="countrySelect">Country</label>
      <select id="countrySelect" class="form-select" bind:value={selectedCountry}>
        {#each Object.entries(countries) as [code, data]}
          <option value={code}>{data.name} ({data.code})</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <span class="form-label">Search Engine</span>
      <div class="radio-group" role="radiogroup" aria-label="Search Engine">
        <label class="radio-option">
          <input type="radio" bind:group={searchEngine} value="duckduckgo">
          <span class="radio-label">DuckDuckGo</span>
        </label>
        <label class="radio-option">
          <input type="radio" bind:group={searchEngine} value="google">
          <span class="radio-label">Google</span>
        </label>
      </div>
    </div>

    <button
      class="phone-intel-btn primary"
      on:click={generateFormats}
      disabled={loading}
    >
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
      </svg>
      <span class="btn-text">{loading ? 'Generating...' : 'Generate Format Variations'}</span>
    </button>

    <button
      class="phone-intel-btn accent"
      on:click={smartSearch}
      disabled={searchLoading}
    >
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
      </svg>
      <span class="btn-text">{searchLoading ? 'Searching...' : 'Smart OSINT Search'}</span>
    </button>
  </div>

  {#if formats && formats.length > 0}
    <div class="phone-intel-results">
      <div class="results-header">Format Variations</div>
      <div class="formats-list">
        {#each formats as format, index}
          <div class="format-item">
            <div class="format-info">
              <span class="format-name">{format.name}</span>
              <span class="format-value">{format.value}</span>
            </div>
            <div class="format-actions">
              <button
                class="format-btn"
                title="Copy to clipboard"
                on:click={() => copyToClipboard(format.value)}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
              </button>
              <button
                class="format-btn"
                title="Search this format"
                on:click={() => searchFormat(index)}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .phone-intel {
    padding: 16px;
  }

  .phone-intel-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .phone-intel-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .phone-intel-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .phone-intel-subtitle {
    font-size: 11px;
    color: var(--constantine-gold);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .phone-intel-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-input,
  .form-select {
    padding: 10px 12px;
    border: 1px solid var(--border-default);
    border-radius: 6px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }

  .form-input:focus,
  .form-select:focus {
    border-color: var(--constantine-gold);
  }

  .radio-group {
    display: flex;
    gap: 16px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .radio-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .phone-intel-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }

  .phone-intel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .phone-intel-btn svg {
    width: 16px;
    height: 16px;
  }

  .phone-intel-btn.primary {
    background: var(--constantine-gold);
    color: var(--abyss);
  }

  .phone-intel-btn.primary:hover:not(:disabled) {
    background: var(--sulfur);
  }

  .phone-intel-btn.accent {
    background: var(--hellfire);
    color: white;
  }

  .phone-intel-btn.accent:hover:not(:disabled) {
    background: #ff6b00;
  }

  .phone-intel-results {
    margin-top: 20px;
  }

  .results-header {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .formats-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .format-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--bg-tertiary);
  }

  .format-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .format-name {
    font-size: 10px;
    color: var(--text-tertiary);
    text-transform: uppercase;
  }

  .format-value {
    font-size: 13px;
    color: var(--text-primary);
    font-family: monospace;
  }

  .format-actions {
    display: flex;
    gap: 4px;
  }

  .format-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .format-btn:hover {
    background: var(--bg-hover);
  }

  .format-btn svg {
    width: 14px;
    height: 14px;
    fill: var(--text-tertiary);
  }
</style>
