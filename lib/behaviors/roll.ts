import { whenRevealed } from '../curtain';
import type { Behavior } from './types';

/** A heading rolls one letter every GAP ms, from WAIT ms after it first comes on
 *  screen (its entrance has played by then); one roll takes ROLL ms. */
const GAP = 1200, WAIT = 2500, ROLL = 720;

/**
 * Rolls the letters of each `[data-ag-roll]` heading, one at a time in a random
 * order, while the heading is on screen. A `[data-ag-roll-letter]` rises out of
 * its word, and the markup makes that a roll: the word clips to its capitals and
 * carries a text-shadow copy 1em below, which rises into the letter's place
 * before the letter drops back unseen. Off under reduced motion.
 */
export const roll: Behavior = (root) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const headings = Array.from(root.querySelectorAll<HTMLElement>('[data-ag-roll]'), (el) => ({
    el, letters: Array.from(el.querySelectorAll<HTMLElement>('[data-ag-roll-letter]')), on: false, since: 0, last: -1,
  }));
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    const h = headings.find((x) => x.el === entry.target)!;
    h.on = entry.isIntersecting;
    if (h.on && !h.since) h.since = performance.now();
  }));
  const tick = setInterval(() => {
    for (const h of headings) {
      if (!h.on || performance.now() - h.since < WAIT || !h.letters.length) continue;
      let i = Math.floor(Math.random() * h.letters.length);
      if (i === h.last) i = (i + 1) % h.letters.length;
      h.last = i;
      h.letters[i].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1em)' }], { duration: ROLL, easing: 'cubic-bezier(.76,0,.24,1)' });
    }
  }, GAP);
  let disposed = false;
  // After the page transition's curtain is off (lib/curtain.ts), like the text entrances.
  whenRevealed().then(() => { if (!disposed) headings.forEach((h) => io.observe(h.el)); });

  return () => {
    disposed = true;
    clearInterval(tick);
    io.disconnect();
    headings.forEach((h) => h.letters.forEach((l) => l.getAnimations().forEach((a) => a.cancel())));
  };
};
