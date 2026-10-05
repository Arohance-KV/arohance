import type { Behavior } from './types';

/** How long the mouse rests on a card before it flies out (ms), so sweeping
 *  across the rail doesn't throw cards around. */
const DWELL = 150;

/**
 * The Content studio rail (`[data-ag-stream]`, home and services). A mouse
 * resting on a card pauses the rail and flies that card, face-on, to the
 * middle. It stays there until the mouse rests on another card (which takes
 * its place) or leaves the rail; then it flies back and the rail resumes.
 *
 * The rail motion is each card's CSS animation (ag-rail-r/-l, globals.css).
 * The fly is a Web Animation with no start keyframe, layered on top: it starts
 * from, and reverses back to, wherever the paused CSS animation holds the card.
 * While a card is out the stream carries `data-focus`, which the markup uses
 * to fade the centre vignette.
 */
export const stream: Behavior = (root) => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups: (() => void)[] = [];

  root.querySelectorAll<HTMLElement>('[data-ag-stream]').forEach((box) => {
    const cards = Array.from(box.querySelectorAll<HTMLElement>('[data-ag-card]'));
    const flying = new Map<HTMLElement, Animation>();
    let focus: HTMLElement | null = null;
    let pending: HTMLElement | null = null, dwell: ReturnType<typeof setTimeout> | undefined;

    const pause = (on: boolean) => {
      box.toggleAttribute('data-focus', on);
      cards.forEach((c) => { c.style.animationPlayState = on ? 'paused' : ''; });
    };
    const back = (card: HTMLElement) => {
      const a = flying.get(card);
      if (a && a.playbackRate > 0) a.reverse();
    };
    const out = (card: HTMLElement) => {
      if (focus === card) return;
      if (focus) back(focus);
      focus = card;
      pause(true);
      const a = flying.get(card);
      if (a) { a.reverse(); return; } // still flying back: turn it around
      // On-screen scale is p / (p - z) under the rail's 30cqw perspective p;
      // pick z so the card fills ~80% of the rail's height.
      const p = box.clientWidth * 0.3;
      const s = (0.8 * box.clientHeight) / card.offsetHeight;
      const fly = card.animate(
        { transform: `translate3d(0,0,${(p * (1 - 1 / s)).toFixed(1)}px) rotateY(0deg)` },
        { duration: reduce ? 1 : 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' },
      );
      fly.onfinish = () => {
        if (fly.playbackRate > 0) return; // arrived in the middle
        fly.cancel();
        flying.delete(card);
        if (!focus && !flying.size) pause(false);
      };
      flying.set(card, fly);
    };

    const leaveBox = () => {
      clearTimeout(dwell);
      pending = null;
      if (focus) back(focus);
      focus = null;
    };
    box.addEventListener('pointerleave', leaveBox);
    cleanups.push(() => box.removeEventListener('pointerleave', leaveBox));

    cards.forEach((card) => {
      card.style.pointerEvents = 'auto'; // the rail's wrapper is pointer-events: none
      // Armed by real mouse movement, not pointerenter: a card flying out
      // from under a still cursor uncovers another, which mustn't take over.
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || !(e.movementX || e.movementY) || card === focus || card === pending) return;
        clearTimeout(dwell);
        pending = card;
        dwell = setTimeout(() => { pending = null; out(card); }, DWELL);
      };
      const leave = () => { if (pending === card) { clearTimeout(dwell); pending = null; } };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
        card.style.pointerEvents = '';
      });
    });

    cleanups.push(() => {
      clearTimeout(dwell);
      flying.forEach((a) => a.cancel());
      pause(false);
    });
  });

  return () => cleanups.forEach((fn) => fn());
};
