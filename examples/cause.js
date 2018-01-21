'use strict';

const logger = require('..').out(process.stdout);
const log = logger('Studio');

const error = new Error('Ouch!');
error.code = 'E_IMPORTANT';
error.cause = new Error('Where this is coming from');

log.issue('You should look at this', error);

