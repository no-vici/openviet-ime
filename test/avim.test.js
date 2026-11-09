/**
 * AVIM Engine Character Combination Test Suite
 * Tests for Vietnamese diacritics, tone placement, and spell checking.
 */

import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD, TONE_STYLE } from '../src/engine/key-codes.js';
import { autoCompleteEngine } from '../src/engine/autocomplete.js';

export function runAvimTests() {
  const results = [];

  function assert(name, condition, expected, actual) {
    results.push({
      suite: 'AVIM Vietnamese IME',
      name,
      passed: Boolean(condition),
      expected: String(expected),
      actual: String(actual)
    });
  }

  // 1. Telex basic tones
  const telexEngine = new AvimEngine({ method: IME_METHOD.TELEX });
  assert('Telex Acute (sắc): a + s -> á', telexEngine.processKey('a', 's').result === 'á', 'á', telexEngine.processKey('a', 's').result);
  assert('Telex Grave (huyền): a + f -> à', telexEngine.processKey('a', 'f').result === 'à', 'à', telexEngine.processKey('a', 'f').result);
  assert('Telex Hook (hỏi): a + r -> ả', telexEngine.processKey('a', 'r').result === 'ả', 'ả', telexEngine.processKey('a', 'r').result);
  assert('Telex Tilde (ngã): a + x -> ã', telexEngine.processKey('a', 'x').result === 'ã', 'ã', telexEngine.processKey('a', 'x').result);
  assert('Telex Dot (nặng): a + j -> ạ', telexEngine.processKey('a', 'j').result === 'ạ', 'ạ', telexEngine.processKey('a', 'j').result);

  // 2. Telex shapes
  assert('Telex Circumflex â: a + a -> â', telexEngine.processKey('a', 'a').result === 'â', 'â', telexEngine.processKey('a', 'a').result);
  assert('Telex Circumflex ê: e + e -> ê', telexEngine.processKey('e', 'e').result === 'ê', 'ê', telexEngine.processKey('e', 'e').result);
  assert('Telex Circumflex ô: o + o -> ô', telexEngine.processKey('o', 'o').result === 'ô', 'ô', telexEngine.processKey('o', 'o').result);
  assert('Telex Breve ă: a + w -> ă', telexEngine.processKey('a', 'w').result === 'ă', 'ă', telexEngine.processKey('a', 'w').result);
  assert('Telex Horn ơ: o + w -> ơ', telexEngine.processKey('o', 'w').result === 'ơ', 'ơ', telexEngine.processKey('o', 'w').result);
  assert('Telex Horn ư: u + w -> ư', telexEngine.processKey('u', 'w').result === 'ư', 'ư', telexEngine.processKey('u', 'w').result);
  assert('Telex Consonant đ: d + d -> đ', telexEngine.processKey('d', 'd').result === 'đ', 'đ', telexEngine.processKey('d', 'd').result);
  assert('Telex Consonant Đ (Upper): D + D -> Đ', telexEngine.processKey('D', 'D').result === 'Đ', 'Đ', telexEngine.processKey('D', 'D').result);

  // 3. Combined vowels + tone (e.g. đường, việt)
  // simulate sequential typing for 'duwowngf'
  let word = '';
  ['d', 'd', 'u', 'o', 'w', 'n', 'g', 'f'].forEach(k => {
    word = telexEngine.processKey(word, k).result;
  });
  assert('Sequential Telex: dduowngf -> đường', word === 'đường', 'đường', word);

  // 4. Tone Toggling & Removal
  const toggleRes = telexEngine.processKey('á', 's');
  assert('Retyping tone key toggles back: á + s -> a', toggleRes.result === 'a', 'a', toggleRes.result);
  const zRes = telexEngine.processKey('toán', 'z');
  assert('Telex z removes tone: toán + z -> toan', zRes.result === 'toan', 'toan', zRes.result);

  // 5. Modern vs Classic Tone Placement
  const modernEngine = new AvimEngine({ method: IME_METHOD.TELEX, toneStyle: TONE_STYLE.MODERN });
  const classicEngine = new AvimEngine({ method: IME_METHOD.TELEX, toneStyle: TONE_STYLE.CLASSIC });

  assert('Modern Tone (hoà): hoa + f -> hoà', modernEngine.processKey('hoa', 'f').result === 'hoà', 'hoà', modernEngine.processKey('hoa', 'f').result);
  assert('Classic Tone (hòa): hoa + f -> hòa', classicEngine.processKey('hoa', 'f').result === 'hòa', 'hòa', classicEngine.processKey('hoa', 'f').result);
  assert('Modern Tone (thuỷ): thuy + r -> thuỷ', modernEngine.processKey('thuy', 'r').result === 'thuỷ', 'thuỷ', modernEngine.processKey('thuy', 'r').result);
  assert('Classic Tone (thủy): thuy + r -> thủy', classicEngine.processKey('thuy', 'r').result === 'thủy', 'thủy', classicEngine.processKey('thuy', 'r').result);

  // 6. Closed syllable tone placement (always on main vowel)
  assert('Closed Syllable: toan + s -> toán', modernEngine.processKey('toan', 's').result === 'toán', 'toán', modernEngine.processKey('toan', 's').result);
  assert('Closed Syllable: thuyet + s -> thuyết', modernEngine.processKey('thuyet', 's').result === 'thuyết', 'thuyết', modernEngine.processKey('thuyet', 's').result);

  // 7. VNI Engine
  const vniEngine = new AvimEngine({ method: IME_METHOD.VNI, toneStyle: TONE_STYLE.MODERN });
  assert('VNI Acute: a + 1 -> á', vniEngine.processKey('a', '1').result === 'á', 'á', vniEngine.processKey('a', '1').result);
  assert('VNI Circumflex: a + 6 -> â', vniEngine.processKey('a', '6').result === 'â', 'â', vniEngine.processKey('a', '6').result);
  assert('VNI Horn: o + 7 -> ơ', vniEngine.processKey('o', '7').result === 'ơ', 'ơ', vniEngine.processKey('o', '7').result);
  assert('VNI Breve: a + 8 -> ă', vniEngine.processKey('a', '8').result === 'ă', 'ă', vniEngine.processKey('a', '8').result);
  // 7b. VNI Retyping Toggle to Raw Number (xKey-style: icon664 -> icon64)
  assert('VNI Circumflex 6 on plain vowel: icon + 6 -> icôn', vniEngine.processKey('icon', '6').result === 'icôn', 'icôn', vniEngine.processKey('icon', '6').result);
  assert('VNI Retype 6 on circumflex reverts to base AND outputs 6: icôn + 6 -> icon6', vniEngine.processKey('icôn', '6').result === 'icon6', 'icon6', vniEngine.processKey('icôn', '6').result);
  assert('VNI Key after digit passes through: icon6 + 4 -> icon64', vniEngine.processKey('icon6', '4').result === 'icon64', 'icon64', vniEngine.processKey('icon6', '4').result);
  assert('VNI Retype 9 on đ reverts to d AND outputs 9: đ + 9 -> d9', vniEngine.processKey('đ', '9').result === 'd9', 'd9', vniEngine.processKey('đ', '9').result);
  assert('VNI Retype 1 on acute reverts tone AND outputs 1: cá + 1 -> ca1', vniEngine.processKey('cá', '1').result === 'ca1', 'ca1', vniEngine.processKey('cá', '1').result);
  assert('VNI Retype 7 on horn reverts horn AND outputs 7: tư + 7 -> tu7', vniEngine.processKey('tư', '7').result === 'tu7', 'tu7', vniEngine.processKey('tư', '7').result);
  assert('VNI Retype 8 on breve reverts breve AND outputs 8: bă + 8 -> ba8', vniEngine.processKey('bă', '8').result === 'ba8', 'ba8', vniEngine.processKey('bă', '8').result);
  
  // 7c. VNI uê cluster tone placement (thuế, huế, quế)
  let thueVni61 = '';
  ['t', 'h', 'u', 'e', '6', '1'].forEach(k => { thueVni61 = vniEngine.processKey(thueVni61, k).result; });
  assert('VNI uê cluster: thue61 -> thuế', thueVni61 === 'thuế', 'thuế', thueVni61);

  let thueVni16 = '';
  ['t', 'h', 'u', 'e', '1', '6'].forEach(k => { thueVni16 = vniEngine.processKey(thueVni16, k).result; });
  assert('VNI uê cluster (tone first): thue16 -> thuế', thueVni16 === 'thuế', 'thuế', thueVni16);

  let hueVni61 = '';
  ['h', 'u', 'e', '6', '1'].forEach(k => { hueVni61 = vniEngine.processKey(hueVni61, k).result; });
  assert('VNI uê cluster: hue61 -> huế', hueVni61 === 'huế', 'huế', hueVni61);

  // 8. Compound Vowel Digraph 'uo' -> 'ươ' Transformation (VNI & Telex)
  let duocVni = '';
  ['d', 'u', 'o', 'c', '9', '7', '5'].forEach(k => { duocVni = vniEngine.processKey(duocVni, k).result; });
  assert('VNI Compound Vowel: duoc975 -> được', duocVni === 'được', 'được', duocVni);

  let duocVniOrder2 = '';
  ['d', 'u', 'o', 'c', '7', '5', '9'].forEach(k => { duocVniOrder2 = vniEngine.processKey(duocVniOrder2, k).result; });
  assert('VNI Compound Vowel: duoc759 -> được', duocVniOrder2 === 'được', 'được', duocVniOrder2);

  let uocVni = '';
  ['u', 'o', 'c', '7', '1'].forEach(k => { uocVni = vniEngine.processKey(uocVni, k).result; });
  assert('VNI Compound Vowel: uoc71 -> ước', uocVni === 'ước', 'ước', uocVni);

  let nuocVni = '';
  ['n', 'u', 'o', 'c', '7', '1'].forEach(k => { nuocVni = vniEngine.processKey(nuocVni, k).result; });
  assert('VNI Compound Vowel: nuoc71 -> nước', nuocVni === 'nước', 'nước', nuocVni);

  let duocTelex = '';
  ['d', 'd', 'u', 'o', 'c', 'w', 'j'].forEach(k => { duocTelex = telexEngine.processKey(duocTelex, k).result; });
  assert('Telex Compound Vowel: dduocwj -> được', duocTelex === 'được', 'được', duocTelex);

  let duowcTelex = '';
  ['d', 'u', 'o', 'w', 'c', 'j'].forEach(k => { duowcTelex = telexEngine.processKey(duowcTelex, k).result; });
  assert('Telex Inline Horn: duowcj -> dược', duowcTelex === 'dược', 'dược', duowcTelex);

  let uocTelex = '';
  ['u', 'o', 'c', 'w', 's'].forEach(k => { uocTelex = telexEngine.processKey(uocTelex, k).result; });
  assert('Telex Compound Vowel: uocws -> ước', uocTelex === 'ước', 'ước', uocTelex);

  let nuocTelex = '';
  ['n', 'u', 'o', 'c', 'w', 's'].forEach(k => { nuocTelex = telexEngine.processKey(nuocTelex, k).result; });
  assert('Telex Compound Vowel: nuocws -> nước', nuocTelex === 'nước', 'nước', nuocTelex);

  let cuoiTelex = '';
  ['c', 'u', 'o', 'i', 'w', 'f'].forEach(k => { cuoiTelex = telexEngine.processKey(cuoiTelex, k).result; });
  assert('Telex Triphthong: cuoiwf -> cười', cuoiTelex === 'cười', 'cười', cuoiTelex);

  let ruouTelex = '';
  ['r', 'u', 'o', 'u', 'w', 'j'].forEach(k => { ruouTelex = telexEngine.processKey(ruouTelex, k).result; });
  assert('Telex Triphthong: ruouwj -> rượu', ruouTelex === 'rượu', 'rượu', ruouTelex);

  let duocUpperVni = '';
  ['D', 'U', 'O', 'C', '9', '7', '5'].forEach(k => { duocUpperVni = vniEngine.processKey(duocUpperVni, k).result; });
  assert('VNI Uppercase: DUOC975 -> ĐƯỢC', duocUpperVni === 'ĐƯỢC', 'ĐƯỢC', duocUpperVni);

  const toggleHornVni = vniEngine.processKey('được', '7').result;
  assert('VNI Retyping horn toggles back: được + 7 -> đuọc', toggleHornVni === 'đuọc', 'đuọc', toggleHornVni);

  // 9. Informal / Dialect & Free Diacritic Placement (dzìa, dzô, dzùi, nhìu, bít)
  let dzia = '';
  ['d', 'z', 'i', 'a', 'f'].forEach(k => { dzia = telexEngine.processKey(dzia, k).result; });
  assert('Colloquial Telex: dziaf -> dzìa', dzia === 'dzìa', 'dzìa', dzia);

  let dzo = '';
  ['d', 'z', 'o', 'o'].forEach(k => { dzo = telexEngine.processKey(dzo, k).result; });
  assert('Colloquial Telex: dzoo -> dzô', dzo === 'dzô', 'dzô', dzo);

  let dzui = '';
  ['d', 'z', 'u', 'i', 'f'].forEach(k => { dzui = telexEngine.processKey(dzui, k).result; });
  assert('Colloquial Telex: dzuif -> dzùi', dzui === 'dzùi', 'dzùi', dzui);

  let nhiu = '';
  ['n', 'h', 'i', 'u', 'f'].forEach(k => { nhiu = telexEngine.processKey(nhiu, k).result; });
  assert('Colloquial Telex: nhiuf -> nhìu', nhiu === 'nhìu', 'nhìu', nhiu);

  let bit = '';
  ['b', 'i', 't', 's'].forEach(k => { bit = telexEngine.processKey(bit, k).result; });
  assert('Colloquial Telex: bits -> bít', bit === 'bít', 'bít', bit);

  // 10. Diphthong 'uu' + Horn -> 'ưu' (cưu, cứu, cừu, cựu, lưu, mưu, hữu, tựu)
  let cuuVni = '';
  ['c', 'u', 'u', '7'].forEach(k => { cuuVni = vniEngine.processKey(cuuVni, k).result; });
  assert('VNI cuu7 -> cưu (ưu horn on 1st u, not cuư)', cuuVni === 'cưu', 'cưu', cuuVni);

  let cuuVniAcute = '';
  ['c', 'u', 'u', '7', '1'].forEach(k => { cuuVniAcute = vniEngine.processKey(cuuVniAcute, k).result; });
  assert('VNI cuu71 -> cứu (nghiên cứu / cấp cứu)', cuuVniAcute === 'cứu', 'cứu', cuuVniAcute);

  let cuuVniAcuteOrder2 = '';
  ['c', 'u', 'u', '1', '7'].forEach(k => { cuuVniAcuteOrder2 = vniEngine.processKey(cuuVniAcuteOrder2, k).result; });
  assert('VNI cuu17 -> cứu (tone first, then horn)', cuuVniAcuteOrder2 === 'cứu', 'cứu', cuuVniAcuteOrder2);

  let cuuVniGrave = '';
  ['c', 'u', 'u', '7', '2'].forEach(k => { cuuVniGrave = vniEngine.processKey(cuuVniGrave, k).result; });
  assert('VNI cuu72 -> cừu (con cừu)', cuuVniGrave === 'cừu', 'cừu', cuuVniGrave);

  let cuuVniDot = '';
  ['c', 'u', 'u', '7', '5'].forEach(k => { cuuVniDot = vniEngine.processKey(cuuVniDot, k).result; });
  assert('VNI cuu75 -> cựu (cựu sinh viên)', cuuVniDot === 'cựu', 'cựu', cuuVniDot);

  let luuVni = '';
  ['l', 'u', 'u', '7'].forEach(k => { luuVni = vniEngine.processKey(luuVni, k).result; });
  assert('VNI luu7 -> lưu (lưu trữ)', luuVni === 'lưu', 'lưu', luuVni);

  let huuVni = '';
  ['h', 'u', 'u', '7', '4'].forEach(k => { huuVni = vniEngine.processKey(huuVni, k).result; });
  assert('VNI huu74 -> hữu (hữu nghị)', huuVni === 'hữu', 'hữu', huuVni);

  let tuuVni = '';
  ['t', 'u', 'u', '7', '5'].forEach(k => { tuuVni = vniEngine.processKey(tuuVni, k).result; });
  assert('VNI tuu75 -> tựu (thành tựu)', tuuVni === 'tựu', 'tựu', tuuVni);

  let uuAloneVni = '';
  ['u', 'u', '7'].forEach(k => { uuAloneVni = vniEngine.processKey(uuAloneVni, k).result; });
  assert('VNI uu7 -> ưu (ưu tiên)', uuAloneVni === 'ưu', 'ưu', uuAloneVni);

  const cuuToggleVni = vniEngine.processKey('cưu', '7').result;
  assert('VNI Retyping horn on cưu toggles back: cưu + 7 -> cuu', cuuToggleVni === 'cuu', 'cuu', cuuToggleVni);

  // Telex uu + w -> cưu / cứu
  let cuuTelex = '';
  ['c', 'u', 'u', 'w'].forEach(k => { cuuTelex = telexEngine.processKey(cuuTelex, k).result; });
  assert('Telex cuuw -> cưu', cuuTelex === 'cưu', 'cưu', cuuTelex);

  let cuuTelexAcute = '';
  ['c', 'u', 'u', 'w', 's'].forEach(k => { cuuTelexAcute = telexEngine.processKey(cuuTelexAcute, k).result; });
  assert('Telex cuuws -> cứu', cuuTelexAcute === 'cứu', 'cứu', cuuTelexAcute);

  // 11. AVIM "thuở" Exception (bare u + horned ơ, never thươ)
  let thuoVni = '';
  ['t', 'h', 'u', 'o', '7', '3'].forEach(k => { thuoVni = vniEngine.processKey(thuoVni, k).result; });
  assert('AVIM Rule: thuo73 -> thuở (bare u, horned ơ)', thuoVni === 'thuở', 'thuở', thuoVni);

  let thuoTelex = '';
  ['t', 'h', 'u', 'o', 'w', 'r'].forEach(k => { thuoTelex = telexEngine.processKey(thuoTelex, k).result; });
  assert('AVIM Rule: thuowr -> thuở', thuoTelex === 'thuở', 'thuở', thuoTelex);

  // 12. Adaptive / AUTO Input Method (XKey vAdaptiveEnabled)
  const autoEngine = new AvimEngine({ method: IME_METHOD.AUTO });
  assert('Adaptive AUTO Telex: a + s -> á', autoEngine.processKey('a', 's').result === 'á', 'á', autoEngine.processKey('a', 's').result);
  assert('Adaptive AUTO VNI: a + 1 -> á', autoEngine.processKey('a', '1').result === 'á', 'á', autoEngine.processKey('a', '1').result);
  assert('Adaptive AUTO Telex: d + d -> đ', autoEngine.processKey('d', 'd').result === 'đ', 'đ', autoEngine.processKey('d', 'd').result);
  assert('Adaptive AUTO VNI: d + 9 -> đ', autoEngine.processKey('d', '9').result === 'đ', 'đ', autoEngine.processKey('d', '9').result);
  assert('Adaptive AUTO Telex: o + w -> ơ', autoEngine.processKey('o', 'w').result === 'ơ', 'ơ', autoEngine.processKey('o', 'w').result);
  assert('Adaptive AUTO VNI: o + 7 -> ơ', autoEngine.processKey('o', '7').result === 'ơ', 'ơ', autoEngine.processKey('o', '7').result);

  // 13. AVIM Escape Key '\'
  assert('AVIM Escape \\s -> s without acute', telexEngine.processKey('\\', 's').result === 's', 's', telexEngine.processKey('\\', 's').result);
  assert('AVIM Escape \\1 -> 1 without acute', vniEngine.processKey('\\', '1').result === '1', '1', vniEngine.processKey('\\', '1').result);
  assert('AVIM Escape \\w -> w without horn', telexEngine.processKey('\\', 'w').result === 'w', 'w', telexEngine.processKey('\\', 'w').result);

  // 14. Quick Consonants (XKey vQuickStartConsonant & vQuickEndConsonant)
  const qcEngine = new AvimEngine({ method: IME_METHOD.TELEX, quickConsonants: true });
  assert('Quick Start Consonant: f -> ph', qcEngine.processKey('', 'f').result === 'ph', 'ph', qcEngine.processKey('', 'f').result);
  assert('Quick Start Consonant: j -> gi', qcEngine.processKey('', 'j').result === 'gi', 'gi', qcEngine.processKey('', 'j').result);
  assert('Quick Start Consonant: w -> qu', qcEngine.processKey('', 'w').result === 'qu', 'qu', qcEngine.processKey('', 'w').result);
  assert('Quick End Consonant: da + g -> dang', qcEngine.processKey('da', 'g').result === 'dang', 'dang', qcEngine.processKey('da', 'g').result);
  assert('Quick End Consonant: a + h -> anh', qcEngine.processKey('a', 'h').result === 'anh', 'anh', qcEngine.processKey('a', 'h').result);
  assert('Quick End Consonant: ti + k -> tich', qcEngine.processKey('ti', 'k').result === 'tich', 'tich', qcEngine.processKey('ti', 'k').result);

  // 15. Late Vowel Shape & Circumflex Placement at End of Word (chong+o -> chông, kieu+e -> kiêu)
  assert('Late Circumflex: chong + o -> chông', telexEngine.processKey('chong', 'o').result === 'chông', 'chông', telexEngine.processKey('chong', 'o').result);
  assert('Late Circumflex + Retype Toggle: chông + o -> chongo', telexEngine.processKey('chông', 'o').result === 'chongo', 'chongo', telexEngine.processKey('chông', 'o').result);
  assert('Late Circumflex: kieu + e -> kiêu', telexEngine.processKey('kieu', 'e').result === 'kiêu', 'kiêu', telexEngine.processKey('kieu', 'e').result);
  assert('Late Circumflex + Retype Toggle: kiêu + e -> kieue', telexEngine.processKey('kiêu', 'e').result === 'kieue', 'kieue', telexEngine.processKey('kiêu', 'e').result);
  assert('Late Circumflex with Tone First: chóng + o -> chống', telexEngine.processKey('chóng', 'o').result === 'chống', 'chống', telexEngine.processKey('chóng', 'o').result);
  assert('Late Circumflex then Tone: chông + s -> chống', telexEngine.processKey('chông', 's').result === 'chống', 'chống', telexEngine.processKey('chông', 's').result);
  assert('Late Circumflex with Tone First: kiếu + e -> kiếu', telexEngine.processKey('kiếu', 'e').result === 'kiếu', 'kiếu', telexEngine.processKey('kiếu', 'e').result);
  assert('Late Circumflex then Tone: kiêu + s -> kiếu', telexEngine.processKey('kiêu', 's').result === 'kiếu', 'kiếu', telexEngine.processKey('kiêu', 's').result);
  assert('Late Circumflex: hang + a -> hâng', telexEngine.processKey('hang', 'a').result === 'hâng', 'hâng', telexEngine.processKey('hang', 'a').result);
  assert('Late Circumflex: bien + e -> biên', telexEngine.processKey('bien', 'e').result === 'biên', 'biên', telexEngine.processKey('bien', 'e').result);
  assert('Late Circumflex: dem + e -> đêm', telexEngine.processKey('dem', 'e').result === 'đêm', 'đêm', telexEngine.processKey('dem', 'e').result);

  // Late Circumflex in AUTO & VNI
  assert('AUTO Late Circumflex Telex: chong + o -> chông', autoEngine.processKey('chong', 'o').result === 'chông', 'chông', autoEngine.processKey('chong', 'o').result);
  assert('AUTO Late Circumflex Telex: kieu + e -> kiêu', autoEngine.processKey('kieu', 'e').result === 'kiêu', 'kiêu', autoEngine.processKey('kieu', 'e').result);
  assert('AUTO Late Circumflex VNI: chong + 6 -> chông', autoEngine.processKey('chong', '6').result === 'chông', 'chông', autoEngine.processKey('chong', '6').result);
  assert('AUTO Late Circumflex VNI: kieu + 6 -> kiêu', autoEngine.processKey('kieu', '6').result === 'kiêu', 'kiêu', autoEngine.processKey('kieu', '6').result);
  assert('VNI Late Circumflex: chong + 6 -> chông', vniEngine.processKey('chong', '6').result === 'chông', 'chông', vniEngine.processKey('chong', '6').result);
  // 16. English Onset & Dictionary Protection (plugin, flag, blog protection against quick consonants)
  assert('English Onset: plu + g -> plug (NOT plung)', qcEngine.processKey('plu', 'g').result === 'plug', 'plug', qcEngine.processKey('plu', 'g').result);
  let pluginTyped = '';
  ['p', 'l', 'u', 'g', 'i', 'n'].forEach(k => { pluginTyped = qcEngine.processKey(pluginTyped, k).result; });
  assert('Typing full "plugin" with quick consonants: plugin -> plugin', pluginTyped === 'plugin', 'plugin', pluginTyped);

  assert('English Onset: fla + g -> flag (NOT flang)', qcEngine.processKey('fla', 'g').result === 'flag', 'flag', qcEngine.processKey('fla', 'g').result);
  assert('English Onset: blo + g -> blog (NOT blong)', qcEngine.processKey('blo', 'g').result === 'blog', 'blog', qcEngine.processKey('blo', 'g').result);
  assert('English Onset: pro + g -> prog (NOT prong)', qcEngine.processKey('pro', 'g').result === 'prog', 'prog', qcEngine.processKey('pro', 'g').result);

  // 17. GoNhanh Phonology Rules (c/k, g/gh, ng/ngh, and Checked Tone Stop Finals -c, -ch, -p, -t)
  const phonoEngine = new AvimEngine({ method: IME_METHOD.TELEX, phonologyRules: true });
  // c/k rule: c before e, i, y is never Vietnamese -> reject accenting
  assert('Phonology Rule c/k: center + e -> centere (NOT cênter)', phonoEngine.processKey('center', 'e').result === 'centere', 'centere', phonoEngine.processKey('center', 'e').result);
  assert('Phonology Rule c/k: city + f -> cityf (NOT cìty)', phonoEngine.processKey('city', 'f').result === 'cityf', 'cityf', phonoEngine.processKey('city', 'f').result);
  // g/gh rule: g before e is not Vietnamese
  assert('Phonology Rule g/gh: get + s -> gets (NOT gét)', phonoEngine.processKey('get', 's').result === 'gets', 'gets', phonoEngine.processKey('get', 's').result);

  // Checked tone stop finals (-c, -ch, -p, -t):
  // Can only take tone 1 (sắc) or tone 5 (nặng)
  assert('Checked Stop Final: bac + s -> bác (Valid Sắc)', phonoEngine.processKey('bac', 's').result === 'bác', 'bác', phonoEngine.processKey('bac', 's').result);
  assert('Checked Stop Final: bac + j -> bạc (Valid Nặng)', phonoEngine.processKey('bac', 'j').result === 'bạc', 'bạc', phonoEngine.processKey('bac', 'j').result);
  assert('Checked Stop Final: bac + f -> bacf (Rejected Huyền)', phonoEngine.processKey('bac', 'f').result === 'bacf', 'bacf', phonoEngine.processKey('bac', 'f').result);
  assert('Checked Stop Final: hop + r -> hopr (Rejected Hỏi)', phonoEngine.processKey('hop', 'r').result === 'hopr', 'hopr', phonoEngine.processKey('hop', 'r').result);
  assert('Checked Stop Final: tich + x -> tichx (Rejected Ngã)', phonoEngine.processKey('tich', 'x').result === 'tichx', 'tichx', phonoEngine.processKey('tich', 'x').result);
  assert('Checked Stop Final: mat + f -> matf (Rejected Huyền)', phonoEngine.processKey('mat', 'f').result === 'matf', 'matf', phonoEngine.processKey('mat', 'f').result);

  // 18. GoNhanh Auto-Restore English Words on Delimiter & Instant ESC Revert
  const restoreEngine = new AvimEngine({ method: IME_METHOD.TELEX, autoRestoreEnglish: true, escRevert: true });

  // Auto-restore checks for common Telex traps
  assert('Auto-Restore: têt -> text', restoreEngine.checkAutoRestore('têt').result === 'text', 'text', restoreEngine.checkAutoRestore('têt').result);
  assert('Auto-Restore: úẻ -> user', restoreEngine.checkAutoRestore('úẻ').result === 'user', 'user', restoreEngine.checkAutoRestore('úẻ').result);
  assert('Auto-Restore: púh -> push', restoreEngine.checkAutoRestore('púh').result === 'push', 'push', restoreEngine.checkAutoRestore('púh').result);
  assert('Auto-Restore: lủuy -> luxury', restoreEngine.checkAutoRestore('lủuy').result === 'luxury', 'luxury', restoreEngine.checkAutoRestore('lủuy').result);
  assert('Auto-Restore: ưindoư -> window', restoreEngine.checkAutoRestore('ưindoư').result === 'window', 'window', restoreEngine.checkAutoRestore('ưindoư').result);
  assert('Auto-Restore: ưork -> work', restoreEngine.checkAutoRestore('ưork').result === 'work', 'work', restoreEngine.checkAutoRestore('ưork').result);

  // Instant ESC Revert
  assert('ESC Revert: úẻ -> user', restoreEngine.revertCurrentWord('úẻ').result === 'user', 'user', restoreEngine.revertCurrentWord('úẻ').result);
  assert('ESC Revert: têt -> text', restoreEngine.revertCurrentWord('têt').result === 'text', 'text', restoreEngine.revertCurrentWord('têt').result);
  assert('ESC Revert: lủuy -> luxury', restoreEngine.revertCurrentWord('lủuy').result === 'luxury', 'luxury', restoreEngine.revertCurrentWord('lủuy').result);

  // 19. Auto-Restore Protection for VNI & Telex single vowels and Vietnamese words (Bugfix test)
  const vniTestEngine = new AvimEngine({ method: IME_METHOD.VNI, autoRestoreEnglish: true, spellCheck: false });
  // Simulate typing a1 -> á
  let vniWord1 = vniTestEngine.processKey('', 'a').result;
  vniWord1 = vniTestEngine.processKey(vniWord1, '1').result;
  const vniRestore1 = vniTestEngine.checkAutoRestore(vniWord1);
  assert('VNI Auto-Restore Protection: a1 -> á keeps á (no restore to a1)', vniRestore1.restore === false && vniRestore1.result === 'á', 'á', vniRestore1.result);

  // Simulate typing u1 -> ú
  vniTestEngine.resetWordSession();
  let vniWord2 = vniTestEngine.processKey('', 'u').result;
  vniWord2 = vniTestEngine.processKey(vniWord2, '1').result;
  const vniRestore2 = vniTestEngine.checkAutoRestore(vniWord2);
  assert('VNI Auto-Restore Protection: u1 -> ú keeps ú (no restore to u1)', vniRestore2.restore === false && vniRestore2.result === 'ú', 'ú', vniRestore2.result);

  // Simulate typing cuu71 -> cứu
  vniTestEngine.resetWordSession();
  let vniCuu = '';
  ['c', 'u', 'u', '7', '1'].forEach(k => { vniCuu = vniTestEngine.processKey(vniCuu, k).result; });
  const vniRestoreCuu = vniTestEngine.checkAutoRestore(vniCuu);
  assert('VNI Auto-Restore Protection: cuu71 -> cứu keeps cứu', vniRestoreCuu.restore === false && vniRestoreCuu.result === 'cứu', 'cứu', vniRestoreCuu.result);

  // Telex single vowels protection (as -> á, us -> ú, is -> í, of -> ò, or -> ỏ)
  const telexProtectEngine = new AvimEngine({ method: IME_METHOD.TELEX, autoRestoreEnglish: true, spellCheck: false });
  let tWord1 = telexProtectEngine.processKey('', 'a').result;
  tWord1 = telexProtectEngine.processKey(tWord1, 's').result;
  const tRestore1 = telexProtectEngine.checkAutoRestore(tWord1);
  assert('Telex Auto-Restore Protection: as -> á keeps á (no restore to as)', tRestore1.restore === false && tRestore1.result === 'á', 'á', tRestore1.result);

  let tWord2 = telexProtectEngine.processKey('', 'c').result;
  tWord2 = telexProtectEngine.processKey(tWord2, 'a').result;
  tWord2 = telexProtectEngine.processKey(tWord2, 's').result;
  const tRestore2 = telexProtectEngine.checkAutoRestore(tWord2);
  assert('Telex Auto-Restore Protection: cas -> cá keeps cá', tRestore2.restore === false && tRestore2.result === 'cá', 'cá', tRestore2.result);

  // 19. Auto-complete Engine (Suggestion & Prefix Matching)
  const nghSuggestions = autoCompleteEngine.getSuggestions('ngh', 5).map(s => s.word);
  assert('Auto-complete prefix "ngh" suggests "nghiên cứu"', nghSuggestions.includes('nghiên cứu'), 'includes nghiên cứu', nghSuggestions.join(', '));

  const capSuggestions = autoCompleteEngine.getSuggestions('cấp', 5).map(s => s.word);
  assert('Auto-complete diacritic prefix "cấp" suggests "cấp cứu"', capSuggestions.includes('cấp cứu'), 'includes cấp cứu', capSuggestions.join(', '));

  const cuuSuggestions = autoCompleteEngine.getSuggestions('cuu', 5).map(s => s.word);
  assert('Auto-complete unaccented prefix "cuu" suggests "cứu hộ"', cuuSuggestions.includes('cứu hộ'), 'includes cứu hộ', cuuSuggestions.join(', '));

  const capCase = autoCompleteEngine.getSuggestions('Nghiên', 5).map(s => s.word);
  assert('Auto-complete preserves Capitalized case', capCase.some(s => s.startsWith('Nghiên ')), 'starts with Nghiên ', capCase[0]);

  // 20. Gboard Next-Word Prediction & Habit Learning
  const nextViet = autoCompleteEngine.getNextWordSuggestions('Việt', 5).map(s => s.word);
  assert('Gboard Next-Word: "Việt" predicts "Nam"', nextViet.includes('Nam'), 'includes Nam', nextViet.join(', '));

  const nextChuc = autoCompleteEngine.getNextWordSuggestions('chúc', 5).map(s => s.word);
  assert('Gboard Next-Word: "chúc" predicts "mừng"', nextChuc.includes('mừng'), 'includes mừng', nextChuc.join(', '));

  const nextNghien = autoCompleteEngine.getNextWordSuggestions('nghiên', 5).map(s => s.word);
  assert('Gboard Next-Word: "nghiên" predicts "cứu"', nextNghien.includes('cứu'), 'includes cứu', nextNghien.join(', '));

  // Habit Learning: record personal bigram 'họp' -> 'team'
  autoCompleteEngine.recordWordTransition('họp', 'team');
  autoCompleteEngine.recordWordTransition('họp', 'team');
  const learnedHop = autoCompleteEngine.getNextWordSuggestions('họp', 5);
  const topHop = learnedHop[0];
  assert('Gboard Habit Learning: "họp" learns "team" with top priority', topHop && topHop.word.toLowerCase() === 'team' && topHop.type === 'learned', 'team (learned)', `${topHop?.word} (${topHop?.type})`);

  // Seed Starter Habits
  const seededCount = autoCompleteEngine.seedLearnedHabits();
  assert('Gboard Seed Samples: seeds starter pairs', seededCount >= 6, '>= 6', String(seededCount));
  const learnedNghien = autoCompleteEngine.getNextWordSuggestions('nghiên', 5)[0];
  assert('Gboard Seed Samples: "nghiên" -> "cứu" priority 1 with type learned', learnedNghien?.word === 'cứu' && learnedNghien?.type === 'learned', 'cứu (learned)', `${learnedNghien?.word} (${learnedNghien?.type})`);

  // 21. Quick Telex (OpenKey feature)
  const quickTelexEngine = new AvimEngine({ method: IME_METHOD.TELEX, quickTelex: true });
  assert('Quick Telex: cc -> ch', quickTelexEngine.processKey('c', 'c').result === 'ch', 'ch', quickTelexEngine.processKey('c', 'c').result);
  assert('Quick Telex Capitalized: Cc -> Ch', quickTelexEngine.processKey('C', 'c').result === 'Ch', 'Ch', quickTelexEngine.processKey('C', 'c').result);
  assert('Quick Telex All-Caps: CC -> CH', quickTelexEngine.processKey('C', 'C').result === 'CH', 'CH', quickTelexEngine.processKey('C', 'C').result);
  assert('Quick Telex: gg -> gi', quickTelexEngine.processKey('g', 'g').result === 'gi', 'gi', quickTelexEngine.processKey('g', 'g').result);
  assert('Quick Telex: kk -> kh', quickTelexEngine.processKey('k', 'k').result === 'kh', 'kh', quickTelexEngine.processKey('k', 'k').result);
  assert('Quick Telex: nn -> ng', quickTelexEngine.processKey('n', 'n').result === 'ng', 'ng', quickTelexEngine.processKey('n', 'n').result);
  assert('Quick Telex: pp -> ph', quickTelexEngine.processKey('p', 'p').result === 'ph', 'ph', quickTelexEngine.processKey('p', 'p').result);
  assert('Quick Telex: tt -> th', quickTelexEngine.processKey('t', 't').result === 'th', 'th', quickTelexEngine.processKey('t', 't').result);
  // Triple key toggle back
  assert('Quick Telex 3rd key toggle back: ch + c -> ccc', quickTelexEngine.processKey('ch', 'c').result === 'ccc', 'ccc', quickTelexEngine.processKey('ch', 'c').result);
  assert('Quick Telex 3rd key toggle back: gi + g -> ggg', quickTelexEngine.processKey('gi', 'g').result === 'ggg', 'ggg', quickTelexEngine.processKey('gi', 'g').result);

  // 22. Emoji Shorthand (IBus-Bamboo & Slack feature)
  const emojiTim = autoCompleteEngine.getSuggestions(':ti', 5).map(s => s.word);
  assert('Emoji autocomplete: ":ti" suggests ":tim:" (❤️)', emojiTim.includes('❤️'), 'includes ❤️', emojiTim.join(', '));

  // 23. Syllable Parser & Dynamic Tone Shifting (Bamboo / vnchKey phonological architecture)
  const dynEngine = new AvimEngine({ method: IME_METHOD.TELEX });
  // to + s -> tó, + a -> tóa, + n -> toán
  let dynWord = 't';
  dynWord = dynEngine.processKey(dynWord, 'o').result;
  dynWord = dynEngine.processKey(dynWord, 's').result;
  assert('Early Tone: to + s -> tó', dynWord === 'tó', 'tó', dynWord);
  dynWord = dynEngine.processKey(dynWord, 'a').result;
  assert('Dynamic Tone Shift vowel append: tó + a -> tóa', dynWord === 'tóa', 'tóa', dynWord);
  dynWord = dynEngine.processKey(dynWord, 'n').result;
  assert('Dynamic Tone Shift coda append: tóa + n -> toán', dynWord === 'toán', 'toán', dynWord);

  // VNI Dynamic Tone Shifting: to + 1 -> tó, + a -> tóa, + n -> toán
  const dynVni = new AvimEngine({ method: IME_METHOD.VNI });
  let vniWord = 't';
  vniWord = dynVni.processKey(vniWord, 'o').result;
  vniWord = dynVni.processKey(vniWord, '1').result;
  assert('VNI Early Tone: to + 1 -> tó', vniWord === 'tó', 'tó', vniWord);
  vniWord = dynVni.processKey(vniWord, 'a').result;
  assert('VNI Dynamic Tone Shift: tó + a -> tóa', vniWord === 'tóa', 'tóa', vniWord);
  vniWord = dynVni.processKey(vniWord, 'n').result;
  assert('VNI Dynamic Tone Shift: tóa + n -> toán', vniWord === 'toán', 'toán', vniWord);

  // 24. Natural Phonological Guard (Bamboo / vnchKey feature: protect foreign/tech terms even if spellCheck is OFF)
  const noSpellEngine = new AvimEngine({ method: IME_METHOD.VNI, spellCheck: false, phonologyRules: true });
  let fcitxRes = '';
  ['f', 'c', 'i', 't', 'x', '5'].forEach(k => { fcitxRes = noSpellEngine.processKey(fcitxRes, k).result; });
  assert('Natural Phonology Guard: fcitx + 5 outputs fcitx5 without spellcheck', fcitxRes === 'fcitx5', 'fcitx5', fcitxRes);

  let docxRes = '';
  ['d', 'o', 'c', 'x', '4'].forEach(k => { docxRes = noSpellEngine.processKey(docxRes, k).result; });
  assert('Natural Phonology Guard: docx + 4 outputs docx4 without spellcheck', docxRes === 'docx4', 'docx4', docxRes);

  // 25. Telex Tone Toggle Breakout & English Trap Auto-Restore ("docs" -> "dóc" -> 2nd s restores "docs")
  const telexBreakoutEngine = new AvimEngine({ method: IME_METHOD.AUTO });
  let docSequence = '';
  ['d', 'o', 'c', 's'].forEach(k => {
    telexBreakoutEngine.trackRawKey(k);
    docSequence = telexBreakoutEngine.processKey(docSequence, k).result;
  });
  assert('Telex 1st s applies tone: d o c + s -> dóc', docSequence === 'dóc', 'dóc', docSequence);
  
  docSequence = telexBreakoutEngine.processKey(docSequence, 's').result;
  assert('Telex 2nd s on English trap restores literal letter directly (vnchKey): dóc + s -> docs', docSequence === 'docs', 'docs', docSequence);

  docSequence = telexBreakoutEngine.processKey(docSequence, 's').result;
  assert('Telex 3rd s appends normally: docs + s -> docss', docSequence === 'docss', 'docss', docSequence);

  // Standard Vietnamese word tone toggle (vnchKey behavior): cá + s -> cas -> cass
  let caSequence = '';
  ['c', 'a', 's'].forEach(k => {
    caSequence = telexBreakoutEngine.processKey(caSequence, k).result;
  });
  assert('Telex 1st s on valid VN word: c a + s -> cá', caSequence === 'cá', 'cá', caSequence);
  caSequence = telexBreakoutEngine.processKey(caSequence, 's').result;
  assert('Telex 2nd s on valid VN word toggles tone off and restores key (vnchKey): cá + s -> cas', caSequence === 'cas', 'cas', caSequence);
  caSequence = telexBreakoutEngine.processKey(caSequence, 's').result;
  assert('Telex 3rd s on valid VN word appends key: cas + s -> cass', caSequence === 'cass', 'cass', caSequence);

  // Auto-restore test on "docs" at boundary:
  const autoRestoreEngine = new AvimEngine({ method: IME_METHOD.AUTO });
  let docRaw = '';
  ['d', 'o', 'c', 's'].forEach(k => {
    autoRestoreEngine.trackRawKey(k);
    docRaw = autoRestoreEngine.processKey(docRaw, k).result;
  });
  const spaceRestored = autoRestoreEngine.checkAutoRestore(docRaw);
  assert('Auto-Restore on word delimiter restores docs: "dóc" -> "docs"', spaceRestored.restore && spaceRestored.result === 'docs', 'docs', spaceRestored.result);

  // 26. Auto-Restore test on "modern" -> "modẻn" -> restores to "modern"
  const modernTrapEngine = new AvimEngine({ method: IME_METHOD.AUTO, spellCheck: true });
  const modenRestored = modernTrapEngine.checkAutoRestore('modẻn');
  assert('Auto-Restore on word delimiter restores modern: "modẻn" -> "modern"', modenRestored.restore && modenRestored.result === 'modern', 'modern', modenRestored.result);

  // 27. Auto-Restore test on "variable" -> "vaỉable" -> restores to "variable"
  const varTrapEngine = new AvimEngine({ method: IME_METHOD.AUTO, spellCheck: true });
  const varRestored = varTrapEngine.checkAutoRestore('vaỉable');
  assert('Auto-Restore on word delimiter restores variable: "vaỉable" -> "variable"', varRestored.restore && varRestored.result === 'variable', 'variable', varRestored.result);

  return results;
}
