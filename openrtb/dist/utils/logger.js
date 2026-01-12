/**
 * Mixpeek OpenRTB Connector - Logger Utility
 *
 * Structured logging with performance timing support.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '[Mixpeek-OpenRTB]';
    this.level = options.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    this.enabled = options.enabled !== false;
    this.timers = new Map();
  }

  setLevel(level) {
    if (typeof level === 'string') {
      this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
    } else {
      this.level = level;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  _log(level, levelName, ...args) {
    if (!this.enabled || level < this.level) return;

    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    );

    const message = `${timestamp} ${this.prefix} [${levelName}]`;

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(message, ...formattedArgs);
        break;
      case LOG_LEVELS.WARN:
        console.warn(message, ...formattedArgs);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(message, ...formattedArgs);
        break;
      default:
        console.log(message, ...formattedArgs);
    }
  }

  debug(...args) {
    this._log(LOG_LEVELS.DEBUG, 'DEBUG', ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.INFO, 'INFO', ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.WARN, 'WARN', ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.ERROR, 'ERROR', ...args);
  }

  /**
   * Start a timer for performance measurement
   * @param {string} label - Timer label
   */
  time(label) {
    this.timers.set(label, performance.now ? performance.now() : Date.now());
  }

  /**
   * End a timer and log the elapsed time
   * @param {string} label - Timer label
   * @returns {number} Elapsed time in milliseconds
   */
  timeEnd(label) {
    const start = this.timers.get(label);
    if (!start) {
      this.warn(`Timer '${label}' does not exist`);
      return 0;
    }

    const end = performance.now ? performance.now() : Date.now();
    const elapsed = end - start;
    this.timers.delete(label);

    this.debug(`${label}: ${elapsed.toFixed(2)}ms`);
    return elapsed;
  }

  /**
   * Get elapsed time without logging
   * @param {string} label - Timer label
   * @returns {number} Elapsed time in milliseconds
   */
  getElapsed(label) {
    const start = this.timers.get(label);
    if (!start) return 0;

    const end = performance.now ? performance.now() : Date.now();
    return end - start;
  }

  /**
   * Create a child logger with a sub-prefix
   * @param {string} subPrefix - Additional prefix
   * @returns {Logger} Child logger instance
   */
  child(subPrefix) {
    return new Logger({
      prefix: `${this.prefix}[${subPrefix}]`,
      debug: this.level === LOG_LEVELS.DEBUG,
      enabled: this.enabled
    });
  }
}

// Singleton instance
let defaultLogger = null;

/**
 * Get or create the default logger instance
 * @param {Object} options - Logger options
 * @returns {Logger} Logger instance
 */
export function getLogger(options = {}) {
  if (!defaultLogger) {
    defaultLogger = new Logger(options);
  } else if (Object.keys(options).length > 0) {
    // Update existing logger with new options
    if (options.debug !== undefined) {
      defaultLogger.setLevel(options.debug ? 'DEBUG' : 'INFO');
    }
    if (options.enabled !== undefined) {
      defaultLogger.setEnabled(options.enabled);
    }
  }
  return defaultLogger;
}

/**
 * Create a new logger instance
 * @param {Object} options - Logger options
 * @returns {Logger} New logger instance
 */
export function createLogger(options = {}) {
  return new Logger(options);
}

export { Logger, LOG_LEVELS };
export default { getLogger, createLogger, Logger, LOG_LEVELS };
