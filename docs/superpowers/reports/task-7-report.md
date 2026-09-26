# Task 7 Report: Convert the homepage to a real Next.js page

## Status: DONE_WITH_CONCERNS

All assigned files were produced correctly and verified against the converter's
verbatim output. `npx tsc --noEmit` and `npm run build` are **not** clean, but
I traced every failure to two pre-existing bugs in the converter's output
(not introduced by me, not fixable by me per the task's scope rules) plus one
architectural requirement of my own file that I *did* fix in scope. Full
evidence below, including a reverted, non-shipped test that proves the build
goes 100% green once the two converter bugs are addressed.

---

## What I implemented

1. **`app/page.tsx`** — replaced the create-next-app scaffold with the real
   homepage. Per Ruling 1, there is no `Nav`/`MenuOverlay`/`Footer` — the
   entire shell (nav, overlay, header#top, #intro, ribbons, #work, #clients,
   #testimonials, #services, the three unlabelled sections, #contact, and the
   footer nested inside #contact, plus the lightbox) is pasted verbatim from
   `.source/jsx/home.jsx`. Only `AgRuntime` and `ContactPill` are imported,
   per Ruling 1's "only components you import" instruction.
2. **`app/modules.ts`** — created exactly as specified: `HOME_MODULES = [...SHARED]`,
   a module-level constant.
3. **`next/image` swaps** — the logo and the four work-card key visuals, with
   explicit width/height measured via `image-size` (Ruling 3), and `priority`
   on the logo and the first (Agasti Realty) work card only.
4. **`'use client'` directive** — added to `app/page.tsx` (see "Architectural
   fix" below). This was not in the brief's skeleton but is required for the
   page to build at all, given `AgRuntime`'s existing (Task 6, unmodified)
   contract.

Regeneration: ran `node tools/convert.mjs home` fresh (not reused a stale
copy) → `wrote .source/jsx/home.jsx`, 702 lines, confirmed byte-identical
line count to the brief's "702 lines, 84 KB" claim.

Assembly method: rather than hand-copying ~700 lines of generated markup
(unicode arrows, em-dashes, curly quotes throughout) through an editor, I
wrote a small one-off Node script that (a) read `.source/jsx/home.jsx`
verbatim, (b) asserted each of the 5 target `<img>` substrings occurs
**exactly once** before replacing it (so a stray duplicate would throw, not
silently corrupt), (c) inserted the two mounts before the root's closing
`</div>`, and (d) wrapped the result with the import header. This traded
"typed by hand" risk for "verified by diff" certainty — see the fidelity
section below, which is the actual proof of correctness, not the method.

---

## Fidelity diff: `app/page.tsx` vs `.source/jsx/home.jsx`

`diff -u .source/jsx/home.jsx app/page.tsx`: **7 lines removed, 16 lines
added** (23 changed lines total). Every one falls into exactly one of the
three permitted buckets:

### Wrapper (2 removed, 9 added)
The converter's sliced output starts with 2 blank lines and ends with 2
blank lines (artifacts of the `</helmet>`/`</x-dc>` slice points — Fact #4).
These 4 incidental blank lines were consumed to make room for:
- Added: `'use client';`, 4 `import` lines, `export default function Home() {`, `  return (` (7 lines, replacing the 2 leading blanks — net +7/-0 there since the diff algorithm matched the leading blanks as context, not removal)
- Added: `  );` and `}` (2 lines, replacing the 2 trailing blanks — net +2/-2)

### `next/image` swaps (5 removed, 5 added — one line each)
| Element | Original line | New line |
|---|---|---|
| Logo | `<img data-ag-logo src="/images/93c7aab596.png" ... />` | `<Image data-ag-logo ... width={422} height={133} priority ... />` |
| Work 01 Agasti Realty | `<img src="/images/ff551cbd9d.png" ... />` | `<Image ... width={868} height={488} priority ... />` |
| Work 02 Redpanda Outdoor | `<img src="/images/17320eecd2.jpg" ... />` | `<Image ... width={1920} height={1080} ... />` |
| Work 03 Orbital | `<img src="/images/8dc8938ce7.jpg" ... />` | `<Image ... width={1920} height={1080} ... />` |
| Work 04 Margin Press | `<img src="/images/f1d945b460.jpg" ... />` | `<Image ... width={1920} height={1080} ... />` |

Each swap changed only the tag name and added `width`/`height`/(`priority`);
`className` is byte-identical on every one (verified — see className
spot-check below).

### Component mounts (0 removed, 2 added)
`<ContactPill />` and `<AgRuntime modules={HOME_MODULES} />`, inserted
immediately before the root div's closing `</div>`, per Ruling 2 and the
skeleton in "What you are building."

**No other difference exists.** I ran the diff after every edit specifically
to catch any accidental reformatting; none occurred.

### className spot-check (3 long strings, verbatim vs page.tsx)
- `className="fixed top-0 left-0 right-0 z-[70] flex items-start justify-between gap-4 py-4 px-[clamp(20px,4.4vw,64px)] [transition:padding_.45s_ease]"` — identical (nav)
- `className="absolute left-0 top-0 bottom-0 w-[min(78%,1100px)] z-[1] bg-[linear-gradient(100deg,rgba(12,11,10,.72)_0%,rgba(12,11,10,.38)_45%,rgba(12,11,10,0)_80%)] pointer-events-none"` — identical (header gradient overlay)
- `className="mt-[clamp(34px,6vw,90px)] mx-0 mb-[clamp(30px,4vw,60px)] [font-family:'Archivo',sans-serif] font-bold text-[clamp(2.4rem,9.6vw,9.5rem)] leading-[.88] tracking-[-0.048em] [font-variation-settings:'wdth'_104]"` — identical (contact h2)

### Stability check
`app/modules.ts` exports `HOME_MODULES` as a top-level `export const`
(module-level constant, not recomputed per render), and `app/page.tsx`
references it directly: `<AgRuntime modules={HOME_MODULES} />` — no inline
array literal.

### Discipline check
`git status` confirms only `app/page.tsx` (modified), `app/modules.ts`
(new), `package.json`/`package-lock.json` (modified) changed. Nothing under
`tools/`, `lib/`, or `components/` was touched. No `Nav`/`MenuOverlay`/
`Footer` files were created — `components/` still contains only
`AgRuntime.tsx` and `ContactPill.tsx`.

---

## Images converted to `next/image`

Measured with `image-size` (Ruling 3's exact probe, run against every file
in `public/images/`, 33 files total). The 5 relevant ones:

| File | Width | Height | Used for | `priority` |
|---|---|---|---|---|
| `93c7aab596.png` | 422 | 133 | Nav logo | yes |
| `ff551cbd9d.png` | 868 | 488 | Work 01 — Agasti Realty | yes |
| `17320eecd2.jpg` | 1920 | 1080 | Work 02 — Redpanda Outdoor | no |
| `8dc8938ce7.jpg` | 1920 | 1080 | Work 03 — Orbital | no |
| `f1d945b460.jpg` | 1920 | 1080 | Work 04 — Margin Press | no |

`image-size@2.0.4` was installed as a devDependency; its API is the named
export `imageSize(buffer)` (not a default export), which is what I used.
Every other `<img>` (12 client logos, 4 testimonial stills reused across 3
places, 18 content-studio stream cards, the lightbox placeholder, the play
icon) was left untouched, per "Leave every other `<img>` as-is."

---

## Converter bugs found (NOT fixed at source, NOT hand-patched into the page)

I found two independent, well-isolated bugs in the converter's output. Per
the task's explicit instruction ("Any converter bug you hit... you should
not have [fixed it at source] — report it instead") and "stop and tell me"
for markup that can't be placed into JSX without hand-editing, **I left both
exactly as the converter emitted them.** `app/page.tsx` ships the verbatim,
broken markup; I did not touch `tools/convert.mjs`, and I did not hand-edit
these specific attributes into the shipped file.

### Bug 1: `attr=""` round-trips as a bare (valueless) attribute

The source template has 22 occurrences of `alt=""` (confirmed in
`.source/templates/home.html`, e.g. the testimonial thumbnails and the
18 content-studio "stream" cards in `data-ag-stream`). After
`node-html-parser`'s `root.toString()` (convert.mjs step 4), these
serialize as a **bare `alt`** with no `="..."` at all — valid-ish HTML
(a valueless attribute defaults to `""`), but **not** valid under JSX
semantics, where a bare attribute means `alt={true}` (boolean shorthand).
Since React's `ImgHTMLAttributes.alt` is typed `string`, this produces:

```
error TS2322: Type 'boolean' is not assignable to type 'string'.
```

23 times total (22 from `alt=""`, see below for the 23rd). Two shapes hit
this, both from real `<img>` tags already present in the source (not
`image-slot`, which I checked separately — all 8 `image-slot` tags do carry
a `placeholder`, so they're unaffected):
- `<img src="..." alt className="...">` — 4×, testimonial thumbnails
- `<img src="..." alt loading="lazy" decoding="async" draggable="false" className="...">` — 18×, content-studio stream cards

**Root cause is the HTML→JSX serialization boundary in convert.mjs step 4**,
not the attribute-rename table — `alt=""` is a value node-html-parser
chooses to print bare. A fix would need a pass that re-quotes any
empty-string attribute value explicitly (`attr=""`) before/after
`root.toString()`, so JSX never sees a bare shorthand for a string-typed
prop. **`tools/convert.test.mjs` only ever tests non-empty `alt` values**
(`alt="Key visual"`, `alt="Arohance, Tech &amp; Marketing"` — I checked;
grep confirms no empty-string case exists), so this is exactly the "test
suite has a gap" Fact #2 predicts.

### Bug 2: numeric HTML attributes pass through as JSX string literals

`.source/templates/home.html` has `<textarea name="brief" rows="3" ...>`.
The converter carries `rows="3"` straight through, but React types
`TextareaHTMLAttributes.rows` as `number`, not `string | number`. This is
the 23rd tsc error:

```
error TS2322: Type 'string' is not assignable to type 'number'.
```

The existing attribute-rename table (`ATTRS` in convert.mjs) renames casing
(`rowspan`→`rowSpan`) but has no numeric-coercion pass for attributes that
are already correctly-cased but need `{number}` instead of `"string"`
(`rows`, `cols`, and potentially others not present on this page). Not
covered by any existing test.

### Bug 3 (found only via `npm run build`, not `tsc`): unescaped apostrophes

`npx tsc --noEmit` doesn't run ESLint, so this one only surfaced once I ran
the real build. 6 literal `'` characters appear directly in JSX text content
("DON'T TAKE OUR WORD", "they can't do", "WE DON'T JUST DESIGN", "We'll
happily" + "you're buying" on one line, "Founders don't need") — all
pre-existing English contractions in the source copy, carried straight
through by convert.mjs. `eslint-config-next`'s `react/no-unescaped-entities`
rule treats a bare `'` in JSX text as an **error** (not warning):

```
Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

Convert.mjs step 5 already has a text-escaping pass (for `{`/`}`) that walks
every text node between `>` and `<` — this is the natural place to also
escape `'` (and it's the same code the task's own Fact #4 area already
flags as delicate: "must be a single regex pass," so I did not attempt this
myself, since it's exactly the kind of single-page hand-patch the task told
me not to do).

### Verification that these three are the *only* blockers

To avoid reporting a guess, I ran a temporary, reverted test (never
committed, not shipped): patched a scratch copy of `app/page.tsx` with the
minimal fixes for all three bugs (`alt=""` explicit, `rows={3}`, `&apos;`
escaping) plus the `'use client'` directive, then ran the real gates:

- `npx tsc --noEmit` → clean, no errors.
- `npm run build` → **exit 0**, `✓ Generating static pages (4/4)`, route `/`
  built at 20.5 kB / 123 kB First Load JS, only the pre-existing
  `no-img-element` warnings (expected, for the images left as-is) and two
  pre-existing warnings in `lib/liquid-ether.ts`/`lib/stroke-text.ts`
  (unrelated files, not part of this task, not modified by me).

I then reverted app/page.tsx back to the true verbatim-plus-authorized-deltas
version (confirmed via `diff` against the backup taken before any test
patch) before finalizing and committing. **The version in the repo right
now contains none of the three test-patch fixes** — it is exactly the
verbatim converter output plus the image swaps, the two mounts, and
`'use client'`.

---

## Architectural fix I *did* make (in scope): `'use client'`

This is not a converter bug — it's a property of `app/page.tsx` itself, so
it was mine to fix.

`Home` (no directive) is a Server Component by default. It renders
`<AgRuntime modules={HOME_MODULES} />`, and `AgRuntime` is a Client
Component (Task 6, unmodified). `HOME_MODULES` is an array of the actual
behaviour **functions** (`applyTheme, reveal, parallax, nav, shell, clock,
form`). React Server Components cannot serialize functions across the
server→client prop boundary — I confirmed this empirically: without `'use
client'` on `page.tsx`, the build fails during static generation with:

```
Error: Functions cannot be passed directly to Client Components unless you
explicitly expose it by marking it with "use server". Or maybe you meant to
call this function rather than return it.
  [function, function, function, function, ..., ..., ...]
Error occurred prerendering page "/".
```

Adding `'use client';` as the first line of `app/page.tsx` makes `Home`
itself a Client Component, so the prop pass to `AgRuntime` is an ordinary
same-realm client-to-client pass (no serialization). Next.js still
server-renders (SSR) Client Components for the initial HTML, so this does
not change visual output or defeat the "first real SSR check" — it only
means `Home`'s markup also ships in the client JS bundle for hydration
(there's no other way to satisfy AgRuntime's existing, unmodified contract).
I verified this is necessary and sufficient with the reverted test above.
I did not touch `components/AgRuntime.tsx` — flagging this as a concern
below in case the intended design was different.

---

## Gate output (on the actual committed file — bugs 1–3 NOT fixed)

### `npx tsc --noEmit`
```
app/page.tsx(341,130): error TS2322: Type 'boolean' is not assignable to type 'string'.
app/page.tsx(350,130): error TS2322: Type 'boolean' is not assignable to type 'string'.
app/page.tsx(359,130): error TS2322: Type 'boolean' is not assignable to type 'string'.
app/page.tsx(368,130): error TS2322: Type 'boolean' is not assignable to type 'string'.
app/page.tsx(572,276) ... (14 more, same shape, lines 572–589)
app/page.tsx(662,32): error TS2322: Type 'string' is not assignable to type 'number'.
```
23 errors total, all traced to Bugs 1 and 2 above. Exit code 2.

### `npm run build`
```
✓ Compiled successfully in 1692ms
Linting and checking validity of types ...
Failed to compile.
./app/page.tsx
[... no-img-element warnings on the intentionally-unconverted <img> tags ...]
301:178  Error: `'` can be escaped with `&apos;`, ...  react/no-unescaped-entities
503:189  Error: ... react/no-unescaped-entities
603:216  Error: ... react/no-unescaped-entities
620:128  Error: ... react/no-unescaped-entities
620:186  Error: ... react/no-unescaped-entities
628:145  Error: ... react/no-unescaped-entities
./lib/liquid-ether.ts / ./lib/stroke-text.ts — pre-existing warnings, unrelated
```
6 errors, all traced to Bug 3 above. Exit code 1. (Next's combined lint+type
step appears to stop at ESLint's errors before reaching the TS2322 errors —
both are real, confirmed independently via the two runs above.)

### `node --test lib/behaviors/ssr.test.mjs`
```
# tests 3
# pass 3
# fail 0
```
All 3 pass, unaffected by this task (I did not touch `lib/behaviors/*`).

### Broader regression check (not a required gate, ran anyway)
`node --test tools/*.test.mjs lib/*.test.mjs lib/behaviors/*.test.mjs` → 37/37 pass.

---

## Files changed

- `app/page.tsx` — replaced (create-next-app scaffold → real homepage)
- `app/modules.ts` — new
- `package.json` — added `image-size` to `devDependencies`
- `package-lock.json` — npm-managed lockfile update from the install

## Self-review findings

- **Fidelity:** 7 removed / 16 added lines vs `.source/jsx/home.jsx`, all
  accounted for (wrapper, 5 image swaps, 2 mounts) — see table above.
- **classNames:** spot-checked 3 long strings, byte-identical.
- **Stability:** `HOME_MODULES` is a module-level `export const`; page
  references it directly, no inline array.
- **Discipline:** nothing under `tools/`, `lib/`, `components/` touched; no
  `Nav`/`MenuOverlay`/`Footer` created.

## Concerns for you to decide on

1. **Two converter bugs block a clean build** (empty-string attributes
   serializing bare; numeric attributes not coerced). I have not fixed
   `tools/convert.mjs` per your instructions. Once fixed there, re-running
   `node tools/convert.mjs home` and re-pasting (same procedure as this
   task) should carry the fix through with no other change needed — I
   verified this empirically (see "Verification" above).
2. **Unescaped apostrophes are a third, separate bug** in the same family
   (text-node serialization), only visible via `npm run build`/ESLint, not
   `tsc`. Worth fixing in the same convert.mjs pass that already escapes
   `{`/`}` in text nodes.
3. **`'use client'` on `app/page.tsx`** — I added this because it's
   required by `AgRuntime`'s existing contract (a function-array prop from
   a Server Component to a Client Component cannot serialize). This will
   very likely recur on every other page task (6 more), since they'll all
   mount `AgRuntime` the same way. If a zero-client-JS homepage was the
   actual intent, the fix would live in `components/AgRuntime.tsx` (e.g.
   constructing/importing `SHARED` inside the client component instead of
   receiving functions as a prop) — that's out of my scope to change, so
   I'm flagging it rather than guessing.
4. Given (1) and (2), `npm run build` and `tsc --noEmit` are **not clean**
   on the committed file, which is why this is DONE_WITH_CONCERNS rather
   than DONE. The page itself, and the fidelity of the conversion, are
   verified correct.

---

# Fix Round 1

## Status: DONE

Authorised to modify `tools/convert.mjs` and `tools/convert.test.mjs` this
round. All three converter bugs are fixed at the source, `app/page.tsx` no
longer carries `'use client'` (a thin `app/home-runtime.tsx` wrapper owns
that boundary instead), and all gates are clean: `npx tsc --noEmit` (exit
0), `npm run build` (exit 0, `✓ Generating static pages (4/4)`), the ssr
test (3/3), and the broader `tools`/`lib` regression suite (45/45).

## Root cause, understood at the library level (not guessed)

Before touching anything I read `node_modules/node-html-parser`'s own
serialization code. The exact bug, in the library's `HTMLElement`:

```js
quoteAttribute(attr) {
  if (attr == null) return "null";
  return `"${attr.replace(/"/g, "&quot;")}"`;
}
// used identically inside setAttribute / removeAttribute / setAttributes:
const val = this.quoteAttribute(attrs[name]);
if (val === "null" || val === "\"\"") return name;   // <- bare token
return `${name}=${val}`;
```

`setAttribute`/`removeAttribute` re-serialize **every** attribute on an
element each time either is called for **any** attribute on it (they
rebuild the whole `rawAttrs` string from the current attribute map). The
library conflates two different source states into the same bare output:
a genuinely valueless attribute (`<input disabled>`, parsed internally as
`null`) and one explicitly written empty (`alt=""`, parsed as `''`) both
print bare. JSX reads a bare attribute as `{true}`, which is correct for
the first case and wrong for the second.

This also explains why my first attempt at a discriminating test for Fix 1
didn't discriminate at all: an element whose *only* attribute is the empty
one never calls `setAttribute`/`removeAttribute`, so the buggy collapse
never fires, and the bug is invisible on such an input regardless of
whether the fix is present. I caught this by literally performing the
"prove it by mutation" step you asked for — removing the fix and watching
the test still pass — before shipping it. The corrected tests include a
`style` attribute alongside the empty one, which is what forces the
re-serialization path on every real occurrence (all 22 real `alt=""`
attributes sit next to a `style` attribute of their own).

## Fix 1 — empty attribute values

`tools/convert.mjs`, new step 3c, runs once per element after every other
rule has finished touching it:

```js
const finalAttrs = el.rawAttributes;
el.rawAttrs = Object.keys(finalAttrs).map((name) => {
  const v = finalAttrs[name];
  return v == null ? name : `${name}=${el.quoteAttribute(v)}`;
}).join(' ');
delete el._rawAttrs;
```

Reuses the library's own `quoteAttribute` for the actual quoting/escaping
(no reinvented escaping logic), and only changes the *decision* of when to
go bare: `null` (genuinely valueless in the source) stays bare; every other
value, including `''`, is always quoted. General fix, not `alt`-specific —
verified against `data-ag-logo=""` and `data-hover-img=""` too (both real,
both previously collapsed to bare, both now explicit in the regenerated
`home.jsx`).

**Companion fix, in scope:** the coordinator's numeric-attribute list
includes `minLength`, but `ATTRS` had `maxlength: 'maxLength'` with no
`minlength` counterpart — `minLength` would have been unreachable dead
code in `NUMERIC_ATTRS` (the attribute would stay lowercase `minlength`
forever, never matching). Added `minlength: 'minLength'` next to
`maxlength`. Confirmed unused in all 7 real templates today, so this is
forward-looking, not a live bug.

**Mutation proof (removed step 3c, ran the suite, restored):**
```
not ok 15 - an empty attribute value is emitted explicitly, not collapsed to a bare token
not ok 16 - the empty-attribute fix is general, not special-cased to alt
# pass 20 / # fail 2
```
Everything else, including "a genuinely valueless source attribute is left
bare" (test 17), stayed green — confirming that test is independent of
this fix, as intended.

## Fix 2 — numeric attribute coercion

New constant and a new post-`root.toString()` regex pass:

```js
const NUMERIC_ATTRS = ['rows', 'cols', 'span', 'colSpan', 'rowSpan', 'maxLength', 'minLength', 'size', 'start'];
...
const numericAttrPattern = new RegExp(`\\b(${NUMERIC_ATTRS.join('|')})="(\\d+)"`, 'g');
out = out.replace(numericAttrPattern, (_m, name, digits) => `${name}={${digits}}`);
```

Only a plain digit run converts; anything else is left as a quoted string
(same failure mode as before, not a broken expression). `\b` prevents
matching a numeric name as the tail of an unrelated attribute (e.g.
`aria-rowspan`, a distinct, string-typed ARIA attribute). `width`/`height`
are deliberately absent, per instructions.

**Mutation proof A (removed the whole step):**
```
not ok 18 - numeric attributes become JSX number expressions
not ok 19 - numeric coercion applies after the html-attribute rename, not before
# pass 20 / # fail 2
```
**Mutation proof B (added `width`/`height` back to the list — the
explicitly-rejected expansion):**
```
not ok 20 - width and height are left as JSX strings, not coerced to numbers
# pass 21 / # fail 1
```

## Fix 3 — unescaped entities in text

Extended the existing single-regex text-escaping pass (step 5) to also
handle `'`, `"`, `>`, alongside the existing `{`/`}`:

```js
out = out.replace(/>([^<]*)</g, (m, text) => {
  if (!/[{}'">]/.test(text)) return m;
  const escaped = text.replace(/[{}'">]/g, (c) => {
    if (c === '{') return "{'{'}";
    if (c === '}') return "{'}'}";
    if (c === "'") return '&apos;';
    if (c === '"') return '&quot;';
    return '&gt;';
  });
  return '>' + escaped + '<';
});
```

Kept as one `.replace()` call with one replacer function, per the existing
code comment's own warning: a chain of separate `.replace()` calls would
let a later pass re-mangle an earlier pass's inserted output (e.g. the
apostrophe inside `{'{'}`). Extended that same comment to explain the new
characters.

**Mutation proof (reverted to the original `{}`-only regex):**
```
not ok 21 - apostrophes, quotes and > in text are escaped for JSX
not ok 22 - mixed braces and entities in one text node are not corrupted
# pass 20 / # fail 2
```

### Verifying rendered text is genuinely unchanged (not just "build passes")

Two independent checks, not one:

1. **Compiled the exact JSX through TypeScript's own transform** (the same
   tool that processes `app/page.tsx`):
   ```js
   ts.transpileModule('const el = <p>Don&apos;t &quot;quote&quot; a &gt; b { }</p>', {...})
   // -> var el = React.createElement("p", null, "Don't \"quote\" a > b ");
   ```
   The decoded string is byte-identical to the original, pre-escaping text.
2. **Inspected the real prerendered HTML** the finished build actually
   produced (`.next/server/app/index.html`), grepping for the five
   sentences that contain the six apostrophes:
   ```
   DON'T TAKE OUR
   can't do
   WE DON'T JUST DESIGN
   We'll happily talk through the stack if you want to, but you're buying...
   Founders don't need
   ```
   All present as literal characters; a search for leaked `&apos;` text in
   the rendered output matched zero times. This is the actual output of the
   real toolchain, not a simulation.

## Re-ran the converter over all seven templates

```
home       -> wrote .source/jsx/home.jsx        exit=0
about      -> wrote .source/jsx/about.jsx       exit=0
services   -> wrote .source/jsx/services.jsx    exit=0
studio     -> wrote .source/jsx/studio.jsx      exit=0
careers    -> wrote .source/jsx/careers.jsx     exit=0
contact    -> wrote .source/jsx/contact.jsx     exit=0
case-study -> wrote .source/jsx/case-study.jsx  exit=0
```
The completeness guard stayed silent on every page; the escaping/attribute
changes touch text and attribute serialization only, never tag names or
`style-`/`sc-` attribute names, so there was no reason to expect otherwise,
but it was confirmed rather than assumed.

## Fix 4 — `HomeRuntime`, replacing `'use client'` on the page

Created `app/home-runtime.tsx` exactly as specified: a `'use client'`
one-function wrapper that imports `AgRuntime` and `HOME_MODULES` and
renders `<AgRuntime modules={HOME_MODULES} />`. `app/page.tsx` no longer
has `'use client'` at all, no longer imports `AgRuntime` or `HOME_MODULES`
directly, and renders `<ContactPill />` (still direct — it's already
`'use client'` itself) and `<HomeRuntime />` in place of the old
`<AgRuntime modules={HOME_MODULES} />`.

Effect on the actual build output — Route `/`:
| | Before (`'use client'` on page.tsx) | After (`HomeRuntime` wrapper) |
|---|---|---|
| Page size | 20.5 kB | 8.72 kB |
| First Load JS | 123 kB | 111 kB |

The ~700 lines of static markup no longer ship for hydration; only the
thin runtime boundary does.

## Regenerated fidelity diff: `app/page.tsx` vs `.source/jsx/home.jsx`

`diff -u .source/jsx/home.jsx app/page.tsx`: **8 removed, 14 added** (down
from 7/16 in the first round — no `'use client'` line now, and one
`HomeRuntime` import replaces the previous two `AgRuntime`/`HOME_MODULES`
imports). Every changed line is still one of the three permitted buckets;
the `data-ag-logo`/`data-hover-img` wrapper `div`s now correctly carry
`=""` in **both** files identically (Fix 1 applies to the whole page), so
that change does not appear in this diff at all — only the deltas below do:

- **Wrapper** (2 removed / 8 added): the converter's 2 leading + 2 trailing
  incidental blank lines, replaced by 3 imports (`Image`, `ContactPill`,
  `HomeRuntime`) + `export default function Home() {` + `return (` at the
  top, and `);` + `}` at the bottom.
- **`next/image` swaps** (5 removed / 5 added): same five as before — logo
  (422×133, priority) and the four work-card visuals (Agasti Realty
  868×488 priority; Redpanda Outdoor, Orbital, Margin Press all
  1920×1080). Substrings updated to match the now-explicit
  `data-ag-logo=""`/`data-hover-img=""`, re-verified unique before
  replacing.
- **Component mounts** (0 removed / 2 added): `<ContactPill />` and
  `<HomeRuntime />`.

classNames spot-checked again post-regeneration: byte-identical.
`app/modules.ts` is unchanged (still the module-level `HOME_MODULES`
constant); `home-runtime.tsx` is now what imports it.

## Gate output (final)

**`npx tsc --noEmit`**: exit 0, no output.

**`npm run build`**: exit 0.
```
✓ Compiled successfully in 2.2s
Linting and checking validity of types ...
./app/page.tsx — no-img-element warnings only, on the images intentionally left as <img> (unchanged from round 1)
./lib/liquid-ether.ts, ./lib/stroke-text.ts — pre-existing warnings, unrelated to this task
Generating static pages (4/4)
Route (app)                                 Size  First Load JS
┌ ○ /                                    8.72 kB         111 kB
└ ○ /_not-found                            990 B         104 kB
```

**`node --test lib/behaviors/ssr.test.mjs`**: 3/3 pass.

**`node --test tools/*.test.mjs lib/*.test.mjs lib/behaviors/*.test.mjs`**
(broader regression check, not a required gate): 45/45 pass — includes
all 9 new converter tests plus every pre-existing test in the repo.

## Files changed this round

- `tools/convert.mjs` — Fixes 1, 2, 3 (see diff above); one companion
  `ATTRS` entry (`minlength`→`minLength`)
- `tools/convert.test.mjs` — 9 new tests, each mutation-proven
- `app/page.tsx` — regenerated: no `'use client'`, `HomeRuntime` in place
  of direct `AgRuntime`/`HOME_MODULES`, same 5 `next/image` swaps
- `app/home-runtime.tsx` — new, exactly as specified

## Self-review

- **Fidelity:** 8 removed / 14 added vs regenerated `home.jsx`, all three
  permitted buckets, none other.
- **classNames:** re-spot-checked, byte-identical.
- **Stability:** `HOME_MODULES` still a module-level constant in
  `app/modules.ts`, unchanged; `HomeRuntime` passes it straight through.
- **Discipline:** only `tools/convert.mjs` and `tools/convert.test.mjs`
  touched under the newly-authorised scope; `lib/` and `components/`
  untouched (`git status` confirms).
- Every new test is whole-string `assert.equal`, matching this file's
  established convention (the file's own header comment explains why
  substring/regex checks are insufficient), and every one was proven by an
  actual removal-and-rerun mutation, not merely reasoned about.

## Concerns

None outstanding from this round. The two items flagged as open questions
in round 1 (whether `AgRuntime` should own `SHARED` internally, and the
converter bugs) are both resolved: the wrapper pattern answers the first,
and Fixes 1–3 answer the second.
