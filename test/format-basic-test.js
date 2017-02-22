/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Writable = require('stream').Writable;
const logger = require('..');
const format = require('../format/basic');

describe('format-basic', () => {
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

  it('formats ts, topic, ns and msg', () => {
    log.broadcast('Oh, hi!');

    assert.equal(out, '1970-01-01T00:00:00.123Z 📣  [test] Oh, hi!\n');
  });

  it('formats msg and data', () => {
    log.broadcast('Data', { some: 'string', and: 42 });

    assert.equal(out, '1970-01-01T00:00:00.123Z 📣  [test] Data '
      + 'some="string" and=42\n');
  });

  it('formats just data', () => {
    log.broadcast({ some: 'string', and: 42 });

    assert.equal(out, '1970-01-01T00:00:00.123Z 📣  [test] '
      + 'some="string" and=42\n');
  });

  it('formats msg and error', () => {
    logger.transform(format({ stack: 'full' }));
    const error = new Error('Ouch!');

    log.error('Oups', error);

    assert.equal(out, '1970-01-01T00:00:00.123Z 🚨  [test] Oups '
      + `${error.stack}\n`);
  });

  it('formats just error', () => {
    logger.transform(format({ stack: 'full' }));
    const error = new Error('Ouch!');

    log.error(error);

    assert.equal(out, '1970-01-01T00:00:00.123Z 🚨  [test] '
      + `${error.stack}\n`);
  });

  it('formats error with first line of trace', () => {
    const error = new Error('Ouch!');

    log.error(error);

    const p1 = error.stack.indexOf('\n');
    const p2 = error.stack.indexOf('\n', p1 + 1);
    const message = error.stack.substring(0, p1);
    const trace = error.stack.substring(p1 + 1, p2).trim();

    assert.equal(out, '1970-01-01T00:00:00.123Z 🚨  [test] '
      + `${message} ${trace}\n`);
  });

  describe('options', () => {

    it('does not write timestamp if `ts` option is false', () => {
      logger.transform(format({ ts: false }));

      log.wtf('WTF?!');

      assert.equal(out, '👻  [test] WTF?!\n');
    });

    it('does not write emoji if `topic` option is false', () => {
      logger.transform(format({ topic: false }));

      log.wtf('WTF?!');

      assert.equal(out, '1970-01-01T00:00:00.123Z [test] WTF?!\n');
    });

    it('does not write namespace if `ns` option is false', () => {
      logger.transform(format({ ns: false }));

      log.wtf('WTF?!');

      assert.equal(out, '1970-01-01T00:00:00.123Z 👻  WTF?!\n');
    });

    it('does not write data if `data` option is false', () => {
      logger.transform(format({ data: false }));

      log.numbers('Data', { bytes_foo: 42 });

      assert.equal(out, '1970-01-01T00:00:00.123Z 🔢  [test] Data\n');
    });

    it('does not write stack if `stack` option is false', () => {
      logger.transform(format({ stack: false }));

      log.ignore('Err', new Error('Oh oh!'));

      assert.equal(out, '1970-01-01T00:00:00.123Z 🙈  [test] Err\n');
    });

  });
});
