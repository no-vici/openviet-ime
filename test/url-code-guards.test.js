import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUrlOrEmailOrCode } from '../src/engine/key-codes.js';

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

test('URL/code guard: normal word with next key still not guarded', () => {
  assert.equal(isUrlOrEmailOrCode('viet', 'viet', 'n'), false);
});
