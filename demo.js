/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const logger = require('.').out(process.stdout);

const log = logger('Studio');

log.ok('Hello emoji log!');
log.warn('This might come at a surprise', { ms_timeout: 15000 });
log.error('Shit happens', new Error('Oh noes!'));
log.error('Or just a string', {}, 'Oh noes!');
log.error(new Error('Or only an error'));
log.issue('This might be an issue', { ms_slow: 567 });
log.ignore('Yeah, whaterver ...', { some: 'random stuff' });
log.input('Input received', { headers: { 'Content-Length': 12 } });
log.output('Output sent', { body: { answer: 42, status: 'OK' } });
log.send('Sending things', { bytes_size: 45643 });
log.receive('Receiving things', { bytes_size: 2000000 });
log.fetch('Fetched', { ms: 42 });
log.finish('Done');
log.launch('Starting service', { name: 'Studio', ts_down_since: Date.now() });
log.terminate('Killed service', { name: 'Studio', ts_started: Date.now() });
log.spawn('Exciting tings');
log.broadcast('Let the world know', { list: [1, 2, 3, 5, 8, 13, 21] });
log.broadcast({ just: 'the', data: '!' });
log.disk('Writing file', { path: '/foo/bar.txt' });
log.timing('Roundtrip', { ms: 789 });
log.money('Received', { amount: 95 });
log.numbers('Some stats', { a: 21, b: 13, c: 8 });
log.wtf('WTF?!', {
  special: '\x00\x07\x08\x09\x0a\x0b\x0c\x0d\x1b',
  hex: '\x01\x7f',
  emoji: '\ud83c\udf89'
});
log.wtf();
