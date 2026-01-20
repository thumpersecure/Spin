/**
 * CONSTANTINE Browser - Production IPC Layer
 * Resilient communication with the main process
 */

import {
  createLogger,
  retry,
  CircuitBreaker,
  perfMonitor,
  validators,
  sanitizeInput,
  withFallback
} from './resilience.js';

// ============================================
// Logger
// ============================================

const logger = createLogger('IPC');

// ============================================
// IPC Circuit Breaker
// ============================================

const ipcCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxCalls: 2,
  logger
});

// ============================================
// IPC Status Tracking
// ============================================

let ipcStatus = 'connected';
let lastError = null;
let callCount = 0;
let errorCount = 0;

const statusListeners = new Set();

export function onIPCStatusChange(callback) {
  statusListeners.add(callback);
  return () => statusListeners.delete(callback);
}

function setIPCStatus(status, error = null) {
  if (ipcStatus !== status) {
    ipcStatus = status;
    lastError = error;
    statusListeners.forEach(cb => {
      try {
        cb(status, error);
      } catch (e) {
        logger.error('Status listener error', { error: e.message });
      }
    });
    logger.info('IPC status changed', { status, error: error?.message });
  }
}

export function getIPCStatus() {
  return {
    status: ipcStatus,
    lastError,
    callCount,
    errorCount,
    circuitState: ipcCircuitBreaker.getState()
  };
}

// ============================================
// Core IPC Call with Resilience
// ============================================

/**
 * Make a resilient IPC call
 * @param {string} method - IPC method name
 * @param {any[]} args - Method arguments
 * @param {object} options - Call options
 */
async function resilientCall(method, args = [], options = {}) {
  const {
    timeout = 10000,
    retries = 3,
    critical = false,
    fallback = null,
    skipCircuitBreaker = false
  } = options;

  callCount++;
  const endTimer = perfMonitor.startTimer(`ipc.${method}`);

  // Check if IPC is available
  if (!window.sandiego) {
    setIPCStatus('unavailable');
    const error = new Error('IPC bridge not available');
    errorCount++;
    endTimer();

    if (fallback !== null) {
      logger.warn(`IPC unavailable, using fallback for ${method}`);
      return typeof fallback === 'function' ? fallback() : fallback;
    }
    throw error;
  }

  // Check if method exists
  if (typeof window.sandiego[method] !== 'function') {
    const error = new Error(`IPC method ${method} not found`);
    errorCount++;
    endTimer();

    if (fallback !== null) {
      logger.warn(`Method ${method} not found, using fallback`);
      return typeof fallback === 'function' ? fallback() : fallback;
    }
    throw error;
  }

  // Execute with circuit breaker (unless skipped)
  const execute = async () => {
    return retry(
      async () => {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`IPC call ${method} timed out`)), timeout);
        });

        // Race between call and timeout
        return Promise.race([
          window.sandiego[method](...args),
          timeoutPromise
        ]);
      },
      {
        maxAttempts: retries,
        baseDelay: 500,
        maxDelay: 5000,
        backoffFactor: 2,
        shouldRetry: (error) => {
          // Don't retry validation errors or not found
          if (error.message.includes('not found') ||
              error.message.includes('invalid') ||
              error.message.includes('validation')) {
            return false;
          }
          return true;
        },
        onRetry: (attempt, delay, error) => {
          logger.warn(`Retrying ${method}`, { attempt, delay, error: error.message });
        },
        logger
      }
    );
  };

  try {
    let result;

    if (skipCircuitBreaker) {
      result = await execute();
    } else {
      result = await ipcCircuitBreaker.execute(execute);
    }

    setIPCStatus('connected');
    endTimer();
    return result;

  } catch (error) {
    errorCount++;
    const duration = endTimer();

    // Determine status based on error type
    if (error.message.includes('Circuit breaker')) {
      setIPCStatus('circuit_open', error);
    } else if (error.message.includes('timed out')) {
      setIPCStatus('timeout', error);
    } else {
      setIPCStatus('error', error);
    }

    logger.error(`IPC call failed: ${method}`, {
      error: error.message,
      args: args.length,
      duration,
      critical
    });

    // Use fallback if available
    if (fallback !== null) {
      logger.info(`Using fallback for ${method}`);
      return typeof fallback === 'function' ? fallback() : fallback;
    }

    throw error;
  }
}

// ============================================
// Tab Operations
// ============================================

export const TabOps = {
  /**
   * Create a new tab
   * @param {string|null} url - Initial URL
   * @returns {Promise<string>} Tab ID
   */
  async create(url = null) {
    const sanitizedUrl = url ? sanitizeInput(url) : null;
    return resilientCall('createTab', [sanitizedUrl], {
      timeout: 5000,
      retries: 2,
      critical: true
    });
  },

  /**
   * Close a tab
   * @param {string} tabId - Tab ID to close
   */
  async close(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('closeTab', [tabId], {
      timeout: 3000,
      retries: 1
    });
  },

  /**
   * Show/activate a tab
   * @param {string} tabId - Tab ID to show
   */
  async show(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('showTab', [tabId], {
      timeout: 2000,
      retries: 1
    });
  },

  /**
   * Navigate to URL
   * @param {string} tabId - Tab ID
   * @param {string} url - URL or search query
   */
  async navigate(tabId, url) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    const sanitizedUrl = sanitizeInput(url);
    return resilientCall('navigate', [tabId, sanitizedUrl], {
      timeout: 5000,
      retries: 2
    });
  },

  /**
   * Go back in history
   * @param {string} tabId - Tab ID
   */
  async goBack(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('goBack', [tabId], {
      timeout: 2000,
      retries: 1
    });
  },

  /**
   * Go forward in history
   * @param {string} tabId - Tab ID
   */
  async goForward(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('goForward', [tabId], {
      timeout: 2000,
      retries: 1
    });
  },

  /**
   * Reload tab
   * @param {string} tabId - Tab ID
   * @param {boolean} ignoreCache - Force reload without cache
   */
  async reload(tabId, ignoreCache = false) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('reload', [tabId, ignoreCache], {
      timeout: 3000,
      retries: 1
    });
  },

  /**
   * Stop loading
   * @param {string} tabId - Tab ID
   */
  async stop(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('stop', [tabId], {
      timeout: 1000,
      retries: 1
    });
  }
};

// ============================================
// Privacy Operations
// ============================================

export const PrivacyOps = {
  /**
   * Get current privacy settings
   */
  async getSettings() {
    return resilientCall('getPrivacySettings', [], {
      timeout: 3000,
      fallback: {
        torEnabled: false,
        blockTrackers: true,
        blockFingerprinting: true,
        blockThirdPartyCookies: true,
        blockWebRTC: false,
        spoofUserAgent: true,
        doNotTrack: true,
        httpsUpgrade: true,
        clearOnExit: false
      }
    });
  },

  /**
   * Update privacy settings
   * @param {object} settings - Settings to update
   */
  async updateSettings(settings) {
    return resilientCall('updatePrivacySettings', [settings], {
      timeout: 5000,
      retries: 2
    });
  },

  /**
   * Toggle Tor
   * @param {boolean} enabled - Enable/disable
   */
  async toggleTor(enabled) {
    return resilientCall('toggleTor', [enabled], {
      timeout: 10000, // Tor can take time
      retries: 2,
      critical: true
    });
  },

  /**
   * Clear browsing data
   * @param {object} options - What to clear
   */
  async clearBrowsingData(options = {}) {
    const defaults = {
      cache: true,
      cookies: true,
      history: true,
      localStorage: false,
      passwords: false
    };
    return resilientCall('clearBrowsingData', [{ ...defaults, ...options }], {
      timeout: 30000,
      retries: 1
    });
  }
};

// ============================================
// Bookmark Operations
// ============================================

export const BookmarkOps = {
  /**
   * Add a bookmark
   * @param {object} bookmark - Bookmark data
   */
  async add(bookmark) {
    const sanitized = {
      title: sanitizeInput(bookmark.title, 'html'),
      url: bookmark.url,
      folder: bookmark.folder || null
    };
    return resilientCall('addBookmark', [sanitized], {
      timeout: 3000,
      retries: 2
    });
  },

  /**
   * Remove a bookmark
   * @param {string} url - Bookmark URL
   */
  async remove(url) {
    return resilientCall('removeBookmark', [url], {
      timeout: 3000,
      retries: 1
    });
  },

  /**
   * Get all bookmarks
   */
  async getAll() {
    return resilientCall('getBookmarks', [], {
      timeout: 5000,
      fallback: []
    });
  },

  /**
   * Check if URL is bookmarked
   * @param {string} url - URL to check
   */
  async isBookmarked(url) {
    return resilientCall('isBookmarked', [url], {
      timeout: 2000,
      fallback: false
    });
  }
};

// ============================================
// Session Operations
// ============================================

export const SessionOps = {
  /**
   * Get last session for restore
   */
  async getLastSession() {
    return resilientCall('getLastSession', [], {
      timeout: 5000,
      fallback: []
    });
  },

  /**
   * Restore previous session
   */
  async restore() {
    return resilientCall('restoreSession', [], {
      timeout: 10000,
      retries: 2
    });
  },

  /**
   * Save current session
   */
  async save() {
    return resilientCall('saveSession', [], {
      timeout: 5000,
      retries: 2
    });
  }
};

// ============================================
// Window Operations
// ============================================

export const WindowOps = {
  /**
   * Minimize window
   */
  async minimize() {
    return resilientCall('minimize', [], {
      timeout: 1000,
      skipCircuitBreaker: true
    });
  },

  /**
   * Maximize/restore window
   */
  async maximize() {
    return resilientCall('maximize', [], {
      timeout: 1000,
      skipCircuitBreaker: true
    });
  },

  /**
   * Close window
   */
  async close() {
    return resilientCall('close', [], {
      timeout: 1000,
      skipCircuitBreaker: true
    });
  },

  /**
   * Toggle fullscreen
   */
  async toggleFullscreen() {
    return resilientCall('toggleFullscreen', [], {
      timeout: 1000,
      skipCircuitBreaker: true
    });
  },

  /**
   * Set zoom level
   * @param {number} level - Zoom level (-3 to 3)
   */
  async setZoom(level) {
    const clamped = Math.max(-3, Math.min(3, level));
    return resilientCall('setZoom', [clamped], {
      timeout: 1000
    });
  },

  /**
   * Get platform info
   */
  async getPlatformInfo() {
    return resilientCall('getPlatformInfo', [], {
      timeout: 2000,
      fallback: {
        isWindows: navigator.userAgent.includes('Windows'),
        isMac: navigator.userAgent.includes('Mac'),
        isLinux: navigator.userAgent.includes('Linux'),
        arch: 'unknown',
        version: 'unknown'
      }
    });
  }
};

// ============================================
// Panel Operations
// ============================================

export const PanelOps = {
  /**
   * Toggle side panel
   * @param {boolean} open - Open/close
   * @param {number} width - Panel width
   */
  async toggle(open, width = 340) {
    return resilientCall('panelToggle', [open, width], {
      timeout: 1000,
      skipCircuitBreaker: true
    });
  }
};

// ============================================
// OSINT Operations
// ============================================

export const OSINTOps = {
  /**
   * Perform phone number lookup
   * @param {string} phoneNumber - Phone number to lookup
   * @param {string} countryCode - Country code (e.g., 'US')
   */
  async phoneLookup(phoneNumber, countryCode = 'US') {
    if (!validators.phoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    if (!validators.countryCode(countryCode)) {
      throw new Error('Invalid country code');
    }

    return resilientCall('phoneLookup', [phoneNumber, countryCode], {
      timeout: 30000, // OSINT lookups can be slow
      retries: 2
    });
  },

  /**
   * Get phone intel data
   * @param {string} phoneNumber - Phone number
   */
  async getPhoneIntel(phoneNumber) {
    if (!validators.phoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    return resilientCall('getPhoneIntel', [phoneNumber], {
      timeout: 30000,
      retries: 2,
      fallback: null
    });
  }
};

// ============================================
// Screenshot Operations
// ============================================

export const ScreenshotOps = {
  /**
   * Capture visible page
   * @param {string} tabId - Tab ID
   */
  async capturePage(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('captureScreenshot', [tabId], {
      timeout: 10000,
      retries: 1
    });
  },

  /**
   * Capture full page
   * @param {string} tabId - Tab ID
   */
  async captureFullPage(tabId) {
    if (!validators.tabId(tabId)) {
      throw new Error('Invalid tab ID');
    }
    return resilientCall('captureFullPageScreenshot', [tabId], {
      timeout: 30000,
      retries: 1
    });
  }
};

// ============================================
// Download Operations
// ============================================

export const DownloadOps = {
  /**
   * Start a download
   * @param {string} url - URL to download
   * @param {string} filename - Optional filename
   */
  async start(url, filename = null) {
    return resilientCall('startDownload', [url, filename], {
      timeout: 5000,
      retries: 1
    });
  },

  /**
   * Pause a download
   * @param {string} downloadId - Download ID
   */
  async pause(downloadId) {
    return resilientCall('pauseDownload', [downloadId], {
      timeout: 2000
    });
  },

  /**
   * Resume a download
   * @param {string} downloadId - Download ID
   */
  async resume(downloadId) {
    return resilientCall('resumeDownload', [downloadId], {
      timeout: 2000
    });
  },

  /**
   * Cancel a download
   * @param {string} downloadId - Download ID
   */
  async cancel(downloadId) {
    return resilientCall('cancelDownload', [downloadId], {
      timeout: 2000
    });
  },

  /**
   * Open downloads folder
   */
  async openFolder() {
    return resilientCall('openDownloadsFolder', [], {
      timeout: 2000,
      skipCircuitBreaker: true
    });
  }
};

// ============================================
// Event Listeners
// ============================================

const eventListeners = new Map();

/**
 * Register event listener with the main process
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 */
export function on(event, callback) {
  if (!window.sandiego?.on) {
    logger.warn('Event registration not available', { event });
    return () => {};
  }

  // Track listeners for cleanup
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(callback);

  // Wrap callback with error handling
  const wrappedCallback = (...args) => {
    try {
      callback(...args);
    } catch (error) {
      logger.error('Event handler error', { event, error: error.message });
    }
  };

  window.sandiego.on(event, wrappedCallback);

  // Return unsubscribe function
  return () => {
    eventListeners.get(event)?.delete(callback);
    // Note: Actual unsubscribe would need sandiego.off support
  };
}

/**
 * Register specific tab event listeners
 */
export const TabEvents = {
  onLoading: (cb) => window.sandiego?.onTabLoading?.(cb),
  onNavigated: (cb) => window.sandiego?.onTabNavigated?.(cb),
  onTitleUpdated: (cb) => window.sandiego?.onTabTitleUpdated?.(cb),
  onFaviconUpdated: (cb) => window.sandiego?.onTabFaviconUpdated?.(cb),
  onActivated: (cb) => window.sandiego?.onTabActivated?.(cb),
  onCreated: (cb) => window.sandiego?.onTabCreated?.(cb),
  onError: (cb) => window.sandiego?.onTabError?.(cb)
};

export const PrivacyEvents = {
  onUpdated: (cb) => window.sandiego?.onPrivacyUpdated?.(cb)
};

export const NotificationEvents = {
  onNotification: (cb) => window.sandiego?.onNotification?.(cb)
};

// ============================================
// Cleanup
// ============================================

export function cleanup() {
  eventListeners.clear();
  statusListeners.clear();
  ipcCircuitBreaker.reset();
  logger.info('IPC cleanup complete');
}

// ============================================
// Health Check
// ============================================

export async function healthCheck() {
  const startTime = Date.now();

  try {
    await resilientCall('ping', [], {
      timeout: 2000,
      retries: 1,
      skipCircuitBreaker: true,
      fallback: 'pong'
    });

    return {
      healthy: true,
      latency: Date.now() - startTime,
      status: ipcStatus,
      circuitState: ipcCircuitBreaker.getState()
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      status: ipcStatus,
      error: error.message,
      circuitState: ipcCircuitBreaker.getState()
    };
  }
}

// ============================================
// Export unified API
// ============================================

export default {
  tab: TabOps,
  privacy: PrivacyOps,
  bookmark: BookmarkOps,
  session: SessionOps,
  window: WindowOps,
  panel: PanelOps,
  osint: OSINTOps,
  screenshot: ScreenshotOps,
  download: DownloadOps,
  on,
  events: {
    tab: TabEvents,
    privacy: PrivacyEvents,
    notification: NotificationEvents
  },
  getStatus: getIPCStatus,
  onStatusChange: onIPCStatusChange,
  healthCheck,
  cleanup
};
