/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const fs = require('fs');
const source_map = require('source-map');
const Transform = require('stream').Transform;

module.exports = function (file, out) {
  // eslint-disable-next-line no-sync
  const map = fs.readFileSync(file, 'utf8');
  const mapper = new source_map.SourceMapConsumer(map);
  const transform = new Transform({
    transform: (chunk, enc, callback) => {
      let row = chunk.toString();
      const match = row.match(/at (.+) \(.+:([0-9]+):([0-9]+)\)/i);
      if (match) {
        const pos = mapper.originalPositionFor({
          line: Number(match[2]),
          column: Number(match[3])
        });
        if (pos.line) {
          const prefix = row.substring(0, match.index);
          const name = pos.name || match[1];
          row = `${prefix}at ${name} (${pos.source}:${pos.line}:${pos.column})`;
        }
      }
      callback(null, row);
    }
  });
  transform.pipe(out);
  return transform;
};
