import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('unbundle produced all seven templates', () => {
  for (const slug of ['home','about','services','studio','careers','contact','case-study']) {
    assert.ok(existsSync(`.source/templates/${slug}.html`), `missing ${slug}`);
  }
});

test('templates are real markup, not bundler loaders', () => {
  const home = readFileSync('.source/templates/home.html', 'utf8');
  assert.ok(home.includes('data-ag-root'), 'template should contain the page root');
  assert.ok(!home.includes('__bundler'), 'template should not contain loader scaffolding');
});

test('asset map resolves every uuid referenced by a template', () => {
  const map = JSON.parse(readFileSync('.source/assets.json', 'utf8'));
  const home = readFileSync('.source/templates/home.html', 'utf8');
  const uuids = [...home.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)]
    .map(m => m[0]);
  assert.ok(uuids.length > 0, 'home template should reference assets');
  for (const u of new Set(uuids)) assert.ok(u in map, `unmapped asset ${u}`);
});

test('reported asset count matches files actually written', () => {
  const map = JSON.parse(readFileSync('.source/assets.json', 'utf8'));
  const paths = new Set(Object.values(map).filter(Boolean));
  const images = readdirSync('public/images').length;
  const vendor = readdirSync('.source/vendor').length;
  assert.equal(paths.size, images + vendor,
    'assets.json distinct paths must equal files on disk');
});

test('collision warning fires only for genuinely differing content', () => {
  const run = () => {
    const r = spawnSync(process.execPath, ['tools/unbundle.mjs'], { encoding: 'utf8' });
    assert.equal(r.status, 0, `unbundle failed: ${r.stderr}`);
    return r.stderr;
  };
  for (const stderr of [run(), run()]) {
    const warned = [...stderr.matchAll(/variant ignored: (\S+)/g)].map(m => m[1]);
    assert.deepEqual(warned, ['contact-pill.js'],
      'exactly one variant warning, naming the only library that differs across bundles');
  }
});
