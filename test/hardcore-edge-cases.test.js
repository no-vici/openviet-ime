import test, { describe } from 'node:test';
import assert from 'node:assert';
import { reverseVietnameseWord, matchCasing, shouldAutoRestoreEnglish, userDictionary } from '../src/engine/dictionary.js';
import { harmonizeSyllableCase } from '../src/engine/casing.js';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';

const expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected)
});

describe('OpenViet IME - Hardcore Edge Cases Testing', () => {
  test('1. Kiểm thử độ chính xác của cơ chế matchCasing với các định dạng chữ', () => {
    expect(matchCasing('TEXT', 'text')).toBe('TEXT');
    expect(matchCasing('Text', 'text')).toBe('Text');
    expect(matchCasing('text', 'text')).toBe('text');
    expect(matchCasing('mIxEd', 'mixed')).toBe('mIxEd');
    expect(matchCasing('loWeRcAsE', 'lowercase')).toBe('loWeRcAsE');
  });

  test('2. Kiểm thử đảo chuỗi các từ trap Telex lập trình và tiếng Anh kỹ thuật', () => {
    expect(reverseVietnameseWord('têt')).toBe('text');
    expect(reverseVietnameseWord('Têt')).toBe('Text');
    expect(reverseVietnameseWord('úer')).toBe('user');
    expect(reverseVietnameseWord('lủuy')).toBe('luxury');
    expect(reverseVietnameseWord('lUxUrY')).toBe('lUxUrY'); // Không phá vỡ định dạng mixed
  });

  test('3. Kiểm thử bộ bẫy chính tả và luật khôi phục tiếng Anh tự động', () => {
    // Từ tiếng Anh nằm trong danh mục trap phải được chấp nhận khôi phục khi nhấn Space
    expect(shouldAutoRestoreEnglish('text', 'têt')).toBe(true);
    expect(shouldAutoRestoreEnglish('user', 'úer')).toBe(true);
    // Từ tiếng Việt hợp lệ (ví dụ: 'cá', 'toán', 'tét') không được phép khôi phục bừa bãi
    expect(shouldAutoRestoreEnglish('cas', 'cá')).toBe(false);
    expect(shouldAutoRestoreEnglish('tes', 'tét')).toBe(false);
    // Từ tiếng Anh đã ở dạng ASCII hợp lệ không bị corrupt bởi phím huỷ dấu (cancellation keystrokes)
    expect(shouldAutoRestoreEnglish('tesst', 'test')).toBe(false);
    expect(shouldAutoRestoreEnglish('passs', 'pass')).toBe(false);
    expect(shouldAutoRestoreEnglish('fasst', 'fast')).toBe(false);
  });

  test('4. Chuẩn hóa viết hoa/thường theo chữ cái đầu (harmonize_syllable_case)', () => {
    // Chữ cái đầu viết Hoa (Đ): lỡ giữ Shift/CapsLock -> đưa phần sau về thường
    expect(harmonizeSyllableCase('ĐƯợc')).toBe('Được');
    expect(harmonizeSyllableCase('ĐƯỢc')).toBe('Được');
    expect(harmonizeSyllableCase('ĐƯờng')).toBe('Đường');

    // Chữ cái đầu viết Thường (đ): lỡ có âm phía sau bị viết hoa -> đưa toàn bộ về thường
    expect(harmonizeSyllableCase('đƯỢc')).toBe('được');
    expect(harmonizeSyllableCase('đƯờng')).toBe('đường');

    // Viết hoa toàn bộ (ALL CAPS): giữ nguyên
    expect(harmonizeSyllableCase('ĐƯỢC')).toBe('ĐƯỢC');
    expect(harmonizeSyllableCase('VIỆT NAM')).toBe('VIỆT NAM');
    expect(harmonizeSyllableCase('THÀNH PHỐ')).toBe('THÀNH PHỐ');

    // An toàn cho lập trình viên: không can thiệp camelCase, PascalCase, mixed
    expect(harmonizeSyllableCase('useState')).toBe('useState');
    expect(harmonizeSyllableCase('loWeRcAsE')).toBe('loWeRcAsE');
    expect(harmonizeSyllableCase('mIxEd')).toBe('mIxEd');
    expect(harmonizeSyllableCase('UserController')).toBe('UserController');
  });

  test('5. Tự động điền dấu cho các âm tiết đặc thù (auto_complete_unique_syllable)', () => {
    function typeKeys(engine, keys) {
      let res = '';
      for (const k of keys) {
        const r = engine.processKey(res, k);
        res = r.transformed ? r.result : res + k;
      }
      return res;
    }

    const telex = new AvimEngine({ method: IME_METHOD.TELEX });
    const vni = new AvimEngine({ method: IME_METHOD.VNI });
    const auto = new AvimEngine({ method: IME_METHOD.AUTO });

    // 1. khong -> không (bảo lưu đúng case), và có thể bỏ dấu thanh tùy ý (khống, khồng, khổng, khộng, khỗng)
    expect(typeKeys(telex, 'khong')).toBe('không');
    expect(typeKeys(telex, 'Khong')).toBe('Không');
    expect(typeKeys(telex, 'KHONG')).toBe('KHÔNG');
    expect(typeKeys(telex, 'khongs')).toBe('khống');
    expect(typeKeys(telex, 'khongf')).toBe('khồng');
    expect(typeKeys(telex, 'khongr')).toBe('khổng');
    expect(typeKeys(telex, 'Khongs')).toBe('Khống');
    expect(typeKeys(telex, 'Khongf')).toBe('Khồng');
    expect(typeKeys(vni, 'khong')).toBe('không');
    expect(typeKeys(vni, 'khong1')).toBe('khống');
    expect(typeKeys(vni, 'khong2')).toBe('khồng');
    expect(typeKeys(vni, 'khong3')).toBe('khổng');
    expect(typeKeys(auto, 'khong')).toBe('không');
    expect(typeKeys(auto, 'khongs')).toBe('khống');
    expect(typeKeys(auto, 'khong2')).toBe('khồng');

    // 2. truong -> trương, và có thể gõ thêm dấu thanh bất kỳ lúc nào
    expect(typeKeys(telex, 'truong')).toBe('trương');
    expect(typeKeys(telex, 'truongf')).toBe('trường');
    expect(typeKeys(telex, 'truongs')).toBe('trướng');
    expect(typeKeys(telex, 'truongr')).toBe('trưởng');
    expect(typeKeys(telex, 'truongj')).toBe('trượng');

    // Trên VNI: truong2 -> trường, truong1 -> trướng, truong3 -> trưởng, truong5 -> trượng
    expect(typeKeys(vni, 'truong')).toBe('trương');
    expect(typeKeys(vni, 'truong2')).toBe('trường');
    expect(typeKeys(vni, 'truong1')).toBe('trướng');
    expect(typeKeys(vni, 'truong3')).toBe('trưởng');
    expect(typeKeys(vni, 'truong5')).toBe('trượng');

    // 3. nganh -> ngành, gõ tiếp j / 5 chuyển sang ngạnh
    expect(typeKeys(telex, 'nganh')).toBe('ngành');
    expect(typeKeys(telex, 'Nganh')).toBe('Ngành');
    expect(typeKeys(telex, 'NGANH')).toBe('NGÀNH');
    expect(typeKeys(telex, 'nganhj')).toBe('ngạnh');
    expect(typeKeys(vni, 'nganh5')).toBe('ngạnh');
    expect(typeKeys(auto, 'nganhj')).toBe('ngạnh');
    expect(typeKeys(auto, 'nganh5')).toBe('ngạnh');
  });

  test('6. Tự học thói quen user khi xóa từ bị bỏ dấu 2 lần (Habit Learning)', () => {
    const telex = new AvimEngine({ method: IME_METHOD.TELEX });

    function simulateTyping(engine, word) {
      let res = '';
      engine.resetWordSession();
      for (const k of word) {
        engine.trackRawKey(k);
        const r = engine.processKey(res, k);
        res = r.transformed ? r.result : res + k;
      }
      return res;
    }

    // Giả sử 'sas' ban đầu chưa có trong custom dictionary:
    userDictionary.remove('sas');
    expect(userDictionary.has('sas')).toBe(false);
    expect(simulateTyping(telex, 'sas')).toBe('sá');

    // Mô phỏng bộ học thói quen (tương tự như content.js recordWordErase)
    const habitTracker = {
      counts: new Map(),
      recordErase(raw, transformed) {
        if (!raw || !transformed) return false;
        const hasDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(transformed);
        if (!hasDiacritics) return false;
        const key = raw.toLowerCase();
        const cnt = (this.counts.get(key) || 0) + 1;
        this.counts.set(key, cnt);
        if (cnt >= 2) {
          userDictionary.add(key);
          return true;
        }
        return false;
      }
    };

    // Lần 1: User gõ 'sas' -> thành 'sá', user xóa cả từ
    expect(habitTracker.recordErase('sas', 'sá')).toBe(false);
    expect(userDictionary.has('sas')).toBe(false);

    // Lần 2: User gõ lại 'sas' -> thành 'sá', user lại xóa cả từ lần 2!
    expect(habitTracker.recordErase('sas', 'sá')).toBe(true);
    expect(userDictionary.has('sas')).toBe(true);

    // Lần 3: Giờ đây từ 'sas' đã được tự học và thêm vào User Dictionary!
    // Lần gõ sau đó, 'sas' tuyệt đối không bị bỏ dấu thành 'sá' nữa!
    expect(simulateTyping(telex, 'sas')).toBe('sas');

    // Các từ tiếng Việt khác vẫn bỏ dấu hoàn toàn bình thường
    expect(simulateTyping(telex, 'bats')).toBe('bát');
    expect(simulateTyping(telex, 'sang')).toBe('sang');
  });
});

