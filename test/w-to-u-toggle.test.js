import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';
import { DEFAULT_SETTINGS } from '../src/engine/config.js';

function typeSequence(engine, sequence) {
  let word = '';
  for (const key of sequence) {
    engine.trackRawKey(key);
    word = engine.processKey(word, key).result;
  }
  return word;
}

test('wToUEnabled default preserves Non-Start behavior', () => {
  assert.equal(DEFAULT_SETTINGS.wToUEnabled, true);
  assert.equal(DEFAULT_SETTINGS.typeW2U, true);

  const engine = new AvimEngine({ method: IME_METHOD.TELEX });
  assert.equal(engine.processKey('', 'w').result, 'w');
  assert.equal(engine.processKey('th', 'w').result, 'thư');
  assert.equal(typeSequence(engine, 'web'), 'web');
  assert.equal(typeSequence(engine, 'sway'), 'sưay');
});

test('wToUEnabled=false keeps every Telex w literal', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, wToUEnabled: false });

  assert.equal(engine.processKey('', 'w').result, 'w');
  assert.equal(engine.processKey('th', 'w').result, 'thw');
  assert.equal(typeSequence(engine, 'uow'), 'uow');
  assert.equal(typeSequence(engine, 'sway'), 'sway');
  assert.equal(typeSequence(engine, 'web'), 'web');
});

test('setWToUEnabled(false) can be toggled at runtime', () => {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX });
  assert.equal(engine.processKey('th', 'w').result, 'thư');

  engine.setWToUEnabled(false);
  assert.equal(engine.processKey('th', 'w').result, 'thw');

  engine.setWToUEnabled(true);
  assert.equal(engine.processKey('th', 'w').result, 'thư');
});
