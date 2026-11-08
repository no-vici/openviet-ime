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

  // 4. 2-Step Backspace Undo:
  // After expanding 'vn' with ' ' -> expected text suffix is 'Việt Nam '
  const expansion = engine.checkExpansion('vn', ' ');
  const recentText = 'Tôi yêu Việt Nam ';
  
  // Step 1: 1st Backspace deletes trailing space only
  const undoStep1 = engine.checkUndo(recentText);
  assert('2-Step Undo - Step 1: removes trailing space', undoStep1.undo && undoStep1.step === 1 && undoStep1.removeLength === 1, 'step 1, len 1', `step ${undoStep1.step}, len ${undoStep1.removeLength}`);

  // Step 2: 2nd Backspace deletes full expanded text and restores raw trigger 'vn'
  const textAfterStep1 = 'Tôi yêu Việt Nam';
  const undoStep2 = engine.checkUndo(textAfterStep1);
  assert('2-Step Undo - Step 2: restores raw trigger "vn"', undoStep2.undo && undoStep2.step === 2 && undoStep2.rawTrigger === 'vn' && undoStep2.removeLength === 'Việt Nam'.length, 'step 2, vn', `step ${undoStep2.step}, ${undoStep2.rawTrigger}`);

  // 4b. Macro Undo Loop Suppression (prevent infinite expansion loop when hitting Space after undo)
  const reExpandSuppressed = engine.checkExpansion('vn', ' ');
  assert('Space after Backspace undo must suppress re-expansion', reExpandSuppressed.match === false && reExpandSuppressed.suppressed === true, 'false (suppressed)', String(reExpandSuppressed.match));

  // Next space expands normally
  const normalAfterSuppressed = engine.checkExpansion('vn', ' ');
  assert('Subsequent expansion after suppression works normally', normalAfterSuppressed.match === true, 'true', String(normalAfterSuppressed.match));

  // 4c. Smart Punctuation Snapping
  // Expand 'vn' -> 'Việt Nam '
  engine.checkExpansion('vn', ' ');
  const textWithSpace = 'Chào Việt Nam ';
  const snapComma = engine.checkPunctuationSnap(',', textWithSpace);
  assert('Punctuation Snapping on comma: deletes space', snapComma.snap && snapComma.deleteLength === 1 && snapComma.snappedChar === ',', 'snap comma', String(snapComma.snap));

  // 4d. Dynamic Variables ($DATE, $TIME, $DATETIME) with explicit '+' prefix
  engine.setMacro('+today', '$DATE');
  const expDate = engine.checkExpansion('+today', ' ');
  assert('Dynamic variable $DATE resolves to DD/MM/YYYY for +today', expDate.match && /^\d{2}\/\d{2}\/\d{4}$/.test(expDate.expandedText), 'DD/MM/YYYY', expDate.expandedText);

  engine.setMacro('+now', '$DATETIME');
  const expDateTime = engine.checkExpansion('+now', ' ');
  assert('Dynamic variable $DATETIME resolves to DD/MM/YYYY HH:mm for +now', expDateTime.match && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(expDateTime.expandedText), 'DD/MM/YYYY HH:mm', expDateTime.expandedText);

  // Normal words 'today' and 'now' should not expand
  const normalToday = engine.checkExpansion('today', ' ');
  assert('Common word "today" without "+" prefix must not expand', normalToday.match === false, 'false', String(normalToday.match));

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
