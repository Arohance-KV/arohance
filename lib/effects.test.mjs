import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ether = readFileSync('lib/liquid-ether.ts', 'utf8');

// Review Focus 3: a leaked WebGL context kills the page after ~16 navigations.
test('ether disposer releases the GL context and is idempotent', () => {
  assert.match(ether, /forceContextLoss\(\)/, 'must force context loss');
  assert.match(ether, /renderer\.dispose\(\)/, 'must dispose the renderer');
  assert.match(ether, /if \(disposed\) return;/, 'must guard double-dispose');
});

test('vendor modules import real packages, not the artifact runtime', () => {
  assert.ok(!ether.includes('__resources'), 'ether still uses window.__resources');
  assert.match(ether, /^import \* as THREE from 'three';/m);
  const stroke = readFileSync('lib/stroke-text.ts', 'utf8');
  assert.ok(!stroke.includes('window.gsap'), 'stroke still uses window.gsap');
  assert.match(stroke, /^import \{ gsap \} from 'gsap';/m);
});
