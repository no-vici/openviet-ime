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




