/* eslint-disable n/no-extraneous-require */
'use strict';

const { Writable } = require('stream');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const Stringify = require('@studio/ndjson/stringify');
const logger = require('..');

describe('child', () => {
  let clock;
  let out;

  beforeEach(() => {
    out = '';
    clock = sinon.useFakeTimers();
    logger.pipe(new Stringify()).pipe(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
    clock.tick(123);
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('logs a line', () => {
    logger('test').child('child').ok('Hi');

    assert.equals(out,
      '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi"}\n');
  });

  it('logs child data', () => {
    logger('test').child('child', { is: 7 }).ok('Hi');

    assert.equals(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7}}\n');
  });

  it('logs parent data', () => {
    logger('test', { is: 7 }).child('child').ok('Hi');

    assert.equals(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7}}\n');
  });

  it('logs child and parent data', () => {
    logger('test', { is: 7 }).child('child', { or: 3 }).ok('Hi');

    assert.equals(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7,"or":3}}\n');
  });

  it('logs child and log data', () => {
    logger('test').child('child', { is: 7 }).ok('Hi', { or: 3 });

    assert.equals(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7,"or":3}}\n');
  });

});
