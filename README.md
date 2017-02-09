# Tiny JSON logger with 📣

Log [ndjson][1] to an output stream with emoji ✨

<img src="emojilog.png">

## Features

- Fancy formats with emoji for log file reading pleasure.
- API designed to produce expressive source code.
- Uses topics instead of log levels for more fine grained filtering.
- Uses object streams to avoid serialize -> parse -> serialize when used in a
  command line application.

## Usage

```js
const logger = require('@studio/log');

const log = logger('app');

log.launch('my service', { port: 433 });
```

If you install this module globally (`npm install @studio/log -g`), the
`emojilog` command line tool is made available. Use it to format logs:

```bash
$ node app.js | emojilog
```

## API

- `log = logger(ns)`: Creates a new logger with the given namespace. The
  namespace is added to each log entry as the `ns` property.
- `log.{topic}([message][, data][, error])`: Create a new log entry with these
  properties:
    - `ns`: The logger instance namespace.
    - `ts`: The timestamp as returned by `Date.now()`.
    - `topic`: The topic name.
    - `msg`: The message.
    - `data`: The data.
    - `stack`: The stack of error object.
- `logger.mute(namespace[, topic])`: Mute the given namespace or only the topic
  in the namespace, if given.
- `logger.muteAll(topic)`: Mute the given topic in all namespaces.
- `logger.out(stream)`: Configure the output stream to write logs to. Defaults
  to `process.stdout`.
- `logger.transform(stream)`: Configure a transform stream to format logs. The
  given stream must be in `objectMode`. See "Format Transforms" section further
  down. The default transform simply stringifies the entry and append a newline.
- `logger.reset()`: Resets everything to the defaults.

## Topics

Instead of log levels, this logger uses a set of topics to categorize, format
and filter logs. Unlike log levels, topics are not ordered by severity.

These topics are available:

- ✅ = `ok`
- ⚠️ = `warn`
- 🐛 = `issue`
- 🚨 = `error`
- 🙈 = `ignore`
- 🔺 = `input`
- 🔻 = `output`
- 📤 = `send`
- 📥 = `receive`
- 📡 = `fetch`
- 🏁 = `finish`
- 🚀 = `launch`
- ⛔️ = `terminate`
- ✨ = `spawn`
- 📣 = `broadcast`
- 💾 = `disk`
- ⏱  = `timing`
- 💰 = `money`
- 🔢 = `numbers`
- 👻 = `wtf`

## CLI Options

- `--format` or `-f`: Set the formatter to use. Defaults to "fancy".
- `--no-ts`: hide timestamps
- `--no-topic` hide topics
- `--no-ns` hide namespaces
- `--no-data` hide data
- `--no-stack` hide stacks
- `--stack message` only show the error message
- `--stack peek` show the message and the first line of the trace (default)
- `--stack full` show the message and the full trace
- `--stack` same as `--stack full`

## Format Transforms

Install a transform stream if you want to use `@sstudio/log` in a command line
application. The bundled transform streams have to be required separately:

```js
const formatter = require('@studio/log/format/basic');

logger.transform(formatter({ ts: false }));
```

The following transform streams are available:

- `basic`: Basic formatting with ISO dates and no colors
- `fancy`: Colored output with localized dates. This is the default formatter
  when using the `emojilog` CLI.

Some advanced formatting is applied by naming conventions on top level
properties of the `data` object. See [demo.js][2] for some examples.

- `ts` or prefix `ts_` formats a timestamp.
- `ms` or prefix `ms_` formats a millisecond value.
- `bytes` or prefix `bytes_` formats a byte value.

These options can be passed to the bundled format transforms:

- `ts: false` hide timestamps
- `topic: false` hide topics
- `ns: false` hide namespaces
- `data: false` hide data
- `stack: style` with these stack styles:
    - `false: hide the error entirely
    - `message` only show the error message
    - `peek` show the message and the first line of the trace (default)
    - `full` show the message and the full trace

## Custom Format Transforms

Format transforms are [node transform streams][3] in `writableObjectMode`. This
is the default transform implementation used to write [ndjson][1] logs:

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

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: http://ndjson.org/
[2]: https://github.com/javascript-studio/studio-log/blob/master/demo.js
[3]: https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream
