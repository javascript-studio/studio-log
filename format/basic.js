/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const { Transform } = require('stream');
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

module.exports = function ({
  ts = true,
  topic = true,
  ns = true,
  data = true,
  stack = 'peek'
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
      if (entry.msg) {
        parts.push(entry.msg);
      }
      if (data && entry.data) {
        for (const key in entry.data) {
          if (entry.data.hasOwnProperty(key)) {
            const value = entry.data[key];
            const [k, v, unit] = value_format(key, value, JSON.stringify);
            parts.push(k ? `${k}=${v}${unit}` : `${v}${unit}`);
          }
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
