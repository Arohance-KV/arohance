'use client';

import { useEffect } from 'react';

// Module-scoped guard against a concurrent double-inject (React StrictMode's
// dev-only double effect invocation, or `<ContactPill />` accidentally
// rendered twice at once). This is the same purpose the vendored script's
// `window.__agFloatNav` flag served, scoped to this module instead of
// `window` and reset on cleanup so a later, legitimate mount still runs.
let mounted = false;

/**
 * Floating "Up / make contact" pill. Ported from
 * `.source/vendor/contact-pill.js`, a script every one of the seven
 * templates loads from its <head> and which injects its own DOM straight
 * onto `document.body` — it appears in no template body.
 *
 * Drops in as a ball once the user scrolls past the hero, then stays for
 * the rest of the session; replays on mount if the page opens mid-scroll.
 *
 * The only behavioural change from the source: `contactHref` was a ternary
 * matching hardcoded `.dc.html` artifact filenames (two variants existed
 * across the bundles; neither matches a real file or a Next.js route — see
 * task 1). It now always links to the real route, `/contact`.
 */
export default function ContactPill() {
  useEffect(() => {
    if (mounted) return;
    mounted = true;

    const ACC = 'var(--ag-accent,#F2600C)';
    const contactHref = '/contact';

    const wrap = document.createElement('div');
    wrap.setAttribute('data-ag-float', '');
    wrap.style.cssText =
      'position:fixed;left:50%;bottom:clamp(16px,3.4vh,30px);z-index:80;transform:translateX(-50%);pointer-events:none';
    const pill = document.createElement('div');
    pill.style.cssText =
      'position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:' +
      ACC +
      ';border-radius:999px;box-shadow:0 18px 44px rgba(0,0,0,.45),0 2px 0 rgba(255,255,255,.35) inset;width:18px;height:18px;visibility:hidden';
    const inner = document.createElement('div');
    inner.style.cssText =
      'display:flex;align-items:center;gap:6px;padding:6px;white-space:nowrap;opacity:0;font-family:"Archivo",sans-serif;font-weight:700;font-size:17px;letter-spacing:-0.01em';
    const btn =
      'display:flex;align-items:center;gap:10px;height:50px;padding:0 22px;border-radius:999px;text-decoration:none;cursor:pointer;border:0;font:inherit;transition:background .35s ease,color .35s ease,transform .5s cubic-bezier(.16,1,.3,1)';
    inner.innerHTML =
      '<button type="button" data-ag-up style="' + btn + ';background:transparent;color:#161412">' +
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>Up</button>' +
      '<a href="' + contactHref + '" data-ag-contact style="' + btn + ';background:#161412;color:#F5F2ED">' +
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>make contact</a>';
    pill.appendChild(inner);
    wrap.appendChild(pill);
    document.body.appendChild(wrap);

    const up = inner.querySelector('[data-ag-up]') as HTMLButtonElement;
    const ct = inner.querySelector('[data-ag-contact]') as HTMLAnchorElement;
    const onUpEnter = () => { up.style.background = 'rgba(22,20,18,.08)'; };
    const onUpLeave = () => { up.style.background = 'transparent'; };
    const onCtEnter = () => { ct.style.background = ACC; ct.style.color = '#0A0A0A'; };
    const onCtLeave = () => { ct.style.background = '#161412'; ct.style.color = '#F5F2ED'; };
    const onUpClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    up.addEventListener('mouseenter', onUpEnter);
    up.addEventListener('mouseleave', onUpLeave);
    ct.addEventListener('mouseenter', onCtEnter);
    ct.addEventListener('mouseleave', onCtLeave);
    up.addEventListener('click', onUpClick);

    let shown = false;
    const reduce = typeof window.matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const threshold = () => Math.min(window.innerHeight * 0.6, 520);

    const open = () => {
      if (shown) return;
      shown = true;
      pill.style.visibility = 'visible';
      wrap.style.pointerEvents = 'auto';
      inner.style.position = 'absolute';
      const W = inner.scrollWidth, H = inner.scrollHeight;
      inner.style.position = '';
      const finish = () => {
        pill.style.width = W + 'px';
        pill.style.height = H + 'px';
        pill.style.background = '#F5F2ED';
        inner.style.opacity = '1';
      };
      if (reduce || !pill.animate) { finish(); return; }
      const fall = window.innerHeight * 0.92;
      const drop = pill.animate(
        [
          { transform: 'translateY(' + -fall + 'px) scale(1,1)', easing: 'cubic-bezier(.55,0,1,.45)' },
          { transform: 'translateY(0) scale(1.35,.7)', offset: 0.52, easing: 'cubic-bezier(0,.55,.45,1)' },
          { transform: 'translateY(-70px) scale(.92,1.08)', offset: 0.7, easing: 'cubic-bezier(.55,0,1,.45)' },
          { transform: 'translateY(0) scale(1.2,.82)', offset: 0.84, easing: 'cubic-bezier(0,.55,.45,1)' },
          { transform: 'translateY(-18px) scale(1,1)', offset: 0.93, easing: 'cubic-bezier(.55,0,1,.45)' },
          { transform: 'translateY(0) scale(1,1)' },
        ],
        { duration: 1150, fill: 'forwards' },
      );
      drop.onfinish = () => {
        const grow = pill.animate(
          [
            { width: '18px', height: '18px', background: '#F2600C' },
            { width: H + 6 + 'px', height: H + 6 + 'px', background: '#F2600C', offset: 0.3 },
            { width: W + 14 + 'px', height: H + 'px', background: '#F5F2ED', offset: 0.78 },
            { width: W + 'px', height: H + 'px', background: '#F5F2ED' },
          ],
          { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' },
        );
        grow.onfinish = () => {
          finish();
          drop.cancel();
          grow.cancel();
          inner.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' },
          );
        };
      };
    };

    const check = () => {
      if (!shown && (window.scrollY || 0) > threshold()) open();
    };
    window.addEventListener('scroll', check, { passive: true });
    // Page restored mid-scroll on refresh: wait for scroll restoration, then drop.
    const restoreTimer = setTimeout(check, 350);
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    const onLoad = () => { loadTimer = setTimeout(check, 200); };
    window.addEventListener('load', onLoad);

    return () => {
      mounted = false;
      window.removeEventListener('scroll', check);
      window.removeEventListener('load', onLoad);
      clearTimeout(restoreTimer);
      if (loadTimer) clearTimeout(loadTimer);
      up.removeEventListener('mouseenter', onUpEnter);
      up.removeEventListener('mouseleave', onUpLeave);
      ct.removeEventListener('mouseenter', onCtEnter);
      ct.removeEventListener('mouseleave', onCtLeave);
      up.removeEventListener('click', onUpClick);
      wrap.remove();
    };
  }, []);

  return null;
}
