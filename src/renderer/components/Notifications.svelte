<script>
  import { notifications } from '../stores/app.js';

  function dismiss(id) {
    notifications.dismiss(id);
  }
</script>

<div class="notification-container">
  {#each $notifications as notification (notification.id)}
    <div class="notification {notification.type}">
      <svg class="notification-icon" viewBox="0 0 20 20">
        {#if notification.type === 'success'}
          <path d="M16 5l-9 9-4-4" fill="none"/>
        {:else if notification.type === 'error'}
          <circle cx="10" cy="10" r="8" fill="none"/>
          <line x1="6" y1="6" x2="14" y2="14"/>
          <line x1="14" y1="6" x2="6" y2="14"/>
        {:else if notification.type === 'warning'}
          <path d="M10 3L2 17h16L10 3z" fill="none"/>
          <line x1="10" y1="9" x2="10" y2="12"/>
          <circle cx="10" cy="15" r="0.5"/>
        {:else}
          <circle cx="10" cy="10" r="8" fill="none"/>
          <line x1="10" y1="6" x2="10" y2="10"/>
          <circle cx="10" cy="14" r="1"/>
        {/if}
      </svg>
      <span class="notification-text">{notification.message}</span>
      <button
        class="notification-close"
        on:click={() => dismiss(notification.id)}
        aria-label="Close"
      >
        <svg viewBox="0 0 12 12">
          <line x1="2" y1="2" x2="10" y2="10"/>
          <line x1="10" y1="2" x2="2" y2="10"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 80px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 9999;
    pointer-events: none;
  }

  .notification {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.2s ease;
    pointer-events: auto;
    max-width: 360px;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification.success {
    border-color: var(--celestial);
  }

  .notification.error {
    border-color: var(--blood);
  }

  .notification.warning {
    border-color: var(--hellfire);
  }

  .notification.info {
    border-color: var(--constantine-gold);
  }

  .notification-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    stroke-width: 1.5;
    fill: none;
  }

  .notification.success .notification-icon {
    stroke: var(--celestial);
  }

  .notification.error .notification-icon {
    stroke: var(--blood);
  }

  .notification.warning .notification-icon {
    stroke: var(--hellfire);
  }

  .notification.info .notification-icon {
    stroke: var(--constantine-gold);
  }

  .notification-text {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .notification-close {
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .notification-close:hover {
    background: var(--bg-hover);
  }

  .notification-close svg {
    width: 10px;
    height: 10px;
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }
</style>
