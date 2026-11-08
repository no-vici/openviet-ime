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
      // Protect Vietnamese words 'rết' and 'tét' - they must NEVER auto-restore on Space
      input: 'Con rết bò qua miếng bánh tét vừa cắt',
      expected: 'Con rết bò qua miếng bánh tét vừa cắt'
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

  // 3. Normal Vietnamese words still toggle off cleanly (cá + s -> ca)
  let vnWord = '';
  for (const c of 'cas') {
    vnWord = engine.processKey(vnWord, c).result;
  }
  assert.equal(vnWord, 'cá');
  vnWord = engine.processKey(vnWord, 's').result;
  assert.equal(vnWord, 'ca');
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


