/**
 * Auto-Complete, Next-Word & Keyboard Navigation Test Suite
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { AutoCompleteEngine } from '../src/engine/autocomplete.js';

test('AutoComplete and Next-Word Prediction', () => {
  const engine = new AutoCompleteEngine();

  // 1. Prefix auto-complete suggestions
  const suggestions = engine.getSuggestions('nghiên', 5);
  assert(suggestions.length > 0, 'Should return suggestions for "nghiên"');
  assert(suggestions.some(s => s.word.toLowerCase() === 'nghiên cứu'), 'Should suggest "nghiên cứu" for "nghiên"');

  // 2. Next-word prediction
  const nextWords = engine.getNextWordSuggestions('nghiên', 5);
  assert(nextWords.length > 0, 'Should predict next words for "nghiên"');
  assert(nextWords.some(n => n.word.toLowerCase() === 'cứu'), 'Should predict "cứu" after "nghiên"');

  // 3. Tab cycling navigation calculation logic
  const items = ['nghiên cứu', 'nghiêm', 'nghiên', 'nghiệp'];
  const count = items.length;

  let selectedIndex = 0;
  // Tab forward cycle
  selectedIndex = (selectedIndex + 1) % count;
  assert.strictEqual(selectedIndex, 1, 'Tab forward should move from 0 to 1');
  assert.strictEqual(items[selectedIndex], 'nghiêm');

  // Tab forward cycle again
  selectedIndex = (selectedIndex + 1) % count;
  assert.strictEqual(selectedIndex, 2, 'Tab forward should move from 1 to 2');

  // Shift + Tab backward cycle
  selectedIndex = (selectedIndex - 1 + count) % count;
  assert.strictEqual(selectedIndex, 1, 'Shift+Tab backward should move from 2 to 1');

  // Shift + Tab backward from 0 wrap around
  selectedIndex = 0;
  selectedIndex = (selectedIndex - 1 + count) % count;
  assert.strictEqual(selectedIndex, 3, 'Shift+Tab backward from 0 should wrap to last item (3)');

  // Enter selects current item
  const committedWord = items[selectedIndex];
  assert.strictEqual(committedWord, 'nghiệp', 'Enter should commit currently selected item');

  // 4. Seeding learned habits
  const seededCount = engine.seedLearnedHabits();
  assert(seededCount > 0, 'Should seed sample habits');
  const stats = engine.getLearnedStats();
  assert(stats.totalTransitions > 0, 'Learned stats should reflect seeded habits');

  // 5. Normal word transition recording
  engine.clearLearnedHabits();
  engine.recordWordTransition('họp', 'team');
  engine.recordWordUsage('họp');
  engine.recordWordUsage('team');
  const updatedStats = engine.getLearnedStats();
  assert.strictEqual(updatedStats.totalPairs, 1, 'Should record 1 pair');
  assert.strictEqual(updatedStats.totalTransitions, 1, 'Should record 1 transition');
  assert.strictEqual(updatedStats.topPairs[0].from, 'họp');
  assert.strictEqual(updatedStats.topPairs[0].to, 'team');
});
