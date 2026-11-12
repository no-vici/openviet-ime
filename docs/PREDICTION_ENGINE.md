# Next-Word Prediction & Gboard-Style Habit Learning Architecture

Tài liệu này ghi lại chi tiết thiết kế kỹ thuật, cơ sở toán học và cơ chế vận hành của hệ thống **Dự đoán từ tiếp theo (Next-Word Prediction)** và **Học thói quen trên thiết bị (On-Device Habit Model)** của OpenViet IME.

---

## 1. Ba Nguyên Lý Cốt Lõi (Core Engineering Principles)

Vì chạy trực tiếp bên trong `Content Script` của WebExtension (môi trường chia sẻ tài nguyên với trang web của người dùng), hệ thống được xây dựng dựa trên 3 nguyên tắc bất di bất dịch:

1. **Zero-Latency ($<1\text{ms}$ Response Time)**:
   - Toàn bộ cơ sở dữ liệu gợi ý cơ sở được cấu trúc dưới dạng **Bảng băm phẳng (Flattened Key-to-Array Hash Map)**.
   - Truy xuất với độ phức tạp thuật toán lý tưởng $\mathcal{O}(1)$.
   - Không sử dụng cây tìm kiếm lồng nhau hay tính toán ma trận nặng nề trong luồng chính của DOM.

2. **Memory Efficiency (Bộ nhớ siêu gọn)**:
   - Các từ ứng viên trong từng mục đều được lọc trước và giới hạn tối đa **3 đến 4 từ** có tần suất xuất hiện cao nhất.
   - Kích thước toàn bộ bundle dự đoán được nén gọn, giữ mức tiêu thụ RAM của extension dưới $15\text{MB}$.

3. **Linguistic Hierarchy (Mô hình phân tầng ngữ cảnh 4 cấp)**:
   - Ngữ cảnh cá nhân hóa và thói quen gần nhất luôn luôn có mức ưu tiên cao hơn từ điển tĩnh chuẩn.

---

## 2. Mô Hình Ngữ Cảnh 4 Tầng (Four-Tier Context Model)

Mỗi khi người dùng hoàn thành một từ và nhấn phím ngắt từ (khoảng trắng / space), hàm `getNextWordSuggestions(previousWord, limit, priorWord)` thực hiện truy xuất theo thứ bậc phân tầng nghiêm ngặt:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG 1: Trigram Inference                       │
│              Ngữ cảnh 3 từ liên tiếp: W_(n-2) + W_(n-1) -> W_n         │
│   • 1a. User-Learned Trigrams (Thói quen 3 từ cá nhân học tự động)     │
│   • 1b. Curated Trigrams (Cụm từ dân gian, thành ngữ Sài Gòn xưa)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Nếu chưa đủ limit)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG 2: User-Learned Bigrams                    │
│                 Thói quen 2 từ gần nhất của người dùng                 │
│   • Xếp hạng bằng công thức Recency & Frequency Decay                  │
│   • Khóa trọng số bảo vệ miền kỹ thuật (Domain-Isolation Weight Lock)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Nếu chưa đủ limit)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG 3: Curated Base Bigrams                    │
│    Từ điển Bigram tĩnh tích hợp sẵn (650+ gốc từ thông dụng nhất)      │
│   • Địa danh hành chính, Tây Nguyên (Đắk Lắk, Krông Nô, Buôn Ma Thuột) │
│   • Từ ngữ giao tiếp, công sở, văn phòng, y tế                         │
│   • Developer & DevOps CLI Whitelist (git, docker, npm, kubectl,...)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Nếu chưa đủ limit)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG 4: Compound Phrases Index                  │
│   Trích xuất từ các từ ghép tiếng Việt chuẩn (COMMON_COMPOUNDS)        │
│   Ví dụ: W_(n-1) = "công" -> gợi ý phần còn lại: "nghệ", "ty", "việc"  │
└────────────────────────────────────────────────────────────────────────┘
```

Mỗi kết quả được gom lại, khử trùng lặp qua `Set` và chốt chặn ở mức tối đa **4 từ ứng viên** hiển thị trên thanh ribbon nổi (Gboard style).

---

## 3. Cơ Chế Domain-Isolation Weight Lock (Khóa Trọng Số Miền Kỹ Thuật)

### 3.1. Bài toán thực tế
Khi lập trình viên gõ các câu lệnh CLI hoặc mã nguồn (ví dụ `git push`, `docker run`), các cặp từ này được lưu vào Tầng 2. Tuy nhiên, khi chuyển sang nhắn tin hoặc viết văn bản tiếng Việt thông thường (với số lượng từ lớn gấp hàng chục lần), thuật toán suy hao thời gian (Exponential Decay) sẽ làm điểm số của các từ lập trình bị tụt dốc, dẫn đến việc các lệnh kỹ thuật bị từ hội thoại thường ngày lấn át.

### 3.2. Công thức toán học có bảo vệ miền

$$\text{Score}(entry) = \text{Count} \times e^{-\lambda \cdot \Delta t_{\text{hours}}} + \text{Bonus}_{\text{dev}}$$

- **Với từ hội thoại tiếng Việt thông thường**:
  - $\lambda = 0.002$ / giờ (chu kỳ bán rã $\approx 14$ ngày).
  - $\text{Bonus}_{\text{dev}} = 0$.
  - Sau 30 ngày không dùng, một từ gõ 10 lần sẽ suy hao tự nhiên từ $10.0$ điểm xuống còn **$\approx 2.37$ điểm**.

- **Với từ khóa kỹ thuật (Developer Whitelist Tokens)**:
  - Khi từ khóa đứng trước $W_{\text{prev}} \in \text{DEVELOPER\_WHITELIST\_BIGRAMS}$ (`git`, `docker`, `npm`, `kubectl`, `python`, `supabase`,...):
  - $\lambda_{\text{dev}} = 0.0001$ / giờ (**Frozen Decay** - suy hao siêu chậm, hầu như bằng 0).
  - $\text{Bonus}_{\text{dev}} = +5.0$ (**Base Anchor Boost** - điểm neo sàn cố định).
  - Sau 30 ngày, lệnh kỹ thuật vẫn duy trì vững vàng ở mức **$\approx 14.3$ điểm**, giữ vững vị trí ứng viên số 1 bất chấp hàng ngàn tin nhắn hội thoại hàng ngày.

```javascript
// Trích xuất logic từ src/engine/autocomplete.js
calculateRecencyFrequencyScore(entry, now = Date.now(), isDevDomain = false) {
  if (!entry) return 0;
  if (typeof entry === 'number') {
    return isDevDomain ? entry + 5 : entry;
  }
  const count = entry.count || 1;
  const lastUsed = entry.lastUsed || now;
  const hoursElapsed = Math.max(0, (now - lastUsed) / (1000 * 60 * 60));

  const lambda = isDevDomain ? 0.0001 : 0.002;
  const decay = Math.exp(-lambda * hoursElapsed);
  const score = count * decay;

  return isDevDomain ? score + 5.0 : score;
}
```

---

## 4. Danh Mục Developer & DevOps Bigram Whitelist

Cơ sở dữ liệu lệnh kỹ thuật được tổ chức module hóa trong `DEVELOPER_WHITELIST_BIGRAMS` và trộn nguyên tử qua hàm `injectDeveloperBigrams`:

| Nhóm danh mục | Các từ khóa gốc ($W_{\text{prev}}$) | Danh sách dự đoán tiếp theo ($W_{\text{next}}$) |
| :--- | :--- | :--- |
| **Version Control** | `git`, `pull`, `merge` | `push`, `commit`, `pull`, `status`, `checkout`, `branch`, `rebase`, `clone`, `fetch`, `stash`, `request`, `conflict` |
| **Containers & Cloud** | `docker`, `kubectl`, `aws` | `run`, `compose`, `build`, `ps`, `exec`, `logs`, `get`, `describe`, `apply`, `delete`, `s3`, `ec2`, `lambda` |
| **Package Managers** | `npm`, `yarn`, `pnpm`, `cargo`, `pip`, `bun` | `install`, `run`, `start`, `test`, `build`, `add`, `publish`, `update`, `freeze`, `clippy` |
| **Languages & Tooling** | `python`, `node`, `go`, `rustc`, `deno`, `npx` | `manage.py`, `main.py`, `server.js`, `index.js`, `fmt`, `vet`, `playwright`, `esbuild`, `--watch` |
| **Modern BaaS** | `supabase`, `firebase` | `init`, `start`, `stop`, `db`, `functions`, `login`, `deploy`, `serve`, `emulators` |

---

## 5. Quy Tắc Bảo Vệ Ứng Dụng Chat & Dấu Câu (Hardened Guard Boundaries)

Để thanh ribbon gợi ý không gây cản trở hay khó chịu cho người dùng, bộ gõ thực thi hai quy tắc bảo vệ nghiêm ngặt:

1. **Khóa dự đoán tại ranh giới câu (Sentence Punctuation Silence)**:
   - Khi ký tự vừa gõ là dấu kết thúc câu (`.`, `?`, `!`) hoặc ngắt dòng (`\n`), thanh gợi ý Next-Word lập tức bị ẩn hoàn toàn.
   - Ngăn chặn triệt để hiện tượng gợi ý từ chữ thường vô duyên khi người dùng chuẩn bị bắt đầu một câu mới.

2. **Bảo vệ phím Enter khi nhắn tin (Chat Application Enter Pass-Through)**:
   - Trong các ứng dụng nhắn tin thời gian thực như **Telegram Web, Slack, Facebook Messenger, Zalo**: người dùng có thói quen bấm `Enter` để gửi tin nhắn.
   - Nếu thanh ribbon đang ở chế độ `nextword`, bộ gõ **tuyệt đối không chặn sự kiện `Enter`** và không tự ý chèn từ vào ô chat. Thay vào đó, nó âm thầm đóng thanh gợi ý và cho phép sự kiện `Enter` tự nhiên đi qua để tin nhắn được gửi đi tức thì.

---

## 6. Kiểu Hiển Thị Gợi Ý: Floating Ribbon vs Inline Ghost Text

Người dùng có thể linh hoạt chuyển đổi giữa 2 phong cách giao diện trong Options Page (`suggestionStyle`):

1. **Thanh danh sách nổi (Floating Ribbon - Mặc định)**:
   - Hiển thị 1 đến 5 ứng viên theo hàng ngang phía trên/dưới ô nhập liệu.
   - Chọn nhanh bằng phím `Enter`, số `1-5` hoặc dùng phím `Tab`/`Shift+Tab` để duyệt.

2. **Chữ mờ ngay sau con trỏ (Inline Ghost Text)**:
   - Lấy ứng viên xếp hạng #1 (top 1) và tính toán phần hậu tố còn thiếu (`ghostSuffix`).
   - Hiển thị bằng chữ mờ (opacity: 0.58, màu xám nhạt) nằm trong Shadow DOM riêng biệt, bám sát tọa độ con trỏ (Caret Coordinates) trong cả `<input>`, `<textarea>` và `contenteditable`.
   - **Ưu điểm vượt trội**: Không bao giờ che khuất các menu dropdown autocomplete riêng của trang web (như ô tìm kiếm Google, Mention list trong Slack/Discord).
   - **Thao tác chấp nhận (Acceptance)**: Nhấn phím `Tab` hoặc mũi tên phải `→` để chèn tức thì phần chữ mờ vào văn bản. Bấm phím bất kỳ khác hoặc `Esc` sẽ tự động ẩn chữ mờ.

