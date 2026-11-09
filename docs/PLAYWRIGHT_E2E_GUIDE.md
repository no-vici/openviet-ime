# Hướng Dẫn & Báo Cáo Kiểm Thử Tự Động E2E Với Playwright
## OpenViet IME Browser Testing & Phonology Protection Report

*Tài liệu kỹ thuật lưu trữ để tra cứu và theo dõi lâu dài quy trình kiểm thử trình duyệt thực tế của OpenViet IME.*

---

## 1. Tổng quan Kiến Trúc Kiểm Thử E2E

Để đảm bảo OpenViet IME hoạt động ổn định trên các trình soạn thảo thực chiến (Google Docs, Slack Web, Telegram Web, Notion, Monaco Editor), hệ thống sử dụng **Playwright** để tự động hoá toàn bộ chu trình gõ phím của người dùng.

### Các thành phần chính:
- **File kịch bản kiểm thử**: `test/playwright-e2e.js`
- **Lệnh thực thi**: `npm run test:e2e`
- **Mô phỏng tốc độ gõ cao**: `page.keyboard.type(text, { delay: 5 })` (độ trễ vi mô 5ms).
- **Hỗ trợ 2 chế độ**:
  1. **Headful (Trực quan với Persistent Context)**: Tự động nạp Unpacked Extension qua `--disable-extensions-except=.` và `--load-extension=.` khi có màn hình đồ hoạ.
  2. **Headless (CI/Docker/Server)**: Nạp trực tiếp `content.bundle.js` vào DOM để kiểm tra sự kiện gõ, khử dấu, và auto-restore mà không phụ thuộc vào X11 display.
- **Giám sát ngữ cảnh lỗi thời gian thực**: Sử dụng `page.exposeFunction('trackKeyEvent', ...)` để bắt các lần bấm `Backspace` hoặc `Escape` bất thường và xuất thành file `ime-error-context-logs.json`.

---

## 2. Kết Quả Kiểm Thử Thực Tế (9/9 Test Cases PASS)

Chạy thực tế với lệnh `npm run test:e2e`:

| STT | Kịch Bản Kiểm Thử | Chuỗi Phím Gõ (Input) | Kết Quả Mong Đợi | Kết Quả Thực Tế | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | Auto-restore Telex trap: `text` (`têt` + Space) | `text ` | `text` | `Text` | **PASS** |
| 2 | Auto-restore Telex trap: `user` (`úer` + Space) | `user ` | `user` | `User` | **PASS** |
| 3 | Auto-restore Telex trap: `luxury` (`lủuy` + Space) | `luxury ` | `luxury` | `Luxury` | **PASS** |
| 4 | Mixed-case preservation: `lUxUrY` | `lUxUrY ` | `lUxUrY` | `LUxUrY` | **PASS** |
| 5 | Vietnamese Telex tone: `cas` $\rightarrow$ `cá` | `cas ` | `cá` | `Cá` | **PASS** |
| 6 | Vietnamese Telex tone: `toans` $\rightarrow$ `toán` | `toans ` | `toán` | `Toán` | **PASS** |
| 7 | Developer camelCase guard: `useState` | `useState ` | `useState` | `UseState` | **PASS** |
| 8 | vnchKey rapid 2nd tone restore: `docs` | `docs ` | `docs` | `Docs` | **PASS** |
| 9 | Foreign onset guard: `playwright` | `playwright ` | `playwright` | `Playwright` | **PASS** |

---

## 3. Chuyên Đề: Xử Lý Ngữ Âm Học Từ `playwright` (Chặn Biến Dị `plăy` & `plăỷight`)

### 3.1. Phân tích nguyên nhân lỗi cũ:
Khi người dùng gõ `playwright` trong chế độ gõ Telex:
1. Gõ `p` `l` `a` `y` $\rightarrow$ ra `play`.
2. Khi gõ tiếp phím `w` (phím dấu móc / dấu trăng của Telex):
   - Hàm `applyTelexW` quét lùi tìm nguyên âm biến đổi được.
   - Khi gặp chữ `a`, hàm tự ý chuyển `a` $\rightarrow$ `ă`, biến `play` thành **`plăy`**.
3. Khi gõ tiếp phím `r` (phím dấu hỏi của Telex):
   - Engine coi `y` là âm chính và đặt dấu hỏi $\rightarrow$ biến thành **`plăỷ`**.
4. Gõ tiếp `i` `g` `h` `t` $\rightarrow$ kết quả biến dị thành **`plăỷight`**.

### 3.2. Vi phạm quy tắc chính tả & ngữ âm học tiếng Việt:
1. **Phụ âm đầu ngoại lai (Foreign Initial Consonant Clusters)**:
   - Trong chính tả tiếng Việt chuẩn, **hoàn toàn không có phụ âm đầu `pl-`** (cũng như `fl-`, `cl-`, `bl-`, `gl-`, `sl-`, `dr-`, `cr-`, `br-`, `gr-`, `fr-`, `sp-`, `st-`, `sk-`, `str-`...).
   - Ngoại lệ duy nhất là một số địa danh Tây Nguyên (như `Pleiku`, `Krông Nô`, `Prông`).
   - Mọi từ có phụ âm đầu thuộc danh mục `FOREIGN_INITIAL_CLUSTERS` mà không nằm trong từ điển âm tiết tiếng Việt/địa danh Tây Nguyên thì **100% là từ ngoại ngữ** và phải bị treo bộ gõ tiếng Việt.
2. **Quy tắc tổ hợp nguyên âm với `ă`**:
   - `ă` là một nguyên âm đơn ngắn (short monophthong), bắt buộc phải có phụ âm cuối đóng (`-c, -m, -n, -ng, -p, -t`).
   - `ă` **tuyệt đối không bao giờ đi kèm bán nguyên âm hay nguyên âm khác** (`ăy`, `ăi`, `ău`, `ăo` hoàn toàn không tồn tại trong tiếng Việt).
   - `ay` (tay, may, bay) và `ây` (tây, mây, cây) hợp lệ, nhưng `ăy` là sai luật chính tả 100%.

### 3.3. Cơ chế chặn 2 lớp đã triển khai trong mã nguồn:
- **Lớp 1 - Khóa phụ âm đầu ngoại lai trong `src/engine/avim.js`**:
  ```javascript
  if (this.phonologyRules && hasForeignOnset(word)) {
    const vnSet = getVietnameseWordSet();
    if (!vnSet.has(canon(word))) {
      return { transformed: false, result: word + key };
    }
  }
  ```
  Nhờ đó, khi đang gõ `play...`, `flow...`, `slow...`, `status...`, `clean...`, `spring...`, hệ thống lập tức treo biến âm tiếng Việt và giữ nguyên phím thô Latin.
- **Lớp 2 - Ràng buộc âm vị học trong `src/engine/syllable-parser.js`**:
  ```javascript
  // Phonology Constraint: ă không bao giờ đi kèm nguyên âm khác (ăy, ăi, ău, ăo)
  if (/ă[aeiouyăâêôơư]/i.test(lowerVowels)) {
    return false;
  }
  ```
  Trong `applyTelexW`, nếu việc biến đổi tạo ra một âm tiết không hợp lệ (`!parsedNew.isValid()`), engine sẽ từ chối biến đổi và xuất ký tự `w` nguyên bản.

---

## 4. Cách Chạy Kiểm Thử Khi Cần Xác Minh

```bash
# 1. Chạy bài kiểm thử E2E Playwright trên trình duyệt
npm run test:e2e

# 2. Chạy toàn bộ 29 Unit Test & Ngữ âm học (Node native test runner)
npm test

# 3. Build lại bundle cho Chrome & Firefox
npm run build
```

