# Task 6a Report: template-to-JSX converter

Commit: `c2ba5ea` — "feat: add template-to-JSX converter (tools/convert.mjs)"

**Fix round 1 appended below** (commit `ee94b68`) — see "Fix Round 1" section at the end.
**Fix round 2 appended below** (commit `43e3266`) — see "Fix Round 2" section at the end.

## What I implemented

- `tools/convert.test.mjs` — the brief's 8 tests, all rewritten to assert whole-string equality on the converted fragment (see Discrimination section).
- `tools/convert.mjs` — `convert(html, assets)` plus the CLI entry point, implemented per the brief with one bug fix (see below). Only imports `node-html-parser` and `./tw.mjs` (`styleToClasses`); no new dependencies; `tw.mjs` was not modified.

### The one deviation from the brief's sample code: brace-escaping fix

Step 5 of the brief's sample does:
```js
text.replace(/\{/g, "{'{'}").replace(/\}/g, "{'}'}")
```
This is buggy: each replacement string (`"{'{'}"`, `"{'}'}"`) itself contains one literal `{` and one literal `}`, so the **second** `.replace()` call re-scans and mangles the output the **first** call just inserted. For input `a { b } c` this produces `a {'{'{'}'} b {'}'} c` instead of the correct `a {'{'} b {'}'} c`. I replaced it with a single regex pass using a replacer function (`text.replace(/[{}]/g, c => ...)`), which processes each original character exactly once and cannot see its own output.

I did not change anything else — `ROUTES`, `ATTRS`, and `VOID` are verbatim from the brief (see "Concern" below on `ROUTES`).

## TDD Evidence

**RED** — `node --test tools/convert.test.mjs` before `convert.mjs` existed:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\tools\convert.mjs'
imported from ...\tools\convert.test.mjs
# fail 1
```
Failed for the expected reason (missing module), not a logic error.

**GREEN** — `node --test tools/convert.test.mjs` after writing `convert.mjs`:
```
# tests 8
# pass 8
# fail 0
```
All 8 passed on the first run against the real implementation (i.e. my hand-derived expected strings, reasoned from node-html-parser's actual, empirically-verified behaviour, matched the real output immediately).

## Discrimination assessment (per test)

Every test was rewritten from the brief's `assert.match`/substring-presence style to `assert.equal` on the entire returned string. A substring check can pass while something else nearby is wrong (extra attribute, wrong order, partial corruption); whole-string equality cannot. I traced each one by hand against the real `node-html-parser` semantics (verified empirically — attribute insertion order, void-tag serialization, entity round-tripping — via small scratch scripts, not assumed) before running, then confirmed the derivation was right when the tests passed unchanged on the first try.

1. **style becomes className** — would fail if style→class mapping broke (attribute would stay `style=...`, or classes would be wrong/incomplete) or if the `style` attribute weren't removed. Discriminates.
2. **style-hover** — would fail if the `hover:` prefix were dropped, if `style-hover` weren't removed, or if the base/hover class order changed. Discriminates.
3. **HTML attribute renames** — would fail if any of `for`/`tabindex`/`class`→`htmlFor`/`tabIndex`/`className` were missing from `ATTRS`, or if attribute order changed. Discriminates. (The brief's original version only checked `!/\sclass=/.test(out)` plus presence of the two renamed attributes — it never actually checked that the *value* of the pre-existing `class="x"` survived the merge into `className`. Equality now checks that too.)
4. **viewBox restored** — would fail if the `sc-camel-view-box` → `viewBox` entry were removed from `ATTRS`. Discriminates.
5. **image-slot → img** — strengthened beyond the brief: the brief's version only checked `<img` presence, `src=`, `alt=`, and absence of the string `image-slot`; it never checked the tag was actually self-closed. I added the trailing `/>` to the expected string, so a regression that renames the tag correctly but leaves it as `<img ...></img>`-shaped (invalid JSX) is now caught here, independent of test 6. Discriminates on: asset-map lookup, `alt` from `placeholder`, the hardcoded `h-full w-full object-cover` class, attribute-clearing, and self-closing.
6. **void elements self-closed** — would fail if the `VOID` set or the self-closing regex were removed/broken (output would keep bare `<br>`, `<img src="x">`). Discriminates for genuinely-void-in-source tags (complementary to test 5, which covers the image-slot-derived path).
7. **internal links → routes** — would fail if the `ROUTES` lookup were removed (href would stay as the encoded `.dc.html` filename). Discriminates for the exact key format in the brief's table — see the real-data finding below for what it does *not* cover.
8. **braces escaped for JSX** — this is the one the task brief was explicitly unsure about, correctly. I **empirically demonstrated** the vacuousness: I temporarily reverted `convert.mjs` to the brief's buggy sequential `.replace().replace()`, re-ran the suite, and got:
   ```
   ok 1-7 (all other tests)
   not ok 8 - braces in text are escaped for JSX
   ```
   My `assert.equal` catches the corruption. The brief's original `assert.match(out, /\{'\{'\}/)` would **not** — the corrupted string `a {'{'{'}'} b {'}'} c` still contains the substring `{'{'}`, so that regex still matches. I restored the fixed single-pass implementation afterward and confirmed all 8 pass again.

None of the 8 tests are vacuous now; all were strengthened (not just #8).

## Seven-template sanity run

Ran `node tools/convert.mjs <slug>` for all seven slugs; all succeeded and wrote `.source/jsx/<slug>.jsx`.

| Template | Output size | `style=` | `class=` (bare) | `image-slot` | `sc-camel-view-box` | `.dc.html` |
|---|---|---|---|---|---|---|
| home | 84,608 B | 0 | 0 | 0 | 0 | 0 |
| about | 27,616 B | 0 | 0 | 0 | 0 | 0 |
| services | 52,104 B | 0 | 0 | 0 | 0 | 0 |
| studio | 32,278 B | 0 | 0 | 0 | 0 | 0 |
| careers | 35,712 B | 0 | 0 | 0 | 0 | 0 |
| contact | 20,572 B | 0 | 0 | 0 | 0 | 0 |
| case-study | 24,537 B | 0 | 0 | 0 | 0 | 0 |

All five explicitly-requested checks are clean across all seven outputs.

Additional checks I ran beyond the required five, because "finding a real defect is more valuable than eight green tests":

- **Void-element self-closing at scale**: every single `<img>`, `<br>`, `<input>` in all seven outputs is self-closed (ratios were N/N in every file and every tag — e.g. `img(46/46)` in home.jsx, `input(3/3)` in contact.jsx). No exceptions found.
- **No `undefined` / `[object Object]` artifacts** in any output (a common symptom of a broken map lookup) — none found in any of the 7 files.
- **No unescaped space inside a Tailwind arbitrary value** (`Fact #4`'s failure mode — silently emits nothing) — searched all 7 outputs for a bare space between `[` and `]` in a class utility; none found. `escapeValue` discipline (via `tw.mjs`) held at scale.
- **`style-hover` fully removed** — 0 occurrences in any output.
- **Attribute renames actively exercised on real data** (not just the synthetic tests): `htmlFor`, `tabIndex`, `strokeWidth`, `clipPath`, `fontFamily`, `stopColor` all appear in the real outputs.
- **`border-0` / numeric-font-weight classes**: 293 occurrences across all 7 files combined — the two "known quirks" from Fact #2 are exercised and handled correctly at scale.
- **JSX syntactic validity**: wrapped each of the 7 outputs in a minimal `<>...</>` fragment and ran it through the TypeScript compiler (`ts.transpileModule` with `jsx: ReactJSX`) as a parse-only check. All 7 parse with **zero syntax errors**.

## Real-data finding: `ROUTES` table only matches `.dc.html`, but six of seven templates use bare `.html`

This is the significant finding, and I did **not** fix it myself — per the instructions to stop and report rather than improvise a fix to something the brief didn't anticipate, since this is exactly the "attributes/table the rename table misses" category called out in "While You Work."

`home.html`'s internal nav links are all suffixed `.dc.html` (e.g. `Arohance%20Studio.dc.html`), matching the `ROUTES` table exactly. But **every other template** (`about`, `services`, `studio`, `careers`, `contact`, `case-study`) uses the **same link text with a bare `.html` suffix instead** (e.g. `Arohance%20Studio.html`, no `dc`), consistently, for every internal link in every one of those six files. I confirmed this is not a mix within a file — it's a clean per-template split: home always uses `.dc.html`, the other six always use bare `.html`.

Because the `ROUTES` table (as given in the brief, which I implemented verbatim) only has `.dc.html`-suffixed keys, none of these bare-`.html` links match, and they survive completely unconverted in the output — not as a `.dc.html` string (so the literal "no unconverted `.dc.html` links" check passes trivially and would not have caught this), but as broken internal links pointing at a `.html` file that will never exist as a Next.js route.

Exact counts of unconverted `href="Arohance%20*.html"` per output file:

| Template | Unconverted bare-`.html` links |
|---|---|
| home | 0 |
| about | 11 |
| careers | 11 |
| services | 10 |
| contact | 15 |
| studio | 17 |
| case-study | 17 |
| **Total** | **81** |

Concrete example, from `about.jsx`:
```jsx
<a href="Arohance%20Studio.html" className="flex items-center justify-between gap-4 bg-[#F5F2ED] ...">More news <span>→</span></a>
<a data-ag-mlink href="Arohance%20Services.html" className="flex items-baseline justify-between gap-4 ...">Services <span className="text-[.5em] text-[#8A857B]">→</span></a>
```

I traced this back to source and confirmed it's a property of the original design-tool export (not something my converter introduced): `about.html` line 293 has `href="Arohance%20Studio.html"`; `home.html` line 294 has `href="Arohance%20Studio.dc.html"` for the identical nav link. This needs a ruling before Task 6b/7: most likely fix is normalizing both suffixes in `ROUTES` lookup (e.g. stripping an optional `.dc` before matching, or adding six more literal keys), but I left the table untouched since that's a judgment call about the converter's mapping rules, which I was told to bring to you rather than decide myself.

## Anything in the real templates that surprised you

- **The `ROUTES`/`.dc.html` vs bare-`.html` split above** — the main surprise, detailed above.
- **Zero `{`/`}` characters exist anywhere in the body of any of the seven real templates.** I confirmed this by slicing each template exactly the way the CLI does and counting braces in the sliced body: all seven are 0. This means the brace-escaping rule (test 8) has **no real-world coverage at all** in this dataset — which is exactly why hand-verifying it against a synthetic case (and empirically catching the sequential-replace bug) mattered; the seven-template run would never have surfaced that bug on its own.
- **The `</helmet>` slice is safe for all seven** (Fact #2's specific ask): each template has exactly one `</helmet>` and exactly one `<script type="text/x-dc">` marker, in that order, with a positive-length body between them. Verified programmatically, not just spot-checked.
- **Every `image-slot` in all seven templates is a leaf with no children** (31 total, and `<image-slot` open-tag count exactly equals `</image-slot>` close-tag count in every file) — no nesting anywhere, so `el.set_content('')` in the image-slot→img step never silently discards real content.
- **A dangling, unmatched `</x-dc>` at the very end of every sliced body** — the whole document (helmet + body) is wrapped in a single `<x-dc>` root tag that opens *before* `</helmet>`, so slicing after `</helmet>` inevitably leaves the closing `</x-dc>` with no matching open tag in the fragment. I confirmed `node-html-parser` silently and correctly drops this unmatched closing tag during parsing (verified empirically) — it does not appear in any output and does not corrupt anything nearby. Benign, but worth recording since it's a direct consequence of the documented slice boundary, not something to "fix."
- **`node-html-parser`'s behavior around tag renaming and void elements**, verified empirically since the brief's self-closing regex has a subtle-looking edge case (a negative lookahead that skips tags immediately followed by their own closing tag) that would matter if the parser ever serialized a renamed void tag with an adjacent closing tag. It never does: regardless of whether the source had `<img src="x">`, `<img src="x"/>`, or `<image-slot>...</image-slot>` renamed to `img`, `.toString()` always emits a single bare opening tag with no closing tag at all for void tag names. So that edge case in the reference regex is dead code in practice, not a live bug — confirmed by direct experiment before relying on it, not assumed.
- **HTML entities (`&amp;`, `&nbsp;`, `&rsquo;`, etc. — 61 occurrences across the seven templates) round-trip as literal entity text**, unchanged, through `node-html-parser`. This is correct for our purposes: JSX text/attribute literals decode named HTML entities the same way HTML does, so the entity text surviving unchanged into the `.jsx` output will render identically to the original page.
- Every `image-slot`'s `shape` attribute is `"rect"` in real data (31/31) — the converter ignores `shape` entirely (per the brief), and there was nothing to flag since no other shape value ever appears.
- No `srcset`, `xlink:href`, `preserveAspectRatio`, or other SVG/responsive-image attributes covered defensively in `ATTRS` actually appear anywhere in real data — that coverage is unused but harmless.

## Files changed

- `tools/convert.mjs` (new)
- `tools/convert.test.mjs` (new)
- Nothing else. `git status --short` after committing shows a clean tree; `tools/tw.mjs`, `tools/unbundle.mjs`, and their tests were only read, never edited (`tw.test.mjs` re-run at the end still passes 12/12 unchanged). No `lib/`, `components/`, or `package.json` changes. No new dependencies — only `node-html-parser` (pre-existing devDependency) and `node:fs` builtins are imported.

`.source/jsx/*.jsx` (7 files, gitignored via `.source/` in `.gitignore`, confirmed not staged/committed) were generated by the sanity run and left in place, since Task 6b's brief explicitly expects to work from `.source/jsx/home.jsx`.

## Self-review findings, issues, and concerns

- **Escaping discipline**: `convert.mjs` never constructs a Tailwind arbitrary value itself — every class either comes from `styleToClasses` (which routes through `escapeValue` internally) or is a static hardcoded literal (`h-full w-full object-cover`) or a pre-existing, unmodified `class` attribute value. Nothing in `convert.mjs` needed to call `escapeValue` directly, and it doesn't. Verified at scale (all 7 real outputs) that no arbitrary-value bracket contains a raw unescaped space.
- **Two-file discipline held**: only `tools/convert.mjs` and `tools/convert.test.mjs` were created; `tw.mjs`/`unbundle.mjs` untouched; no new dependencies.
- **Concern (needs your ruling, not fixed by me)**: the `ROUTES`/bare-`.html` gap above — 81 internal links across 6 of 7 pages will render as dead `<a>` tags pointing at non-existent `.html` files unless `ROUTES` (or the lookup against it) is extended before Task 7 runs the converter for real. I deliberately did not patch this.
- **Minor, not a concern**: test 8's rule has zero coverage from the real templates (no braces exist in any of them), so its correctness rests entirely on the synthetic test — which is exactly why I verified it by construction/mutation rather than trusting the brief's sample.
- I do not consider the `</x-dc>` dangling-tag behavior or the void-tag-renaming edge case to be defects — both were verified empirically to resolve harmlessly, not just assumed safe.

---

## Fix Round 1

Commit: `ee94b68` — "fix: normalise both link-suffix spellings and fail loudly on unmapped links"

Addresses the coordinator's ruling on the `ROUTES` finding above: the independent count was **96** internal `Arohance*` links total (not 81 — my original count used a regex anchored to end exactly at `.html"`, which silently missed the one link that carries a `#fragment`; see "revised count" below), of which home's 14 use `.dc.html` and the other **82** use bare `.html`. There is also a fragment case (`Arohance%20Homepage.html#work`, in `services.html`) that a suffix-only fix would still miss.

### What changed

**`ROUTES` → `PAGE_ROUTES` + `toRoute()`.** Replaced the exact-match table with the coordinator's suffix/fragment-agnostic version verbatim:
```js
const toRoute = (href) => {
  const m = /^(Arohance(?:%20|\s).*?)(?:\.dc)?\.html(#.*)?$/i.exec(href);
  if (!m) return null;
  const route = PAGE_ROUTES[decodeURIComponent(m[1])];
  return route ? route + (m[2] || '') : null;
};
```
Matches both `.dc.html` and bare `.html`, and appends any `#fragment` onto the resolved route (`'/' + '#work'` → `'/#work'`).

**Unmapped internal links now fail loudly.** `convert()` collects (in a `Set`, across the whole document) every `href` value that starts with `"Arohance"` but for which `toRoute()` returns `null`, and throws once at the end listing all of them:
```js
if (unresolved.size) {
  throw new Error(`convert: unmapped internal link(s): ${[...unresolved].join(', ')}`);
}
```
I chose "collect across the whole document, throw once" over "throw on first match" so one CLI run surfaces every broken link, not just the first — you shouldn't have to fix-and-rerun seven times to find them all. I chose a thrown `Error` (over a returned diagnostics list) because it's the minimal change that keeps `convert(html, assets): string`'s documented return type intact — the CLI already has a natural place to catch it.

**The CLI catches it and exits non-zero:**
```js
try {
  jsx = convert(body, assets);
} catch (err) {
  console.error(`convert failed for ${slug}: ${err.message}`);
  process.exit(1);
}
```

**Scoped to the `href` attribute specifically, not any attribute value.** This mattered in practice, not just in theory: every one of the seven templates' shared nav has `alt="Arohance, Tech &amp; Marketing"` on the logo `<img>`. That value starts with `"Arohance"` but is obviously not a link. Checking by value alone (`v.startsWith('Arohance')` on any attribute) would have thrown on every single page. I verified this is real, not hypothetical, by grepping all seven templates before writing the fix — each has exactly one such non-href `Arohance`-prefixed attribute, and it's always this alt text.

### Revised real-data count (corrected from my original report)

My original 81-count used the regex `href="Arohance%20[^"]*\.html"`, which requires the attribute value to end exactly at `.html"`. That regex cannot match a value with a trailing `#fragment` (`.html#work"` doesn't end in `.html"`), so it silently undercounted by exactly the one fragment link in `services.html`. Recounting with an unanchored `href="(Arohance[^"]*)"` pattern against each template's sliced body (i.e. counting every `Arohance`-prefixed href regardless of what follows `.html`) gives:

| Template | Arohance-prefixed hrefs | Non-href `Arohance`-prefixed attrs (informational) |
|---|---|---|
| home | 14 | 1 (logo alt) |
| about | 11 | 1 |
| careers | 11 | 1 |
| services | 11 | 1 |
| contact | 15 | 1 |
| studio | 17 | 1 |
| case-study | 17 | 1 |
| **Total** | **96** | 7 |

96 total, 14 already-`.dc.html` (home) + 82 bare-`.html` (everyone else) — matches the coordinator's independently-verified count exactly. This 96 also matches, one-for-one, the count of `href="/..."` routes produced by the fixed converter below.

### TDD evidence for the fix

**Tests added** (3, appended after the existing "internal artifact links become routes" test, which is unchanged and still passes — it's the `.dc.html` case):

1. `internal links convert from both suffix spellings, preserving fragments` — the coordinator's example, strengthened from `assert.match` to `assert.equal` on the whole tag (consistent with round 1): both-suffix `/about`/`/case-study` cases, the homepage `/` case, and the fragment-preserving `Arohance%20Homepage.html#work` → `/#work` case.
2. `non-internal hrefs and Arohance-prefixed non-href attributes are left untouched` — my own addition, guarding the `href`-only scoping decision above (mailto:/#fragment-only hrefs untouched, and the real `alt="Arohance, Tech &amp; Marketing"` case specifically).
3. `an unmappable internal link is reported, not silently passed through` — the coordinator's example, strengthened with a message-content check (`assert.throws(fn, /Arohance%20Nonexistent\.html/, ...)`) so the test also confirms the thrown error actually names the offending link, not just that *something* throws.

**Discrimination, verified by mutation** (temporarily reintroduce each regression, confirm exactly one test fails, restore, confirm 11/11 again):

| Mutation | Result |
|---|---|
| Reverted `toRoute` to exact-match `.dc.html`-only (no bare-suffix/fragment support) | Only test 8 (`...both suffix spellings...`) failed. 10/11 pass. |
| Kept `toRoute`, removed the `unresolved`/throw logic (restored old silent pass-through) | Only test 10 (`...unmappable internal link is reported...`) failed. 10/11 pass. |
| Broadened the check from `name.toLowerCase() === 'href'` to any attribute | Only test 9 (`...non-internal hrefs...`) failed — specifically on the logo `alt` case. 10/11 pass. |

Each mutation produced exactly one isolated failure with zero collateral damage, confirming the three tests pin three independent, correctly-scoped behaviors rather than overlapping or vacuous checks.

**RED→GREEN:** `node --test tools/convert.test.mjs` — after adding the tests but before restoring the correct implementation (i.e. during the mutation passes above) — showed the expected single failures per mutation; after restoring the fix:
```
# tests 11
# pass 11
# fail 0
```

### Seven-template re-run

Re-ran `node tools/convert.mjs <slug>` for all seven slugs. All exited 0 (meaning zero unmapped links on every real page):
```
=== home ===       wrote .source/jsx/home.jsx        exit=0
=== about ===       wrote .source/jsx/about.jsx        exit=0
=== services ===    wrote .source/jsx/services.jsx     exit=0
=== studio ===      wrote .source/jsx/studio.jsx       exit=0
=== careers ===     wrote .source/jsx/careers.jsx      exit=0
=== contact ===     wrote .source/jsx/contact.jsx      exit=0
=== case-study ===  wrote .source/jsx/case-study.jsx   exit=0
```

Per-template count of links successfully rewritten to routes (`href="/..."` in the output):

| Template | Rewritten links |
|---|---|
| home | 14 |
| about | 11 |
| careers | 11 |
| services | 11 |
| contact | 15 |
| studio | 17 |
| case-study | 17 |
| **Total** | **96** |

Matches the expected total exactly. Confirmed zero survivors: `grep "href=\"Arohance" .source/jsx/*` → 0 matches across all seven outputs. Spot-checked every remaining occurrence of the literal text `"Arohance"` anywhere in the outputs (7–2 per file) and confirmed each is legitimate non-link content — the nav-logo `alt` text, a case-study credits list ("Creative direction … Arohance"), and a footer copyright line ("© 2026 Arohance") — not a missed link.

**CLI failure path proven end-to-end, not just at the unit-test level.** Built a synthetic one-line template containing `<a href="Arohance%20Nonexistent.html">bad</a>` inside a `<helmet></helmet>...<script type="text/x-dc">` shell, pointed the real CLI at it, and got:
```
convert failed for broken: convert: unmapped internal link(s): Arohance%20Nonexistent.html
EXIT_CODE=1
```
Confirms the message names the specific broken link and the process exits non-zero, exactly as required.

**Full verification re-run:**
```
node --test tools/convert.test.mjs   -> # tests 11, # pass 11, # fail 0
npx tsc --noEmit                     -> exit 0, no output
```

### Two things noted, not fixed (per instruction)

- **Test 8 (brace escaping) has zero real-data coverage.** Unchanged from round 1: no `{` or `}` exists anywhere in any of the seven template bodies. The rule is still correct and the test still genuinely discriminates (proven in round 1 by mutation), it simply protects against content that doesn't exist yet. Recorded here again for Task 6b/7's awareness.
- **The dangling unmatched `</x-dc>` at the end of every sliced body.** Unchanged from round 1: the whole document is wrapped in a single `<x-dc>` tag opened before `</helmet>`, so the slice inevitably ends with an orphaned `</x-dc>`. Verified in round 1 that `node-html-parser` drops it harmlessly during parsing; it does not appear in any of the seven outputs. Recorded so Task 6b's component extraction isn't surprised by it (it won't see it either — it's already gone by the time `.source/jsx/*.jsx` is written).

### Files changed (fix round 1)

- `tools/convert.mjs` — `ROUTES` replaced by `PAGE_ROUTES` + `toRoute()`; `convert()` now collects and throws on unmapped internal links; CLI catches and exits non-zero.
- `tools/convert.test.mjs` — 3 tests added, 1 existing test unchanged.
- Combined diff: `git diff --stat` → `2 files changed, 87 insertions(+), 10 deletions(-)`.
- Nothing else touched. `git status --short` clean after commit; `tw.mjs`/`unbundle.mjs` still untouched; no new dependencies.

### Self-review for this round

- **Discrimination**: all 3 new/changed tests verified by mutation (table above) — each fails in isolation for exactly the regression it targets, no collateral failures.
- **Real data**: re-ran all seven templates; 96/96 links now resolve; zero false positives on the real non-link `Arohance`-prefixed alt text.
- **Escaping**: unaffected by this change — `toRoute()` returns plain route strings (`/about`, `/#work`), never a Tailwind class or arbitrary value, so `escapeValue` was never in scope here.
- **Discipline**: still exactly two files, no new dependencies, `tw.mjs` untouched.
- **Remaining concern**: none outstanding on the `ROUTES`/link-mapping front. The two carried-forward notes above (brace-escaping's lack of real-data coverage, and the benign `</x-dc>` artifact) are informational, not defects.

---

## Fix Round 2

Commit: `43e3266` — "fix: convert style-focus and sc-raw-select, add a completeness guard"

Two more real, silent defects in the brief's original rule set, plus a structural guard so this stops being a per-instance patch cycle.

### Census verification (before writing any fix)

Reproduced the coordinator's full census independently from the sliced template bodies (the same slice the CLI uses) before touching code:

| Construct | Count | Per-template breakdown |
|---|---|---|
| `style-hover` | 112 | unchanged from round 1 |
| `style-focus` | 18 | home 3, about 3, services 3, careers 4, contact 5 |
| `sc-raw-select` | 2 | careers 1, contact 1 |
| `x-dc` | 7 | one per template (the wrapper, as in round 1) |
| `image-slot` | 31 | unchanged from round 1 |
| `sc-camel-view-box` | 6 | unchanged from round 1 (careers has none, confirmed in round 1) |

All numbers matched the coordinator's exactly. Also read the actual markup directly: both `sc-raw-select` elements (`careers.html:536`, `contact.html:349`) carry exactly `name`, `style`, `style-focus`, and every one of their combined 12 `<option>` children is bare with no attributes — confirmed the coordinator's description rather than assuming it. Every `style-focus` occurrence, in both templates and inside the two selects, is the identical declaration `border-bottom-color:var(--ag-accent,#F2600C)`.

### What changed

**`style-focus` → `focus:` variant.** Mirrored the existing `style-hover` block in step 2 with a `'focus:'` prefix, removing the attribute the same way:
```js
const focus = el.getAttribute('style-focus');
if (focus) { classes.push(...styleToClasses(focus, 'focus:')); el.removeAttribute('style-focus'); }
```
`tw.mjs` has no `border-bottom-color` rule, so it falls back to its generic arbitrary-property path and emits `focus:[border-bottom-color:var(--ag-accent,#F2600C)]` — confirmed this is exactly what `styleToClasses` produces (no unexpected escaping, no bug in `tw.mjs`, which I did not touch).

**`<sc-raw-select>` → `<select>`.** Added a "step 1b", the same category of rule as `image-slot → img` but simpler — a direct tag rename only, since (per the coordinator's brief and my own read of the markup) attributes and the bare `<option>` children need no special handling:
```js
if (el.rawTagName && el.rawTagName.toLowerCase() === 'sc-raw-select') {
  el.rawTagName = 'select';
}
```
`name` and the two `style`/`style-focus` attributes then get processed by the normal, unchanged rules below it (`style-focus` in particular, which is why I added step 1b before step 2 in the loop). `<option>` isn't in `VOID` and needed no changes.

**Completeness guard, folded into one failure path.** Renamed the round-1 `unresolved` `Set` (link-only) to a general `problems` `Set` shared by both categories, and added "step 3b" at the end of each element's processing, after the tag/attribute rename logic has had a chance to consume everything it knows about:
```js
const KNOWN_TAGS = new Set(['x-dc']);
...
const tag = el.rawTagName;
if (tag && tag.includes('-') && !KNOWN_TAGS.has(tag.toLowerCase())) {
  problems.add(`unhandled custom element: <${tag}>`);
}
for (const name of Object.keys(el.attributes)) {
  if (/^(style|sc)-/i.test(name)) {
    problems.add(`unhandled attribute: ${name}`);
  }
}
```
followed by the single, unchanged-in-shape throw (`if (problems.size) throw new Error(...)`) that now covers both unmapped links and unknown constructs in one message.

**Design decision on the tag allowlist**, not explicitly specified by the brief so worth recording: `KNOWN_TAGS` contains only `x-dc`, not `image-slot` or `sc-raw-select`. Those two are *renamed away* by steps 1/1b, so under correct operation they never reach the guard as themselves — and deliberately *not* allowlisting them means that if a future regression broke either rename, the guard would catch the leftover custom tag rather than staying silent. `x-dc` is different: it isn't converted by any rule, it's just positionally excluded by the CLI's `</helmet>` slice (and, per round 1's finding, silently dropped by `node-html-parser` as an unmatched closing tag on the rare path where it isn't excluded) — so it's the one tag genuinely meant to be allowed, not converted.

**Attribute guard has no allowlist at all** (empty by omission, not an oversight): the complete census of `style-*`/`sc-*` attributes — `style-hover`, `style-focus`, `sc-camel-view-box` — are all *consumed* (removed or renamed) by the existing rules, so none are ever meant to survive to the check. If a future one needs to be intentionally passed through, that would be a deliberate design decision requiring a real allowlist entry at that time, not a default.

### TDD evidence

**Tests added** (3, matching the coordinator's spec, inserted before the existing brace-escaping test):

1. `style-focus becomes a focus: variant and is removed` — mirrors the existing `style-hover` test but with the real `border-bottom-color` declaration from the templates, on a `<input>` (also exercising void self-closing in the same assertion).
2. `sc-raw-select becomes a select with its options intact` — a realistic fixture (`name` + `style` + `style-focus` + two `<option>` children), asserting the exact whole-tag output including the converted `focus:` class and untouched options.
3. `an unknown custom element or style-/sc- attribute triggers the completeness guard` — two `assert.throws` cases in one test (`<foo-bar>` and `style-active="..."`), each checking the thrown message names the specific offending construct, not just that something throws.

**RED→GREEN:** ran `node --test tools/convert.test.mjs` after writing each test against the pre-fix code (naturally red — the rules didn't exist yet), then after implementing all three changes together:
```
# tests 14
# pass 14
# fail 0
```
All 14 passed on the first run against the real implementation (all 11 prior tests unaffected, confirmed separately before adding the new ones).

### Discrimination, verified by mutation

| Mutation | Result | Note |
|---|---|---|
| Removed `style-focus` handling only | **Tests 11 AND 12 failed** (12/14 pass) | Not a flaw: test 12's fixture is realistic and also carries `style-focus`. With the handling gone, `style-focus` survives to the completeness guard, which throws — a genuine second line of defense catching the same regression through a different path, not test overlap I should design away. |
| Removed only the `sc-raw-select` rename (step 1b), `style-focus` handling left intact | **Only test 12 failed** (13/14 pass) | Clean, isolated. Confirms test 12 pins the tag-rename specifically, independent of the style-focus mutation above. |
| Removed the entire completeness guard (step 3b) | **Only test 13 failed** (13/14 pass) | Clean, isolated. |

Restored the correct implementation after each mutation and reconfirmed 14/14 before moving on.

**CLI-level proof, not just unit tests.** Built two synthetic one-line templates (an unknown tag, and an unknown `style-active` attribute) and ran the actual CLI against them:
```
=== unknown tag ===
convert failed for unknown-tag: convert: unhandled custom element: <foo-bar>
EXIT=1
=== unknown attribute ===
convert failed for unknown-attr: convert: unhandled attribute: style-active
EXIT=1
```
Confirms the guard's failure path works end-to-end through the CLI, matching the round-1 proof style for the link check.

### Seven-template re-run

All seven exit 0:
```
home: exit=0   about: exit=0   services: exit=0   studio: exit=0
careers: exit=0   contact: exit=0   case-study: exit=0
```

Exact counts, verified three independent ways (the guard's own silence / exit 0; a targeted grep for the expected patterns; and a separate from-scratch regex scan of the output for *any* hyphenated tag name, matching none of the specific patterns above):

| Template | `focus:[border-bottom-color…]` classes | `<select>` | `<option>` |
|---|---|---|---|
| home | 3 | 0 | 0 |
| about | 3 | 0 | 0 |
| services | 3 | 0 | 0 |
| careers | 4 | 1 | 7 |
| contact | 5 | 1 | 5 |
| studio | 0 | 0 | 0 |
| case-study | 0 | 0 | 0 |
| **Total** | **18** | **2** | **12** |

18 `focus:` classes and 2 `<select>` elements with all 12 `<option>` children intact — matches the coordinator's expected counts exactly. Zero occurrences of `style-focus`, `sc-raw-select`, or any other `style-`/`sc-`-prefixed attribute or hyphenated tag name anywhere in any of the seven outputs (confirmed by an independent regex scan for `<[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]*[\s/>]`, which found none in any file — not just relying on the converter's own guard being silent).

### Not fixing, per instruction

Recorded as backlog, not touched: `toRoute()` throwing on wrong-case or query-string `Arohance` href variants (zero occurrences, fails loud); the void-element self-closing regex potentially mis-truncating on an attribute value containing a literal `>` (zero occurrences in real data, and would very likely produce a JSX syntax error Task 6b/9 would catch immediately rather than a silent miss).

### Files changed (fix round 2)

- `tools/convert.mjs` — added step 1b (`sc-raw-select` → `select`), extended step 2 with `style-focus`, added step 3b (completeness guard), renamed `unresolved` to `problems` and generalized the single throw. `git diff --stat`: `tools/convert.mjs | 60 ++++++++++++++++++++++++++++++++++++++----`.
- `tools/convert.test.mjs` — 3 tests added. `git diff --stat`: `tools/convert.test.mjs | 54 +++++++++++++++++++++++++++++++`.
- Combined: `2 files changed, 103 insertions(+), 11 deletions(-)`.
- Nothing else touched; `tw.mjs`/`unbundle.mjs` untouched (`tw.test.mjs` re-run clean at 12/12); no new dependencies.

### Self-review for this round

- **Discrimination**: all 3 new tests verified by mutation; one produced an honest two-test cross-effect explained above rather than papered over, the other two isolated cleanly.
- **Real data**: re-ran all seven templates; exact counts match the coordinator's independently-derived expectations; triple-checked (exit code, targeted grep, independent unconstrained regex scan).
- **Escaping**: unaffected — `style-focus` routes through the same `styleToClasses`/`escapeValue` path as `style`/`style-hover` already did; the guard only inspects tag/attribute *names*, never constructs a class value itself.
- **Discipline**: still exactly two files, no new dependencies, `tw.mjs` untouched.
- **Scope check on the guard**: confirmed by construction (not just by assertion) that `data-*`/`aria-*` cannot match `/^(style|sc)-/i` — the regex requires the literal prefix "style-" or "sc-", and neither `data-` nor `aria-` matches that, so no exclusion logic beyond the regex itself was needed.
- No outstanding concerns from this round. The "not fixing" items above are the coordinator's own backlog call, carried forward verbatim.
