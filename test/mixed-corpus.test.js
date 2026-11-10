/**
 * test/mixed-corpus.test.js
 *
 * Mixed Corpus & Real-World Regression Test Suite.
 * Validates complex typing scenarios combining:
 * 1. Bilingual sentences (Vietnamese + English technical terms)
 * 2. Developer-Aware camelCase & PascalCase identifiers
 * 3. Token-scoped file paths & system commands
 * 4. Markdown backtick code spans & variables ($var, #id)
 * 5. Auto-restore & vnchKey rapid breakout mechanics
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';
import { isUrlOrEmailOrCode } from '../src/engine/key-codes.js';
import { reverseVietnameseWord, matchCasing, userDictionary } from '../src/engine/dictionary.js';

function simulateTypingSentence(engine, input) {
  let output = '';
  let activeWord = '';

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Delimiter boundary
    if (/[\s,.!?;:]/.test(ch)) {
      if (activeWord) {
        const restore = engine.checkAutoRestore(activeWord);
        if (restore && restore.restore) {
          const startIdx = output.length - activeWord.length;
          output = output.slice(0, startIdx) + restore.result;
        }
      }
      output += ch;
      activeWord = '';
      engine.resetWordSession();
      continue;
    }

    // Guard against URLs, paths, or code
    if (isUrlOrEmailOrCode(activeWord + ch)) {
      output += ch;
      activeWord += ch;
      continue;
    }

    engine.trackRawKey(ch);
    const step = engine.processKey(activeWord, ch);
    if (step.transformed) {
      const deleteLen = activeWord.length;
      output = output.slice(0, output.length - deleteLen) + step.result;
      activeWord = step.result;
    } else {
      output += ch;
      activeWord += ch;
    }
  }

  // End of string boundary
  if (activeWord) {
    const restore = engine.checkAutoRestore(activeWord);
    if (restore && restore.restore) {
      const startIdx = output.length - activeWord.length;
      output = output.slice(0, startIdx) + restore.result;
    }
  }

  return output;
}

test('Mixed Corpus - Auto-Restore on English Technical Words in Sentences', () => {
  const engine = new AvimEngine({ method: IME_METHOD.AUTO, spellCheck: true });

  const testCorpus = [
    {
      input: 'Tôi cần kiểm tra file docs và export dữ liệu ra text',
      expected: 'Tôi cần kiểm tra file docs và export dữ liệu ra text'
    },
    {
      input: 'Hệ thống modern hỗ trợ variable và user profile',
      expected: 'Hệ thống modern hỗ trợ variable và user profile'
    },
    {
      input: 'Đang push code lên server và restore database',
      expected: 'Đang push code lên server và restore database'
    },
    {
      input: 'Tài liệu Docs và mixed content trên server',
      expected: 'Tài liệu Docs và mixed content trên server'
    },
    {
      input: 'Mixed content và Lowercase trong Uppercase',
      expected: 'Mixed content và Lowercase trong Uppercase'
    },
    {
      // Protect Vietnamese words 'rết' and 'tét' - they must NEVER auto-restore on Space
      input: 'Con rết bò qua miếng bánh tét vừa cắt',
      expected: 'Con rết bò qua miếng bánh tét vừa cắt'
    },
    {
      // Comprehensive mixed corpus with mixed case, camelCase, uppercase traps, dialects, and ethnic place names
      input: 'Khi Lập Trình Viên gõ mIxEd hoặc loWeRcAsE trong useState, hệ thống phải giữ nguyên mã nguồn. Các từ bẫy chữ hoa TEXT, USER, PUSH, WINDOW phải khôi phục thành CHỮ HOA, còn text, user, push, window thành chữ thường, và Text, User, Push, Window thành TitleCase. Thậm chí chuỗi loạn dòng như lUxUrY, mOdErN, vArIaBlE hoặc biến $mixed_CORPUS và path /usr/bin/env cũng không được biến dị thành chữ có dấu tiếng Việt lỗi. Từ địa phương quởn và địa danh Đắk Lắk, Krông Nô phải được bảo toàn chính xác.',
      expected: 'Khi Lập Trình Viên gõ mIxEd hoặc loWeRcAsE trong useState, hệ thống phải giữ nguyên mã nguồn. Các từ bẫy chữ hoa TEXT, USER, PUSH, WINDOW phải khôi phục thành CHỮ HOA, còn text, user, push, window thành chữ thường, và Text, User, Push, Window thành TitleCase. Thậm chí chuỗi loạn dòng như lUxUrY, mOdErN, vArIaBlE hoặc biến $mixed_CORPUS và path /usr/bin/env cũng không được biến dị thành chữ có dấu tiếng Việt lỗi. Từ địa phương quởn và địa danh Đắk Lắk, Krông Nô phải được bảo toàn chính xác.'
    }
  ];

  for (const { input, expected } of testCorpus) {
    const actual = simulateTypingSentence(engine, input);
    assert.equal(actual, expected, `Sentence failed: input "${input}" -> actual "${actual}"`);
  }
});

test('Mixed Corpus - Developer-Aware camelCase & PascalCase Transitions', () => {
  const engine = new AvimEngine({ method: IME_METHOD.AUTO, spellCheck: true });

  const devIdentifiers = [
    // [Typing keystrokes, Expected output]
    ['useState', 'useState'],
    ['isCamelCase', 'isCamelCase'],
    ['UserController', 'UserController'],
    ['AppProps', 'AppProps'],
    ['getComponentData', 'getComponentData'],
  ];

  for (const [typed, expected] of devIdentifiers) {
    engine.resetWordSession();
    let res = '';
    for (const c of typed) {
      engine.trackRawKey(c);
      res = engine.processKey(res, c).result;
    }
    assert.equal(res, expected, `Developer identifier failed: "${typed}" -> got "${res}"`);
  }
});

test('Mixed Corpus - Token-Scoped File Paths & Immediate Unlock', () => {
  // Test that typing relative/system paths is protected and immediately unlocks upon Space
  assert.equal(isUrlOrEmailOrCode('../path/to/folder'), true);
  assert.equal(isUrlOrEmailOrCode('./src/index.js'), true);
  assert.equal(isUrlOrEmailOrCode('/usr/bin/bash'), true);
  assert.equal(isUrlOrEmailOrCode('~/config'), true);

  // Normal words after space MUST NOT be locked
  assert.equal(isUrlOrEmailOrCode('Morden'), false);
  assert.equal(isUrlOrEmailOrCode('tieng'), false);
  assert.equal(isUrlOrEmailOrCode('viet'), false);
});

test('Mixed Corpus - vnchKey Rapid Tone Retype (dóc + s -> docs directly)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.AUTO, spellCheck: true });

  // 1. Typing d - o - c - s -> produces 'dóc'
  let cur = '';
  for (const c of 'docs') {
    engine.trackRawKey(c);
    cur = engine.processKey(cur, c).result;
  }
  assert.equal(cur, 'dóc');

  // 2. Typing 's' immediately second time -> vnchKey restores 'docs' without 3rd 's'
  cur = engine.processKey(cur, 's').result;
  assert.equal(cur, 'docs');

  // 3. Normal Vietnamese words toggle tone off and restore raw tone key (vnchKey: cá + s -> cas -> cass)
  let vnWord = '';
  for (const c of 'cas') {
    vnWord = engine.processKey(vnWord, c).result;
  }
  assert.equal(vnWord, 'cá');
  vnWord = engine.processKey(vnWord, 's').result;
  assert.equal(vnWord, 'cas');
  vnWord = engine.processKey(vnWord, 's').result;
  assert.equal(vnWord, 'cass');

  // 4. pas -> pá -> 2nd s restores pas -> 3rd s produces pass
  let pasWord = '';
  for (const c of 'pas') {
    pasWord = engine.processKey(pasWord, c).result;
  }
  assert.equal(pasWord, 'pá');
  pasWord = engine.processKey(pasWord, 's').result;
  assert.equal(pasWord, 'pas');
  pasWord = engine.processKey(pasWord, 's').result;
  assert.equal(pasWord, 'pass');
});

test('Mixed Corpus - Typing & Tone Placement Inside Quotation Marks', () => {
  const telexEngine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });

  // 1. Single quotation mark: 'chao + f -> 'chào
  assert.equal(telexEngine.processKey("'chao", 'f').result, "'chào");
  assert.equal(telexEngine.processKey("'chao", 's').result, "'cháo");
  assert.equal(telexEngine.processKey("'d", 'd').result, "'đ");

  // 2. Double quotation mark: "chao + f -> "chào
  assert.equal(telexEngine.processKey('"chao', 'f').result, '"chào');
  assert.equal(telexEngine.processKey('"chao', 's').result, '"cháo');
  assert.equal(telexEngine.processKey('"d', 'd').result, '"đ');

  // 3. Curly quotes: “chao” + f -> “chào”
  assert.equal(telexEngine.processKey('“chao”', 'f').result, '“chào”');
  assert.equal(telexEngine.processKey('‘chao’', 'f').result, '‘chào’');

  // 4. Angle quotes / Guillemets: «chao» + f -> «chào»
  assert.equal(telexEngine.processKey('«chao»', 'f').result, '«chào»');

  // 5. VNI Mode: "chao + 2 -> "chào
  const vniEngine = new AvimEngine({ method: IME_METHOD.VNI, spellCheck: true });
  assert.equal(vniEngine.processKey('"chao', '2').result, '"chào');
  assert.equal(vniEngine.processKey("'chao", '1').result, "'cháo");

  // 6. Central Highlands names internal apostrophe preserved
  assert.equal(telexEngine.processKey("M'gar", 'a').result, "M'gara");
});

test('Mixed Corpus - TitleCase & ALL CAPS Preservation during Auto-Restore', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });

  // 1. Mixed TitleCase and ALL CAPS
  assert.equal(engine.checkAutoRestore('Mĩed').result, 'Mixed');
  assert.equal(engine.checkAutoRestore('mĩed').result, 'mixed');
  assert.equal(engine.checkAutoRestore('MĨED').result, 'MIXED');

  // 2. Docs TitleCase and ALL CAPS
  assert.equal(engine.checkAutoRestore('Dóc').result, 'Docs');
  assert.equal(engine.checkAutoRestore('dóc').result, 'docs');
  assert.equal(engine.checkAutoRestore('DÓC').result, 'DOCS');

  // 3. User TitleCase and ALL CAPS
  assert.equal(engine.checkAutoRestore('Úer').result, 'User');
  assert.equal(engine.checkAutoRestore('úer').result, 'user');
  assert.equal(engine.checkAutoRestore('ÚER').result, 'USER');

  // 4. Modern TitleCase
  assert.equal(engine.checkAutoRestore('Modẻn').result, 'Modern');
  assert.equal(engine.checkAutoRestore('modẻn').result, 'modern');
  assert.equal(engine.checkAutoRestore('MODẺN').result, 'MODERN');

  // 5. Variable TitleCase
  assert.equal(engine.checkAutoRestore('Vaỉable').result, 'Variable');
  assert.equal(engine.checkAutoRestore('vaỉable').result, 'variable');
});

test('Mixed Corpus - Telex w Retype Breakout (low -> lơ + w -> low)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });

  // 1. Typing 'low': l - o - w -> lơ
  let cur = '';
  for (const c of 'low') {
    cur = engine.processKey(cur, c).result;
  }
  assert.equal(cur, 'lơ');

  // 2. Retyping 'w' second time breaks out to 'low' without looping back to 'lo'
  cur = engine.processKey(cur, 'w').result;
  assert.equal(cur, 'low');

  // 3. Retyping 'w' third time appends 'w' -> 'loww'
  cur = engine.processKey(cur, 'w').result;
  assert.equal(cur, 'loww');

  // 4. Similarly for 'how', 'cow', 'bow', 'flow'
  let curHow = '';
  for (const c of 'how') curHow = engine.processKey(curHow, c).result;
  assert.equal(curHow, 'hơ');
  curHow = engine.processKey(curHow, 'w').result;
  assert.equal(curHow, 'how');
});

test('Mixed Corpus - Lowercase / Uppercase Reversal & Retro-Rescue', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });

  // 1. Direct and cluster reversals for lowercase
  assert.equal(reverseVietnameseWord('lởecase'), 'lowercase');
  assert.equal(reverseVietnameseWord('Lởecase'), 'Lowercase');
  assert.equal(reverseVietnameseWord('lơercase'), 'lowercase');
  assert.equal(reverseVietnameseWord('Lơercase'), 'Lowercase');
  assert.equal(reverseVietnameseWord('lởe'), 'lower');
  assert.equal(reverseVietnameseWord('Lởe'), 'Lower');

  // 2. Reversals for uppercase
  assert.equal(reverseVietnameseWord('uppẻcase'), 'uppercase');
  assert.equal(reverseVietnameseWord('Uppẻcase'), 'Uppercase');
  assert.equal(reverseVietnameseWord('uppẻ'), 'upper');
  assert.equal(reverseVietnameseWord('Uppẻ'), 'Upper');

  // 3. Instant Retro-Rescue (revertCurrentWord)
  assert.equal(engine.revertCurrentWord('lởecase').result, 'lowercase');
  assert.equal(engine.revertCurrentWord('Lởecase').result, 'Lowercase');
  assert.equal(engine.revertCurrentWord('uppẻcase').result, 'uppercase');
  assert.equal(engine.revertCurrentWord('Uppẻcase').result, 'Uppercase');

  // 4. Power, Tower, Shower, Slower reversals
  assert.equal(reverseVietnameseWord('pởeful'), 'powerful');
  assert.equal(reverseVietnameseWord('Pởeful'), 'Powerful');
  assert.equal(reverseVietnameseWord('pởe'), 'power');
  assert.equal(reverseVietnameseWord('tởe'), 'tower');
});

test('Mixed Corpus - Extension & User Dictionary Auto-Restore', () => {
  // 1. Extension typed with spellCheck ON
  const engineOn = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });
  let typedOn = '';
  for (const c of 'extension') {
    engineOn.trackRawKey(c);
    typedOn = engineOn.processKey(typedOn, c).result;
  }
  assert.equal(engineOn.checkAutoRestore(typedOn).result, 'extension');

  // 2. Extension typed with spellCheck OFF
  const engineOff = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: false });
  let typedOff = '';
  for (const c of 'extension') {
    engineOff.trackRawKey(c);
    typedOff = engineOff.processKey(typedOff, c).result;
  }
  // Late circumflex on stop final 't' with ngã tone is blocked by phonology guard
  assert.equal(typedOff, 'ẽtension');
  assert.equal(engineOff.checkAutoRestore(typedOff).result, 'extension');

  // 3. Fallback traps for ễtnsion / Ễtnsion
  assert.equal(engineOff.checkAutoRestore('ễtnsion').result, 'extension');
  assert.equal(engineOff.checkAutoRestore('Ễtnsion').result, 'Extension');

  // 4. Custom user dictionary word auto-restore
  userDictionary.add('customdevterm');
  let typedUser = '';
  for (const c of 'customdevterm') {
    engineOff.trackRawKey(c);
    typedUser = engineOff.processKey(typedUser, c).result;
  }
  assert.equal(engineOff.checkAutoRestore(typedUser).result, 'customdevterm');
});

test('Mixed Corpus - Telex Cancellation Keystrokes & Pure ASCII English Words Preservation', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, autoRestoreEnglish: true, spellCheck: false });

  // 1. Typing 'test' via Telex: t -> e -> s (té) -> s (tes) -> t (test) -> Space
  const resTest = simulateTypingSentence(engine, 'npm run tesst ');
  assert.equal(resTest, 'npm run test ', `Expected "npm run test ", got "${resTest}"`);

  // 2. Typing 'pass' via Telex: p -> a -> s (pá) -> s (pas) -> s (pass) -> Space
  const resPass = simulateTypingSentence(engine, 'passs ');
  assert.equal(resPass, 'pass ', `Expected "pass ", got "${resPass}"`);

  // 3. Typing 'cast' via Telex: c -> a -> s (cá) -> s (cas) -> t (cast) -> Space
  const resCast = simulateTypingSentence(engine, 'casst ');
  assert.equal(resCast, 'cast ', `Expected "cast ", got "${resCast}"`);

  // 4. Typing 'cost' via Telex: c -> o -> s (có) -> s (cos) -> t (cost) -> Space
  const resCost = simulateTypingSentence(engine, 'cosst ');
  assert.equal(resCost, 'cost ', `Expected "cost ", got "${resCost}"`);

  // 5. Typing 'best' via Telex: b -> e -> s (bé) -> s (bes) -> t (best) -> Space
  const resBest = simulateTypingSentence(engine, 'besst ');
  assert.equal(resBest, 'best ', `Expected "best ", got "${resBest}"`);

  // 6. Typing 'fast' directly (foreign onset 'f' naturally bypasses Telex tones): fast + Space -> fast
  const resFast = simulateTypingSentence(engine, 'fast ');
  assert.equal(resFast, 'fast ', `Expected "fast ", got "${resFast}"`);

  // 7. Typing Vietnamese 'tét' (bánh tét): b-á-n-h t-e-t-s + Space -> bánh tét
  const resTet = simulateTypingSentence(engine, 'bánh tets ');
  assert.equal(resTet, 'bánh tét ', `Expected "bánh tét ", got "${resTet}"`);
});

test('Auto-Capitalization - File Extensions, Paths, Code Tokens, and Sentence Boundaries', () => {
  // Logic mirror of shouldAutoCapitalize in src/content/content.js
  function testShouldAutoCapitalize(textBefore) {
    if (/`/.test(textBefore)) {
      if (/`\s*$/.test(textBefore)) return false;
      const strippedClosed = textBefore.replace(/`[^`\n\r]*`/g, '');
      if (strippedClosed.includes('`')) return false;
      if (/`[^`\n\r]*`\s*$/.test(textBefore)) return false;
    }

    if (/([\/\\#@\$~]|\-\-)$/.test(textBefore)) {
      return false;
    }

    let context = textBefore;
    const quoteMatch = context.match(/([\x22\x27\u2018\u201C\u00AB\u2039\u201E\u201A]+)$/);
    if (quoteMatch) {
      context = context.slice(0, -quoteMatch[1].length);
      if (/:(\s*)$/.test(context)) return true;
    }

    if (!context || context.trim().length === 0) return true;
    if (/[\n\r]\s*$/.test(context)) return true;

    const match = context.match(/([.!?])(\s+)$/);
    if (match) {
      const trimmed = context.slice(0, -match[0].length).trim().toLowerCase();
      const lastWordMatch = trimmed.match(/([\p{L}\p{N}_.]+)$/iu);
      if (lastWordMatch) {
        const lastWord = lastWordMatch[1];
        const ABBRS = new Set([
          'v.v', 'tp', 'ts', 'ths', 'gs', 'mr', 'mrs', 'ms', 'dr', 'e.g', 'i.e', 'etc',
          'bs', 'th', 'vs', 'co', 'ltd', 'inc', 'corp', 'no', 'op', 'cit'
        ]);
        if (ABBRS.has(lastWord)) return false;
      }
      return true;
    }

    return false;
  }

  // 1. File extensions (e.g. typing 's' right after 'src/assets/icon.')
  assert.equal(testShouldAutoCapitalize('src/assets/icon.'), false);
  assert.equal(testShouldAutoCapitalize('icon.'), false);
  assert.equal(testShouldAutoCapitalize('document.'), false);
  assert.equal(testShouldAutoCapitalize('192.168.1.'), false);
  assert.equal(testShouldAutoCapitalize('version3.'), false);

  // 2. Path separators and code symbols
  assert.equal(testShouldAutoCapitalize('src/'), false);
  assert.equal(testShouldAutoCapitalize('C:\\'), false);
  assert.equal(testShouldAutoCapitalize('git@'), false);
  assert.equal(testShouldAutoCapitalize('#'), false);
  assert.equal(testShouldAutoCapitalize('$'), false);
  assert.equal(testShouldAutoCapitalize('--'), false);

  // 3. Normal sentence boundaries followed by space MUST capitalize
  assert.equal(testShouldAutoCapitalize(''), true);
  assert.equal(testShouldAutoCapitalize('   '), true);
  assert.equal(testShouldAutoCapitalize('Hôm nay trời đẹp. '), true);
  assert.equal(testShouldAutoCapitalize('Xin chào! '), true);
  assert.equal(testShouldAutoCapitalize('Bạn khỏe không? '), true);
  assert.equal(testShouldAutoCapitalize('Dòng mới:\n'), true);

  // 4. Sentences legitimately ending in a file path followed by dot and space MUST capitalize next sentence
  assert.equal(testShouldAutoCapitalize('Xem chi tiết tại icon.svg. '), true);
  assert.equal(testShouldAutoCapitalize('Vui lòng kiểm tra file src/assets/icon.svg. '), true);

  // 5. Common abbreviations followed by dot and space MUST NOT capitalize
  assert.equal(testShouldAutoCapitalize('Danh sách gồm cam, táo, v.v. '), false);
  assert.equal(testShouldAutoCapitalize('Báo cáo gửi về tp. '), false);
  assert.equal(testShouldAutoCapitalize('Gặp bs. '), false);
  assert.equal(testShouldAutoCapitalize('Công ty cổ phần ABC ltd. '), false);
});

test('User Dictionary Whitelist with SpellCheck ON - Allows informal / slang syllables', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });

  // 1. Without userDictionary, informal slang 'rùi' and 'ẹc' are rejected by Hunspell spellCheck
  let w1 = '';
  for (const c of 'ruif') {
    const step = engine.processKey(w1, c);
    w1 = step.transformed ? step.result : w1 + c;
  }
  assert.equal(w1, 'ruif', 'Without whitelist, ruif must not form rùi');

  let w2 = '';
  for (const c of 'ecj') {
    const step = engine.processKey(w2, c);
    w2 = step.transformed ? step.result : w2 + c;
  }
  assert.equal(w2, 'ecj', 'Without whitelist, ecj must not form ẹc');

  // 2. Add 'rùi' and 'ẹc' into userDictionary
  userDictionary.add('rùi');
  userDictionary.add('ẹc');

  // 3. Now typing 'ruif' and 'ecj' with spellCheck ON must succeed!
  let resRui = '';
  for (const c of 'ruif') {
    const step = engine.processKey(resRui, c);
    resRui = step.transformed ? step.result : resRui + c;
  }
  assert.equal(resRui, 'rùi', 'With userDictionary whitelist, ruif must transform into rùi');

  let resEc = '';
  for (const c of 'ecj') {
    const step = engine.processKey(resEc, c);
    resEc = step.transformed ? step.result : resEc + c;
  }
  assert.equal(resEc, 'ẹc', 'With userDictionary whitelist, ecj must transform into ẹc');

  // 4. Test VNI mode as well (rui2 -> rùi, ec5 -> ẹc)
  const vniEngine = new AvimEngine({ method: IME_METHOD.VNI, spellCheck: true });
  let resVniRui = '';
  for (const c of 'rui2') {
    const step = vniEngine.processKey(resVniRui, c);
    resVniRui = step.transformed ? step.result : resVniRui + c;
  }
  assert.equal(resVniRui, 'rùi', 'With userDictionary whitelist, VNI rui2 must transform into rùi');

  let resVniEc = '';
  for (const c of 'ec5') {
    const step = vniEngine.processKey(resVniEc, c);
    resVniEc = step.transformed ? step.result : resVniEc + c;
  }
  assert.equal(resVniEc, 'ẹc', 'With userDictionary whitelist, VNI ec5 must transform into ẹc');
});







