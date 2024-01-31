# Changes

## 2.1.3

- 🐛 [`3dbde57`](https://github.com/javascript-studio/studio-log/commit/3dbde57028ee262a35adc43d3671dbd920c5df55)
  Allow stream to be null
- 🐛 [`d23708a`](https://github.com/javascript-studio/studio-log/commit/d23708abe22b4744b6af537d1e8400f2e6a71f8b)
  Improve log error typing
- 🐛 [`de9d125`](https://github.com/javascript-studio/studio-log/commit/de9d12587c57a7733d38eaf80761a7fbdcc9070c)
  Fix missing base data when logging error only

_Released by [Maximilian Antoni](https://github.com/mantoni) on 2024-01-31._

## 2.1.2

- 🐛 [`b786cbd`](https://github.com/javascript-studio/studio-log/commit/b786cbdffe9b064a200e21337e41fa8f1b4dae39)
  Handle weird errors in stack helper
- 🐛 [`112e615`](https://github.com/javascript-studio/studio-log/commit/112e615f0d9179993b99128de79ba543def341d3)
  Fix test in Safari

_Released by [Maximilian Antoni](https://github.com/mantoni) on 2024-01-29._

## 2.1.1

- 🐛 [`88a50b7`](https://github.com/javascript-studio/studio-log/commit/88a50b7bc02b9e19dd73e4264445371b6cdee3b7)
  Include error message in stack if name is missing
- ✨ [`8510c8f`](https://github.com/javascript-studio/studio-log/commit/8510c8fe0c3da4777809d3919736453358e52364)
  Run tests with local safari
- ✨ [`318c73b`](https://github.com/javascript-studio/studio-log/commit/318c73bbdc16e681a77e6f1fb77521da6ddc8e34)
  Expose stack helper on logger

_Released by [Maximilian Antoni](https://github.com/mantoni) on 2024-01-29._

## 2.1.0

- 🍏 [`45073bc`](https://github.com/javascript-studio/studio-log/commit/45073bc3f379cbe08985a559ce938de831bf7f79)
  Always include error name and message in stack
- 🍏 [`7b5934f`](https://github.com/javascript-studio/studio-log/commit/7b5934f403b03b2c7cddb30ad74777071b7fabe9)
  Add typescript
- 🐛  [`03e6a5f`](https://github.com/javascript-studio/studio-log/commit/03e6a5f1e3e681fcddd413e7cd3fe284c14c020f)
  Remove broken error handler
- ✨ [`dff39b6`](https://github.com/javascript-studio/studio-log/commit/dff39b62adcbb9a17752fbc70a2995df966b6c58)
  Use new mochify with esbuild and upgrade mocha
- ✨ [`2b22838`](https://github.com/javascript-studio/studio-log/commit/2b22838e00b7502295b7a2ec3eed1cf9f3b79218)
  Add GitHub action
- ✨ [`05886d9`](https://github.com/javascript-studio/studio-log/commit/05886d9e2cc6a7fb9ee0746b7f9c50443045011b)
  Upgrade Studio Changes
- ✨ [`770dc13`](https://github.com/javascript-studio/studio-log/commit/770dc138d3b0b2189aa0548905899cc5da6f8d95)
  Upgrade referee-sinon
- ✨ [`eb54bac`](https://github.com/javascript-studio/studio-log/commit/eb54bac12923f67cd155cc463209366392e7c3e2)
  Upgrade eslint config and update eslint

_Released by [Maximilian Antoni](https://github.com/mantoni) on 2024-01-28._

## 2.0.0

With this release, Studio Log becomes a tiny 3.3KB library. Formatters and the
CLI have been moved to separate modules and with the new `console` format,
Studio Log can be used in browsers too.

The most important API change is the removal of the default transform.
Updated examples of how to configure the logger can be found in the README.

- 💥 [`3750908`](https://github.com/javascript-studio/studio-log/commit/37509087ea324ed19158431bd3eebf748c0b919b)
  __BREAKING__: Slim down API

    > - Change `out` to `pipe` and let it return the stream instead of the
    >   logger.
    > - Remove `transform`. Use stream pipes instead.
    > - Remove `mute` and `muteAll`. Use a custom transform instead.
    > - Remove `filter`. Use a custom trnasform instead.
    > - Remove default transform. Add a serializing transform like Studio
    >   ndjson to the pipeline yourself.

- 💥 [`8da64cc`](https://github.com/javascript-studio/studio-log/commit/8da64cc19b7f36140ce07e456d1080753f41e010)
  __BREAKING__: Extract format and CLI modules

    > - Move topics into `@studio/log-topics` module
    > - Move format into `@studio/log-format` module
    > - Move emojilog into `@studio/emojilog` module

- 📚 [`612f818`](https://github.com/javascript-studio/studio-log/commit/612f818ddf24c1953068df49497c44a5150ebe47)
  Document v2.0 API changes
- 📚 [`eca4548`](https://github.com/javascript-studio/studio-log/commit/eca4548ac425a3905b71a27b6f0068670077a815)
  Improve "Transform streams" documentation
- 📚 [`6096722`](https://github.com/javascript-studio/studio-log/commit/6096722f9f1616bf5bb089f7bf7d92a0bca2aef0)
  Use new Studio Changes `--commits` feature
- ✨ [`281934c`](https://github.com/javascript-studio/studio-log/commit/281934c63451728c0faca7180cc2e91ca0c014bf)
  Add test runner for browser support
- ✨ [`583ed68`](https://github.com/javascript-studio/studio-log/commit/583ed68e631344d40f9cf9c5624e2e6a1bea705c)
  Use Sinon + Referee

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
