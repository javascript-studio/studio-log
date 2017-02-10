/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const { Transform } = require('stream');
const topics = require('./topics');

function createDefaultTransform() {
  return new Transform({
    writableObjectMode: true,

    transform(entry, enc, callback) {
      const str = JSON.stringify(entry);
      callback(null, `${str}\n`);
    }

  });
}

const loggers = {};
let transform = createDefaultTransform();
let stream = null;
let muted = {};
let muted_all = null;

function write(ns, topic, msg, data, error) {
  const mutes = muted[ns];
  if (mutes && (!mutes.length || mutes.indexOf(topic) !== -1)) {
    return;
  }
  if (muted_all && muted_all.indexOf(topic) !== -1) {
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
  transform.write(entry);
}

function Logger(ns) {
  this.ns = ns;
}

function log(topic) {
  return function (message, data, error) {
    write(this.ns, topic, message, data, error);
  };
}

Object.keys(topics).forEach((topic) => {
  Logger.prototype[topic] = log(topic);
});

function logger(ns) {
  return loggers[ns] || (loggers[ns] = new Logger(ns));
}

logger.out = function (out_stream) {
  transform.unpipe(stream);
  stream = out_stream;
  if (stream) {
    transform.pipe(stream);
  }
  return this;
};

logger.transform = function (transform_stream) {
  transform.unpipe(stream);
  transform = transform_stream;
  if (stream) {
    transform.pipe(stream);
  }
  return this;
};

logger.mute = function (ns, ...topics) {
  muted[ns] = topics;
  return this;
};

logger.muteAll = function (...topics) {
  muted_all = topics;
  return this;
};

logger.reset = function () {
  transform.unpipe(stream);
  transform = createDefaultTransform();
  stream = null;
  muted = {};
  muted_all = null;
};

module.exports = logger;
