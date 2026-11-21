# OpenViet IME v1.4.3 — Release Notes

## Highlights
- Fixed characters/diacritics being swallowed when typing quickly in rich text editors (Telegram, StackEdit, ProseMirror/TipTap).
- Reduced typing lag caused by autosuggest and next-word prediction.
- Improved stability of contenteditable text replacement under fast input.

## Fixes
- **Rich text input race condition**: stale beforeinput guards no longer block repeated keys (e.g. VNI digits `1`, `2`, Telex tone keys `s`, `f`).
- **Previous word corruption**: removed unsafe `lastTransformed` fallback in contenteditable word extraction.
- **Performance**: deferred autosuggest and next-word prediction (150ms debounce) and lazy-loaded the suggestion host.
- **Autocomplete loading**: autocomplete learned model now loads in the background without blocking initial settings load.

## Tests
- Added regression tests for:
  - VNI tone removal and `đ` toggling
  - Macro variables (`$DATE`, `$TIME`, `$YEAR`, `$DATETIME`)
  - URL/email/code guards
  - Macro casing, suppression, punctuation snapping
  - Autocomplete prefix and next-word suggestions
  - Telex direct `w` → `ư` revert (`cw -> cư -> cw`)
- `npm test`: all tests pass.

## Build / Packaging
- Version bumped to **1.4.3**.
- Generated artifacts (`manifest.json`, `*.bundle.js`) are now gitignored.
- Firefox package: `web-ext-artifacts/openviet_ime-firefox-1.4.3.zip`

## Compatibility
- Chrome / Edge / Brave / Opera / Arc (Manifest V3)
- Mozilla Firefox (WebExtensions)
