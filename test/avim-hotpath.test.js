import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';

test('auto-restore reverse fallback returns the reversed English word, not an undefined local', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, autoRestoreEnglish: true });
  engine.currentWordRaw = 'uu';

  const result = engine.checkAutoRestore('úe');

  assert.deepEqual(result, { restore: true, result: 'use' });
});

test('auto-restore disabled still resets the word session', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, autoRestoreEnglish: false });
  engine.trackRawKey('a');
  engine.trackRawKey('b');

  assert.equal(engine.inspectState().currentWordRaw, 'ab');
  assert.deepEqual(engine.checkAutoRestore('ab'), { restore: false, result: 'ab' });
  assert.equal(engine.inspectState().currentWordRaw, '');
});
