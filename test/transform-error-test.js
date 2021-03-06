/*eslint-env mocha*/
'use strict';

const { assert, refute, sinon } = require('@sinonjs/referee-sinon');
const { Transform, Writable  } = require('stream');
const Stringify = require('@studio/ndjson/stringify');
const logger = require('..');

describe('transform error', () => {
  let clock;
  let log;
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
    log = logger('test');
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('logs error if transform emits "error"', () => {
    const error = new Error('Ouch!');

    log.ok('Message', { toJSON: () => { throw error; } });

    const entry = JSON.parse(out);
    assert.equals(entry.ts, 123);
    assert.equals(entry.ns, 'logger');
    assert.equals(entry.topic, 'error');
    assert.equals(entry.msg, 'Transform failed');
    assert.equals(entry.stack, error.stack);
  });

  it('handles recursive error', () => {
    logger.pipe(new Transform({
      transform(chunk, enc, done) {
        done(new Error('Ouch!'));
      }
    }));

    refute.exception(() => {
      log.ok('Message');
    });
  });

});
