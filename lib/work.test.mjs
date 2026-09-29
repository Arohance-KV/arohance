import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';

// lib/work.ts is plain data: transpile it here rather than depend on the
// running Node version's type stripping.
const { outputText } = ts.transpileModule(readFileSync('lib/work.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { WORK } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);

// Copy edits break these without a type error: a duplicate slug makes two
// cards open one page, and next/image only 404s at runtime.
test('work: slugs are unique', () => {
  const slugs = WORK.map((w) => w.slug);
  assert.equal(new Set(slugs).size, slugs.length, `duplicate slug in ${slugs}`);
});

test('work: every image exists under public/', () => {
  for (const w of WORK) {
    for (const img of [w.image, ...w.sections.flatMap((s) => s.images ?? [])]) {
      assert.ok(existsSync(`public${img.src}`), `${w.slug}: ${img.src}`);
    }
  }
});
