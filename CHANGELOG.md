# Changelog

All notable changes to OpenViet IME will be documented in this file.

## [1.3.0] - 2026-11-18

### Added
- **Dynamic `$CLIPBOARD` Macro Variable**: Expand macros with live clipboard text (e.g. `+cb` -> `$CLIPBOARD`) while preserving original casing.
- **Quick Case Cycling (`Ctrl + Shift + U`)**: Cycle the active word between `lowercase`, `UPPERCASE`, and `Title Case` in `<input>`, `<textarea>`, and `contenteditable` editors.
- **New Macro Presets**: Added one-click **Dev & Git** (`DEV_GIT_MACROS`) and **Math & Science** (`MATH_SCIENCE_MACROS`) macro presets in Options.
- **Technical Token Protection**: Automatically protects CSS units (`10px`, `2rem`, `50vh`, `100ms`) and short Git commit hashes from accidental Vietnamese diacritics.

### Fixed
- Prevented `eraseHabitLearning` from blacklisting valid Vietnamese dictionary words (e.g. `cá`, `toán`) when erased.
- Added a 500-entry FIFO cap to `erasedWordHabits` to prevent unbounded memory growth in long-lived tabs.
- Fixed `UserDictionary.importText` to properly register imported words in `customWords` and refresh the autocomplete index.
- Synced `avim_domain_methods` updates across open tabs via `storage.onChanged` in the service worker.
- Fixed `adoptWordBeforeBackspace` raw key reconstruction and Options tone style fallback (`classic`).
- Updated `scripts/set-version.js` to automatically sync version numbers in `README.md`, `README.vi.md`, and `src/popup/popup.html`.
