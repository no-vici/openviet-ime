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
  spellCheck: false,     // Standardized default across all components
  autoUndo: true,
  ctrlToggleEnabled: true,
  quickConsonants: false,
  quickTelex: true,
  // Internal, non-UI flag: Non-Start policy (initial 'w' stays Latin, e.g. web/wifi).
  // Kept for engine compatibility; the user-facing switch is `wToUEnabled`.
  typeW2U: true,
  // User-facing Telex `w` modifier switch. ON: `w` after a consonant/vowel becomes
  // ư/ơ/ă (thw -> thư, uow -> ươ), initial `w` stays Latin. OFF: every `w` is literal.
  wToUEnabled: true,
  smartHorn: true,       // vnchKey SmartHorn: intelligent horn placement on uo/uu/trio exception pairs
  emojiShortcuts: true,
  autoCapitalize: false,
  autoSpaceAfterPunctuation: false,
  autoCapitalizeProperNouns: false,
  properNounsList: [],
  backspaceBySyllable: false,
  perDomainMemory: true,
  domainMethods: {},
  autoRestoreEnglish: true,
  escRevert: true,
  markdownCodeLock: false,
  phonologyRules: true,
  wordRescue: true,
  flipWordShortcut: 'Alt+R',
  autoCompleteEnabled: false,
  nextWordEnabled: false,
  suggestionStyle: 'off', // 'ribbon' | 'ghost_text' | 'off'
  gboardLearningEnabled: true,
  autoHarmonizeCase: false,  // Harmonize mixed Shift/CapsLock casing (ĐƯợc -> Được) (Default: false)
  eraseHabitLearning: true,  // Auto-learn words to user dictionary after erasing accented words >= threshold times
  eraseHabitThreshold: 3,    // Number of whole-word erasures before learning (configurable: 2 to 10, default: 3)
  debugTypingLog: false,
  blacklistedDomains: []
};

