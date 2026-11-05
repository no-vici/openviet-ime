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
  { trigger: 'idk', value: 'tao hông biết', enabled: true }
];

export class MacroEngine {
  constructor(macros = DEFAULT_MACROS, options = {}) {
    this.macros = new Map();
    this.enabled = options.enabled ?? true;
    this.autoUndo = options.autoUndo ?? true;
    this.lastExpansion = null; // For Backspace undo tracking

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
    const entry = this.macros.get(key);

    if (!entry || !entry.enabled) {
      return { match: false };
    }

    const expandedText = this.preserveCase(rawWord, entry.value);

    // Record last expansion for Backspace undo
    this.lastExpansion = {
      rawTrigger: rawWord,
      expandedText,
      delimiter,
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
   * Backtracking / Undo:
   * When user presses Backspace immediately following an expansion,
   * revert back to rawTrigger.
   */
  checkUndo(recentText) {
    if (!this.autoUndo || !this.lastExpansion) {
      return { undo: false };
    }

    const { rawTrigger, expandedText, delimiter, timestamp } = this.lastExpansion;
    // Expire undo after 8 seconds
    if (Date.now() - timestamp > 8000) {
      this.lastExpansion = null;
      return { undo: false };
    }

    const expectedSuffix = expandedText + delimiter;
    if (recentText && recentText.endsWith(expectedSuffix)) {
      this.lastExpansion = null;
      return {
        undo: true,
        rawTrigger,
        revertText: rawTrigger + delimiter,
        removeLength: expectedSuffix.length
      };
    }

    return { undo: false };
  }

  clearUndo() {
    this.lastExpansion = null;
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
