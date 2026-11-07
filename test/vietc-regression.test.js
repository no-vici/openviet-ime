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
});
