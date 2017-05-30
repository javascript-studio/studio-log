/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const topics = require('./topics');

function createDefaultTransform() {
  const StringifyTransform = require('@studio/ndjson/stringify');
  return new StringifyTransform();
}

// Make it work with local symlinks:
let state = global['@studio/log'];
if (!state) {
  state = global['@studio/log'] = {
    loggers: {},
    transform: null,
    stream: null,
    muted: {},
    muted_all: null
  };
}

function write(ns, topic, msg, data, error) {
  const mutes = state.muted[ns];
  if (mutes && (!mutes.length || mutes.indexOf(topic) !== -1)) {
    return;
  }
  if (state.muted_all && state.muted_all.indexOf(topic) !== -1) {
    return;
  }
  const entry = { ts: Date.now(), ns, topic };
  if (typeof msg === 'string') {
    entry.msg = msg;
  } else {
    error = data;
    data = msg;
  }
  if (data) {
    if (data instanceof Error) {
      entry.stack = data.stack;
    } else {
      entry.data = data;
      if (error) {
        entry.stack = error.stack || String(error);
      }
    }
  }
  state.transform.write(entry);
}

function Logger(ns) {
  this.ns = ns;
}

function log(topic) {
  return function (message, data, error) {
    if (state.transform) {
      write(this.ns, topic, message, data, error);
    }
  };
}

Object.keys(topics).forEach((topic) => {
  Logger.prototype[topic] = log(topic);
});

function logger(ns) {
  return state.loggers[ns] || (state.loggers[ns] = new Logger(ns));
}

function errorHandler() {
  let writing = false;
  return (err) => {
    if (writing) {
      return; // Prevent recursive failures
    }
    writing = true;
    write('logger', 'error', 'Transform failed', err);
    writing = false;
  };
}

function setTransform(transform) {
  transform.on('error', errorHandler());
  state.transform = transform;
}

logger.out = function (out_stream) {
  if (state.transform) {
    state.transform.unpipe(state.stream);
  }
  state.stream = out_stream;
  if (state.stream) {
    if (!state.transform) {
      setTransform(createDefaultTransform());
    }
    state.transform.pipe(state.stream);
  }
  return this;
};

logger.transform = function (transform_stream) {
  if (state.transform) {
    state.transform.unpipe(state.stream);
  }
  setTransform(transform_stream);
  if (state.stream) {
    state.transform.pipe(state.stream);
  }
  return this;
};

logger.mute = function (ns) {
  state.muted[ns] = Array.prototype.slice.call(arguments, 1);
  return this;
};

logger.muteAll = function () {
  state.muted_all = Array.prototype.slice.call(arguments);
  return this;
};

logger.hasStream = function () {
  return Boolean(state.stream);
};

logger.reset = function () {
  if (state.transform) {
    state.transform.unpipe(state.stream);
    state.transform = null;
  }
  state.stream = null;
  state.muted = {};
  state.muted_all = null;
};

module.exports = logger;
