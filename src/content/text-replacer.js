/**
 * Text Replacer and Caret / Selection Manager
 * Intercepts and replaces text in native inputs and contenteditable editors
 * with synthetic InputEvents and a ClipboardEvent('paste') adapter for Microsoft Teams Web (RoosterJS).
 *
 * @license Apache-2.0
 */

export class TextReplacer {
  /**
   * Detect if the current page/editor is Microsoft Teams Web (RoosterJS / CKEditor)
   * which requires ClipboardEvent('paste') to safely update its internal Content Model.
   */
  isTeamsEditor(root) {
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname.toLowerCase();
      if (host === 'teams.microsoft.com' || host.endsWith('.teams.microsoft.com') ||
          host === 'teams.live.com' || host.endsWith('.teams.live.com')) {
        return true;
      }
    }
    if (root && typeof root.closest === 'function') {
      if (root.closest('[data-tid="ckeditor"], [data-tid="message-pane-input"], .rooster-editor')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Replace text in a native HTMLInputElement or HTMLTextAreaElement
   * @param {HTMLInputElement|HTMLTextAreaElement} el
   * @param {number} startIndex Start index of text to replace
   * @param {number} endIndex End index of text to replace
   * @param {string} replacement New replacement text
   */
  replaceInNativeInput(el, startIndex, endIndex, replacement) {
    // Normalize replacement strictly to Unicode NFC
    const nfcReplacement = (replacement || '').normalize('NFC');
    const originalValue = el.value;
    const before = originalValue.slice(0, startIndex);
    const after = originalValue.slice(endIndex);
    const newValue = before + nfcReplacement + after;

    const newCaretPos = startIndex + nfcReplacement.length;

    // Use setRangeText if supported
    if (typeof el.setRangeText === 'function') {
      el.setRangeText(nfcReplacement, startIndex, endIndex, 'end');
    } else {
      el.value = newValue;
      el.setSelectionRange(newCaretPos, newCaretPos);
    }

    // Ensure caret is positioned accurately
    el.selectionStart = newCaretPos;
    el.selectionEnd = newCaretPos;

    // Dispatch synthetic InputEvent to trigger React / Vue / Angular change detectors
    this.dispatchSyntheticInput(el, nfcReplacement);
  }

  /**
   * Adapter for Microsoft Teams Web (RoosterJS):
   * Selects the target range and dispatches a synthetic ClipboardEvent('paste')
   * containing plain text so RoosterJS's PastePlugin updates its internal Content Model cleanly.
   */
  replaceViaPasteAdapter(root, replaceRange, nfcNewText) {
    try {
      const sel = window.getSelection();
      if (!sel) return false;

      if (replaceRange) {
        sel.removeAllRanges();
        sel.addRange(replaceRange);
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', nfcNewText);

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });

      // Dispatch paste event to the active editor element
      const targetEl = document.activeElement || root;
      targetEl.dispatchEvent(pasteEvent);

      // If Teams handled and prevented default on the paste event, Content Model is updated!
      if (pasteEvent.defaultPrevented) {
        return true;
      }
    } catch {
      // Fallback if DataTransfer/ClipboardEvent constructor is restricted
    }
    return false;
  }

  /**
   * Replace text in a ContentEditable container (handles regular editors, ProseMirror, Lexical, and Teams RoosterJS)
   * @param {HTMLElement} root ContentEditable root
   * @param {string} oldText String to replace
   * @param {string} newText Replacement string
   */
  replaceInContentEditable(root, oldText, newText) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    // Strict Unicode NFC normalization for output
    const nfcNewText = (newText || '').normalize('NFC');
    const nfcOldText = (oldText || '').normalize('NFC');
    const isTeams = this.isTeamsEditor(root);

    // 1. Insertion with empty oldText (e.g., Auto-Capitalize or Next-Word insertion)
    if (!nfcOldText) {
      if (isTeams) {
        const currentRange = sel.getRangeAt(0);
        if (this.replaceViaPasteAdapter(root, currentRange, nfcNewText)) {
          return;
        }
      }
      try {
        if (document.execCommand('insertText', false, nfcNewText)) {
          const isLexical = root.hasAttribute?.('data-lexical-editor') || root.closest?.('[data-lexical-editor]');
          if (!isLexical) {
            this.dispatchSyntheticInput(root, nfcNewText);
          }
          return;
        }
      } catch {}
    }

    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    let offset = range.startOffset;

    // If node is an ELEMENT_NODE (e.g. <p> container in TipTap / ProseMirror / RoosterJS), locate the text node
    if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
      if (offset > 0 && node.childNodes[offset - 1]) {
        const prev = node.childNodes[offset - 1];
        if (prev.nodeType === Node.TEXT_NODE) {
          node = prev;
          offset = prev.textContent.length;
        } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
          node = prev.lastChild;
          offset = node.textContent.length;
        }
      } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
        node = node.childNodes[offset];
        offset = 0;
      }
    }

    if (node && node.nodeType === Node.TEXT_NODE) {
      const rawText = node.textContent || '';
      const text = rawText.normalize('NFC');

      // Find where oldText occurred right before cursor
      const textBeforeCursor = text.slice(0, offset);
      if (textBeforeCursor.endsWith(nfcOldText)) {
        const replaceStart = offset - nfcOldText.length;
        const newContent = text.slice(0, replaceStart) + nfcNewText + text.slice(offset);

        const replaceRange = document.createRange();
        replaceRange.setStart(node, replaceStart);
        replaceRange.setEnd(node, offset);

        // 2. Microsoft Teams Web (RoosterJS) Adapter
        if (isTeams) {
          if (this.replaceViaPasteAdapter(root, replaceRange, nfcNewText)) {
            return;
          }
        }

        // 3. Standard Rich Editors (TipTap/ProseMirror, Lexical, Slate)
        try {
          sel.removeAllRanges();
          sel.addRange(replaceRange);

          // Dispatch beforeinput with insertReplacementText if supported
          this.dispatchBeforeInput(root, nfcNewText, replaceRange);

          if (document.execCommand('insertText', false, nfcNewText)) {
            const isLexical = root.hasAttribute?.('data-lexical-editor') || root.closest?.('[data-lexical-editor]');
            if (!isLexical) {
              this.dispatchSyntheticInput(root, nfcNewText);
            }
            return;
          }
        } catch {}

        // 4. Direct DOM manipulation fallback if execCommand fails
        node.textContent = newContent;

        // Reposition caret INSIDE the text node
        const newOffset = replaceStart + nfcNewText.length;
        const newRange = document.createRange();
        newRange.setStart(node, Math.min(newOffset, newContent.length));
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);

        this.dispatchSyntheticInput(root, nfcNewText);
        return;
      }
    }

    // Fallback: insert text node & position cursor INSIDE the textNode
    const textNode = document.createTextNode(nfcNewText);
    range.deleteContents();
    range.insertNode(textNode);
    const newRange = document.createRange();
    newRange.setStart(textNode, textNode.length);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    this.dispatchSyntheticInput(root, nfcNewText);
  }

  /**
   * Dispatch synthetic beforeinput event for modern rich editors (TipTap / ProseMirror)
   */
  dispatchBeforeInput(element, insertedText, targetRange) {
    if (typeof InputEvent !== 'function') return;
    try {
      const init = {
        bubbles: true,
        cancelable: true,
        inputType: 'insertReplacementText',
        data: insertedText
      };
      if (targetRange && typeof InputEvent.prototype.getTargetRanges === 'function') {
        init.targetRanges = [targetRange];
      }
      const beforeInputEvent = new InputEvent('beforeinput', init);
      element.dispatchEvent(beforeInputEvent);
    } catch {}
  }

  /**
   * Dispatch synthetic InputEvent and Event('change')
   */
  dispatchSyntheticInput(element, insertedText) {
    let inputEvent;
    try {
      inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: insertedText
      });
    } catch {
      inputEvent = document.createEvent('Event');
      inputEvent.initEvent('input', true, true);
    }

    element.dispatchEvent(inputEvent);
  }

  /**
   * Extract recent word buffer before caret from native input
   */
  extractNativeWordBuffer(el) {
    const pos = el.selectionStart ?? el.value.length;
    const value = el.value || '';
    const textBefore = value.slice(0, pos);

    // Find the word boundary before pos (allow apostrophe ' and ’ for Central Highlands names like M'Đrắk, Ea H'leo, Cư M'gar)
    const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
    if (match) {
      let word = match[1];
      let startIndex = pos - word.length;

      // If word starts with an opening quote mark (single quote ' or curly ’)
      // and is NOT a Central Highlands apostrophe name (e.g. 'chào vs M'Đrắk, Ea H'leo):
      // strip the leading quotation mark from the active word buffer so quotes are preserved untouched.
      if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
        word = word.slice(1);
        startIndex += 1;
      }

      return {
        word,
        startIndex,
        endIndex: pos
      };
    }
    return { word: '', startIndex: pos, endIndex: pos };
  }

  /**
   * Extract recent word buffer before caret from ContentEditable
   * Supports TEXT_NODE as well as ELEMENT_NODE containers (ProseMirror / TipTap)
   */
  extractContentEditableWordBuffer() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return { word: '' };

    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    let offset = range.startOffset;

    if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
      if (offset > 0 && node.childNodes[offset - 1]) {
        const prev = node.childNodes[offset - 1];
        if (prev.nodeType === Node.TEXT_NODE) {
          node = prev;
          offset = prev.textContent.length;
        } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
          node = prev.lastChild;
          offset = node.textContent.length;
        }
      } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
        node = node.childNodes[offset];
        offset = 0;
      }
    }

    if (node && node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const textBefore = text.slice(0, offset);
      const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
      if (match) {
        let word = match[1];
        let startIndex = offset - word.length;

        // If word starts with an opening quote mark (single quote ' or curly ’)
        // and is NOT a Central Highlands apostrophe name:
        if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
          word = word.slice(1);
          startIndex += 1;
        }

        return {
          word,
          textNode: node,
          startIndex,
          endIndex: offset
        };
      }
    }
    return { word: '' };
  }
}
