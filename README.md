# Tiny JSON logger with ❤️

Log [ndjson][1] to an output stream with emoji ✨

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

## Philosophy

- Work with object streams internally to avoid unnecessary serialization &
  parsing when using in a command line application.
- API designed to produce expressive source code.
- Use topics instead of log levels. This allow more fine grained filtering and
  more expressive display.
- Fancy formats with emoji for log file reading pleasure.

## API

- `log = logger(ns)`: Creates a new logger with the given namespace. The
  namespace is added to each log entry as the `ns` property.
- `log.{topic}(message[, data][, error])`: Create a new log entry with these
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

## Format Transforms

The following transform streams are bundled with `@studio/log`, but have to be
required separately:

```js
const formatter = require('@studio/log/format/basic');

logger.transform(formatter({ ts: false }));
```

- `basic`: Basic formatting as specified below.
- `fancy`: Colored output for the console. This is the default formatter when
  using the `emojilog` CLI.

These formatting rules are applied by naming conventions:

- `ts` or prefix `ts_` formats a timestamp as "2017-02-08T07:27:49.774Z".
- `ms` or prefix `ms_` formats a millisecond value.
- `bytes` or prefix `bytes_` formats a byte value.
- `topic` is replaced with the corresponding emoji.

These options can be passed to change what is shown:

- `ts: false` hide timestamps
- `topic: false` hide topics
- `ns: false` hide namespaces
- `data: false` hide data
- `stack: false` hide stacks

## CLI Options

- `--format` or `-f`: Set the formatter to use. Defaults to "fancy".
- `--no-ts`: hide timestamps
- `--no-topic` hide topics
- `--no-ns` hide namespaces
- `--no-data` hide data
- `--no-stack` hide stacks

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: http://ndjson.org/
