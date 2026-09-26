import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert } from './convert.mjs';

const ASSETS = { 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee': '/images/abc123.png' };
const EXT_RESOURCES = { 'work-agasti-s': '/images/17320eecd2.jpg' };

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

// Fix round 1 (Ruling): a resolved internal link is real cross-page
// navigation, so it becomes next/link's <Link>, not a plain <a> -- see the
// dedicated Link-vs-<a> tests below for the discriminating cases.
test('internal artifact links become routes', () => {
  const out = convert('<a href="Arohance%20About.dc.html">About</a>', ASSETS);
  assert.equal(out, '<Link href="/about">About</Link>');
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
  assert.equal(t('Arohance%20About.dc.html'), '<Link href="/about">x</Link>');
  assert.equal(t('Arohance%20About.html'), '<Link href="/about">x</Link>');
  assert.equal(t('Arohance%20Case%20Study.html'), '<Link href="/case-study">x</Link>');
  assert.equal(t('Arohance%20Homepage.html'), '<Link href="/">x</Link>');
  assert.equal(t('Arohance%20Homepage.html#work'), '<Link href="/#work">x</Link>');
});

// Fix round 1 (Ruling): plain <a href="/about"> triggers a full document
// reload, which quietly defeats several already-shipped decisions --
// AgRuntime's mount/dispose lifecycle, shell.ts's overflow-lock reset on
// navigation, ContactPill's per-visit replay -- none of which would ever
// run again after the first page load. <Link> renders as an <a> with the
// same attributes in the DOM (verified: shell.ts's own `ov.querySelectorAll
// ('a')` link-close wiring still matches it), so this is a zero-visual-
// change, tag-name-only fix. Every other attribute -- data-ag-mlink here,
// but the same code path handles className, data-ag-navcta, aria-* etc --
// must survive untouched.
test('an internal artifact link becomes a Link, with every other attribute preserved', () => {
  const out = convert(
    '<a data-ag-mlink="" href="Arohance%20About.dc.html" style="color:#fff">About</a>',
    ASSETS,
  );
  assert.equal(
    out,
    '<Link data-ag-mlink="" href="/about" className="text-[#fff]">About</Link>',
  );
});

// The trickiest edge case, called out explicitly because it is the one
// place the resulting *string* still looks like it could be mistaken for
// "just an anchor": a route-plus-fragment link (home's own "Work" nav item,
// which points at another page's #work section) is still real cross-page
// navigation, because toRoute() is the thing that resolved it -- gating on
// "did toRoute() resolve this" rather than "does the output contain a bare
// #fragment" is exactly what makes this case come out right.
test('a route-plus-fragment link also becomes a Link', () => {
  const out = convert('<a href="Arohance%20Homepage.html#work">Work</a>', ASSETS);
  assert.equal(out, '<Link href="/#work">Work</Link>');
});

// The converse direction: a bare same-page anchor never starts with
// "Arohance", so it never reaches toRoute() at all, and must stay a plain
// <a> -- there is no other page being navigated to, so promoting it to
// <Link> would be wrong (and, depending on next/link's own validation,
// potentially a broken href). This is the case an over-broad
// implementation -- one that pattern-matches on a leading "/" or a "#" in
// the output instead of gating on toRoute()'s own resolution -- would get
// wrong.
test('a bare same-page fragment link stays an <a>, not a Link', () => {
  const out = convert('<a href="#work">Selected work</a>', ASSETS);
  assert.equal(out, '<a href="#work">Selected work</a>');
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

// Task 8, fix round 1 (Concern 2): a second class of asset reference,
// discovered only once initVideo (lib/behaviors/video.ts) was ported and
// found to depend on window.__resources, which does not exist here. The
// bundler's `ext_resources` table maps a human-readable id to a public
// path -- the same shape of value the bare-uuid `assets` map above already
// resolves -- but templates reference it as `assets/<id>.<ext>` (the
// testimonial reel's `data-vt-poster="assets/work-agasti-s.jpg"`), never as
// a bare uuid sitting alone as the whole attribute value, so `assets[v]`
// (an exact-value lookup) can never match it; it needs its own regex-based
// lookup keyed by the captured id.
test('an assets/<id>.<ext> reference is rewritten to its mapped path', () => {
  const out = convert('<div data-vt-poster="assets/work-agasti-s.jpg"></div>', ASSETS, EXT_RESOURCES);
  assert.equal(out, '<div data-vt-poster="/images/17320eecd2.jpg"></div>');
});

// Mirrors the unmappable-internal-link test above: an assets/<id> reference
// this converter cannot resolve must fail loudly, not ship as a dead path
// that only surfaces later as a broken <img> in the browser.
test('an unresolvable assets/<id> reference is reported, not silently passed through', () => {
  assert.throws(
    () => convert('<div data-vt-poster="assets/does-not-exist.jpg"></div>', ASSETS, EXT_RESOURCES),
    /unmapped asset reference: assets\/does-not-exist\.jpg/,
    'the thrown error should name the specific unresolved asset reference',
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

// Task 7, fix round 1, finding 1: node-html-parser's own setAttribute /
// removeAttribute re-quote *every* attribute on the element each time they
// touch any one of them, and the quoting helper they share collapses a
// value to a bare token whenever that value is the empty string -- the
// same collapse it applies to a source attribute that was genuinely
// valueless. Critically, this only fires as a side effect of some *other*
// attribute on the same element going through setAttribute/removeAttribute
// (e.g. `style` being merged into `className`, below) -- an element whose
// only attribute is the empty one never touches that code path at all, so
// a test without a triggering sibling attribute cannot tell the fixed
// converter from the broken one (confirmed by mutation: removing the fix
// left such a test passing anyway). `style` here is exactly what triggers
// it on every real occurrence: the 22 real `alt=""` attributes (4
// testimonial thumbnails, 18 content-studio stream cards) all sit next to
// a `style` attribute of their own. Pre-fix, this input produced
// `<img src="x" alt className="block" />` (no `=""` at all); JSX reads
// that bare `alt` as `alt={true}`, and `boolean` is not assignable to
// `alt`'s `string` type.
test('an empty attribute value is emitted explicitly, not collapsed to a bare token', () => {
  const out = convert('<img src="x" alt="" style="display:block">', ASSETS);
  assert.equal(out, '<img src="x" alt="" className="block" />');
});

// Same hazard, deliberately on an attribute that is not alt (per the fix
// instructions), and again with a `style` sibling so the collapse actually
// has a chance to fire: the real nav logo carries `data-ag-logo=""` in the
// source, which is not `alt` and has no string-typed React prop backing
// it, but a mutation that reverted the general fix to "just special-case
// alt" would still leave this one bare -- this test exists specifically so
// that narrower fix would fail it.
test('the empty-attribute fix is general, not special-cased to alt', () => {
  const out = convert('<img data-ag-logo="" src="x" alt="y" style="display:block">', ASSETS);
  assert.equal(out, '<img data-ag-logo="" src="x" alt="y" className="block" />');
});

// Conservative-ness check: a source attribute with genuinely no value at
// all (no `=`, e.g. a real HTML boolean attribute) must stay bare -- JSX's
// `{true}` reading of a bare attribute is *correct* for this case. A
// mutation that "fixed" the empty-string hazard by quoting every attribute
// unconditionally (including a true `null`) would fail this test.
test('a genuinely valueless source attribute is left bare', () => {
  const out = convert('<input disabled>', ASSETS);
  assert.equal(out, '<input disabled />');
});

// Task 7, fix round 1, finding 2: React types rows/cols/span/colSpan/
// rowSpan/maxLength/minLength/size/start `number`, not `string | number`,
// so the literal JSX string the converter emits for every other attribute
// fails to type-check even though it was valid HTML (the real template's
// `rows="3"` is the case that surfaced this). Covers all five
// not-otherwise-renamed names in one element set, so dropping any single
// entry from the numeric-attribute list fails this one assertion.
test('numeric attributes become JSX number expressions', () => {
  const out = convert(
    '<textarea rows="3"></textarea><textarea cols="40"></textarea><col span="2"></col><input size="20"><ol start="5"></ol>',
    ASSETS,
  );
  assert.equal(
    out,
    '<textarea rows={3}></textarea><textarea cols={40}></textarea><col span={2} /><input size={20} /><ol start={5}></ol>',
  );
});

// The remaining four numeric names only exist in JSX after the existing
// html-attribute rename table upper-cases them (colspan -> colSpan, etc.)
// -- this pins that the numeric coercion runs *after* that rename, on the
// renamed name, rather than missing them because it only ever looked for
// the lowercase HTML spelling.
test('numeric coercion applies after the html-attribute rename, not before', () => {
  const cells = convert('<td colspan="2" rowspan="3">x</td>', ASSETS);
  assert.equal(cells, '<td colSpan={2} rowSpan={3}>x</td>');
  const lengths = convert('<input maxlength="10" minlength="2">', ASSETS);
  assert.equal(lengths, '<input maxLength={10} minLength={2} />');
});

// Deliberate exclusion: width/height are not in the numeric-attribute list.
// React accepts them as strings, and they appear on SVG elements where a
// blind numeric coercion could silently change a percentage value's
// meaning. A well-meaning future addition of these to the list would fail
// this test.
test('width and height are left as JSX strings, not coerced to numbers', () => {
  const out = convert('<svg width="100" height="50"></svg><img src="x" width="24" height="24">', ASSETS);
  assert.equal(out, '<svg width="100" height="50"></svg><img src="x" width="24" height="24" />');
});

// Task 7, fix round 1, finding 3: a literal apostrophe, straight double
// quote or '>' in JSX text content fails eslint-config-next's
// react/no-unescaped-entities rule as a *build* error (not caught by tsc,
// only by `next build`'s lint pass) -- the real "DON'T", "can't", "We'll",
// "you're" and "don't" copy across the homepage all hit this. JSX decodes
// named entities in text (the converter already relies on this for
// `&amp;`), so `&apos;`/`&quot;`/`&gt;` render as the original characters --
// verified separately by compiling this exact JSX through TypeScript's own
// transform and confirming the emitted string literal is unchanged.
test('apostrophes, quotes and > in text are escaped for JSX', () => {
  const out = convert('<p>Don\'t say "hi" if a > b</p>', ASSETS);
  assert.equal(out, '<p>Don&apos;t say &quot;hi&quot; if a &gt; b</p>');
});

// Guards the same single-pass-replacer requirement the brace-escaping test
// above already documents, now that the replacer also handles three more
// characters: braces, an apostrophe, a quote and '>' all in one text node
// must not corrupt each other (e.g. the apostrophe inside the brace
// replacement text `{'{'}` must not be re-escaped by a second pass).
test('mixed braces and entities in one text node are not corrupted', () => {
  const out = convert('<p>a { b } c\'s "d" > e</p>', ASSETS);
  assert.equal(out, "<p>a {'{'} b {'}'} c&apos;s &quot;d&quot; &gt; e</p>");
});
