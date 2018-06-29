# Studio Log 2

👻 Log [ndjson][1] to an output stream, pretty print the output with emoji ✨

![](https://github.com/javascript-studio/studio-log/raw/master/emojilog.png)

> __Note!__ Version 2 has significantly changed compared to the [original
> announcement][medium]. Make sure to read the release notes for migration
> instructions!

[medium]: https://medium.com/javascript-studio/introducing-a-new-ndjson-logger-with-7bb5b95e3b

## Features

- API designed to produce expressive source code.
- Uses topics instead of log levels for more fine grained filtering.
- Uses object streams to avoid serialize -> parse -> serialize when used in a
  command line application.
- Disabled by default. If no output stream is specified, no logs are written.

## Usage

Log output is disabled by default to ensure logs don't get in the way when
writing unit tests. Therefore you want to set this up as the first thing in
your main:

```js
// Sending raw ndJSON logs to stdout, e.g. in a server application:
const Stringify = require('@studio/ndjson/stringify');
require('@studio/log')
  .pipe(new Stringify())
  .pipe(process.stdout);

// Sending fancy formatted logs to stdout, e.g. in a command line tool:
const Format = require('@studio/log-format/fancy');
require('@studio/log')
  .pipe(new Format())
  .pipe(process.stdout);

// Sending logs to console.log, e.g. in a browser:
const Format = require('@studio/log-format/console');
require('@studio/log')
  .pipe(new Format())
```

Next, create a logger instance in a module and start writing logs:

```js
const logger = require('@studio/log');

const log = logger('app');

exports.startService = function (port) {
  log.launch('my service', { port: 433 });
};

```

In the server example above, this output is produced:

```json
{"ts":1486630378584,"ns":"app","topic":"launch","msg":"my service","data":{"port":433}}
```

Send your logs to the [emojilog][4] CLI for pretty printing:

```bash
❯ cat logs.ndjson | emojilog
09:52:58 🚀 app my service port=433
```

## Install

```bash
❯ npm i @studio/log
```

## Topics

Instead of log levels, this logger uses a set of topics. Unlike log levels,
topics are not ordered by severity.

These topics are available: `ok`, `warn`, `error`, `issue`, `ignore`, `input`,
`output`, `send`, `receive`, `fetch`, `finish`, `launch`, `terminate`, `spawn`,
`broadcast`, `disk`, `timing`, `money`, `numbers` and `wtf`.

Topics and their mapping to emojis are defined in the [Studio Log Topics][8]
project.

## Log format

- `ns`: The logger instance namespace.
- `ts`: The timestamp as returned by `Date.now()`.
- `topic`: The topic name.
- `msg`: The message.
- `data`: The data.
- `stack`: The stack of error object.
- `cause`: The cause stack of `error.cause` object, if available.

## API

### Creating a logger

- `log = logger(ns[, data])`: Creates a new logger with the given namespace.
  The namespace is added to each log entry as the `ns` property. If `data` is
  provided, it is added to each log entry. Multiple calls with the same `ns`
  property return the same logger instance while data is replaced.
- `log.child(ns[, data])`: Creates a child logger of a log instance. The
  namespaces are joined with a blank and `data` is merged. Multiple calls with
  the same `ns` property return the same logger instance while data is
  replaced.

### Log instance API

- `log.{topic}([message][, data][, error])`: Create a new log entry with these
  behaviors:
    - The `topic` is added as the `"topic"`.
    - If `message` is present, it's added as the `"msg"`.
    - If `data` is present, it's added as the `"data"`.
    - If `error` is present, the `stack` property of the error is added as the
      `"stack"`. If no `stack` is present, the `toString` representation of the
      error is used.
    - If `error.code` is present, it is added to the `"data"` without modifying
      the original object.
    - If `error.cause` is present, the `stack` property of the cause is added
      as the `"cause"`. If no `stack` is present, the `toString` representation
      of the cause is used.
    - If `error.cause.code` is present, a `cause` object is added to the
      `"data"` with `{ code: cause.code }` and without modifying the original
      object.

### Module API

- `logger.pipe(stream)`: Configure the output stream to write logs to. If not
  specified, no logs are written. Returns the stream.
- `logger.hasStream()`: Whether a stream was set.
- `logger.reset()`: Resets the internal state.

## Transform streams

Transform streams can be used to alter the data before passing it on. For
example, [Studio Log X][7] is a Transform stream that can remove confidential
data from the log data and [Studio Log Format][6] project implements the
`basic`, `fancy` and `console` pretty printers.

Format transforms are [node transform streams][3] in `writableObjectMode`. Here
is an example implementation, similar to the [ndjson stringify transform][5]:

```js
const { Transform } = require('stream');

const ndjson = new Transform({
  writableObjectMode: true,

  transform(entry, enc, callback) {
    const str = JSON.stringify(entry);
    callback(null, `${str}\n`);
  }
});
```

## Related modules

- 🌈 [Studio emojilog][4] is a command line tool that parses and pretty prints
  the Studio Log ndjson format.
- ☯️ [Studio ndjson][5] can be used to parse the ndjson produced by Studio log.
- 🎩 [Studio Log Format][6] pretty prints Studio Log streams.
- ❎ [Studio Log X][7] x-out confidential data in log entries.
- 🏷 [Studio Log Topics][8] defines the topics used by Studio Log.
- 📦 [Studio Changes][9] is used to create the changelog for this module.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: http://ndjson.org/
[2]: https://github.com/javascript-studio/studio-log/blob/master/examples/demo.js
[3]: https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream
[4]: https://github.com/javascript-studio/studio-emojilog
[5]: https://github.com/javascript-studio/studio-ndjson
[6]: https://github.com/javascript-studio/studio-log-format
[7]: https://github.com/javascript-studio/studio-log-x
[8]: https://github.com/javascript-studio/studio-log-topics
[9]: https://github.com/javascript-studio/studio-changes
