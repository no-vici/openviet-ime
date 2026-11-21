import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractWordBeforeOffset, TextReplacer } from '../src/content/text-replacer.js';

test('word boundary keeps NFD combining tone marks inside the word', () => {
  const text = 'đo\u0301';
  assert.deepEqual(extractWordBeforeOffset(text, text.length), {
    word: 'đo\u0301',
    startIndex: 0,
    endIndex: text.length
  });
});

test('word boundary ignores trailing editor zero-width markers', () => {
  const text = 'đồ\u200B';
  assert.deepEqual(extractWordBeforeOffset(text, text.length), {
    word: 'đồ',
    startIndex: 0,
    endIndex: 2
  });
});

test('word boundary preserves Central Highlands internal apostrophes', () => {
  const text = "M'Đrắk";
  assert.equal(extractWordBeforeOffset(text, text.length).word, "M'Đrắk");
});

test('word boundary strips a leading opening quote but keeps it in the document range', () => {
  const text = "'chào";
  assert.deepEqual(extractWordBeforeOffset(text, text.length), {
    word: 'chào',
    startIndex: 1,
    endIndex: text.length
  });
});

test('native input extraction uses the same mark/zero-width-safe boundary', () => {
  const replacer = new TextReplacer();
  const value = 'xin đồ\u200B';
  const fakeInput = { value, selectionStart: value.length };
  assert.deepEqual(replacer.extractNativeWordBuffer(fakeInput), {
    word: 'đồ',
    startIndex: 4,
    endIndex: 6
  });
});
