import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUrlOrEmailOrCode, isImeCompositionEvent, isDelimiter } from '../src/engine/key-codes.js';

test('URL/code guard: https URL is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('https://example.com/path'), true);
});

test('URL/code guard: email is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('user@example.com'), true);
});

test('URL/code guard: snake_case is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('user_name'), true);
});

test('URL/code guard: kebab-case is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('btn-primary'), true);
});

test('URL/code guard: dot property access is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('console.log'), true);
});

test('URL/code guard: camelCase identifier is guarded', () => {
  assert.equal(isUrlOrEmailOrCode('useState'), true);
});

test('URL/code guard: normal Vietnamese word is not guarded', () => {
  assert.equal(isUrlOrEmailOrCode('tieng'), false);
});

test('context guards: typing, OS IME composition and Vietnamese punctuation', () => {
  assert.equal(isUrlOrEmailOrCode('viet', 'viet', 'n'), false);

  // docs/references/dau_phay_trong_tv_7378.pdf lists dấu chấm lửng (…) and
  // dấu ngang (–) among Vietnamese punctuation; both must commit the word.
  assert.equal(isDelimiter('…'), true);
  assert.equal(isDelimiter('–'), true);
  assert.equal(isDelimiter('—'), true);
  assert.equal(isDelimiter('→'), false);

  // MDN: isComposing covers most browsers; keyCode 229 covers Firefox edges.
  assert.equal(isImeCompositionEvent({ isComposing: true }), true);
  assert.equal(isImeCompositionEvent({ keyCode: 229 }), true);
  assert.equal(isImeCompositionEvent({ isComposing: false, keyCode: 229 }), true);

  // Plain Telex keystrokes (and synthetic Playwright events) must pass through.
  assert.equal(isImeCompositionEvent({ isComposing: false, keyCode: 83, key: 's' }), false);
  assert.equal(isImeCompositionEvent({}), false);
  assert.equal(isImeCompositionEvent(null), false);
});
