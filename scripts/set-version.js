#!/usr/bin/env node

/**
 * Version bumping script for OpenViet IME.
 * Usage:
 *   node scripts/set-version.js <new-version>
 *   npm run set-version <new-version>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const argVersion = process.argv[2];

if (!argVersion) {
  console.error('❌ Error: Missing version argument.');
  console.error('Usage: node scripts/set-version.js <version> (e.g. 1.1.4 or v1.1.4)');
  process.exit(1);
}

// Strip leading 'v' if present
const newVersion = argVersion.startsWith('v') ? argVersion.slice(1) : argVersion;

// Semantic version regex (X.Y.Z or X.Y.Z-prerelease)
const semverRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
if (!semverRegex.test(newVersion)) {
  console.error(`❌ Error: Invalid semantic version "${newVersion}". Expected format: X.Y.Z`);
  process.exit(1);
}

console.log(`🚀 Bumping version to: ${newVersion} (v${newVersion})\n`);

// 1. Update package.json
const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json: ${oldVersion} -> ${newVersion}`);
}

// 2. Update manifests (manifest.json, manifest.chrome.json, manifest.firefox.json)
const manifestFiles = [
  'manifest.json',
  'manifest.chrome.json',
  'manifest.firefox.json'
];

for (const manifestName of manifestFiles) {
  const manifestPath = path.join(rootDir, manifestName);
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const oldVersion = manifest.version;
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${manifestName}: ${oldVersion} -> ${newVersion}`);
  }
}

// 3. Update BUILD.md
const buildMdPath = path.join(rootDir, 'BUILD.md');
if (fs.existsSync(buildMdPath)) {
  let buildMd = fs.readFileSync(buildMdPath, 'utf8');
  // Match **OpenViet IME (vX.Y.Z)**
  buildMd = buildMd.replace(
    /\*\*OpenViet IME \(v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\)\*\*/g,
    `**OpenViet IME (v${newVersion})**`
  );
  // Match web-ext-artifacts/openviet_ime-firefox-X.Y.Z.zip
  buildMd = buildMd.replace(
    /openviet_ime-firefox-\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\.zip/g,
    `openviet_ime-firefox-${newVersion}.zip`
  );
  fs.writeFileSync(buildMdPath, buildMd, 'utf8');
  console.log(`✅ Updated BUILD.md`);
}

// 4. Update README.md and README.vi.md if they mention the version badge or header
const readmeFiles = ['README.md', 'README.vi.md'];
for (const readmeName of readmeFiles) {
  const readmePath = path.join(rootDir, readmeName);
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    let changed = false;
    // Replace version badges or text like version-1.1.3-blue or v1.1.3 if applicable
    if (content.includes('version-') || content.includes('openviet_ime-')) {
      content = content.replace(/(version-)\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/g, `$1${newVersion}`);
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(readmePath, content, 'utf8');
      console.log(`✅ Updated ${readmeName}`);
    }
  }
}

console.log(`\n✨ Version updated to ${newVersion} successfully!`);
console.log(`💡 Next recommended steps:`);
console.log(`   npm run build`);
console.log(`   git commit -am "chore(release): bump version to ${newVersion}"`);
console.log(`   git tag -a v${newVersion} -m "Release v${newVersion}"`);
