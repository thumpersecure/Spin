<script>
  import { QUICK_LINKS } from '../stores/app.js';

  export let navigateToUrl;

  let searchValue = '';

  function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
      navigateToUrl(searchValue);
    }
  }

  function handleSearchClick() {
    navigateToUrl(searchValue);
  }

  function handleQuickLink(url) {
    navigateToUrl(url);
  }
</script>

<div class="start-page">
  <div class="start-hero">
    <div class="globe-container">
      <div class="globe"></div>
    </div>
    <h1 class="start-title">CONSTANTINE</h1>
    <p class="start-tagline">Between Heaven and Hell, intelligence prevails.</p>
  </div>

  <div class="start-search-box">
    <input
      type="text"
      class="start-search"
      id="startSearch"
      bind:value={searchValue}
      on:keydown={handleSearchKeydown}
      placeholder="Begin your investigation..."
      autocomplete="off"
    >
    <button class="start-search-btn" on:click={handleSearchClick} aria-label="Search">
      <svg viewBox="0 0 20 20">
        <circle cx="8" cy="8" r="6" fill="none"/>
        <line x1="12.5" y1="12.5" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <div class="quick-access">
    <h3 class="quick-access-title">Quick Access - Intelligence Resources</h3>
    <div class="quick-grid">
      {#each QUICK_LINKS as link}
        <button
          class="quick-link"
          on:click={() => handleQuickLink(link.url)}
        >
          <div class="quick-link-icon">{@html link.icon}</div>
          <span class="quick-link-title">{link.title}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="start-footer">
    <div class="footer-stats">
      <span class="stat"><span class="stat-icon">&#127760;</span> Chromium Powered</span>
      <span class="stat"><span class="stat-icon">&#128274;</span> Privacy First</span>
      <span class="stat"><span class="stat-icon">&#128640;</span> Tor Ready</span>
    </div>
  </div>
</div>

<style>
  .start-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    background: radial-gradient(ellipse at center, var(--bg-secondary) 0%, var(--bg-primary) 70%);
  }

  .start-hero {
    text-align: center;
    margin-bottom: 40px;
  }

  .globe-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
  }

  .globe {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--constantine-gold) 0%, var(--hellfire) 100%);
    box-shadow: 0 0 40px rgba(212, 163, 45, 0.4);
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }

  .start-title {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--constantine-gold);
    margin: 0 0 8px;
    text-shadow: 0 0 30px rgba(212, 163, 45, 0.3);
  }

  .start-tagline {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-style: italic;
  }

  .start-search-box {
    display: flex;
    width: 100%;
    max-width: 600px;
    height: 48px;
    margin-bottom: 50px;
    border-radius: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .start-search-box:focus-within {
    border-color: var(--constantine-gold);
    box-shadow: 0 0 20px rgba(212, 163, 45, 0.2);
  }

  .start-search {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0 20px;
    color: var(--text-primary);
    font-size: 15px;
    outline: none;
  }

  .start-search::placeholder {
    color: var(--text-tertiary);
  }

  .start-search-btn {
    width: 48px;
    height: 100%;
    border: none;
    background: var(--constantine-gold);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .start-search-btn:hover {
    background: var(--sulfur);
  }

  .start-search-btn svg {
    width: 20px;
    height: 20px;
    stroke: var(--abyss);
    stroke-width: 2;
    fill: none;
  }

  .quick-access {
    width: 100%;
    max-width: 800px;
    text-align: center;
  }

  .quick-access-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 20px;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  @media (max-width: 700px) {
    .quick-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .quick-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }

  .quick-link:hover {
    background: var(--bg-hover);
    border-color: var(--constantine-gold);
    transform: translateY(-2px);
  }

  .quick-link-icon {
    font-size: 24px;
  }

  .quick-link-title {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .start-footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
  }

  .footer-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .stat-icon {
    font-size: 14px;
  }
</style>
