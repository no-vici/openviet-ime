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

  // 6. Export / Import JSON & CSV
  const jsonExport = engine.exportLearnedJSON();
  assert(jsonExport.includes('họp') && jsonExport.includes('team'), 'JSON export should contain learned pair');

  const csvExport = engine.exportLearnedCSV();
  assert(csvExport.includes('Tu_bat_dau') && csvExport.includes('họp') && csvExport.includes('team'), 'CSV export should format valid CSV');

  // Clear and re-import via JSON
  engine.clearLearnedHabits();
  assert.strictEqual(engine.getLearnedStats().totalPairs, 0, 'Should be empty after clear');
  const importRes = engine.importLearnedData(jsonExport, true);
  assert.strictEqual(importRes.success, true, 'Import JSON should succeed');
  assert.strictEqual(engine.getLearnedStats().totalPairs, 1, 'Should restore pair from JSON');

  // Import extra pairs via CSV
  const extraCsv = 'chuyển,khoản,10\ngửi,email,5';
  const csvImportRes = engine.importLearnedData(extraCsv, true);
  assert.strictEqual(csvImportRes.success, true, 'Import CSV should succeed');
  assert.strictEqual(engine.getLearnedStats().totalPairs, 3, 'Should merge extra pairs');

  // 7. Central Highlands & Rare words place name suggestions
  const dakSuggestions = engine.getNextWordSuggestions('Đắk', 5);
  assert(dakSuggestions.some(s => s.word.toLowerCase() === 'lắk'), 'Should suggest "Lắk" after "Đắk"');
  assert(dakSuggestions.some(s => s.word.toLowerCase() === 'nông'), 'Should suggest "Nông" after "Đắk"');

  const buonSuggestions = engine.getNextWordSuggestions('Buôn', 5);
  assert(buonSuggestions.some(s => s.word.toLowerCase().includes('thuột')), 'Should suggest "Ma Thuột" after "Buôn"');

  const krongSuggestions = engine.getNextWordSuggestions('Krông', 5);
  assert(krongSuggestions.some(s => s.word.toLowerCase() === 'nô'), 'Should suggest "Nô" after "Krông"');
  assert(krongSuggestions.some(s => s.word.toLowerCase() === 'pắk'), 'Should suggest "Pắk" after "Krông"');
});
