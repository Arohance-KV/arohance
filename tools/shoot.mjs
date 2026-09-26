// tools/shoot.mjs — Playwright fidelity harness (Task 9 revised).
//
// Captures a full-page screenshot + a JSON measurement record for all seven
// Arohance pages, against either the original self-unpacking HTML bundles
// ("original") or the Next.js port ("port"), at a given viewport width.
//
// Usage:
//   node tools/shoot.mjs <original|port> <width> [height]
//
// Examples:
//   node tools/shoot.mjs original 1440 900
//   node tools/shoot.mjs port 1440 900
//
// Prerequisite for target=port: `npm run build` must already have produced
// a `.next` directory — this script starts `next start` itself (and stops
// it when done), but does not build. For target=original it starts (and
// stops) a small static file server over the repo root; the seven bundles
// need a real HTTP origin, not file://, to unpack.
//
// Output: <OUT_BASE>/<target>/<width>/<slug>.{png,json}
// OUT_BASE defaults to this session's scratch directory (see below);
// override with the SHOOT_OUT_DIR environment variable. Screenshots never
// land inside the repo.

import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve, dirname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ORIGINAL_SERVER_PORT = 4500;
const NEXT_SERVER_PORT = 4501;

// Portable default (Task 9 fix-round 7): the previous default was one
// developer's own session-scratch path, unwritable by anyone else on any
// other machine or in CI. SHOOT_OUT_DIR (or the matching arg in
// compare.mjs) still overrides this for a specific run.
const OUT_BASE = process.env.SHOOT_OUT_DIR || join(tmpdir(), 'arohance-fidelity-shots');

// slug -> { the original bundle's filename in the repo root, the port's route }
const PAGES = [
  { slug: 'home', original: 'Arohance Homepage.html', route: '/' },
  { slug: 'about', original: 'Arohance About.html', route: '/about' },
  { slug: 'services', original: 'Arohance Services.html', route: '/services' },
  { slug: 'studio', original: 'Arohance Studio.html', route: '/studio' },
  { slug: 'careers', original: 'Arohance Careers.html', route: '/careers' },
  { slug: 'contact', original: 'Arohance Contact.html', route: '/contact' },
  { slug: 'case-study', original: 'Arohance Case Study.html', route: '/case-study' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/** Minimal static file server over `root`. Only ever asked for the seven
 * known bundle filenames in practice, but serves anything under `root` in
 * case a bundle's post-unpack JS makes a relative fetch (none observed —
 * the loader decodes everything from inline base64 — but this is cheap
 * insurance and matches the brief's "serve the repo root", not just seven
 * allowlisted files). */
function startStaticServer(root, port) {
  const rootNorm = normalize(root);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const filePath = normalize(join(rootNorm, pathname));
      if (filePath !== rootNorm && !filePath.startsWith(rootNorm + sep)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      if (!existsSync(filePath)) {
        res.writeHead(404).end('not found');
        return;
      }
      const data = await readFile(filePath);
      res.writeHead(200, {
        'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'content-length': data.length,
      });
      res.end(data);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolvePromise(server));
  });
}

/** Spawns `next start -p <port>` by invoking Next's own bin script directly
 * with `process.execPath` (no npm/.cmd shell wrapper). This keeps it a
 * single child process on Windows, so a plain `child.kill()` is enough —
 * going through `npm start` would spawn a process tree (npm -> next) that
 * is awkward to tear down cleanly from a script. */
function startNextServer(port) {
  const nextBin = join(REPO_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.output = [];
  child.stdout.on('data', (d) => child.output.push(d.toString()));
  child.stderr.on('data', (d) => child.output.push(d.toString()));
  return child;
}

/** Polls `url` until it responds or `child` exits early or `timeoutMs`
 * elapses. Used for the Next server, whose startup time isn't fixed. */
function waitForHttp(url, timeoutMs, child) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolvePromise, reject) => {
    let settled = false;
    const onExit = (code) => {
      if (settled) return;
      settled = true;
      reject(new Error(`server process exited early (code ${code}) before responding at ${url}\n${(child.output || []).join('')}`));
    };
    if (child) child.once('exit', onExit);
    const attempt = () => {
      if (settled) return;
      const req = http.get(url, (res) => {
        res.resume();
        if (settled) return;
        settled = true;
        if (child) child.removeListener('exit', onExit);
        resolvePromise();
      });
      req.on('error', () => {
        if (settled) return;
        if (Date.now() > deadline) {
          settled = true;
          if (child) child.removeListener('exit', onExit);
          reject(new Error(`timed out waiting for ${url} to respond (${timeoutMs}ms)`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timer)), timeout]);
}

/** Waits for genuine readiness, not a fixed sleep. `[data-ag-root]` is the
 * signal the brief specifies for the originals (the bundle has unpacked
 * and replaced the document) — applied to both targets here since it is
 * equally valid, harmless, and cheap for the port (it exists as soon as
 * the server-rendered markup is present). fonts.ready and network-idle are
 * both required "for both" per the brief. */
async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-ag-root]', { timeout: 45000, state: 'attached' });
  await withTimeout(page.evaluate(() => document.fonts.ready), 10000, 'document.fonts.ready');
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

/** Scrolls the full height of the page in steps (so IntersectionObserver-
 * driven `[data-reveal]` entries fire), returns to the top, then waits
 * briefly. `lib/behaviors/reveal.ts` also force-reveals everything after a
 * 1600ms guard timeout regardless of scroll — the total time spent here
 * comfortably exceeds that, so even elements the scroll pass does not
 * precisely intersect still end up revealed before the screenshot. */
async function triggerReveal(page) {
  const { scrollHeight, innerHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  const steps = Math.max(8, Math.ceil(scrollHeight / Math.max(innerHeight, 1)) + 2);
  for (let i = 1; i <= steps; i++) {
    const y = Math.round((scrollHeight * i) / steps);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1800);
}

/** Runs entirely inside the page. Returns the full measurement record
 * (minus the fields the caller fills in itself: slug/target/width/etc). */
/* eslint-disable-next-line no-unused-vars -- invoked via page.evaluate, not called directly */
function collectMeasurements() {
  function normalizeText(s) {
    return s.replace(/\s+/g, ' ').trim();
  }
  function rectOf(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
  }
  // Task 9 fix-round 4 finding: the converted markup references all three
  // families by their real, literal names (`font-family:'Archivo',
  // sans-serif`, `'JetBrains_Mono',monospace`, inherited 'Instrument Sans'
  // on body) because that is what the original's own CSS does -- but
  // next/font defined those faces under ITS OWN hashed internal names,
  // reachable only through its CSS variables, so none of the three ever
  // resolved anywhere in the markup. A synthetic test element that itself
  // sets `fontFamily` to the literal name (as this file's earlier
  // measureFontAxis/measureBodyFont did) cannot catch this class of bug:
  // it proves the font FILE supports whatever is being measured, not that
  // the PAGE's own markup ever reaches that file. The fix (self-hosting
  // the original @font-face rules under their real names, globals.css) is
  // proven here instead by reading three elements that already exist in
  // the converted markup -- no element is created for this measurement.
  function measureRealFontProofs() {
    function info(el) {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tagName: el.tagName,
        text: (el.textContent || '').trim().slice(0, 40),
        fontFamily: cs.fontFamily,
        width: r.width,
        height: r.height,
        scrollWidth: el.scrollWidth,
      };
    }
    // Archivo: the page's own h1. Prefer its first line-span (the
    // reveal-per-line headings use `display:block` -- for home's specific
    // markup that span also carries `white-space:nowrap`, so its box
    // reflects actual glyph width rather than the full-width container;
    // case-study's h1 has no spans at all and is used directly).
    const archivo = document.querySelector('h1 > span') || document.querySelector('h1');
    // JetBrains Mono: the footer's copyright line -- present, with this
    // exact structure, on all seven pages.
    const jetbrainsMono = document.querySelector('footer div span');
    // Instrument Sans: the first real paragraph on the page (body copy
    // has no font-family override of its own; it inherits body's).
    const instrumentSans = document.querySelector('p');
    return {
      archivo: info(archivo),
      jetbrainsMono: info(jetbrainsMono),
      instrumentSans: info(instrumentSans),
    };
  }
  const nav = document.querySelector('[data-ag-nav]');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const sections = Array.from(document.querySelectorAll('section[id]')).map((el) => ({
    id: el.id,
    rect: rectOf(el),
  }));
  const h1 = document.querySelector('h1');
  const h1Info = h1
    ? (() => {
        const cs = getComputedStyle(h1);
        return {
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          color: cs.color,
          // innerText (not textContent), matching the whole-page text field
          // below: it reflects rendered line breaks. textContent would glue
          // adjacent inline/block children together whenever the source has
          // no literal whitespace text node between them -- JSX compiles
          // away inter-element newlines/indentation that hand-written HTML
          // keeps as real whitespace text nodes, so textContent diverges
          // between the two targets for purely syntactic reasons that have
          // no visual effect at all.
          text: normalizeText(h1.innerText || ''),
        };
      })()
    : null;
  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    title: document.title,
    landmarks: {
      nav: { present: !!nav, rect: rectOf(nav) },
      header: { present: !!header, rect: rectOf(header) },
      footer: { present: !!footer, rect: rectOf(footer) },
      sections,
    },
    text: normalizeText(document.body.innerText || ''),
    h1: h1Info,
    bodyBackgroundColor: getComputedStyle(document.body).backgroundColor,
    fontProofs: measureRealFontProofs(),
    // Task 9 fix-round 4 root cause, fix-round 5 guard: Tailwind
    // Preflight sets `line-height:1.5` on <html>; the original has no
    // line-height on html at all, so it (and, after the fix-round 5
    // restore, the port) computes to the literal string 'normal' here.
    // Any element without its own explicit `leading-*` utility inherits
    // this value, so a reintroduced numeric value on <html> would once
    // again silently change the rendered height of every such element
    // sitewide -- direct, targeted measurement of the actual mechanism,
    // not just its downstream symptoms.
    htmlLineHeight: getComputedStyle(document.documentElement).lineHeight,
    // Task 9 fix-round 5 root cause, fix-round 6 guard: globals.css's own
    // `input, textarea, button { font: inherit; color: inherit; }` sat
    // outside any @layer, so it unconditionally beat every Tailwind
    // utility class (all in @layer utilities) regardless of specificity,
    // resetting every form control's font-size (and the submit button's
    // font-family) to whatever it inherited -- the browser default, not
    // the page's intended value. Deleted in favour of Preflight's own
    // equivalent reset (same properties, correctly inside @layer base).
    // A real <textarea> (present on 5 of 7 pages -- the two without one,
    // studio and case-study, have no comparable form control at all) is
    // the exact element the fix was reconciled against; null here is
    // "this page has none", not a failure.
    formControlProof: (() => {
      const el = document.querySelector('textarea');
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { tagName: el.tagName, fontSize: cs.fontSize, fontFamily: cs.fontFamily, height: r.height };
    })(),
  };
}

async function capture(browser, { target, url, slug, width, height, outDir }) {
  const record = {
    slug,
    target,
    width,
    height,
    url,
    capturedAt: new Date().toISOString(),
    ok: false,
  };
  const context = await browser.newContext({ viewport: { width, height } });
  try {
    const page = await context.newPage();
    await gotoAndWait(page, url);
    await triggerReveal(page);
    const measurements = await page.evaluate(collectMeasurements);
    Object.assign(record, measurements);
    record.ok = true;
    await page.screenshot({ path: join(outDir, `${slug}.png`), fullPage: true });
  } catch (err) {
    record.ok = false;
    record.error = String((err && err.stack) || err);
  } finally {
    await context.close();
  }
  await writeFile(join(outDir, `${slug}.json`), JSON.stringify(record, null, 2));
  return record;
}

async function main() {
  const [, , target, widthArg, heightArg] = process.argv;
  if (!['original', 'port'].includes(target) || !widthArg) {
    console.error('usage: node tools/shoot.mjs <original|port> <width> [height]');
    process.exit(1);
  }
  const width = parseInt(widthArg, 10);
  const height = parseInt(heightArg || '900', 10);

  const outDir = join(OUT_BASE, target, String(width));
  await mkdir(outDir, { recursive: true });

  let staticServer;
  let nextChild;
  let baseOrigin;

  if (target === 'original') {
    staticServer = await startStaticServer(REPO_ROOT, ORIGINAL_SERVER_PORT);
    baseOrigin = `http://localhost:${ORIGINAL_SERVER_PORT}`;
    console.log(`static server serving ${REPO_ROOT} on ${baseOrigin}`);
  } else {
    if (!existsSync(join(REPO_ROOT, '.next'))) {
      console.error('.next not found — run `npm run build` before shooting target=port');
      process.exit(1);
    }
    nextChild = startNextServer(NEXT_SERVER_PORT);
    baseOrigin = `http://localhost:${NEXT_SERVER_PORT}`;
    await waitForHttp(`${baseOrigin}/`, 30000, nextChild);
    console.log(`next start serving ${baseOrigin}`);
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const p of PAGES) {
      const url = target === 'original' ? `${baseOrigin}/${encodeURIComponent(p.original)}` : `${baseOrigin}${p.route}`;
      const record = await capture(browser, { target, url, slug: p.slug, width, height, outDir });
      if (record.ok) {
        console.log(`OK   ${target} ${p.slug} (${url})`);
      } else {
        console.error(`FAIL ${target} ${p.slug} (${url}): ${record.error}`);
      }
      results.push(record);
    }
  } finally {
    await browser.close();
    if (staticServer) await new Promise((r) => staticServer.close(r));
    if (nextChild) nextChild.kill();
  }

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n${target} @ ${width}x${height}: ${okCount}/${PAGES.length} captured cleanly`);
  console.log(`output: ${outDir}`);
  if (okCount < PAGES.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exitCode = 1;
});
