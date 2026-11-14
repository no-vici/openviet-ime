import { describe, it, expect, beforeEach } from 'vitest';
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
      expect(typeWord(engine, 'hoaf')).toBe('hòa');
      engine.resetWordSession();
      expect(typeWord(engine, 'hoas')).toBe('hóa');
      engine.resetWordSession();
      expect(typeWord(engine, 'thuyr')).toBe('thủy');
      engine.resetWordSession();
      expect(typeWord(engine, 'khoer')).toBe('khỏe');
    });

    it('places tones correctly in MODERN style', () => {
      engine.setToneStyle(TONE_STYLE.MODERN);
      expect(typeWord(engine, 'hoaf')).toBe('hoà');
      engine.resetWordSession();
      expect(typeWord(engine, 'hoas')).toBe('hoá');
      engine.resetWordSession();
      expect(typeWord(engine, 'thuyr')).toBe('thuỷ');
      engine.resetWordSession();
      expect(typeWord(engine, 'khoer')).toBe('khoẻ');
    });

    it('dynamically shifts tone when appending coda or vowel (tóa + n -> toán)', () => {
      engine.setToneStyle(TONE_STYLE.CLASSIC);
      expect(typeWord(engine, 'toas')).toBe('tóa');
      const shifted = engine.processKey('tóa', 'n');
      expect(shifted.transformed).toBe(true);
      expect(shifted.result).toBe('toán');
    });

    it('handles delayed horn/breve modifiers accurately (dduocjw -> được, cuuw -> cưu)', () => {
      expect(typeWord(engine, 'dduocjw')).toBe('được');
      engine.resetWordSession();
      expect(typeWord(engine, 'cuuw')).toBe('cưu');
      engine.resetWordSession();
      expect(typeWord(engine, 'cuuws')).toBe('cứu');
    });

    it('supports shape modifier swapping while preserving tone (ấm + w -> ắm)', () => {
      const step1 = typeWord(engine, 'aams');
      expect(step1).toBe('ấm');
      const swapped = engine.processKey(step1, 'w');
      expect(swapped.transformed).toBe(true);
      expect(swapped.result).toBe('ắm');
    });
  });

  describe('2. Special Linguistic Exceptions & Double-Key Cancellation', () => {
    it('handles the uơ trio exceptions (thuở, quơ, quởn, huơ)', () => {
      expect(typeWord(engine, 'thuowr')).toBe('thuở');
      engine.resetWordSession();
      expect(typeWord(engine, 'quow')).toBe('quơ');
      engine.resetWordSession();
      expect(typeWord(engine, 'quowrn')).toBe('quởn');
      engine.resetWordSession();
      expect(typeWord(engine, 'huow')).toBe('huơ');
    });

    it('handles French double-o loanwords ending in -ng (xooong -> xoong, booong -> boong)', () => {
      expect(typeWord(engine, 'xooong')).toBe('xoong');
      engine.resetWordSession();
      expect(typeWord(engine, 'xooofng')).toBe('xoòng');
      engine.resetWordSession();
      expect(typeWord(engine, 'booong')).toBe('boong');
    });

    it('cancels tone on double keystroke and passes literal on 3rd keystroke (dóc + s -> docs + s -> docss)', () => {
      const w1 = typeWord(engine, 'docs');
      expect(w1).toBe('dóc');

      const w2 = engine.processKey(w1, 's');
      expect(w2.transformed).toBe(true);
      expect(w2.result).toBe('docs');

      const w3 = engine.processKey(w2.result, 's');
      expect(w3.transformed).toBe(false);
      expect(w3.result).toBe('docss');
    });
  });

  describe('3. Vietnamese Phonology & Stop Finals Rules', () => {
    it('blocks invalid tones (grave, hook, tilde) on stop finals (-c, -ch, -p, -t)', () => {
      expect(typeWord(engine, 'bacf')).toBe('bacf');
      engine.resetWordSession();
      expect(typeWord(engine, 'thichr')).toBe('thichr');
      engine.resetWordSession();
      expect(typeWord(engine, 'bepx')).toBe('bepx');
      engine.resetWordSession();
      expect(typeWord(engine, 'bacs')).toBe('bác');
      engine.resetWordSession();
      expect(typeWord(engine, 'bacj')).toBe('bạc');
    });

    it('protects invalid initial consonant clusters (ce, ci, ge, nge)', () => {
      expect(typeWord(engine, 'center')).toBe('center');
      engine.resetWordSession();
      expect(typeWord(engine, 'city')).toBe('city');
      engine.resetWordSession();
      expect(typeWord(engine, 'get')).toBe('get');
      engine.resetWordSession();
      expect(typeWord(engine, 'danger')).toBe('danger');
    });
  });

  describe('4. Bilingual Auto-Restore, Developer Syntax & Ethnic Toponyms', () => {
    it('auto-restores English Telex trap words on Space commit', () => {
      expect(typeWordAndCommit(engine, 'text')).toBe('text ');
      expect(typeWordAndCommit(engine, 'user')).toBe('user ');
      expect(typeWordAndCommit(engine, 'push')).toBe('push ');
      expect(typeWordAndCommit(engine, 'window')).toBe('window ');
      expect(typeWordAndCommit(engine, 'fcitx')).toBe('fcitx ');
    });

    it('reverts current accented word back to raw keys on ESC', () => {
      const typed = typeWord(engine, 'toans');
      expect(typed).toBe('toán');
      const reverted = engine.revertCurrentWord(typed);
      expect(reverted.reverted).toBe(true);
      expect(reverted.result).toBe('toans');
    });

    it('un-accents prefix and suspends IME when typing camelCase or PascalCase', () => {
      expect(typeWord(engine, 'isReady')).toBe('isReady');
      engine.resetWordSession();
      expect(typeWord(engine, 'useState')).toBe('useState');
      engine.resetWordSession();
      expect(typeWord(engine, 'UserController')).toBe('UserController');
    });

    it('detects URLs, emails, and file paths via isUrlOrEmailOrCode guard', () => {
      expect(isUrlOrEmailOrCode('https://github.com/no-vici', 'no-vici')).toBe(true);
      expect(isUrlOrEmailOrCode('contact@openviet.vn', 'contact@openviet.vn')).toBe(true);
      expect(isUrlOrEmailOrCode('/usr/local/bin', 'bin')).toBe(true);
      expect(isUrlOrEmailOrCode('user_id', 'user_id')).toBe(true);
    });

    it('supports Central Highlands & ethnic toponyms accurately', () => {
      expect(typeWord(engine, "M'Ddrakw")).toBe("M'Đrăk");
      engine.resetWordSession();
      expect(typeWord(engine, "M'Ddrakws")).toBe("M'Đrắk");
      engine.resetWordSession();
      expect(typeWord(engine, "Ea H'leo")).toBe("Ea H'leo");
      engine.resetWordSession();
      expect(typeWord(engine, 'Kroong')).toBe('Krông');
    });
  });

  describe('5. VNI Number Modifiers & Adaptive AUTO Mode', () => {
    it('applies VNI tones (1-5) and removes tone (0) accurately', () => {
      engine.setMethod(IME_METHOD.VNI);
      expect(typeWord(engine, 'toan1')).toBe('toán');
      engine.resetWordSession();
      expect(typeWord(engine, 'toan2')).toBe('toàn');
      engine.resetWordSession();
      expect(typeWord(engine, 'toan3')).toBe('toản');
      engine.resetWordSession();
      expect(typeWord(engine, 'toan4')).toBe('toãn');
      engine.resetWordSession();
      expect(typeWord(engine, 'toan5')).toBe('toạn');
      engine.resetWordSession();
      expect(typeWord(engine, 'toan10')).toBe('toan');
    });

    it('applies VNI vowel shapes (6: circumflex, 7: horn, 8: breve) and bar-d (9)', () => {
      engine.setMethod(IME_METHOD.VNI);
      expect(typeWord(engine, 'can6')).toBe('cân');
      engine.resetWordSession();
      expect(typeWord(engine, 'duoc975')).toBe('được');
      engine.resetWordSession();
      expect(typeWord(engine, 'trang81')).toBe('trắng');
      engine.resetWordSession();
      expect(typeWord(engine, 'cuu71')).toBe('cứu');
    });

    it('swaps VNI shape modifiers while preserving existing tones (tấ + 8 -> tắ, bốn + 7 -> bớn)', () => {
      engine.setMethod(IME_METHOD.VNI);
      const circumflexToned = typeWord(engine, 'ta61');
      expect(circumflexToned).toBe('tấ');
      const swappedBreve = engine.processKey(circumflexToned, '8');
      expect(swappedBreve.transformed).toBe(true);
      expect(swappedBreve.result).toBe('tắ');

      engine.resetWordSession();
      const circumflexO = typeWord(engine, 'bon61');
      expect(circumflexO).toBe('bốn');
      const swappedHorn = engine.processKey(circumflexO, '7');
      expect(swappedHorn.transformed).toBe(true);
      expect(swappedHorn.result).toBe('bớn');
    });

    it('cancels VNI modifier on double-digit press to type literal numbers (icon66 -> icon6)', () => {
      engine.setMethod(IME_METHOD.VNI);
      const step1 = typeWord(engine, 'icon6');
      expect(step1).toBe('icôn');

      const step2 = engine.processKey(step1, '6');
      expect(step2.transformed).toBe(true);
      expect(step2.result).toBe('icon6');

      const step3 = engine.processKey(step2.result, '4');
      expect(step3.transformed).toBe(false);
      expect(step3.result).toBe('icon64');
    });

    it('protects alphanumeric identifiers containing digits (mp3, h2o, f88, fcitx5)', () => {
      engine.setMethod(IME_METHOD.AUTO);
      expect(typeWord(engine, 'mp3')).toBe('mp3');
      engine.resetWordSession();
      expect(typeWord(engine, 'h2o')).toBe('h2o');
      engine.resetWordSession();
      expect(typeWord(engine, 'f88')).toBe('f88');
      engine.resetWordSession();
      expect(typeWord(engine, 'fcitx5')).toBe('fcitx5');
    });
  });
});
