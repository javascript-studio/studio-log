/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Writable = require('stream').Writable;
const logger = require('..');

describe('mute', () => {
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

  it('returns self for "mute"', () => {
    const r = logger.mute('test');

    assert.strictEqual(r, logger);
  });

  it('returns self for "muteAll"', () => {
    const r = logger.muteAll('test');

    assert.strictEqual(r, logger);
  });

});
