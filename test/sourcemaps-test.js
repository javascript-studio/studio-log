/*eslint-env mocha*/
/*eslint-disable no-sync*/
'use strict';

const fs = require('fs');
const { Transform } = require('stream');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const uglify = require('uglify-es');
const sourcemaps = require('../lib/sourcemaps');

describe('sourcemaps', () => {
  let output;
  let out;

  beforeEach(() => {
    output = '';
    out = new Transform({
      transform: (chunk, enc, callback) => {
        output += chunk;
        callback(null, chunk);
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('maps sources', (done) => {
    const script = `function test() {
      unknown()
    }
    test()`;
    const result = uglify.minify(script, {
      sourceMap: { filename: 'test.js' }
    });
    sinon.replace(fs, 'readFileSync',
      sinon.fake.returns(JSON.stringify(result.map)));

    const stream = sourcemaps('source.js.map', out);

    out.on('finish', () => {
      assert.calledOnce(fs.readFileSync);
      assert.calledWith(fs.readFileSync, 'source.js.map', 'utf8');
      assert.equals(output, 'at unknown (0:2:6)\n');
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

    sinon.replace(fs, 'readFileSync',
      sinon.fake.returns(JSON.stringify(result.map)));

    const stream = sourcemaps('source.js.map', out);

    out.on('finish', () => {
      assert.equals(output, 'at xyz (any.js:5:17)\n');
      done();
    });

    stream.write('at xyz (any.js:5:17)\n');
    stream.end();
  });

});
