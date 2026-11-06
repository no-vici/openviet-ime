/**
 * Vietnamese Syllable Parser Test Suite
 * Tests 5-component phonological parsing, reconstruction, and validity rules.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSyllable, TONE_MARK } from '../src/engine/syllable-parser.js';
import { TONE_STYLE } from '../src/engine/key-codes.js';

test('Syllable Parser - Monophthongs and Basic Tones', () => {
  const p1 = parseSyllable('má');
  assert.equal(p1.onset, 'm');
  assert.equal(p1.nucleus, 'a');
  assert.equal(p1.tone, TONE_MARK.ACUTE);
  assert.equal(p1.reconstruct(TONE_STYLE.MODERN), 'má');

  const p2 = parseSyllable('việt');
  assert.equal(p2.onset, 'v');
  assert.equal(p2.nucleus, 'iê');
  assert.equal(p2.coda, 't');
  assert.equal(p2.tone, TONE_MARK.DOT_BELOW);
  assert.equal(p2.reconstruct(TONE_STYLE.MODERN), 'việt');
});

test('Syllable Parser - Special Onsets: qu and gi', () => {
  // 'qu' -> onset 'q', glide 'u'
  const pQu = parseSyllable('quán');
  assert.equal(pQu.onset, 'q');
  assert.equal(pQu.glide, 'u');
  assert.equal(pQu.nucleus, 'a');
  assert.equal(pQu.coda, 'n');
  assert.equal(pQu.tone, TONE_MARK.ACUTE);
  assert.equal(pQu.reconstruct(TONE_STYLE.MODERN), 'quán');

  // 'gi' followed by vowel -> onset 'gi'
  const pGia = parseSyllable('gió');
  assert.equal(pGia.onset, 'gi');
  assert.equal(pGia.nucleus, 'o');
  assert.equal(pGia.tone, TONE_MARK.ACUTE);
  assert.equal(pGia.reconstruct(TONE_STYLE.MODERN), 'gió');

  // 'gi' alone / with consonant -> onset 'g', nucleus 'i'
  const pGin = parseSyllable('gìn');
  assert.equal(pGin.onset, 'g');
  assert.equal(pGin.nucleus, 'i');
  assert.equal(pGin.coda, 'n');
  assert.equal(pGin.tone, TONE_MARK.GRAVE);
  assert.equal(pGin.reconstruct(TONE_STYLE.MODERN), 'gìn');
});

test('Syllable Parser - Central Highlands & Apostrophe Onsets', () => {
  const pDak = parseSyllable("M'đrắk");
  assert.equal(pDak.apostrophePrefix, "M'");
  assert.equal(pDak.onset, 'đr');
  assert.equal(pDak.nucleus, 'ă');
  assert.equal(pDak.coda, 'k');
  assert.equal(pDak.tone, TONE_MARK.ACUTE);
  assert.equal(pDak.reconstruct(TONE_STYLE.MODERN), "M'đrắk");
});

test('Syllable Parser - Modern vs Classic Tone Styles', () => {
  const pHoa = parseSyllable('hóa');
  assert.equal(pHoa.reconstruct(TONE_STYLE.MODERN), 'hoá');
  assert.equal(pHoa.reconstruct(TONE_STYLE.CLASSIC), 'hóa');

  const pThuy = parseSyllable('thủy');
  assert.equal(pThuy.reconstruct(TONE_STYLE.MODERN), 'thuỷ');
  assert.equal(pThuy.reconstruct(TONE_STYLE.CLASSIC), 'thủy');
});

test('Syllable Parser - Phonological Validity (Stop Finals)', () => {
  const validDuoc = parseSyllable('được');
  assert.equal(validDuoc.isValid(), true);

  const validDuocAcute = parseSyllable('đước');
  assert.equal(validDuocAcute.isValid(), true);

  // Stop final -c cannot have grave tone
  const invalidDuocGrave = parseSyllable('đườc');
  assert.equal(invalidDuocGrave.isValid(), false);
});

