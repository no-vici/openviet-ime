import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';
import { MacroEngine, DEFAULT_MACROS } from '../src/engine/macro.js';

test('VNI: 0 removes tone (toán + 0 -> toan)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.VNI, toneStyle: 'classic' });
  assert.equal(engine.processKey('toán', '0').result, 'toan');
});

test('VNI: 9 toggles đ (d + 9 -> đ)', () => {
  const engine = new AvimEngine({ method: IME_METHOD.VNI, toneStyle: 'classic' });
  assert.equal(engine.processKey('d', '9').result, 'đ');
});

test('Macro variables: $DATE format DD/MM/YYYY', () => {
  const engine = new MacroEngine([{ trigger: 'd', value: '$DATE', enabled: true }], { enabled: true, autoUndo: true });
  const res = engine.checkExpansion('d', ' ');
  assert.match(res.expandedText, /^\d{2}\/\d{2}\/\d{4}$/);
});

test('Macro variables: $TIME format HH:mm', () => {
  const engine = new MacroEngine([{ trigger: 't', value: '$TIME', enabled: true }], { enabled: true, autoUndo: true });
  const res = engine.checkExpansion('t', ' ');
  assert.match(res.expandedText, /^\d{2}:\d{2}$/);
});

test('Macro variables: $YEAR is 4 digits', () => {
  const engine = new MacroEngine([{ trigger: 'y', value: '$YEAR', enabled: true }], { enabled: true, autoUndo: true });
  const res = engine.checkExpansion('y', ' ');
  assert.match(res.expandedText, /^\d{4}$/);
});

test('Macro variables: $DATETIME combines date and time', () => {
  const engine = new MacroEngine([{ trigger: 'dt', value: '$DATETIME', enabled: true }], { enabled: true, autoUndo: true });
  const res = engine.checkExpansion('dt', ' ');
  assert.match(res.expandedText, /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
});
