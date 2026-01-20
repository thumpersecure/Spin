<script>
  import { tabs, activeTabId } from '../stores/app.js';

  export let handleNewTab;
  export let setActiveTab;
  export let closeTab;

  function handleTabClick(tabId) {
    setActiveTab(tabId);
  }

  function handleCloseClick(e, tabId) {
    e.stopPropagation();
    closeTab(tabId);
  }

  $: tabList = Array.from($tabs.entries());
</script>

<nav class="tab-bar">
  <div class="tabs-wrapper">
    {#each tabList as [tabId, tab] (tabId)}
      <div
        class="tab"
        class:active={tabId === $activeTabId}
        class:loading={tab.loading}
        class:crashed={tab.crashed}
        class:unresponsive={tab.unresponsive}
        on:click={() => handleTabClick(tabId)}
        on:keydown={(e) => e.key === 'Enter' && handleTabClick(tabId)}
        role="tab"
        tabindex="0"
        aria-selected={tabId === $activeTabId}
      >
        {#if tab.loading}
          <div class="tab-loading"></div>
        {:else if tab.favicon}
          <img class="tab-favicon" src={tab.favicon} alt="">
        {/if}
        <span class="tab-title">
          {#if tab.crashed}&#9888; {/if}{tab.title || 'New Tab'}
        </span>
        <button
          class="tab-close"
          on:click={(e) => handleCloseClick(e, tabId)}
          aria-label="Close tab"
        >
          <svg viewBox="0 0 12 12">
            <line x1="2" y1="2" x2="10" y2="10"/>
            <line x1="10" y1="2" x2="2" y2="10"/>
          </svg>
        </button>
      </div>
    {/each}
  </div>

  <button
    class="new-tab-btn"
    on:click={handleNewTab}
    title="New Tab (Ctrl+T)"
    aria-label="New Tab"
  >
    <svg viewBox="0 0 16 16">
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  </button>
</nav>

<style>
  .tab-bar {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-default);
  }

  .tabs-wrapper {
    display: flex;
    flex: 1;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs-wrapper::-webkit-scrollbar {
    display: none;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    max-width: 200px;
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    background: var(--bg-tertiary);
    cursor: pointer;
    transition: background 0.15s;
    user-select: none;
  }

  .tab:hover {
    background: var(--bg-hover);
  }

  .tab.active {
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
  }

  .tab.crashed {
    background: rgba(139, 0, 0, 0.3);
  }

  .tab.unresponsive {
    opacity: 0.6;
  }

  .tab-favicon {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .tab-loading {
    width: 14px;
    height: 14px;
    border: 2px solid var(--constantine-gold);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tab-title {
    flex: 1;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab.active .tab-title {
    color: var(--text-primary);
  }

  .tab-close {
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
    flex-shrink: 0;
  }

  .tab:hover .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--bg-hover);
  }

  .tab-close svg {
    width: 10px;
    height: 10px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .new-tab-btn {
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
    flex-shrink: 0;
    margin-left: 4px;
  }

  .new-tab-btn:hover {
    background: var(--bg-hover);
  }

  .new-tab-btn svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-secondary);
    stroke-width: 1.5;
  }
</style>
