# Changes

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
