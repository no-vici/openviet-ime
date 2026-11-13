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

  test('4. Chuẩn hóa viết hoa/thường theo chữ cái đầu (harmonize_syllable_case) - Tùy chọn (Default: OFF)', () => {
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

    // Mặc định AvimEngine autoHarmonizeCase là false (không tự động can thiệp trừ khi user bật)
    const engineDefault = new AvimEngine({ method: IME_METHOD.TELEX });
    expect(engineDefault.autoHarmonizeCase).toBe(false);

    // Khi người dùng bật tính năng này
    const engineHarmonize = new AvimEngine({ method: IME_METHOD.TELEX, autoHarmonizeCase: true });
    expect(engineHarmonize.autoHarmonizeCase).toBe(true);
  });

  test('5. Triết lý Unix: Giữ Core IME thuần khiết, không tự động đoán từ (khong, truong, nganh)', () => {
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

    // Khi gõ chuỗi thô 'khong', 'truong', 'nganh' không bấm phím dấu, core IME giữ nguyên chuỗi không tự ý điền dấu
    expect(typeKeys(telex, 'khong')).toBe('khong');
    expect(typeKeys(telex, 'truong')).toBe('truong');
    expect(typeKeys(telex, 'nganh')).toBe('nganh');
    expect(typeKeys(vni, 'khong')).toBe('khong');
    expect(typeKeys(auto, 'khong')).toBe('khong');

    // Người dùng vẫn hoàn toàn tự do bỏ dấu thanh / dấu mũ bằng phím theo đúng quy tắc bộ gõ
    expect(typeKeys(telex, 'khoong')).toBe('không');
    expect(typeKeys(telex, 'khoongs')).toBe('khống');
    expect(typeKeys(telex, 'khoongf')).toBe('khồng');
    expect(typeKeys(telex, 'truwowngf')).toBe('trường');
    expect(typeKeys(vni, 'kho6ng')).toBe('không');
    expect(typeKeys(vni, 'kho6ng1')).toBe('khống');
    expect(typeKeys(vni, 'tru7o7ng2')).toBe('trường');
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

    // Mô phỏng bộ học thói quen (tương tự như content.js recordWordErase) với ngưỡng tùy chỉnh
    const habitTracker = {
      counts: new Map(),
      threshold: 3,
      setThreshold(th) {
        this.threshold = Math.max(2, th);
      },
      recordErase(raw, transformed) {
        if (!raw || !transformed) return false;
        const hasDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(transformed);
        if (!hasDiacritics) return false;
        const key = raw.toLowerCase();
        const cnt = (this.counts.get(key) || 0) + 1;
        this.counts.set(key, cnt);
        if (cnt >= this.threshold) {
          userDictionary.add(key);
          return true;
        }
        return false;
      }
    };

    // Lần 1: User gõ 'sas' -> thành 'sá', user xóa cả từ
    expect(habitTracker.recordErase('sas', 'sá')).toBe(false);
    expect(userDictionary.has('sas')).toBe(false);

    // Lần 2: User gõ lại 'sas' -> thành 'sá', user xóa cả từ lần 2 (với threshold = 3, chưa học)
    expect(habitTracker.recordErase('sas', 'sá')).toBe(false);
    expect(userDictionary.has('sas')).toBe(false);

    // Lần 3: User xóa cả từ lần 3 -> đạt threshold = 3!
    expect(habitTracker.recordErase('sas', 'sá')).toBe(true);
    expect(userDictionary.has('sas')).toBe(true);

    // Kiểm tra ngưỡng tùy chỉnh cao hơn (ví dụ user cấu hình threshold = 5)
    userDictionary.remove('pop');
    habitTracker.setThreshold(5);
    expect(habitTracker.recordErase('pop', 'póp')).toBe(false);
    expect(habitTracker.recordErase('pop', 'póp')).toBe(false);
    expect(habitTracker.recordErase('pop', 'póp')).toBe(false);
    expect(habitTracker.recordErase('pop', 'póp')).toBe(false); // lần 4 vẫn chưa
    expect(userDictionary.has('pop')).toBe(false);
    expect(habitTracker.recordErase('pop', 'póp')).toBe(true);  // lần 5 đạt ngưỡng!
    expect(userDictionary.has('pop')).toBe(true);
    userDictionary.remove('pop');

    // Lần 4: Giờ đây từ 'sas' đã được tự học và thêm vào User Dictionary!
    // Lần gõ sau đó, 'sas' tuyệt đối không bị bỏ dấu thành 'sá' nữa!
    expect(simulateTyping(telex, 'sas')).toBe('sas');

    // Các từ tiếng Việt khác vẫn bỏ dấu hoàn toàn bình thường
    expect(simulateTyping(telex, 'bats')).toBe('bát');
    expect(simulateTyping(telex, 'sang')).toBe('sang');

    // Kiểm tra VNI với từ số như da5: không chặn gõ dấu khác như da1, da2
    const vni = new AvimEngine({ method: 2 });
    userDictionary.add('da5');
    expect(userDictionary.isCustomUserWordPrefix('da5')).toBe(true);
    expect(userDictionary.isCustomUserWordPrefix('da')).toBe(false);
    expect(simulateTyping(vni, 'da1')).toBe('dá');
    expect(simulateTyping(vni, 'da2')).toBe('dà');
    expect(simulateTyping(vni, 'da5')).toBe('da5');

    // Dọn dẹp
    userDictionary.remove('sas');
    userDictionary.remove('da5');
  });
});

