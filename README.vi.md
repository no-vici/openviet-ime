# OpenViet IME - Bộ Gõ Tiếng Việt & Gõ Tắt Macro Cho Trình Duyệt

<div align="center">
    <img src="src/assets/icon128.png" alt="OpenViet IME Logo" width="128" height="128" />


[![Bộ Gõ Tiếng Việt](https://img.shields.io/badge/IME-Ti%E1%BA%BFng%20Vi%E1%BB%87t-blue?style=flat-square)](#)
[![Phương Pháp Gõ](https://img.shields.io/badge/Ki%E1%BB%83u%20G%C3%B5-T%E1%BB%B1%20%C4%90%E1%BB%99ng%20|%20Telex%20|%20VNI-indigo?style=flat-square)](#)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?style=flat-square)](#)
[![Firefox WebExtension](https://img.shields.io/badge/Firefox-WebExtension-orange?style=flat-square)](#)
[![Giấy Phép](https://img.shields.io/badge/Gi%E1%BA%A5y%20ph%C3%A9p-Apache%202.0-green?style=flat-square)](#)
[![AI-Assisted](https://img.shields.io/badge/AI%20Assisted-Google%20Gemini-8E75C2?logo=google-gemini&logoColor=white)](https://gemini.google.com)


</div>

Bộ gõ tiếng Việt hiện đại và công cụ gõ tắt Macro tốc độ cao dành cho mọi trình duyệt (Microsoft Edge, Brave, Opera, Arc, Firefox). Hoạt động hoàn hảo dưới cả hai hình thức: **Tiện ích mở rộng trình duyệt (Manifest V3)** và **Ứng dụng Web độc lập (Web App)**.

> 🇺🇸 **English Version**: [Read English documentation at README.md](./README.md)

---

## Mục Lục

1. [Điểm Nổi Bật & Tính Năng Vượt Trội](#điểm-nổi-bật--tính-năng-vượt-trội)
2. [Quy Tắc Bỏ Dấu & Kiểu Gõ](#quy-tắc-bỏ-dấu--kiểu-gõ)
   - [Chế Độ Tự Động Thích Ứng (Adaptive Auto Mode)](#chế-độ-tự-động-thích-ứng-adaptive-auto-mode)
   - [Kiểu Gõ VNI](#kiểu-gõ-vni)
   - [Kiểu Gõ Telex & Phím `z` Xóa Dấu Thanh](#kiểu-gõ-telex--phím-z-xóa-dấu-thanh)
   - [Tự Động Bỏ Qua URL, Email & Cú Pháp Code](#tự-động-bỏ-qua-url-email--cú-pháp-code)
   - [Nguyên Âm Đôi Có Móc (`ươ`)](#nguyên-âm-đôi-có-móc-ươ)
   - [Cụm Nguyên Âm `uê` (`thuế`, `huế`, `quế`) & `ưu` (`cứu`, `cừu`)](#cụm-nguyên-âm-uê-thuế-huế-quế--ưu-cứu-cừu)
   - [Chuẩn Bỏ Dấu Hiện Đại vs Cổ Điển (`hoà`/`hòa`)](#chuẩn-bỏ-dấu-hiện-đại-vs-cổ-điển-hoàhòa)
   - [Bỏ Dấu Ở Cuối Từ (Late Vowel Shaping)](#bỏ-dấu-ở-cuối-từ-late-vowel-shaping)
   - [Hoán Đổi Dấu Phụ Bảo Lưu Thanh Điệu (VietC / Bamboo)](#hoán-đổi-dấu-phụ-bảo-lưu-thanh-điệu-vietc--bamboo)
   - [Quy Tắc Ngữ Âm & Bảo Vệ Lệnh Kỹ Thuật Tự Nhiên](#quy-tắc-ngữ-âm--bảo-vệ-lệnh-kỹ-thuật-tự-nhiên)
3. [Gợi Ý Từ Thông Minh & Dự Đoán Từ Kế Tiếp Kiểu Gboard](#gợi-ý-từ-thông-minh--dự-đoán-từ-kế-tiếp-kiểu-gboard)
   - [Nguồn Dữ Liệu Từ Điển Đa Tầng](#nguồn-dữ-liệu-từ-điển-đa-tầng)
   - [Dự Đoán Từ Kế Tiếp & Tối Ưu Cho Ứng Dụng Chat](#dự-đoán-từ-kế-tiếp--tối-ưu-cho-ứng-dụng-chat)
   - [Tự Học Thói Quen Người Dùng Cục Bộ (Bảo Mật 100%)](#tự-học-thói-quen-người-dùng-cục-bộ-bảo-mật-100)
4. [Từ Điển Cá Nhân & Danh Sách Bỏ Qua Chính Tả](#từ-điển-cá-nhân--danh-sách-bỏ-qua-chính-tả)
5. [Bộ Gõ Tắt Macro (Theo Phong Cách xKey)](#bộ-gõ-tắt-macro-theo-phong-cách-xkey)
   - [Kích Hoạt Theo Ranh Giới Từ & Giữ Nguyên Kiểu Chữ](#kích-hoạt-theo-ranh-giới-từ--giữ-nguyên-kiểu-chữ)
   - [Hoàn Tác Nhanh Bằng Phím Backspace](#hoàn-tác-nhanh-bằng-phím-backspace)
6. [Kiến Trúc Kỹ Thuật (Manifest V3)](#kiến-trúc-kỹ-thuật-manifest-v3)
7. [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
   - [Cài Đặt Vào Chrome / Edge / Brave / Opera (Chromium)](#cài-đặt-vào-chrome--edge--brave--opera-chromium)
   - [Cài Đặt Vào Mozilla Firefox](#cài-đặt-vào-mozilla-firefox)
   - [Biên Dịch Từ Mã Nguồn](#biên-dịch-từ-mã-nguồn)
8. [Kiểm Thử & Đảm Bảo Chất Lượng](#kiểm-thử--đảm-bảo-chất-lượng)
9. [Triết Lý Thiết Kế: Chuẩn Hóa Unicode Hiện Đại](#triết-lý-thiết-kế-chuẩn-hóa-unicode-hiện-đại)
10. [Bản Quyền & Lời Cảm Ơn](#bản-quyền--lời-cảm-ơn)

---

## Điểm Nổi Bật & Tính Năng Vượt Trội

- **Không Phụ Thuộc Hệ Điều Hành**: Hoạt động trực tiếp trên mọi tab trình duyệt, iframe, web app (Gmail, Slack, Notion, Facebook, Telegram Web, Discord, web console, Figma...).
- **Chế Độ Tự Động (Auto) Mặc Định**: Mặc định kích hoạt chế độ **Tự động thích ứng** (gõ số theo VNI, gõ chữ theo Telex), dễ dàng chuyển đổi sang Telex, VNI hoặc Tắt chỉ với 1 click.
- **Phím `z` Xóa Dấu Thanh Chuyên Dụng**: Gõ phím `z` (Telex/Auto) hoặc phím `0` (VNI) để lập tức gỡ bỏ dấu thanh và đưa nguyên âm về dạng gốc (`toán` + `z` -> `toan`, `tiến` + `z` -> `tiên`, `được` + `z` -> `đươc`, `thuế` + `z` -> `thuê`).
- **Tự Động Bỏ Qua URL, Email & Code (`isUrlOrEmailOrCode`)**: Tự động nhận diện đường dẫn web (`https://`, `www.`, `.com`, `/path`), địa chỉ email (`user@gmail.com`) và cú pháp lập trình (`snake_case`, `kebab-case`, `object.prop`, `$var`, `#id`, thẻ HTML, `->`, `=>`, `===`), tạm ngưng biến đổi bộ gõ để giữ nguyên link và code.
- **Bỏ Dấu Chuẩn Xác Tuyệt Đối**: Đã sửa và hoàn thiện vị trí đặt dấu cho tất cả các nguyên âm đôi, ba phức tạp: `uê` (`thuế`, `huế`, `quế`, `xuề`), `uơ` (`thuở`), `ươ` (`được`), `ưu` (`cứu`, `cừu`), cùng 2 chuẩn hiện đại và cổ điển (`hoà`/`hòa`, `thuỷ`/`thủy`).
- **Tối Ưu Riêng Cho Telegram Web A & Trình Soạn Thảo Rich-Text**: Xử lý triệt để xung đột con trỏ của TipTap/ProseMirror, khởi tạo Shadow Host sớm và xác định vùng chọn `TEXT_NODE` chuẩn xác, không bao giờ bị nhảy con trỏ hay lặp vòng viết hoa đầu câu.
- **Chống Nhảy Chữ & Lặp Ký Tự Khi Gõ Nhanh**: Áp dụng kỹ thuật chặn sự kiện lan truyền tức thì (`stopImmediatePropagation`) và thay thế nguyên khối (Range-based Atomic Replacement) trên các chatbox AI và editor hiện đại (Sider.ai, StackEdit, TipTap, CodeMirror, Slate), loại bỏ hoàn toàn hiện tượng nhân đôi ký tự (`vâyậy`, `thêể`) khi gõ phím ở tốc độ cao.
- **Chuẩn Hóa Unicode NFC Tuyệt Đối & Nhất Quán Dấu Nháy**: Toàn bộ chuỗi xuất ra DOM và lưu trữ đều ở dạng dựng sẵn **NFC** chuẩn quốc tế; tích hợp hàm chuẩn hóa `canon()` tự động đồng nhất dấu nháy cong và thẳng (`’`, `‘` -> `'`), đảm bảo kiểm tra chính tả và gõ chuẩn xác 100% các địa danh như `M'Đrắk`, `Cư M'gar`, `R'lấp`.
- **Dự Đoán Từ Thân Thiện Với Chat & Dấu Câu**: Khi nhấn phím `Enter` trong Telegram, Messenger, Zalo, Slack, thanh gợi ý next-word tự ẩn ngay và nhường quyền cho phím `Enter` gửi tin nhắn tức thì; không hiển thị từ gợi ý chữ thường ngay sau dấu kết thúc câu (`. ? !`).
- **Gợi Ý Từ Thông Minh Thời Gian Thực (Auto-complete)**: Bảng menu nổi hiện đại gợi ý từ ngữ ngay khi bạn gõ các ký tự đầu tiên, hỗ trợ cả tìm kiếm không dấu (`cuu` -> `cứu hộ`, `cứu nạn`) lẫn có dấu (`cấp` -> `cấp cứu`).
- **Hỗ Trợ Toàn Diện Địa Danh Tây Nguyên & Từ Hiếm**: Tích hợp sẵn bộ âm tiết đặc thù cho các địa danh Tây Nguyên (`Đắk Lắk`, `Krông Nô`, `Krông Pắk`, `Buôn Ma Thuột`, `Pleiku`, `Chư Sê`, `Chư Păh`), địa danh có dấu nháy (`M'Đrắk`, `Ea H'leo`, `Cư M'gar`, `Ia H'Drai`, `Đắk R'lấp`), cùng các từ Hán-Việt cổ / phương ngữ (`khuếch`, `khuynh`, `ngoắt`, `nguầy`, `dzô`, `dzậy`, `zị`, `mầy`) mà không bị bộ lọc chính tả chặn.
- **Tự Học Thói Quen Người Dùng (On-Device Machine Learning)**: Tự động ghi nhớ các cặp từ bạn hay gõ (như `họp team`, `chuyển khoản`, `gửi email`, `chúc anh`) và đưa lên đầu danh sách với huy hiệu xanh **Thói quen**. Toàn bộ dữ liệu lưu trong `localStorage` máy bạn, không gửi bất kỳ byte nào ra ngoài internet.
- **Tự Động Khôi Phục Từ Tiếng Anh (GoNhanh Feature)**: Khi nhấn phím Cách (Space), tự động hoàn trả các từ tiếng Anh hay bị dính bẫy gõ nhầm (`text` thay vì `têt`, `user` thay vì `úẻ`, `push` thay vì `púh`, `window` thay vì `ưindoư`).
- **Hoàn Tác Nhanh Bằng Phím ESC (Instant ESC Revert)**: Nhấn `ESC` để đưa ngay từ đang gõ dở dang về lại chuỗi phím thô ban đầu mà không cần bấm xóa lùi từng ký tự.
- **Quy Tắc Chính Tả Chặt Chẽ**: Kiểm tra chính tả tiếng Việt (`c/k`, `g/gh`, `ng/ngh` để bảo vệ từ tiếng Anh như `center`, `city`, `get`) và kiểm soát âm khép (`-c, -ch, -p, -t` chỉ nhận dấu Sắc hoặc Nặng).
- **Bộ Gõ Tắt Macro Cực Nhanh (Kiểu xKey)**: Thay thế từ viết tắt tức thì (`vn` -> `Việt Nam`, `dc` -> `được`, `tv` -> `Tiếng Việt`) với khả năng chuyển hoa/thường tự động và xóa lùi để hoàn tác (Backspace Undo).
- **Phím Tắt Toàn Cục & Chuyển Nhanh Bằng Double-Ctrl**: Bấm đúp phím `Ctrl` nhanh (< 400ms) để Bật/Tắt bộ gõ tức thì trên mọi trang web kèm thông báo nổi HUD, hoặc dùng phím tắt `Ctrl+Shift+Z` (`Cmd+Shift+Z` trên macOS).
- **Giao Diện Shadow DOM Cách Ly**: Thanh hiển thị trạng thái và gợi ý được đóng gói trong Shadow DOM, hoàn toàn không bị ảnh hưởng bởi CSS của trang web đang mở.

---

## Quy Tắc Bỏ Dấu & Kiểu Gõ

### Chế Độ Tự Động Thích Ứng (Adaptive Auto Mode)

Chế độ Tự Động kết hợp linh hoạt cả Telex lẫn VNI: các phím số (`1-9`, `0`) sẽ kích hoạt dấu theo chuẩn VNI, trong khi các phím chữ (`s, f, r, x, j, w, aa, ee, oo, dd, z`) kích hoạt dấu theo chuẩn Telex. Người dùng có thể gõ tự nhiên theo bất kỳ thói quen nào mà không cần phải vào cài đặt đổi kiểu gõ.

### Kiểu Gõ VNI

VNI sử dụng các phím số từ `1` đến `9` và `0` để bỏ dấu hoặc xóa dấu:

| Phím Số | Tác Dụng | Tên Dấu | Ví Dụ Phím Gõ | Kết Quả Xuất Ra |
| :---: | :--- | :--- | :--- | :--- |
| **`1`** | Dấu Sắc (Acute) | Sắc | `a1`, `e1`, `o1` | `á`, `é`, `ó` |
| **`2`** | Dấu Huyền (Grave) | Huyền | `a2`, `e2`, `u2` | `à`, `è`, `ù` |
| **`3`** | Dấu Hỏi (Hook) | Hỏi | `a3`, `o3`, `i3` | `ả`, `ỏ`, `ỉ` |
| **`4`** | Dấu Ngã (Tilde) | Ngã | `a4`, `e4`, `o4` | `ã`, `ẽ`, `õ` |
| **`5`** | Dấu Nặng (Dot) | Nặng | `a5`, `o5`, `u5` | `ạ`, `ọ`, `ụ` |
| **`6`** | Dấu Mũ (Circumflex) | Mũ | `a6`, `e6`, `o6` | `â`, `ê`, `ô` |
| **`7`** | Dấu Móc (Horn) | Móc | `o7`, `u7`, `uo7` | `ơ`, `ư`, `ươ` |
| **`8`** | Dấu Trăng (Breve) | Trăng | `a8` | `ă` |
| **`9`** | Dấu Gạch Ngang (Bar) | Chữ Đ | `d9`, `D9` | `đ`, `Đ` |
| **`0`** | Xóa dấu thanh | Xóa dấu | `toán0`, `thuế0` | `toan`, `thuê` |

Khi gõ lại cùng một phím số dấu một lần nữa, bộ gõ sẽ gỡ dấu và xuất ra chữ số nguyên bản (ví dụ: `icon` + `6` -> `icôn` + `6` -> `icon6` + `4` -> `icon64`).

### Kiểu Gõ Telex & Phím `z` Xóa Dấu Thanh

Telex sử dụng các phím chữ lặp và các ký tự quy ước (`w`, `s`, `f`, `r`, `x`, `j`, `z`):

| Ký Tự | Tác Dụng | Ví Dụ Phím Gõ | Kết Quả Xuất Ra |
| :---: | :--- | :--- | :--- |
| **`s`** | Dấu Sắc | `as`, `es`, `os` | `á`, `é`, `ó` |
| **`f`** | Dấu Huyền | `af`, `ef`, `uf` | `à`, `è`, `ù` |
| **`r`** | Dấu Hỏi | `ar`, `or`, `ir` | `ả`, `ỏ`, `ỉ` |
| **`x`** | Dấu Ngã | `ax`, `ex`, `ox` | `ã`, `ẽ`, `õ` |
| **`j`** | Dấu Nặng | `aj`, `oj`, `uj` | `ạ`, `ọ`, `ụ` |
| **`aa` / `ee` / `oo`** | Dấu Mũ (`â`, `ê`, `ô`) | `aa`, `ee`, `oo` | `â`, `ê`, `ô` |
| **`w`** | Dấu Móc / Trăng | `aw` -> `ă`, `ow` -> `ơ`, `uw` -> `ư`, `uow` -> `ươ` | `ă`, `ơ`, `ư`, `ươ` |
| **`dd`** | Chữ Đ (`đ`) | `dd`, `Dd` | `đ`, `Đ` |
| **`z`** | Xóa dấu thanh | `toán` + `z` -> `toan`, `tiến` + `z` -> `tiên`, `được` + `z` -> `đươc` | Xóa sạch dấu thanh, giữ nguyên dấu mũ/móc |

- Nếu từ đang có dấu thanh, gõ `z` (Telex) hoặc `0` (VNI) sẽ xóa sạch dấu thanh về nguyên âm cơ sở.
- Nếu từ chưa có dấu thanh (ví dụ `toan`), gõ `z` sẽ xuất ra chữ `z` bình thường (`toanz`).

---

### Tự Động Bỏ Qua URL, Email & Cú Pháp Code

Khi gõ đường link, email hoặc viết code, các bộ gõ truyền thống thường xuyên bỏ nhầm dấu tiếng Việt làm hỏng nội dung (ví dụ: gõ `search` thành `seảch`, `user_name` thành `úer_name`).

OpenViet IME tích hợp cơ chế bảo vệ thông minh (`isUrlOrEmailOrCode`) tự động nhận dạng:
- **Đường dẫn Web (URLs)**: Nhận diện `http://`, `https://`, `www.`, `localhost`, `.com`, `.vn`, `.org`, `.net`, `.io`, `.dev`, `.ai` và đường dẫn `/path/to/api`.
- **Địa chỉ Email**: Nhận diện ký tự `@` trong từ (`contact@company.vn`, `user@gmail.com`).
- **Cú pháp Code**: Nhận diện `snake_case` có `_`, `kebab-case` có `-`, thuộc tính object có dấu chấm (`console.log`, `user.name`), biến (`$var`, `#id`), thẻ HTML (`<div`, `</span`) và toán tử (`->`, `=>`, `===`).

Khi phát hiện ngữ cảnh này, bộ gõ sẽ tự động tạm ngưng can thiệp để code và link luôn nguyên vẹn 100%.

---

### Nguyên Âm Đôi Có Móc (`ươ`)

Trong các từ như `được`, `nước`, `bước`, `trước`, `thương`, cụm nguyên âm `uo` cần nhận dấu móc trên **cả hai chữ cái** (`u` -> `ư`, `o` -> `ơ`) để tạo thành `ươ`.

- **Thao tác VNI**:
  - Gõ `duoc` rồi nhấn `9` đổi `d` thành `đ` -> `đuoc`.
  - Nhấn `7` tạo móc đôi cho cả `u` và `o` -> `đươc`.
  - Nhấn `5` thêm dấu nặng vào âm chính `ơ` -> `được`.
  - Nhập theo thứ tự `duoc975` hay `duoc759` đều cho ra kết quả chuẩn **`được`**.
- **Thao tác Telex**:
  - Gõ `duoc` rồi nhấn `w` chuyển `uo` -> `ươ` -> `đươc`.
  - Nhấn thêm `j` đặt dấu nặng -> **`được`**.

---

### Cụm Nguyên Âm `uê` (`thuế`, `huế`, `quế`) & `ưu` (`cứu`, `cừu`)

1. **Cụm `uê`**:
   - Theo ngữ âm học tiếng Việt, `u` là âm đệm và `ê` là âm chính mang trọng âm.
   - Dấu thanh bắt buộc phải rơi vào `ê`:
     - `thue61` hoặc `thue16` -> **`thuế`** (tuyệt đối không bị lỗi `thúê`).
     - `hue61` -> **`huế`**.
     - `que61` -> **`quế`**.
     - `xue62` -> **`xuề`**.
2. **Cụm `ưu`**:
   - Khi gõ `uu` kèm phím móc:
     - `cuu` + `7` (VNI) hoặc `w` (Telex) tạo thành **`cưu`** (dấu móc nằm ở chữ `u` đầu tiên).
     - Thêm dấu sắc (`1` hoặc `s`) cho ra **`cứu`** (`cuu71` -> `cứu`).
     - `cuu72` -> **`cừu`**, `cuu75` -> **`cựu`**, `luu7` -> **`lưu`**, `uu7` -> **`ưu`**.
     - Gõ lại `7` hoặc `w` một lần nữa sẽ hoàn về `uu` nguyên bản.

---

### Chuẩn Bỏ Dấu Hiện Đại vs Cổ Điển (`hoà`/`hòa`)

Tùy chỉnh linh hoạt trong trang cài đặt:

1. **Chuẩn Hiện Đại (Mặc định)**:
   - Với các nguyên âm đôi mở không có phụ âm cuối (`oa`, `oe`, `uy`), dấu thanh được đặt trên nguyên âm chính (nguyên âm thứ hai):
     - `hoà`, `hoè`, `thuỷ`, `khoẻ`, `thoả`, `hoá`.
2. **Chuẩn Cổ Điển**:
   - Dấu thanh được đặt trên âm đệm (nguyên âm thứ nhất):
     - `hòa`, `hòe`, `thủy`, `khỏe`, `thỏa`, `hóa`.

Khi có phụ âm cuối (như `toán`, `hoàn`, `quýt`), cả hai chuẩn đều đồng nhất đặt dấu lên nguyên âm chính trước phụ âm cuối.

---

### Bỏ Dấu Ở Cuối Từ (Late Vowel Shaping)

Hỗ trợ thói quen gõ xong cả từ rồi mới thêm dấu mũ:
- Gõ `chong` + `o` -> **`chông`**.
- Gõ `kieu` + `e` -> **`kiêu`**.
- Gõ `bien` + `e` -> **`biên`**.
- Gõ `hang` + `a` -> **`hâng`**.
- Gõ `dem` + `e` -> **`đêm`**.
- Nếu từ đã có dấu thanh (ví dụ: `chóng` + `o`), dấu thanh sẽ tự động di chuyển mượt mà sang nguyên âm có mũ: `chóng` + `o` -> **`chống`**.
- **Gõ lại để hoàn tác**: Gõ lại phím mũ một lần nữa sẽ chuyển về ký tự thô: `chông` + `o` -> **`chongo`**, `kiêu` + `e` -> **`kieue`**.

---

### Hoán Đổi Dấu Phụ Bảo Lưu Thanh Điệu (VietC / Bamboo)

Học hỏi từ tinh hoa kỹ thuật của VietC và Bamboo, OpenViet IME hỗ trợ tính năng **hoán đổi linh hoạt dấu phụ nguyên âm (`â ↔ ă`, `ô ơ`) mà vẫn giữ nguyên trọn vẹn dấu thanh hiện tại**. Người dùng khi gõ phím ở tốc độ cao nếu lỡ tay bấm nhầm dấu mũ thay vì trăng/móc (hoặc ngược lại) có thể sửa ngay lập tức mà không sợ bị rớt hoặc mất dấu thanh:

- **Kiểu Telex**:
  - `â + w` $\rightarrow$ `ă` (ví dụ: `ấm` + `w` $\rightarrow$ `ắm`, `cân` + `w` $\rightarrow$ `căn`, `tập` + `w` $\rightarrow$ `tặp`).
  - `ă + a` $\rightarrow$ `â` (ví dụ: `ắm` + `a` $\rightarrow$ `ấm`, `căn` + `a` $\rightarrow$ `cân`, `tặp` + `a` $\rightarrow$ `tập`).
  - `ô + w` $\rightarrow$ `ơ` (ví dụ: `bốn` + `w` $\rightarrow$ `bớn`, `hộp` + `w` $\rightarrow$ `hợp`, `cột` + `w` $\rightarrow$ `cợt`).
  - `ơ + o` $\rightarrow$ `ô` (ví dụ: `bớn` + `o` $\rightarrow$ `bốn`, `hợp` + `o` $\rightarrow$ `hộp`, `cợt` + `o` $\rightarrow$ `cột`).
  - Các tổ hợp kép như `aaw` tự động cho ra `ă`, `oow` cho ra `ơ`.
- **Kiểu VNI**:
  - Phím `8` (trăng) trên `â` $\rightarrow$ `ă` (ví dụ: `tấ` + `8` $\rightarrow$ `tắ`).
  - Phím `6` (mũ) trên `ă` $\rightarrow$ `â` (ví dụ: `tắ` + `6` $\rightarrow$ `tấ`).
  - Phím `7` (móc) trên `ô` $\rightarrow$ `ơ` (ví dụ: `bốn` + `7` $\rightarrow$ `bớn`, `giồ` + `7` $\rightarrow$ `giờ`).
  - Phím `6` (mũ) trên `ơ` $\rightarrow$ `ô` (ví dụ: `bớn` + `6` $\rightarrow$ `bốn`, `giờ` + `6` $\rightarrow$ `giồ`).

---

### Quy Tắc Ngữ Âm & Bảo Vệ Lệnh Kỹ Thuật Tự Nhiên

- **Âm Khép Phụ Âm Cuối (`-c, -ch, -p, -t`)**: Những âm tiết kết thúc bằng phụ âm tắc (`c`, `ch`, `p`, `t`) **chỉ có thể nhận Thanh 1 (Sắc) hoặc Thanh 5 (Nặng)**. Tuyệt đối không nhận thanh Huyền, Hỏi, Ngã (`bac` + `s` -> `bác`, nhưng `bac` + `f` -> `bacf` không bị biến thành `bàc`).
- **Quy tắc `c/k`, `g/gh`, `ng/ngh`**: Các nguyên âm trước (`e, ê, i, y`) không đi cùng `c`, `g`, `ng`. Các từ tiếng Anh như `center`, `city`, `get` được giữ nguyên vẹn mà không bị đổi dấu sai.
- **Lớp Bảo Vệ Ngữ Âm Tự Nhiên (Bảo Vệ Lệnh CLI & Từ Kỹ Thuật)**: Ngay cả khi người dùng **tắt tính năng kiểm tra chính tả**, Syllable Parser của OpenViet IME vẫn luôn thực thi luật cấu trúc âm tiết tự nhiên (bảo vệ các phụ âm cuối lạ ngoại ngữ như `-tx`, `-cx`, `-rl`, `-sh`,...). Nhờ đó, các câu lệnh shell, tên file, thư viện lập trình (như `fcitx5`, `docx4`, `linux6`) **hoàn toàn không bị biến dạng** (ví dụ `fcitx5` được giữ nguyên vẹn thay vì bị biến thành `fcịtx`).

---

## Gợi Ý Từ Thông Minh & Dự Đoán Từ Kế Tiếp Kiểu Gboard

### Nguồn Dữ Liệu Từ Điển Đa Tầng
Bộ gõ tích hợp 4 tầng dữ liệu từ điển:
1. **Từ Ghép Tiếng Việt & Địa Danh Chọn Lọc (`COMMON_VIETNAMESE_COMPOUNDS`)**: Hơn 200+ cụm từ ghép thông dụng trong công việc, học tập, hành chính, cùng hệ thống địa danh các tỉnh thành khắp cả nước (Hà Nội, Sài Gòn, Đà Nẵng, Cần Thơ, Hải Phòng,...) và trọn bộ địa danh Tây Nguyên (Đắk Lắk, Buôn Ma Thuột, Krông Nô, Pleiku, Cư M'gar, Ea H'leo, M'Đrắk,...).
2. **Kho Âm Tiết Tiếng Việt Chuẩn & Mở Rộng (`vietnamese-words.js`)**: ~6.700 âm tiết chuẩn mực từ từ điển Hunspell tiếng Việt kết hợp cùng bộ âm tiết địa danh Tây Nguyên, từ tượng thanh, phương ngữ và từ cổ (`pắk`, `búk`, `păh`, `prông`, `krông`, `đrắk`, `nguầy`, `nguậy`, `dzô`, `dzậy`, `zị`, `mầy`).
3. **Từ Điển Riêng Của Bạn (`userDictionary`)**: Các từ thuật ngữ, tên riêng được bạn thêm vào và ưu tiên hàng đầu.
4. **Thuật Ngữ Công Nghệ & Tiếng Anh (`COMMON_ENGLISH_WORDS`)**: Các từ phổ biến như `React`, `TypeScript`, `Docker`, `GitHub`, `API`.

### Dự Đoán Từ Kế Tiếp & Tối Ưu Cho Ứng Dụng Chat
Khi bạn vừa gõ xong một từ, thanh gợi ý ribbon sẽ đưa ra các từ tiếp theo có khả năng xuất hiện cao nhất:
- `Đắk ` -> `[ Lắk ]`, `[ Nông ]`, `[ Mil ]`, `[ Song ]`.
- `Buôn ` -> `[ Ma Thuột ]`, `[ Mê Thuột ]`.
- `Krông ` -> `[ Nô ]`, `[ Búk ]`, `[ Pắk ]`, `[ Ana ]`.
- `Việt ` -> `[ Nam ]`, `[ Trì ]`, `[ dã ]`, `[ kiều ]`.
- `công ` -> `[ nghệ ]`, `[ ty ]`, `[ việc ]`, `[ nhân ]`.
- `chúc ` -> `[ mừng ]`, `[ bạn ]`, `[ anh ]`, `[ em ]`.
- `nghiên ` -> `[ cứu ]`, `[ cứu sinh ]`.

**Quy Tắc Thân Thiện Với Ứng Dụng Chat & Dấu Câu**:
- **Không chiếm phím Enter**: Khi chat trong Telegram, Messenger, Zalo, Slack, việc bấm `Enter` để gửi tin nhắn sẽ **không bao giờ** bị chen ngang bởi từ gợi ý next-word. Thanh gợi ý tự ẩn ngay và tin nhắn được gửi đi tức thì.
- **Tôn trọng dấu kết thúc câu**: Sau các dấu chấm câu (`. ? !`) hoặc dấu cách sau dấu chấm câu, bộ gõ sẽ không gợi ý các từ kế tiếp ở dạng chữ thường để tránh làm phiền mắt ở đầu câu mới.

### Tự Học Thói Quen Người Dùng Cục Bộ (Bảo Mật 100%)
- Khi bạn gõ các cặp từ liên tiếp (như `họp team`, `chuyển khoản`, `gửi email`), mô hình bigram trên máy bạn sẽ tự động tăng tần suất xuất hiện.
- Các cặp từ hay dùng nhất sẽ được đưa lên vị trí số 1 kèm huy hiệu xanh **Thói quen**.
- Toàn bộ dữ liệu được lưu cục bộ trong `localStorage` / `sync storage` của trình duyệt, không có telemetry, không gửi dữ liệu ra mạng internet.
- **Xuất & Nhập Thói Quen (Backup & Portable)**: Hỗ trợ xuất (`Export JSON`, `Export CSV`) và nhập (`Import`) trực tiếp từ tab *"Gợi Ý & Thói Quen"* trong trang Cài Đặt. Bạn có thể dễ dàng chuyển toàn bộ dữ liệu thói quen gõ từ máy này sang máy khác mà không cần phải gõ lại từ đầu, đồng thời hỗ trợ chế độ Gộp thông minh (Merge) hoặc Ghi đè.

---

## Từ Điển Cá Nhân & Danh Sách Bỏ Qua Chính Tả

- Truy cập dễ dàng từ trang Cài đặt Tùy chọn (`/options.html`).
- Cho phép thêm, tìm kiếm và xóa các từ ngữ chuyên ngành, tên riêng tiếng nước ngoài hoặc mã sản phẩm.
- Các từ trong danh sách này sẽ được bỏ qua kiểm tra chính tả và được ưu tiên cao nhất trong bảng gợi ý auto-complete.
- Hỗ trợ xuất/nhập hàng loạt bằng file `.txt` hoặc `.json`.

---

## Bộ Gõ Tắt Macro (Theo Phong Cách xKey)

### Kích Hoạt Theo Ranh Giới Từ & Giữ Nguyên Kiểu Chữ
Từ viết tắt sẽ tự động mở rộng khi bạn gõ kèm một ký tự phân cách từ (`Dấu cách`, `Enter`, `,`, `.`, `;`, `:`, `!`, `?`):

1. **Chữ thường**: `vn ` -> `Việt Nam `
2. **Chữ hoa đầu từ**: `Vn ` -> `Việt Nam `
3. **Chữ in hoa toàn bộ**: `VN ` -> `VIỆT NAM `

Các từ viết tắt mặc định sẵn có:
- `vn` -> `Việt Nam`, `hn` -> `Hà Nội`, `sg` -> `Sài Gòn`
- `dc` -> `được`, `ko` -> `không`, `k` -> `không`, `ntn` -> `như thế nào`, `vs` -> `với`
- `tv` -> `Tiếng Việt`, `zia` -> `dzìa`, `zi` -> `dzí`, `zo` -> `dzô`
- `ck` -> `chồng`, `cx` -> `cũng`, `idk` -> `tao hông biết`

### Hoàn Tác Nhanh Bằng Phím Backspace
Nếu bạn không muốn mở rộng từ viết tắt, nhấn **Backspace ngay lập tức** sẽ phục hồi lại cụm ký tự tắt ban đầu:
```
Bạn gõ:     "vn "
Mở rộng ra: "Việt Nam "
Bấm [⌫]:    "vn"
```

---

## Kiến Trúc Kỹ Thuật (Manifest V3)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Kiến Trúc OpenViet IME                          │
├────────────────────────────────────────────────────────────────────────┤
│                     Extension Trình Duyệt (MV3)                        │
│  - Service Worker / Background Script (Đồng bộ cấu hình & phím tắt)    │
│  - Content Script (Bắt sự kiện gõ phím & kích hoạt bộ gõ tiếng Việt)   │
│  - Thanh HUD & Ribbon Gợi Ý (Giao diện nổi cách ly qua Shadow DOM)     │
│  - Giao diện Popup Cài Đặt & Trang Tùy Chọn Options                    │
│  - Đa nền tảng (Chrome MV3 / Firefox WebExtensions / Edge Chromium)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   src/engine/                          │
       │  ├─ avim.js       (Xử lý logic VNI, Telex, bỏ dấu)     │
       │  ├─ macro.js      (Động cơ mở rộng gõ tắt xKey)        │
       │  ├─ key-codes.js  (Bảng mã Unicode & bộ lọc URL/Code)  │
       │  ├─ autocomplete.js (Động cơ gợi ý từ ngữ & Gboard)    │
       │  ├─ dictionary.js (Từ điển cá nhân & quy tắc ngữ âm)   │
       │  └─ vietnamese-words.js (Bộ từ vựng 6.7k âm tiết)      │
       └────────────────────────────────────────────────────────┘
```

---

## Hướng Dẫn Cài Đặt

Bạn có thể tải gói cài đặt sẵn từ mục GitHub Releases hoặc tự đóng gói từ mã nguồn.

### Cài Đặt Vào Trình Duyệt Chromium (Chrome, Edge, Brave, Opera, Arc)

1. Tải về hoặc tự tạo file đóng gói extension (`openviet_ime-chrome-1.1.0.zip` hoặc `openviet_ime-edge-1.1.0.zip`).
2. Giải nén file `.zip` vào một thư mục (hoặc dùng trực tiếp thư mục repo sau khi chạy lệnh `npm run build:chrome`).
3. Mở trang quản lý tiện ích trên trình duyệt:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera: `opera://extensions`
4. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
5. Nhấn nút **Tải tiện ích đã giải nén (Load unpacked)** và chọn thư mục chứa file `manifest.json`.
6. Biểu tượng OpenViet IME sẽ xuất hiện trên thanh công cụ của bạn với huy hiệu **`AUTO`**.

### Cài Đặt Vào Mozilla Firefox

1. Biên dịch hoặc tải về file zip Firefox (`npm run build:firefox`).
2. Nhập `about:debugging#/runtime/this-firefox` vào thanh địa chỉ của Firefox.
3. Nhấn nút **Tải tiện ích tạm thời (Load Temporary Add-on...)**.
4. Chọn file `manifest.json` trong thư mục tiện ích (hoặc chọn trực tiếp file `.zip` vừa build).
5. OpenViet IME sẽ kích hoạt đầy đủ với quyền lưu trữ WebExtension và chạy trên mọi trang web.

### Biên Dịch & Đóng Gói Từ Mã Nguồn

#### 1. Cài đặt thư viện phụ thuộc
```bash
npm install
```

#### 2. Biên dịch theo từng trình duyệt cụ thể
Các lệnh này sẽ bundle script bằng `esbuild` và tự động áp dụng `manifest.json` chuẩn hóa riêng biệt cho từng trình duyệt:

```bash
# Dành cho Google Chrome, Brave, Opera, Arc
npm run build:chrome

# Dành cho Mozilla Firefox
npm run build:firefox

# Dành cho Microsoft Edge
npm run build:edge
```

#### 3. Đóng gói thành file `.zip` phát hành
Để tạo các gói cài đặt `.zip` hoàn chỉnh (lưu tại thư mục `web-ext-artifacts/`):

```bash
# Đóng gói cho Chrome -> web-ext-artifacts/openviet_ime-chrome-1.1.0.zip
npm run bundle:chrome

# Đóng gói cho Firefox -> web-ext-artifacts/openviet_ime-firefox-1.1.0.zip

# Đóng gói cho Edge -> web-ext-artifacts/openviet_ime-edge-1.1.0.zip
```

#### 4. Chế độ lập trình (Development)
```bash
# Tự động build lại extension khi code thay đổi (watch mode)
npm run dev:extension

# Chạy web playground thử nghiệm với Vite
npm run dev
```

---

## Kiểm Thử & Đảm Bảo Chất Lượng

Chạy bộ kiểm thử tự động toàn diện bao gồm các phép biến đổi dấu thanh, phím `z` xóa dấu, bộ lọc URL/Email/Code, mở rộng macro và xếp hạng gợi ý Gboard:

```bash
npm test
```

Kiểm tra cú pháp TypeScript:

```bash
npm run lint
```

---

## Triết Lý Thiết Kế: Chuẩn Hóa Unicode Hiện Đại

OpenViet IME được phát triển hoàn toàn cho kỷ nguyên web hiện đại. Chúng tôi **chủ động không tích hợp** các bộ chuyển đổi mã nguồn cũ kỹ từ thập niên 1990/2000 (như TCVN3 / ABC, VNI-Windows, BK HCM 1/2). Ngày nay hơn 99.9% trang web và ứng dụng máy tính đều chạy chuẩn xác trên nền UTF-8 Unicode. Việc loại bỏ các bộ chuyển mã lỗi thời giúp mã nguồn luôn gọn gàng, tăng tốc độ xử lý, giảm thiểu lỗ hổng bảo mật và tập trung toàn diện vào trải nghiệm gõ phím tiếng Việt nhanh, mượt mà và chuẩn xác nhất.

---

## Bản Quyền & Lời Cảm Ơn

### Giấy Phép
Phát hành theo [Giấy phép Apache, Phiên bản 2.0](LICENSE).

### Tri Ân & Đóng Góp Cộng Đồng
OpenViet IME kế thừa và phát triển dựa trên những đóng góp, ý tưởng thuật toán và mã nguồn mở quý báu của cộng đồng phát triển bộ gõ tiếng Việt:
- **AVIM**: Khởi xướng bởi **Đặng Minh Tuấn** (phiên bản JavaScript đầu tiên bởi **Nguyễn Kim Kha**).
- **xKey**: Phát triển bởi **xmannv** (Võ Văn Mann) — nguồn cảm hứng cho cơ chế mở rộng macro và gõ tắt phụ âm nhanh.
- **GoNhanh**: Phát triển bởi **Kha Phan** — nguồn cảm hứng cho tính năng hoàn tác tức thì bằng phím ESC và tự động khôi phục từ tiếng Anh.
- **IBus-Bamboo / Bamboo Engine**: Phát triển bởi **Lượng Thanh Lâm** (`luongthanhlam` / BambooEngine) — cấu trúc ngữ âm học 5 thành phần (âm đầu, âm đệm, âm chính, âm cuối, dấu thanh) và cơ chế dời dấu động.
- **fcitx5-vmk**: Phát triển bởi **Võ Ngô Hoàng Thành** (`thanhpy2009`) — bài học kinh nghiệm xử lý văn bản non-preedit mượt mà trên môi trường hiện đại.
- **Funput**: Phát triển bởi **P-Code Dynamics** (`@pcodedynamics`) — triết lý thiết kế bộ gõ tiếng Việt đa nền tảng, gọn nhẹ và bảo mật.

Biểu tượng và đồ họa được thiết kế theo phong cách bàn phím hiện đại, trung tính và phù hợp sử dụng trên mọi nền tảng.
