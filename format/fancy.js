/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const { Transform } = require('stream');
const chalk = require('chalk');
const topics = require('../lib/topics');
const value_format = require('../lib/value-format');

function stringify(value) {
  if (value === null) {
    return chalk.bold('null');
  }
  const type = typeof value;
  if (type === 'string') {
    return chalk.green(`'${value.replace(/'/g, '\\\'')}'`);
  }
  if (type === 'number' || type === 'boolean') {
    return chalk.yellow(value);
  }
  if (value instanceof Date) {
    return stringify(value.toISOString());
  }
  if (Array.isArray(value)) {
    const values = value.map(stringify).join(chalk.magenta(', '));
    return `${chalk.magenta('[')}${values}${chalk.magenta(']')}`;
  }
  const values = Object.keys(value).map((k) => {
    const v = stringify(value[k]);
    return `${k}${chalk.magenta(':')} ${v}`;
  }).join(chalk.magenta(', '));
  return `${chalk.magenta('{')}${values}${chalk.magenta('}')}`;
}

function formatStack(stack) {
  const p = stack.indexOf('\n');
  const first_line = p === -1 ? stack : stack.substring(0, p);
  const formatted = chalk.bgRed.white.bold(first_line);
  if (p === -1) {
    return formatted;
  }
  const remainder = chalk.gray(stack.substring(p + 1));
  return `${formatted}\n${remainder}`;
}

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
        const date_time = new Date(entry.ts).toLocaleString();
        const time = date_time.substring(date_time.indexOf(' ') + 1);
        parts.push(chalk.gray(time));
      }
      if (topic) {
        parts.push(topics[entry.topic]);
      }
      if (ns) {
        parts.push(chalk.blue(entry.ns));
      }
      if (entry.msg) {
        parts.push(entry.msg);
      }
      if (data && entry.data) {
        for (const key in entry.data) {
          if (entry.data.hasOwnProperty(key)) {
            const value = entry.data[key];
            const [k, v, unit] = value_format(key, value, stringify);
            const highlighted = unit ? `${chalk.yellow(v)}${unit}` : v;
            parts.push(k ? `${chalk.bold(k)}=${highlighted}` : highlighted);
          }
        }
      }
      if (stack && entry.stack) {
        parts.push(formatStack(entry.stack));
      }
      const str = parts.join(' ');
      callback(null, `${str}\n`);
    }

  });
};
