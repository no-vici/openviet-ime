# BUILD INSTRUCTIONS FOR MOZILLA ADD-ONS REVIEWERS

This document outlines the step-by-step instructions to reproduce the exact binary distribution of **OpenViet IME (v1.4.4)** from this source code package, as required by the [Mozilla Add-on Source Code Policy](https://extensionworkshop.com/documentation/publish/source-code-submission/).

---

## 1. Environment & Prerequisites

The build process is cross-platform and can run on Linux, macOS, or Windows (WSL/PowerShell).

- **Operating System**: Linux (Ubuntu 20.04+ / Debian 11+), macOS (12+), or Windows 10/11
- **Node.js**: >= v18.0.0 (Tested and verified with Node v20.x, v22.x, v26.x)
- **npm**: >= 9.0.0 (Tested with npm 10.x, 12.x)

To check your installed versions:
```bash
node -v
npm -v
```

If you do not have Node.js installed, download the official installer from [nodejs.org](https://nodejs.org/) or install via Node Version Manager (`nvm`):
```bash
nvm install 20
nvm use 20
```

---

## 2. Source Code Integrity

All source files in this repository (under `src/` and `test/`) are written in standard readable JavaScript / ECMAScript modules (ESM) and HTML/CSS:
- Source code is **not** obfuscated.
- Source code is **not** pre-transpiled.
- Third-party packages and bundlers are declared explicitly in `package.json`.

---

## 3. Step-by-Step Build Instructions

### Step 1: Install Dependencies
From the root directory of the extracted source code package, install the exact dependency tree from the committed `package-lock.json` (`esbuild`, `playwright`, `web-ext` and `@resvg/resvg-js` are pinned):
```bash
npm ci
```

### Step 2: Build & Package the Firefox Add-on
Run the automated build script:
```bash
npm run build:firefox
```

#### What this script executes behind the scenes:
1. **Bundles Content Script & Options Page** (`npm run bundle:extension`):
   ```bash
   esbuild src/content/content.js --bundle --outfile=src/content/content.bundle.js --format=iife --charset=utf8
   esbuild src/options/options.js --bundle --outfile=src/options/options.bundle.js --format=iife --charset=utf8
   ```
   *(Uses `esbuild` to package ES modules into an IIFE bundle without minification or obfuscation).*
2. **Applies Firefox WebExtensions Manifest**:
   ```bash
   cp manifest.firefox.json manifest.json
   ```
   *(Copies the Firefox-specific manifest containing Gecko IDs and background scripts fallback).*
3. **Packages into ZIP via `web-ext`**:
   ```bash
   npx web-ext build --overwrite-dest --filename=openviet_ime-firefox-{version}.zip --ignore-files=...
   ```
   Dev-only files (`test/`, `docs/`, `scripts/`, lockfiles, stale review dumps,
   logs and the non-active manifest) are excluded from the add-on ZIP. They remain
   in the clean source archive for reviewers.

---

## 4. Output Location & Verification

After running `npm run build:firefox`, the final add-on package will be generated at:
```
web-ext-artifacts/openviet_ime-firefox-1.4.4.zip
```
This `.zip` file is the Firefox package submitted to Mozilla Add-ons (AMO). A
reviewer rebuild is functionally equivalent; ZIP byte checksums may differ because
of file timestamps.

---

## 5. Automated Tests

The deterministic submission gate is the Node test suite. Reviewers can verify the typing engine, tone adjustments, auto-restore, URL/code guards, word boundaries, autocomplete and macro expansion by running:
```bash
npm test
```
Expected result for v1.4.4: **76 tests, 76 passed, 0 failed**.

An additional browser-based diagnostic suite is available but is **not** a submission gate and requires Playwright browsers to be installed first:
```bash
npx playwright install chromium
npm run test:e2e
```
The mock rich-editor scenarios in that suite are diagnostic only; the unit suite above is the reproducible verification target for this submission.

