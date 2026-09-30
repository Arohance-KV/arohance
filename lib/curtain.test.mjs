import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// lib/curtain.ts has no imports: transpile it here, like lib/work.test.mjs.
const { outputText } = ts.transpileModule(readFileSync('lib/curtain.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { navTarget } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);

const HERE = 'https://arohance.test/about';
const link = (href, extra = {}) => ({ href: new URL(href, HERE).href, target: '', download: false, ...extra });
const click = (extra = {}) => ({
  button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...extra,
});

test('navTarget: a link to another page goes through the curtain', () => {
  assert.equal(navTarget(link('/studio'), click(), HERE), '/studio');
  assert.equal(navTarget(link('/case-study/kria-sports-platform'), click(), HERE), '/case-study/kria-sports-platform');
  assert.equal(navTarget(link('/studio', { target: '_self' }), click(), HERE), '/studio');
});

test('navTarget: another page with a hash keeps the hash', () => {
  assert.equal(navTarget(link('/#work'), click(), HERE), '/#work');
});

test('navTarget: same-page links are left alone', () => {
  assert.equal(navTarget(link('#contact'), click(), HERE), null);
  assert.equal(navTarget(link('/about'), click(), HERE), null);
  assert.equal(navTarget(link('/about#team'), click(), HERE + '#top'), null);
});

test('navTarget: new-tab and modified clicks are left alone', () => {
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    assert.equal(navTarget(link('/studio'), click({ [key]: true }), HERE), null, key);
  }
  assert.equal(navTarget(link('/studio'), click({ button: 1 }), HERE), null);
  assert.equal(navTarget(link('/studio', { target: '_blank' }), click(), HERE), null);
});

test('navTarget: downloads, other origins, mailto and prevented clicks are left alone', () => {
  assert.equal(navTarget(link('/brochure.pdf', { download: true }), click(), HERE), null);
  assert.equal(navTarget(link('https://instagram.com/arohance'), click(), HERE), null);
  assert.equal(navTarget(link('mailto:hello@arohance.com'), click(), HERE), null);
  assert.equal(navTarget(link('/studio'), click({ defaultPrevented: true }), HERE), null);
});
