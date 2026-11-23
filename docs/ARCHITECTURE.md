# OpenViet IME: Kiến Trúc Kỹ Thuật & Hướng Dẫn Nhập Môn

Tài liệu này được viết theo phong cách tường minh, dễ tiếp cận, giúp bất kỳ lập trình viên nào (kể cả người mới bắt đầu) cũng hiểu rõ cách một **Bộ gõ Tiếng Việt hiện đại trong trình duyệt web** hoạt động từ A đến Z.

> **Quy ước thuật ngữ:** xuyên suốt tài liệu này dùng **Tiếng Việt** (viết hoa chữ cái đầu), **chánh tả** và **gởi** một cách đồng nhất. Khi nói đến mã nguồn, tên file, tên hàm hoặc cờ cấu hình thì giữ nguyên tên gốc bằng tiếng Anh.

---

## 1. Bản Chất Của Bộ Gõ Trên Trình Duyệt Web

Khi bạn gõ bàn phím trên hệ điều hành (Windows/macOS/Linux), bộ gõ hệ thống (như UniKey hay Bamboo) chặn phím ở tầng driver trước khi ứng dụng nhận được.

Tuy nhiên, **Browser Extension IME** hoạt động bên trong môi trường JavaScript của trình duyệt. Nó phải đối mặt với ba thách thức lớn:

1. **Tranh chấp sự kiện (Event Race Condition)**: Các framework hiện đại như React, Vue, Slate, TipTap, Lexical, CodeMirror luôn theo dõi phím bấm. Nếu extension không xử lý khéo léo, ký tự gốc sẽ lọt vào DOM trước khi bộ gõ kịp thay thế, gây ra lỗi **nhảy chữ, lặp chữ** (ví dụ: `toán` thành `toáan` hoặc `vâyậy`).
2. **Khác biệt ô nhập liệu**:
   - Ô nhập chuẩn: `<input>`, `<textarea>`.
   - Trình soạn thảo văn bản phong phú: `<div contenteditable="true">` (TipTap/ProseMirror, Lexical, Slate, RoosterJS/CKEditor trong Microsoft Teams Web).
   - Một số editor dùng canvas (Google Docs, Sheets, Slides, Figma, Canva, Miro) không lộ DOM chữ để thay thế an toàn, nên `DomObserver` **chủ động bỏ qua** các domain này thay vì cố gắng can thiệp.
3. **Chuỗi không đồng nhất**: editor có thể chèn zero-width marker hoặc lưu dấu thanh ở dạng NFD. Ranh giới từ phải được tính toán bỏ qua các ký tự đó, nếu không `đồ` rất dễ bị rụng còn `do`.

---

## 2. Kiến Trúc Tổng Thể (System Architecture)

Dự án được phân chia thành 3 tầng độc lập, theo nguyên lý **Separation of Concerns (SoC)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     TẦNG NỘI DUNG (Content Layer)                      │
│                                                                        │
│  [DomObserver] ──(lọc target)──> [AvimContentScript]                   │
│                                     │  │  │                            │
│              [TextReplacer] <───────┘  │  └──> [Shadow DOM Suggestion] │
│              (thay thế nguyên khối)    └─────> [HUD Toast]             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (ủy quyền xử lý logic)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TẦNG ĐỘNG CƠ (Engine Layer)                      │
│                                                                        │
│  [AvimEngine] <──> [SyllableParser] <──> [Casing / chánh tả]            │
│       │                  │                       │                     │
│  [Dictionary]      [KeyCodes / Config]     [VietnameseWords]            │
│       │                                                                │
│  [MacroEngine]     [AutoCompleteEngine]        [Emoji]                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (đồng bộ qua chrome.storage.sync)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                TẦNG NỀN TẢNG (Background & Settings)                   │
│                                                                        │
│  [Service Worker] ◄── storage.sync ──> [Popup]   [Options]              │
│  (badge + broadcast)                  (module, dùng DEFAULT_SETTINGS)  │
└────────────────────────────────────────────────────────────────────────┘
```

Luồng gõ mặc định: `keydown` (capture) → `DomObserver` → `TextReplacer.extract*WordBuffer()` → `AvimEngine.processKey()` → `TextReplacer.replace*()` → (tuỳ chọn) gợi ý từ/ cụm từ.

`manifest.json` và `src/content/content.bundle.js`, `src/options/options.bundle.js` là sản phẩm sinh ra bởi `esbuild` trong lúc build; chúng được gitignore và không có trong clean source archive.

---

## 3. Giải Thích Chi Tiết Từng Module

### Module 1: Cấu Hình Dùng Chung (`src/engine/config.js`, `src/engine/key-codes.js`)

`DEFAULT_SETTINGS` là nguồn chân lý duy nhất cho Popup, Options và Content Script. Service Worker là classic script nên vẫn giữ một bản sao các giá trị mặc định; `test/settings-parity.test.js` đảm bảo hai bản này không lệch nhau.

Điểm dễ nhầm nhất là cờ `w`:

- `typeW2U` là cờ nội bộ, luôn bị ép thành `true` ở Content Script. Nó thể hiện chính sách **Non-Start**: `w` ở đầu từ vẫn là Latin (`web`, `wifi`, `wife`, `world`, `ward`).
- `wToUEnabled` là công tắc người dùng (mặc định `true`). Bật: `w` sau phụ âm/nguyên âm thành `ư/ơ/ă` (`thw → thư`, `uow → ươ`). Tắt: `processKey()` trả về literal `w` ngay từ đầu, mọi biến đổi Telex liên quan đến `w` đều bị bỏ qua (`sway` giữ nguyên là `sway`).

`key-codes.js` gom các hàm bảo vệ ngữ cảnh: `isUrlOrEmailOrCode()`, `isCamelOrPascalCase()`, `isDeveloperCheatContext()`, cùng bảng Telex/VNI và bộ delimiter.

---

### Module 2: Phân Tích Âm Tiết & Biến Đổi Chính (`src/engine/syllable-parser.js`, `src/engine/avim.js`)

`SyllableParser` mô hình hóa bất kỳ âm tiết Tiếng Việt nào thành **5 thành phần chuẩn**:

$$\text{Syllable} = \text{Onset (Âm đầu)} + \text{Glide (Âm đệm)} + \text{Nucleus (Âm chính)} + \text{Coda (Âm cuối)} + \text{Tone (Dấu thanh)}$$

Ví dụ:

- `quán`: `Onset = q`, `Glide = u`, `Nucleus = a`, `Coda = n`, `Tone = 1` (Sắc).
- `thủy`: `Onset = th`, `Glide = u`, `Nucleus = y`, `Coda = trống`, `Tone = 3` (Hỏi).

**Dời dấu động (Dynamic Tone Shifting)** xảy ra ngay trong lúc gõ:

1. `t` + `o` → `to`.
2. Gõ `s` → `tó` (dấu tạm đặt trên `o`).
3. Gõ `a` → parser nhận diện cụm `oa`, chuyển thành `tóa`.
4. Gõ `n` → phát hiện âm khép `n`. Theo luật chánh tả Tiếng Việt, dấu sắc phải nằm trên âm chính `a`, không được nằm trên âm đệm `o`. Engine tái tạo thành **`toán`**, ngăn chặn `tóan`.

`AvimEngine` quản lý `VOWEL_TABLE`, ma trận Telex (`aa → â`, `oo → ô`, `ow → ơ`, `uw → ư`) và VNI (`6, 7, 8`), kiểm tra âm khép (`c, ch, p, t` chỉ nhận Sắc/Nặng), đồng thời hỗ trợ hai phong cách đặt dấu:

- **Chuẩn mới (BGDĐT)**: `hoà, hoá, thuỷ, khoẻ`.
- **Chuẩn cũ (classic / UniKey cổ điển)**: `hòa, hóa, thủy, khỏe` — đây là giá trị mặc định hiện tại.

Engine **không** đoán dấu cho từ không dấu (`khong`, `truong`, `nganh`); việc đó thuộc về Macro Engine hoặc người dùng. Không có cơ chế "Sentence Momentum & Math Context" trong mã nguồn hiện tại.

---

### Module 3: Từ Điển, Chánh Tả & Casing (`src/engine/dictionary.js`, `src/engine/casing.js`, `src/engine/vietnamese-words.js`)

- `COMMON_ENGLISH_WORDS` chứa các từ bẫy như `sway`, `manjaro`, `user`, `text`, `docs`, `useState`. Khi gặp delimiter, `shouldAutoRestoreEnglish()` khôi phục chúng về dạng Latin thay vì để dấu lọt vào.
- `UserDictionary` lưu từ người dùng đã học được (kể cả trường hợp xóa từ có dấu nhiều lần) vào `storage.sync`, không gọi mạng.
- `hasPhonologyViolation()`, `hasForeignOnset()`, `isLikelyEnglishWord()` ngăn sinh ra âm tiết sai chánh tả hoặc phá cụm phụ âm nước ngoài (`play`, `spring`, `status`).
- `harmonizeSyllableCase()` xử lý bẫy Shift/CapsLock (`ĐƯợc → Được`, `đƯỢc → được`) nhưng chỉ bật khi `autoHarmonizeCase = true` (mặc định tắt). `camelCase`, `PascalCase` và `ALL CAPS` luôn được bảo vệ.
- **Smart Erase Habit Learning** (`eraseHabitLearning`, mặc định bật, ngưỡng mặc định 3): nếu người dùng xóa trọn một từ có dấu nhiều lần, dạng thô của từ đó được thêm vào từ điển cá nhân để những lần sau không bị ép dấu.

---

### Module 4: Gõ Tắt Macro (`src/engine/macro.js`)

`DEFAULT_MACROS` gồm các trigger phổ biến:

- `vn → Việt Nam`, `tv → Tiếng Việt`, `dc → được`, `ko → không`, `tks → cảm ơn`.
- Biến đặc biệt: `+today → $DATE`, `+now → $DATETIME`, `+cb → $CLIPBOARD`.
- Preset đi kèm: `SAIGON_XUA_MACROS`, `DEV_GIT_MACROS`, `MATH_SCIENCE_MACROS` (bật/tắt từ Options).

Cơ chế **Undo hai bước** tránh kẹt người dùng:

1. Gõ `vn` + Space → `Việt Nam `.
2. Backspace lần 1 → chỉ xóa delimiter, giữ `Việt Nam`.
3. Backspace lần 2 → thu hồi thành `vn`, đồng thời đặt `suppressedTrigger`. Lần gõ Space ngay sau đó đi qua bình thường (`vn `) thay vì bung lại, nhờ vậy không rơi vào vòng lặp vô tận.

---

### Module 5: Can Thiệp DOM & Chống Nhảy Chữ (`src/content/dom-observer.js`, `text-replacer.js`, `content.js`)

Đây là phần tinh vi nhất quyết định độ mượt của extension:

1. **Lọc target**: `DomObserver` đi xuyên Shadow DOM, bỏ qua `password`, `[data-no-ime]`, domain bị đen đen danh sách và các editor canvas nêu ở mục 1.
2. **Chặn sự kiện lan truyền**: khi một phím tạo ra ký tự Tiếng Việt, `handleKeyDown()` gọi ngay `preventDefault()`, `stopPropagation()` và `stopImmediatePropagation()`. Một lớp guard `beforeinput` (cửa sổ 80ms) chặn luôn trường hợp Chromium/macOS vẫn gởi thêm `InputEvent` sau khi `keydown` đã bị hủy.
3. **Thay thế nguyên khối (Atomic Replacement)**: `TextReplacer` tính đúng `startIndex/endIndex` rồi đổi toàn bộ từ trong một thao tác. Có adapter riêng cho:
   - `<input>/<textarea>`: cập nhật `value` + dispatch `input`.
   - TipTap/ProseMirror: synthetic `beforeinput` với `inputType: 'insertReplacementText'` và `targetRanges`.
   - Lexical/Slate: `execCommand('insertText')`, không dispatch lại sự kiện thừa.
   - Microsoft Teams Web (RoosterJS/CKEditor): `ClipboardEvent('paste')` hoặc `beforeinput` có `targetRanges` để Content Model tự cập nhật.
   - Fallback cuối: thao tác `Range` trực tiếp trên DOM.
4. **Ranh giới an toàn**: `extractWordBeforeOffset()` bỏ qua zero-width marker và xử lý dấu NFD, nên backspace/xóa từ không làm rụng dấu (`đồ` không trở thành `do`).
5. **Thu nạp từ trước Backspace (`adoptWordBeforeBackspace`)**: gõ `toan ` rồi Backspace xóa khoảng trắng → bộ đệm nạp lại `toan`; chỉ cần gõ `s` là thành `toán`.
6. **Khôi phục editor phức tạp**: nếu extraction trả về prefix ASCII cũ nhưng `AvimEngine.lastTransformed` đã có dấu, content script ưu tiên bản đã chuyển đổi trước khi xử lý phím tiếp theo.
7. **UI nổi**: suggestion host Shadow DOM chỉ được mount khi thực sự cần (lazy); HUD toast dùng để báo trạng thái (ví dụ thoát chế độ code).

---

### Module 6: Gợi Ý Từ, Gợi Ý Từ Tiếp Theo & Emoji (`src/engine/autocomplete.js`, `emoji.js`)

- Xem chi tiết: [PREDICTION_ENGINE.md](PREDICTION_ENGINE.md).
- **Lazy prefix buckets**: index nặng (cụm từ, ~6.700 âm tiết, từ Tiếng Anh) chỉ được xây ở lần đầu gọi gợi ý, không dựng sẵn lúc import module. Bucket được chia theo ký tự đầu đã bỏ dấu để gõ `a` vẫn thấy cả `à`. Bucket của từ điển người dùng chỉ dựng lại khi `getIndex()` đổi.
- **Gợi ý từ kế tiếp** gồm 4 tầng: trigram người học → trigram có sẵn → bigram người học → bigram có sẵn → cụm từ (tầng cuối cùng nằm chung nhóm 4). Với token lập trình (`git`, `docker`, `npm`, `kubectl`, `python`, `supabase`,...), `Domain-Isolation Weight Lock` khóa suy hao $\lambda = 0{,}0001$ và cộng điểm neo `+5.0` để lệnh kỹ thuật không bị hội thoại thường ngày lấn át.
- **Bảo vệ chat app**: khi đang có gợi ý nhưng người dùng bấm `Enter`, extension **không chặn** sự kiện; tin nhắn được gởi ngay trong Telegram Web, Slack, Messenger.
- `emoji.js` nhận shortcut dạng `:smile:` và gợi ý emoji; được bật/tắt bằng `emojiShortcuts`.

---

## 4. Hướng Dẫn Bắt Đầu Dành Cho Người Mới (Getting Started)

### Bước 1: Cài đặt và chạy thử nghiệm

```bash
npm ci          # dùng package-lock.json, tái tạo đúng dependency tree
npm test        # 98 tests, 98 passed, 0 failed
```

Các test nằm trong `test/`, chạy bằng Node test runner có sẵn. Riêng `test/settings-parity.test.js` can thiệp để Service Worker và `DEFAULT_SETTINGS` không lệch nhau.

### Bước 2: Đóng gói extension

```bash
npm run bundle:extension   # esbuild → content.bundle.js + options.bundle.js
npm run build:firefox      # hoặc build:chrome / build:edge
```

Kết quả nằm tại `web-ext-artifacts/`. Muốn nạp unpacked locally, sinh `manifest.json` trước:

```bash
npm run manifest:chrome    # Chrome/Edge
npm run manifest:firefox   # Firefox
```

### Bước 3: Nạp vào trình duyệt để thử nghiệm

1. Chrome/Edge: mở `chrome://extensions/`, bật **Developer mode**, chọn **Load unpacked** và trỏ vào thư mục dự án sau khi đã chạy `npm run manifest:chrome`.
2. Firefox: mở `about:debugging#/runtime/this-firefox`, chọn **Load Temporary Add-on…** và chọn `manifest.json` sau khi đã chạy `npm run manifest:firefox`.
3. Thử các chuỗi: `toans → toán`, `dduowcj → được`, `xooong → xoong`, `wToUEnabled = false` rồi gõ `sway` vẫn ra `sway`.

### Bước 4 (tuỳ chọn): E2E trên trình duyệt thật

```bash
npx playwright install chromium
npm run test:e2e
```

Kết quả mong đợi: **11/11** ở `playwright-e2e.js` và **24/24** ở `playwright-rich-editors.test.js`, ở cả chế độ headful lẫn headless. Test dùng origin `http://openviet.test` và manifest Chromium tạm thời; một canary `toans → toán` ở đầu mỗi suite để không bao giờ "pass giả" khi content script không gắn vào trang.

---

## 5. Tiêu Chuẩn Viết Code Cần Tuân Thủ (Best Practices)

- **Nguyên tắc Unicode**: luôn xuất kết quả ở dạng NFC (`normalize('NFC')`). Khi so sánh chuỗi, dùng `canon()` từ `vietnamese-words.js`. Ranh giới từ phải đi qua helper xử lý NFD/zero-width trong `text-replacer.js`.
- **Zero External Dependencies ở Runtime**: tầng Engine là JavaScript thuần, không fetch, không remote code, không thu thập dữ liệu. Đây là yêu cầu bắt buộc khi gởi lên AMO.
- **Một nguồn cấu hình**: thêm setting mới thì sửa `DEFAULT_SETTINGS` trước, rồi mới cập nhật UI và cờ tương ứng trong Service Worker; chạy `npm test` để parity test xác nhận.
- **Mỗi quy tắc đều có test**: bất cứ use-case chánh tả, auto-restore hay rich-editor mới đều cần test case trong `test/`. Nếu sửa luồng gõ, chạy thêm `npm run test:e2e`.
- **Ưu tiên ổn định**: không đưa lại "Sentence Momentum & Math Context", không tự động viết lại cả câu, không đồng bộ từ điển qua mạng. Bộ gõ chỉ chuyển đổi phím và gợi ý trên thiết bị.
- **Đồng nhất thuật ngữ**: dùng **Tiếng Việt**, **chánh tả**, **gởi** trong mọi tài liệu và message hiển thị người dùng.
