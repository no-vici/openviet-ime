# Changelog

All notable changes to OpenViet IME will be documented in this file.

## [1.4.3] - 2026-11-21

### Added
- Regression tests for VNI tone removal, macro variables, URL/code guards, macro/autocomplete edge cases, and Telex `w` revert.
- Lazy-loaded suggestion host and deferred autocomplete model loading to reduce per-page overhead.
- Prefix-bucketed autocomplete indexes with lazy construction; scoring is computed only for matching words.
- User-facing `wToUEnabled` switch in popup and Options: ON keeps Non-Start Telex (`thw -> thư`, but `web/wifi` stay Latin); OFF keeps every `w` literal so `sway` no longer becomes `sưay`.
- Added `sway` and `manjaro` to the default English trap dictionary so they auto-restore on delimiter.

### Changed
- Autosuggest and next-word prediction are debounced (150ms) to avoid typing lag.
- Background defaults now include `typeW2U`, `wToUEnabled` and `smartHorn` to avoid schema drift between popup/options/content.
- Removed "Sentence Momentum & Math Context" tracking to improve IME stability.
- Generated artifacts (`manifest.json`, `*.bundle.js`) are now gitignored.

### Fixed
- Fixed characters/diacritics being swallowed when typing quickly in rich text editors (Telegram, StackEdit, ProseMirror/TipTap).
- Fixed stale beforeinput guards blocking repeated keys (VNI digits, Telex tone keys).
- Fixed stale contenteditable word extraction corrupting the previous word.
- Fixed rich editor delimiter handling to recover lost accents from the last IME transform.
- Fixed word-boundary extraction for NFD combining marks and editor-injected zero-width markers.
- Fixed a `ReferenceError` in the auto-restore reverse fallback that could crash on trap words.
- Reset the word session when auto-restore is disabled to prevent unbounded raw-buffer growth.
- Avoid mounting the lazy suggestion host when the suggestion style is `off`.
- Restored Firefox `browser_specific_settings` in `manifest.json` after accidental overwrite.

## [1.4.2] - 2026-11-20

### Changed
- Disabled auto-complete, next-word prediction, and suggestion ribbon by default (`autoCompleteEnabled`, `nextWordEnabled`, `suggestionStyle: 'off'`).
- Defaulted `markdownCodeLock` to `false`.

### Fixed
- Fixed Escape leaking to web apps when exiting backtick code mode.
- Fixed NFD offset delta in contenteditable replacement.
- Fixed VNI `đ` regression and duplicate beforeinput handling.

## [1.4.1] - 2026-11-19

### Fixed
- Fixed a `ReferenceError` in `content.js` (`Backtick FSM` reading `key` before `const key = event.key` initialization) that blocked Vietnamese typing in v1.4.0.
- Added `nghía` to the Vietnamese dictionary (`src/engine/vietnamese-words.js`).

## [1.4.0] - 2026-11-19

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
