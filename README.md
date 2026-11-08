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
   - [Developer-Aware Mode (camelCase & PascalCase Protection)](#developer-aware-mode-camelcase--pascalcase-protection)
   - [Phonology Edge Cases & Loanwords (uơ Trio & oo French Words)](#phonology-edge-cases--loanwords-uơ-trio--oo-french-words)
   - [Compound Vowels & Dual-Horn Engine (`ươ`)](#compound-vowels--dual-horn-engine-ươ)
   - [Diphthong `ưu` & Tone Placement on `uê` (`thuế`, `huế`)](#diphthong-ưu--tone-placement-on-uê-thuế-huế)
   - [Modern vs. Classic Tone Placement](#modern-vs-classic-tone-placement)
   - [Late Vowel Shaping & Toggle Mechanics](#late-vowel-shaping--toggle-mechanics)
   - [Shape Modifier Swapping (VietC / Bamboo)](#shape-modifier-swapping-vietc--bamboo)
   - [Phonology Validation & Natural Command Protection](#phonology-validation--natural-command-protection)
   - [Word & Accent Rescue (Ngó Sen / vnchKey Innovation)](#word--accent-rescue-ngó-sen--vnchkey-innovation)
3. [Smart Auto-Complete & Gboard-Style Prediction](#smart-auto-complete--gboard-style-prediction)
   - [Multi-Tier Dictionary Engine](#multi-tier-dictionary-engine)
   - [Gboard Next-Word AI Prediction & Chat App Protection](#gboard-next-word-ai-prediction--chat-app-protection)
   - [On-Device Personalized Learning (100% Private)](#on-device-personalized-learning-100-private)
4. [Custom User Dictionary & Whitelist](#custom-user-dictionary--whitelist)
5. [Macro Expansion Engine (xKey Inspired)](#macro-expansion-engine-xkey-inspired)
   - [Boundary Triggers & Casing Preservation](#boundary-triggers--casing-preservation)
   - [2-Step Backspace Undo](#2-step-backspace-undo)
   - [Smart Punctuation Snapping](#smart-punctuation-snapping)
   - [Dynamic Real-Time Variables ($DATE, $TIME, $DATETIME)](#dynamic-real-time-variables-date-time-datetime)
   - [Saigon Xưa Vocabulary & Dialect Presets](#saigon-xưa-vocabulary--dialect-presets)
6. [Architecture & WebExtensions MV3](#architecture--webextensions-mv3)
7. [Installation & Setup](#installation--setup)
   - [Loading as an Unpacked Browser Extension (Chromium)](#loading-as-an-unpacked-browser-extension-chromium)
   - [Loading into Mozilla Firefox](#loading-into-mozilla-firefox)
   - [Building from Source](#building-from-source)
8. [Testing & Verification](#testing--verification)
9. [Design Philosophy: Modern Unicode Focus](#design-philosophy-modern-unicode-focus)
10. [License & Acknowledgements](#license--acknowledgements)

---

## Key Features

- **No OS Dependency**: Operates natively in any browser tab, iframe, or web app (Gmail, Slack, Notion, Facebook, Telegram Web, Discord, devtools).
- **Adaptive Auto Mode by Default**: Starts out-of-the-box in **Auto (Adaptive)** mode (digits route to VNI, letters route to Telex), with instantaneous switching between Auto, Telex, VNI, or Off.
- **Key `z` Tone Removal**: Tap `z` (Telex / Auto) or `0` (VNI) to instantly remove diacritical tone marks while retaining vowel shapes (`toán` + `z` -> `toan`, `tiến` + `z` -> `tiên`, `được` + `z` -> `đươc`, `thuế` + `z` -> `thuê`).
- **Contextual URL, Email & Code Protection (`isUrlOrEmailOrCode`)**: Automatically detects web links (`https://`, `www.`, `.com`, `/path`), email addresses (`user@domain.com`), relative/system file paths (`../path`, `./src`, `~/.config`, `/usr/bin/`), inline code spans with backticks (`` `code` ``), and programming syntax (`snake_case`, `kebab-case`, `object.prop`, `$var`, `#id`, HTML `<tags>`, `->`, `=>`, `===`), cleanly suspending IME transformations while typing code and resuming normal Vietnamese immediately upon space or boundary delimiters.
- **Developer-Aware Mode (`camelCase` & `PascalCase`)**: Dynamically detects code identifier transitions (e.g., `useState`, `isCamelCase`, `UserController`, `AppProps`). When an uppercase letter is typed right after a word prefix, it automatically unaccents the prefix and disables Vietnamese diacritics for subsequent characters, allowing developers to type code seamlessly without toggling the IME off.
- **Word & Accent Rescue (Ngó Sen / vnchKey Innovation)**:
  - **Instant Retro-Rescue Hotkey (`Ctrl+Shift+R` / `Alt+R`)**: Real-time bidirectional conversion hotkey. While typing, press `Ctrl+Shift+R` or `Alt+R` to instantly convert the active word/selection from raw keystrokes to accented Vietnamese (e.g., `theer` $\leftrightarrow$ `thể`, `coong` $\leftrightarrow$ `công`, `tieengs` $\leftrightarrow$ `tiếng`), without touching the mouse or flipping IME switches.
  - **On-Activation Word Rescue**: If you typed a long raw unaccented sentence in English mode (e.g. `Chaof banj, tieengs vieetj nef`), switching the IME on (via `2x Ctrl` or `Ctrl+Shift+Z`) automatically retro-converts the preceding raw text into accented Vietnamese (`Chào bạn, tiếng việt nè`), keeping English terms like `linux` or `server` pristine. Pressing `Escape` provides instant safety undo.
  - **Selection Accent Rescue**: Highlight any word and tap a tone key (`s, f, r, x, j, z` / `1-5, 0`) to modify, add, or strip diacritics directly on the selection (`nhanh` + `s` $\rightarrow$ `nhánh`, `nhánh` + `z` $\rightarrow$ `nhanh`, `hoa` + `r` $\rightarrow$ `hòa`), while normal letters retain default overwrite behavior.
- **Enhanced Developer Guard & Viewport Edge Clamping**:
  - `isUrlOrEmailOrCode` expanded to recognize Linux/macOS paths (`/usr/bin/`, `/var/log/`, `~/.config`, `./dist`) and shell/PHP variables (`$var`, `${VAR}`).
  - Suggestion ribbon automatically calculates screen bounds, clamping left and right and flipping upward when typing near viewport corners.
- **Phonological Edge Cases Mastery**: Accurately handles the rare **`uơ` trio** (`thuở`, `quởn`, `huơ`), triphthong traps (`khuỷu`, `ngoèo`), and French loanwords with double-o (`xoong`, `boong`, `goòng`).
- **Accurate Orthography Placement**: Precise tone placement for all diphthongs and triphthongs, including `uê` (`thuế`, `huế`, `quế`), `uơ` (`thuở`), `ươ` (`được`), `ưu` (`cứu`, `cừu`), and configurable modern vs. classic standards (`hoà`/`hòa`, `thuỷ`/`thủy`).
- **Chat App & Telegram Web A Optimization**: Eager shadow host mounting and precise `TEXT_NODE` range handling prevent cursor distortion or auto-capitalization loops in ProseMirror/TipTap rich editors.
- **Race-Condition Prevention & Atomic Replacement**: Implements immediate event interception (`stopImmediatePropagation`) and Range-based atomic replacement across modern rich editors and AI chatboxes (Sider.ai, StackEdit, TipTap, CodeMirror, Slate), completely eliminating duplicated character tails (e.g. `vâyậy`, `thêể`) during high-speed typing.
- **Strict Unicode NFC Output & Quote Canonicalization**: Guarantees standard composed **NFC** output for all DOM mutations; incorporates `canon()` normalization to unify curly and straight quotes (`’`, `‘` -> `'`), ensuring flawless typing and spellchecking for apostrophe toponyms like `M'Đrắk`, `Cư M'gar`, and `R'lấp`.
- **Punctuation & Enter Friendly Next-Word**: Next-word predictions are automatically dismissed on `Enter` (so chat messages send instantly without intercepting) and silenced right after sentence endings (`. ? !`).
- **Real-Time Auto-Complete**: Floating dropdown suggestions with accent-aware prefix search (`cuu` -> `cứu hộ`, `cứu nạn`; `cap` -> `cấp cứu`).
- **Full Central Highlands Toponyms & Rare Syllables Support**: Seamless typing for non-traditional Vietnamese place names (`Đắk Lắk`, `Krông Nô`, `Krông Pắk`, `Buôn Ma Thuột`, `Pleiku`, `Chư Sê`), apostrophe toponyms (`M'Đrắk`, `Ea H'leo`, `Cư M'gar`, `Ia H'Drai`, `Đắk R'lấp`), and classical / dialect words (`khuếch`, `khuynh`, `ngoắt`, `nguầy`, `dzô`, `dzậy`, `zị`, `mầy`) without spellchecker interference.
- **On-Device Personalized Learning**: Automatically registers frequent bigrams into local browser storage (`localStorage`), prioritizing frequently used pairs with a "Learned Habit" badge while guaranteeing zero external data transmission.
- **Auto-Restore English Words & Collision Simulation Tool**: Reverts common English trap words when hitting Space (`text` from `tẽt`, `user` from `úer`, `push` from `púh`, `modern` from `modẻn`, `luxury` from `lủuy`, `window` from `ưindoư`). Includes `scripts/gen-english-traps.mjs`, an automated keystroke simulator that parses vocabulary through the engine to maintain 144 verified collision traps. Note that **VNI mode is inherently immune** to English collisions since tones are triggered by numbers (`1-9`), while Telex and Auto mode rely on Auto-Restore for seamless typing.
- **Instant ESC Revert**: Pressing `ESC` instantly reverts the currently typed word back to its raw keystrokes without needing to backspace.
- **Strict Phonology Rules**: Enforces Vietnamese spelling rules (`c/k`, `g/gh`, `ng/ngh` to protect English words like `center`, `city`, `get`) and validates checked tone stop finals (`-c, -ch, -p, -t` only allow acute/dot-below tones).
- **xKey-Style Macro Expansions with 2-Step Undo & Punctuation Snapping**: High-speed abbreviation replacement (`vn` -> `Việt Nam`, `dc` -> `được`, `tv` -> `Tiếng Việt`) with automatic case propagation, 2-step Backspace undo (step 1 removes trailing space; step 2 restores raw trigger), and smart punctuation snapping (`. , ; : ! ?` snaps directly to the expanded text).
- **Dynamic Real-Time Macro Variables**: Supports live real-time variables in expansion templates: `$DATE` (local `DD/MM/YYYY`), `$TIME` (`HH:mm`), `$DATETIME`, and `$YEAR` (with safe triggers like `+today`, `+now`).
- **Saigon Xưa Cultural Vocabulary Preset**: Curated collection of 100+ authentic pre-1975 Southern Vietnamese phrases, idioms, and colloquialisms (`bá cháy bù chét`, `cà rịch cà tang`, `mèn đéc ơi`, `quởn đời`, `hết sảy con bà bảy`), available as a one-click macro preset in settings.
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
- **Tone Key Retype & Breakout**: Retyping the same tone key toggles the tone off (`doc` + `s` -> `dóc` + `s` -> `doc`). If pressed a 3rd time consecutively, it breaks out of the loop and outputs the literal character without getting trapped (`doc` + `s` -> `docs` + `s` -> `docss`). Coupled with Auto-Restore, English trap words like `docs` automatically revert when followed by Space or Enter.

---

### Smart URL, Email & Code Protection

Typing URLs, email addresses, or code identifiers often causes accidental Vietnamese diacritics in traditional input engines (e.g. typing `search` turns into `seảch`, or `user_name` turns into `úer_name`).

OpenViet IME includes an intelligent context guard (`isUrlOrEmailOrCode`) that inspects the typing buffer:
- **URLs & File Paths**: Recognizes `http://`, `https://`, `www.`, `localhost`, `.com`, `.vn`, `.org`, `.net`, `.io`, `.dev`, `.ai`, API routes `/api/v1`, and relative or home directory paths (`../folder`, `./src`, `~/.config`, `/usr/bin/`). Path recognition is strictly token-scoped so that the moment you press Space, normal Vietnamese typing is instantly unlocked.
- **Inline Code & Backtick Guard**: Detects Markdown backticks (`` ` ``) and inline code spans. Auto-capitalization is suppressed inside backtick blocks, and technical terms (like `` `backtick` `` or `` `code` ``) are guarded against truncated fragments or unwanted capitalization.
- **Emails**: Recognizes `@` in the active token (`contact@company.vn`, `user@gmail.com`).
- **Code Syntax**: Recognizes `snake_case` with `_`, `kebab-case` with `-`, dot property access (`console.log`, `user.name`), variables (`$var`, `#id`), HTML tags (`<div`, `</span`), and programming operators (`->`, `=>`, `===`).

When triggered, IME modifications, quick consonants, and auto-capitalizations are suspended automatically, keeping links and code completely clean.

---

### Developer-Aware Mode (camelCase & PascalCase Protection)

Software engineers frequently type mixed-case variable, function, and class names into code editors, web consoles, PR descriptions, and chat applications. Traditional Vietnamese IMEs break these words by inserting diacritics into prefixes (e.g. `useState` becoming `uéState`, `isCamelCase` becoming `íCamelCase`, or `UserController` becoming `UérController`).

OpenViet IME implements an intelligent, zero-friction **Developer-Aware Mode**:
- **Transition Detection**: Monitored via Unicode casing patterns (`^[\p{Ll}\p{M}]+[A-Z]` and `^[A-Z][\p{Ll}\p{M}]+[A-Z]`).
- **Auto-Unaccenting Prefix**: When an uppercase transition character is typed (e.g., typing `S` after `ué`), the engine immediately unaccents the leading prefix (`ué` $\rightarrow$ `use`), yielding `useS`.
- **IME Diacritic Suppression**: For the remainder of that token, Vietnamese tone transformation is smoothly suspended so you can finish typing `useState`, `isCamelCase`, `UserController`, or `AppProps` with zero interruptions.

---

### Phonology Edge Cases & Loanwords (uơ Trio & oo French Words)

Vietnamese phonology contains rare edge cases where conventional vowel pairing rules must not be blindly applied:

1. **The `uơ` Trio (`thuở`, `quởn`, `huơ`)**:
   - Normally, `uo` + `w` creates the dual horn `ươ` (`duoc` + `w` $\rightarrow$ `được`).
   - However, in exactly 3 root cases, `u` is an on-glide consonant sound /w/ and only `o` receives the horn (`ơ`):
     - `thuở` (e.g., `muôn thuở`, `thuở xưa`): `thuo` + `w` $\rightarrow$ `thuơ` + `r` $\rightarrow$ `thuở` (never `thưở`).
     - `quởn` / `quỡn` / `quơ`: `q` never pairs with `ư` in Vietnamese orthography. `quon` + `w` $\rightarrow$ `quơn` + `r` $\rightarrow$ `quởn`.
     - `huơ` (e.g., `huơ tay`, `huơ dao`): `huo` + `w` $\rightarrow$ `huơ`.
2. **Triphthong Traps (`khuỷu`, `ngoèo`)**:
   - `khuỷu` (elbow): Nuclear vowel `y` correctly receives the tone hook $\rightarrow$ `khuỷu` (never `khủyu`).
   - `ngoèo` (crooked): Nuclear vowel `e` receives the grave tone $\rightarrow$ `ngoèo` (never `ngòeo`).
3. **French Loanwords with Double `oo` (`xoong`, `boong`, `goòng`)**:
   - In Telex mode, typing `oo` normally produces `ô`.
   - OpenViet IME recognizes established French loanwords (`xoong` from *casserole*, `boong` from *pont*, `goòng` from *wagon*), preserving `oo` naturally without forcing `ô`.

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

1. **Classic Orthography (Default)**:
   - Preserves the traditional, visually balanced aesthetic of standard Vietnamese orthography:
   - The tone mark is placed on the first vowel in open diphthongs:
     - `hòa`, `hòe`, `thủy`, `khỏe`, `thỏa`, `hóa`.
2. **Modern Orthography**:
   - For open diphthongs without final consonants (`oa`, `oe`, `uy`), the tone mark is placed on the second vowel:
     - `hoà`, `hoè`, `thuỷ`, `khoẻ`, `thoả`, `hoá`.

When a final consonant exists (e.g., `toán`, `hoàn`, `quýt`), both standards place the tone mark on the nuclear vowel.

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

### Shape Modifier Swapping (VietC / Bamboo)

Inspired by VietC and Bamboo, OpenViet IME supports **seamless vowel shape modifier swapping (`â ↔ ă`, `ô ↔ ơ`) while strictly preserving existing tone marks**. When typing quickly, users often mistype a circumflex when they intended a breve/horn (or vice versa); this engine enables instantaneous shape switching without losing or having to retype the tone:

- **Telex Mode**:
  - `â + w` $\rightarrow$ `ă` (e.g., `ấm` + `w` $\rightarrow$ `ắm`, `cân` + `w` $\rightarrow$ `căn`, `tập` + `w` $\rightarrow$ `tặp`).
  - `ă + a` $\rightarrow$ `â` (e.g., `ắm` + `a` $\rightarrow$ `ấm`, `căn` + `a` $\rightarrow$ `cân`, `tặp` + `a` $\rightarrow$ `tập`).
  - `ô + w` $\rightarrow$ `ơ` (e.g., `bốn` + `w` $\rightarrow$ `bớn`, `hộp` + `w` $\rightarrow$ `hợp`, `cột` + `w` $\rightarrow$ `cợt`).
  - `ơ + o` $\rightarrow$ `ô` (e.g., `bớn` + `o` $\rightarrow$ `bốn`, `hợp` + `o` $\rightarrow$ `hộp`, `cợt` + `o` $\rightarrow$ `cột`).
  - Double modifiers such as `aaw` naturally resolve to `ă`, and `oow` to `ơ`.
- **VNI Mode**:
  - `8` (breve) on `â` $\rightarrow$ `ă` (e.g., `tấ` + `8` $\rightarrow$ `tắ`).
  - `6` (circumflex) on `ă` $\rightarrow$ `â` (e.g., `tắ` + `6` $\rightarrow$ `tấ`).
  - `7` (horn) on `ô` $\rightarrow$ `ơ` (e.g., `bốn` + `7` $\rightarrow$ `bớn`, `giồ` + `7` $\rightarrow$ `giờ`).
  - `6` (circumflex) on `ơ` $\rightarrow$ `ô` (e.g., `bớn` + `6` $\rightarrow$ `bốn`, `giờ` + `6` $\rightarrow$ `giồ`).

---

### Phonology Validation & Natural Command Protection

- **Checked Tone Stop Finals (`-c, -ch, -p, -t`)**: Syllables ending with stop consonants (`c`, `ch`, `p`, `t`) can **only take Tone 1 (Acute / Sắc) or Tone 5 (Dot below / Nặng)**. Tones 2 (Huyền), 3 (Hỏi), and 4 (Ngã) are rejected (`bac` + `s` -> `bác`, but `bac` + `f` -> `bacf`).
- **`c/k`, `g/gh`, `ng/ngh` Rules**: Front vowels (`e, ê, i, y`) cannot follow `c`, `g`, or `ng`. Foreign words such as `center`, `city`, `get` are preserved without unintended diacritic alteration.
- **Natural Phonological Guard (Technical Word & CLI Protection)**: Even when dictionary spellcheck is disabled by the user, OpenViet IME's syllable parser enforces structural phonological coda and nucleus constraints. Technical commands, filenames, and packages (e.g. `fcitx5`, `docx4`, `linux6`) will **never** be corrupted into spurious accented forms (e.g., `fcitx5` stays intact instead of mutating into `fcịtx`).

---

### Word & Accent Rescue (Ngó Sen / vnchKey Innovation)

Inspired by the revolutionary UX features pioneered in Ngó Sen and refined in vnchKey, OpenViet IME provides two powerful safety mechanisms:

1. **On-Activation Word Rescue**:
   - **Problem**: You often type a long sentence while the keyboard is accidentally in English mode (e.g., `Chaof banj, tieengs vieetj nef`), realizing only after finishing.
   - **Solution**: The moment you toggle the IME on (via `2x Ctrl`, `Ctrl+Shift+Z`, or clicking the popup), the extension automatically inspects the unaccented buffer before the cursor and converts it into grammatically sound Vietnamese: $\rightarrow$ `Chào bạn, tiếng việt nè`.
   - **Protection & Undo**: Common English keywords (`linux`, `server`, `browser`) are preserved intact. If the conversion is unexpected, hitting **`Escape`** immediately reverts to the raw keystrokes.

2. **Selection Accent Rescue**:
   - **Problem**: You want to change, add, or strip a tone on an existing word without deleting and re-typing it from scratch.
   - **Solution**: Highlight any word with the mouse or keyboard and press a tone key:
     - `nhanh` + `s` $\rightarrow$ `nhánh`
     - `nhánh` + `f` $\rightarrow$ `nhành`
     - `nhánh` + `z` (or `0` in VNI) $\rightarrow$ `nhanh` (removes tone)
     - `hoa` + `r` $\rightarrow$ `hoả` (or `hỏa` in classic style)
     - `tieng` + `s` $\rightarrow$ `tiếng`
     - `nước` + `0` $\rightarrow$ `nươc`
   - Normal non-tone keys (e.g. `k`) preserve default browser behavior, overwriting the selected text as usual.

---

## Smart Auto-Complete & Gboard-Style Prediction

### Multi-Tier Dictionary Engine
The engine integrates four distinct lexical layers:
1. **Curated Vietnamese Compound Words & Toponyms (`COMMON_VIETNAMESE_COMPOUNDS`)**: 200+ frequent multi-word collocations in administration, technology, nationwide cities (Hà Nội, Sài Gòn, Đà Nẵng, Cần Thơ,...), and full Central Highlands geographic entities (Đắk Lắk, Buôn Ma Thuột, Krông Nô, Pleiku, Cư M'gar, Ea H'leo, M'Đrắk,...).
2. **Standard & Extended Syllable Vocabulary (`vietnamese-words.js`)**: ~6,700 standard syllables from Vietnamese Hunspell enriched with Central Highlands syllables, regional onomatopoeia, and classical dialect terms (`pắk`, `búk`, `păh`, `prông`, `krông`, `đrắk`, `nguầy`, `nguậy`, `dzô`, `dzậy`, `zị`, `mầy`).
3. **Custom User Dictionary (`userDictionary`)**: Personal terminology and whitelisted words prioritized with a special badge.
4. **Technology & English Terms (`COMMON_ENGLISH_WORDS`)**: Common terms (`React`, `TypeScript`, `Docker`, `GitHub`, `API`).

### Gboard Next-Word AI Prediction & Chat App Protection
Once a word is committed, the prediction ribbon displays the most probable successor words:
- `Đắk ` -> `[ Lắk ]`, `[ Nông ]`, `[ Mil ]`, `[ Song ]`.
- `Buôn ` -> `[ Ma Thuột ]`, `[ Mê Thuột ]`.
- `Krông ` -> `[ Nô ]`, `[ Búk ]`, `[ Pắk ]`, `[ Ana ]`.
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
- **Export & Import Habits (Backup & Portability)**: Export (`Export JSON`, `Export CSV`) and import (`Import...`) learned habits directly in the *"AI / Gboard"* settings tab. Easily sync or transfer your personalized typing habits across computers with seamless incremental merging or overwriting without losing learned collocations.

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

### 2-Step Backspace Undo

When a macro expands, a trailing space is normally appended so you can keep typing without missing a beat. If you change your mind or want to adjust the text, the **2-Step Backspace Undo** provides smooth and intuitive control:

1. **Step 1 (First Backspace)**: Deletes the trailing space, bringing the cursor directly adjacent to the expanded text. This lets you inspect or edit the word cleanly.
2. **Step 2 (Second Backspace)**: Reverts the expanded word back to the original abbreviation trigger (`vn`), fully restoring raw keystrokes.
3. **Loop Suppression**: If you decide to re-type space after step 1, the engine suppresses repeated macro expansion loops, preventing annoying expansion traps.

```
Typed:             "vn "
Expanded:          "Việt Nam "
First [⌫] (Step 1): "Việt Nam"    (removes trailing space)
Second [⌫] (Step 2):"vn"          (reverts to raw trigger)
```

---

### Smart Punctuation Snapping

Often after a macro expands, you want to attach punctuation (`.` `,` `;` `:` `!` `?` `)` `]` `}` `>`). Without smart snapping, you would end up with an unwanted space before the mark (e.g. `Việt Nam .` or `được ,`).

OpenViet IME automatically detects punctuation keys typed immediately after a macro expansion:
- It **snaps** the punctuation character directly against the expanded word.
- The trailing space is removed and re-appended *after* the punctuation mark.
- Example: typing `vn` + `Space` + `.` yields `Việt Nam. ` effortlessly!

---

### Dynamic Real-Time Variables ($DATE, $TIME, $DATETIME)

Macros can generate live, localized timestamps at runtime:
- `$DATE`: Generates current date in local format (`DD/MM/YYYY`, e.g., `08/11/2026`).
- `$TIME`: Generates current time (`HH:mm`, e.g., `09:15`).
- `$DATETIME`: Combines date and time (`DD/MM/YYYY HH:mm`).
- `$YEAR`: Expands current 4-digit year (`2026`).

> [!TIP]
> To prevent accidental triggers during normal English or Vietnamese conversations, time macros use safe `+` triggers:
> - `+today` + `Space` $\rightarrow$ `08/11/2026`
> - `+now` + `Space` $\rightarrow$ `08/11/2026 09:15`
> - `+time` + `Space` $\rightarrow$ `09:15`

---

### Saigon Xưa Vocabulary & Dialect Presets

OpenViet IME includes a dedicated, authentic **Saigon Xưa (Pre-1975 Southern Vietnamese)** macro preset featuring 100+ vivid colloquial phrases, folk triplets, and traditional idioms:
- **Colloquial Triplets & Idioms**:
  - `bá cháy bù chét`, `bá láp bá xàm`, `ba xạo ba kép`
  - `cà rịch cà tang`, `cà chớn cà chác`, `cà nhỏng cà nhỏng`
  - `mèn đéc ơi`, `mèn ơi`, `quởn đời`, `chèn ơi`
  - `hết sảy con bà bảy`, `ngon lành cành đào`
- **Dialect Variants**: `hổng` (không), `bữa nay` (hôm nay), `thiệt tình`, `ngộ á nghen`.

Users can activate this rich cultural collection with a single click from the **Macro Settings** page (`options.html`), or export/import personal custom macro collections.

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

1. Download or generate the extension package (`openviet_ime-chrome-1.1.0.zip` or `openviet_ime-edge-1.1.0.zip`).
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
# Package for Chrome -> web-ext-artifacts/openviet_ime-chrome-1.1.0.zip
npm run bundle:chrome

# Package for Firefox -> web-ext-artifacts/openviet_ime-firefox-1.1.0.zip

# Package for Edge -> web-ext-artifacts/openviet_ime-edge-1.1.0.zip
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

## License & Acknowledgements

### License
Licensed under the [Apache License, Version 2.0](LICENSE).

### Credits & Acknowledgements
OpenViet IME is built upon the invaluable contributions, ideas, and foundational algorithms of the Vietnamese open-source input method community:
- **AVIM**: Created by **Đặng Minh Tuấn** (original JS version by **Nguyễn Kim Kha**).
- **xKey**: Developed by **xmannv** (Võ Văn Mann) — inspiration for macro expansion and quick consonant shortcuts.
- **GoNhanh**: Developed by **Kha Phan** — inspiration for instant ESC word reversal and auto-restoring English vocabulary.
- **IBus-Bamboo / Bamboo Engine**: Developed by **Lượng Thanh Lâm** (`luongthanhlam` / BambooEngine) — core 5-component phonological syllable structure and dynamic tone placement principles.
- **fcitx5-vmk**: Developed by **Võ Ngô Hoàng Thành** (`thanhpy2009`) — insights into non-preedit text processing on modern UI frameworks.
- **Funput**: Developed by **P-Code Dynamics** (`@pcodedynamics`) — cross-platform lightweight Vietnamese input design philosophy.

Icons and graphics designed with a clean, neutral keyboard aesthetic for cross-platform utility.
