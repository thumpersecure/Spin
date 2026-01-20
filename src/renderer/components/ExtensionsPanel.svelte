<script>
  import { OSINT_BOOKMARKS, notifications } from '../stores/app.js';
  import PhoneIntel from './PhoneIntel.svelte';

  export let navigateToUrl;
  export let closePanel;

  let activeTab = 'bookmarks';
  let searchQuery = '';
  let collapsedGroups = new Set();

  function toggleGroup(category) {
    if (collapsedGroups.has(category)) {
      collapsedGroups.delete(category);
    } else {
      collapsedGroups.add(category);
    }
    collapsedGroups = collapsedGroups;
  }

  $: filteredBookmarks = Object.entries(OSINT_BOOKMARKS).map(([category, items]) => {
    const query = searchQuery.toLowerCase();
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query)
    );
    return [category, filtered];
  }).filter(([, items]) => items.length > 0);
</script>

<div class="panel-content">
  <div class="panel-header">
    <span class="panel-title">OSINT Tools</span>
    <button class="panel-close" on:click={closePanel} aria-label="Close panel">
      <svg viewBox="0 0 12 12">
        <line x1="2" y1="2" x2="10" y2="10"/>
        <line x1="10" y1="2" x2="2" y2="10"/>
      </svg>
    </button>
  </div>

  <div class="panel-tabs">
    <button
      class="panel-tab"
      class:active={activeTab === 'bookmarks'}
      on:click={() => activeTab = 'bookmarks'}
    >
      Bookmarks
    </button>
    <button
      class="panel-tab"
      class:active={activeTab === 'phone-intel'}
      on:click={() => activeTab = 'phone-intel'}
    >
      Phone Intel
    </button>
  </div>

  {#if activeTab === 'bookmarks'}
    <div class="panel-tab-content">
      <div class="panel-search">
        <input
          type="text"
          class="panel-search-input"
          bind:value={searchQuery}
          placeholder="Search tools..."
        >
      </div>
      <div class="panel-body">
        {#each filteredBookmarks as [category, items]}
          <div class="panel-group" class:collapsed={collapsedGroups.has(category)}>
            <button
              class="panel-group-title"
              on:click={() => toggleGroup(category)}
            >
              <svg class="arrow" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" fill="none"/>
              </svg>
              <span>{category}</span>
              <span class="item-count">{items.length}</span>
            </button>
            <div class="panel-group-items">
              {#each items as item}
                <button
                  class="panel-item"
                  on:click={() => navigateToUrl(item.url)}
                >
                  <svg class="panel-item-icon" viewBox="0 0 16 16">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none"/>
                  </svg>
                  <span class="panel-item-text">{item.name}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'phone-intel'}
    <PhoneIntel />
  {/if}
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

  .panel-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-default);
  }

  .panel-tab {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .panel-tab:hover {
    background: var(--bg-hover);
  }

  .panel-tab.active {
    background: var(--bg-active);
    color: var(--constantine-gold);
  }

  .panel-tab-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .panel-search {
    padding: 12px;
    border-bottom: 1px solid var(--border-default);
  }

  .panel-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-default);
    border-radius: 6px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
  }

  .panel-search-input:focus {
    border-color: var(--constantine-gold);
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .panel-group {
    margin-bottom: 4px;
  }

  .panel-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .panel-group-title:hover {
    background: var(--bg-hover);
  }

  .panel-group-title .arrow {
    width: 12px;
    height: 12px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
    fill: none;
    transition: transform 0.15s;
  }

  .panel-group.collapsed .arrow {
    transform: rotate(-90deg);
  }

  .item-count {
    margin-left: auto;
    color: var(--text-tertiary);
    font-size: 11px;
  }

  .panel-group-items {
    padding-left: 20px;
  }

  .panel-group.collapsed .panel-group-items {
    display: none;
  }

  .panel-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-align: left;
  }

  .panel-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .panel-item-icon {
    width: 14px;
    height: 14px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
    flex-shrink: 0;
  }

  .panel-item-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
