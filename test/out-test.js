/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const fancy_format = require('../format/fancy');
const logger = require('..');

describe('logger out', () => {
  let sandbox;
  let log;

  beforeEach(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    sandbox.clock.tick(123);
    log = logger('test');
  });

  afterEach(() => {
    sandbox.restore();
    logger.reset();
  });

  it('does not log to stdout by default', () => {
    logger.transform(fancy_format({ ts: false, ns: false }));

    log.error(new Error('If you can see this, the test failed!'));
  });

  it('allows to pass "null" as output stream', () => {
    assert.doesNotThrow(() => {
      logger.out(null);
    });
  });

  it('returns the logger', () => {
    const r = logger.out(process.stdout);

    assert.strictEqual(r, logger);
  });

  it('returns the logger when setting transform', () => {
    const r = logger.transform(fancy_format());

    assert.strictEqual(r, logger);
  });

  describe('hasStream', () => {

    it('returns false initially', () => {
      assert.equal(logger.hasStream(), false);
    });

    it('returns true after out was set', () => {
      logger.out(process.stdout);

      assert.equal(logger.hasStream(), true);
    });

    it('returns false after out was set to null', () => {
      logger.out(process.stdout);
      logger.out(null);

      assert.equal(logger.hasStream(), false);
    });

  });

});
