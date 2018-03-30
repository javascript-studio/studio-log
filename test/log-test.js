/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Transform = require('stream').Transform;
const Writable = require('stream').Writable;
const logger = require('..');

describe('logger', () => {
  let sandbox;
  let out;
  let log;

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

  it('logs a line', () => {
    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
  });

  it('logs data', () => {
    log.output('All', { the: 'things' });

    assert.equal(out, '{"ts":123,"ns":"test","topic":"output","msg":"All",'
      + '"data":{"the":"things"}}\n');
  });

  it('logs error', () => {
    const error = new Error('Ouch!');

    log.error('Oups', error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('logs error with cause', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error('Oups', error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"stack":${JSON.stringify(error.stack)},`
      + `"cause":${JSON.stringify(cause.stack)}}\n`);
  });

  it('logs error object toString with numeric cause', () => {
    const error = { toString: () => 'Ouch!', cause: 42 };

    log.error({}, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error","data":{},'
      + '"stack":"Ouch!","cause":"42"}\n');
  });

  it('logs error with code', () => {
    const error = new Error('Ouch!');
    error.code = 'E_CODE';

    log.error('Oups', error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + `"data":{"code":"E_CODE"},"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('logs error cause with code', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    cause.code = 'E_CODE';
    error.cause = cause;

    log.error('Oups', error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error","msg":"Oups",'
      + '"data":{"cause":{"code":"E_CODE"}},'
      + `"stack":${JSON.stringify(error.stack)},`
      + `"cause":${JSON.stringify(cause.stack)}}\n`);
  });

  it('logs data with error cause with code', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    cause.code = 'E_CODE';
    error.cause = cause;

    const data = { some: 'data' };
    log.error(data, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error",'
      + '"data":{"some":"data","cause":{"code":"E_CODE"}},'
      + `"stack":${JSON.stringify(error.stack)},`
      + `"cause":${JSON.stringify(cause.stack)}}\n`);
    assert.deepEqual(data, { some: 'data' }); // Verify not modified
  });

  it('logs data and error object', () => {
    const error = new Error('Ouch!');

    log.issue('Found', { some: 'issue' }, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + `"data":{"some":"issue"},"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('logs data and error object with cause', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.issue('Found', { some: 'issue' }, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + `"data":{"some":"issue"},"stack":${JSON.stringify(error.stack)},`
      + `"cause":${JSON.stringify(error.cause.stack)}}\n`);
  });

  it('logs data and error object with code', () => {
    const error = new Error('Ouch!');
    error.code = 'E_CODE';

    log.issue('Found', { some: 'issue' }, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + '"data":{"some":"issue","code":"E_CODE"},'
      + `"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('does not modify given data object if error code is present', () => {
    const error = new Error('Ouch!');
    error.code = 'E_CODE';

    const data = { some: 'issue' };
    log.issue('Found', data, error);

    assert.deepEqual(data, { some: 'issue' });
  });

  it('logs data and error string', () => {
    log.issue('Found', { some: 'issue' }, 'Ouch!');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + '"data":{"some":"issue"},"stack":"Ouch!"}\n');
  });

  it('uses the given transform stream to serialize entries', () => {
    const entries = [];
    logger.transform(new Transform({
      writableObjectMode: true,
      transform(entry, enc, done) {
        entries.push(entry);
        done();
      }
    }));

    log.input('In');
    log.output('Out');

    assert.deepEqual(entries, [
      { ts: 123, ns: 'test', topic: 'input', msg: 'In' },
      { ts: 123, ns: 'test', topic: 'output', msg: 'Out' }
    ]);
  });

  it('returns same instance when requesting the same logger twice', () => {
    const a = logger('foo');
    const b = logger('foo');

    assert.strictEqual(a, b);
  });

  it('logs only data', () => {
    log.fetch({ host: 'javascript.studio', path: '/' });

    assert.equal(out, '{"ts":123,"ns":"test","topic":"fetch","data":'
      + '{"host":"javascript.studio","path":"/"}}\n');
  });

  it('logs only data and error', () => {
    log.issue({ id: 'studio' }, 'Oh!');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","data":'
      + '{"id":"studio"},"stack":"Oh!"}\n');
  });

  it('logs only error', () => {
    const error = new Error('Ouch');

    log.error(error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"error",'
      + `"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('logs only meta data', () => {
    log.timing();

    assert.equal(out, '{"ts":123,"ns":"test","topic":"timing"}\n');
  });

  it('logs base data', () => {
    logger('base', { base: 'data' }).ok('Text');

    assert.equal(out, '{"ts":123,"ns":"base","topic":"ok","msg":"Text",'
      + '"data":{"base":"data"}}\n');
  });

  it('replaces base data when creating new logger', () => {
    logger('base', { base: 'data' });
    logger('base', { base: 'changed' }).ok('Text');

    assert.equal(out, '{"ts":123,"ns":"base","topic":"ok","msg":"Text",'
      + '"data":{"base":"changed"}}\n');
  });

  it('mixes base data with log data', () => {
    const log = logger('test', { base: 'data' });
    log.ok({ and: 7 });
    log.ok({ or: 42 }); // Verify "and" is not copied into the base data

    assert.equal(out, ''
      + '{"ts":123,"ns":"test","topic":"ok","data":{"base":"data","and":7}}\n'
      + '{"ts":123,"ns":"test","topic":"ok","data":{"base":"data","or":42}}\n');
  });

});
