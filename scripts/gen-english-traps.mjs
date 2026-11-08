/**
 * scripts/gen-english-traps.mjs
 *
 * Automated generator for English Telex/VNI collision traps.
 * Simulates typing English technical and high-frequency vocabulary through AvimEngine
 * to capture exact transformed keystroke collisions without guesswork.
 *
 * Distinguishes:
 * 1. Safe traps: Transformed words that are NOT valid Vietnamese words (e.g. 'tẽt' -> 'text', 'ẽit' -> 'exit')
 * 2. Collision traps: Transformed words that collide with real Vietnamese words (e.g. 'dóc' -> 'docs', 'cháo' -> 'chaos')
 */

import { AvimEngine } from '../src/engine/avim.js';
import { IME_METHOD } from '../src/engine/key-codes.js';
import { COMMON_ENGLISH_WORDS } from '../src/engine/dictionary.js';
import { getVietnameseWordSet } from '../src/engine/vietnamese-words.js';

export function generateTraps() {
  const engine = new AvimEngine({ method: IME_METHOD.TELEX, spellCheck: true });
  const vnSet = getVietnameseWordSet();

  function simulateTyping(word) {
    let text = '';
    for (const ch of word) {
      const res = engine.processKey(text, ch);
      text = res.transformed ? res.result : text + ch;
    }
    return text;
  }

  const directTraps = {};
  const vnCollisions = {};

  for (const engWord of COMMON_ENGLISH_WORDS) {
    // Skip 2-letter collisions (as, is, us, or) as they collide with single-letter vowels + tones
    if (engWord.length < 3) continue;

    const transformed = simulateTyping(engWord);
    if (transformed !== engWord) {
      const lowerTrans = transformed.toLowerCase();
      const isRealVn = vnSet.has(lowerTrans);

      if (isRealVn) {
        vnCollisions[transformed] = engWord;
      } else {
        directTraps[transformed] = engWord;
      }
    }
  }

  return { directTraps, vnCollisions };
}

// When run directly as CLI script
if (import.meta.url === `file://${process.argv[1]}`) {
  const { directTraps, vnCollisions } = generateTraps();

  console.log(`\n=== DIRECT REVERSE TRAPS (${Object.keys(directTraps).length} entries) ===`);
  console.log(JSON.stringify(directTraps, null, 2));

  console.log(`\n=== VIETNAMESE WORD COLLISIONS (${Object.keys(vnCollisions).length} entries) ===`);
  console.log(JSON.stringify(vnCollisions, null, 2));
}
