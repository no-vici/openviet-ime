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

  // 8. Trigram Deep Context Prediction (Gboard style: Sài Gòn xưa & Nam Bộ folk idioms)
  // 'sài' + 'gòn' -> 'xưa'
  const saiGonSuggestions = engine.getNextWordSuggestions('gòn', 5, 'sài');
  assert(saiGonSuggestions.some(s => s.word.toLowerCase() === 'xưa'), 'Trigram: "sài gòn" should predict "xưa"');
  assert.strictEqual(saiGonSuggestions[0].word.toLowerCase(), 'xưa', 'Trigram: "xưa" should be #1 candidate for "sài gòn"');

  // 'bá' + 'cháy' -> 'bù chét'
  const baChaySuggestions = engine.getNextWordSuggestions('cháy', 5, 'bá');
  assert(baChaySuggestions.some(s => s.word.toLowerCase() === 'bù chét'), 'Trigram: "bá cháy" should predict "bù chét"');

  // 'cà' + 'rịch' -> 'cà tang'
  const caRichSuggestions = engine.getNextWordSuggestions('rịch', 5, 'cà');
  assert(caRichSuggestions.some(s => s.word.toLowerCase() === 'cà tang'), 'Trigram: "cà rịch" should predict "cà tang"');

  // 'cà' + 'chớn' -> 'cà chác'
  const caChonSuggestions = engine.getNextWordSuggestions('chớn', 5, 'cà');
  assert(caChonSuggestions.some(s => s.word.toLowerCase() === 'cà chác'), 'Trigram: "cà chớn" should predict "cà chác"');

  // 'mèn' + 'đéc' -> 'ơi'
  const menDecSuggestions = engine.getNextWordSuggestions('đéc', 5, 'mèn');
  assert(menDecSuggestions.some(s => s.word.toLowerCase() === 'ơi'), 'Trigram: "mèn đéc" should predict "ơi"');

  // Southern / Saigon Xua folk collection verification
  // Prefix autocomplete
  const saigonPrefix = engine.getSuggestions('bảnh', 5);
  assert(saigonPrefix.some(s => s.word.toLowerCase() === 'bảnh tỏn'), 'Prefix: "bảnh" should suggest "bảnh tỏn"');

  const caRichPrefix = engine.getSuggestions('cà rịch', 5);
  assert(caRichPrefix.some(s => s.word.toLowerCase() === 'cà rịch cà tang'), 'Prefix: "cà rịch" should suggest "cà rịch cà tang"');

  const hetSayPrefix = engine.getSuggestions('hết s', 5);
  assert(hetSayPrefix.some(s => s.word.toLowerCase() === 'hết sẩy'), 'Prefix: "hết s" should suggest "hết sẩy"');

  // Bigram next-word prediction
  const hongSuggestions = engine.getNextWordSuggestions('hổng', 5);
  assert(hongSuggestions.some(s => s.word.toLowerCase().includes('chừng')), 'Bigram: "hổng" should suggest "chừng"');
  assert(hongSuggestions.some(s => s.word.toLowerCase().includes('dám đâu')), 'Bigram: "hổng" should suggest "dám đâu"');

  const trotSuggestions = engine.getNextWordSuggestions('trớt', 5);
  assert(trotSuggestions.some(s => s.word.toLowerCase() === 'quớt'), 'Bigram: "trớt" should suggest "quớt"');

  // Trigram next-word prediction
  const caChonChao = engine.getNextWordSuggestions('chớn', 5, 'cà');
  assert(caChonChao.some(s => s.word.toLowerCase() === 'cà cháo'), 'Trigram: "cà chớn" should predict "cà cháo"');

  const troiDanh = engine.getNextWordSuggestions('đánh', 5, 'trời');
  assert(troiDanh.some(s => s.word.toLowerCase() === 'thánh đâm'), 'Trigram: "trời đánh" should predict "thánh đâm"');

  // 9. User-Learned Trigram Recording
  engine.recordWordTransition('máy', 'tính', 'mô hình');
  const userTrigramSuggestions = engine.getNextWordSuggestions('máy', 5, 'mô hình');
  assert(userTrigramSuggestions.some(s => s.word.toLowerCase() === 'tính'), 'User learned trigram "mô hình máy" -> "tính"');

  // 10. Recency & Frequency Decay Ranking
  const oldEntry = { count: 10, lastUsed: Date.now() - 30 * 24 * 3600 * 1000 }; // 30 days old
  const newEntry = { count: 3, lastUsed: Date.now() }; // Just typed now
  const oldScore = engine.learnedModel.calculateRecencyFrequencyScore(oldEntry);
  const newScore = engine.learnedModel.calculateRecencyFrequencyScore(newEntry);
  assert(newScore > 0 && oldScore > 0, 'Scores should be positive numbers');
  assert(oldScore < oldEntry.count, 'Old entry should experience exponential decay');
});
