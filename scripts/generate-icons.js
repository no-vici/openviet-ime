import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const svgPath = path.resolve('src/assets/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

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
  const page = await browser.newPage({
    viewport: { width: size + 20, height: size + 20 },
    deviceScaleFactor: 1
  });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
        #icon-target {
          width: ${size}px;
          height: ${size}px;
          display: block;
        }
        #icon-target svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
    </head>
    <body>
      <div id="icon-target">${svgContent}</div>
    </body>
    </html>
  `);

  await page.waitForTimeout(60);
  const target = page.locator('#icon-target');
  await target.screenshot({ path: path.resolve(outFile), omitBackground: true });
  await page.close();
  console.log(`Generated ${outFile} (${size}x${size})`);
}

await browser.close();
console.log('Successfully generated all OpenViet IME PNG icons directly from user icon.svg!');

