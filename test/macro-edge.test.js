import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MacroEngine, DEFAULT_MACROS } from '../src/engine/macro.js';

test('Macro casing: vn -> Việt Nam, VN -> VIỆT NAM, Vn -> Việt Nam', () => {
  const engine = new MacroEngine(DEFAULT_MACROS, { enabled: true, autoUndo: true });
  assert.equal(engine.checkExpansion('vn', ' ').expandedText, 'Việt Nam');
  assert.equal(engine.checkExpansion('VN', ' ').expandedText, 'VIỆT NAM');
  assert.equal(engine.checkExpansion('Vn', ' ').expandedText, 'Việt Nam');
});

test('Macro suppression after 2-step undo', () => {
  const engine = new MacroEngine(DEFAULT_MACROS, { enabled: true, autoUndo: true });
  engine.checkExpansion('vn', ' ');
  const u1 = engine.checkUndo('Việt Nam ');
  assert.equal(u1.undo, true);
  assert.equal(u1.step, 1);
  const u2 = engine.checkUndo('Việt Nam');
  assert.equal(u2.undo, true);
  assert.equal(u2.step, 2);
  const res = engine.checkExpansion('vn', ' ');
  assert.equal(res.match, false);
  assert.equal(res.suppressed, true);
});

test('Macro punctuation snap after space expansion', () => {
  const engine = new MacroEngine(DEFAULT_MACROS, { enabled: true, autoUndo: true });
  engine.checkExpansion('vn', ' ');
  const snap = engine.checkPunctuationSnap('.', 'Việt Nam ');
  assert.equal(snap.snap, true);
  assert.equal(snap.deleteLength, 1);
  assert.equal(snap.snappedChar, '.');
});
