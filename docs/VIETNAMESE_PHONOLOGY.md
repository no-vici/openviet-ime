# Ngữ Âm Tiếng Việt & Toàn Bộ Quy Tắc Được Lập Trình Trong OpenViet IME

Tài liệu này là phần tiếp theo của [`ARCHITECTURE.md`](./ARCHITECTURE.md). Nếu tài liệu kia trả lời câu hỏi **\"bộ gõ chạy trong trình duyệt như thế nào\"**, thì tài liệu này trả lời câu hỏi **\"bộ gõ quyết định chữ nào được phép có dấu, dấu đặt ở đâu, và chuỗi nào phải bị từ chối\"**.

Đây là tài liệu dài. Bạn không cần đọc một mạch. Hãy xem đây như một cuốn sổ tay: khi gặp một hiện tượng lạ (ví dụ gõ `tién` nhưng bộ gõ không đổi dấu, hay `hòa` và `hoà` cùng hợp lệ), bạn mở đúng mục tương ứng.

> **Quy ước thuật ngữ:** dùng **Tiếng Việt**, **chánh tả**, **gởi** thống nhất. Tên hàm, tên file và tên cờ cấu hình giữ nguyên để bạn đối chiếu mã nguồn.

---

## Mục lục

1. [Âm tiết là gì?](#1-âm-tiết-là-gì)
2. [Phụ âm đầu: âm nào đi với nguyên âm nào](#2-phụ-âm-đầu-âm-nào-đi-với-nguyên-âm-nào)
3. [Phụ âm cuối: âm khép, âm mở và ngoại lệ](#3-phụ-âm-cuối-âm-khép-âm-mở-và-ngoại-lệ)
4. [Nguyên âm: đơn, đôi, ba và âm đệm](#4-nguyên-âm-đơn-đôi-ba-và-âm-đệm)
5. [Thanh điệu: năm dấu và một dấu \"không\"](#5-thanh-điệu-năm-dấu-và-một-dấu-không)
6. [Quy tắc đặt dấu: cũ, mới và lý do lịch sử](#6-quy-tắc-đặt-dấu-cũ-mới-và-lý-do-lịch-sử)
7. [Telex và VNI: bàn phím được dịch thành chữ như thế nào](#7-telex-và-vni-bàn-phím-được-dịch-thành-chữ-như-thế-nào)
8. [Bộ lọc chánh tả: mọi chuỗi bị loại trừ](#8-bộ-lọc-chánh-tả-mọi-chuỗi-bị-loại-trừ)
9. [Từ điển, ngoại lệ và danh sách bẫy](#9-từ-điển-ngoại-lệ-và-danh-sách-bẫy)
10. [Cờ cấu hình: cái nào bật, cái nào tắt, cái nào luôn chạy](#10-cờ-cấu-hình-cái-nào-bật-cái-nào-tắt-cái-nào-luôn-chạy)
11. [Mười ca gõ đi dây](#11-mười-ca-gõ-đi-dây)
12. [Bản đồ mã nguồn](#12-bản-đồ-mã-nguồn)
13. [Tóm tắt thuật ngữ](#13-tóm-tắt-thuật-ngữ)
14. [Học lại từ số không: bốn lớp của một chữ](#14-học-lại-từ-số-không-bốn-lớp-của-một-chữ)
15. [Cổng kiểm tra: vì sao không tin vào danh sách từ khác](#15-cổng-kiểm-tra-vì-sao-không-tin-vào-danh-sách-từ-khác)
16. [Dấu được tính toán, không được lưu cứng](#16-dấu-được-tính-toán-không-được-lưu-cứng)
17. [Khi miệng nói một đằng, bàn phím gõ một nẻo](#17-khi-miệng-nói-một-đằng-bàn-phím-gõ-một-nẻo)
18. [OpenViet và Dokey: mượn ý, không mượn code](#18-openviet-và-dokey-mượn-ý-không-mượn-code)
19. [Tài liệu tham khảo trong docs/references](#19-tài-liệu-tham-khảo-trong-docsreferences)
20. [Nguồn ngữ âm trực tuyến đã kiểm chứng](#20-nguồn-ngữ-âm-trực-tuyến-đã-kiểm-chứng)
21. [Mã hoá, Unicode và RFC 1456](#21-mã-hoá-unicode-và-rfc-1456)

---

## 1. Âm tiết là gì?

### 1.1. Định nghĩa dễ hiểu nhất

Hãy vỗ tay một cái. Mỗi lần vỗ tay là một **âm tiết**. Nói `Tiếng Việt` có hai âm tiết: `tiếng` và `Việt`. Nói `bạn` có một âm tiết.

Âm tiết là **đơn vị nhịp điệu nhỏ nhất của lời nói**. Trong Tiếng Việt, một âm tiết thường đi với một chữ viết (một \"tiếng\"), trừ một số trường hợp ghép âm tiết như `việt nam` vẫn là hai chữ.

Khác với Tiếng Anh, Tiếng Việt **không nối âm tiết lại với nhau** thành từ phức âm tiết kiểu `computer` (ba nhịp nhưng viết liền). Vì vậy ranh giới âm tiết cực kỳ quan trọng: nếu bộ gõ nhầm ranh giới, nó sẽ gán dấu vào nhầm chỗ.

### 1.2. Cấu trúc năm thành phần

OpenViet IME dùng mô hình năm thành phần, kế thừa từ vnchKey/Bamboo:

```text
Âm tiết = Onset + Glide + Nucleus + Coda + Tone
          Âm đầu  + Âm đệm + Âm chính + Âm cuối + Dấu thanh
```

| Thành phần | Ký hiệu trong code | Vai trò | Ví dụ trong `quán` |
|---|---|---|---|
| **Onset** (âm đầu) | `onset` | Phụ âm mở đầu, có thể là một hoặc hai ba chữ cái | `q` |
| **Glide** (âm đệm) | `glide` | Âm trượt nằm giữa âm đầu và âm chính, thường là `u` hoặc `o` | `u` |
| **Nucleus** (âm chính) | `nucleus` | Đỉnh âm thanh, chỗ \"mở miệng\" nhất | `a` |
| **Coda** (âm cuối) | `coda` | Phụ âm hoặc bán nguyên âm khép âm tiết | `n` |
| **Tone** (dấu thanh) | `tone` | Cao độ/độ căng của cả âm tiết, không phải riêng một chữ cái | Sắc |

Với `quán`, code phân tích: `onset = 'q'`, `glide = 'u'`, `nucleus = 'a'`, `coda = 'n'`, `tone = 1`. Dấu Sắc được đặt lên `a` dù âm tiết đọc \"quán\" có cảm giác dấu nằm trên toàn bộ tiếng.

Hãy so sánh thêm:

| Chữ | Onset | Glide | Nucleus | Coda | Tone | Ghi chú |
|---|---|---|---|---|---|---|
| `ma` | `m` | – | `a` | – | ngang | Không có âm cuối |
| `má` | `m` | – | `a` | – | Sắc | Dấu trên âm chính |
| `múa` | `m` | – | `ua` | – | Sắc | `ua` là cặp nguyên âm mở, dấu trên `u` |
| `toán` | `t` | – | `oa` | `n` | Sắc | Có âm cuối → dấu dời sang `a` |
| `quán` | `q` | `u` | `a` | `n` | Sắc | `u` thuộc cụm `qu`, không nhận dấu |
| `được` | `đ` | – | `ươ` | `c` | ngang | `ươ` là nguyên âm đôi đã móc |
| `cười` | `c` | `u` | `ươi` | – | Huyền | Ba nguyên âm, dấu ở giữa |

### 1.3. Vì sao \"dấu thuộc âm tiết\" lại quan trọng?

Người mới thường nghĩ dấu là \"một cái mác dán lên chữ cái có dấu\". Ngữ âm học thì nói khác: **dấu thanh là thuộc tính của cả âm tiết**, chỉ được **ký âm** bằng cách đặt lên một nguyên âm đại diện.

Hệ quả trong lập trình:

- Ta không thể chỉ \"thêm dấu vào ký tự cuối\". Phải biết đâu là âm chính.
- Khi người dùng gõ thêm chữ cái vào sau một từ đã có dấu, âm tiết thay đổi cấu trúc → dấu phải **chuyển chỗ**. Đó là `checkDynamicToneShift()` trong `avim.js`.
- Một chuỗi không có nguyên âm (`fcitx`, `tmux`) **không phải âm tiết Tiếng Việt**, nên không bao giờ được nhận dấu.

---

## 2. Phụ âm đầu: âm nào đi với nguyên âm nào

### 2.1. Danh sách âm đầu hợp lệ

`VALID_INITIAL_CONSONANTS` trong `avim.js` và `VALID_ONSETS` trong `syllable-parser.js` liệt kê:

```text
Âm đầu chuẩn:
  '', b, c, ch, d, đ, g, gh, gi, h, k, kh, l, m, n, ng, ngh, nh,
  p, ph, qu, r, s, t, th, tr, v, x

Âm đầu mở rộng cho địa danh/phương ngữ (chỉ trong SyllableParser):
  kr, pr, dr, đr, br, kl, pl, bl, dz, z
```

`''` nghĩa là âm tiết bắt đầu bằng nguyên âm: `a`, `ăn`, `ông`, `uỷ`...

### 2.2. Quy tắc `c` / `k`

Tiếng Việt phân công rất rõ:

| Âm đầu | Đi với | Ví dụ | Bị chặn |
|---|---|---|---|
| `c` | `a, ă, â, o, ô, u, ư` | `ca`, `căn`, `cân`, `có`, `cổ`, `cu`, `cư` | `ce`, `cê`, `ci`, `cy` |
| `k` | `e, ê, i, y` | `kẻ`, `kết`, `ký`, `kỹ`, `kê` | – |

Hàm `hasCkPhonologyViolation()` trong `dictionary.js` bắt mọi từ bắt đầu `ce/cê/ci/cy` là từ ngoại lai. Đây là lý do `center`, `city`, `cell`, `circle`, `cynic` **không bị bỏ dấu** dù có phím Telex `s/f/r/x/j` đi sau. Nếu bạn cố gõ `centers`, engine trả phím `s` nguyên vẹn.

> Ghi nhớ: `k` là \"anh em\" của `c` nhưng chỉ xuất hiện trước nguyên âm \"phía trước\" (e, ê, i, y). Gõ `ket` là sai chánh tả; gõ `ket` trong code thì đúng vì đó là Tiếng Anh.

### 2.3. Quy tắc `g` / `gh`

| Âm đầu | Đi với | Ví dụ | Bị chặn |
|---|---|---|---|
| `g` | `a, ă, â, o, ô, u, ư` | `ga`, `găn`, `gây`, `gõ`, `gỗ`, `gu`, `gư` (hiếm) | `ge`, `gê` |
| `gh` | `e, ê, i` | `ghe`, `ghê`, `ghi` | – |

`hasGghPhonologyViolation()` chặn `ge/gê`. `get`, `genius`, `gear`, `gender`, `agent` vì thế được giữ nguyên.

### 2.4. Quy tắc `ng` / `ngh`

| Âm đầu | Đi với | Ví dụ | Bị chặn |
|---|---|---|---|
| `ng` | `a, ă, â, o, ô, u, ư` | `nga`, `ngăn`, `ngân`, `ngôn`, `ngư` | `nge`, `ngê`, `ngi` |
| `ngh` | `e, ê, i` | `nghe`, `nghệ`, `nghĩ` | – |

`hasNgPhonologyViolation()` chặn `nge/ngê/ngi`, bảo vệ `danger`, `finger`, `singer`, `engine`.

Ba quy tắc `c/k`, `g/gh`, `ng/ngh` được gom lại trong `hasPhonologyViolation()` và được gọi ở **hai điểm**:

1. Trong `processKey()`: nếu từ đang có vi phạm, phím tiếp theo đi qua literal.
2. Trong `checkTone()`: nếu vi phạm, phím dấu không được áp dụng.

### 2.5. Cụm `qu`

`q` trong Tiếng Việt **không đứng một mình**. Nó luôn đi với `u` tạo thành âm đầu `qu`. Trong parser, `q` là onset, `u` là glide:

```text
quán → onset 'q' + glide 'u' + nucleus 'a' + coda 'n'
quý  → onset 'q' + glide 'u' + nucleus 'y'
quê  → onset 'q' + glide 'u' + nucleus 'ê'
```

Điểm đặc biệt: **dấu không bao giờ đặt lên `u` trong `qu`**. Dù cổ điển hay hiện đại, `quý` chứ không phải `qúy`; `quả` chứ không phải `qủa`. Code xử lý riêng bằng biến `isQu` trong `ParsedSyllable.reconstruct()` và bằng đoạn `effectiveIndices.slice(1)` trong `AvimEngine.getTargetVowelIndex()`.

### 2.6. Cụm `gi`

`gi` có hai mặt:

| Trường hợp | Phân tích | Ví dụ |
|---|---|---|
| `gi` + nguyên âm khác | `gi` là âm đầu | `gia`, `gió`, `giê`, `giữa`, `giết` |
| `gi` đứng một mình / trước phụ âm | `g` là âm đầu, `i` là nguyên âm | `gì`, `gìn`, `gịt` |

Parser quyết định bằng cách nhìn chữ cái thứ ba: nếu nó là nguyên âm thì lấy `gi` làm onset, nếu không thì lấy `g`.

### 2.7. Phụ âm đầu ngoại lai bị chặn

`FOREIGN_INITIAL_CLUSTERS` chứa:

```text
pl, fl, cl, gl, bl, sl,
pr, dr, cr, br, gr, fr, wr,
sp, st, sk, sm, sn, sw, tw, dw,
spl, spr, str, scr, shr, squ,
kn, ps, rh, phl, chr, sch
```

`hasForeignOnset()` nhận diện các cụm này và `processKey()` từ chối bỏ dấu. Đây là lý do `play`, `playwright`, `flow`, `slow`, `status`, `start`, `clean`, `spring`, `browser` được giữ nguyên.

Tuy nhiên có **danh sách ngoại lệ** được phép đi tiếp vì là địa danh/tên dân tộc: `pleiku`, `krông`, `prông`, `glong`, `grai`, `gram`, `đrắk`, `đrăk`, `đrak`, `m'đrắk`. Code kiểm tra bằng `isPotentialPrefix`: nếu chuỗi đang gõ là tiền tố của một tên được whitelist thì vẫn cho phép chuyển tiếp.

### 2.8. `d`, `đ` và phím `z`

- Telex: `d` + `d` → `đ`; `đ` + `d` → `dd` (toggle).
- VNI: `d` + `9` → `đ`.
- Cơ chế **delayed d** cho phép sửa `drak` → `đrak`, `duoc` → `đuoc` ngay cả khi bạn gõ `d` muộn sau khi đã có nguyên âm.
- `z` chỉ được chấp nhận như âm đầu trong phương ngữ Nam Bộ (`zị`, `zậy`, `zô`) và biến âm `dz` (`dzô`, `dzậy`). Ở các vị trí khác, `isForeignWord()` coi `z` là ký tự ngoại lai.

---

## 3. Phụ âm cuối: âm khép, âm mở và ngoại lệ

### 3.1. Coda chuẩn

`VALID_FINAL_CONSONANTS` trong `avim.js`:

```text
'', c, ch, m, n, ng, nh, p, t
```

`ParsedSyllable.isValid()` còn chấp nhận `k` trong nhóm **ethnic codas** cùng `l, r, h`, nhưng chỉ khi từ nằm trong danh sách địa danh/tên riêng.

| Nhóm | Coda | Dấu được phép | Ví dụ hợp lệ | Ví dụ bị từ chối |
|---|---|---|---|---|
| Mở | `''` | Tất cả | `ma`, `má`, `mà`, `mả`, `mã`, `mạ` | `đă`, `câ` (xem mục 3.3) |
| Mũi | `m, n, ng, nh` | Tất cả | `tâm`, `tán`, `tâng`, `tánh` | – |
| Khép | `c, ch, p, t` | **Chỉ Sắc hoặc Nặng** | `bác`, `bạc`, `bếp`, `bẹp`, `mát`, `mạt` | `bàc`, `bảc`, `bãc`, `thìch`, `bèp` |
| Dân tộc | `k, l, r, h` | Tùy trường hợp whitelist | `đắk`, `kar`, `mil`, `păh`, `prông` | `docx` (`-x`), `curl` (`-rl`) |

### 3.2. Luật âm khép (checked tone)

Đây là một trong những luật \"cứng\" nhất của Tiếng Việt. Âm tiết kết thúc bằng phụ âm **tắc** (`c`, `ch`, `p`, `t`) tạo ra thanh ngắn; thanh ngắn chỉ có hai dấu: **Sắc** và **Nặng**.

Hàm `isCheckedToneViolation(word, targetTone)` trả `true` nếu:

- từ kết thúc `c/ch/p/t`, **và**
- dấu muốn đặt là Huyền (2), Hỏi (3) hoặc Ngã (4).

`checkTone()` gọi hàm này trước khi đặt dấu, nên `bacf`, `bacr`, `bacx` đều bị từ chối. `ParsedSyllable.isValid()` có cùng luật cho coda `k`.

### 3.3. Nguyên âm ngắn cần âm cuối

`ă` và `â` là nguyên âm ngắn. Khi từ **hoàn tất** (`inProgress: false`), chúng bắt buộc phải có coda:

| Chuỗi | Trạng thái | Xử lý |
|---|---|---|
| `đă` | thiếu coda | Không nhận dấu; khi bấm Space được auto-restore về phím thô |
| `đăk` / `đắk` | có coda | Hợp lệ (địa danh Tây Nguyên) |
| `câ` | thiếu coda | Bị từ chối |
| `cân` | có coda | Hợp lệ |
| `tắ` | thiếu coda | Chấp nhận trong lúc gõ (`inProgress: true`), nhưng chưa hoàn chỉnh |
| `tắm` | có coda | Hợp lệ |

Đây là lý do bạn có thể gõ dần `tắ` rồi `tắm`, nhưng nếu dừng lại bấm Space ngay tại `tắ`, engine coi đó là trạng thái intermediate và trả về dạng thô.

### 3.4. Coda ngoại lai

`hasEnglishPhonotactics()` chặn các từ kết thúc bằng:

```text
b, d, f, j, l, q, r, s, v, w, x, z
```

Ví dụ `curl` (`-rl`), `docs` (`-cs`), `linux` (`-ux`), `world` (`-ld`), `test` (`-st`). Những từ này thường nằm luôn trong `COMMON_ENGLISH_WORDS`, nên dù có lúc bị dính dấu, khi bấm delimiter chúng được trả về dạng gốc.

---

## 4. Nguyên âm: đơn, đôi, ba và âm đệm

### 4.1. Nguyên âm đơn (monophthong)

| Nhóm | Nguyên âm | Telex tạo hình | VNI tạo hình |
|---|---|---|---|
| A | `a`, `ă`, `â` | `a`, `aw`, `aa` | `a`, `8`, `6` |
| E | `e`, `ê` | `e`, `ee` | `e`, `6` |
| I | `i` | `i` | `i` |
| O | `o`, `ô`, `ơ` | `o`, `oo`, `ow` | `o`, `6`, `7` |
| U | `u`, `ư` | `u`, `uw` | `u`, `7` |
| Y | `y` | `y` | `y` |

Mỗi nguyên âm có sáu dạng: không dấu, Sắc, Huyền, Hỏi, Ngã, Nặng. `VOWEL_TABLE` và `VOWEL_DECOMPOSE_TABLE` trong `avim.js` / `syllable-parser.js` là bảng tra cứu hai chiều.

### 4.2. Nguyên âm đôi (diphthong)

`VALID_VOWEL_CORES` liệt kê các cặp được công nhận:

```text
ai, ao, au, ay, âu, ây, eo, êu,
ia, iê, iu, ye, yê,
oa, oă, oe, oi, ôi, ơi,
ua, uâ, ue, uê, ui, uo, uô, uơ, uy,
ưa, ưi, ươ, ưu
```

Ta chia thành bốn nhóm hành vi:

| Nhóm | Các cặp | Chỗ đặt dấu | Ví dụ |
|---|---|---|---|
| Cặp trượt ra (offglide) | `ai, ao, au, ay, âu, ây, eo, êu, oi, ôi, ơi, ui` | Âm thứ nhất | `mái`, `sáo`, `cháu`, `mây`, `khuấy`, `kéo`, `tối`, `mới`, `túi` |
| Cặp mở | `ia, ya, ua, ưa` (khi không có coda) | Âm thứ nhất | `mía`, `múa`, `chữa`, `gia` |
| Cặp \"móc/độn\" | `ươ, iê, uô, yê, oo` | Âm thứ hai | `được`, `tiếng`, `đường`, `yêu`, `xoòng` |
| Cặp có âm đệm | `oa, oe, uâ, uê, uơ, uy` | Tùy kiểu dấu cũ/mới khi mở; khi có coda thì âm chính | `hòa/hoà`, `thủy/thuỷ`, `toán`, `quán`, `thuế` |

### 4.3. Âm đệm (glide) được tách thế nào?

`parseSyllable()` tách glide theo luật sau:

| Vowel cluster | Glide | Nucleus | Điều kiện | Ví dụ |
|---|---|---|---|---|
| `oa`, `oe`, `oă` | `o` | `a`, `e`, `ă` | Luôn | `toán`, `hoè`, `oă` (dạng trung gian) |
| `uâ`, `uê`, `uơ`, `uy` | `u` | `â`, `ê`, `ơ`, `y` | Luôn | `quân`, `thuế`, `thuở`, `thủy` |
| `ua` | `u` | `a` | **Chỉ khi có coda** | `toán` (từ `tuan`), `quán` |
| `ua` | – | `ua` | Khi không có coda | `mua`, `chua`, `múa` |

Đây là điểm tinh vi: `mua` (không coda) và `quán` (có coda) đều chứa `u-a`, nhưng cấu trúc khác nhau.

### 4.4. Nguyên âm ba (triphthong)

Các cụp ba nguyên âm được công nhận:

```text
oai, oay, oao, oeo,
uai, uay, uôi, uơu, uyu,
ươi, uya, ươu,
iêu, yêu, uyê
```

Luật: **dấu luôn nằm ở nguyên âm giữa**.

| Chữ | Glide | Nucleus | Dấu |
|---|---|---|---|
| `cười` | `u` | `ươi` | Huyền trên `ư` (giữa của `ươi`) |
| `rượu` | – | `ươu` | Nặng trên `ư` |
| `chuối` | `u` | `uôi` | Sắc trên `o` |
| `nhiều` | – | `iêu` | Huyền trên `ê` |
| `khoai` | `o` | `ai` | Sắc trên `a` (giữa của `oai`) |
| `xoay` | `o` | `ay` | Sắc trên `a` |

### 4.5. Tổ hợp không bao giờ hợp lệ

Hai luật bị từ chối ngay trong `ParsedSyllable.isValid()`:

| Tổ hợp | Luật | Ví dụ bị chặn |
|---|---|---|
| `ơ` + `e/a/o/u/ê/ă/â` | `ơ` chỉ đi với `i` (`ơi`) | `ơe`, `ơa`, `ơo`, `ơu`, `ơê`, `ơă`, `ơâ` |
| `ă` + bất kỳ nguyên âm/bán nguyên âm | `ă` là đơn âm ngắn, không đi sau âm khác | `ăy`, `ăi`, `ău`, `ăo`, `ăâ`, `ăê` |

Ngoài ra:

- **Cặp mở + coda** bị cấm: `ia`, `ya`, `ua`, `ưa` không được có phụ âm cuối. `mian`, `khuyan`, `toanc` đều sai.
- **Cặp khép chưa biến hình + dấu** bị cấm khi đã có coda: `uo`, `ie`, `ye` phải thành `ươ`, `iê`, `yê` (hoặc `uô`) mới được nhận dấu. Xem chi tiết mục 8.4.

---

## 5. Thanh điệu: năm dấu và một dấu \"không\"

### 5.1. Bảng thanh điệu

| Tên | Ký hiệu | Telex | VNI | Giá trị `TONE_MARK` | Ví dụ |
|---|---|---|---|---|---|
| Ngang | không dấu | – | – | `0` | `ma` |
| Sắc | ´ | `s` | `1` | `1` | `má` |
| Huyền | ` | `f` | `2` | `2` | `mà` |
| Hỏi | ̉ | `r` | `3` | `3` | `mả` |
| Ngã | ̃ | `x` | `4` | `4` | `mã` |
| Nặng | ̣ | `j` | `5` | `5` | `mạ` |
| Xóa dấu | – | `z` | `0` | `0` (đặc biệt) | `toán` + `z` → `toan` |

`getToneForKey()` trong `avim.js` là hàm dịch phím → số dấu. `AUTO` mode thông minh: chữ cái đi theo Telex, chữ số đi theo VNI.

### 5.2. Xóa dấu không xóa \"hình dạng\"

`z`/`0` chỉ gỡ **dấu thanh**, giữ nguyên hình dạng nguyên âm:

```text
toán  + z → toan     (giữ a)
tiến  + z → tiên     (giữ ê)
được + z → đươc     (giữ ươ)
thuế  + z → thuê     (giữ ê)
```

Nếu từ đang không có dấu, `z`/`0` được viết literal (`toan` + `z` → `toanz`).

### 5.3. Gõ lại cùng phím dấu: toggle, rồi literal

Đây là cơ chế \"Cứu chữ\" kế thừa từ vnchKey:

```text
dóc + s → docs      (dấu Sắc bị gỡ, chữ s được giữ lại)
docs + s → docss    (lần thứ ba viết bình thường)

cá  + s → cas
cas + s → cass

mĩ  + x → mix
mix + x → mixx
```

Engine lưu `lastToneToggledWord` và `toneCancelled` để nhớ trạng thái này. Nhờ vậy bạn gõ `docs`, `pass`, `mix`, `caf` bằng Telex mà không cần tắt bộ gõ. Ở delimiter, `checkAutoRestore()` còn dọn thêm `tesst` → `test`, `passs` → `pass`.

---

## 6. Quy tắc đặt dấu: cũ, mới và lý do lịch sử

### 6.1. Câu hỏi tưởng như đơn giản

Gõ `hoa` rồi `s`, bạn muốn `hòa` hay `hoà`? Cả hai đều đọc là `hoà` (Huyền). Chữ `o` và chữ `a` đều là nguyên âm. Vậy dấu đặt lên ai?

Câu trả lời phụ thuộc vào **kiểu chánh tả bạn học**. Đây là lý do OpenViet có cờ `toneStyle` với hai giá trị:

| Giá trị | Tên gọi | Ví dụ | Mặc định? |
|---|---|---|---|
| `classic` | Dấu cũ / truyền thống | `hòa`, `hóa`, `thủy`, `khỏe`, `tùy` | **Có** |
| `modern` | Dấu mới / Bộ Giáo dục | `hoà`, `hoá`, `thuỷ`, `khoẻ`, `tuỳ` | Không |

### 6.2. Khác biệt nằm ở đâu?

Chỉ khác ở các âm tiết có **âm đệm + nguyên âm chính đơn** dạng `oa`, `oe`, `uy`:

| Âm tiết | Cổ điển (dấu trên âm đệm) | Hiện đại (dấu trên âm chính) |
|---|---|---|
| `hoa` + Huyền | `hòa` | `hoà` |
| `hoa` + Sắc | `hóa` | `hoá` |
| `thuy` + Hỏi | `thủy` | `thuỷ` |
| `khoe` + Hỏi | `khỏe` | `khoẻ` |
| `tuy` + Huyền | `tùy` | `tuỳ` |

**Khác biệt không áp dụng cho:**

| Trường hợp | Kết quả (cả hai kiểu) | Lý do |
|---|---|---|
| `quý`, `quả` | dấu trên `y`, `a` | `u` thuộc âm đầu `qu`, không phải nguyên âm mang dấu |
| `toán`, `quán` | dấu trên `a` | Có coda → dấu ở nguyên âm cuối trước âm khép |
| `cười`, `chuối` | dấu ở nguyên âm giữa | Nguyên âm ba → quy tắc trung tâm |
| `thuế`, `huế` | dấu trên `e` | Cặp `uê` luôn dấu ở âm thứ hai |
| `múa`, `cứu` | dấu trên `u` | Cặp mở `ua`/`ưu` luôn dấu ở âm thứ nhất |
| `mái`, `sáo`, `tối` | dấu trên âm thứ nhất | Offglide `i/y/u/o` là âm cuối, không phải âm chính |

### 6.3. Giải thuật đặt dấu trong `getTargetVowelIndex()`

Đây là cây quyết định đầy đủ. Bạn có thể đọc code từ dòng 1742 của `avim.js` theo thứ tự này:

```text
1. Chỉ có một nguyên âm
   → đặt dấu ngay đó.

2. Có cụm 'qu' hoặc 'gi' ở đầu
   → bỏ u/i đầu ra khỏi danh sách nguyên âm (nó là một phần của âm đầu).
   → nếu còn đúng một nguyên âm, đặt dấu vào đó.

3. Âm tiết có phụ âm cuối (closed syllable)
   → nếu trong các nguyên âm có ơ/ê/ô/â/ă → đặt vào chữ đó (đó là âm chính đã biến hình).
   → ngược lại → đặt vào nguyên âm cuối trước phụ âm cuối.
      Ví dụ: toan|n → a;  uon|g → o (sau đó nâng thành uô);

4. Âm tiết mở (open syllable)
   a. Có 3 nguyên âm trở lên → đặt vào nguyên âm giữa.
   b. Cặp uê, uơ, ue, ươ, oo → đặt vào nguyên âm thứ hai.
   c. Cặp ưa, ưu, ia, ya, ua → đặt vào nguyên âm thứ nhất.
   d. Cặp oa, oe, uy → classic: thứ nhất; modern: thứ hai.
   e. Các cặp còn lại (ai, ao, au, ay, âu, ây, eo, êu, oi, ôi, ơi, ui)
      → đặt vào nguyên âm thứ nhất.
```

`ParsedSyllable.reconstruct()` có nhánh tương đương, dùng khi engine **phân tích lại** một âm tiết đã có dấu để dời dấu (`checkDynamicToneShift()`).

### 6.4. Dời dấu động (dynamic tone shifting)

Bạn không cần gõ dấu đúng chỗ ngay từ đầu. Ví dụ:

```text
t  → t
to → to
tó → tó        (s đặt ở o vì lúc này từ đang mở)
tóa → tóa      (thêm a: vẫn là cặp oa mở, cổ điển dấu trên o)
toán → toán    (thêm n: thành âm tiết khép, dấu tự dời sang a)

t   → t
to  → to
toa → toa
toas → toá     (dấu Sắc tạm trên o)
toanc → toán   (coda c xuất hiện → dấu dời sang a)
```

Engine gọi `checkDynamicToneShift()` ở bước 4b của `processKey()`, parse lại `word + key`, rồi reconstruct theo `toneStyle`.

### 6.5. Tại sao có hai kiểu? Lý do lịch sử

Đây là phần \"tại sao\" mà mã nguồn không ghi hết. Có thể tóm lại bằng ba lớp:

**Lớp 1 — Ngữ âm: dấu thuộc âm tiết, không thuộc chữ cái**

Trong `oa`, `oe`, `uy`, âm `o`/`u` là **âm đệm** (glide): nó được phát ra ngắn và trượt nhanh vào âm chính `a`/`e`/`y`. Đỉnh âm thanh (sonority peak) nằm ở âm chính. Vì dấu thanh mô tả cao độ của cả âm tiết, về mặt ngữ âm nó hợp lý nhất khi đặt ở đỉnh đó → `hoà`, `thuỷ`, `khoẻ`. Đây là lập luận chính của cải cách \"dấu mới\".

**Lớp 2 — Sư phạm: một quy tắc thay vì nhiều ngoại lệ**

Kiểu cũ bắt người học nhớ: \"dấu lên chữ đứng trước trong `oa, oe, uy`, nhưng lên chữ sau trong `ươ, iê, uô, yê`, và lên chữ giữa trong `ươi, uôi, iêu`\". Kiểu mới rút gọn thành một câu: **\"dấu đặt trên nguyên âm chính\"**. Dù thực tế vẫn còn ngoại lệ (`quý`, `thuế`, `cười`), quy tắc mới dễ dạy và dễ kiểm tra bằng máy hơn. Đây là động lực khiến Bộ Giáo dục và Đào tạo thống nhất dùng kiểu mới trong sách giáo khoa từ khoảng thập niên 1980.

**Lớp 3 — Thói quen in ấn và máy chữ**

Kiểu cũ không \"sai\"; nó là truyền thống của chữ Quốc ngữ thời kỳ đầu và cách gõ dấu trên máy chữ: dấu được đúc cùng chữ cái đứng trước trong tổ hợp, nên người viết quen nhìn `hòa`, `thủy`. Khi Unicode xuất hiện, cả hai dạng đều có sẵn glyph dựng sẵn, nên không bên nào biến mất. Nhiều người lớn học kiểu cũ, học sinh sau này học kiểu mới; cùng một văn bản có thể chứa cả hai.

**Kết luận cho người dùng:** không có \"đúng/sai\" tuyệt đối giữa `hòa` và `hoà`; chỉ có \"phù hợp với thói quen của bạn\". OpenViet mặc định `classic` vì đa số người dùng Việt hiện nay gõ kiểu đó, và cho phép đổi sang `modern` trong Options. Quan trọng là **nhất quán trong cùng một văn bản**.

> Lưu ý thêm: quy ước `chánh tả`/`gởi` mà dự án dùng cũng là một dạng \"kiểu cũ có chủ đích\" — được giữ để đồng nhất với cách viết Nam Bộ trước 1975, không phải lỗi chánh tả.

---

## 7. Telex và VNI: bàn phím được dịch thành chữ như thế nào

### 7.1. Thứ tự ưu tiên trong `processKey()`

Mỗi phím đi qua một chuỗi kiểm tra. Thứ tự quan trọng vì hai rule có thể cùng khớp:

| Bước | Hàm | Việc làm |
|---|---|---|
| 0 | early return | `method = OFF`, phím `w` khi `wToUEnabled = false`, URL/email/code, dấu nháy bọc ngoài |
| 1 | `checkQuickConsonants()` | `f→ph`, `j→gi`, `w→qu` ở đầu từ; `g/h/k → ng/nh/ch` sau nguyên âm |
| 1b | `checkQuickTelex()` | `cc→ch`, `gg→gi`, `kk→kh`, `nn→ng`, `pp→ph`, `tt→th` |
| 2 | `checkConsonant()` | `dd→đ`, `d+9→đ`, delayed `d` |
| 3 | `checkVowelShape()` | `aa→â`, `aw→ă`, `ee→ê`, `oo→ô`, `ow→ơ`, `uw→ư`, VNI `6/7/8` |
| 3b | `checkShapeModifierSwapping()` | `â↔ă`, `ô↔ơ`, `ưa↔â`, v.v., giữ dấu cũ |
| 4 | `checkTone()` | Đặt/toggle/xóa dấu thanh |
| 4b | `checkDynamicToneShift()` | Dời dấu khi cấu trúc âm tiết đổi |
| 5 | default append | Nâng `uơ/ưo` → `ươ` trước coda `n/ng/c/t/m/p`, rồi nối phím |

### 7.2. Phím `w`: năm nghĩa trong một

`w` là phím \"đa năng\" nhất của Telex:

| Ngữ cảnh | Kết quả | Ví dụ |
|---|---|---|
| Đầu từ (Non-Start policy) | Giữ chữ `w` Latin | `web`, `wifi`, `wife`, `world`, `ward`, `sway` (sau auto-restore) |
| Sau `o` | `ow → ơ` | `thow` → `thơ` |
| Sau `u` | `uw → ư` | `thuw` → `thư` |
| Sau `a` | `aw → ă` | `taw` → `tă` |
| Sau consonant | `ư` | `thw` → `thư` |
| Giữa `uo`/`uu` | Móc cặp | `duocw` → `dược`, `cuuw` → `cưu` |

Cờ `wToUEnabled` (mặc định `true`) là công tắc người dùng:

- **Bật**: áp dụng đủ bảng trên, nhưng vẫn giữ Non-Start.
- **Tắt**: mọi `w` đều literal — `sway` stays `sway`, `thw` stays `thw`, `ow` stays `ow`.

Cờ nội bộ `typeW2U` bị ép `true` để đảm bảo Non-Start luôn đúng; đây là lý do `DEFAULT_SETTINGS` có cả hai khóa và có test so sánh (`settings-parity.test.js`).

### 7.3. SmartHorn: `uo` và `uu`

Khi `smartHorn: true`, engine nhận diện cặp đặc biệt:

```text
u[oóòỏõọơớờởỡợ] + w → ươ (cả hai chữ cùng móc)
ư[ơớờởỡợ]      + w → uo (toggle ngược lại)

u[uu] + w → ưu (chữ đầu móc)
ưu    + w → uu (toggle ngược lại)
```

Ví dụ: `dduocw` → `được`; `nuocw` → `nước`; `cuuw` → `cưu`; `cừu` + `w` → `cuu`.

Ngoài ra có luật nâng cấp tự động trước coda `n/ng/c/t/m/p` (`xem mục default append`): `thuơ n` → `thuơn` trở thành `thươn`.

### 7.4. VNI

| Phím | Nghĩa |
|---|---|
| `1..5` | Sắc, Huyền, Hỏi, Ngã, Nặng |
| `6` | Mũ (â/ê/ô); bấm lại lần 2 trả chữ cái + `6` |
| `7` | Móc (ơ/ư); bấm lại lần 2 trả chữ cái + `7` |
| `8` | Trăng (ă); bấm lại lần 2 trả chữ cái + `8` |
| `9` | Gạch ngang `đ` |
| `0` | Xóa dấu thanh |

VNI **miễn nhiễm với bẫy Telex** vì không dùng `s/f/r/x/j/z` làm dấu. Tuy nhiên chữ số có thể dính vào tên file (`mp3`, `icon6`, `h2o`) nên engine có luật riêng: nếu raw chứa số và không tạo được âm tiết Tiếng Việt hợp lệ, trả nguyên chuỗi.

### 7.5. Late vowel shaping và loanword `oo`

Bạn có thể gõ dấu shape **sau khi đã gõ coda**:

```text
chong + o → chông
kieu  + e → kiêu
diem  + r → diẻm  → (thêm e) → diểm
```

Nếu từ đang có `ô/ố/ồ/ổ/ỗ/ộ` và kết thúc bằng `ng`, bấm thêm `o` sẽ tạo double-o cho từ mượn:

```text
xông + o → xoong
bông + o → boong
gồng + o → goòng
```

Đây là lý do `xoong`, `boong`, `goong`, `xoòng` nằm trong `RARE_AND_PLACE_SYLLABLES` để không bị bộ lọc chánh tả chặn.

### 7.6. Word Rescue (Ngó Sen)

Nếu bạn gõ thô cả một câu rồi mới bật bộ gõ, `rescueWord()` đi dần và chuyển đổi:

```text
Chaof banj, tieengs vieetj nef
→ Chào bạn, tiếng việt nè
```

Các từ trong `COMMON_ENGLISH_WORDS` hoặc từ điển riêng (`linux`, `server`, `browser`) được giữ nguyên. `Escape` hoàn tác toàn bộ.

---

## 8. Bộ lọc chánh tả: mọi chuỗi bị loại trừ

Bảng dưới đây là danh sách đầy đủ các lớp lọc. Cột \"Hành vi\" mô tả điều bạn thấy được.

| # | Chuỗi sai / đáng ngờ | Bộ lọc | Lý do ngữ âm | Hành vi |
|---|---|---|---|---|
| 8.1 | `center`, `city`, `cell`, `circle`, `cynic` | `hasCkPhonologyViolation` | `c` không đi trước `e/ê/i/y` | Không nhận dấu; giữ nguyên |
| 8.2 | `get`, `genius`, `gear`, `gender`, `agent` | `hasGghPhonologyViolation` | `g` không đi trước `e/ê`, phải dùng `gh` | Không nhận dấu |
| 8.3 | `danger`, `finger`, `singer`, `engine` | `hasNgPhonologyViolation` | `ng` không đi trước `e/ê/i`, phải dùng `ngh` | Không nhận dấu |
| 8.4 | `bàc`, `bảc`, `bãc`, `thìch`, `bèp` | `isCheckedToneViolation` | Coda tắc chỉ Sắc/Nặng | Phím dấu đi qua literal |
| 8.5 | `fcitx`, `tmux`, `docx`, `curl` | `isValid()` + `hasEnglishPhonotactics()` | Không có nucleus; coda `x/rl/l` lạ | Không nhận dấu, kể cả khi tắt `spellCheck` |
| 8.6 | `play`, `flow`, `status`, `spring`, `browser` | `hasForeignOnset` | Cụm đầu ngoại lai | Không nhận dấu |
| 8.7 | `pleiku`, `krông`, `prông`, `glong`, `grai`, `đrắk` | Whitelist + `isPotentialPrefix` | Địa danh Tây Nguyên | Được phép bỏ dấu |
| 8.8 | `đă`, `câ`, `bă`, `tắ` | `isValid({inProgress:false})` | `ă/â` cần coda khi hoàn tất | Space trả về phím thô |
| 8.9 | `Huyèn`, `chuyén`, `tién`, `biét`, `duòng`, `nuóc` | `isValid()` + auto-restore | `uo/ie/ye` + coda chưa móc/độn | Không nhận dấu hoặc trả thô |
| 8.10 | `mian`, `khuyan` | `isValid()` | Cặp mở `ia/ua` không có coda | Bị từ chối |
| 8.11 | `ơe`, `ơa`, `ơo`, `ơu`, `ơê` | `isValid()` | `ơ` chỉ đi với `i` | Bị từ chối |
| 8.12 | `ăy`, `ăi`, `ău`, `ăo` | `isValid()` | `ă` không đi sau nguyên âm khác | Bị từ chối |
| 8.13 | `text`, `user`, `push`, `window`, `luxury`, `sway`, `manjaro` | `COMMON_ENGLISH_WORDS` + `ENGLISH_TELEX_TRAPS` | Bẫy va chạm Telex | Auto-restore ở delimiter |
| 8.14 | `as`, `is`, `os`, `us`, `of`, `if`, `or`, `test`, `rest`, `must` | `ENGLISH_PREFER_VIETNAMESE` | Ưu tiên Tiếng Việt trong câu thường | Không bị restore quá đà |
| 8.15 | `tesst`, `passs` | `toneCancelled` de-dup | Gõ lại phím dấu để lấy chữ `s` thô | Rút gọn về `test`, `pass` |
| 8.16 | `useState`, `UserController`, `snake_case`, `https://...`, `user@domain` | `isUrlOrEmailOrCode`, `isCamelOrPascalCase` | Code/URL/email không phải Tiếng Việt | Treo dấu hoàn toàn |
| 8.17 | `center` trong GitHub | `isDeveloperCheatContext` | Miền lập trình | Bypass toàn bộ |

### 8.1. – 8.3. Ba luật chánh tả kinh điển

Đã giải thích ở [mục 2.2–2.4](#22-quy-tắc-c--k). Đây là lý do bộ gõ \"biết\" rằng `center` là Tiếng Anh mà không cần tra mạng.

### 8.4. Cặp khép chưa biến hình

Đây là ca dễ nhầm nhất. `uo`, `ie`, `ye` là dạng **chưa hoàn chỉnh** khi có âm cuối. Phải nâng cấp trước khi nhận dấu:

| Gõ | Trạng thái | Kết quả đúng |
|---|---|---|
| `duon` | `uo` + `n`, chưa móc | `dươn` → `đươn` |
| `duong` + `s` | `uo` + `ng` + dấu | Bị chặn; phải gõ `uw` → `đường` (ngang) |
| `tien` + `s` | `ie` + `n` + dấu | Bị chặn; phải `tiên` + `s` → `tiến` |
| `chuyen` + `s` | `ye` + `n` + dấu | Bị chặn; phải `chuyên` + `s` → `chuyến` |
| `chuyen` + `f` | `ye` + `n` + dấu | Bị chặn; phải gõ `chuyeen` + `f` → `chuyền` |

Khi parser thấy `uo/ie/ye` + coda + dấu ở trạng thái hoàn tất, `isValid()` trả `false`. Ở delimiter, `checkAutoRestore()` trả lại phím thô thay vì để lại một chữ sai chánh tả.

### 8.5. \"Canh gác ngữ âm tự nhiên\"

Ngay cả khi `phonologyRules` bị tắt, `processKey()` vẫn có các early return cho URL/email/code và không tạo dấu từ token không có nguyên âm. `spellCheck` (mặc định `false` theo `DEFAULT_SETTINGS` để ưu tiên tốc độ) khi bật sẽ gọi `checkWordSpelling()` tra cứu ~6.700 âm tiết + từ điển riêng.

Thứ tự ưu tiên của `checkWordSpelling()`:

1. Từ điển người dùng (whitelist cao nhất).
2. Từ viết tắt ALL-CAPS có `Đ` (`ĐN`, `HĐ`, `UBND`, `ĐHQG`).
3. Bộ âm tiết Hunspell + mở rộng.
4. Chuỗi ASCII thuần (`test`, `fast`, `chat`, `ok`) → luôn hợp lệ.

### 8.13. Auto-restore Tiếng Anh

Khi bấm Space/dấu câu, `checkAutoRestore()` quyết định có trả lại chữ Latin hay không:

- Nếu raw nằm trong `COMMON_ENGLISH_WORDS` / user dictionary → restore.
- Nếu dạng có dấu **là âm tiết Tiếng Việt hợp lệ** → giữ dấu, trừ khi raw là trap rõ ràng (`text` → `têt` vẫn trả `text`).
- Nếu raw có số (VNI) → bỏ qua restore.
- Nếu raw là từ Tiếng Anh có đuôi `-ing/-ed/-er/-or/-s/-es/-ly` → restore.
- Nếu cấu trúc có cụm phụ âm/coda ngoại lai → restore.

`sway` và `manjaro` nằm trong `COMMON_ENGLISH_WORDS` vì là hai ca va chạm kinh điển với luật `w` và luật Telex `aa`.

---

## 9. Từ điển, ngoại lệ và danh sách bẫy

### 9.1. Bốn lớp dữ liệu

`vietnamese-words.js` ghép bốn nguồn vào một `Set` duy nhất qua `getVietnameseWordSet()`:

| Lớp | Nguồn | Ví dụ |
|---|---|---|
| Lõi | Hunspell Tiếng Việt (Hồ Ngọc Đức / OpenOffice / xKey), ~6.700 âm tiết | `bác`, `toán`, `được`, `nghiêng` |
| Âm tiết hiếm / địa danh | `RARE_AND_PLACE_SYLLABLES` | `đắk`, `krông`, `păh`, `m'đrắk`, `kar`, `mil` |
| Phương ngữ | `SOUTHERN_DIALECT_SYLLABLES` | `dzô`, `dzậy`, `gởi`, `chánh`, `nhứt`, `thiệt` |
| Khẩu ngữ | `MODERN_SLANG_AND_COLLOQUIAL_SYLLABLES` | `xò`, `xịn`, `quẩy`, `ngáo`, `phèn` |

`canon()` chuẩn hóa NFC, gộp dấu nháy cong về `'` rồi lowercase — nhờ vậy `M'Đrắk`, `M’Đrắk`, `MʼĐrắk` là cùng một khóa.

### 9.2. Từ điển người dùng

`UserDictionary` lưu:

- Từ người dùng thêm trong Options.
- Từ tự học được sau khi xóa cả từ có dấu nhiều lần (`eraseHabitThreshold`, mặc định 3).
- Mặc định chứa toàn bộ `COMMON_ENGLISH_WORDS`.

`isCustomUserWordPrefix()` bảo vệ prefix của từ riêng: nếu bạn đã dạy bộ gõ \"sas\" là từ của bạn, thì khi gõ `s`, `sa`, `sas` engine không vội bỏ dấu.

### 9.3. Bẫy Telex

`ENGLISH_TELEX_TRAPS` chứa các từ mà gõ bằng Telex tạo ra dạng có dấu trông \"rất Việt\" nhưng thực chất là Tiếng Anh: `text → têt`, `user → úẻ`, `push → púh`, `expect → ëpct`, `luxury → lủuy`, `window → ưindoư`, `modern → modẻn`.

`DIRECT_REVERSE_TRAPS` là bảng ánh xạ ngược từ dạng đã dính dấu về chữ gốc: `têt → text`, `púh → push`, `mĩed → mixed`, `ẽpect → expect`, `ưork → work`.

`ACCENT_TO_RAW_TELEX` là bảng chung: `á → as`, `ắ → aws`, `ấ → aas`, `ơ → ow`, `ư → uw`, `đ → dd`...

### 9.4. Từ ưu tiên Tiếng Việt

`ENGLISH_PREFER_VIETNAMESE` chứa `as, is, os, us, of, if, or, conf, must, rust, rest, test, cast, past, cost, post, host, lost, fast, dust, best, this, these, case, care, base, dose, rose, fuse, nose`.

Mục đích: nếu mọi từ Tiếng Anh ngắn đều bị restore, câu Tiếng Việt tự nhiên sẽ hỏng (`as` → `as` thì ổn, nhưng `of` → `of` cũng ổn; nguy hiểm là `rest` → `rest` trong khi người dùng muốn `rết`). Bộ lọc này nghiêng về Tiếng Việt cho các ca thông thường.

---

## 10. Cờ cấu hình: cái nào bật, cái nào tắt, cái nào luôn chạy

| Cờ | Mặc định | Ảnh hưởng tới quy tắc trong tài liệu này |
|---|---|---|
| `method` | `3` (AUTO) | Chữ → Telex, số → VNI |
| `toneStyle` | `'classic'` | Mục 6: `hòa` hay `hoà` |
| `phonologyRules` | `true` | Bật ba luật c/k, g/gh, ng/ngh + foreign onset + checked tone |
| `spellCheck` | `false` | Tra cứu từ điển khi bỏ dấu |
| `quickConsonants` | `false` | `f→ph`, `j→gi`, `w→qu`, `g/h/k→ng/nh/ch` |
| `quickTelex` | `true` | `cc→ch`, `gg→gi`, ... |
| `wToUEnabled` | `true` | Mục 7.2: tắt là mọi `w` literal |
| `typeW2U` | `true` (nội bộ) | Ép Non-Start, không hiện trên UI |
| `smartHorn` | `true` | Mục 7.3: `uo/uu` → `ươ/ưu` |
| `autoRestoreEnglish` | `true` | Mục 8.13 |
| `escRevert` | `true` | `Escape` trả phím thô |
| `autoHarmonizeCase` | `false` | Sửa `ĐƯợc → Được`; không đụng camelCase/ALL CAPS |
| `eraseHabitLearning` | `true` | Học từ khi xóa lặp |
| `blacklistedDomains` | `[]` | Tắt hẳn IME trên tên miền cụ thể |
| `markdownCodeLock` | `false` | Khóa dấu trong fence Markdown |

**Luôn chạy bất kể cờ:** early return cho OFF, cho `wToUEnabled=false`, cho URL/email/code/camelCase; `processKey()` không tạo dấu khi không có phím hợp lệ; `canon()`/NFC ở mọi đầu ra.

---

## 11. Mười ca gõ đi dây

### Ca 1 — `toans` → `toán`

```text
t   onset t
o   nucleus o
a   nucleus oa (glide o, nucleus a)
n   coda n → parse 'toan'
s   dấu Sắc. Có coda → không có ơ/ê/ô/â/ă → dấu vào 'a' → 'toán'
```

### Ca 2 — `tó` + `a` + `n` → `toán`

```text
tó   từ mở, dấu tạm trên o
tóa  thêm a, vẫn mở, cổ điển giữ dấu trên o
toán thêm n → closed → dời dấu sang a
```

### Ca 3 — `dduocw` → `được`

```text
dd    → đ
u     → u
o     → o
c     → coda c  (dạng uo chưa móc, nhưng chưa có dấu nên tạm ổn)
w     → SmartHorn thấy uo|c → nâng thành ươ|c → 'được'
```

### Ca 4 — `thw` với `wToUEnabled`

```text
Bật  → thư   (sau consonant, w = ư)
Tắt  → thw   (literal)
`web` ở đầu từ → web trong cả hai chế độ (Non-Start)
```

### Ca 5 — `sway` + Space

```text
s → s
w → có thể tạm thành ư trong luồng Telex
a, y → ...
Space → raw 'sway' nằm trong COMMON_ENGLISH_WORDS → trả 'sway'
```

`manjaro` đi theo cơ chế tương tự.

### Ca 6 — `text` + Space

```text
t e x t → 'têt' (x là phím Ngã, đậm vào e)
Space → raw 'text' ∈ ENGLISH_TELEX_TRAPS → restore 'text'
```

### Ca 7 — `center`

```text
c e → hasCkPhonologyViolation = true
mọi phím dấu sau đó đều pass-through
Kết quả: 'center', không phải 'cênter'
```

### Ca 8 — `fcitx5`

```text
Không có nguyên âm Tiếng Việt trong 'fcitx'
Coda 'tx' nằm trong internal cluster list
→ không bao giờ nhận dấu; '5' được giữ nguyên
```

### Ca 9 — `xông` + `o` → `xoong`

```text
xông có ô + coda ng
 late vowel shaping thấy key 'o' lặp lại với ô|ng
 → tách thành 'oo' + tone trên chữ o thứ hai → 'xoòng'
 (tương tự: boong, goong, xoọng)
```

### Ca 10 — `tieengs` → `tiếng`

```text
Word Rescue: t i e e n g s
 → 'tieeng' + s (Sắc)
 → iê + coda n → dấu vào ê → 'tiếng'
```

---

## 12. Bản đồ mã nguồn

| File | Trách nhiệm ngữ âm | Hàm/đối tượng chính |
|---|---|---|
| `src/engine/key-codes.js` | Bảng phím Telex/VNI, delimiter, phát hiện code | `TELEX_KEYS`, `VNI_KEYS`, `TONE_STYLE`, `isUrlOrEmailOrCode` |
| `src/engine/config.js` | Mặc định toàn hệ thống | `DEFAULT_SETTINGS` |
| `src/engine/syllable-parser.js` | Bóc âm tiết 5 phần, kiểm tra hợp lệ, reconstruct dấu | `ParsedSyllable.isValid()`, `.reconstruct()`, `parseSyllable()` |
| `src/engine/avim.js` | Máy trạng thái gõ phím | `processKey()`, `checkTone()`, `getTargetVowelIndex()`, `applyTelexW()` |
| `src/engine/dictionary.js` | Chánh tả, từ bẫy, auto-restore | `hasPhonologyViolation()`, `shouldAutoRestoreEnglish()`, `checkWordSpelling()` |
| `src/engine/vietnamese-words.js` | Kho âm tiết + ngoại lệ | `getVietnameseWordSet()`, `canon()`, `RARE_AND_PLACE_SYLLABLES` |
| `src/engine/casing.js` | Đồng nhất hoa/thường | `harmonizeSyllableCase()` |
| `src/engine/autocomplete.js` | Gợi ý từ/bigram | `AutoCompleteEngine` |
| `test/ime-edge-cases.test.mjs` | Kiểm tra các ca ngữ âm trong tài liệu này | `node:test` |

---

## 13. Tóm tắt thuật ngữ

| Thuật ngữ | Nghĩa ngắn gọn |
|---|---|
| **Âm tiết** | Một nhịp nói, thường là một chữ Tiếng Việt |
| **Onset / âm đầu** | Phụ âm(me) mở đầu âm tiết (`tr` trong `trong`) |
| **Glide / âm đệm** | Âm trượt `u`/`o` giữa âm đầu và âm chính (`u` trong `quán`) |
| **Nucleus / âm chính** | Đỉnh âm thanh, nơi đặt dấu (`a` trong `toán`) |
| **Coda / âm cuối** | Phụ âm hoặc bán nguyên âm khép lại (`n` trong `toán`) |
| **Tone / dấu thanh** | Thuộc tính cao độ của cả âm tiết |
| **Âm khép** | Âm tiết có coda tắc `c/ch/p/t`; chỉ Sắc/Nặng |
| **Âm mở** | Âm tiết không có coda; mọi dấu đều được |
| **Offglide** | Nguyên âm cuối trong cặp như `ai`, `ao`, `ây`; không nhận dấu |
| **Dấu cũ / classic** | `hòa, hóa, thủy, khỏe` — dấu trên âm đệm |
| **Dấu mới / modern** | `hoà, hoá, thuỷ, khoẻ` — dấu trên âm chính |
| **Dời dấu động** | Dấu tự chuyển chỗ khi cấu trúc âm tiết đổi |
| **Chánh tả** | Tập hợp quy tắc viết đúng Tiếng Việt |
| **Bẫy Telex** | Từ Tiếng Anh bị Telex biến thành dạng có dấu (`text → têt`) |
| **Auto-restore** | Trả lại chữ Latin gốc khi bấm delimiter |
| **Word Rescue** | Chuyển cả chuỗi thô sang có dấu khi bật/tắt IME |

---

## 14. Học lại từ số không: bốn lớp của một chữ

> Nếu bạn đọc đến đây mà thấy các từ *onset, nucleus, coda* vẫn còn xa lạ, đọc kỹ mục này trước. Mục này không thêm quy tắc mới; nó chỉ xếp lại những quy tắc bạn đã đọc thành bốn cái hộp dễ nhớ.

### 14.1. Bốn lớp chồng lên nhau

Một chữ hiện ra trên màn hình đi qua **bốn lớp**. Nhầm lẫn giữa chúng là nguồn của rất nhiều bug và cũng là lý do người mới thấy tài liệu ngữ âm \"khó hiểu\".

| Lớp | Câu hỏi lớp đó trả lời | Ví dụ | Ai quan tâm |
|---|---|---|---|
| 1. Âm thanh | Miệng phát ra cái gì? | `c` và `k` cùng phát âm /k/ | Nhà ngữ âm học |
| 2. Chữ viết | Viết bằng chữ cái nào? | `ca` nhưng `kê` — cùng /k/, khác chữ | Người viết chánh tả |
| 3. Mã hoá | Máy tính lưu số nào? | `ế` là U+1EBF, hoặc `e` + U+0302 + U+0301 | Lập trình viên Unicode |
| 4. Phím gõ | Ngón tay bấm phím nào? | Telex `ee` → `ê`; VNI `6` → `â/ê/ô` | Người làm IME |

**Bốn lớp này không trùng nhau.** Đây là câu quan trọng nhất của mục 14.

Ví dụ đi bộ qua bốn lớp:

```text
Bạn bấm:  t o a n s ␣          (lớp 4: phím)
Engine hiểu: onset t, nucleus oa, coda n, tone Sắc   (lớp 2 + cấu trúc)
Máy lưu:  t o á n              (lớp 3: NFC, "á" là U+00E1)
Miệng đọc: /toán/ với cao độ rising                  (lớp 1)
```

Bộ gõ của chúng ta làm việc chủ yếu ở **lớp 2 và 4**. Nó phải \"giả vờ\" biết lớp 1 để quyết định chuỗi nào đáng tin, và phải xuất ra lớp 3 đúng chuẩn để trình duyệt không hiển thị dấu lệch.

### 14.2. Một chi tiết Unicode đáng nhớ: `đ` khác với các chữ có dấu

Chạy thử trong Node hoặc trình duyệt:

```js
'ế'.normalize('NFD') // 'e' + ◌̂ + ◌́  → 3 code point
'ă'.normalize('NFD') // 'a' + ◌̆       → 2 code point
'đ'.normalize('NFD') // 'đ'            → vẫn 1 code point
```

Giải thích:

- `ế`, `ă`, `ơ` có dạng **tách dấu** (NFD). Dấu mũ, dấu trăng, dấu móc là các code point riêng.
- `đ` là **một chữ cái riêng** (U+0111), không phải `d` cộng với một dấu gạch ngang. Normalize không tách được nó.

Hệ quả trong code:

- `word-boundary.test.js` phải đếm cả combining mark khi lùi con trỏ, nếu không Backspace sẽ cắn mất nửa chữ `ế`.
- `d` và `đ` là hai chữ khác nhau, nên `dd → đ` là phép **đổi chữ**, không phải \"thêm dấu\". Đó là lý do `d9` trong VNI hoạt động còn `d` + dấu mũ thì không.

### 14.3. Dấu thanh không phải \"dấu phụ âm\"

Nhiều người mới nghĩ `má` là `ma` cộng thêm một dấu giống như `ă` là `a` cộng thêm dấu. Nghĩ vậy sẽ dẫn đến bug.

| | Dấu phụ âm / dấu hình chữ (mark) | Dấu thanh (tone) |
|---|---|---|
| Đổi cái gì? | Chính **chữ cái** | Cái **cao độ của cả âm tiết** |
| Ví dụ | `a → ă`, `o → ô`, `d → đ` | `ma → má`, `ma → mà` |
| Có bao nhiêu? | 4 loại: mũ, trăng, móc, gạch ngang | 6 thanh (1 không dấu + 5 có dấu) |
| Nằm ở đâu? | Dính vào chữ cái | Dính vào âm tiết, nhưng **ký hiệu** đặt trên một nguyên âm |
| Trong engine | `Mark` trong `Letter` | `Tone` trong `Word` |

Ngo Như Bình (2006, mục 3.4.2) định nghĩa Tiếng Việt là ngôn ngữ có thanh điệu: sự đổi cao độ làm đổi nghĩa. Kirby (2011) bổ sung rằng ở Hà Nội, cao độ không phải là tín hiệu duy nhất — **chất giọng** (glottalization ở `ngã`/`nặng`, hơi thở ở `huyền`/`hỏi`) cũng quan trọng. Đây là lý do tài liệu này luôn nói \"dấu thanh thuộc âm tiết\", chứ không phải \"dấu thanh thuộc nguyên âm\".

### 14.4. Vì sao có 5 dấu mà tài liệu nói 8 thanh?

Không mâu thuẫn. Đây là hai cách đếm:

- **Cách viết (chúng ta dùng):** 6 thanh = ngang (không dấu) + sắc + huyền + hỏi + ngã + nặng. Engine lưu `tone` từ 0 đến 5.
- **Cách phân tích của Kirby (2011) cho Hà Nội:** **8 thanh** = 6 thanh ở âm tiết mở/âm tiết kết bằng âm vang + 2 thanh \"khép\" chỉ xuất hiện trước âm tắc cuối không thoát hơi (`p/t/k`).

| Âm tiết mở / cuối mũi | Tương đương khép | Dấu viết |
|---|---|---|
| `ma` (ngang) | — | không dấu |
| `mà` (huyền) | — | huyền |
| `má` (sắc) | `mát` (sắc khép) | sắc |
| `mạ` (nặng) | `mạt` (nặng khép) | nặng |
| `mả` (hỏi) | — | hỏi |
| `mã` (ngã) | — | ngã |

Bảng trên giải thích **luật âm khép** bạn đã đọc ở mục 3.2: `c/ch/p/t` chỉ nhận Sắc hoặc Nặng. Không phải bộ gõ \"kiêng kỵ\" dấu Huyền — mà vì trong hệ thống thanh học, âm khép **chỉ có** hai thanh đó. Engine chỉ viết lại sự thật đó thành một điều kiện `if`.

### 14.5. Ngắn/dài: tại sao `ă` và `â` cần âm cuối

Haudricourt (1952) mô tả hệ thống nguyên âm gồm:

- **Hai nguyên âm ngắn**: `ă` [ă] và `â` [ɤ̆].
- **Mười hai nguyên âm \"đầy\" (dài)**, xếp theo ba cột trước / giữa / sau của bảng gốc: `i, iê, ê, e` · `ư, ươ, ơ, a` · `u, uô, ô, o`.

Điểm then chốt ông nêu: **nguyên âm ngắn không đứng riêng ở cuối âm tiết**; nó bị \"gắn chặt\" vào phụ âm đi sau. Nghĩa là:

```text
đúng:  ăng, âm, ăc        (có coda đi sau)
không chuẩn: *ă, *â đứng một mình ở cuối từ
```

Đây chính là nguồn gốc của rule trong `syllable-parser.js` mà bạn đã thấy ở mục 3.3: `ă/â` bị từ chối khi âm tiết hoàn tất mà không có coda. Bộ gõ không \"từ chối người dùng\" — nó đang phản chiếu một đặc trưng ngữ âm có thật từ năm 1952.

> ⚠ Đừng suy diễn ngược: \"có coda thì `ă` chắc chắn hợp lệ\". Vẫn còn các điều kiện khác (ân đầu đi được với `ă` không, tổ hợp có nằm trong whitelist không...). Ngữ âm là tập điều kiện, không phải một câu.

### 14.6. Tám âm cuối thật, nhiều hơn tám cách viết

Kirby (2011) đếm **8 âm cuối** trong tiếng Hà Nội:

```text
3 âm tắc không thoát hơi: /p/ /t/ /k/
3 âm mũi:                /m/ /n/ /ŋ/
2 âm trượt:              /j/ /w/
```

Trong khi đó bảng coda của engine (`§3.1`) có tới 9 mục viết: `''`, `c`, `ch`, `m`, `n`, `ng`, `nh`, `p`, `t`. Lý do: **một âm có thể có nhiều cách viết**.

| Âm (m miệng) | Cách viết thường gặp | Ghi chú |
|---|---|---|
| /ŋ/ | `ng`, `nh` | Haudricourt chỉ ra `nh` chỉ thật sự khác `ng` trong vài vần như `inh`, `ênh`, `anh` |
| /j/ | `i`, `y` cuối từ | `tai`, `tay` cùng âm cuối |
| /w/ | `u`, `o` cuối từ | `tâu`, `tào` cùng âm cuối |
| /t/, /k/ | `t`/`ch`, `c`/`k` | Phụ thuộc vần và vùng phương ngữ |

Kết luận thực tế: khi bạn thấy engine chấp nhận cả `ng` lẫn `nh`, đừng tưởng nó \"buông rule\". Nó đang dùng **bảng chánh tả**, vốn rộng hơn bảng âm thanh.

---

## 15. Cổng kiểm tra: vì sao không tin vào danh sách từ khác

### 15.1. Ba cách xử lý va chạm phím

Sách *Dokey: Engineering a Vietnamese Input Method* (chương 5) đặt vấn đề rất sáng tỏ: nếu bộ gõ cứ áp dấu mọi lúc, thì `windows` — chữ có `w`, `s`, `o+w` — sẽ bị biến thành dấu Tiếng Việt. Tác giả nêu ba cách xử lý (chúng ta chỉ paraphrase ý, không chép lại văn bản):

| Cách | Làm gì | Điểm yếu |
|---|---|---|
| Tắt bộ gõ thủ công | Người dùng tự bấm nút | Đổ công việc cho người dùng |
| Giữ danh sách từ khác | Gặp `windows` thì thôi | Chỉ đúng những từ có trong danh sách; hỏng với tên riêng, mã nguồn |
| **Cổng kiểm tra ngược** | Chỉ tạo dấu nếu chuỗi **có thể là âm tiết Tiếng Việt** | Vẫn bỏ sót ca mà phím gõ trùng âm tiết Việt |

OpenViet dùng **cả ba**, xếp theo lớp:

```text
1. Cổng Tiếng Việt  → phonologyRules + syllable-parser.isValid()   (chính)
2. Danh sách bẫy    → COMMON_ENGLISH_WORDS + userDictionary        (bổ sung)
3. Thoát nhanh      → OFF / blacklistedDomains / code guard        (cuối cùng)
```

Lớp 1 là ý của Dokey. Lớp 2 là vì môi trường trình duyệt không cho ta biết đang gõ ở ô nào (xem §15.3). Lớp 3 là nút bấm \"đừng can thiệp nữa\".

### 15.2. Prefix \"khớp chính xác\" và prefix \"có thể trở thành\"

Đây là chi tiết hay nhất của chương 5.3 trong sách Dokey, và nó giải thích một hành vi bạn từng thấy: **gõ dấu trước, hình dáng chữ cái đến sau vẫn được nhận**.

| Khái niệm | Nghĩa đơn giản | Ví dụ |
|---|---|---|
| Khớp chính xác | Chuỗi hiện tại đã là một âm tiết/đầu âm tiết hợp lệ | `đuoc` → không khớp; `đươc` → khớp |
| Có thể trở thành | Nếu thêm dấu móc vào `o`, chuỗi sẽ hợp lệ | `đuoc` → có thể trở thành `đươc` |

Áp dụng vào ca `dduocjw`:

```text
dd u o c    → đang là "đuoc" (chưa hợp lệ vì thiếu móc)
j           → dấu Nặng đến TRƯỚC chữ w
              engine hỏi: "đuoc + dấu nặng có thể trở thành âm tiết không?"
              có → đuoc + Nặng, tạm thời
w           → vếo o thành ơ → "được", dấu Nặng tự ngồi đúng chỗ
```

Nếu engine chỉ biết \"khớp chính xác\", ca này sẽ bị từ chối và bạn phải gõ lại theo đúng thứ tự. Rule \"có thể trở thành\" chính là tinh thần của `checkDynamicToneShift()` trong `avim.js`.

### 15.3. Điểm khác biệt giữa Dokey và OpenViet

Dokey chạy trên macOS/Windows và biết ứng dụng nào đang nhận phím. OpenViet là content script, chạy trong trang web. Nó không biết bạn đang gõ ở ô tìm kiếm GitHub hay ô chat Telegram — trừ khi bạn cấu hình domain.

Hệ quả:

| Tình huống | Dokey (theo sách) | OpenViet |
|---|---|---|
| `test` | Cổng từ chối vì `tét` là âm tiết được phép → gõ ra `tét` | Nhận ra `test` là bẫy quen thuộc → trả `test` khi bấm Space |
| Tên riêng lạ | Giữ nguyên (không phải âm tiết) | Giữ nguyên; nếu lỡ dính, thêm vào từ điển riêng |
| Đang gõ code | Cấu hình theo ứng dụng | `isUrlOrEmailOrCode`, camelCase guard, `blacklistedDomains` |

Sách Dokey thừa nhận cổng \"không cứu được\" khoảng 74 từ Tiếng Anh có phím trùng âm tiết Việt (con số đo trên corpus của riêng họ). OpenViet giải quyết phần đó bằng danh sách bẫy. **Hai cách không mâu thuẫn; chúng chạy ở hai lớp khác nhau.**

### 15.4. Cổng không làm được gì

Ghi nhớ ba dòng này để khỏi đổ lỗi sai chỗ khi có bug:

1. Cổng không biết **ý định** của bạn. `this` có thể là `thí`; chỉ bạn mới biết.
2. Cổng không thay thế **từ điển riêng**. Tên công ty, mã màu, mã giảm giá — thêm vào user dictionary.
3. Cổng không chạy khi bạn tắt `phonologyRules`. Lúc đó chỉ còn bẫy + code guard; bạn sẽ thấy `center → cênter` trở lại.

---

## 16. Dấu được tính toán, không được lưu cứng

### 16.1. Hai cách lưu một từ

Chương 4 và 6 của sách Dokey phân biệt rõ:

| Cách | Làm gì | Hậu quả |
|---|---|---|
| Dán dấu vào chữ cái ngay khi bấm phím | `hoaf` → chữ `o` mang dấu huyền | Sau đó gõ `n`, phải **dời** dấu từ `o` sang `a`. Mỗi rule đổi nguyên âm lại phải nhớ dời. |
| Lưu một `Tone` cho cả từ, tính vị trí khi hiển thị | `hoaf` → Word{chữ:`hoa`, tone:Huyền} | Gõ `n` → render lại từ đầu → dấu tự đứng ở `a`. **Không có gì phải dời.** |

OpenViet chọn cách thứ hai. Hàm `getTargetVowelIndex()` trong `src/engine/avim.js` được gọi lại mỗi lần render, chứ không phải một lần khi bấm phím dấu.

### 16.2. Tự tay trace một ca

Gõ `toans` trong Telex, theo dõi trạng thái `Word`:

```text
t        Word{ t,                tone: none }
o        Word{ to,               tone: none }
a        Word{ toa,              tone: none }
n        Word{ toan,             tone: none }
s        Word{ toan,             tone: ACUTE }
         render() → có coda 'n' → dấu vào nguyên âm cuối trước coda = 'a'
         → "toán"
```

Bây giờ thử thêm `g`:

```text
g        Word{ toang,            tone: ACUTE }
         render() lại từ đầu → coda mới là 'ng' → vẫn chọn 'a'
         → "toáng"
```

Không có dòng code nào \"kéo dấu từ chữ cũ sang chữ mới\". Chỉ có một hàm được gọi với một từ mới. Đây là lý do các ca `tóa + n → toán` (dời dấu động) và Backspace rồi gõ lại đều xanh cùng một lúc.

### 16.3. Cũ hay mới đều đúng — chỉ là hai quy ước

Sách Dokey chọn **modern làm mặc định** và cũng đưa ra traditional như tuỳ chọn. OpenViet chọn ngược lại: **classic làm mặc định** (`DEFAULT_SETTINGS.toneStyle = 'classic'`).

| Cặp | classic (OpenViet mặc định) | modern (tuỳ chọn) |
|---|---|---|
| `hoa` + Huyền | `hòa` | `hoà` |
| `khoe` + Hỏi | `khỏe` | `khoẻ` |
| `thuy` + Hỏi | `thủy` | `thuỷ` |

Đây là **khác biệt về sản phẩm**, không phải khác biệt về ngữ âm. Cả hai đều là chữ Tiếng Việt đúng. Khi đọc sách Dokey và thấy họ viết `hoà`, đừng sửa tài liệu của chúng ta — chỉ cần nhớ hai dự án chọn hai mặc định khác nhau.

---

## 17. Khi miệng nói một đằng, bàn phím gõ một nẻo

### 17.1. Bộ gõ viết chánh tả, không ghi âm thanh

Kirby (2011) ghi nhận ở Hà Nội hiện đại:

- `tr` và `ch` **đã nhập vào cùng một âm** /c/ (âm tắc vòm) với nhiều người nói trẻ.
- Có hiện tượng nhầm/lẫn `l` và `n` trong một số cộng đồng, mang sắc thái xã hội.
- `r` thường phát âm như /z/; một số từ mượn có /p/ riêng.

Ngo Như Bình (2006) thì nhấn mạnh tài liệu giảng dạy ở Mỹ từng dựa trên **giọng Hà Nội**, rồi giọng Sài Gòn trở thành chuẩn khác; hai giọng này khác nhau ở cách hiện thực hoá thanh `hỏi`/`ngã` và nhiều phụ âm.

OpenViet **không quan tâm** những khác biệt đó khi quyết định có bỏ dấu hay không. Lý do: bàn phím gõ `tr` hay `ch` là chuyện **chánh tả**; miệng đọc hai chữ đó giống nhau là chuyện **ngữ âm**. Nếu engine cố \"sửa theo phát âm\", nó sẽ phá vỡ văn bản viết.

### 17.2. Bảng \"đừng nhầm\" dành cho người mới

| Bạn thấy | Đừng nghĩ | Hãy nghĩ |
|---|---|---|
| `x` và `s` đọc gần giống nhau | Engine nên gộp lại | Chúng là hai chữ viết khác nhau |
| `hỏi` và `ngã` nhập âm ở miền Nam | Engine nên bỏ một dấu | Dấu vẫn là hai chữ khác nhau |
| `ng` và `nh` cuối từ nghe gần như nhau | Rule `ng/ngh` là thừa | Rule đó là quy tắc **viết**, vẫn cần cho chánh tả |
| `ă` là `a` có mũ ngược | Nó là dấu thanh | Nó là **chữ cái khác**, còn dấu thanh là thứ khác nữa |

Muốn đọc thêm phần này, xem mục **19** — có chỉ đúng chương/trang của từng PDF.

---

## 18. OpenViet và Dokey: mượn ý, không mượn code

`docs/references/dokey-book.pdf` là sách có bản quyền, mô tả một engine **khác** (Dokey 0.5.4, chạy macOS/Windows, viết C++). Chúng ta chỉ đọc để hiểu *vì sao* thiết kế, không chép code hay văn bản.

| Ý tưởng | Sách Dokey nói gì | OpenViet làm gì |
|---|---|---|
| Cổng kiểm tra | Chỉ sinh dấu nếu chuỗi có thể là âm tiết | `phonologyRules` + parser |
| Dấu tính khi render | Không lưu vị trí dấu trong từ | `getTargetVowelIndex()` mỗi lần render |
| Prefix tương thích | Nhận dấu đến trước cả khi chữ cái hình dáng chưa tới | Dynamic tone shift |
| Sửa đổi tối thiểu | Thay đúng đoạn chữ, đừng gõ lại cả ô | 4 adapter trong `text-replacer.js` |
| Mặc định kiểu dấu | modern | classic |
| Nền tảng | event tap / low-level hook + C API | Chrome/Firefox content script |

Kết luận: **đọc sách để hiểu nguyên lý, rồi đối chiếu với source của mình**. Đừng copy bảng hay đoạn văn vào repo.

---

## 19. Tài liệu tham khảo trong docs/references

Bốn file đầu là nền tảng đã catalog từ tháng 11/2026. Thư mục hiện có thêm nhiều PDF/docx/md do người bảo trì bổ sung; bảng [19.3](#193-nhóm-tài-liệu-mở-rộng-tháng-112026) phân loại nhóm mới, còn [19.4](#194-bài-học-áp-dụng-được-ngay) tóm tắt cái ta thực sự dùng được. Đây đều là tài liệu có bản quyền hoặc bài blog cá nhân: paraphrase có attribution, không copy nguyên văn vào repo. Bảng dưới đây là danh mục có chú thích, kèm \"đọc mục nào khi bạn đang hỏi cái gì\".

| File | Tác giả / nguồn | Đọc khi bạn hỏi |
|---|---|---|
| `dokey-book.pdf` | Do Huy Toan, *Dokey: Engineering a Vietnamese Input Method*, first edition 2026, DOI `10.5281/zenodo.24015181`. **Có bản quyền; chỉ tham khảo.** | \"Vì sao phải rebuild cả từ?\", \"Cổng kiểm tra hoạt động ra sao?\", \"Sửa text vào editor thì hỏng ở đâu?\" → chương 2, 4, 5, 6, 8 |
| `Haudricourt1952_ShortVowels.pdf` | André-Georges Haudricourt, \"The short vowels of Vietnamese\" (1952), bản dịch Alexis Michaud 2017, HAL `halshs-01631474` | \"Sao `ă`/`â` cần âm cuối?\", \"Sao `nh` và `ng` vừa giống vừa khác?\" → phần đầu, bảng 2 |
| `S0025100311000181a.pdf` | James P. Kirby, \"Vietnamese (Hanoi Vietnamese)\", *JIPA* 41(3), 2011, DOI `10.1017/S0025100311000181` | \"Có bao nhiêu nguyên âm/âm cuối/thanh?\", \"Tone là cao độ hay chất giọng?\" → mục Consonants, Vowels, Tones |
| `VN LLF Part I.pdf` | Binh N. Ngo (Ngô Như Bình), *The Vietnamese Language Learning Framework*, Part One, 2006 | \"Âm tiết gồm mấy phần?\", \"Tiếng Việt với Tiếng Anh khác nhau chỗ nào?\" → mục 3.4, 4.1 |

### 19.1. Cách đọc tài liệu học thuật mà không sợ

1. **Đọc bảng trước, đọc chữ sau.** Bảng 1 của Haudricourt, bảng Consonants/Vowels/Tones của Kirby chứa 80% giá trị.
2. **Bỏ qua ký hiệu IPA lần đầu.** Bạn không cần đọc được [ɤ̆] để hiểu \"đây là nguyên âm ngắn\". Đọc chữ `â` trong ngoặc là được.
3. **Tìm chữ \"however / but / except\".** Đó là chỗ tài liệu nói về ngoại lệ — và ngoại lệ là thứ hay gây bug.
4. **Đối chiếu ngay với code.** Đọc xong \"short vowels never in absolute final position\", mở `syllable-parser.js` tìm `isValid()` xem rule đó nằm ở dòng nào.
5. **Ghi lại khác biệt, không ghi chép lại nguyên văn.** Ví dụ: \"Sách dùng modern, mình dùng classic\". Đó là kiểu ghi chú có ích.

### 19.2. Bài tập tự kiểm tra chéo

| Câu hỏi | Tài liệu | Đối chiếu vào |
|---|---|---|
| \"Có mấy âm cuối trong Hà Nội?\" | Kirby, mục Finals | Bảng coda §3.1 — giải thích được vì sao số \"8\" và \"9\" cùng đúng |
| \"`ă` đứng một mình được không?\" | Haudricourt, đầu bài | `short vowel needs coda` trong parser |
| \"Dấu có được lưu trên chữ không?\" | Dokey chương 6 | `getTargetVowelIndex()` |
| \"Vì sao `centre`/`center` không dính dấu?\" | Dokey chương 5 + Ngo mục 3.4 | `hasCkPhonologyViolation()` |

Nếu trả lời được bốn dòng trên bằng lời của bạn (không cần đúng từng chữ), bạn đã hiểu hơn một nửa tài liệu ngữ âm này.

### 19.3. Nhóm tài liệu mở rộng (tháng 11/2026)

| Nhóm | File | Đọc khi nào / ghi chú |
|---|---|---|
| Chấm câu & viết hoa | `CachChamCau_2.pdf`, `dau_phay_trong_tv_7378.pdf`, `QUY_TC_VIT_HOA_TRONG_TING_VIT.docx`, `capitalised-in-Vietamese.pdf` / `.md`, `basic-principles-in-Vietnamese.md` | Dùng để đối chiếu **dấu câu có phải ranh giới từ không** và chữ đầu câu sau `. ? ! … :`. `CachChamCau_2.pdf` trích Duyên Hạc Lê Thái Ất (1996); bài viết hoa Tiếng Việt là của Khải Chính Phạm Kim Thư. |
| Gạch nối | `gach-noi-trong-TV.md` | Giải thích vì sao `-` từng dùng để gộp từ ghép (`độc-lập`, `bà-con`). Ta giữ `-` ở DELIMITERS nhưng không tự chèn gạch nối. |
| Chánh tả `i/y`, hỏi/ngã | `i_and_y_in_Vietnamese.md` (Đào Tiến Thi), `i-or-y.md`, `Phep-bo-dau-hoi-nga-trong-tieng-Viet-Dinh-Si-Trang.pdf` (Đinh Sĩ Trang, tái bản 2003, **có bản quyền**), `DautiengViet.pdf` | Đọc khi tự hỏi "có nên nhất loạt sửa `kĩ` thành `kỳ` không?" hay "vì sao `hóa`/`hoá` đều thấy". Câu trả lời ngắn: **không tự sửa**. Xem [19.4](#194-bài-học-áp-dụng-được-ngay). |
| Vần & ngữ âm đại chúng | `wa-van.pdf` (Trần Ngọc Dung, 2016), `is_VN_hard_VN.pdf` (Jack Halpern) | `wa-van.pdf` nói về cách ráp âm theo vần — đối chiếu với §4–§5 của tài liệu này. Bài của Halpern chỉ để giải thích cho người mới, không dùng làm rule. |
| Ngữ nghĩa / diễn ngôn (không đổi engine) | `1197-Fulltext-2897-1-10-20181124.pdf` (Nguyễn Vân Phổ, 2015), `TP_CHI_KHOA_HC_VN_D_NG_PHAP_VAN_BN.pdf` (Nguyễn Thanh Tùng, 2017), `PHNG_NG_XA_HI_VA_LI_TRONG_S_DNG_T.pdf`, `Phan_tich_din_ngon_BN_T._VIT_MR_DAN.docx`, `VietNguTruocSau1975.pdf` | Giúp hiểu ngữ cảnh và lời nói, nhưng **không** quy định việc đặt dấu. `VietNguTruocSau1975.pdf` là ý kiến cá nhân, không phải chuẩn chánh tả. |
| Sách scan, chưa có text layer | `Chúng Tôi Tập Viết Tiếng Việt - Nguyễn Hiến Lê.pdf` (325 tr.), `Vietnamese An Essential Grammar by Binh Ngo (z-lib.org).pdf` (335 tr.), `Vietnamese_elementary.pdf` (247 tr.) | `pdftotext` trả về gần như rỗng. Muốn dùng thì cần OCR; đều có bản quyền, chỉ tham khảo ý. |
| Corpus / artifact | `Hao_Nhien.md`, `colon.md`, `content` | `Hao_Nhien.md` là truyện ngắn, dùng làm corpus đọc thử. `colon.md` là bài Tiếng Anh về dấu hai chấm — **đừng áp rule Anh ngữ vào Tiếng Việt**. `content` chỉ là trang Cloudflare "Checking your browser" do tải hỏng; bỏ qua. |

### 19.4. Bài học áp dụng được ngay

1. **Dấu câu Tiếng Việt rộng hơn bộ delimiter cũ.** `dau_phay_trong_tv_7378.pdf` liệt kê dấu lửng `…` và dấu ngang `–`; `QUY_TC_VIT_HOA_TRONG_TING_VIT.docx` còn dùng `…` làm mốc xuống dòng. Vì vậy `…` và `–` đã được thêm vào `DELIMITERS` trong `src/engine/key-codes.js`, cùng test trong `url-code-guards.test.js`. `→` thì không phải delimiter.
2. **Chuẩn `i/y` chưa từng "đóng băng".** Đào Tiến Thi và `i-or-y.md` đều nhắc đến Quy định 1980 (nhất thể `i`) bị Quyết định 240/QĐ ngày 5-3-1984 bãi bỏ; các cặp như `kĩ/kỹ`, `công ti/công ty`, `Lí/Lý` vẫn có hai cách viết có lý do ngữ nghĩa. Engine vì thế **không tự đổi `i` ↔ `y`**; từ điển giữ cả biến thể, cùng tinh thần với việc giữ các biến thể của `gởi`.
3. **Dấu thanh cũng có hai trường phái.** `DautiengViet.pdf` dẫn `hóa/hoá`, `Thúy/Thuý`, `cửa/cuả` làm bằng chứng thiếu thống nhất. Đây là lý do tồn tại `TONE_STYLE.MODERN` và `TONE_STYLE.CLASSIC`; đừng xoá một trong hai.
4. **Lấp láy hỏi/ngã là rule ở mức từ ghép, không phải âm tiết.** Đinh Sĩ Trang gọi là luật Trầm Bổng: tiếng đầu không dấu/sắc/hỏi thì tiếng sau lấy dấu hỏi (`bảnh bao`, `cứng cỏi`); tiếng đầu huyền/nặng/ngã thì tiếng sau lấy dấu ngã (`dễ dàng`, `bì bõm`). OpenViet chỉ xử lý âm tiết đang gõ, nên **không** tự sửa cả cặp từ; ghi nhận để khỏi tưởng engine "sai rule".
5. **Viết hoa sau dấu câu vẫn là tuỳ chọn.** Nhiều tài liệu ở nhóm đầu nói chữ đầu câu sau `. ? ! … :` phải viết hoa, nhưng `autoCapitalizeProperNouns` vẫn mặc định tắt để tránh sửa văn bản người dùng. Đọc thêm [4.5](../REFERENCE_HANDBOOK.md#45-bảng-settings-đầy-đủ).

---

## 20. Nguồn ngữ âm trực tuyến đã kiểm chứng

Bốn PDF nền tảng trong `docs/references/` đã được liệt kê ở §19; nhóm mở rộng ở [19.3](#193-nhóm-tài-liệu-mở-rộng-tháng-112026). Dưới đây là các nguồn **trực tuyến, có thể truy cập được** để đi sâu hơn. Tất cả đã được kiểm tra đường dẫn vào tháng 11/2026. Chúng ta chỉ trích dẫn ý và số liệu; không copy nguyên văn vào repo.

| Nguồn | Đường dẫn | Đọc khi bạn hỏi | Ghi chú |
|---|---|---|---|
| Emerich 2012, *The Vietnamese Vowel System* | https://repository.upenn.edu/handle/20.500.14332/32396 | \"Có bao nhiêu nguyên âm? Sao tài liệu này nói 9, tài liệu kia nói 11 hay 14?\" | Luận văn Penn, **mở tự do**. Chương 2 có bảng 11 monophthong `/i e ɛ a ɐ ʌ ɤ ɯ u o ɔ/`; `/ɐ ʌ/` chỉ xuất hiện trong âm tiết khép |
| Nguyễn Đình-Hoà 1997, *Vietnamese: Tiếng Việt không son phấn* | DOI `10.1075/z.83` (John Benjamins), được Kirby và Emerich trích dẫn | \"Giọng Hà Nội chuẩn được mô tả ở đâu?\" | Sách tham khảo kinh điển; không nhất thiết có bản PDF mở |
| Vũ Thanh Phương, \"Phonetic properties of Vietnamese tones across dialects\" (1981/1982) | http://sealang.net/sala/archives/pdf8/vu1982phonetic.pdf | \"Ba giọng Bắc/Trung/Nam khác nhau chỗ nào?\" | So sánh thanh qua thực nghiệm; bảng 1 nêu rõ 6 thanh là lớp nền chung |
| Andrea Hoa Pham, \"Vietnamese tone: Tone is not pitch\" (2001) và bài 2009 | https://twpl.library.utoronto.ca/index.php/twpl/article/download/6803/3844/10796 | \"Ngoài cao độ còn tín hiệu gì? Sao có 8 thanh?\" | Nhấn mạnh glottalization, /ʔ/ đầu âm tiết, và hai thanh khép `sắc2/nặng2` |
| Macken & Nguyễn 2006, \"Nói lái and the structure of the syllable\" | http://sealang.net/archives/ltba/pdf/LTBA-29.2.1.pdf | \"Âm tiết, âm đầu, vần có thật trong đầu người không?\" | Dùng nói lái để chứng minh cấu trúc âm tiết có thật, độc lập với chữ viết |
| ASHA, *Vietnamese Phonemic Inventory* | https://inte.asha.org/siteassets/uploadedfiles/multicultural/vietnamesephonemicinventory.pdf | \"Có bảng tóm tắt dễ đọc cho người mới không?\" | Bảng lâm sàng, dễ đọc; **không dùng để thay quy tắc chánh tả** của engine |
| Kirby 2011, bản trực tuyến | DOI `10.1017/S0025100311000181` · https://www.pure.ed.ac.uk/ws/files/589949/S0025100311000181a.pdf | \"Bảng IPA chuẩn nhất ở đâu?\" | Cùng bài với file local; bản Edinburgh dễ trích dẫn hơn |
| Haudricourt 1952, bản dịch 2017 | https://shs.hal.science/halshs-01631474 | \"Chuỗi nguyên âm ngắn có bằng chứng gì?\" | Cùng bài với file local; có HAL ID để cite |

### 20.1. Đừng hoảng khi số nguyên âm không trùng nhau

Bạn sẽ thấy **9** (Kirby), **11** (Nguyễn Đình-Hoà / Emerich), thậm chí **14 monophthong + 19 diphthong** (kết luận riêng của Emerich). Không bên nào \"sai\". Khác nhau là do **cách phân tích**: có người gom `/ɐ ʌ/` vào short vowel của `/a ɤ/`, có người tách riêng; có người xếp `iê/ươ/uô` vào diphthong, có người xếp vào \"contour vowel\" cùng nhóm với monophthong.

Điểm thực tế cho chúng ta:

- Engine **không cần chọn** một con số. Engine chỉ cần bảng **chữ cái được phép** và điều kiện đi kèm.
- Khi tài liệu nói `/ɐ ʌ/ chỉ ở âm tiết khép`, hãy dịch sang ngôn ngữ code: `ă/â` cần coda.
- Khi tài liệu nói `iê` và `ia` là hai cách viết của cùng một diphthong, hãy dịch sang: `iê` ở giữa, `ia` ở cuối (`iên` nhưng `gia`).

### 20.2. Ba bài học mang về cho bộ gõ

1. **Thanh không chỉ là cao độ.** Pham (2001) và Kirby (2011) đều nói đến chất giọng. Vì vậy dấu `ã`/`ạ` không nên bị coi là \"dấu thanh y hệt sắc, chỉ khác độ cao\".
2. **Cấu trúc âm tiết có thật, không phải phát minh của lập trình viên.** Macken & Nguyễn dùng nói lái để chứng minh điều đó. Mô hình 5 trường của `ParsedSyllable` vì thế không phải \"tiện tay chia cho dễ code\".
3. **Phương ngữ là lớp trên cùng.** Vũ Thanh Phương so sánh ba vùng; engine đứng ở lớp **chánh tả**, nên mọi biến thể vẫn viết ra cùng một chuỗi dấu.

---

## 21. Mã hoá, Unicode và RFC 1456

### 21.1. UAX #15 — chuẩn hoá không chỉ là \"đổi dạng\"

Unicode Standard Annex #15 (https://www.unicode.org/reports/tr15/, phiên bản 18.0/Rev.58, tháng 8/2026) định nghĩa bốn dạng:

| Dạng | Tên đầy đủ | Nghĩa ngắn |
|---|---|---|
| NFD | Canonical Decomposition | Tách chữ thành gốc + dấu |
| NFC | Decomposition + Composition | Ghép lại thành một code point khi có thể |
| NFKD | Compatibility Decomposition | Tách cả dạng \"tương đương về hiển thị\" |
| NFKC | Compatibility + Composition | Ghép sau khi tách tương thích |

Hai chi tiết UAX #15 nhấn mạnh mà tài liệu này chưa từng nói trước đây:

- **W3C khuyến NFC cho nội dung Web** để tránh hai chuỗi \"nhìn giống hệt\" nhưng so sánh khác nhau.
- **Các dạng chuẩn hoá không đóng dưới phép nối chuỗi.** Nghĩa là `X` và `Y` đã chuẩn hoá nhưng `X + Y` chưa chắc đã chuẩn. Lý do: dấu tổ hợp có thứ tự `ccc` riêng và có thể sắp xếp lại ở đường nối.

Hệ quả trực tiếp cho OpenViet: khi `text-replacer.js` cắt một đoạn rồi chèn đoạn khác vào DOM, **đường nối** là chỗ cần cẩn thận. Các test trong `word-boundary.test.js` (Backspace trên `ế`, giữ dính dấu) đang canh đúng chỗ này. Không cần normalize cả ô — chỉ cần không làm rơi combining mark ở ranh giới.

### 21.2. `String.prototype.normalize()` trong JavaScript

API chính thức: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize .

```js
'ế'.normalize('NFC')  // 'ế'          — 1 code point
'ế'.normalize('NFD')  // 'e' + ◌̂ + ◌́ — 3 code point
'đ'.normalize('NFD')  // 'đ'          — vẫn 1 code point
```

Chạy lại đoạn này mỗi khi bạn nghi ngờ một ca lỗi \"cùng nhìn mà khác code\". So sánh bằng `===` mà không normalize là cách kinh điển để \"mất dấu\" oan.

### 21.3. RFC 1456 (1993): tiền lệ của mọi bộ gõ dấu sau chữ

https://www.rfc-editor.org/rfc/rfc1456 mô tả VIQR — cách gõ Tiếng Việt bằng 7-bit ASCII. Ý chính:

- Dấu được viết **sau chữ cái gốc**, bằng ký tự gợi nhớ: `(` = trăng, `^` = mũ, `+` = móc, `'` = sắc, `` ` `` = huyền, `?` = hỏi, `~` = ngã, `.` = nặng.
- RFC có cơ chế **thoát** để tránh gõ nhầm. Ví dụ kinh điển: câu Tiếng Anh `How are you?` có thể bị hiểu nhầm thành `yo` + `u?` → `yủ`; vì vậy cần escape.

Đọc kỹ hai dòng trên và bạn sẽ nhận ra: **đây chính là bài toán `text` → `tẽt`, `you?` → dấu hỏi lạc vào chữ, và delimiter của OpenViet**. Khác biệt chỉ là bảng phím (VIQR dùng dấu câu, Telex dùng `s f r x j w`), còn ý tưởng \"cần một ranh giới từ\" đã có từ năm 1993.

| VIQR (1993) | OpenViet 1.4.5 | Cùng giải quyết |
|---|---|---|
| Escape sau dấu câu | Delimiter: Cách/Enter/dấu câu | Không để dấu chạy sang từ khác |
| Gõ dấu sau chữ | Telex/VNI gõ dấu theo thứ tự tự do | Vẫn cần cổng kiểm tra âm tiết |
| 7-bit → precomposed | NFC output | Cùng đích: chữ hiển thị đúng |

### 21.4. Microsoft Vietnamese IME — đối chiếu nhanh bảng phím

https://learn.microsoft.com/en-us/globalization/input/vietnamese-ime liệt kê bảng Telex và number-key chuẩn của Windows: `aw/aa/dd/ee/oo/ow/uw` và `a8/a6/d9/e6/o6/o7/u7`, dấu `as/af/ar/ax/aj` và `a1…a5`.

Đối chiếu với [§7](#7-telex-và-vni-bàn-phím-được-dịch-thành-chữ-như-thế-nào) và [§0 của sổ tay](./REFERENCE_HANDBOOK.md#01-thẻ-telex-một-trang):

- Bảng của Microsoft **khớp** với `COMMON_TELEX_KEYS` của chúng ta cho 7 chữ có dấu hình chữ.
- Khác biệt đáng chú ý: Microsoft dùng `đ = dd`; OpenViet cũng vậy, nhưng thêm inferred `z → đ` (xem §2.8). Đây là tiện ích riêng, không phải chuẩn Windows.
- `wToUEnabled` là tuỳ chọn riêng của OpenViet; tài liệu Microsoft không có cờ này.

### 21.5. Tóm lại một câu

Ngữ âm cho ta **cái gì được phép viết**, Unicode cho ta **cái gì được phép lưu**, RFC 1456 cho ta **tại sao cần delimiter**, và UAX #15 cho ta **tại sao đường nối khi sửa DOM lại quan trọng**. Bốn câu đó cộng lại là phần lớn công việc của một IME.

---

## Kết luận

Toàn bộ tài liệu này có thể gói trong ba câu:

1. Một âm tiết Tiếng Việt là **Onset + Glide + Nucleus + Coda + Tone**; muốn bỏ dấu đúng thì phải phân tích được năm phần đó.
2. Dấu thanh thuộc về **âm tiết**, được ký âm trên **âm chính** — trừ khi bạn chọn kiểu cũ, khi đó nó nằm trên **âm đệm** trong `oa/oe/uy`.
3. Mọi chuỗi không khớp cấu trúc đó (`center`, `fcitx`, `mian`, `bàc`, `text`) đều bị từ chối hoặc khôi phục, vì mục tiêu của bộ gõ là **chữ Tiếng Việt hợp lệ**, không phải \"dấu được thêm bằng mọi giá\".

Nếu bạn muốn xem các quy tắc này được gọi từ luồng gõ phím thực tế như thế nào, quay lại [`ARCHITECTURE.md`](./ARCHITECTURE.md), mục 4 và 5.
