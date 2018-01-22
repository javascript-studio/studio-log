#!/usr/bin/env node
/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2), {
  string: ['format', 'map'],
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

const ParseTransform = require('@studio/ndjson/parse');
const format = require(`../format/${argv.format}`);

const out = argv.map
  ? require('../lib/sourcemaps')(argv.map, process.stdout)
  : process.stdout;

process.stdin.setEncoding('utf8');
process.stdin
  .pipe(new ParseTransform({ loose_out: out }))
  .pipe(format(argv))
  .pipe(out);
