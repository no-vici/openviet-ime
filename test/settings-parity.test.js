import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DEFAULT_SETTINGS } from '../src/engine/config.js';

function readSource(relativePath) {
  return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

test('service worker defaults match shared DEFAULT_SETTINGS', () => {
  const source = readSource('../src/background/service-worker.js');
  const match = source.match(/const DEFAULT_SETTINGS = (\{[\s\S]*?\n\});/);

  assert.ok(match, 'could not locate DEFAULT_SETTINGS in service-worker.js');

  // The service worker is a classic script and cannot import ESM, so its literal
  // is parsed from source. This keeps the two definitions from drifting apart.
  // JSON round-trip normalizes the VM realm's prototypes for deepStrictEqual.
  const workerDefaults = JSON.parse(JSON.stringify(vm.runInNewContext(`(${match[1]})`)));
  assert.deepStrictEqual(workerDefaults, DEFAULT_SETTINGS);
});

test('popup and options use the shared DEFAULT_SETTINGS instead of local copies', () => {
  const popupSource = readSource('../src/popup/popup.js');
  const optionsSource = readSource('../src/options/options.js');

  assert.match(popupSource, /import \{ DEFAULT_SETTINGS \} from '\.\.\/engine\/config\.js'/);
  assert.match(popupSource, /let settings = \{ \.\.\.DEFAULT_SETTINGS \}/);
  assert.doesNotMatch(popupSource, /let settings = \{\s*method: 3/);

  assert.match(optionsSource, /import \{ DEFAULT_SETTINGS \} from '\.\.\/engine\/config\.js'/);
  assert.match(optionsSource, /let settings = \{ \.\.\.DEFAULT_SETTINGS \}/);
});
