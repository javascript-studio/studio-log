# Changes

## 1.7.5

- 🐛 Adjust whitespace after emoji to be consistent

    > With Unicode 9 most emoji are rendered with the correct width now. Some
    > still need an extra space though. This changes the spacing to make them
    > look consistent.

## 1.7.4

- 🐛 Log all non-error related cause properties

    > Previously, only the `code` property of the cause error was logged. With
    > this change any property that is not `name`, `message` or `stack` is
    > added to the `data.cause` object.

## 1.7.3

- 🐛 Handle error like objects correctly

## 1.7.2

- 🐛 Fix --map if chunks have multiple lines

    > When passing `--map sourcemaps.map` to `emojilog`, the created transform
    > stream expected each chunk to contain a single line. With this change,
    > the sourcemaps lookup also works for multiline chunks.

- ✨ Use Sinon 5 default sandbox
- 📚 Fix typo in message docs

## 1.7.1

- 🐛 Fix unwiring filters

    > Filters must be unwired before re-configuring. This refactoring also
    > removes some duplication in reset.

## 1.7.0

- 🍏 Allow to add filters directly to a child namespace

## 1.6.0

- 🍏 Add source maps support

    > Use `--map source.js.map` to specify a source maps file.

## 1.5.1

- 🐛  Restore Node 4 compatibility
- 📚  Add `cause.js` example
- 📚  Move `demo.js` into examples dir

## 1.5.0

- 🍏 Serialize the error `cause` as a new JSON property
- 🍏 Serialize the error `code` into the `data` object
- 🍏 Serialize the error `cause.code` into the `data` object
- 🍏 Support the new `cause` property in the basic and fancy formatters
- 📚 Add new feature to docs and improve usage example and API docs
- 📚 Add cause example to demo

## 1.4.1

- ✨ Add install instructions

## 1.4.0

- 🍏 Add global log filter stream support

    > A global filter stream can be configured which will receive all log
    > entries before they are passed to the transform stream. This can be used
    > to enrich the log data with generic environment information.

- 🍏 Add support for logger base data

    > When creating a logger, a `data` property can be passed which will be
    > included in the `data` of each log entry.

- 🍏 Add support for child loggers

    > Child loggers have their namespace joined with their parent by a blank
    > and the `data` property of the parent and the child logger are merged.

- 🍏 Add `mute()` to logger instance
- 🐛 Do not invoke filters if out stream was removed

## 1.3.0

- 🍏 Add log instance filter stream support

    > Filters are object streams to modify the log data before passing it to
    > the transform stream. They can be used to x-out confidential information
    > or add generated information to log entries.

- ✨ Add npm 5 `package-lock.json`

## 1.2.0

The ndjson parsing and serialization was refactored into [a separate
module][studio-ndjson]. This enables error handling for serialization failures.

- 🍏 Use the [Studio ndjson][studio-ndjson] parser transform
- 🍏 Handle transform error events. If a transform error occurs, an error
  message is logged instead of throwing up the stack.
- 🍏 Replace the internal default transform with the more robust implementation
  from [Studio ndjson][studio-ndjson].
- ✨ Make log functions no-ops if no output is given. This avoids pointless
  `JSON.stringify` invocations and therefore improves performance a tiny bit.

[studio-ndjson]: https://github.com/javascript-studio/studio-ndjson

## 1.1.1

🐛 Fix screenshot image to work outside of GitHub

## 1.1.0

🍏 Add `hasStream()` to the API which returns whether an output stream was set.

## 1.0.5

Fixes and improvements for the fancy format transform.

- 🐛 Escape all non-printable characters. Print escape sequences, if available,
  and fall back to hex values. Do not escape emoji‼️
- 🐛 Escape newlines and tabs in strings (Fixes #3)
- 🐛 Format empty objects as `{}` without blanks (Fixes #1)
- 🐛 Format primitive data values (Fixes #4)

## 1.0.4

🙈 Support Node 4

## 1.0.3

✨ Handle non-json prefix in `emojilog`. Attempt to parse JSON starting from
the first occurrence of the `{` character. Anything before that is forwarded to
stdout.

## 1.0.2

🐛 Make it work with local symlinks

## 1.0.1

🙈 Disabled by default

## 1.0.0

✨ Initial release
