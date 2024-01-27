/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const topics = require('@studio/log-topics');

// Make it work with local symlinks:
let state = global['@studio/log.2'];
if (!state) {
  state = global['@studio/log.2'] = {
    loggers: {},
    stream: null
  };
}

function isCauseProperty(key) {
  return key !== 'name' && key !== 'message' && key !== 'stack';
}

function addError(entry, error) {
  const cause = error.cause;
  const cause_props = typeof cause === 'object'
    ? Object.keys(cause).filter(isCauseProperty)
    : [];
  if (error.code || cause_props.length) {
    entry.data = entry.data ? Object.assign({}, entry.data) : {};
    entry.data.code = error.code;
    if (cause_props.length) {
      entry.data.cause = cause_props.reduce((o, k) => {
        o[k] = cause[k];
        return o;
      }, {});
    }
  }
  entry.stack = error.stack || String(error);
  if (cause) {
    entry.cause = cause.stack || String(cause);
  }
}

function errorLike(err) {
  if (typeof err.stack === 'string') {
    return true;
  }
  return typeof err === 'object'
    && err.toString !== Object.prototype.toString
    && typeof err.name === 'string'
    && typeof err.message === 'string';
}

function write(ns, base_data, topic, msg, data, error) {
  const entry = { ts: Date.now(), ns, topic };
  if (typeof msg === 'string') {
    entry.msg = msg;
  } else {
    error = data;
    data = msg;
  }
  if (data) {
    if (errorLike(data)) {
      addError(entry, data);
    } else {
      entry.data = base_data ? Object.assign({}, base_data, data) : data;
      if (error) {
        addError(entry, error);
      }
    }
  } else if (base_data) {
    entry.data = base_data;
  }
  state.stream.write(entry);
}

function log(topic) {
  return function (message, data, error) {
    if (state.stream) {
      write(this.ns, this.data, topic, message, data, error);
    }
  };
}

class Logger {
  constructor(ns) {
    this.ns = ns;
  }

  child(ns, data) {
    if (this.data) {
      data = data ? Object.assign({}, this.data, data) : this.data;
    }
    return module.exports(`${this.ns} ${ns}`, data);
  }
}

Object.keys(topics).forEach((topic) => {
  Logger.prototype[topic] = log(topic);
});

module.exports = Object.assign((ns, data) => {
  const logger = state.loggers[ns] || (state.loggers[ns] = new Logger(ns));
  logger.data = data || null;
  return logger;
}, {
  pipe(stream) {
    state.stream = stream;
    return stream;
  },

  hasStream() {
    return Boolean(state.stream);
  },

  reset() {
    state.loggers = {};
    state.stream = null;
  }
});
