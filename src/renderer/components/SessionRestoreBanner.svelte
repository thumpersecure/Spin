<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let count;

  const dispatch = createEventDispatcher();
  let visible = true;

  onMount(() => {
    const timeout = setTimeout(() => {
      visible = false;
      dispatch('dismiss');
    }, 15000);

    return () => clearTimeout(timeout);
  });

  function handleRestore() {
    visible = false;
    dispatch('restore');
  }

  function handleDismiss() {
    visible = false;
    dispatch('dismiss');
  }
</script>

{#if visible}
  <div class="session-restore-banner">
    <div class="session-restore-content">
      <svg class="session-restore-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
      </svg>
      <span class="session-restore-text">
        Restore {count} tab{count > 1 ? 's' : ''} from your previous session?
      </span>
    </div>
    <div class="session-restore-actions">
      <button class="session-restore-btn restore" on:click={handleRestore}>
        Restore
      </button>
      <button class="session-restore-btn dismiss" on:click={handleDismiss}>
        Dismiss
      </button>
    </div>
  </div>
{/if}

<style>
  .session-restore-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-default);
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .session-restore-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .session-restore-icon {
    width: 18px;
    height: 18px;
    fill: var(--constantine-gold);
  }

  .session-restore-text {
    font-size: 13px;
    color: var(--text-primary);
  }

  .session-restore-actions {
    display: flex;
    gap: 8px;
  }

  .session-restore-btn {
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .session-restore-btn.restore {
    background: var(--constantine-gold);
    color: var(--abyss);
  }

  .session-restore-btn.restore:hover {
    background: var(--sulfur);
  }

  .session-restore-btn.dismiss {
    background: var(--bg-overlay);
    color: var(--text-secondary);
  }

  .session-restore-btn.dismiss:hover {
    background: var(--bg-hover);
  }
</style>
