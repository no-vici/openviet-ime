# Changelog

All notable changes to OpenViet IME will be documented in this file.

## [Unreleased]

### Added
- **Backtick FSM for Markdown & Code**: Automatically bypasses IME and macro expansion inside inline code (`` `...` ``) and fenced code blocks (```` ```...``` ````).
- **Sentence Momentum & Math Context**: Tracks `inEnglishContext` and `mathContextWordsRemaining` in `AvimEngine` to preserve English/math phrases (`the tree`, `sin and cos`, `he must see this room`).
- **Technical Delimiter & Path Protection**: Protects slash commands (`/compact`, `/aws`), module prefixes (`os.path`, `sys.argv`), blocks macro expansion next to technical delimiters (`./\@:()[]=&?`), and adds common Telex trap words (`cocoa`, `momo`, `mono`, `awkward`, `software`, `password`, etc.).
- **Acronym Bypass & Context-Aware Collision Resolution**: Protects 2–5 letter ALL-CAPS acronyms (`IOS`, `VPS`, `FPS`, `AWS`) and short English words (`is`, `as`, `this`, `has`, `see`) when following an English word (`prevWordWasEnglish`).
- **New Dynamic Macro Variables**: Added `$ISO_DATE` (`YYYY-MM-DD`) and `$WEEKDAY` (Vietnamese weekday name) in `MacroEngine`.
- **Live Inspector**: Added `AvimEngine.prototype.inspectState()` for debugging engine state.

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
