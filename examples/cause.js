'use strict';

const logger = require('..');
const Stringify = require('@studio/ndjson/stringify');

logger.pipe(new Stringify()).pipe(process.stdout);

const log = logger('Studio');

/** @type {Object} */
const error = new Error('Ouch!');
error.code = 'E_IMPORTANT';
error.cause = new Error('Where this is coming from');

log.issue('You should look at this', error);
