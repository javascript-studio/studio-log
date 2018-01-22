/*eslint-env mocha*/
/*eslint-disable no-sync*/
'use strict';

const assert = require('assert');
const fs = require('fs');
const Transform = require('stream').Transform;
const sinon = require('sinon');
const uglify = require('uglify-es');
const sourcemaps = require('../lib/sourcemaps');

describe('sourcemaps', () => {
  let sandbox;
  let output;
  let out;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(fs, 'readFileSync');
    output = '';
    out = new Transform({
      transform: (chunk, enc, callback) => {
        output += chunk;
        callback(null, chunk);
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('maps sources', (done) => {
    const script = `function test() {
      unknown()
    }
    test()`;
    const result = uglify.minify(script, {
      sourceMap: { filename: 'test.js' }
    });

    fs.readFileSync.returns(JSON.stringify(result.map));

    const stream = sourcemaps('source.js.map', out);

    out.on('finish', () => {
      sinon.assert.calledOnce(fs.readFileSync);
      sinon.assert.calledWith(fs.readFileSync, 'source.js.map', 'utf8');
      assert.equal(output, 'at unknown (0:2:6)');
      done();
    });

    stream.write('at xyz (any.js:1:17)\n');
    stream.end();
  });

  it('does not change row if no match', (done) => {
    const script = `function test() {
      unknown()
    }
    test()`;
    const result = uglify.minify(script, {
      sourceMap: { filename: 'test.js' }
    });

    fs.readFileSync.returns(JSON.stringify(result.map));

    const stream = sourcemaps('source.js.map', out);

    out.on('finish', () => {
      assert.equal(output, 'at xyz (any.js:5:17)\n');
      done();
    });

    stream.write('at xyz (any.js:5:17)\n');
    stream.end();
  });

});
