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

// Fix round 1: the real templates do not agree on a link suffix. Only
// home.html uses "Name.dc.html" (the case the test above covers); the other
// six templates use the bare "Name.html" spelling for the identical links,
// and at least one real link (in services.html) carries a #fragment too.
// An exact-match table keyed only on ".dc.html" -- as originally written --
// would leave all of these unconverted; toRoute() must normalise both
// suffix spellings and preserve any fragment.
test('internal links convert from both suffix spellings, preserving fragments', () => {
  const t = (href) => convert(`<a href="${href}">x</a>`, ASSETS);
  assert.equal(t('Arohance%20About.dc.html'), '<a href="/about">x</a>');
  assert.equal(t('Arohance%20About.html'), '<a href="/about">x</a>');
  assert.equal(t('Arohance%20Case%20Study.html'), '<a href="/case-study">x</a>');
  assert.equal(t('Arohance%20Homepage.html'), '<a href="/">x</a>');
  assert.equal(t('Arohance%20Homepage.html#work'), '<a href="/#work">x</a>');
});

// Guards the scoping of the new href handling: it must only ever act on the
// `href` attribute. Every real template also has a nav-logo `alt` attribute
// that starts with the literal word "Arohance" (`alt="Arohance, Tech &amp;
// Marketing"`) but is plainly not a link -- if the unmapped-link check below
// were ever broadened from "the href attribute" to "any attribute value",
// that alt text would wrongly throw on every single page.
test('non-internal hrefs and Arohance-prefixed non-href attributes are left untouched', () => {
  const a = convert('<a href="#contact">x</a>', ASSETS);
  assert.equal(a, '<a href="#contact">x</a>');
  const b = convert('<a href="mailto:hello@arohance.com">x</a>', ASSETS);
  assert.equal(b, '<a href="mailto:hello@arohance.com">x</a>');
  const c = convert('<img src="x" alt="Arohance, Tech &amp; Marketing">', ASSETS);
  assert.equal(c, '<img src="x" alt="Arohance, Tech &amp; Marketing" />');
});

// Fix round 1 (ruling): a link that starts with "Arohance" but cannot be
// mapped to a route must fail loudly, not survive silently in the output --
// a converter that quietly ships a dead link is how it reaches Task 9 as an
// unexplained bug. This would fail if that protection were removed (the old
// behaviour just left the href as the original, unconverted string and
// returned normally).
test('an unmappable internal link is reported, not silently passed through', () => {
  assert.throws(
    () => convert('<a href="Arohance%20Nonexistent.html">x</a>', ASSETS),
    /Arohance%20Nonexistent\.html/,
    'the thrown error should name the specific unresolved href',
  );
});

// Fix round 2, finding 1: convert.mjs handled style/style-hover but silently
// dropped style-focus (the ":focus" analogue), so it survived as a dead
// attribute next to className -- 18 occurrences across five templates, all
// the same declaration, all losing the focus-state accent border on a form
// field. Mirrors the style-hover test above with a 'focus:' prefix, using
// the real declaration from the templates (border-bottom-color has no
// dedicated tw.mjs rule, so it falls back to an arbitrary property).
test('style-focus becomes a focus: variant and is removed', () => {
  const out = convert(
    '<input style="border:0" style-focus="border-bottom-color:var(--ag-accent,#F2600C)">',
    ASSETS,
  );
  assert.equal(
    out,
    '<input className="border-0 focus:[border-bottom-color:var(--ag-accent,#F2600C)]" />',
  );
});

// Fix round 2, finding 2: <sc-raw-select> (the role/budget selectors in
// careers.html and contact.html) passed through as an unrecognised custom
// element, so its <option> children had no dropdown to render in. Renaming
// the tag is the whole fix -- attributes and options need no special
// handling, unlike image-slot's attribute-clearing rewrite.
test('sc-raw-select becomes a select with its options intact', () => {
  const out = convert(
    '<sc-raw-select name="role" style="border:0" style-focus="border-bottom-color:var(--ag-accent,#F2600C)"><option>Founder</option><option>Engineer</option></sc-raw-select>',
    ASSETS,
  );
  assert.equal(
    out,
    '<select name="role" className="border-0 focus:[border-bottom-color:var(--ag-accent,#F2600C)]"><option>Founder</option><option>Engineer</option></select>',
  );
});

// Fix round 2, finding 3: style-focus and sc-raw-select are the second and
// third time an unnamed pattern slipped through silently (after the .html
// vs .dc.html links). Rather than trust that the next one will also get
// caught by a human re-reading a diff, the converter now scans for any
// remaining hyphenated custom tag or style-/sc- prefixed attribute that the
// rules above did not name, and refuses to ship it quietly. Two independent
// triggers -- an unknown tag and an unknown attribute -- both covered here.
test('an unknown custom element or style-/sc- attribute triggers the completeness guard', () => {
  assert.throws(
    () => convert('<foo-bar></foo-bar>', ASSETS),
    /unhandled custom element: <foo-bar>/,
    'should report the specific unknown custom element',
  );
  assert.throws(
    () => convert('<div style-active="color:red"></div>', ASSETS),
    /unhandled attribute: style-active/,
    'should report the specific unknown attribute',
  );
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
