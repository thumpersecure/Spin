<script>
</script>

<div class="offline-banner">
  <svg class="offline-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922c.05.062.105.118.168.167l6.91 6.911a1 1 0 001.415-1.414l-.675-.675a9.001 9.001 0 00-.668-11.982A1 1 0 1014.95 5.05a7.002 7.002 0 01.657 9.143l-1.435-1.435a5.002 5.002 0 00-.636-6.294A1 1 0 0012.12 7.88c.924.923 1.12 2.3.587 3.415l-1.992-1.992a.922.922 0 00-.018-.018l-6.99-6.991zM3.238 8.187a1 1 0 00-1.933-.518c-.006.012-.01.025-.014.037a9.004 9.004 0 002.497 8.062 1 1 0 001.414-1.414 7.002 7.002 0 01-1.964-6.167z" clip-rule="evenodd"/>
  </svg>
  <span>No internet connection</span>
</div>

<style>
  .offline-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--hellfire);
    color: white;
    font-size: 12px;
    font-weight: 500;
  }

  .offline-icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
</style>
