<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { tabs, activeTabId, tabList, tabCount } from '../stores/app.js';
  import { createLogger, perfMonitor } from '../lib/resilience.js';

  export let handleNewTab;
  export let setActiveTab;
  export let closeTab;

  const logger = createLogger('TabBar');

  // Virtual scrolling configuration
  const TAB_MIN_WIDTH = 120;
  const TAB_MAX_WIDTH = 200;
  const TAB_GAP = 2;
  const VIRTUAL_BUFFER = 2; // Extra tabs to render on each side

  let containerRef = null;
  let containerWidth = 0;
  let scrollLeft = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragTabId = null;
  let dragOffsetX = 0;
  let dropTargetIndex = -1;

  // Virtual scrolling state
  let visibleStartIndex = 0;
  let visibleEndIndex = 0;
  let tabWidth = TAB_MAX_WIDTH;

  // Resize observer for container
  let resizeObserver = null;

  onMount(() => {
    if (containerRef) {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          containerWidth = entry.contentRect.width;
          calculateVisibleRange();
        }
      });
      resizeObserver.observe(containerRef);
    }
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  // Calculate which tabs should be visible (virtual scrolling)
  function calculateVisibleRange() {
    const endTimer = perfMonitor.startTimer('tabBar.calculateVisibleRange');

    const totalTabs = $tabCount;

    // Calculate optimal tab width
    if (totalTabs > 0) {
      const availableWidth = containerWidth - 40; // Account for padding
      const idealWidth = Math.floor(availableWidth / totalTabs) - TAB_GAP;
      tabWidth = Math.max(TAB_MIN_WIDTH, Math.min(TAB_MAX_WIDTH, idealWidth));
    }

    // For virtual scrolling - only render visible tabs + buffer
    const tabsPerView = Math.ceil(containerWidth / (tabWidth + TAB_GAP)) + (VIRTUAL_BUFFER * 2);
    const startIndex = Math.max(0, Math.floor(scrollLeft / (tabWidth + TAB_GAP)) - VIRTUAL_BUFFER);
    const endIndex = Math.min(totalTabs, startIndex + tabsPerView);

    visibleStartIndex = startIndex;
    visibleEndIndex = endIndex;

    endTimer();
  }

  // Reactive: recalculate on tab count or scroll changes
  $: if ($tabCount !== undefined) {
    calculateVisibleRange();
  }

  // Get visible tabs for rendering
  $: visibleTabs = $tabList.slice(visibleStartIndex, visibleEndIndex);

  // Calculate left offset for virtual scrolling
  $: virtualOffset = visibleStartIndex * (tabWidth + TAB_GAP);

  // Handle scroll
  function handleScroll(e) {
    scrollLeft = e.target.scrollLeft;
    calculateVisibleRange();
  }

  // Tab click handler
  function handleTabClick(tabId) {
    const endTimer = perfMonitor.startTimer('tabBar.tabClick');
    setActiveTab(tabId);
    endTimer();
  }

  // Close tab handler
  function handleCloseClick(e, tabId) {
    e.stopPropagation();
    e.preventDefault();

    const endTimer = perfMonitor.startTimer('tabBar.closeTab');
    closeTab(tabId);
    endTimer();
  }

  // Middle click to close
  function handleMouseDown(e, tabId) {
    if (e.button === 1) {
      // Middle click
      e.preventDefault();
      closeTab(tabId);
    }
  }

  // Keyboard navigation
  function handleKeydown(e, tabId, index) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(tabId);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        closeTab(tabId);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusTab(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusTab(index + 1);
        break;
      case 'Home':
        e.preventDefault();
        focusTab(0);
        break;
      case 'End':
        e.preventDefault();
        focusTab($tabCount - 1);
        break;
    }
  }

  function focusTab(index) {
    if (index >= 0 && index < $tabCount) {
      const tabs = containerRef?.querySelectorAll('.tab');
      if (tabs && tabs[index - visibleStartIndex]) {
        tabs[index - visibleStartIndex].focus();
      }
    }
  }

  // Drag and drop for tab reordering
  function handleDragStart(e, tabId, index) {
    isDragging = true;
    dragTabId = tabId;
    dragStartX = e.clientX;
    dragOffsetX = e.offsetX;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);

    // Create drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, dragOffsetX, 14);
    setTimeout(() => dragImage.remove(), 0);

    logger.debug('Drag started', { tabId, index });
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropTargetIndex = index;
  }

  function handleDragEnd() {
    isDragging = false;
    dragTabId = null;
    dropTargetIndex = -1;
    logger.debug('Drag ended');
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();

    const sourceTabId = e.dataTransfer.getData('text/plain');
    if (!sourceTabId) return;

    // Find source index
    const sourceIndex = $tabList.findIndex(t => t.id === sourceTabId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    // Reorder tabs (would need store method to implement)
    logger.info('Tab reordered', { from: sourceIndex, to: targetIndex });

    handleDragEnd();
  }

  // Scroll to active tab
  async function scrollToActiveTab() {
    await tick();
    if (!containerRef) return;

    const activeIndex = $tabList.findIndex(t => t.id === $activeTabId);
    if (activeIndex === -1) return;

    const tabOffset = activeIndex * (tabWidth + TAB_GAP);
    const tabEnd = tabOffset + tabWidth;

    if (tabOffset < scrollLeft) {
      containerRef.scrollTo({ left: tabOffset - 8, behavior: 'smooth' });
    } else if (tabEnd > scrollLeft + containerWidth) {
      containerRef.scrollTo({ left: tabEnd - containerWidth + 8, behavior: 'smooth' });
    }
  }

  // Scroll to active tab when it changes
  $: if ($activeTabId) {
    scrollToActiveTab();
  }

  // Double click to rename (placeholder)
  function handleDoubleClick(e, tabId) {
    e.preventDefault();
    logger.debug('Tab double-clicked for rename', { tabId });
    // Could implement inline rename here
  }

  // Context menu
  function handleContextMenu(e, tabId) {
    e.preventDefault();
    // Could show context menu here
    logger.debug('Tab context menu', { tabId });
  }
</script>

<div
  class="tab-bar"
  role="tablist"
  aria-label="Browser tabs"
>
  <div
    class="tabs-container"
    bind:this={containerRef}
    on:scroll={handleScroll}
    style="--tab-width: {tabWidth}px"
  >
    <!-- Virtual scroll spacer for maintaining scroll position -->
    <div
      class="virtual-spacer"
      style="width: {$tabCount * (tabWidth + TAB_GAP)}px; height: 1px;"
    ></div>

    <!-- Visible tabs -->
    <div
      class="tabs-wrapper"
      style="transform: translateX({virtualOffset}px)"
    >
      {#each visibleTabs as tab, i (tab.id)}
        {@const index = visibleStartIndex + i}
        <div
          class="tab"
          class:active={tab.id === $activeTabId}
          class:loading={tab.loading}
          class:crashed={tab.crashed}
          class:unresponsive={tab.unresponsive}
          class:dragging={tab.id === dragTabId}
          class:drop-target={index === dropTargetIndex}
          on:click={() => handleTabClick(tab.id)}
          on:dblclick={(e) => handleDoubleClick(e, tab.id)}
          on:mousedown={(e) => handleMouseDown(e, tab.id)}
          on:keydown={(e) => handleKeydown(e, tab.id, index)}
          on:contextmenu={(e) => handleContextMenu(e, tab.id)}
          on:dragstart={(e) => handleDragStart(e, tab.id, index)}
          on:dragover={(e) => handleDragOver(e, index)}
          on:dragend={handleDragEnd}
          on:drop={(e) => handleDrop(e, index)}
          draggable="true"
          role="tab"
          tabindex={tab.id === $activeTabId ? 0 : -1}
          aria-selected={tab.id === $activeTabId}
          aria-label="{tab.title || 'New Tab'}{tab.loading ? ', loading' : ''}{tab.crashed ? ', crashed' : ''}"
          title={tab.url || tab.title || 'New Tab'}
          style="width: {tabWidth}px"
        >
          <!-- Favicon/Loading indicator -->
          <div class="tab-icon">
            {#if tab.loading}
              <div class="tab-loading" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" />
                </svg>
              </div>
            {:else if tab.crashed}
              <span class="tab-crash-icon" aria-hidden="true">&#9888;</span>
            {:else if tab.favicon}
              <img
                class="tab-favicon"
                src={tab.favicon}
                alt=""
                loading="lazy"
                on:error={(e) => e.target.style.display = 'none'}
              />
            {:else}
              <div class="tab-default-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke-width="1.5"/>
                </svg>
              </div>
            {/if}
          </div>

          <!-- Title -->
          <span class="tab-title">
            {tab.title || 'New Tab'}
          </span>

          <!-- Close button -->
          <button
            class="tab-close"
            on:click={(e) => handleCloseClick(e, tab.id)}
            on:mousedown|stopPropagation
            aria-label="Close tab: {tab.title || 'New Tab'}"
            title="Close tab (Ctrl+W)"
            tabindex="-1"
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <line x1="2" y1="2" x2="10" y2="10"/>
              <line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>

          <!-- Loading progress bar -->
          {#if tab.loading}
            <div class="tab-progress" aria-hidden="true"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- New tab button -->
  <button
    class="new-tab-btn"
    on:click={handleNewTab}
    title="New Tab (Ctrl+T)"
    aria-label="Open new tab"
  >
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  </button>

  <!-- Tab count indicator (for many tabs) -->
  {#if $tabCount > 20}
    <div class="tab-count" aria-live="polite">
      {$tabCount} tabs
    </div>
  {/if}
</div>

<style>
  .tab-bar {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-default);
    user-select: none;
    contain: layout style;
  }

  .tabs-container {
    flex: 1;
    display: flex;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .tabs-container::-webkit-scrollbar {
    display: none;
  }

  .virtual-spacer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .tabs-wrapper {
    display: flex;
    gap: 2px;
    padding: 4px 0;
    will-change: transform;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: var(--tab-width, 120px);
    max-width: var(--tab-width, 200px);
    width: var(--tab-width, 180px);
    height: 28px;
    padding: 0 8px 0 10px;
    border-radius: 6px;
    background: var(--bg-tertiary);
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s, transform 0.1s;
    position: relative;
    flex-shrink: 0;
    contain: layout style paint;
  }

  .tab:hover {
    background: var(--bg-hover);
  }

  .tab:focus {
    outline: 2px solid var(--constantine-gold);
    outline-offset: -2px;
  }

  .tab:focus:not(:focus-visible) {
    outline: none;
  }

  .tab.active {
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
  }

  .tab.crashed {
    background: rgba(139, 0, 0, 0.3);
    border: 1px solid var(--blood);
  }

  .tab.unresponsive {
    opacity: 0.6;
  }

  .tab.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  .tab.drop-target {
    border-left: 2px solid var(--constantine-gold);
  }

  .tab-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tab-favicon {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    object-fit: contain;
  }

  .tab-default-icon svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-tertiary);
  }

  .tab-loading {
    width: 14px;
    height: 14px;
    animation: spin 1s linear infinite;
  }

  .tab-loading svg {
    width: 100%;
    height: 100%;
    stroke: var(--constantine-gold);
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 28;
    stroke-dashoffset: 20;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tab-crash-icon {
    font-size: 14px;
    color: var(--hellfire);
  }

  .tab-title {
    flex: 1;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .tab.active .tab-title {
    color: var(--text-primary);
    font-weight: 500;
  }

  .tab.crashed .tab-title {
    color: var(--hellfire);
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
    padding: 0;
  }

  .tab:hover .tab-close,
  .tab:focus .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--bg-hover);
  }

  .tab-close:active {
    background: rgba(139, 0, 0, 0.3);
  }

  .tab-close svg {
    width: 10px;
    height: 10px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .tab-close:hover svg {
    stroke: var(--text-primary);
  }

  .tab-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--constantine-gold) 50%,
      transparent
    );
    animation: progress 1.5s ease-in-out infinite;
  }

  @keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
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

  .new-tab-btn:focus {
    outline: 2px solid var(--constantine-gold);
    outline-offset: -2px;
  }

  .new-tab-btn:focus:not(:focus-visible) {
    outline: none;
  }

  .new-tab-btn svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-secondary);
    stroke-width: 1.5;
  }

  .new-tab-btn:hover svg {
    stroke: var(--text-primary);
  }

  .tab-count {
    font-size: 10px;
    color: var(--text-tertiary);
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    margin-left: 4px;
    white-space: nowrap;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .tab,
    .tab-close,
    .new-tab-btn,
    .tabs-container {
      transition: none;
    }

    .tab-loading,
    .tab-progress {
      animation: none;
    }

    .tab-loading svg {
      stroke-dashoffset: 0;
    }
  }
</style>
