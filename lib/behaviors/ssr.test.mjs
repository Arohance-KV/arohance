import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';

const files = readdirSync('lib/behaviors').filter(f => f.endsWith('.ts'));

/**
 * SSR hazard: any window/document reference reachable at module-evaluation
 * time throws during Next's server render. Function BODIES are safe — they
 * only run in the browser — so skip function-like nodes and flag identifier
 * references anywhere else in the top-level statements.
 */
const moduleScopeHazards = (src, file) => {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true);
  const hits = [];
  const walk = (node) => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isIdentifier(node) && (node.text === 'window' || node.text === 'document')) {
      hits.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`);
    }
    ts.forEachChild(node, walk);
  };
  sf.statements.forEach(walk);
  return hits;
};

// Review Focus 2: a window/document reference at module scope, or a
// behaviour file imported by a server component, breaks `next build`.
test('no behaviour references window or document at module scope', () => {
  for (const f of files) {
    const hits = moduleScopeHazards(readFileSync(`lib/behaviors/${f}`, 'utf8'), f);
    assert.deepEqual(hits, [], `module-scope DOM access: ${hits.join(', ')}`);
  }
});

test('AgRuntime is a client component', () => {
  const src = readFileSync('components/AgRuntime.tsx', 'utf8');
  assert.match(src.trimStart(), /^'use client';/);
});

// Review Focus 4 / Fact 1: navigating away with the menu open must not leave
// the next page unscrollable. Both `shell.ts` (home/about/services/careers)
// and `shellMinimal.ts` (studio/case-study/contact) return a disposer from
// more than one path (the `!ov || !menu` early return, and the full
// teardown at the end); a check that only inspects whichever "return () =>
// {" occurs *last* in the file (e.g. via `lastIndexOf`) would keep passing
// even if the early-return path's reset were deleted, because the later,
// unrelated disposer still has it — that version of this test is vacuous.
// Walk every disposer each file returns and require each one, independently,
// to reset body.overflow.
//
// Final fix wave, item 8: glob'd over both files (within this one test, not
// as separate registrations — the pass/fail per file is what matters, not
// the test count). This used to check only shell.ts, leaving studio/
// case-study/contact — the three pages that actually mount shellMinimal.ts,
// not shell.ts — unguarded for this exact safety-critical invariant.
test('shell/shellMinimal reset the body scroll lock in every disposer they return, including the early-return guard', () => {
  for (const file of ['lib/behaviors/shell.ts', 'lib/behaviors/shellMinimal.ts']) {
    const src = readFileSync(file, 'utf8');

    const marker = 'return () => {';
    const starts = [];
    for (let i = src.indexOf(marker); i !== -1; i = src.indexOf(marker, i + 1)) {
      starts.push(i);
    }
    assert.ok(
      starts.length >= 2,
      `expected at least 2 disposer arrow functions in ${file} (the early-return guard and the full teardown), found ${starts.length}`,
    );

    for (const start of starts) {
      // Balanced-brace scan from this arrow's opening `{` so each disposer's
      // own body is checked in isolation — a later disposer's reset can't
      // paper over an earlier one that forgot it.
      const braceStart = src.indexOf('{', start);
      let depth = 0;
      let end = braceStart;
      for (let i = braceStart; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      const body = src.slice(braceStart, end + 1);
      assert.match(
        body,
        /document\.body\.style\.overflow = '';/,
        `disposer starting at offset ${start} in ${file} must reset body overflow, got: ${body}`,
      );
    }
  }
});
