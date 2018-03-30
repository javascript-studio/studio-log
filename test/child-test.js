/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Writable = require('stream').Writable;
const logger = require('..');

describe('child', () => {
  let clock;
  let out;

  beforeEach(() => {
    out = '';
    clock = sinon.useFakeTimers();
    logger.out(new Writable({
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

    assert.equal(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi"}\n');
  });

  it('logs child data', () => {
    logger('test').child('child', { is: 7 }).ok('Hi');

    assert.equal(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7}}\n');
  });

  it('logs parent data', () => {
    logger('test', { is: 7 }).child('child').ok('Hi');

    assert.equal(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7}}\n');
  });

  it('logs child and parent data', () => {
    logger('test', { is: 7 }).child('child', { or: 3 }).ok('Hi');

    assert.equal(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7,"or":3}}\n');
  });

  it('logs child and log data', () => {
    logger('test').child('child', { is: 7 }).ok('Hi', { or: 3 });

    assert.equal(out, '{"ts":123,"ns":"test child","topic":"ok","msg":"Hi",'
      + '"data":{"is":7,"or":3}}\n');
  });

});
