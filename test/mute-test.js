/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { Writable } = require('stream');
const logger = require('..');

describe('mute', () => {
  let clock;
  let out;
  let log;

  beforeEach(() => {
    out = '';
    clock = sinon.useFakeTimers();
    logger.out(new Writable({
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

  it('mutes a namespace', () => {
    logger.mute('test');

    log.ok('Message');
    logger('other').ok('Other');

    assert.equals(out, '{"ts":123,"ns":"other","topic":"ok","msg":"Other"}\n');
  });

  it('mutes a logger namesapce', () => {
    log.mute();

    log.ok('Message');
    logger('other').ok('Other');

    assert.equals(out, '{"ts":123,"ns":"other","topic":"ok","msg":"Other"}\n');
  });

  it('mutes a topics in a namesapce', () => {
    logger.mute('test', 'ignore', 'wtf');

    log.ignore('Whatever');
    log.wtf('Huh?!');
    log.ok('Message');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
  });

  it('mutes a topics in all namesapces', () => {
    logger.muteAll('ignore', 'wtf');

    log.ignore('Whatever');
    log.ok('Message');
    log.wtf('Huh?!');
    logger('other').wtf('Oi!');

    assert.equals(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
  });

  it('returns self for "mute"', () => {
    const r = logger.mute('test');

    assert.same(r, logger);
  });

  it('returns self for "muteAll"', () => {
    const r = logger.muteAll('test');

    assert.same(r, logger);
  });

});
