# Task 1 Report: Unbundle the artifacts into templates and assets

## What I implemented

Two files, exactly as the brief's file structure specifies:

- **`tools/unbundle.mjs`** — reads the seven `Arohance *.html` bundles in the repo root, parses the `manifest` and `template` JSON blocks that sit on the line immediately after each `<script type="__bundler/KIND">` tag, and:
  - Pass 1: walks every asset in every bundle's manifest, decodes base64 (gunzipping if `compressed`), hashes content (sha1, truncated to 10 hex chars) to deduplicate. Images (png/jpg/svg) are written to `public/images/<hash>.<ext>`. JS assets are fingerprinted against 5 known vendor-library signatures (three.js, GSAP, liquid-ether, stroke-text, contact-pill); a match is written to `.source/vendor/<name>.js`, a non-match (React, ReactDOM, dc-runtime, image-slot authoring component) is recorded as `null`. WOFF2 fonts are always recorded as `null` (dropped; a later task loads them via `next/font/google`). Every UUID → outcome is recorded in `assetMap`.
  - Pass 2: extracts each bundle's `template` block (a JSON-encoded HTML string) verbatim to `.source/templates/<slug>.html` for the seven slugs (`home`, `about`, `services`, `studio`, `careers`, `contact`, `case-study`).
  - Writes `.source/assets.json` (the UUID → path/null map) and prints a one-line summary.
  - Implemented **verbatim** from the brief's Step 3 code block — no logic changes.
- **`tools/unbundle.test.mjs`** — the brief's three tests verbatim, except the third assertion, which per explicit instruction from my orchestrator uses presence-checking (`assert.ok(u in map, ...)`) instead of truthiness (`assert.ok(map[u], ...)`), because the unbundler deliberately records `null` for fonts and discarded page-logic scripts and `null` is falsy.

No other files were created. `.gitignore` (already containing `.source/`) and `.gitattributes` (already marking `*.html -text`) were verified, not modified. The seven source HTML bundles were not touched — confirmed below.

## What I tested and the results

Ran `node --test tools/unbundle.test.mjs` before and after implementing `tools/unbundle.mjs`, and ran the unbundler itself. All commands below were run from `C:\arohance projects\Arohance-new-website`.

### TDD Evidence

**RED** — command: `node --test tools/unbundle.test.mjs` (run immediately after writing `tools/unbundle.test.mjs`, before `tools/unbundle.mjs` existed):

```
not ok 1 - unbundle produced all seven templates
  error: 'missing home'
not ok 2 - templates are real markup, not bundler loaders
  error: "ENOENT: no such file or directory, open '...\\.source\\templates\\home.html'"
not ok 3 - asset map resolves every uuid referenced by a template
  error: "ENOENT: no such file or directory, open '...\\.source\\assets.json'"
# tests 3
# pass 0
# fail 3
```

This is exactly the failure the brief predicted ("`.source/templates/home.html` does not exist") — all three tests fail because none of the unbundler's outputs exist yet, not because of a typo or wrong assertion. Correct reason for RED.

**GREEN** — commands: `node tools/unbundle.mjs && node --test tools/unbundle.test.mjs`

```
templates: 7  assets: 39
TAP version 13
ok 1 - unbundle produced all seven templates
ok 2 - templates are real markup, not bundler loaders
ok 3 - asset map resolves every uuid referenced by a template
# tests 3
# pass 3
# fail 0
# cancelled 0
```

All three tests pass. Output is clean — no stray warnings from Node or the test runner.

### Independent verification (beyond the brief's three tests)

- `git diff --stat` over the seven source `Arohance *.html` files: **empty** — confirms they are byte-for-byte untouched.
- `git status` after running the unbundler but before `git add`: only `public/` and `tools/` appear as untracked; `.source/` does not appear at all, confirming the pre-existing `.gitignore` rule (`.source/`) is doing its job — verified explicitly with `git check-ignore -v` against `.source/assets.json`, `.source/templates/home.html`, `.source/vendor/three.js`, all reported ignored by `.gitignore:1:.source/`.
- `public/images/` contains exactly 33 files; `.source/vendor/` contains exactly 5 files (`three.js`, `gsap.js`, `liquid-ether.js`, `stroke-text.js`, `contact-pill.js`).
- Spot-checked 3 images by magic bytes: `89504e47` (PNG), `ffd8ffeb` / `ffd8ffe1` (JPEG) — all valid, non-corrupt.
- `.source/templates/home.html` is 1470 lines of real markup, contains `data-ag-root` twice, contains `__bundler` zero times.
- `.source/assets.json` has 187 UUID entries total (matching the 187 total asset entries across all seven bundles' manifests), of which 105 map to `null` and 82 map to a real path. The **distinct non-null target paths number exactly 38** (33 image paths + 5 vendor filenames).

## Files changed

Commit `9351a97` — `feat: unbundle artifact HTML into templates and deduplicated assets`:
- `C:\arohance projects\Arohance-new-website\tools\unbundle.mjs` (new)
- `C:\arohance projects\Arohance-new-website\tools\unbundle.test.mjs` (new)
- `C:\arohance projects\Arohance-new-website\public\images\*.{png,jpg,svg}` (33 new files)
- `.gitignore` — included in `git add` per the brief's command, but had no changes (already contained `.source/`; verified, not overwritten)

Generated but correctly gitignored (not committed): `.source/templates/*.html` (7 files), `.source/vendor/*.js` (5 files), `.source/assets.json`.

## Self-review findings

- **Completeness:** all five brief steps followed in order; all three brief tests present (one assertion adjusted per explicit upstream instruction); commit made with the brief's exact subject line plus the required co-authorship trailer.
- **Quality:** both files are exactly what the brief specified, nothing added or reorganized. `tools/unbundle.mjs` is 82 lines, `tools/unbundle.test.mjs` is 24 lines — neither has grown beyond the brief's intent, so no need to split anything or escalate on that front.
- **Discipline:** I did not touch `.gitignore` or `.gitattributes` (verified both already had the required entries). I did not modify the seven source HTML files. I did not "fix" the count discrepancy described below by changing `VENDOR`, the hashing, or the console.log — I implemented the brief's Step 3 code verbatim and report the actual outcome.
- **Testing:** the three tests check real observable behavior (file existence, absence of loader scaffolding, presence of the page root, and completeness of the asset map against every UUID actually referenced in the home template) rather than re-asserting implementation details. Test output is clean.

## Issues or concerns

**The kept-asset count is 39, not the expected 38 — but the actual distinct output files total 38.** Here is the full mechanism, confirmed by direct inspection:

- `tools/unbundle.mjs`'s final line prints `templates: 7  assets: 39` (reproduced identically across multiple runs — deterministic, not a fluke).
- The true count of **distinct files actually written to disk** is 38: `public/images/` holds 33 files, `.source/vendor/` holds 5 files. This matches the brief's expected 38 exactly. I also confirmed this independently by counting distinct non-null *values* in `assets.json` (as opposed to counting Map keys): 38 distinct target paths.
- The discrepancy is entirely inside the script's own diagnostic line: `[...byHash.values()].filter(Boolean).length` counts **content-hash Map entries**, not distinct output paths. One vendor library — `contact-pill.js` — is **not byte-identical across all seven bundles**. Six of the seven pages (About, Careers, Case Study, Contact, Services, Studio) embed one variant; the Homepage bundle embeds a second variant that differs only in a hardcoded contact-link check:
  - Six-page variant: `` /Contact\.(dc\.)?html/.test(...) ? '#top' : 'Arohance%20Contact.html' ``
  - Homepage variant: `` /Contact\.dc\.html/.test(...) ? '#top' : 'Arohance%20Contact.dc.html' ``
  - Both variants independently match the same `VENDOR` fingerprint regex (`/Floating "Up \/ make contact" pill/`) and both target the same output filename `.source/vendor/contact-pill.js`, but because they hash differently they occupy **two separate keys** in `byHash`. Both are non-null, so `filter(Boolean).length` counts them as 2, even though they collapse to 1 file on disk (second write wins). That extra count is the entire 39-vs-38 gap: 6 JS-vendor hash-entries + 33 image hash-entries = 39, while the real file surface is 5 vendor files + 33 images = 38.
- I verified which variant survives on disk: `.source/vendor/contact-pill.js` currently contains the **Homepage variant** (the one referencing `Arohance%20Contact.dc.html`), because in `readdirSync('.')` order the Homepage bundle is processed after the six-page variant was already written, so its distinct hash triggers a second write that overwrites the file.
- Per instruction, I did not adjust `unbundle.mjs` to force the printed number to 38 (e.g., by deduplicating vendor writes by target filename instead of content hash, or by changing the console.log to count distinct path values). I implemented Step 3's code exactly as given. The actual committed/generated file set is correct and complete (38 distinct files, matching spec) — only the tool's own self-reported diagnostic count is off by one, and only because of this one pre-existing content difference in the source bundles' contact-pill script.
- **Worth flagging for whoever wires up the contact-pill component in a later task:** the surviving `contact-pill.js` carries the Homepage's `.dc.html`-flavored href logic, which was already a stale/internal artifact-authoring reference in the *source* bundles (neither `.dc.html` variant matches the real source filenames like `Arohance Contact.html`, and neither will match a future Next.js route). This link logic cannot be trusted as-is regardless of which variant "won" the file-write race — it will need to be replaced with real Next.js routing in whatever task wires up this vendor script. This is a pre-existing property of the source bundles, not something introduced by unbundling, but the "last write wins" dedup-by-content-hash behavior is worth knowing about if a future bundle ever introduces a third variant of a vendor script.

No other discrepancies found. Node version used: v22.12.0.

---

## Fix report (post-review correction, requested by coordinator)

The coordinator reviewed the RED/GREEN evidence and the "39 vs 38" finding above and asked for two correctness fixes to `tools/unbundle.mjs`, confirming both were genuine defects in the brief's Step 3 code rather than disagreement with my analysis. Scope was explicitly limited to these two fixes plus one pinning test — `VENDOR` fingerprints, hashing, the `null` policy for fonts/React internals, and template extraction were explicitly out of scope and untouched.

### What I changed

**Fix 1 — diagnostic correctness.** Replaced the count in the final line of `tools/unbundle.mjs`, which counted `byHash` Map entries (content hashes), with a count of distinct non-null values actually in `assetMap` (i.e., distinct output paths):

```js
writeFileSync('.source/assets.json', JSON.stringify(assetMap, null, 2));
const written = new Set(Object.values(assetMap).filter(Boolean));
console.log(`templates: 7  assets: ${written.size}`);
```

**Fix 2 — deterministic, loud vendor-filename collisions.** Added an `existsSync` check in the vendor branch of Pass 1, before the `writeFileSync(out, buf)` call, so that when a second distinct content-hash targets a vendor filename that already exists on disk, the first write is kept, a warning is printed, and the new hash is still recorded in `byHash`/`assetMap` pointing at the existing (first-written) file:

```js
if (existsSync(out)) {
  console.warn(`variant ignored: ${hit[1]} differs between bundles; keeping first`);
  byHash.set(hash, out);
  assetMap[uuid] = out;
  continue;
}
writeFileSync(out, buf);
```

`existsSync` was added to the `node:fs` import.

**New test.** Added a fourth test to `tools/unbundle.test.mjs` pinning Fix 1 by asserting `assets.json`'s distinct non-null path count equals the actual file count in `public/images` + `.source/vendor` on disk. Added `readdirSync` to that file's `node:fs` import.

```js
test('reported asset count matches files actually written', () => {
  const map = JSON.parse(readFileSync('.source/assets.json', 'utf8'));
  const paths = new Set(Object.values(map).filter(Boolean));
  const images = readdirSync('public/images').length;
  const vendor = readdirSync('.source/vendor').length;
  assert.equal(paths.size, images + vendor,
    'assets.json distinct paths must equal files on disk');
});
```

### Clean-state re-run (command and output)

Deleted `.source/` and `public/images/` first so first-write-wins was genuinely exercised (not short-circuited by leftovers from the prior run), then:

Command: `node tools/unbundle.mjs && node --test tools/unbundle.test.mjs`

```
variant ignored: contact-pill.js differs between bundles; keeping first
templates: 7  assets: 38
TAP version 13
ok 1 - unbundle produced all seven templates
ok 2 - templates are real markup, not bundler loaders
ok 3 - asset map resolves every uuid referenced by a template
ok 4 - reported asset count matches files actually written
# tests 4
# pass 4
# fail 0
# cancelled 0
```

Confirmed the warning line appears **exactly once** (isolated re-check: `rm -rf .source public/images && node tools/unbundle.mjs 2>&1 | grep -c "variant ignored"` → `1`), and the count now prints **38**, matching the brief's original expectation exactly.

I also confirmed which content variant survives now: `.source/vendor/contact-pill.js` contains the **six-page majority variant** (`Arohance%20Contact.html`, via `` /Contact\.(dc\.)?html/ ``) rather than the Homepage's stale `.dc.html` variant that had won under the old last-write-wins behavior — first-write-wins with `readdirSync('.')`'s alphabetical order means "About" (processed first) now deterministically wins, as the coordinator predicted. File counts are unchanged and confirmed identical: `public/images/` still holds 33 files, `.source/vendor/` still holds 5 files — the fixes touched only JS-vendor handling and the diagnostic line, not image handling, and regenerating produced byte-identical images (`git add public/images` staged no changes).

### Files changed (this fix)

Commit `eb6f444` — `fix: make vendor-variant collisions deterministic and fix asset count`:
- `C:\arohance projects\Arohance-new-website\tools\unbundle.mjs` (modified — Fix 1 + Fix 2, +12/-2 lines)
- `C:\arohance projects\Arohance-new-website\tools\unbundle.test.mjs` (modified — new test, +10/-1 lines)
- `public/images/*` — regenerated and re-staged, byte-identical to the previous commit (no diff)

### Result

- `tools/unbundle.mjs` now prints `templates: 7  assets: 38`, matching the brief's original expectation, and the number is now honest — it reflects distinct files written, not content-hash Map size.
- The one real content difference between bundles (`contact-pill.js`'s hardcoded contact-href, Homepage vs. the other six pages) is no longer silently resolved by directory-listing order; it is deterministic (first-write-wins, i.e. the six-page majority variant) and loud (a `console.warn` names the exact vendor file and states a variant was ignored).
- 4/4 tests pass; output remains clean apart from the intentional, single `console.warn` line, which is expected stderr output documenting the one real variant collision in this dataset, not a stray warning.
- The stale `.dc.html` href logic inside `contact-pill.js` is unchanged by this fix (fixing that is explicitly out of scope here, per the coordinator, and is tracked for the task that wires up that component).

---

## Fix report (post-review correction, round 2)

Review of the round-1 fix surfaced two Important findings, both confirmed valid and both traceable to the round-1 fix instruction rather than to a new mistake: (1) the collision warning was gated on `existsSync` alone, so it fired on **every** vendor library on any run after the first, not just the one that genuinely differs; (2) nothing tested Fix 2's actual guarantee (determinism/loudness), so that regression had zero coverage. Five Minor items from the same review (base64 decode leniency, 40-bit hash truncation, `readdirSync` ordering, double file reads, fingerprint regex risk) were explicitly deferred by the coordinator — not acted on, per instruction. `VENDOR`, hashing, the `null` policy, template extraction, and the round-1 count fix were all explicitly out of scope and left untouched.

### What I changed

**Fix 1 — content-gated, not existence-gated.** The existence check alone can't tell a genuine cross-bundle content variant apart from a file this same script wrote on a prior run (`byHash` is rebuilt fresh on each process start, but `.source/vendor/*.js` persists on disk). Reworked the vendor branch in `tools/unbundle.mjs` to compare bytes:

```js
out = `.source/vendor/${hit[1]}`;
if (existsSync(out)) {
  if (!buf.equals(readFileSync(out))) {
    console.warn(`variant ignored: ${hit[1]} differs between bundles; keeping first`);
  }
  byHash.set(hash, out);
  assetMap[uuid] = out;
  continue;
}
writeFileSync(out, buf);
```

I nested the existence check around the content comparison, rather than using a single flattened `existsSync(out) && !buf.equals(...)` condition, because the coordinator's instruction explicitly required the identical-leftover case to *also* record `byHash`/`assetMap` and `continue` without falling through to a redundant `writeFileSync` — a flattened condition would satisfy the warning behavior but would still fall through to a needless rewrite when the leftover is identical. This nested form warns only when content truly differs, and in both the "identical" and "differs" cases it records the mapping and skips the write; only a genuinely new file (nothing at `out` yet) reaches `writeFileSync`. `readFileSync` did not need to be added to the import — it was already imported (used elsewhere for reading the HTML bundles as text); called here with no encoding argument it returns a `Buffer`, which is what `buf.equals(...)` needs.

**Fix 2 — regression coverage for the actual guarantee.** Added a fifth, last test to `tools/unbundle.test.mjs` that spawns `tools/unbundle.mjs` as a child process twice in a row and asserts both runs' stderr name exactly the same single warned library (`contact-pill.js`) — proving a warm run behaves identically to a cold one, which is what Finding 1 broke and Fix 1 restores:

```js
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
```

Added `spawnSync` to a new `node:child_process` import in the test file. Placed last, as instructed, since it regenerates outputs and must not run before the tests that read pre-existing state.

### Verification (commands and output)

Per the coordinator's instruction, verified cold-then-warm from a genuinely clean state. Since tests 1–4 read pre-existing output (they don't invoke the unbundler themselves — only the new test 5 does), the sequence was: clean → cold run to populate state for tests 1–4 → full test suite (whose test 5 performs two more, now-warm, spawned runs internally) → a further bare manual run to directly eyeball stderr.

```
$ rm -rf .source public/images
$ node tools/unbundle.mjs
variant ignored: contact-pill.js differs between bundles; keeping first
templates: 7  assets: 38
```

(Exactly one warning even on this first post-clean run — the collision is intra-run: About's variant is written first, then Homepage's differing variant is compared against it later in the same pass.)

```
$ node --test tools/unbundle.test.mjs
ok 1 - unbundle produced all seven templates
ok 2 - templates are real markup, not bundler loaders
ok 3 - asset map resolves every uuid referenced by a template
ok 4 - reported asset count matches files actually written
ok 5 - collision warning fires only for genuinely differing content
# tests 5
# pass 5
# fail 0
# cancelled 0
```

5/5 pass. Test 5's two internal spawned runs are both warm (vendor files already exist from the cold run above and from test 5's own first spawned run) and both reported exactly `['contact-pill.js']` — confirmed by the `deepEqual` assertion passing.

Manual "second bare run" check, precisely counted:

```
$ node tools/unbundle.mjs 2>&1 | grep -c "variant ignored"
1
$ node tools/unbundle.mjs 2>&1 | grep -c "variant ignored"
1
```

Exactly one warning line on each of two further consecutive warm runs — not five. `public/images` still holds 33 files and `.source/vendor` still holds 5 files. `git status --short public/images` showed no changes after regeneration (byte-identical), confirming this fix touched only vendor-JS handling, not image handling.

### Files changed (this fix)

Commit `a10ad7c` — `fix: gate vendor collision warning on content, not mere existence`:
- `C:\arohance projects\Arohance-new-website\tools\unbundle.mjs` (modified — content-gated collision check, +8/-1 lines net of the round-1 block)
- `C:\arohance projects\Arohance-new-website\tools\unbundle.test.mjs` (modified — new spawning regression test, +14/-0 lines)
- `public/images/*` — re-verified byte-identical, nothing staged

### Result

- A warm run now behaves identically to a cold run: exactly one warning, naming only `contact-pill.js`, the one vendor library that is genuinely not byte-identical across all seven bundles. The other four vendor libraries (three.js, gsap.js, liquid-ether.js, stroke-text.js) never warn, on any run, cold or warm.
- The "deterministic and loud" guarantee from round 1 now has direct regression coverage (test 5), closing the gap that let the existence-only bug through unnoticed in round 1.
- 5/5 tests pass; the only stderr output across all verification runs is the single, correct, expected warning line.
- The five Minor findings from this review round were deferred by the coordinator and are out of scope for this task; no action taken on them.
