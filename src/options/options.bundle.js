(() => {
  // src/engine/key-codes.js
  var DELIMITERS = /* @__PURE__ */ new Set([
    " ",
    "	",
    "\n",
    "\r",
    ".",
    ",",
    ";",
    ":",
    "!",
    "?",
    "-",
    "—",
    "_",
    "/",
    "\\",
    "|",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "<",
    ">",
    '"',
    "'",
    "`",
    "“",
    "”",
    "‘",
    "’"
  ]);
  function isDelimiter(char) {
    if (!char || char.length !== 1) return false;
    return DELIMITERS.has(char);
  }

  // src/engine/macro.js
  var DEFAULT_MACROS = [
    { trigger: "tv", value: "Tiếng Việt", enabled: true },
    { trigger: "vn", value: "Việt Nam", enabled: true },
    { trigger: "hn", value: "Hà Nội", enabled: true },
    { trigger: "sg", value: "Sài Gòn", enabled: true },
    { trigger: "dc", value: "được", enabled: true },
    { trigger: "ko", value: "không", enabled: true },
    { trigger: "k", value: "không", enabled: false },
    // Disabled by default to prevent false positives on standalone 'K' (e.g. Vitamin K)
    { trigger: "ntn", value: "như thế nào", enabled: true },
    { trigger: "vs", value: "với", enabled: true },
    { trigger: "bt", value: "biết", enabled: true },
    { trigger: "cb", value: "chuẩn bị", enabled: true },
    { trigger: "dy", value: "đồng ý", enabled: true },
    { trigger: "tks", value: "cảm ơn", enabled: true },
    { trigger: "mst", value: "mã số thuế", enabled: true },
    { trigger: "sdt", value: "số điện thoại", enabled: true },
    { trigger: "zia", value: "dzìa", enabled: true },
    { trigger: "zi", value: "dzí", enabled: true },
    { trigger: "zo", value: "dzô", enabled: true },
    { trigger: "dm", value: "đụ má", enabled: true },
    { trigger: "dmm", value: "đụ má mày", enabled: true },
    { trigger: "ck", value: "chồng", enabled: true },
    { trigger: "cx", value: "cũng", enabled: true },
    { trigger: "idk", value: "tao hông biết", enabled: true },
    { trigger: "+today", value: "$DATE", enabled: true },
    { trigger: "+now", value: "$DATETIME", enabled: true },
    { trigger: "+cb", value: "$CLIPBOARD", enabled: true }
  ];
  var SAIGON_XUA_MACROS = [
    { trigger: "sgx", value: "Sài Gòn xưa", enabled: true },
    { trigger: "hcm", value: "Sài Gòn", enabled: true },
    { trigger: "bcbc", value: "bá cháy bù chét", enabled: true },
    { trigger: "blbx", value: "bá láp bá xàm", enabled: true },
    { trigger: "bxk", value: "ba xạo ba kép", enabled: true },
    { trigger: "crdt", value: "cà rịch cà tang", enabled: true },
    { trigger: "ccca", value: "cà chớn cà chác", enabled: true },
    { trigger: "cccn", value: "cà nhỏng cà nhỏng", enabled: true },
    { trigger: "cdcc", value: "cứng đầu cứng cổ", enabled: true },
    { trigger: "mdo", value: "mèn đéc ơi", enabled: true },
    { trigger: "mo", value: "mèn ơi", enabled: true },
    { trigger: "hx", value: "hết xẩy", enabled: true },
    { trigger: "hxq", value: "hết xí quách", enabled: true },
    { trigger: "hghs", value: "hết ga hết số", enabled: true },
    { trigger: "hd", value: "hổng dám đâu", enabled: true },
    { trigger: "hcc", value: "hổng có chi", enabled: true },
    { trigger: "hc", value: "hổng chừng", enabled: true },
    { trigger: "sd", value: "số dzách", enabled: true },
    { trigger: "sm", value: "sức mấy", enabled: true },
    { trigger: "ss", value: "sương sương", enabled: true },
    { trigger: "tq", value: "trớt quớt", enabled: true },
    { trigger: "ts", value: "trùm sò", enabled: true },
    { trigger: "tmanh", value: "trúng mánh", enabled: true },
    { trigger: "tt", value: "trúng tủ", enabled: true },
    { trigger: "tto", value: "trời thần ơi", enabled: true },
    { trigger: "tdtd", value: "trời đánh thánh đâm", enabled: true },
    { trigger: "qtmb", value: "quỉ tha ma bắt", enabled: true },
    { trigger: "mtd", value: "mưa thúi đất", enabled: true },
    { trigger: "vg", value: "vắt giò lên cổ", enabled: true },
    { trigger: "vp", value: "vô phương", enabled: true },
    { trigger: "tlml", value: "tào lao mía lao", enabled: true },
    { trigger: "bcl", value: "bà chằn lửa", enabled: true },
    { trigger: "bt", value: "bảnh tỏn", enabled: true },
    { trigger: "tm", value: "tía má", enabled: true },
    { trigger: "th", value: "thầy Hai", enabled: true },
    { trigger: "tt2", value: "thầy thợ", enabled: true },
    { trigger: "tcl", value: "thọc cù lét", enabled: true },
    { trigger: "dtt", value: "đò Thủ Thiêm", enabled: true },
    { trigger: "xtm", value: "xe thổ mộ", enabled: true },
    { trigger: "xl", value: "xe lam", enabled: true }
  ];
  var DEV_GIT_MACROS = [
    { trigger: ";gits", value: "git status", enabled: true },
    { trigger: ";gitc", value: 'git commit -m ""', enabled: true },
    { trigger: ";gitp", value: "git push origin main", enabled: true },
    { trigger: ";gitl", value: "git log --oneline -n 10", enabled: true },
    { trigger: ";gitb", value: "git checkout -b ", enabled: true },
    { trigger: ";clg", value: "console.log()", enabled: true },
    { trigger: ";todo", value: "// TODO: ", enabled: true },
    { trigger: ";fixme", value: "// FIXME: ", enabled: true }
  ];
  var MATH_SCIENCE_MACROS = [
    { trigger: ";pi", value: "π", enabled: true },
    { trigger: ";sum", value: "∑", enabled: true },
    { trigger: ";inf", value: "∞", enabled: true },
    { trigger: ";deg", value: "°", enabled: true },
    { trigger: ";pm", value: "±", enabled: true },
    { trigger: ";neq", value: "≠", enabled: true },
    { trigger: ";leq", value: "≤", enabled: true },
    { trigger: ";geq", value: "≥", enabled: true },
    { trigger: ";arr", value: "→", enabled: true },
    { trigger: ";alpha", value: "α", enabled: true },
    { trigger: ";beta", value: "β", enabled: true },
    { trigger: ";delta", value: "Δ", enabled: true }
  ];
  var MacroEngine = class {
    constructor(macros = DEFAULT_MACROS, options = {}) {
      this.macros = /* @__PURE__ */ new Map();
      this.enabled = options.enabled ?? true;
      this.autoUndo = options.autoUndo ?? true;
      this.lastExpansion = null;
      this.suppressedTrigger = null;
      this.loadMacros(macros);
    }
    loadMacros(list) {
      this.macros.clear();
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && item.trigger) {
            this.macros.set(item.trigger.toLowerCase(), {
              trigger: item.trigger,
              value: item.value || "",
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
    checkExpansion(rawWord, delimiter, context = {}) {
      if (!this.enabled || !rawWord || !isDelimiter(delimiter)) {
        return { match: false };
      }
      const key = rawWord.toLowerCase();
      if (this.suppressedTrigger && this.suppressedTrigger.toLowerCase() === key) {
        this.suppressedTrigger = null;
        return { match: false, suppressed: true };
      }
      this.suppressedTrigger = null;
      const entry = this.macros.get(key);
      if (!entry || !entry.enabled) {
        return { match: false };
      }
      const needsClipboard = /\$CLIPBOARD\b/i.test(entry.value) && context.clipboardText === void 0;
      if (needsClipboard) {
        return {
          match: true,
          requiresClipboard: true,
          expandedText: entry.value,
          rawTrigger: rawWord,
          delimiter
        };
      }
      const expandedText = this._expandValue(rawWord, entry.value, context);
      this.lastExpansion = {
        rawTrigger: rawWord,
        expandedText,
        delimiter,
        step: 1,
        // Step 1: Trailing delimiter attached; Step 2: Trailing delimiter removed
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
     * Finalize an expansion that required asynchronous clipboard reading.
     * @param {{ rawTrigger: string, expandedText: string, delimiter: string }} expansion
     * @param {string} clipboardText
     * @returns {string}
     */
    finalizeClipboardExpansion(expansion, clipboardText = "") {
      const expandedText = this._expandValue(expansion.rawTrigger, expansion.expandedText, {
        clipboardText: clipboardText ?? ""
      });
      this.lastExpansion = {
        rawTrigger: expansion.rawTrigger,
        expandedText,
        delimiter: expansion.delimiter,
        step: 1,
        timestamp: Date.now()
      };
      return expandedText;
    }
    _expandValue(rawWord, templateValue, context = {}) {
      const hasClipboard = /\$CLIPBOARD\b/i.test(templateValue);
      if (!hasClipboard) {
        return this.preserveCase(rawWord, this.resolveDynamicVariables(templateValue, context));
      }
      const parts = templateValue.split(/(\$CLIPBOARD\b)/i);
      const clipboardText = context.clipboardText ?? "";
      return parts.map((part) => {
        if (/^\$CLIPBOARD$/i.test(part)) {
          return clipboardText;
        }
        return this.preserveCase(rawWord, this.resolveDynamicVariables(part, context));
      }).join("");
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
      if (Date.now() - timestamp > 1e4) {
        this.lastExpansion = null;
        return { undo: false };
      }
      if (step === 1) {
        const expectedSuffix = expandedText + delimiter;
        if (recentText && recentText.endsWith(expectedSuffix)) {
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
            removeLength: delimiter.length
            // Remove only the trailing delimiter
          };
        }
      }
      if (step === 2) {
        if (recentText && recentText.endsWith(expandedText)) {
          this.lastExpansion = null;
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
      if (Date.now() - timestamp > 8e3) {
        this.lastExpansion = null;
        return { snap: false };
      }
      if (delimiter !== " ") {
        return { snap: false };
      }
      const SNAPPABLE_PUNCTUATION = /* @__PURE__ */ new Set([",", ".", ";", ":", "!", "?", ")", "]", "}", ">"]);
      if (!SNAPPABLE_PUNCTUATION.has(nextKey)) {
        return { snap: false };
      }
      const expectedSuffix = expandedText + " ";
      if (recentText && recentText.endsWith(expectedSuffix)) {
        this.lastExpansion = null;
        return {
          snap: true,
          deleteLength: 1,
          // Remove the single trailing space
          snappedChar: nextKey
        };
      }
      return { snap: false };
    }
    /**
     * Resolve Dynamic Date, Time, and Clipboard variables in macro expansion
     * $DATE -> DD/MM/YYYY (e.g. 08/11/2026)
     * $TIME -> HH:mm (e.g. 08:45)
     * $DATETIME -> DD/MM/YYYY HH:mm
     * $YEAR -> YYYY
     * $CLIPBOARD -> current clipboard text (if provided in context)
     */
    resolveDynamicVariables(value, context = {}) {
      if (!value || typeof value !== "string" || !value.includes("$")) {
        return value;
      }
      const now = /* @__PURE__ */ new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = String(now.getFullYear());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const dateStr = `${day}/${month}/${year}`;
      const vnDateStr = `${day}-${month}-${year}`;
      const isoDateStr = `${year}-${month}-${day}`;
      const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const weekdayStr = weekdays[now.getDay()];
      const timeStr = `${hours}:${minutes}`;
      const dateTimeStr = `${dateStr} ${timeStr}`;
      let result = value.replace(/\$DATETIME\b/g, dateTimeStr).replace(/\$VN_DATE\b/g, vnDateStr).replace(/\$ISO_DATE\b/g, isoDateStr).replace(/\$WEEKDAY\b/g, weekdayStr).replace(/\$DATE\b/g, dateStr).replace(/\$TIME\b/g, timeStr).replace(/\$YEAR\b/g, year);
      if (context.clipboardText !== void 0) {
        result = result.replace(/\$CLIPBOARD\b/gi, context.clipboardText);
      }
      return result;
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
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
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
        return { success: false, error: "JSON root must be an array of macro objects." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    /**
     * Export macros as CSV string
     */
    exportCSV() {
      const rows = ["trigger,value,enabled"];
      for (const macro of this.getMacros()) {
        const escValue = `"${macro.value.replace(/"/g, '""')}"`;
        rows.push(`${macro.trigger},${escValue},${macro.enabled ? 1 : 0}`);
      }
      return rows.join("\n");
    }
    /**
     * Import macros from CSV string
     */
    importCSV(csvString) {
      try {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length === 0) return { success: false, error: "Empty CSV file" };
        const newMacros = [];
        const startIndex = lines[0].toLowerCase().includes("trigger") ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = [];
          let inQuotes = false;
          let current = "";
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              if (inQuotes && line[c + 1] === '"') {
                current += '"';
                c++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              parts.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          parts.push(current.trim());
          if (parts.length >= 2) {
            const trigger = parts[0];
            const value = parts[1];
            const enabled = parts.length > 2 ? parts[2] !== "0" && parts[2].toLowerCase() !== "false" : true;
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
  };

  // src/engine/config.js
  var DEFAULT_SETTINGS = {
    method: 3,
    // 1: TELEX, 2: VNI, 3: AUTO, 0: OFF
    lastMethod: 3,
    // Memory of last non-off method (for toggle restore)
    toneStyle: "classic",
    // Kiểu truyền thống / cổ điển: hòa, hóa, thủy, khỏe
    macroEnabled: true,
    spellCheck: true,
    // Standardized default across all components
    autoUndo: true,
    ctrlToggleEnabled: true,
    quickConsonants: false,
    quickTelex: true,
    typeW2U: true,
    // vnchKey TypeW2U (Non-Start): 'w' acts as 'ư' after consonants / 'uw' / 'uow', but standalone initial 'w' stays English
    smartHorn: true,
    // vnchKey SmartHorn: intelligent horn placement on uo/uu/trio exception pairs
    emojiShortcuts: true,
    autoCapitalize: true,
    perDomainMemory: true,
    domainMethods: {},
    autoRestoreEnglish: true,
    escRevert: true,
    phonologyRules: true,
    wordRescue: true,
    flipWordShortcut: "Alt+R",
    autoCompleteEnabled: true,
    nextWordEnabled: true,
    suggestionStyle: "ribbon",
    // 'ribbon' | 'ghost_text'
    gboardLearningEnabled: true,
    autoHarmonizeCase: false,
    // Harmonize mixed Shift/CapsLock casing (ĐƯợc -> Được) (Default: false)
    eraseHabitLearning: true,
    // Auto-learn words to user dictionary after erasing accented words >= threshold times
    eraseHabitThreshold: 3,
    // Number of whole-word erasures before learning (configurable: 2 to 10, default: 3)
    debugTypingLog: false,
    blacklistedDomains: []
  };

  // src/engine/vietnamese-words.js
  var VIETNAMESE_WORDS_STRING = "a abc ai am an ang anh ao ascii au ba bai ban bang banh bao basoi bay be bem ben beng beo bi bia bin binh biên biêng biếc biếm biến biếng biết biếu biền biển biểu biện biệt bo bom bon bong boong boóng bu bua bung buôn buông buýt buốt buồi buồm buồn buồng buổi buộc buột bà bài bàm bàn bàng bành bào bàu bày bá bác bách bái bám bán báng bánh báo bát báu bân bâng bâu bây bã bãi bão bè bèm bèn bèo bé béc bén béng béo bép bét bê bên bênh bêu bì bìa bìm bình bìu bí bía bích bím bính bít bíu bò bòi bòm bòn bòng bó bóc bói bón bóng bóp bót bô bôi bôm bôn bông bõ bõm bõng bù bùa bùi bùm bùn bùng bú búa búi bún búng búp bút băm băn băng bĩ bĩnh bĩu bũm bơ bơi bơm bơn bư bưa bưng bưu bươi bươm bươn bương bươu bước bướm bướng bướp bướu bưởi bượt bạ bạc bạch bại bạn bạnh bạo bạp bạt bạu bả bải bản bảng bảnh bảo bảu bảy bấc bấm bấn bấp bất bấu bấy bầm bần bầng bầu bầy bẩm bẩn bẩy bẫm bẫy bậc bậm bận bập bật bậu bậy bắc bắn bắng bắp bắt bằm bằn bằng bằng bẳn bẵng bặm bặn bặng bặp bặt bẹ bẹn bẹo bẹp bẹt bẻ bẻm bẻo bẽ bẽn bẽo bế bến bếp bết bề bền bềnh bều bể bễ bệ bệch bện bệnh bệt bệu bỉ bỉm bỉnh bỉu bị bịa bịch bịn bịnh bịp bịt bịu bọ bọc bọn bọng bọp bọt bỏ bỏi bỏm bỏng bố bốc bối bốn bống bốp bốt bồ bồi bồm bồn bồng bổ bổi bổn bổng bỗ bỗng bộ bộc bội bộn bộng bộp bột bớ bới bớp bớt bờ bời bờm bờn bở bởi bỡ bỡn bợ bợm bợn bợp bợt bụ bụa bục bụi bụm bụng bụp bụt bủ bủa bủm bủn bủng bứ bức bứng bứt bừa bừng bửa bửng bửu bữa bự bựa bực bựt ca cai cam can canh cao cau cay cha chai chan chang chanh chao chau chay che chem chen cheng cheo chi chia chim chinh chiu chiêm chiên chiêng chiêu chiếc chiếm chiến chiếng chiếp chiết chiếu chiền chiềng chiều chiểu chiện cho choang choi chong choài choàng choá choái choán choáng choãi choèn choé choòng choăn choạc choạng choạp choảng choắt choẹ choẹt chu chua chui chum chun chung chuyên chuyến chuyền chuyển chuyện chuôi chuôm chuông chuẩn chuếch chuệch chuốc chuối chuốt chuồi chuồn chuồng chuỗi chuộc chuội chuộng chuột chuỳ chà chài chàm chàng chành chào chày chá chác chái chán cháng chánh cháo chát cháu cháy châm chân châu chây chã chãi chão chè chèn chèo ché chém chén chéo chép chét chê chêm chênh chì chìa chìm chình chìu chí chích chím chín chính chíp chít chíu chò chòi chòm chòng chó chóa chóc chóe chói chóng chóp chót chôm chôn chông chõ chõm chõng chù chùa chùi chùm chùn chùng chùy chú chúa chúc chúi chúm chúng chút chăm chăn chăng chĩa chĩn chĩnh chũi chũm chũn chơ chơi chơm chơn chư chưa chưn chưng chương chước chướng chườm chường chưởi chưởng chưỡng chược chượp chạ chạc chạch chạm chạn chạng chạnh chạo chạp chạt chạy chả chải chảnh chảo chảu chảy chấm chấn chấp chất chấu chấy chầm chần chầu chầy chẩm chẩn chẫu chậc chậm chận chập chật chậu chắc chắm chắn chắp chắt chằm chằn chằng chẳng chẵn chặc chặm chặn chặng chặp chặt chẹn chẹo chẹp chẹt chẻ chẻm chẻn chẻo chẽ chẽn chế chếch chếnh chết chề chềm chềnh chểnh chễm chễnh chệ chệch chện chệnh chỉ chỉn chỉnh chị chịa chịt chịu chọ chọc chọe chọi chọn chọt chỏ chỏm chỏn chỏng chốc chối chốn chống chốp chốt chồ chồi chồm chồn chồng chổi chổng chỗ chỗm chộ chội chộn chộp chột chớ chới chớm chớp chớt chờ chờm chờn chở chởm chợ chợn chợp chợt chục chụm chụp chụt chủ chủn chủng chứ chứa chức chứng chừ chừa chừng chửa chửi chửi chửng chữ chữa chững chực co coi com con cong coong coóc cu cua cui cum cun cung cuốc cuối cuốn cuống cuồn cuồng cuỗm cuộc cuội cuộn cuộng cà cài càn càng cành cào càu cày cá các cách cái cám cán cáng cánh cáo cáp cát cáu cáy câm cân câng câu cây cãi cò còi còm còn còng có cóc cói cóng cóp cót cô côi côm côn công cõi cõng cù cùi cùm cùn cùng cú cúa cúc cúi cúm cúng cúp cút căm căn căng cũ cũi cũn cũng cơ cơi cơm cơn cư cưa cưng cưu cương cước cưới cướp cười cườm cường cưỡi cưỡng cạ cạc cạch cạm cạn cạnh cạo cạp cạu cạy cả cải cảm cản cảng cảnh cảo cảu cảy cấc cấm cấn cấp cất cấu cấy cầm cần cầu cầy cẩm cẩn cẩu cẩy cẫm cẫn cẫng cận cập cật cậu cậy cắc cắm cắn cắp cắt cằm cằn cẳn cẳng cẵng cặc cặm cặn cặp cặt cọ cọc cọm cọn cọng cọp cọt cỏ cỏi cỏm cỏn cỏng cố cốc cối cốm cốn cống cốp cốt cồ cồm cồn cồng cổ cổi cổn cổng cỗ cỗi cộ cộc cội cộm cộn cộng cộp cột cớ cớm cớn cớt cờ cời cờn cởi cỡ cỡi cỡm cỡn cợn cợt cụ cục cụi cụm cụng cụp cụt củ của củi củn củng cứ cứa cức cứng cứt cứu cừ cừu cử cửa cửi cửng cửu cữ cữu cự cựa cực cựu da dai dam dan dang danh dao day de deo di dim dinh diêm diên diêu diếc diếp diết diếu diềm diều diễm diễn diễu diệc diện diệp diệt diệu do doa doan doanh doi dom don dong doành doá doãi doãn doãng doạ du dua dun dung duy duyên duyệt duềnh duệ duốc duỗi dà dài dàn dàng dành dào dàu dày dá dác dái dám dán dáng dát dáy dâm dân dâng dâu dây dã dãi dãy dè dèn dé dép dê dênh dì dìa dìm dìu dí dích dím dính díp díu dò dòi dòm dòng dó dóa dóc dóm dón dót dô dôi dông dõi dõng dù dùa dùi dùn dùng dúa dúi dúm dún dúng dút dăm dăn dăng dĩ dĩa dĩnh dũ dũi dũng dơ dơi dư dưa dưng dương dưới dướng dường dưỡng dược dượng dượt dạ dạc dại dạm dạn dạng dạo dạt dạy dả dải dảy dấm dấn dấp dấu dấy dầm dần dầu dẩn dẫm dẫn dẫu dẫy dậm dận dập dật dậu dậy dắng dắt dằm dằn dằng dẳng dặc dặm dặn dặng dặt dẹp dẹt dẻ dẻo dẽ dế dề dềnh dể dễ dện dệt dị dịch dịp dịt dịu dọa dọc dọi dọn dọng dọp dỏ dỏm dỏng dốc dối dốt dồi dồn dỗ dỗi dội dộng dột dớ dớp dờ dời dở dởm dỡ dợ dụ dục dụm dụng dứ dứa dức dứt dừ dừa dừng dử dửng dữ dự dự dựa dực dựng e em email en eng eo ga gai gam gan gang ganh gao gau gay gen ghe ghen ghi ghim ghiếc ghiền ghè ghèn ghé ghém ghép ghét ghê ghì ghìm ghẹ ghẹn ghẹo ghẻ ghẽ ghế ghếch ghề ghềnh ghểnh ghệt gi gia giai giam gian giang gianh giao gieo gif gio gioi gion giong gip giu giua giun giuộc già giàn giàng giành giào giàu giày giá giác giám gián giáng giáo giáp giát giâm giâu giây giã giãi giãn giãy gièm gié giéo giê giêng giò giòi giòn gió gióc giói gión gióng giô giôn giông giùi giùm giú giúi giúp giăm giăng giũ giũa giơ giương giướng giường giượng giạ giại giạng giạt giả giải giảm giản giảng giảnh giảo giảu giấc giấm giấp giấu giấy giầm giần giầu giầy giẫm giẫy giậm giận giập giật giậu giắn giắt giằm giằn giằng giặc giặm giặn giặt giẹo giẹp giẻ giếc giếm giếng giết giề giền giềng giễu giọ giọc giọi giọng giọt giỏ giỏi giỏi giỏn giỏng giối giống giốt giồ giồi giồng giổi giỗ giộ giội giộp giới giờ giời giờn giở giỡn giụa giục giụi giủi giừ giữ giữa giữa giựt go gom gon goá goòng gram gu guốc guồi guồng guộc gà gài gàn gàng gành gào gàu gá gác gái gán gánh gáo gáp gáu gáy gâm gân gâu gây gã gãi gãy gì gìm gìn gí gích gíp gò gòn góa góc gói góp gót gô gôm gôn gông gõ gù gùi gùn gùng gút găm găn găng gũi gơ gươm gương gườm gường gưỡng gượm gượng gạ gạc gạch gạn gạnh gạo gạt gả gảy gấc gấm gấp gấu gấy gầm gần gầu gầy gẩm gẫm gẫu gậm gập gật gậy gắm gắn gắng gắp gắt gằm gằn gặc gặm gặn gặng gặp gặt gỉ gọi gọn gọng gọt gỏi gỏng gốc gối gốm gồ gồi gồm gồng gổ gỗ gộ gộc gội gộp gột gớm gờ gờm gờn gở gởi gỡ gợi gợn gợt gụ gục gụi gụt gừ gừng gửi gỵa ha hai ham han hang hanh hao hau hay hcm he hem hen heo hi hia him hiu hiên hiêng hiếm hiến hiếng hiếp hiếu hiềm hiền hiểm hiển hiểu hiện hiệp hiệu hk ho hoa hoan hoang hoay hoe hoen hoi hom hon hong hoà hoài hoàm hoàn hoàng hoành hoá hoác hoán hoáy hoãn hoè hoét hoăm hoăng hoạ hoạch hoại hoạn hoạnh hoạt hoả hoải hoảng hoảnh hoắc hoắm hoắt hoẳn hoẵng hoặc hoặc hoẹ hoẹt hoẻn html hu hua hum hun hung huy huynh huyên huyết huyền huyễn huyện huyệt huân huê huênh huý huých huýt huơ huấn huế huếch huề huệ huống huỳnh huỵch huỷ hy hà hài hàm hàn hàng hành hào hàu há hác hách hái hám hán háng hánh háo hát háu háy hâm hân hâu hây hãi hãm hãn hãng hãnh hão hãy hè hèm hèn hèo hé héc héo hét hê hên hênh hì hình hí hích híp hít hò hòa hòe hòi hòm hòn hòng hóa hóc hói hóm hóng hóp hót hô hôi hôm hôn hông hõm hù hùa hùm hùn hùng hú húc húi húng húp hút húy hăm hăng hđnd hĩm hĩnh hũ hũm hơ hơi hơn hư hưng hưu hương hươu hước hướm hướng hường hưởng hượm hạ hạc hạch hại hạm hạn hạng hạnh hạo hạp hạt hả hải hảm hảng hảo hấn hấng hấp hất hấu hấy hầm hầu hầy hẩm hẩng hẩu hẩy hẫng hẫu hậm hận hập hậu hắc hắn hắng hắt hằm hằn hằng hẳn hẵng hặc hẹ hẹm hẹn hẹp hẻm hẻo hếch hến hết hếu hề hềnh hể hển hểnh hệ hệch hệt hỉ hỉnh hịch họ họa học họe họng họp hỏa hỏi hỏm hỏn hỏng hố hốc hối hống hốt hồ hồi hồn hồng hổ hổi hổm hổn hổng hỗ hỗn hỗng hộ hộc hội hộn hộp hột hớ hớm hớn hớp hớt hờ hời hờn hở hởi hỡi hỡi hợi hợm hợp hợt hục hụi hụm hụp hụt hủ hủi hủn hủy hứa hức hứng hừ hừm hừng hử hửng hữ hững hữu hự hực hựu i im in inh internet intranet iu jpeg ka ke kem ken keng keo kha khai kham khan khang khanh khao khau khay khe khem khen kheo khi khin khinh khiu khiêm khiên khiêng khiêu khiếm khiến khiếp khiết khiếu khiền khiển khiễng kho khoa khoai khoan khoang khoanh khoe khoeo khom khoào khoá khoác khoái khoán khoáng khoát khoáy khoèo khoé khoét khoăm khoăn khoả khoải khoản khoảng khoảnh khoắm khoắn khoắng khoắt khoằm khoẻ khu khua khui khum khung khuy khuya khuynh khuyên khuyến khuyết khuyển khuân khuâng khuây khuê khuôn khuông khuơ khuất khuấy khuẩn khuếch khuỳnh khuỵu khuỷu khà khàn khàng khá khác khách khái khám khán kháng khánh kháo kháp khát kháu kháy khâm khân khâu khè khèn khèo khé khén khéo khép khét khê khênh khêu khì khìn khí khía khích khít khíu khò khòm khòng khó khóa khóc khóe khói khóm khô khôi khôn không khù khùng khú khúc khúm khăm khăn khăng khĩnh khơ khơi khư khươi khươm khươn khương khước khướt khướu khạc khạng khạo khả khải khảm khản khảng khảnh khảo khảy khấc khấm khấn khấp khất khấu khẩn khẩu khẩy khập khật khắc khắm khắng khắp khắt khằng khẳm khẳn khẳng khặc khẹc khẻ khẻo khẽ khế khề khều khểnh khệ khệnh khỉ khỉnh khịa khịt khọm khỏa khỏe khỏi khỏng khố khốc khối khốn khống khổ khổn khổng khớ khớp khờ khởi khụ khục khụt khủ khủng khứ khứa khứng khứu khừ khừng khử khựng ki kia kim kinh kiêm kiên kiêng kiêu kiếm kiến kiếp kiết kiếu kiềm kiền kiềng kiều kiểm kiểng kiểu kiễng kiệm kiện kiệt kiệu kè kèm kèn kèo ké kéc kém kén kéo kép két kê kênh kêu kì kìa kìm kình kí kích kín kính kíp kít ký kĩ kẹ kẹn kẹo kẹp kẹt kẻ kẻng kẻo kẽ kẽm kẽo kế kếch kếp kết kề kềm kền kềnh kều kể kệ kệch kệnh kỉ kỉnh kị kịch kịp kịt kỳ kỵ kỷ kỹ la lai lam lan lang lanh lao lau lay le lem len leng leo lhq li lia lim lin linh liu liêm liên liêng liêu liếc liếm liến liếng liếp liềm liền liều liểng liễm liễn liễu liệm liệng liệp liệt liệu lo loa loan loang loanh loay loe loen loi lom lon long loong loà loài loàn loàng loáng loát loãng loè loé loét loăng loạc loại loạn loạng loạt loảng loắt loằng loẹt lu lua lui lum lung luya luyến luyện luân luôm luôn luông luýnh luấn luẩn luận luận luật luốc luống luốt luồn luồng luỗng luộc luộm luỵ luỹ ly là lài làm làn làng lành lào làu lá lác lách lái lán láng lánh láo láp lát láu láy lâm lân lâng lâu lây lã lãi lãm lãn lãng lãnh lão lè lèm lèn lèo lé léc lém lén léng léo lép lét lê lên lênh lêu lì lìa lìm lình lìu lí lính líp lít líu lò lòa lòe lòi lòm lòn lòng ló lóc lóe lói lóm lóng lóp lót lô lôi lôm lông lõ lõi lõm lõng lù lùa lùi lùm lùn lùng lú lúa lúc lúi lúm lún lúng lúp lút lý lăm lăn lăng lĩnh lũ lũi lũm lũn lũng lũy lơ lơi lơn lư lưng lưu lươm lươn lương lưới lướng lướt lười lườm lườn lường lưỡi lưỡng lược lượm lượn lượng lượt lạ lạc lạch lại lạm lạn lạng lạnh lạo lạp lạt lạu lạy lả lải lảm lảng lảnh lảo lảu lảy lấc lấm lấn lấp lất lấy lầm lần lầu lầy lẩm lẩn lẩu lẩy lẫm lẫn lẫy lậm lận lập lật lậu lắc lắk lắm lắng lắp lắt lằm lằn lằng lẳm lẳn lẳng lẵng lặc lặm lặn lặng lặp lặt lẹ lẹm lẹn lẹo lẹp lẹt lẻ lẻm lẻn lẻng lẻo lẽ lẽn lẽo lếch lết lếu lề lềnh lều lể lểu lễ lễu lệ lệch lệnh lỉm lỉnh lị lịa lịch lịm lịnh lịu lọ lọc lọi lọm lọn lọng lọt lỏi lỏm lỏn lỏng lố lốc lối lốm lốn lốp lốt lồ lồi lồm lồn lồng lổ lổm lổn lổng lỗ lỗi lộ lộc lội lộm lộn lộng lộp lột lớ lới lớn lớp lớt lờ lời lờm lờn lở lởi lởm lởn lỡ lỡm lợ lợi lợm lợn lợp lợt lụ lụa lục lụi lụn lụng lụp lụt lụy lủ lủi lủm lủn lủng lứa lức lứt lừ lừa lừng lử lửa lửng lữ lữa lững lự lựa lực lựng lựu lỵ ma mai man mang manh mao mau may me mem men meo mi mia mim min minh miên miêu miến miếng miết miếu miền miều miễn miễu miện miệng miệt mo moay moi mom mon mong moóc mu mua mui mum mun mung muôi muôn muông muối muốn muống muốt muồi muỗi muỗm muỗng muội muộn mà mài màn màng mành mào màu mày má mác mách mái mán máng mánh máo mát máu máy mâm mân mâng mâu mây mã mãi mãn mãng mãnh mão mè mèm mèn mèng mèo mé mém mén méo mép mét mê mên mênh mì mìn mình mí mía mích mím míp mít míu mò mòi mòm mòn mòng mó móc mói móm món móng móp mót mô môi môm môn mông mõ mõm mù mùa mùi mùn mùng mú múa múc múi múm mún múp mút măm măn măng mĩ mĩm mũ mũi mũm mơ mơi mơn mưa mưu mươi mương mướn mướp mướt mười mường mượn mượt mạ mạc mạch mại mạn mạng mạnh mạo mạp mạt mạy mả mải mảng mảnh mảy mấn mấp mất mấu mấy mầm mần mầng mầu mẩm mẩn mẩy mẫm mẫn mẫu mận mập mật mậu mắc mắm mắn mắng mắt mằn mẳn mặc mặn mặt mặt mẹ mẹo mẹp mẹt mẻ mẻo mẽ mế mếch mến mếu mề mềm mền mễ mệ mệnh mệt mỉ mỉa mỉm mị mịch mịn mịnh mịt mọc mọi mọn mọng mọt mỏ mỏi mỏm mỏng mố mốc mối mống mốt mồ mồi mồm mồn mồng mổ mổng mỗ mỗi mộ mộc mộng một mớ mới mớm mớp mờ mời mờm mở mởn mỡ mợ mụ mục mụi mụn mụp mủ mủi mủm mủn mủng mứa mức mứt mứu mừng mửa mự mựa mực mỹ na nai nam nan nang nanh nao nau nay ne nem nen neo nga ngai ngam ngan ngang ngao ngau ngay nghe nghi nghinh nghiu nghiêm nghiên nghiêng nghiêu nghiến nghiền nghiễm nghiệm nghiện nghiệp nghiệt nghè nghèn nghèo nghé nghén nghét nghê nghênh nghêu nghì nghìn nghí nghít nghĩ nghĩa nghẹn nghẹo nghẹt nghẻ nghẻo nghẽn nghẽo nghếch nghề nghều nghển nghểnh nghễ nghễnh nghễu nghệ nghệch nghện nghỉ nghỉm nghỉn nghỉnh nghỉu nghị nghịch nghịt nghịu ngoa ngoan ngoang ngoao ngoay ngoe ngoi ngon ngong ngoài ngoàm ngoác ngoách ngoái ngoáo ngoáy ngoã ngoãn ngoèo ngoé ngoéo ngoét ngoại ngoạm ngoạn ngoải ngoảng ngoảnh ngoảy ngoắc ngoắt ngoằn ngoằng ngoẵng ngoặc ngoặt ngoẻn ngu nguy nguyên nguyền nguyễn nguyện nguyệt nguýt nguơn nguẩy nguồi nguồn nguội nguỵ nguỷu ngà ngài ngàm ngàn ngàng ngành ngào ngàu ngày ngác ngách ngái ngám ngán ngáng ngáo ngáp ngát ngáu ngáy ngâm ngân ngâu ngây ngã ngãi ngãng ngão ngò ngòi ngòm ngòn ngòng ngó ngóc ngóe ngói ngóm ngón ngóng ngóp ngót ngô ngôi ngôn ngông ngõ ngõa ngõi ngõng ngùi ngùng ngú ngúc ngúng ngút ngăm ngăn ngũ ngơ ngơi ngơm ngơn ngư ngưa ngưng ngưu ngươi ngước người ngường ngưởng ngưỡng ngược ngượng ngạc ngạch ngại ngạn ngạnh ngạo ngạt ngả ngải ngảnh ngấc ngấm ngấn ngấp ngất ngấu ngấy ngầm ngần ngầu ngầy ngẩm ngẩn ngẩng ngẫm ngẫn ngẫu ngậm ngận ngập ngật ngậu ngậy ngắc ngắm ngắn ngắt ngằn ngẳng ngẵng ngặt ngọ ngọc ngọn ngọng ngọt ngỏ ngỏm ngỏn ngỏng ngố ngốc ngốn ngốt ngồi ngồm ngồn ngồng ngổ ngổm ngổn ngỗ ngỗng ngộ ngộc ngộn ngột ngớ ngớn ngớp ngớt ngờ ngời ngờm ngỡ ngợ ngợi ngợm ngợp ngụ ngụa ngục ngụm ngụp ngụy ngủ ngủi ngủn ngứ ngứa ngứt ngừ ngừa ngừng ngửa ngửi ngửng ngữ ngữ ngự ngựa ngực nha nhai nham nhan nhang nhanh nhao nhau nhay nhe nhem nhen nheo nhi nhinh nhiu nhiên nhiêu nhiếc nhiếp nhiều nhiễm nhiễn nhiễu nhiệm nhiệt nho nhoai nhoang nhoay nhoe nhoen nhoi nhom nhong nhoà nhoài nhoàm nhoá nhoáng nhoáy nhoè nhoèn nhoé nhoét nhoạng nhoẹt nhoẻn nhu nhui nhung nhuyễn nhuôm nhuần nhuận nhuế nhuệ nhuốc nhuốm nhuộm nhuỵ nhà nhài nhàm nhàn nhàng nhành nhào nhàu nhày nhá nhác nhách nhái nhám nháng nhánh nháo nháp nhát nháy nhâm nhân nhâng nhâu nhây nhã nhãi nhãn nhãng nhão nhè nhèm nhèo nhé nhén nhéo nhép nhét nhênh nhì nhìn nhí nhía nhích nhím nhín nhíp nhít nhíu nhò nhòa nhòe nhòm nhó nhóa nhóc nhóe nhói nhóm nhón nhóng nhóp nhót nhô nhôi nhôm nhôn nhông nhõ nhõm nhõn nhù nhùi nhùn nhùng nhú nhúa nhúc nhúm nhún nhúng nhút nhăm nhăn nhăng nhĩ nhũ nhũn nhũng nhơ nhơi nhơm nhơn như nhưng nhương nhướng nhường nhưỡng nhược nhượng nhạc nhạn nhạnh nhạo nhạp nhạt nhạy nhả nhải nhảm nhản nhảnh nhảu nhảy nhấc nhấm nhấn nhấp nhất nhầm nhần nhầy nhẩm nhẫn nhẫy nhậm nhậm nhận nhập nhật nhậu nhậy nhắc nhắm nhắn nhắng nhắp nhắt nhằm nhằn nhằng nhẳn nhẳng nhẵn nhẵng nhặm nhặn nhặng nhặt nhẹ nhẹm nhẹn nhẹo nhẹp nhẹt nhẻ nhẻm nhẽ nhẽo nhện nhệu nhỉ nhỉnh nhị nhịn nhịp nhịt nhịu nhọ nhọc nhọn nhọt nhỏ nhỏm nhỏng nhố nhốc nhối nhốn nhốt nhồi nhồm nhồn nhồng nhổ nhổm nhổn nhộn nhộng nhột nhớ nhớm nhớn nhớp nhớt nhờ nhời nhờn nhở nhởn nhỡ nhợ nhợt nhụ nhụa nhục nhụi nhụng nhụt nhụy nhủ nhủi nhủn nhứ nhức nhứt nhừ nhử nhửng những nhự nhựa nhựt ni nia nin ninh niu niêm niên niêu niết niềm niền niềng niễng niệm niệt niệu no noa noi nom non nong noãn nua nung nuôi nuông nuốc nuối nuốm nuốt nuộc nuột nà nài nàn nàng nành nào này ná nác nách nái nám nán náng nánh náo nát náu náy nân nâng nâu nây nã não nãy nè nèo né ném nén néo nép nét nê nêm nên nêu nì nình ních nín nính níp nít níu nò nòi nòng nó nóc nói nón nóng nót nô nôi nôm nôn nông nõ nõn nùi nùn nùng núc núi núm núng núp nút năm năn năng nĩa nũng nơ nơi nơm nư nưa nưng nương nước nướng nườm nường nược nượp nạ nạc nại nạm nạn nạng nạnh nạo nạp nạt nạy nả nải nản nảy nấc nấm nấng nấp nấu nấy nầm nần nầy nẩy nẫng nẫu nậm nậng nập nậu nậy nắc nắm nắn nắng nắp nằm nằn nằng nẵng nặc nặn nặng nẹp nẹt nẻ nẻo nếm nến nếp nết nếu nề nền nể nệ nệm nện nỉ nịch nịnh nịt nịu nọ nọc nọn nọng nọt nỏ nỏi nố nốc nối nống nốt nồ nồi nồm nồng nổ nổi nỗ nỗi nỗng nộ nội nộm nộn nộp nột nớ nới nớp nớt nờ nờm nở nỡ nỡm nợ nợp nụ nục nủa nứa nức nứt nừng nửa nữ nữa nự nực nựng o oa oai oan oang oanh oe oi om ong oà oàm oàng oành oác oách oái oán oát oé oăm oăng oạch oại oạp oải oản oắt oằn oẳn oẳng oặt oẹ oẻ pa palăng pan pao pdf pe pha phai phan phang phanh phao phau phay phe phen pheo phi phim phin phinh phiu phiên phiêu phiếm phiến phiết phiếu phiền phiện phiệt pho phoi phom phong phu phui phun phung phuy phà phàm phàn phàng phành phào phá phác phách phái phán pháo pháp phát phân phây phè phèn phèng phèo phéng phép phét phê phên phì phìa phình phí phía phích phím phính phò phòi phòng phó phóc phóng phót phô phôi phôm phông phù phùn phùng phú phúc phún phúng phút phăm phăn phăng phĩnh phũ phơ phơi phơn phưng phương phước phướn phướng phường phưỡn phượng phượu phạch phạm phạn phạng phạt phả phải phản phảng phảy phấn phấp phất phầm phần phẩm phẩn phẩy phẫn phẫu phận phập phật phắc phắn phắp phắt phẳng phẹt phế phếch phết phề phềnh phều phễn phễu phệ phệnh phệt phỉ phỉnh phị phịa phịch phịt phịu phọng phọt phỏng phố phốc phối phốp phồ phồm phồn phồng phổ phổi phổng phỗng phộng phới phớt phờ phở phỡn phụ phục phụng phụt phủ phủi phứa phức phứt phừng phựa phựt pi pin ping png pom pu pác páp pê pía pô pông pơ qua quai quan quang quanh quao quau quay que quen queo quoàng quoạng quoắt quy quyên quyến quyết quyền quyển quyện quyệt quà quài quàn quàng quành quào quàu quày quá quác quách quái quán quáng quánh quáo quát quáu quân quây quãng què quèn quèo qué quén quéo quét quê quên quít quý quýnh quýt quăm quăn quăng quơ quạ quạc quạch quại quạng quạnh quạt quạu quạy quả quải quản quảng quảy quấc quấn quất quấy quần quầng quầy quẩn quẩng quẩy quẫn quẫy quận quật quậy quắc quắm quắn quắp quắt quằn quẳm quẳng quặc quặm quặn quặng quặp quặt quẹo quẹt quẻ quẽ quế quết quếu quềnh quều quệ quệch quện quệnh quệt quịt quốc quớ quờ quở quởn quỳ quỳnh quỳnh quỵ quỵt quỷ quỷnh quỹ ra rai ram ran rang ranh rao rau ray re ren reng reo ri ria rim rin rinh riu riêng riêu riết riếu riềm riềng riệt ro roa roi rom rong ru rua rum run rung ruốc ruối ruồi ruồng ruổi ruỗng ruộm ruộng ruột rà rài ràn ràng rành rào rày rá rác rách rái rám rán ráng ráo ráp rát ráy râm rân râu rây rã rãi rãnh rão rãy rè rèm rèn rèo ré rén réo rét rê rên rêu rì rìa rình rìu rí rích rít ríu rò ròi ròm ròng ró róc rói róm rón róng rót rô rôm rông rõ rõi rù rùa rùm rùn rùng rú rúc rúi rúm rún rúng rúp rút răm răn răng rĩ rũ rũa rơ rơi rơm rơn rư rưa rưng rươi rươm rương rước rưới rướm rướn rười rườm rườn rường rưởi rưỡi rượi rượn rượt rượu rạ rạc rạch rạn rạng rạo rạp rạt rạy rả rải rảnh rảo rảy rấm rấn rấp rất rầm rần rầu rầy rẩm rẩy rẫm rẫy rậm rận rập rật rắc rắm rắn rắp rắt rằm rằn rằng rặng rặt rẹo rẹt rẻ rẻng rẻo rẽ rế rếch rến rếp rết rề rền rều rể rểnh rễ rệ rệch rện rệp rệt rệu rỉ rỉa rỉnh rịa rịch rịn rịt rọ rọc rọi rọm rọt rỏ rỏm rỏn rốc rối rốn rống rốp rốt rồ rồi rồm rồng rổ rổi rổng rỗ rỗi rỗng rộ rộc rộm rộn rộng rộp rớ rớm rớt rờ rời rờm rờn rở rởm rởn rỡ rỡn rợ rợi rợm rợn rợp rợt rục rụi rụng rụt rủ rủa rủi rủn rủng rứa rức rứt rừng rửa rửng rữa rựa rực sa sai sam san sang sanh sao sau say se sen seo si sim sin sinh siu siêng siêu siết siểm siểng siễn so soa soi son song soong soà soài soái soán soát soóc soạn soạng soạt su sui sum sun sung suy suyển suyễn suê suôn suông suý suýt suất suối suốt suồng suỵt sà sài sàm sàn sàng sành sào sá sác sách sái sám sán sáng sánh sáo sáp sát sáu sâm sân sâu sây sã sãi sè sèo séc sém sét sê sên sênh sêu sì sình sính sít sò sòa sòi sòm sòng sóc sói sóm són sóng sót sô sôi sông sõi sõng sù sùi sùm sùng sú súc sún súng súp sút súy săm săn săng sĩ sũng sơ sơm sơn sư sưa sưng sưu sương sướng sướt sườn sường sưởi sượng sượt sạ sạch sạm sạn sạo sạp sạt sả sải sản sảng sảnh sảo sảy sấm sấn sấp sất sấu sấy sầm sần sầu sầy sẩm sẩn sẩy sẫm sậm sập sật sậu sậy sắc sắm sắn sắng sắp sắt sằng sẵn sặc sặm sặt sẹ sẹm sẹo sẻ sẻn sẽ sến sếp sếu sề sền sể sểnh sễ sệ sệt sỉ sỉa sỉnh sị sịa sịch sịt sọ sọc sọm sọt sỏ sỏi số sốc sống sốp sốt sồ sồi sồn sồng sổ sổi sổng sỗ sộ sộp sột sớ sới sớm sớn sớt sờ sờm sờn sở sởi sởn sỡ sợ sợi sụ sụa sục sụm sụn sụp sụt sủa sủi sủng sứ sứa sức sứt sừn sừng sử sửa sửng sửu sữa sững sự sực sựng sựt ta tai tam tan tang tanh tao tay tcvn te telex tem ten teng teo tha thai tham than thang thanh thao thau thay the then theo thi thia thin thinh thiu thiêm thiên thiêng thiêu thiếc thiến thiếp thiết thiếu thiềm thiền thiềng thiều thiểm thiển thiểu thiện thiệp thiệt thiệu tho thoa thoai thoang thoi thom thon thong thoà thoàn thoá thoái thoán thoáng thoát thoăn thoại thoạt thoả thoải thoảng thoắng thoắt thu thua thui thum thun thung thuyên thuyết thuyền thuê thuôn thuý thuần thuẫn thuận thuật thuế thuể thuốc thuốn thuồn thuồng thuổng thuỗn thuộc thuộm thuở thuỳ thuỵ thuỷ thà thài thàm thành thào thày thá thác thách thái thám thán tháng thánh tháo tháp tháu tháy thâm thân thâu thây thãi thè thèm thèn thèo thé thép thét thê thêm thênh thêu thì thìa thìn thình thìu thí thía thích thím thín thính thíp thít thò thòa thòi thòm thòng thó thóa thóc thói thóp thót thô thôi thôn thông thõng thù thùa thùi thùm thùng thùy thú thúc thúi thúng thút thúy thăm thăn thăng thũng thơ thơi thơm thơn thư thưa thưng thương thước thướt thườn thường thưởng thưỡi thưỡn thược thượng thượt thạc thạch thạnh thạo thạp thả thải thảm thản thảng thảnh thảo thảy thấm thấp thất thấu thấy thầm thần thầu thầy thẩm thẩn thẩu thẫm thẫn thậm thận thập thật thắc thắm thắn thắng thắp thắt thằn thằng thẳm thẳng thặng thẹn thẹo thẹp thẻ thẻo thẽ thế thếch thếp thết thề thềm thều thể thểu thệ thện thỉ thỉnh thỉu thị thịch thịnh thịt thịu thọ thọc thọt thỏ thỏa thỏi thỏm thố thốc thối thốn thống thốt thồ thồi thồm thồn thổ thổi thổn thộc thộn thộp thớ thớt thờ thời thờn thở thợ thợt thụ thục thụi thụng thụp thụt thụy thủ thủa thủi thủm thủng thủy thứ thức thừ thừa thừng thử thửa thững thự thực ti tia tim tin tinh tiu tivi tiêm tiên tiêng tiêu tiếc tiếm tiến tiếng tiếp tiết tiếu tiềm tiền tiều tiểu tiễn tiễu tiệc tiệm tiện tiệp tiệt to toa toan toang toanh toe toen toi tom ton tong toong tout toà toài toàn toàng toác toái toán toáng toát toáy toè toèn toé toét toòng toạ toạc toại toả toản toẹ toẹt toẻ toẽ tp tra trai tram tran trang tranh trao trau tre treo tri trinh triêng triêu triến triết triền triềng triều triển triện triệng triệt triệu tro troi tron trong tru trui trun trung truy truyền truyện truân truông truất truật truồng truột truỵ trà trài tràm tràn tràng trành trào tràu trày trá trác trách trái trám trán tráng tránh tráo tráp trát trâm trân trâng trâu trây trã trãi trè trèm trèn trèo trém tréo trét trê trên trêu trì trình trìu trí trích trít trò tròi tròm tròn tròng tróc trói tróm tróng trót trô trôi trôm trôn trông trõm trõn trù trùi trùm trùn trùng trú trúc trúm trúng trút trăm trăn trăng trĩ trĩnh trĩu trũi trũng trơ trơi trơn trưa trưng trương trước trướng trườn trường trưởng trưỡng trượng trượt trạc trạch trại trạm trạng trạo trạy trả trải trảm trảng trảo trảu trảy trấn trấp trấu trầm trần trầu trầy trẩn trẩu trẩy trẫm trậm trận trập trật trắc trắm trắng trắt trằm trằn trặc trặn trẹ trẹo trẹt trẻ trẻo trẽ trẽn trếch trết trề trễ trệ trệch trệt trệu trỉa trị trịa trịch trịnh trịt trọ trọc trọi trọn trọng trọt trỏ trỏi trỏng trố trốc trối trốn trống trồ trồi trồng trổ trổi trổng trỗ trộ trộc trội trộm trộn trớ trớn trớp trớt trờ trời trờn trở trợ trợn trợt trụ trụa trục trụi trụm trụn trụng trụp trụt trụy trủ trứ trứng trừ trừa trừng trửng trữ trự trực tu tua tui tum tun tung tuy tuyn tuyên tuyến tuyết tuyền tuyển tuyệt tuân tuôn tuông tuý tuấn tuất tuần tuế tuếch tuệ tuệch tuốt tuồn tuồng tuổi tuộc tuột tuỳ tuỵ tuỷ tv tw ty tà tài tàn tàng tành tào tàu tày tá tác tách tái tám tán táng tánh táo táp tát táu táy tâm tân tâng tâu tây tã tãi tè tèm tèn tèo té téc tém tép tét tê têm tên tênh têt têu tì tìm tình tìu tí tía tích tím tín tính típ tít tíu tò tòa tòe tòi tòm tòn tòng tó tóc tóe tói tóm tóp tót tô tôi tôm tôn tông tõe tõm tù tùm tùng tùy tú túc túi túm túng túp tút túy tăm tăn tăng tĩ tĩnh tĩu tũm tơ tơi tư tưa tưng tươi tươm tương tước tưới tướn tướng tướp tướt tườm tường tườu tưởi tưởng tược tượng tượp tượt tạ tạc tạch tại tạm tạng tạnh tạo tạp tạt tả tải tản tảng tảo tấc tấm tấn tấp tất tấu tấy tầm tần tầng tầy tẩm tẩn tẩu tẩu tẩy tận tập tật tậu tắc tắm tắn tắp tắt tằm tằn tằng tẳn tặc tặn tặng tẹo tẹp tẹt tẻ tẻm tẻo tẽ tẽn tế tếch tết tếu tề tềnh tể tểnh tễ tễnh tệ tệp tỉ tỉa tỉm tỉnh tị tịch tịnh tịt tịu tọa tọc tọe tọng tọp tọt tỏ tỏa tỏe tỏi tỏm tỏng tố tốc tối tốn tống tốp tốt tồ tồi tồn tồng tổ tổn tổng tộ tộc tội tột tớ tới tớn tớp tớt tờ tời tởm tợ tợn tợp tụ tục tụi tụm tụng tụt tụy tủ tủa tủi tủm tủn tủy tứ tứa tức từ từng tử tửa tửng tửu tự tựa tựu tỵ tỷ u ubnd um un ung unicode url uy uyên uyển uôm uý uất uẩn uẩy uế uể uốn uống uổng uột uở uỳnh uỵch uỷ v va vai van vang vanh vao vay ve ven veo vi vinh viqr viscii viêm viên viếng viết viền viển viễn việc viện việt vn vni vo voan voi von vong vu vua vui vun vung vuông vuốt vuột và vài vàm vàn vàng vành vào vày vá vác vách vái ván váng vánh váo váp vát váy vâm vân vâng vây vã vãi vãn vãng vãnh vè vèo vé véc vén véo vét vê vên vênh vêu vì ví vía vích vít víu vò vòi vòm vòn vòng vó vóc vói vón vóng vót vô vôi vôn vông võ võng vù vùa vùi vùn vùng vú vúc vút văn văng vĩ vĩnh vũ vũm vũng vơ vơi vưng vưu vươn vương vướng vườn vưởng vược vượn vượng vượt vạ vạc vạch vại vạm vạn vạng vạnh vạp vạt vạy vả vải vảng vảy vấn vấp vất vấu vấy vần vầng vầu vầy vẩn vẩu vẩy vẫn vẫy vậm vận vập vật vậy vắc vắn vắng vắt vằm vằn vằng vẳng vặc vặn vặt vẹm vẹn vẹo vẹt vẻ vẻn vẻo vẽ vế vếch vết vếu về vền vều vểnh vệ vện vệt vỉ vỉa vị vịm vịn vịnh vịt vọ vọc vọi vọng vọp vọt vỏ vỏn vỏng vố vốc vối vốn vống vồ vồi vồn vồng vổ vổng vỗ vội vớ với vớt vờ vời vờn vở vởn vỡ vợ vợi vợt vụ vục vụn vụng vụt vức vứt vừa vừng vửng vữa vững vựa vực vực vựng web xa xam xan xang xanh xao xay xe xem xen xeo xi xia xim xin xinh xit xiêm xiên xiêu xiếc xiết xiềng xiểm xiển xiểng xo xoa xoan xoang xoay xoe xoen xoi xom xon xong xoong xoà xoài xoàm xoàn xoàng xoành xoá xoác xoát xoáy xoã xoè xoèn xoét xoăn xoạc xoạch xoạng xoả xoải xoảng xoắn xoẹ xoẹt xu xua xui xum xung xuy xuya xuynh xuyên xuyến xuyết xuân xuây xuê xuôi xuý xuýt xuất xuẩn xuề xuềnh xuể xuệch xuống xuồng xuổng xuỳ xuỵt xà xài xàm xàng xành xào xàu xá xác xách xái xám xán xáo xáp xát xáy xâm xâu xây xã xè xèn xèng xèo xé xéc xén xéo xép xét xê xên xênh xêu xì xình xìu xí xía xích xính xít xíu xòa xòe xòm xòng xó xóa xóc xói xóm xón xóp xót xô xôi xôm xôn xông xõa xõm xõng xù xùi xùm xùng xùy xú xúc xúi xúm xúng xúp xút xúy xăm xăn xăng xĩnh xũ xơ xơi xơm xơn xưa xưng xương xước xướng xười xưởng xược xạ xạc xạch xạo xạp xạu xả xảm xảnh xảo xảu xảy xấc xấp xấu xầm xẩm xẩn xẩu xẩy xập xắc xắm xắn xắp xằng xẵng xẹc xẹo xẹp xẹt xẻ xẻn xẻng xẻo xẽo xế xếch xếp xềm xềnh xều xể xệ xệch xệp xệu xỉ xỉa xỉn xỉnh xỉu xị xịch xịn xịt xịu xọ xọc xọe xọp xỏ xỏa xỏng xố xốc xối xốn xống xốp xốt xồ xồm xồn xồng xổ xổi xổm xổng xộc xộn xộp xớ xới xớp xớt xờ xờm xở xởi xởn xỡ xợp xợt xụ xục xụi xụp xủng xứ xức xứng xừ xử xử xửa xửng xực y yên yêng yêu yếm yến yết yếu yểm yểng yểu à ào á ác ách ái ám án áng ánh áo áp át áy âm ân âu ã è èo é éc ém én éo ép ét ê êm êu ì ìn ình í ích ín ít ò òa òi òm òng ó óc óe ói óng óp ót ô ôi ôm ôn ông ù ùa ùm ùn ùng ú úa úi úm úng úp út úy ý ăm ăn ăng đa đai đam đan đang đanh đao đau đay đe đem đen đeo đi đin đinh điên điêu điếc điếm điếng điếu điền điều điểm điển điểu điệm điện điệp điệu đo đoan đoi đom đon đong đoài đoàn đoàng đoành đoá đoái đoán đoãng đoạ đoạn đoạt đoản đoảng đu đua đui đum đun đung đuôi đuốc đuối đuổi đuỗn đuột đà đài đàm đàn đàng đành đào đày đá đác đách đái đám đán đáng đánh đáo đáp đát đáy đâm đâu đây đã đãi đãng đãy đè đèm đèn đèo đéc đéo đét đê đêm đên đênh đêu đì đìa đình đìu đía đích đính đít đò đòi đòm đòn đòng đó đóa đóc đói đóm đón đóng đót đô đôi đôm đôn đông đõ đù đùa đùi đùm đùn đùng đú đúc đúm đún đúng đúp đút đăm đăng đĩ đĩa đĩnh đũa đũng đơ đơm đơn đưa đưng đương đước đười đườn đường đưỡn được đượm đạc đạch đại đạm đạn đạo đạp đạt đả đảm đản đảng đảo đảy đấm đấng đất đấu đấy đầm đần đầu đầy đẩu đẩy đẫm đẫn đẫy đậm đận đập đật đậu đậy đắc đắk đắm đắn đắng đắp đắt đằm đằn đằng đẳng đẵm đẵn đẵng đặc đặn đặng đặt đẹn đẹp đẹt đẻ đẽ đẽo đế đếch đếm đến đề đềm đền đềnh đều để đểnh đểu đễ đễnh đệ đệm đệp đỉa đỉnh địa địch định địt địu đọ đọa đọc đọi đọn đọng đọp đọt đỏ đỏi đỏm đố đốc đối đốm đốn đống đốp đốt đồ đồi đồm đồn đồng đổ đổi đổng đỗ đỗi độ độc đội độn động độp đột đớ đới đớn đớp đớt đờ đời đờm đờn đởm đởn đỡ đợ đợi đợp đợt đụ đục đụn đụng đụp đụt đủ đủi đủng đứ đứa đức đứng đứt đừ đừa đừng đử đực đựng ĩ ĩnh ơ ơi ơn ư ưa ưng ưu ươi ươm ươn ương ước ướm ướp ướt ườn ưỡn ạ ạch ạnh ạo ạt ả ải ảm ảng ảnh ảo ấm ấn ấp ất ấu ấy ầm ầy ẩm ẩn ẩu ẩy ậc ậm ập ắc ắng ắp ắt ằng ẳng ẵm ặc ặp ẹ ẹo ẹp ẹt ẻn ẻo ẽo ế ếch ếm ề ềnh ễnh ệ ệch ện ệnh ỉ ỉa ỉm ỉn ỉu ị ịch ịt ọ ọc ọe ọi ọp ọt ỏe ỏi ỏm ỏn ỏng ố ốc ối ốm ốm ống ốp ốt ồ ồm ồn ồng ổ ổi ổn ổng ộ ộc ộn ộp ớ ới ớm ớn ớt ờ ờn ở ỡm ợ ợt ụ ụa ục ụp ụt ủ ủa ủi ủn ủng ủy ứ ứa ức ứng ừ ừng ửng ựa ực ỷ nghía";
  var ALL_VIETNAMESE_SINGLE_VOWELS = [
    "a",
    "á",
    "à",
    "ả",
    "ã",
    "ạ",
    "ă",
    "ắ",
    "ằ",
    "ẳ",
    "ẵ",
    "ặ",
    "â",
    "ấ",
    "ầ",
    "ẩ",
    "ẫ",
    "ậ",
    "e",
    "é",
    "è",
    "ẻ",
    "ẽ",
    "ẹ",
    "ê",
    "ế",
    "ề",
    "ể",
    "ễ",
    "ệ",
    "i",
    "í",
    "ì",
    "ỉ",
    "ĩ",
    "ị",
    "o",
    "ó",
    "ò",
    "ỏ",
    "õ",
    "ọ",
    "ô",
    "ố",
    "ồ",
    "ổ",
    "ỗ",
    "ộ",
    "ơ",
    "ớ",
    "ờ",
    "ở",
    "ỡ",
    "ợ",
    "u",
    "ú",
    "ù",
    "ủ",
    "ũ",
    "ụ",
    "ư",
    "ứ",
    "ừ",
    "ử",
    "ữ",
    "ự",
    "y",
    "ý",
    "ỳ",
    "ỷ",
    "ỹ",
    "ỵ",
    "đ"
  ];
  var RARE_AND_PLACE_SYLLABLES = [
    // Tây Nguyên & Ethnic Toponyms — âm tiết không có trong từ điển chuẩn (bao gồm cả dạng thanh ngang, có dấu và dạng trung gian khi gõ phím ở cuối từ)
    "đắk",
    "đăk",
    "đrak",
    "đrák",
    "đrắk",
    "đrăk",
    "drắk",
    "drăk",
    "drak",
    "drák",
    "lắk",
    "lăk",
    "lak",
    "lák",
    "nông",
    "krông",
    "pắk",
    "păk",
    "pak",
    "pák",
    "búk",
    "buk",
    "păh",
    "pah",
    "páh",
    "prông",
    "ana",
    "ea",
    "h'leo",
    "hleo",
    "kar",
    "súp",
    "m'đrắk",
    "m'đrăk",
    "m'đrak",
    "m'đrák",
    "mdrắk",
    "mdrăk",
    "mdrak",
    "mdrák",
    "mil",
    "glong",
    "đoa",
    "grai",
    "h'drai",
    "hdrai",
    "m'gar",
    "mgar",
    "kuin",
    "r'lấp",
    "r’lấp",
    "rlấp",
    "pleiku",
    "chư",
    "cư",
    "sê",
    "bông",
    "năng",
    "đức",
    "cơ",
    // Rare, Classical & Dialect Vietnamese Syllables
    "pa",
    "pá",
    "pà",
    "pả",
    "pã",
    "pạ",
    "nguầy",
    "nguậy",
    "dzìa",
    "dzí",
    "dzị",
    "dzô",
    "dzậy",
    "dzách",
    "dách",
    "zị",
    "zi",
    "zia",
    "hén",
    "nghen",
    "hổng",
    "hạp",
    "quớt",
    "nư",
    "quỉ",
    "lét",
    "mụi",
    "bẹo",
    "bậu",
    "tỏn",
    "hum",
    "chác",
    "cháo",
    "khồng",
    "khỗng",
    "khộng",
    "ngánh",
    "ngãnh",
    "quỡn",
    "quỡ",
    "huỡ",
    "uồn",
    "toãn",
    "toạn",
    "chớn",
    "chởn",
    "chỡn",
    "chón",
    "chòn",
    "bớn",
    "bởn",
    "mớn",
    "mờn",
    "mỡn",
    "mợn",
    "rớn",
    "xớn",
    "xờn",
    "xợn",
    "tơn",
    "tờn",
    "tởn",
    "tỡn",
    "thớn",
    "thởn",
    "thỡn",
    "thợn",
    "đỡn",
    "đợn",
    "hởn",
    "hỡn",
    "hợn",
    "cởn",
    "lỡn",
    "goong",
    "goòng",
    "goóng",
    "xoong",
    "xoòng",
    "xoóng",
    "xoọng",
    "boong",
    "boòng",
    "boóng",
    "moong",
    "toong"
  ];
  var SOUTHERN_DIALECT_SYLLABLES = [
    // Biến âm dz / z
    "dzà",
    "dzạ",
    "dzái",
    "dzài",
    "dzán",
    "dzàng",
    "dzành",
    "dzào",
    "dzạt",
    "dzày",
    "dzắc",
    "dzăm",
    "dzằn",
    "dzăng",
    "dzắt",
    "dzầm",
    "dzần",
    "dzập",
    "dzật",
    "dzậy",
    "dzẻ",
    "dzẽ",
    "dzẹp",
    "dzề",
    "dzễ",
    "dzế",
    "dzì",
    "dzìa",
    "dzí",
    "dzịn",
    "dzít",
    "dzị",
    "dzịu",
    "dzò",
    "dzòm",
    "dzòn",
    "dzòng",
    "dzọt",
    "dzô",
    "dzội",
    "dzột",
    "dzớ",
    "dzới",
    "dzợt",
    "dzù",
    "dzụ",
    "dzục",
    "dzui",
    "dzùm",
    "dzùng",
    "dzụt",
    "dzừ",
    "dzừa",
    "dzừng",
    "dzứt",
    "dzự",
    "dzựng",
    "zì",
    "zị",
    "zậy",
    "zô",
    // Chánh tả miền Nam & biến âm vần (chánh, sanh, nhứt, thiệt, gởi, quỉ, chưn...)
    "chánh",
    "sanh",
    "tánh",
    "thạnh",
    "huỳnh",
    "kiểng",
    "ngươn",
    "nhứt",
    "nhựt",
    "thiệt",
    "chưn",
    "cưn",
    "hưn",
    "mưn",
    "tưn",
    "xưn",
    "qui",
    "quí",
    "quì",
    "quĩ",
    "quị",
    "quít",
    "quịt",
    "gởi",
    "ngởi",
    "chởi",
    "dởi",
    "mởi",
    "nởi",
    "tởi",
    "xởi",
    "bửng",
    "bựng",
    // Đại từ, trợ từ, thán từ & từ đặc trưng Nam Bộ
    "ảnh",
    "bả",
    "cổ",
    "ổng",
    "trỏng",
    "bển",
    "ngoải",
    "trển",
    "nghen",
    "hen",
    "hông",
    "hổng",
    "mèn",
    "đéc",
    "nư",
    "tỏn",
    "hum",
    "quởn",
    "quỡn",
    "quớt",
    "chét",
    "nhỏng",
    "rịch",
    "xàm",
    "xạo",
    "chằn",
    "lữa",
    "thúi",
    "giựt",
    "ngươi",
    "sẩy",
    "xẩy",
    "mánh",
    "mụi",
    "tém",
    "lết",
    "cù",
    "lét",
    "trớt",
    "dách",
    "dzách"
  ];
  var MODERN_SLANG_AND_COLLOQUIAL_SYLLABLES = [
    "xò",
    "xõ",
    "xộp",
    "xịn",
    "phèn",
    "phẻn",
    "quẩy",
    "quạo",
    "ngáo",
    "trẩu",
    "nhoi",
    "bựa",
    "dỏm",
    "đỏm",
    "chảnh",
    "choảng",
    "mót",
    "quắc",
    "ghẹo"
  ];
  function canon(str) {
    if (!str) return "";
    return str.normalize("NFC").replace(/[\u2018\u2019\u201B\u02BC\u02B9]/g, "'").toLowerCase();
  }
  var _vietnameseWordSet = null;
  function getVietnameseWordSet() {
    if (!_vietnameseWordSet) {
      _vietnameseWordSet = /* @__PURE__ */ new Set();
      const rawTokens = VIETNAMESE_WORDS_STRING.split(" ");
      for (let i = 0; i < rawTokens.length; i++) {
        const c = canon(rawTokens[i]);
        if (c) _vietnameseWordSet.add(c);
      }
      ALL_VIETNAMESE_SINGLE_VOWELS.forEach((v) => _vietnameseWordSet.add(canon(v)));
      RARE_AND_PLACE_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
      SOUTHERN_DIALECT_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
      MODERN_SLANG_AND_COLLOQUIAL_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
    }
    return _vietnameseWordSet;
  }

  // src/engine/dictionary.js
  var COMMON_ENGLISH_WORDS = /* @__PURE__ */ new Set([
    // Telex trap: words ending with 's' (sắc)
    "as",
    "is",
    "us",
    "this",
    "yes",
    "bus",
    "plus",
    "has",
    "was",
    "its",
    "his",
    "less",
    "miss",
    "pass",
    "boss",
    "loss",
    "mass",
    "class",
    "glass",
    "press",
    "cross",
    "dress",
    "guess",
    "basis",
    "status",
    "focus",
    "virus",
    "bonus",
    "canvas",
    "chaos",
    "oasis",
    "crisis",
    "texas",
    "paris",
    "series",
    "species",
    "famous",
    "fcitx",
    "fcitx5",
    "versus",
    "alias",
    "radius",
    "minus",
    "genius",
    "census",
    "campus",
    "circus",
    "lotus",
    "chorus",
    "walrus",
    "corpus",
    "hiatus",
    "nexus",
    "news",
    "always",
    "sometimes",
    "perhaps",
    "business",
    "process",
    "access",
    "success",
    "address",
    "docs",
    "doc",
    // Telex trap: words with 'x' (ngã)
    "text",
    "next",
    "context",
    "exit",
    "taxi",
    "linux",
    "unix",
    "ajax",
    "max",
    "mix",
    "box",
    "fix",
    "tax",
    "six",
    "fax",
    "sex",
    "complex",
    "index",
    "matrix",
    "syntax",
    "luxury",
    "reflex",
    "prefix",
    "suffix",
    "annex",
    "latex",
    "duplex",
    "vertex",
    "convex",
    "cortex",
    "pixel",
    "toxic",
    "oxide",
    "oxygen",
    "galaxy",
    "maximum",
    "expert",
    "expect",
    "express",
    "explain",
    "explore",
    "export",
    "extent",
    "extra",
    "extreme",
    "exact",
    "exam",
    "example",
    "exist",
    "execute",
    "exercise",
    "exceed",
    "except",
    "excess",
    "exchange",
    "excite",
    "exclude",
    "excuse",
    "expand",
    "expend",
    "expense",
    "expire",
    // Telex trap: words with 'r' (hỏi) & double 'r' cancellation traps (rr -> r)
    "for",
    "or",
    "our",
    "your",
    "her",
    "their",
    "other",
    "after",
    "under",
    "over",
    "never",
    "ever",
    "water",
    "paper",
    "order",
    "power",
    "user",
    "super",
    "server",
    "number",
    "member",
    "driver",
    "render",
    "router",
    "player",
    "master",
    "worker",
    "filter",
    "center",
    "letter",
    "matter",
    "better",
    "doctor",
    "factor",
    "sector",
    "vector",
    "senior",
    "junior",
    "error",
    "horror",
    "mirror",
    "sensor",
    "cursor",
    "armor",
    "harbor",
    "color",
    "flavor",
    "labor",
    "mayor",
    "prior",
    "vigor",
    "vapor",
    "favor",
    "clear",
    "near",
    "dear",
    "fear",
    "hear",
    "bear",
    "wear",
    "tear",
    "year",
    "gear",
    "rear",
    "pear",
    "sorry",
    "array",
    "carrier",
    "barrel",
    "correct",
    "corrupt",
    "borrow",
    "arrow",
    "narrow",
    "marry",
    "carry",
    "worry",
    "current",
    "currency",
    "occur",
    "occurred",
    "refer",
    "referred",
    "prefer",
    "preferred",
    // Telex trap: words with 'w' (horn/breve: ơ, ư, ă)
    "we",
    "with",
    "work",
    "word",
    "world",
    "week",
    "write",
    "wrong",
    "window",
    "windows",
    "white",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "why",
    "web",
    "way",
    "wait",
    "want",
    "well",
    "will",
    "would",
    "without",
    "within",
    "website",
    "wifi",
    "watch",
    "warm",
    "wall",
    "wave",
    "wide",
    "wife",
    "wild",
    "wind",
    "wine",
    "wing",
    "wire",
    "wise",
    "wish",
    "wood",
    "wool",
    "wrap",
    "warn",
    "wash",
    "waste",
    "west",
    "worth",
    "worthy",
    "wheel",
    "whale",
    "wheat",
    "whip",
    "whisper",
    // Telex trap: words with 'f' (huyền)
    "of",
    "if",
    "off",
    "life",
    "safe",
    "file",
    "find",
    "first",
    "from",
    "form",
    "fast",
    "fact",
    "face",
    "fail",
    "fair",
    "fall",
    "false",
    "farm",
    "feat",
    "feed",
    "feel",
    "feet",
    "fell",
    "felt",
    "few",
    "fill",
    "film",
    "fine",
    "fire",
    "firm",
    "fish",
    "fit",
    "five",
    "flat",
    "flight",
    "floor",
    "flow",
    "fly",
    "folk",
    "food",
    "foot",
    "force",
    "fork",
    "free",
    "friend",
    "front",
    "fruit",
    "full",
    "fund",
    "funny",
    "future",
    // Telex trap: words with 'j' (nặng)
    "job",
    "join",
    "joy",
    "jump",
    "just",
    "judge",
    "juice",
    "jury",
    "jail",
    "jar",
    "jaw",
    "jean",
    "jeep",
    "jelly",
    "jest",
    "jet",
    "jewel",
    "jig",
    "jinx",
    "jockey",
    "jog",
    "joke",
    "jolly",
    "jolt",
    "journal",
    "journey",
    "judo",
    "jug",
    "juggler",
    "juggle",
    "jumbo",
    "jumper",
    "junction",
    "jungle",
    "junior",
    "junk",
    "junkie",
    "jupiter",
    "juror",
    "justice",
    "justify",
    // Tech, Developer & Common Modern Words
    "api",
    "app",
    "blog",
    "browser",
    "bug",
    "build",
    "chat",
    "chrome",
    "click",
    "client",
    "cloud",
    "code",
    "commit",
    "component",
    "config",
    "console",
    "css",
    "data",
    "dev",
    "developer",
    "div",
    "docker",
    "dom",
    "download",
    "edge",
    "email",
    "export",
    "extension",
    "facebook",
    "figma",
    "firefox",
    "font",
    "form",
    "frontend",
    "git",
    "github",
    "gmail",
    "google",
    "host",
    "html",
    "http",
    "https",
    "icon",
    "id",
    "iframe",
    "image",
    "import",
    "input",
    "install",
    "internet",
    "issue",
    "javascript",
    "json",
    "key",
    "link",
    "linux",
    "load",
    "log",
    "macos",
    "meta",
    "modal",
    "module",
    "net",
    "network",
    "node",
    "npm",
    "offline",
    "online",
    "open",
    "package",
    "page",
    "password",
    "patch",
    "ping",
    "plugin",
    "post",
    "pull",
    "push",
    "python",
    "react",
    "repo",
    "request",
    "response",
    "router",
    "run",
    "safari",
    "save",
    "script",
    "server",
    "service",
    "setup",
    "site",
    "span",
    "sql",
    "ssh",
    "status",
    "style",
    "sync",
    "tab",
    "tag",
    "task",
    "test",
    "time",
    "token",
    "tool",
    "true",
    "false",
    "null",
    "undefined",
    "ui",
    "update",
    "upload",
    "url",
    "user",
    "version",
    "video",
    "view",
    "vite",
    "vscode",
    "webpack",
    "website",
    "zip",
    "tesla",
    "saas",
    "sax",
    "core",
    "care",
    "case",
    "cost",
    "hard",
    "screen",
    "system",
    "branch",
    "merge",
    "rebase",
    "clone",
    "fetch",
    "diff",
    "stash",
    "release",
    "deploy",
    "debug",
    "lint",
    "bundle",
    "minify",
    "source",
    "assets",
    "public",
    "dist",
    "node_modules",
    "license",
    "readme",
    "env",
    "yaml",
    "toml",
    "xml",
    "scss",
    "less",
    "ts",
    "jsx",
    "tsx",
    "sh",
    "kubernetes",
    "k8s",
    "tailwind",
    "typescript",
    "postgres",
    "postgresql",
    "redis",
    "graphql",
    "webhook",
    "endpoint",
    "devops",
    "staging",
    "production",
    "frontend",
    "backend",
    "microservice",
    "payload",
    "auth",
    "oauth",
    "middleware",
    "handler",
    "schema",
    "query",
    "mutation",
    "resolver",
    "prisma",
    "supabase",
    "nextjs",
    "nuxt",
    "vue",
    "angular",
    "svelte",
    "electron",
    "tauri",
    "rust",
    "cargo",
    "golang",
    "pnpm",
    "yarn",
    "bun",
    "deno",
    "eslint",
    "prettier",
    "vitest",
    "jest",
    "modern",
    "variable",
    "mixed",
    "lowercase",
    "uppercase",
    "lower",
    "upper",
    "power",
    "tower",
    "shower",
    "slower",
    "flower",
    "low",
    "flow",
    "show",
    "slow",
    "blow",
    "grow",
    "draw",
    "raw",
    "law",
    "saw",
    "few",
    "view",
    "tick",
    "backtick",
    "reset",
    "restore",
    "refactor",
    "list",
    "host",
    "suggest",
    "axis",
    "regex",
    "music",
    "amazon",
    "cause",
    "profile",
    "upstream",
    "settings",
    // Common -st and frequent short English words
    "cast",
    "best",
    "last",
    "past",
    "rest",
    "most",
    "must",
    "just",
    "dust",
    "rust",
    "disk",
    "desk",
    "risk",
    "task",
    "mask",
    "cost",
    "lost",
    "fast",
    "post",
    "host",
    // Common dev actions & keywords frequently trapped in Telex
    "casing",
    "parse",
    "parsing",
    "parser",
    "scale",
    "scaling",
    "scaled",
    "scaler",
    "close",
    "closing",
    "closed",
    "closer",
    "raise",
    "raising",
    "raised",
    "lose",
    "losing",
    "lost",
    "loser",
    "browse",
    "browsing",
    "browsed",
    "increase",
    "decrease",
    "pause",
    "phrase",
    "please",
    "refuse",
    "reuse",
    "chase",
    "base",
    "basic",
    "route",
    "routing",
    "serve",
    "serving",
    "served",
    "match",
    "matching",
    "matched",
    "switch",
    "switching",
    "switched",
    "search",
    "searching",
    "searched",
    "track",
    "tracking",
    "tracked",
    "stack",
    "stacking",
    "stacked",
    "block",
    "blocking",
    "blocked",
    "lock",
    "locking",
    "locked",
    "start",
    "starting",
    "started",
    "stop",
    "stopping",
    "stopped",
    "bypass",
    "bypassing",
    "bypassed",
    "format",
    "formatting",
    "formatted",
    "map",
    "mapping",
    "mapped",
    "mask",
    "masking",
    "masked",
    "ask",
    "asking",
    "asked",
    "cache",
    "caching",
    "cached",
    "crash",
    "crashing",
    "crashed",
    "flash",
    "flashing",
    "flashed",
    "hash",
    "hashing",
    "hashed",
    "sort",
    "sorting",
    "sorted",
    "send",
    "sending",
    "sent",
    "read",
    "reading",
    "edit",
    "editing",
    "edited",
    "delete",
    "deleting",
    "deleted",
    "create",
    "creating",
    "created",
    "select",
    "selecting",
    "selected",
    "insert",
    "inserting",
    "inserted",
    "bind",
    "binding",
    "bound",
    "mount",
    "mounting",
    "mounted",
    "attach",
    "attaching",
    "attached",
    "detach",
    "detaching",
    "detached",
    "encode",
    "encoding",
    "encoded",
    "decode",
    "decoding",
    "decoded",
    "encrypt",
    "decrypt",
    "compress",
    "decompress",
    "listen",
    "listening",
    "connect",
    "connecting",
    "connected",
    "disconnect",
    "emit",
    "emitting",
    "dispatch",
    "resolve",
    "resolving",
    "resolved",
    "reject",
    "rejecting",
    "throw",
    "handle",
    "handling",
    "handled",
    "mutate",
    "mutating",
    "validate",
    "validating",
    "validated",
    "sanitize",
    "compile",
    "compiling",
    "invoke",
    "invoking",
    "invoked",
    "trigger",
    "triggering",
    "triggered",
    "cleanup",
    "flush",
    "flushing",
    "flushed",
    "drain",
    "poll",
    "polling",
    "stream",
    "streaming",
    "streamed",
    "buffer",
    "buffering",
    "buffered",
    "queue",
    "queuing",
    "queued",
    "shift",
    "shifting",
    "shifted",
    "slice",
    "slicing",
    "sliced",
    "splice",
    "splicing",
    "spliced",
    "split",
    "splitting",
    "copy",
    "copying",
    "copied",
    "paste",
    "pasting",
    "pasted",
    "undo",
    "redo",
    "print",
    "printing",
    "printed",
    "stage",
    "staging",
    "staged",
    "publish",
    "publishing",
    "published",
    "draft",
    "drafting",
    "drafted",
    "archive",
    "archiving",
    "archived",
    "recover",
    "recovering",
    "recovered",
    "repair",
    "rebuilding",
    "rebuilt",
    "restart",
    "restarting",
    "restarted",
    "reload",
    "reloading",
    "reloaded",
    "refresh",
    "refreshing",
    "refreshed",
    "revert",
    "reverting",
    "reverted",
    "clear",
    "clearing",
    "cleared",
    "clean",
    "cleaning",
    "cleaned",
    "wipe",
    "wiping",
    "wiped",
    "erase",
    "erasing",
    "erased",
    "trim",
    "trimming",
    "trimmed",
    "pad",
    "padding",
    "padded",
    "wrap",
    "wrapping",
    "wrapped",
    "escape",
    "escaping",
    "escaped",
    "assign",
    "assigning",
    "assigned",
    "define",
    "defining",
    "defined",
    "declare",
    "declaring",
    "declared",
    "compute",
    "computing",
    "computed",
    "count",
    "counting",
    "counted",
    "locate",
    "locating",
    "located",
    "inspect",
    "inspecting",
    "inspected",
    "audit",
    "auditing",
    "audited",
    "check",
    "checking",
    "checked",
    "assert",
    "asserting",
    "asserted",
    "verify",
    "verifying",
    "verified",
    "mock",
    "mocking",
    "mocked",
    "stub",
    "benchmark",
    "measure",
    "trace",
    "tracing",
    "traced",
    "warn",
    "warning",
    "warned",
    "notify",
    "alert",
    "alerting",
    "alerted",
    "toast",
    "prompt",
    "confirm",
    "confirming",
    "confirmed",
    "toggle",
    "toggling",
    "toggled",
    "collapse",
    "collapsing",
    "collapsed",
    "scroll",
    "scrolling",
    "scrolled",
    "zoom",
    "zooming",
    "zoomed",
    "drag",
    "dragging",
    "dragged",
    "hover",
    "hovering",
    "press",
    "pressing",
    "pressed",
    "tap",
    "tapping",
    "tapped",
    "forward",
    "forwarding",
    "forwarded",
    "redirect",
    "redirecting",
    "redirected",
    // General high frequency English words
    "the",
    "be",
    "to",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "not",
    "on",
    "he",
    "you",
    "do",
    "at",
    "but",
    "by",
    "they",
    "say",
    "she",
    "an",
    "my",
    "one",
    "all",
    "there",
    "so",
    "up",
    "out",
    "about",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "no",
    "him",
    "know",
    "take",
    "people",
    "into",
    "good",
    "some",
    "could",
    "them",
    "see",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "think",
    "also",
    "back",
    "use",
    "two",
    "how",
    "even",
    "new",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "city",
    "center",
    "cell",
    "circle",
    "gift",
    "game",
    "great",
    "going",
    "gone",
    "group",
    "guide",
    "guest",
    "guard",
    "guy",
    // Telex trap words
    "cocoa",
    "momo",
    "mono",
    "awkward",
    "downward",
    "forward",
    "malware",
    "network",
    "owe",
    "password",
    "software",
    "twee",
    "weee"
  ]);
  var DEFAULT_USER_WORDS = Array.from(COMMON_ENGLISH_WORDS).sort();
  var UserDictionary = class {
    constructor(initialWords = DEFAULT_USER_WORDS) {
      this.words = /* @__PURE__ */ new Set();
      this.customWords = /* @__PURE__ */ new Set();
      this.cachedIndex = null;
      this.loadWords(initialWords);
    }
    loadWords(wordsList) {
      if (Array.isArray(wordsList)) {
        const defaultSet = new Set(DEFAULT_USER_WORDS.map((w) => canon(w)));
        wordsList.forEach((w) => {
          const clean = canon(w);
          if (clean) {
            this.words.add(clean);
            if (!defaultSet.has(clean)) {
              this.customWords.add(clean);
            }
          }
        });
        this.cachedIndex = null;
      }
    }
    getIndex() {
      if (!this.cachedIndex) {
        this.cachedIndex = Array.from(this.words).map((w) => ({
          word: w,
          lower: w.toLowerCase(),
          stripped: w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase()
        }));
      }
      return this.cachedIndex;
    }
    has(word) {
      if (!word) return false;
      return this.words.has(canon(word));
    }
    /**
     * Check if the raw keystroke sequence matches any custom/learned user word prefix.
     * Prevents premature Vietnamese diacritic placement on words the user intentionally customized.
     * Special rule: If a learned word contains numbers (e.g. VNI tone triggers like 'da5'),
     * it must only match when rawSeq itself reaches or includes the number key, so typing 'da'
     * is not blocked from taking standard accents.
     */
    isCustomUserWordPrefix(rawSeq) {
      if (!rawSeq || rawSeq.length < 2) return false;
      const lower = rawSeq.toLowerCase();
      for (const w of this.customWords) {
        if (/\d/.test(w) && !/\d/.test(lower)) {
          continue;
        }
        if (w.startsWith(lower)) return true;
      }
      return false;
    }
    getCustomWords() {
      return Array.from(this.customWords).sort();
    }
    add(word) {
      const clean = canon(word);
      if (!clean) return false;
      this.words.add(clean);
      this.customWords.add(clean);
      this.cachedIndex = null;
      this.saveToStorage();
      return true;
    }
    remove(word) {
      const clean = canon(word);
      if (!clean) return false;
      this.customWords.delete(clean);
      const deleted = this.words.delete(clean);
      if (deleted) {
        this.cachedIndex = null;
        this.saveToStorage();
      }
      return deleted;
    }
    clear() {
      this.words.clear();
      this.customWords.clear();
      this.cachedIndex = null;
      this.saveToStorage();
    }
    getWords() {
      return Array.from(this.words).sort();
    }
    count() {
      return this.words.size;
    }
    /**
     * Import from text (line by line or comma-separated or JSON)
     */
    importText(text) {
      if (!text || typeof text !== "string") return 0;
      let addedCount = 0;
      const raw = text.trim();
      if (raw.startsWith("[") || raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : Object.keys(parsed);
          list.forEach((w) => {
            if (this.add(String(w))) addedCount++;
          });
          return addedCount;
        } catch {
        }
      }
      const lines = raw.split(/[\r\n,;]+/);
      lines.forEach((l) => {
        const w = l.trim().toLowerCase();
        if (w && !this.words.has(w)) {
          this.words.add(w);
          this.customWords.add(w);
          addedCount++;
        }
      });
      if (addedCount > 0) {
        this.cachedIndex = null;
        this.saveToStorage();
      }
      return addedCount;
    }
    /**
     * Export to plain text or JSON
     */
    exportText(format = "txt") {
      const list = this.getWords();
      if (format === "json") {
        return JSON.stringify(list, null, 2);
      }
      return list.join("\n");
    }
    /**
     * Persistence with chrome.storage.local (to prevent 8KB quota exhaustion on sync)
     * Falls back to chrome.storage.sync (for legacy migrations) and localStorage.
     */
    async saveToStorage() {
      const list = this.getWords();
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("avim_user_dictionary", JSON.stringify(list));
        }
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          await new Promise((resolve) => {
            try {
              const p = storageLocal.set({ avim_user_dictionary: list }, () => resolve());
              if (p && typeof p.then === "function") p.then(resolve).catch(resolve);
            } catch {
              resolve();
            }
          });
        }
      } catch (err) {
        console.warn("Could not save user dictionary:", err);
      }
    }
    async loadFromStorage() {
      try {
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          const res = await new Promise((resolve) => {
            try {
              const p = storageLocal.get(["avim_user_dictionary"], (r) => resolve(r || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (Array.isArray(res.avim_user_dictionary) && res.avim_user_dictionary.length > 0) {
            this.loadWords(res.avim_user_dictionary);
            return;
          }
        }
        const storageSync = typeof browser !== "undefined" && browser.storage && browser.storage.sync ? browser.storage.sync : typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync ? chrome.storage.sync : null;
        if (storageSync) {
          const syncRes = await new Promise((resolve) => {
            try {
              const p = storageSync.get(["avim_user_dictionary"], (r) => resolve(r || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (Array.isArray(syncRes.avim_user_dictionary) && syncRes.avim_user_dictionary.length > 0) {
            this.loadWords(syncRes.avim_user_dictionary);
            this.saveToStorage();
            return;
          }
        }
        if (typeof localStorage !== "undefined") {
          const saved = localStorage.getItem("avim_user_dictionary");
          if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
              this.loadWords(list);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load user dictionary:", err);
      }
    }
  };
  var userDictionary = new UserDictionary();

  // src/engine/emoji.js
  var EMOJI_MAP = {
    // Biểu cảm khuôn mặt / Feelings
    "tim": "❤️",
    "heart": "❤️",
    "traitim": "❤️",
    "yeu": "❤️",
    "cuoi": "😄",
    "smile": "😄",
    "happy": "😊",
    "matcuoi": "😊",
    "haha": "😆",
    "lol": "😂",
    "roinuocmat": "😂",
    "kaka": "🤣",
    "buon": "😢",
    "sad": "😢",
    "khoc": "😭",
    "cry": "😭",
    "ngau": "😎",
    "cool": "😎",
    "kinhram": "😎",
    "hon": "😘",
    "kiss": "😘",
    "yeuthuong": "🥰",
    "suynghi": "🤔",
    "think": "🤔",
    "ngaunhien": "🤯",
    "wow": "😮",
    "tucgian": "😡",
    "angry": "😡",
    "ngu": "😴",
    "sleep": "😴",
    "nhaymat": "😉",
    "wink": "😉",
    // Cử chỉ tay / Gestures
    "like": "👍",
    "1": "👍",
    "thich": "👍",
    "up": "👍",
    "dislike": "👎",
    "che": "👎",
    "down": "👎",
    "ok": "👌",
    "tot": "👌",
    "votay": "👏",
    "clap": "👏",
    "cau": "🙏",
    "pray": "🙏",
    "xin": "🙏",
    "camon": "🙏",
    "vui": "✌️",
    "peace": "✌️",
    "namdam": "👊",
    "fist": "👊",
    "chao": "👋",
    "wave": "👋",
    "co": "💪",
    "strong": "💪",
    "chiton": "👉",
    "point": "👉",
    // Biểu tượng & Đồ vật / Symbols & Objects
    "lua": "🔥",
    "fire": "🔥",
    "hot": "🔥",
    "sao": "⭐",
    "star": "⭐",
    "100": "💯",
    "diem100": "💯",
    "check": "✅",
    "tich": "✅",
    "done": "✅",
    "x": "❌",
    "cross": "❌",
    "sai": "❌",
    "party": "🎉",
    "tiec": "🎉",
    "chucmung": "🎉",
    "mattrang": "🌙",
    "moon": "🌙",
    "mattroi": "☀️",
    "sun": "☀️",
    "set": "⚡",
    "flash": "⚡",
    "quatang": "🎁",
    "gift": "🎁",
    "tien": "💵",
    "money": "💵",
    "bongda": "⚽",
    "football": "⚽",
    "caidat": "⚙️",
    "gear": "⚙️",
    "khoa": "🔒",
    "lock": "🔒",
    "chuong": "🔔",
    "bell": "🔔",
    "canhbao": "⚠️",
    "warning": "⚠️",
    "coffee": "☕",
    "cafe": "☕",
    "bia": "🍺",
    "beer": "🍺",
    "vietnam": "🇻🇳",
    "vn": "🇻🇳",
    "covietnam": "🇻🇳"
  };
  function getEmojiSuggestions(query, limit = 4) {
    if (!query || !query.startsWith(":")) return [];
    const prefix = query.slice(1).toLowerCase();
    const results = [];
    const seenEmojis = /* @__PURE__ */ new Set();
    for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
      if (seenEmojis.has(emoji)) continue;
      if (code.startsWith(prefix) || prefix.length === 0) {
        results.push({
          word: emoji,
          code: `:${code}:`,
          displayType: `:${code}:`,
          type: "emoji",
          emoji
        });
        seenEmojis.add(emoji);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  // src/engine/autocomplete.js
  function stripVietnameseAccents(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  }
  var COMMON_VIETNAMESE_COMPOUNDS = [
    // Công nghệ, máy tính, tin học
    "nghiên cứu",
    "công nghệ",
    "thông tin",
    "trí tuệ nhân tạo",
    "lập trình",
    "phần mềm",
    "phần cứng",
    "ứng dụng",
    "trình duyệt",
    "tiện ích",
    "mở rộng",
    "dữ liệu",
    "mạng máy tính",
    "hệ điều hành",
    "bảo mật",
    "an toàn",
    "mật khẩu",
    "tài khoản",
    "đăng nhập",
    "đăng ký",
    "giao diện",
    "trực tuyến",
    "tải xuống",
    "cài đặt",
    "kết nối",
    "máy chủ",
    "trang web",
    "cơ sở dữ liệu",
    "thiết bị",
    "điện tử",
    "trực quan",
    "tối ưu hóa",
    "tự động",
    "thuật toán",
    "hệ thống",
    "phiên bản",
    "cập nhật",
    "nâng cấp",
    "bộ nhớ",
    "tốc độ",
    "dung lượng",
    "xử lý",
    "thực thi",
    "kiểm thử",
    "khởi động",
    "chuyển đổi",
    // Y tế, sức khỏe & cấp cứu
    "cấp cứu",
    "bác sĩ",
    "bệnh viện",
    "y tế",
    "sức khỏe",
    "khám bệnh",
    "chữa bệnh",
    "thuốc tây",
    "dược phẩm",
    "điều trị",
    "chăm sóc",
    "bảo hiểm",
    "phòng khám",
    "y tá",
    "dược sĩ",
    "hồi sức",
    "cứu hộ",
    "cứu nạn",
    "cứu thương",
    "khẩn cấp",
    "sơ cứu",
    "chẩn đoán",
    "xét nghiệm",
    "phục hồi",
    // Đời sống, gia đình, xã hội
    "gia đình",
    "bạn bè",
    "cha mẹ",
    "anh em",
    "đồng nghiệp",
    "hạnh phúc",
    "vui vẻ",
    "may mắn",
    "bình an",
    "thành công",
    "yêu thương",
    "cuộc sống",
    "con người",
    "xã hội",
    "văn hóa",
    "truyền thống",
    "hiện đại",
    "lịch sử",
    "đất nước",
    "thành phố",
    "việt nam",
    "quốc tế",
    "thế giới",
    "môi trường",
    "thiên nhiên",
    "thời tiết",
    "khí hậu",
    "buổi sáng",
    "buổi trưa",
    "buổi chiều",
    "buổi tối",
    "hôm nay",
    "ngày mai",
    "hôm qua",
    "tuần này",
    "tháng này",
    "năm nay",
    "tương lai",
    "quá khứ",
    // Công việc, kinh tế, quản lý
    "phát triển",
    "quản lý",
    "kinh doanh",
    "doanh nghiệp",
    "công ty",
    "khách hàng",
    "hợp đồng",
    "kinh tế",
    "thương mại",
    "dịch vụ",
    "sản phẩm",
    "thị trường",
    "tiêu dùng",
    "thương hiệu",
    "uy tín",
    "chất lượng",
    "hiệu quả",
    "tiến độ",
    "kế hoạch",
    "dự án",
    "báo cáo",
    "đánh giá",
    "thảo luận",
    "hội nghị",
    "cuộc họp",
    "đề xuất",
    "giải pháp",
    "ý tưởng",
    "sáng tạo",
    "đổi mới",
    "thành lập",
    "hợp tác",
    "đầu tư",
    "tài chính",
    "ngân hàng",
    "chi phí",
    "doanh thu",
    "lợi nhuận",
    "nhiệm vụ",
    "trách nhiệm",
    "mục tiêu",
    "kết quả",
    "thành tựu",
    "kinh nghiệm",
    "chuyên môn",
    // Giáo dục, học tập, khoa học
    "giáo dục",
    "học tập",
    "học sinh",
    "sinh viên",
    "giáo viên",
    "thầy cô",
    "trường học",
    "đại học",
    "kiến thức",
    "kỹ năng",
    "bài tập",
    "kiểm tra",
    "kỳ thi",
    "tốt nghiệp",
    "bằng cấp",
    "khoa học",
    "toán học",
    "vật lý",
    "hóa học",
    "sinh học",
    "địa lý",
    "ngôn ngữ",
    "tiếng việt",
    "tiếng anh",
    "ngoại ngữ",
    "sách báo",
    "tài liệu",
    "thư viện",
    "hội thảo",
    "nghiên cứu sinh",
    // Giao tiếp & Hành động thường ngày
    "xin chào",
    "cảm ơn",
    "xin lỗi",
    "tạm biệt",
    "hẹn gặp lại",
    "chúc mừng",
    "làm phiền",
    "giúp đỡ",
    "hỗ trợ",
    "liên hệ",
    "thông báo",
    "yêu cầu",
    "hướng dẫn",
    "sử dụng",
    "thực hiện",
    "hoàn thành",
    "bắt đầu",
    "kết thúc",
    "tiếp tục",
    "dừng lại",
    "quan trọng",
    "cần thiết",
    "đặc biệt",
    "phổ biến",
    "tuyệt vời",
    "xuất sắc",
    "hài lòng",
    "yên tâm",
    "tin tưởng",
    "hy vọng",
    "quyết định",
    "lựa chọn",
    "thay đổi",
    "cải tiến",
    "khắc phục",
    "giải quyết",
    // Địa danh Tây Nguyên & Dân tộc thiểu số
    "Đắk Lắk",
    "Đắk Nông",
    "Kon Tum",
    "Gia Lai",
    "Lâm Đồng",
    "Buôn Ma Thuột",
    "Pleiku",
    "Bảo Lộc",
    "Đà Lạt",
    "A Yun Pa",
    "Krông Nô",
    "Krông Búk",
    "Krông Pắk",
    "Krông Ana",
    "Krông Bông",
    "Krông Năng",
    "Krông A",
    "Cư M'gar",
    "Cư Kuin",
    "Ea H'leo",
    "Ea Kar",
    "Ea Súp",
    "M'Đrắk",
    "Đắk Mil",
    "Đắk Song",
    "Đắk Glong",
    "Đắk Tô",
    "Đắk Hà",
    "Đắk Đoa",
    "Chư Sê",
    "Chư Prông",
    "Chư Păh",
    "Đức Cơ",
    "Ia Grai",
    "Ia H'Drai",
    "Sa Thầy",
    "Ngọc Hồi",
    "Tu Mơ Rông",
    "Đơn Dương",
    "Đam Rông",
    "Lạc Dương",
    "Di Linh",
    "Bảo Lâm",
    "Cát Tiên",
    "Đắk R'lấp",
    "Tà Nung",
    "Ô Loan",
    // Địa danh Bắc - Trung - Nam phổ biến
    "Hà Nội",
    "Hải Phòng",
    "Quảng Ninh",
    "Hạ Long",
    "Sa Pa",
    "Mộc Châu",
    "Huế",
    "Đà Nẵng",
    "Hội An",
    "Quy Nhơn",
    "Nha Trang",
    "Phan Thiết",
    "Quảng Ngãi",
    "Tam Kỳ",
    "Đông Hà",
    "Vinh",
    "Sài Gòn",
    "Chợ Lớn",
    "Gia Định",
    "Đa Kao",
    "Tân Định",
    "Bến Thành",
    "Bình Thạnh",
    "Phú Nhuận",
    "Gò Vấp",
    "Thủ Đức",
    "Thủ Thiêm",
    "Cần Thơ",
    "Vũng Tàu",
    "Biên Hòa",
    "Mỹ Tho",
    "Tân An",
    "Gò Công",
    "Bến Tre",
    "Vĩnh Long",
    "Sa Đéc",
    "Long Xuyên",
    "Châu Đốc",
    "Rạch Giá",
    "Hà Tiên",
    "Cà Mau",
    "Bạc Liêu",
    "Sóc Trăng",
    "Trà Vinh",
    "Vị Thanh",
    // Cụm từ Hán-Việt & từ hiếm
    "khuếch tán",
    "khuynh hướng",
    "ngoắt ngoéo",
    "khuấy động",
    // ── Thành ngữ, tiếng lóng & từ ngữ Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "bá cháy bù chét",
    "bá láp bá xàm",
    "ba la ba xạo",
    "ba xạo ba kép",
    "bà chằn lửa",
    "bảnh tỏn",
    "bật ngửa",
    "bình thủy",
    "bùng binh",
    "buồn xo",
    "cà chớn",
    "cà cháo",
    "cà chác",
    "cà chớn cà cháo",
    "cà chớn cà chác",
    "cà rịch cà tang",
    "cà nhỏng cà nhỏng",
    "cà tàng",
    "cà giựt",
    "cà kheo",
    "chùm hum",
    "cù lần",
    "cù lần lữa",
    "cứng đầu cứng cổ",
    "dằn mặt",
    "dễ ngươi",
    "đò Thủ Thiêm",
    "hạp gu",
    "hết bài",
    "hết biết",
    "hết sẩy",
    "hết xẩy",
    "hết xí quách",
    "hết ga hết số",
    "hổng chừng",
    "hổng có chi",
    "hổng dám đâu",
    "hút gió",
    "làm nư",
    "láng cháng",
    "lết bánh",
    "mèn ơi",
    "mèn đéc ơi",
    "mưa thúi đất",
    "ngon lành cành đào",
    "quá mạng",
    "quá xá",
    "quỉ tha ma bắt",
    "rề rà",
    "rần rần",
    "sang cả",
    "say xỉn",
    "số dzách",
    "sương sương",
    "sức mấy",
    "táng mạng",
    "tào lao mía lao",
    "tào lao chi địa",
    "té re",
    "tém tém",
    "thầy Hai",
    "thầy thợ",
    "thọc cù lét",
    "thọc lét",
    "thềm ba",
    "tía má",
    "tía lia",
    "trắng xác",
    "trời đánh thánh đâm",
    "trời thần ơi",
    "trớt quớt",
    "trùm sò",
    "trúng mánh",
    "trúng mối",
    "trúng tủ",
    "vắt giò lên cổ",
    "vô phương",
    "xá xị",
    "xe lam",
    "xe thổ mộ",
    "xe đò",
    "xe lôi",
    "xập xám",
    "xề xòa",
    "xì dầu",
    "xí gạt",
    "xí mụi",
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương ──
    "bữa nay",
    "hổm rày",
    "hồi nãy",
    "chút xíu",
    "bao đồng",
    "chánh trực",
    "thiệt tình",
    "bảnh bao",
    "ngộ nghĩnh",
    "tài lanh",
    "lanh chanh",
    "xởi lởi",
    "điệu đàng",
    "coi bộ",
    "ngộ á nghen",
    "ngon ơ",
    "ngọt xớt",
    "bạc mạng",
    "bảnh chọe",
    "bạc đãi",
    "chơn chất",
    "chắc mẻm",
    "cưng xỉu",
    "dễ thương",
    "đàng hoàng",
    "đứng bóng",
    "hết trơn",
    "hết trọi",
    "lẹ làng",
    "lẹ lẹ",
    "lóng rày",
    "mau lẹ",
    "mần ăn",
    "miệt vườn",
    "nắng nôi",
    "ngộ nghê",
    "nhứt xứ",
    "nhàn tản",
    "phẻ re",
    "rảnh rang",
    "rôm rả",
    "sốt sắng",
    "thong thả",
    "thảnh thơi",
    "thơm tho",
    "tề chỉnh",
    "tươi rói",
    "vui vẻ",
    "xởi lởi",
    "xôm tụ",
    // ── Từ vựng giao tiếp công việc & nghề nghiệp lịch thiệp ──
    "kính gởi",
    "kính gửi",
    "trân trọng",
    "cảm phiền",
    "nhờ bạn",
    "gửi bạn",
    "gởi bạn",
    "biên bản",
    "thống nhất",
    "tiến độ",
    "thời hạn",
    "đính kèm",
    "hợp tác",
    "trao đổi",
    "báo cáo",
    "phản hồi"
  ];
  var RAW_VIETNAMESE_BIGRAMS = {
    // ── Quốc gia / dân tộc / địa danh ──
    "việt": ["nam", "cộng", "kiều", "trì", "dã", "vị", "hóa"],
    "cộng": ["hòa", "sản", "đồng", "tác", "sự", "hưởng"],
    "quốc": ["tế", "gia", "tịch", "phòng", "hội"],
    "thế": ["giới", "kỷ", "hệ", "lực", "nào"],
    "đất": ["nước", "đai", "sét", "vàng"],
    "đắk": ["lắk", "nông", "mil", "song", "glong", "tô", "hà", "đoa", "r'lấp"],
    "buôn": ["ma thuột", "mê thuột", "làng", "bán"],
    "krông": ["nô", "búk", "pắk", "ana", "bông", "năng", "a"],
    "kon": ["tum", "plông"],
    "gia": ["lai", "đình", "nhập", "tăng", "công", "dụng"],
    "lâm": ["đồng", "nghiệp", "thao", "chung"],
    "đà": ["lạt", "nẵng"],
    "bảo": ["lộc", "lâm", "mật", "hiểm", "vệ", "quản", "trì", "hộ", "an"],
    "hà": ["nội", "tĩnh", "nam", "giang", "tiên"],
    "hải": ["phòng", "dương", "sản", "quân", "ngoại"],
    "sài": ["gòn"],
    "hạ": ["long", "tầng", "cánh", "bệ"],
    "nha": ["trang", "khoa", "học"],
    "phan": ["thiết", "rang"],
    "bến": ["tre", "xe", "tàu", "đỗ", "ninh kiều", "nghé"],
    "rạch": ["giá"],
    "cà": ["mau", "phê", "chua", "pháo", "chớn", "rịch", "nhổng", "tàng", "giựt", "kheo", "cháo", "chác"],
    "bạc": ["liêu", "trắng", "bẽo", "đầu"],
    "sóc": ["trăng", "sơn"],
    "chư": ["sê", "prông", "păh"],
    "ea": ["h'leo", "kar", "súp"],
    "cư": ["m'gar", "kuin", "trú", "dân", "xử"],
    "ia": ["grai", "h'drai"],
    "khuếch": ["tán", "đại"],
    "khuynh": ["hướng", "đảo"],
    // ── Công nghệ / công việc / kinh doanh ──
    "công": ["nghệ", "ty", "việc", "nhân", "trình", "an", "cộng", "dân"],
    "thông": ["tin", "báo", "minh", "qua", "dịch", "thường", "thoáng"],
    "trí": ["tuệ", "nhớ", "thức", "não", "tưởng"],
    "phát": ["triển", "hiện", "hành", "huy", "sinh", "động"],
    "kinh": ["tế", "doanh", "nghiệm", "phí", "khủng"],
    "doanh": ["nghiệp", "thu", "trại"],
    "sản": ["phẩm", "xuất", "sinh", "khoa"],
    "thị": ["trường", "xã", "hiếu", "thực"],
    "chi": ["phí", "nhánh", "tiết", "tiêu", "viện"],
    "lợi": ["nhuận", "ích", "thế", "dụng"],
    "nhiệm": ["vụ", "kỳ"],
    "trách": ["nhiệm", "mắng", "cứ"],
    "hợp": ["đồng", "tác", "nhất", "pháp", "lý", "thời"],
    "máy": ["tính", "chủ", "bay", "móc", "in", "giặt"],
    "hệ": ["thống", "điều hành", "sinh thái", "số", "tư tưởng"],
    "trang": ["web", "bị", "chủ", "trí", "điểm"],
    "dữ": ["liệu", "dội", "kiện"],
    "kiểm": ["tra", "thử", "soát", "toán", "định"],
    "khách": ["hàng", "sạn", "quan", "thể"],
    "mật": ["khẩu", "mã", "thiết", "độ", "vụ"],
    "tài": ["khoản", "chính", "năng", "lanh", "liệu", "sản", "xế"],
    "đăng": ["nhập", "ký", "tải", "quang", "cai", "xuất"],
    "giao": ["diện", "tiếp", "dịch", "thông", "hàng", "kết"],
    "trực": ["tuyến", "quan", "tiếp", "thuộc"],
    "tải": ["xuống", "lên", "trọng", "bản"],
    "cài": ["đặt", "then", "cắm", "bẫy"],
    "khởi": ["động", "sự", "nghiệp", "đầu"],
    "kết": ["quả", "nối", "hợp", "thúc", "luận", "cấu", "tinh"],
    "thực": ["hiện", "tế", "thi", "hành", "tập", "phẩm", "chất"],
    "giải": ["pháp", "quyết", "thích", "trí", "thưởng", "tỏa"],
    "quan": ["trọng", "tâm", "hệ", "điểm", "sát", "chức"],
    "tối": ["ưu", "nay", "qua", "đa", "thiểu", "mật"],
    // ── Thời gian ──
    "thời": ["gian", "tiết", "khắc", "đại", "kỳ", "vụ"],
    "hôm": ["nay", "qua", "kia", "trước"],
    "ngày": ["mai", "kia", "tháng", "đêm", "sinh", "công", "hôm", "nay"],
    "tuần": ["này", "sau", "trước", "tới"],
    "tháng": ["này", "sau", "trước", "tới", "mười"],
    "năm": ["nay", "sau", "ngoái", "trước"],
    "giờ": ["này", "đây", "rồi", "chưa"],
    "phút": ["trước", "sau", "nữa"],
    "giây": ["nữa", "trước"],
    // ── Gia đình / quan hệ xã hội ──
    "bạn": ["bè", "thân", "đọc", "gái", "trai", "hàng"],
    "tôi": ["nghĩ", "thấy", "muốn", "là", "đang", "đã", "sẽ", "biết"],
    "anh": ["em", "ấy", "chị", "ta", "trai", "yêu", "hai", "ba", "tư"],
    "chị": ["em", "ấy", "gái"],
    "em": ["gái", "trai", "út", "yêu"],
    "chúng": ["tôi", "ta", "nó", "mình"],
    "mọi": ["người", "thứ", "lúc", "nơi"],
    // ── Y tế / sức khỏe ──
    "bệnh": ["viện", "nhân", "tật", "án"],
    "bác": ["sĩ", "học", "ái"],
    "y": ["tế", "tá", "khoa", "học"],
    "hồi": ["sức", "phục", "nãy", "đó", "xưa", "chuông", "âm", "đáp", "hương"],
    "cứu": ["hộ", "nạn", "thương", "tế", "giúp", "chữa"],
    "sơ": ["cứu", "khai", "đồ", "đẳng", "tuyển"],
    "chẩn": ["đoán", "trị"],
    "xét": ["nghiệm", "duyệt", "xử", "lại"],
    "phòng": ["khám", "ngừa", "chống", "ngủ", "bệnh", "ban"],
    "sức": ["mấy", "khỏe", "mạnh", "lực", "hút", "sống", "ép"],
    // ── Giáo dục / trường học ──
    "học": ["tập", "sinh", "hỏi", "hành", "viện", "phí", "bổng"],
    "sinh": ["viên", "hoạt", "sống", "sản", "học", "nhật"],
    "nghiên": ["cứu"],
    "cấp": ["cứu", "bậc", "cao", "nhật", "phép", "trên"],
    "giáo": ["viên", "dục", "trình", "án", "sư"],
    "trường": ["học", "đại học", "hợp", "ca", "kỳ"],
    "đại": ["học", "biểu", "diện", "gia", "đồng"],
    "kỹ": ["năng", "thuật", "xảo", "sư"],
    "ngoại": ["ngữ", "giao", "ô", "tệ", "thương"],
    "văn": ["hóa", "bản", "học", "phòng", "minh"],
    "lịch": ["sử", "trình", "thiệp", "sự"],
    "bắt": ["đầu", "buộc", "tay", "chước", "kịp"],
    "tiếp": ["tục", "theo", "cận", "nhận", "thị", "xúc"],
    "hoàn": ["thành", "toàn", "hảo", "trả", "vốn", "lương"],
    "an": ["toàn", "ninh", "tâm", "cư", "dưỡng"],
    // ── Giao tiếp / chat / xã giao ──
    "xin": ["chào", "lỗi", "phép", "mời", "hỏi", "cảm ơn"],
    "cảm": ["ơn", "phiền", "thấy", "giác", "nghĩ", "nhận", "xúc", "kích"],
    "chúc": ["mừng", "ngủ ngon", "thành công", "bạn", "anh", "chị", "em"],
    "hẹn": ["gặp lại", "ước", "ngày", "giờ", "gặp"],
    "tạm": ["biệt", "thời", "ngưng"],
    "làm": ["việc", "phiền", "nư", "ơn", "quen", "sao", "lại", "gì", "xong", "bài", "hư"],
    "tuyệt": ["vời", "đối", "mật", "chủng", "vọng"],
    "thành": ["phố", "công", "viên", "lập", "tựu", "phần"],
    "ý": ["tưởng", "nghĩa", "kiến", "thức", "chí"],
    "đổi": ["mới", "thay", "trả", "gác"],
    // ── Động từ / hành động thường dùng ──
    "đi": ["làm", "học", "chơi", "về", "ngủ", "đâu"],
    "về": ["nhà", "đâu", "việc", "vấn đề"],
    "đến": ["nơi", "lúc", "đây", "gặp"],
    "ở": ["đâu", "đây", "đó", "nhà", "trường", "chỗ làm"],
    "có": ["thể", "phải", "không", "được", "nhiều"],
    "không": ["có", "thể", "phải", "được", "sao", "biết"],
    "được": ["biết", "chọn", "xem", "hưởng", "rồi", "không", "lắm", "chứ"],
    "phải": ["chăng", "làm", "đi", "nói"],
    "muốn": ["nói", "làm", "biết", "đi", "xem"],
    "biết": ["ơn", "trước", "điều", "gì"],
    "nói": ["chuyện", "rằng", "lời", "thật"],
    "nghe": ["nói", "thấy", "nhạc", "lời"],
    "nhìn": ["thấy", "lại", "nhận", "ngắm"],
    "yêu": ["thương", "quý", "thích", "cầu"],
    "tin": ["tưởng", "tức", "nhắn", "học", "người", "ai"],
    "hy": ["vọng"],
    "quyết": ["định", "đoán", "tâm", "liệt"],
    "lựa": ["chọn", "lọc"],
    "hài": ["lòng", "hòa", "hước", "thiệt"],
    "yên": ["tâm", "tĩnh", "lặng", "ổn"],
    "phúc": ["hậu", "phần", "đức", "đáp"],
    "ăn": ["uống", "nhậu", "sáng", "trưa", "chiều", "tối", "khuya", "sang", "dơ", "tạp", "dày", "bẩn"],
    // ── Văn phòng / Email / Giao tiếp công sở ──
    "kính": ["gửi", "gởi", "chào", "mong", "báo"],
    "trân": ["trọng", "quý"],
    "đính": ["kèm", "chính", "vào"],
    "thân": ["gửi", "mến", "thiện", "ái"],
    "phản": ["hồi", "ánh", "chiếu", "tác dụng"],
    "tiến": ["độ", "hành", "bộ", "triển"],
    "báo": ["cáo", "chí", "động", "thức"],
    "biên": ["bản", "tập", "soạn", "chế"],
    "thống": ["nhất", "kê", "trị", "soái"],
    "trao": ["đổi", "tay", "tặng", "giải"],
    // ── Từ nối / đại từ / trợ động từ (bổ sung mới) ──
    "của": ["tôi", "bạn", "chúng", "nó", "những", "các"],
    "là": ["gì", "một", "người", "cái", "sự"],
    "cho": ["tôi", "bạn", "phép", "nên", "với"],
    "với": ["tôi", "bạn", "nhau", "các", "họ"],
    "như": ["thế", "vậy", "là"],
    "để": ["làm", "xem", "biết", "học"],
    "đang": ["làm", "học", "ở", "xem"],
    "đã": ["xong", "làm", "biết", "có"],
    "sẽ": ["làm", "được", "xảy ra", "phải"],
    // ── Cảm xúc / đánh giá (bổ sung mới) ──
    "rất": ["vui", "tốt", "nhiều", "hay", "đẹp", "nhanh"],
    "nhiều": ["hơn", "người", "lần", "năm", "thứ"],
    "ít": ["nhất", "hơn", "khi"],
    "vui": ["vẻ", "lòng", "nhộn"],
    "tốt": ["đẹp", "hơn", "nhất"],
    "đẹp": ["trai", "lòng", "đôi"],
    "thật": ["sự", "lòng", "ra", "đấy"],
    "chắc": ["chắn", "là", "rồi"],
    // ── Học tập / đọc viết (bổ sung mới) ──
    "viết": ["bài", "thư", "code", "báo cáo"],
    "đọc": ["sách", "báo", "tin", "hiểu"],
    "xem": ["phim", "báo", "tin", "lại", "xét", "bói", "tử vi"],
    "coi": ["phim", "báo", "tin", "bộ", "chừng", "hát", "sách", "lại", "thường", "bói", "tử vi"],
    // ── Từ ngữ & tiếng lóng Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "bá": ["cháy", "láp", "chấy"],
    "bà": ["chằn", "nội", "ngoại", "bà"],
    "bảnh": ["tỏn", "bao", "trai"],
    "bình": ["thủy", "định", "dương", "yên", "tĩnh"],
    "bùng": ["binh", "nổ", "phát"],
    "buồn": ["xo", "ngủ", "bã", "cười"],
    "chùm": ["hum", "ngây", "ruột"],
    "cù": ["lần", "lét"],
    "cứng": ["đầu", "cáp", "rắn"],
    "dằn": ["mặt", "vặt", "xé"],
    "dễ": ["ngươi", "thương", "dàng", "chịu"],
    "đò": ["thủ thiêm", "dọc", "ngang"],
    "hạp": ["gu", "tuổi", "ý"],
    "hết": ["sẩy", "xẩy", "biết", "xí quách", "bài", "ga", "tiền", "cỡ"],
    "hổng": ["chừng", "có chi", "dám đâu", "biết", "chịu", "thấy"],
    "hút": ["gió", "thuốc", "bụi", "hồn"],
    "láng": ["cháng", "mịn", "giềng"],
    "lết": ["bánh"],
    "mèn": ["ơi", "đéc ơi"],
    "mưa": ["thúi đất", "rào", "phùn", "dầm"],
    "ngon": ["lành", "ơ", "miệng", "ngọt", "cơm"],
    "quá": ["mạng", "xá", "nhiều", "trình", "khứ", "tuyệt", "nhanh"],
    "quỉ": ["tha ma bắt", "quái", "sứ"],
    "rề": ["rà"],
    "rần": ["rần"],
    "sang": ["cả", "trọng", "giàu"],
    "say": ["xỉn", "mê", "đắm", "sưa"],
    "số": ["dzách", "dách", "một", "mệnh", "học"],
    "sương": ["sương", "mù", "khói"],
    "táng": ["mạng", "tận"],
    "tào": ["lao", "tháo"],
    "té": ["re", "ngửa", "nhào", "giếng"],
    "tém": ["tém"],
    "thầy": ["hai", "thợ", "cô", "giáo", "thuốc", "u"],
    "thọc": ["cù lét", "lét", "mạch", "gậy"],
    "thềm": ["ba", "nhà"],
    "tía": ["má", "lia"],
    "trắng": ["xác", "tinh", "tay", "bạch"],
    "trời": ["thần ơi", "đánh", "ơi", "đất", "sanh"],
    "trớt": ["quớt"],
    "trùm": ["sò", "mền", "khăn"],
    "trúng": ["mánh", "mối", "tủ", "quả", "thưởng", "độc đắc"],
    "vắt": ["giò lên cổ", "chanh", "sữa"],
    "vô": ["phương", "ích", "duyên", "tư", "lý"],
    "xá": ["xị", "tội", "lợi"],
    "xe": ["lam", "thổ mộ", "đò", "lôi", "cấp cứu", "máy", "đạp", "hơi"],
    "xập": ["xám"],
    "xề": ["xòa"],
    "xì": ["dầu", "trét", "lốp"],
    "xí": ["gạt", "mụi", "muội", "xóa"],
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương bổ sung ──
    "bữa": ["nay", "kịp", "cơm", "tiệc"],
    "hổm": ["rày", "nay"],
    "chút": ["xíu", "nữa", "thôi", "đỉnh"],
    "thiệt": ["tình", "thòi", "sự", "hại", "lòng"],
    "chánh": ["trực", "kiến", "nghĩa", "phủ", "tông"],
    "lanh": ["chanh", "lợi", "lẹ"],
    "ngọt": ["xớt", "ngào", "bùi"],
    "chơn": ["chất", "thật"],
    "cưng": ["xỉu", "chiều"],
    "đàng": ["hoàng", "trong", "ngoài"],
    "lẹ": ["làng", "lẹ", "tay", "chân"],
    "lóng": ["rày", "ngóng"],
    "mần": ["ăn", "răng"],
    "miệt": ["vườn", "thứ", "dưới"],
    "nhứt": ["xứ", "định", "hạng", "quán"],
    "phẻ": ["re"],
    "rảnh": ["rang", "rỗi", "tay"],
    "thong": ["thả", "dong"],
    "thảnh": ["thơi"],
    // ── Mở rộng từ ngữ thông dụng (Ngữ liệu Quốc gia & NLP Corpus) ──
    "ba": ["ba", "bảy", "bị"],
    "ban": ["bố", "cấp", "chiều"],
    "bao": ["bì", "biếm", "biện"],
    "bi": ["ai", "bô", "ca"],
    "binh": ["bị", "biến", "bộ"],
    "biến": ["áp", "âm", "báo"],
    "biểu": ["bì", "cảm", "chương"],
    "biệt": ["cư", "danh", "dược"],
    "bài": ["bác", "bạc", "bản"],
    "bàn": ["ăn", "bạc", "cãi"],
    "bào": ["ảnh", "chế", "chữa"],
    "bách": ["bổ", "bộ", "chiến"],
    "bán": ["ảnh", "buôn", "cấp"],
    "bánh": ["bàng", "bao", "bẻ"],
    "bát": ["âm", "bội", "bửu"],
    "bãi": ["biển", "binh", "bỏ"],
    "bí": ["ẩn", "beng", "bét"],
    "bóng": ["bàn", "bay", "bẩy"],
    "bóp": ["bẹp", "bụng", "chắt"],
    "bút": ["bi", "chì", "chiến"],
    "băng": ["âm", "băng", "bó"],
    "bạch": ["bì", "biến", "cầu"],
    "bạo": ["bệnh", "chính", "chúa"],
    "bản": ["án", "bộ", "chất"],
    "bất": ["an", "bằng", "biến"],
    "bần": ["bạc", "bách", "bạch"],
    "bằng": ["an", "bặn", "cấp"],
    "bề": ["bề", "bộn", "cao"],
    "bọ": ["bạc", "cạp", "chét"],
    "bỏ": ["ăn", "bà", "bả"],
    "bố": ["cái", "cáo", "chánh"],
    "bồ": ["bịch", "các", "cào"],
    "bồi": ["bếp", "bổ", "bút"],
    "bổ": ["bán", "chính", "chửng"],
    "bộ": ["ba", "bảy", "binh"],
    "bội": ["bạc", "chi", "chỉnh"],
    "ca": ["cẩm", "dao", "hát"],
    "canh": ["cách", "cải", "cánh"],
    "cao": ["áp", "cả", "cấp"],
    "chia": ["bài", "buồn", "cắt"],
    "chim": ["bằng", "cắt", "chích"],
    "chiến": ["bại", "bào", "binh"],
    "chiếu": ["án", "biểu", "bóng"],
    "chung": ["chạ", "chung", "cục"],
    "chuyên": ["biệt", "cần", "chế"],
    "chuyển": ["bánh", "biên", "biến"],
    "chân": ["bì", "bụng", "chạy"],
    "chí": ["ác", "cao", "chát"],
    "chó": ["biển", "bông", "chết"],
    "chú": ["bé", "chích", "dẫn"],
    "chơi": ["ác", "bời", "chòi"],
    "chạy": ["ăn", "bữa", "chọt"],
    "chấm": ["câu", "chấm", "công"],
    "chấp": ["bút", "chiếm", "chính"],
    "chất": ["béo", "bột", "cháy"],
    "chẳng": ["ai", "bằng", "bõ"],
    "chế": ["biến", "dục", "định"],
    "chết": ["chém", "chẹt", "chìm"],
    "chỉ": ["bảo", "báo", "cần"],
    "chịu": ["chết", "chuyện", "cực"],
    "chống": ["càn", "chế", "chọi"],
    "chủ": ["âm", "bài", "biên"],
    "chứng": ["bệnh", "chỉ", "cớ"],
    "chữ": ["bát", "cái", "chân"],
    "co": ["bóp", "cỏm", "cụm"],
    "con": ["bạc", "bài", "bé"],
    "cung": ["bậc", "cách", "cấm"],
    "cuồng": ["ẩm", "bạo", "cẳng"],
    "cá": ["biệt", "bống", "bột"],
    "cách": ["biệt", "bức", "chức"],
    "cánh": ["bèo", "buồm", "cam"],
    "cáo": ["bạch", "biệt", "cấp"],
    "cân": ["bàn", "bằng", "cấn"],
    "câu": ["chắp", "chấp", "chuyện"],
    "cây": ["bài", "bông", "bụi"],
    "cô": ["ả", "bé", "chiêu"],
    "cùng": ["bên", "chung", "cực"],
    "căn": ["bản", "bệnh", "cắt"],
    "cơ": ["bản", "bần", "biến"],
    "cơm": ["áo", "bữa", "cháo"],
    "cương": ["cường", "dũng", "giới"],
    "cười": ["bò", "chê", "cợt"],
    "cường": ["bạo", "dương", "đạo"],
    "cải": ["bắp", "bẹ", "biên"],
    "cảnh": ["báo", "bị", "binh"],
    "cất": ["binh", "bút", "bước"],
    "cầm": ["bằng", "bút", "ca"],
    "cần": ["cấp", "câu", "cẩu"],
    "cầu": ["an", "ao", "bến"],
    "cắt": ["băng", "bỏ", "bom"],
    "cỏ": ["ban", "cây", "chét"],
    "cố": ["chấp", "chết", "chí"],
    "cổ": ["bẻ", "bồng", "cánh"],
    "cột": ["buồm", "cái", "chống"],
    "củ": ["ấu", "cải", "cái"],
    "cửa": ["ải", "bể", "bên"],
    "cực": ["bắc", "cầu", "dương"],
    "da": ["bát", "bê", "cam"],
    "danh": ["bạ", "ca", "cách"],
    "dao": ["ăn", "bài", "bào"],
    "di": ["bút", "cảo", "căn"],
    "diễn": ["âm", "biến", "binh"],
    "du": ["canh", "côn", "cư"],
    "dung": ["bào", "dăng", "dị"],
    "duy": ["cảm", "danh", "kỉ"],
    "dân": ["bẹp", "biểu", "binh"],
    "dây": ["bọc", "buộc", "cáp"],
    "dưỡng": ["bệnh", "chí", "dục"],
    "dấu": ["ấn", "chấm", "giáng"],
    "dầu": ["ăn", "cá", "cao"],
    "dẫn": ["bảo", "chuyện", "chứng"],
    "dị": ["bản", "bào", "bội"],
    "dịch": ["âm", "bản", "giả"],
    "dự": ["án", "báo", "bị"],
    "gian": ["ác", "bào", "băng"],
    "giun": ["cát", "chỉ", "đất"],
    "già": ["cả", "cấc", "câng"],
    "giá": ["áo", "bán", "biển"],
    "giám": ["biên", "binh", "định"],
    "gió": ["bão", "bấc", "bụi"],
    "giả": ["bộ", "bữa", "cách"],
    "giảm": ["án", "áp", "bớt"],
    "giấy": ["ảnh", "bạc", "báo"],
    "giữ": ["giá", "giàng", "gìn"],
    "gà": ["ác", "cát", "chọi"],
    "gây": ["bệnh", "chiến", "chuyện"],
    "hiếu": ["chiến", "chủ", "danh"],
    "hiền": ["đệ", "đức", "hậu"],
    "hiện": ["bộ", "dịch", "diện"],
    "hiệu": ["buôn", "chỉnh", "chính"],
    "huyết": ["áp", "bạch", "bào"],
    "hàn": ["điện", "đới", "gắn"],
    "hàng": ["ăn", "binh", "đầu"],
    "hành": ["binh", "búi", "cách"],
    "hào": ["chỉ", "hiệp", "hoa"],
    "hình": ["bao", "dáng", "dạng"],
    "hư": ["ảo", "báo", "cấu"],
    "hương": ["án", "ẩm", "bạ"],
    "hướng": ["cách", "dẫn", "dương"],
    "hậu": ["báo", "bị", "binh"],
    "hồ": ["cầm", "chi", "dễ"],
    "hồng": ["bạch", "bì", "cầu"],
    "hổ": ["biến", "cốt", "cứ"],
    "hỗn": ["ẩu", "chiến", "dịch"],
    "hộ": ["bộ", "chiếu", "đê"],
    "hội": ["ẩm", "báo", "buôn"],
    "hữu": ["ái", "biên", "chí"],
    "khai": ["ấn", "báo", "bút"],
    "khinh": ["bạc", "bỉ", "binh"],
    "khác": ["âm", "biệt", "chi"],
    "kháng": ["án", "âm", "cáo"],
    "khí": ["áp", "bẩm", "cầu"],
    "khó": ["bảo", "chịu", "chơi"],
    "khổ": ["ải", "chiến", "chủ"],
    "kim": ["anh", "băng", "cải"],
    "kiến": ["cánh", "đen", "đỏ"],
    "kì": ["an", "bo", "bộ"],
    "kế": ["cận", "chân", "chí"],
    "lai": ["cảo", "căng", "giống"],
    "lao": ["cải", "công", "dịch"],
    "liên": ["á", "bang", "bộ"],
    "long": ["án", "bào", "cổn"],
    "loạn": ["dâm", "khứu", "lạc"],
    "lá": ["áo", "bài", "bắc"],
    "lão": ["bà", "bộc", "dê"],
    "lên": ["án", "bậc", "bộ"],
    "lòng": ["chảo", "dạ", "dân"],
    "lông": ["bông", "buồn", "cánh"],
    "lưu": ["ban", "cầu", "chiểu"],
    "lưỡng": ["bội", "chất", "chiết"],
    "lạc": ["bước", "chỗ", "đà"],
    "lấy": ["cắp", "chồng", "công"],
    "lập": ["ấp", "cập", "chí"],
    "lễ": ["bái", "bộ", "ca"],
    "lỗ": ["bi", "bì", "chẩm"],
    "lục": ["bảo", "bát", "bì"],
    "ma": ["chay", "da", "đạo"],
    "mai": ["danh", "đây", "gầm"],
    "minh": ["bạch", "châu", "chủ"],
    "miễn": ["chấp", "chức", "cưỡng"],
    "màng": ["bào", "bụng", "cứng"],
    "mái": ["ấp", "bằng", "che"],
    "mê": ["ám", "cung", "cuồng"],
    "mưu": ["cầu", "chước", "cơ"],
    "mất": ["ăn", "cắp", "công"],
    "mắc": ["áo", "bận", "bẫy"],
    "mặt": ["bằng", "cắt", "cân"],
    "một": ["chạp", "chiều", "chốc"],
    "mở": ["cờ", "cửa", "đầu"],
    "nam": ["ai", "bằng", "bộ"],
    "ngang": ["bướng", "chướng", "dạ"],
    "nghi": ["án", "binh", "dụ"],
    "nghiêm": ["cách", "cấm", "cẩn"],
    "nguyên": ["âm", "bản", "canh"],
    "ngũ": ["âm", "bội", "cốc"],
    "người": ["bệnh", "chứng", "dưng"],
    "ngọc": ["am", "bích", "bội"],
    "nhiệt": ["biểu", "cơ", "dung"],
    "nhà": ["ăn", "báo", "bạt"],
    "nhân": ["nhượng", "ái", "bản"],
    "nhảy": ["bổ", "cái", "cao"],
    "nhất": ["đán", "đẳng", "định"],
    "nhận": ["biết", "cảm", "chân"],
    "nhập": ["bọn", "cảng", "cảnh"],
    "nhật": ["ấn", "báo", "dạ"],
    "nhỏ": ["bé", "con", "dãi"],
    "nóng": ["bỏng", "bức", "chảy"],
    "nông": ["cạn", "chính", "choèn"],
    "nước": ["ăn", "bài", "bí"],
    "nằm": ["bẹp", "bếp", "co"],
    "nặng": ["bụng", "căn", "cân"],
    "nổi": ["bật", "bọt", "cáu"],
    "nội": ["ban", "bào", "biến"],
    "nữ": ["binh", "cao", "chúa"],
    "phi": ["báo", "cảng", "công"],
    "phong": ["ấn", "ấp", "ba"],
    "phá": ["án", "bĩnh", "bỏ"],
    "pháo": ["binh", "bông", "cối"],
    "pháp": ["bảo", "chế", "danh"],
    "phân": ["ban", "bắc", "bậc"],
    "phép": ["chia", "cộng", "cưới"],
    "phóng": ["bút", "đại", "đãng"],
    "phù": ["dâu", "du", "dung"],
    "phương": ["án", "cách", "châm"],
    "phần": ["cảm", "đông", "góp"],
    "phế": ["binh", "bỏ", "đế"],
    "phụ": ["âm", "bạc", "bản"],
    "phục": ["binh", "chế", "chức"],
    "quang": ["âm", "cảnh", "cầu"],
    "quay": ["chuyển", "cóp", "cuồng"],
    "quân": ["báo", "bị", "bình"],
    "quả": ["bàng", "báo", "bế"],
    "quản": ["bao", "bào", "bút"],
    "quần": ["áo", "bò", "chúng"],
    "ra": ["bộ", "chiều", "công"],
    "ruột": ["chay", "gà", "gan"],
    "sa": ["bàn", "bồi", "chân"],
    "sai": ["áp", "bảo", "biệt"],
    "sao": ["bản", "băng", "bằng"],
    "siêu": ["âm", "bội", "cường"],
    "song": ["ẩm", "biến", "ca"],
    "suy": ["bại", "bì", "biến"],
    "sáng": ["bạch", "bóng", "chế"],
    "sâu": ["bệnh", "bọ", "bột"],
    "sơn": ["ca", "cẩu", "cước"],
    "sư": ["bà", "bác", "cô"],
    "sắc": ["bén", "cạnh", "chỉ"],
    "sống": ["chết", "còn", "dai"],
    "sổ": ["cái", "chi", "đen"],
    "sở": ["cầu", "cậy", "cứ"],
    "sự": ["biến", "chủ", "cố"],
    "tai": ["ác", "ách", "bèo"],
    "tam": ["bản", "bành", "bảo"],
    "tha": ["bổng", "chết", "giác"],
    "tham": ["bác", "bạo", "biến"],
    "than": ["bánh", "béo", "bụi"],
    "thanh": ["âm", "bạch", "bần"],
    "thi": ["ân", "bá", "ca"],
    "thiên": ["bẩm", "binh", "cảm"],
    "thiết": ["bì", "bị", "chế"],
    "thiếu": ["điều", "gì", "hụt"],
    "thu": ["ba", "binh", "chi"],
    "thuyền": ["bè", "bồng", "buồm"],
    "thuốc": ["bắc", "bỏng", "bổ"],
    "thái": ["âm", "ấp", "ất"],
    "thánh": ["ca", "chỉ", "chúa"],
    "thâm": ["ảo", "canh", "cung"],
    "thù": ["ân", "du", "đáp"],
    "thư": ["án", "cục", "duỗi"],
    "thương": ["binh", "cảm", "cảng"],
    "thường": ["biến", "dân", "dùng"],
    "thượng": ["cấp", "cổ", "công"],
    "thất": ["bại", "bảo", "bát"],
    "thần": ["bí", "chết", "chủ"],
    "thập": ["ác", "can", "cẩm"],
    "thể": ["cách", "chất", "chế"],
    "thổ": ["âm", "canh", "cẩm"],
    "thợ": ["bạc", "bạn", "cả"],
    "thụ": ["ân", "bệnh", "bì"],
    "thủ": ["bạ", "bản", "bút"],
    "thứ": ["ba", "bảy", "bậc"],
    "thừa": ["ân", "cơ", "dịp"],
    "tinh": ["anh", "bào", "binh"],
    "tiên": ["cảnh", "chỉ", "cô"],
    "tiêu": ["âm", "bản", "biến"],
    "tiếng": ["dội", "dữ", "địch"],
    "tiết": ["canh", "chế", "dê"],
    "tiền": ["án", "bạc", "bối"],
    "tiểu": ["bài", "ban", "bang"],
    "toàn": ["bị", "bích", "bộ"],
    "tranh": ["ảnh", "ăn", "biện"],
    "tri": ["âm", "ân", "châu"],
    "trung": ["bì", "bình", "bộ"],
    "truy": ["bức", "cứu", "điệu"],
    "truyền": ["bá", "bảo", "cảm"],
    "trái": ["cân", "chủ", "chứng"],
    "trùng": ["chuông", "cỏ", "cửu"],
    "trưởng": ["ban", "đoàn", "đồn"],
    "trả": ["ân", "bữa", "công"],
    "trầm": ["bổng", "cảm", "hà"],
    "trần": ["ai", "bì", "cầu"],
    "trọng": ["án", "âm", "bệnh"],
    "trống": ["bỏi", "cái", "canh"],
    "trở": ["chua", "chứng", "dạ"],
    "trợ": ["bào", "bút", "cấp"],
    "trừ": ["bì", "bị", "bỏ"],
    "tu": ["bổ", "chí", "chỉnh"],
    "tà": ["dâm", "dương", "đạo"],
    "tàn": ["ác", "bạo", "binh"],
    "tác": ["chiến", "dụng", "động"],
    "tái": ["bản", "bút", "cử"],
    "tâm": ["bệnh", "bì", "can"],
    "tân": ["bằng", "binh", "chủ"],
    "tên": ["bịp", "chữ", "đạn"],
    "tình": ["ái", "bạn", "báo"],
    "tính": ["cách", "chất", "chuyện"],
    "tôn": ["chỉ", "chủ", "giáo"],
    "tù": ["binh", "cẳng", "đày"],
    "tăng": ["bội", "chúng", "cường"],
    "tơ": ["cảm", "duyên", "đào"],
    "tư": ["bản", "bẩm", "biện"],
    "tương": ["ái", "bào", "cách"],
    "tất": ["bật", "cả", "dài"],
    "tầm": ["âm", "bậy", "bóp"],
    "tận": ["cùng", "dụng", "hiếu"],
    "tập": ["ấm", "con", "công"],
    "tỉ": ["dụ", "đối", "giá"],
    "tỉnh": ["bộ", "bơ", "dậy"],
    "tổ": ["ấm", "bố", "chấy"],
    "tổng": ["bao", "binh", "bộ"],
    "tứ": ["bàng", "bảo", "bề"],
    "tức": ["bực", "cảnh", "cười"],
    "từ": ["ái", "bi", "biệt"],
    "tử": ["biệt", "chiến", "cung"],
    "tự": ["ải", "ái", "biên"],
    "u": ["ám", "ẩn", "buồn"],
    "vi": ["ảnh", "ba", "chấn"],
    "viễn": ["ảnh", "cảnh", "chí"],
    "vàng": ["anh", "ạnh", "bạc"],
    "vòng": ["bi", "cổ", "đai"],
    "võ": ["bị", "biền", "công"],
    "vũ": ["bão", "bị", "công"],
    "vạn": ["an", "bảo", "bội"],
    "vận": ["chuyển", "dụng", "động"],
    "vật": ["chất", "chủ", "dục"],
    "vị": ["chi", "danh", "dịch"],
    "vỡ": ["bụng", "chợ", "chum"],
    "vừa": ["đôi", "khéo", "khi"],
    "xa": ["cách", "cảng", "gần"],
    "xuất": ["bản", "biên", "binh"],
    "xương": ["bò", "búa", "bướm"],
    "xấu": ["bụng", "chơi", "dạ"],
    "xử": ["án", "bắn", "đoán"],
    "ác": ["bá", "cảm", "chiến"],
    "áo": ["bào", "bông", "cánh"],
    "áp": ["bách", "bức", "chảo"],
    "âm": ["ẩm", "ấm", "bản"],
    "ân": ["ái", "cần", "điển"],
    "ô": ["danh", "đầu", "hay"],
    "ông": ["anh", "bà", "bầu"],
    "đa": ["bào", "bệnh", "bội"],
    "đau": ["bão", "bụng", "buồn"],
    "đàn": ["anh", "áp", "bà"],
    "đào": ["binh", "bới", "hát"],
    "đá": ["bảng", "bọt", "cối"],
    "đáng": ["bậc", "buồn", "chết"],
    "đánh": ["bả", "bạc", "bài"],
    "đèn": ["bão", "báo", "bấm"],
    "đóng": ["bao", "băng", "bộ"],
    "đơn": ["âm", "bạc", "bào"],
    "đưa": ["cay", "chân", "dâu"],
    "đương": ["cai", "chức", "cục"],
    "đường": ["bánh", "bao", "bay"],
    "đạo": ["binh", "chích", "cô"],
    "đấu": ["ẩu", "bò", "bóng"],
    "đầu": ["bài", "bếp", "bò"],
    "đầy": ["ắp", "ặp", "bụng"],
    "đậu": ["chiều", "đũa", "hũ"],
    "đẳng": ["áp", "bội", "cao"],
    "đặc": ["ân", "biệt", "cách"],
    "đề": ["án", "bài", "bạt"],
    "địa": ["bạ", "bàn", "bộ"],
    "định": ["âm", "biên", "bụng"],
    "đỏ": ["au", "bừng", "chóe"],
    "đối": ["bào", "cách", "cảm"],
    "đồ": ["án", "ăn", "bạc"],
    "đồng": ["âm", "bạc", "bạch"],
    "đổ": ["bác", "bể", "bệnh"],
    "độ": ["cao", "chuẩn", "chừng"],
    "độc": ["âm", "bạch", "bản"],
    "động": ["biển", "binh", "cấn"],
    "ưu": ["ái", "binh", "đãi"],
    "ước": ["ao", "chung", "chừng"],
    "ẩn": ["cư", "danh", "dật"],
    "ống": ["bơm", "dẫn", "dòm"],
    "ứng": ["biến", "chiến", "cử"]
  };
  var DEVELOPER_WHITELIST_BIGRAMS = {
    // Version Control & Containerization
    "git": ["push", "commit", "pull", "status", "checkout", "branch", "merge", "rebase", "clone", "fetch", "stash"],
    "docker": ["run", "compose", "build", "images", "ps", "exec", "logs", "stop", "volume", "network"],
    // Package Managers
    "npm": ["install", "run", "start", "test", "publish", "update", "uninstall", "ci", "init"],
    "yarn": ["install", "add", "remove", "run", "start", "build", "why"],
    "pnpm": ["add", "install", "run", "store", "update", "remove"],
    "cargo": ["build", "run", "test", "check", "clippy", "fmt", "update", "publish", "doc"],
    "pip": ["install", "uninstall", "freeze", "list", "show"],
    "bun": ["run", "install", "add", "test", "build"],
    // Programming Languages & Tooling Scripts
    "python": ["run", "manage.py", "main.py", "-m", "venv"],
    "node": ["index.js", "server.js", "dist/main.js", "--watch", "--version"],
    "go": ["run", "build", "test", "mod", "fmt", "vet"],
    "rustc": ["--version", "-O"],
    "deno": ["run", "task", "test", "compile", "fmt", "lint"],
    "npx": ["playwright", "esbuild", "prettier", "eslint", "tsc", "web-ext"],
    // Cloud Infrastructure & Web Engines
    "kubectl": ["get", "apply", "delete", "describe", "logs", "exec", "rollout"],
    "aws": ["configure", "s3", "ec2", "lambda", "iam"],
    "supabase": ["init", "start", "stop", "db", "functions", "login"],
    "firebase": ["login", "init", "deploy", "serve", "emulators"],
    "pull": ["request", "origin"],
    "merge": ["request", "conflict", "branch"]
  };
  function injectDeveloperBigrams(baseBigrams) {
    if (!baseBigrams || typeof baseBigrams !== "object") return baseBigrams;
    const merged = { ...baseBigrams };
    for (const [key, candidates] of Object.entries(DEVELOPER_WHITELIST_BIGRAMS)) {
      if (!merged[key]) {
        merged[key] = candidates;
      } else {
        merged[key] = Array.from(/* @__PURE__ */ new Set([...candidates, ...merged[key]])).slice(0, 4);
      }
    }
    return merged;
  }
  var DEFAULT_VIETNAMESE_BIGRAMS = injectDeveloperBigrams(RAW_VIETNAMESE_BIGRAMS);
  var DEFAULT_VIETNAMESE_TRIGRAMS = {
    // Phương ngữ Sài Gòn xưa & Nam Bộ dân gian
    "sài gòn": ["xưa", "đẹp lắm", "hoa lệ"],
    "bá cháy": ["bù chét"],
    "bá chấy": ["bù chét"],
    "bá láp": ["bá xàm"],
    "ba la": ["ba xạo"],
    "ba xạo": ["ba kép"],
    "bà chằn": ["lửa"],
    "cà rịch": ["cà tang"],
    "cà chớn": ["cà chác", "cà cháo"],
    "cà nhỏng": ["cà nhỏng"],
    "cù lần": ["lữa"],
    "cứng đầu": ["cứng cổ"],
    "đò thủ": ["thiêm"],
    "hết ga": ["hết số"],
    "hết xí": ["quách"],
    "hổng dám": ["đâu"],
    "hổng có": ["chi"],
    "mèn đéc": ["ơi"],
    "mèn ơi": ["trời đất", "nghen"],
    "hết nước": ["chấm", "miếng"],
    "ngon lành": ["cành đào"],
    "ăn ngay": ["nói thật"],
    "ăn coi": ["nồi"],
    "ngồi coi": ["hướng"],
    "mưa thúi": ["đất"],
    "quỉ tha": ["ma bắt"],
    "tào lao": ["mía lao", "chi địa"],
    "thọc cù": ["lét"],
    "thềm ba": ["nhà"],
    "trời đánh": ["thánh đâm"],
    "trời thần": ["ơi"],
    "vắt giò": ["lên cổ"],
    "hết sẩy": ["con bà bảy"],
    "ngộ á": ["nghen"],
    "coi bộ": ["được nghen", "ngon"],
    "thiệt tình": ["á", "hết sức"],
    // Y tế / Bệnh viện
    "xe cấp": ["cứu"],
    "phòng cấp": ["cứu"],
    "bệnh viện": ["chợ rẫy", "nhi đồng", "từ dũ", "bình dân"],
    "bác sĩ": ["gia đình", "trưởng khoa", "chuyên khoa"],
    // Đời sống, thương mại, tài chính
    "tiền phụ": ["cấp"],
    "chuyển khoản": ["ngân hàng", "thành công", "ngay"],
    "tài khoản": ["ngân hàng", "tiết kiệm"],
    "hãng xe": ["đò", "lôi", "lam"],
    // Địa danh miền Nam & Sài Gòn
    "thành phố": ["sài gòn", "đà lạt", "cần thơ", "mỹ tho", "vũng tàu", "nha trang", "huế", "đà nẵng"],
    "chợ bến": ["thành"],
    "bến ninh": ["kiều"],
    "sông bến": ["nghé"],
    "cầu sài": ["gòn"],
    "việt nam": ["cộng hòa"],
    // Công nghệ / Lập trình
    "trí tuệ": ["nhân tạo"],
    "mạng máy": ["tính"],
    "cơ sở": ["dữ liệu"],
    "hệ điều": ["hành"],
    "mã nguồn": ["mở"],
    "phần mềm": ["mã nguồn mở", "tiện ích"],
    // Giao tiếp / Xã giao
    "chúc mừng": ["sinh nhật", "năm mới", "thành công", "bạn"],
    "cảm ơn": ["bạn", "rất nhiều", "anh", "chị", "em"],
    "hẹn gặp": ["lại", "nhau"],
    "rất vui": ["được gặp bạn", "được làm quen"],
    "chúc ngủ": ["ngon"],
    "xin chân": ["thành"],
    "chân thành": ["cảm ơn"]
  };
  var GboardLearnedModel = class {
    constructor() {
      this.storageKey = "avim_gboard_habit_model";
      this.learningEnabled = true;
      this.userTrigrams = {};
      this.userBigrams = {};
      this.userUnigrams = {};
      this.lastUpdatedAt = 0;
      this.loadFromStorage();
    }
    /**
     * Calculate score incorporating Recency and Frequency with Domain-Isolation Weight Lock:
     * Score = count * exp(-lambda * delta_hours)
     * Half-life ~ 14 days (lambda = 0.002 per hour for general words)
     * If isDevDomain is true:
     *   - Freezes decay (lambda = 0.0001, effectively zero decay)
     *   - Grants a robust base anchor bonus (+5.0) so technical tokens and commands
     *     are never eclipsed by fast conversational chat volume.
     */
    calculateRecencyFrequencyScore(entry, now = Date.now(), isDevDomain = false) {
      if (!entry) return 0;
      if (typeof entry === "number") {
        return isDevDomain ? entry + 5 : entry;
      }
      const count = entry.count || 1;
      const lastUsed = entry.lastUsed || now;
      const hoursElapsed = Math.max(0, (now - lastUsed) / (1e3 * 60 * 60));
      const lambda = isDevDomain ? 1e-4 : 2e-3;
      const decay = Math.exp(-lambda * hoursElapsed);
      const score = count * decay;
      return isDevDomain ? score + 5 : score;
    }
    async loadFromStorage() {
      const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
      try {
        if (storageLocal) {
          const stored = await new Promise((resolve) => {
            try {
              const p = storageLocal.get([this.storageKey], (res) => resolve(res || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (stored && stored[this.storageKey]) {
            const parsed = stored[this.storageKey];
            const incomingUpdatedAt = parsed.updatedAt || 0;
            if (incomingUpdatedAt < this.lastUpdatedAt) {
              return;
            }
            this.userTrigrams = parsed.trigrams || {};
            this.userBigrams = parsed.bigrams || {};
            this.userUnigrams = parsed.unigrams || {};
            this.lastUpdatedAt = incomingUpdatedAt;
            if (typeof parsed.learningEnabled === "boolean") {
              this.learningEnabled = parsed.learningEnabled;
            }
            return;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel extension storage.local load error:", e);
      }
      try {
        if (typeof localStorage === "undefined") return;
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const incomingUpdatedAt = parsed.updatedAt || 0;
          if (incomingUpdatedAt < this.lastUpdatedAt) {
            return;
          }
          this.userTrigrams = parsed.trigrams || {};
          this.userBigrams = parsed.bigrams || {};
          this.userUnigrams = parsed.unigrams || {};
          this.lastUpdatedAt = incomingUpdatedAt;
          if (typeof parsed.learningEnabled === "boolean") {
            this.learningEnabled = parsed.learningEnabled;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage load error:", e);
      }
    }
    saveToStorage() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
      }
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        this.flushSaveToStorage();
      }, 1200);
    }
    async flushSaveToStorage() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }
      const now = Date.now();
      this.lastUpdatedAt = now;
      const payload = {
        learningEnabled: this.learningEnabled,
        trigrams: this.userTrigrams,
        bigrams: this.userBigrams,
        unigrams: this.userUnigrams,
        updatedAt: now
      };
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(this.storageKey, JSON.stringify(payload));
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage save error:", e);
      }
      try {
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          await new Promise((resolve) => {
            try {
              const p = storageLocal.set({ [this.storageKey]: payload }, () => resolve());
              if (p && typeof p.then === "function") p.then(resolve).catch(resolve);
            } catch {
              resolve();
            }
          });
        }
      } catch (e) {
      }
    }
    /**
     * Record a trigram transition (word1 + word2 -> word3)
     */
    recordTrigramTransition(w1, w2, w3) {
      if (!this.learningEnabled) return;
      const word1 = (w1 || "").trim().toLowerCase();
      const word2 = (w2 || "").trim().toLowerCase();
      const word3 = (w3 || "").trim().toLowerCase();
      if (!word1 || !word2 || !word3) return;
      if (word1.length > 30 || word2.length > 30 || word3.length > 30) return;
      const trigramKey = `${word1} ${word2}`;
      if (!this.userTrigrams[trigramKey]) {
        this.userTrigrams[trigramKey] = {};
      }
      const current = this.userTrigrams[trigramKey][word3];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
      this.userTrigrams[trigramKey][word3] = {
        count: prevCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Record a bigram transition (word1 -> word2)
     */
    recordTransition(prevWord, nextWord) {
      if (!this.learningEnabled) return;
      const prev = (prevWord || "").trim().toLowerCase();
      const next = (nextWord || "").trim().toLowerCase();
      if (!prev || !next || prev === next) return;
      if (prev.length > 30 || next.length > 30) return;
      if (!this.userBigrams[prev]) {
        this.userBigrams[prev] = {};
      }
      const current = this.userBigrams[prev][next];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
      this.userBigrams[prev][next] = {
        count: prevCount + 1,
        lastUsed: Date.now()
      };
      const curUnigram = this.userUnigrams[next];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
      this.userUnigrams[next] = {
        count: unigramCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Record word acceptance or completion frequency
     */
    recordWordUsage(word) {
      if (!this.learningEnabled) return;
      const w = (word || "").trim().toLowerCase();
      if (!w) return;
      const curUnigram = this.userUnigrams[w];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
      this.userUnigrams[w] = {
        count: unigramCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Remove a specific bigram pair from learned habits
     * @param {string} from Starting word
     * @param {string} to Next predicted word
     */
    removeBigram(from, to) {
      const f = (from || "").trim().toLowerCase();
      const t = (to || "").trim().toLowerCase();
      if (!f || !t || !this.userBigrams[f]) return false;
      if (this.userBigrams[f][t]) {
        delete this.userBigrams[f][t];
        if (Object.keys(this.userBigrams[f]).length === 0) {
          delete this.userBigrams[f];
        }
        this.flushSaveToStorage();
        return true;
      }
      return false;
    }
    /**
     * Update or edit an existing learned bigram pair
     * @param {string} oldFrom Previous starting word
     * @param {string} oldTo Previous target word
     * @param {string} newFrom New starting word
     * @param {string} newTo New target word
     * @param {number} newCount Optional new count
     */
    updateBigram(oldFrom, oldTo, newFrom, newTo, newCount) {
      const of = (oldFrom || "").trim().toLowerCase();
      const ot = (oldTo || "").trim().toLowerCase();
      const nf = (newFrom || "").trim().toLowerCase();
      const nt = (newTo || "").trim().toLowerCase();
      if (!of || !ot || !nf || !nt) return false;
      let existingCount = 1;
      let existingLastUsed = Date.now();
      if (this.userBigrams[of] && this.userBigrams[of][ot]) {
        const cur = this.userBigrams[of][ot];
        existingCount = typeof cur === "number" ? cur : cur?.count || 1;
        existingLastUsed = cur?.lastUsed || Date.now();
        delete this.userBigrams[of][ot];
        if (Object.keys(this.userBigrams[of]).length === 0) {
          delete this.userBigrams[of];
        }
      }
      const finalCount = typeof newCount === "number" && newCount > 0 ? newCount : existingCount;
      if (!this.userBigrams[nf]) {
        this.userBigrams[nf] = {};
      }
      this.userBigrams[nf][nt] = {
        count: finalCount,
        lastUsed: existingLastUsed
      };
      if (!this.userUnigrams[nt]) {
        this.userUnigrams[nt] = { count: finalCount, lastUsed: existingLastUsed };
      }
      this.flushSaveToStorage();
      return true;
    }
    /**
     * Reset all learned habits
     */
    clear() {
      this.userTrigrams = {};
      this.userBigrams = {};
      this.userUnigrams = {};
      this.flushSaveToStorage();
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove([this.storageKey]).catch(() => {
          });
        }
      } catch (e) {
      }
    }
    /**
     * Seed sample collocations and user habits for demonstration
     */
    seedSampleHabits() {
      const samples = [
        ["nghiên", "cứu", 6],
        ["công", "nghệ", 5],
        ["thông", "tin", 5],
        ["trí", "tuệ", 4],
        ["học", "tập", 4],
        ["sinh", "viên", 4],
        ["phát", "triển", 4],
        ["cấp", "cứu", 4],
        ["việt", "nam", 4]
      ];
      const now = Date.now();
      for (const [w1, w2, times] of samples) {
        if (!this.userBigrams[w1]) {
          this.userBigrams[w1] = {};
        }
        this.userBigrams[w1][w2] = { count: times, lastUsed: now };
        this.userUnigrams[w2] = { count: times, lastUsed: now };
      }
      const sampleTrigrams = [
        ["xe", "cấp", "cứu", 5],
        ["hồ", "chí", "minh", 5],
        ["bộ", "giao", "thông", 4],
        ["trí", "tuệ", "nhân tạo", 4]
      ];
      for (const [w1, w2, w3, times] of sampleTrigrams) {
        const k = `${w1} ${w2}`;
        if (!this.userTrigrams[k]) this.userTrigrams[k] = {};
        this.userTrigrams[k][w3] = { count: times, lastUsed: now };
      }
      this.flushSaveToStorage();
      return samples.length;
    }
    /**
     * Retrieve statistical summary of learned habits
     */
    getStats() {
      let totalTransitions = 0;
      const topPairs = [];
      for (const [from, toMap] of Object.entries(this.userBigrams)) {
        for (const [to, entry] of Object.entries(toMap)) {
          const count = typeof entry === "number" ? entry : entry?.count || 0;
          totalTransitions += count;
          topPairs.push({ from, to, count });
        }
      }
      topPairs.sort((a, b) => b.count - a.count);
      return {
        totalPairs: Object.keys(this.userBigrams).length,
        totalTrigrams: Object.keys(this.userTrigrams).length,
        totalTransitions,
        topPairs: topPairs.slice(0, 30),
        totalWordsLearned: Object.keys(this.userUnigrams).length
      };
    }
    /**
     * Export all learned habits data as JSON string
     * @returns {string} Formatted JSON
     */
    exportJSON() {
      const payload = {
        version: "2.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        trigrams: this.userTrigrams,
        bigrams: this.userBigrams,
        unigrams: this.userUnigrams
      };
      return JSON.stringify(payload, null, 2);
    }
    /**
     * Export bigram habits as CSV string
     * Format: "word1,word2,count"
     * @returns {string} CSV text
     */
    exportCSV() {
      const rows = ["Tu_bat_dau,Tu_ke_tiep,So_lan_go"];
      for (const [w1, toMap] of Object.entries(this.userBigrams)) {
        for (const [w2, entry] of Object.entries(toMap)) {
          const count = typeof entry === "number" ? entry : entry?.count || 0;
          rows.push(`"${w1.replace(/"/g, '""')}","${w2.replace(/"/g, '""')}",${count}`);
        }
      }
      return rows.join("\n");
    }
    /**
     * Import learned habits from JSON or CSV string
     * @param {string} rawText Input string
     * @param {boolean} merge If true, increment/combine counts; if false, overwrite
     * @returns {{ success: boolean, count: number, error?: string }}
     */
    importData(rawText, merge = true) {
      if (!rawText || typeof rawText !== "string") {
        return { success: false, count: 0, error: "Dữ liệu nhập rỗng hoặc không hợp lệ." };
      }
      const trimmed = rawText.trim();
      if (!trimmed) {
        return { success: false, count: 0, error: "Nội dung nhập rỗng." };
      }
      let importedBigrams = {};
      let importedUnigrams = {};
      let pairCount = 0;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          const bigramsSrc = parsed.bigrams || parsed.userBigrams || (typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null);
          const trigramsSrc = parsed.trigrams || parsed.userTrigrams || {};
          const unigramsSrc = parsed.unigrams || parsed.userUnigrams || {};
          if (!bigramsSrc || typeof bigramsSrc !== "object") {
            return { success: false, count: 0, error: "Cấu trúc JSON không chứa thuộc tính bigrams hợp lệ." };
          }
          const now = Date.now();
          for (const [w1, toMap] of Object.entries(bigramsSrc)) {
            if (toMap && typeof toMap === "object") {
              for (const [w2, entry] of Object.entries(toMap)) {
                const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
                if (!isNaN(num) && num > 0) {
                  const k1 = w1.trim().toLowerCase();
                  const k2 = w2.trim().toLowerCase();
                  if (k1 && k2) {
                    if (!importedBigrams[k1]) importedBigrams[k1] = {};
                    importedBigrams[k1][k2] = { count: num, lastUsed };
                    importedUnigrams[k2] = { count: (importedUnigrams[k2]?.count || 0) + num, lastUsed };
                    pairCount++;
                  }
                }
              }
            }
          }
          if (trigramsSrc && typeof trigramsSrc === "object") {
            if (!this.userTrigrams) this.userTrigrams = {};
            for (const [tKey, toMap] of Object.entries(trigramsSrc)) {
              if (toMap && typeof toMap === "object") {
                if (!this.userTrigrams[tKey]) this.userTrigrams[tKey] = {};
                for (const [w3, entry] of Object.entries(toMap)) {
                  const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                  const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
                  if (!isNaN(num) && num > 0) {
                    this.userTrigrams[tKey][w3.trim().toLowerCase()] = { count: num, lastUsed };
                  }
                }
              }
            }
          }
        } catch (err) {
          return { success: false, count: 0, error: `Lỗi đọc JSON: ${err.message}` };
        }
      } else {
        const lines = trimmed.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (i === 0 && (line.toLowerCase().includes("tu_bat_dau") || line.toLowerCase().includes("word1"))) {
            continue;
          }
          let parts = [];
          if (line.includes(",")) {
            parts = line.split(",");
          } else if (line.includes("	")) {
            parts = line.split("	");
          } else if (line.includes(";")) {
            parts = line.split(";");
          }
          if (parts.length >= 2) {
            const w1 = parts[0].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const w2 = parts[1].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const count = parts[2] ? parseInt(parts[2].replace(/^["']|["']$/g, "").trim(), 10) : 1;
            const validCount = isNaN(count) || count <= 0 ? 1 : count;
            if (w1 && w2) {
              const now = Date.now();
              if (!importedBigrams[w1]) importedBigrams[w1] = {};
              importedBigrams[w1][w2] = { count: validCount, lastUsed: now };
              importedUnigrams[w2] = { count: validCount, lastUsed: now };
              pairCount++;
            }
          }
        }
      }
      if (pairCount === 0) {
        return { success: false, count: 0, error: "Không tìm thấy cặp từ hợp lệ trong dữ liệu." };
      }
      if (!merge) {
        this.userBigrams = importedBigrams;
        this.userUnigrams = importedUnigrams;
      } else {
        const now = Date.now();
        for (const [w1, toMap] of Object.entries(importedBigrams)) {
          if (!this.userBigrams[w1]) this.userBigrams[w1] = {};
          for (const [w2, entry] of Object.entries(toMap)) {
            const addCount = typeof entry === "number" ? entry : entry?.count || 1;
            const cur = this.userBigrams[w1][w2];
            const curCount = typeof cur === "number" ? cur : cur?.count || 0;
            this.userBigrams[w1][w2] = { count: curCount + addCount, lastUsed: now };
          }
        }
        for (const [w, entry] of Object.entries(importedUnigrams)) {
          const addCount = typeof entry === "number" ? entry : entry?.count || 1;
          const cur = this.userUnigrams[w];
          const curCount = typeof cur === "number" ? cur : cur?.count || 0;
          this.userUnigrams[w] = { count: curCount + addCount, lastUsed: now };
        }
      }
      this.flushSaveToStorage();
      return { success: true, count: pairCount };
    }
  };
  var AutoCompleteEngine = class {
    constructor() {
      this.compounds = [...COMMON_VIETNAMESE_COMPOUNDS];
      this.compoundIndex = this.buildCompoundIndex();
      this.syllableIndex = this.buildSyllableIndex();
      this.bigrams = { ...DEFAULT_VIETNAMESE_BIGRAMS };
      this.trigrams = { ...DEFAULT_VIETNAMESE_TRIGRAMS };
      this.learnedModel = new GboardLearnedModel();
      this.enabled = true;
      this.nextWordEnabled = true;
    }
    setEnabled(enabled) {
      this.enabled = !!enabled;
    }
    setNextWordEnabled(enabled) {
      this.nextWordEnabled = !!enabled;
    }
    setLearningEnabled(enabled) {
      if (this.learnedModel) {
        this.learnedModel.learningEnabled = !!enabled;
      }
    }
    async loadFromStorage() {
      if (this.learnedModel && typeof this.learnedModel.loadFromStorage === "function") {
        return await this.learnedModel.loadFromStorage();
      }
    }
    saveToStorage() {
      if (this.learnedModel && typeof this.learnedModel.saveToStorage === "function") {
        this.learnedModel.saveToStorage();
      }
    }
    buildCompoundIndex() {
      return this.compounds.map((word) => ({
        word,
        lower: word.toLowerCase(),
        stripped: stripVietnameseAccents(word),
        type: "compound",
        displayType: "Cụm từ"
      }));
    }
    buildSyllableIndex() {
      const vnSet = getVietnameseWordSet();
      const index = [];
      for (const word of vnSet) {
        index.push({
          word,
          lower: word.toLowerCase(),
          stripped: stripVietnameseAccents(word),
          type: "syllable",
          displayType: "Từ đơn"
        });
      }
      return index;
    }
    /**
     * Add new compound words or phrases dynamically
     */
    addCustomPhrase(phrase) {
      const clean = (phrase || "").trim();
      if (!clean || this.compounds.includes(clean)) return;
      this.compounds.push(clean);
      this.compoundIndex.push({
        word: clean,
        lower: clean.toLowerCase(),
        stripped: stripVietnameseAccents(clean),
        type: "compound",
        displayType: "Cụm từ"
      });
    }
    /**
     * Record word transition when user types or chooses word sequence
     * Supports both bigram (w1 -> w2) and trigram (w0 -> w1 -> w2) learning
     */
    recordWordTransition(prevWord, nextWord, priorWord = "") {
      this.learnedModel.recordTransition(prevWord, nextWord);
      if (priorWord) {
        this.learnedModel.recordTrigramTransition(priorWord, prevWord, nextWord);
      }
    }
    /**
     * Record word usage
     */
    recordWordUsage(word) {
      this.learnedModel.recordWordUsage(word);
    }
    /**
     * Retrieve statistics about learned habits
     */
    getLearnedStats() {
      return this.learnedModel.getStats();
    }
    /**
     * Remove a specific bigram pair from learned habits
     */
    removeLearnedHabit(from, to) {
      return this.learnedModel.removeBigram(from, to);
    }
    /**
     * Update or edit an existing learned bigram pair
     */
    updateLearnedHabit(oldFrom, oldTo, newFrom, newTo, newCount) {
      return this.learnedModel.updateBigram(oldFrom, oldTo, newFrom, newTo, newCount);
    }
    /**
     * Clear learned habits
     */
    clearLearnedHabits() {
      this.learnedModel.clear();
    }
    /**
     * Seed sample collocations and user habits for demonstration
     */
    seedLearnedHabits() {
      return this.learnedModel.seedSampleHabits();
    }
    /**
     * Export learned habits to JSON
     */
    exportLearnedJSON() {
      return this.learnedModel.exportJSON();
    }
    /**
     * Export learned habits to CSV
     */
    exportLearnedCSV() {
      return this.learnedModel.exportCSV();
    }
    /**
     * Import learned habits from text
     */
    importLearnedData(rawText, merge = true) {
      return this.learnedModel.importData(rawText, merge);
    }
    /**
     * Predict Next Word(s) based on 2-word prior context (Trigram), 1-word prior context (Bigram),
     * exponential recency-frequency decay, and Vietnamese compound collocations (Gboard style).
     *
     * @param {string} previousWord The immediate word preceding the cursor (W_n-1)
     * @param {number} limit Maximum number of candidates to return (default: 5)
     * @param {string} priorWord Optional 2nd word preceding the cursor (W_n-2) for Trigram inference
     * @returns {Array<{ word: string, displayType: string, type: 'learned' | 'trigram' | 'bigram' | 'compound', count?: number, score?: number }>}
     */
    getNextWordSuggestions(previousWord, limit = 5, priorWord = "") {
      if (!this.enabled || !this.nextWordEnabled || !previousWord) return [];
      const raw = previousWord.trim();
      if (!raw) return [];
      const prevLower = raw.toLowerCase();
      const priorLower = (priorWord || "").trim().toLowerCase();
      const isFirstUpper = raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
      const isAllUpper = raw.length > 1 && raw === raw.toUpperCase();
      const candidates = [];
      const seen = /* @__PURE__ */ new Set();
      const now = Date.now();
      const isDevDomain = Boolean(DEVELOPER_WHITELIST_BIGRAMS[prevLower]);
      if (priorLower) {
        const trigramKey = `${priorLower} ${prevLower}`;
        const userTrigramFollowers = this.learnedModel.userTrigrams[trigramKey];
        if (userTrigramFollowers) {
          const sortedTrigrams = Object.entries(userTrigramFollowers).map(([w, entry]) => ({
            w,
            score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
            rawCount: typeof entry === "number" ? entry : entry?.count || 1
          })).sort((a, b) => b.score - a.score);
          for (const { w, rawCount, score } of sortedTrigrams) {
            if (!seen.has(w)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Thói quen sâu",
                type: "learned",
                count: rawCount,
                score
              });
              seen.add(w);
            }
            if (candidates.length >= limit) break;
          }
        }
        const baseTrigramFollowers = this.trigrams[trigramKey];
        if (baseTrigramFollowers && candidates.length < limit) {
          for (const w of baseTrigramFollowers) {
            const wLower = w.toLowerCase();
            if (!seen.has(wLower)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Ngữ cảnh sâu",
                type: "trigram"
              });
              seen.add(wLower);
            }
            if (candidates.length >= limit) break;
          }
        }
      }
      const userFollowers = this.learnedModel.userBigrams[prevLower];
      if (userFollowers && candidates.length < limit) {
        const sortedUserFollowers = Object.entries(userFollowers).map(([w, entry]) => ({
          w,
          score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
          rawCount: typeof entry === "number" ? entry : entry?.count || 1
        })).sort((a, b) => b.score - a.score);
        for (const { w, rawCount, score } of sortedUserFollowers) {
          if (!seen.has(w)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "Thói quen",
              type: "learned",
              count: rawCount,
              score
            });
            seen.add(w);
          }
          if (candidates.length >= limit) break;
        }
      }
      const baseFollowers = this.bigrams[prevLower];
      if (baseFollowers && candidates.length < limit) {
        for (const w of baseFollowers) {
          const wLower = w.toLowerCase();
          if (!seen.has(wLower)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "Gợi ý chuẩn",
              type: "bigram"
            });
            seen.add(wLower);
          }
          if (candidates.length >= limit) break;
        }
      }
      if (candidates.length < limit) {
        for (const item of this.compoundIndex) {
          if (item.lower.startsWith(prevLower + " ")) {
            const remainder = item.word.slice(prevLower.length + 1).trim();
            const remainderLower = remainder.toLowerCase();
            if (remainder && !seen.has(remainderLower)) {
              candidates.push({
                word: this.formatWordCase(remainder, isFirstUpper, isAllUpper),
                displayType: "Cụm từ",
                type: "compound"
              });
              seen.add(remainderLower);
            }
          }
          if (candidates.length >= limit) break;
        }
      }
      return candidates.slice(0, limit);
    }
    /**
     * Find suggestions matching the current query prefix
     * @param {string} rawPrefix The word or prefix currently typed by user
     * @param {number} limit Maximum number of suggestions to return (default: 7)
     * @returns {Array<{ word: string, displayType: string, type: string, matchScore: number }>}
     */
    getSuggestions(rawPrefix, limit = 7) {
      if (!this.enabled || !rawPrefix) return [];
      const prefix = rawPrefix.trim();
      if (prefix.length < 1) return [];
      if (prefix.startsWith(":")) {
        const emojiList = getEmojiSuggestions(prefix, limit);
        if (emojiList.length > 0) {
          return emojiList;
        }
      }
      const prefixLower = prefix.toLowerCase();
      const prefixStripped = stripVietnameseAccents(prefix);
      const isFirstUpper = prefix[0] === prefix[0].toUpperCase() && prefix[0] !== prefix[0].toLowerCase();
      const isAllUpper = prefix.length > 1 && prefix === prefix.toUpperCase();
      const results = [];
      const seenWords = /* @__PURE__ */ new Set();
      const userIndex = userDictionary.getIndex();
      const now = Date.now();
      for (const item of userIndex) {
        const learnedEntry = this.learnedModel.userUnigrams[item.lower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (item.lower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "Từ riêng",
            matchScore: 100 - (item.word.length - prefix.length) + learnedBoost
          });
          seenWords.add(item.lower);
        } else if (item.stripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "Từ riêng",
            matchScore: 80 - (item.word.length - prefix.length) + learnedBoost
          });
          seenWords.add(item.lower);
        }
        if (results.length >= limit * 2) break;
      }
      for (const item of this.compoundIndex) {
        if (seenWords.has(item.lower)) continue;
        const learnedEntry = this.learnedModel.userUnigrams[item.lower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (item.lower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: item.type,
            displayType: item.displayType,
            matchScore: 90 - (item.word.length - prefix.length) * 0.5 + learnedBoost
          });
          seenWords.add(item.lower);
        } else if (item.stripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: item.type,
            displayType: item.displayType,
            matchScore: 70 - (item.word.length - prefix.length) * 0.5 + learnedBoost
          });
          seenWords.add(item.lower);
        }
        if (results.length >= limit * 3) break;
      }
      if (results.length < limit) {
        for (const item of this.syllableIndex) {
          if (item.word.length <= prefix.length && item.lower === prefixLower) continue;
          if (seenWords.has(item.lower)) continue;
          const learnedEntry = this.learnedModel.userUnigrams[item.lower];
          const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
          const learnedBoost = Math.min(learnedScore * 4, 30);
          if (item.lower.startsWith(prefixLower)) {
            results.push({
              word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
              type: item.type,
              displayType: item.displayType,
              matchScore: 60 - (item.word.length - prefix.length) + learnedBoost
            });
            seenWords.add(item.lower);
          } else if (item.stripped.startsWith(prefixStripped)) {
            results.push({
              word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
              type: item.type,
              displayType: item.displayType,
              matchScore: 40 - (item.word.length - prefix.length) + learnedBoost
            });
            seenWords.add(item.lower);
          }
          if (results.length >= limit * 2) break;
        }
      }
      if (results.length < limit && /^[a-zA-Z]+$/.test(prefix)) {
        for (const eWord of COMMON_ENGLISH_WORDS) {
          const eLower = eWord.toLowerCase();
          if (seenWords.has(eLower)) continue;
          const learnedEntry = this.learnedModel.userUnigrams[eLower];
          const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
          const learnedBoost = Math.min(learnedScore * 4, 30);
          if (eLower.startsWith(prefixLower)) {
            results.push({
              word: this.formatWordCase(eWord, isFirstUpper, isAllUpper),
              type: "tech",
              displayType: "Tiếng Anh",
              matchScore: 50 - (eWord.length - prefix.length) + learnedBoost
            });
            seenWords.add(eLower);
          }
          if (results.length >= limit * 2) break;
        }
      }
      results.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.word.length - b.word.length;
      });
      return results.slice(0, limit);
    }
    /**
     * Format suggestion capitalization to match user input case
     */
    formatWordCase(word, isFirstUpper, isAllUpper) {
      if (!word) return "";
      if (isAllUpper) {
        return word.toUpperCase();
      }
      if (isFirstUpper) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }
  };
  var autoCompleteEngine = new AutoCompleteEngine();

  // src/options/options.js
  var macroEngine = new MacroEngine(DEFAULT_MACROS);
  var settings = { ...DEFAULT_SETTINGS };
  var editingTrigger = null;
  var browserApi = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : {};
  var storageArea = browserApi.storage && browserApi.storage.sync ? browserApi.storage.sync : browserApi.storage && browserApi.storage.local ? browserApi.storage.local : null;
  async function getStorageData(keys) {
    if (storageArea) {
      try {
        const result = await new Promise((resolve) => {
          try {
            const p = storageArea.get(keys, (items) => {
              if (chrome?.runtime?.lastError) {
                console.warn("storageArea.get lastError:", chrome.runtime.lastError);
                resolve({});
              } else {
                resolve(items || {});
              }
            });
            if (p && typeof p.then === "function") {
              p.then(resolve).catch(() => resolve({}));
            }
          } catch {
            resolve({});
          }
        });
        if (result && Object.keys(result).length > 0) {
          return result;
        }
      } catch (err) {
        console.warn("Storage get error:", err);
      }
    }
    try {
      const res = {};
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            res[key] = JSON.parse(val);
          } catch {
            res[key] = val;
          }
        }
      }
      return res;
    } catch {
      return {};
    }
  }
  async function setStorageData(data) {
    if (storageArea) {
      try {
        await new Promise((resolve) => {
          try {
            const p = storageArea.set(data, () => resolve());
            if (p && typeof p.then === "function") {
              p.then(resolve).catch(() => resolve());
            }
          } catch {
            resolve();
          }
        });
      } catch (err) {
        console.warn("Storage set error:", err);
      }
    }
    try {
      for (const [k, v] of Object.entries(data)) {
        localStorage.setItem(k, JSON.stringify(v));
      }
    } catch {
    }
  }
  async function loadState() {
    try {
      const data = await getStorageData(["avim_settings", "avim_macros", "avim_domain_methods"]);
      if (data && data.avim_settings) {
        settings = { ...settings, ...data.avim_settings };
      }
      if (data && data.avim_domain_methods) {
        settings.domainMethods = data.avim_domain_methods;
      }
      if (data && Array.isArray(data.avim_macros) && data.avim_macros.length > 0) {
        macroEngine.loadMacros(data.avim_macros);
      } else {
        macroEngine.loadMacros(DEFAULT_MACROS);
        await setStorageData({ avim_macros: DEFAULT_MACROS });
      }
    } catch (err) {
      console.warn("Could not load storage in options:", err);
      macroEngine.loadMacros(DEFAULT_MACROS);
    }
    try {
      if (userDictionary && typeof userDictionary.loadFromStorage === "function") {
        await userDictionary.loadFromStorage();
      }
    } catch (err) {
      console.warn("User dictionary load error in options:", err);
    }
    try {
      if (autoCompleteEngine && typeof autoCompleteEngine.loadFromStorage === "function") {
        await autoCompleteEngine.loadFromStorage();
      }
    } catch (err) {
      console.warn("AutoComplete load error in options:", err);
    }
  }
  async function saveState() {
    await setStorageData({
      avim_settings: settings,
      avim_macros: macroEngine.getMacros(),
      avim_domain_methods: settings.domainMethods || {}
    });
    showToast("Đã lưu cấu hình thành công!");
  }
  function showToast(msg) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = msg;
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2500);
    }
  }
  function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = btn.getAttribute("data-tab");
        if (!tabId) return;
        tabBtns.forEach((b) => b.classList.remove("active"));
        tabPanes.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
          targetPane.classList.add("active");
        }
        if (tabId === "aiTab" && typeof renderHabitsTableAndStats === "function") {
          renderHabitsTableAndStats();
        }
      });
    });
  }
  function initTable() {
    const tbody = document.getElementById("macroTableBody");
    const searchInput = document.getElementById("macroSearch");
    const resetBtn = document.getElementById("resetDefaultsBtn");
    const loadSaigonBtn = document.getElementById("loadSaigonPresetBtn");
    function renderRows() {
      const query = (searchInput.value || "").toLowerCase().trim();
      const macros = macroEngine.getMacros().filter((m) => {
        if (!query) return true;
        return m.trigger.toLowerCase().includes(query) || m.value.toLowerCase().includes(query);
      });
      tbody.textContent = "";
      if (macros.length === 0) {
        const emptyTr = document.createElement("tr");
        const emptyTd = document.createElement("td");
        emptyTd.colSpan = 4;
        Object.assign(emptyTd.style, {
          textAlign: "center",
          padding: "24px",
          color: "#94a3b8"
        });
        emptyTd.textContent = "Không tìm thấy từ viết tắt nào.";
        emptyTr.appendChild(emptyTd);
        tbody.appendChild(emptyTr);
        return;
      }
      macros.forEach((item) => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "toggle-enabled";
        cb.setAttribute("data-trigger", item.trigger);
        cb.checked = Boolean(item.enabled);
        td1.appendChild(cb);
        const td2 = document.createElement("td");
        const tag = document.createElement("span");
        tag.className = "tag-trigger";
        tag.textContent = item.trigger;
        td2.appendChild(tag);
        const td3 = document.createElement("td");
        td3.textContent = item.value;
        const td4 = document.createElement("td");
        td4.style.textAlign = "right";
        const editBtn = document.createElement("button");
        editBtn.className = "btn edit-btn";
        editBtn.setAttribute("data-trigger", item.trigger);
        Object.assign(editBtn.style, {
          padding: "4px 8px",
          fontSize: "12px",
          marginRight: "4px"
        });
        editBtn.textContent = "Sửa";
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger delete-btn";
        deleteBtn.setAttribute("data-trigger", item.trigger);
        Object.assign(deleteBtn.style, {
          padding: "4px 8px",
          fontSize: "12px"
        });
        deleteBtn.textContent = "Xóa";
        td4.appendChild(editBtn);
        td4.appendChild(deleteBtn);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll(".toggle-enabled").forEach((cb) => {
        cb.addEventListener("change", async (e) => {
          const trigger = e.target.getAttribute("data-trigger");
          macroEngine.toggleMacro(trigger);
          await saveState();
        });
      });
      tbody.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const trigger = btn.getAttribute("data-trigger");
          openEditModal(trigger);
        });
      });
      tbody.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const trigger = btn.getAttribute("data-trigger");
          if (confirm(`Bạn có chắc muốn xóa từ viết tắt "${trigger}"?`)) {
            macroEngine.removeMacro(trigger);
            renderRows();
            await saveState();
          }
        });
      });
    }
    searchInput.addEventListener("input", renderRows);
    resetBtn.addEventListener("click", async () => {
      if (confirm("Khôi phục danh sách từ viết tắt về mặc định ban đầu?")) {
        macroEngine.loadMacros(DEFAULT_MACROS);
        renderRows();
        await saveState();
      }
    });
    loadSaigonBtn?.addEventListener("click", async () => {
      if (confirm("Nạp thêm mẫu viết tắt Sài Gòn Xưa / Nam Bộ vào bảng gõ tắt hiện tại? (Các từ trùng phím tắt sẽ được cập nhật)")) {
        SAIGON_XUA_MACROS.forEach((m) => {
          macroEngine.setMacro(m.trigger, m.value, m.enabled);
        });
        renderRows();
        await saveState();
        showToast("Đã nạp thành công 40 mẫu từ viết tắt Sài Gòn Xưa!");
      }
    });
    document.getElementById("loadDevGitPresetBtn")?.addEventListener("click", async () => {
      if (confirm("Nạp thêm bộ gõ tắt Lập trình & Git vào bảng gõ tắt hiện tại?")) {
        DEV_GIT_MACROS.forEach((m) => {
          macroEngine.setMacro(m.trigger, m.value, m.enabled);
        });
        renderRows();
        await saveState();
        showToast(`Đã nạp thành công ${DEV_GIT_MACROS.length} mẫu Lập trình & Git!`);
      }
    });
    document.getElementById("loadMathPresetBtn")?.addEventListener("click", async () => {
      if (confirm("Nạp thêm bộ gõ tắt Toán học & Ký hiệu vào bảng gõ tắt hiện tại?")) {
        MATH_SCIENCE_MACROS.forEach((m) => {
          macroEngine.setMacro(m.trigger, m.value, m.enabled);
        });
        renderRows();
        await saveState();
        showToast(`Đã nạp thành công ${MATH_SCIENCE_MACROS.length} mẫu Toán học & Ký hiệu!`);
      }
    });
    renderRows();
    window.refreshMacroTable = renderRows;
  }
  function initModals() {
    const modal = document.getElementById("macroModal");
    const addBtn = document.getElementById("addMacroBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const saveBtn = document.getElementById("modalSaveBtn");
    const saveAndContinueBtn = document.getElementById("modalSaveAndContinueBtn");
    const triggerInput = document.getElementById("modalTrigger");
    const valueInput = document.getElementById("modalValue");
    const modalTitle = document.getElementById("modalTitle");
    function openAddModal() {
      editingTrigger = null;
      modalTitle.textContent = "Thêm Từ Viết Tắt Mới";
      triggerInput.value = "";
      valueInput.value = "";
      triggerInput.disabled = false;
      modal.classList.add("open");
      triggerInput.focus();
    }
    window.openEditModal = function(trigger) {
      const macro = macroEngine.macros.get(trigger.toLowerCase());
      if (!macro) return;
      editingTrigger = trigger;
      modalTitle.textContent = `Chỉnh Sửa Từ Viết Tắt "${trigger}"`;
      triggerInput.value = macro.trigger;
      valueInput.value = macro.value;
      modal.classList.add("open");
      valueInput.focus();
    };
    addBtn.addEventListener("click", openAddModal);
    cancelBtn.addEventListener("click", () => modal.classList.remove("open"));
    async function saveMacroItem(keepOpen) {
      const trigger = triggerInput.value.trim();
      const value = valueInput.value.trim();
      if (!trigger || !value) {
        alert("Vui lòng nhập cả từ viết tắt và cụm từ thay thế.");
        if (!trigger) triggerInput.focus();
        else valueInput.focus();
        return;
      }
      const existing = macroEngine.macros.get(trigger.toLowerCase());
      if (existing && (!editingTrigger || editingTrigger.toLowerCase() !== trigger.toLowerCase())) {
        if (!confirm(`Từ viết tắt "${existing.trigger}" đã tồn tại với nghĩa: "${existing.value}".
Bạn có muốn ghi đè lên từ này không?`)) {
          triggerInput.focus();
          return;
        }
      }
      if (editingTrigger && editingTrigger.toLowerCase() !== trigger.toLowerCase()) {
        macroEngine.removeMacro(editingTrigger);
      }
      macroEngine.setMacro(trigger, value, true);
      window.refreshMacroTable();
      await saveState();
      if (keepOpen) {
        editingTrigger = null;
        modalTitle.textContent = "Thêm Từ Viết Tắt Mới";
        triggerInput.value = "";
        valueInput.value = "";
        triggerInput.disabled = false;
        triggerInput.focus();
        showToast(`Đã lưu "${trigger}"! Mời nhập tiếp.`);
      } else {
        modal.classList.remove("open");
        showToast("Đã lưu bảng gõ tắt!");
      }
    }
    saveBtn.addEventListener("click", () => saveMacroItem(false));
    if (saveAndContinueBtn) {
      saveAndContinueBtn.addEventListener("click", () => saveMacroItem(true));
    }
    triggerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        valueInput.focus();
      }
    });
    valueInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          saveMacroItem(false);
        } else {
          saveMacroItem(true);
        }
      }
    });
  }
  function initDictionaryTab() {
    const tbody = document.getElementById("dictTableBody");
    const searchInput = document.getElementById("dictSearch");
    const newWordInput = document.getElementById("newDictWordInput");
    const addWordBtn = document.getElementById("addDictWordBtn");
    const exportTxtBtn = document.getElementById("exportDictTxtBtn");
    const exportJsonBtn = document.getElementById("exportDictJsonBtn");
    const importBtn = document.getElementById("importDictBtn");
    const importModal = document.getElementById("importDictModal");
    const importTextarea = document.getElementById("importDictTextarea");
    const importCancelBtn = document.getElementById("importDictCancelBtn");
    const importConfirmBtn = document.getElementById("importDictConfirmBtn");
    function renderDictRows() {
      if (!tbody) return;
      const query = (searchInput?.value || "").toLowerCase().trim();
      const words = userDictionary.getWords().filter((w) => !query || w.includes(query));
      tbody.textContent = "";
      if (words.length === 0) {
        const emptyTr = document.createElement("tr");
        const emptyTd = document.createElement("td");
        emptyTd.colSpan = 3;
        Object.assign(emptyTd.style, {
          textAlign: "center",
          padding: "24px",
          color: "#94a3b8"
        });
        emptyTd.textContent = "Chưa có từ riêng nào trong từ điển cá nhân.";
        emptyTr.appendChild(emptyTd);
        tbody.appendChild(emptyTr);
        return;
      }
      words.forEach((word, index) => {
        const tr = document.createElement("tr");
        const tdIndex = document.createElement("td");
        tdIndex.textContent = String(index + 1);
        tdIndex.style.color = "#94a3b8";
        tr.appendChild(tdIndex);
        const tdWord = document.createElement("td");
        const spanWord = document.createElement("span");
        spanWord.className = "tag-trigger font-mono";
        spanWord.textContent = word;
        tdWord.appendChild(spanWord);
        const isCustom = userDictionary.customWords && userDictionary.customWords.has(word);
        if (isCustom) {
          const badgeCustom = document.createElement("span");
          badgeCustom.style.cssText = "font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 600;";
          badgeCustom.textContent = "Tự học / Đã thêm";
          tdWord.appendChild(badgeCustom);
        }
        tr.appendChild(tdWord);
        const tdActions = document.createElement("td");
        tdActions.style.textAlign = "right";
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger";
        deleteBtn.textContent = "Xóa";
        deleteBtn.addEventListener("click", async () => {
          if (confirm(`Xóa từ "${word}" khỏi từ điển cá nhân?`)) {
            userDictionary.remove(word);
            renderDictRows();
            showToast(`Đã xóa "${word}" khỏi từ điển!`);
          }
        });
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
      });
    }
    window.refreshDictTable = renderDictRows;
    searchInput?.addEventListener("input", renderDictRows);
    function addNewWord() {
      const raw = (newWordInput?.value || "").trim();
      if (!raw) return;
      if (userDictionary.add(raw)) {
        newWordInput.value = "";
        renderDictRows();
        showToast(`Đã thêm "${raw.toLowerCase()}" vào từ điển cá nhân!`);
      } else {
        alert("Từ này đã có trong từ điển.");
      }
    }
    addWordBtn?.addEventListener("click", addNewWord);
    newWordInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addNewWord();
      }
    });
    exportTxtBtn?.addEventListener("click", () => {
      const data = userDictionary.exportText("txt");
      downloadFile(data, "tu-dien-ca-nhan.txt", "text/plain");
    });
    exportJsonBtn?.addEventListener("click", () => {
      const data = userDictionary.exportText("json");
      downloadFile(data, "tu-dien-ca-nhan.json", "application/json");
    });
    importBtn?.addEventListener("click", () => {
      if (importTextarea) importTextarea.value = "";
      importModal?.classList.add("open");
    });
    importCancelBtn?.addEventListener("click", () => {
      importModal?.classList.remove("open");
    });
    importConfirmBtn?.addEventListener("click", () => {
      const text = importTextarea?.value || "";
      const count = userDictionary.importText(text);
      importModal?.classList.remove("open");
      renderDictRows();
      showToast(`Đã nạp thành công ${count} từ vào từ điển cá nhân!`);
    });
    renderDictRows();
  }
  function initPreferences() {
    const methodSelect = document.getElementById("methodSelect");
    const toneStyleSelect = document.getElementById("toneStyleSelect");
    const spellCheckOption = document.getElementById("spellCheckOption");
    const quickTelexOption = document.getElementById("quickTelexOption");
    const typeW2UOption = document.getElementById("typeW2UOption");
    const smartHornOption = document.getElementById("smartHornOption");
    const emojiShortcutsOption = document.getElementById("emojiShortcutsOption");
    const autoCapitalizeOption = document.getElementById("autoCapitalizeOption");
    const perDomainMemoryOption = document.getElementById("perDomainMemoryOption");
    const quickConsonantsOption = document.getElementById("quickConsonantsOption");
    const autoUndoOption = document.getElementById("autoUndoOption");
    const ctrlToggleOption = document.getElementById("ctrlToggleOption");
    const autoRestoreEnglishOption = document.getElementById("autoRestoreEnglishOption");
    const escRevertOption = document.getElementById("escRevertOption");
    const phonologyRulesOption = document.getElementById("phonologyRulesOption");
    const wordRescueOption = document.getElementById("wordRescueOption");
    const flipWordShortcutInput = document.getElementById("flipWordShortcutInput");
    const resetFlipWordShortcutBtn = document.getElementById("resetFlipWordShortcutBtn");
    const autoHarmonizeCaseOption = document.getElementById("autoHarmonizeCaseOption");
    const eraseHabitLearningOption = document.getElementById("eraseHabitLearningOption");
    const eraseHabitThresholdInput = document.getElementById("eraseHabitThresholdInput");
    const debugTypingLogOption = document.getElementById("debugTypingLogOption");
    const typingLogControls = document.getElementById("typingLogControls");
    const typingLogCountBadge = document.getElementById("typingLogCountBadge");
    const downloadTypingLogBtn = document.getElementById("downloadTypingLogBtn");
    const clearTypingLogBtn = document.getElementById("clearTypingLogBtn");
    const blacklistTextarea = document.getElementById("blacklistTextarea");
    const newDomainInput = document.getElementById("newDomainInput");
    const newDomainMethodSelect = document.getElementById("newDomainMethodSelect");
    const addDomainBtn = document.getElementById("addDomainBtn");
    const domainMethodsTableBody = document.getElementById("domainMethodsTableBody");
    const autoCompleteOption = document.getElementById("autoCompleteOption");
    const nextWordOption = document.getElementById("nextWordOption");
    const gboardLearningOption = document.getElementById("gboardLearningOption");
    const suggestionStyleSelect = document.getElementById("suggestionStyleSelect");
    const aiTabAutoComplete = document.getElementById("aiTabAutoComplete");
    const aiTabNextWord = document.getElementById("aiTabNextWord");
    const aiTabLearning = document.getElementById("aiTabLearning");
    const aiTabSuggestionStyle = document.getElementById("aiTabSuggestionStyle");
    window.syncPreferencesUI = function syncPreferencesUI() {
      if (methodSelect) methodSelect.value = String(settings.method ?? 3);
      if (toneStyleSelect) toneStyleSelect.value = settings.toneStyle || "classic";
      if (spellCheckOption) spellCheckOption.checked = Boolean(settings.spellCheck);
      if (quickTelexOption) quickTelexOption.checked = settings.quickTelex !== false;
      if (typeW2UOption) typeW2UOption.checked = settings.typeW2U !== false;
      if (smartHornOption) smartHornOption.checked = settings.smartHorn !== false;
      if (emojiShortcutsOption) emojiShortcutsOption.checked = settings.emojiShortcuts !== false;
      if (autoCapitalizeOption) autoCapitalizeOption.checked = settings.autoCapitalize !== false;
      if (perDomainMemoryOption) perDomainMemoryOption.checked = settings.perDomainMemory !== false;
      if (quickConsonantsOption) quickConsonantsOption.checked = Boolean(settings.quickConsonants);
      if (autoUndoOption) autoUndoOption.checked = Boolean(settings.autoUndo);
      if (autoRestoreEnglishOption) autoRestoreEnglishOption.checked = settings.autoRestoreEnglish !== false;
      if (escRevertOption) escRevertOption.checked = settings.escRevert !== false;
      if (phonologyRulesOption) phonologyRulesOption.checked = settings.phonologyRules !== false;
      if (wordRescueOption) wordRescueOption.checked = settings.wordRescue !== false;
      if (flipWordShortcutInput) flipWordShortcutInput.value = settings.flipWordShortcut || "Alt+R";
      if (autoHarmonizeCaseOption) autoHarmonizeCaseOption.checked = Boolean(settings.autoHarmonizeCase);
      if (eraseHabitLearningOption) eraseHabitLearningOption.checked = settings.eraseHabitLearning !== false;
      if (eraseHabitThresholdInput) eraseHabitThresholdInput.value = String(settings.eraseHabitThreshold || 3);
      const thresholdGroup = document.getElementById("eraseHabitThresholdGroup");
      if (thresholdGroup) thresholdGroup.style.display = settings.eraseHabitLearning !== false ? "flex" : "none";
      if (ctrlToggleOption) ctrlToggleOption.checked = settings.ctrlToggleEnabled !== false;
      if (debugTypingLogOption) debugTypingLogOption.checked = Boolean(settings.debugTypingLog);
      updateTypingLogUI();
      if (blacklistTextarea) blacklistTextarea.value = (settings.blacklistedDomains || []).join("\n");
      const isAutoComplete = settings.autoCompleteEnabled !== false;
      const isNextWord = settings.nextWordEnabled !== false;
      const isLearning = settings.gboardLearningEnabled !== false;
      if (autoCompleteOption) autoCompleteOption.checked = isAutoComplete;
      if (aiTabAutoComplete) aiTabAutoComplete.checked = isAutoComplete;
      if (nextWordOption) nextWordOption.checked = isNextWord;
      if (aiTabNextWord) aiTabNextWord.checked = isNextWord;
      if (gboardLearningOption) gboardLearningOption.checked = isLearning;
      if (aiTabLearning) aiTabLearning.checked = isLearning;
      const styleVal = settings.suggestionStyle || "ribbon";
      if (suggestionStyleSelect) suggestionStyleSelect.value = styleVal;
      if (aiTabSuggestionStyle) aiTabSuggestionStyle.value = styleVal;
      autoCompleteEngine.setEnabled(isAutoComplete);
      autoCompleteEngine.setNextWordEnabled(isNextWord);
      autoCompleteEngine.setLearningEnabled(isLearning);
    };
    window.syncPreferencesUI();
    methodSelect.addEventListener("change", async () => {
      settings.method = parseInt(methodSelect.value, 10);
      await saveState();
    });
    toneStyleSelect.addEventListener("change", async () => {
      settings.toneStyle = toneStyleSelect.value;
      await saveState();
    });
    spellCheckOption.addEventListener("change", async () => {
      settings.spellCheck = spellCheckOption.checked;
      await saveState();
    });
    if (quickTelexOption) {
      quickTelexOption.addEventListener("change", async () => {
        settings.quickTelex = quickTelexOption.checked;
        await saveState();
      });
    }
    if (typeW2UOption) {
      typeW2UOption.addEventListener("change", async () => {
        settings.typeW2U = typeW2UOption.checked;
        await saveState();
      });
    }
    if (smartHornOption) {
      smartHornOption.addEventListener("change", async () => {
        settings.smartHorn = smartHornOption.checked;
        await saveState();
      });
    }
    if (emojiShortcutsOption) {
      emojiShortcutsOption.addEventListener("change", async () => {
        settings.emojiShortcuts = emojiShortcutsOption.checked;
        await saveState();
      });
    }
    if (autoCapitalizeOption) {
      autoCapitalizeOption.addEventListener("change", async () => {
        settings.autoCapitalize = autoCapitalizeOption.checked;
        await saveState();
      });
    }
    if (perDomainMemoryOption) {
      perDomainMemoryOption.addEventListener("change", async () => {
        settings.perDomainMemory = perDomainMemoryOption.checked;
        await saveState();
      });
    }
    if (quickConsonantsOption) {
      quickConsonantsOption.addEventListener("change", async () => {
        settings.quickConsonants = quickConsonantsOption.checked;
        await saveState();
      });
    }
    autoUndoOption.addEventListener("change", async () => {
      settings.autoUndo = autoUndoOption.checked;
      await saveState();
    });
    if (autoRestoreEnglishOption) {
      autoRestoreEnglishOption.addEventListener("change", async () => {
        settings.autoRestoreEnglish = autoRestoreEnglishOption.checked;
        await saveState();
      });
    }
    if (escRevertOption) {
      escRevertOption.addEventListener("change", async () => {
        settings.escRevert = escRevertOption.checked;
        await saveState();
      });
    }
    if (phonologyRulesOption) {
      phonologyRulesOption.addEventListener("change", async () => {
        settings.phonologyRules = phonologyRulesOption.checked;
        await saveState();
      });
    }
    if (wordRescueOption) {
      wordRescueOption.addEventListener("change", async () => {
        settings.wordRescue = wordRescueOption.checked;
        await saveState();
      });
    }
    if (flipWordShortcutInput) {
      flipWordShortcutInput.addEventListener("keydown", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (["Control", "Alt", "Shift", "Meta", "OS", "Super"].includes(e.key)) {
          return;
        }
        const modifiers = [];
        if (e.ctrlKey) modifiers.push("Ctrl");
        if (e.altKey) modifiers.push("Alt");
        if (e.shiftKey) modifiers.push("Shift");
        if (e.metaKey) modifiers.push("Meta");
        if (modifiers.length === 0) {
          alert("Vui lòng kết hợp ít nhất một phím bổ trợ (Ctrl, Alt, Shift hoặc Meta).");
          return;
        }
        let keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        if (e.code && e.code.startsWith("Key")) {
          keyName = e.code.slice(3).toUpperCase();
        } else if (e.code && e.code.startsWith("Digit")) {
          keyName = e.code.slice(5);
        }
        const combo = [...modifiers, keyName].join("+");
        flipWordShortcutInput.value = combo;
        settings.flipWordShortcut = combo;
        await saveState();
        showToast(`Đã đặt phím tắt đảo từ thành: ${combo}`);
      });
    }
    if (resetFlipWordShortcutBtn) {
      resetFlipWordShortcutBtn.addEventListener("click", async () => {
        settings.flipWordShortcut = "Alt+R";
        if (flipWordShortcutInput) flipWordShortcutInput.value = "Alt+R";
        await saveState();
        showToast("Đã khôi phục phím tắt đảo từ mặc định (Alt+R)");
      });
    }
    if (autoHarmonizeCaseOption) {
      autoHarmonizeCaseOption.addEventListener("change", async () => {
        settings.autoHarmonizeCase = autoHarmonizeCaseOption.checked;
        await saveState();
      });
    }
    if (eraseHabitLearningOption) {
      eraseHabitLearningOption.addEventListener("change", async () => {
        settings.eraseHabitLearning = eraseHabitLearningOption.checked;
        const thresholdGroup = document.getElementById("eraseHabitThresholdGroup");
        if (thresholdGroup) thresholdGroup.style.display = settings.eraseHabitLearning ? "flex" : "none";
        await saveState();
      });
    }
    if (eraseHabitThresholdInput) {
      eraseHabitThresholdInput.addEventListener("change", async () => {
        let val = parseInt(eraseHabitThresholdInput.value, 10);
        if (isNaN(val) || val < 2) val = 2;
        if (val > 10) val = 10;
        eraseHabitThresholdInput.value = String(val);
        settings.eraseHabitThreshold = val;
        await saveState();
      });
    }
    if (ctrlToggleOption) {
      ctrlToggleOption.addEventListener("change", async () => {
        settings.ctrlToggleEnabled = ctrlToggleOption.checked;
        await saveState();
      });
    }
    async function updateTypingLogUI() {
      if (!typingLogControls) return;
      const isEnabled = Boolean(settings.debugTypingLog);
      typingLogControls.style.display = isEnabled ? "block" : "none";
      if (!isEnabled) return;
      try {
        const storage = browserApi.storage && browserApi.storage.local ? browserApi.storage.local : null;
        if (storage) {
          const data = await storage.get(["openviet_typing_logs"]);
          const count = Array.isArray(data.openviet_typing_logs) ? data.openviet_typing_logs.length : 0;
          if (typingLogCountBadge) {
            typingLogCountBadge.textContent = `${count} chuỗi phím đã ghi`;
          }
        }
      } catch {
      }
    }
    if (debugTypingLogOption) {
      debugTypingLogOption.addEventListener("change", async () => {
        settings.debugTypingLog = debugTypingLogOption.checked;
        await saveState();
        await updateTypingLogUI();
      });
    }
    if (downloadTypingLogBtn) {
      downloadTypingLogBtn.addEventListener("click", async () => {
        try {
          const storage = browserApi.storage && browserApi.storage.local ? browserApi.storage.local : null;
          if (!storage) return;
          const data = await storage.get(["openviet_typing_logs"]);
          const logs = Array.isArray(data.openviet_typing_logs) ? data.openviet_typing_logs : [];
          if (logs.length === 0) {
            alert("Chưa có nhật ký gõ nào được ghi nhận.");
            return;
          }
          const jsonlContent = logs.map((e) => JSON.stringify(e)).join("\n");
          const blob = new Blob([jsonlContent], { type: "application/x-jsonlines;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `openviet-typing-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.jsonl`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Failed to export typing log", err);
        }
      });
    }
    if (clearTypingLogBtn) {
      clearTypingLogBtn.addEventListener("click", async () => {
        try {
          const storage = browserApi.storage && browserApi.storage.local ? browserApi.storage.local : null;
          if (storage) {
            await storage.remove(["openviet_typing_logs"]);
            await updateTypingLogUI();
          }
        } catch {
        }
      });
    }
    const handleAutoCompleteChange = async (val) => {
      settings.autoCompleteEnabled = val;
      if (autoCompleteOption) autoCompleteOption.checked = val;
      if (aiTabAutoComplete) aiTabAutoComplete.checked = val;
      autoCompleteEngine.setEnabled(val);
      await saveState();
    };
    const handleNextWordChange = async (val) => {
      settings.nextWordEnabled = val;
      if (nextWordOption) nextWordOption.checked = val;
      if (aiTabNextWord) aiTabNextWord.checked = val;
      autoCompleteEngine.setNextWordEnabled(val);
      await saveState();
    };
    const handleLearningChange = async (val) => {
      settings.gboardLearningEnabled = val;
      if (gboardLearningOption) gboardLearningOption.checked = val;
      if (aiTabLearning) aiTabLearning.checked = val;
      autoCompleteEngine.setLearningEnabled(val);
      await saveState();
    };
    const handleSuggestionStyleChange = async (val) => {
      settings.suggestionStyle = val;
      if (suggestionStyleSelect) suggestionStyleSelect.value = val;
      if (aiTabSuggestionStyle) aiTabSuggestionStyle.value = val;
      await saveState();
    };
    autoCompleteOption?.addEventListener("change", () => handleAutoCompleteChange(autoCompleteOption.checked));
    aiTabAutoComplete?.addEventListener("change", () => handleAutoCompleteChange(aiTabAutoComplete.checked));
    nextWordOption?.addEventListener("change", () => handleNextWordChange(nextWordOption.checked));
    aiTabNextWord?.addEventListener("change", () => handleNextWordChange(aiTabNextWord.checked));
    gboardLearningOption?.addEventListener("change", () => handleLearningChange(gboardLearningOption.checked));
    aiTabLearning?.addEventListener("change", () => handleLearningChange(aiTabLearning.checked));
    suggestionStyleSelect?.addEventListener("change", () => handleSuggestionStyleChange(suggestionStyleSelect.value));
    aiTabSuggestionStyle?.addEventListener("change", () => handleSuggestionStyleChange(aiTabSuggestionStyle.value));
    blacklistTextarea.addEventListener("change", async () => {
      const lines = blacklistTextarea.value.split("\n").map((s) => s.trim().toLowerCase()).filter(Boolean);
      settings.blacklistedDomains = lines;
      await saveState();
    });
    function renderDomainMethodsTable() {
      if (!domainMethodsTableBody) return;
      domainMethodsTableBody.textContent = "";
      const domains = Object.keys(settings.domainMethods || {}).sort();
      if (domains.length === 0) {
        const emptyTr = document.createElement("tr");
        const emptyTd = document.createElement("td");
        emptyTd.colSpan = 3;
        Object.assign(emptyTd.style, {
          textAlign: "center",
          padding: "20px",
          color: "#94a3b8"
        });
        emptyTd.textContent = "Chưa có website nào được ghi nhớ. Khi bạn chuyển Tắt/Bật trên các trang web, chúng sẽ tự xuất hiện ở đây!";
        emptyTr.appendChild(emptyTd);
        domainMethodsTableBody.appendChild(emptyTr);
        return;
      }
      domains.forEach((domain) => {
        const currentMethod = settings.domainMethods[domain];
        const tr = document.createElement("tr");
        const tdDomain = document.createElement("td");
        tdDomain.className = "font-mono";
        tdDomain.style.fontWeight = "600";
        tdDomain.style.color = "#38bdf8";
        tdDomain.textContent = domain;
        tr.appendChild(tdDomain);
        const tdMethod = document.createElement("td");
        const select = document.createElement("select");
        select.className = "form-select";
        select.style.padding = "4px 8px";
        select.style.fontSize = "12px";
        const methodOptions = [
          { value: "0", text: "TẮT (Tiếng Anh)" },
          { value: "1", text: "Telex" },
          { value: "2", text: "VNI" },
          { value: "3", text: "Tự động" }
        ];
        for (const optData of methodOptions) {
          const option = document.createElement("option");
          option.value = optData.value;
          option.textContent = optData.text;
          if (currentMethod === parseInt(optData.value, 10)) {
            option.selected = true;
          }
          select.appendChild(option);
        }
        select.addEventListener("change", async () => {
          settings.domainMethods[domain] = parseInt(select.value, 10);
          await saveState();
        });
        tdMethod.appendChild(select);
        tr.appendChild(tdMethod);
        const tdActions = document.createElement("td");
        tdActions.style.textAlign = "right";
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger";
        delBtn.style.padding = "4px 10px";
        delBtn.style.fontSize = "12px";
        delBtn.textContent = "Xóa";
        delBtn.addEventListener("click", async () => {
          delete settings.domainMethods[domain];
          await saveState();
          window.renderDomainMethodsTable = renderDomainMethodsTable;
          renderDomainMethodsTable();
        });
        tdActions.appendChild(delBtn);
        tr.appendChild(tdActions);
        domainMethodsTableBody.appendChild(tr);
      });
    }
    function addDomain() {
      let raw = (newDomainInput?.value || "").trim().toLowerCase();
      if (!raw) return;
      try {
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
          raw = new URL(raw).hostname;
        }
      } catch {
      }
      raw = raw.replace(/^\/+|\/+$/g, "");
      if (!raw) return;
      if (!settings.domainMethods) settings.domainMethods = {};
      settings.domainMethods[raw] = parseInt(newDomainMethodSelect?.value || "0", 10);
      newDomainInput.value = "";
      window.renderDomainMethodsTable = renderDomainMethodsTable;
      renderDomainMethodsTable();
      saveState();
    }
    addDomainBtn?.addEventListener("click", addDomain);
    newDomainInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addDomain();
      }
    });
    window.renderDomainMethodsTable = renderDomainMethodsTable;
    renderDomainMethodsTable();
    document.getElementById("copyDebugSnapshotBtn")?.addEventListener("click", async () => {
      const manifestVersion = typeof chrome !== "undefined" && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : "unknown";
      const snapshot = {
        version: manifestVersion,
        userAgent: navigator.userAgent,
        settings: {
          method: settings.method,
          toneStyle: settings.toneStyle,
          spellCheck: settings.spellCheck,
          autoRestore: settings.autoRestore,
          autoRestoreEnglish: settings.autoRestoreEnglish,
          phonologyRules: settings.phonologyRules,
          macroEnabled: settings.macroEnabled,
          autoCompleteEnabled: settings.autoCompleteEnabled
        },
        engineState: {
          method: settings.method,
          toneStyle: settings.toneStyle,
          macroCount: macroEngine.getMacros().length
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
        showToast("Đã copy Debug Snapshot vào clipboard!");
      } catch {
        showToast("Không thể copy vào clipboard.");
      }
    });
  }
  var renderHabitsTableAndStats = () => {
  };
  function initAiHabitsTab() {
    const statTotalPairs = document.getElementById("statTotalPairs");
    const statTotalTransitions = document.getElementById("statTotalTransitions");
    const statTotalWords = document.getElementById("statTotalWords");
    const habitsTableBody = document.getElementById("habitsTableBody");
    const habitSearch = document.getElementById("habitSearch");
    const newHabitFromInput = document.getElementById("newHabitFromInput");
    const newHabitToInput = document.getElementById("newHabitToInput");
    const addHabitBtn = document.getElementById("addHabitBtn");
    const editHabitModal = document.getElementById("editHabitModal");
    const editHabitFromInput = document.getElementById("editHabitFromInput");
    const editHabitToInput = document.getElementById("editHabitToInput");
    const editHabitCountInput = document.getElementById("editHabitCountInput");
    const editHabitCancelBtn = document.getElementById("editHabitCancelBtn");
    const editHabitSaveBtn = document.getElementById("editHabitSaveBtn");
    const seedHabitsBtn = document.getElementById("seedHabitsBtn");
    const clearHabitsBtn = document.getElementById("clearHabitsBtn");
    const exportHabitsCsvBtn = document.getElementById("exportHabitsCsvBtn");
    const exportHabitsJsonBtn = document.getElementById("exportHabitsJsonBtn");
    const importHabitsBtn = document.getElementById("importHabitsBtn");
    const importHabitsModal = document.getElementById("importHabitsModal");
    const importHabitsTextarea = document.getElementById("importHabitsTextarea");
    const importHabitsFileInput = document.getElementById("importHabitsFileInput");
    const importHabitsMergeOption = document.getElementById("importHabitsMergeOption");
    const importHabitsCancelBtn = document.getElementById("importHabitsCancelBtn");
    const importHabitsConfirmBtn = document.getElementById("importHabitsConfirmBtn");
    let editingHabitItem = null;
    renderHabitsTableAndStats = async () => {
      try {
        await autoCompleteEngine.loadFromStorage();
      } catch {
      }
      const stats = autoCompleteEngine.getLearnedStats();
      if (statTotalPairs) statTotalPairs.textContent = String(stats.totalPairs);
      if (statTotalTransitions) statTotalTransitions.textContent = String(stats.totalTransitions);
      if (statTotalWords) statTotalWords.textContent = String(stats.totalWordsLearned);
      if (!habitsTableBody) return;
      habitsTableBody.textContent = "";
      const query = (habitSearch?.value || "").toLowerCase().trim();
      let displayPairs = stats.topPairs || [];
      if (query) {
        displayPairs = displayPairs.filter((p) => p.from.toLowerCase().includes(query) || p.to.toLowerCase().includes(query));
      }
      if (!displayPairs || displayPairs.length === 0) {
        const emptyTr = document.createElement("tr");
        const emptyTd = document.createElement("td");
        emptyTd.colSpan = 6;
        Object.assign(emptyTd.style, {
          textAlign: "center",
          padding: "24px",
          color: "#94a3b8"
        });
        emptyTd.textContent = query ? "Không tìm thấy cặp từ thói quen nào khớp với tìm kiếm." : 'Chưa có thói quen nào được học. Hãy gõ vài từ hoặc nhấn "Nạp Mẫu Thử" để trải nghiệm!';
        emptyTr.appendChild(emptyTd);
        habitsTableBody.appendChild(emptyTr);
        return;
      }
      displayPairs.forEach((item, index) => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.style.color = "#94a3b8";
        td1.textContent = String(index + 1);
        const td2 = document.createElement("td");
        const tagFrom = document.createElement("span");
        tagFrom.className = "tag-trigger font-mono";
        tagFrom.textContent = item.from;
        td2.appendChild(tagFrom);
        const td3 = document.createElement("td");
        const strongTo = document.createElement("strong");
        strongTo.style.color = "#38bdf8";
        strongTo.className = "font-mono";
        strongTo.textContent = item.to;
        td3.appendChild(strongTo);
        const td4 = document.createElement("td");
        td4.style.textAlign = "center";
        const countBadge = document.createElement("span");
        Object.assign(countBadge.style, {
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "bold",
          background: "rgba(245, 158, 11, 0.15)",
          color: "#f59e0b",
          border: "1px solid rgba(245, 158, 11, 0.3)"
        });
        countBadge.textContent = `${item.count} lần`;
        td4.appendChild(countBadge);
        const td5 = document.createElement("td");
        td5.style.textAlign = "center";
        const badge = document.createElement("span");
        Object.assign(badge.style, {
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          background: "rgba(16, 185, 129, 0.15)",
          color: "#10b981",
          border: "1px solid rgba(16, 185, 129, 0.3)"
        });
        badge.textContent = "Thói quen";
        td5.appendChild(badge);
        const td6 = document.createElement("td");
        td6.style.textAlign = "right";
        const editBtn = document.createElement("button");
        editBtn.className = "btn";
        editBtn.style.padding = "3px 8px";
        editBtn.style.fontSize = "12px";
        editBtn.style.marginRight = "6px";
        editBtn.textContent = "Sửa";
        editBtn.addEventListener("click", () => {
          editingHabitItem = { ...item };
          if (editHabitFromInput) editHabitFromInput.value = item.from;
          if (editHabitToInput) editHabitToInput.value = item.to;
          if (editHabitCountInput) editHabitCountInput.value = String(item.count || 1);
          editHabitModal?.classList.add("open");
        });
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger";
        delBtn.style.padding = "3px 8px";
        delBtn.style.fontSize = "12px";
        delBtn.textContent = "Xóa";
        delBtn.addEventListener("click", async () => {
          if (confirm(`Xóa cặp từ thói quen "${item.from}" ➔ "${item.to}"?`)) {
            autoCompleteEngine.removeLearnedHabit(item.from, item.to);
            if (autoCompleteEngine.learnedModel && typeof autoCompleteEngine.learnedModel.flushSaveToStorage === "function") {
              await autoCompleteEngine.learnedModel.flushSaveToStorage();
            }
            await renderHabitsTableAndStats();
            showToast(`Đã xóa gợi ý thói quen "${item.from}" ➔ "${item.to}"!`);
          }
        });
        td6.appendChild(editBtn);
        td6.appendChild(delBtn);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        habitsTableBody.appendChild(tr);
      });
    };
    habitSearch?.addEventListener("input", renderHabitsTableAndStats);
    const addNewHabitPair = async () => {
      const from = (newHabitFromInput?.value || "").trim().toLowerCase();
      const to = (newHabitToInput?.value || "").trim().toLowerCase();
      if (!from || !to) {
        alert("Vui lòng nhập cả từ bắt đầu và từ kế tiếp.");
        return;
      }
      autoCompleteEngine.recordWordTransition(from, to);
      autoCompleteEngine.recordWordUsage(to);
      if (autoCompleteEngine.learnedModel && typeof autoCompleteEngine.learnedModel.flushSaveToStorage === "function") {
        await autoCompleteEngine.learnedModel.flushSaveToStorage();
      }
      if (newHabitFromInput) newHabitFromInput.value = "";
      if (newHabitToInput) newHabitToInput.value = "";
      await renderHabitsTableAndStats();
      showToast(`Đã thêm cặp từ thói quen "${from}" ➔ "${to}"!`);
    };
    addHabitBtn?.addEventListener("click", addNewHabitPair);
    newHabitToInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addNewHabitPair();
      }
    });
    editHabitCancelBtn?.addEventListener("click", () => {
      editHabitModal?.classList.remove("open");
      editingHabitItem = null;
    });
    editHabitSaveBtn?.addEventListener("click", async () => {
      if (!editingHabitItem) return;
      const newFrom = (editHabitFromInput?.value || "").trim().toLowerCase();
      const newTo = (editHabitToInput?.value || "").trim().toLowerCase();
      const newCount = parseInt(editHabitCountInput?.value || "1", 10);
      if (!newFrom || !newTo) {
        alert("Vui lòng nhập đầy đủ cả hai từ.");
        return;
      }
      autoCompleteEngine.updateLearnedHabit(
        editingHabitItem.from,
        editingHabitItem.to,
        newFrom,
        newTo,
        isNaN(newCount) || newCount < 1 ? 1 : newCount
      );
      if (autoCompleteEngine.learnedModel && typeof autoCompleteEngine.learnedModel.flushSaveToStorage === "function") {
        await autoCompleteEngine.learnedModel.flushSaveToStorage();
      }
      editHabitModal?.classList.remove("open");
      editingHabitItem = null;
      await renderHabitsTableAndStats();
      showToast(`Đã cập nhật thói quen "${newFrom}" ➔ "${newTo}"!`);
    });
    seedHabitsBtn?.addEventListener("click", () => {
      const count = autoCompleteEngine.seedLearnedHabits();
      renderHabitsTableAndStats();
      showToast(`Đã nạp thành công ${count} mẫu thói quen học thử nghiệm (bao gồm "nghiên" -> "cứu")!`);
    });
    clearHabitsBtn?.addEventListener("click", () => {
      if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử thói quen đã học trên máy này không?")) {
        autoCompleteEngine.clearLearnedHabits();
        renderHabitsTableAndStats();
        showToast("Đã xóa sạch bộ nhớ thói quen!");
      }
    });
    exportHabitsJsonBtn?.addEventListener("click", () => {
      const jsonStr = autoCompleteEngine.exportLearnedJSON();
      const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      downloadFile(jsonStr, `openviet_habits_${dateStr}.json`, "application/json");
      showToast("Đã xuất file JSON thói quen thành công!");
    });
    exportHabitsCsvBtn?.addEventListener("click", () => {
      const csvStr = autoCompleteEngine.exportLearnedCSV();
      const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      downloadFile(csvStr, `openviet_habits_${dateStr}.csv`, "text/csv;charset=utf-8;");
      showToast("Đã xuất file CSV thói quen thành công!");
    });
    importHabitsBtn?.addEventListener("click", () => {
      if (importHabitsTextarea) importHabitsTextarea.value = "";
      if (importHabitsFileInput) importHabitsFileInput.value = "";
      importHabitsModal?.classList.add("open");
    });
    importHabitsCancelBtn?.addEventListener("click", () => {
      importHabitsModal?.classList.remove("open");
    });
    importHabitsFileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (importHabitsTextarea) {
          importHabitsTextarea.value = event.target?.result || "";
        }
      };
      reader.readAsText(file);
    });
    importHabitsConfirmBtn?.addEventListener("click", async () => {
      const raw = importHabitsTextarea?.value || "";
      if (!raw.trim()) {
        alert("Vui lòng dán nội dung hoặc chọn file trước khi nạp.");
        return;
      }
      const isMerge = importHabitsMergeOption ? importHabitsMergeOption.checked : true;
      const res = autoCompleteEngine.importLearnedData(raw, isMerge);
      if (res.success) {
        importHabitsModal?.classList.remove("open");
        renderHabitsTableAndStats();
        showToast(`Đã nạp thành công ${res.count} cặp thói quen gõ từ!`);
      } else {
        alert(`Lỗi nạp dữ liệu: ${res.error}`);
      }
    });
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes["avim_gboard_habit_model"]) {
          renderHabitsTableAndStats();
        }
      });
    }
    renderHabitsTableAndStats();
  }
  function initImportExport() {
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const importBtn = document.getElementById("importBtn");
    const importModal = document.getElementById("importModal");
    const importTextarea = document.getElementById("importTextarea");
    const importCancelBtn = document.getElementById("importCancelBtn");
    const importConfirmBtn = document.getElementById("importConfirmBtn");
    exportJsonBtn.addEventListener("click", () => {
      const data = macroEngine.exportJSON();
      downloadFile(data, "avim-macros.json", "application/json");
    });
    exportCsvBtn.addEventListener("click", () => {
      const data = macroEngine.exportCSV();
      downloadFile(data, "avim-macros.csv", "text/csv");
    });
    importBtn.addEventListener("click", () => {
      importTextarea.value = "";
      importModal.classList.add("open");
    });
    importCancelBtn.addEventListener("click", () => importModal.classList.remove("open"));
    importConfirmBtn.addEventListener("click", async () => {
      const raw = importTextarea.value.trim();
      if (!raw) return;
      let res;
      if (raw.startsWith("[") || raw.startsWith("{")) {
        res = macroEngine.importJSON(raw);
      } else {
        res = macroEngine.importCSV(raw);
      }
      if (res.success) {
        importModal.classList.remove("open");
        window.refreshMacroTable();
        await saveState();
        showToast(`Đã nhập thành công ${res.count} từ viết tắt!`);
      } else {
        alert(`Lỗi nhập dữ liệu: ${res.error}`);
      }
    });
  }
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function initOptionsPage() {
    try {
      initTabs();
      initTable();
      initModals();
      initDictionaryTab();
      initPreferences();
      initAiHabitsTab();
      initImportExport();
    } catch (err) {
      console.error("Options page synchronous init error:", err);
    }
    loadState().then(() => {
      if (typeof refreshMacroTable === "function") refreshMacroTable();
      if (typeof refreshDictTable === "function") refreshDictTable();
      if (typeof window.renderDomainMethodsTable === "function") window.renderDomainMethodsTable();
      if (typeof renderHabitsTableAndStats === "function") renderHabitsTableAndStats();
      if (typeof window.syncPreferencesUI === "function") window.syncPreferencesUI();
    }).catch((err) => {
      console.warn("Options page loadState async warning:", err);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOptionsPage);
  } else {
    initOptionsPage();
  }
})();
/**
 * Macro / Text Expansion Engine (Inspired by xmannv/xkey)
 * Handles macro lookup, casing preservation, word-boundary triggers, and Backspace undo.
 *
 * @license Apache-2.0
 */
/**
 * OpenViet IME Shared Configuration & Default Settings
 * Shared across Service Worker, Content Scripts, Options, and Popup.
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Dictionary & User Custom Dictionary Manager
 * Integrated from Hunspell Vietnamese (OpenOffice / Hồ Ngọc Đức / xKey)
 * Supports ~6,700 standard Vietnamese syllables, personal user dictionary,
 * English onset detection, and spell checking auto-restore.
 *
 * @license GPL / MIT
 */
/**
 * Smart Emoji Shorthand Engine
 * Supports Vietnamese and English slack-style emoji triggers (:tim: -> ❤️, :cuoi: -> 😄)
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Auto-Complete, Next-Word Prediction & Gboard-Style Habit Learning Engine
 * Provides intelligent word auto-completion, next-word suggestions (bigram language model),
 * and personalized on-device habit learning similar to Google Gboard.
 *
 * @license Apache-2.0
 */
