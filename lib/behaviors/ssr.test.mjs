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
