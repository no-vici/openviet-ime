import test, { describe } from 'node:test';
import assert from 'node:assert';
import { reverseVietnameseWord, matchCasing, shouldAutoRestoreEnglish } from '../src/engine/dictionary.js';

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
    // Từ tiếng Việt hợp lệ (ví dụ: 'cá', 'toán') không được phép khôi phục bừa bãi
    expect(shouldAutoRestoreEnglish('cas', 'cá')).toBe(false);
  });
});

