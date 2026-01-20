<script>
  import { createEventDispatcher } from 'svelte';

  export let reason;

  const dispatch = createEventDispatcher();

  function handleReload() {
    dispatch('reload');
  }

  function handleClose() {
    dispatch('close');
  }

  $: reasonText = reason === 'oom' ? 'ran out of memory' : 'stopped responding';
</script>

<div class="crash-overlay">
  <div class="crash-content">
    <div class="crash-icon">&#128683;</div>
    <h2 class="crash-title">Tab Crashed</h2>
    <p class="crash-message">This tab {reasonText}.</p>
    <div class="crash-actions">
      <button class="crash-btn primary" on:click={handleReload}>
        Reload Tab
      </button>
      <button class="crash-btn secondary" on:click={handleClose}>
        Close Tab
      </button>
    </div>
  </div>
</div>

<style>
  .crash-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 10, 12, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
  }

  .crash-content {
    text-align: center;
    padding: 40px;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--border-default);
    max-width: 400px;
  }

  .crash-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .crash-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  .crash-message {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0 0 24px;
  }

  .crash-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .crash-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .crash-btn.primary {
    background: var(--constantine-gold);
    color: var(--abyss);
  }

  .crash-btn.primary:hover {
    background: var(--sulfur);
  }

  .crash-btn.secondary {
    background: var(--bg-overlay);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
  }

  .crash-btn.secondary:hover {
    background: var(--bg-hover);
  }
</style>
