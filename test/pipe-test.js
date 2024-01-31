/* eslint-disable n/no-extraneous-require */
'use strict';

const { assert, refute, sinon } = require('@sinonjs/referee-sinon');
const Stringify = require('@studio/ndjson/stringify');
const logger = require('..');

describe('logger pipe', () => {
  let clock;
  let log;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    clock.tick(123);
    log = logger('test');
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('does not log to stdout by default', () => {
    logger.pipe(new Stringify());

    log.error(new Error('If you can see this, the test failed!'));
  });

  it('allows to pass "null" as output stream', () => {
    refute.exception(() => {
      logger.pipe(null);
    });
  });

  it('returns the stream', () => {
    const stream = new Stringify();

    const r = logger.pipe(stream);

    assert.same(r, stream);
  });

  describe('hasStream', () => {

    it('returns false initially', () => {
      assert.isFalse(logger.hasStream());
    });

    it('returns true after pipe was set', () => {
      logger.pipe(new Stringify());

      assert.isTrue(logger.hasStream());
    });

    it('returns false after pipe was set to null', () => {
      logger.pipe(new Stringify());
      logger.pipe(null);

      assert.isFalse(logger.hasStream());
    });

  });

});
