/**
 * OpenViet IME - End-to-End (E2E) Rich Editors & Workspaces Integration Test
 * 
 * Verifies real-world browser typing in modern complex rich editors:
 * 1. TipTap / ProseMirror:
 *    - Structure: .tiptap.ProseMirror[contenteditable="true"] with inner <p> elements
 *    - Event pipeline: beforeinput ('insertReplacementText' with targetRanges), execCommand, selection inside text nodes
 * 2. Microsoft Teams Web (RoosterJS / CKEditor architecture):
 *    - Detectors: [data-tid="ckeditor"], [data-tid="message-pane-input"], .rooster-editor
 *    - Event pipeline: ClipboardEvent('paste') with DataTransfer text/plain payload
 * 3. Lexical / Slate & Generic ContentEditable:
 *    - Handling multiple paragraphs, dynamic shifting, tone cancellation
 * 4. Micro-keystroke high speed typing (5ms delay) & context error logging
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const EXTENSION_PATH = path.resolve('.');
const ERROR_LOG_PATH = path.join(process.cwd(), 'ime-rich-editors-context-logs.json');

// Core typing sequences for rich text verification
const TEST_CASES = [
  {
    name: 'Vietnamese tone placement (Telex): toans -> toán',
    input: 'toans ',
    expected: 'toán'
  },
  {
    name: 'Dynamic tone shifting: toas + n -> toán',
    input: 'toasn ',
    expected: 'toán'
  },
  {
    name: 'Auto-restore English Telex trap word: user (úer -> user on Space)',
    input: 'user ',
    expected: 'user'
  },
  {
    name: 'Auto-restore English Telex trap word: text (têt -> text on Space)',
    input: 'text ',
    expected: 'text'
  },
  {
    name: 'French double-o loanword: xooong -> xoong',
    input: 'xooong ',
    expected: 'xoong'
  },
  {
    name: 'Tone cancellation on duplicate modifier: docs (dóc + s -> docs)',
    input: 'docs ',
    expected: 'docs'
  },
  {
    name: 'Horn & Breve modifier: dduowcj -> được',
    input: 'dduowcj ',
    expected: 'được'
  },
  {
    name: 'Mixed developer token: useState (camelCase)',
    input: 'useState ',
    expected: 'useState'
  }
];

async function runRichEditorsE2ETest() {
  console.log('🚀 Starting OpenViet IME Playwright Rich Editors (TipTap & Teams Web) E2E Test Suite...\n');
  console.log(`📦 Extension Path: ${EXTENSION_PATH}`);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openviet-editors-playwright-'));
  const errorLogs = [];

  let browser;
  let context;
  let isHeadful = false;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu'
      ]
    });
    isHeadful = true;
    console.log('🖥️ Running in Headful mode with Extension Context.');
  } catch {
    console.log('🤖 Running in Headless mode (injecting content.bundle.js directly).');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    context = await browser.newContext();
  }

  const page = await context.newPage();

  // Monitor Backspace / ESC context triggers
  let currentKeySequence = [];
  await page.exposeFunction('trackKeyEvent', (key) => {
    currentKeySequence.push(key);
  });

  // Setup HTML containing both TipTap / ProseMirror and Microsoft Teams Web editor architectures
  await page.setContent(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>OpenViet IME - Rich Editors E2E Testbed</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    h2 { margin-top: 0; color: #38bdf8; }
    .editor-box {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      min-height: 80px;
      font-size: 16px;
      outline: none;
    }
    .editor-box:focus { border-color: #38bdf8; }
    .label { font-weight: bold; margin-bottom: 8px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <h2>OpenViet IME Rich Editors E2E Simulation</h2>

  <!-- 1. TipTap / ProseMirror container -->
  <div class="label">1. TipTap / ProseMirror Editor (.tiptap.ProseMirror with inner &lt;p&gt;)</div>
  <div id="tiptap-editor" class="editor-box tiptap ProseMirror" contenteditable="true" translate="no">
    <p><br></p>
  </div>

  <!-- 2. Microsoft Teams Web (RoosterJS / CKEditor mock with paste handler) -->
  <div class="label">2. Microsoft Teams Web Editor ([data-tid="ckeditor"] .rooster-editor)</div>
  <div id="teams-editor-container" data-tid="message-pane-input">
    <div id="teams-editor" data-tid="ckeditor" class="editor-box rooster-editor" contenteditable="true" role="textbox">
      <p><br></p>
    </div>
  </div>

  <!-- 3. Lexical / Modern Rich Editor Container -->
  <div class="label">3. Lexical Editor ([data-lexical-editor="true"])</div>
  <div id="lexical-editor" class="editor-box" data-lexical-editor="true" contenteditable="true">
    <p dir="ltr"><br></p>
  </div>
</body>
</html>`);

  // Emulate Microsoft Teams Web paste handling (RoosterJS Content Model update via ClipboardEvent)
  await page.evaluate(() => {
    const teamsEditor = document.getElementById('teams-editor');
    teamsEditor.addEventListener('paste', (e) => {
      e.preventDefault(); // Teams cancels native paste and updates its internal model
      const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
    });

    // Also emulate TipTap/ProseMirror handling beforeinput
    const tiptapEditor = document.getElementById('tiptap-editor');
    tiptapEditor.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'insertReplacementText') {
        const ranges = e.getTargetRanges ? e.getTargetRanges() : [];
        if (ranges && ranges.length > 0) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(ranges[0]);
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        window.trackKeyEvent(e.key);
      }
    });
  });

  // Inject content script if headless
  if (!isHeadful) {
    await page.addScriptTag({ path: path.join(EXTENSION_PATH, 'src/content/content.bundle.js') });
  }

  await page.waitForTimeout(300);

  const targets = [
    {
      name: 'TipTap / ProseMirror',
      selector: '#tiptap-editor',
      prepare: async (locator) => {
        await locator.evaluate((node) => {
          node.innerHTML = '<p></p>';
          const p = node.querySelector('p');
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      }
    },
    {
      name: 'Microsoft Teams Web (RoosterJS)',
      selector: '#teams-editor',
      prepare: async (locator) => {
        await locator.evaluate((node) => {
          node.innerHTML = '<p></p>';
          const p = node.querySelector('p');
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      }
    },
    {
      name: 'Lexical Rich Editor',
      selector: '#lexical-editor',
      prepare: async (locator) => {
        await locator.evaluate((node) => {
          node.innerHTML = '<p dir="ltr"></p>';
          const p = node.querySelector('p');
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      }
    }
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const target of targets) {
    console.log(`\n======================================================`);
    console.log(`📝 Testing Editor Platform: ${target.name}`);
    console.log(`======================================================`);

    const editorLocator = page.locator(target.selector);
    await editorLocator.click();

    for (const tc of TEST_CASES) {
      currentKeySequence = [];

      // Clean & set initial caret inside editor paragraph
      await target.prepare(editorLocator);
      await editorLocator.click();

      // High speed typing simulation (delay: 5ms)
      await page.keyboard.type(tc.input, { delay: 5 });

      // Wait for IME replacement loop
      await page.waitForTimeout(60);

      const actualText = (await editorLocator.innerText()).trim();
      const isMatched = actualText.toLowerCase().includes(tc.expected.toLowerCase());
      const hasContextAnomaly = currentKeySequence.includes('Backspace') || currentKeySequence.includes('Escape');

      if (!isMatched || hasContextAnomaly) {
        errorLogs.push({
          editor: target.name,
          input: tc.input,
          expected: tc.expected,
          actual: actualText,
          keys: [...currentKeySequence],
          timestamp: new Date().toISOString()
        });
      }

      if (isMatched) {
        console.log(`  ✅ [${target.name}] PASS: "${tc.input.trim()}" -> "${actualText}" (Expected: "${tc.expected}")`);
        totalPassed++;
      } else {
        console.error(`  ❌ [${target.name}] FAIL: "${tc.input.trim()}" -> "${actualText}" (Expected: "${tc.expected}")`);
        totalFailed++;
      }
    }
  }

  // Write error context log if any failures were tracked
  if (errorLogs.length > 0) {
    fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify(errorLogs, null, 2), 'utf-8');
    console.log(`\n⚠️ Recorded ${errorLogs.length} context errors to ${ERROR_LOG_PATH}`);
  }

  // Cleanup
  await context.close();
  if (browser) await browser.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n======================================================`);
  console.log(`🏁 Summary: ${totalPassed} passed, ${totalFailed} failed.`);
  console.log(`======================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

// Direct execution
if (process.argv[1] && process.argv[1].endsWith('playwright-rich-editors.test.js')) {
  runRichEditorsE2ETest().catch((err) => {
    console.error('💥 Rich Editors E2E Fatal Error:', err);
    process.exit(1);
  });
}

export { runRichEditorsE2ETest };
