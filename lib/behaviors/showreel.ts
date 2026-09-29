import type { Behavior } from './types';

/** How long each still holds before the next fades in (ms); the fade itself
 *  is the frame's own CSS opacity transition. */
const HOLD = 5200, FADE = 1600;

/**
 * The homepage hero's showreel. With a `<video>` inside `[data-ag-showreel]`
 * it plays that (muted, looped); otherwise it cross-fades the
 * `[data-ag-showreel-frame]` stills, each with a slow Ken Burns push. Either
 * way it only runs while the hero is on screen and the tab is visible, and
 * under reduced motion it holds the first frame (or the video's poster).
 */
export const showreel: Behavior = (root) => {
  const reel = root.querySelector<HTMLElement>('[data-ag-showreel]');
  if (!reel) return () => {};
  const video = reel.querySelector<HTMLVideoElement>('video');
  const frames = Array.from(reel.querySelectorAll<HTMLElement>('[data-ag-showreel-frame]'));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Browsers only autoplay muted video, and React doesn't reliably render the
  // `muted` attribute into server HTML, so set the property itself.
  if (video) video.muted = true;
  let inView = true, cur = 0, timer: ReturnType<typeof setInterval> | undefined;
  const pushes: (Animation | undefined)[] = [];

  const push = (i: number) => {
    pushes[i]?.cancel();
    const dir = i % 2 ? -1 : 1;
    pushes[i] = frames[i].animate?.(
      [
        { transform: 'scale(1.04) translate3d(0,0,0)' },
        { transform: 'scale(1.16) translate3d(' + dir * 1.8 + '%,-1.2%,0)' },
      ],
      { duration: HOLD + FADE * 2, easing: 'linear', fill: 'forwards' },
    );
  };
  const next = () => {
    frames[cur].style.opacity = '0';
    cur = (cur + 1) % frames.length;
    push(cur);
    frames[cur].style.opacity = '1';
  };
  const sync = () => {
    const run = inView && !document.hidden && !still;
    if (video) {
      if (run) video.play().catch(() => {});
      else video.pause();
      return;
    }
    if (frames.length < 2) return;
    if (run && !timer) {
      if (!pushes[cur]) push(cur);
      pushes.forEach((a) => { if (a?.playState === 'paused') a.play(); });
      timer = setInterval(next, HOLD);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = undefined;
      pushes.forEach((a) => a?.pause());
    }
  };

  const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  io.observe(reel);
  document.addEventListener('visibilitychange', sync);
  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', sync);
    clearInterval(timer);
    pushes.forEach((a) => a?.cancel());
    video?.pause();
  };
};
