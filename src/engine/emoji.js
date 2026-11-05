/**
 * Smart Emoji Shorthand Engine
 * Supports Vietnamese and English slack-style emoji triggers (:tim: -> ❤️, :cuoi: -> 😄)
 *
 * @license Apache-2.0
 */

export const EMOJI_MAP = {
  // Biểu cảm khuôn mặt / Feelings
  'tim': '❤️',
  'heart': '❤️',
  'traitim': '❤️',
  'yeu': '❤️',
  'cuoi': '😄',
  'smile': '😄',
  'happy': '😊',
  'matcuoi': '😊',
  'haha': '😆',
  'lol': '😂',
  'roinuocmat': '😂',
  'kaka': '🤣',
  'buon': '😢',
  'sad': '😢',
  'khoc': '😭',
  'cry': '😭',
  'ngau': '😎',
  'cool': '😎',
  'kinhram': '😎',
  'hon': '😘',
  'kiss': '😘',
  'yeuthuong': '🥰',
  'suynghi': '🤔',
  'think': '🤔',
  'ngaunhien': '🤯',
  'wow': '😮',
  'tucgian': '😡',
  'angry': '😡',
  'ngu': '😴',
  'sleep': '😴',
  'nhaymat': '😉',
  'wink': '😉',

  // Cử chỉ tay / Gestures
  'like': '👍',
  '1': '👍',
  'thich': '👍',
  'up': '👍',
  'dislike': '👎',
  'che': '👎',
  'down': '👎',
  'ok': '👌',
  'tot': '👌',
  'votay': '👏',
  'clap': '👏',
  'cau': '🙏',
  'pray': '🙏',
  'xin': '🙏',
  'camon': '🙏',
  'vui': '✌️',
  'peace': '✌️',
  'namdam': '👊',
  'fist': '👊',
  'chao': '👋',
  'wave': '👋',
  'co': '💪',
  'strong': '💪',
  'chiton': '👉',
  'point': '👉',

  // Biểu tượng & Đồ vật / Symbols & Objects
  'lua': '🔥',
  'fire': '🔥',
  'hot': '🔥',
  'sao': '⭐',
  'star': '⭐',
  '100': '💯',
  'diem100': '💯',
  'check': '✅',
  'tich': '✅',
  'done': '✅',
  'x': '❌',
  'cross': '❌',
  'sai': '❌',
  'party': '🎉',
  'tiec': '🎉',
  'chucmung': '🎉',
  'mattrang': '🌙',
  'moon': '🌙',
  'mattroi': '☀️',
  'sun': '☀️',
  'set': '⚡',
  'flash': '⚡',
  'quatang': '🎁',
  'gift': '🎁',
  'tien': '💵',
  'money': '💵',
  'bongda': '⚽',
  'football': '⚽',
  'caidat': '⚙️',
  'gear': '⚙️',
  'khoa': '🔒',
  'lock': '🔒',
  'chuong': '🔔',
  'bell': '🔔',
  'canhbao': '⚠️',
  'warning': '⚠️',
  'coffee': '☕',
  'cafe': '☕',
  'bia': '🍺',
  'beer': '🍺',
  'vietnam': '🇻🇳',
  'vn': '🇻🇳',
  'covietnam': '🇻🇳'
};

/**
 * Check if a word is an emoji shortcut (e.g. ':tim:', ':heart:', ':like:')
 * @param {string} token Word token
 * @returns {{ match: boolean, emoji?: string, code?: string }}
 */
export function checkEmojiShortcut(token) {
  if (!token || typeof token !== 'string') return { match: false };
  const clean = token.trim();
  if (clean.length >= 3 && clean.startsWith(':') && clean.endsWith(':')) {
    const code = clean.slice(1, -1).toLowerCase();
    if (EMOJI_MAP[code]) {
      return { match: true, emoji: EMOJI_MAP[code], code };
    }
  }
  return { match: false };
}

/**
 * Find matching emoji suggestions for prefix query (e.g. query ':ti' -> [':tim: ❤️', ':tiec: 🎉'])
 * @param {string} query
 * @param {number} limit
 * @returns {Array<{ word: string, displayType: string, type: string, emoji: string }>}
 */
export function getEmojiSuggestions(query, limit = 4) {
  if (!query || !query.startsWith(':')) return [];
  const prefix = query.slice(1).toLowerCase();
  const results = [];
  const seenEmojis = new Set();

  for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
    if (seenEmojis.has(emoji)) continue;
    if (code.startsWith(prefix) || prefix.length === 0) {
      results.push({
        word: emoji,
        code: `:${code}:`,
        displayType: `:${code}:`,
        type: 'emoji',
        emoji
      });
      seenEmojis.add(emoji);
      if (results.length >= limit) break;
    }
  }

  return results;
}
