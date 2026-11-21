# Message to Mozilla Add-ons Reviewers

## Add-on
- **Name**: OpenViet IME
- **Version**: 1.4.3
- **Type**: Cross-browser Vietnamese Input Method Editor (IME) and macro engine

## Source Code
- All source files are under `src/` and `test/` in standard, readable JavaScript (ESM).
- No obfuscation, no pre-transpilation of source modules.
- Build instructions are in `BUILD.md`.

## Build Instructions
```bash
npm install
npm run bundle:firefox
```
Output:
```
web-ext-artifacts/openviet_ime-firefox-1.4.3.zip
```

## Automated Tests
```bash
npm test
```
All tests pass (`0` failures).

## Permissions
- `storage`: save settings, macros, user dictionary, learned habits (local/sync).
- `activeTab`: interact with the active tab for IME functionality.
- `clipboardRead`: used only for the `$CLIPBOARD` macro variable when explicitly triggered by the user.

## Privacy / Network
- No external network requests, telemetry, or tracking.
- All learning (bigrams, erase habits) is stored locally in the browser.

## Notes for Reviewers
- Content scripts run on `<all_urls>` because the extension provides Vietnamese input on any web page.
- Canvas-based editors (Google Docs, Figma, Canva, Miro) are explicitly blacklisted.
- Password, email, number, tel, and other sensitive input types are excluded.
- Shadow DOM is used for the suggestion ribbon to avoid CSS collisions.
