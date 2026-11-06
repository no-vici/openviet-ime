/**
 * Text Replacer and Caret / Selection Manager
 * Intercepts and replaces text in native inputs and contenteditable editors with synthetic InputEvents.
 *
 * @license Apache-2.0
 */

export class TextReplacer {
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
   * Replace text in a ContentEditable container (handles regular editors and ProseMirror/TipTap)
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

    // For modern rich-text editors (like TipTap / ProseMirror on Telegram Web A or Sider.ai / StackEdit),
    // when inserting a single character (empty oldText), try document.execCommand first
    if (!nfcOldText) {
      try {
        if (document.execCommand('insertText', false, nfcNewText)) {
          this.dispatchSyntheticInput(root, nfcNewText);
          return;
        }
      } catch {}
    }

    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    let offset = range.startOffset;

    // If node is an ELEMENT_NODE (e.g. <p> container in TipTap / ProseMirror), locate the text node
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

        // Atomic replace via Range if supported (preferred by TipTap / Slate / Draft / CodeMirror)
        try {
          const replaceRange = document.createRange();
          replaceRange.setStart(node, replaceStart);
          replaceRange.setEnd(node, offset);
          sel.removeAllRanges();
          sel.addRange(replaceRange);

          if (document.execCommand('insertText', false, nfcNewText)) {
            this.dispatchSyntheticInput(root, nfcNewText);
            return;
          }
        } catch {}

        // Fallback DOM manipulation
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
      return {
        word: match[1],
        startIndex: pos - match[1].length,
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
        return {
          word: match[1],
          textNode: node,
          startIndex: offset - match[1].length,
          endIndex: offset
        };
      }
    }
    return { word: '' };
  }
}
