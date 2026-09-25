import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

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
