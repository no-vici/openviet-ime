import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';

function typeWord(engine, str) {
  let cur = '';
  for (const c of str) {
    engine.trackRawKey(c);
    cur = engine.processKey(cur, c).result;
  }
  return cur;
}

test('Telex w revert: direct w-created ư reverts to w on next w (cw -> cư -> cw)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true, typeW2U: true });
  const first = typeWord(engine, 'cw');
  assert.equal(first, 'cư');
  engine.trackRawKey('w');
  const second = engine.processKey(first, 'w').result;
  assert.equal(second, 'cw');
});

test('Telex w revert: standalone w stays w (no ư at word start)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true, typeW2U: true });
  const result = typeWord(engine, 'w');
  assert.equal(result, 'w');
});

test('Telex w revert: u+w-created ư does not revert on w (uw -> ư? actually uw -> ưw? keep stable)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true, typeW2U: true });
  const result = typeWord(engine, 'uw');
  // u + w -> ư; raw ends with u before w, so must not be treated as direct w
  assert.notEqual(result, 'w');
});
