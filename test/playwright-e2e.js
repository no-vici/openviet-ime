/**
 * OpenViet IME - End-to-End (E2E) Browser Testing with Playwright
 * 
 * Verifies real-world browser typing, unpacked extension loading,
 * high-speed keystroke simulation (delay: 5ms), rich text editor compatibility,
 * and diacritic transformation fidelity.
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const EXTENSION_PATH = path.resolve('.');
const IS_CI = Boolean(process.env.CI);

// HTML Test Fixture simulating standard Web Editors (Slack, Google Docs, Telegram, Monaco)
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
    <label for="richEditor">3. ContentEditable (Slack Web, Google Docs, ProseMirror, Notion):</label>
    <div id="richEditor" class="editor" contenteditable="true" role="textbox" aria-multiline="true"></div>
  </div>
</body>
</html>`;

async function runE2ETestSuite() {
  console.log('🚀 Starting OpenViet IME Playwright E2E Test Suite...');
  console.log(`📦 Unpacked Extension Path: ${EXTENSION_PATH}`);

  const tmpFixturePath = path.join(os.tmpdir(), 'openviet-e2e-fixture.html');
  fs.writeFileSync(tmpFixturePath, FIXTURE_HTML, 'utf8');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openviet-playwright-'));

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
    console.warn('⚠️ Headful launch failed (probably no X11 DISPLAY in environment). Retrying in modern headless mode...');
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
  await page.goto(`file://${tmpFixturePath}`);
  await page.waitForLoadState('domcontentloaded');

  // Wait a moment for extension content script injection
  await page.waitForTimeout(600);

  const testCases = [
    {
      name: 'High-speed Vietnamese typing in native input',
      selector: '#nativeInput',
      rawKeys: 'Tooi yeu Tieengs Vieetj vaf laapj trinhf ',
      expected: 'Tôi yêu Tiếng Việt và lập trình '
    },
    {
      name: 'Rapid tone retype (vnchKey 2nd tone restore: docs)',
      selector: '#nativeInput',
      rawKeys: 'docs ',
      expected: 'Tôi yêu Tiếng Việt và lập trình docs '
    },
    {
      name: 'Technical English auto-restore in textarea (modern, luxury, text)',
      selector: '#nativeTextarea',
      rawKeys: 'modern luxury text user push window ',
      expected: 'modern luxury text user push window '
    },
    {
      name: 'Developer camelCase & PascalCase in ContentEditable (Slack/Docs rich editor)',
      selector: '#richEditor',
      rawKeys: 'useState isCamelCase UserController ',
      expected: 'useState isCamelCase UserController '
    },
    {
      name: 'Central Highlands & regional toponyms preservation (Đắk Lắk, Krông Nô, quởn)',
      selector: '#richEditor',
      rawKeys: 'Dawk Lawk, Kroomg Noo, quowrn ',
      expected: 'useState isCamelCase UserController Đắk Lắk, Krông Nô, quởn '
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n⏳ Running: [${tc.name}]`);
    const element = await page.$(tc.selector);
    if (!element) {
      console.error(`❌ Element not found: ${tc.selector}`);
      failed++;
      continue;
    }

    await element.focus();

    // High-speed micro-delay typing simulation (5ms)
    await page.keyboard.type(tc.rawKeys, { delay: 5 });
    await page.waitForTimeout(100);

    // Read back buffer
    let actual = '';
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    if (tagName === 'input' || tagName === 'textarea') {
      actual = await element.evaluate(el => el.value);
    } else {
      actual = await element.evaluate(el => el.innerText.trim());
    }

    if (actual.trim() === tc.expected.trim()) {
      console.log(`✅ PASS: "${actual.trim()}"`);
      passed++;
    } else {
      console.error(`❌ FAIL:\n  Expected: "${tc.expected.trim()}"\n  Actual:   "${actual.trim()}"`);
      failed++;
    }
  }

  // Cleanup
  await context.close();
  try {
    fs.unlinkSync(tmpFixturePath);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n========================================`);
  console.log(`📊 E2E Test Results: ${passed} passed, ${failed} failed.`);
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
