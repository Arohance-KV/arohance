import type { Behavior } from './types';

/** Dwell before a hovered row opens / before leaving the list closes it (ms):
 *  long enough that sweeping the mouse across the rows doesn't flap them. */
const OPEN_DWELL = 80, CLOSE_DWELL = 160;
/** Gap between the cursor and the preview card, and the card's margin from
 *  the viewport edge (px). */
const GAP = 28, EDGE = 16;

/**
 * The homepage's "Five verticals" rows (`[data-ag-verticals]`). One row is
 * open at a time: a mouse opens the row it rests on and closes it on leaving
 * the list; a tap toggles a row, and a tap on a closed row's name opens it
 * instead of navigating (the ↗ always navigates); keyboard focus opens the
 * focused row. The open row carries `data-open`, which is all the markup's
 * styling keys off.
 *
 * While a mouse is over the list, `[data-vx-preview]` shows the open row's
 * image and trails the cursor.
 */
export const verticals: Behavior = (root) => {
  const list = root.querySelector<HTMLElement>('[data-ag-verticals]');
  if (!list) return () => {};
  const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-vx]'));
  const card = root.querySelector<HTMLElement>('[data-vx-preview]');
  const frames = card ? Array.from(card.querySelectorAll<HTMLElement>('[data-vx-frame]')) : [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups: (() => void)[] = [];
  const listen = <E extends Event>(target: EventTarget, type: string, fn: (e: E) => void, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn as EventListener, opts);
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, opts));
  };

  let open: HTMLElement | null = null;
  let hovering = false; // a mouse is over the list
  let dwell: ReturnType<typeof setTimeout> | undefined;

  // Preview card: beside the cursor (flipping to its left near the right
  // edge), eased toward it with a slight tilt from its horizontal speed.
  let w = 0, h = 0, cx = 0, cy = 0, x = 0, y = 0, s = 0.6, tilt = 0, raf = 0;
  const measure = () => { if (card) { w = card.offsetWidth; h = card.offsetHeight; } };
  const toX = (px: number) => (px + GAP + w > innerWidth - EDGE ? px - GAP - w : px + GAP);
  const toY = (py: number) => Math.min(Math.max(py - h / 2, EDGE), innerHeight - h - EDGE);
  const frame = () => {
    raf = 0;
    if (!card) return;
    const shown = hovering && open !== null;
    const ease = reduce ? 1 : 0.16;
    const tx = toX(cx), ty = toY(cy), ts = shown ? 1 : 0.6;
    const lastX = x;
    x += (tx - x) * ease; y += (ty - y) * ease; s += (ts - s) * (reduce ? 1 : 0.18);
    const lean = reduce ? 0 : Math.max(-7, Math.min(7, (x - lastX) * 0.3));
    tilt += (lean - tilt) * 0.14;
    card.style.opacity = shown ? '1' : '0';
    card.style.transform =
      'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
    const settled = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(ts - s) < 0.002 && Math.abs(tilt) < 0.02;
    if (!settled) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const setOpen = (row: HTMLElement | null) => {
    clearTimeout(dwell);
    if (row === open) return;
    open?.removeAttribute('data-open');
    row?.setAttribute('data-open', '');
    open = row;
    frames.forEach((f, i) => { f.style.opacity = rows[i] === row ? '1' : '0'; });
    kick();
  };
  const settle = (row: HTMLElement | null, ms: number) => {
    clearTimeout(dwell);
    dwell = setTimeout(() => setOpen(row), ms);
  };

  // Mouse: hover opens after a dwell; leaving the list closes.
  rows.forEach((row) => listen<PointerEvent>(row, 'pointerenter', (e) => {
    if (e.pointerType === 'mouse') settle(row, OPEN_DWELL);
  }));
  listen<PointerEvent>(list, 'pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    hovering = true;
    measure();
    cx = e.clientX; cy = e.clientY;
    x = toX(cx); y = toY(cy); // appear at the cursor rather than fly in
  });
  listen<PointerEvent>(list, 'pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    cx = e.clientX; cy = e.clientY;
    kick();
  });
  listen<PointerEvent>(list, 'pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    hovering = false;
    settle(null, CLOSE_DWELL);
    kick();
  });
  listen(window, 'resize', measure);

  // Touch and pen: a tap toggles its row. Mouse clicks just follow links.
  let pointer = 'mouse';
  listen<PointerEvent>(list, 'pointerdown', (e) => { pointer = e.pointerType; }, { capture: true });
  rows.forEach((row) => {
    const head = row.querySelector<HTMLElement>('[data-vx-head]');
    if (!head) return;
    listen<MouseEvent>(head, 'click', (e) => {
      if (pointer === 'mouse') return;
      const link = (e.target as Element).closest('a');
      if (link?.hasAttribute('data-vx-go')) return;
      if (link) {
        if (row !== open) { e.preventDefault(); setOpen(row); }
        return;
      }
      setOpen(row === open ? null : row);
    });
  });

  // Keyboard: focus opens the focused row; tabbing out of the list closes it.
  // Only keyboard focus: a tap or click that focuses a link is handled above.
  listen<FocusEvent>(list, 'focusin', (e) => {
    const t = e.target as HTMLElement;
    if (t.matches(':focus-visible')) setOpen(t.closest<HTMLElement>('[data-vx]'));
  });
  listen<FocusEvent>(list, 'focusout', (e) => {
    const to = e.relatedTarget as Node | null;
    if (to && !list.contains(to) && !hovering) setOpen(null);
  });

  return () => {
    cleanups.forEach((fn) => fn());
    clearTimeout(dwell);
    cancelAnimationFrame(raf);
    open?.removeAttribute('data-open');
  };
};
