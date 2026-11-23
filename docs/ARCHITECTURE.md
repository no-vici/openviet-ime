# OpenViet IME: Kiến Trúc Kỹ Thuật & Hướng Dẫn Nhập Môn

Tài liệu này dành cho người lần đầu nhìn vào mã nguồn của một **bộ gõ Tiếng Việt chạy trong trình duyệt**. Sau khi đọc xong, bạn sẽ trả lời được bốn câu hỏi:

1. Bộ gõ là gì, và nó khác với UniKey/Bamboo cài ở hệ điều hành chỗ nào?
2. Khi mình gõ `toans`, điều gì đã xảy ra trước khi chữ `toán` hiện lên màn hình?
3. Vì sao gõ trong Telegram/GitHub/Teams lại dễ hỏng, và OpenViet giải những ca đó ra sao?
4. Mã nguồn được chia thành những phần nào, mình nên bắt đầu đọc từ đâu?

> **Quy ước thuật ngữ:** xuyên suốt tài liệu dùng **Tiếng Việt** (viết hoa chữ cái đầu), **chánh tả** và **gởi** một cách đồng nhất. Tên file, tên hàm, cờ cấu hình và tên thư viện giữ nguyên dạng gốc tiếng Anh để bạn dễ đối chiếu với source.

---

## 0. Cẩm nang từ vựng: đọc xong bảng này là hiểu nửa tài liệu

| Thuật ngữ | Nghĩa đời thường | Ý nghĩa trong OpenViet IME |
|---|---|---|
| **IME** (Input Method Editor) | "bộ gõ" — phần mềm biến phím Latin thành chữ có dấu | `AvimEngine` trong `src/engine/avim.js` |
| **Browser Extension** | một chương trình nhỏ cài vào trình duyệt | gồm content script, background service worker, popup, options |
| **Content script** | "nhân viên đứng ngay tại ô nhập liệu" | `src/content/content.js`, chạy trong trang, đọc/ghi DOM |
| **Background service worker** | "tổng đài" chạy ngầm, không thấy trên trang | `src/background/service-worker.js`, giữ cấu hình, badge, broadcast |
| **DOM** (Document Object Model) | cây các thẻ HTML mà trình duyệt dựng ra | nơi con trỏ và đoạn text đang nằm |
| **caret / selection / Range** | con trỏ nhấp nháy / vùng đang chọn / đoạn bôi trong DOM | `TextReplacer` dùng `Selection` và `Range` để thay chữ |
| **contenteditable** | thẻ HTML cho phép gõ trực tiếp, ví dụ `<div contenteditable="true">` | TipTap, Lexical, Teams editor đều dạng này |
| **event capture** | gắn sự kiện ở chế độ "bắt trước, hỏi sau" | `addEventListener('keydown', ..., true)` giúp bộ gõ đi trước framework |
| **preventDefault()** | "phím này tôi xử lý rồi, trang đừng gõ thêm nữa" | chặn chữ Latin thô lọt vào trước chữ có dấu |
| **stopImmediatePropagation()** | "đừng để listener khác ở cùng sự kiện này chạy nữa" | ngăn React/Vue/Slate tự động gõ lại chữ thô |
| **beforeinput / InputEvent** | sự kiện trình duyệt báo "sắp chèn/xóa text" | lớp guard 80ms chặn event rò rỉ sau khi `keydown` đã bị hủy |
| **model-backed editor** | editor không lưu text thuần trong DOM mà có model riêng | Teams (RoosterJS/CKEditor), Lexical cần `paste` hoặc `beforeinput` có `targetRanges` |
| **NFC / NFD** | hai cách lưu cùng một chữ có dấu: `ế` là 1 ký tự (NFC) hoặc `e` + dấu (NFD) | output luôn NFC; khi đọc thì bỏ qua dấu NFD và zero-width marker |
| **zero-width marker** | ký tự vô hình editor chèn vào để đánh dấu ranh giới | `extractWordBeforeOffset()` bỏ qua để không mất dấu ở đầu/cuối từ |
| **atomic replacement** | đổi cả từ trong một thao tác, không bấm Backspace giả liên tục | `TextReplacer.replaceInContentEditable()` |
| **Shadow DOM** | một "cây HTML con" bị cô lập, CSS của trang không ảnh hưởng | thanh gợi ý và HUD toast; chỉ mount khi cần (lazy) |
| **lazy index / prefix bucket** | chia sẵn từ vào nhóm theo chữ cái đầu, nhưng chỉ xây khi có người hỏi | `AutoCompleteEngine._ensureIndexes()` |
| **bigram / trigram** | xác suất "sau A thì thường là B" / "sau A B thì thường là C" | gợi ý từ kế tiếp, có học trên thiết bị |
| **Telex / VNI** | hai cách gõ dấu bằng phím Latin | Telex: `s` = dấu sắc, `w` = dấu móc; VNI: `6,7,8,...` |
| **Onset / Glide / Nucleus / Coda / Tone** | âm đầu / âm đệm / âm chính / âm cuối / dấu thanh | 5 thành phần của một âm tiết trong `SyllableParser` |
| **chánh tả** | đúng quy tắc viết của Tiếng Việt | `dictionary.js`, `phonologyRules`, stop-finals |
| **HUD** | cái toast nhỏ hiện góc màn hình | báo "đã tắt Tiếng Việt", "đã thoát code mode" |
| **canary** | con chim họa mi trong hầm mỏ: test nhỏ báo ngay nếu hệ thống chết | canary `toans → toán` đầu mỗi suite E2E |

---

## 1. Siêu tốc: điều gì xảy ra khi bạn gõ `toans`?

Hãy tưởng tượng bạn đang gõ vào một ô chat. Bạn bấm lần lượt `t` `o` `a` `n` `s`.

| Lúc bạn bấm | Trạng thái bộ gõ | Chữ trên màn hình |
|---|---|---|
| `t` | chưa có âm tiết, cho phím đi qua | `t` |
| `o` | vẫn là chuỗi Latin đang build | `to` |
| `a` | parser biết cụm `oa` là nguyên âm chính hợp lệ | `toa` |
| `n` | `n` là âm khép, dấu (nếu có) sẽ dời vào `a` | `toan` |
| `s` | Telex hiểu `s` = dấu Sắc; engine tạo `toán` và **chặn phím `s` thô** | `toán` |

Điểm mấu chốt nằm ở phím cuối: thay vì để trình duyệt gõ chữ `s` rồi mới xóa đi sửa lại, OpenViet **quyết định trước**, gọi `event.preventDefault()` và tự thay cả từ bằng `toán`. Đó là lý do bạn không thấy hiện tượng `toáns` rồi mới mất `s`.

Nếu gõ ngược `toasn`, parser vẫn nhận ra `s` là dấu, `n` là coda, rồi dời dấu đúng chỗ → vẫn ra `toán`. Khả năng "dấu gõ trước vẫn tự nhảy đúng chỗ" đó gọi là **dynamic tone shifting** (dời dấu động).

---

## 2. Vì sao làm bộ gõ trong trình duyệt lại khó?

### 2.1. Cuộc đua sự kiện (Event Race Condition)

Trên hệ điều hành, UniKey chặn phím ở tầng driver: ứng dụng chỉ nhận chữ đã có dấu. Trình duyệt thì không cho extension can thiệp ở tầng đó.

Extension chỉ được nghe sự kiện `keydown` Giống như mọi script khác trên trang. Nếu React/Slate/TipTap cũng nghe `keydown` và tự chèn chữ thô trước khi extension kịp thay thế, bạn sẽ thấy:

- `toán` thành `toáan` (nhảy chữ),
- `vâyậy` thay vì `vậy` (lặp chữ),
- dấu bị rụng khi gõ nhanh 5ms/phím.

**Cách giải:** gắn listener ở chế độ capture (`true`), xử lý xong thì `preventDefault()` + `stopPropagation()` + `stopImmediatePropagation()`. Ngoài ra, một guard `beforeinput` trong 80ms chặn luôn `InputEvent` mà Chromium/macOS đôi khi vẫn gởi thêm sau khi `keydown` đã bị hủy.

### 2.2. Không phải ô nhập nào cũng giống nhau

| Loại ô | Ví dụ | Khó khăn |
|---|---|---|
| `<input>`, `<textarea>` | ô tìm kiếm, ô password | dễ nhất: chỉ cần sửa `value` và dispatch `input` |
| `contenteditable` thường | Notion, Slack Web | con trỏ nằm trong text node, có khi nằm giữa `<p>` rỗng |
| Editor có framework | TipTap/ProseMirror, Lexical, Slate | framework tự đồng bộ model, sửa DOM trực tiếp có thể bị ghi đè |
| Editor có model riêng | Teams Web (RoosterJS/CKEditor) | bắt buộc gởi `paste` hoặc `beforeinput` kèm `targetRanges` để model tự cập nhật |
| Canvas | Google Docs/Sheets/Slides, Figma, Canva | không lộ text có thể thay thế an toàn → **bỏ qua chủ động** |

`DomObserver` quyết định target có đáng can thiệp hay không. `TextReplacer` sau đó chọn adapter phù hợp thay vì dùng một cách làm chung cho tất cả.

### 2.3. Unicode không chỉ là "có dấu hay không"

Chữ `ế` có thể được lưu dưới hai dạng:

- **NFC**: một ký tự `ế`.
- **NFD**: `e` + dấu mũ + dấu sắc (hai hoặc ba code point).

Editor thường chèn thêm **zero-width marker** (ký tự vô hình độ rộng bằng 0) để đánh dấu ranh boundary giữa các đoạn styled. Nếu đếm cả những ký tự đó làm một phần của từ, backspace sẽ xóa nhầm hoặc dấu sẽ bị rụng: `đồ` → `do`.

**Cách giải:** mọi output được `normalize('NFC')`; mọi lần đọc từ đi qua `extractWordBeforeOffset()` trong `text-replacer.js`, hàm này bỏ dấu NFD khi cần và bỏ zero-width marker khi tính `startIndex/endIndex`.

### 2.4. Hiệu năng và riêng tư

Bộ gõ chạy trên **mọi phím bấm**. Nếu mỗi lần gõ lại dựng lại từ điển 6.700 âm tiết, máy sẽ lag. Nếu gọi mạng để tra cứu, vừa chậm vừa vi phạm chính sách AMO.

**Cách giải:** Engine là JavaScript thuần, không fetch, không remote code. Index gợi ý được xây **lazy** ở lần đầu cần, sau đó tái dùng. Mọi thói quen người học được lưu trong `storage.sync` trên thiết bị.

---

## 3. Kiến trúc 3 tầng: ai làm việc gì?

Hãy tưởng tượng một quán cafe:

- **Nhân viên pha chế** đứng ngay quầy, nhìn thấy ly của bạn — đó là **Tầng nội dung**.
- **Bếp trưởng** chỉ biết công thức, không cần biết ly đang ở bàn nào — đó là **Tầng động cơ**.
- **Quản lý** giữ thực đơn và nhớ bạn thích uống gì — đó là **Tầng nền tảng**.

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
│  (badge + broadcast)                  (dùng DEFAULT_SETTINGS)          │
└────────────────────────────────────────────────────────────────────────┘
```

### Tầng nội dung — "nhân viên quầy"

`src/content/content.js` được inject vào mọi trang (`<all_urls>`, `document_start`). Nó nghe phím, hỏi `DomObserver` xem target có hợp lệ không, nhờ `TextReplacer` lấy đoạn text quanh con trỏ, gọi engine, rồi nhờ `TextReplacer` thay lại. Nó cũng quản lý thanh gợi ý Shadow DOM và HUD toast.

### Tầng động cơ — "bếp trưởng"

Các file trong `src/engine/` **không biết DOM là gì**. Chúng nhận vào một chuỗi (`currentWord`) và một phím (`key`), trả về chuỗi mới. Nhờ vậy bạn có thể test engine bằng `node --test` mà không cần mở trình duyệt. Đây là lý do 98 test unit chạy trong chưa đầy giây.

### Tầng nền tảng — "quản lý"

`service-worker.js` ghi cấu hình mặc định lúc cài đặt, đổi chữ `TE/VNI/AUTO/OFF` trên badge và broadcast `SETTINGS_UPDATED` khi Popup/Options đổi setting. Popup và Options đọc/ghi cùng một khóa `avim_settings` trong `storage.sync`.

`DEFAULT_SETTINGS` trong `src/engine/config.js` là nguồn chân lý cho Popup, Options và Content Script. Service Worker là classic script nên vẫn giữ một bản sao; `test/settings-parity.test.js` can thiệp để hai bản không lệch nhau.

---

## 4. Hành trình một phím, nhìn dưới dạng giả code

Đây là đường đi rút gọn của `handleKeyDown(event)`:

```text
keydown (capture = true)
 │
 ├─ 1. Phím hệ thống / shortcut đặc biệt?
 │     ├─ Ctrl+Shift+U → đổi chữ thường/HOA/Title, dừng ở đây
 │     ├─ Esc trong code fence → thoát chế độ code
 │     └─ Ctrl hai lần → đổi phương pháp gõ (Double-Ctrl)
 │
 ├─ 2. Method = OFF? → trả phím 100% cho trang, không can thiệp
 │
 ├─ 3. Target hợp lệ? (DomObserver)
 │     ├─ password / [data-no-ime] / domain blacklist → thôi
 │     └─ canvas host (Docs, Figma...) → thôi
 │
 ├─ 4. Đang ở URL / email / camelCase / code?
 │     → tạm treo biến âm Tiếng Việt, giữ phím Latin
 │
 ├─ 5. Macro khớp trigger + delimiter? (MacroEngine)
 │     → bung macro, xử lý undo/phục hồi nếu cần
 │
 ├─ 6. Delimiter (Space, dấu câu)? → auto-restore từ Anh, ghi lại bigram
 │
 ├─ 7. AvimEngine.processKey(currentWord, key)
 │     ├─ wToUEnabled = false và key = w → trả literal w NGAY (early return)
 │     ├─ SyllableParser dời dấu đúng âm chính
 │     ├─ Dictionary chặn âm tiết sai chánh tả
 │     └─ trả { transformed: true, result: 'toán' }
 │
 ├─ 8. Nếu transformed:
 │     ├─ preventDefault + stopImmediatePropagation
 │     ├─ ghi _blockedKeys[key] = now  (guard beforeinput 80ms)
 │     └─ TextReplacer.replaceInNativeInput() hoặc replaceInContentEditable()
 │
 └─ 9. (tuỳ chọn) sau 150ms → AutoCompleteEngine.getSuggestions()
       → hiện thanh gợi ý trong Shadow DOM
```

Hai chi tiết đáng nhớ:

- **Full w opt-out** nằm ở bước 7, ngay đầu `processKey()`. Khi tắt `wToUEnabled`, mọi phép biến `w` (kể cả `sway → sưay`) bị triệt tiêu; còn chính sách Non-Start (`web`, `wifi` giữ nguyên) vẫn áp dụng vì `typeW2U` bị ép `true`.
- **Rich-editor recovery** nằm ngay trước bước 7: nếu `TextReplacer` trích xuất được prefix ASCII cũ nhưng `lastTransformed` đã có dấu, content script ưu tiên bản đã chuyển đổi để phím tiếp theo không bị "tụt lại" về dạng chưa dấu.

---

## 5. Bảng "bệnh → thuốc": 12 ca khó nhất đã được giải

| Triệu chứng người dùng thấy | Nguyên nhân gốc | Cách OpenViet giải | File cần đọc |
|---|---|---|---|
| Gõ nhanh thành `toáan`, `vâyậy` | framework gõ thô trước khi extension sửa | capture + `preventDefault()` + `stopImmediatePropagation()` + guard `beforeinput` | `content.js`, `text-replacer.js` |
| Dấu bị rụng trong Telegram/ProseMirror | extraction trả prefix cũ, editor tự render lại | ưu tiên `avimEngine.lastTransformed` rồi thay nguyên khối | `content.js` |
| Teams không nhận chữ, hoặc nhận xong rồi mất | RoosterJS/CKEditor có Content Model riêng | gởi `ClipboardEvent('paste')` / `beforeinput` kèm `targetRanges` | `text-replacer.js` |
| `đồ` thành `do` sau Backspace | NFD + zero-width marker làm sai ranh giới | `extractWordBeforeOffset()` + output NFC | `text-replacer.js` |
| Dấu đứng sai chỗ (`tóan`) | dấu được gõ trước khi có coda | `SyllableParser` dời dấu theo âm chính | `syllable-parser.js`, `avim.js` |
| `sway`/`manjaro` bị biến dị | từ Anh đi vào luồng Telex | `COMMON_ENGLISH_WORDS` + `shouldAutoRestoreEnglish()` | `dictionary.js` |
| Bật/tắt `w` gây nhầm lẫn | công tắc cũ `typeW2U:false` còn sót | `wToUEnabled` là công tắc mới; `typeW2U` bị ép `true` | `config.js`, `content.js`, `avim.js` |
| Macro bung lại sau khi undo | Backspace xóa Space rồi Space bung macro lần 2 | undo 2 bước + `suppressedTrigger` | `macro.js` |
| Gợi ý làm lag phím đầu | dựng index 6.700 từ lúc import | lazy prefix buckets, user bucket chỉ rebuild khi index đổi | `autocomplete.js` |
| Lệnh `git`, `docker` bị gợi ý thành hội thoại | decay thời gian làm từ kỹ thuật tụt điểm | Domain-Isolation Weight Lock: λ = 0,0001, neo +5.0 | `autocomplete.js` |
| Popup/Options/service worker lệch setting | mỗi nơi tự định nghĩa default | `DEFAULT_SETTINGS` + parity test | `config.js`, `settings-parity.test.js` |
| E2E headful "pass giả" | test dùng `about:blank`, content script không chạy | origin `http://openviet.test` + manifest Chromium tạm + canary `toans → toán` | `test/playwright-*.js` |

---

## 6. Đi sâu từng module (vẫn theo hướng nhập môn)

### 6.1. `config.js` và `key-codes.js` — luật chơi chung

`DEFAULT_SETTINGS` chứa mọi công tắc: phương pháp gõ, kiểu dấu, macro, chánh tả, gợi ý, học thói quen, blacklist domain...

`key-codes.js` định nghĩa bảng phím Telex/VNI, bộ delimiter và các hàm bảo vệ:

- `isUrlOrEmailOrCode()`: gõ `https://`, `user@domain`, `snake_case` thì treo dấu.
- `isCamelOrPascalCase()`: giữ `useState`, `loWeRcAsE`.
- `isDeveloperCheatContext()`: nhận diện trang like GitHub/LeetCode để bớt can thiệp.

### 6.2. `syllable-parser.js` và `avim.js` — trái tim ngữ âm

Một âm tiết Tiếng Việt được bóc thành 5 phần:

```text
Syllable = Onset (âm đầu) + Glide (âm đệm) + Nucleus (âm chính) + Coda (âm cuối) + Tone (dấu thanh)

quán → q  +  u  +  a  +  n  +  Sắc
thủy → th +  u  +  y  +  ∅  +  Hỏi
```

Khi gõ `toans`, engine tạo `tóan` tạm, thấy `n` là âm khép thì dời dấu sang `a` → `toán`. Đây là **dynamic tone shifting**.

`avim.js` cũng xử lý:

- Telex `aa → â`, `oo → ô`, `ow → ơ`, `uw → ư`; VNI `6,7,8...`.
- Stop finals: `c/ch/p/t` chỉ hợp lệ với Sắc hoặc Nặng → chặn `đườc`.
- Hai kiểu đặt dấu: classic `hòa, hóa, thủy, khỏe` (mặc định) và BGDĐT `hoà, hoá, thuỷ, khoẻ`.
- Full opt-out `w`: trả literal `w` ngay đầu `processKey()`.

Engine **không** tự thêm dấu cho `khong`, `truong`, `nganh`; đó là việc của macro hoặc người dùng. Không có "Sentence Momentum & Math Context" trong mã nguồn hiện tại.

### 6.3. `dictionary.js`, `casing.js`, `vietnamese-words.js` — chánh tả và từ bẫy

- `COMMON_ENGLISH_WORDS` chứa `sway`, `manjaro`, `text`, `user`, `useState`... Gặp delimiter là `shouldAutoRestoreEnglish()` trả lại dạng Latin.
- `hasPhonologyViolation()`, `hasForeignOnset()` ngăn tạo âm tiết sai chánh tả hoặc phá cụm `play`, `spring`, `status`.
- `harmonizeSyllableCase()` sửa `ĐƯợc → Được`, nhưng chỉ bật khi `autoHarmonizeCase = true` (mặc định tắt). `camelCase` và `ALL CAPS` luôn được giữ.
- Smart Erase Habit Learning: xóa trọn một từ có dấu nhiều lần (mặc định 3) thì dạng thô được thêm vào từ điển cá nhân, stored on-device.

### 6.4. `macro.js` — gõ tắt có đường lui

`vn → Việt Nam`, `tv → Tiếng Việt`, `dc → được`, `+now → $DATETIME`, `+cb → $CLIPBOARD`.

Undo hai bước:

1. `vn` + Space → `Việt Nam `.
2. Backspace 1 → chỉ mất Space.
3. Backspace 2 → về `vn`, đặt `suppressedTrigger`; Space ngay sau đó đi qua thành `vn ` chứ không bung lại.

### 6.5. `content/` — nơi "mượt" hay "giật" được quyết định

- `dom-observer.js`: đi xuyên Shadow DOM, lọc target, bỏ qua canvas host và domain blacklist.
- `text-replacer.js`: 4 adapter (native input / ProseMirror / Lexical / Teams) + fallback `Range`; chịu trách nhiệm ranh giới NFD/zero-width.
- `content.js`: điều phối, lazy mount Shadow DOM, HUD toast, `adoptWordBeforeBackspace`, rich-editor recovery.

### 6.6. `autocomplete.js` và `emoji.js` — gợi ý không làm chậm gõ

Index được xây ở lần đầu gọi, chia bucket theo chữ cái đầu đã bỏ dấu (gõ `a` vẫn thấy `à`). Gợi ý từ kế tiếp có 4 tầng: trigram học được → trigram có sẵn → bigram học được → bigram có sẵn/cụm từ. Token lập trình được khóa suy hao gần như bằng 0 để không bị lấn át.

Khi đang có gợi ý mà bạn bấm `Enter` trong Telegram/Slack, extension **không chặn**: tin nhắn được gởi ngay.

### 6.7. Background, Popup, Options

- `service-worker.js`: viết default vào storage lúc cài, cập nhật badge `TE/VNI/AUTO/OFF`, broadcast `SETTINGS_UPDATED`.
- `popup/popup.html` + `popup.js`: module ES, import trực tiếp `DEFAULT_SETTINGS`; có công tắc `wToUEnabled`.
- `options/options.html` → `options.bundle.js` (esbuild): import `DEFAULT_SETTINGS` ở source, đóng gói thành IIFE.
- `manifest.json` là file sinh ra: `npm run manifest:firefox` hoặc `npm run manifest:chrome` quyết định bản nào được đóng gói.

---

## 7. Bắt đầu thực hành: build, test, nạp vào trình duyệt

```bash
npm ci                    # tái tạo dependency tree từ package-lock.json
npm test                  # 98 tests, 98 passed, 0 failed
npm run bundle:extension  # esbuild → content.bundle.js + options.bundle.js
npm run build:firefox     # hoặc build:chrome / build:edge
npm run manifest:chrome   # nếu muốn Load unpacked trên Chrome/Edge
npm run manifest:firefox  # nếu muốn Load Temporary Add-on trên Firefox
```

Tuỳ chọn (cần Playwright):

```bash
npx playwright install chromium
npm run test:e2e          # 11/11 + 24/24, headful lẫn headless
```

Nên thử tay các chuỗi này sau khi nạp extension:

| Gõ | Kỳ vọng | Ý nghĩa |
|---|---|---|
| `toans ` | `toán` | dời dấu động |
| `dduowcj ` | `được` | Telex `dd` + âm khép |
| `xooong ` | `xoong` | bỏ dấu thừa |
| `sway ` | `sway` | từ bẫy Tiếng Anh được khôi phục |
| bật/tắt `wToUEnabled`, gõ `thw ` | `thư` / `thw` | công tắc `w` hoạt động đúng |

---

## 8. Nguyên tắc vàng khi bạn sửa mã nguồn

1. **Đừng tin vào "chữ đang hiện trên màn hình".** Hãy hỏi `TextReplacer` trích xuất gì, và so với `lastTransformed`.
2. **Mọi output phải NFC.** Mọi so sánh phải đi qua `canon()` hoặc helper bỏ dấu.
3. **Mỗi rule mới cần một unit test**, và nếu đụng vào luồng gõ thì chạy thêm E2E có canary.
4. **Một nguồn cấu hình.** Thêm setting thì sửa `DEFAULT_SETTINGS` trước, rồi mới update UI và service worker.
5. **Không network, không remote code, không thu thập dữ liệu.** Đó là yêu cầu của AMO và cũng là thiết kế của dự án.
6. **Không hồi sinh "Sentence Momentum & Math Context"**, không tự viết lại cả câu, không đồng bộ từ điển qua mạng.
7. **Dùng thống nhất Tiếng Việt / chánh tả / gởi** trong tài liệu và message hiển thị người dùng.
