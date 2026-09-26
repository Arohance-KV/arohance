import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const SLUGS = {
  'Arohance Homepage.html': 'home',
  'Arohance About.html': 'about',
  'Arohance Services.html': 'services',
  'Arohance Studio.html': 'studio',
  'Arohance Careers.html': 'careers',
  'Arohance Contact.html': 'contact',
  'Arohance Case Study.html': 'case-study',
};

const EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg',
  'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4',
  'font/woff2': 'woff2', 'text/javascript': 'js', 'application/javascript': 'js',
};

// Vendor libraries are identified by a fingerprint in their first 200 bytes.
// Everything else that is JS is page logic we do not need as a file.
const VENDOR = [
  [/Three\.js Authors/, 'three.js'],
  [/GSAP 3\.12\.5/, 'gsap.js'],
  [/React Bits <LiquidEther \/>/, 'liquid-ether.js'],
  [/React Bits <StrokeText \/>/, 'stroke-text.js'],
  [/Floating "Up \/ make contact" pill/, 'contact-pill.js'],
];

mkdirSync('.source/templates', { recursive: true });
mkdirSync('.source/vendor', { recursive: true });
mkdirSync('public/images', { recursive: true });
mkdirSync('public/fonts', { recursive: true });

// The three families the templates actually reference by name in their
// helmet <style> blocks (Task 9 fix-round 4 finding: next/font's hashed
// internal names never matched the converted markup's literal
// font-family:'Archivo'/'JetBrains_Mono'/'Instrument Sans' references, so
// none of the three ever resolved in the port -- reproducing the
// original's own @font-face rules under their real names is the fix).
// Anything else that might appear here is out of scope and would be a
// silent gap if skipped, so Pass 2 below throws rather than ignoring an
// unrecognised family.
const FONT_FAMILIES = ['Archivo', 'Instrument Sans', 'JetBrains Mono'];

const blockAfter = (lines, kind) => {
  const i = lines.findIndex(l => l.includes(`script type="__bundler/${kind}"`));
  if (i === -1) throw new Error(`missing bundler block: ${kind}`);
  return JSON.parse(lines[i + 1]);
};

const byHash = new Map(); // content hash -> public path
const assetMap = {};      // uuid -> public path
const extResources = {};  // human-readable id -> public path

// Pass 1: every asset from every bundle, deduplicated by content.
for (const file of readdirSync('.')) {
  if (!SLUGS[file]) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const [uuid, a] of Object.entries(blockAfter(lines, 'manifest'))) {
    let buf = Buffer.from(a.data, 'base64');
    if (a.compressed) buf = gunzipSync(buf);
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 10);
    if (byHash.has(hash)) { assetMap[uuid] = byHash.get(hash); continue; }

    const ext = EXT[a.mime] ?? 'bin';
    let out;
    if (ext === 'js') {
      const head = buf.subarray(0, 200).toString('utf8');
      const hit = VENDOR.find(([re]) => re.test(head));
      if (!hit) { byHash.set(hash, null); assetMap[uuid] = null; continue; }
      out = `.source/vendor/${hit[1]}`;
      if (existsSync(out)) {
        if (!buf.equals(readFileSync(out))) {
          console.warn(`variant ignored: ${hit[1]} differs between bundles; keeping first`);
        }
        byHash.set(hash, out);
        assetMap[uuid] = out;
        continue;
      }
      writeFileSync(out, buf);
    } else if (ext === 'woff2') {
      // Shipped like any other asset now (Task 9 fix-round 4): the
      // converted markup references these fonts by their real names, and
      // only the original files, under those names, actually satisfy
      // that -- see FONT_FAMILIES / Pass 2 below.
      out = `/fonts/${hash}.woff2`;
      writeFileSync(join('public/fonts', `${hash}.woff2`), buf);
    } else {
      out = `/images/${hash}.${ext}`;
      writeFileSync(join('public/images', `${hash}.${ext}`), buf);
    }
    byHash.set(hash, out);
    assetMap[uuid] = out;
  }

  // ext_resources is a second reference table, alongside the manifest
  // above: a human-readable id (referenced in templates as
  // `assets/<id>.<ext>`, e.g. the testimonial reel's
  // data-vt-poster="assets/work-agasti-s.jpg") mapped to a uuid from this
  // same bundle's manifest, just resolved above. An id whose uuid maps to
  // null (a font, or page-logic JS the manifest loop discards) is skipped
  // rather than written as a null path.
  for (const { id, uuid } of blockAfter(lines, 'ext_resources')) {
    const path = assetMap[uuid];
    if (path == null) continue;
    if (id in extResources && extResources[id] !== path) {
      console.warn(`ext-resource conflict ignored: ${id} differs between bundles; keeping first`);
      continue;
    }
    extResources[id] = path;
  }
}

// Pass 2: templates, plus the @font-face rules embedded in each one's own
// <helmet><style> block. Every template declares the same 21 rules (3
// families x their own weight/subset split) against its own bundle's
// uuids; resolving each uuid through the assetMap Pass 1 just built and
// then deduplicating by the RESOLVED text (not the uuid, which differs
// per bundle even for identical content) collapses all 7 x 21 = 147 down
// to the true unique set, the same way byHash already dedupes images.
const fontFaceRules = new Map(); // resolved rule text -> true, insertion order preserved
for (const [file, slug] of Object.entries(SLUGS)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const template = blockAfter(lines, 'template');
  writeFileSync(`.source/templates/${slug}.html`, template);

  for (const block of template.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const family = (block.match(/font-family:\s*'([^']+)'/) ?? [])[1];
    if (!FONT_FAMILIES.includes(family)) {
      throw new Error(`${slug}: unrecognised @font-face family '${family}' -- add it to FONT_FAMILIES or confirm it should stay unresolved`);
    }
    const uuid = (block.match(/url\("([^"]+)"\)/) ?? [])[1];
    if (!uuid) throw new Error(`${slug}: @font-face for '${family}' has no url("...") src to resolve`);
    const path = assetMap[uuid];
    if (!path) throw new Error(`${slug}: @font-face for '${family}' references uuid ${uuid}, which did not resolve to a public path`);
    const resolved = block.replace(`url("${uuid}")`, `url("${path}")`);
    if (!fontFaceRules.has(resolved)) fontFaceRules.set(resolved, true);
  }
}
writeFileSync('.source/fonts.css', [...fontFaceRules.keys()].join('\n\n') + '\n');

writeFileSync('.source/assets.json', JSON.stringify(assetMap, null, 2));
writeFileSync('.source/ext-resources.json', JSON.stringify(extResources, null, 2));
const written = new Set(Object.values(assetMap).filter(Boolean));
console.log(`templates: 7  assets: ${written.size}  ext-resources: ${Object.keys(extResources).length}  font-face rules: ${fontFaceRules.size}`);
