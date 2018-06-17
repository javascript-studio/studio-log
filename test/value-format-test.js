/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { Writable } = require('stream');
const logger = require('..');
const format = require('../format/basic');

describe('value-format', () => {
  let clock;
  let log;
  let out;

  beforeEach(() => {
    log = logger('test');
    out = '';
    clock = sinon.useFakeTimers();
    logger.out(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
    logger.transform(format({ ts: false, ns: false }));
    clock.tick(123);
  });

  afterEach(() => {
    clock.restore();
    logger.reset();
  });

  it('formats "ts" property in data', () => {
    log.spawn('Data', { ts: 456 });

    assert.equals(out, '✨ Data "1970-01-01T00:00:00.456Z"\n');
  });

  it('formats "ts_foo" property in data', () => {
    log.spawn('Data', { ts_foo: 456 });

    assert.equals(out, '✨ Data foo="1970-01-01T00:00:00.456Z"\n');
  });

  it('formats "ms" property in data', () => {
    log.timing('Duration', { ms: 77 });

    assert.equals(out, '⏱  Duration 77ms\n');
  });

  it('formats "ms_foo" property in data', () => {
    log.timing('Duration', { ms_foo: 77 });

    assert.equals(out, '⏱  Duration foo=77ms\n');
  });

  it('formats "ms" >= 100 as seconds', () => {
    log.timing('Duration', { ms: 100 });

    assert.equals(out, '⏱  Duration 0.1s\n');
  });

  it('formats "ms" >= 10 seconds without fractions', () => {
    log.timing('Duration', { ms: 10000 });

    assert.equals(out, '⏱  Duration 10s\n');
  });

  it('formats "ms" >= 60 seconds as minutes', () => {
    log.timing('Duration', { ms: 60000 });

    assert.equals(out, '⏱  Duration 1.0m\n');
  });

  it('formats "ms" >= 10 minutes without fraction', () => {
    log.timing('Duration', { ms: 600000 });

    assert.equals(out, '⏱  Duration 10m\n');
  });

  it('formats "bytes" property in data', () => {
    log.spawn('Size', { bytes: 7 });

    assert.equals(out, '✨ Size 7B\n');
  });

  it('formats "kb_foo" property in data', () => {
    log.spawn('Size', { bytes_foo: 42 });

    assert.equals(out, '✨ Size foo=42B\n');
  });

  it('formats "bytes" >= 512 as kB', () => {
    log.spawn('Size', { bytes_a: 512, bytes_b: 1024 + 512 });

    assert.equals(out, '✨ Size a=0.5kB b=1.5kB\n');
  });

  it('formats "bytes" >= 10 kB without fraction', () => {
    log.spawn('Size', { bytes: 10240 });

    assert.equals(out, '✨ Size 10kB\n');
  });

  it('formats "bytes" >= 1024000 as MB', () => {
    log.spawn('Size', { bytes_a: 1023000, bytes_b: 1024000 });

    assert.equals(out, '✨ Size a=999kB b=1.0MB\n');
  });

  it('formats "bytes" >= 10 MB without fraction', () => {
    log.spawn('Size', { bytes: 10240000 });

    assert.equals(out, '✨ Size 10MB\n');
  });

});
