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

let transform = createDefaultTransform();
let stream = process.stdout;
let muted = {};
let muted_all = null;

transform.pipe(stream);

function write(ns, topic, msg, data, error) {
  const mutes = muted[ns];
  if (mutes && (!mutes.length || mutes.indexOf(topic) !== -1)) {
    return;
  }
  if (muted_all && muted_all.indexOf(topic) !== -1) {
    return;
  }
  const entry = { ts: Date.now(), ns, topic, msg };
  if (data) {
    if (data instanceof Error) {
      entry.stack = data.stack;
    } else {
      entry.data = data;
      if (error) {
        entry.stack = error.stack;
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
  return new Logger(ns);
}

logger.out = function (out_stream) {
  transform.unpipe(stream);
  stream = out_stream;
  transform.pipe(stream);
};

logger.transform = function (transform_stream) {
  transform.unpipe(stream);
  transform = transform_stream;
  transform.pipe(stream);
};

logger.mute = function (ns, ...topics) {
  muted[ns] = topics;
};

logger.muteAll = function (...topics) {
  muted_all = topics;
};

logger.reset = function () {
  transform.unpipe(stream);
  transform = createDefaultTransform();
  stream = process.stdout;
  muted = {};
  muted_all = null;
  transform.pipe(stream);
};

module.exports = logger;
