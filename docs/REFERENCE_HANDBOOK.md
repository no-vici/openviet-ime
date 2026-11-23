# SỔ TAY TRA CỨU OPENVIET IME

**Phiên bản đối chiếu:** v1.4.5 · tag `v1.4.5` · `main` tại HEAD
**Đối tượng:** chính người bảo trì (dùng để tra cứu khi đang mệt), reviewer AMO, và người mới muốn đọc từng phần một.

> Cuốn này không dạy lý thuyết từ đầu. Lý thuyết nằm ở [`ARCHITECTURE.md`](./ARCHITECTURE.md) và [`VIETNAMESE_PHONOLOGY.md`](./VIETNAMESE_PHONOLOGY.md). Ở đây là **thẻ nhớ, bảng tra, công thức, và quy trình làm việc**. Nếu bạn chỉ nhớ được một câu khi đọc cuốn này, hãy nhớ: **mỗi triệu chứng có một chỗ tra cứu ở mục 3**.

---

## Cách dùng cuốn sổ này

### Ba lộ trình đọc

| Bạn có... | Đọc | Mất |
|---|---|---|
| 10 phút, cần nhớ thao tác | [Phần 0 — Thẻ nhớ nhanh](#phần-0--thẻ-nhớ-nhanh-in-ra-dán-tường) | 10 phút |
| 1 giờ, muốn hiểu hệ thống | [Phần 0](#phần-0--thẻ-nhớ-nhanh-in-ra-dán-tường) → [Phần 2](#phần-2--cẩm-nang-gõ-phím-thẻ-tra-cứu) → [Phần 4.1–4.3](#phần-4--cẩm-nang-kỹ-sư) | 60 phút |
| Đang có bug trên tay | [Phần 3](#phần-3--cẩm-nang-khắc-phục-sự-cố-cookbook) → [Phần 4.5](#45-bảng-settings-đầy-đủ) → [Phần 4.9](#49-bản-đồ-test-98-cases) | Tuỳ ca |
| **Chưa biết gì cả, đừng ném thuật ngữ vào mặt tôi** | [Phần 7](#phần-7--nhập-môn-tuyệt-đối-đọc-chậm-thôi) → [Phần 8](#phần-8--lộ-trình-tự-học-7-ngày) | 2 giờ + 7 ngày |
| Cần đọc 4 file PDF trong `docs/references/` | [Phần 9](#phần-9--đọc-4-file-pdf-trong-docsreferences-không-sợ) | 45 phút |
| Đang phân vân "đây là bug engine hay harness?" | [Phần 10](#phần-10--cây-quyết-định-chẩn-đoán) | 5 phút |
| Cần thêm nguồn trực tuyến, ngoài 4 PDF | [Phần 13](#phần-13--nguồn-trực-tuyến-đã-kiểm-chứng-bổ-sung-cho-phần-9) | 45 phút |

### Quy ước ký hiệu

| Ký hiệu | Nghĩa |
|---|---|
| `→` | Kết quả sau khi gõ/bấm |
| `⌘` / `Ctrl` | Phím condition trong shortcut |
| `␣` | Phím Cách (Space) |
| `↵` | Enter |
| `⎋` | Escape |
| `⚠` | Ca dễ nhầm, đọc kỹ |
| `🔒` | Rule luôn chạy, không tắt được bằng UI |
| `🧪` | Có unit test/E2E bảo vệ |
| `📦` | Ảnh hưởng tới artifact đóng gói |

### Bảng "Tôi đang cần gì → mở mục nào"

| Câu hỏi | Mục |
|---|---|
| Gõ `w` có ra `ư` không? | [2.1](#21-bảng-telex), [4.5](#45-bảng-settings-đầy-đủ) `wToUEnabled` |
| Tại sao `hòa` và `hoà` đều được? | [2.4](#24-bảng-dấu-thanh-và-ngoại-lệ), [VIETNAMESE_PHONOLOGY §6](../VIETNAMESE_PHONOLOGY.md) |
| `sway` bị thành `sưay`? | [3.7](#37-ca-7--swaymanjaro-bị-biến-dạng), [2.6](#26-bảng-từ-bẫy-theo-nhóm) |
| Dấu bị rụng trong Telegram | [3.2](#32-ca-2--mất-dấu-trong-telegramgithubteams), [ARCHITECTURE §5](../ARCHITECTURE.md) |
| E2E đỏ nhưng unit xanh | [4.10](#410-giải-phẫu-e2e-harness) |
| Build ra zip khác checksum | [4.11](#411-giải-phẫu-build-và-artifact) |
| Cần force tag + source zip | [4.12](#412-release-playbook-copy--paste) |
| Cần submit AMO / GitHub Release | [4.13](#413-amo--github-release-checklist) |
| Quên mất `ucs` viết tắt cái gì | [1.3](#13-macro-mặc-định--preset) |
| Cần grep nhanh một rule trong code | [4.1](#41-bản-đồ-file-mở-khi-nào) |
| \"Extension là cái gì vậy?\" | [7.1](#71-extension-là-gì-giải-thích-bằng-hình-ảnh) |
| \"Tôi bấm một phím thì chuyện gì xảy ra?\" | [7.2](#72-một-phím-đi-qua-sáu-trạm-kiểm-soát) |
| \"Học theo lịch trình được không?\" | [Phần 8](#phần-8--lộ-trình-tự-học-7-ngày) |
| \"Tài liệu ngữ âm nói gì, đọc chỗ nào?\" | [Phần 9](#phần-9--đọc-4-file-pdf-trong-docsreferences-không-sợ) |
| \"Có tài liệu MDN/AMO/Playwright nào đáng đọc?\" | [13.1](#131-bốn-nhóm-nguồn-trực-tuyến) |
| \"Engine có xử lý IME hệ điều hành không?\" | [13.2](#132-ba-điểm-mới-đáng-chú-ý-nhất) |
| \"Reviewer AMO rebuild bằng môi trường nào?\" | [13.2](#132-ba-điểm-mới-đáng-chú-ý-nhất) |

---

## Phần 0 — Thẻ nhớ nhanh (in ra dán tường)

### 0.1 Thẻ Telex một trang

| Bạn gõ | Ra | Nhớ bằng |
|---|---|---|
| `aa` | `â` | gõ chữ cái thứ hai lần nữa → mũ |
| `ee` | `ê` | same |
| `oo` | `ô` | same |
| `aw` | `ă` | `w` = trăng cho `a` |
| `ow` | `ơ` | `w` = móc cho `o` |
| `uw` | `ư` | `w` = móc cho `u` |
| `dd` | `đ` | `d` gạch ngang |
| `s` `f` `r` `x` `j` | Sắc Huyền Hỏi Ngã Nặng | `s`=sắc, `f`=phủ (huyền), `r`=hỏi, `x`=ngã, `j`=nặng |
| `z` | xóa dấu thanh | giữ hình `â/ă/ơ/ư` |
| `w` đầu từ | giữ `w` | `web`, `wifi`, `world`, `ward` |
| `w` sau phụ âm | `ư` | `thw → thư` |
| `w` trong `uo/uu` | `ươ/ưu` | `duocw → được`, `cuuw → cưu` |
| `cc gg kk nn pp tt` | `ch gi kh ng ph th` | quickTelex, bật mặc định |
| `g h k` sau nguyên âm | `ng nh ch` | quickConsonants, tắt mặc định |
| `f` đầu từ | `ph` | quickConsonants |
| `j` đầu từ | `gi` | quickConsonants |
| `w` đầu từ (quickConsonants) | `qu` | chỉ khi bật quickConsonants ⚠ xung đột Non-Start |

> ⚠ Hai lớp `w` chồng nhau: **Non-Start** (giữ `web`) luôn thắng; **quickConsonants** (bặt `w→qu`) chỉ áp dụng khi bạn bật công tắc đó. Đây là lý do `quickConsonants` mặc định `false`.

### 0.2 Thẻ VNI một trang

| Phím | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|---|---|---|---|---|---|---|---|---|---|---|
| Nghĩa | Sắc | Huyền | Hỏi | Ngã | Nặng | Mũ | Móc | Trăng | `đ` | Xóa dấu |

- `6` → `â/ê/ô`; bấm lại lần 2 → trả chữ + `6`.
- `7` → `ơ/ư`; bấm lại lần 2 → trả chữ + `7`.
- `8` → `ă`; bấm lại lần 2 → trả chữ + `8`.
- VNI **không dính bẫy Telex** (`text` gõ `text` vẫn là `text` vì không có phím `x` làm dấu).
- VNI **có bẫy số**: `mp3`, `icon6`, `h2o` → engine trả nguyên nếu không tạo được âm tiết hợp lệ.

### 0.3 Thẻ đặt dấu rút gọn

```text
1 nguyên âm          → dấu vào đó
có qu / gi ở đầu    → bỏ u/i ra khỏi danh sách nguyên âm
có coda             → ưu tiên ơ/ê/ô/â/ă; else nguyên âm cuối trước coda
3 nguyên âm         → giữa
uê uơ ue ươ oo      → âm thứ 2
ưa ưu ia ya ua      → âm thứ 1
oa oe uy            → classic: âm 1 | modern: âm 2
ai ao au ay âu ây
eo êu oi ôi ơi ui   → âm thứ 1
```

### 0.4 Thẻ phím tắt

| Tổ hợp | Hành động | Nguồn |
|---|---|---|
| `Ctrl` hai lần (< 400ms) | Đổi phương pháp TE/VNI/AUTO/OFF | `content.js` `lastCtrlTime` |
| `Ctrl+Shift+U` | Đổi hoa/thường của từ hiện tại | `content.js` |
| `Ctrl+Shift+R` hoặc `Alt+R` | Rescue từ thô ↔ có dấu (cấu hình được) | `flipWordShortcut` |
| `Ctrl+Backspace` | Xóa nguyên một từ | `content.js` |
| `⎋` | Hoàn tác revert / ẩn gợi ý / thoát code fence | `content.js` |
| `` ` `` | Bật/tắt inline code bypass | `content.js` |
| `↑` `↓` | Chọn gợi ý | `content.js` |
| `Alt/Ctrl + 1..5` | Chọn gợi ý thứ n | `content.js` |
| `Tab` | Chấp nhận gợi ý | `content.js` |
| `↵` | Chấp nhận gợi ý (nhưng tự ẩn trong chat) | `content.js` |

### 0.5 Thẻ lệnh terminal

```bash
npm ci                    # cài đúng package-lock.json
npm test                  # 98/98 — gate bắt buộc
npm run test:e2e          # 11/11 + 24/24 (cần playwright install chromium)
npm run bundle:extension  # chỉ chạy esbuild
npm run build:firefox     # zip Firefox
npm run build:chrome      # zip Chrome
npm run build:edge        # zip Edge
npm run manifest:chrome   # đổi manifest.json sang bản Chromium
npm run manifest:firefox  # trả manifest.json về bản Firefox
npm run set-version       # scripts/set-version.js
npm run generate:icons    # scripts/generate-icons.js
```

### 0.6 Thẻ trạng thái badge

| Badge | Màu | Method |
|---|---|---|
| `TE` | xanh dương `#2563eb` | Telex |
| `VNI` | `#e6a373` | VNI |
| `AUTO` | lục `#059669` | Auto (mặc định) |
| `OFF` | xám `#64748b` | Tắt |

Broadcast `SETTINGS_UPDATED` **chỉ** khi đổi `avim_settings`, `avim_macros`, `avim_user_dictionary`, `avim_domain_methods`. Không broadcast khi đổi habit model hay typing log.

---

## Phần 1 — Cẩm nang người dùng

### 1.1 Popup: từng công tắc làm gì

Popup tải `popup.js` dạng ES module, import trực tiếp `DEFAULT_SETTINGS` từ `src/engine/config.js`.

| ID trong `popup.html` | Nhãn | Setting | Mặc định |
|---|---|---|---|
| `#macroToggle` | Bật gõ tắt | `macroEnabled` | `true` |
| `#quickTelexToggle` | Telex nhanh `cc→ch` | `quickTelex` | `true` |
| `#wToUEnabledToggle` | Biến `w` | `wToUEnabled` | `true` |
| `#smartHornToggle` | Móc thông minh | `smartHorn` | `true` |
| `#emojiShortcutsToggle` | Shortcut emoji | `emojiShortcuts` | `true` |
| `#autoCapitalizeToggle` | Viết hoa câu | `autoCapitalize` | `false` |
| `#perDomainMemoryToggle` | Nhớ kiểu gõ theo tên miền | `perDomainMemory` | `true` |
| `#toneStyleToggle` | Kiểu dấu cũ/mới | `toneStyle` | `classic` |
| `#spellCheckToggle` | Kiểm tra chánh tả | `spellCheck` | `false` |
| `#quickConsonantsToggle` | Phụ âm nhanh | `quickConsonants` | `false` |
| `#autoRestoreToggle` | Khôi phục từ Tiếng Anh | `autoRestoreEnglish` | `true` |
| `#escRevertToggle` | `⎋` hoàn tác | `escRevert` | `true` |
| `#ctrlToggleToggle` | `Ctrl` đôi đổi method | `ctrlToggleEnabled` | `true` |
| `#autoCompleteToggle` | Gợi ý từ | `autoCompleteEnabled` | `false` |
| `#nextWordToggle` | Gợi ý từ kế tiếp | `nextWordEnabled` | `false` |
| `#gboardLearningToggle` | Học thói quen | `gboardLearningEnabled` | `true` |
| `#eraseHabitLearningToggle` | Học khi xóa từ | `eraseHabitLearning` | `true` |
| `#suggestionStyleSelect` | Kiểu hiển thị gợi ý | `suggestionStyle` | `off` |
| `#domainBanner` | Banner tên miền | `domainMethods` | ẩn |
| `#toggleCurrentDomainBtn` | "Luôn tắt" cho domain hiện tại | `blacklistedDomains` | ẩn |
| `#openOptions` | Mở Options | – | – |

### 1.2 Options: năm tab và từng field

Options tải `options.bundle.js` (IIFE do esbuild đóng gói từ `options.js`, vẫn import `DEFAULT_SETTINGS` ở source).

| Tab | ID | Những gì bạn sửa được |
|---|---|---|
| Macro | `#macrosTab` | Thêm/sửa/xóa trigger, tìm kiếm, export JSON/CSV, import, 3 preset (Sài Gòn Xưa / Lập trình & Git / Toán học), reset |
| Từ điển | `#dictTab` | Thêm/xóa từ riêng, export TXT/JSON, import |
| Bộ gõ | `#imeTab` | Method, toneStyle, spellCheck, quickTelex, wToU, smartHorn, emoji, autoCapitalize, autoSpace, properNouns, backspaceBySyllable, quickConsonants, autoUndo, autoRestore, escRevert, markdownCodeLock, phonologyRules, wordRescue, flipWordShortcut, autoHarmonizeCase, eraseHabitLearning/Threshold, ctrlToggle, autocomplete, nextWord, gboardLearning, suggestionStyle, debugTypingLog, Copy Debug Snapshot |
| Gợi ý & học | `#aiTab` | Trùng các công tắc gợi ý ở tab Bộ gõ + quản lý habit model (export/import/reset/seed/thêm cặp) |
| Loại trừ | `#exclusionsTab` | `blacklistedDomains` (textarea), `perDomainMemory`, thêm domain → method riêng, ô password/`data-no-ime` bị khóa |

Các modal: `#macroModal`, `#importModal`, `#importDictModal`, `#importHabitsModal`, `#editHabitModal`.

### 1.3 Macro mặc định & preset

**Macros thông dụng** (`DEFAULT_MACROS` trong `macro.js`):

```text
tv→Tiếng Việt   vn→Việt Nam   hn→Hà Nội   sg→Sài Gòn
dc→được        ko→không      k→không (disabled)   ntn→như thế nào
vs→với         bt→biết       cb→chuẩn bị          dy→đồng ý
tks→cảm ơn     mst→mã số thuế                     sdt→số điện thoại
zia/dzi→dzìa   zi→dzí        zo→dzô
+today→$DATE   +now→$DATETIME                     +cb→$CLIPBOARD
```

**Preset Sài Gòn Xưa:** `sgx, hcm, bcbc, blbx, bxk, crdt, ccca, cccn, cdcc, mdo, mo, hx, hxq, hghs, hd, hcc, hc, sd, sm, ss, tq, ts, tmanh, tt, tto, tdtd, qtmb, mtd, vg, vp, tlml, bcl, tm, th, tt2, tcl, dtt, xtm, xl`.

**Preset Lập trình & Git:** `;gits → git status`, `;gitc → git commit -m ""`, `;gitp → git push origin main`, `;gitl → git log --oneline -n 10`, `;gitb → git checkout -b `, `;clg → console.log()`, `;todo`, `;fixme`.

**Preset Toán học:** `;pi → π`, `;sum → ∑`, `;inf → ∞`, `;deg → °`, `;pm → ±`.

⚠ Macro `k → không` bị `enabled: false` mặc định để tránh bung khi gõ Vitamin K / biến `k`.

### 1.4 Từ điển riêng

- Mặc định chứa toàn bộ `COMMON_ENGLISH_WORDS` (bao gồm `sway`, `manjaro`, `text`, `user`, `push`, `window`, `luxury`).
- Thêm từ: Options → Từ điển → `newDictWordInput` → `+ Thêm Từ`.
- `isCustomUserWordPrefix()` bảo vệ prefix: nếu đã thêm `sas`, gõ `s`, `sa`, `sas` không bị bỏ dấu.
- Học tự động: xóa nguyên từ có dấu ≥ `eraseHabitThreshold` (mặc định 3) → dạng thô được thêm vào user dictionary. HUD báo nhẹ.

### 1.5 Gợi ý & học thói quen

- `autoCompleteEnabled`: thanh gợi ý trong Shadow DOM `#__avim_gboard_host__`.
- `suggestionStyle`: `off | ribbon | ghost_text`.
- `nextWordEnabled`: gợi ý từ kế tiếp theo bigram/trigram.
- `gboardLearningEnabled`: lưu model vào `avim_gboard_habit_model`.
- Domain-Isolation Weight Lock: từ kỹ thuật trong miền lập trình có suy hao λ = 0,0001 và neo +5.0 để không bị câu thường lấn át.
- Trong chat (Telegram/Slack/Messenger/Zalo), `Enter` **không** bị chặn — tin nhắn được gởi ngay.

### 1.6 Domain & blacklist

- `blacklistedDomains`: tắt hẳn IME trên tên miền đó.
- `perDomainMemory` + `domainMethods`: nhớ method riêng cho từng site (ví dụ GitHub → OFF, gmail.com → TE).
- Popup hiện `#domainBanner` khi site đang có rule riêng; nút `#toggleCurrentDomainBtn` = "Luôn tắt".
- `DEVELOPER_CHEAT_DOMAINS` trong `key-codes.js` là danh sách cứng (github.com, gitlab.com, leetcode.com, vscode.dev, stackblitz.com, codepen.io, replit.com, kaggle.com, huggingface.co...).

### 1.7 Debug snapshot & log

- Options → `copyDebugSnapshotBtn` → sao chép version, browser, settings, engine state.
- `debugTypingLog`: lưu `openviet_typing_logs`, tải về `typing-log.jsonl` qua `downloadTypingLogBtn`.
- `trackKeyEvent` trong E2E ghi `ime-error-context-logs.json` khi có Backspace/Escape bất thường.

---

## Phần 2 — Cẩm nang gõ phím (thẻ tra cứu)

### 2.1 Bảng Telex

Xem thẻ [0.1](#01-thẻ-telex-một-trang). Bảng đầy đủ nằm trong [`VIETNAMESE_PHONOLOGY.md` §7](../VIETNAMESE_PHONOLOGY.md#7-telex-và-vni-bàn-phím-được-dịch-thành-chữ-như-thế-nào).

### 2.2 Bảng phụ âm đầu

| Nhóm | Hợp lệ | Bị chặn | Rule |
|---|---|---|---|
| C/K | `c` + a/ă/â/o/ô/u/ư; `k` + e/ê/i/y | `ce/cê/ci/cy` | `hasCkPhonologyViolation` |
| G/GH | `g` + a/ă/â/o/ô/u/ư; `gh` + e/ê/i | `ge/gê` | `hasGghPhonologyViolation` |
| NG/NGH | `ng` + a/ă/â/o/ô/u/ư; `ngh` + e/ê/i | `nge/ngê/ngi` | `hasNgPhonologyViolation` |
| QU | `q` + `u` + nguyên âm | `q` đứng một mình | `isQu` |
| GI | `gi` + nguyên âm khác | `gi` + phụ âm → g + i | parser |
| Đ | `dd → đ`, `đ + d → dd` | – | `checkConsonant` |
| Ngoại lai | – | `pl fl cl gl bl sl pr dr cr br gr fr wr sp st sk sm sn sw tw dw spl spr str scr shr squ kn ps rh phl chr sch` | `hasForeignOnset` |
| Ngoại lệ địa danh | `pleiku krông prông glong grai gram đrắk đrak m'đrắk` | – | `isPotentialPrefix` |

### 2.3 Bảng coda

| Coda | Nhóm | Dấu |
|---|---|---|
| `''` | mở | tất cả (trừ `ă/â` khi hoàn tất) |
| `m n ng nh` | mũi | tất cả |
| `c ch p t` | tắc | **chỉ Sắc/Nặng** |
| `k l r h` | dân tộc | whitelist địa danh |

### 2.4 Bảng dấu thanh và ngoại lệ

| Tình huống | classic | modern |
|---|---|---|
| `hoa` + Huyền/Sắc | `hòa` `hóa` | `hoà` `hoá` |
| `thuy` + Hỏi | `thủy` | `thuỷ` |
| `khoe` + Hỏi | `khỏe` | `khoẻ` |
| `tuy` + Huyền | `tùy` | `tuỳ` |
| `quý quả quế` | dấu trên `y/a/e` (cả hai) | same |
| `toán quán nước tiếng` | dấu trên âm chính (cả hai) | same |
| `cười chuối nhiều` | âm giữa (cả hai) | same |
| `thuế huế múa cứu` | theo cặp đặc biệt (cả hai) | same |

### 2.5 Blacklist tổ hợp nhanh

```text
ơ + e a o u ê ă â   → cấm          ă + nguyên âm/bán nguyên âm → cấm
ia ya ua ưa + coda  → cấm          uo ie ye + coda + dấu        → cấm
c + e ê i y          → cấm          g + e ê                      → cấm
ng + e ê i           → cấm          c/ch/p/t + Huyền/Hỏi/Ngã    → cấm
coda b d f j l q r s v w x z       → cấm (trừ whitelist)
cluster rv lv nv st sp sc sk ct pt ft lt nt nd rd ld rk lk mp nk nch tch → cấm
digraph oo ee ea ou ow ew (>=4 chữ, không phải từ Việt)          → cấm
```

### 2.6 Bảng từ bẫy theo nhóm

| Nhóm | Từ |
|---|---|
| Telex cổ điển | `text next context exit user super server router player master worker filter center letter matter better doctor factor sector vector error horror mirror sensor cursor` |
| `-ow/-ower` | `show slow blow grow flow lower flower shower power tower now how` |
| `-x-` | `expect exact exam example exist execute exercise except excess exchange expand expense expert express explain explore export extra extreme text next index matrix syntax prefix suffix annex latex reflex pixel toxic oxide oxygen galaxy` |
| `-ur-` | `current currency occur refer prefer` |
| Công nghệ | `linux server browser docs modern variable backtick restore refactor query mixed lowercase uppercase software network hardware password` |
| Bẫy `w` | `sway`, `window`, `windows`, `world`, `work`, `word` |
| Bẫy tên riêng | `manjaro`, `tesla`, `saas`, `ajax`, `duplex`, `complex`, `status`, `focus`, `radius` |
| Ưu tiên Tiếng Việt | `as is os us of if or conf must rust rest test cast past cost post host lost fast dust best this these bits hits fits case care base dose rose fuse nose` |

### 2.7 Bài tập tự kiểm tra (40 ca, có đáp án)

| # | Gõ | Kỳ vọng | Giải thích ngắn |
|---|---|---|---|
| 1 | `toans␣` | `toán` | Dấu dời sang `a` khi có coda `n` |
| 2 | `toasn␣` | `toán` | Gõ dấu trước vẫn dời đúng |
| 3 | `cas␣` | `cá` | `a` + Sắc |
| 4 | `dduocw␣` | `được` | `dd→đ`, `uow→ươ` |
| 5 | `nuocw␣` | `nước` | SmartHorn `uo→ươ` |
| 6 | `thw␣` | `thư` | `w` sau phụ âm |
| 7 | `web␣` | `web` | Non-Start |
| 8 | `sway␣` | `sway` | Trap word auto-restore |
| 9 | `manjaro␣` | `manjaro` | Trap word |
| 10 | `text␣` | `text` | `têt` → restore |
| 11 | `user␣` | `user` | `úẻ` → restore |
| 12 | `push␣` | `push` | `púh` → restore |
| 13 | `luxury␣` | `luxury` | `lủuy` → restore |
| 14 | `window␣` | `window` | `ưindoư` → restore |
| 15 | `docs␣` | `docs` | Toggle phím dấu, de-dup |
| 16 | `tesst␣` | `test` | `toneCancelled` de-dup |
| 17 | `useState␣` | `useState` | camelCase guard |
| 18 | `playwright␣` | `playwright` | Foreign onset `pl` |
| 19 | `center␣` | `center` | `c+e` violation |
| 20 | `get␣` | `get` | `g+e` violation |
| 21 | `danger␣` | `danger` | `ng+e` violation |
| 22 | `fcitx5␣` | `fcitx5` | Không có nucleus |
| 23 | `xoong␣` | `xoong` | Loanword double-o |
| 24 | `tieengs␣` | `tiếng` | Word Rescue |
| 25 | `hoas␣` (classic) | `hóa` | Dấu trên âm đệm |
| 26 | `hoas␣` (modern) | `hoá` | Dấu trên âm chính |
| 27 | `thuysr␣` (classic) | `thủy` | `uy` → âm 1 |
| 28 | `thuysr␣` (modern) | `thuỷ` | `uy` → âm 2 |
| 29 | `quys␣` | `quý` | `u` trong `qu` không nhận dấu |
| 30 | `mias␣` | `mía` | Cặp mở, âm 1 |
| 31 | `cuwus␣` | `cứu` | `ưu` → âm 1 |
| 32 | `thuws␣` | `thuế` | `uê` → âm 2 |
| 33 | `cuoif␣` | `cười` | Triphthong, âm giữa |
| 34 | `chuois␣` | `chuối` | `uôi`, âm giữa |
| 35 | `bacs␣` | `bác` | Stop final + Sắc OK |
| 36 | `bacf␣` | `bacf` | Stop final + Huyền bị chặn |
| 37 | `dangf␣` | `đàng`? ⚠ | Xem chú thích dưới bảng |
| 38 | `ce␣` | `ce` | `c+e` → foreign |
| 39 | `keto␣` | `keto` | Không phải âm tiết Việt, giữ thô |
| 40 | `hòa␣z` | `hoa` | `z` xóa dấu, giữ `a` |

> ⚠ Ca 37 chỉ để kiểm tra bạn có thấy `dang` không có coda tắc: `ng` là coda mũi, mọi dấu đều được → `đàng` hợp lệ về mặt cấu trúc. Nếu bạn kỳ vọng `đang`, hãy nhớ `d` thô cần `dd` để thành `đ`.

---

## Phần 3 — Cẩm nang khắc phục sự cố (cookbook)

Mỗi ca có cùng cấu trúc: **Triệu chứng → Nguyên nhân → Thử → Sửa → Verify**.

### 3.1 Ca 1 — Gõ nhanh thành `toáan`, `vâyậy`

- **Triệu chứng:** chữ thô lọt vào trước chữ có dấu khi gõ ≤ 5ms/phím.
- **Nguyên nhân:** framework (React/Slate/TipTap) nghe `keydown`/`beforeinput` sau content script.
- **Thử:** bật `debugTypingLog`, gõ `toans `, xem log có `Backspace` bất thường không.
- **Sửa:** đảm bảo `addEventListener('keydown', ..., true)` + `preventDefault()` + `stopImmediatePropagation()` + guard `beforeinput` 80ms còn nguyên.
- **Verify:** `npm test` → `avim-hotpath.test.js`; E2E rich-editor 24/24.

### 3.2 Ca 2 — Mất dấu trong Telegram/GitHub/Teams

- **Triệu chứng:** `đồ` thành `do`, `ăn` thành `an` sau khi gõ tiếp.
- **Nguyên nhân:** `extractWordBeforeOffset()` trả prefix ASCII cũ trong khi `lastTransformed` đã có dấu; hoặc editor model-backed (Teams) tự render lại.
- **Thử:** so sánh `inspectState().lastTransformed` với DOM text tại caret.
- **Sửa:** ưu tiên `lastTransformed` trong rich-editor recovery; dùng adapter `paste`/`beforeinput targetRanges` cho Teams.
- **Verify:** canary `toans → toán` phải xanh trước khi tin vào các ca khác.

### 3.3 Ca 3 — `toán` thành `toáns` hoặc `toáans`

- **Nguyên nhân:** `beforeinput` rò rỉ sau khi `keydown` bị hủy.
- **Thử:** log `_blockedKeys`.
- **Sửa:** cửa sổ guard 80ms; không giảm xuống dù muốn "nhanh hơn".
- **Verify:** `word-boundary.test.js`, `ime-edge-cases.test.mjs`.

### 3.4 Ca 4 — E2E headful đỏ, headless xanh

- **Nguyên nhân kinh điển (đã từng xảy ra):** headful dùng `about:blank` → `<all_urls>` content script không attach; nạp manifest Firefox có `background.scripts` → Chromium từ chối.
- **Sửa:** origin `http://openviet.test` qua `page.route()` + thư mục extension tạm copy `manifest.chrome.json`.
- **Verify:** canary `toans → toán` ở đầu mỗi suite. Nếu canary đỏ mà trap word xanh → **pass giả**.

### 3.5 Ca 5 — `wToUEnabled` bật mà `sway` vẫn đổi

- **Không phải bug:** `sway` nằm trong `COMMON_ENGLISH_WORDS`; có thể đổi tạm trong lúc gõ nhưng trả về lúc bấm `␣`.
- **Nếu muốn literal ngay:** tắt `wToUEnabled`.
- **Verify:** `w-to-u-toggle.test.js`.

### 3.6 Ca 6 — `web` bị thành `wẻb`

- **Nguyên nhân:** Non-Start policy bị phá (thường do bật `quickConsonants` `w→qu` hoặc sửa early return).
- **Sửa:** giữ `typeW2U: true` nội bộ; early return ở đầu `processKey()`.
- **Verify:** `telex-w-revert.test.js`, `url-code-guards.test.js`.

### 3.7 Ca 7 — `sway`/`manjaro` bị biến dạng

- **Nguyên nhân:** xóa khỏi `COMMON_ENGLISH_WORDS` hoặc `shouldAutoRestoreEnglish()` chặn raw < 3 ký tự.
- **Sửa:** đưa từ lại vào `COMMON_ENGLISH_WORDS`; giữ `manjaro` và `sway`.
- **Verify:** `mixed-corpus.test.js`, `avim.test.js`.

### 3.8 Ca 8 — `center` bị thành `cênter`

- **Nguyên nhân:** `phonologyRules` bị tắt hoặc `hasCkPhonologyViolation()` regex bị sửa.
- **Sửa:** bật lại `phonologyRules`; giữ regex `^c[eèéẻẽẹêếềểễệiíìỉĩịyýỳỷỹỵ]`.
- **Verify:** `phonology-roundtrip.test.js`, `hardcore-edge-cases.test.js`.

### 3.9 Ca 9 — `get` bị thành `gét`

- **Sửa:** `hasGghPhonologyViolation()` phải khớp `(^|[^a-z0-9])g[e...ê...]`.

### 3.10 Ca 10 — `danger` bị thành `dănger`

- **Sửa:** `hasNgPhonologyViolation()` phải khớp `(^|[^a-z0-9])ng[e...i...]`.

### 3.11 Ca 11 — `bàc` vẫn nhận dấu

- **Nguyên nhân:** `isCheckedToneViolation()` không được gọi trước `checkTone()`.
- **Sửa:** gọi ở đầu `checkTone()` khi `phonologyRules` bật; coda `c/ch/p/t` + tone 2/3/4 → pass-through.
- **Verify:** `syllable-parser.test.js`.

### 3.12 Ca 12 — Dấu đứng sai (`tóan`)

- **Nguyên nhân:** `getTargetVowelIndex()` bị sửa hoặc `checkDynamicToneShift()` không chạy.
- **Sửa:** khôi phục cây quyết định [0.3](#03-thẻ-đặt-dấu-rút-gọn).
- **Verify:** `phonology-roundtrip.test.js` (`toán → toans → toan1`).

### 3.13 Ca 13 — Mixed case `ĐƯợc` không được sửa

- **Nguyên nhân:** `autoHarmonizeCase` mặc định `false`.
- **Sửa:** bật trong Options nếu muốn; camelCase và ALL CAPS vẫn được giữ.
- **Verify:** `casing` tests trong `ime-edge-cases.test.mjs`.

### 3.14 Ca 14 — Gõ `as` bị thành `á` rồi không restore

- **Nguyên nhân:** `as` nằm trong `ENGLISH_PREFER_VIETNAMESE` → ưu tiên Tiếng Việt. Đây là hành vi thiết kế.
- **Sửa nếu không muốn:** thêm `as` vào user dictionary hoặc gõ trong code mode.

### 3.15 Ca 15 — Macro bung lại sau Backspace

- **Nguyên nhân:** Backspace xóa Space, Space bung macro lần 2.
- **Sửa:** undo 2 bước + `suppressedTrigger` trong `macro.js`.
- **Verify:** `macro.test.js`, `macro-edge.test.js`.

### 3.16 Ca 16 — `;gitc` không ra `git commit -m ""`

- **Kiểm tra:** `macroEnabled` bật; trigger bắt đầu `;`; delimiter sau trigger; preset Git đã nạp.
- **Sửa:** nạp lại "# 💻 Lập trình & Git".

### 3.17 Ca 17 — Gợi ý làm chậm phím đầu

- **Nguyên nhân:** index bị dựng lúc import.
- **Sửa:** `_ensureIndexes()` lazy prefix bucket; user bucket chỉ rebuild khi index đổi.
- **Verify:** `autocomplete.test.js`, `autocomplete-edge.test.js`.

### 3.18 Ca 18 — Từ kỹ thuật bị gợi ý lấn át

- **Sửa:** Domain-Isolation Weight Lock λ = 0,0001, neo +5.0; không tăng λ.
- **Verify:** `autocomplete-edge.test.js`.

### 3.19 Ca 19 — `Enter` trong Telegram bị chặn

- **Nguyên nhân:** suggestion bar không ẩn khi có gợi ý.
- **Sửa:** chat detection ẩn bar trước khi `Enter` đi qua; không `preventDefault()`.

### 3.20 Ca 20 — Popup không lưu setting

- **Nguyên nhân:** `storage.sync` không có (web app localhost) và fallback `localStorage` bị chặn.
- **Sửa:** popup fallback `localStorage.getItem('avim_settings')`; content script fallback tương tự.
- **Verify:** `settings-parity.test.js`.

### 3.21 Ca 21 — Service worker và popup lệch default

- **Sửa:** mọi default phải đến từ `DEFAULT_SETTINGS`; service worker là classic script nên giữ bản sao + parity test.
- **Verify:** `npm test` phải có `settings-parity.test.js` xanh.

### 3.22 Ca 22 — Badge không đổi sau khi bấm popup

- **Nguyên nhân:** `SETTINGS_UPDATED` broadcast bị chặn do `changes` không khớp 4 khóa cho phép.
- **Sửa:** chỉ broadcast cho `avim_settings`, `avim_macros`, `avim_user_dictionary`, `avim_domain_methods`.

### 3.23 Ca 23 — `npm test` đỏ sau khi sửa engine

- **Quy trình:** đọc tên test đỏ → map về [4.9](#49-bản-đồ-test-98-cases) → sửa rule tương ứng → chạy lại cả 98, không chỉ file đỏ.

### 3.24 Ca 24 — Build Firefox ra manifest Chromium

- **Nguyên nhân:** quên `npm run manifest:firefox` sau build Chrome/Edge.
- **Sửa:** luôn kết thúc phiên build bằng `npm run manifest:firefox`.
- **Verify:** `unzip -p ...zip manifest.json | grep background`.

### 3.25 Ca 25 — Reviewer AMO rebuild khác checksum

- **Không lỗi:** BUILD.md ghi rõ ZIP byte có thể khác do timestamp. Cần **tương đương chức năng** + `npm ci` + 98/98.

### 3.26 Ca 26 — Source zip thiếu `docs/`

- **Nguyên nhân:** dùng `web-ext build` thay vì `git archive`.
- **Sửa:** `git archive --format=zip --prefix=openviet-ime-source/ -o ... HEAD`.

### 3.27 Ca 27 — AMO doc lọt lên repo root

- **Sửa:** mọi file nộp AMO chỉ nằm trong `web-ext-artifacts/`; xóa bản root nếu có.

### 3.28 Ca 28 — `gh` không tồn tại trên Arch

- **Sửa:** `yay -S github-cli` → `gh auth login`. **Không** nhận `hg` (đó là Mercurial).

### 3.29 Ca 29 — `manifest.json` / `*.bundle.js` bị commit nhầm

- **Sửa:** chúng phải nằm trong `.gitignore`; chỉ commit source + `manifest.*.json` mẫu.

### 3.30 Ca 30 — Thuật ngữ lệch trong UI/docs

- **Sửa:** dùng **Tiếng Việt**, **chánh tả**, **gởi** theo quy ước ở [`ARCHITECTURE.md` §0](../ARCHITECTURE.md#0-cẩm-nang-từ-vựng-đọc-xong-bảng-này-là-hiểu-nửa-tài-liệu). Dữ liệu gợi ý cố tình giữ hai biến thể của từ `gởi` — đó là từ vựng, không phải văn bản giao diện.
- **Verify:** chạy `npm run check:terms` → `0 lỗi`.

---

## Phần 4 — Cẩm nang kỹ sư

### 4.1 Bản đồ file: mở khi nào

| File | Mở khi... | Đối tượng/hàm chính |
|---|---|---|
| `src/engine/config.js` | Thêm/sửa setting | `DEFAULT_SETTINGS` |
| `src/engine/key-codes.js` | Sửa phím, delimiter, code guard | `TELEX_KEYS`, `VNI_KEYS`, `TONE_STYLE`, `isUrlOrEmailOrCode`, `isCamelOrPascalCase`, `isDeveloperCheatContext` |
| `src/engine/syllable-parser.js` | Dấu sai chỗ / tổ hợp lạ | `ParsedSyllable`, `isValid()`, `reconstruct()`, `parseSyllable()` |
| `src/engine/avim.js` | Mọi thứ về gõ phím | `AvimEngine.processKey()`, `checkTone()`, `getTargetVowelIndex()`, `applyTelexW()`, `checkAutoRestore()` |
| `src/engine/dictionary.js` | Từ Anh bị dính dấu / chánh tả | `hasPhonologyViolation()`, `shouldAutoRestoreEnglish()`, `reverseVietnameseWord()`, `checkWordSpelling()` |
| `src/engine/vietnamese-words.js` | Thêm từ hiếm/địa danh | `getVietnameseWordSet()`, `canon()`, 4 mảng ngoại lệ |
| `src/engine/macro.js` | Gõ tắt | `DEFAULT_MACROS`, `MacroEngine` |
| `src/engine/autocomplete.js` | Gợi ý/học | `AutoCompleteEngine`, `LearnedModel` |
| `src/engine/casing.js` | Hoa/thường | `harmonizeSyllableCase()` |
| `src/content/dom-observer.js` | Chọn target | `DomObserver` |
| `src/content/text-replacer.js` | Thay chữ trong DOM | 4 adapter + `extractWordBeforeOffset()` |
| `src/content/content.js` | Điều phối sự kiện | `AvimContentScript.handleKeyDown()` |
| `src/background/service-worker.js` | Badge/storage/broadcast | `updateBadge()`, `onChanged` |
| `src/popup/popup.js` | UI popup | ES module, import `DEFAULT_SETTINGS` |
| `src/options/options.js` | UI Options | IIFE bundle |
| `manifest.firefox.json` | Firefox packaging | `background.scripts`, Gecko ID |
| `manifest.chrome.json` | Chrome/Edge packaging | `service_worker` |

### 4.2 Luồng sự kiện (để instrument)

```text
keydown(capture=true)
  → shortcut layer (DoubleCtrl / Ctrl+Shift+U / Esc / suggestion keys)
  → method OFF guard
  → DomObserver target guard
  → URL/email/code guard
  → macro guard
  → delimiter guard (auto-restore + bigram learning)
  → AvimEngine.processKey()
       ├─ wToU early return
       ├─ quickConsonants / quickTelex
       ├─ consonant / vowel shape / shape swap
       ├─ tone / dynamic tone shift
       └─ default append + ươ upgrade
  → preventDefault + stopImmediatePropagation + _blockedKeys
  → TextReplacer.replaceInNativeInput|replaceInContentEditable
  → (150ms) AutoCompleteEngine.getSuggestions → Shadow DOM
```

`beforeinput` guard 80ms nằm ngay trước `TextReplacer` để chặn `InputEvent` rò rỉ.

### 4.3 Trạng thái engine cần biết

| Trường | Ý nghĩa |
|---|---|
| `currentWordRaw` | Chuỗi phím thô đang gõ |
| `lastTransformed` | Kết quả có dấu gần nhất (dùng cho rich-editor recovery) |
| `lastToneToggledWord` | Từ vừa toggle dấu, để lần sau viết literal |
| `toneCancelled` | Cờ de-dup `tesst → test` |
| `prevWordWasEnglish` | Từ trước đã được restore |
| `_blockedKeys[key]` | Timestamp phím vừa chặn, cho guard `beforeinput` |
| `_inInlineCode`, `_inFencedCode` | Markdown code lock |
| `suppressedTrigger` | Macro không bung lại sau undo |

`inspectState()` trả snapshot 6 trường đầu — dùng trong debug snapshot và test.

### 4.4 Storage keys

| Key | Area | Nội dung |
|---|---|---|
| `avim_settings` | sync (fallback local) | Toàn bộ `DEFAULT_SETTINGS` + `domainMethods` |
| `avim_macros` | sync | Danh sách macro |
| `avim_user_dictionary` | local → sync → localStorage | Từ điển riêng |
| `avim_domain_methods` | sync | Method riêng theo tên miền |
| `avim_erased_word_habits` | storage | Đếm lần xóa từ |
| `avim_gboard_habit_model` | storage/local | Bigram/trigram học được |
| `openviet_typing_logs` | storage | Debug log |
| `localStorage: avim_settings` | web app | Fallback khi không có extension API |

### 4.5 Bảng settings đầy đủ

| Key | Default | Tác dụng ngắn |
|---|---|---|
| `method` | `3` | 0 OFF, 1 Telex, 2 VNI, 3 Auto |
| `lastMethod` | `3` | Nhớ method trước khi OFF |
| `toneStyle` | `'classic'` | `hòa` / `hoà` |
| `macroEnabled` | `true` | Bật gõ tắt |
| `spellCheck` | `false` | Tra cứu ~6.700 âm tiết |
| `autoUndo` | `true` | Undo 2 bước cho macro |
| `ctrlToggleEnabled` | `true` | Ctrl đôi đổi method |
| `quickConsonants` | `false` | `f→ph`, `j→gi`, `w→qu`, `g/h/k→ng/nh/ch` |
| `quickTelex` | `true` | `cc→ch`, `gg→gi`, … |
| `typeW2U` | `true` | Nội bộ, ép Non-Start |
| `wToUEnabled` | `true` | Công tắc `w` người dùng |
| `smartHorn` | `true` | `uo/uu → ươ/ưu` |
| `emojiShortcuts` | `true` | `:name → emoji` |
| `autoCapitalize` | `false` | Hoa chữ đầu câu |
| `autoSpaceAfterPunctuation` | `false` | Thêm space sau dấu câu |
| `autoCapitalizeProperNouns` | `false` | Hoa danh từ riêng |
| `properNounsList` | `[]` | Danh sách danh từ riêng |
| `backspaceBySyllable` | `false` | Xóa theo âm tiết |
| `perDomainMemory` | `true` | Nhớ method theo domain |
| `domainMethods` | `{}` | Bảng domain → method |
| `autoRestoreEnglish` | `true` | Trả từ Tiếng Anh ở delimiter |
| `escRevert` | `true` | `⎋` trả phím thô |
| `markdownCodeLock` | `false` | Khóa dấu trong code fence |
| `phonologyRules` | `true` | c/k, g/gh, ng/ngh, foreign onset, checked tone |
| `wordRescue` | `true` | Rescue thô ↔ có dấu |
| `flipWordShortcut` | `'Alt+R'` | Phím tắt rescue |
| `autoCompleteEnabled` | `false` | Thanh gợi ý |
| `nextWordEnabled` | `false` | Gợi ý từ kế |
| `suggestionStyle` | `'off'` | `ribbon|ghost_text|off` |
| `gboardLearningEnabled` | `true` | Học thói quen |
| `autoHarmonizeCase` | `false` | Sửa `ĐƯợc → Được` |
| `eraseHabitLearning` | `true` | Học khi xóa từ |
| `eraseHabitThreshold` | `3` | Ngưỡng xóa (2–10) |
| `debugTypingLog` | `false` | Ghi nhật ký gõ |
| `blacklistedDomains` | `[]` | Tắt IME theo domain |

### 4.6 Cấu trúc dữ liệu quan trọng

```js
ParsedSyllable {
  onset, glide, nucleus, coda, tone,
  hasApostrophe, apostrophePrefix
}

AvimEngine state {
  method, toneStyle, spellCheck, autoRestore,
  quickConsonants, quickTelex, autoRestoreEnglish,
  escRevert, phonologyRules, autoHarmonizeCase,
  typeW2U, wToUEnabled, smartHorn,
  currentWordRaw, lastTransformed,
  lastToneToggledWord, toneCancelled, prevWordWasEnglish
}

TONE_MARK {
  NONE:0, ACUTE:1, GRAVE:2, HOOK_ABOVE:3, TILDE:4, DOT_BELOW:5
}
```

### 4.7 Checklist thêm rule mới

1. Viết rule vào file đúng (`avim.js` cho phím, `syllable-parser.js` cho cấu trúc, `dictionary.js` cho từ/bẫy).
2. Thêm setting vào `DEFAULT_SETTINGS` nếu rule có công tắc.
3. Cập nhật popup/options nếu công tắc hiện ra UI.
4. Cập nhật service worker nếu cần broadcast.
5. Thêm ít nhất 1 unit test + 1 E2E canary nếu đụng luồng gõ.
6. Chạy `npm test` (98+) và `npm run test:e2e`.
7. Cập nhật `VIETNAMESE_PHONOLOGY.md` nếu là rule ngữ âm, `ARCHITECTURE.md` nếu là rule pipeline.
8. Cập nhật `CHANGELOG.md` + AMO doc nếu phát hành.
9. Chạy `npm run check:terms` → `0 lỗi`.

### 4.8 Checklist thêm test

- Đặt tên test mô tả triệu chứng, không mô tả implementation (`toans → toán`, không `testToneIndex`).
- Dùng `node:test` (`node --test`), **không** dùng Vitest (đã gỡ).
- Thêm file vào danh sách trong script `test` của `package.json`.
- Nếu test E2E: luôn đặt canary `toans → toán` trước các trap word.

### 4.9 Bản đồ test (98 cases)

| File | Nhóm bảo vệ |
|---|---|
| `avim.test.js` | Core Telex/VNI, tone, auto-restore, `cas/toans/tesst` |
| `avim-hotpath.test.js` | Gõ nhanh, race condition |
| `word-boundary.test.js` | Delimiter, caret, tách từ |
| `w-to-u-toggle.test.js` | `wToUEnabled` ON/OFF, Non-Start |
| `macro.test.js` | Trigger, delimiter, casing, variables |
| `macro-edge.test.js` | Undo 2 bước, `suppressedTrigger` |
| `autocomplete.test.js` | Prefix bucket, gợi ý |
| `autocomplete-edge.test.js` | Domain lock, decay, học |
| `syllable-parser.test.js` | 5 thành phần, `isValid`, reconstruct |
| `vietc-regression.test.js` | Shape swapping â↔ă, ô↔ơ |
| `phonology-roundtrip.test.js` | `toán ↔ toans ↔ toan1`, checked tone |
| `mixed-corpus.test.js` | Song ngữ Việt/Anh, `sway`, `manjaro` |
| `hardcore-edge-cases.test.js` | `toansf → toàn`, `toansfr → toản`, `toansfz → toan` |
| `telex-w-revert.test.js` | `w` toggle, `ơ+w→o`, `ư+w→w` |
| `vni-macro-vars.test.js` | VNI + `$DATE/$TIME/$DATETIME/$CLIPBOARD` |
| `url-code-guards.test.js` | URL/email/camelCase/snake_case |
| `ime-edge-cases.test.mjs` | Ép xoá có dấu, ESC revert, casing |
| `settings-parity.test.js` | `DEFAULT_SETTINGS` khớp service worker |
| `playwright-e2e.js` *(E2E)* | 11 ca: trap word, camelCase, foreign onset, canary |
| `playwright-rich-editors.test.js` *(E2E)* | 24 ca: input/textarea/contenteditable/TipTap/Lexical/Teams mock |

### 4.10 Giải phẫu E2E harness

```text
test/playwright-e2e.js (11)     ─┐
test/playwright-rich-editors.test.js (24) ─┴─ npm run test:e2e
```

Điểm thiết yếu:

- `http://openviet.test/**` → `page.route()` trả HTML tĩnh. **Không dùng `about:blank`** vì `<all_urls>` không attach.
- Headful: `chromium.launchPersistentContext` + `--disable-extensions-except=.` + `--load-extension=.`.
- Thư mục extension tạm: copy `manifest.chrome.json` → `manifest.json` (Chromium từ chối `background.scripts`).
- Headless: inject `content.bundle.js` trực tiếp.
- Canary đầu mỗi suite: gõ `toans ` phải ra `toán`. Nếu canary đỏ → mọi trap word pass là pass giả.
- Tốc độ gõ: `page.keyboard.type(text, { delay: 5 })`.
- `page.exposeFunction('trackKeyEvent', ...)` → `ime-error-context-logs.json`.

### 4.11 Giải phẫu build và artifact

| Lệnh | Manifest | Output |
|---|---|---|
| `npm run build:firefox` | `manifest.firefox.json` | `openviet_ime-firefox-1.4.5.zip` |
| `npm run build:chrome` | `manifest.chrome.json` | `openviet_ime-chrome-1.4.5.zip` |
| `npm run build:edge` | `manifest.chrome.json` | `openviet_ime-edge-1.4.5.zip` |

`web-ext build --ignore-files` loại: `test docs scripts *.md package-lock.json bun.lock yarn.lock google-suggestions.md generate_openviet_ime_codebase_text.py openviet_ime_codebase.txt .gitignore .env* manifest.chrome.json manifest.firefox.json web-ext-artifacts/** node_modules/** logs`.

Gitignore: `manifest.json`, `src/content/content.bundle.js`, `src/options/options.bundle.js`.

Bảng checksum chính thức nằm tại **`web-ext-artifacts/SHA256SUMS.txt`** — không commit vào git, vì source zip chứa chính `docs/` này. Nếu copy checksum vào đây thì file sẽ tự lỗi thời ngay sau khi regenerate source zip.

> 📦 Checksum thay đổi nếu commit thêm docs/source. Luôn regenerate source zip rồi `SHA256SUMS.txt` theo [4.12](#412-release-playbook-copy--paste).

### 4.12 Release playbook (copy & paste)

```bash
# 1. Guard
npm ci
npm test                       # 98/98
npm run test:e2e               # 11/11 + 24/24
npm run check:terms              # 0 lỗi thuật ngữ

# 2. Commit mọi thay đổi
git add -A
git commit -m "docs/release: ..."

# 3. Build 3 extension zip
npm run build:firefox
npm run build:chrome
npm run build:edge
npm run manifest:firefox       # trả working tree về bản Firefox

# 4. Force tag (nếu đã phát hành tag cũ)
git tag -f -a v1.4.5 -m "Release v1.4.5"
git push origin main
git push --force origin v1.4.5

# 5. Source zip từ HEAD + checksums
git archive --format=zip --prefix=openviet-ime-source/ \
  -o web-ext-artifacts/openviet_ime-1.4.5-source.zip HEAD
sha256sum web-ext-artifacts/openviet_ime-{firefox,chrome,edge}-1.4.5.zip \
          web-ext-artifacts/openviet_ime-1.4.5-source.zip \
  > web-ext-artifacts/SHA256SUMS.txt

# 6. Clean-source verification
rm -rf /tmp/opencode/openviet-145-verify
mkdir -p /tmp/opencode/openviet-145-verify
cd /tmp/opencode/openviet-145-verify
unzip -q /home/codegpt/antigravity/Modern-Vietnamese-IME-and-Macro-Engine/web-ext-artifacts/openviet_ime-1.4.5-source.zip
cd openviet-ime-source
npm ci && npm run build:firefox && npm test
```

⚠ `git archive` lấy **HEAD đã commit**. Nếu commit sau khi build zip extension, chỉ cần regenerate source zip + checksums; extension zip vẫn đúng nếu nội dung `src/` không đổi.

### 4.13 AMO / GitHub Release checklist

**AMO** — nộp đúng 2 file:

```text
web-ext-artifacts/openviet_ime-firefox-1.4.5.zip
web-ext-artifacts/openviet_ime-1.4.5-source.zip
```

Kèm nội dung `web-ext-artifacts/AMO_SUBMISSION_v1.4.5.md`. **Không** đặt AMO doc ở repo root. Không remote code, không network, không data collection.

**GitHub Release** (repo `no-vici/openviet-ime`):

```text
https://github.com/no-vici/openviet-ime/releases/new?tag=v1.4.5
Title: OpenViet IME 1.4.5 — Reproducible build & verified rich-editor stability
Assets (5):
  openviet_ime-firefox-1.4.5.zip
  openviet_ime-chrome-1.4.5.zip
  openviet_ime-edge-1.4.5.zip
  openviet_ime-1.4.5-source.zip
  SHA256SUMS.txt
```

`gh` chưa cài: trên Arch dùng `yay -S github-cli` rồi `gh auth login`. **Từ chối `hg`** (Mercurial).

---

## Phần 5 — FAQ 40 câu

**Q1.** Có cần cài UniKey không? — Không. Extension chạy hoàn toàn trong browser.

**Q2.** Auto mode khác Telex thế nào? — Auto cho chữ cái đi Telex, chữ số đi VNI.

**Q3.** `wToUEnabled = false` có tắt cả dấu không? — Không, chỉ làm `w` literal.

**Q4.** Non-Start là gì? — `w` ở đầu từ giữ Latin (`web`, `wifi`).

**Q5.** Tại sao `thw` ra `thư` mà `web` không ra `wẻb`? — Vị trí `w` khác nhau.

**Q6.** `sway` có bị đổi không? — Có thể tạm, nhưng trả về lúc bấm Space vì nằm trong trap list.

**Q7.** `manjaro` có được hỗ trợ không? — Có, nằm trong `COMMON_ENGLISH_WORDS`.

**Q8.** Dấu cũ có sai không? — Không, chỉ khác quy ước. Xem §6 của tài liệu ngữ âm.

**Q9.** Nên dùng `hòa` hay `hoà`? — Tuỳ thói quen; quan trọng là nhất quán. Mặc định engine dùng `hòa`.

**Q10.** Đổi toneStyle ở đâu? — Popup `#toneStyleToggle` hoặc Options `#toneStyleSelect`.

**Q11.** `quý` có bao giờ thành `qúy` không? — Không. `u` trong `qu` là một phần âm đầu.

**Q12.** `ă` có đi được với `y` không? — Không. `ăy` bị chặn.

**Q13.** `ơ` có đi được với `a` không? — Không. Chỉ `ơi`.

**Q14.** Tại sao `đă` không có dấu? — `ă` cần coda khi từ hoàn tất.

**Q15.** `bàc` có hợp lệ không? — Không. Coda `c` chỉ Sắc/Nặng.

**Q16.** `xoong` có phải từ lạ không? — Là từ mượn, đã whitelist.

**Q17.** `Pleiku` có bị chặn vì `pl` không? — Không, nằm trong ngoại lệ địa danh.

**Q18.** Code mode có tự bật không? — Có, khi gặp URL/email/snake_case/camelCase.

**Q19.** Escape làm gì? — Hoàn tác revert, ẩn gợi ý, hoặc thoát code fence.

**Q20.** Macro có bung trong code không? — Có preset `;` riêng; macro thường vẫn bật tuỳ context.

**Q21.** `$CLIPBOARD` lấy nội dung gì? — Clipboard hiện tại tại thời điểm bung macro.

**Q22.** Gợi ý có truyền dữ liệu đi đâu không? — Không. Học trên thiết bị.

**Q23.** `spellCheck` có bật mặc định không? — Không (`false`) để ưu tiên tốc độ.

**Q24.** `phonologyRules` tắt có thành `center → cênter` không? — Có thể. Đây là lý do mặc định là `true`.

**Q25.** E2E 12 ca đỏ hồi trước là bug engine phải không? — Không, lỗi harness (`about:blank` + manifest Firefox).

**Q26.** Canary là gì? — `toans → toán`, đặt đầu suite để phát hiện content script chết.

**Q27.** Tại sao unit là gate còn E2E không? — Unit chạy deterministic không cần browser.

**Q28.** Zip Firefox khác zip Chrome chỗ nào? — `manifest.json` (`background.scripts` vs `service_worker`).

**Q29.** Có đóng gói `package-lock.json` vào extension zip không? — Không; chỉ có trong source zip.

**Q30.** Source zip có chứa docs không? — Có.

**Q31.** AMO doc đặt ở đâu? — Chỉ `web-ext-artifacts/`.

**Q32.** Reviewer rebuild khác checksum có sao không? — Không, do timestamp;BUILD.md đã ghi.

**Q33.** Có dùng Vitest không? — Không, đã chuyển sang `node:test`.

**Q34.** `web-ext` phiên bản nào? — `10.8.0`, pinned.

**Q35.** Có AI rewriting cả câu không? — Không. Không hồi sinh Sentence Momentum & Math Context.

**Q36.** Có đồng bộ từ điển qua mạng không? — Không.

**Q37.** Có chụp dữ liệu người dùng không? — Không; `data_collection_permissions.required: ["none"]`.

**Q38.** Firefox yêu cầu phiên bản nào? — `strict_min_version: 142.0`.

**Q39.** Gecko ID là gì? — `openviet-ime@vietnamese-ime.org`.

**Q40.** Tôi nên đọc gì tiếp theo? — [`ARCHITECTURE.md`](./ARCHITECTURE.md) và [`VIETNAMESE_PHONOLOGY.md`](./VIETNAMESE_PHONOLOGY.md).

---

## Phần 6 — Phụ lục

### Phụ lục A — Toàn bộ foreign onset clusters

```text
pl fl cl gl bl sl
pr dr cr br gr fr wr
sp st sk sm sn sw tw dw
spl spr str scr shr squ
kn ps rh phl chr sch
```

### Phụ lục B — Toàn bộ vowel cores hợp lệ

```text
a ă â e ê i o ô ơ u ư y
ai ao au ay âu ây eo êu ia iê iu
oa oă oe oi ôi ơi ua uâ ue uê ui uo uô uơ uy
ưa ưi ươ ưu ye yê
oai oay oao oeo uai uay uôi uơu uyu ươu ươi uya
iêu yêu uyê
```

### Phụ lục C — Codas

```text
Chuẩn: '', c, ch, m, n, ng, nh, p, t
Dân tộc (whitelist): k, l, r, h
Ngoại lai (bị chặn): b, d, f, j, l, q, r, s, v, w, x, z
```

### Phụ lục D — Ngoại lệ không đổi theo toneStyle

```text
quý quả quế quân quốc quán   (u thuộc qu)
toán nước tiếng đường tiến   (có coda → âm chính)
cười chuối nhiều rượu        (3 nguyên âm → giữa)
thuế huế quế                 (uê → âm 2)
múa mía cứu chữa             (cặp mở → âm 1)
mái sáo tối mới kéo          (offglide → âm 1)
xoong boong goòng            (loanword oo)
```

### Phụ lục E — Nhóm từ ngoại lệ trong từ điển

| Nhóm | Ví dụ |
|---|---|
| Địa danh Tây Nguyên | `đắk`, `krông`, `pắk`, `búk`, `păh`, `prông`, `glong`, `grai`, `pleiku`, `chư`, `sê` |
| Có dấu nháy | `m'đrắk`, `h'leo`, `r'lấp`, `h'drai`, `m'gar` |
| Phương ngữ / cổ | `nguầy`, `nguậy`, `dzìa`, `dzô`, `dzậy`, `zị`, `nhứt`, `thiệt`, `chánh`, `gởi`, `quỉ` |
| Khẩu ngữ | `xò`, `xịn`, `quẩy`, `ngáo`, `phèn`, `cọc` |

### Phụ lục F — Từ viết tắt hay dùng (tra cứu nhanh)

| Viết tắt | Nghĩa |
|---|---|
| IME | Input Method Editor — bộ gõ |
| Onset / Glide / Nucleus / Coda / Tone | Âm đầu / âm đệm / âm chính / âm cuối / dấu thanh |
| NFC / NFD | Dạng dựng sẵn / dạng tách dấu của Unicode |
| Shadow DOM | Cây DOM con bị cô lập, dùng cho thanh gợi ý và HUD |
| canary | Test nhỏ báo content script còn sống |
| auto-restore | Trả chữ Latin gốc ở delimiter |
| word rescue | Chuyển thô ↔ có dấu |
| checked tone | Âm khép `c/ch/p/t` chỉ Sắc/Nặng |
| domain lock | Neo trọng số từ kỹ thuật theo tên miền |
| parity test | Test so sánh default giữa các component |

### Phụ lục G — Nhật ký quyết định (đừng sửa khi không hiểu)

| Quyết định | Lý do |
|---|---|
| `web-ext` pin `10.8.0` | Reviewer rebuild ổn định |
| `package-lock.json` được commit | `npm ci` tái tạo đúng tree |
| Vitest bị gỡ | Giảm dependency, dùng `node:test` có sẵn |
| `toneStyle` mặc định `classic` | Phù hợp thói quen đa số người dùng |
| `spellCheck` mặc định `false` | Ưu tiên tốc độ; phonology guard vẫn chạy |
| `quickConsonants` mặc định `false` | Tránh xung đột `w→qu` với Non-Start |
| `wToUEnabled` mặc định `true` | `w` là phím Telex cốt lõi |
| Canary `toans → toán` | Không bao giờ tin trap word pass khi content script chết |
| E2E dùng `http://openviet.test` | `<all_urls>` chỉ attach trên origin thật |
| AMO doc chỉ trong `web-ext-artifacts/` | Tránh lỗi review do file thừa ở root |
| Không Sentence Momentum / Math Context | Người dùng yêu cầu giữ core IME thuần |
| Terminology `Tiếng Việt/chánh tả/gởi` | Đồng nhất docs + UI; dữ liệu gợi ý giữ hai biến thể của `gởi` |

### Phụ lục H — Bảng kiểm tra trước khi nói "xong"

```text
[ ] npm test                       → 98/98
[ ] npm run test:e2e               → 11/11 + 24/24
[ ] canary toans → toán xanh ở cả 2 suite
[ ] npm run check:terms            → 0 lỗi
[ ] manifest.json đúng bản đang build
[ ] 3 zip extension + source zip regenerate
[ ] SHA256SUMS.txt cập nhật
[ ] clean source: npm ci → build → test xanh
[ ] AMO doc nằm trong web-ext-artifacts/
[ ] CHANGELOG + BUILD + READMEs khớp code
[ ] tag v1.4.5 force-move + push (nếu phát hành)
```

---

## Phần 7 — Nhập môn tuyệt đối: đọc chậm thôi

> Phần này dành cho người chưa từng làm extension, chưa biết DOM là gì, và đang thấy sợ khi mở `avim.js`. Nếu bạn đã quen, nhảy sang [Phần 8](#phần-8--lộ-trình-tự-học-7-ngày). Không có gì phải chứng tỏ ở đây: đọc chậm là đọc đúng.

### 7.1 Extension là gì? Giải thích bằng hình ảnh

Hãy tưởng trình duyệt là **một tòa nhà văn phòng**:

| Thành phần | Hình ảnh đời thường | Tên trong code |
|---|---|---|
| Trang web (`example.com`) | Phòng làm việc, có bàn và giấy | DOM, `document` |
| Ô nhập liệu | Tờ giấy đang đặt trước mặt bạn | `<input>`, `<textarea>`, `contenteditable` |
| Content script | Nhân viên đứng ngay cạnh bàn, thấy mọi phím bạn bấm | `src/content/content.js` |
| Background service worker | Tổng đài ở tầng hầm, giữ cấu hình và đổi biểu tượng | `src/background/service-worker.js` |
| Popup | Bảng điều khiển nhỏ gắn trên thanh công cụ | `src/popup/` |
| Options | Phòng cài đặt, nơi chỉnh mọi thứ | `src/options/` |
| Manifest | Giấy tờ xác nhận \"nhân viên này được phép vào tòa nhà\" | `manifest.firefox.json` / `manifest.chrome.json` |

Ba sự thật cần nhớ:

1. **Content script không thấy trang khác.** Nó chỉ chạy trong tab đang mở. Đó là lý do `about:blank` trong E2E làm content script \"chết\" — xem [3.4](#34-ca-4--e2e-headful-đỏ-headless-xanh).
2. **Background không đọc được giấy của bạn.** Nó chỉ giữ setting và đổi badge `TE/VNI/AUTO/OFF`. Muốn đổi chữ trên trang, phải nhờ content script.
3. **Trang web có thể tự gõ lại chữ.** React, Vue, TipTap, Lexical... có listener riêng. Vì vậy content script phải chạy ở chế độ `capture = true` và gọi `stopImmediatePropagation()`.

### 7.2 Một phím đi qua sáu trạm kiểm soát

Bạn bấm chữ `s` để gõ `toás`. Trước khi chữ `s` kịp hiện ra, nó đi qua sáu trạm:

```text
[1] Shortcut?        Ctrl+Shift+U? Double Ctrl? Esc?  → xử lý rồi dừng
         │ không
         ▼
[2] Đang OFF?        method === 0 → thả phím, kết thúc
         │ không
         ▼
[3] Có phải ô nhập?  DomObserver: input/textarea/contenteditable?
         │ có
         ▼
[4] Có phải code?    URL, email, snake_case, camelCase, backtick?
         │ không
         ▼
[5] Engine quyết định  AvimEngine.processKey('s')
         │  "toan" + Sắc → "toán"
         ▼
[6] Ghi vào trang    TextReplacer thay đúng đoạn, giữ nguyên phần còn lại
```

Nếu dấu không hiện, hãy hỏi **theo thứ tự**: trạm 1 có nuốt phím không? trạm 2 có đang OFF không? trạm 3 có tìm thấy ô nhập không? trạm 4 có tưởng nhầm là code không? trạm 5 có từ chối vì chánh tả không? trạm 6 có ghi nhầm chỗ không?

Đây là câu hỏi đầu tiên trong [10.1](#101-dấu-không-hiện--đi-từng-trạm).

### 7.3 Thử nghiệm 5 phút, không cần đọc code

Bạn có thể tự kiểm tra engine đang sống hay không mà không cần mở file nào:

| Bước | Việc cần làm | Kỳ vọng |
|---|---|---|
| 1 | Mở popup, nhìn badge | `TE`, `VNI`, `AUTO` hoặc `OFF` |
| 2 | Gõ `toans` rồi bấm Cách | `toán ` |
| 3 | Gõ `text` rồi bấm Cách | `text ` (không phải `tẽt`) |
| 4 | Gõ `web` rồi bấm Cách | `web ` (chữ `w` đầu từ giữ nguyên) |
| 5 | Gõ `thw` rồi bấm Cách | `thư ` |
| 6 | Gõ `sway` rồi bấm Cách | `sway ` |

**Canary** là bước 2. Nếu bước 2 sai mà bước 3 đúng, bạn đang ở trong trường hợp \"pass giả\": content script không chạy, nên từ bẫy không bị đổi và tưởng là engine giỏi. Đây chính là lỗi E2E 12 ca đã từng xảy ra.

### 7.4 Từ điển 60 chữ hay gặp

| Chữ | Nghĩa cực ngắn |
|---|---|
| `IME` | Bộ gõ: biến phím Latin thành chữ có dấu |
| `Telex` | Kiểu gõ dùng `s f r x j` làm dấu, `w` làm móc |
| `VNI` | Kiểu gõ dùng số `1–9` làm dấu/hình chữ |
| `Auto` | Tự chọn Telex cho chữ, VNI cho số |
| `engine` | Bộ não quyết định chữ gì ra sao |
| `state` | Trạng thái tạm: đang gõ dở chữ gì, dấu gì |
| `setting` | Cấu hình người dùng bật/tắt |
| `default` | Giá trị khi chưa ai chỉnh |
| `parser` | Bóc chuỗi thành từng phần |
| `syllable` | Âm tiết — một nhịp của chữ Tiếng Việt |
| `onset` | Âm đầu (`tr` trong `trong`) |
| `glide` | Âm đệm (`u` trong `quán`) |
| `nucleus` | Âm chính, nơi dấu thường đứng (`a` trong `toán`) |
| `coda` | Âm cuối (`n` trong `toán`) |
| `tone` | Dấu thanh của cả âm tiết |
| `mark` | Dấu hình chữ: mũ, trăng, móc, gạch `đ` |
| `NFC` | Unicode dạng ghép sẵn (`ế` là 1 ký tự) |
| `NFD` | Unicode dạng tách dấu (`e` + 2 dấu) |
| `DOM` | Cây các thẻ HTML của trang |
| `caret` | Con trỏ nhấp nháy |
| `selection` | Vùng đang bôi đen |
| `Range` | Đoạn văn bản giữa hai điểm trong DOM |
| `contenteditable` | Thẻ cho phép gõ trực tiếp, ví dụ ô Soạn thảo |
| `capture` | Nghe sự kiện **trước** trang web |
| `preventDefault` | \"Phím này tôi xử lý rồi, trang đừng gõ thêm\" |
| `stopPropagation` | \"Các listener khác đừng chạy nữa\" |
| `beforeinput` | Sự kiện báo \"sắp chèn/xoá chữ\" |
| `guard` | Cửa chặn tạm thời chống sự kiện rò rỉ |
| `delimiter` | Phím kết thúc từ: Cách, Enter, dấu câu |
| `auto-restore` | Trả chữ gốc khi bấm delimiter |
| `trap word` | Từ dễ bị Telex biến dạng (`text`, `user`, `sway`) |
| `word rescue` | Đổi cả chuỗi thô ↔ có dấu |
| `macro` | Gõ tắt: `vn` → `Việt Nam` |
| `prefix bucket` | Nhóm từ gợi ý theo chữ cái đầu để tìm nhanh |
| `habit` | Thói quen gõ học được trên máy bạn |
| `domain lock` | Neo trọng số từ kỹ thuật theo tên miền |
| `canary` | Ca test nhỏ báo \"content script còn sống\" |
| `harness` | Bộ khung chạy test (Playwright, origin giả...) |
| `unit test` | Test từng hàm, không cần browser |
| `E2E` | Test chạy thật trên browser |
| `headful` | Chạy browser có cửa sổ nhìn thấy |
| `headless` | Chạy browser không cửa sổ |
| `bundle` | File JS gộp do esbuild tạo ra |
| `manifest` | File khai báo của extension |
| `badge` | Chữ `TE/VNI/AUTO/OFF` trên biểu tượng |
| `broadcast` | Báo các tab \"setting đổi rồi\" |
| `storage.sync` | Bộ nhớ đồng bộ qua tài khoản browser |
| `whitelist` | Danh sách được phép, ví dụ địa danh Tây Nguyên |
| `blacklist` | Danh sách bị chặn, ví dụ domain tắt IME |
| `phonology` | Nghiên cứu âm thanh ngôn ngữ |
| `orthography` | Quy tắc viết chánh tả |
| `checked syllable` | Âm khép `c/ch/p/t`, chỉ Sắc/Nặng |
| `classic` | Kiểu dấu `hòa, khỏe, thủy` |
| `modern` | Kiểu dấu `hoà, khoẻ, thuỷ` |
| `chánh tả` | Viết đúng quy ước Tiếng Việt |
| `gởi` | Từ dùng thống nhất trong tài liệu này |
| `nhất quán` | Dùng cùng một cách ở mọi nơi |
| `regression` | Test để lỗi cũ không trở lại |
| `artifact` | File zip đóng gói để phát hành |
| `reproducible` | Build lại ra kết quả tương đương |
| `force tag` | Dán lại nhãn phiên bản vào commit mới |

### 7.5 Mười hai cặp dễ nhầm

| Đừng nhầm | Với | Nhớ bằng |
|---|---|---|
| Dấu hình chữ (`ă`) | Dấu thanh (`á`) | `ă` đổi chữ, `á` đổi cao độ |
| Phím `w` | Chữ `w` | `w` là phím gõ, không phải chữ cái Tiếng Việt |
| `đ` | `d` + dấu | `đ` là chữ riêng, NFD không tách được |
| `hòa` | `hoà` | Cùng nghĩa, khác quy ước đặt dấu |
| Telex | VNI | Chữ cái vs chữ số |
| `autoRestoreEnglish` | `phonologyRules` | Một bên đoán từ khác, một bên đoán âm Việt |
| `spellCheck` | `phonologyRules` | Tra cứu từ vs kiểm tra cấu trúc |
| `suggestion` | `macro` | Gợi ý sau khi gõ vs bung ngay khi gõ xong trigger |
| Badge | Popup | Hiển thị trạng thái vs nơi đổi trạng thái |
| Unit test | E2E | Hàm thuần vs trình duyệt thật |
| `manifest.json` | `manifest.firefox.json` | File sinh ra (gitignore) vs file nguồn |
| Tag | Commit | Tag là nhãn dán, commit là nội dung |

---

## Phần 8 — Lộ trình tự học 7 ngày

> Mỗi ngày có một mục tiêu nhỏ, một lệnh chạy được, và một câu hỏi tự kiểm tra. Làm đủ 7 ngày là bạn đọc được hầu hết `avim.js` mà không sợ.

### Ngày 1 — Chạy được, đừng hiểu vội

- [ ] `node -v && npm -v`
- [ ] `npm ci`
- [ ] `npm test` → 98/98
- [ ] Mở extension, gõ 6 ca trong [7.3](#73-thử-nghiệm-5-phút-không-cần-đọc-code)

**Tự hỏi:** ca nào trong 6 ca làm tôi ngạc nhiên nhất? Tại sao?

### Ngày 2 — Học bảng phím bằng tay, không bằng mắt

- [ ] Đọc [0.1](#01-thẻ-telex-một-trang), rồi **giấu đi**
- [ ] Gõ lại 20 ca đầu trong [2.7](#27-bài-tập-tự-kiểm-tra-40-ca-có-đáp-án)
- [ ] Đọc [0.2](#02-thẻ-vni-một-trang), gõ lại 10 ca bằng VNI (đổi method trong popup)

**Tự hỏi:** gõ `dduocw` khác `d9o5` chỗ nào?

### Ngày 3 — Âm tiết là LEGO

- [ ] Đọc [`VIETNAMESE_PHONOLOGY.md` §1](../VIETNAMESE_PHONOLOGY.md#1-âm-tiết-là-gì) và [§14](../VIETNAMESE_PHONOLOGY.md#14-học-lại-từ-số-không-bốn-lớp-của-một-chữ)
- [ ] Với 5 từ `toán, người, tiếng, được, nước`, tự bóc thành Onset/Glide/Nucleus/Coda/Tone
- [ ] Mở `syllable-parser.js`, tìm `isValid()`

**Tự hỏi:** tại sao `ă` không đứng một mình?

### Ngày 4 — Dấu: cũ, mới, và dời dấu

- [ ] Đọc [§6](../VIETNAMESE_PHONOLOGY.md#6-quy-tắc-đặt-dấu-cũ-mới-và-lý-do-lịch-sử) và [§16](../VIETNAMESE_PHONOLOGY.md#16-dấu-được-tính-toán-không-được-lưu-cứng)
- [ ] Đổi `toneStyle` sang modern, gõ lại `hòa, khỏe, thủy`
- [ ] Gõ `toans`, rồi tiếp `g` → `toáng`; giải thích bằng \"render lại\" chứ không phải \"dời dấu\"

**Tự hỏi:** nếu dấu được lưu cứng trên chữ `o`, ca `hoaf + n` hỏng ở đâu?

### Ngày 5 — Bẫy và cổng kiểm tra

- [ ] Đọc [§15](../VIETNAMESE_PHONOLOGY.md#15-cổng-kiểm-tra-vì-sao-không-tin-vào-danh-sách-từ-khác)
- [ ] Gõ 10 từ bẫy trong [2.6](#26-bảng-từ-bẫy-theo-nhóm)
- [ ] Tắt `wToUEnabled`, gõ `sway`, `web`; bật lại
- [ ] Thêm một từ lạ vào user dictionary và kiểm tra nó không bị dính dấu

**Tự hỏi:** cổng Tiếng Việt và danh sách bẫy, cái nào chạy trước?

### Ngày 6 — Rich editor và E2E

- [ ] Đọc [Phần 3 ca 1–4](#phần-3--cẩm-nang-khắc-phục-sự-cố-cookbook)
- [ ] `npx playwright install chromium` (nếu chưa có)
- [ ] `npm run test:e2e` → 11/11 + 24/24
- [ ] Tìm dòng canary `toans` trong `test/playwright-rich-editors.test.js`

**Tự hỏi:** nếu canary đỏ mà trap word xanh, tại sao không được tin?

### Ngày 7 — Build, tag, viết lại tài liệu

- [ ] Đọc [4.11](#411-giải-phẫu-build-và-artifact) → [4.12](#412-release-playbook-copy--paste)
- [ ] `npm run build:firefox` rồi `unzip -p web-ext-artifacts/openviet_ime-firefox-1.4.5.zip manifest.json | head`
- [ ] `npm run check:terms` → 0 lỗi
- [ ] Sửa một câu trong docs rồi tự kiểm tra `git diff`

**Tự hỏi:** vì sao source zip làm bằng `git archive`, không phải `web-ext build`?

---

## Phần 9 — Đọc 4 file PDF trong docs/references không sợ

### 9.1 Bốn cuốn, bốn câu hỏi

| File | Câu hỏi nó trả lời | Đọc mục nào trước | Lưu ý |
|---|---|---|---|
| `dokey-book.pdf` | \"Thiết kế engine vì sao lại rebuild cả từ?\" | Chương 2 → 5 → 6 → 8 | **Có bản quyền.** Chỉ tham khảo ý; không chép code/đoạn văn vào repo |
| `Haudricourt1952_ShortVowels.pdf` | \"Sao `ă`/`â` cần âm cuối?\" | Đầu bài + Bảng 2 | Bài 1952, bản dịch 2017; ký hiệu IPA cũ |
| `S0025100311000181a.pdf` | \"Hà Nội có bao nhiêu âm/thanh?\" | Consonants → Vowels → Tones | Bài JIPA 2011 của Kirby; bảng bị lỗi font khi copy text, hãy nhìn PDF |
| `VN LLF Part I.pdf` | \"Âm tiết gồm mấy phần? Tiếng Việt khác Tiếng Anh chỗ nào?\" | 3.4 → 4.1 | Tài liệu giảng dạy 2006, dễ đọc nhất trong 4 file |

### 9.2 Thứ tự đọc khuyên dùng

```text
Người mới          → VN LLF Part I (3.4)
                   → VIETNAMESE_PHONOLOGY §14 trong repo này
Muốn hiểu rule     → Haudricourt (bài ngắn)
                   → Kirby (Vowels + Tones)
Muốn hiểu engine   → Dokey chương 5 → 6 → 4 → 8
Muốn hiểu E2E      → Dokey chương 8 + docs/PLAYWRIGHT_E2E_GUIDE.md
```

**Đừng đọc Dokey từ trang 1 đến 222.** Đây là sách kỹ thuật dày; đọc có mục đích thì 20 phút đủ, đọc tràn lan thì 3 ngày vẫn chưa xong.

### 9.3 Bài tập đối chiếu

| Đọc được trong PDF | Mở file repo | Tìm |
|---|---|---|
| \"short vowel never in absolute final position\" | `src/engine/syllable-parser.js` | nhánh từ chối `ă/â` cuối từ |
| \"tone is computed at render\" | `src/engine/avim.js` | `getTargetVowelIndex()` |
| \"checked syllables take only two tones\" | `src/engine/syllable-parser.js` | `TONE_STYLE` + coda check |
| \"editors ignore synthetic Backspace\" | `src/content/text-replacer.js` | `replaceInContentEditable()` |
| \"syllable = tone + initial + labialization + nucleus + final\" | `src/engine/syllable-parser.js` | 5 trường của `ParsedSyllable` |

> 📌 Khi bạn đối chiếu được 3 dòng đầu, bạn đã hiểu tại sao `docs/VIETNAMESE_PHONOLOGY.md` viết những điều tưởng như \"quá chi tiết\". Chi tiết đó có nguồn.

---

## Phần 10 — Cây quyết định chẩn đoán

### 10.1 Dấu không hiện — đi từng trạm

```text
Gõ "toans" không ra "toán"
│
├─ Badge có đang OFF? ───────── có → bật lại method
│
├─ Gõ "text" có bị thành "tẽt" không?
│   ├─ có → engine đang chạy; nghi rule chánh tả → §3.8
│   └─ không → nghi content script chết → tiếp
│
├─ Origin có phải http(s) thật? (about:blank / file:// → chết)
│
├─ Trang có chặn listener không? (thử tab khác)
│
└─ Mở debug log: có keydown tới content.js không?
    ├─ có → lỗi ở engine/ghi DOM
    └─ không → lỗi ở manifest / injection
```

### 10.2 Dấu hiện sai chỗ

```text
"toán" thành "tóan" hoặc "thoà" thay vì "hòa"
│
├─ Có coda tắc c/ch/p/t + dấu Huyền/Hỏi/Ngã? → bị chặn là đúng (§3.2)
│
├─ toneStyle là gì? classic hay modern? → đổi thử (§2.4)
│
├─ Có "qu" hoặc "gi" ở đầu không? → u/i ở đây không nhận dấu
│
└─ Vẫn sai → getTargetVowelIndex() bị sửa → §4.1 + phonology §16
```

### 10.3 E2E đỏ / unit xanh

```text
npm test xanh, npm run test:e2e đỏ
│
├─ Canary "toans → toán" đỏ?
│   ├─ có → content script không attach. Kiểm tra origin + manifest (§3.4)
│   └─ không → tiếp
│
├─ Chỉ headful đỏ? → kiểm tra --load-extension + thư mục manifest.chrome tạm
│
├─ Chỉ rich-editor đỏ? → adapter contenteditable / beforeinput guard (§3.1)
│
└─ Cả hai đỏ nhưng unit xanh → harness sai, KHÔNG sửa engine vội
```

### 10.4 Build lạ

```text
Zip khác checksum / reviewer rebuild khác
│
├─ Quên npm ci? → cài lại từ package-lock.json
│
├─ manifest.json đang là bản Chrome? → npm run manifest:firefox
│
├─ Source zip thiếu docs/? → dùng git archive, không dùng web-ext build
│
├─ SHA256SUMS cũ? → regenerate sau khi archive
│
└─ Vẫn khác → so sánh functional, đừng so sánh byte (BUILD.md đã ghi)
```

---

## Phần 11 — Bài học vận hành mượn từ tài liệu tham khảo

> Toàn bộ phần này là **paraphrase ý tưởng** từ chương 8 của sách *Dokey: Engineering a Vietnamese Input Method* (có bản quyền), rồi dịch sang bối cảnh extension trên browser. Không có đoạn văn hay code nào được chép lại.

### 11.1 Bốn cách giao phím bị hỏng

| Lỗi kinh điển | Triệu chứng | Cách sửa trong Dokey (paraphrase) | OpenViet làm gì |
|---|---|---|---|
| Sự kiện bị xáo thứ tự | Chữ cái bị đảo/double trong app đa tiến trình | Gom sửa lỗi lại trước phím tiếp theo | `capture=true` + `preventDefault` ngay trong `keydown` |
| Editor bỏ qua Backspace giả | `Haxy` thành `Hayãy` (chữ cũ nằm lại, chữ mới chèn sau) | Chọn đoạn cũ rồi gõ đè thay vì bấm Backspace | `Range` + `deleteContents()` rồi chèn text mới |
| Phím đang giữ bị hiểu là auto-repeat | Chữ bị mất (`Haxy → Hy`) | Truyền text với mã phím đang nhả | Không tạo synthetic key; ta sửa DOM trực tiếp |
| Mỗi app một kiểu nhận text | Cùng engine, ô này đúng ô kia sai | Chia profile theo ứng dụng | 4 adapter + `domainMethods` + `blacklistedDomains` |

**Bài học:** lỗi \"gõ sai\" không phải lúc nào cũng lỗi engine. Đôi khi engine tính đúng nhưng **cách đưa chữ vào trang** sai.

### 11.2 Năm nguyên tắc vàng

1. **Một nguồn sự thật.** Default chỉ sống ở `DEFAULT_SETTINGS`; mọi nơi khác import. (`settings-parity.test.js` canh cửa.)
2. **Tính, đừng lưu.** Dấu không được dán cứng vào chữ cái; tính lại khi render.
3. **Cổng trước, dấu sau.** Kiểm tra âm tiết trước khi áp phím dấu.
4. **Sửa ít nhất.** Thay đúng đoạn đang gõ, đừng `innerHTML` cả ô.
5. **Canary trước khi tin.** `toans → toán` xanh thì mới đọc kết quả các ca khác.

### 11.3 Áp ngay vào công việc hôm nay

| Bạn đang làm | Nguyên tắc áp dụng |
|---|---|
| Thêm rule `w` mới | (3) cổng trước, (2) tính lại dấu |
| Sửa `text-replacer.js` | (4) sửa ít nhất + chạy lại 24 E2E |
| Thêm setting | (1) một nguồn sự thật + parity test |
| Review AMO artifact | (5) clean-source build + canary + checksum |
| Đọc PDF | (2) hiểu nguyên lý, đừng chép nguyên văn |

---

## Phần 12 — Hai mươi ca nâng cao (31–50)

| # | Tình huống | Cách xử lý nhanh |
|---|---|---|
| 31 | `hoaf` rồi bấm `n` thành `hoàn` | Đúng: render lại, dấu ở `a`. Không sửa |
| 32 | `hoaf` rồi Backspace vẫn `hòa` | Engine giữ `lastTransformed`; kiểm tra `escRevert`/undo |
| 33 | `dduocjw` ra `được` dù dấu đến trước | Prefix \"có thể trở thành\" — đúng thiết kế |
| 34 | `xoong` vẫn là `xoong` | Loanword `oo` đã whitelist |
| 35 | `Pleiku` không bị chặn dù có `pl` | Ngoại lệ địa danh Tây Nguyên |
| 36 | `m'đrắk` mất dấu nháy | `word-boundary` phải giữ apostrophe nội bộ |
| 37 | `ế` bị cắn nửa khi Backspace | NFD combining mark; chạy `word-boundary.test.js` |
| 38 | `useState` bị thành `úeState` | camelCase guard hỏng; kiểm tra early return |
| 39 | `fcitx5` bị dính dấu | Alphanumeric guard; xem `url-code-guards.test.js` |
| 40 | Gợi ý hiện ngay sau dấu `.` | Chat/sentence guard; `nextWordEnabled` |
| 41 | Macro `;gitc` bung trong URL | Code guard phải chạy trước macro |
| 42 | `$CLIPBOARD` lấy nội dung cũ | Macro mở clipboard tại thời điểm bung |
| 43 | Badge `AUTO` nhưng popup hiện `Telex` | Storage chưa broadcast; kiểm tra 4 khóa cho phép |
| 44 | Popup lưu rồi mất setting | Fallback `localStorage` khi không có `storage.sync` |
| 45 | `spellCheck` bật thì từ lóng bị chặn | Thêm vào user dictionary (whitelist thắng) |
| 46 | Gõ trong ô password vẫn đổi dấu | Password guard; `data-no-ime` |
| 47 | Teams Web vẫn trả chữ thô | Model-backed editor; cần adapter riêng |
| 48 | E2E xanh nhưng người dùng kêu lỗi | Thiếu canary hoặc sai origin thật |
| 49 | Reviewer rebuild khác checksum | Timestamp khác; so functional, xem BUILD.md |
| 50 | Tag `v1.4.5` trỏ commit cũ | `git tag -f -a` + `git push --force origin v1.4.5` |

---

## Phần 13 — Nguồn trực tuyến đã kiểm chứng (bổ sung cho Phần 9)

> Phần 9 chỉ có 4 PDF nằm trong repo. Phần 13 mở ra **internet**, nhưng chỉ ghi những nguồn đã kiểm tra được vào tháng 11/2026 và có ích trực tiếp cho việc bảo trì bộ gõ. Mục tiêu vẫn như cũ: trả lời \"lúc nào mở nguồn nào\", không phải dán link cho có.

### 13.1 Bốn nhóm nguồn trực tuyến

#### Nhóm A — Nền tảng Web / sự kiện gõ phím

| Nguồn | Đường dẫn | Dùng khi nào |
|---|---|---|
| MDN `beforeinput` | https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event | Hiểu vì sao ta chặn sự kiện **trước khi** DOM đổi, và \"editing host\" là gì trong `contenteditable` |
| MDN `keydown` | https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event | Đọc đoạn \"keydown events with IME\" — có mẹo `isComposing \|\| keyCode === 229` |
| MDN `compositionstart` / `compositionend` | https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event · https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event | Phân biệt IME hệ điều hành (Pinyin, Kana...) với IME của ta |
| MDN `Selection` / `Range` | https://developer.mozilla.org/en-US/docs/Web/API/Selection · https://developer.mozilla.org/en-US/docs/Web/API/Range | Giải thích cách `replaceInContentEditable()` thay đúng đoạn, giữ caret |
| MDN `contenteditable` | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable | Biết `true`, `false`, `plaintext-only` — ba giá trị hay gặp trong rich editor |
| W3C UI Events | https://w3c.github.io/uievents/ | Bản đặc tả gốc của `InputEvent.inputType`, `isComposing`, `beforeinput` |

#### Nhóm B — Extension & AMO

| Nguồn | Đường dẫn | Dùng khi nào |
|---|---|---|
| Chrome content scripts | https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts | Giải thích static declaration, `matches`, isolated world — liên quan trực tiếp tới E2E headful |
| AMO Source code submission | https://extensionworkshop.com/documentation/publish/source-code-submission | Giải thích \"reviewer phải rebuild ra được chính xác zip đã nộp\" |
| AMO Add-on Policies | https://extensionworkshop.com/documentation/publish/add-on-policies/ | Kiểm tra source, rút gọn code, không obfuscate, không remote code |
| AMO Data collection permissions | https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent | Đối chiếu `data_collection_permissions.required: [\"none\"]` trong manifest |
| AMO Third-party library usage | https://extensionworkshop.com/documentation/publish/third-party-library-usage | Giải thích vì sao phải pin `web-ext@10.8.0` + commit `package-lock.json` |

#### Nhóm C — Test & build

| Nguồn | Đường dẫn | Dùng khi nào |
|---|---|---|
| Playwright `page.route()` | https://playwright.dev/docs/api/class-page#page-route | Giải thích canary `http://openviet.test` — ta \"bịa\" origin thật để `<all_urls>` chạy |
| Playwright persistent context | https://playwright.dev/docs/api/class-browser#browser-launch-persistent-context | Giải thích thư mục extension tạm dùng `manifest.chrome.json` |
| esbuild | https://esbuild.github.io/ | Hiểu vì sao `*.bundle.js` là generated và nằm trong `.gitignore` |

#### Nhóm D — Unicode & lịch sử bảng phím

| Nguồn | Đường dẫn | Dùng khi nào |
|---|---|---|
| UAX #15 | https://www.unicode.org/reports/tr15/ | NFC/NFD, thứ tự dấu tổ hợp, và cảnh báo \"nối chuỗi không đóng\" |
| Unicode Normalization FAQ | https://unicode.org/faq/normalization | Giải thích ngắn gọn bằng câu hỏi–trả lời cho người mới |
| MDN `String.normalize()` | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | Chạy thử `'ế'.normalize('NFD')` trong console |
| RFC 1456 / VIQR | https://www.rfc-editor.org/rfc/rfc1456 | Tiền lệ 1993 của \"dấu sau chữ\" và cơ chế escape chống `you? → ủ` |
| Microsoft Vietnamese IME | https://learn.microsoft.com/en-us/globalization/input/vietnamese-ime | Đối chiếu bảng `aw/aa/dd/ee/oo/ow/uw` với thẻ Telex ở [0.1](#01-thẻ-telex-một-trang) |

> 📌 Nguồn ngữ âm học thuật (Emerich, Pham, Vũ Thanh Phương, Macken & Nguyễn...) được liệt kê ở [VIETNAMESE_PHONOLOGY.md §20](../VIETNAMESE_PHONOLOGY.md#20-nguồn-ngữ-âm-trực-tuyến-đã-kiểm-chứng). Không nhân đôi danh mục ở đây.

### 13.2 Ba điểm mới đáng chú ý nhất

#### (1) IME hệ điều hành: tài liệu nói gì, ta làm gì

MDN khuyến nghị bỏ qua `keydown` khi `event.isComposing` **hoặc** `event.keyCode === 229`, vì Firefox vẫn bắn `keydown` trong lúc compose và `compositionstart` có thể đến sau phím đầu.

Hiện tại OpenViet **chưa có guard này** — content script lắng nghe `keydown` trực tiếp. Đây không phải lỗi với ca gõ Telex thuần, nhưng là điều cần nhớ nếu bạn

- bật thêm IME hệ điều hành (Pinyin, Kana, tiếng Trung/Nhật) trên cùng một ô;
- thấy thư viện rich editor tự gọi `compositionstart`;
- debug ca \"dấu biến mất khi đổi ngôn ngữ bàn phím\".

Ghi nhận ở đây để khỏi tưởng engine \"quên\" rule. Đây là **khoảng trống đã biết**, không phải việc cần làm ngay trong đợt 1.4.5.

#### (2) UAX #15: đường nối khi thay DOM

Hai chuỗi đã NFC vẫn có thể tạo ra chuỗi chưa NFC khi nối lại. Khi `text-replacer.js` thay một đoạn giữa chừng, hãy nhìn vào **hai ký tự ở ranh giới**. Các test `word-boundary.test.js` đang canh điều đó; đừng \"tối ưu\" bằng cách cắt đứt combining mark.

#### (3) Môi trường build mặc định của reviewer AMO

Trang Source code submission ghi môi trường mặc định hiện tại: **Ubuntu 24.04.4 LTS Desktop, ARM64, Node 24.14.0, npm 11.9.0**. Đây là lý do thực tế để:

- dùng `npm ci` thay vì `npm install`;
- commit `package-lock.json`;
- không phụ thuộc vào binary riêng của máy bạn.

`npm run build:firefox` trong source zip đã được chạy thử trên clean tree; xem [4.11](#411-giải-phẫu-build-và-artifact).

### 13.3 Bài tập nhỏ: đối chiếu MDN với code

| Đọc | Mở | Tìm | Câu hỏi tự kiểm tra |
|---|---|---|---|
| `beforeinput` có thể cancel | `src/content/content.js` | `capture: true`, `preventDefault()` | Nếu chỉ nghe `input` thay vì `keydown`, lỗi gì xảy ra? |
| `Range.deleteContents()` | `src/content/text-replacer.js` | `replaceInContentEditable()` | Vì sao không dùng `document.execCommand('insertText')`? |
| `keyCode === 229` | `src/content/content.js` | chưa có | Nếu thêm guard, đặt ở trạm số mấy trong [7.2](#72-một-phím-đi-qua-sáu-trạm-kiểm-soát)? |
| `page.route()` | `test/playwright-rich-editors.test.js` | `http://openviet.test` | Nếu bỏ route này, ca nào đỏ đầu tiên? |

---

## Lời cuối cho người bảo trì

Khi bạn mở cuốn này lúc 2 giờ sáng vì một ca lạ trên Telegram, đừng đọc từ đầu. Nhảy thẳng:

1. [Bảng "Tôi đang cần gì"](#bảng-tôi-đang-cần-gì--mở-mục-nào),
2. [Phần 3 — Cookbook](#phần-3--cẩm-nang-khắc-phục-sự-cố-cookbook),
3. [Phần 4.3 — Trạng thái engine](#43-trạng-thái-engine-cần-biết),
4. [Phần 4.12 — Release playbook](#412-release-playbook-copy--paste).

Còn lại, cứ để cuốn sổ này nằm trong `docs/`. Nó không đáng được đóng vào extension zip — nhưng nó đáng được mở mỗi khi bạn quên tại sao lại có một dòng `if` kỳ lạ nào đó trong `avim.js`.
