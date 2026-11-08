/**
 * AVIM Engine Modernized (AVIM xKey Core)
 * Pure, zero-dependency Vietnamese diacritic state machine & vowel transformation.
 * Adapted from chung1905/avim-firefox and modernized for MV3 & WebExtensions.
 *
 * @license LGPL / Apache-2.0
 */

import { IME_METHOD, TONE_STYLE, isCamelOrPascalCase } from './key-codes.js';
import { getVietnameseWordSet } from './vietnamese-words.js';
import { parseSyllable, ParsedSyllable, TONE_MARK } from './syllable-parser.js';
import {
  hasForeignOnset,
  isForeignWord,
  userDictionary,
  checkWordSpelling,
  COMMON_ENGLISH_WORDS,
  ENGLISH_TELEX_TRAPS,
  reverseVietnameseWord,
  matchCasing,
  shouldAutoRestoreEnglish,
  hasPhonologyViolation,
  isCheckedToneViolation
} from './dictionary.js';

// Vowel matrix mapping base characters to [plain, acute, grave, hook, tilde, dot]
const VOWEL_TABLE = {
  // Plain
  'a': ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
  'ă': ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
  'â': ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
  'e': ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
  'ê': ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
  'i': ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
  'o': ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
  'ô': ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
  'ơ': ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
  'u': ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
  'ư': ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
  'y': ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],

  // Uppercase
  'A': ['A', 'Á', 'À', 'Ả', 'Ã', 'Ạ'],
  'Ă': ['Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ'],
  'Â': ['Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ'],
  'E': ['E', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ'],
  'Ê': ['Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ'],
  'I': ['I', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị'],
  'O': ['O', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ'],
  'Ô': ['Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ'],
  'Ơ': ['Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ'],
  'U': ['U', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ'],
  'Ư': ['Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự'],
  'Y': ['Y', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ']
};

// Reverse lookup: Map accented vowel back to its base shape and tone index [0..5]
const CHAR_TO_BASE_AND_TONE = {};
Object.entries(VOWEL_TABLE).forEach(([base, tones]) => {
  tones.forEach((char, toneIdx) => {
    CHAR_TO_BASE_AND_TONE[char] = { base, tone: toneIdx };
  });
});

// Vowel transformation rules for circumflex/breve/horn
const SHAPE_MAP = {
  // Base -> [circumflex, horn/breve]
  'a': { circumflex: 'â', breve: 'ă' },
  'A': { circumflex: 'Â', breve: 'Ă' },
  'â': { circumflex: 'a', breve: 'ă' },
  'Â': { circumflex: 'A', breve: 'Ă' },
  'ă': { circumflex: 'â', breve: 'a' },
  'Ă': { circumflex: 'Â', breve: 'a' },

  'e': { circumflex: 'ê' },
  'E': { circumflex: 'Ê' },
  'ê': { circumflex: 'e' },
  'Ê': { circumflex: 'E' },

  'o': { circumflex: 'ô', horn: 'ơ' },
  'O': { circumflex: 'Ô', horn: 'Ơ' },
  'ô': { circumflex: 'o', horn: 'ơ' },
  'Ô': { circumflex: 'O', horn: 'Ơ' },
  'ơ': { circumflex: 'ô', horn: 'o' },
  'Ơ': { circumflex: 'Ô', horn: 'O' },

  'u': { horn: 'ư' },
  'U': { horn: 'Ư' },
  'ư': { horn: 'u' },
  'Ư': { horn: 'U' }
};

// Valid initial consonant clusters in Vietnamese
const VALID_INITIAL_CONSONANTS = new Set([
  'b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh',
  'l', 'm', 'n', 'ng', 'ngh', 'nh', 'p', 'ph', 'qu', 'r', 's',
  't', 'th', 'tr', 'v', 'x', ''
]);

// Valid final consonants in Vietnamese
const VALID_FINAL_CONSONANTS = new Set([
  'c', 'ch', 'm', 'n', 'ng', 'nh', 'p', 't', ''
]);

// Valid vowel cores in Vietnamese
const VALID_VOWEL_CORES = new Set([
  'a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
  'ai', 'ao', 'au', 'ay', 'âu', 'ây', 'eo', 'êu', 'ia', 'iê', 'iu',
  'oa', 'oă', 'oe', 'oi', 'ôi', 'ơi', 'ua', 'uâ', 'ue', 'uê', 'ui', 'uo', 'uô', 'uơ', 'uy', 'uyên',
  'ưa', 'ưi', 'ươ', 'ưu', 'ye', 'yê', 'oai', 'oay', 'oao', 'oeo', 'uai', 'uay', 'uôi', 'uơu', 'uyu', 'ươu', 'ươi', 'uya',
  'iêu', 'yêu', 'uyê'
]);

export class AvimEngine {
  constructor(options = {}) {
    this.method = options.method ?? IME_METHOD.VNI;
    this.toneStyle = options.toneStyle ?? TONE_STYLE.CLASSIC;
    this.spellCheck = options.spellCheck ?? true;
    this.autoRestore = options.autoRestore ?? true;
    this.quickConsonants = options.quickConsonants ?? false;
    this.quickTelex = options.quickTelex ?? true;

    // GoNhanh-inspired enhancements
    this.autoRestoreEnglish = options.autoRestoreEnglish ?? true;
    this.escRevert = options.escRevert ?? true;
    this.phonologyRules = options.phonologyRules ?? true;

    // Session state tracking for current word
    this.currentWordRaw = '';
    this.lastTransformed = '';
    this.lastToneToggledWord = null;
  }

  setMethod(method) {
    this.method = method;
  }

  setToneStyle(toneStyle) {
    this.toneStyle = toneStyle;
  }

  setSpellCheck(enabled) {
    this.spellCheck = enabled;
  }

  setQuickConsonants(enabled) {
    this.quickConsonants = Boolean(enabled);
  }

  setQuickTelex(enabled) {
    this.quickTelex = Boolean(enabled);
  }

  setAutoRestoreEnglish(enabled) {
    this.autoRestoreEnglish = Boolean(enabled);
  }

  setEscRevert(enabled) {
    this.escRevert = Boolean(enabled);
  }

  setPhonologyRules(enabled) {
    this.phonologyRules = Boolean(enabled);
  }

  trackRawKey(key) {
    if (key && key.length === 1) {
      this.currentWordRaw += key;
    }
  }

  resetWordSession() {
    this.currentWordRaw = '';
    this.lastTransformed = '';
    this.lastToneToggledWord = null;
  }

  /**
   * Revert current word buffer back to raw keystrokes (Instant ESC Revert - GoNhanh)
   * @param {string} currentWord
   * @returns {{ reverted: boolean, result: string }}
   */
  revertCurrentWord(currentWord) {
    if (!this.escRevert) {
      return { reverted: false, result: currentWord || '' };
    }

    if (!currentWord && !this.currentWordRaw) {
      return { reverted: false, result: currentWord || '' };
    }

    const raw = this.currentWordRaw || reverseVietnameseWord(currentWord);
    if (raw && raw !== currentWord) {
      this.resetWordSession();
      return { reverted: true, result: matchCasing(currentWord, raw) };
    }

    const reversed = reverseVietnameseWord(currentWord);
    if (reversed && reversed !== currentWord) {
      this.resetWordSession();
      return { reverted: true, result: matchCasing(currentWord, reversed) };
    }

    return { reverted: false, result: currentWord };
  }

  /**
   * Check if current word should be auto-restored to English (GoNhanh Auto-Restore)
   * on Space, Enter, or word delimiter
   * @param {string} currentWord
   * @returns {{ restore: boolean, result: string }}
   */
  checkAutoRestore(currentWord) {
    if (!this.autoRestoreEnglish) {
      return { restore: false, result: currentWord };
    }

    // 1. In VNI mode, diacritics are numeric (1-9).
    // English words never contain digits and never suffer from Telex collisions.
    // Auto-restore must NEVER run in VNI mode.
    if (this.method === IME_METHOD.VNI) {
      this.resetWordSession();
      return { restore: false, result: currentWord };
    }

    // 2. Reject empty or single-letter vowels (á, à, ả, ã, ạ, ú, ù, ủ, ĩ, etc.)
    if (!currentWord || currentWord.length <= 1) {
      this.resetWordSession();
      return { restore: false, result: currentWord };
    }

    const raw = this.currentWordRaw;
    // 3. Reject any raw sequence containing digits (VNI numbers or digits)
    if (raw && /\d/.test(raw)) {
      this.resetWordSession();
      return { restore: false, result: currentWord };
    }

    if (shouldAutoRestoreEnglish(raw, currentWord)) {
      let restored = (raw && raw.length >= 3 && !/\d/.test(raw)) ? raw : reverseVietnameseWord(currentWord);
      restored = matchCasing(currentWord, restored);
      this.resetWordSession();
      return { restore: true, result: restored };
    }

    // 4. Reverse fallback for multi-letter trap words when raw is not available
    if (currentWord.length >= 2 && !getVietnameseWordSet().has(currentWord.toLowerCase())) {
      let reversed = reverseVietnameseWord(currentWord);
      if (
        reversed &&
        reversed.length >= 3 &&
        !/\d/.test(reversed) &&
        reversed.toLowerCase() !== currentWord.toLowerCase() &&
        (COMMON_ENGLISH_WORDS.has(reversed.toLowerCase()) || userDictionary.has(reversed.toLowerCase()))
      ) {
        reversed = matchCasing(currentWord, reversed);
        this.resetWordSession();
        return { restore: true, result: reversed };
      }
    }

    return { restore: false, result: currentWord };
  }

  /**
   * Adaptive input method (from XKey vAdaptiveEnabled):
   * When AUTO is selected, digits route to VNI, and letter keys route to Telex.
   */
  getEffectiveMethod(key) {
    if (this.method === IME_METHOD.AUTO) {
      return /^[0-9]$/.test(key) ? IME_METHOD.VNI : IME_METHOD.TELEX;
    }
    return this.method;
  }

  /**
   * Process a key event in the context of the current word
   * @param {string} word Current word buffer before the key
   * @param {string} key Incoming key pressed (e.g. 's', 'w', '1')
   * @returns {{ transformed: boolean, result: string, originalWord?: string }}
   */
  processKey(word, key) {
    if (this.method === IME_METHOD.OFF) {
      return { transformed: false, result: word + key };
    }

    if (!key || key.length !== 1) {
      return { transformed: false, result: word + key };
    }

    // Quotation marks unwrapping:
    // If the word token starts or ends with quotation marks (single quote, double quote, curly quotes, guillemets),
    // unwrap the quotation marks so the core syllable can be phonologically parsed and transformed,
    // then re-wrap the result with the quotation marks.
    // Preserves internal apostrophes for Central Highlands names (M'Đrắk, Ea H'leo, Cư M'gar).
    if (word && !/^[A-Za-z][\x27\u2019]/.test(word)) {
      const pMatch = word.match(/^([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)/);
      const sMatch = word.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
      if (pMatch || sMatch) {
        let quotePrefix = pMatch ? pMatch[1] : '';
        let cleanWord = quotePrefix ? word.slice(quotePrefix.length) : word;
        let quoteSuffix = '';
        if (sMatch && cleanWord.length > 0) {
          const sMatch2 = cleanWord.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
          if (sMatch2) {
            quoteSuffix = sMatch2[1];
            cleanWord = cleanWord.slice(0, -quoteSuffix.length);
          }
        }
        const innerRes = this.processKey(cleanWord, key);
        const wrappedResult = quotePrefix + innerRes.result + quoteSuffix;
        this.lastTransformed = wrappedResult;
        return {
          transformed: innerRes.transformed,
          result: wrappedResult
        };
      }
    }

    // If the word already contains any digits (e.g. 'icon6', 'mp3', 'h2o', 'f88'),
    // underscores, @, or path slashes (code / URL / email identifiers),
    // pass key through literally without applying IME diacritics.
    if (/\d/.test(word) || word.includes('_') || word.includes('@') || word.includes('/')) {
      const newWord = word + key;
      this.lastTransformed = newWord;
      return { transformed: false, result: newWord };
    }

    // Developer-Aware Mode: camelCase & PascalCase Code Guard
    // When typing programming identifiers like 'isCamelCase', 'useState', 'UserController', 'AppProps',
    // an uppercase letter appears in the middle of a word or after lowercase letters.
    // In Vietnamese, words NEVER mix capital letters in the middle.
    // If the existing prefix was mistakenly transformed into Vietnamese (e.g. 'is' -> 'í', then user types 'C'),
    // automatically un-accent the prefix back to its raw Latin keys and append key without transformation.
    const isUpperKey = key === key.toUpperCase() && key !== key.toLowerCase();
    if (word.length >= 1 && isUpperKey) {
      if (isCamelOrPascalCase(word + key)) {
        const cleanPrefix = reverseVietnameseWord(word) || word;
        if (/^[a-zA-Z]+$/.test(cleanPrefix)) {
          const newWord = cleanPrefix + key;
          this.lastTransformed = newWord;
          this.currentWordRaw = newWord;
          return { transformed: true, result: newWord };
        }
      }
    }

    if (isCamelOrPascalCase(word) || isCamelOrPascalCase(word + key)) {
      const newWord = word + key;
      this.lastTransformed = newWord;
      this.currentWordRaw = (this.currentWordRaw || word) + key;
      return { transformed: false, result: newWord };
    }

    // Phonology Rules Check (GoNhanh): if word has c/k, g/gh, ng/ngh violation (e.g. center, city, get), do not modify
    if (this.phonologyRules && hasPhonologyViolation(word)) {
      return { transformed: false, result: word + key };
    }

    // 0. AVIM Escape mechanism: if preceding character is '\', remove '\' and pass key literally
    if (word && word.endsWith('\\')) {
      const res = { transformed: true, result: word.slice(0, -1) + key };
      this.lastTransformed = res.result;
      return res;
    }

    // 1. Quick Consonants (from XKey vQuickStartConsonant / vQuickEndConsonant)
    if (this.quickConsonants) {
      const qcResult = this.checkQuickConsonants(word, key);
      if (qcResult.transformed) {
        this.lastTransformed = qcResult.result;
        return qcResult;
      }
    }

    // 1b. Quick Telex (OpenKey feature: cc->ch, gg->gi, kk->kh, nn->ng, pp->ph, tt->th)
    if (this.quickTelex && (this.getEffectiveMethod(key) === IME_METHOD.TELEX)) {
      const qtResult = this.checkQuickTelex(word, key);
      if (qtResult.transformed) {
        this.lastTransformed = qtResult.result;
        return qtResult;
      }
    }

    // 2. Try consonant modification (e.g. 'd' + 'd' -> 'đ')
    const consResult = this.checkConsonant(word, key);
    if (consResult.transformed) {
      this.lastTransformed = consResult.result;
      return consResult;
    }

    // 3. Try vowel shape modification (e.g. 'a' + 'a' -> 'â', 'o' + 'w' -> 'ơ')
    const shapeResult = this.checkVowelShape(word, key);
    if (shapeResult.transformed) {
      this.lastTransformed = shapeResult.result;
      return shapeResult;
    }

    // 3b. Shape Modifier Swapping (VietC / Bamboo innovation):
    // Swap between transformed vowel shapes while preserving existing tone marks:
    // Telex:
    //   â + w -> ă (e.g. ấm + w -> ắm, cân + w -> căn, tập + w -> tặp)
    //   ă + a -> â (e.g. ắm + a -> ấm, căn + a -> cân, tặp + a -> tập)
    //   ô + w -> ơ (e.g. bốn + w -> bớn, hộp + w -> hợp, cột + w -> cợt)
    //   ơ + o -> ô (e.g. bớn + o -> bốn, hợp + o -> hộp, cợt + o -> cột)
    // VNI:
    //   '6' (circumflex) <-> '8' (breve): tấ + 8 -> tắ, tắ + 6 -> tấ
    //   '6' (circumflex) <-> '7' (horn):  bốn + 7 -> bớn, bớn + 6 -> bốn, giồ + 7 -> giờ, giờ + 6 -> giồ
    const swapResult = this.checkShapeModifierSwapping(word, key);
    if (swapResult.transformed) {
      this.lastTransformed = swapResult.result;
      return swapResult;
    }

    // 4. Try tone mark placement / toggle (e.g. 'toan' + 's' -> 'toán')
    const toneResult = this.checkTone(word, key);
    if (toneResult.transformed) {
      this.lastTransformed = toneResult.result;
      return toneResult;
    }

    // 4b. Dynamic Tone Shifting (vnchKey / Bamboo phonological architecture):
    // When key is appended to an already accented word (e.g. 'tó' + 'a' -> 'tóa', 'tóa' + 'n' -> 'toán'),
    // parse the resulting syllable and dynamically relocate the tone mark to the phonetically correct nucleus.
    const dynamicResult = this.checkDynamicToneShift(word, key);
    if (dynamicResult.transformed) {
      this.lastTransformed = dynamicResult.result;
      return dynamicResult;
    }

    // 5. Default: append key
    const newWord = word + key;
    this.lastTransformed = newWord;
    return { transformed: false, result: newWord };
  }

  /**
   * Dynamic Tone Shifting:
   * Relocates tone when appending vowels or coda consonants to a syllable that already carries a tone mark.
   * e.g.:
   *   'tó' + 'a' -> 'tóa' (or 'toá' if modern)
   *   'tóa' + 'n' -> 'toán' (relocating tone from glide 'o' to nucleus 'a')
   *   'hó' + 'a' -> 'hóa' / 'hoá'
   *   'hoá' + 'n' -> 'hoán'
   */
  checkDynamicToneShift(word, key) {
    if (!word || !key || key.length !== 1) {
      return { transformed: false, result: word + key };
    }

    // Fast check: word must contain at least one accented vowel
    let hasAccentedVowel = false;
    for (let i = 0; i < word.length; i++) {
      const tone = CHAR_TO_BASE_AND_TONE[word[i]]?.tone;
      if (tone && tone > 0) {
        hasAccentedVowel = true;
        break;
      }
    }
    if (!hasAccentedVowel) {
      return { transformed: false, result: word + key };
    }

    // Only vowel additions or valid coda additions trigger dynamic shifting
    const lowerKey = key.toLowerCase();
    const isVowelKey = ['a', 'e', 'i', 'o', 'u', 'y'].includes(lowerKey);
    const isCodaKey = ['c', 'h', 'm', 'n', 'p', 't', 'g'].includes(lowerKey);
    if (!isVowelKey && !isCodaKey) {
      return { transformed: false, result: word + key };
    }

    const candidate = word + key;
    const parsed = parseSyllable(candidate);
    if (!parsed || parsed.tone === TONE_MARK.NONE || !parsed.nucleus) {
      return { transformed: false, result: candidate };
    }

    // Check phonological validity (stop finals rule, short vowels rule)
    if (!parsed.isValid()) {
      return { transformed: false, result: candidate };
    }

    const reconstructed = parsed.reconstruct(this.toneStyle);
    if (reconstructed && reconstructed !== candidate) {
      return { transformed: true, result: reconstructed };
    }

    return { transformed: false, result: candidate };
  }

  /**
   * Shape Modifier Swapping (VietC / Bamboo innovation):
   * Allows users to swap between circumflex, horn, and breve while preserving existing tone marks:
   * Telex:
   *   â + w -> ă (ấm + w -> ắm, cân + w -> căn, tập + w -> tặp)
   *   ă + a -> â (ắm + a -> ấm, căn + a -> cân, tặp + a -> tập)
   *   ô + w -> ơ (bốn + w -> bớn, hộp + w -> hợp, cột + w -> cợt)
   *   ơ + o -> ô (bớn + o -> bốn, hợp + o -> hộp, cợt + o -> cột)
   * VNI:
   *   '8' (breve) on 'â' -> 'ă' (tấ + 8 -> tắ)
   *   '6' (circumflex) on 'ă' -> 'â' (tắ + 6 -> tấ)
   *   '7' (horn) on 'ô' -> 'ơ' (bốn + 7 -> bớn, giồ + 7 -> giờ)
   *   '6' (circumflex) on 'ơ' -> 'ô' (bớn + 6 -> bốn, giờ + 6 -> giồ)
   */
  checkShapeModifierSwapping(word, key) {
    if (!word || !key || key.length !== 1) {
      return { transformed: false, result: word + key };
    }

    const method = this.getEffectiveMethod(key);
    const lowerKey = key.toLowerCase();
    const parsed = parseSyllable(word);
    if (!parsed || !parsed.nucleus) {
      return { transformed: false, result: word + key };
    }

    const lowerNucleus = parsed.nucleus.toLowerCase();
    const isUpper = parsed.nucleus === parsed.nucleus.toUpperCase();
    let newNucleusBase = null;

    if (method === IME_METHOD.TELEX) {
      // 1. â <-> ă via 'w' and 'a'
      if (lowerKey === 'w' && lowerNucleus === 'â') {
        newNucleusBase = isUpper ? 'Ă' : 'ă';
      } else if (lowerKey === 'a' && lowerNucleus === 'ă') {
        newNucleusBase = isUpper ? 'Â' : 'â';
      }
      // 2. ô <-> ơ via 'w' and 'o'
      else if (lowerKey === 'w' && lowerNucleus === 'ô') {
        newNucleusBase = isUpper ? 'Ơ' : 'ơ';
      } else if (lowerKey === 'o' && lowerNucleus === 'ơ') {
        newNucleusBase = isUpper ? 'Ô' : 'ô';
      }
    } else if (method === IME_METHOD.VNI) {
      // 1. â <-> ă via '8' (breve) and '6' (circumflex)
      if (key === '8' && lowerNucleus === 'â') {
        newNucleusBase = isUpper ? 'Ă' : 'ă';
      } else if (key === '6' && lowerNucleus === 'ă') {
        newNucleusBase = isUpper ? 'Â' : 'â';
      }
      // 2. ô <-> ơ via '7' (horn) and '6' (circumflex)
      else if (key === '7' && lowerNucleus === 'ô') {
        newNucleusBase = isUpper ? 'Ơ' : 'ơ';
      } else if (key === '6' && lowerNucleus === 'ơ') {
        newNucleusBase = isUpper ? 'Ô' : 'ô';
      }
    }

    if (newNucleusBase) {
      parsed.nucleus = newNucleusBase;
      const reconstructed = parsed.reconstruct(this.toneStyle);
      return { transformed: true, result: reconstructed };
    }

    return { transformed: false, result: word + key };
  }

  /**
   * Quick Consonant transformations (XKey engine feature):
   * - Start: f -> ph, j -> gi, w -> qu (when at word start)
   * - End: vowel + g -> ng, vowel + h -> nh, vowel + k -> ch
   */
  checkQuickConsonants(word, key) {
    if (!this.quickConsonants) return { transformed: false, result: word + key };
    const lowerKey = key.toLowerCase();

    // 1. Quick Start Consonants (f -> ph, j -> gi, w -> qu)
    if (word.length === 0) {
      if (lowerKey === 'f') {
        const rep = key === 'F' ? 'PH' : 'ph';
        return { transformed: true, result: rep };
      }
      if (lowerKey === 'j') {
        const rep = key === 'J' ? 'GI' : 'gi';
        return { transformed: true, result: rep };
      }
      if (lowerKey === 'w') {
        const rep = key === 'W' ? 'QU' : 'qu';
        return { transformed: true, result: rep };
      }
    }

    // 2. Quick End Consonants (g -> ng, h -> nh, k -> ch) following a vowel
    if (word.length > 0) {
      // English / Foreign word protection:
      // If the word has a foreign onset (e.g. 'pl' in 'plugin', 'fl' in 'flag', 'bl' in 'blog', 'pr' in 'prog'):
      // or is in the user custom dictionary, NEVER expand quick consonants!
      if (hasForeignOnset(word) || userDictionary.has(word) || userDictionary.has(word + key)) {
        return { transformed: false, result: word + key };
      }

      const lastChar = word.slice(-1);
      const isVowel = Boolean(CHAR_TO_BASE_AND_TONE[lastChar]);
      if (isVowel) {
        if (lowerKey === 'g') {
          const rep = key === 'G' ? 'NG' : 'ng';
          return { transformed: true, result: word + rep };
        }
        if (lowerKey === 'h') {
          const rep = key === 'H' ? 'NH' : 'nh';
          return { transformed: true, result: word + rep };
        }
        if (lowerKey === 'k') {
          const rep = key === 'K' ? 'CH' : 'ch';
          return { transformed: true, result: word + rep };
        }
      }
    }

    return { transformed: false, result: word + key };
  }

  /**
   * Quick Telex transformations (OpenKey feature):
   * - cc -> ch, gg -> gi, kk -> kh, nn -> ng, pp -> ph, tt -> th
   * - Case preservation: cc -> ch, Cc -> Ch, CC -> CH
   * - Typing key a 3rd time reverts to triple consonant (e.g. 'ch' + 'c' -> 'ccc')
   */
  checkQuickTelex(word, key) {
    if (!word) return { transformed: false, result: word + key };
    const lowerKey = key.toLowerCase();

    // 1. Triple-consonant toggle back (e.g. user typed 'ch' from 'cc', typing 'c' again gives 'ccc')
    if (word.length === 2) {
      const lowerWord = word.toLowerCase();
      const isQuickPair = (lowerWord === 'ch' && lowerKey === 'c') ||
                          (lowerWord === 'gi' && lowerKey === 'g') ||
                          (lowerWord === 'kh' && lowerKey === 'k') ||
                          (lowerWord === 'ng' && lowerKey === 'n') ||
                          (lowerWord === 'ph' && lowerKey === 'p') ||
                          (lowerWord === 'th' && lowerKey === 't');
      if (isQuickPair) {
        const isUpper = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
        const base = isUpper ? key.toUpperCase() : lowerKey;
        return { transformed: true, result: base + base + base };
      }
    }

    if (word.length !== 1) return { transformed: false, result: word + key };

    const firstChar = word[0];
    const lowerFirst = firstChar.toLowerCase();

    if (lowerFirst !== lowerKey) return { transformed: false, result: word + key };

    const quickMap = {
      'c': 'h',
      'g': 'i',
      'k': 'h',
      'n': 'g',
      'p': 'h',
      't': 'h'
    };

    const mappedSecond = quickMap[lowerFirst];
    if (!mappedSecond) return { transformed: false, result: word + key };

    // Foreign onset protection
    if (userDictionary.has(word + key)) {
      return { transformed: false, result: word + key };
    }

    const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    const isKeyUpper = key === key.toUpperCase() && key !== key.toLowerCase();

    let result = '';
    if (isFirstUpper && isKeyUpper) {
      result = firstChar + mappedSecond.toUpperCase(); // e.g. CC -> CH, GG -> GI
    } else if (isFirstUpper) {
      result = firstChar + mappedSecond.toLowerCase(); // e.g. Cc -> Ch, Gg -> Gi
    } else {
      result = firstChar + mappedSecond.toLowerCase(); // e.g. cc -> ch, gg -> gi
    }

    return { transformed: true, result };
  }

  /**
   * Consonant modifications (Telex dd -> đ, VNI d + 9 -> đ, etc.)
   */
  checkConsonant(word, key) {
    if (!word) return { transformed: false, result: word + key };
    const method = this.getEffectiveMethod(key);
    const lowerKey = key.toLowerCase();
    const lastChar = word.slice(-1);
    const lowerLast = lastChar.toLowerCase();

    // Telex 'd' + 'd' -> 'đ' / 'd' + 'd' + 'd' -> 'dd'
    if (method === IME_METHOD.TELEX && lowerKey === 'd') {
      if (lowerLast === 'd') {
        const isUpper = lastChar === 'D';
        const replacement = isUpper ? (key === 'D' ? 'Đ' : 'Đ') : 'đ';
        return { transformed: true, result: word.slice(0, -1) + replacement };
      }
      if (lowerLast === 'đ') {
        // Toggle back: 'đ' + 'd' -> 'dd'
        const isUpper = lastChar === 'Đ';
        const replacement = isUpper ? 'DD' : 'dd';
        return { transformed: true, result: word.slice(0, -1) + replacement };
      }
    }

    // VNI: 'd' + '9' -> 'đ'
    if (method === IME_METHOD.VNI && key === '9') {
      // Find 'd' or 'đ' in the word
      const dIndex = word.toLowerCase().lastIndexOf('d');
      const dbarIndex = word.toLowerCase().lastIndexOf('đ');
      if (dbarIndex !== -1) {
        // Toggle back and append '9'
        const char = word[dbarIndex];
        const rep = char === 'Đ' ? 'D' : 'd';
        return {
          transformed: true,
          result: word.slice(0, dbarIndex) + rep + word.slice(dbarIndex + 1) + '9'
        };
      } else if (dIndex !== -1) {
        const char = word[dIndex];
        const rep = char === 'D' ? 'Đ' : 'đ';
        return {
          transformed: true,
          result: word.slice(0, dIndex) + rep + word.slice(dIndex + 1)
        };
      }
    }

    return { transformed: false, result: word + key };
  }

  /**
   * Vowel shape modification:
   * Telex:
   *   aa -> â, ee -> ê, oo -> ô
   *   ow -> ơ, uw -> ư, aw -> ă
   *   w at start or after u/o:
   *     uo + w -> ươ
   *     u + w -> ư
   *     w alone -> w (or ư)
   * VNI:
   *   6 -> â, ê, ô
   *   7 -> ơ, ư
   *   8 -> ă
   */
  checkVowelShape(word, key) {
    if (!word) return { transformed: false, result: word + key };
    const method = this.getEffectiveMethod(key);
    const lowerKey = key.toLowerCase();

    if (method === IME_METHOD.TELEX) {
      // Circumflex modifiers: 'a', 'e', 'o'
      if (['a', 'e', 'o'].includes(lowerKey)) {
        const circumflexTarget = lowerKey === 'a' ? 'â' : lowerKey === 'e' ? 'ê' : 'ô';

        // 1. Direct adjacent match (e.g. 'co' + 'o' -> 'cô', 'cô' + 'o' -> 'coo')
        const lastChar = word.slice(-1);
        const lastBaseInfo = CHAR_TO_BASE_AND_TONE[lastChar];
        if (lastBaseInfo) {
          const lastBase = lastBaseInfo.base.toLowerCase();
          if (lastBase === lowerKey) {
            const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
            if (target) {
              const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
              const tone = lastBaseInfo.tone;
              const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[newBase][tone];
              return { transformed: true, result: word.slice(0, -1) + newChar };
            }
          } else if (lastBase === circumflexTarget) {
            // Already circumflexed: toggle back to double raw letter (e.g. 'cô' + 'o' -> 'coo')
            const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
            if (target) {
              const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
              const tone = lastBaseInfo.tone;
              const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[newBase][tone];
              return { transformed: true, result: word.slice(0, -1) + newChar + key };
            }
          }
        }

        // 2. Late circumflex: user typed at the end of word (e.g. 'chong' + 'o' -> 'chông', 'kieu' + 'e' -> 'kiêu')
        const vowelIndices = [];
        for (let i = 0; i < word.length; i++) {
          if (CHAR_TO_BASE_AND_TONE[word[i]]) {
            vowelIndices.push(i);
          }
        }

        if (vowelIndices.length > 0) {
          // Check if vowels in word are contiguous (single Vietnamese syllable)
          let isContiguous = true;
          for (let k = 0; k < vowelIndices.length - 1; k++) {
            if (vowelIndices[k + 1] - vowelIndices[k] !== 1) {
              isContiguous = false;
              break;
            }
          }

          if (isContiguous) {
            // Scan backwards through the vowels to find one that matches lowerKey or circumflexTarget
            for (let idx = vowelIndices.length - 1; idx >= 0; idx--) {
              const charIndex = vowelIndices[idx];
              const char = word[charIndex];
              const baseInfo = CHAR_TO_BASE_AND_TONE[char];
              if (!baseInfo) continue;

              const charBase = baseInfo.base.toLowerCase();

              // If candidate matches plain vowel ('o', 'e', 'a')
              if (charBase === lowerKey) {
                const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                if (target) {
                  const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                  const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                  const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                  const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1);

                  // Validate against phonology rules (Natural Phonological Guard) and spell check
                  if (this.phonologyRules) {
                    if (isCheckedToneViolation(newWord, baseInfo.tone)) {
                      continue;
                    }
                    const parsed = parseSyllable(newWord);
                    if (parsed && !parsed.isValid()) {
                      continue;
                    }
                  }

                  if (!this.spellCheck || this.isValidVietnameseWord(newWord)) {
                    return { transformed: true, result: newWord };
                  }
                }
              }

              // If candidate is ALREADY circumflexed ('ô', 'ê', 'â') and user presses the key again at end of word:
              // Special French loanword rule: if word ends with 'ng' (e.g. 'xông', 'bông', 'gông', 'gồng'),
              // pressing 'o' should turn 'ô/ồ/ố' into 'oo/oò/oó' -> 'xoong', 'boong', 'goong', 'goòng'
              if (charBase === circumflexTarget) {
                if (lowerKey === 'o' && word.toLowerCase().endsWith('ng')) {
                  const endsWithNg = word.toLowerCase().endsWith('ng');
                  const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                  if (target && endsWithNg) {
                    const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                    const tone = baseInfo.tone;
                    const o1 = isUpper ? 'O' : 'o';
                    const o2Base = isUpper ? 'O' : 'o';
                    const o2Accented = VOWEL_TABLE[o2Base][tone];
                    const doubleO = o1 + o2Accented;
                    const newWord = word.slice(0, charIndex) + doubleO + word.slice(charIndex + 1);
                    return { transformed: true, result: newWord };
                  }
                }

                // Default circumflex toggle:
                // e.g. 'chông' + 'o' -> reverts 'ô' to 'o' and appends 'o' -> 'chongo'
                // e.g. 'kiêu' + 'e' -> reverts 'ê' to 'e' and appends 'e' -> 'kieue'
                // e.g. 'hâng' + 'a' -> reverts 'â' to 'a' and appends 'a' -> 'hanga'
                const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                if (target) {
                  const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                  const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                  const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                  const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1) + key;
                  return { transformed: true, result: newWord };
                }
              }
            }
          }
        }
      }

      // Horn & Breve: 'w'
      if (lowerKey === 'w') {
        return this.applyTelexW(word);
      }
    }

    if (method === IME_METHOD.VNI) {
      if (key === '6') {
        return this.applyVniModifier(word, 'circumflex');
      }
      if (key === '7') {
        return this.applyVniModifier(word, 'horn');
      }
      if (key === '8') {
        return this.applyVniModifier(word, 'breve');
      }
    }

    return { transformed: false, result: word + key };
  }

  /**
   * Helper to locate an adjacent 'uo' pair (or already horned 'ươ' / 'uơ' / 'ưo')
   * in the word buffer.
   * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
   */
  findUoPair(word) {
    if (!word || word.length < 2) return null;
    for (let i = 0; i < word.length - 1; i++) {
      const c1 = word[i];
      const c2 = word[i + 1];
      const info1 = CHAR_TO_BASE_AND_TONE[c1];
      const info2 = CHAR_TO_BASE_AND_TONE[c2];
      if (info1 && info2) {
        const b1 = info1.base.toLowerCase();
        const b2 = info2.base.toLowerCase();
        if ((b1 === 'u' || b1 === 'ư') && (b2 === 'o' || b2 === 'ơ' || b2 === 'ô')) {
          const isHorned = (b1 === 'ư' && b2 === 'ơ');
          return {
            index: i,
            c1,
            c2,
            info1,
            info2,
            b1,
            b2,
            isHorned
          };
        }
      }
    }
    return null;
  }

  /**
   * Transform 'uo' / 'ươ' pair with horn modifier (VNI 7 or Telex w)
   * - If already 'ươ', toggles back to 'uo' (preserving tone on second vowel)
   * - Otherwise transforms both to 'ươ' (placing any existing tone on 'ơ')
   */
  applyUoHorn(word, pair) {
    const { index, c1, c2, info1, info2, isHorned } = pair;
    const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
    const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
    const tone = Math.max(info1.tone, info2.tone);

    // ── The Trio of uơ Exceptions (thuở, quởn/quỡn/quơ, huơ) ──
    // In Vietnamese phonology:
    // 1. 'thuở' (muôn thuở, thuở xưa): onset 'th' keeps bare 'u', only 'o' takes horn when ends word.
    // 2. 'quơ', 'quởn', 'quỡn' (quơ tay, quởn đời): onset 'q' never combines with 'ư' (qư/qươ is impossible).
    //    'qu' is the onset cluster where 'u' is glide, so only 'o' takes horn -> 'quơ', 'quơn' (quởn).
    // 3. 'huơ' (huơ tay, huơ dao): when ending with 'o', bare 'huo' becomes 'huơ' (never 'hươ').
    const endsWord = (index + 2 === word.length);
    const hasCodaN = (index + 3 === word.length && word[index + 2].toLowerCase() === 'n');
    let isTrioException = false;

    // Check onset before 'uo'
    if (index >= 1) {
      const charBefore = word[index - 1].toLowerCase();
      // Onset 'q' (quơ, quơn/quởn)
      if (charBefore === 'q' && (endsWord || hasCodaN)) {
        isTrioException = true;
      }
      // Onset 'h' (huơ - only when ends word without coda, as hươu ends with u)
      else if (charBefore === 'h' && endsWord) {
        isTrioException = true;
      }
      // Onset 'th' (thuở - only when ends word)
      else if (index >= 2 && word.slice(index - 2, index).toLowerCase() === 'th' && endsWord) {
        isTrioException = true;
      }
    }

    if (isTrioException) {
      if (info2.base.toLowerCase() === 'ơ' || isHorned) {
        // Toggle back to plain 'uo'
        const base1 = isUpper1 ? 'U' : 'u';
        const base2 = isUpper2 ? 'O' : 'o';
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      } else {
        // Horn ONLY the 'o' -> 'ơ', keeping bare 'u' -> 'thuơ', 'quơ', 'quơn', 'huơ'
        const base1 = isUpper1 ? 'U' : 'u';
        const base2 = isUpper2 ? 'Ơ' : 'ơ';
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      }
    }

    if (isHorned) {
      // Toggle back to plain 'uo' and append 'w'
      const base1 = isUpper1 ? 'U' : 'u';
      const base2 = isUpper2 ? 'O' : 'o';
      const char1 = VOWEL_TABLE[base1][0];
      const char2 = VOWEL_TABLE[base2][tone];
      return {
        transformed: true,
        result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + 'w'
      };
    } else {
      // Transform both to 'ươ'
      const base1 = isUpper1 ? 'Ư' : 'ư';
      const base2 = isUpper2 ? 'Ơ' : 'ơ';
      const char1 = VOWEL_TABLE[base1][0];
      const char2 = VOWEL_TABLE[base2][tone];
      return {
        transformed: true,
        result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
      };
    }
  }

  /**
   * Helper to locate an adjacent 'uu' pair (or already horned 'ưu' / 'uư')
   * in the word buffer (e.g. 'cuu', 'cưu', 'luu', 'muu', 'huu', 'tuu').
   * In Vietnamese orthography, 'uu' + horn MUST horn the FIRST 'u' to form 'ưu' (never 'uư').
   * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
   */
  findUuPair(word) {
    if (!word || word.length < 2) return null;
    for (let i = 0; i < word.length - 1; i++) {
      const c1 = word[i];
      const c2 = word[i + 1];
      const info1 = CHAR_TO_BASE_AND_TONE[c1];
      const info2 = CHAR_TO_BASE_AND_TONE[c2];
      if (info1 && info2) {
        const b1 = info1.base.toLowerCase();
        const b2 = info2.base.toLowerCase();
        if ((b1 === 'u' || b1 === 'ư') && (b2 === 'u' || b2 === 'ư')) {
          const isHorned = (b1 === 'ư' && b2 === 'u');
          return {
            index: i,
            c1,
            c2,
            info1,
            info2,
            b1,
            b2,
            isHorned
          };
        }
      }
    }
    return null;
  }

  /**
   * Transform 'uu' / 'ưu' pair with horn modifier (VNI 7 or Telex w)
   * - If already 'ưu', toggles back to plain 'uu'
   * - Otherwise transforms to 'ưu' (horn placed on the first 'u')
   * - Preserves any existing tone, placing it on the 'ư' (the nucleus)
   */
  applyUuHorn(word, pair) {
    const { index, c1, c2, info1, info2, isHorned } = pair;
    const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
    const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
    const tone = Math.max(info1.tone, info2.tone);

    if (isHorned) {
      // Toggle back to plain 'uu' and append 'w'
      const base1 = isUpper1 ? 'U' : 'u';
      const base2 = isUpper2 ? 'U' : 'u';
      const char1 = VOWEL_TABLE[base1][tone];
      const char2 = VOWEL_TABLE[base2][0];
      return {
        transformed: true,
        result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + 'w'
      };
    } else {
      // Transform first 'u' to 'ư' -> 'ưu'
      const base1 = isUpper1 ? 'Ư' : 'ư';
      const base2 = isUpper2 ? (isUpper1 && isUpper2 ? 'U' : 'u') : 'u';
      const char1 = VOWEL_TABLE[base1][tone];
      const char2 = VOWEL_TABLE[base2][0];
      return {
        transformed: true,
        result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
      };
    }
  }

  /**
   * Apply Telex 'w' transformation
   * Handles:
   * - uo + w / uow / duoc + w -> ươ (both vowels horned: được, nước, ước)
   * - ươ + w -> toggles back to uo
   * - uu + w / cuu + w -> ưu (first vowel horned: cưu, cứu, cừu)
   * - ưu + w -> toggles back to uu
   * - ow -> ơ, uw -> ư, aw -> ă
   * - Toggle: ơ + w -> o, ư + w -> u, ă + w -> a
   * - w at beginning or after consonant: produces ư
   * - ư + w -> toggles back to w
   */
  applyTelexW(word) {
    // If word already ends with 'w' or 'W', pass key through literally without cycling
    if (word.endsWith('w') || word.endsWith('W')) {
      return { transformed: false, result: word + 'w' };
    }

    // 1. Check double 'uo' / 'uô' / 'ươ' -> 'ươ'
    const uoPair = this.findUoPair(word);
    if (uoPair) {
      return this.applyUoHorn(word, uoPair);
    }

    // 2. Check double 'uu' / 'ưu' -> 'ưu'
    const uuPair = this.findUuPair(word);
    if (uuPair) {
      return this.applyUuHorn(word, uuPair);
    }

    // 3. Check if the single word is 'ư' or 'Ư' (user typed w twice to get w)
    if (word === 'ư') return { transformed: true, result: 'w' };
    if (word === 'Ư') return { transformed: true, result: 'W' };

    // 3. Check vowels from right to left: a, o, u, or already ă, ơ, ư
    for (let i = word.length - 1; i >= 0; i--) {
      const char = word[i];
      const baseInfo = CHAR_TO_BASE_AND_TONE[char];
      if (baseInfo) {
        const lowerBase = baseInfo.base.toLowerCase();
        if (['a', 'o', 'u', 'ă', 'ơ', 'ư'].includes(lowerBase)) {
          // If already has horn/breve, toggle back to plain
          let target = SHAPE_MAP[baseInfo.base]?.horn;
          if (!target && ['a', 'ă'].includes(lowerBase)) {
            target = SHAPE_MAP[baseInfo.base]?.breve;
          }

          if (target) {
            const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
            const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
            const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
            const appendLetter = ['ă', 'ơ', 'ư'].includes(lowerBase) ? 'w' : '';
            return {
              transformed: true,
              result: word.slice(0, i) + newChar + word.slice(i + 1) + appendLetter
            };
          }
        }
      }
    }

    // 4. If no vowel found and at start, 'w' becomes 'ư'
    if (word.length === 0) {
      return { transformed: true, result: 'ư' };
    }

    // 5. If word has NO vowel yet and ends with a consonant (e.g. 'th', 'm', 'b'), 'w' acts as 'ư'
    const lastChar = word.slice(-1);
    const parsedWord = parseSyllable(word);
    const hasVowelNucleus = Boolean(parsedWord && parsedWord.nucleus);

    if (!hasVowelNucleus && /^[a-zA-Z]$/.test(lastChar) && !CHAR_TO_BASE_AND_TONE[lastChar] && lastChar.toLowerCase() !== 'w') {
      const isUpper = lastChar === lastChar.toUpperCase();
      return {
        transformed: true,
        result: word + (isUpper ? 'Ư' : 'ư')
      };
    }

    return { transformed: false, result: word + 'w' };
  }

  /**
   * Apply VNI shape modifier (6 = circumflex, 7 = horn, 8 = breve)
   */
  applyVniModifier(word, modifierType) {
    if (modifierType === 'horn') {
      // 1. Check if word contains 'uo' digraph pair (e.g. duoc, uoc, nuoc, muon)
      const uoPair = this.findUoPair(word);
      if (uoPair) {
        return this.applyUoHorn(word, uoPair);
      }

      // 2. Check if word contains 'uu' digraph pair (e.g. cuu, luu, muu, huu, tuu) -> 'ưu'
      const uuPair = this.findUuPair(word);
      if (uuPair) {
        return this.applyUuHorn(word, uuPair);
      }

      // 3. Otherwise scan backwards for last 'u' or 'o' (or already 'ư' / 'ơ')
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const baseInfo = CHAR_TO_BASE_AND_TONE[char];
        if (baseInfo) {
          const lowerBase = baseInfo.base.toLowerCase();
          if (['u', 'ư', 'o', 'ơ'].includes(lowerBase)) {
            const target = SHAPE_MAP[baseInfo.base]?.horn;
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              // If already horned ('ư', 'ơ'), retyping '7' removes horn AND outputs '7'
              if (['ư', 'ơ'].includes(lowerBase)) {
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1) + '7'
                };
              }
              return {
                transformed: true,
                result: word.slice(0, i) + newChar + word.slice(i + 1)
              };
            }
          }
        }
      }
      return { transformed: false, result: word };
    }

    if (modifierType === 'breve') {
      // Breve applies strictly to 'a' / 'ă'
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const baseInfo = CHAR_TO_BASE_AND_TONE[char];
        if (baseInfo) {
          const lowerBase = baseInfo.base.toLowerCase();
          if (['a', 'ă'].includes(lowerBase)) {
            const target = SHAPE_MAP[baseInfo.base]?.breve;
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              // If already breve ('ă'), retyping '8' removes breve AND outputs '8'
              if (lowerBase === 'ă') {
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1) + '8'
                };
              }
              return {
                transformed: true,
                result: word.slice(0, i) + newChar + word.slice(i + 1)
              };
            }
          }
        }
      }
      return { transformed: false, result: word };
    }

    if (modifierType === 'circumflex') {
      // Circumflex applies to 'a' (â), 'e' (ê), 'o' (ô)
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const baseInfo = CHAR_TO_BASE_AND_TONE[char];
        if (baseInfo) {
          const lowerBase = baseInfo.base.toLowerCase();
          const target = SHAPE_MAP[baseInfo.base]?.circumflex;
          if (target) {
            const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
            const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
            const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
            // If already circumflexed ('â', 'ê', 'ô'), retyping '6' removes circumflex AND outputs '6'
            // (e.g. 'icon' + '6' -> 'icôn' + '6' -> 'icon6' -> + '4' -> 'icon64')
            if (['â', 'ê', 'ô'].includes(lowerBase)) {
              return {
                transformed: true,
                result: word.slice(0, i) + newChar + word.slice(i + 1) + '6'
              };
            }
            return {
              transformed: true,
              result: word.slice(0, i) + newChar + word.slice(i + 1)
            };
          }
        }
      }
      return { transformed: false, result: word };
    }

    return { transformed: false, result: word };
  }

  /**
   * Tone transformation (Acute, Grave, Hook, Tilde, Dot, Remove)
   */
  checkTone(word, key) {
    if (!word) return { transformed: false, result: word + key };

    const lowerKey = key.toLowerCase();
    const toneMap = this.getToneForKey(key);
    if (toneMap === null) {
      return { transformed: false, result: word + key };
    }

    // Find all vowels in word
    const vowelIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (CHAR_TO_BASE_AND_TONE[word[i]]) {
        vowelIndices.push(i);
      }
    }

    if (vowelIndices.length === 0) {
      return { transformed: false, result: word + key };
    }

    // Check if word already has a tone
    let currentTone = 0;
    let currentToneIdx = -1;
    vowelIndices.forEach(idx => {
      const tone = CHAR_TO_BASE_AND_TONE[word[idx]].tone;
      if (tone > 0) {
        currentTone = tone;
        currentToneIdx = idx;
      }
    });

    // If key is 'removeTone' (z in Telex / Auto, 0 in VNI):
    // If the word has a tone (e.g. toán, tiến, hoả, thuần, được), remove it immediately to restore base vowels.
    // If no tone exists, append 'z' or '0' naturally.
    if (toneMap === 0) {
      if (currentTone > 0) {
        const cleaned = this.stripToneFromWord(word, vowelIndices);
        return { transformed: true, result: cleaned };
      }
      return { transformed: false, result: word + key };
    }

    // Phonology Check (GoNhanh Rule 4): Checked Tone Stop Finals (-c, -ch, -p, -t)
    // Syllables ending in c, ch, p, t can ONLY take Tone 1 (sắc) or Tone 5 (nặng).
    // Tone 2 (huyền), 3 (hỏi), 4 (ngã) are strictly prohibited on stop finals!
    if (this.phonologyRules && isCheckedToneViolation(word, toneMap)) {
      return { transformed: false, result: word + key };
    }

    // Phonology Check: c/k, g/gh, ng/ngh violations
    if (this.phonologyRules && hasPhonologyViolation(word)) {
      return { transformed: false, result: word + key };
    }

    // Determine target vowel index according to Modern/Classic placement rules
    const targetVowelIdx = this.getTargetVowelIndex(word, vowelIndices);

    // Retyping the same tone key toggles/removes the tone
    if (currentTone === toneMap) {
      const cleaned = this.stripToneFromWord(word, vowelIndices);
      const method = this.getEffectiveMethod(key);
      let appendKey = '';

      if (method === IME_METHOD.VNI) {
        // In VNI mode, retyping the number key removes tone AND outputs the number (e.g. ca + 1 -> cá + 1 -> ca1)
        appendKey = key;
      } else {
        // In Telex / Auto mode (vnchKey innovation):
        // If retyping tone key on an English trap word (e.g. 'dóc' + 's' -> candidate 'docs'),
        // or if the unaccented base is not a valid Vietnamese word (e.g. 'doc' is not a valid Vietnamese syllable):
        // Restore the literal letter key immediately so 'dóc' + 's' yields 'docs' directly without requiring a 3rd 's'!
        const candidate = (cleaned + key).toLowerCase();
        if (
          ENGLISH_TELEX_TRAPS.has(candidate) ||
          COMMON_ENGLISH_WORDS.has(candidate) ||
          !this.isValidVietnameseWord(cleaned)
        ) {
          appendKey = key;
        }
      }

      const result = cleaned + appendKey;
      this.lastToneToggledWord = { base: result, key: lowerKey };
      return { transformed: true, result };
    }

    // If this tone was just toggled off by retyping the same tone key,
    // retyping the tone key again must pass it through literally (e.g. 'docs' + 's' -> 'docss')
    if (
      this.lastToneToggledWord &&
      this.lastToneToggledWord.base === word &&
      this.lastToneToggledWord.key === lowerKey
    ) {
      this.lastToneToggledWord = null;
      return { transformed: false, result: word + key };
    }
    this.lastToneToggledWord = null;

    // Strip previous tone from all vowels first
    const baseWord = this.stripToneFromWord(word, vowelIndices);

    // Place the new tone on target vowel
    const targetChar = baseWord[targetVowelIdx];
    const baseInfo = CHAR_TO_BASE_AND_TONE[targetChar];
    if (!baseInfo) return { transformed: false, result: word + key };

    let targetBase = baseInfo.base;
    const lastVowelIdx = vowelIndices[vowelIndices.length - 1];
    const hasFinalConsonant = lastVowelIdx < word.length - 1;

    // Auto-circumflex for 'uye' before final consonant (e.g. thuyet + s -> thuyết, chuyen -> chuyến)
    if (targetBase.toLowerCase() === 'e' && hasFinalConsonant && targetVowelIdx >= 2) {
      const preceding = baseWord.slice(targetVowelIdx - 2, targetVowelIdx).toLowerCase();
      if (preceding === 'uy') {
        const isUpper = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
        targetBase = isUpper ? 'Ê' : 'ê';
      }
    }

    const newChar = VOWEL_TABLE[targetBase][toneMap];
    const newWord = baseWord.slice(0, targetVowelIdx) + newChar + baseWord.slice(targetVowelIdx + 1);

    // Natural Phonological Guard (Bamboo / vnchKey architecture):
    // Even if full dictionary spell checking is disabled by the user,
    // the resulting word MUST be phonologically valid in Vietnamese:
    // 1. Must contain a valid vowel nucleus (cannot be consonant soup).
    // 2. Cannot have an illegal foreign coda (e.g. -tx in 'fcitx', -cx in 'docx', -rl in 'curl').
    // 3. Cannot violate stop final checked-tone laws.
    if (this.phonologyRules) {
      const parsedNew = parseSyllable(newWord);
      if (parsedNew && !parsedNew.isValid()) {
        return { transformed: false, result: word + key };
      }
    }

    // Spell check validation (against Hunspell dictionary, if enabled)
    if (this.spellCheck && !this.isValidVietnameseWord(newWord)) {
      // If invalid syllable, pass-through without tone
      return { transformed: false, result: word + key };
    }

    return { transformed: true, result: newWord };
  }

  getToneForKey(key) {
    const method = this.getEffectiveMethod(key);
    const lowerKey = key.toLowerCase();
    if (method === IME_METHOD.TELEX) {
      switch (lowerKey) {
        case 's': return 1; // sắc
        case 'f': return 2; // huyền
        case 'r': return 3; // hỏi
        case 'x': return 4; // ngã
        case 'j': return 5; // nặng
        case 'z': return 0; // xóa dấu
        default: return null;
      }
    }
    if (method === IME_METHOD.VNI) {
      switch (key) {
        case '1': return 1;
        case '2': return 2;
        case '3': return 3;
        case '4': return 4;
        case '5': return 5;
        case '0': return 0;
        default: return null;
      }
    }
    return null;
  }

  /**
   * Determine exact vowel index to receive tone
   * Modern vs Classic tone rules:
   * - Modern: hòa, thủy, khỏe, thỏa
   * - Classic: hoà, thuỷ, khoẻ, thoả
   */
  getTargetVowelIndex(word, vowelIndices) {
    if (vowelIndices.length === 1) {
      return vowelIndices[0];
    }

    let effectiveIndices = [...vowelIndices];

    // Check for 'qu' and 'gi' initial consonant clusters:
    // In 'qu', the 'u' acts as consonant glide, not syllable nucleus
    const firstIdx = effectiveIndices[0];
    if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === 'qu') {
      if (effectiveIndices.length > 1) {
        effectiveIndices = effectiveIndices.slice(1);
      }
    } else if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === 'gi') {
      // In 'gi', if followed by another vowel (e.g. 'già', 'gió'), the 'i' acts as consonant
      if (effectiveIndices.length > 1) {
        effectiveIndices = effectiveIndices.slice(1);
      }
    }

    if (effectiveIndices.length === 1) {
      return effectiveIndices[0];
    }

    const lastVowelIdx = effectiveIndices[effectiveIndices.length - 1];
    const hasFinalConsonant = lastVowelIdx < word.length - 1;

    // 1. Closed syllable (ends with a consonant, e.g. 'được', 'nước', 'tiếng', 'toán')
    if (hasFinalConsonant) {
      // For compound vowels before consonant:
      // Tone falls on the nucleus / marked vowel: ơ, ê, ô, â, ă
      for (const idx of effectiveIndices) {
        const char = word[idx];
        const base = CHAR_TO_BASE_AND_TONE[char]?.base.toLowerCase();
        if (['ơ', 'ê', 'ô', 'â', 'ă'].includes(base)) {
          return idx;
        }
      }
      // If no marked vowel (e.g. 'toan', 'hoan', 'quyt'): tone goes on the main vowel (last vowel before consonant)
      return effectiveIndices[effectiveIndices.length - 1];
    }

    // 2. Open syllable (ends with vowel, no final consonant)
    // A. Triphthongs (3 vowels: 'ươi', 'ươu', 'uôi', 'iêu', 'yêu', 'oai', 'uai', 'oay', 'uay', 'oeo', 'uyu')
    if (effectiveIndices.length >= 3) {
      // Tone ALWAYS falls on the middle vowel (e.g. cười, rượu, chuối, nhiều, khoai, xoay)
      return effectiveIndices[1];
    }

    // B. Diphthongs (2 vowels in open syllable)
    const v1 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[0]]]?.base.toLowerCase();
    const v2 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[1]]]?.base.toLowerCase();
    const cluster = v1 + v2;

    // In 'uê', 'uơ', 'ue', 'ươ': tone ALWAYS falls on 2nd vowel (thuế, huế, quế, xuề, uế, thuở, hươ)
    if (['uê', 'uơ', 'ue', 'ươ'].includes(cluster)) {
      return effectiveIndices[1];
    }

    // In 'ưa', 'ưu', 'ia', 'ya', 'ua': tone falls on the 1st vowel (chữa, cứu, mía, múa)
    if (['ưa', 'ưu', 'ia', 'ya', 'ua'].includes(cluster)) {
      return effectiveIndices[0];
    }

    // In 'oa', 'oe', 'uy': depends on Modern vs Classic tone style
    // Modern (BGDĐT): tone on nucleus (2nd vowel: hoà, hoè, thuỷ, hoá)
    // Classic (VNCH): tone on glide (1st vowel: hòa, hòe, thủy, hóa)
    if (['oa', 'oe', 'uy'].includes(cluster)) {
      return this.toneStyle === TONE_STYLE.MODERN
        ? effectiveIndices[1] // Modern: hoà, thuỷ, khoẻ, hoá
        : effectiveIndices[0]; // Classic: hòa, thủy, khỏe, hóa
    }

    // Other diphthongs (ai, ao, au, ay, âu, ây, eo, êu, oi, ôi, ơi, ui):
    // Main vowel is usually the first vowel (mái, sáo, tối, túi, mới, kéo)
    return effectiveIndices[0];
  }

  stripToneFromWord(word, vowelIndices) {
    const chars = word.split('');
    vowelIndices.forEach(idx => {
      const baseInfo = CHAR_TO_BASE_AND_TONE[chars[idx]];
      if (baseInfo) {
        chars[idx] = VOWEL_TABLE[baseInfo.base][0];
      }
    });
    return chars.join('');
  }

  extractWordTone(vowelStr) {
    for (const char of vowelStr) {
      const tone = CHAR_TO_BASE_AND_TONE[char]?.tone;
      if (tone > 0) return tone;
    }
    return 0;
  }

  replaceWordVowels(vowelStr, newVowels, tone) {
    // Distribute tone properly
    if (tone === 0) return newVowels;
    const baseFirst = newVowels[0];
    const rep = VOWEL_TABLE[baseFirst][tone] + newVowels.slice(1);
    return rep;
  }

  /**
   * Syllable spell check validator
   * Validates against built-in Hunspell Vietnamese dictionary (~6,700 words)
   * and user custom dictionary.
   */
  isValidVietnameseWord(word) {
    if (!word) return true;
    return checkWordSpelling(word);
  }

  /**
   * Word Rescue: Retroactively converts a raw keystroke word into its accented Vietnamese equivalent
   * (Ngó Sen / vnchKey innovation).
   * E.g. "tieengs" -> "tiếng", "vieetj" -> "việt", "nef" -> "nè", "Chaof" -> "Chào"
   * Preserves English words and user dictionary entries (linux, server, browser...).
   * @param {string} rawWord
   * @returns {string} Rescued Vietnamese word or original word if unchanged/foreign
   */
  rescueWord(rawWord) {
    if (!rawWord || typeof rawWord !== 'string') return rawWord;
    const lower = rawWord.toLowerCase();

    // 1. If explicitly in COMMON_ENGLISH_WORDS or userDictionary, keep raw
    if (COMMON_ENGLISH_WORDS.has(lower) || userDictionary.has(lower)) {
      return rawWord;
    }

    // 2. Simulate keystroke processing through AvimEngine
    let acc = '';
    for (const ch of rawWord) {
      const res = this.processKey(acc, ch);
      acc = res.transformed ? res.result : acc + ch;
    }

    if (acc === rawWord) return rawWord;

    // Check if result has Vietnamese diacritics or is in valid Vietnamese word set
    const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(acc);
    if (hasVnDiacritics || getVietnameseWordSet().has(acc.toLowerCase())) {
      return acc;
    }

    return rawWord;
  }

  /**
   * Text Rescue: Converts a sentence or phrase of raw words into accented Vietnamese
   * while preserving whitespace, punctuation, and English words.
   * E.g. "Chaof banj, tieengs vieetj nef" -> "Chào bạn, tiếng việt nè"
   * @param {string} text
   * @returns {string} Rescued text
   */
  rescueText(text) {
    if (!text || typeof text !== 'string') return text;
    const tokens = text.split(/([\s\p{P}]+)/u);
    return tokens.map(tok => {
      if (!tok || /^[\s\p{P}]+$/u.test(tok)) return tok;
      return this.rescueWord(tok);
    }).join('');
  }

  /**
   * Selection Accent Rescue:
   * Modifies, adds, or removes tone accents on an existing word or selected syllable.
   * (Ngó Sen / vnchKey innovation).
   * E.g.:
   *   "nhanh" + "s" -> "nhánh"
   *   "nhánh" + "f" -> "nhành"
   *   "nhánh" + "z" -> "nhanh" (remove tone)
   *   "hoa" + "r" -> "hoả" (or "hỏa" classic)
   *   "tieng" + "s" -> "tiếng"
   *   "nhanh" + "1" -> "nhánh"
   *   "nước" + "0" -> "nươc"
   * @param {string} word Current selected word
   * @param {string} key Incoming tone key ('s','f','r','x','j','z' in Telex, '1'-'5','0' in VNI)
   * @returns {string|null} Rescued word with updated tone, or null if key is not a tone modifier
   */
  applyAccentToSelection(word, key) {
    if (!word || !key || key.length !== 1) return null;

    const TONE_KEYS = {
      's': TONE_MARK.ACUTE,      '1': TONE_MARK.ACUTE,
      'f': TONE_MARK.GRAVE,      '2': TONE_MARK.GRAVE,
      'r': TONE_MARK.HOOK_ABOVE, '3': TONE_MARK.HOOK_ABOVE,
      'x': TONE_MARK.TILDE,      '4': TONE_MARK.TILDE,
      'j': TONE_MARK.DOT_BELOW,  '5': TONE_MARK.DOT_BELOW,
      'z': TONE_MARK.NONE,       '0': TONE_MARK.NONE
    };

    const lowerKey = key.toLowerCase();
    if (!(lowerKey in TONE_KEYS)) return null;
    const targetTone = TONE_KEYS[lowerKey];

    const parsed = parseSyllable(word);
    if (!parsed || (!parsed.nucleus && !parsed.glide)) return null;

    const lowerOnset = parsed.onset.toLowerCase();
    const lowerN = parsed.nucleus.toLowerCase();

    // Handle uo trio and special diphthong enhancements
    if (lowerOnset === 'th' && lowerN === 'uo' && !parsed.coda) {
      parsed.glide = 'u';
      parsed.nucleus = 'ơ';
    } else if (lowerOnset === 'q' && lowerN === 'uo' && parsed.coda.toLowerCase() === 'n') {
      parsed.glide = 'u';
      parsed.nucleus = 'ơ';
    } else if (lowerOnset === 'q' && (lowerN === 'o' || lowerN === 'uo') && !parsed.coda) {
      parsed.glide = 'u';
      parsed.nucleus = 'ơ';
    } else if (lowerOnset === 'h' && lowerN === 'uo' && !parsed.coda) {
      parsed.glide = 'u';
      parsed.nucleus = 'ơ';
    } else if (lowerN === 'ie' && parsed.coda) {
      const isUpper = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
      parsed.nucleus = parsed.nucleus[0] + (isUpper ? 'Ê' : 'ê');
    } else if (lowerN === 'uo' && parsed.coda) {
      const isUpper0 = parsed.nucleus[0] === parsed.nucleus[0].toUpperCase();
      const isUpper1 = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
      parsed.nucleus = (isUpper0 ? 'Ư' : 'ư') + (isUpper1 ? 'Ơ' : 'ơ');
    }

    return parsed.withTone(targetTone).reconstruct(this.toneStyle);
  }
}
