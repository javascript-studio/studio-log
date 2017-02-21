#!/usr/bin/env node
/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2), {
  string: ['format'],
  boolean: ['ts', 'ns', 'topic', 'data'],
  alias: {
    format: ['f']
  },
  default: {
    format: 'fancy',
    ts: true,
    ns: true,
    topic: true,
    data: true,
    stack: 'peek'
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
    let line = buf.substring(0, p);
    const start = line.indexOf('{');
    if (start === -1) {
      process.stdout.write(line);
      process.stdout.write('\n');
    } else {
      if (start > 0) {
        process.stdout.write(line.substring(0, start));
        line = line.substring(start);
      }
      try {
        const json = JSON.parse(line);
        formatter.write(json);
      } catch (e) {
        process.stdout.write(line);
        process.stdout.write('\n');
      }
    }
    buf = buf.substring(p + 1);
    p = buf.indexOf('\n');
  }
});
