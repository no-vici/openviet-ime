import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD, TONE_STYLE, isUrlOrEmailOrCode } from '../src/engine/key-codes.js';

function typeWord(engine, keystrokes) {
  let current = '';
  for (const ch of keystrokes) {
    engine.trackRawKey(ch);
    const res = engine.processKey(current, ch);
    current = res.transformed ? res.result : current + ch;
  }
  return current.normalize('NFC');
}

function typeWordAndCommit(engine, keystrokes, delimiter = ' ') {
  const typed = typeWord(engine, keystrokes);
  const restoreRes = engine.checkAutoRestore(typed);
  const finalWord = restoreRes.restore ? restoreRes.result : typed;
  engine.resetWordSession();
  return (finalWord + delimiter).normalize('NFC');
}

describe('OpenViet IME - Engine Edge Cases Suite', () => {
  let engine;

  beforeEach(() => {
    engine = new AvimEngine({
      method: IME_METHOD.AUTO,
      toneStyle: TONE_STYLE.CLASSIC,
      spellCheck: true,
      autoRestoreEnglish: true,
      escRevert: true,
      phonologyRules: true,
      quickTelex: true
    });
  });

  describe('1. Tone Placement & Dynamic Shifting', () => {
    it('places tones correctly in CLASSIC style (default)', () => {
      engine.setToneStyle(TONE_STYLE.CLASSIC);
      assert.strictEqual(typeWord(engine, 'hoaf'), 'hòa');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'hoas'), 'hóa');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'thuyr'), 'thủy');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'khoer'), 'khỏe');
    });

    it('places tones correctly in MODERN style', () => {
      engine.setToneStyle(TONE_STYLE.MODERN);
      assert.strictEqual(typeWord(engine, 'hoaf'), 'hoà');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'hoas'), 'hoá');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'thuyr'), 'thuỷ');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'khoer'), 'khoẻ');
    });

    it('dynamically shifts tone when appending coda or vowel (tóa + n -> toán)', () => {
      engine.setToneStyle(TONE_STYLE.CLASSIC);
      assert.strictEqual(typeWord(engine, 'toas'), 'tóa');
      const shifted = engine.processKey('tóa', 'n');
      assert.strictEqual(shifted.transformed, true);
      assert.strictEqual(shifted.result, 'toán');
    });

    it('handles delayed horn/breve modifiers accurately (dduocjw -> được, cuuw -> cưu)', () => {
      assert.strictEqual(typeWord(engine, 'dduocjw'), 'được');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'cuuw'), 'cưu');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'cuuws'), 'cứu');
    });

    it('supports shape modifier swapping while preserving tone (ấm + w -> ắm)', () => {
      const step1 = typeWord(engine, 'aams');
      assert.strictEqual(step1, 'ấm');
      const swapped = engine.processKey(step1, 'w');
      assert.strictEqual(swapped.transformed, true);
      assert.strictEqual(swapped.result, 'ắm');
    });
  });

  describe('2. Special Linguistic Exceptions & Double-Key Cancellation', () => {
    it('handles the uơ trio exceptions (thuở, quơ, quởn, huơ)', () => {
      assert.strictEqual(typeWord(engine, 'thuowr'), 'thuở');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'quow'), 'quơ');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'quowrn'), 'quởn');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'huow'), 'huơ');
    });

    it('handles French double-o loanwords ending in -ng (xooong -> xoong, booong -> boong)', () => {
      assert.strictEqual(typeWord(engine, 'xooong'), 'xoong');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'xooofng'), 'xoòng');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'booong'), 'boong');
    });

    it('cancels tone on double keystroke and passes literal on 3rd keystroke (dóc + s -> docs + s -> docss)', () => {
      const w1 = typeWord(engine, 'docs');
      assert.strictEqual(w1, 'dóc');

      const w2 = engine.processKey(w1, 's');
      assert.strictEqual(w2.transformed, true);
      assert.strictEqual(w2.result, 'docs');

      const w3 = engine.processKey(w2.result, 's');
      assert.strictEqual(w3.transformed, false);
      assert.strictEqual(w3.result, 'docss');
    });
  });

  describe('3. Vietnamese Phonology & Stop Finals Rules', () => {
    it('blocks invalid tones (grave, hook, tilde) on stop finals (-c, -ch, -p, -t)', () => {
      assert.strictEqual(typeWord(engine, 'bacf'), 'bacf');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'thichr'), 'thichr');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'bepx'), 'bepx');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'bacs'), 'bác');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'bacj'), 'bạc');
    });

    it('protects invalid initial consonant clusters (ce, ci, ge, nge)', () => {
      assert.strictEqual(typeWord(engine, 'center'), 'center');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'city'), 'city');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'get'), 'get');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'danger'), 'danger');
    });
  });

  describe('4. Bilingual Auto-Restore, Developer Syntax & Ethnic Toponyms', () => {
    it('auto-restores English Telex trap words on Space commit', () => {
      assert.strictEqual(typeWordAndCommit(engine, 'text'), 'text ');
      assert.strictEqual(typeWordAndCommit(engine, 'user'), 'user ');
      assert.strictEqual(typeWordAndCommit(engine, 'push'), 'push ');
      assert.strictEqual(typeWordAndCommit(engine, 'window'), 'window ');
      assert.strictEqual(typeWordAndCommit(engine, 'fcitx'), 'fcitx ');
    });

    it('reverts current accented word back to raw keys on ESC', () => {
      const typed = typeWord(engine, 'toans');
      assert.strictEqual(typed, 'toán');
      const reverted = engine.revertCurrentWord(typed);
      assert.strictEqual(reverted.reverted, true);
      assert.strictEqual(reverted.result, 'toans');
    });

    it('un-accents prefix and suspends IME when typing camelCase or PascalCase', () => {
      assert.strictEqual(typeWord(engine, 'isReady'), 'isReady');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'useState'), 'useState');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'UserController'), 'UserController');
    });

    it('detects URLs, emails, and file paths via isUrlOrEmailOrCode guard', () => {
      assert.strictEqual(isUrlOrEmailOrCode('https://github.com/no-vici', 'no-vici'), true);
      assert.strictEqual(isUrlOrEmailOrCode('contact@openviet.vn', 'contact@openviet.vn'), true);
      assert.strictEqual(isUrlOrEmailOrCode('/usr/local/bin', 'bin'), true);
      assert.strictEqual(isUrlOrEmailOrCode('user_id', 'user_id'), true);
    });

    it('supports Central Highlands & ethnic toponyms accurately', () => {
      assert.strictEqual(typeWord(engine, "M'Ddrakw"), "M'Đrăk");
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, "M'Ddrakws"), "M'Đrắk");
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, "Ea H'leo"), "Ea H'leo");
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'Kroong'), 'Krông');
    });
  });

  describe('5. VNI Number Modifiers & Adaptive AUTO Mode', () => {
    it('applies VNI tones (1-5) and removes tone (0) accurately', () => {
      engine.setMethod(IME_METHOD.VNI);
      assert.strictEqual(typeWord(engine, 'toan1'), 'toán');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'toan2'), 'toàn');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'toan3'), 'toản');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'toan4'), 'toãn');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'toan5'), 'toạn');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'toan10'), 'toan');
    });

    it('applies VNI vowel shapes (6: circumflex, 7: horn, 8: breve) and bar-d (9)', () => {
      engine.setMethod(IME_METHOD.VNI);
      assert.strictEqual(typeWord(engine, 'can6'), 'cân');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'duoc975'), 'được');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'trang81'), 'trắng');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'cuu71'), 'cứu');
    });

    it('swaps VNI shape modifiers while preserving existing tones (tấ + 8 -> tắ, bốn + 7 -> bớn)', () => {
      engine.setMethod(IME_METHOD.VNI);
      const circumflexToned = typeWord(engine, 'ta61');
      assert.strictEqual(circumflexToned, 'tấ');
      const swappedBreve = engine.processKey(circumflexToned, '8');
      assert.strictEqual(swappedBreve.transformed, true);
      assert.strictEqual(swappedBreve.result, 'tắ');

      engine.resetWordSession();
      const circumflexO = typeWord(engine, 'bon61');
      assert.strictEqual(circumflexO, 'bốn');
      const swappedHorn = engine.processKey(circumflexO, '7');
      assert.strictEqual(swappedHorn.transformed, true);
      assert.strictEqual(swappedHorn.result, 'bớn');
    });

    it('cancels VNI modifier on double-digit press to type literal numbers (icon66 -> icon6)', () => {
      engine.setMethod(IME_METHOD.VNI);
      const step1 = typeWord(engine, 'icon6');
      assert.strictEqual(step1, 'icôn');

      const step2 = engine.processKey(step1, '6');
      assert.strictEqual(step2.transformed, true);
      assert.strictEqual(step2.result, 'icon6');

      const step3 = engine.processKey(step2.result, '4');
      assert.strictEqual(step3.transformed, false);
      assert.strictEqual(step3.result, 'icon64');
    });

    it('protects alphanumeric identifiers containing digits (mp3, h2o, f88, fcitx5)', () => {
      engine.setMethod(IME_METHOD.AUTO);
      assert.strictEqual(typeWord(engine, 'mp3'), 'mp3');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'h2o'), 'h2o');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'f88'), 'f88');
      engine.resetWordSession();
      assert.strictEqual(typeWord(engine, 'fcitx5'), 'fcitx5');
    });
  });
});
