# OpenViet IME - Modern Cross-Browser Vietnamese Input & Macro Engine

<div align="center">
    <img src="src/assets/icon128.png" alt="OpenViet IME Logo" width="128" height="128" />


[![Vietnamese IME](https://img.shields.io/badge/IME-Vietnamese-blue?style=flat-square)](#)
[![Input Methods](https://img.shields.io/badge/Methods-Auto%20|%20Telex%20|%20VNI-indigo?style=flat-square)](#)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?style=flat-square)](#)
[![Firefox WebExtension](https://img.shields.io/badge/Firefox-WebExtension-orange?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](#)
[![AI-Assisted](https://img.shields.io/badge/AI%20Assisted-Google%20Gemini-8E75C2?logo=google-gemini&logoColor=white)](https://gemini.google.com)

</div>

A high-performance, cross-browser Vietnamese Input Method Editor (IME) and text-expansion macro engine. Designed for modern web browsers (Chrome, Edge, Brave, Opera, Arc, Firefox) as both a Manifest V3 browser extension and a standalone web application.

> 🌐 **Bản tiếng Việt**: [Đọc tài liệu tiếng Việt tại README.vi.md](./README.vi.md)

---

## Table of Contents

1. [Key Features](#key-features)
2. [Typing Methods & Orthography Rules](#typing-methods--orthography-rules)
   - [Adaptive Auto Mode](#adaptive-auto-mode)
   - [VNI Input Method](#vni-input-method)
   - [Telex Input Method & Key `z` Tone Removal](#telex-input-method--key-z-tone-removal)
   - [Smart URL, Email & Code Protection](#smart-url-email--code-protection)
   - [Compound Vowels & Dual-Horn Engine (`ươ`)](#compound-vowels--dual-horn-engine-ươ)
   - [Diphthong `ưu` & Tone Placement on `uê` (`thuế`, `huế`)](#diphthong-ưu--tone-placement-on-uê-thuế-huế)
   - [Modern vs. Classic Tone Placement](#modern-vs-classic-tone-placement)
   - [Late Vowel Shaping & Toggle Mechanics](#late-vowel-shaping--toggle-mechanics)
   - [Phonology Validation & Stop Consonants](#phonology-validation--stop-consonants)
3. [Smart Auto-Complete & Gboard-Style Prediction](#smart-auto-complete--gboard-style-prediction)
   - [Multi-Tier Dictionary Engine](#multi-tier-dictionary-engine)
   - [Gboard Next-Word AI Prediction & Chat App Protection](#gboard-next-word-ai-prediction--chat-app-protection)
   - [On-Device Personalized Learning (100% Private)](#on-device-personalized-learning-100-private)
4. [Custom User Dictionary & Whitelist](#custom-user-dictionary--whitelist)
5. [Macro Expansion Engine (xKey Inspired)](#macro-expansion-engine-xkey-inspired)
   - [Boundary Triggers & Casing Preservation](#boundary-triggers--casing-preservation)
   - [Instant Backspace Undo](#instant-backspace-undo)
6. [Architecture & WebExtensions MV3](#architecture--webextensions-mv3)
7. [Installation & Setup](#installation--setup)
   - [Loading as an Unpacked Browser Extension (Chromium)](#loading-as-an-unpacked-browser-extension-chromium)
   - [Loading into Mozilla Firefox](#loading-into-mozilla-firefox)
   - [Building from Source](#building-from-source)
8. [Testing & Verification](#testing--verification)
9. [Design Philosophy: Modern Unicode Focus](#design-philosophy-modern-unicode-focus)
10. [License](#license)

---

## Key Features

- **No OS Dependency**: Operates natively in any browser tab, iframe, or web app (Gmail, Slack, Notion, Facebook, Telegram Web, Discord, devtools).
- **Adaptive Auto Mode by Default**: Starts out-of-the-box in **Auto (Adaptive)** mode (digits route to VNI, letters route to Telex), with instantaneous switching between Auto, Telex, VNI, or Off.
- **Key `z` Tone Removal**: Tap `z` (Telex / Auto) or `0` (VNI) to instantly remove diacritical tone marks while retaining vowel shapes (`toán` + `z` -> `toan`, `tiến` + `z` -> `tiên`, `được` + `z` -> `đươc`, `thuế` + `z` -> `thuê`).
- **Contextual URL, Email & Code Protection (`isUrlOrEmailOrCode`)**: Automatically detects web links (`https://`, `www.`, `.com`, `/path`), email addresses (`user@domain.com`), and programming syntax (`snake_case`, `kebab-case`, `object.prop`, `$var`, `#id`, HTML `<tags>`, `->`, `=>`, `===`), cleanly suspending IME transformations to prevent link or code corruption.
- **Accurate Orthography Placement**: Precise tone placement for all diphthongs and triphthongs, including `uê` (`thuế`, `huế`, `quế`), `uơ` (`thuở`), `ươ` (`được`), `ưu` (`cứu`, `cừu`), and configurable modern vs. classic standards (`hòa`/`hoà`, `thủy`/`thuỷ`).
- **Chat App & Telegram Web A Optimization**: Eager shadow host mounting and precise `TEXT_NODE` range handling prevent cursor distortion or auto-capitalization loops in ProseMirror/TipTap rich editors.
- **Punctuation & Enter Friendly Next-Word**: Next-word predictions are automatically dismissed on `Enter` (so chat messages send instantly without intercepting) and silenced right after sentence endings (`. ? !`).
- **Real-Time Auto-Complete**: Floating dropdown suggestions with accent-aware prefix search (`cuu` -> `cứu hộ`, `cứu nạn`; `cap` -> `cấp cứu`).
- **On-Device Personalized Learning**: Automatically registers frequent bigrams into local browser storage (`localStorage`), prioritizing frequently used pairs with a "Learned Habit" badge while guaranteeing zero external data transmission.
- **Auto-Restore English Words (GoNhanh Feature)**: Reverts common English trap words when hitting Space (`text` from `têt`, `user` from `úẻ`, `push` from `púh`, `luxury` from `lủuy`, `window` from `ưindoư`).
- **Instant ESC Revert**: Pressing `ESC` instantly reverts the currently typed word back to its raw keystrokes without needing to backspace.
- **Strict Phonology Rules**: Enforces Vietnamese spelling rules (`c/k`, `g/gh`, `ng/ngh` to protect English words like `center`, `city`, `get`) and validates checked tone stop finals (`-c, -ch, -p, -t` only allow acute/dot-below tones).
- **xKey-Style Macro Expansions**: High-speed abbreviation replacement (`vn` -> `Việt Nam`, `dc` -> `được`, `tv` -> `Tiếng Việt`) with automatic case propagation and backspace undo.
- **Double-Ctrl Quick Toggle**: Double-tap the `Ctrl` key rapidly (< 400ms) to toggle Vietnamese typing on/off on the fly, with an unobtrusive visual HUD pill indicating current state (`AVIM: BẬT (Tự động)` vs. `AVIM: TẮT`).
- **Isolated Shadow DOM Indicator**: Floating HUD and suggestion ribbon encapsulated in Shadow DOM, completely immune to page CSS overrides or collisions.
- **Global Keyboard Shortcut**: Toggle IME on/off instantly via `2x Ctrl` or `Ctrl+Shift+Z` (`Cmd+Shift+Z` on macOS).

---

## Typing Methods & Orthography Rules

### Adaptive Auto Mode

Adaptive mode dynamically routes numeric keys (`1-9`, `0`) through VNI logic, and alphabetic keys through Telex logic. This allows users of either typing method to type seamlessly without constantly switching settings.

### VNI Input Method

VNI uses number keys `1` through `9` and `0` to append or remove diacritical marks:

| Number Key | Effect | Name | Example Keystrokes | Output |
| :---: | :--- | :--- | :--- | :--- |
| **`1`** | Acute (Sắc) | Dấu Sắc | `a1`, `e1`, `o1` | `á`, `é`, `ó` |
| **`2`** | Grave (Huyền) | Dấu Huyền | `a2`, `e2`, `u2` | `à`, `è`, `ù` |
| **`3`** | Hook above (Hỏi) | Dấu Hỏi | `a3`, `o3`, `i3` | `ả`, `ỏ`, `ỉ` |
| **`4`** | Tilde (Ngã) | Dấu Ngã | `a4`, `e4`, `o4` | `ã`, `ẽ`, `õ` |
| **`5`** | Dot below (Nặng) | Dấu Nặng | `a5`, `o5`, `u5` | `ạ`, `ọ`, `ụ` |
| **`6`** | Circumflex (Mũ) | Dấu Mũ | `a6`, `e6`, `o6` | `â`, `ê`, `ô` |
| **`7`** | Horn (Móc) | Dấu Móc | `o7`, `u7`, `uo7` | `ơ`, `ư`, `ươ` |
| **`8`** | Breve (Trăng) | Dấu Trăng | `a8` | `ă` |
| **`9`** | Bar (Gạch ngang) | Dấu Gạch | `d9`, `D9` | `đ`, `Đ` |
| **`0`** | Remove tone mark | Xóa dấu thanh | `toán0`, `thuế0` | `toan`, `thuê` |

Retyping any tone or shape number immediately restores the base letter and outputs the raw number (e.g., `icon` + `6` -> `icôn` + `6` -> `icon6` + `4` -> `icon64`).

### Telex Input Method & Key `z` Tone Removal

Telex uses repeated letters and auxiliary keys (`w`, `s`, `f`, `r`, `x`, `j`, `z`):

| Key | Effect | Example Keystrokes | Output |
| :---: | :--- | :--- | :--- |
| **`s`** | Acute (Sắc) | `as`, `es`, `os` | `á`, `é`, `ó` |
| **`f`** | Grave (Huyền) | `af`, `ef`, `uf` | `à`, `è`, `ù` |
| **`r`** | Hook above (Hỏi) | `ar`, `or`, `ir` | `ả`, `ỏ`, `ỉ` |
| **`x`** | Tilde (Ngã) | `ax`, `ex`, `ox` | `ã`, `ẽ`, `õ` |
| **`j`** | Dot below (Nặng) | `aj`, `oj`, `uj` | `ạ`, `ọ`, `ụ` |
| **`aa` / `ee` / `oo`** | Circumflex (`â`, `ê`, `ô`) | `aa`, `ee`, `oo` | `â`, `ê`, `ô` |
| **`w`** | Horn / Breve / Cluster | `aw` -> `ă`, `ow` -> `ơ`, `uw` -> `ư`, `uow` -> `ươ` | `ă`, `ơ`, `ư`, `ươ` |
| **`dd`** | Bar (`đ`) | `dd`, `Dd` | `đ`, `Đ` |
| **`z`** | Remove tone mark | `toán` + `z` -> `toan`, `tiến` + `z` -> `tiên`, `được` + `z` -> `đươc` | Restores base vowel while preserving shapes |

- If the word already carries a tone mark, pressing `z` (Telex) or `0` (VNI) immediately cleans the tone mark and restores the unaccented base vowel.
- If the word has no tone mark (e.g., `toan`), typing `z` outputs `toanz` normally.

---

### Smart URL, Email & Code Protection

Typing URLs, email addresses, or code identifiers often causes accidental Vietnamese diacritics in traditional input engines (e.g. typing `search` turns into `seảch`, or `user_name` turns into `úer_name`).

OpenViet IME includes an intelligent context guard (`isUrlOrEmailOrCode`) that inspects the typing buffer:
- **URLs**: Recognizes `http://`, `https://`, `www.`, `localhost`, `.com`, `.vn`, `.org`, `.net`, `.io`, `.dev`, `.ai`, and path slashes `/api/v1`.
- **Emails**: Recognizes `@` in the active token (`contact@company.vn`, `user@gmail.com`).
- **Code Syntax**: Recognizes `snake_case` with `_`, `kebab-case` with `-`, dot property access (`console.log`, `user.name`), variables (`$var`, `#id`), HTML tags (`<div`, `</span`), and programming operators (`->`, `=>`, `===`).

When triggered, IME modifications, quick consonants, and auto-capitalizations are suspended automatically, keeping links and code completely clean.

---

### Compound Vowels & Dual-Horn Engine (`ươ`)

In Vietnamese words like `được`, `nước`, `bước`, `trước`, `thương`, the vowel cluster `uo` receives horns on **both** letters (`u` -> `ư`, `o` -> `ơ`), resulting in `ươ`.

- **VNI Execution**:
  - Typing `duoc` followed by `9` transforms `d` to `đ` -> `đuoc`.
  - Typing `7` applies the dual horn hook to both `u` and `o` -> `đươc`.
  - Typing `5` applies the dot below (nặng) to the main vowel `ơ` -> `được`.
  - Sequential input `duoc975` or `duoc759` seamlessly yields `được`.
- **Telex Execution**:
  - Typing `duoc` followed by `w` converts `uo` -> `ươ` -> `đươc`.
  - Adding `j` places the heavy dot -> `được`.

---

### Diphthong `ưu` & Tone Placement on `uê` (`thuế`, `huế`)

1. **The `uê` Cluster**:
   - In Vietnamese linguistics, `u` is an on-glide (âm đệm) and `ê` is the nucleus vowel.
   - Tone marks always fall on `ê`:
     - `thue61` or `thue16` -> **`thuế`** (never `thúê`).
     - `hue61` -> **`huế`**.
     - `que61` -> **`quế`**.
     - `xue62` -> **`xuề`**.
2. **The `ưu` Diphthong**:
   - In `uu` + horn modifier:
     - `cuu` + `7` (VNI) or `w` (Telex) yields **`cưu`**.
     - Adding tone 1 (`sắc`) yields **`cứu`** (`cuu71` -> `cứu`).
     - `cuu72` -> **`cừu`**, `cuu75` -> **`cựu`**, `luu7` -> **`lưu`**, `uu7` -> **`ưu`**.
     - Retyping `7` or `w` immediately toggles `ưu` back to plain `uu`.

---

### Modern vs. Classic Tone Placement

Configurable in popup settings and options:

1. **Modern Orthography (Default)**:
   - For open diphthongs without final consonants (`oa`, `oe`, `uy`), the tone mark is placed on the second vowel:
     - `hòa`, `hòe`, `thủy`, `khỏe`, `thỏa`.
2. **Classic Orthography**:
   - The tone mark is placed on the first vowel:
     - `hoà`, `hoè`, `thuỷ`, `khoẻ`, `thoả`.

When a final consonant exists (e.g., `toán`, `hoàn`, `quýt`), both standards place the tone mark on the main nuclear vowel.

---

### Late Vowel Shaping & Toggle Mechanics

Users frequently type full words before applying circumflex accents:
- Typing `chong` + `o` -> **`chông`**.
- Typing `kieu` + `e` -> **`kiêu`**.
- Typing `bien` + `e` -> **`biên`**.
- Typing `hang` + `a` -> **`hâng`**.
- Typing `dem` + `e` -> **`đêm`**.
- If a tone already exists (e.g. `chóng` + `o`), the tone mark migrates smoothly to the circumflexed vowel: `chóng` + `o` -> **`chống`**.
- **Retype Toggle**: Retyping the modifier character toggles back to the raw keystrokes: `chông` + `o` -> **`chongo`**, `kiêu` + `e` -> **`kieue`**.

---

### Phonology Validation & Stop Consonants

- **Checked Tone Stop Finals (`-c, -ch, -p, -t`)**: Syllables ending with stop consonants (`c`, `ch`, `p`, `t`) can **only take Tone 1 (Acute / Sắc) or Tone 5 (Dot below / Nặng)**. Tones 2 (Huyền), 3 (Hỏi), and 4 (Ngã) are rejected (`bac` + `s` -> `bác`, but `bac` + `f` -> `bacf`).
- **`c/k`, `g/gh`, `ng/ngh` Rules**: Front vowels (`e, ê, i, y`) cannot follow `c`, `g`, or `ng`. Foreign words such as `center`, `city`, `get` are preserved without unintended diacritic alteration.

---

## Smart Auto-Complete & Gboard-Style Prediction

### Multi-Tier Dictionary Engine
The engine integrates four distinct lexical layers:
1. **Curated Vietnamese Compound Words (`COMMON_VIETNAMESE_COMPOUNDS`)**: Frequent multi-word collocations in administration, science, technology, and everyday conversation.
2. **Standard Syllable Vocabulary (`vietnamese-words.js`)**: ~6,700 standard single syllables based on Hunspell Vietnamese wordlist.
3. **Custom User Dictionary (`userDictionary`)**: Personal terminology and whitelisted words prioritized with a special badge.
4. **Technology & English Terms (`COMMON_ENGLISH_WORDS`)**: Common terms (`React`, `TypeScript`, `Docker`, `GitHub`, `API`).

### Gboard Next-Word AI Prediction & Chat App Protection
Once a word is committed, the prediction ribbon displays the most probable successor words:
- `Việt ` -> `[ Nam ]`, `[ Trì ]`, `[ dã ]`, `[ kiều ]`.
- `công ` -> `[ nghệ ]`, `[ ty ]`, `[ việc ]`, `[ nhân ]`.
- `chúc ` -> `[ mừng ]`, `[ bạn ]`, `[ anh ]`, `[ em ]`.
- `nghiên ` -> `[ cứu ]`, `[ cứu sinh ]`.

**Refined Chat & Punctuation Rules**:
- **Enter Key Friendly**: When typing in chat applications (Telegram, Messenger, Zalo, Slack), hitting `Enter` to send your message will **never** accidentally inject a next-word prediction. The suggestion bar dismisses cleanly and allows the native `Enter` event to send your message.
- **Sentence Endings**: After sentence terminators (`. ? !`) or spaces following sentence terminators, next-word suggestions are suppressed to avoid awkward lowercase suggestions at the start of new sentences.

### On-Device Personalized Learning (100% Private)
- As you type consecutive words (e.g. `họp team`, `chuyển khoản`, `gửi email`), the local bigram model automatically increments transition frequencies.
- High-frequency personal pairs surface at position #1 with a green **Habit** badge.
- Stored exclusively in the user's browser `localStorage` / `sync storage` with zero telemetry, network requests, or tracking.

---

## Custom User Dictionary & Whitelist

- Accessible in the Options dashboard (`/options.html`).
- Allows adding, searching, and deleting technical keywords, foreign names, and product codes.
- Whitelisted entries bypass spellchecking and are given top priority in auto-complete suggestions.
- Supports bulk export and import in `.txt` or `.json` formats.

---

## Macro Expansion Engine (xKey Inspired)

### Boundary Triggers & Casing Preservation
Macros trigger whenever an abbreviation is followed by a word delimiter (`Space`, `Enter`, `,`, `.`, `;`, `:`, `!`, `?`):

1. **Lowercase**: `vn ` -> `Việt Nam `
2. **Title Case**: `Vn ` -> `Việt Nam `
3. **Uppercase**: `VN ` -> `VIỆT NAM `

Default macros include popular abbreviations:
- `vn` -> `Việt Nam`, `hn` -> `Hà Nội`, `sg` -> `Sài Gòn`
- `dc` -> `được`, `ko` -> `không`, `k` -> `không`, `ntn` -> `như thế nào`, `vs` -> `với`
- `tv` -> `Tiếng Việt`, `zia` -> `dzìa`, `zi` -> `dzí`, `zo` -> `dzô`
- `ck` -> `chồng`, `cx` -> `cũng`, `idk` -> `tao hông biết`

### Instant Backspace Undo
If an expansion was not intended, pressing **Backspace immediately** reverts the expansion and restores the raw trigger key string:
```
Typed:      "vn "
Expanded:   "Việt Nam "
Hit [⌫]:    "vn"
```

---

## Architecture & WebExtensions MV3

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OpenViet IME Architecture                       │
├────────────────────────────────────────────────────────────────────────┤
│                     Manifest V3 Browser Extension                      │
│  - Service Worker / Background Scripts (State sync & shortcut routing) │
│  - Content Script (Key interception, typing engine runner)             │
│  - Shadow DOM HUD & Suggestion Ribbon (Isolated floating UI)           │
│  - Popup & Options Management Page                                     │
│  - Cross-Browser Builds (Chrome MV3 / Firefox WebExtensions / Edge)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   src/engine/                          │
       │  ├─ avim.js       (Core IME state, VNI/Telex parser)   │
       │  ├─ macro.js      (xKey word-boundary expansion engine)│
       │  ├─ key-codes.js  (Unicode character map & URL guard)  │
       │  ├─ autocomplete.js (Word suggestion & prefix ranking) │
       │  ├─ dictionary.js (User custom whitelist & phonology)  │
       │  └─ vietnamese-words.js (Standard 6.7k syllable set)   │
       └────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

You can either download pre-built release packages from GitHub Releases or build directly from source.

### Loading into Chromium Browsers (Google Chrome, Microsoft Edge, Brave, Opera, Arc)

1. Download or generate the extension package (`openviet_ime-chrome-1.0.0.zip` or `openviet_ime-edge-1.0.0.zip`).
2. Extract the `.zip` file into a local folder (or use the repository directory after running `npm run build:chrome`).
3. Open your browser extension management console:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera: `opera://extensions`
4. Enable **Developer mode** toggle in the top right corner.
5. Click **Load unpacked** and select the directory containing `manifest.json`.
6. The OpenViet IME icon will appear in your toolbar with the badge **`AUTO`**.

### Loading into Mozilla Firefox

1. Build or download the Firefox package (`npm run build:firefox`).
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file inside the repository directory (or choose the built `.zip` file).
5. OpenViet IME will activate with full support for Firefox WebExtensions storage and content scripts.

### Building & Packaging from Source

#### 1. Install dependencies
```bash
npm install
```

#### 2. Build for a specific browser
These commands compile the TypeScript/JavaScript assets with `esbuild` and copy the appropriate browser-specific manifest (`manifest.chrome.json` or `manifest.firefox.json`):

```bash
# Google Chrome, Brave, Opera, Arc
npm run build:chrome

# Mozilla Firefox
npm run build:firefox

# Microsoft Edge
npm run build:edge
```

#### 3. Package into `.zip` distribution archives
To generate production-ready `.zip` files ready for installation or store publishing (saved in `web-ext-artifacts/`):

```bash
# Package for Chrome -> web-ext-artifacts/openviet_ime-chrome-1.0.0.zip
npm run bundle:chrome

# Package for Firefox -> web-ext-artifacts/openviet_ime-firefox-1.0.0.zip

# Package for Edge -> web-ext-artifacts/openviet_ime-edge-1.0.0.zip
```

#### 4. Development mode
```bash
# Bundle extension scripts with file watching
npm run dev:extension

# Start Vite preview server for the interactive playground
npm run dev
```

---

## Testing & Verification

Execute the complete automated test suite covering AVIM character combinations, `z` tone removal, URL/Email/Code guards, macro expansions, and auto-complete ranking:

```bash
npm test
```

To run TypeScript verification:

```bash
npm run lint
```

---

## Design Philosophy: Modern Unicode Focus

OpenViet IME is built from the ground up for the modern web ecosystem. By design, it does **not** bundle obsolete 1990s/2000s legacy encoding conversion tools (such as TCVN3 / ABC, VNI-Windows, or BK HCM 1/2). Over 99.9% of websites and applications today operate strictly on UTF-8 Unicode. Excluding legacy converters keeps the codebase lean, reduces security attack surfaces, eliminates memory bloat, and allows the engine to focus on lightning-fast, rock-solid Vietnamese input.

---

## License

Licensed under the [Apache License, Version 2.0](LICENSE).  
Portions derived from AVIM (Nguyễn Kim Kha), xKey (xmannv), and GoNhanh (Kha Phan).  
Icons and assets designed with a clean, neutral keyboard aesthetic for cross-platform utility.
