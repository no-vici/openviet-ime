/**
 * OpenViet IME Shared Configuration & Default Settings
 * Shared across Service Worker, Content Scripts, Options, and Popup.
 *
 * @license Apache-2.0
 */

export const DEFAULT_SETTINGS = {
  method: 3,             // 1: TELEX, 2: VNI, 3: AUTO, 0: OFF
  lastMethod: 3,         // Memory of last non-off method (for toggle restore)
  toneStyle: 'classic',  // Kiểu truyền thống / cổ điển: hòa, hóa, thủy, khỏe
  macroEnabled: true,
  spellCheck: true,      // Standardized default across all components
  autoUndo: true,
  ctrlToggleEnabled: true,
  quickConsonants: false,
  quickTelex: true,
  emojiShortcuts: true,
  autoCapitalize: true,
  perDomainMemory: true,
  domainMethods: {},
  autoRestoreEnglish: true,
  escRevert: true,
  phonologyRules: true,
  wordRescue: true,
  autoCompleteEnabled: true,
  nextWordEnabled: true,
  suggestionStyle: 'ribbon', // 'ribbon' | 'ghost_text'
  gboardLearningEnabled: true,
  autoHarmonizeCase: false,  // Harmonize mixed Shift/CapsLock casing (ĐƯợc -> Được) (Default: false)
  eraseHabitLearning: true,  // Auto-learn words to user dictionary after erasing accented words >= threshold times
  eraseHabitThreshold: 3,    // Number of whole-word erasures before learning (configurable: 2 to 10, default: 3)
  debugTypingLog: false,
  blacklistedDomains: []
};

