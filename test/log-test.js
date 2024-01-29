/* eslint-disable n/no-extraneous-require */
'use strict';

const { Transform, Writable } = require('stream');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const Stringify = require('@studio/ndjson/stringify');
const logger = require('..');

/**
 * @typedef {import('..').Logger} Logger
 * @typedef {import('..').LogError} LogError
 */

function MyError(message) {
  this.name = 'MyError';
  this.message = message;
}
MyError.prototype.toString = function () {
  return `${this.name}: ${this.message}`;
};

describe('logger', () => {
  let clock;
  let out;
  /** @type {Logger} */
  let log;

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

  it('logs a line', () => {
    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
  });

  it('logs data', () => {
    log.output('All', { the: 'things' });

    assert.equals(out, '{"ts":123,"ns":"test","topic":"output","msg":"All",'
      + '"data":{"the":"things"}}\n');
  });

  it('logs error without message', () => {
    const error = new Error();

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('logs error with message', () => {
    const error = new Error('Ouch!');

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('logs error with cause', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":${JSON.stringify(logger.stack(cause))}}\n`);
  });

  it('logs error object toString with numeric cause', () => {
    const error = { toString: () => 'Ouch!', cause: 42 };

    log.error({}, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","data":{},'
      + '"stack":"Ouch!","cause":"42"}\n');
  });

  it('logs error with code', () => {
    const error = /** @type {LogError} */ (new Error('Ouch!'));
    error.code = 'E_CODE';

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"data":{"code":"E_CODE"},"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('logs error cause with code', () => {
    const error = new Error('Ouch!');
    const cause = /** @type {LogError} */ (new Error('Cause'));
    cause.code = 'E_CODE';
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + '"data":{"cause":{"code":"E_CODE"}},'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":${JSON.stringify(logger.stack(cause))}}\n`);
  });

  it('logs data with error cause with code', () => {
    const error = new Error('Ouch!');
    const cause = /** @type {LogError} */ (new Error('Cause'));
    cause.code = 'E_CODE';
    error.cause = cause;

    const data = { some: 'data' };
    log.error(data, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + '"data":{"some":"data","cause":{"code":"E_CODE"}},'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":${JSON.stringify(logger.stack(cause))}}\n`);
    assert.equals(data, { some: 'data' }); // Verify not modified
  });

  it('logs error cause with random properties', () => {
    const error = new Error('Ouch!');
    /** @type {Object} */
    const cause = new Error('Cause');
    cause.random = 42;
    cause.property = true;
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + '"data":{"cause":{"random":42,"property":true}},'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":${JSON.stringify(logger.stack(cause))}}\n`);
  });

  it('logs error cause without name and message properties', () => {
    const error = new Error('Ouch!');
    /** @type {Object} */
    const cause = new MyError('Cause');
    cause.random = 42;
    cause.property = true;
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + '"data":{"cause":{"random":42,"property":true}},'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":"${cause.toString()}"}\n`);
  });

  it('logs error cause without properties other than name and message', () => {
    const error = new Error('Ouch!');
    const cause = new MyError('Cause');
    error.cause = cause;

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      // Note: No "data" property
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":"${cause.toString()}"}\n`);
  });

  it('does not screw up if cause is string', () => {
    const error = new Error('Ouch!');
    error.cause = 'Simple string cause';

    log.error('Oups', error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + '"cause":"Simple string cause"}\n');
  });

  it('logs message with custom error', () => {
    log.error('This went south', new MyError('Cause'));

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + '"msg":"This went south","stack":"MyError: Cause"}\n');
  });

  it('logs custom data object', () => {
    function MyThing() {
      this.is = 42;
    }
    MyThing.prototype.toString = function () {
      return '[object MyThing]';
    };

    log.ok(new MyThing());

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok",'
      + '"data":{"is":42}}\n');
  });

  it('logs message with custom data object', () => {
    function MyThing() {
      this.is = 42;
    }
    MyThing.prototype.toString = function () {
      return '[object MyThing]';
    };

    log.ok('Note', new MyThing());

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok",'
      + '"msg":"Note","data":{"is":42}}\n');
  });

  it('logs message with data { name, message }', () => {
    log.error({ name: 'a', message: 'b' });

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + '"data":{"name":"a","message":"b"}}\n');
  });

  it('logs error-like object { name, message, stack } with error in stack', () => {
    const error = {
      name: 'SyntaxError',
      message: 'Ouch!',
      stack: 'SyntaxError: Ouch!\n  at xyz:123'
    };

    log.error(error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":"SyntaxError: Ouch!\\n  at xyz:123"}\n`);
  });

  it('logs error-like object { name, message }', () => {
    const error = { name: 'SyntaxError', message: 'Ouch!' };

    log.error('Test', {}, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error","msg":"Test",'
      + `"data":{},"stack":"SyntaxError: Ouch!"}\n`);
  });

  it('logs error-like object { name, message, stack } without error in stack', () => {
    const error = { name: 'SyntaxError', message: 'Ouch!', stack: '  at xyz:123' };

    log.error(error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":"SyntaxError: Ouch!\\n  at xyz:123"}\n`);
  });

  it('logs error-like cause { name, message, stack }', () => {
    const error = new Error('Ouch!');
    error.cause = { name: 'SyntaxError', message: 'Cause', stack: '  at xyz:123' };

    log.error(error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":"SyntaxError: Cause\\n  at xyz:123"}\n`);
  });

  it('logs data and error object', () => {
    const error = new Error('Ouch!');

    log.issue('Found', { some: 'issue' }, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + `"data":{"some":"issue"},"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('logs data and error object with cause', () => {
    const error = /** @type {LogError} */ (new Error('Ouch!'));
    const cause = new Error('Cause');
    error.cause = cause;

    log.issue('Found', { some: 'issue' }, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + `"data":{"some":"issue"},"stack":${JSON.stringify(logger.stack(error))},`
      + `"cause":${JSON.stringify(logger.stack(error.cause))}}\n`);
  });

  it('logs data and error object with code', () => {
    const error = /** @type {LogError} */ (new Error('Ouch!'));
    error.code = 'E_CODE';

    log.issue('Found', { some: 'issue' }, error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + '"data":{"some":"issue","code":"E_CODE"},'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('does not modify given data object if error code is present', () => {
    const error = /** @type {LogError} */ (new Error('Ouch!'));
    error.code = 'E_CODE';

    const data = { some: 'issue' };
    log.issue('Found', data, error);

    assert.equals(data, { some: 'issue' });
  });

  it('logs data with custom toJSON', () => {
    const data = { toJSON: () => ({ is: 42 }) };

    log.numbers(data);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"numbers",'
      + '"data":{"is":42}}\n');
  });

  it('logs data and error string', () => {
    log.issue('Found', { some: 'issue' }, 'Ouch!');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + '"data":{"some":"issue"},"stack":"Ouch!"}\n');
  });

  it('uses the given transform stream to serialize entries', () => {
    const entries = [];
    logger.pipe(new Transform({
      writableObjectMode: true,
      transform(entry, enc, done) {
        entries.push(entry);
        done();
      }
    }));

    log.input('In');
    log.output('Out');

    assert.equals(entries, [
      { ts: 123, ns: 'test', topic: 'input', msg: 'In' },
      { ts: 123, ns: 'test', topic: 'output', msg: 'Out' }
    ]);
  });

  it('returns same instance when requesting the same logger twice', () => {
    const a = logger('foo');
    const b = logger('foo');

    assert.same(a, b);
  });

  it('logs only data', () => {
    log.fetch({ host: 'javascript.studio', path: '/' });

    assert.equals(out, '{"ts":123,"ns":"test","topic":"fetch","data":'
      + '{"host":"javascript.studio","path":"/"}}\n');
  });

  it('logs only data and error', () => {
    log.issue({ id: 'studio' }, 'Oh!');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"issue","data":'
      + '{"id":"studio"},"stack":"Oh!"}\n');
  });

  it('logs only error', () => {
    const error = new Error('Ouch');

    log.error(error);

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('logs only meta data', () => {
    log.timing();

    assert.equals(out, '{"ts":123,"ns":"test","topic":"timing"}\n');
  });

  it('logs base data', () => {
    logger('base', { base: 'data' }).ok('Text');

    assert.equals(out, '{"ts":123,"ns":"base","topic":"ok","msg":"Text",'
      + '"data":{"base":"data"}}\n');
  });

  it('replaces base data when creating new logger', () => {
    logger('base', { base: 'data' });
    logger('base', { base: 'changed' }).ok('Text');

    assert.equals(out, '{"ts":123,"ns":"base","topic":"ok","msg":"Text",'
      + '"data":{"base":"changed"}}\n');
  });

  it('mixes base data with log data', () => {
    const log_with_data = logger('test', { base: 'data' });
    log_with_data.ok({ and: 7 });
    log_with_data.ok({ or: 42 }); // Verify "and" is not copied into the base data

    assert.equals(out, ''
      + '{"ts":123,"ns":"test","topic":"ok","data":{"base":"data","and":7}}\n'
      + '{"ts":123,"ns":"test","topic":"ok","data":{"base":"data","or":42}}\n');
  });

  it('fails type check if first argument is error and second is string', () => {
    const error = new Error('Ouch!');

    // @ts-expect-error
    log.error(error, 'Oups');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  it('fails type check if first argument is error and second is data', () => {
    const error = new Error('Ouch!');

    // @ts-expect-error
    log.error(error, { the: 'things'});

    assert.equals(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":${JSON.stringify(logger.stack(error))}}\n`);
  });

  context('stack', () => {
    it('includes error name', () => {
      const stack = logger.stack(new TypeError());

      assert.match(stack, 'TypeError');
    });

    it('includes error name and message', () => {
      const stack = logger.stack(new TypeError('Ouch!'));

      assert.match(stack, 'TypeError: Ouch!');
    });

    it('includes error message if name is missing', () => {
      const error = new TypeError('Ouch!');
      // @ts-expect-error
      const stack = logger.stack({
        message: error.message,
        stack: error.stack ? error.stack.replace(`${String(error)}\n`, '') : ''
      });

      assert.match(stack, 'Ouch!');
    });
  });
});
