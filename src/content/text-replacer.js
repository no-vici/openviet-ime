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
      const host = (window.location.hostname || '').toLowerCase();
      if (host === 'teams.microsoft.com' || host.endsWith('.teams.microsoft.com') ||
          host === 'teams.live.com' || host.endsWith('.teams.live.com') ||
          host === 'teams.cloud.microsoft' || host.endsWith('.teams.cloud.microsoft')) {
        return true;
      }
    }
    if (root && typeof root.closest === 'function') {
      if (root.closest('[data-tid*="ckeditor"], [data-tid*="message-pane-input"], .rooster-editor, .ck-editor__editable')) {
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
        try {
          const host = root.closest?.('.ck-editor__editable, [data-tid*="ckeditor"], .rooster-editor') || root;
          const currentRange = sel.getRangeAt(0);
          let staticTarget;
          try {
            staticTarget = new StaticRange({
              startContainer: currentRange.startContainer,
              startOffset: currentRange.startOffset,
              endContainer: currentRange.endContainer,
              endOffset: currentRange.endOffset
            });
          } catch {}

          const beforeInputEv = new InputEvent('beforeinput', {
            inputType: 'insertText',
            data: nfcNewText,
            bubbles: true,
            cancelable: true,
            composed: true,
            targetRanges: staticTarget ? [staticTarget] : []
          });

          if (!host.dispatchEvent(beforeInputEv)) {
            return;
          }
        } catch {}
      }

      try {
        if (document.execCommand('insertText', false, nfcNewText)) {
          const isLexical = root.hasAttribute?.('data-lexical-editor') || root.closest?.('[data-lexical-editor]');
          // Note: In Teams or Lexical, execCommand('insertText') already dispatches a native InputEvent.
          // Emitting a redundant synthetic InputEvent causes double character insertion in complex rich editors.
          if (!isLexical && !isTeams) {
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
        let prev = node.childNodes[offset - 1];
        while (prev && prev.nodeType !== Node.TEXT_NODE && prev.lastChild) {
          prev = prev.lastChild;
        }
        if (prev && prev.nodeType === Node.TEXT_NODE) {
          node = prev;
          offset = prev.textContent.length;
        }
      } else if (node.childNodes[offset]) {
        let cur = node.childNodes[offset];
        while (cur && cur.nodeType !== Node.TEXT_NODE && cur.firstChild) {
          cur = cur.firstChild;
        }
        if (cur && cur.nodeType === Node.TEXT_NODE) {
          node = cur;
          offset = 0;
        }
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

        // 2. Microsoft Teams Web (RoosterJS / CKEditor) & Model-backed Editors Adapter
        // Teams (CKEditor 5) uses an internal model that strictly requires a single targeted
        // `insertText` beforeinput event with `targetRanges` (StaticRange) spanning the rewritten tail.
        if (isTeams) {
          try {
            const host = root.closest?.('.ck-editor__editable, [data-tid*="ckeditor"], .rooster-editor') || root;
            // Calculate common prefix between oldText and newText
            let head = 0;
            while (head < nfcOldText.length && head < nfcNewText.length && nfcOldText.charAt(head) === nfcNewText.charAt(head)) {
              head++;
            }
            const tailStart = replaceStart + head;
            const replacement = nfcNewText.slice(head);

            let staticTarget;
            try {
              staticTarget = new StaticRange({
                startContainer: node,
                startOffset: tailStart,
                endContainer: node,
                endOffset: offset
              });
            } catch {}

            const beforeInputEv = new InputEvent('beforeinput', {
              inputType: 'insertText',
              data: replacement,
              bubbles: true,
              cancelable: true,
              composed: true,
              targetRanges: staticTarget ? [staticTarget] : []
            });

            const claimedByEditor = !host.dispatchEvent(beforeInputEv);
            if (claimedByEditor) {
              return;
            }

            // Fallback for non-CKEditor Teams containers: selection replacement via execCommand
            sel.removeAllRanges();
            sel.addRange(replaceRange);
            if (document.execCommand('insertText', false, nfcNewText)) {
              return;
            }
          } catch {}
        }

        // 3. Standard Rich Editors (TipTap/ProseMirror, Lexical, Slate)
        try {
          sel.removeAllRanges();
          sel.addRange(replaceRange);

          if (document.execCommand('insertText', false, nfcNewText)) {
            const isLexical = root.hasAttribute?.('data-lexical-editor') || root.closest?.('[data-lexical-editor]');
            if (!isLexical && !isTeams) {
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
        let prev = node.childNodes[offset - 1];
        while (prev && prev.nodeType !== Node.TEXT_NODE && prev.lastChild) {
          prev = prev.lastChild;
        }
        if (prev && prev.nodeType === Node.TEXT_NODE) {
          node = prev;
          offset = prev.textContent.length;
        }
      } else if (node.childNodes[offset]) {
        let cur = node.childNodes[offset];
        while (cur && cur.nodeType !== Node.TEXT_NODE && cur.firstChild) {
          cur = cur.firstChild;
        }
        if (cur && cur.nodeType === Node.TEXT_NODE) {
          node = cur;
          offset = 0;
        }
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
