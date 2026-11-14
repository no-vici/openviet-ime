/**
 * VietC & vnchKey Regression Test Suite for OpenViet IME
 * Validates:
 * 1. Shape Modifier Swapping (â <-> ă, ô <-> ơ with preserved tones)
 * 2. Tone Placement & Special Clusters (qu, gi, uê, uơ, ươ, ưu)
 * 3. Natural Phonological Guard on Tech & English terms (fcitx, docx, etc.)
 * 4. English Auto-Restore edge cases
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD, TONE_STYLE } from '../src/engine/key-codes.js';

test('VietC / vnchKey - Shape Modifier Swapping (Telex: â <-> ă, ô <-> ơ)', () => {
  const telex = new AvimEngine({ method: IME_METHOD.TELEX });

  // 1. â + w -> ă (preserving tone)
  assert.equal(telex.processKey('ấm', 'w').result, 'ắm');
  assert.equal(telex.processKey('cân', 'w').result, 'căn');
  assert.equal(telex.processKey('tập', 'w').result, 'tặp');
  assert.equal(telex.processKey('Ấm', 'w').result, 'Ắm');

  // 2. ă + a -> â (preserving tone)
  assert.equal(telex.processKey('ắm', 'a').result, 'ấm');
  assert.equal(telex.processKey('căn', 'a').result, 'cân');
  assert.equal(telex.processKey('tặp', 'a').result, 'tập');
  assert.equal(telex.processKey('Ắm', 'a').result, 'Ấm');

  // 3. ô + w -> ơ (preserving tone)
  assert.equal(telex.processKey('bốn', 'w').result, 'bớn');
  assert.equal(telex.processKey('hộp', 'w').result, 'hợp');
  assert.equal(telex.processKey('cột', 'w').result, 'cợt');
  assert.equal(telex.processKey('Bốn', 'w').result, 'Bớn');

  // 4. ơ + o -> ô (preserving tone)
  assert.equal(telex.processKey('bớn', 'o').result, 'bốn');
  assert.equal(telex.processKey('hợp', 'o').result, 'hộp');
  assert.equal(telex.processKey('cợt', 'o').result, 'cột');
  assert.equal(telex.processKey('Bớn', 'o').result, 'Bốn');

  // 5. Direct modifier sequence: aaw -> ă, oow -> ơ
  let seq1 = '';
  for (const c of 'aaw') seq1 = telex.processKey(seq1, c).result;
  assert.equal(seq1, 'ă');

  let seq2 = '';
  for (const c of 'oow') seq2 = telex.processKey(seq2, c).result;
  assert.equal(seq2, 'ơ');
});

test('VietC / vnchKey - Shape Modifier Swapping (VNI: 6 <-> 8, 6 <-> 7)', () => {
  const vni = new AvimEngine({ method: IME_METHOD.VNI });

  // 1. â + 8 -> ă, ă + 6 -> â
  assert.equal(vni.processKey('tấ', '8').result, 'tắ');
  assert.equal(vni.processKey('tắ', '6').result, 'tấ');

  // 2. ô + 7 -> ơ, ơ + 6 -> ô
  assert.equal(vni.processKey('bốn', '7').result, 'bớn');
  assert.equal(vni.processKey('bớn', '6').result, 'bốn');
  assert.equal(vni.processKey('giồ', '7').result, 'giờ');
  assert.equal(vni.processKey('giờ', '6').result, 'giồ');
});

test('VietC / vnchKey - Tone Placement on Clusters (qu, gi, uê, uơ, ươ, ưu)', () => {
  const telex = new AvimEngine({ method: IME_METHOD.TELEX });

  // qu cluster: tone on following vowel
  let wQu = '';
  for (const c of 'quas') wQu = telex.processKey(wQu, c).result;
  assert.equal(wQu, 'quá');

  let wQue = '';
  for (const c of 'quees') wQue = telex.processKey(wQue, c).result;
  assert.equal(wQue, 'quế');

  // gi cluster: onset gi + vowel
  let wGio = '';
  for (const c of 'gios') wGio = telex.processKey(wGio, c).result;
  assert.equal(wGio, 'gió');

  let wGia = '';
  for (const c of 'giaf') wGia = telex.processKey(wGia, c).result;
  assert.equal(wGia, 'già');

  let wGieng = '';
  for (const c of 'gieengs') wGieng = telex.processKey(wGieng, c).result;
  assert.equal(wGieng, 'giếng');

  // uê cluster: tone on ê
  let wThue = '';
  for (const c of 'thuees') wThue = telex.processKey(wThue, c).result;
  assert.equal(wThue, 'thuế');

  // ươ cluster: duowcj -> được
  let wDuoc = '';
  for (const c of 'dduowcj') wDuoc = telex.processKey(wDuoc, c).result;
  assert.equal(wDuoc, 'được');

  // ưu cluster: cuwus -> cứu
  let wCuu = '';
  for (const c of 'cuuws') wCuu = telex.processKey(wCuu, c).result;
  assert.equal(wCuu, 'cứu');

  // Trio of uơ exceptions (thuở, quởn, huơ):
  // 1. thuở (thuo + w + r -> thuở)
  let wThuo = '';
  for (const c of 'thuowr') wThuo = telex.processKey(wThuo, c).result;
  assert.equal(wThuo, 'thuở');

  // 2. quởn / quơ (quon + w + r -> quởn, quo + w -> quơ)
  let wQuon = '';
  for (const c of 'quonwr') wQuon = telex.processKey(wQuon, c).result;
  assert.equal(wQuon, 'quởn');

  let wQuo = '';
  for (const c of 'quow') wQuo = telex.processKey(wQuo, c).result;
  assert.equal(wQuo, 'quơ');

  // 3. huơ (huo + w -> huơ)
  let wHuo = '';
  for (const c of 'huow') wHuo = telex.processKey(wHuo, c).result;
  assert.equal(wHuo, 'huơ');

  // VNI for the Trio:
  const vni = new AvimEngine({ method: IME_METHOD.VNI });
  let vThuo = '';
  for (const c of 'thuo73') vThuo = vni.processKey(vThuo, c).result;
  assert.equal(vThuo, 'thuở');

  let vQuon = '';
  for (const c of 'quon73') vQuon = vni.processKey(vQuon, c).result;
  assert.equal(vQuon, 'quởn');

  let vQuo = '';
  for (const c of 'quo7') vQuo = vni.processKey(vQuo, c).result;
  assert.equal(vQuo, 'quơ');

  let vHuo = '';
  for (const c of 'huo7') vHuo = vni.processKey(vHuo, c).result;
  assert.equal(vHuo, 'huơ');

  // Special French loanwords with -oong (xoong, boong, goòng):
  assert.equal(telex.processKey('xoong', 'f').result, 'xoòng');
  assert.equal(telex.processKey('goong', 'f').result, 'goòng');
  assert.equal(vni.processKey('goong', '2').result, 'goòng');
  assert.equal(vni.processKey('xoong', '2').result, 'xoòng');

  // Telex double o toggle on -ong -> -oong
  assert.equal(telex.processKey('xông', 'o').result, 'xoong');
  assert.equal(telex.processKey('gồng', 'o').result, 'goòng');

  // Closed diphthongs intermediate promotion (Jasper case: Huyèn, tién, biét, duòng, nuóc)
  assert.equal(telex.processKey('Huyèn', 'e').result, 'Huyền');
  assert.equal(telex.processKey('chuyén', 'e').result, 'chuyến');
  assert.equal(telex.processKey('tuyét', 'e').result, 'tuyết');
  assert.equal(telex.processKey('tién', 'e').result, 'tiến');
  assert.equal(telex.processKey('biét', 'e').result, 'biết');
  assert.equal(telex.processKey('duòng', 'w').result, 'dường');
  assert.equal(telex.processKey('nuóc', 'w').result, 'nước');
  assert.equal(telex.processKey('buòng', 'o').result, 'buồng');

  // VNI Closed diphthongs promotion
  assert.equal(vni.processKey('Huyèn', '6').result, 'Huyền');
  assert.equal(vni.processKey('chuyén', '6').result, 'chuyến');
  assert.equal(vni.processKey('tuyét', '6').result, 'tuyết');
  assert.equal(vni.processKey('tién', '6').result, 'tiến');
  assert.equal(vni.processKey('biét', '6').result, 'biết');
  assert.equal(vni.processKey('duòng', '7').result, 'dường');
  assert.equal(vni.processKey('nuóc', '7').result, 'nước');
  assert.equal(vni.processKey('buòng', '6').result, 'buồng');

  // Space Auto-Restore on incomplete intermediate closed/open diphthongs
  assert.equal(telex.checkAutoRestore('Huyèn').result, 'Huyenf');
  assert.equal(telex.checkAutoRestore('chuyén').result, 'chuyens');
  assert.equal(telex.checkAutoRestore('tuyét').result, 'tuyets');
  assert.equal(telex.checkAutoRestore('tién').result, 'tiens');
  assert.equal(telex.checkAutoRestore('biét').result, 'biets');
  assert.equal(telex.checkAutoRestore('duòng').result, 'duongf');
  assert.equal(telex.checkAutoRestore('nuóc').result, 'nuocs');
  assert.equal(telex.checkAutoRestore('buòng').result, 'buongf');
  assert.equal(vni.checkAutoRestore('Huyèn').result, 'Huyen2');
  assert.equal(vni.checkAutoRestore('chuyén').result, 'chuyen1');
  assert.equal(vni.checkAutoRestore('tuyét').result, 'tuyet1');
  assert.equal(vni.checkAutoRestore('tién').result, 'tien1');
  assert.equal(vni.checkAutoRestore('duòng').result, 'duong2');
  assert.equal(vni.checkAutoRestore('nuóc').result, 'nuoc1');
});

test('VietC / vnchKey - Natural Phonological Guard on Tech Terms', () => {
  // Even with spellCheck = false, tech commands must not be corrupted
  const noSpellVni = new AvimEngine({ method: IME_METHOD.VNI, spellCheck: false, phonologyRules: true });
  let fcitx = '';
  for (const c of 'fcitx5') fcitx = noSpellVni.processKey(fcitx, c).result;
  assert.equal(fcitx, 'fcitx5');

  let docx = '';
  for (const c of 'docx4') docx = noSpellVni.processKey(docx, c).result;
  assert.equal(docx, 'docx4');

  let linux = '';
  for (const c of 'linux6') linux = noSpellVni.processKey(linux, c).result;
  assert.equal(linux, 'linux6');

  // Regular Vietnamese typing with spellCheck = false must still work smoothly
  let toan = '';
  for (const c of 'toan1') toan = noSpellVni.processKey(toan, c).result;
  assert.equal(toan, 'toán');

  // Developer-Aware Mode: camelCase & PascalCase identifiers must never receive Vietnamese accents
  const telex = new AvimEngine({ method: IME_METHOD.TELEX });
  
  function typeWithTelex(keys) {
    let w = '';
    for (const c of keys) w = telex.processKey(w, c).result;
    return w;
  }

  assert.equal(typeWithTelex('isCamelCase'), 'isCamelCase', 'camelCase: isCamelCase must stay pristine');
  assert.equal(typeWithTelex('getUserName'), 'getUserName', 'camelCase: getUserName must stay pristine');
  assert.equal(typeWithTelex('useState'), 'useState', 'camelCase: useState must stay pristine');
  assert.equal(typeWithTelex('UserController'), 'UserController', 'PascalCase: UserController must stay pristine');
  assert.equal(typeWithTelex('AppProps'), 'AppProps', 'PascalCase: AppProps must stay pristine');
  assert.equal(typeWithTelex('handleClick'), 'handleClick', 'camelCase: handleClick must stay pristine');
});

test('Ngó Sen / vnchKey - Word Rescue (On-Activation) & Selection Accent Rescue', () => {
  const engine = new AvimEngine({ method: IME_METHOD.AUTO, toneStyle: 'modern' });

  // 1. Text Rescue: Retroactively converting raw typed strings to Vietnamese
  const rawSentence = 'Chaof banj, tieengs vieetj nef';
  const rescuedSentence = engine.rescueText(rawSentence);
  assert.equal(rescuedSentence, 'Chào bạn, tiếng việt nè');

  // English words preservation (linux, server, browser should stay English)
  const mixedSentence = 'Tooi ddang lafm vieecj trn may chu server va linux';
  const rescuedMixed = engine.rescueText(mixedSentence);
  assert.equal(rescuedMixed, 'Tôi đang làm việc trn may chu server va linux');

  // Saigon Xưa phrases rescue
  assert.equal(engine.rescueWord('thuowr'), 'thuở');
  assert.equal(engine.rescueWord('quowrn'), 'quởn');
  assert.equal(engine.rescueWord('ddowif'), 'đời');
  assert.equal(engine.rescueWord('nef'), 'nè');

  // 2. Selection Accent Rescue (Modify, add, or remove tone on selection)
  // Telex tests
  assert.equal(engine.applyAccentToSelection('nhanh', 's'), 'nhánh');
  assert.equal(engine.applyAccentToSelection('nhánh', 'f'), 'nhành');
  assert.equal(engine.applyAccentToSelection('nhánh', 'z'), 'nhanh'); // remove tone
  assert.equal(engine.applyAccentToSelection('hoa', 'r'), 'hoả');
  assert.equal(engine.applyAccentToSelection('tieng', 's'), 'tiếng');
  assert.equal(engine.applyAccentToSelection('khuyu', 'r'), 'khuỷu');
  assert.equal(engine.applyAccentToSelection('ngoeo', 'f'), 'ngoèo');

  // VNI tests
  assert.equal(engine.applyAccentToSelection('nhanh', '1'), 'nhánh');
  assert.equal(engine.applyAccentToSelection('nhanh', '2'), 'nhành');
  assert.equal(engine.applyAccentToSelection('nhanh', '3'), 'nhảnh');
  assert.equal(engine.applyAccentToSelection('nhanh', '4'), 'nhãnh');
  assert.equal(engine.applyAccentToSelection('nhanh', '5'), 'nhạnh');
  assert.equal(engine.applyAccentToSelection('nước', '0'), 'nươc'); // remove tone in VNI

  // Non-tone key returns null to preserve native OS typing over selection
  assert.equal(engine.applyAccentToSelection('nhanh', 'k'), null);
  assert.equal(engine.applyAccentToSelection('nhanh', 'b'), null);

  // Classic toneStyle support
  const classicEngine = new AvimEngine({ method: IME_METHOD.AUTO, toneStyle: 'classic' });
  assert.equal(classicEngine.applyAccentToSelection('hoa', 'r'), 'hỏa');
  assert.equal(classicEngine.applyAccentToSelection('hoa', 's'), 'hóa');
});
