/**
 * AVIM xKey Content Script Entry Point
 * Listens for key events, coordinates IME diacritic transformation, macro expansion,
 * and on-page floating Gboard-style Next-Word Prediction & Auto-Complete suggestions.
 *
 * @license Apache-2.0
 */

import { AvimEngine } from '../engine/avim.js';
import { MacroEngine, DEFAULT_MACROS } from '../engine/macro.js';
import { IME_METHOD, TONE_STYLE, isDelimiter, isUrlOrEmailOrCode } from '../engine/key-codes.js';
import { DomObserver } from './dom-observer.js';
import { TextReplacer } from './text-replacer.js';
import { autoCompleteEngine } from '../engine/autocomplete.js';
import { EMOJI_MAP, checkEmojiShortcut } from '../engine/emoji.js';

class AvimContentScript {
  constructor() {
    this.domObserver = new DomObserver();
    this.textReplacer = new TextReplacer();

    this.settings = {
      method: IME_METHOD.AUTO,
      toneStyle: TONE_STYLE.MODERN,
      macroEnabled: true,
      spellCheck: true,
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
      autoCompleteEnabled: true,
      nextWordEnabled: true,
      gboardLearningEnabled: true,
      macros: DEFAULT_MACROS,
      blacklistedDomains: []
    };

    this.lastCtrlTime = 0;
    this.previousMethod = IME_METHOD.AUTO;

    // Suggestion state
    this.activeSuggestions = [];
    this.selectedSuggestionIndex = 0;
    this.activeSuggestionType = 'autocomplete'; // 'autocomplete' | 'nextword'
    this.activeWordPrefix = '';
    this.lastWordBeforeDelimiter = '';
    this.secondLastWordBeforeDelimiter = '';
    this.currentTarget = null;
    this.suggestionHost = null;
    this.suggestionShadow = null;
    this.suggestionBar = null;
    this.suggestionInactivityTimeout = null;
    this.suggestionInactivityMs = 2800; // Auto-dismiss after 2.8s of inactivity

    this.avimEngine = new AvimEngine({
      method: this.settings.method,
      toneStyle: this.settings.toneStyle,
      spellCheck: this.settings.spellCheck,
      quickConsonants: this.settings.quickConsonants,
      autoRestoreEnglish: this.settings.autoRestoreEnglish,
      escRevert: this.settings.escRevert,
      phonologyRules: this.settings.phonologyRules
    });

    this.macroEngine = new MacroEngine(this.settings.macros, {
      enabled: this.settings.macroEnabled,
      autoUndo: this.settings.autoUndo
    });

    this.init();
  }

  init() {
    this.bindEvents();
    this.listenMessages();
    this.loadSettings();

    // Eagerly mount shadow host so that first keystroke does not mutate document.body in ProseMirror/TipTap
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initSuggestionHost(), { once: true });
      } else {
        this.initSuggestionHost();
      }
    }
  }

  async loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      try {
        const stored = await chrome.storage.sync.get(['avim_settings', 'avim_macros', 'avim_domain_methods']);
        if (stored.avim_settings) {
          Object.assign(this.settings, stored.avim_settings);
        }
        if (stored.avim_domain_methods) {
          this.settings.domainMethods = stored.avim_domain_methods;
        }
        if (stored.avim_macros) {
          this.settings.macros = stored.avim_macros;
        }
      } catch {
        // Fallback to defaults
      }
    }

    // Check Per-Domain Memory (remember IME state for this website domain)
    if (this.settings.perDomainMemory !== false && typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname.toLowerCase();
      if (this.settings.domainMethods && typeof this.settings.domainMethods[hostname] === 'number') {
        this.settings.method = this.settings.domainMethods[hostname];
      }
    }

    // Load shared on-device habit model
    try {
      await autoCompleteEngine.loadFromStorage();
    } catch {}
    this.applySettings();
  }

  applySettings() {
    this.avimEngine.setMethod(this.settings.method);
    this.avimEngine.setToneStyle(this.settings.toneStyle);
    this.avimEngine.setSpellCheck(this.settings.spellCheck);
    this.avimEngine.setQuickConsonants(this.settings.quickConsonants);
    this.avimEngine.setQuickTelex(this.settings.quickTelex !== false);
    this.avimEngine.setAutoRestoreEnglish(this.settings.autoRestoreEnglish !== false);
    this.avimEngine.setEscRevert(this.settings.escRevert !== false);
    this.avimEngine.setPhonologyRules(this.settings.phonologyRules !== false);

    this.macroEngine.enabled = this.settings.macroEnabled;
    this.macroEngine.autoUndo = this.settings.autoUndo;
    if (this.settings.macros) {
      this.macroEngine.loadMacros(this.settings.macros);
    }

    if (typeof autoCompleteEngine.setEnabled === 'function') {
      autoCompleteEngine.setEnabled(this.settings.autoCompleteEnabled !== false);
    } else {
      autoCompleteEngine.enabled = this.settings.autoCompleteEnabled !== false;
    }
    if (typeof autoCompleteEngine.setNextWordEnabled === 'function') {
      autoCompleteEngine.setNextWordEnabled(this.settings.nextWordEnabled !== false);
    } else {
      autoCompleteEngine.nextWordEnabled = this.settings.nextWordEnabled !== false;
    }
    if (typeof autoCompleteEngine.setLearningEnabled === 'function') {
      autoCompleteEngine.setLearningEnabled(this.settings.gboardLearningEnabled !== false);
    } else if (autoCompleteEngine.learnedModel) {
      autoCompleteEngine.learnedModel.learningEnabled = this.settings.gboardLearningEnabled !== false;
    }

    this.domObserver.setBlacklistedDomains(this.settings.blacklistedDomains || []);
  }

  listenMessages() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SETTINGS_UPDATED') {
          if (message.settings) Object.assign(this.settings, message.settings);
          if (message.macros) this.settings.macros = message.macros;
          if (message.settings || message.macros) {
            this.applySettings();
          }
          sendResponse({ success: true });
        }
        if (message.type === 'GET_STATUS') {
          sendResponse({
            method: this.settings.method,
            macroEnabled: this.settings.macroEnabled
          });
        }
      });
    }
  }

  bindEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    document.addEventListener('click', (e) => {
      if (this.suggestionHost && !this.suggestionHost.contains(e.target)) {
        this.hideSuggestions();
      }
    }, true);
    // Record word when leaving an input field
    document.addEventListener('focusout', (e) => {
      const target = e.target;
      if (!target || !this.domObserver.isEligibleTarget(target)) return;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      const wordInfo = isNative
        ? this.textReplacer.extractNativeWordBuffer(target)
        : this.textReplacer.extractContentEditableWordBuffer();
      if (wordInfo && wordInfo.word) {
        if (this.lastWordBeforeDelimiter && this.lastWordBeforeDelimiter !== wordInfo.word) {
          autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, wordInfo.word);
        }
        autoCompleteEngine.recordWordUsage(wordInfo.word);
      }
    }, true);
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('blur', () => this.hideSuggestions());
    }
  }

  /* ========================================================================
   * Gboard Floating Suggestion Bar (Shadow DOM Encapsulated)
   * ======================================================================== */

  initSuggestionHost() {
    const mount = document.body || document.documentElement;
    if (this.suggestionHost) {
      if (!this.suggestionHost.isConnected && mount) {
        mount.appendChild(this.suggestionHost);
      }
      return;
    }
    if (!mount) {
      if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initSuggestionHost(), { once: true });
      }
      return;
    }

    this.suggestionHost = document.createElement('div');
    this.suggestionHost.id = '__avim_gboard_host__';
    Object.assign(this.suggestionHost.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '0',
      overflow: 'visible',
      zIndex: '2147483647',
      pointerEvents: 'none'
    });

    this.suggestionShadow = this.suggestionHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .gboard-bar {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.4);
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        pointer-events: auto;
        user-select: none;
        transition: opacity 0.15s ease, transform 0.15s ease;
        max-width: 90vw;
        overflow-x: auto;
      }
      .gboard-bar.hidden {
        display: none;
      }
      .gboard-title {
        color: #94a3b8;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding-left: 4px;
        padding-right: 2px;
        font-weight: 500;
        white-space: nowrap;
      }
      .gboard-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.85);
        border: 1px solid rgba(71, 85, 105, 0.5);
        color: #f8fafc;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.12s ease;
        white-space: nowrap;
      }
      .gboard-chip:hover, .gboard-chip.selected {
        background: #0284c7;
        border-color: #38bdf8;
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
      }
      .gboard-chip.is-learned {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(6, 78, 59, 0.4);
        color: #6ee7b7;
      }
      .gboard-chip.is-learned:hover {
        background: #059669;
        border-color: #10b981;
        color: #ffffff;
      }
      .gboard-badge {
        font-size: 9px;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        font-weight: 600;
      }
      .gboard-hint {
        font-size: 9px;
        font-family: monospace;
        font-weight: bold;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .gboard-chip:hover .gboard-hint {
        background: rgba(255, 255, 255, 0.3);
        color: #ffffff;
        border-color: #ffffff;
      }
    `;

    this.suggestionBar = document.createElement('div');
    this.suggestionBar.className = 'gboard-bar hidden';

    // Pause auto-dismiss when hovering over suggestions
    this.suggestionBar.addEventListener('mouseenter', () => {
      if (this.suggestionInactivityTimeout) {
        clearTimeout(this.suggestionInactivityTimeout);
        this.suggestionInactivityTimeout = null;
      }
    });
    this.suggestionBar.addEventListener('mouseleave', () => {
      this.resetSuggestionInactivityTimer();
    });

    this.suggestionShadow.appendChild(style);
    this.suggestionShadow.appendChild(this.suggestionBar);
    mount.appendChild(this.suggestionHost);
  }

  resetSuggestionInactivityTimer() {
    if (this.suggestionInactivityTimeout) {
      clearTimeout(this.suggestionInactivityTimeout);
      this.suggestionInactivityTimeout = null;
    }
    if (this.isSuggestionsVisible()) {
      this.suggestionInactivityTimeout = setTimeout(() => {
        this.hideSuggestions();
      }, this.suggestionInactivityMs);
    }
  }

  showSuggestions(target, items, type, query = '') {
    if (!items || items.length === 0) {
      this.hideSuggestions();
      return;
    }

    const visibleItems = items.slice(0, 5);
    this.activeSuggestions = visibleItems;
    this.selectedSuggestionIndex = 0;
    this.activeSuggestionType = type;
    this.activeWordPrefix = query;
    this.currentTarget = target;

    if (!this.suggestionBar) this.initSuggestionHost();
    if (!this.suggestionBar) return;

    this.suggestionBar.textContent = '';

    // Title label
    const titleEl = document.createElement('div');
    titleEl.className = 'gboard-title';
    titleEl.innerHTML = `<span>${type === 'nextword' ? '✨ Kế tiếp:' : '✦ Gợi ý:'}</span> <span class="gboard-nav-hint" style="color: #94a3b8; font-size: 10px; font-weight: normal; margin-left: 4px;">[Tab/Shift+Tab: duyệt • Enter: chọn • Esc: ẩn]</span>`;
    this.suggestionBar.appendChild(titleEl);

    visibleItems.forEach((item, idx) => {
      const chip = document.createElement('div');
      chip.className = `gboard-chip ${item.type === 'learned' ? 'is-learned' : ''} ${idx === this.selectedSuggestionIndex ? 'selected' : ''}`;
      chip.setAttribute('role', 'button');
      chip.setAttribute('aria-selected', idx === this.selectedSuggestionIndex ? 'true' : 'false');

      const text = document.createElement('span');
      text.textContent = item.word;
      chip.appendChild(text);

      if (item.displayType && item.displayType !== 'Từ đơn') {
        const badge = document.createElement('span');
        badge.className = 'gboard-badge';
        badge.textContent = item.displayType;
        chip.appendChild(badge);
      }

      if (idx === this.selectedSuggestionIndex) {
        const hint = document.createElement('span');
        hint.className = 'gboard-hint';
        hint.textContent = 'Enter ↵';
        chip.appendChild(hint);
      }

      // Prevent target blur on click
      chip.addEventListener('mousedown', (e) => e.preventDefault());
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applySuggestion(item.word);
      });

      this.suggestionBar.appendChild(chip);
    });

    // Positioning near target element
    try {
      const rect = target.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      let top = rect.bottom + scrollY + 4;
      let left = rect.left + scrollX;

      // Flip above if near bottom of viewport
      if (rect.bottom + 42 > window.innerHeight && rect.top > 45) {
        top = rect.top + scrollY - 38;
      }

      left = Math.max(8, Math.min(left, window.innerWidth - 320));

      this.suggestionBar.style.top = `${top}px`;
      this.suggestionBar.style.left = `${left}px`;
      this.suggestionBar.classList.remove('hidden');
    } catch {
      this.suggestionBar.classList.remove('hidden');
    }

    // Start auto-dismiss inactivity timer
    this.resetSuggestionInactivityTimer();
  }

  updateSuggestionHighlight() {
    if (!this.suggestionBar) return;
    const chips = this.suggestionBar.querySelectorAll('.gboard-chip');
    chips.forEach((chip, idx) => {
      const isSelected = idx === this.selectedSuggestionIndex;
      if (isSelected) {
        chip.classList.add('selected');
        chip.setAttribute('aria-selected', 'true');
        let hint = chip.querySelector('.gboard-hint');
        if (!hint) {
          hint = document.createElement('span');
          hint.className = 'gboard-hint';
          chip.appendChild(hint);
        }
        hint.textContent = 'Enter ↵';
      } else {
        chip.classList.remove('selected');
        chip.setAttribute('aria-selected', 'false');
        const hint = chip.querySelector('.gboard-hint');
        if (hint) {
          hint.remove();
        }
      }
    });

    const selectedChip = chips[this.selectedSuggestionIndex];
    if (selectedChip && typeof selectedChip.scrollIntoView === 'function') {
      selectedChip.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // Reset inactivity timer when user cycles
    this.resetSuggestionInactivityTimer();
  }

  hideSuggestions() {
    if (this.suggestionInactivityTimeout) {
      clearTimeout(this.suggestionInactivityTimeout);
      this.suggestionInactivityTimeout = null;
    }
    if (this.suggestionBar) {
      this.suggestionBar.classList.add('hidden');
    }
    this.activeSuggestions = [];
    this.selectedSuggestionIndex = 0;
  }

  isSuggestionsVisible() {
    return this.suggestionBar && !this.suggestionBar.classList.contains('hidden') && this.activeSuggestions.length > 0;
  }

  applySuggestion(chosenWord) {
    if (!this.currentTarget || !chosenWord) return;
    const target = this.currentTarget;
    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (this.activeSuggestionType === 'autocomplete') {
      const wordInfo = isNative
        ? this.textReplacer.extractNativeWordBuffer(target)
        : this.textReplacer.extractContentEditableWordBuffer();

      const textToInsert = chosenWord + ' ';
      if (isNative && wordInfo) {
        this.textReplacer.replaceInNativeInput(
          target,
          wordInfo.startIndex,
          wordInfo.endIndex,
          textToInsert
        );
      } else if (wordInfo) {
        this.textReplacer.replaceInContentEditable(
          target,
          wordInfo.word,
          textToInsert
        );
      }

      autoCompleteEngine.recordWordUsage(chosenWord);
      this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
      this.lastWordBeforeDelimiter = chosenWord;

      // Predict next word for the completed word!
      if (this.settings.nextWordEnabled !== false) {
        const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
        if (nextWords.length > 0) {
          this.showSuggestions(target, nextWords, 'nextword');
          return;
        }
      }
      this.hideSuggestions();
    } else {
      // Next-Word Prediction Insertion
      let needsLeadingSpace = false;
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        const before = target.value.slice(0, pos);
        needsLeadingSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
      } else {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const before = (node.textContent || '').slice(0, range.startOffset);
            needsLeadingSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
          }
        }
      }

      const textToInsert = (needsLeadingSpace ? ' ' : '') + chosenWord + ' ';

      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        this.textReplacer.replaceInNativeInput(target, pos, pos, textToInsert);
      } else {
        this.textReplacer.replaceInContentEditable(target, '', textToInsert);
      }

      // Record learned transition: lastWord -> chosenWord
      if (this.lastWordBeforeDelimiter) {
        autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, chosenWord, this.secondLastWordBeforeDelimiter);
      }
      autoCompleteEngine.recordWordUsage(chosenWord);
      this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
      this.lastWordBeforeDelimiter = chosenWord;

      // Continuously predict the subsequent word
      if (this.settings.nextWordEnabled !== false) {
        const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
        if (nextWords.length > 0) {
          this.showSuggestions(target, nextWords, 'nextword');
          return;
        }
      }
      this.hideSuggestions();
    }
  }

  /* ========================================================================
   * Key Event Dispatcher
   * ======================================================================== */

  handleKeyDown(event) {
    // 0. Double-Ctrl Toggle Detection (Classic AVIM Feature)
    if (event.key === 'Control') {
      if (event.repeat) return;
      if (this.settings.ctrlToggleEnabled !== false) {
        const now = Date.now();
        if (now - this.lastCtrlTime < 400) {
          this.toggleMethod();
          this.lastCtrlTime = 0;
        } else {
          this.lastCtrlTime = now;
        }
      }
      return;
    } else {
      this.lastCtrlTime = 0;
    }

    // Tab / Shift+Tab key: Cycle suggestions forward or backward when ribbon is showing
    if (event.key === 'Tab' && this.isSuggestionsVisible()) {
      event.preventDefault();
      event.stopPropagation();
      const count = this.activeSuggestions.length;
      if (count > 0) {
        if (event.shiftKey) {
          // Cycle backward
          this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + count) % count;
        } else {
          // Cycle forward
          this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % count;
        }
        this.updateSuggestionHighlight();
      }
      return;
    }

    // Enter key: When suggestions are visible
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && this.isSuggestionsVisible()) {
      // If the suggestion ribbon is in 'nextword' mode (predictive next word):
      // NEVER intercept Enter! In Telegram, Zalo, Messenger, Slack, hitting Enter sends the message.
      // Intercepting Enter to insert an unwanted lowercase next-word is disruptive.
      if (this.activeSuggestionType === 'nextword') {
        this.hideSuggestions();
        this.lastWordBeforeDelimiter = '';
      this.secondLastWordBeforeDelimiter = '';
        return; // Allow native Enter event to proceed and send message!
      }

      // If 'autocomplete' mode (user is actively typing a word like 'nghi' or ':ti'):
      event.preventDefault();
      event.stopPropagation();
      const candidate = this.activeSuggestions[this.selectedSuggestionIndex]?.word;
      if (candidate) {
        this.applySuggestion(candidate);
      }
      return;
    }

    // Enter key: Dismiss any suggestions and reset session before newline/send
    if (event.key === 'Enter') {
      this.hideSuggestions();
      this.lastWordBeforeDelimiter = '';
      this.secondLastWordBeforeDelimiter = '';
      const activeTarget = this.domObserver.getActiveElement();
      if (this.domObserver.isEligibleTarget(activeTarget)) {
        const isNative = activeTarget instanceof HTMLInputElement || activeTarget instanceof HTMLTextAreaElement;
        const wordInfo = isNative
          ? this.textReplacer.extractNativeWordBuffer(activeTarget)
          : this.textReplacer.extractContentEditableWordBuffer();
        if (wordInfo && wordInfo.word) {
          const currentWord = wordInfo.word;
          autoCompleteEngine.recordWordUsage(currentWord);
        }
      }
    }

    // Escape: Dismiss suggestion bar first and prevent bubbling to chat applications (e.g. Telegram)
    if (event.key === 'Escape' && this.isSuggestionsVisible()) {
      event.preventDefault();
      event.stopPropagation();
      this.hideSuggestions();
      return;
    }

    // Ctrl + Backspace: Whole-Word Erase (Clean, non-destructive, zero dangling accents)
    if (event.ctrlKey && event.key === 'Backspace' && !event.shiftKey && !event.altKey && !event.metaKey) {
      const target = this.domObserver.getActiveElement();
      if (this.domObserver.isEligibleTarget(target)) {
        if (this.handleWholeWordErase(target, event)) {
          return;
        }
      }
    }

    // Ignore modifier combinations (Ctrl, Alt, Meta) except Shift
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const target = this.domObserver.getActiveElement();
    if (!this.domObserver.isEligibleTarget(target)) {
      return;
    }

    const key = event.key;

    // 1. ESC: Instant Word Revert (GoNhanh feature)
    if (key === 'Escape') {
      if (this.handleEscapeRevert(target, event)) {
        return;
      }
    }

    // 2. Backspace: check Macro Backtracking / Undo & Word Adoption
    if (key === 'Backspace') {
      this.hideSuggestions();
      if (this.handleBackspaceUndo(target, event)) {
        return;
      }
      this.adoptWordBeforeBackspace(target, event);
    }

    // 3. Single character typing
    if (key.length === 1) {
      this.handleCharacterInput(target, key, event);
    }
  }

  handleWholeWordErase(target, event) {
    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (isNative) {
      const pos = target.selectionStart ?? target.value.length;
      const textBefore = target.value.slice(0, pos);
      if (!textBefore) return false;

      // Match trailing whitespace + word boundary
      const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
      if (match) {
        event.preventDefault();
        const deleteLen = match[0].length;
        const startReplace = pos - deleteLen;
        this.textReplacer.replaceInNativeInput(target, startReplace, pos, '');
        this.avimEngine.resetWordSession();
        this.lastWordBeforeDelimiter = '';
      this.secondLastWordBeforeDelimiter = '';
        this.hideSuggestions();
        return true;
      }
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const pos = range.startOffset;
          const textBefore = text.slice(0, pos);
          const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
          if (match) {
            event.preventDefault();
            const deleteLen = match[0].length;
            const startReplace = pos - deleteLen;
            const newText = text.slice(0, startReplace) + text.slice(pos);
            node.textContent = newText;
            const newRange = document.createRange();
            newRange.setStart(node, startReplace);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            this.textReplacer.dispatchSyntheticInput(target, '');
            this.avimEngine.resetWordSession();
            this.lastWordBeforeDelimiter = '';
      this.secondLastWordBeforeDelimiter = '';
            this.hideSuggestions();
            return true;
          }
        }
      }
    }
    return false;
  }

  shouldAutoCapitalize(target) {
    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    let textBefore = '';
    if (isNative) {
      const pos = target.selectionStart ?? 0;
      textBefore = target.value.slice(0, pos);
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        let offset = range.startOffset;

        if (node.nodeType === Node.TEXT_NODE) {
          textBefore = (node.textContent || '').slice(0, offset);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // If range is on an ELEMENT_NODE (like <p> in TipTap/ProseMirror on Telegram Web A or <div>):
          // Gather text from all previous child nodes inside this element up to offset
          let text = '';
          for (let i = 0; i < offset && i < node.childNodes.length; i++) {
            text += node.childNodes[i].textContent || '';
          }
          textBefore = text;
        }
      }
    }

    // If start of input or only whitespace
    if (!textBefore || textBefore.trim().length === 0) return true;

    // If right after newline
    if (/[\n\r]\s*$/.test(textBefore)) return true;

    // If after sentence punctuation (. ! ?) followed by whitespace
    const match = textBefore.match(/([.!?])(\s+)$/);
    if (match) {
      const trimmed = textBefore.slice(0, -match[0].length).trim().toLowerCase();
      const lastWordMatch = trimmed.match(/([a-z0-9_.]+)$/i);
      if (lastWordMatch) {
        const lastWord = lastWordMatch[1];
        const ABBRS = new Set(['v.v', 'tp', 'ts', 'ths', 'gs', 'mr', 'mrs', 'ms', 'dr', 'e.g', 'i.e', 'etc']);
        if (ABBRS.has(lastWord)) return false;
      }
      return true;
    }

    return false;
  }

  handleEscapeRevert(target, event) {
    if (this.settings.escRevert === false) return false;

    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    const wordInfo = isNative
      ? this.textReplacer.extractNativeWordBuffer(target)
      : this.textReplacer.extractContentEditableWordBuffer();

    if (wordInfo && wordInfo.word) {
      const revert = this.avimEngine.revertCurrentWord(wordInfo.word);
      if (revert.reverted) {
        event.preventDefault();
        if (isNative) {
          this.textReplacer.replaceInNativeInput(
            target,
            wordInfo.startIndex,
            wordInfo.endIndex,
            revert.result
          );
        } else {
          this.textReplacer.replaceInContentEditable(
            target,
            wordInfo.word,
            revert.result
          );
        }
        this.hideSuggestions();
        this.showHudToast(`Hoàn tác: ${revert.result}`, true);
        return true;
      }
    }
    return false;
  }

  handleBackspaceUndo(target, event) {
    if (!this.macroEngine.enabled || !this.macroEngine.autoUndo) return false;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const pos = target.selectionStart ?? 0;
      const textBefore = target.value.slice(0, pos);
      const undoInfo = this.macroEngine.checkUndo(textBefore);

      if (undoInfo.undo) {
        event.preventDefault();
        const startReplace = pos - undoInfo.removeLength;
        const replacement = undoInfo.step === 1 ? '' : undoInfo.rawTrigger;
        this.textReplacer.replaceInNativeInput(target, startReplace, pos, replacement);
        return true;
      }
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const textBefore = (node.textContent || '').slice(0, range.startOffset);
          const undoInfo = this.macroEngine.checkUndo(textBefore);
          if (undoInfo.undo) {
            event.preventDefault();
            const targetSlice = textBefore.slice(-undoInfo.removeLength);
            const replacement = undoInfo.step === 1 ? '' : undoInfo.rawTrigger;
            this.textReplacer.replaceInContentEditable(target, targetSlice, replacement);
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Adopt preceding word when Backspace erases a space delimiter.
   * e.g.: user types 'toan ' then hits Backspace -> caret is now right after 'toan'.
   * Re-adopting 'toan' allows the very next keystroke (like 's') to immediately modify
   * the word into 'toán' without needing to re-type the whole word.
   */
  adoptWordBeforeBackspace(target, event) {
    let textBefore = '';
    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (isNative) {
      const pos = target.selectionStart ?? 0;
      textBefore = target.value.slice(0, pos);
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          textBefore = (node.textContent || '').slice(0, range.startOffset);
        }
      }
    }

    // Check if backspacing exactly one space following a word
    if (textBefore && textBefore.endsWith(' ')) {
      const trimmed = textBefore.slice(0, -1);
      const match = trimmed.match(/([\p{L}\p{M}]+)$/u);
      if (match) {
        const adopted = match[1];
        this.avimEngine.currentWordRaw = adopted;
        this.avimEngine.lastTransformed = adopted;
        this.lastWordBeforeDelimiter = '';
      this.secondLastWordBeforeDelimiter = '';
      }
    }
  }

  handleCharacterInput(target, key, event) {
    const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    // Read full context before caret for smart contextual guards
    let textBeforeCaret = '';
    if (isNative) {
      const pos = target.selectionStart ?? target.value.length;
      textBeforeCaret = target.value.slice(0, pos);
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        let offset = range.startOffset;
        if (node.nodeType === Node.TEXT_NODE) {
          textBeforeCaret = (node.textContent || '').slice(0, offset);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          let text = '';
          for (let i = 0; i < offset && i < node.childNodes.length; i++) {
            text += node.childNodes[i].textContent || '';
          }
          textBeforeCaret = text;
        }
      }
    }

    const wordInfo = isNative
      ? this.textReplacer.extractNativeWordBuffer(target)
      : this.textReplacer.extractContentEditableWordBuffer();
    const currentWord = wordInfo?.word || '';

    // 0. URL / Email / Code Syntax Guard:
    // When typing links (http://, www., .com, /path), emails (user@...),
    // or code identifiers (snake_case, kebab-case, dot.notation, $var, #id, etc.),
    // completely suspend Vietnamese IME transformation, quick consonants, and auto-capitalize.
    if (isUrlOrEmailOrCode(textBeforeCaret, currentWord, key)) {
      this.hideSuggestions();
      this.avimEngine.resetWordSession();
      return;
    }

    // 0B. Smart Punctuation Snapping on Macro:
    // When user just expanded a macro (e.g. "vn" -> "Việt Nam "), if next key is a punctuation
    // mark (such as , . ; : ! ? ) ] } >), delete the trailing space and attach punctuation directly.
    if (this.macroEngine.enabled) {
      const snap = this.macroEngine.checkPunctuationSnap(key, textBeforeCaret);
      if (snap.snap) {
        event.preventDefault();
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          // Delete trailing space and insert punctuation directly + space
          const startReplace = pos - snap.deleteLength;
          this.textReplacer.replaceInNativeInput(target, startReplace, pos, snap.snappedChar + ' ');
        } else if (target.isContentEditable) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
              this.textReplacer.replaceInContentEditable(target, ' ', snap.snappedChar + ' ');
            }
          }
        }
        this.avimEngine.resetWordSession();
        return;
      }
    }

    // A. Check Word Delimiter Actions: Auto-Restore English (GoNhanh) & Macro Trigger & Emoji & Gboard Next-Word
    if (isDelimiter(key)) {
      if (wordInfo && wordInfo.word) {
        // Emoji Shorthand Expansion on Delimiter (e.g. ":tim" + Space -> "❤️ ")
        if (this.settings.emojiShortcuts !== false && currentWord.startsWith(':')) {
          const emoji = checkEmojiShortcut(currentWord);
          if (emoji) {
            event.preventDefault();
            const fullReplacement = emoji + (key === ' ' ? ' ' : key);
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                wordInfo.startIndex,
                wordInfo.endIndex,
                fullReplacement
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                currentWord,
                fullReplacement
              );
            }
            this.hideSuggestions();
            this.avimEngine.resetWordSession();
            return;
          }
        }

        // Record bigram & trigram transition & usage for Gboard learning on EVERY website
        if (this.lastWordBeforeDelimiter) {
          autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, currentWord, this.secondLastWordBeforeDelimiter);
        }
        autoCompleteEngine.recordWordUsage(currentWord);
        this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
        this.lastWordBeforeDelimiter = currentWord;

        // Next-Word Prediction:
        // Do NOT predict next-word if:
        // 1. Delimiter is a sentence terminator (. ? !)
        // 2. Typing space immediately after a sentence terminator (. ? !)
        const isSentenceTerminator = ['.', '?', '!', '\n', '\r'].includes(key);
        const isAfterSentenceEnd = isSentenceTerminator || (textBeforeCaret && /[.!?]\s*$/.test(textBeforeCaret));

        if (isAfterSentenceEnd) {
          this.hideSuggestions();
          this.lastWordBeforeDelimiter = '';
          this.secondLastWordBeforeDelimiter = '';
        } else if (this.settings.nextWordEnabled !== false) {
          setTimeout(() => {
            const nextList = autoCompleteEngine.getNextWordSuggestions(currentWord, 4, this.secondLastWordBeforeDelimiter);
            if (nextList && nextList.length > 0) {
              this.showSuggestions(target, nextList, 'nextword');
            } else {
              this.hideSuggestions();
            }
          }, 10);
        }

        // 1. Auto-Restore English Words (GoNhanh) on space / delimiter (e.g. 'têt' -> 'text', 'úẻ' -> 'user', 'púh' -> 'push')
        if (this.settings.autoRestoreEnglish !== false) {
          const restore = this.avimEngine.checkAutoRestore(currentWord);
          if (restore.restore) {
            event.preventDefault();
            const fullReplacement = restore.result + key;
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                wordInfo.startIndex,
                wordInfo.endIndex,
                fullReplacement
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                currentWord,
                fullReplacement
              );
            }
            this.avimEngine.resetWordSession();
            return;
          }
        }

        // 2. Check Macro Expansion
        if (this.macroEngine.enabled) {
          const expansion = this.macroEngine.checkExpansion(currentWord, key);
          if (expansion.match) {
            event.preventDefault();
            const fullReplacement = expansion.expandedText + key;

            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                wordInfo.startIndex,
                wordInfo.endIndex,
                fullReplacement
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                currentWord,
                fullReplacement
              );
            }
            this.avimEngine.resetWordSession();
            return;
          } else if (expansion.suppressed) {
            // User previously undid this macro (e.g. 'vn' <- 'Việt Nam ' via Backspace)
            // Allow the delimiter (space) to pass through naturally without expanding!
            this.avimEngine.resetWordSession();
            return;
          }
        }
      }

      this.macroEngine.clearUndo();
      this.avimEngine.resetWordSession();
      return;
    }

    // A2. Closing colon emoji trigger (e.g. user finishes typing ":tim" with ":")
    if (this.settings.emojiShortcuts !== false && key === ':') {
      let textBefore = '';
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        textBefore = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            textBefore = (node.textContent || '').slice(0, range.startOffset);
          }
        }
      }
      const match = textBefore.match(/(:[a-zA-Z0-9_+-]+)$/);
      if (match) {
        const queryWithColon = match[1] + ':';
        const emoji = checkEmojiShortcut(queryWithColon);
        if (emoji) {
          event.preventDefault();
          const matchStart = isNative
            ? (target.selectionStart ?? target.value.length) - match[1].length
            : 0;
          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              matchStart,
              target.selectionStart ?? target.value.length,
              emoji + ' '
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              match[1],
              emoji + ' '
            );
          }
          this.hideSuggestions();
          this.avimEngine.resetWordSession();
          return;
        }
      }
    }

    // A3. Auto-Capitalization at beginning of sentence (. ! ? followed by space or line start)
    if (this.settings.autoCapitalize !== false && key.length === 1 && key >= 'a' && key <= 'z') {
      if (this.shouldAutoCapitalize(target)) {
        const upperChar = key.toUpperCase();
        event.preventDefault();
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          this.textReplacer.replaceInNativeInput(target, pos, pos, upperChar);
        } else {
          this.textReplacer.replaceInContentEditable(target, '', upperChar);
        }
        this.avimEngine.trackRawKey(upperChar);
        if (this.settings.autoCompleteEnabled !== false) {
          setTimeout(() => {
            const wInfo = isNative
              ? this.textReplacer.extractNativeWordBuffer(target)
              : this.textReplacer.extractContentEditableWordBuffer();
            if (wInfo && wInfo.word && wInfo.word.length >= 1) {
              const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
              if (list && list.length > 0) {
                this.showSuggestions(target, list, 'autocomplete', wInfo.word);
              } else {
                this.hideSuggestions();
              }
            }
          }, 10);
        }
        return;
      }
    }

    // B. Vietnamese IME Transformation
    if (this.settings.method !== IME_METHOD.OFF) {
      const wordInfo = isNative
        ? this.textReplacer.extractNativeWordBuffer(target)
        : this.textReplacer.extractContentEditableWordBuffer();

      if (wordInfo) {
        const currentWord = wordInfo.word || '';
        const result = this.avimEngine.processKey(currentWord, key);

        if (result.transformed) {
          // Immediately prevent default and stop immediate propagation to prevent race conditions with frameworks (React/Vue/TipTap)
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }

          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              wordInfo.startIndex,
              wordInfo.endIndex,
              result.result
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              currentWord,
              result.result
            );
          }
        }
      }
    }

    // C. Trigger Auto-complete suggestions for in-progress word (e.g. typing 'ngh', 'nghiên', ':ti')
    if (this.settings.autoCompleteEnabled !== false) {
      setTimeout(() => {
        const wInfo = isNative
          ? this.textReplacer.extractNativeWordBuffer(target)
          : this.textReplacer.extractContentEditableWordBuffer();

        if (wInfo && wInfo.word && wInfo.word.length >= 1) {
          const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
          if (list && list.length > 0) {
            this.showSuggestions(target, list, 'autocomplete', wInfo.word);
          } else {
            this.hideSuggestions();
          }
        } else {
          this.hideSuggestions();
        }
      }, 10);
    }
  }

  toggleMethod() {
    const isCurrentlyOff = this.settings.method === IME_METHOD.OFF;
    if (isCurrentlyOff) {
      // Restore previous method (default to AUTO)
      this.settings.method = this.previousMethod || IME_METHOD.AUTO;
    } else {
      this.previousMethod = this.settings.method;
      this.settings.method = IME_METHOD.OFF;
    }

    // Save per-domain memory if enabled
    if (this.settings.perDomainMemory !== false && typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname) {
        if (!this.settings.domainMethods) {
          this.settings.domainMethods = {};
        }
        this.settings.domainMethods[hostname] = this.settings.method;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ avim_domain_methods: this.settings.domainMethods }).catch(() => {});
        }
      }
    }

    this.applySettings();

    // Persist to sync storage if available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ avim_settings: this.settings }).catch(() => {});
    }

    // Show floating HUD notification
    const methodName = this.settings.method === IME_METHOD.VNI
      ? 'VNI'
      : this.settings.method === IME_METHOD.TELEX
        ? 'Telex'
        : this.settings.method === IME_METHOD.AUTO
          ? 'Tự động'
          : 'TẮT';

    const text = this.settings.method !== IME_METHOD.OFF
      ? `AVIM: BẬT (${methodName})`
      : 'AVIM: TẮT (Tiếng Anh)';

    this.showHudToast(text, this.settings.method !== IME_METHOD.OFF);
  }

  showHudToast(text, isOn) {
    let toast = document.getElementById('__avim_hud_toast__');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = '__avim_hud_toast__';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '2147483647',
        padding: '8px 14px',
        borderRadius: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        fontWeight: '600',
        lineHeight: '1.4',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ffffff'
      });
      document.documentElement.appendChild(toast);
    }

    if (isOn) {
      toast.style.backgroundColor = '#047857'; // emerald 700
      toast.style.border = '1px solid #10b981';
    } else {
      toast.style.backgroundColor = '#1e293b'; // slate 800
      toast.style.border = '1px solid #475569';
    }

    toast.textContent = '';
    const dot = document.createElement('span');
    Object.assign(dot.style, {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: isOn ? '#34d399' : '#94a3b8',
      boxShadow: isOn ? '0 0 6px #34d399' : 'none'
    });
    const label = document.createElement('span');
    label.textContent = text;
    toast.appendChild(dot);
    toast.appendChild(label);

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(this._hudTimeout);
    this._hudTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
    }, 1500);
  }
}

// Instantiate content script when running in browser extension context
if (typeof window !== 'undefined') {
  window.__AVIM_XKEY__ = new AvimContentScript();
}

export { AvimContentScript };
