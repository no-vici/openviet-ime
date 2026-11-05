/**
 * Macro Engine Test Suite
 * Tests for macro lookup, case preservation, Backspace undo, and import/export.
 */

import { MacroEngine } from '../src/engine/macro.js';

export function runMacroTests() {
  const results = [];

  function assert(name, condition, expected, actual) {
    results.push({
      suite: 'Macro Expansion Engine',
      name,
      passed: Boolean(condition),
      expected: String(expected),
      actual: String(actual)
    });
  }

  const engine = new MacroEngine([
    { trigger: 'vn', value: 'Việt Nam', enabled: true },
    { trigger: 'hn', value: 'Hà Nội', enabled: true },
    { trigger: 'dc', value: 'được', enabled: true },
    { trigger: 'ko', value: 'không', enabled: true },
    { trigger: 'off', value: 'disabled trigger', enabled: false }
  ]);

  // 1. Basic expansion
  const res1 = engine.checkExpansion('vn', ' ');
  assert('Basic space delimiter: vn + " " -> Việt Nam', res1.match && res1.expandedText === 'Việt Nam', 'Việt Nam', res1.expandedText);

  const resDot = engine.checkExpansion('hn', '.');
  assert('Punctuation delimiter: hn + "." -> Hà Nội', resDot.match && resDot.expandedText === 'Hà Nội', 'Hà Nội', resDot.expandedText);

  // 2. Case preservation: Lowercase, Capitalized, UPPERCASE
  const resUpper = engine.checkExpansion('VN', ' ');
  assert('Case preservation UPPERCASE: VN -> VIỆT NAM', resUpper.expandedText === 'VIỆT NAM', 'VIỆT NAM', resUpper.expandedText);

  const resCap = engine.checkExpansion('Vn', ' ');
  assert('Case preservation Capitalized: Vn -> Việt Nam', resCap.expandedText === 'Việt Nam', 'Việt Nam', resCap.expandedText);

  const resDcCap = engine.checkExpansion('Dc', ' ');
  assert('Case preservation Capitalized: Dc -> Được', resDcCap.expandedText === 'Được', 'Được', resDcCap.expandedText);

  const resDcUpper = engine.checkExpansion('DC', ' ');
  assert('Case preservation UPPERCASE: DC -> ĐƯỢC', resDcUpper.expandedText === 'ĐƯỢC', 'ĐƯỢC', resDcUpper.expandedText);

  // 3. Disabled macro check
  const resDisabled = engine.checkExpansion('off', ' ');
  assert('Disabled macro should not expand', resDisabled.match === false, 'false', String(resDisabled.match));

  // 4. Backtracking / Backspace Undo
  // After expanding 'vn' with ' ' -> expected text suffix is 'Việt Nam '
  const expansion = engine.checkExpansion('vn', ' ');
  const recentText = 'Tôi yêu Việt Nam không cộng sản ';
  const undoResult = engine.checkUndo(recentText);
  assert('Backspace Undo immediately after expansion reverts to raw trigger', undoResult.undo && undoResult.rawTrigger === 'vn', 'vn', undoResult.rawTrigger);

  // 5. JSON Export & Import roundtrip
  const jsonExport = engine.exportJSON();
  const newEngine = new MacroEngine();
  const importJsonRes = newEngine.importJSON(jsonExport);
  assert('JSON import/export integrity', importJsonRes.success && newEngine.getMacros().length === 5, '5 macros', `${newEngine.getMacros().length} macros`);

  // 6. CSV Export & Import roundtrip
  const csvExport = engine.exportCSV();
  const csvEngine = new MacroEngine();
  const importCsvRes = csvEngine.importCSV(csvExport);
  assert('CSV import/export integrity', importCsvRes.success && csvEngine.getMacros().length === 5, '5 macros', `${csvEngine.getMacros().length} macros`);

  return results;
}
