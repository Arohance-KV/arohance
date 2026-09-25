import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert } from './convert.mjs';

const ASSETS = { 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee': '/images/abc123.png' };

// Every assertion below pins the ENTIRE converted fragment with assert.equal
// instead of matching a substring/regex. A substring check can pass while
// the surrounding output is wrong (extra/missing attributes, wrong order,
// a leftover artifact elsewhere in the string) -- see the brace-escaping
// test at the bottom for a concrete case where that actually happens.

test('style becomes className', () => {
  const out = convert('<div style="display:flex;gap:10px"></div>', ASSETS);
  assert.equal(out, '<div className="flex gap-2.5"></div>');
});

test('style-hover becomes hover variants and is removed', () => {
  const out = convert('<a style="color:#fff" style-hover="color:#F2600C"></a>', ASSETS);
  assert.equal(out, '<a className="text-[#fff] hover:text-[#F2600C]"></a>');
});

test('html attributes are renamed for JSX', () => {
  const out = convert('<label for="a" tabindex="0" class="x"></label>', ASSETS);
  assert.equal(out, '<label htmlFor="a" tabIndex="0" className="x"></label>');
});

test('the mangled viewBox attribute is restored', () => {
  const out = convert('<svg sc-camel-view-box="0 0 24 24"></svg>', ASSETS);
  assert.equal(out, '<svg viewBox="0 0 24 24"></svg>');
});

// Strengthened beyond the brief: this also pins the trailing self-closing
// slash, so a regression that renames image-slot -> img correctly but
// leaves it un-self-closed (invalid JSX) is caught right here, rather than
// relying on the separate "void elements" test below to notice -- that one
// only exercises tags that were already void in the source, not a tag that
// becomes void via the image-slot rewrite.
test('image-slot becomes img with the mapped asset path', () => {
  const out = convert(
    '<image-slot id="s" shape="rect" src="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" placeholder="Key visual"></image-slot>',
    ASSETS,
  );
  assert.equal(
    out,
    '<img src="/images/abc123.png" alt="Key visual" className="h-full w-full object-cover" />',
  );
});

test('void elements are self-closed', () => {
  const out = convert('<div><br><img src="x"></div>', ASSETS);
  assert.equal(out, '<div><br /><img src="x" /></div>');
});

test('internal artifact links become routes', () => {
  const out = convert('<a href="Arohance%20About.dc.html">About</a>', ASSETS);
  assert.equal(out, '<a href="/about">About</a>');
});

// The brief's version of this test -- assert.match(out, /\{'\{'\}/) -- is
// vacuous: it still passes on a CORRUPTED escape. A naive
// `.replace(/\{/g, X).replace(/\}/g, Y)` pipeline reprocesses the braces
// the first .replace() just inserted (X and Y each contain one '{' and one
// '}'), turning 'a { b } c' into "a {'{'{'}'} b {'}'} c" instead of the
// correct "a {'{'} b {'}'} c" -- and that corrupted string still contains
// the substring `{'{'}`, so the regex-based check would not catch it. Only
// a whole-string equality assertion pins the correct, non-corrupted escape.
test('braces in text are escaped for JSX', () => {
  const out = convert('<p>a { b } c</p>', ASSETS);
  assert.equal(out, "<p>a {'{'} b {'}'} c</p>");
});
