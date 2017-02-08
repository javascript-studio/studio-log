#!/usr/bin/env node
/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2), {
  string: ['format'],
  boolean: ['ts', 'ns', 'topic', 'data', 'stack'],
  alias: {
    format: ['f']
  },
  default: {
    format: 'fancy',
    ts: true,
    ns: true,
    topic: true,
    data: true,
    stack: true
  }
});

const format = require(`../format/${argv.format}`);

const formatter = format(argv);
formatter.pipe(process.stdout);

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  buf += data;
  let p = buf.indexOf('\n');
  while (p !== -1) {
    const line = buf.substring(0, p);
    try {
      const json = JSON.parse(line);
      formatter.write(json);
    } catch (e) {
      process.stdout.write(line);
      process.stdout.write('\n');
    }
    buf = buf.substring(p + 1);
    p = buf.indexOf('\n');
  }
});
