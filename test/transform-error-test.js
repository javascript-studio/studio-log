/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Transform = require('stream').Transform;
const Writable = require('stream').Writable;
const logger = require('..');

describe('transform error', () => {
  let sandbox;
  let log;
  let out;

  beforeEach(() => {
    out = '';
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    logger.out(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
    sandbox.clock.tick(123);
    log = logger('test');
  });

  afterEach(() => {
    sandbox.restore();
    logger.reset();
  });

  it('logs error if transform emits "error"', () => {
    const error = new Error('Ouch!');

    log.ok('Message', { toJSON: () => { throw error; } });

    const entry = JSON.parse(out);
    assert.equal(entry.ts, 123);
    assert.equal(entry.ns, 'logger');
    assert.equal(entry.topic, 'error');
    assert.equal(entry.msg, 'Transform failed');
    assert.equal(entry.stack, error.stack);
  });

  it('handles recursive error', () => {
    logger.transform(new Transform({
      transform(chunk, enc, done) {
        done(new Error('Ouch!'));
      }
    }));

    assert.doesNotThrow(() => {
      log.ok('Message');
    });
  });

});
