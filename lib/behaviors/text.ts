import type { gsap as Gsap } from 'gsap';
import { whenRevealed } from '../curtain';
import type { Behavior } from './types';

/**
 * Text entrances, each played once as it scrolls into view (GSAP):
 *  - `h1`, `h2` and `[data-split]` slide up into place inside clipping masks:
 *    an h1 line by line (every page writes its h1 as one block span per line),
 *    anything else word by word, so it wraps exactly as before at any width;
 *  - `h3` sub-headings and `[data-eyebrow]` labels (each child of the label,
 *    or the label itself) are uncovered by an accent block wiping across;
 *    `data-split` on an h3 gives it the slide instead.
 * Leaves alone the text other effects own: the Selected work zoom, the About
 * story portal, the menu overlay and live clocks. Off under reduced motion.
 *
 * GSAP loads lazily, like the stroke and ether effects. The hidden starting
 * states are set here at mount without it, so only the tweens wait for the
 * chunk; if it fails to load, the text is put back as it was.
 */
const SKIP = '[data-ag-zoom-frame], .ag-portal, [data-ag-overlay], [data-ag-clock]';
/** Clip at the line box, with room below for descenders and to the sides for
 *  the tight tracking; lifted once the text has landed. */
const MASK = 'clip-path:inset(-.1em -1em -.15em)';
const SPACE = /([ \t\n\r\f]+)/; // not \s: a no-break space has to stay inside its word

type Play = (gsap: typeof Gsap) => { kill(): unknown };

export const text: Behavior = (root) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const undo: (() => void)[] = [];
  const plays = new Map<Element, Play>();
  const span = (css: string) => {
    const s = document.createElement('span');
    s.style.cssText = css;
    return s;
  };

  const slide = (el: HTMLElement) => {
    const lines = el.tagName === 'H1' ? (Array.from(el.children) as HTMLElement[]) : [];
    const byLine = lines.length > 0 && lines.every((line) => getComputedStyle(line).display === 'block');
    const parts: HTMLElement[] = [];
    const masks: HTMLElement[] = [];
    const local: (() => void)[] = [];
    if (byLine) {
      for (const line of lines) {
        const mask = span(`display:block;visibility:hidden;${MASK}`);
        line.replaceWith(mask);
        mask.append(line);
        parts.push(line);
        masks.push(mask);
        local.push(() => { mask.replaceWith(line); line.style.transform = ''; });
      }
    } else {
      const height = el.getBoundingClientRect().height;
      const full = el.textContent ?? '';
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walk.nextNode()) nodes.push(walk.currentNode as Text);
      let end = 0;
      for (const node of nodes) {
        const start = end;
        end += node.data.length;
        if (!node.data.trim()) continue;
        const bits = node.data.split(SPACE).filter(Boolean);
        const made: ChildNode[] = bits.map((bit) => {
          if (!bit.trim()) return document.createTextNode(bit);
          const mask = span(`display:inline-block;visibility:hidden;${MASK}`);
          const word = span('display:inline-block');
          word.textContent = bit;
          mask.append(word);
          parts.push(word);
          masks.push(mask);
          return mask;
        });
        // A word running on across an element edge ("magnetic" + ",") must not
        // gain a line break between its two masks: join them.
        if (bits[0].trim() && full[start - 1]?.trim()) made.unshift(document.createTextNode('⁠'));
        if (bits[bits.length - 1].trim() && full[end]?.trim()) made.push(document.createTextNode('⁠'));
        node.replaceWith(...made);
        local.push(() => { made[0].before(node); made.forEach((m) => m.remove()); });
      }
      // Words that sat on a line by a hair can re-wrap once boxed (sub-pixel
      // rounding). Rather than shift the layout, slide the heading up whole.
      if (Math.abs(el.getBoundingClientRect().height - height) > 1) {
        local.splice(0).reverse().forEach((fn) => fn());
        parts.length = masks.length = 0;
        const whole = span('display:block');
        whole.append(...Array.from(el.childNodes));
        const mask = span(`display:block;visibility:hidden;${MASK}`);
        mask.append(whole);
        el.append(mask);
        parts.push(whole);
        masks.push(mask);
        local.push(() => mask.replaceWith(...Array.from(whole.childNodes)));
      }
    }
    undo.push(...local);
    if (!parts.length) return;
    plays.set(el, (gsap) => {
      gsap.set(parts, { yPercent: 120 });
      masks.forEach((m) => { m.style.visibility = ''; });
      return gsap.to(parts, {
        // a long heading spreads its words over at most 0.6s
        yPercent: 0, duration: 1, ease: 'expo.out', stagger: byLine ? 0.1 : Math.min(0.04, 0.6 / parts.length),
        onComplete: () => masks.forEach((m) => { m.style.clipPath = 'none'; }),
      });
    });
  };

  // Content is faded, not hidden, while the block covers it: a link inside
  // stays in the tab order.
  const wipe = (el: HTMLElement, delay: number) => {
    const block = span('position:absolute;inset:0;background:var(--ag-accent,#F2600C);transform:scaleX(0)');
    let covered: HTMLElement[];
    if (/flex|grid/.test(getComputedStyle(el).display)) {
      // A flex label (a dot and its text) keeps its items where they are: fade
      // each one and lay the block over the label itself.
      covered = Array.from(el.childNodes).flatMap((n) => {
        if (n instanceof HTMLElement) return [n];
        if (!n.textContent?.trim()) return [];
        const s = span('');
        n.replaceWith(s);
        s.append(n);
        undo.push(() => s.replaceWith(n));
        return [s];
      });
      const position = el.style.position;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.append(block);
      undo.push(() => { block.remove(); el.style.position = position; });
    } else {
      // Anything else gets a box hugging its text, so the block does too.
      const box = span('position:relative;display:inline-block');
      const content = span('');
      content.append(...Array.from(el.childNodes));
      box.append(content, block);
      el.append(box);
      covered = [content];
      undo.push(() => box.replaceWith(...Array.from(content.childNodes)));
    }
    covered.forEach((c) => { c.style.opacity = '0'; });
    undo.push(() => covered.forEach((c) => { c.style.opacity = ''; }));
    plays.set(el, (gsap) => gsap.timeline({ delay })
      .fromTo(block, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.45, ease: 'power3.inOut' })
      .set(covered, { opacity: 1 })
      .set(block, { transformOrigin: '100% 50%' })
      .to(block, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }));
  };

  root.querySelectorAll<HTMLElement>('h1, h2, [data-split]').forEach((el) => {
    if (!el.closest(SKIP) && !el.closest('[data-eyebrow]')) slide(el);
  });
  root.querySelectorAll<HTMLElement>('h3, [data-eyebrow]').forEach((el) => {
    if (el.closest(SKIP) || el.matches('[data-split]')) return; // an h3 can opt into the slide instead
    const labels = el.matches('[data-eyebrow]') && el.children.length ? (Array.from(el.children) as HTMLElement[]) : [el];
    labels.forEach((label, i) => { if (!label.matches(SKIP)) wipe(label, i * 0.12); });
  });

  let disposed = false;
  const live: { kill(): unknown }[] = [];
  const restore = () => undo.splice(0).reverse().forEach((fn) => fn());
  const ready = import('gsap').then((m) => m.gsap);
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      const play = plays.get(entry.target);
      if (play) ready.then((gsap) => { if (!disposed) live.push(play(gsap)); });
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  // After the page transition's curtain is off (lib/curtain.ts), so the entrances are seen.
  whenRevealed().then(() => { if (!disposed) plays.forEach((_, el) => io.observe(el)); });
  ready.catch(() => { if (!disposed) { io.disconnect(); restore(); } });

  return () => {
    disposed = true;
    io.disconnect();
    live.forEach((t) => t.kill());
    restore();
  };
};
