/**
 * Vietnamese Syllable Parser & Phonological Reconstructor
 * Ported and adapted from the Bamboo / vnchKey 5-component linguistic model:
 * Syllable = Onset + Glide + Nucleus + Coda + Tone
 *
 * @license Apache-2.0
 */

import { TONE_STYLE } from './key-codes.js';

export const TONE_MARK = {
  NONE: 0,       // Thanh ngang
  ACUTE: 1,      // Sắc (s / 1)
  GRAVE: 2,      // Huyền (f / 2)
  HOOK_ABOVE: 3, // Hỏi (r / 3)
  TILDE: 4,      // Ngã (x / 4)
  DOT_BELOW: 5   // Nặng (j / 5)
};

// Map diacritic vowel to { baseVowel, tone }
export const VOWEL_DECOMPOSE_MAP = {
  // a
  'a': { base: 'a', tone: 0 }, 'á': { base: 'a', tone: 1 }, 'à': { base: 'a', tone: 2 },
  'ả': { base: 'a', tone: 3 }, 'ã': { base: 'a', tone: 4 }, 'ạ': { base: 'a', tone: 5 },
  'A': { base: 'A', tone: 0 }, 'Á': { base: 'A', tone: 1 }, 'À': { base: 'A', tone: 2 },
  'Ả': { base: 'A', tone: 3 }, 'Ã': { base: 'A', tone: 4 }, 'Ạ': { base: 'A', tone: 5 },

  // ă
  'ă': { base: 'ă', tone: 0 }, 'ắ': { base: 'ă', tone: 1 }, 'ằ': { base: 'ă', tone: 2 },
  'ẳ': { base: 'ă', tone: 3 }, 'ẵ': { base: 'ă', tone: 4 }, 'ặ': { base: 'ă', tone: 5 },
  'Ă': { base: 'Ă', tone: 0 }, 'Ắ': { base: 'Ă', tone: 1 }, 'Ằ': { base: 'Ă', tone: 2 },
  'Ẳ': { base: 'Ă', tone: 3 }, 'Ẵ': { base: 'Ă', tone: 4 }, 'Ặ': { base: 'Ă', tone: 5 },

  // â
  'â': { base: 'â', tone: 0 }, 'ấ': { base: 'â', tone: 1 }, 'ầ': { base: 'â', tone: 2 },
  'ẩ': { base: 'â', tone: 3 }, 'ẫ': { base: 'â', tone: 4 }, 'ậ': { base: 'â', tone: 5 },
  'Â': { base: 'Â', tone: 0 }, 'Ấ': { base: 'Â', tone: 1 }, 'Ầ': { base: 'Â', tone: 2 },
  'Ẩ': { base: 'Â', tone: 3 }, 'Ẫ': { base: 'Â', tone: 4 }, 'Ậ': { base: 'Â', tone: 5 },

  // e
  'e': { base: 'e', tone: 0 }, 'é': { base: 'e', tone: 1 }, 'è': { base: 'e', tone: 2 },
  'ẻ': { base: 'e', tone: 3 }, 'ẽ': { base: 'e', tone: 4 }, 'ẹ': { base: 'e', tone: 5 },
  'E': { base: 'E', tone: 0 }, 'É': { base: 'E', tone: 1 }, 'È': { base: 'E', tone: 2 },
  'Ẻ': { base: 'E', tone: 3 }, 'Ẽ': { base: 'E', tone: 4 }, 'Ẹ': { base: 'E', tone: 5 },

  // ê
  'ê': { base: 'ê', tone: 0 }, 'ế': { base: 'ê', tone: 1 }, 'ề': { base: 'ê', tone: 2 },
  'ể': { base: 'ê', tone: 3 }, 'ễ': { base: 'ê', tone: 4 }, 'ệ': { base: 'ê', tone: 5 },
  'Ê': { base: 'Ê', tone: 0 }, 'Ế': { base: 'Ê', tone: 1 }, 'Ề': { base: 'Ê', tone: 2 },
  'Ể': { base: 'Ê', tone: 3 }, 'Ễ': { base: 'Ê', tone: 4 }, 'Ệ': { base: 'Ê', tone: 5 },

  // i
  'i': { base: 'i', tone: 0 }, 'í': { base: 'i', tone: 1 }, 'ì': { base: 'i', tone: 2 },
  'ỉ': { base: 'i', tone: 3 }, 'ĩ': { base: 'i', tone: 4 }, 'ị': { base: 'i', tone: 5 },
  'I': { base: 'I', tone: 0 }, 'Í': { base: 'I', tone: 1 }, 'Ì': { base: 'I', tone: 2 },
  'Ỉ': { base: 'I', tone: 3 }, 'Ĩ': { base: 'I', tone: 4 }, 'Ị': { base: 'I', tone: 5 },

  // o
  'o': { base: 'o', tone: 0 }, 'ó': { base: 'o', tone: 1 }, 'ò': { base: 'o', tone: 2 },
  'ỏ': { base: 'o', tone: 3 }, 'õ': { base: 'o', tone: 4 }, 'ọ': { base: 'o', tone: 5 },
  'O': { base: 'O', tone: 0 }, 'Ó': { base: 'O', tone: 1 }, 'Ò': { base: 'O', tone: 2 },
  'Ỏ': { base: 'O', tone: 3 }, 'Õ': { base: 'O', tone: 4 }, 'Ọ': { base: 'O', tone: 5 },

  // ô
  'ô': { base: 'ô', tone: 0 }, 'ố': { base: 'ô', tone: 1 }, 'ồ': { base: 'ô', tone: 2 },
  'ổ': { base: 'ô', tone: 3 }, 'ỗ': { base: 'ô', tone: 4 }, 'ộ': { base: 'ô', tone: 5 },
  'Ô': { base: 'Ô', tone: 0 }, 'Ố': { base: 'Ô', tone: 1 }, 'Ồ': { base: 'Ô', tone: 2 },
  'Ổ': { base: 'Ô', tone: 3 }, 'Ỗ': { base: 'Ô', tone: 4 }, 'Ộ': { base: 'Ô', tone: 5 },

  // ơ
  'ơ': { base: 'ơ', tone: 0 }, 'ớ': { base: 'ơ', tone: 1 }, 'ờ': { base: 'ơ', tone: 2 },
  'ở': { base: 'ơ', tone: 3 }, 'ỡ': { base: 'ơ', tone: 4 }, 'ợ': { base: 'ơ', tone: 5 },
  'Ơ': { base: 'Ơ', tone: 0 }, 'Ớ': { base: 'Ơ', tone: 1 }, 'Ờ': { base: 'Ơ', tone: 2 },
  'Ở': { base: 'Ơ', tone: 3 }, 'Ỡ': { base: 'Ơ', tone: 4 }, 'Ợ': { base: 'Ơ', tone: 5 },

  // u
  'u': { base: 'u', tone: 0 }, 'ú': { base: 'u', tone: 1 }, 'ù': { base: 'u', tone: 2 },
  'ủ': { base: 'u', tone: 3 }, 'ũ': { base: 'u', tone: 4 }, 'ụ': { base: 'u', tone: 5 },
  'U': { base: 'U', tone: 0 }, 'Ú': { base: 'U', tone: 1 }, 'Ù': { base: 'U', tone: 2 },
  'Ủ': { base: 'U', tone: 3 }, 'Ũ': { base: 'U', tone: 4 }, 'Ụ': { base: 'U', tone: 5 },

  // ư
  'ư': { base: 'ư', tone: 0 }, 'ứ': { base: 'ư', tone: 1 }, 'ừ': { base: 'ư', tone: 2 },
  'ử': { base: 'ư', tone: 3 }, 'ữ': { base: 'ư', tone: 4 }, 'ự': { base: 'ư', tone: 5 },
  'Ư': { base: 'Ư', tone: 0 }, 'Ứ': { base: 'Ư', tone: 1 }, 'Ừ': { base: 'Ư', tone: 2 },
  'Ử': { base: 'Ư', tone: 3 }, 'Ữ': { base: 'Ư', tone: 4 }, 'Ự': { base: 'Ư', tone: 5 },

  // y
  'y': { base: 'y', tone: 0 }, 'ý': { base: 'y', tone: 1 }, 'ỳ': { base: 'y', tone: 2 },
  'ỷ': { base: 'y', tone: 3 }, 'ỹ': { base: 'y', tone: 4 }, 'ỵ': { base: 'y', tone: 5 },
  'Y': { base: 'Y', tone: 0 }, 'Ý': { base: 'Y', tone: 1 }, 'Ỳ': { base: 'Y', tone: 2 },
  'Ỷ': { base: 'Y', tone: 3 }, 'Ỹ': { base: 'Y', tone: 4 }, 'Ỵ': { base: 'Y', tone: 5 }
};

// Base vowel + tone index -> accented vowel
export const VOWEL_COMPOSE_TABLE = {
  'a': ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
  'A': ['A', 'Á', 'À', 'Ả', 'Ã', 'Ạ'],
  'ă': ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
  'Ă': ['Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ'],
  'â': ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
  'Â': ['Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ'],
  'e': ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
  'E': ['E', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ'],
  'ê': ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
  'Ê': ['Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ'],
  'i': ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
  'I': ['I', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị'],
  'o': ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
  'O': ['O', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ'],
  'ô': ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
  'Ô': ['Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ'],
  'ơ': ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
  'Ơ': ['Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ'],
  'u': ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
  'U': ['U', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ'],
  'ư': ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
  'Ư': ['Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự'],
  'y': ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
  'Y': ['Y', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ']
};

// Recognized Vietnamese onset consonants (including Central Highlands multi-consonants)
export const VALID_ONSETS = [
  // 3-char onsets
  'ngh',
  // 2-char onsets (traditional + ethnic / Central Highlands)
  'ch', 'gh', 'gi', 'kh', 'nh', 'ng', 'ph', 'th', 'tr', 'qu',
  'kr', 'pr', 'dr', 'đr', 'br', 'kl', 'pl', 'bl', 'dz',
  // 1-char onsets
  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'
];

export class ParsedSyllable {
  constructor(opts = {}) {
    this.onset = opts.onset || '';
    this.glide = opts.glide || '';
    this.nucleus = opts.nucleus || '';
    this.coda = opts.coda || '';
    this.tone = opts.tone || TONE_MARK.NONE;
    this.hasApostrophe = opts.hasApostrophe || false;
    this.apostrophePrefix = opts.apostrophePrefix || '';
  }

  /**
   * Reconstruct final syllable string according to toneStyle
   * @param {string} toneStyle TONE_STYLE.CLASSIC ('classic') or TONE_STYLE.MODERN ('modern')
   * @returns {string} Reconstructed Vietnamese syllable
   */
  reconstruct(toneStyle = TONE_STYLE.CLASSIC) {
    if (!this.nucleus) {
      return (this.apostrophePrefix || '') + this.onset + this.glide + this.coda;
    }

    const n = this.nucleus;
    const nLen = n.length;
    const hasCoda = this.coda.length > 0;
    const hasGlide = this.glide.length > 0;

    let targetIdx = 0; // index inside nucleus to place tone

    // If there is an explicit glide (like 'o' in 'oa', 'u' in 'ue', 'uy'):
    // MODERN: 'hoà', 'hoá', 'thuỷ', 'khoẻ' (dấu trên âm chính a, e, y)
    // CLASSIC: 'hòa', 'hóa', 'thủy', 'khỏe' (dấu trên âm đệm o, u)
    // Special case: 'qu' (onset 'q', glide 'u'). In 'qu' words, 'u' is part of initial consonant cluster 'qu',
    // tone NEVER goes on 'u' (quý, quả, quạt, quế, quà).
    // Also, if nucleus has length > 1 (e.g. 'khuấy' -> glide 'u', nucleus 'ây'),
    // tone belongs on the nucleus (e.g. â), NEVER on the glide!
    const isQu = this.onset.toLowerCase() === 'q' && this.glide.toLowerCase() === 'u';
    if (hasGlide && !hasCoda && nLen === 1 && !isQu) {
      if (toneStyle === TONE_STYLE.CLASSIC) {
        // Classic style: apply tone on glide (o -> ó/ò/ỏ/õ/ọ, u -> ú/ù/ủ/ũ/ụ)
        const glideChar = this.glide;
        const row = VOWEL_COMPOSE_TABLE[glideChar];
        const accentedGlide = (this.tone > 0 && row) ? row[this.tone] : glideChar;
        return (this.apostrophePrefix || '') + this.onset + accentedGlide + this.nucleus + this.coda;
      } else {
        // Modern style: tone on 1st char of nucleus (a -> á/à/ả/ã/ạ, y -> ý/ỳ/ỷ/ỹ/ỵ)
        targetIdx = 0;
      }
    } else if (nLen === 1) {
      // Single vowel nucleus: tone goes directly on it
      targetIdx = 0;
    } else if (nLen === 2) {
      const lowerN = n.toLowerCase();
      // Special pairs: ươ, iê, uô, yê, ưa, ia, ua, oo
      if (lowerN === 'ươ' || lowerN === 'iê' || lowerN === 'uô' || lowerN === 'yê' || lowerN === 'oo') {
        // Diphthongs ending with ơ, ê, ô, and loanword double-o (xoòng, boóng, xoọng):
        // tone always goes on the second vowel regardless of classic vs modern style!
        targetIdx = 1;
      } else if (lowerN === 'ưa' || lowerN === 'ia' || lowerN === 'ua') {
        // Open diphthongs: tone goes on 1st vowel unless coda is present
        targetIdx = hasCoda ? 1 : 0;
      } else if (['ai', 'ao', 'au', 'ay', 'âu', 'ây', 'eo', 'êu', 'oi', 'ôi', 'ơi', 'ui', 'yu'].includes(lowerN)) {
        // Offglides: second vowel is coda offglide (i, y, o, u), tone on 1st vowel
        // e.g. mái, sáo, cháu, mây, khuấy (glide 'u', nucleus 'ây' -> target 'â')
        // Special case: 'khuỷu' (glide 'u', nucleus 'yu' -> target 0 'y' -> 'khuỷu')
        targetIdx = 0;
      } else {
        // Other pairs like oa, oe, uy, ue (when glide was not separated)
        if (hasCoda) {
          targetIdx = 1; // e.g. toán, hoán, muốn, duyên
        } else {
          targetIdx = (toneStyle === TONE_STYLE.CLASSIC) ? 0 : 1;
        }
      }
    } else if (nLen >= 3) {
      // Triphthongs like uyê, iêu, ươu: tone on the middle main vowel
      targetIdx = 1;
    }

    // Apply tone to nucleus[targetIdx]
    let reconstructedNucleus = '';
    for (let i = 0; i < n.length; i++) {
      const ch = n[i];
      if (i === targetIdx && this.tone > 0) {
        const row = VOWEL_COMPOSE_TABLE[ch];
        reconstructedNucleus += row ? row[this.tone] : ch;
      } else {
        reconstructedNucleus += ch;
      }
    }

    return (this.apostrophePrefix || '') + this.onset + this.glide + reconstructedNucleus + this.coda;
  }

  /**
   * Clone with modified tone mark
   * @param {number} tone 
   * @returns {ParsedSyllable}
   */
  withTone(tone) {
    return new ParsedSyllable({
      onset: this.onset,
      glide: this.glide,
      nucleus: this.nucleus,
      coda: this.coda,
      tone,
      hasApostrophe: this.hasApostrophe,
      apostrophePrefix: this.apostrophePrefix
    });
  }

  /**
   * Check if syllable conforms to Vietnamese orthography / phonology:
   * 1. Must have a valid vowel nucleus (cannot be consonant-only like 'fcitx', 'tmux').
   * 2. If word has letters before nucleus but no valid onset, it's a foreign cluster (e.g. 'fcitx').
   * 3. Coda must be a legitimate Vietnamese consonant coda (c, ch, m, n, ng, nh, p, t, k, l, r).
   * 4. Stop finals (-c, -ch, -p, -t, -k) can only take Tone 0, Tone 1 (sắc) or Tone 5 (nặng).
   * 5. Short vowels (ă, â) require a coda consonant (when not in-progress).
   * @param {Object} [options]
   * @param {boolean} [options.inProgress=false] When typing mid-word, short vowels ă/â without coda are valid as incomplete syllables.
   */
  isValid({ inProgress = false } = {}) {
    // 1. Must have a nucleus
    if (!this.nucleus) {
      return false;
    }

    // Phonology Constraint: Impossible Vietnamese vowel clusters starting with ơ
    // In Vietnamese, ơ can only be followed by 'i' (ơi), NEVER by e, a, o, u, ê, ă, â
    const lowerVowels = (this.glide + this.nucleus).toLowerCase();
    if (/ơ[eaouêăâ]/i.test(lowerVowels)) {
      return false;
    }

    // Phonology Constraint: Impossible Vietnamese vowel clusters with ă (ăy, ăi, ău, ăo)
    // In Vietnamese, ă is a short monophthong that can NEVER be followed by another vowel or semi-vowel
    if (/ă[aeiouyăâêôơư]/i.test(lowerVowels)) {
      return false;
    }

    // 2. Coda must be a recognized Vietnamese coda
    // Standard Vietnamese syllables only end with: c, ch, m, n, ng, nh, p, t
    // Ethnic Central Highlands or loan words ending in k, l, r, h (đắk, kar, mil, păh) are checked specifically.
    const lowerCoda = this.coda.toLowerCase();
    const STANDARD_CODAS = new Set(['', 'c', 'ch', 'm', 'n', 'ng', 'nh', 'p', 't']);
    const ETHNIC_CODAS = new Set(['k', 'l', 'r', 'h']);

    if (!STANDARD_CODAS.has(lowerCoda)) {
      if (ETHNIC_CODAS.has(lowerCoda)) {
        const baseSyllable = this.withTone(TONE_MARK.NONE).reconstruct().toLowerCase();
        const fullSyllable = this.reconstruct().toLowerCase();
        const VALID_ETHNIC_BASES = new Set([
          'đắk', 'đăk', 'đrak', 'đrák', 'đrắk', 'đrăk',
          'drắk', 'drăk', 'drak', 'drák',
          'lắk', 'lăk', 'lak', 'lák',
          'pắk', 'păk', 'pak', 'pák',
          'buk', 'búk', 'păh', 'pah', 'páh',
          'kar', 'mil',
          "m'đrắk", "m'đrăk", "m'đrak", "m'đrák",
          'mdrắk', 'mdrăk', 'mdrak', 'mdrák',
          "m'gar", 'mgar', "r'lấp", 'rlấp'
        ]);
        if (!VALID_ETHNIC_BASES.has(baseSyllable) && !VALID_ETHNIC_BASES.has(fullSyllable)) {
          return false;
        }
      } else {
        return false;
      }
    }

    // 3. Stop finals rule
    if (['c', 'ch', 'p', 't', 'k'].includes(lowerCoda)) {
      if (this.tone !== TONE_MARK.NONE && this.tone !== TONE_MARK.ACUTE && this.tone !== TONE_MARK.DOT_BELOW) {
        return false;
      }
    }

    // 4. Open diphthongs (ia, ya, ua, ưa) cannot take a consonant coda in Vietnamese
    const lowerN = this.nucleus.toLowerCase();
    if (['ia', 'ya', 'ua', 'ưa'].includes(lowerN) && lowerCoda.length > 0) {
      return false;
    }

    // 5. Closed diphthongs (uo, ie, ye): plain 'uo', 'ie', 'ye' with a coda can NEVER take a tone mark
    // in a completed syllable unless explicitly horned ('ươ') or circumflexed ('uô', 'iê', 'yê').
    // When typing, they are valid intermediate forms (inProgress = true) allowing subsequent shape modifiers.
    if (!inProgress && this.tone !== TONE_MARK.NONE && lowerCoda.length > 0 && ['uo', 'ie', 'ye'].includes(lowerN)) {
      return false;
    }

    // 6. Short vowels ă, â must have coda if word is complete (unless in-progress typing)
    if (!inProgress) {
      if ((lowerN === 'ă' || lowerN === 'â') && this.coda.length === 0) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Parse any in-progress or completed word into a ParsedSyllable struct
 * @param {string} rawWord 
 * @returns {ParsedSyllable|null}
 */
export function parseSyllable(rawWord) {
  if (!rawWord || typeof rawWord !== 'string') return null;

  let word = rawWord.normalize('NFC');
  let apostrophePrefix = '';

  // Handle leading apostrophe like M'Đrắk, Ea H'leo, Cư M'gar
  const apoMatch = word.match(/^([A-Za-z]['’])/);
  if (apoMatch) {
    apostrophePrefix = apoMatch[1];
    word = word.slice(apoMatch[1].length);
  }

  // Detect and extract existing tone from any vowel in word
  let foundTone = TONE_MARK.NONE;
  let baseWord = '';

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const dec = VOWEL_DECOMPOSE_MAP[ch];
    if (dec) {
      baseWord += dec.base;
      if (dec.tone > 0 && foundTone === TONE_MARK.NONE) {
        foundTone = dec.tone;
      }
    } else {
      baseWord += ch;
    }
  }

  const lowerBase = baseWord.toLowerCase();

  // 1. Identify Onset
  let onset = '';
  let rest = baseWord;
  let lowerRest = lowerBase;

  // Special handling for 'qu': q is onset, u is glide
  if (lowerRest.startsWith('qu')) {
    onset = baseWord.slice(0, 1); // 'q' or 'Q'
    rest = baseWord.slice(1);
    lowerRest = lowerBase.slice(1);
  } else if (lowerRest.startsWith('gi')) {
    // If 'gi' is followed by another vowel (gió, gieo, giữa, giết), 'gi' is onset
    // If 'gi' is alone or followed by consonant (gì, gìn, gịt), 'g' is onset, 'i' is vowel
    if (lowerRest.length > 2 && VOWEL_DECOMPOSE_MAP[lowerRest[2]]) {
      onset = baseWord.slice(0, 2);
      rest = baseWord.slice(2);
      lowerRest = lowerBase.slice(2);
    } else {
      onset = baseWord.slice(0, 1); // 'g'
      rest = baseWord.slice(1);     // starts with 'i'
      lowerRest = lowerBase.slice(1);
    }
  } else {
    for (const testOnset of VALID_ONSETS) {
      if (lowerRest.startsWith(testOnset)) {
        onset = baseWord.slice(0, testOnset.length);
        rest = baseWord.slice(testOnset.length);
        lowerRest = lowerBase.slice(testOnset.length);
        break;
      }
    }
  }

  // 2. Separate Vowel Cluster and Coda
  let vowelCluster = '';
  let coda = '';
  let foundVowel = false;

  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    const isV = Boolean(VOWEL_DECOMPOSE_MAP[ch]);
    if (isV && coda.length === 0) {
      vowelCluster += ch;
      foundVowel = true;
    } else {
      coda += ch;
    }
  }

  // 3. Extract Glide (u, o) from Vowel Cluster
  let glide = '';
  let nucleus = vowelCluster;
  const lowerVowels = vowelCluster.toLowerCase();

  if (vowelCluster.length >= 2) {
    const firstV = lowerVowels[0];
    const secondV = lowerVowels[1];

    // 'oa', 'oe', 'oă' -> o is glide
    if (firstV === 'o' && (secondV === 'a' || secondV === 'e' || secondV === 'ă')) {
      glide = vowelCluster[0];
      nucleus = vowelCluster.slice(1);
    }
    // 'ua', 'uâ', 'uê', 'uơ', 'uy' -> u is glide (except when diphthong 'ua' in cua, mua)
    else if (firstV === 'u') {
      if (secondV === 'â' || secondV === 'ê' || secondV === 'ơ' || secondV === 'y') {
        glide = vowelCluster[0];
        nucleus = vowelCluster.slice(1);
      } else if (secondV === 'a' && coda.length > 0) {
        // e.g. 'toán' from 'tuán' or 'quán'
        glide = vowelCluster[0];
        nucleus = vowelCluster.slice(1);
      }
    }
  }

  return new ParsedSyllable({
    onset,
    glide,
    nucleus,
    coda,
    tone: foundTone,
    hasApostrophe: Boolean(apostrophePrefix),
    apostrophePrefix
  });
}
