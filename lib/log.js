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
    filter: null,
    filters: {},
    transform: null,
    stream: null,
    muted: {},
    muted_all: null
  };
}

function write(ns, base_data, topic, msg, data, error) {
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
      entry.data = base_data ? Object.assign({}, base_data, data) : data;
      if (error) {
        entry.stack = error.stack || String(error);
      }
    }
  } else if (base_data) {
    entry.data = base_data;
  }
  (state.filters[ns] || state.filter || state.transform).write(entry);
}

function rewire() {
  if (state.transform) {
    if (state.filter) {
      state.filter.unpipe().pipe(state.transform);
    }
    Object.keys(state.filters).forEach((ns) => {
      state.filters[ns].unpipe().pipe(state.filter || state.transform);
    });
  }
}

function filter(ns, filter_stream) {
  if (typeof ns === 'string') {
    state.filters[ns] = filter_stream;
  } else {
    state.filter = ns;
  }
  rewire();
  return this;
}

function mute(ns) {
  state.muted[ns] = Array.prototype.slice.call(arguments, 1);
  return this;
}

function log(topic) {
  return function (message, data, error) {
    if (state.stream) {
      write(this.ns, this.data, topic, message, data, error);
    }
  };
}

function errorHandler() {
  let writing = false;
  return (err) => {
    if (writing) {
      return; // Prevent recursive failures
    }
    writing = true;
    write('logger', null, 'error', 'Transform failed', err);
    writing = false;
  };
}

function setTransform(transform) {
  transform.on('error', errorHandler());
  state.transform = transform;
  rewire();
}

class Logger {

  constructor(ns) {
    this.ns = ns;
  }

  filter(filter_stream) {
    filter(this.ns, filter_stream);
  }

  mute() {
    mute(this.ns);
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

module.exports = Object.assign((ns, data = null) => {
  const log = state.loggers[ns] || (state.loggers[ns] = new Logger(ns));
  log.data = data;
  return log;
}, {

  out(out_stream) {
    if (state.transform) {
      state.transform.unpipe(state.stream);
    }
    state.stream = out_stream;
    if (out_stream) {
      if (!state.transform) {
        setTransform(createDefaultTransform());
      }
      state.transform.pipe(state.stream);
    }
    return this;
  },

  transform(transform_stream) {
    if (state.transform) {
      state.transform.unpipe(state.stream);
    }
    setTransform(transform_stream);
    if (state.stream) {
      state.transform.pipe(state.stream);
    }
    return this;
  },

  filter,

  mute,

  muteAll() {
    state.muted_all = Array.prototype.slice.call(arguments);
    return this;
  },

  hasStream() {
    return Boolean(state.stream);
  },

  reset() {
    Object.keys(state.filters).forEach((ns) => {
      state.filters[ns].unpipe();
    });
    if (state.filter) {
      state.filter.unpipe();
      state.filter = null;
    }
    if (state.transform) {
      state.transform.unpipe();
      state.transform = null;
    }
    state.filter = null;
    state.filters = {};
    state.stream = null;
    state.muted = {};
    state.muted_all = null;
  }

});
