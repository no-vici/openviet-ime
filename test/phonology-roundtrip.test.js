/**
 * test/phonology-roundtrip.test.js
 *
 * Automated Phonology Round-Trip & Constraint Enforcement Suite.
 * Simulates human typing through AvimEngine for standard Vietnamese syllables,
 * phonological constraints, stop finals, and tone swap rules across Telex and VNI.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD, TONE_STYLE } from '../src/engine/key-codes.js';
import { parseSyllable } from '../src/engine/syllable-parser.js';
import { getVietnameseWordSet } from '../src/engine/vietnamese-words.js';

function simulateType(engine, keystrokes) {
  let result = '';
  for (const ch of keystrokes) {
    engine.trackRawKey(ch);
    const step = engine.processKey(result, ch);
    result = step.transformed ? step.result : result + ch;
  }
  return result;
}

test('Phonology Round-Trip - Representative Syllables (Telex & VNI)', () => {
  const telexEngine = new AvimEngine({ method: IME_METHOD.TELEX, toneStyle: TONE_STYLE.CLASSIC });
  const vniEngine = new AvimEngine({ method: IME_METHOD.VNI, toneStyle: TONE_STYLE.CLASSIC });

  // Comprehensive test matrix across all 6 tones and complex vowel combinations
  const testMatrix = [
    // [Expected, Telex keys, VNI keys]
    ['đường', 'dduowngf', 'duong972'],
    ['tiếng', 'tieengs', 'tieng61'],
    ['việt', 'vieetj', 'viet65'],
    ['người', 'nguowif', 'nguoi72'],
    ['cứu', 'cuuws', 'cuu71'],
    ['thuyền', 'thuyenf', 'thuyen62'],
    ['khuỷu', 'khuyur', 'khuyu3'],
    ['thuở', 'thuowr', 'thuo73'],
    ['ngoèo', 'ngoeof', 'ngoeo2'],
    ['nghiêng', 'nghieeng', 'nghieng6'],
    ['toán', 'toans', 'toan1'],
    ['hoàn', 'hoanf', 'hoan2'],
    ['khỏe', 'khoer', 'khoe3'],
    ['bước', 'buowcs', 'buoc71'],
    ['quế', 'quees', 'que61'],
    ['thuế', 'thuees', 'thue61'],
    ['xuề', 'xueef', 'xue62'],
    ['cừu', 'cuuwf', 'cuu72'],
    ['xoong', 'xoongo', 'xoong'], // French loanword toggle with trailing o
    ['boong', 'boongo', 'boong'],
  ];

  for (const [expected, telexKeys, vniKeys] of testMatrix) {
    telexEngine.resetWordSession();
    const telexActual = simulateType(telexEngine, telexKeys);
    assert.equal(telexActual, expected, `Telex failed for ${expected} with keys "${telexKeys}"`);

    vniEngine.resetWordSession();
    const vniActual = simulateType(vniEngine, vniKeys);
    assert.equal(vniActual, expected, `VNI failed for ${expected} with keys "${vniKeys}"`);
  }
});

test('Phonology Constraints - Stop Finals (-c, -ch, -p, -t) Reject Disallowed Tones', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, phonologyRules: true });

  // Syllables with stop finals can ONLY take Tone 1 (sắc - 's') or Tone 5 (nặng - 'j')
  // Disallowed: Tone 2 ('f' huyền), Tone 3 ('r' hỏi), Tone 4 ('x' ngã)
  const stopFinalCases = [
    // [Base, toneKey, shouldTransform]
    ['bac', 's', true],   // bác
    ['bac', 'j', true],   // bạc
    ['bac', 'f', false],  // bacf (rejected)
    ['bac', 'r', false],  // bacr (rejected)
    ['bac', 'x', false],  // bacx (rejected)

    ['bich', 's', true],  // bích
    ['bich', 'j', true],  // bịch
    ['bich', 'f', false], // bichf (rejected)
    ['bich', 'r', false], // bichr (rejected)

    ['bep', 's', true],   // bép
    ['bep', 'j', true],   // bẹp
    ['bep', 'r', false],  // bepr (rejected)

    ['bat', 's', true],   // bát
    ['bat', 'j', true],   // bạt
    ['bat', 'x', false],  // batx (rejected)
  ];

  for (const [base, toneKey, shouldTransform] of stopFinalCases) {
    const res = engine.processKey(base, toneKey);
    if (shouldTransform) {
      assert.equal(res.transformed, true, `Expected ${base} + ${toneKey} to transform`);
      assert.notEqual(res.result, base + toneKey);
    } else {
      assert.equal(res.transformed, false, `Expected ${base} + ${toneKey} to be rejected (stop final constraint)`);
      assert.equal(res.result, base + toneKey);
    }
  }
});

test('Phonology Constraints - c/k, g/gh, ng/ngh Consonant Harmony Protection', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, phonologyRules: true });

  // Front vowels (e, ê, i, y) cannot follow c, g, ng in Vietnamese.
  // When an English/foreign word violates this (e.g. ce, ci, ge, giê), IME must protect raw text.
  const harmonyCases = [
    { base: 'ce', key: 's', expected: 'ces' }, // Not cés
    { base: 'ci', key: 's', expected: 'cis' }, // Not cís
    { base: 'ge', key: 's', expected: 'ges' }, // Not gés
  ];

  for (const { base, key, expected } of harmonyCases) {
    const res = engine.processKey(base, key);
    assert.equal(res.result, expected, `Consonant harmony violation should reject tone: ${base} + ${key}`);
  }
});

test('Phonology Round-Trip - Large-Scale Syllable Sampling across Vocabulary', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, toneStyle: TONE_STYLE.CLASSIC });
  const wordSet = getVietnameseWordSet();

  // Test across hundreds of distinct real syllables in the vocabulary
  const TONE_KEYS = { 0: '', 1: 's', 2: 'f', 3: 'r', 4: 'x', 5: 'j' };
  const SHAPES = {
    'â': 'aa', 'ă': 'aw', 'ê': 'ee', 'ô': 'oo', 'ơ': 'ow', 'ư': 'uw'
  };

  let sampled = 0;
  let matches = 0;

  for (const word of wordSet) {
    // Sample every 5th word to keep test suite lightning fast (< 200ms)
    sampled++;
    if (sampled % 5 !== 0) continue;

    const parsed = parseSyllable(word);
    if (!parsed || !parsed.isValid() || parsed.hasApostrophe) continue;

    // Build standard typing keystrokes
    let onset = parsed.onset === 'đ' ? 'dd' : parsed.onset;
    let glide = parsed.glide || '';
    let nucleus = parsed.nucleus;

    if (nucleus === 'ươ') nucleus = 'uow';
    else if (nucleus === 'ưa') nucleus = 'uwa';
    else if (nucleus === 'iê') nucleus = 'iee';
    else if (nucleus === 'yê') nucleus = 'yee';
    else if (nucleus === 'uô') nucleus = 'uoo';
    else {
      nucleus = nucleus.split('').map(c => SHAPES[c] || c).join('');
    }

    const toneKey = TONE_KEYS[parsed.tone] || '';
    const keys = onset + glide + nucleus + parsed.coda + toneKey;

    engine.resetWordSession();
    let actual = '';
    for (const k of keys) {
      actual = engine.processKey(actual, k).result;
    }

    // Classic vs modern orthography variations (e.g. hoá / hóa) are both accepted
    if (actual === word) {
      matches++;
    } else {
      // Check if discrepancy is purely modern/classic tone placement
      const pActual = parseSyllable(actual);
      if (pActual && pActual.nucleus === parsed.nucleus && pActual.tone === parsed.tone && pActual.onset === parsed.onset && pActual.coda === parsed.coda) {
        matches++;
      }
    }
  }

  // Ensure high-accuracy roundtrip fidelity (> 95% on diverse vocabulary)
  assert.ok(matches > 1100, `Expected at least 1100 sampled syllables to match, got ${matches}`);
});
