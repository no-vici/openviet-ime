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

## Kết luận

Toàn bộ tài liệu này có thể gói trong ba câu:

1. Một âm tiết Tiếng Việt là **Onset + Glide + Nucleus + Coda + Tone**; muốn bỏ dấu đúng thì phải phân tích được năm phần đó.
2. Dấu thanh thuộc về **âm tiết**, được ký âm trên **âm chính** — trừ khi bạn chọn kiểu cũ, khi đó nó nằm trên **âm đệm** trong `oa/oe/uy`.
3. Mọi chuỗi không khớp cấu trúc đó (`center`, `fcitx`, `mian`, `bàc`, `text`) đều bị từ chối hoặc khôi phục, vì mục tiêu của bộ gõ là **chữ Tiếng Việt hợp lệ**, không phải \"dấu được thêm bằng mọi giá\".

Nếu bạn muốn xem các quy tắc này được gọi từ luồng gõ phím thực tế như thế nào, quay lại [`ARCHITECTURE.md`](./ARCHITECTURE.md), mục 4 và 5.
