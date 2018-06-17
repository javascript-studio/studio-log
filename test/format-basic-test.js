/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { Writable } = require('stream');
const logger = require('..');
const format = require('../format/basic');

describe('format-basic', () => {
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
    logger.transform(format());
    clock.tick(123);
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('formats ts, topic, ns and msg', () => {
    log.broadcast('Oh, hi!');

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] Oh, hi!\n');
  });

  it('formats msg and data object', () => {
    log.broadcast('Data', { some: 'string', and: 42 });

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] Data '
      + 'some="string" and=42\n');
  });

  it('formats msg and data string', () => {
    log.broadcast('Data', 'Also data');

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] Data "Also data"\n');
  });

  it('formats msg and data number', () => {
    log.broadcast('Data', 1234);

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] Data 1234\n');
  });

  it('formats msg and data boolean', () => {
    log.broadcast('Data', true);

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] Data true\n');
  });

  it('formats just data', () => {
    log.broadcast({ some: 'string', and: 42 });

    assert.equals(out, '1970-01-01T00:00:00.123Z 📣 [test] '
      + 'some="string" and=42\n');
  });

  it('formats msg and error', () => {
    logger.transform(format({ stack: 'full' }));
    const error = new Error('Ouch!');

    log.error('Oups', error);

    assert.equals(out, '1970-01-01T00:00:00.123Z 🚨 [test] Oups '
      + `${error.stack}\n`);
  });

  it('formats msg and error with cause', () => {
    logger.transform(format({ stack: 'full' }));
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '1970-01-01T00:00:00.123Z 🚨 [test] Oups '
      + `${error.stack}\n  caused by ${cause.stack}\n`);
  });

  it('formats just error', () => {
    logger.transform(format({ stack: 'full' }));
    const error = new Error('Ouch!');

    log.error(error);

    assert.equals(out, '1970-01-01T00:00:00.123Z 🚨 [test] '
      + `${error.stack}\n`);
  });

  function getFirstLineOfStack(error) {
    const p1 = error.stack.indexOf('\n');
    const p2 = error.stack.indexOf('\n', p1 + 1);
    const message = error.stack.substring(0, p1);
    const trace = error.stack.substring(p1 + 1, p2).trim();
    return `${message} ${trace}`;
  }

  it('formats error with first line of trace', () => {
    const error = new Error('Ouch!');

    log.error(error);

    const error_peek = getFirstLineOfStack(error);

    assert.equals(out, '1970-01-01T00:00:00.123Z 🚨 [test] '
      + `${error_peek}\n`);
  });

  it('formats error and cause with first line of trace', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error(error);

    const error_peek = getFirstLineOfStack(error);
    const cause_peek = getFirstLineOfStack(cause);

    assert.equals(out, '1970-01-01T00:00:00.123Z 🚨 [test] '
      + `${error_peek}\n  caused by ${cause_peek}\n`);
  });

  describe('options', () => {

    it('does not write timestamp if `ts` option is false', () => {
      logger.transform(format({ ts: false }));

      log.wtf('WTF?!');

      assert.equals(out, '👻 [test] WTF?!\n');
    });

    it('does not write emoji if `topic` option is false', () => {
      logger.transform(format({ topic: false }));

      log.wtf('WTF?!');

      assert.equals(out, '1970-01-01T00:00:00.123Z [test] WTF?!\n');
    });

    it('does not write namespace if `ns` option is false', () => {
      logger.transform(format({ ns: false }));

      log.wtf('WTF?!');

      assert.equals(out, '1970-01-01T00:00:00.123Z 👻 WTF?!\n');
    });

    it('does not write data if `data` option is false', () => {
      logger.transform(format({ data: false }));

      log.numbers('Data', { bytes_foo: 42 });

      assert.equals(out, '1970-01-01T00:00:00.123Z 🔢 [test] Data\n');
    });

    it('does not write stack if `stack` option is false', () => {
      logger.transform(format({ stack: false }));

      log.ignore('Err', new Error('Oh oh!'));

      assert.equals(out, '1970-01-01T00:00:00.123Z 🙈 [test] Err\n');
    });

  });
});
