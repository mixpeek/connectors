/**
 * @mixpeek/huggingface — Logger Utility
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 };

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '[Mixpeek-HuggingFace]';
    this.level = options.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    this.enabled = options.enabled !== false;
    this.timers = new Map();
  }

  setLevel(level) {
    this.level = typeof level === 'string' ? (LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO) : level;
  }
  setEnabled(enabled) { this.enabled = enabled; }

  _log(level, levelName, ...args) {
    if (!this.enabled || level < this.level) return;
    const ts = new Date().toISOString();
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a);
    const msg = `${ts} ${this.prefix} [${levelName}]`;
    if (level === LOG_LEVELS.ERROR) console.error(msg, ...formatted);
    else if (level === LOG_LEVELS.WARN) console.warn(msg, ...formatted);
    else if (level === LOG_LEVELS.DEBUG) console.debug(msg, ...formatted);
    else console.log(msg, ...formatted);
  }

  debug(...args) { this._log(LOG_LEVELS.DEBUG, 'DEBUG', ...args); }
  info(...args) { this._log(LOG_LEVELS.INFO, 'INFO', ...args); }
  warn(...args) { this._log(LOG_LEVELS.WARN, 'WARN', ...args); }
  error(...args) { this._log(LOG_LEVELS.ERROR, 'ERROR', ...args); }

  time(label) { this.timers.set(label, performance.now ? performance.now() : Date.now()); }
  timeEnd(label) {
    const start = this.timers.get(label);
    if (!start) return 0;
    const elapsed = (performance.now ? performance.now() : Date.now()) - start;
    this.timers.delete(label);
    this.debug(`${label}: ${elapsed.toFixed(2)}ms`);
    return elapsed;
  }

  child(subPrefix) {
    return new Logger({ prefix: `${this.prefix}[${subPrefix}]`, debug: this.level === LOG_LEVELS.DEBUG, enabled: this.enabled });
  }
}

let defaultLogger = null;
export function getLogger(options = {}) {
  if (!defaultLogger) { defaultLogger = new Logger(options); }
  else if (Object.keys(options).length > 0) {
    if (options.debug !== undefined) defaultLogger.setLevel(options.debug ? 'DEBUG' : 'INFO');
    if (options.enabled !== undefined) defaultLogger.setEnabled(options.enabled);
  }
  return defaultLogger;
}

export function createLogger(options = {}) { return new Logger(options); }
export { Logger, LOG_LEVELS };
export default { getLogger, createLogger, Logger, LOG_LEVELS };
