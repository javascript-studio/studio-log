/*eslint-env mocha*/
'use strict';

const { assert, refute, sinon } = require('@sinonjs/referee-sinon');
const fancy_format = require('../format/fancy');
const logger = require('..');

describe('logger out', () => {
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
    logger.transform(fancy_format({ ts: false, ns: false }));

    log.error(new Error('If you can see this, the test failed!'));
  });

  it('allows to pass "null" as output stream', () => {
    refute.exception(() => {
      logger.out(null);
    });
  });

  it('returns the logger', () => {
    const r = logger.out(process.stdout);

    assert.same(r, logger);
  });

  it('returns the logger when setting transform', () => {
    const r = logger.transform(fancy_format());

    assert.same(r, logger);
  });

  describe('hasStream', () => {

    it('returns false initially', () => {
      assert.isFalse(logger.hasStream());
    });

    it('returns true after out was set', () => {
      logger.out(process.stdout);

      assert.isTrue(logger.hasStream());
    });

    it('returns false after out was set to null', () => {
      logger.out(process.stdout);
      logger.out(null);

      assert.isFalse(logger.hasStream());
    });

  });

});
