/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

function match(short, fn) {
  const re = new RegExp(`^${short}$|^${short}_`);
  return { re, fn };
}

const formatters = [

  match('ts', (value, stringify) => {
    return [stringify(new Date(value)), ''];
  }),

  match('ms', (value) => {
    if (value >= 60000) {
      const s = value / 60000;
      if (s >= 10) {
        return [Math.round(s), 'm'];
      }
      return [s.toFixed(1), 'm'];
    }
    if (value >= 100) {
      const s = value / 1000;
      if (s >= 10) {
        return [Math.round(s), 's'];
      }
      return [s.toFixed(1), 's'];
    }
    return [value, 'ms'];
  }),

  match('bytes', (value) => {
    if (value >= 1024000) {
      const mb = value / 1024000;
      if (mb >= 10) {
        return [Math.round(mb), 'MB'];
      }
      return [mb.toFixed(1), 'MB'];
    }
    if (value >= 512) {
      const kb = value / 1024;
      if (kb >= 10) {
        return [Math.round(kb), 'kB'];
      }
      return [kb.toFixed(1), 'kB'];
    }
    return [value, 'B'];
  })

];

module.exports = function (key, value, stringify) {
  for (let i = 0; i < formatters.length; i++) {
    const formatter = formatters[i];
    const m = key.match(formatter.re);
    if (m) {
      const k = key.substring(m[0].length);
      const vu = formatter.fn(value, stringify);
      return [k, vu[0], vu[1]];
    }
  }
  return [key, stringify(value), ''];
};
