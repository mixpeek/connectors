/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Logger
 *
 * Configurable logging utility with debug levels.
 */

export const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

class Logger {
  constructor(config = {}) {
    this.debug = config.debug || false;
    this.level = this.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    this.prefix = config.prefix || '[Mixpeek IAB-AP]';
    this.timers = new Map();
  }

  setLevel(level) {
    this.level = level;
  }

  formatMessage(level, ...args) {
    const timestamp = new Date().toISOString();
    return [`${timestamp} ${this.prefix} [${level}]`, ...args];
  }

  error(...args) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(...this.formatMessage('ERROR', ...args));
    }
  }

  warn(...args) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(...this.formatMessage('WARN', ...args));
    }
  }

  info(...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(...this.formatMessage('INFO', ...args));
    }
  }

  log(...args) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(...this.formatMessage('DEBUG', ...args));
    }
  }

  time(label) {
    this.timers.set(label, Date.now());
  }

  timeEnd(label) {
    const start = this.timers.get(label);
    if (start) {
      const elapsed = Date.now() - start;
      this.timers.delete(label);
      if (this.level >= LOG_LEVELS.DEBUG) {
        console.log(...this.formatMessage('DEBUG', `${label}: ${elapsed}ms`));
      }
      return elapsed;
    }
    return 0;
  }

  group(label) {
    if (this.level >= LOG_LEVELS.DEBUG && typeof console.group === 'function') {
      console.group(this.prefix + ' ' + label);
    }
  }

  groupEnd() {
    if (this.level >= LOG_LEVELS.DEBUG && typeof console.groupEnd === 'function') {
      console.groupEnd();
    }
  }
}

// Singleton instance
let loggerInstance = null;

export function getLogger(config = {}) {
  if (!loggerInstance || config.debug !== undefined) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

export function createLogger(config = {}) {
  return new Logger(config);
}

export { Logger };
export default { getLogger, createLogger, Logger, LOG_LEVELS };
