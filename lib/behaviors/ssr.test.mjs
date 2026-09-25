import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const files = readdirSync('lib/behaviors').filter(f => f.endsWith('.ts'));

// Review Focus 2: a window/document reference at module scope, or a
// behaviour file imported by a server component, breaks `next build`.
test('no behaviour touches window or document at module scope', () => {
  for (const f of files) {
    const src = readFileSync(`lib/behaviors/${f}`, 'utf8');
    const topLevel = src
      .split('\n')
      .filter(l => !/^\s/.test(l))              // indented lines are inside a fn
      .filter(l => !l.trimStart().startsWith('//'))
      .join('\n');
    assert.ok(!/\b(window|document)\b/.test(topLevel),
      `${f} references window/document at module scope`);
  }
});

test('AgRuntime is a client component', () => {
  const src = readFileSync('components/AgRuntime.tsx', 'utf8');
  assert.match(src.trimStart(), /^'use client';/);
});
