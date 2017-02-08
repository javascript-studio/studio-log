/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const { Transform } = require('stream');
const topics = require('../lib/topics');
const value_format = require('../lib/value-format');

module.exports = function ({
  ts = true,
  topic = true,
  ns = true,
  data = true,
  stack = true
} = {}) {
  return new Transform({
    writableObjectMode: true,

    transform(entry, enc, callback) {
      const parts = [];
      if (ts) {
        parts.push(new Date(entry.ts).toISOString());
      }
      if (topic) {
        parts.push(topics[entry.topic]);
      }
      if (ns) {
        parts.push(`[${entry.ns}]`);
      }
      parts.push(entry.msg);
      if (data && entry.data) {
        for (const key in entry.data) {
          if (entry.data.hasOwnProperty(key)) {
            parts.push(value_format(key, entry.data[key]));
          }
        }
      }
      if (stack && entry.stack) {
        parts.push(entry.stack);
      }
      const str = parts.join(' ');
      callback(null, `${str}\n`);
    }

  });
};
