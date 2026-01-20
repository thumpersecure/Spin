/**
 * CONSTANTINE Browser - Production Resilience Utilities
 * Error handling, retry logic, circuit breakers, and monitoring
 */

// ============================================
// Logger - Structured logging for production
// ============================================

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS.info;

class Logger {
  constructor(namespace) {
    this.namespace = namespace;
    this.buffer = [];
    this.maxBufferSize = 1000;
  }

  _log(level, message, data = {}) {
    if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      namespace: this.namespace,
      message,
      data,
      sessionId: window.__CONSTANTINE_SESSION_ID__
    };

    // Buffer for potential export
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Console output with styling
    const styles = {
      debug: 'color: #888',
      info: 'color: #00CED1',
      warn: 'color: #E65C00',
      error: 'color: #8B0000; font-weight: bold'
    };

    console[level](
      `%c[${this.namespace}] ${message}`,
      styles[level],
      Object.keys(data).length ? data : ''
    );
  }

  debug(message, data) { this._log('debug', message, data); }
  info(message, data) { this._log('info', message, data); }
  warn(message, data) { this._log('warn', message, data); }
  error(message, data) { this._log('error', message, data); }

  // Export logs for debugging
  exportLogs() {
    return JSON.stringify(this.buffer, null, 2);
  }

  clearBuffer() {
    this.buffer = [];
  }
}

// Create namespaced loggers
export const createLogger = (namespace) => new Logger(namespace);
export const appLogger = createLogger('App');
export const ipcLogger = createLogger('IPC');
export const storeLogger = createLogger('Store');

// ============================================
// Retry with Exponential Backoff
// ============================================

export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
    onRetry = () => {},
    logger = ipcLogger
  } = options;

  let lastError;
  let delay = baseDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        logger.error(`Failed after ${attempt} attempts`, { error: error.message });
        throw error;
      }

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error.message,
        nextAttempt: attempt + 1
      });

      onRetry(attempt, delay, error);

      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Circuit Breaker
// ============================================

const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 1;
    this.logger = options.logger || createLogger('CircuitBreaker');

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }

  async execute(fn) {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
        this.logger.info('Circuit half-open, testing...');
      } else {
        throw new CircuitBreakerError('Circuit breaker is open');
      }
    }

    if (this.state === CircuitState.HALF_OPEN && this.halfOpenCalls >= this.halfOpenMaxCalls) {
      throw new CircuitBreakerError('Circuit breaker is half-open, max calls reached');
    }

    try {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCalls++;
      }

      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.logger.info('Circuit closed after successful call');
    }
    this.failureCount = 0;
    this.successCount++;
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger.warn('Circuit opened due to failures', {
        failures: this.failureCount,
        threshold: this.failureThreshold
      });
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.lastFailureTime = null;
  }
}

export class CircuitBreakerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// ============================================
// IPC Wrapper with Resilience
// ============================================

const ipcCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  logger: ipcLogger
});

export async function resilientIPC(method, ...args) {
  return ipcCircuitBreaker.execute(() =>
    retry(
      () => {
        if (!window.sandiego || typeof window.sandiego[method] !== 'function') {
          throw new Error(`IPC method ${method} not available`);
        }
        return window.sandiego[method](...args);
      },
      {
        maxAttempts: 3,
        baseDelay: 500,
        shouldRetry: (error) => {
          // Don't retry for certain errors
          return !error.message.includes('not available') &&
                 !error.message.includes('invalid');
        }
      }
    )
  );
}

// ============================================
// Performance Monitoring
// ============================================

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.logger = createLogger('Performance');
  }

  startTimer(name) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return duration;
    };
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      });
    }

    const metric = this.metrics.get(name);
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);

    // Keep last 100 values for percentile calculations
    metric.values.push(value);
    if (metric.values.length > 100) {
      metric.values.shift();
    }
  }

  getMetrics(name) {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const sorted = [...metric.values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    return {
      count: metric.count,
      avg: metric.total / metric.count,
      min: metric.min,
      max: metric.max,
      p50,
      p95,
      p99
    };
  }

  getAllMetrics() {
    const result = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }

  logSummary() {
    this.logger.info('Performance Summary', this.getAllMetrics());
  }

  reset() {
    this.metrics.clear();
  }
}

export const perfMonitor = new PerformanceMonitor();

// ============================================
// Error Boundary Helper
// ============================================

export function createErrorHandler(componentName, fallbackFn) {
  const logger = createLogger(componentName);

  return (error, errorInfo = {}) => {
    logger.error('Component error', {
      error: error.message,
      stack: error.stack,
      ...errorInfo
    });

    // Report to error tracking (placeholder for services like Sentry)
    if (window.__CONSTANTINE_ERROR_HANDLER__) {
      window.__CONSTANTINE_ERROR_HANDLER__(error, {
        component: componentName,
        ...errorInfo
      });
    }

    if (fallbackFn) {
      try {
        return fallbackFn(error);
      } catch (fallbackError) {
        logger.error('Fallback also failed', { error: fallbackError.message });
      }
    }
  };
}

// ============================================
// Input Validation
// ============================================

export const validators = {
  url: (value) => {
    if (!value || typeof value !== 'string') return false;
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      // Block dangerous protocols
      const blocked = ['javascript:', 'data:', 'file:', 'vbscript:'];
      return !blocked.some(p => url.protocol.startsWith(p.replace(':', '')));
    } catch {
      return false;
    }
  },

  phoneNumber: (value) => {
    if (!value || typeof value !== 'string') return false;
    // Max 30 chars, only digits, spaces, dashes, parens, plus
    return value.length <= 30 && /^[\d\s\-\(\)\+\.]+$/.test(value);
  },

  tabId: (value) => {
    return typeof value === 'string' && value.length > 0 && value.length < 100;
  },

  searchQuery: (value) => {
    if (!value || typeof value !== 'string') return false;
    // Max 2000 chars, no control characters
    return value.length <= 2000 && !/[\x00-\x1f\x7f]/.test(value);
  },

  countryCode: (value) => {
    return typeof value === 'string' && /^[A-Z]{2}$/.test(value);
  }
};

export function sanitizeInput(value, type = 'string') {
  if (value === null || value === undefined) return '';

  const str = String(value);

  switch (type) {
    case 'html':
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    case 'url':
      return encodeURIComponent(str);

    case 'attribute':
      return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    default:
      // Remove null bytes and control characters
      return str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  }
}

// ============================================
// Graceful Degradation
// ============================================

export function withFallback(fn, fallbackValue, logger = appLogger) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.warn('Using fallback due to error', { error: error.message });
      return typeof fallbackValue === 'function'
        ? fallbackValue(error)
        : fallbackValue;
    }
  };
}

// ============================================
// Memory Management
// ============================================

export class MemoryManager {
  constructor(options = {}) {
    this.warningThreshold = options.warningThreshold || 0.8; // 80% of limit
    this.criticalThreshold = options.criticalThreshold || 0.9; // 90% of limit
    this.logger = createLogger('Memory');
    this.listeners = [];
  }

  checkMemory() {
    if (!performance.memory) return null;

    const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usage = usedJSHeapSize / jsHeapSizeLimit;

    if (usage >= this.criticalThreshold) {
      this.logger.error('Critical memory usage', {
        usage: `${(usage * 100).toFixed(1)}%`,
        used: `${(usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`
      });
      this.emit('critical', { usage, usedJSHeapSize, jsHeapSizeLimit });
    } else if (usage >= this.warningThreshold) {
      this.logger.warn('High memory usage', {
        usage: `${(usage * 100).toFixed(1)}%`
      });
      this.emit('warning', { usage, usedJSHeapSize, jsHeapSizeLimit });
    }

    return { usage, usedJSHeapSize, jsHeapSizeLimit };
  }

  onMemoryPressure(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  emit(event, data) {
    this.listeners.forEach(l => {
      try {
        l(event, data);
      } catch (e) {
        this.logger.error('Memory listener error', { error: e.message });
      }
    });
  }

  startMonitoring(intervalMs = 30000) {
    this.intervalId = setInterval(() => this.checkMemory(), intervalMs);
    return () => this.stopMonitoring();
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const memoryManager = new MemoryManager();

// ============================================
// Session Management
// ============================================

// Generate unique session ID
window.__CONSTANTINE_SESSION_ID__ = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Export session info
export function getSessionInfo() {
  return {
    sessionId: window.__CONSTANTINE_SESSION_ID__,
    startTime: window.__CONSTANTINE_START_TIME__ || Date.now(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine
  };
}

window.__CONSTANTINE_START_TIME__ = Date.now();
