import fs from 'fs';
import path from 'path';
import pkg from '@resvg/resvg-js';
const { Resvg } = pkg;

const svgPath = path.resolve('src/assets/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [16, 32, 48, 64, 128];

for (const size of sizes) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      value: size
    }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  if (size === 16) {
    fs.writeFileSync('src/assets/icon16.png', pngBuffer);
  } else if (size === 32) {
    fs.writeFileSync('src/assets/icon32.png', pngBuffer);
  } else if (size === 48) {
    fs.writeFileSync('src/assets/icon48.png', pngBuffer);
  } else if (size === 64) {
    fs.writeFileSync('src/assets/icon64.png', pngBuffer);
  } else if (size === 128) {
    fs.writeFileSync('src/assets/icon128.png', pngBuffer);
    fs.writeFileSync('src/assets/icon.png', pngBuffer);
  }
}

console.log('Successfully generated all OpenViet IME modern PNG icons!');
