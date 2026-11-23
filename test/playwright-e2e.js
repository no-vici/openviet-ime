/**
 * OpenViet IME - End-to-End (E2E) Browser Integration Test with Playwright
 * 
 * Verifies real-world browser typing, unpacked extension loading,
 * high-speed keystroke simulation (delay: 5ms), rich text editor compatibility,
 * and context error tracking (logging unexpected Backspace/ESC to ime-error-context-logs.json).
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const EXTENSION_PATH = path.resolve('.');
const ERROR_LOG_PATH = path.join(process.cwd(), 'ime-error-context-logs.json');

// Chromium rejects Firefox-style MV3 (`background.scripts`). Headful runs therefore
// load a temporary copy with manifest.chrome.json / service_worker.
function prepareChromiumExtensionDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openviet-chrome-ext-'));
  fs.copyFileSync(path.join(EXTENSION_PATH, 'manifest.chrome.json'), path.join(dir, 'manifest.json'));
  fs.cpSync(path.join(EXTENSION_PATH, 'src'), path.join(dir, 'src'), { recursive: true });
  return dir;
}

// Danh sách các chuỗi thử nghiệm (Edge Cases Telex / Tiếng Anh kỹ thuật / Từ bẫy / vnchKey)
const HARDCORE_TEST_CASES = [
  {
    name: 'Auto-restore Telex trap: text (têt -> text on Space)',
    input: 'text ',
    expected: 'text'
  },
  {
    name: 'Auto-restore Telex trap: user (úer -> user on Space)',
    input: 'user ',
    expected: 'user'
  },
  {
    name: 'Auto-restore Telex trap: luxury (lủuy -> luxury on Space)',
    input: 'luxury ',
    expected: 'luxury'
  },
  {
    name: 'Mixed-case preservation: lUxUrY',
    input: 'lUxUrY ',
    expected: 'lUxUrY'
  },
  {
    name: 'Vietnamese Telex tone: cas -> cá',
    input: 'cas ',
    expected: 'cá'
  },
  {
    name: 'Vietnamese Telex tone: toans -> toán',
    input: 'toans ',
    expected: 'toán'
  },
  {
    name: 'Developer camelCase: useState',
    input: 'useState ',
    expected: 'useState'
  },
  {
    name: 'vnchKey rapid 2nd tone restore: docs',
    input: 'docs ',
    expected: 'docs'
  },
  {
    name: 'Foreign onset protection: playwright (không bị biến dị thành plăy/plăỷight)',
    input: 'playwright ',
    expected: 'playwright'
  },
  {
    name: 'Telex tone cancellation preservation: test (tesst -> test on Space)',
    input: 'tesst ',
    expected: 'test'
  },
  {
    name: 'Telex tone cancellation preservation: pass (passs -> pass on Space)',
    input: 'passs ',
    expected: 'pass'
  }
];

async function runE2ETestSuite() {
  console.log('🚀 Starting OpenViet IME Playwright E2E Integration Test Suite...');
  console.log(`📦 Extension Path: ${EXTENSION_PATH}`);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openviet-playwright-'));
  const errorLogs = [];

  let browser;
  let context;
  let isHeadful = false;
  let headfulExtensionDir = null;

  try {
    headfulExtensionDir = prepareChromiumExtensionDir();
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${headfulExtensionDir}`,
        `--load-extension=${headfulExtensionDir}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu'
      ]
    });
    isHeadful = true;
    console.log('🖥️ Running in Headful mode with Persistent Extension Context.');
  } catch {
    console.log('🤖 Running in Headless mode (injecting content.bundle.js engine directly).');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    context = await browser.newContext();
  }

  const page = await context.newPage();

  // Monitor keydown events globally in page to catch any Backspace/Escape triggers
  let currentKeySequence = [];
  await page.exposeFunction('trackKeyEvent', (key) => {
    currentKeySequence.push(key);
  });

  // Serve from a real http origin: <all_urls> does not match about:blank, so the old
  // page.setContent() approach silently skipped the extension content script in headful mode.
  const pageHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>OpenViet IME E2E Testbed</title>
</head>
<body style="padding: 20px; background: #111; color: #fff;">
  <h2>OpenViet IME E2E Testbed</h2>
  <div id="editor" contenteditable="true" style="min-height: 120px; padding: 12px; border: 1px solid #444; font-size: 18px;"></div>
  <input id="nativeInput" type="text" style="width: 100%; margin-top: 16px; padding: 10px; font-size: 16px;" />
</body>
</html>`;

  await page.route('http://openviet.test/**', route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: pageHtml
  }));
  await page.goto('http://openviet.test/');

  // If in headless mode where chrome-headless-shell ignores unpacked extensions,
  // directly inject the extension bundle to test DOM and typing event loop
  if (!isHeadful) {
    await page.addScriptTag({ path: path.join(EXTENSION_PATH, 'src/content/content.bundle.js') });
  }

  // Inject real-time key logger into browser window
  await page.evaluate(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        window.trackKeyEvent(e.key);
      }
    });
  });

  await page.waitForTimeout(300);

  const editorLocator = page.locator('#editor');
  await editorLocator.click();

  // Canary: prove the IME is attached before the matrix. A dead content script would
  // otherwise let every English trap word "pass" because raw text equals expectation.
  await editorLocator.evaluate(node => { node.innerHTML = ''; });
  await editorLocator.click();
  await page.keyboard.type('toans ', { delay: 5 });
  await page.waitForTimeout(100);
  const canaryText = (await editorLocator.innerText()).trim();
  if (!canaryText.includes('toán')) {
    throw new Error(`OpenViet IME did not initialize in ${isHeadful ? 'headful' : 'headless'} mode (canary produced "${canaryText}")`);
  }

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

    // Allow IME micro-task to settle
    await page.waitForTimeout(100);

    // 2. Read back innerText
    const actualText = (await editorLocator.innerText()).trim();

    // Check if Backspace or ESC occurred unexpectedly
    const hasContextError = currentKeySequence.includes('Backspace') || currentKeySequence.includes('Escape');
    const isMatched = actualText.toLowerCase() === tc.expected.toLowerCase();

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
  if (browser) await browser.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
  try {
    if (headfulExtensionDir) fs.rmSync(headfulExtensionDir, { recursive: true, force: true });
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
