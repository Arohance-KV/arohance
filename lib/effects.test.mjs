import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ether = readFileSync('lib/liquid-ether.ts', 'utf8');
const stroke = readFileSync('lib/stroke-text.ts', 'utf8');

/** Slice the text of the disposer closure that mount() returns. */
const disposerBody = (src, label) => {
  const start = src.lastIndexOf('return () => {');
  assert.notEqual(start, -1, `${label}: no returned disposer found`);
  let depth = 0, i = src.indexOf('{', start);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(start, j + 1);
  }
  assert.fail(`${label}: unbalanced disposer body`);
};

// Review Focus 3: a leaked WebGL context kills the page after ~16 navigations.
// These assertions run against the SLICED disposer body, not the whole file, so a
// guard that merely sits somewhere else in the file cannot make this test pass.
test('ether disposer guards double-dispose before releasing the context', () => {
  const body = disposerBody(ether, 'liquid-ether');
  const guard = body.indexOf('if (disposed) return;');
  const force = body.indexOf('forceContextLoss()');
  const disp = body.search(/\.dispose\(\)/);
  assert.ok(guard !== -1, 'guard must live inside the returned disposer');
  assert.ok(force !== -1, 'must force context loss inside the disposer');
  assert.ok(disp !== -1, 'must dispose the renderer inside the disposer');
  assert.ok(guard < force && guard < disp, 'guard must precede the release calls');
});

test('stroke disposer guards double-dispose before releasing tweens and observers', () => {
  const body = disposerBody(stroke, 'stroke-text');
  const guard = body.indexOf('if (disposed) return;');
  const killTl = body.indexOf('tl.kill()');
  const disconnectIo = body.indexOf('io.disconnect()');
  assert.ok(guard !== -1, 'guard must live inside the returned disposer');
  assert.ok(killTl !== -1, 'must kill the timeline inside the disposer');
  assert.ok(disconnectIo !== -1, 'must disconnect the observer inside the disposer');
  assert.ok(guard < killTl && guard < disconnectIo, 'guard must precede the teardown calls');
});

test('vendor modules import real packages, not the artifact runtime', () => {
  assert.ok(!ether.includes('__resources'), 'ether still uses window.__resources');
  assert.match(ether, /^import \* as THREE from 'three';/m);
  assert.ok(!stroke.includes('window.gsap'), 'stroke still uses window.gsap');
  assert.match(stroke, /^import \{ gsap \} from 'gsap';/m);
});
