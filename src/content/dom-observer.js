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

    // 1. Google Docs / Sheets / Slides proprietary canvas editor bypass
    // Google Docs uses an offscreen canvas rendering engine that conflicts with DOM key replacements
    if (hostname === 'docs.google.com') {
      return true;
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

    // Check data-no-ime / data-no-avim or .no-ime / .no-avim on target or any ancestor (AVIM pattern)
    if (this.disabledOnDataNoIme && element.closest('[data-no-ime], [data-no-avim], .no-ime, .no-avim')) {
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
