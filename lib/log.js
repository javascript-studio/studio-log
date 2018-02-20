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

function addError(entry, error) {
  const cause = error.cause;
  const cause_code = cause && cause.code;
  if (error.code || cause_code) {
    entry.data = entry.data ? Object.assign({}, entry.data) : {};
    entry.data.code = error.code;
    if (cause_code) {
      entry.data.cause = { code: cause_code };
    }
  }
  entry.stack = error.stack || String(error);
  if (cause) {
    entry.cause = cause.stack || String(cause);
  }
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

  filter(ns, filter_stream) {
    if (typeof ns === 'string') {
      filter(`${this.ns} ${ns}`, filter_stream);
    } else {
      filter(this.ns, ns);
    }
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

module.exports = Object.assign((ns, data) => {
  const log = state.loggers[ns] || (state.loggers[ns] = new Logger(ns));
  log.data = data || null;
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
