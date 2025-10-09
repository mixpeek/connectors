/**
 * Mixpeek Context Adapter - Logger Utility
 * @module utils/logger
 */

import { MIXPEEK_MODULE_NAME } from '../config/constants.js'

class Logger {
  constructor() {
    this.debug = false
    this.prefix = `[${MIXPEEK_MODULE_NAME}]`
  }

  setDebug(enabled) {
    this.debug = enabled
  }

  info(...args) {
    if (this.debug) {
      console.log(this.prefix, ...args)
    }
  }

  warn(...args) {
    console.warn(this.prefix, ...args)
  }

  error(...args) {
    console.error(this.prefix, ...args)
  }

  group(label) {
    if (this.debug && console.group) {
      console.group(`${this.prefix} ${label}`)
    }
  }

  groupEnd() {
    if (this.debug && console.groupEnd) {
      console.groupEnd()
    }
  }

  time(label) {
    if (this.debug && console.time) {
      console.time(`${this.prefix} ${label}`)
    }
  }

  timeEnd(label) {
    if (this.debug && console.timeEnd) {
      console.timeEnd(`${this.prefix} ${label}`)
    }
  }

  table(data) {
    if (this.debug && console.table) {
      console.table(data)
    }
  }
}

export default new Logger()

