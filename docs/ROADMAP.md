# OpenViet IME: Roadmap & Development Evolution

Tài liệu định hướng phát triển tổng thể của **OpenViet IME** — bộ gõ Tiếng Việt và công cụ gõ tắt Macro tốc độ cao dành cho trình duyệt web hiện đại.

---

## 1. Những Cột Mốc Đã Hoàn Thành (Milestones Achieved)

### Giai đoạn 1: Nền tảng Bộ gõ & Kiến trúc Extension (Core IME & MV3)
- [x] **Hỗ trợ đa trình duyệt**: Đóng gói chuẩn Manifest V3 cho Chrome, Edge, Brave, Opera và Firefox (Gecko).
- [x] **Cơ chế gõ Telex & VNI**: Chuyển đổi ký tự, dấu mũ (`â, ê, ô`), dấu móc (`ơ, ư, ă`), phụ âm (`đ`) và 5 thanh điệu (`sắc, huyền, hỏi, ngã, nặng`).
- [x] **Chế độ tự động Auto-Method**: Nhận diện phím số cho VNI, phím chữ cho Telex mà không cần bấm đổi chế độ thủ công.
- [x] **Nhớ chế độ theo từng tên miền (Per-Domain Memory)**: Ghi nhớ tắt IME trên Google Sheets/Figma và bật trên Gmail/Docs.

### Giai đoạn 2: Tối ưu Hóa Trải Nghiệm Gõ Hiện Đại (UX & Chống Lỗi)
- [x] **Bỏ dấu cuối từ (Late Vowel Shaping)**: Gõ `chong` + `o` ra `chông`, `kieu` + `e` ra `kiêu`.
- [x] **Bộ lọc cú pháp Code, URL & Email**: Tự động nhận diện `http://`, `user@domain`, `snake_case`, `kebab-case` để tạm dừng gõ dấu tiếng Việt, tránh phá hỏng mã nguồn hay đường link.
- [x] **Chống nhảy chữ & lặp ký tự (Atomic Range Replacement)**: Chặn sự kiện lan truyền tức thì (`stopImmediatePropagation`) trên các chatbox AI và rich editor phức tạp (Sider.ai, StackEdit, TipTap, CodeMirror, Slack, Telegram Web).
- [x] **Chuẩn hóa Unicode NFC toàn diện (`canon`)**: Đầu ra luôn là dựng sẵn (NFC); chuẩn hóa hai chiều cả nháy đơn cong (`’`) và thẳng (`'`) phục vụ địa danh Tây Nguyên (`M'đrắk`, `Cư M'gar`).
- [x] **Hoàn tác nhanh bằng phím ESC (Instant ESC Revert)**: Khôi phục chuỗi phím thô ban đầu chỉ với 1 phím bấm.
- [x] **Tự động khôi phục từ tiếng Anh (GoNhanh Feature)**: Bấm Space tự khôi phục các từ dễ dính bẫy gõ nhầm (`text`, `user`, `push`, `window`).

### Giai đoạn 3: Bộ Gõ Tắt Macro & Trí Tuệ Ngữ Cảnh (Macro & AI Prediction)
- [x] **Macro Engine cực nhanh**: Thay thế từ viết tắt tức thì khi gõ phím cách/dấu câu (`vn` $\rightarrow$ `Việt Nam`).
- [x] **Bảo toàn Casing**: Tự động theo kiểu viết hoa (`vn` $\rightarrow$ `Việt Nam`, `VN` $\rightarrow$ `VIỆT NAM`, `Vn` $\rightarrow$ `Việt nam`).
- [x] **Hoàn tác Macro chống vòng lặp (Macro Undo Loop Suppression)**: Xóa lùi Space hoàn lại từ viết tắt; gõ Space tiếp theo không bị bung macro lại vô tận.
- [x] **Gợi ý từ thông minh kiểu Gboard**: Dự đoán từ kế tiếp (Next-word prediction), hỗ trợ phím Tab/Enter điều hướng, tự học từ dùng nhiều trên máy người dùng (100% On-Device, bảo mật tuyệt đối).
- [x] **Gõ tắt Emoji**: Hỗ trợ gõ tắt biểu tượng cảm xúc dạng `:tim` + Space $\rightarrow$ `❤️ `.

### Giai đoạn 4: Kiến Trúc Ngữ Âm Học 5 Thành Phần & Chuẩn Bỏ Dấu (Syllable Parser)
- [x] **Mô hình ngữ âm 5 thành phần (bản quyền ý tưởng Bamboo / vnchKey)**: Bóc tách cấu trúc $\text{Onset} + \text{Glide} + \text{Nucleus} + \text{Coda} + \text{Tone}$.
- [x] **Dời dấu động (Dynamic Tone Shifting)**: Gõ dấu sớm `to` + `s` $\rightarrow$ `tó` + `a` $\rightarrow$ `tóa` + `n` $\rightarrow$ `toán` (không bị kẹt thành `tóan`).
- [x] **Hoán đổi dấu phụ bảo lưu thanh điệu (Shape Modifier Swapping từ VietC / vnchKey)**:
  - Telex: `â + w` $\leftrightarrow$ `ă`, `ă + a` $\leftrightarrow$ `â` (`ấm` + `w` $\rightarrow$ `ắm`, `cân` + `w` $\rightarrow$ `căn`, `tập` + `w` $\rightarrow$ `tặp`); `ô + w` $\leftrightarrow$ `ơ`, `ơ + o` $\leftrightarrow$ `ô` (`bốn` + `w` $\rightarrow$ `bớn`, `hộp` + `w` $\rightarrow$ `hợp`).
  - VNI: `6` $\leftrightarrow$ `8` (`tấ` + `8` $\rightarrow$ `tắ`), `6` $\leftrightarrow$ `7` (`bốn` + `7` $\rightarrow$ `bớn`, `giồ` + `7` $\rightarrow$ `giờ`).
- [x] **Bảo vệ ngữ âm tự nhiên (Natural Phonological Guard)**: Ngay cả khi người dùng tắt kiểm tra chính tả, các lệnh/từ kỹ thuật (`fcitx5`, `docx4`, `linux6`, `curl7`) vẫn được bảo toàn nguyên vẹn, không bị ép dấu sai luật ngữ âm.
- [x] **Thu nạp từ trước Backspace (`adoptWordBeforeBackspace`)**: Xóa khoảng trắng sau từ cho phép nhấn phím dấu tác động ngay vào từ trước đó.
- [x] **Phân định rạch ròi 2 chuẩn bỏ dấu**:
  - **Chuẩn mới (BGDĐT)**: `hoà, hoá, thuỷ, khoẻ, thoả` (dấu trên âm chính).
  - **Chuẩn cũ (VNCH / UniKey cổ điển)**: `hòa, hóa, thủy, khỏe, thỏa` (dấu trên âm đệm).
- [x] **Bộ Test Suite Hồi quy Thực chiến (vietc-regression.test.js)**: Kiểm thử bao quát các ca hoán đổi biến âm, tổ hợp nguyên âm và bảo vệ từ ngữ kỹ thuật.

### Giai đoạn 5: Chuẩn Hóa Casing & Tối Ưu Hóa Hiệu Năng v1.1.3 (Performance & Casing Engine)
- [x] **Chuẩn hóa chữ hoa/thường theo chữ đầu (`harmonize_syllable_case`)**: Chữa lỗi kẹt Shift/CapsLock (`ĐƯợc` $\rightarrow$ `Được`, `đƯỢc` $\rightarrow$ `được`), giữ nguyên `ALL CAPS` và bảo vệ biến code `camelCase`/`PascalCase`.
- [x] **Tự động điền dấu âm tiết độc nhất (`auto_complete_unique_syllable`)**: `khong` $\rightarrow$ `không`, `truong` $\rightarrow$ `trương`, `nganh` $\rightarrow$ `ngành`, hỗ trợ đầy đủ mọi phím dấu phát sinh (`khongs`, `khongf`, `nganhj`).
- [x] **Tối ưu hóa bộ nhớ Quota & Pre-computed Cache**: Chuyển lưu trữ từ điển người dùng và cấu hình domain sang `storage.local`, cache sẵn bản stripped của từ điển giúp tìm kiếm gợi ý phản hồi tức thì dưới 1ms.
- [x] **Đồng bộ Per-Domain Memory & Nút Bật/Tắt Nhanh**: Hiển thị tên miền hiện tại kèm nút bật/tắt riêng biệt ngay trên Popup mà không cần mở Options.
- [x] **Đồng nhất thuật ngữ Chánh Tả**: Toàn bộ UI, trang Options và tài liệu được chuẩn hóa thống nhất theo thuật ngữ "chánh tả".

---

## 2. Lộ Trình Phát Triển Tương Lai (Future Roadmap)

```
        ┌────────────────────────────────────────────────────────┐
        │                 OPENVIET IME ROADMAP                   │
        └──────────────────────────┬─────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[v1.2: WASM Core]         [v1.3: Deep AI Context]      [v1.4: Cloud Sync & App]
 • Port Engine sang Rust   • N-gram Context Model       • E2E Encrypted Macro Sync
 • WebAssembly compile     • Tone Restoration           • Native App Bridge
 • Zero Garbage Collection • Spell Auto-correction      • Mobile Browser Support
```

### v1.2.0: Tối Ưu Lõi Với WebAssembly (WASM) & Rust
- [ ] **Biên dịch bộ phân tích âm tiết sang WebAssembly**: Port `syllable-parser` và `avim` sang Rust để đạt tốc độ xử lý sub-millisecond, hoàn toàn không sinh rác bộ nhớ (Zero GC Pause) trong các tác vụ gõ văn bản hàng triệu ký tự.
- [ ] **Bảng tra nén DAFSA (Deterministic Acyclic Finite State Automaton)**: Nén toàn bộ từ điển tiếng Việt 40,000 từ và từ điển địa danh thành một khối nhị phân dưới 150KB.

### v1.3.0: Ngữ Cảnh AI Sâu & Trí Tuệ Dự Đoán Kiểu Gboard (Deep Context & Prediction)
- [x] **Mô hình Trigram Context Prediction (Lấy cảm hứng từ Gboard)**: Mở rộng bộ suy luận từ Bigram ($W_{n-1} \rightarrow W_n$) lên Trigram ($W_{n-2} + W_{n-1} \rightarrow W_n$). Ví dụ phương ngữ miền Nam và văn hóa Sài Gòn xưa: `sài` + `gòn` $\rightarrow$ gợi ý `xưa`; `bá` + `cháy` $\rightarrow$ gợi ý `bù chét`; `cà` + `rịch` $\rightarrow$ gợi ý `cà tang`; `cà` + `chớn` $\rightarrow$ gợi ý `cà chác`; `mèn` + `đéc` $\rightarrow$ gợi ý `ơi`.
- [x] **Thuật toán Trọng số Kép Recency & Frequency (Exponential Decay Ranking)**: Học thói quen cá nhân theo thời gian thực kết hợp giữa tần suất gõ (Frequency) và độ mới của từ (Recency) bằng công thức suy giảm thời gian $e^{-\lambda \Delta t}$. Tránh việc từ cũ dùng nhiều trong quá khứ đè bẹp các thuật ngữ người dùng đang tập trung gõ gần đây.
- [ ] **Khôi phục dấu tự động cho văn bản không dấu**: Gõ nguyên câu không dấu (ví dụ: `toi dang o san bay`) và nhấn tổ hợp phím để AI trên trình duyệt tự động điền dấu đầy đủ (`Tôi đang ở sân bay`).

### v1.4.0: Đồng Bộ Hóa Đám Mây Mã Hóa Đầu-Cuối (Encrypted Cloud Sync)
- [ ] **Đồng bộ danh sách Macro qua Google Drive / GitHub Gist**: Cho phép xuất/nhập và đồng bộ tự động danh mục gõ tắt cá nhân hóa giữa các máy tính với cơ chế mã hóa E2E.
- [ ] **Hỗ trợ trình duyệt di động**: Đóng gói tương thích cho Kiwi Browser, Firefox Android và Safari Web Extension trên iOS/macOS.

---

## 3. Lời Khuyên Dành Cho Lập Trình Viên Mới Bắt Đầu (Beginner's Guide)

Nếu bạn là một người mới bắt đầu học lập trình hoặc muốn tìm hiểu cách một bộ gõ hoạt động trong trình duyệt web, hãy đi theo lộ trình sau:
1. Đọc tài liệu **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** để nắm toàn cảnh dòng chảy sự kiện.
2. Mở file **`src/engine/key-codes.js`** để xem cách phân loại phím và nguyên tắc đặt dấu.
3. Chạy lệnh **`npm test`** và đọc file **`test/syllable-parser.test.js`** để quan sát cách một từ tiếng Việt được bóc tách và ráp lại.
4. Nghiên cứu file **`src/content/content.js`** để học cách can thiệp vào ô nhập liệu mà không làm hỏng trạng thái React/Vue của trang web.

