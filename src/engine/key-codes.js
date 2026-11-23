/**
 * Key codes and delimiter definitions for AVIM xKey Vietnamese IME & Macro Engine
 * Unified for Chromium MV3 and Firefox WebExtensions.
 */

export const IME_METHOD = {
  OFF: 0,
  TELEX: 1,
  VNI: 2,
  AUTO: 3
};
export const TONE_STYLE = {
  MODERN: 'modern',  // hoà, hoá, thuỷ, khoẻ (quy chuẩn mới / BGDĐT: dấu trên âm chính a, e, y)
  CLASSIC: 'classic' // hòa, hóa, thủy, khỏe (phong cách cũ: dấu trên âm đệm o, u)
};

export const DELIMITERS = new Set([
  ' ', '\t', '\n', '\r',
  '.', ',', ';', ':', '!', '?',
  '-', '—', '_', '/', '\\', '|',
  '(', ')', '[', ']', '{', '}', '<', '>',
  '"', '\'', '`', '“', '”', '‘', '’'
]);

export function isDelimiter(char) {
  if (!char || char.length !== 1) return false;
  return DELIMITERS.has(char);
}

export function isWordChar(char) {
  if (!char) return false;
  return /^[\p{L}\p{N}]$/u.test(char);
}

export const TELEX_KEYS = {
  // Tones
  's': 'acute',     // Sắc
  'f': 'grave',     // Huyền
  'r': 'hook',      // Hỏi
  'x': 'tilde',     // Ngã
  'j': 'dot',       // Nặng
  'z': 'removeTone',// Xóa dấu

  // Vowel & consonant modifiers
  'a': 'circumflex_a', // aa -> â
  'e': 'circumflex_e', // ee -> ê
  'o': 'circumflex_o', // oo -> ô
  'w': 'horn_breve',   // ow -> ơ, uw -> ư, aw -> ă
  'd': 'bar_d'         // dd -> đ
};

export const VNI_KEYS = {
  '1': 'acute',      // Sắc
  '2': 'grave',      // Huyền
  '3': 'hook',       // Hỏi
  '4': 'tilde',      // Ngã
  '5': 'dot',        // Nặng
  '6': 'circumflex', // 6 -> â, ê, ô
  '7': 'horn',       // 7 -> ơ, ư
  '8': 'breve',      // 8 -> ă
  '9': 'bar_d',      // 9 -> đ
  '0': 'removeTone'  // 0 -> Xóa dấu thanh
};

/**
 * Detect if the user is currently typing a URL, an Email, or Code syntax.
 * In these contexts, Vietnamese IME diacritics, quick consonants, and auto-capitalize
 * should be safely suspended to prevent corrupting links, emails, and code.
 *
 * @param {string} textBeforeCaret - Text in input/editor up to the current caret position
 * @param {string} [currentWord] - The current word token being typed
 * @param {string} [nextKey] - The next incoming keystroke
 * @returns {boolean}
 */
export function isUrlOrEmailOrCode(textBeforeCaret = '', currentWord = '', nextKey = '') {
  const token = (currentWord || '').trim();
  const fullContext = (textBeforeCaret || '');

  // Extract the non-whitespace sequence immediately preceding the caret
  const lastChunkMatch = fullContext.match(/[^\s]+$/);
  const currentChunk = lastChunkMatch ? lastChunkMatch[0] : token;

  if (!currentChunk && !token) return false;

  // 1. URLs & Web addresses
  // Protocols: http://, https://, ftp://, file://
  if (/^(https?|ftp|file):\/\//i.test(currentChunk)) {
    return true;
  }
  // Starting with www. or localhost or IP
  if (/^(www\.|localhost[\/:]|127\.0\.0\.1)/i.test(currentChunk)) {
    return true;
  }
  // Common domain extensions with path or query: .com, .vn, .org, .net, .io, .dev, etc.
  if (/\.(com|vn|net|org|io|dev|app|edu|gov|co|me|info|xyz|ai|tech|store|site)(\/|\?|#|$)/i.test(currentChunk)) {
    return true;
  }
  // Unix / Linux / macOS absolute and home file paths or slash commands: e.g. /usr/bin, /compact, /aws, ~/.config, ./dist
  if (/^(\/[a-zA-Z0-9_.-]+|~\/|\.\/|\.\.\/)/.test(currentChunk)) {
    return true;
  }
  // Short module prefixes before dot: e.g. os.path, sys.argv, io.BytesIO, fs.readFile
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]*$/.test(currentChunk)) {
    return true;
  }
  // Slashes in middle of non-space token (URL path: e.g. domain/path or api/v1)
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i.test(currentChunk)) {
    return true;
  }

  // 2. Email addresses
  // Contains @ in the current token (e.g. user@, user@domain, contact@company.vn)
  if (currentChunk.includes('@') || token.includes('@')) {
    return true;
  }

  // 3. Code Identifiers & Syntax
  // CSS units & numeric-prefixed tokens (e.g. 10px, 2rem, 50vh, 100ms)
  if (/^\d+[a-zA-Z]+$/.test(currentChunk) || /^\d+[a-zA-Z]+$/.test(token)) {
    return true;
  }
  // Short Git commit hashes (7-40 hex chars containing both digits and a-f, e.g. a1b2c3d)
  if (/^(?=.*\d)(?=.*[a-f])[0-9a-f]{7,40}$/i.test(currentChunk)) {
    return true;
  }
  // Shell, Bash, PHP, Perl variables: $var, ${VAR}, $1, $_POST, $this->
  if (/^\$\{?[a-zA-Z0-9_]+/i.test(currentChunk) || /^\$\{?[a-zA-Z0-9_]+/i.test(token)) {
    return true;
  }
  // snake_case or dunder: contains underscore (e.g. user_id, my_var, __init__, MAX_LEN)
  if (token.includes('_') || currentChunk.includes('_')) {
    return true;
  }
  // kebab-case: contains hyphen surrounded by alphanumeric chars (e.g. btn-primary, text-center)
  if (/[a-zA-Z0-9]-[a-zA-Z0-9]/.test(currentChunk)) {
    return true;
  }
  // Dot notation / property access (e.g. user.name, console.log, req.body, os.path)
  if (/[a-zA-Z0-9]\.[a-zA-Z0-9]/.test(currentChunk)) {
    return true;
  }
  // Code variables, hex colors, CSS IDs or decorators: starts with $, #, @, --
  if (/^(\$|#|--)[a-zA-Z0-9_-]/i.test(currentChunk) || /^(\$|#|--)[a-zA-Z0-9_-]/i.test(token)) {
    return true;
  }
  // Code file extensions (e.g. script.js, app.tsx, styles.css, query.sql)
  if (/\.(js|ts|tsx|jsx|json|html|css|scss|py|go|rs|cpp|c|h|java|md|sql|sh|yml|yaml|xml)$/i.test(currentChunk)) {
    return true;
  }
  // Code operators & arrows (e.g. ->, =>, ::, !=, ==, ===, <=, >=, </, />)
  if (/(\->|=>|::|!=|===?|<=|>=|<\/|\/>)/.test(currentChunk)) {
    return true;
  }
  // HTML / XML tag starts (e.g. <div, <span, <Button)
  if (/<[a-zA-Z][a-zA-Z0-9_-]*/.test(currentChunk)) {
    return true;
  }

  // 4. Developer-Aware Mode: camelCase & PascalCase Identifier Detection
  // In Vietnamese language, capital letters NEVER appear in the middle of a word.
  // When a lowercase letter is followed by an uppercase letter (camelCase: e.g. useState, isReady, getUserName, onClick),
  // or a word starts with an uppercase letter, has lowercase, and has another uppercase (PascalCase: e.g. UserController, AppProps, ComponentName),
  // it is 100% a programming identifier and MUST NOT receive Vietnamese diacritic transformation.
  // Exception: If the token contains accented characters and ends with an uppercase letter (e.g. 'úeS', 'íC'),
  // do NOT lock code mode yet! Allow AvimEngine.processKey() to un-accent the prefix back to pure Latin (useS, isC).
  const hasAccents = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/iu;
  if ((hasAccents.test(currentChunk) && /[A-Z]$/.test(currentChunk)) ||
      (hasAccents.test(token) && /[A-Z]$/.test(token))) {
    return false;
  }

  if (isCamelOrPascalCase(token) || isCamelOrPascalCase(currentChunk)) {
    return true;
  }

  return false;
}

/**
 * Check if a word token follows camelCase or PascalCase code naming conventions
 * @param {string} token 
 * @returns {boolean}
 */
export function isCamelOrPascalCase(token = '') {
  if (!token || typeof token !== 'string' || token.length < 2) return false;

  // Strip leading non-letters (e.g. $, #, _, --) if any
  const clean = token.replace(/^[^a-zA-Z\p{L}]+/u, '');
  if (clean.length < 2) return false;

  // 1. camelCase: starts with lowercase/accented lowercase, contains an ASCII uppercase letter (e.g. isReady, useState, íC, uêS)
  if (/^[\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
    return true;
  }

  // 2. PascalCase: starts with uppercase (ASCII or accented), has at least one lowercase, followed by another uppercase (e.g. UserController, AppProps, ReactNode, ÚerC)
  if (/^[\p{Lu}][\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Developer Cheat Mode (inspired by vnchKey cheat.rs):
 * Check if the active host or target DOM element is an established developer environment
 * (e.g. GitHub, GitLab, LeetCode, VSCode Web, CodeMirror, Monaco Editor, Ace, terminal).
 * In these contexts, common programming identifiers and keywords bypass Vietnamese diacritics.
 */
export const DEVELOPER_CHEAT_DOMAINS = new Set([
  'github.com',
  'gist.github.com',
  'gitlab.com',
  'leetcode.com',
  'leetcode.cn',
  'vscode.dev',
  'github.dev',
  'stackblitz.com',
  'codesandbox.io',
  'codepen.io',
  'replit.com',
  'jsfiddle.net',
  'kaggle.com',
  'huggingface.co'
]);

export function isDeveloperCheatContext(hostname = '', targetElement = null) {
  if (hostname) {
    const host = String(hostname).toLowerCase();
    if (DEVELOPER_CHEAT_DOMAINS.has(host) || Array.from(DEVELOPER_CHEAT_DOMAINS).some(d => host.endsWith('.' + d))) {
      return true;
    }
  }
  if (targetElement && typeof targetElement.closest === 'function') {
    if (targetElement.closest('.monaco-editor, .cm-editor, .CodeMirror, .ace_editor, pre, code, [data-mode-id], terminal, .xterm')) {
      return true;
    }
  }
  return false;
}

/**
 * True while an OS/browser IME (Pinyin, Kana, ...) owns the keystroke.
 *
 * MDN recommends ignoring `keydown` when `event.isComposing` is true OR
 * `event.keyCode === 229`: Firefox still fires `keydown` during composition,
 * and `compositionstart` may arrive after the first key while `compositionend`
 * may arrive before the last one. Checking both flags covers those edges.
 *
 * Pure function on purpose: content.js uses it for both `keydown` and
 * `beforeinput`, and unit tests can call it without a DOM.
 *
 * @param {{ isComposing?: boolean, keyCode?: number }} event
 * @returns {boolean}
 */
export function isImeCompositionEvent(event) {
  return Boolean(event && (event.isComposing === true || event.keyCode === 229));
}
