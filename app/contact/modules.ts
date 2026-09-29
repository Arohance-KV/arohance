import {
  applyTheme, reveal, cursor, clock,
  shellMinimal, navPad, makeForm, text, type Behavior,
} from '@/lib/behaviors';

/** Contact page behaviour set, in the verified componentDidMount order
 *  from `.source/templates/contact.html` (lines 424-497). Like Studio and
 *  Case Study, Contact inlines everything in one componentDidMount body
 *  rather than splitting into `initX()` methods (aside from
 *  `applyTheme`/`shell`):
 *
 *   1. `this.applyTheme()` -> `applyTheme` (unmodified, reused)
 *   2. `this.shell()` -> `shellMinimal` (page-specific port, NOT
 *      `shell.ts` — confirmed byte-identical to Studio's and Case Study's
 *      own `shell()`, all three missing the close-on-link-click wiring
 *      `shell.ts` has. See shellMinimal.ts.)
 *   3. reveal setup -> `reveal` (unmodified, reused; frozen "Expressive"
 *      P values {y:46,d:1100} match `MOTION.y`/`MOTION.dur` — Contact's P
 *      object has no `a` (amp) field at all, confirming it never drives a
 *      parallax computation)
 *   4. the nav scroll handler -> `navPad` (page-specific port, NOT
 *      `nav.ts` and NOT `navCareers.ts` — this is Ruling 1's "minimal like
 *      careers, but not careers" case. Contact's nav only ever sets
 *      padding and logo height: no button loop (buttons rest permanently
 *      at the static `#1F1E1C`/`#EDE9E1` classes), no `[data-ag-navcta]`
 *      (zero occurrences in the template, unlike careers.html), and only
 *      a `scroll` listener — no `resize` (`navCareers.ts` adds both). See
 *      navPad.ts.)
 *   5. custom-cursor block -> `cursor` (unmodified, reused). Contact's own
 *      version omits the `[data-cursor]` mouseenter/mouseleave loop
 *      entirely (unlike Studio/Case Study), but the page also has zero
 *      `[data-cursor]` elements (confirmed by grep), so `cursor.ts`
 *      running that same loop over an empty NodeList is a no-op —
 *      provably equivalent, not merely assumed so.
 *   6. `[data-ag-clock]` interval -> `clock` (unmodified, reused)
 *   7. `[data-ag-form]` submit handler -> `makeForm('Thanks — we reply
 *      within a working day')` (Task 13 fix round 1: `form.ts` is now a
 *      factory, `makeForm(message)` — Contact's confirmation message is
 *      "Thanks — we reply within a **working** day", matching the promise
 *      already made in the page's own intro copy; the shared `form`
 *      instance carries "a day" with no "working", verified correct for
 *      Home/About/Services/Case Study by direct grep. Every other
 *      statement (preventDefault, find `[data-ag-submit]`, set color,
 *      disable) is identical to the shared instance, so only the message
 *      needed parameterising — this page's previous dedicated
 *      `formWorkingDay.ts` module is deleted. This one has a real,
 *      wired-up `<form data-ag-form>` in the markup — not dormant like
 *      Case Study's.)
 *
 *  Contact has NO parallax: grepped the whole template for
 *  `data-parallax` — zero hits, and the source's own P object has no `a`
 *  field, confirming the page never computes one. So `parallax` is not in
 *  this list. Also confirmed absent entirely (zero grep hits, same census
 *  as Studio/Case Study): `initServices`/`data-svc`,
 *  `initMagnet`/`data-ag-magnet`, `initEther`/`data-ag-ether`,
 *  `initStroke`/`data-ag-stroke`, `initReel`/`data-vt-`,
 *  `initTrail`/`data-ag-trail`, `initVideo`/`data-ag-lightbox`,
 *  `initFlags`, `FanPointer`/`data-ag-fan`, `initRoles`/`data-role`,
 *  `[data-hover-group]` (no hover-lift behaviour of any kind on this
 *  page). Does not spread `SHARED` (would pull in `nav`, `parallax` and
 *  `form`, none of which match this page).
 *
 *  `text` (last, not in the original) runs the heading and eyebrow entrances,
 *  lib/behaviors/text.ts.
 *  Must stay a module-level constant: AgRuntime's effect deps are
 *  [modules], so a fresh array each render would remount every behaviour. */
export const CONTACT_MODULES: Behavior[] = [
  applyTheme, shellMinimal, reveal, navPad, cursor, clock, makeForm('Thanks — we reply within a working day'), text,
];
