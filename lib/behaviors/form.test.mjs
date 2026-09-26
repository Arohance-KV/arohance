import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Task 13 fix round 1: `careers.html` and `contact.html` each have their own
 * form-submit confirmation message, different from the "Thanks — we reply
 * within a day" text `lib/behaviors/form.ts` hardcoded. Careers shipped
 * (Task 12) mounting the shared `form` unmodified, so it showed the wrong
 * message — a defect neither that task's implementer nor its reviewer
 * caught, because both were focused on `roles.ts`/`navCareers.ts`.
 *
 * This pins, per page, that the message `form.ts`/`app/<slug>/modules.ts`
 * actually mounts is the one that page's own template's `componentDidMount`
 * sets on submit — read from `.source/templates/<slug>.html` directly, not
 * copied from a table, so a future edit to either side breaks this test
 * rather than silently drifting apart again.
 *
 * The template stores an em dash as the `—` escape; the ported code
 * uses a literal '—' character. Same rendered string, different source
 * bytes (Task 5) — `decodeJsString` below normalises the template's escape
 * before comparing, so the assertion is on rendered characters, not on
 * matching escaping styles.
 */

const decodeJsString = (raw) => raw
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"')
  .replace(/\\\\/g, '\\');

/** The literal success message a template's own source sets via
 *  `btn.textContent = '...'` on form submit, or null if the template has
 *  no such assignment at all (Studio: no form, no message).
 *
 *  Anchored on the captured string starting with "Thanks": every one of
 *  these templates' custom-cursor block also assigns
 *  `dot.textContent = '';` (cleared on mouseleave), which is a plain
 *  `textContent = '...'` match too and appears earlier in the file, before
 *  the form's own assignment — an unanchored regex picks that empty string
 *  up first and reports a false "no message" for every page. Anchoring on
 *  the one piece of text every real success message shares rules that out. */
const templateMessage = (slug) => {
  const src = readFileSync(`.source/templates/${slug}.html`, 'utf8');
  const m = /textContent\s*=\s*'(Thanks(?:[^'\\]|\\.)*)'/.exec(src);
  return m ? decodeJsString(m[1]) : null;
};

/** The message a page's own `modules.ts` will actually mount, resolved
 *  from the *code* (the `_MODULES` array literal), not from doc-comment
 *  prose that happens to quote the same string — restricting the search to
 *  the array literal keeps this from matching a comment that describes the
 *  code instead of the code itself. `defaultMessage` is form.ts's own
 *  default instance, read from source rather than hardcoded a second time
 *  so this test can't drift from form.ts on its own. Returns null if the
 *  page mounts no form behaviour at all (Studio). */
const mountedMessage = (modulesPath, defaultMessage) => {
  const src = readFileSync(modulesPath, 'utf8');
  const arrayLiteral = /export const \w+_MODULES: Behavior\[\] = \[([\s\S]*?)\];/.exec(src);
  assert.ok(arrayLiteral, `${modulesPath}: could not find a _MODULES array literal`);
  const body = arrayLiteral[1];
  const factoryCall = /\bmakeForm\('((?:[^'\\]|\\.)*)'\)/.exec(body);
  if (factoryCall) return factoryCall[1];
  if (/\bSHARED\b/.test(body) || /(^|[,\s])form(?=[,\s]|$)/.test(body)) return defaultMessage;
  return null;
};

const defaultMessage = (() => {
  const src = readFileSync('lib/behaviors/form.ts', 'utf8');
  const m = /export const form: Behavior = makeForm\('((?:[^'\\]|\\.)*)'\)/.exec(src);
  assert.ok(m, 'form.ts: could not find the default form instance');
  return m[1];
})();

const PAGES = [
  { slug: 'home', modulesPath: 'app/modules.ts' },
  { slug: 'about', modulesPath: 'app/about/modules.ts' },
  { slug: 'services', modulesPath: 'app/services/modules.ts' },
  { slug: 'careers', modulesPath: 'app/careers/modules.ts' },
  { slug: 'studio', modulesPath: 'app/studio/modules.ts' },
  { slug: 'case-study', modulesPath: 'app/case-study/modules.ts' },
  { slug: 'contact', modulesPath: 'app/contact/modules.ts' },
];

test('default form message matches home/about/services/case-study source', () => {
  assert.equal(defaultMessage, 'Thanks — we reply within a day');
});

for (const { slug, modulesPath } of PAGES) {
  test(`${slug}: mounted form message matches ${slug}.html's own source`, () => {
    const wanted = templateMessage(slug);
    const got = mountedMessage(modulesPath, defaultMessage);
    assert.equal(got, wanted,
      `${slug} mounts ${JSON.stringify(got)} but its own template sets ${JSON.stringify(wanted)}`);
  });
}

test('studio genuinely has no form: no message in source, no form behaviour mounted', () => {
  assert.equal(templateMessage('studio'), null, 'studio.html unexpectedly has a textContent submit message');
  assert.equal(mountedMessage('app/studio/modules.ts', defaultMessage), null,
    'STUDIO_MODULES unexpectedly mounts a form behaviour');
});
