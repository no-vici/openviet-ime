import path from 'path';
import { chromium } from 'playwright';

const svgPath = path.resolve('src/assets/icon.svg');

const sizes = [
  { size: 16, outFile: 'src/assets/icon16.png' },
  { size: 32, outFile: 'src/assets/icon32.png' },
  { size: 48, outFile: 'src/assets/icon48.png' },
  { size: 64, outFile: 'src/assets/icon64.png' },
  { size: 128, outFile: 'src/assets/icon128.png' },
  { size: 256, outFile: 'src/assets/icon256.png' },
  { size: 512, outFile: 'src/assets/icon.png' }
];

console.log('Rendering all icon PNG sizes directly from src/assets/icon.svg...');

const browser = await chromium.launch({ headless: true });

for (const { size, outFile } of sizes) {
  const scale = size / 128;
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: scale
  });
  await page.goto('file://' + svgPath);
  await page.waitForTimeout(60);
  const svgEl = page.locator('svg').first();
  await svgEl.screenshot({ path: path.resolve(outFile), omitBackground: true });
  await page.close();
  console.log(`Generated ${outFile} (${size}x${size})`);
}

await browser.close();
console.log('Successfully generated all OpenViet IME PNG icons directly from user icon.svg!');
