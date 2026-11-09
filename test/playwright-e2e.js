/**
 * OpenViet IME - End-to-End (E2E) Browser Integration Test with Playwright
 * 
 * Verifies real-world browser typing, unpacked extension loading via Persistent Context,
 * high-speed keystroke simulation (delay: 5ms), rich text editor compatibility,
 * and context error tracking (logging unexpected Backspace/ESC to ime-error-context-logs.json).
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const EXTENSION_PATH = path.resolve('.');
const ERROR_LOG_PATH = path.join(process.cwd(), 'ime-error-context-logs.json');

// HTML Test Fixture simulating Web Editors (Google Docs, Slack Web, Telegram Web, Monaco)
const FIXTURE_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>OpenViet IME E2E Playground</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; }
    .box { margin-bottom: 20px; }
    label { display: block; font-weight: 600; margin-bottom: 6px; }
    input, textarea, .editor {
      width: 100%; max-width: 600px; padding: 12px; font-size: 16px;
      border: 1px solid #334155; border-radius: 8px; background: #1e293b; color: #fff;
      outline: none; box-sizing: border-box;
    }
    .editor { min-height: 80px; white-space: pre-wrap; }
    .editor:focus, input:focus, textarea:focus { border-color: #38bdf8; }
  </style>
</head>
<body>
  <h1>OpenViet IME - Automated E2E Verification Harness</h1>

  <div class="box">
    <label for="nativeInput">1. Native Input (Search bars, Telegram simple input):</label>
    <input type="text" id="nativeInput" placeholder="Gõ thử nghiệm tại đây..." />
  </div>

  <div class="box">
    <label for="nativeTextarea">2. Native Textarea (Forms, GitHub comments):</label>
    <textarea id="nativeTextarea" rows="3" placeholder="Gõ đoạn văn tại đây..."></textarea>
  </div>

  <div class="box">
    <label for="editor">3. ContentEditable (Slack Web, Google Docs, ProseMirror, Notion):</label>
    <div id="editor" class="editor" contenteditable="true" role="textbox" aria-multiline="true"></div>
  </div>
</body>
</html>`;

// Danh sách các chuỗi thử nghiệm (Edge Cases Telex / Tiếng Anh kỹ thuật / Từ bẫy / vnchKey)
const HARDCORE_TEST_CASES = [
  {
    name: 'Auto-restore Telex trap: text (têt -> text on Space)',
    input: 'text',
    expected: 'text'
  },
  {
    name: 'Auto-restore Telex trap: user (úer -> user on Space)',
    input: 'user',
    expected: 'user'
  },
  {
    name: 'Auto-restore Telex trap: luxury (lủuy -> luxury on Space)',
    input: 'luxury',
    expected: 'luxury'
  },
  {
    name: 'Mixed-case preservation: lUxUrY',
    input: 'lUxUrY',
    expected: 'lUxUrY'
  },
  {
    name: 'Vietnamese Telex tone: cas -> cá',
    input: 'cas',
    expected: 'cá'
  },
  {
    name: 'Vietnamese Telex tone: toans -> toán',
    input: 'toans',
    expected: 'toán'
  },
  {
    name: 'Developer camelCase: useState',
    input: 'useState',
    expected: 'useState'
  },
  {
    name: 'vnchKey rapid 2nd tone restore: docs',
    input: 'docs',
    expected: 'docs'
  }
];

async function runE2ETestSuite() {
  console.log('🚀 Starting OpenViet IME Playwright E2E Integration Test Suite...');
  console.log(`📦 Unpacked Extension Path: ${EXTENSION_PATH}`);

  const tmpFixturePath = path.join(os.tmpdir(), 'openviet-e2e-fixture.html');
  fs.writeFileSync(tmpFixturePath, FIXTURE_HTML, 'utf8');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openviet-playwright-'));
  const errorLogs = [];

  let context;
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });
  } catch (err) {
    console.warn('⚠️ Headful launch failed (no X11 DISPLAY in environment). Launching in headless mode...');
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: 'new',
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });
  }

  const page = await context.newPage();

  // Monitor keydown events globally in page to catch any Backspace/Escape triggers
  let currentKeySequence = [];
  await page.exposeFunction('trackKeyEvent', (key) => {
    currentKeySequence.push(key);
  });

  // Load the test fixture via file:// protocol so content scripts inject safely
  await page.goto(`file://${tmpFixturePath}`);
  await page.waitForLoadState('domcontentloaded');

  // Inject real-time key logger into browser window
  await page.evaluate(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        window.trackKeyEvent(e.key);
      }
    });
  });

  // Allow extension content script initialization
  await page.waitForTimeout(600);

  const editorLocator = page.locator('#editor');
  await editorLocator.click();

  let passed = 0;
  let failed = 0;

  for (const tc of HARDCORE_TEST_CASES) {
    console.log(`\n⏳ Running: [${tc.name}]`);
    currentKeySequence = [];

    // Clear editor content before each test case
    await editorLocator.evaluate(node => { node.innerHTML = ''; });
    await editorLocator.click();

    // 1. High-speed typing simulation with micro-delay (5ms)
    await page.keyboard.type(tc.input, { delay: 5 });

    // 2. Press Space to trigger word completion & auto-restore
    await page.keyboard.press('Space', { delay: 5 });

    // Allow IME micro-task to settle
    await page.waitForTimeout(100);

    // 3. Read back innerText
    const actualText = (await editorLocator.innerText()).trim();

    // Check if Backspace or ESC occurred unexpectedly
    const hasContextError = currentKeySequence.includes('Backspace') || currentKeySequence.includes('Escape');
    const isMatched = actualText.includes(tc.expected);

    if (hasContextError || !isMatched) {
      errorLogs.push({
        inputString: tc.input,
        expected: tc.expected,
        actual: actualText,
        triggeredKeys: [...currentKeySequence],
        timestamp: new Date().toISOString()
      });
    }

    if (isMatched) {
      console.log(`✅ PASS: Expected "${tc.expected}" -> Got "${actualText}"`);
      passed++;
    } else {
      console.error(`❌ FAIL:\n  Expected: "${tc.expected}"\n  Actual:   "${actualText}"`);
      failed++;
    }
  }

  // Save error context logs if any anomaly was detected
  if (errorLogs.length > 0) {
    fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify(errorLogs, null, 2), 'utf-8');
    console.log(`\n[IME Logger] Đã ghi nhận ${errorLogs.length} trường hợp kích hoạt Backspace/ESC do xử lý sai ngữ cảnh vào: ${ERROR_LOG_PATH}`);
  }

  // Cleanup
  await context.close();
  try {
    fs.unlinkSync(tmpFixturePath);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n========================================`);
  console.log(`📊 E2E Integration Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Allow direct execution: node test/playwright-e2e.js
if (process.argv[1] && process.argv[1].endsWith('playwright-e2e.js')) {
  runE2ETestSuite().catch(err => {
    console.error('💥 E2E Test Suite Fatal Error:', err);
    process.exit(1);
  });
}

export { runE2ETestSuite };
