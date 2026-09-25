import { test } from 'node:test';
import assert from 'node:assert/strict';
import { styleToClasses, escapeValue } from './tw.mjs';

const cls = (css, prefix) => styleToClasses(css, prefix).join(' ');

test('maps keyword declarations to real utilities', () => {
  assert.equal(cls('display:flex'), 'flex');
  assert.equal(cls('position:fixed'), 'fixed');
  assert.equal(cls('overflow:clip'), 'overflow-clip');
  assert.equal(cls('align-items:center'), 'items-center');
  assert.equal(cls('justify-content:space-between'), 'justify-between');
  assert.equal(cls('flex-direction:column'), 'flex-col');
});

test('maps px lengths onto the spacing scale', () => {
  assert.equal(cls('padding:16px'), 'p-4');
  assert.equal(cls('gap:10px'), 'gap-2.5');
  assert.equal(cls('top:0'), 'top-0');
});

test('splits shorthand padding into axis utilities', () => {
  assert.equal(cls('padding:16px clamp(20px,4.4vw,64px)'),
    'py-4 px-[clamp(20px,4.4vw,64px)]');
  assert.equal(cls('padding:4px 8px 12px 16px'), 'pt-1 pr-2 pb-3 pl-4');
});

test('colors become arbitrary text/bg values', () => {
  assert.equal(cls('color:#F5F2ED'), 'text-[#F5F2ED]');
  assert.equal(cls('background:#1F1E1C'), 'bg-[#1F1E1C]');
});

// Review Focus 1: a space inside an arbitrary value silently kills the class.
test('spaces inside arbitrary values become underscores', () => {
  assert.equal(
    cls('transition:opacity .5s cubic-bezier(.16, 1, .3, 1)'),
    '[transition:opacity_.5s_cubic-bezier(.16,_1,_.3,_1)]',
  );
  assert.equal(cls('box-shadow:0 10px 26px rgba(0,0,0,.5)'),
    'shadow-[0_10px_26px_rgba(0,0,0,.5)]');
});

test('escapeValue never emits a bare space', () => {
  assert.equal(escapeValue('0 10px 26px rgba(0,0,0,.5)'), '0_10px_26px_rgba(0,0,0,.5)');
});

test('unknown properties fall back to arbitrary properties', () => {
  assert.equal(cls('mix-blend-mode:screen'), '[mix-blend-mode:screen]');
  assert.equal(cls('--ag-accent:#F2600C'), '[--ag-accent:#F2600C]');
});

test('prefix is applied to every emitted class', () => {
  assert.equal(cls('background:#F2600C;transform:translate3d(0,-2px,0)', 'hover:'),
    'hover:bg-[#F2600C] hover:[transform:translate3d(0,-2px,0)]');
});

test('declarations are order-preserving and semicolon-tolerant', () => {
  assert.equal(cls('display:flex;;align-items:center;'), 'flex items-center');
});

test('negative lengths become arbitrary values, never double hyphens', () => {
  assert.equal(cls('margin-top:-8px'), 'mt-[-8px]');
  assert.equal(cls('top:-10px'), 'top-[-10px]');
  assert.equal(cls('margin:-4px -8px'), 'my-[-4px] mx-[-8px]');
});
