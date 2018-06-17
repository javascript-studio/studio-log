/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { Writable } = require('stream');
const { Transform } = require('stream');
const logger = require('..');

describe('filter', () => {
  let clock;
  let out;
  let log;
  let entries;

  beforeEach(() => {
    out = '';
    entries = [];
    clock = sinon.useFakeTimers();
    clock.tick(123);
    log = logger('test');
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  function installOutputStream() {
    logger.out(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
  }

  function createFilterStream() {
    return new Transform({
      objectMode: true,
      transform(entry, enc, callback) {
        entries.push(entry);
        this.push(entry);
        callback();
      }
    });
  }

  it('writes to given filter if output is installed first', () => {
    installOutputStream();
    log.filter(createFilterStream());

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('writes to given filter if output is installed after', () => {
    log.filter(createFilterStream());
    installOutputStream();

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('stops writing to filter after reset I', () => {
    log.filter(createFilterStream());
    installOutputStream();

    logger.reset();
    installOutputStream();
    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries, []);
  });

  it('stops writing to filter after reset II', () => {
    log.filter(createFilterStream());
    // No output and therefore no default transform

    logger.reset();
    installOutputStream();
    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries, []);
  });

  it('stops invoking filter if out is uninstalled', () => {
    installOutputStream(); // Creates default transform
    logger.out(null);
    log.filter(createFilterStream());

    log.ok('Logs');

    assert.equals(out, '');
    assert.equals(entries, []);
  });

  it('writes to global filter (I)', () => {
    installOutputStream();
    logger.filter(createFilterStream());

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('writes to local and global filter (I)', () => {
    installOutputStream();
    log.filter(createFilterStream());
    logger.filter(createFilterStream());

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries[0], {
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    });
    assert.equals(entries[0], entries[1]);
  });

  it('writes to local and global filter (II)', () => {
    installOutputStream();
    logger.filter(createFilterStream());
    log.filter(createFilterStream());

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries[0], {
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    });
    assert.equals(entries[0], entries[1]);
  });

  it('writes to local and global filter (III)', () => {
    log.filter(createFilterStream());
    logger.filter(createFilterStream());
    installOutputStream();

    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.equals(entries[0], {
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    });
    assert.equals(entries[0], entries[1]);
  });


  it('installs filter on global logger for given namespace', () => {
    installOutputStream();
    logger.filter('test', createFilterStream());

    log.ok('Message');

    assert.equals(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('installs filter on child logger for given namespace', () => {
    installOutputStream();
    log.filter('foo', createFilterStream());

    log.child('foo').ok('Message');

    assert.equals(entries, [{
      ts: 123,
      ns: 'test foo',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

});
