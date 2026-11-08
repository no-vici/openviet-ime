/**
 * Vietnamese Dictionary & User Custom Dictionary Manager
 * Integrated from Hunspell Vietnamese (OpenOffice / Hồ Ngọc Đức / xKey)
 * Supports ~6,700 standard Vietnamese syllables, personal user dictionary,
 * English onset detection, and spell checking auto-restore.
 *
 * @license GPL / MIT
 */

import { getVietnameseWordSet, canon } from './vietnamese-words.js';

// Non-Vietnamese initial consonant clusters (strictly English/foreign onsets)
export const FOREIGN_INITIAL_CLUSTERS = new Set([
  'pl', 'fl', 'cl', 'gl', 'bl', 'sl',
  'pr', 'dr', 'cr', 'br', 'gr', 'fr', 'wr',
  'sp', 'st', 'sk', 'sm', 'sn', 'sw', 'tw', 'dw',
  'spl', 'spr', 'str', 'scr', 'shr', 'squ',
  'kn', 'ps', 'rh', 'phl', 'chr', 'sch'
]);

// Valid Vietnamese initial consonants
export const VIETNAMESE_INITIALS = new Set([
  '', 'b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh',
  'l', 'm', 'n', 'ng', 'ngh', 'nh', 'p', 'ph', 'qu', 'r', 's',
  't', 'th', 'tr', 'v', 'x'
]);

// High-frequency English words and common Telex / VNI trap words (GoNhanh inspired)
export const COMMON_ENGLISH_WORDS = new Set([
  // Telex trap: words ending with 's' (sắc)
  'as', 'is', 'us', 'this', 'yes', 'bus', 'plus', 'has', 'was', 'its', 'his', 'less', 'miss',
  'pass', 'boss', 'loss', 'mass', 'class', 'glass', 'press', 'cross', 'dress', 'guess',
  'basis', 'status', 'focus', 'virus', 'bonus', 'canvas', 'chaos', 'oasis', 'crisis', 'texas',
  'paris', 'series', 'species', 'famous', 'fcitx', 'fcitx5', 'versus', 'alias', 'radius', 'minus', 'genius', 'census', 'campus', 'circus', 'lotus', 'chorus', 'walrus', 'corpus', 'hiatus', 'nexus',
  'news', 'always', 'sometimes', 'perhaps', 'business', 'process', 'access', 'success', 'address', 'docs', 'doc',

  // Telex trap: words with 'x' (ngã)
  'text', 'next', 'context', 'exit', 'taxi', 'linux', 'unix', 'ajax', 'max', 'mix', 'box', 'fix',
  'tax', 'six', 'fax', 'sex', 'complex', 'index', 'matrix', 'syntax', 'luxury', 'reflex', 'prefix',
  'suffix', 'annex', 'latex', 'duplex', 'vertex', 'convex', 'cortex', 'pixel', 'toxic', 'oxide',
  'oxygen', 'galaxy', 'maximum', 'expert', 'expect', 'express', 'explain', 'explore', 'export',
  'extent', 'extra', 'extreme', 'exact', 'exam', 'example', 'exist', 'execute', 'exercise', 'exceed',
  'except', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'expand', 'expend', 'expense', 'expire',

  // Telex trap: words with 'r' (hỏi)
  'for', 'or', 'our', 'your', 'her', 'their', 'other', 'after', 'under', 'over', 'never', 'ever',
  'water', 'paper', 'order', 'power', 'user', 'super', 'server', 'number', 'member', 'driver',
  'render', 'router', 'player', 'master', 'worker', 'filter', 'center', 'letter', 'matter', 'better',
  'doctor', 'factor', 'sector', 'vector', 'senior', 'junior', 'error', 'horror', 'mirror', 'sensor',
  'cursor', 'armor', 'harbor', 'color', 'flavor', 'labor', 'mayor', 'prior', 'vigor', 'vapor', 'favor',
  'clear', 'near', 'dear', 'fear', 'hear', 'bear', 'wear', 'tear', 'year', 'gear', 'rear', 'pear',

  // Telex trap: words with 'w' (horn/breve: ơ, ư, ă)
  'we', 'with', 'work', 'word', 'world', 'week', 'write', 'wrong', 'window', 'windows', 'white',
  'what', 'when', 'where', 'which', 'while', 'who', 'why', 'web', 'way', 'wait', 'want', 'well',
  'will', 'would', 'without', 'within', 'website', 'wifi', 'watch', 'warm', 'wall', 'wave', 'wide',
  'wife', 'wild', 'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'wood', 'wool', 'wrap', 'warn',
  'wash', 'waste', 'west', 'worth', 'worthy', 'wheel', 'whale', 'wheat', 'whip', 'whisper',

  // Telex trap: words with 'f' (huyền)
  'of', 'if', 'off', 'life', 'safe', 'file', 'find', 'first', 'from', 'form', 'fast', 'fact',
  'face', 'fail', 'fair', 'fall', 'false', 'farm', 'feat', 'feed', 'feel', 'feet', 'fell', 'felt',
  'few', 'fill', 'film', 'fine', 'fire', 'firm', 'fish', 'fit', 'five', 'flat', 'flight', 'floor',
  'flow', 'fly', 'folk', 'food', 'foot', 'force', 'fork', 'free', 'friend', 'front', 'fruit', 'full',
  'fund', 'funny', 'future',

  // Telex trap: words with 'j' (nặng)
  'job', 'join', 'joy', 'jump', 'just', 'judge', 'juice', 'jury', 'jail', 'jar', 'jaw', 'jean',
  'jeep', 'jelly', 'jest', 'jet', 'jewel', 'jig', 'jinx', 'jockey', 'jog', 'joke', 'jolly', 'jolt',
  'journal', 'journey', 'judo', 'jug', 'juggler', 'juggle', 'jumbo', 'jumper', 'junction', 'jungle',
  'junior', 'junk', 'junkie', 'jupiter', 'juror', 'justice', 'justify',

  // Tech, Developer & Common Modern Words
  'api', 'app', 'blog', 'browser', 'bug', 'build', 'chat', 'chrome', 'click', 'client', 'cloud',
  'code', 'commit', 'component', 'config', 'console', 'css', 'data', 'dev', 'developer', 'div',
  'docker', 'dom', 'download', 'edge', 'email', 'export', 'extension', 'facebook',
  'figma', 'firefox', 'font', 'form', 'frontend', 'git', 'github', 'gmail', 'google', 'host',
  'html', 'http', 'https', 'icon', 'id', 'iframe', 'image', 'import', 'input', 'install', 'internet',
  'issue', 'javascript', 'json', 'key', 'link', 'linux', 'load', 'log', 'macos', 'meta', 'modal',
  'module', 'net', 'network', 'node', 'npm', 'offline', 'online', 'open', 'package', 'page',
  'password', 'patch', 'ping', 'plugin', 'post', 'pull', 'push', 'python', 'react', 'repo',
  'request', 'response', 'router', 'run', 'safari', 'save', 'script', 'server', 'service', 'setup',
  'site', 'span', 'sql', 'ssh', 'status', 'style', 'sync', 'tab', 'tag', 'task', 'test',
  'time', 'token', 'tool', 'true', 'false', 'null', 'undefined', 'ui', 'update', 'upload', 'url',
  'user', 'version', 'video', 'view', 'vite', 'vscode', 'webpack', 'website',
  'zip', 'tesla', 'saas', 'sax', 'core', 'care', 'case', 'cost', 'hard',
  'screen', 'system', 'branch', 'merge', 'rebase', 'clone', 'fetch', 'diff', 'stash', 'release',
  'deploy', 'debug', 'lint', 'bundle', 'minify', 'source', 'assets', 'public', 'dist', 'node_modules',
  'license', 'readme', 'env', 'yaml', 'toml', 'xml', 'scss', 'less', 'ts', 'jsx', 'tsx', 'sh',
  'kubernetes', 'k8s', 'tailwind', 'typescript', 'postgres', 'postgresql', 'redis', 'graphql',
  'webhook', 'endpoint', 'devops', 'staging', 'production', 'frontend', 'backend', 'microservice',
  'payload', 'auth', 'oauth', 'middleware', 'handler', 'schema', 'query', 'mutation', 'resolver',
  'prisma', 'supabase', 'nextjs', 'nuxt', 'vue', 'angular', 'svelte', 'electron', 'tauri', 'rust',
  'cargo', 'golang', 'pnpm', 'yarn', 'bun', 'deno', 'eslint', 'prettier', 'vitest', 'jest',
  'modern', 'variable', 'tick', 'backtick', 'reset', 'restore', 'refactor', 'list', 'host',
  'suggest', 'axis', 'regex', 'music', 'amazon', 'cause', 'profile', 'upstream', 'settings',

  // General high frequency English words
  'the', 'be', 'to', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'not', 'on', 'he',
  'you', 'do', 'at', 'but', 'by', 'they', 'say', 'she',
  'an', 'my', 'one', 'all', 'there', 'so', 'up', 'out',
  'about', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'no',
  'him', 'know', 'take', 'people', 'into', 'good', 'some', 'could', 'them',
  'see', 'than', 'then', 'now', 'look', 'only', 'come', 'think', 'also',
  'back', 'use', 'two', 'how', 'even', 'new',
  'because', 'any', 'these', 'give', 'day', 'most', 'city', 'center', 'cell', 'circle',
  'gift', 'game', 'great', 'going', 'gone', 'group', 'guide', 'guest', 'guard', 'guy'
]);

// Common technical and English words to whitelist by default
export const DEFAULT_USER_WORDS = Array.from(COMMON_ENGLISH_WORDS).sort();

/**
 * Phonology Rule 1: c/k check
 * In Vietnamese standard orthography:
 * 'c' is strictly NEVER followed by 'e', 'ê', 'i', 'y'.
 * Any word starting with 'ce', 'cê', 'ci', 'cy' (e.g. center, city, cell, circle, cynic)
 * is foreign/English.
 */
export function hasCkPhonologyViolation(word) {
  if (!word || word.length < 2) return false;
  const clean = word.toLowerCase();
  if (/^c[eèéẻẽẹêếềểễệiíìỉĩịyýỳỷỹỵ]/i.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Phonology Rule 2: g/gh check
 * In Vietnamese standard orthography:
 * 'g' is strictly NEVER followed directly by 'e', 'ê' (must use 'gh': ghe, ghê).
 * Words with 'ge' or 'gê' (e.g. get, genius, gear, gender, agent) are foreign/English.
 */
export function hasGghPhonologyViolation(word) {
  if (!word || word.length < 2) return false;
  const clean = word.toLowerCase();
  if (/(^|[^a-z0-9])g[eèéẻẽẹêếềểễệ]/i.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Phonology Rule 3: ng/ngh check
 * In Vietnamese standard orthography:
 * 'ng' is strictly NEVER followed by 'e', 'ê', 'i' (must use 'ngh': nghe, nghĩ, nghệ).
 * Words with 'nge', 'ngê', 'ngi' (e.g. danger, finger, singer, engine) are foreign.
 */
export function hasNgPhonologyViolation(word) {
  if (!word || word.length < 3) return false;
  const clean = word.toLowerCase();
  if (/(^|[^a-z0-9])ng[eèéẻẽẹêếềểễệiíìỉĩị]/i.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Phonology Rule 4: Checked Tone Stop Finals (-c, -ch, -p, -t)
 * In Vietnamese phonology, syllables ending in stop consonants ('c', 'ch', 'p', 't')
 * can ONLY take Tone 1 (Sắc / Acute) or Tone 5 (Nặng / Dot below).
 * They CANNOT take Tone 2 (Huyền / Grave), Tone 3 (Hỏi / Hook above), or Tone 4 (Ngã / Tilde).
 * E.g., 'bác', 'bạc', 'mát', 'mạt', 'bếp', 'bẹp' are valid.
 * 'bàc', 'bảc', 'bãc', 'thìch', 'bèp' are strictly invalid.
 */
export function isCheckedToneViolation(word, targetTone) {
  if (!word || targetTone === undefined || targetTone === null) return false;
  if (targetTone === 1 || targetTone === 5 || targetTone === 0) {
    return false;
  }

  const clean = word.toLowerCase();
  if (/(c|ch|p|t)$/i.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Master Phonology Rule Checker
 * Combines c/k, g/gh, ng/ngh checks
 */
export function hasPhonologyViolation(word) {
  if (!word) return false;
  return (
    hasCkPhonologyViolation(word) ||
    hasGghPhonologyViolation(word) ||
    hasNgPhonologyViolation(word)
  );
}

/**
 * Map accented Vietnamese vowels back to their unaccented Latin characters
 * and identify tone & diacritic keys in Telex / VNI.
 */
export const ACCENT_TO_RAW_TELEX = {
  // Sắc (s)
  'á': 'as', 'ắ': 'aws', 'ấ': 'aas', 'é': 'es', 'ế': 'ees', 'í': 'is',
  'ó': 'os', 'ố': 'oos', 'ớ': 'ows', 'ú': 'us', 'ứ': 'uws', 'ý': 'ys',
  'Á': 'As', 'Ắ': 'Aws', 'Ấ': 'Aas', 'É': 'Es', 'Ế': 'Ees', 'Í': 'Is',
  'Ó': 'Os', 'Ố': 'Oos', 'Ớ': 'Ows', 'Ú': 'Us', 'Ứ': 'Uws', 'Ý': 'Ys',

  // Huyền (f)
  'à': 'af', 'ằ': 'awf', 'ầ': 'aaf', 'è': 'ef', 'ề': 'eef', 'ì': 'if',
  'ò': 'of', 'ồ': 'oof', 'ờ': 'owf', 'ù': 'uf', 'ừ': 'uwf', 'ỳ': 'yf',
  'À': 'Af', 'Ằ': 'Awf', 'Ầ': 'Aaf', 'È': 'Ef', 'Ề': 'Eef', 'Ì': 'If',
  'Ò': 'Of', 'Ồ': 'Oof', 'Ờ': 'Owf', 'Ù': 'Uf', 'Ừ': 'Uwf', 'Ỳ': 'Yf',

  // Hỏi (r)
  'ả': 'ar', 'ẳ': 'awr', 'ẩ': 'aar', 'ẻ': 'er', 'ể': 'eer', 'ỉ': 'ir',
  'ỏ': 'or', 'ổ': 'oor', 'ở': 'owr', 'ủ': 'ur', 'ử': 'uwr', 'ỷ': 'yr',
  'Ả': 'Ar', 'Ẳ': 'Awr', 'Ẩ': 'Aar', 'Ẻ': 'Er', 'Ể': 'Eer', 'Ỉ': 'Ir',
  'Ỏ': 'Or', 'Ổ': 'Oor', 'Ở': 'Owr', 'Ủ': 'Ur', 'Ử': 'Uwr', 'Ỷ': 'Yr',

  // Ngã (x)
  'ã': 'ax', 'ẵ': 'awx', 'ẫ': 'aax', 'ẽ': 'ex', 'ễ': 'eex', 'ĩ': 'ix',
  'õ': 'ox', 'ỗ': 'oox', 'ỡ': 'owx', 'ũ': 'ux', 'ữ': 'uwx', 'ỹ': 'yx',
  'Ã': 'Ax', 'Ẵ': 'Awx', 'Ẫ': 'Aax', 'Ẽ': 'Ex', 'Ễ': 'Eex', 'Ĩ': 'Ix',
  'Õ': 'Ox', 'Ỗ': 'Oox', 'Ỡ': 'Owx', 'Ũ': 'Ux', 'Ữ': 'Uwx', 'Ỹ': 'Yx',

  // Nặng (j)
  'ạ': 'aj', 'ặ': 'awj', 'ậ': 'aaj', 'ẹ': 'ej', 'ệ': 'eej', 'ị': 'ij',
  'ọ': 'oj', 'ộ': 'ooj', 'ợ': 'owj', 'ụ': 'uj', 'ự': 'uwj', 'ỵ': 'yj',
  'Ạ': 'Aj', 'Ặ': 'Awj', 'Ậ': 'Aaj', 'Ẹ': 'Ej', 'Ệ': 'Eej', 'Ị': 'Ij',
  'Ọ': 'Oj', 'Ộ': 'Ooj', 'Ợ': 'Owj', 'Ụ': 'Uj', 'Ự': 'Uwj', 'Ỵ': 'Yj',

  // Shapes without tone
  'â': 'aa', 'Â': 'Aa', 'ă': 'aw', 'Ă': 'Aw',
  'ê': 'ee', 'Ê': 'Ee',
  'ô': 'oo', 'Ô': 'Oo', 'ơ': 'ow', 'Ơ': 'Ow',
  'ư': 'uw', 'Ư': 'Uw',
  'đ': 'dd', 'Đ': 'Dd'
};

/**
 * Reverse a Vietnamese accented word to its raw typing sequence (Telex / VNI)
 * E.g., 'têt' -> 'text', 'úẻ' -> 'user', 'púh' -> 'push', 'lủuy' -> 'luxury',
 * 'ưork' -> 'work', 'ưindoư' -> 'window', 'đ' -> 'dd'
 */
export function reverseVietnameseWord(word) {
  if (!word) return '';

  const clean = word.toLowerCase();
  const DIRECT_REVERSE_TRAPS = {
    'aets': 'assets',
    'amo': 'armor',
    'ađress': 'address',
    'brơser': 'browser',
    'buines': 'business',
    'caúe': 'cause',
    'cháo': 'chaos',
    'chỏus': 'chorus',
    'càe': 'care',
    'cáe': 'case',
    'còe': 'core',
    'cònig': 'config',
    'cúor': 'cursor',
    'cảe': 'care',
    'cảgo': 'cargo',
    'cỏe': 'core',
    'cỏpus': 'corpus',
    'cỏtex': 'cortex',
    'dít': 'dist',
    'dóc': 'docs',
    'dônlad': 'download',
    'eãm': 'exam',
    'eãmple': 'example',
    'facebôk': 'facebook',
    'flôr': 'floor',
    'flơ': 'flow',
    'frê': 'free',
    'fêd': 'feed',
    'fêl': 'feel',
    'fêt': 'feet',
    'fôd': 'food',
    'fôt': 'foot',
    'gìt': 'gift',
    'gôd': 'good',
    'gôgle': 'google',
    'habo': 'harbor',
    'hảd': 'hard',
    'iue': 'issue',
    'iảme': 'iframe',
    'jêp': 'jeep',
    'jă': 'jaw',
    'knơ': 'know',
    'lìe': 'life',
    'lít': 'list',
    'lôk': 'look',
    'lũury': 'luxury',
    'lủuy': 'luxury',
    'mior': 'mirror',
    'miđleware': 'middleware',
    'modẻn': 'modern',
    'máter': 'master',
    'mãimum': 'maximum',
    'múic': 'music',
    'mẻge': 'merge',
    'ode': 'order',
    'oline': 'offline',
    'púh': 'push',
    'păssord': 'password',
    'pơer': 'power',
    'pẻpct': 'perfect',
    'quẻy': 'query',
    'repone': 'response',
    'rèactor': 'refactor',
    'rèlex': 'reflex',
    'réolver': 'resolver',
    'rétore': 'restore',
    'rết': 'reset',
    'scrên': 'screen',
    'seve': 'server',
    'seỉes': 'series',
    'suix': 'suffix',
    'sà': 'saas',
    'sàe': 'safe',
    'sâs': 'saas',
    'sã': 'sax',
    'sầri': 'safari',
    'sẻach': 'search',
    'sẻvice': 'service',
    'ták': 'task',
    'téla': 'tesla',
    'tét': 'test',
    'têt': 'text',
    'tôl': 'tool',
    'tăilind': 'tailwind',
    'tưo': 'two',
    'tẻla': 'tesla',
    'tẽas': 'texas',
    'tẽt': 'text',
    'uér': 'user',
    'uétate': 'usestate',
    'vaỉable': 'variable',
    'vảiable': 'variable',
    'veu': 'versus',
    'veíon': 'version',
    'vẻtex': 'vertex',
    'webhôk': 'webhook',
    'whêl': 'wheel',
    'windơ': 'window',
    'windơs': 'windows',
    'wêk': 'week',
    'wôd': 'wood',
    'wôl': 'wool',
    'àter': 'after',
    'ái': 'axis',
    'âlys': 'always',
    'âmzon': 'amazon',
    'élint': 'eslint',
    'êpct': 'expect',
    'íntall': 'install',
    'õide': 'oxide',
    'õygen': 'oxygen',
    'úe': 'use',
    'úer': 'user',
    'úptream': 'upstream',
    'úẻ': 'user',
    'ưindoư': 'window',
    'ưork': 'work',
    'ậx': 'ajax',
    'ẽact': 'exact',
    'ẽcept': 'except',
    'ẽcess': 'excess',
    'ẽchange': 'exchange',
    'ẽcite': 'excite',
    'ẽclude': 'exclude',
    'ẽcuse': 'excuse',
    'ẽcêd': 'exceed',
    'ẽist': 'exist',
    'ẽit': 'exit',
    'ẽpand': 'expand',
    'ẽpect': 'expect',
    'ẽpend': 'expend',
    'ẽpense': 'expense',
    'ẽpert': 'expert',
    'ẽpire': 'expire',
    'ẽplain': 'explain',
    'ẽplore': 'explore',
    'ẽport': 'export',
    'ẽpress': 'express',
    'ẽtension': 'extension',
    'ẽtent': 'extent',
    'ẽtra': 'extra',
    'ẽtreme': 'extreme',
    'ểcise': 'exercise',
    'ễcute': 'execute',
    'ủl': 'url',
  };

  if (DIRECT_REVERSE_TRAPS[clean]) {
    const mapped = DIRECT_REVERSE_TRAPS[clean];
    if (word[0] === word[0].toUpperCase()) {
      return mapped.charAt(0).toUpperCase() + mapped.slice(1);
    }
    return mapped;
  }

  let result = '';
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (ACCENT_TO_RAW_TELEX[ch]) {
      result += ACCENT_TO_RAW_TELEX[ch];
    } else {
      result += ch;
    }
  }

  return result;
}

// High-frequency multi-letter English words that cause Telex collisions (trap words)
export const ENGLISH_TELEX_TRAPS = new Set([
  'text', 'next', 'context', 'exit', 'user', 'super', 'server', 'router', 'player',
  'master', 'worker', 'filter', 'center', 'letter', 'matter', 'better', 'doctor',
  'factor', 'sector', 'vector', 'error', 'horror', 'mirror', 'sensor', 'cursor',
  'push', 'expect', 'luxury', 'window', 'windows', 'work', 'word', 'world',
  'tesla', 'screen', 'saas', 'ajax', 'duplex', 'complex', 'index', 'matrix',
  'syntax', 'prefix', 'suffix', 'annex', 'latex', 'reflex', 'pixel', 'toxic',
  'oxide', 'oxygen', 'galaxy', 'expert', 'express', 'explain', 'explore', 'export',
  'extra', 'extreme', 'exact', 'exam', 'example', 'exist', 'execute', 'exercise',
  'except', 'excess', 'exchange', 'expand', 'expense', 'perfect', 'docs', 'modern', 'variable', 'backtick'
]);

/**
 * Determine if a word should be automatically restored to English
 * (e.g. When the user types 'text', 'user', 'expect', 'push', 'window', 'luxury'
 * and the IME produced 'têt', 'úẻ', 'púh', etc.).
 */
export function shouldAutoRestoreEnglish(rawWord, currentWord) {
  if (!rawWord && !currentWord) return false;

  const rawClean = (rawWord || '').trim().toLowerCase();
  const curClean = (currentWord || '').trim().toLowerCase();

  // If words are identical and strictly ASCII, no restore needed
  if (rawClean === curClean && /^[a-z0-9]+$/i.test(curClean)) {
    return false;
  }

  // Rule 1: Reject any sequence containing digits (0-9)
  // Keystrokes with digits (e.g. a1, u1, o2, cuu71, duoc975) are VNI diacritic sequences
  // or numeric input. English words NEVER contain digits!
  if (/\d/.test(rawClean)) {
    return false;
  }

  // Rule 2: Single-letter vowels or very short words (< 3 chars)
  // Single-letter vowels (á, ú, í, ò, ỏ, ì, etc.) and raw inputs < 3 characters
  // must NEVER be auto-restored. Two-letter words (as, us, is, of, or, if) collide with
  // standard Telex single vowel + tone keystrokes.
  if (curClean.length <= 1 || rawClean.length < 3) {
    return false;
  }

  // Rule 3: Valid Vietnamese syllables protection
  // If currentWord is a valid Vietnamese syllable (e.g. cá, má, bú, sĩ, sẽ, mã, thí, cót, hót, nơ, hơ, toán, nước, được):
  // Preserve it! Auto-restore should NEVER overwrite valid Vietnamese words,
  // UNLESS rawClean is an explicit known multi-letter English Telex trap.
  const vnSet = getVietnameseWordSet();
  if (vnSet.has(curClean)) {
    if (rawClean && ENGLISH_TELEX_TRAPS.has(rawClean)) {
      return true;
    }
    return false;
  }

  // Rule 4: Transformed word is NOT a valid Vietnamese word (e.g. têt, tẽt, úẻ, ủe, púh, windơ, wỏk, êpct, lủuy)
  // If rawWord is a known English word:
  if (rawClean && COMMON_ENGLISH_WORDS.has(rawClean)) {
    return true;
  }

  // Or if reversed version is a known English word (min length 3, no digits):
  const reversed = reverseVietnameseWord(currentWord).toLowerCase();
  if (reversed && reversed.length >= 3 && COMMON_ENGLISH_WORDS.has(reversed) && !/\d/.test(reversed)) {
    return true;
  }

  return false;
}

/**
 * Check if a word begins with a non-Vietnamese consonant blend
 * e.g. 'pl' in 'plugin', 'fl' in 'flag', 'bl' in 'blog', 'pr' in 'program'
 */
export function hasForeignOnset(word) {
  if (!word || word.length < 2) return false;
  const clean = word.toLowerCase();

  // Check 3-letter clusters first (str, spl, spr, scr, sch)
  if (clean.length >= 3) {
    const c3 = clean.slice(0, 3);
    if (FOREIGN_INITIAL_CLUSTERS.has(c3)) return true;
  }

  // Check 2-letter clusters (pl, fl, cl, gl, bl, pr, dr, cr, br, gr, fr, sp, st, sk, etc.)
  const c2 = clean.slice(0, 2);
  if (FOREIGN_INITIAL_CLUSTERS.has(c2)) return true;

  return false;
}

/**
 * Check if a word contains obvious English/foreign patterns
 */
export function isForeignWord(word) {
  if (!word) return false;
  const clean = word.toLowerCase();

  // Foreign onset
  if (hasForeignOnset(clean)) return true;

  // Phonology violations (c/k, g/gh, ng/ngh)
  if (hasPhonologyViolation(clean)) return true;

  // Foreign characters inside word (z, w, j, f in non-standard positions)
  if (/[wjfz]/.test(clean)) {
    // In Vietnamese, 'gi' or 'qu' or initial 'ph' might have appeared, but standalone w, j, z in word body is foreign
    if (clean.includes('w') && !clean.includes('qu') && !/^[uưaăoơ]/.test(clean)) return true;
    if (clean.includes('j') && !clean.startsWith('gi')) return true;
    if (clean.includes('f') && !clean.startsWith('ph')) return true;
    if (clean.includes('z') && !clean.startsWith('dz')) return true;
  }

  // Double consonants (English words like 'plugin', 'hello', 'class', 'error', 'apple')
  if (/([b-df-np-tv-z])\1/i.test(clean) && !clean.includes('dd') && !clean.includes('đ')) {
    return true;
  }

  return false;
}

/**
 * Personal / User Dictionary Manager
 * Allows users to add custom words, whitelist English terms, import/export.
 */
export class UserDictionary {
  constructor(initialWords = DEFAULT_USER_WORDS) {
    this.words = new Set();
    this.loadWords(initialWords);
  }

  loadWords(wordsList) {
    if (Array.isArray(wordsList)) {
      wordsList.forEach(w => {
        const clean = canon(w);
        if (clean) this.words.add(clean);
      });
    }
  }

  has(word) {
    if (!word) return false;
    return this.words.has(canon(word));
  }

  add(word) {
    const clean = canon(word);
    if (!clean) return false;
    this.words.add(clean);
    this.saveToStorage();
    return true;
  }

  remove(word) {
    const clean = canon(word);
    if (!clean) return false;
    const deleted = this.words.delete(clean);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  clear() {
    this.words.clear();
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
    if (!text || typeof text !== 'string') return 0;
    let addedCount = 0;
    const raw = text.trim();

    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : Object.keys(parsed);
        list.forEach(w => {
          if (this.add(String(w))) addedCount++;
        });
        return addedCount;
      } catch {
        // Fall back to line by line
      }
    }

    const lines = raw.split(/[\r\n,;]+/);
    lines.forEach(l => {
      const w = l.trim().toLowerCase();
      if (w && !this.words.has(w)) {
        this.words.add(w);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.saveToStorage();
    }
    return addedCount;
  }

  /**
   * Export to plain text or JSON
   */
  exportText(format = 'txt') {
    const list = this.getWords();
    if (format === 'json') {
      return JSON.stringify(list, null, 2);
    }
    return list.join('\n');
  }

  /**
   * Persistence with chrome.storage.sync or localStorage
   */
  async saveToStorage() {
    const list = this.getWords();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('avim_user_dictionary', JSON.stringify(list));
      }
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({ avim_user_dictionary: list });
      }
    } catch (err) {
      console.warn('Could not save user dictionary:', err);
    }
  }

  async loadFromStorage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const res = await chrome.storage.sync.get(['avim_user_dictionary']);
        if (Array.isArray(res.avim_user_dictionary) && res.avim_user_dictionary.length > 0) {
          this.loadWords(res.avim_user_dictionary);
          return;
        }
      }
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('avim_user_dictionary');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            this.loadWords(list);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load user dictionary:', err);
    }
  }
}

// Global user dictionary singleton
export const userDictionary = new UserDictionary();

/**
 * Master Spell Checker Validator:
 * 1. Checks User Dictionary (highest priority whitelist)
 * 2. Checks Built-in Hunspell Vietnamese syllables (~6,700 words)
 * 3. Checks standard Vietnamese abbreviations (ĐN, HĐ, TP, UBND, etc.)
 */
export function checkWordSpelling(word) {
  if (!word) return true;
  const clean = canon(word.trim());

  // 1. User dictionary whitelist
  if (userDictionary.has(clean)) {
    return true;
  }

  // 2. All-caps Vietnamese abbreviations (e.g. ĐN, HĐ, PGĐ, TP, UBND, ĐHQG)
  if (word.length >= 2 && word === word.toUpperCase() && /[Đđ]/.test(word)) {
    return true;
  }

  // 3. Built-in Vietnamese Syllables Dictionary
  const vnSet = getVietnameseWordSet();
  if (vnSet.has(clean)) {
    return true;
  }

  // 4. If word is simple ASCII without Vietnamese marks (e.g. test, fast, chat, ok, hello)
  if (/^[a-z0-9']+$/i.test(clean)) {
    return true;
  }

  return false;
}
