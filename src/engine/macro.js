/**
 * Macro / Text Expansion Engine (Inspired by xmannv/xkey)
 * Handles macro lookup, casing preservation, word-boundary triggers, and Backspace undo.
 *
 * @license Apache-2.0
 */

import { isDelimiter } from './key-codes.js';

export const DEFAULT_MACROS = [
  { trigger: 'tv', value: 'Tiếng Việt', enabled: true },
  { trigger: 'vn', value: 'Việt Nam', enabled: true },
  { trigger: 'hn', value: 'Hà Nội', enabled: true },
  { trigger: 'sg', value: 'Sài Gòn', enabled: true },
  { trigger: 'dc', value: 'được', enabled: true },
  { trigger: 'ko', value: 'không', enabled: true },
  { trigger: 'k', value: 'không', enabled: true },
  { trigger: 'ntn', value: 'như thế nào', enabled: true },
  { trigger: 'vs', value: 'với', enabled: true },
  { trigger: 'bt', value: 'biết', enabled: true },
  { trigger: 'cb', value: 'chuẩn bị', enabled: true },
  { trigger: 'dy', value: 'đồng ý', enabled: true },
  { trigger: 'tks', value: 'cảm ơn', enabled: true },
  { trigger: 'mst', value: 'mã số thuế', enabled: true },
  { trigger: 'sdt', value: 'số điện thoại', enabled: true },
  { trigger: 'zia', value: 'dzìa', enabled: true },
  { trigger: 'zi', value: 'dzí', enabled: true },
  { trigger: 'zo', value: 'dzô', enabled: true },
  { trigger: 'dm', value: 'đụ má', enabled: true },
  { trigger: 'dmm', value: 'đụ má mày', enabled: true },
  { trigger: 'ck', value: 'chồng', enabled: true },
  { trigger: 'cx', value: 'cũng', enabled: true },
  { trigger: 'idk', value: 'tao hông biết', enabled: true },
  { trigger: '+today', value: '$DATE', enabled: true },
  { trigger: '+now', value: '$DATETIME', enabled: true }
];

/**
 * Curated Saigon Xưa / Southern Vietnamese Macro Preset
 * Rich collection of authentic Southern idioms, daily expressions & folk terms
 * (Trích lục từ bài sưu tập Nguyễn Cao Trường & phương ngữ Sài Gòn trước 1975).
 */
export const SAIGON_XUA_MACROS = [
  { trigger: 'sgx', value: 'Sài Gòn xưa', enabled: true },
  { trigger: 'hcm', value: 'Sài Gòn', enabled: true },
  { trigger: 'bcbc', value: 'bá cháy bù chét', enabled: true },
  { trigger: 'blbx', value: 'bá láp bá xàm', enabled: true },
  { trigger: 'bxk', value: 'ba xạo ba kép', enabled: true },
  { trigger: 'crdt', value: 'cà rịch cà tang', enabled: true },
  { trigger: 'ccca', value: 'cà chớn cà chác', enabled: true },
  { trigger: 'cccn', value: 'cà nhỏng cà nhỏng', enabled: true },
  { trigger: 'cdcc', value: 'cứng đầu cứng cổ', enabled: true },
  { trigger: 'mdo', value: 'mèn đéc ơi', enabled: true },
  { trigger: 'mo', value: 'mèn ơi', enabled: true },
  { trigger: 'hx', value: 'hết xẩy', enabled: true },
  { trigger: 'hxq', value: 'hết xí quách', enabled: true },
  { trigger: 'hghs', value: 'hết ga hết số', enabled: true },
  { trigger: 'hd', value: 'hổng dám đâu', enabled: true },
  { trigger: 'hcc', value: 'hổng có chi', enabled: true },
  { trigger: 'hc', value: 'hổng chừng', enabled: true },
  { trigger: 'sd', value: 'số dzách', enabled: true },
  { trigger: 'sm', value: 'sức mấy', enabled: true },
  { trigger: 'ss', value: 'sương sương', enabled: true },
  { trigger: 'tq', value: 'trớt quớt', enabled: true },
  { trigger: 'ts', value: 'trùm sò', enabled: true },
  { trigger: 'tm', value: 'trúng mánh', enabled: true },
  { trigger: 'tt', value: 'trúng tủ', enabled: true },
  { trigger: 'tto', value: 'trời thần ơi', enabled: true },
  { trigger: 'tdtd', value: 'trời đánh thánh đâm', enabled: true },
  { trigger: 'qtmb', value: 'quỉ tha ma bắt', enabled: true },
  { trigger: 'mtd', value: 'mưa thúi đất', enabled: true },
  { trigger: 'vg', value: 'vắt giò lên cổ', enabled: true },
  { trigger: 'vp', value: 'vô phương', enabled: true },
  { trigger: 'tlml', value: 'tào lao mía lao', enabled: true },
  { trigger: 'bcl', value: 'bà chằn lửa', enabled: true },
  { trigger: 'bt', value: 'bảnh tỏn', enabled: true },
  { trigger: 'tm', value: 'tía má', enabled: true },
  { trigger: 'th', value: 'thầy Hai', enabled: true },
  { trigger: 'tt2', value: 'thầy thợ', enabled: true },
  { trigger: 'tcl', value: 'thọc cù lét', enabled: true },
  { trigger: 'dtt', value: 'đò Thủ Thiêm', enabled: true },
  { trigger: 'xtm', value: 'xe thổ mộ', enabled: true },
  { trigger: 'xl', value: 'xe lam', enabled: true }
];

export class MacroEngine {
  constructor(macros = DEFAULT_MACROS, options = {}) {
    this.macros = new Map();
    this.enabled = options.enabled ?? true;
    this.autoUndo = options.autoUndo ?? true;
    this.lastExpansion = null; // For Backspace undo tracking
    this.suppressedTrigger = null; // Prevents infinite loop re-expansion right after an undo

    this.loadMacros(macros);
  }

  loadMacros(list) {
    this.macros.clear();
    if (Array.isArray(list)) {
      list.forEach(item => {
        if (item && item.trigger) {
          this.macros.set(item.trigger.toLowerCase(), {
            trigger: item.trigger,
            value: item.value || '',
            enabled: item.enabled !== false
          });
        }
      });
    }
  }

  getMacros() {
    return Array.from(this.macros.values());
  }

  setMacro(trigger, value, enabled = true) {
    if (!trigger) return;
    this.macros.set(trigger.toLowerCase(), {
      trigger,
      value,
      enabled
    });
  }

  removeMacro(trigger) {
    if (!trigger) return;
    this.macros.delete(trigger.toLowerCase());
  }

  toggleMacro(trigger) {
    const existing = this.macros.get(trigger.toLowerCase());
    if (existing) {
      existing.enabled = !existing.enabled;
    }
  }

  /**
   * Check if a trigger word can expand upon encountering delimiter
   * @param {string} rawWord The typed word before delimiter (e.g. 'vn', 'VN', 'Vn')
   * @param {string} delimiter The character triggering expansion (e.g. ' ', '\n', '.')
   * @returns {{ match: boolean, expandedText?: string, rawTrigger?: string, delimiter?: string }}
   */
  checkExpansion(rawWord, delimiter) {
    if (!this.enabled || !rawWord || !isDelimiter(delimiter)) {
      return { match: false };
    }

    const key = rawWord.toLowerCase();

    // Check if this trigger was just undone via Backspace (loop suppression)
    if (this.suppressedTrigger && this.suppressedTrigger.toLowerCase() === key) {
      // Clear suppression for future typing, but do not expand this time
      this.suppressedTrigger = null;
      return { match: false, suppressed: true };
    }
    this.suppressedTrigger = null;

    const entry = this.macros.get(key);

    if (!entry || !entry.enabled) {
      return { match: false };
    }

    const expandedText = this.preserveCase(rawWord, this.resolveDynamicVariables(entry.value));

    // Record last expansion for 2-step Backspace undo & punctuation snapping
    this.lastExpansion = {
      rawTrigger: rawWord,
      expandedText,
      delimiter,
      step: 1, // Step 1: Trailing delimiter attached; Step 2: Trailing delimiter removed
      timestamp: Date.now()
    };

    return {
      match: true,
      expandedText,
      rawTrigger: rawWord,
      delimiter
    };
  }

  /**
   * Backtracking / 2-Step Undo:
   * When user presses Backspace following an expansion:
   * - Step 1 (first Backspace): Only delete the trailing space/delimiter, leaving caret at the end
   *   of expandedText (e.g. "Việt Nam " -> "Việt Nam|") so user can type punctuation or continue sentence.
   * - Step 2 (second consecutive Backspace): Revert the expanded word completely back to rawTrigger
   *   (e.g. "Việt Nam" -> "vn|"), and activate suppression so typing space next will keep rawTrigger intact!
   */
  checkUndo(recentText) {
    if (!this.autoUndo || !this.lastExpansion) {
      return { undo: false };
    }

    const { rawTrigger, expandedText, delimiter, step, timestamp } = this.lastExpansion;
    // Expire undo after 10 seconds
    if (Date.now() - timestamp > 10000) {
      this.lastExpansion = null;
      return { undo: false };
    }

    // Step 1 check: user just expanded with space/delimiter, and hits Backspace 1st time
    if (step === 1) {
      const expectedSuffix = expandedText + delimiter;
      if (recentText && recentText.endsWith(expectedSuffix)) {
        // Transition to step 2: trailing delimiter is removed, expandedText remains
        this.lastExpansion = {
          rawTrigger,
          expandedText,
          delimiter,
          step: 2,
          timestamp: Date.now()
        };
        return {
          undo: true,
          step: 1,
          rawTrigger,
          revertText: expandedText,
          removeLength: delimiter.length // Remove only the trailing delimiter
        };
      }
    }

    // Step 2 check: user hits Backspace 2nd time immediately after step 1
    if (step === 2) {
      if (recentText && recentText.endsWith(expandedText)) {
        this.lastExpansion = null;
        // Suppress re-expansion on next delimiter so rawTrigger stays intact
        this.suppressedTrigger = rawTrigger;
        return {
          undo: true,
          step: 2,
          rawTrigger,
          revertText: rawTrigger,
          removeLength: expandedText.length
        };
      }
    }

    return { undo: false };
  }

  /**
   * Smart Punctuation Snapping:
   * When macro just expanded with space (e.g. "Việt Nam "), if next key is a punctuation mark
   * (such as , . ; : ! ? ) ] } >), snap the punctuation directly to the end of expandedText
   * eliminating the unnatural trailing space (e.g. "Việt Nam, " or "Việt Nam.").
   * @param {string} nextKey Next key pressed by user
   * @param {string} recentText Text immediately before caret
   * @returns {{ snap: boolean, snappedText?: string, deleteLength?: number }}
   */
  checkPunctuationSnap(nextKey, recentText) {
    if (!this.lastExpansion || this.lastExpansion.step !== 1) {
      return { snap: false };
    }

    const { expandedText, delimiter, timestamp } = this.lastExpansion;
    if (Date.now() - timestamp > 8000) {
      this.lastExpansion = null;
      return { snap: false };
    }

    // Only applies if delimiter was a space ' '
    if (delimiter !== ' ') {
      return { snap: false };
    }

    const SNAPPABLE_PUNCTUATION = new Set([',', '.', ';', ':', '!', '?', ')', ']', '}', '>']);
    if (!SNAPPABLE_PUNCTUATION.has(nextKey)) {
      return { snap: false };
    }

    const expectedSuffix = expandedText + ' ';
    if (recentText && recentText.endsWith(expectedSuffix)) {
      this.lastExpansion = null; // Successfully snapped
      return {
        snap: true,
        deleteLength: 1, // Remove the single trailing space
        snappedChar: nextKey
      };
    }

    return { snap: false };
  }

  /**
   * Resolve Dynamic Date & Time variables in macro expansion
   * $DATE -> DD/MM/YYYY (e.g. 08/11/2026)
   * $TIME -> HH:mm (e.g. 08:45)
   * $DATETIME -> DD/MM/YYYY HH:mm
   * $YEAR -> YYYY
   */
  resolveDynamicVariables(value) {
    if (!value || typeof value !== 'string' || !value.includes('$')) {
      return value;
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = String(now.getFullYear());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    const dateStr = `${day}/${month}/${year}`;
    const timeStr = `${hours}:${minutes}`;
    const dateTimeStr = `${dateStr} ${timeStr}`;

    return value
      .replace(/\$DATETIME\b/g, dateTimeStr)
      .replace(/\$DATE\b/g, dateStr)
      .replace(/\$TIME\b/g, timeStr)
      .replace(/\$YEAR\b/g, year);
  }

  clearUndo() {
    this.lastExpansion = null;
    this.suppressedTrigger = null;
  }

  /**
   * Case preservation rules:
   * 1. all lowercase (vn) -> use value (Việt Nam or lowercase)
   * 2. ALL UPPERCASE (VN) -> transform value to UPPERCASE (VIỆT NAM)
   * 3. Capitalized first letter (Vn) -> capitalize first letter of value (Việt Nam)
   */
  preserveCase(rawWord, value) {
    if (!value || !rawWord) return value;

    const isAllUpper = rawWord === rawWord.toUpperCase() && rawWord !== rawWord.toLowerCase();
    if (isAllUpper) {
      return value.toUpperCase();
    }

    const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
    if (isCapitalized) {
      // If value already capitalized, keep as is, or capitalize its first char
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    // Lowercase trigger:
    // If dictionary value has natural capitalization (like 'Việt Nam' or 'Hà Nội'), preserve it!
    // If it was a common phrase without proper nouns, keep dictionary formatting.
    return value;
  }

  /**
   * Export macros as JSON string
   */
  exportJSON() {
    return JSON.stringify(this.getMacros(), null, 2);
  }

  /**
   * Import macros from JSON string
   */
  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        this.loadMacros(data);
        return { success: true, count: data.length };
      }
      return { success: false, error: 'JSON root must be an array of macro objects.' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Export macros as CSV string
   */
  exportCSV() {
    const rows = ['trigger,value,enabled'];
    for (const macro of this.getMacros()) {
      const escValue = `"${macro.value.replace(/"/g, '""')}"`;
      rows.push(`${macro.trigger},${escValue},${macro.enabled ? 1 : 0}`);
    }
    return rows.join('\n');
  }

  /**
   * Import macros from CSV string
   */
  importCSV(csvString) {
    try {
      const lines = csvString.trim().split(/\r?\n/);
      if (lines.length === 0) return { success: false, error: 'Empty CSV file' };

      const newMacros = [];
      const startIndex = lines[0].toLowerCase().includes('trigger') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitter handling quoted values
        const parts = [];
        let inQuotes = false;
        let current = '';

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            if (inQuotes && line[c + 1] === '"') {
              current += '"';
              c++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        if (parts.length >= 2) {
          const trigger = parts[0];
          const value = parts[1];
          const enabled = parts.length > 2 ? parts[2] !== '0' && parts[2].toLowerCase() !== 'false' : true;
          if (trigger) {
            newMacros.push({ trigger, value, enabled });
          }
        }
      }

      this.loadMacros(newMacros);
      return { success: true, count: newMacros.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
