/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;
const topics = require('../lib/topics');
const value_format = require('../lib/value-format');

function formatStack(style, stack) {
  if (style === true || style === 'full') {
    return stack;
  }
  const p1 = stack.indexOf('\n');
  const first_line = p1 === -1 ? stack : stack.substring(0, p1);
  if (style === 'message' || p1 === -1) {
    return first_line;
  }
  const p2 = stack.indexOf('\n', p1 + 1);
  const peek = p2 === -1
    ? stack.substring(p1 + 1)
    : stack.substring(p1 + 1, p2);
  return `${first_line} ${peek.trim()}`;
}

module.exports = function (opts) {
  opts = opts || {};
  const ts = opts.ts !== false;
  const topic = opts.topic !== false;
  const ns = opts.ns !== false;
  const data = opts.data !== false;
  const stack = opts.hasOwnProperty('stack') ? opts.stack : 'peek';
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
      if (entry.msg) {
        parts.push(entry.msg);
      }
      if (data && entry.data) {
        if (typeof entry.data === 'object') {
          for (const key in entry.data) {
            if (entry.data.hasOwnProperty(key)) {
              const value = entry.data[key];
              const kvu = value_format(key, value, JSON.stringify);
              const k = kvu[0];
              const v = kvu[1];
              const unit = kvu[2];
              parts.push(k ? `${k}=${v}${unit}` : `${v}${unit}`);
            }
          }
        } else {
          parts.push(JSON.stringify(entry.data));
        }
      }
      if (stack && entry.stack) {
        parts.push(formatStack(stack, entry.stack));
      }
      const str = parts.join(' ');
      callback(null, `${str}\n`);
    }

  });
};
