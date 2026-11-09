import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const svgPath = path.resolve('src/assets/icon.svg');

if (!fs.existsSync(svgPath)) {
  console.error(`Error: ${svgPath} not found!`);
  process.exit(1);
}

const sizes = [
  { size: 16, outFile: 'src/assets/icon16.png' },
  { size: 32, outFile: 'src/assets/icon32.png' },
  { size: 48, outFile: 'src/assets/icon48.png' },
  { size: 64, outFile: 'src/assets/icon64.png' },
  { size: 128, outFile: 'src/assets/icon128.png' },
  { size: 256, outFile: 'src/assets/icon256.png' },
  { size: 512, outFile: 'src/assets/icon.png' }
];

console.log('Rendering icons directly from src/assets/icon.svg using Inkscape...');

for (const { size, outFile } of sizes) {
  const cmd = `inkscape "${svgPath}" -w ${size} -h ${size} -o "${path.resolve(outFile)}"`;
  execSync(cmd, { stdio: 'pipe' });
  console.log(`Generated ${outFile} (${size}x${size})`);
}

console.log('Successfully generated all OpenViet IME modern PNG icons directly from src/assets/icon.svg!');
