# AMO Submission — OpenViet IME 1.4.4

## Release Title

**OpenViet IME 1.4.4 — Telex `w` control & rich-editor stability**

---

## Release Notes (Markdown)

### OpenViet IME 1.4.4

This release focuses on typing stability in rich editors and gives users explicit control over the Telex `w` key.

#### Added

- **User-controlled `w → ư/ơ/ă` switch** in both the popup and Options page (`Biến w thành ư/ơ/ă (Telex)`):
  - **ON (default)** keeps the Non-Start policy: `thw → thư`, `uow → ươ`, while word-initial `w` stays Latin (`web`, `wifi`, `wife`, `world`, `ward`, `worf`).
  - **OFF** keeps **every** `w` literal, so `sway` stays `sway` and `thw` stays `thw`.
- **`sway` and `manjaro` added to the default English trap dictionary**, so they auto-restore on a delimiter instead of becoming `sưay` / `mẩno`.
- Optional vnchKey-style features: `autoSpaceAfterPunctuation`, `autoCapitalizeProperNouns`, and `backspaceBySyllable` — **all disabled by default**.
- New regression suites for the `w` opt-out, NFD/zero-width word boundaries, and auto-restore hot paths.

#### Changed

- **Removed "Sentence Momentum & Math Context"** heuristics. Auto-restore is now conservative (dictionary and phonology based) to avoid swallowing accents in Telegram, GitHub, ProseMirror/TipTap and other rich editors.
- **Autocomplete is faster**: prefix-bucketed indexes are built lazily and learned scores are computed only for words that actually match the typed prefix.
- Background defaults now include `typeW2U`, `wToUEnabled` and `smartHorn` to prevent settings-schema drift between popup, Options and the content script.
- `spellCheck` and `autoCapitalize` now default to `false`; `backspaceBySyllable` is scoped to the word currently being typed.
- `BUILD.md` now documents the canonical `npm run build:firefox` command and the deterministic `npm test` gate.

#### Fixed

- Turning the `w` switch off no longer rewrites `sway` to `sưay`.
- Word extraction now preserves NFD combining marks and ignores editor-injected zero-width markers.
- Delimiter handling recovers the last IME transform when a rich editor's extracted text goes stale.
- Fixed a `ReferenceError` in the auto-restore reverse fallback and reset the word session when auto-restore is disabled.
- The lazy suggestion host is no longer mounted when the suggestion style is `off`.

---

## Message to Reviewers

```text
Hello AMO reviewers,

OpenViet IME 1.4.4 is a stability and maintenance release for Vietnamese Telex/VNI
input. It does not introduce new permissions, remote code, network calls, or data
collection.

Submission contents
- Firefox add-on: openviet_ime-firefox-1.4.4.zip
- Clean source:    openviet_ime-1.4.4-source.zip
- Build/test guide: BUILD.md (also included in the source zip)

Reproduction
  npm install
  npm run build:firefox
  npm test          # 76 tests, 76 passed, 0 failed

Notes for review
1. All readable source lives under src/ as ES modules. The generated files
   manifest.json and src/{content,options}/*.bundle.js are gitignored and created
   at build time by esbuild (unminified IIFE); they are intentionally absent from
   the clean source archive. The add-on ZIP excludes dev-only files (tests, docs,
   scripts, lockfiles, logs and stale review dumps); the clean source archive keeps
   them for reproducibility.
2. esbuild and web-ext are declared devDependencies in package.json. They are used
   only for bundling/packaging and are not shipped as runtime remote code.
3. The previously used "Sentence Momentum & Math Context" heuristics were removed
   because they caused accents to be swallowed in rich editors. Auto-restore is now
   driven by conservative dictionary/phonology checks and an explicit word session.
4. The new wToUEnabled switch is a user-facing Telex modifier control. Default ON
   preserves the established Non-Start behavior (initial w stays Latin); OFF keeps
   every w literal. This is local-only and stored in browser.storage.sync.
5. Optional vnchKey-style helpers are disabled by default, so the default typing
   behavior remains close to v1.4.3 except for the stability fixes above.

The optional Playwright diagnostic suite (npm run test:e2e) requires browser
binaries and mock-editor fixtures; it is not the submission gate. The deterministic
gate is npm test.

Please let me know if you need anything else to complete the review.

Thanks,
OpenViet IME maintainer
```
