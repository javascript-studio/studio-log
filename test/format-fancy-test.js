/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const chalk = require('chalk');
const { Writable } = require('stream');
const logger = require('..');
const format = require('../format/fancy');

describe('format-fancy', () => {
  const local_time = (function () {
    const date_time = new Date(123).toLocaleString();
    const time = date_time.substring(date_time.indexOf(' ') + 1);
    return chalk.gray(time);
  }());
  const namespace = chalk.blue('test');

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

    assert.equal(out, `${local_time} 📣  ${namespace} Oh, hi!\n`);
  });

  it('formats data', () => {
    log.broadcast('Data', { some: 'string', and: 42 });

    assert.equal(out, `${local_time} 📣  ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'string\'')} `
      + `${chalk.bold('and')}=${chalk.yellow('42')}\n`);
  });

  it('escapes string', () => {
    log.broadcast('Data', { some: 'str\'in\'g' });

    assert.equal(out, `${local_time} 📣  ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\\'in\\\'g\'')}\n`);
  });

  it('highlights arrays', () => {
    log.broadcast('Data', { some: [1, 2] });

    assert.equal(out, `${local_time} 📣  ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.magenta('[')}${chalk.yellow('1')}`
      + `${chalk.magenta(', ')}${chalk.yellow('2')}${chalk.magenta(']')}\n`);
  });

  it('highlights objects', () => {
    log.broadcast('Data', { some: { a: 7 } });

    assert.equal(out, `${local_time} 📣  ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.magenta('{')}a${chalk.magenta(':')} `
      + `${chalk.yellow('7')}${chalk.magenta('}')}\n`);
  });

  it('formats msg and date', () => {
    log.broadcast('Data', { date: new Date() });

    assert.equal(out, `${local_time} 📣  ${namespace} Data `
      + `${chalk.bold('date')}=`
      + `${chalk.green('\'1970-01-01T00:00:00.123Z\'')}\n`);
  });

  it('formats just date', () => {
    log.broadcast({ date: new Date() });

    assert.equal(out, `${local_time} 📣  ${namespace} `
      + `${chalk.bold('date')}=`
      + `${chalk.green('\'1970-01-01T00:00:00.123Z\'')}\n`);
  });

  it('formats msg and error', () => {
    logger.transform(format({ stack: 'message' }));
    const error = new Error('Ouch!');

    log.error('Oups', error);

    const p = error.stack.indexOf('\n');
    const expect_first_line = error.stack.substring(0, p);
    const actual_first_line = out.substring(0, out.indexOf('\n'));
    assert.equal(actual_first_line, `${local_time} 🚨  `
      + `${namespace} Oups ${chalk.bgRed.white.bold(expect_first_line)}`);
  });

  it('formats just error', () => {
    logger.transform(format({ stack: 'message' }));
    const error = new Error('Ouch!');

    log.error(error);

    const p = error.stack.indexOf('\n');
    const expect_first_line = error.stack.substring(0, p);
    const actual_first_line = out.substring(0, out.indexOf('\n'));
    assert.equal(actual_first_line, `${local_time} 🚨  `
      + `${namespace} ${chalk.bgRed.white.bold(expect_first_line)}`);
  });

  it('formats error with first line of trace', () => {
    logger.transform(format({ stack: 'peek' }));
    const error = new Error('Ouch!');

    log.error(error);

    const p1 = error.stack.indexOf('\n');
    const p2 = error.stack.indexOf('\n', p1 + 1);
    const message = error.stack.substring(0, p1);
    const trace = error.stack.substring(p1 + 1, p2).trim();
    const actual_first_line = out.substring(0, out.indexOf('\n'));
    assert.equal(actual_first_line, `${local_time} 🚨  `
      + `${namespace} ${chalk.bgRed.white.bold(message)} ${chalk.gray(trace)}`);
  });

  describe('units', () => {

    beforeEach(() => {
      logger.transform(format({ ts: false, ns: false, topic: false }));
    });

    it('highlights milliseconds', () => {
      log.numbers('=', { ms: 7 });

      assert.equal(out, `= ${chalk.yellow('7')}ms\n`);
    });

    it('highlights seconds', () => {
      log.numbers('=', { ms: 7000 });

      assert.equal(out, `= ${chalk.yellow('7.0')}s\n`);
    });

    it('highlights minutes', () => {
      log.numbers('=', { ms: 150000 });

      assert.equal(out, `= ${chalk.yellow('2.5')}m\n`);
    });

  });

  describe('options', () => {

    it('does not write timestamp if `ts` option is false', () => {
      logger.transform(format({ ts: false }));

      log.wtf('WTF?!');

      assert.equal(out, `👻  ${namespace} WTF?!\n`);
    });

    it('does not write emoji if `topic` option is false', () => {
      logger.transform(format({ topic: false }));

      log.wtf('WTF?!');

      assert.equal(out, `${local_time} ${namespace} WTF?!\n`);
    });

    it('does not write namespace if `ns` option is false', () => {
      logger.transform(format({ ns: false }));

      log.wtf('WTF?!');

      assert.equal(out, `${local_time} 👻  WTF?!\n`);
    });

    it('does not write data if `data` option is false', () => {
      logger.transform(format({ data: false }));

      log.numbers('Data', { bytes_foo: 42 });

      assert.equal(out, `${local_time} 🔢  ${namespace} Data\n`);
    });

    it('does not write stack if `stack` option is false', () => {
      logger.transform(format({ stack: false }));

      log.ignore('Err', new Error('Oh oh!'));

      assert.equal(out, `${local_time} 🙈  ${namespace} Err\n`);
    });

  });
});
