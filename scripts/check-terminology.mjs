/**
 * Kiểm tra đồng nhất thuật ngữ trên các bề mặt người dùng thấy được.
 *
 * Các mẫu bị cấm được dựng từ mã Unicode thay vì viết thẳng ra, để chính
 * script này không tự khớp với nội dung nó kiểm tra. Xem quy ước trong
 * docs/ARCHITECTURE.md (đầu tài liệu).
 */
import fs from 'node:fs';
import path from 'node:path';

const cp = (...codes) => String.fromCodePoint(...codes);

// "chính tả", "gửi", "tiếng Việt", "tiếng Anh" — dựng từ code point.
const FORBIDDEN = [
  cp(0x63, 0x68, 0x00ed, 0x6e, 0x68, 0x20, 0x74, 0x1ea3),
  cp(0x67, 0x1eed, 0x69),
  cp(0x74, 0x69, 0x1ebf, 0x6e, 0x67, 0x20, 0x56, 0x69, 0x1ec7, 0x74),
  cp(0x74, 0x69, 0x1ebf, 0x6e, 0x67, 0x20, 0x41, 0x6e, 0x68),
];

const root = process.cwd();
const docFiles = fs
  .readdirSync(path.join(root, 'docs'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => path.join('docs', name));

const targets = [
  'README.md',
  'README.vi.md',
  'CHANGELOG.md',
  'BUILD.md',
  ...docFiles,
  'src/popup/popup.html',
  'src/options/options.html',
  'web-ext-artifacts/AMO_SUBMISSION_v1.4.5.md',
];

let errors = 0;

for (const rel of targets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of FORBIDDEN) {
      if (line.includes(pattern)) {
        errors += 1;
        console.error(`${rel}:${index + 1}: phát hiện mẫu thuật ngữ cũ`);
      }
    }
  });
}

if (errors > 0) {
  console.error(`\n${errors} lỗi thuật ngữ. Dùng: Tiếng Việt · chánh tả · gởi.`);
  process.exit(1);
}

console.log('0 lỗi thuật ngữ. Dùng: Tiếng Việt · chánh tả · gởi.');
