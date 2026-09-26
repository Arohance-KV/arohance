import type { Behavior } from './types';

export const reel: Behavior = (root) => {
  const cleanups: (() => void)[] = [];
  const stage = root.querySelector<HTMLElement>('[data-vt-stage]');
  if (!stage) return () => {};
  const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-vt-layer]'));
  const bars = Array.from(stage.querySelectorAll<HTMLElement>('[data-vt-bar] > span'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-vt-item]'));
  const cap = stage.querySelector<HTMLElement>('[data-vt-caption]');
  const now = stage.querySelector<HTMLElement>('[data-vt-now]');
  const time = stage.querySelector<HTMLElement>('[data-vt-time]');
  const play = stage.querySelector<HTMLElement>('[data-vt-play]');
  const DUR = 8000;
  const fmt = (s: number) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  let cur = 0, t0 = performance.now(), held = false, heldAt = 0, raf: number | null = null, kb: Animation | null = null, words: HTMLElement[] = [];
  const show = (i: number) => {
    cur = (i + layers.length) % layers.length; t0 = performance.now();
    layers.forEach((l, j) => { l.style.opacity = j === cur ? '1' : '0'; l.style.pointerEvents = j === cur ? 'auto' : 'none'; });
    items.forEach((it, j) => { const ix = it.querySelector<HTMLElement>('[data-vt-idx]'); if (ix) ix.style.color = j === cur ? 'var(--ag-accent,#F2600C)' : '#8A857B'; it.style.opacity = j === cur ? '1' : '.55'; });
    bars.forEach((b, j) => { b.style.width = j < cur ? '100%' : '0'; });
    const L = layers[cur];
    const k = L.querySelector<HTMLElement>('[data-vt-kb]');
    if (kb) kb.cancel();
    if (k && k.animate) {
      const dir = cur % 2 ? -1 : 1;
      kb = k.animate([{ transform: 'scale(1.02) translate3d(0,0,0)' }, { transform: 'scale(1.14) translate3d(' + (dir * 2.2) + '%,-1.4%,0)' }], { duration: DUR + 1200, easing: 'linear', fill: 'forwards' });
      if (held) kb.pause();
    }
    // `q` is computed but never read anywhere in this method — a dead
    // computation in the original (like nav.ts's dropped darks/onDark).
    // Ported verbatim per instructions: report, don't remove on my own
    // judgement. (Its regex also can't match anyway: getAttribute() already
    // returns entity-decoded text, so the literal "&#8220;"/"&#8221;" it
    // searches for can never appear in the string being searched.)
    const q = (L.getAttribute('data-vt-quote') || '').replace(/&#8220;|&#8221;/g, '');
    const tmp = document.createElement('div'); tmp.innerHTML = L.getAttribute('data-vt-quote') || ''; const txt = tmp.textContent || '';
    if (cap) {
      cap.innerHTML = '';
      words = txt.split(' ').map((w) => { const s = document.createElement('span'); s.textContent = w + ' '; s.style.cssText = 'display:inline-block;white-space:pre;opacity:0;transform:translate3d(0,.35em,0);filter:blur(6px);transition:opacity .5s ease,transform .6s cubic-bezier(.16,1,.3,1),filter .5s ease,color .9s ease'; cap.appendChild(s); return s; });
    }
    if (now) now.innerHTML = (L.getAttribute('data-vt-name') || '').replace(', ', ' &#8212; ');
  };
  const tick = () => {
    const el = held ? heldAt : performance.now() - t0;
    const p = Math.min(1, el / DUR);
    if (bars[cur]) bars[cur].style.width = (p * 100).toFixed(2) + '%';
    const n = Math.floor(Math.min(1, p / 0.62) * words.length);
    words.forEach((w, i) => {
      if (i < n && w.style.opacity !== '1') { w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none'; w.style.color = 'var(--ag-accent,#F2600C)'; setTimeout(() => { w.style.color = ''; }, 380); }
    });
    const total = parseInt(layers[cur].getAttribute('data-vt-dur') || '120', 10);
    if (time) time.textContent = fmt(p * total) + ' / ' + fmt(total);
    if (!held && p >= 1) show(cur + 1);
    raf = requestAnimationFrame(tick);
  };
  const enter = () => { held = true; heldAt = performance.now() - t0; if (kb) kb.pause(); if (play) play.style.transform = 'scale(1.12)'; };
  const leave = () => { held = false; t0 = performance.now() - heldAt; if (kb) kb.play(); if (play) play.style.transform = 'scale(1)'; };
  stage.addEventListener('mouseenter', enter); stage.addEventListener('mouseleave', leave);
  items.forEach((it, j) => { const h = () => show(j); it.addEventListener('click', h); cleanups.push(() => it.removeEventListener('click', h)); });
  show(0); raf = requestAnimationFrame(tick);
  cleanups.push(() => { cancelAnimationFrame(raf!); if (kb) kb.cancel(); stage.removeEventListener('mouseenter', enter); stage.removeEventListener('mouseleave', leave); });
  return () => cleanups.forEach((fn) => fn());
};
