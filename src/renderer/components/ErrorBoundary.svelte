<script>
  import { onMount, onDestroy } from 'svelte';
  import { createLogger, createErrorHandler } from '../lib/resilience.js';

  export let name = 'Component';
  export let fallbackMessage = 'Something went wrong';
  export let onError = null;
  export let canRetry = true;

  const logger = createLogger(`ErrorBoundary:${name}`);

  let hasError = false;
  let error = null;
  let errorInfo = null;
  let retryCount = 0;
  const maxRetries = 3;

  // Handle errors from child components
  function handleError(e) {
    const err = e.error || e;

    hasError = true;
    error = err;
    errorInfo = {
      timestamp: new Date().toISOString(),
      component: name,
      retryCount,
      url: window.location.href
    };

    logger.error('Caught error', {
      message: err.message,
      stack: err.stack,
      ...errorInfo
    });

    if (onError) {
      try {
        onError(err, errorInfo);
      } catch (callbackError) {
        logger.error('Error callback failed', { error: callbackError.message });
      }
    }
  }

  function retry() {
    if (retryCount >= maxRetries) {
      logger.warn('Max retries reached', { component: name });
      return;
    }

    retryCount++;
    hasError = false;
    error = null;
    errorInfo = null;

    logger.info('Retrying component', { component: name, attempt: retryCount });
  }

  function dismiss() {
    hasError = false;
    error = null;
    errorInfo = null;
  }

  // Global error listener for unhandled errors in this subtree
  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (e) => {
      handleError(e.reason || new Error('Unhandled promise rejection'));
    });
  });

  onDestroy(() => {
    window.removeEventListener('error', handleError);
  });
</script>

{#if hasError}
  <div class="error-boundary">
    <div class="error-content">
      <div class="error-icon">&#9888;</div>
      <h3 class="error-title">{fallbackMessage}</h3>

      {#if error}
        <p class="error-message">{error.message || 'An unexpected error occurred'}</p>
      {/if}

      <div class="error-actions">
        {#if canRetry && retryCount < maxRetries}
          <button class="error-btn primary" on:click={retry}>
            Try Again ({maxRetries - retryCount} left)
          </button>
        {/if}
        <button class="error-btn secondary" on:click={dismiss}>
          Dismiss
        </button>
      </div>

      {#if import.meta.env.DEV && error}
        <details class="error-details">
          <summary>Technical Details</summary>
          <pre>{error.stack || 'No stack trace available'}</pre>
          <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
        </details>
      {/if}
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
    background: var(--bg-secondary, #1a1a1c);
    border: 1px solid var(--blood, #8B0000);
    border-radius: 12px;
    margin: 8px;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--hellfire, #E65C00);
  }

  .error-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #fff);
    margin: 0 0 8px;
  }

  .error-message {
    font-size: 13px;
    color: var(--text-secondary, #999);
    margin: 0 0 20px;
    word-break: break-word;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .error-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }

  .error-btn.primary {
    background: var(--constantine-gold, #D4A32D);
    color: var(--abyss, #0A0A0C);
  }

  .error-btn.primary:hover {
    background: var(--sulfur, #FFD700);
  }

  .error-btn.secondary {
    background: var(--bg-overlay, #2a2a2c);
    color: var(--text-secondary, #999);
    border: 1px solid var(--border-default, #333);
  }

  .error-btn.secondary:hover {
    background: var(--bg-hover, #3a3a3c);
  }

  .error-details {
    margin-top: 20px;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    color: var(--text-tertiary, #666);
    font-size: 12px;
    margin-bottom: 8px;
  }

  .error-details pre {
    font-size: 11px;
    color: var(--text-tertiary, #666);
    background: var(--bg-tertiary, #111);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 8px 0;
  }
</style>
