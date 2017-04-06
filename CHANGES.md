# Changes

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
