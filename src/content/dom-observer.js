/**
 * DOM Observer and Input Target Validator
 * Tracks focused elements, traverses open Shadow DOM roots, and filters out excluded inputs.
 *
 * @license Apache-2.0
 */

export class DomObserver {
  constructor(options = {}) {
    this.blacklistedDomains = new Set(options.blacklistedDomains || []);
    this.disabledOnPassword = options.disabledOnPassword ?? true;
    this.disabledOnDataNoIme = options.disabledOnDataNoIme ?? true;
  }

  setBlacklistedDomains(domains) {
    this.blacklistedDomains = new Set(domains);
  }

  isCurrentDomainBlacklisted() {
    if (typeof window === 'undefined' || !window.location) return false;
    const hostname = window.location.hostname.toLowerCase();

    // 1. Proprietary canvas / WebGL editors bypass
    // Google Docs/Sheets/Slides, Figma, Canva, Miro use custom canvas rendering engines
    const canvasHosts = [
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com',
      'figma.com',
      'canva.com',
      'miro.com'
    ];
    for (const host of canvasHosts) {
      if (hostname === host || hostname.endsWith('.' + host)) {
        return true;
      }
    }

    // 2. User configurable blacklisted domains
    for (const domain of this.blacklistedDomains) {
      if (domain && (hostname === domain || hostname.endsWith('.' + domain))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Deeply resolve active focused element through Shadow DOM roots
   */
  getActiveElement(root = document) {
    let active = root.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  /**
   * Determine if the element is an editable target for Vietnamese IME & Macro
   */
  isEligibleTarget(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    if (this.isCurrentDomainBlacklisted()) {
      return false;
    }

    // Check data-no-ime / data-no-avim or .no-ime / .no-avim or terminal emulator textarea (.xterm-helper-textarea)
    if (this.disabledOnDataNoIme && element.closest('[data-no-ime], [data-no-avim], .no-ime, .no-avim, .xterm-helper-textarea, .terminal-cursor')) {
      return false;
    }

    // Exclude xterm / WebGL terminal helper inputs
    if (element.classList && (element.classList.contains('xterm-helper-textarea') || element.classList.contains('terminal-cursor'))) {
      return false;
    }

    // Readonly or disabled
    if (element.hasAttribute('disabled') || element.hasAttribute('readonly')) {
      return false;
    }

    // Native inputs
    if (element instanceof HTMLInputElement) {
      const type = (element.type || 'text').toLowerCase();
      // Exclude password, number, tel, email, file, checkbox, radio, button, color, date, range
      const excludedTypes = ['password', 'number', 'email', 'tel', 'checkbox', 'radio', 'file', 'button', 'submit', 'reset', 'color', 'date', 'range'];
      if (excludedTypes.includes(type)) {
        return false;
      }
      return true;
    }

    // Native textareas
    if (element instanceof HTMLTextAreaElement) {
      return true;
    }

    // Rich-text editors (contenteditable)
    if (element.isContentEditable || element.getAttribute('contenteditable') === 'true' || element.getAttribute('role') === 'textbox') {
      return true;
    }

    return false;
  }
}
