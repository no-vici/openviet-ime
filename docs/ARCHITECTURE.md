# OpenViet IME: Kiến Trúc Kỹ Thuật & Hướng Dẫn Nhập Môn

Tài liệu này được viết theo phong cách tường minh, dễ tiếp cận, giúp bất kỳ lập trình viên nào (kể cả người mới bắt đầu) cũng có thể hiểu rõ cách một **Bộ gõ Tiếng Việt hiện đại trong trình duyệt web** hoạt động từ A đến Z.

---

## 1. Bản Chất Của Bộ Gõ Trên Trình Duyệt Web

Khi bạn gõ bàn phím trên hệ điều hành (Windows/macOS/Linux), bộ gõ hệ thống (như UniKey hay Bamboo) chặn phím ở tầng driver trước khi ứng dụng nhận được.

Tuy nhiên, **Browser Extension IME** hoạt động bên trong môi trường JavaScript của trình duyệt. Nó phải đối mặt với hai thách thức lớn:
1. **Tranh chấp sự kiện (Event Race Condition)**: Các framework hiện đại như React, Vue, Slate, TipTap, CodeMirror luôn theo dõi phím bấm. Nếu Extension không xử lý khéo léo, ký tự gốc sẽ lọt vào DOM trước khi bộ gõ kịp thay thế, gây ra lỗi **nhảy chữ, lặp chữ** (ví dụ: `toán` thành `toáan` hoặc `vâyậy`).
2. **Khác biệt ô nhập liệu**:
   - Thẻ chuẩn: `<input>`, `<textarea>`.
   - Trình soạn thảo văn bản phong phú: `<div contenteditable="true">` (như Notion, Docs, Slack, Messenger).

---

## 2. Kiến Trúc Tổng Thể (System Architecture)

Dự án được phân chia thành 3 tầng độc lập, theo nguyên lý **Separation of Concerns (SoC)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG NỘI DUNG (Content Layer)                   │
│                                                                        │
│   [DOM Observer] ──(Bắt phím)──> [Content Coordinator (content.js)]    │
│                                          │                             │
│                                          ▼                             │
│                             [Text Replacer (Chống nhảy chữ)]           │
└──────────────────────────────────────────┬─────────────────────────────┘
                                           │
                                           ▼ (Ủy quyền xử lý logic)
┌────────────────────────────────────────────────────────────────────────┐
│                          TẦNG ĐỘNG CƠ (Engine Layer)                   │
│                                                                        │
│  [Syllable Parser] ──(Ngữ âm 5 thành phần)──> [AVIM Engine]            │
│  [Macro Engine]    ──(Gõ tắt & Hoàn tác)    ──> [Auto-Complete Engine] │
│  [Casing Engine]   ──(Harmonize & Unique)   ──> [Config & Dictionary]  │
└──────────────────────────────────────────┬─────────────────────────────┘
                                           │
                                           ▼ (Giao tiếp bảo mật)
┌────────────────────────────────────────────────────────────────────────┐
│                    TẦNG NỀN TẢNG (Background & Settings)               │
│                                                                        │
│        [Service Worker] ◄─── chrome.storage ───► [Popup & Options]     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Giải Thích Chi Tiết Từng Module (Dành Cho Beginner)

### Module 1: Bộ Phân Tích Âm Tiết (`src/engine/syllable-parser.js`)
Đây là bộ não ngữ âm học tiên tiến nhất của OpenViet IME, mô hình hóa bất kỳ âm tiết tiếng Việt nào thành **5 thành phần chuẩn**:

$$\text{Syllable} = \text{Onset (Âm đầu)} + \text{Glide (Âm đệm)} + \text{Nucleus (Âm chính)} + \text{Coda (Âm cuối)} + \text{Tone (Dấu thanh)}$$

#### Ví dụ thực tế:
- Từ **`quán`**:
  - `Onset`: `q`
  - `Glide`: `u`
  - `Nucleus`: `a`
  - `Coda`: `n`
  - `Tone`: `1` (Sắc)
- Từ **`thủy`**:
  - `Onset`: `th`
  - `Glide`: `u`
  - `Nucleus`: `y`
  - `Coda`: `(trống)`
  - `Tone`: `3` (Hỏi)

#### Cơ chế Dời Dấu Động (Dynamic Tone Shifting) hoạt động ra sao?
Khi người dùng gõ phím dấu quá sớm:
1. Gõ `t` + `o` $\rightarrow$ `to`.
2. Gõ tiếp `s` $\rightarrow$ biến thành `tó` (dấu sắc tạm đặt trên `o`).
3. Gõ tiếp `a` $\rightarrow$ bộ parser nhận diện cụm `oa`, chuyển thành `tóa`.
4. Gõ tiếp `n` $\rightarrow$ bộ parser phát hiện có phụ âm cuối `n` (âm khép). Theo luật chính tả tiếng Việt, dấu sắc bắt buộc phải nằm trên âm chính `a`, không được ở âm đệm `o`. Engine tự động tái tạo thành **`toán`**, hoàn toàn ngăn chặn lỗi `tóan`.

---

### Module 2: Cỗ Máy Biến Đổi Ký Tự (`src/engine/avim.js`)
Module này quản lý bảng ma trận nguyên âm (`VOWEL_TABLE`) và thực hiện biến đổi:
- **Biến đổi hình dạng nguyên âm**:
  - Telex: `aa` $\rightarrow$ `â`, `oo` $\rightarrow$ `ô`, `ow` $\rightarrow$ `ơ`, `uw` $\rightarrow$ `ư`.
  - VNI: phím `6, 7, 8`.
- **Luật kiểm tra âm khép (Stop Finals)**:
  - Nếu từ kết thúc bằng `c, ch, p, t`, chỉ cho phép mang thanh **Sắc** hoặc **Nặng** (ví dụ: `được`, `đước`). Nếu gõ dấu huyền, hỏi, ngã (ví dụ: `đườc`), bộ gõ sẽ chặn lại để tránh sinh ra từ sai chính tả.
- **Hai phong cách đặt dấu**:
  - **Chuẩn mới (BGDĐT)**: `hoà, hoá, thuỷ, khoẻ` (đặt dấu lên âm chính `a, e, y`).
  - **Chuẩn cũ (VNCH / UniKey cổ điển)**: `hòa, hóa, thủy, khỏe` (đặt dấu lên âm đệm `o, u`).

---

### Module 3: Bộ Gõ Tắt Macro (`src/engine/macro.js`)
Cho phép người dùng gõ tắt nhanh:
- `vn` $\rightarrow$ `Việt Nam`
- `dc` $\rightarrow$ `được`

#### Thuật toán Chống Lặp Vô Tận (Macro Undo Loop Suppression):
- Bình thường: Gõ `vn` + Space $\rightarrow$ bung thành `Việt Nam `.
- Nếu người dùng bấm `Backspace` để xóa Space $\rightarrow$ tự động thu hồi lại thành `vn`.
- **Điểm mấu chốt**: Nếu người dùng nhấn `Space` một lần nữa, hệ thống kích hoạt cờ `suppressed` để cho phép phím Space đi qua bình thường (ra `vn `), thay vì lại bung thành `Việt Nam ` lần thứ hai, tránh kẹt người dùng vào vòng lặp vô tận.

---

### Module 4: Can Thiệp DOM & Chống Nhảy Chữ (`src/content/text-replacer.js` & `content.js`)
Đây là phần tinh vi nhất quyết định độ mượt của một Browser Extension IME:
1. **Chặn sự kiện lan truyền**:
   Khi một phím tạo ra ký tự tiếng Việt (như `s` biến `a` thành `á`), gọi ngay:
   ```javascript
   event.preventDefault();
   event.stopImmediatePropagation();
   ```
   Điều này khiến trang web không nhận được ký tự `s` thô, loại bỏ hoàn toàn lỗi gõ nhanh bị nhân đôi chữ (`vâyậy`, `thêể`).
2. **Thay thế nguyên khối (Atomic Replacement)**:
   Thay vì gửi nhiều phím Backspace giả lập (dễ bị lag), bộ thay thế xác định chính xác vị trí con trỏ và tọa độ từ ngữ cảnh, rồi tráo đổi nội dung trong 1 thao tác duy nhất.
3. **Thu nạp từ trước Backspace (`adoptWordBeforeBackspace`)**:
   Khi gõ `toan ` rồi bấm Backspace xóa khoảng trắng, bộ đệm lập tức nạp lại từ `toan`. Bạn chỉ cần bấm phím `s` là biến thành `toán` ngay lập tức mà không cần xóa đi gõ lại cả từ.

---

### Module 5: Dự Đoán Từ Tiếp Theo & Học Thói Quen On-Device (`src/engine/autocomplete.js`)
Xem tài liệu chuyên sâu: [PREDICTION_ENGINE.md](PREDICTION_ENGINE.md).
- **Mô hình ngữ cảnh 4 tầng**: Trigram Inference $\rightarrow$ User-Learned Bigrams $\rightarrow$ Curated Base Bigrams $\rightarrow$ Compound Phrases Index.
- **Pre-computed Lookup Cache**: Tối ưu hóa hiệu năng vòng lặp gợi ý bằng cách tiền tính toán (pre-stripped) toàn bộ 6.700 âm tiết tiếng Việt trong lần khởi tạo đầu tiên, giảm độ trễ phản hồi mỗi phím bấm xuống dưới 1ms.
- **Domain-Isolation Weight Lock**: Khóa hệ số suy hao thời gian ($\lambda = 0.0001$) và cộng điểm neo sàn (`+5.0`) cho các lệnh lập trình và DevOps (`git`, `docker`, `npm`, `kubectl`, `python`, `supabase`,...) để không bao giờ bị các cuộc hội thoại thường ngày lấn át.
- **Bảo vệ Chat Apps**: Tự động vô hiệu hóa can thiệp phím `Enter` khi hiển thị gợi ý từ kế tiếp, giúp việc gửi tin nhắn trong Telegram Web, Slack, Messenger diễn ra tức thì, không bị cản trở.

---

### Module 6: Chuẩn Hóa Casing & Học Thói Quen Nhập Liệu (`src/engine/casing.js` & `content.js`)
- **`harmonizeSyllableCase`**: Xử lý triệt để bẫy kẹt Shift / CapsLock (`ĐƯợc` $\rightarrow$ `Được`, `đƯỢc` $\rightarrow$ `được`), giữ nguyên `ALL CAPS` và bảo vệ tuyệt đối biến `camelCase` / `PascalCase` (`useState`, `loWeRcAsE`). Tính năng được thiết kế dạng **Opt-in (mặc định Tắt)** để tôn trọng sự thuần khiết và thói quen gõ tự do của lập trình viên.
- **Triết lý Core IME thuần khiết (Unix Philosophy)**: Core Engine tập trung chuyển đổi phím chuẩn xác theo bảng mã, tuyệt đối không tự ý suy đoán điền dấu vào các từ không dấu (`khong`, `truong`, `nganh`), nhường quyền gõ tắt linh hoạt lại cho Macro Engine.
- **Smart Erase Habit Learning**: Cơ chế phát hiện xóa trọn vẹn từ có dấu nhiều lần liên tiếp khi gõ chữ tiếng Anh hoặc tiếng lóng ngoài từ điển (với ngưỡng tùy chỉnh từ 2 đến 10, mặc định là 3). Tự động đưa từ vào từ điển cá nhân hóa của người dùng và cho phép quản lý xóa bỏ bất cứ lúc nào.

---

## 4. Hướng Dẫn Bắt Đầu Dành Cho Người Mới (Getting Started)

### Bước 1: Cài đặt và Chạy Thử Nghiệm
Mở terminal tại thư mục gốc của dự án:
```bash
# Kiểm tra bộ test hoàn chỉnh
npm test
```
Bạn sẽ thấy 8 bộ kiểm thử chạy qua trong chưa đầy 200 mili-giây!

### Bước 2: Đóng Gói Extension
```bash
# Biên dịch file JavaScript đóng gói sẵn
npm run build
```
File đầu ra sẽ nằm tại `src/content/content.bundle.js` và `src/options/options.bundle.js`.

### Bước 3: Nạp vào Trình Duyệt để Thử Nghiệm
1. Mở trình duyệt Google Chrome hoặc Edge, truy cập: `chrome://extensions/`.
2. Bật công tắc **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên bên phải.
3. Nhấp vào nút **Load unpacked (Tải tiện ích đã giải nén)** và chọn thư mục của dự án này.
4. Mở một tab mới (ví dụ Google Docs hoặc Messenger) và trải nghiệm gõ tiếng Việt mượt mà!

---

## 5. Tiêu Chuẩn Viết Code Cần Tuân Thủ (Best Practices)

- **Nguyên tắc Unicode**: Luôn xuất dữ liệu đầu ra ở dạng chuẩn hóa dựng sẵn **NFC** (`normalize('NFC')`). Khi so sánh chuỗi, luôn chuẩn hóa cả hai phía thông qua hàm `canon()`.
- **Zero External Dependencies ở Runtime**: Tầng Engine phải là JavaScript thuần (Vanilla JS), không phụ thuộc vào bất kỳ thư viện bên ngoài nào để đảm bảo tốc độ tối đa và kích thước siêu nhẹ (dưới 300KB).
- **Viết Unit Test cho mọi tính năng mới**: Bất cứ khi nào thêm một quy tắc gõ hoặc sửa một trường hợp từ vựng, hãy bổ sung test case vào thư mục `test/` để đảm bảo không làm gãy các tính năng cũ.

