/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const topics = require('@studio/log-topics');

/**
 * @typedef {import('stream').Writable} Writable
 */

/**
 * @typedef {undefined | null | boolean | number | string | LogArray | LogData} LogValue
 * @typedef {LogValue[]} LogArray
 * @typedef {{ [k: string]: LogValue }} LogData
 */

/**
 * @typedef {Object} LogErrorProps
 * @property {string} [code]
 * @property {Error | LogError} [cause]
 */
/**
 * @typedef {Error & LogErrorProps} LogError
 */

/**
 * @typedef {Object} LogEntry
 * @property {number} ts
 * @property {string} ns
 * @property {string} topic
 * @property {string} [msg]
 * @property {LogData} [data]
 * @property {string} [stack]
 * @property {string} [cause]
 */

// Make it work with local symlinks:
let state = global['@studio/log.2'];
if (!state) {
  state = global['@studio/log.2'] = {
    loggers: {},
    stream: null
  };
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isCauseProperty(key) {
  return key !== 'name' && key !== 'message' && key !== 'stack';
}

/**
 * @param {string | Error | LogError} error
 * @returns {string}
 */
function stack(error) {
  if (typeof error === 'string') {
    return error;
  }
  const msg = error.name && error.message
    ? `${error.name}: ${error.message}`
    : error.message || error.name || String(error);
  if (msg.startsWith('[object ')) {
    return error.stack || '';
  }
  const s = error.stack;
  return !s ? msg : s.indexOf(msg) >= 0 ? s : `${msg}\n${s}`;
}

/**
 * @param {LogEntry} entry
 * @param {LogError} error
 */
function addError(entry, error) {
  const cause = error.cause;
  const cause_props = typeof cause === 'object'
    ? Object.keys(cause).filter(isCauseProperty)
    : [];
  if (error.code || cause_props.length) {
    entry.data = entry.data ? Object.assign({}, entry.data) : {};
    entry.data.code = error.code;
    if (cause && cause_props.length) {
      entry.data.cause = cause_props.reduce((o, k) => {
        o[k] = cause[k];
        return o;
      }, {});
    }
  }
  entry.stack = stack(error);
  if (cause) {
    entry.cause = stack(cause);
  }
}

/**
 * @param {LogData} err
 * @returns {err is LogError}
 */
function errorLike(err) {
  if (typeof err !== 'object') {
    return false;
  }
  if (typeof err.stack === 'string') {
    return true;
  }
  return err.toString !== Object.prototype.toString
    && typeof err.name === 'string'
    && typeof err.message === 'string';
}

/**
 * @param {string} ns
 * @param {LogData | null} base_data
 * @param {string} topic
 * @param {unknown} [msg]
 * @param {unknown} [data]
 * @param {unknown} [error]
 */
function write(ns, base_data, topic, msg, data, error) {
  const entry = { ts: Date.now(), ns, topic };
  if (typeof msg === 'string') {
    entry.msg = msg;
  } else {
    error = data;
    data = msg;
  }
  if (data) {
    if (errorLike(/** @type {LogData} */ (data))) {
      if (base_data) {
        entry.data = Object.assign({}, base_data);
      }
      addError(entry, data);
    } else {
      entry.data = base_data ? Object.assign({}, base_data, data) : data;
      if (error) {
        addError(entry, /** @type {LogError} */ (error));
      }
    }
  } else if (base_data) {
    entry.data = base_data;
  }
  state.stream.write(entry);
}

/**
 * @typedef {(function(): void) & (function(unknown): void) & (function(string | LogData, unknown): void) & (function(string, LogData, unknown): void)} LogTopic
 */

/**
 * @param {string} topic
 * @returns {LogTopic}
 */
function log(topic) {
  /**
   * @param {unknown} [msg]
   * @param {unknown} [data]
   * @param {unknown} [error]
   * @this {LoggerBase}
   */
  return function (msg, data, error) {
    if (state.stream) {
      write(this.ns, this.data, topic, msg, data, error);
    }
  };
}

class LoggerBase {
  /**
   * @param {string} ns
   */
  constructor(ns) {
    /** @type {string} */
    this.ns = ns;
    /** @type {LogData | null} */
    this.data = null;
  }

  /**
   * @param {string} ns
   * @param {LogData} [data]
   * @returns {Logger}
   */
  child(ns, data) {
    if (this.data) {
      data = data ? Object.assign({}, this.data, data) : this.data;
    }
    return module.exports(`${this.ns} ${ns}`, data);
  }
}

/**
 * @typedef {Object} LoggerAPI
 * @property {LogTopic} ok
 * @property {LogTopic} warn
 * @property {LogTopic} error
 * @property {LogTopic} issue
 * @property {LogTopic} ignore
 * @property {LogTopic} input
 * @property {LogTopic} output
 * @property {LogTopic} send
 * @property {LogTopic} receive
 * @property {LogTopic} fetch
 * @property {LogTopic} finish
 * @property {LogTopic} launch
 * @property {LogTopic} terminate
 * @property {LogTopic} spawn
 * @property {LogTopic} broadcast
 * @property {LogTopic} disk
 * @property {LogTopic} timing
 * @property {LogTopic} money
 * @property {LogTopic} numbers
 * @property {LogTopic} wtf
 */

for (const topic of Object.keys(topics)) {
  LoggerBase.prototype[topic] = log(topic);
}

/**
 * @typedef {LoggerBase & LoggerAPI} Logger
 */

/**
 * @param {string} ns
 * @param {LogData} [data]
 * @returns {Logger}
 */
function logger(ns, data) {
  const l = state.loggers[ns] || (state.loggers[ns] = new LoggerBase(ns));
  l.data = data || null;
  return l;
}
logger.pipe = pipe;
logger.hasStream = hasStream;
logger.reset = reset;
logger.stack = stack;

/**
 * @param {Writable} stream
 * @returns {Writable}
 */
function pipe(stream) {
  state.stream = stream;
  return stream;
}

/**
 * @returns {boolean}
 */
function hasStream() {
  return Boolean(state.stream);
}

function reset() {
  state.loggers = {};
  state.stream = null;
}

module.exports = logger;
