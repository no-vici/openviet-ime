import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autoCompleteEngine } from '../src/engine/autocomplete.js';

test('Autocomplete: empty prefix returns no suggestions', () => {
  const res = autoCompleteEngine.getSuggestions('', 5);
  assert.ok(Array.isArray(res));
  assert.equal(res.length, 0);
});

test('Autocomplete: ngh prefix returns suggestions starting with ngh', () => {
  const res = autoCompleteEngine.getSuggestions('ngh', 5);
  assert.ok(res.length > 0);
  assert.ok(res.every(item => String(item.word).toLowerCase().startsWith('ngh')));
});

test('Autocomplete: next-word after Việt includes Nam', () => {
  const res = autoCompleteEngine.getNextWordSuggestions('Việt', 5);
  const words = res.map(item => item.word);
  assert.ok(words.includes('Nam'));
});
