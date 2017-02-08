/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { Transform, Writable } = require('stream');
const logger = require('..');

describe('logger', () => {
  let sandbox;
  let out;
  let log;

  beforeEach(() => {
    out = '';
    sandbox = sinon.sandbox.create({ useFakeTimers: true });
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

  it('logs a line to stdout', () => {
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

  it('logs data and error object', () => {
    const error = new Error('Ouch!');

    log.issue('Found', { some: 'issue' }, error);

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + `"data":{"some":"issue"},"stack":${JSON.stringify(error.stack)}}\n`);
  });

  it('logs data and error string', () => {
    log.issue('Found', { some: 'issue' }, 'Ouch!');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"issue","msg":"Found",'
      + '"data":{"some":"issue"},"stack":"Ouch!"}\n');
  });

  it('mutes a namespace', () => {
    logger.mute('test');

    log.ok('Message');
    logger('other').ok('Other');

    assert.equal(out, '{"ts":123,"ns":"other","topic":"ok","msg":"Other"}\n');
  });

  it('mutes a topics in a namesapce', () => {
    logger.mute('test', 'ignore', 'wtf');

    log.ignore('Whatever');
    log.wtf('Huh?!');
    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
  });

  it('mutes a topics in all namesapces', () => {
    logger.muteAll('ignore', 'wtf');

    log.ignore('Whatever');
    log.ok('Message');
    log.wtf('Huh?!');
    logger('other').wtf('Oi!');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
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

});
