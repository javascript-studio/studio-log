/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { Writable } = require('stream');
const logger = require('..');
const format = require('../format/basic');

describe('value-format', () => {
  let sandbox;
  let log;
  let out;

  beforeEach(() => {
    log = logger('test');
    out = '';
    sandbox = sinon.sandbox.create({ useFakeTimers: true });
    logger.out(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
    logger.transform(format());
    sandbox.clock.tick(123);
  });

  afterEach(() => {
    sandbox.restore();
    logger.reset();
  });

  it('formats "ts" property in data', () => {
    log.spawn('Data', { ts: 456 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Data '
      + '1970-01-01T00:00:00.456Z\n');
  });

  it('formats "ts_foo" property in data', () => {
    log.spawn('Data', { ts_foo: 456 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Data '
      + 'foo=1970-01-01T00:00:00.456Z\n');
  });

  it('formats "ms" property in data', () => {
    log.timing('Duration', { ms: 77 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration 77ms\n');
  });

  it('formats "ms_foo" property in data', () => {
    log.timing('Duration', { ms_foo: 77 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration foo=77ms\n');
  });

  it('formats "ms" >= 100 as seconds', () => {
    log.timing('Duration', { ms: 100 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration 0.1s\n');
  });

  it('formats "ms" >= 10 seconds without fractions', () => {
    log.timing('Duration', { ms: 10000 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration 10s\n');
  });

  it('formats "ms" >= 60 seconds as minutes', () => {
    log.timing('Duration', { ms: 60000 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration 1.0m\n');
  });

  it('formats "ms" >= 10 minutes without fraction', () => {
    log.timing('Duration', { ms: 600000 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ⏱  [test] Duration 10m\n');
  });

  it('formats "bytes" property in data', () => {
    log.spawn('Size', { bytes: 7 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size 7B\n');
  });

  it('formats "kb_foo" property in data', () => {
    log.spawn('Size', { bytes_foo: 42 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size foo=42B\n');
  });

  it('formats "bytes" >= 512 as kB', () => {
    log.spawn('Size', { bytes_a: 512, bytes_b: 1024 + 512 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size '
      + 'a=0.5kB b=1.5kB\n');
  });

  it('formats "bytes" >= 10 kB without fraction', () => {
    log.spawn('Size', { bytes: 10240 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size 10kB\n');
  });

  it('formats "bytes" >= 1024000 as MB', () => {
    log.spawn('Size', { bytes_a: 1023000, bytes_b: 1024000 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size '
      + 'a=999kB b=1.0MB\n');
  });

  it('formats "bytes" >= 10 MB without fraction', () => {
    log.spawn('Size', { bytes: 10240000 });

    assert.equal(out, '1970-01-01T00:00:00.123Z ✨  [test] Size 10MB\n');
  });

});
