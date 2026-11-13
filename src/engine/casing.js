/**
 * Syllable Casing Harmonization & Unique Syllable Auto-Completion Engine
 * Inspired by modern Rust/C IME architectures (casing.rs & engine.rs).
 *
 * @license Apache-2.0
 */

import { isCamelOrPascalCase } from './key-codes.js';
import { parseSyllable } from './syllable-parser.js';

/**
 * 1. Harmonize Syllable Case (harmonize_syllable_case):
 * - First letter Uppercase (e.g. 'Đ'): Regardless of accidental Shift/CapsLock on subsequent chars
 *   ('ĐƯợc', 'ĐƯỢc', 'ĐƯờng') -> automatically harmonized to TitleCase ('Được', 'Đường').
 * - First letter Lowercase (e.g. 'đ'): Regardless of internal uppercase ('đƯỢc', 'đƯỜNG') ->
 *   harmonized to lowercase ('được', 'đường').
 * - ALL CAPS ('ĐƯỢC', 'VIỆT NAM'): Fully preserved when all characters are intentionally uppercase.
 * - Developer Guard: Never alters code tokens or camelCase/PascalCase variables ('useState', 'mIxEd', 'loWeRcAsE').
 *
 * @param {string} word Current syllable/word
 * @param {Object} [options]
 * @param {boolean} [options.isCodeContext] If typing inside code context
 * @returns {string}
 */
export function harmonizeSyllableCase(word, options = {}) {
  if (!word || typeof word !== 'string' || word.length <= 1) {
    return word;
  }

  // Developer Guard: Do not touch code variables like useState, UserController, mixedCase tokens
  if (options.isCodeContext || isCamelOrPascalCase(word)) {
    return word;
  }

  // Preserve ASCII code variables containing numbers, underscores, dashes
  if (/[\d_$/#-]/.test(word)) {
    return word;
  }

  // If entire word is already ALL UPPERCASE (length > 1), keep ALL CAPS
  const isAllUpper = word === word.toUpperCase() && word !== word.toLowerCase();
  if (isAllUpper) {
    return word;
  }

  // If entire word is already all lowercase, return as is
  const isAllLower = word === word.toLowerCase() && word !== word.toUpperCase();
  if (isAllLower) {
    return word;
  }

  // Check the first letter
  const firstChar = word.charAt(0);
  const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();

  if (isFirstUpper) {
    // TitleCase: First letter Uppercase, all subsequent characters Lowercase
    // e.g. 'ĐƯợc' -> 'Được', 'ĐƯỢc' -> 'Được'
    return firstChar + word.slice(1).toLowerCase();
  } else {
    // Lowercase: First letter Lowercase, so entire word must be lowercase
    // e.g. 'đƯỢc' -> 'được', 'đƯỜng' -> 'đường'
    return word.toLowerCase();
  }
}

/**
 * 2. Unique Vietnamese Syllables Mapping (auto_complete_unique_syllable):
 * In Vietnamese phonology, certain unaccented keystroke sequences can ONLY correspond
 * to one single legitimate accented word:
 * - 'khong'  -> 'không'
 * - 'truong' -> 'trương' (allows immediate tone placement: truongf/truong2 -> trường, etc.)
 * - 'nganh'  -> 'ngành'  (allows tone adjustment: nganhj/nganh5 -> ngạnh)
 */
export const UNIQUE_SYLLABLE_MAP = {
  'khong': 'không',
  'truong': 'trương',
  'nganh': 'ngành'
};

/**
 * Apply case matching to unique syllable conversion
 * @param {string} rawInput e.g. 'Khong', 'KHONG', 'khong'
 * @param {string} target e.g. 'không'
 * @returns {string} e.g. 'Không', 'KHÔNG', 'không'
 */
export function matchUniqueSyllableCase(rawInput, target) {
  if (!rawInput || !target) return target;
  const isAllUpper = rawInput === rawInput.toUpperCase() && rawInput !== rawInput.toLowerCase();
  if (isAllUpper) {
    return target.toUpperCase();
  }
  const firstChar = rawInput.charAt(0);
  const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  if (isFirstUpper) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}
