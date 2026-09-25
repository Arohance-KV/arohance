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

const blockAfter = (lines, kind) => {
  const i = lines.findIndex(l => l.includes(`script type="__bundler/${kind}"`));
  if (i === -1) throw new Error(`missing bundler block: ${kind}`);
  return JSON.parse(lines[i + 1]);
};

const byHash = new Map(); // content hash -> public path
const assetMap = {};      // uuid -> public path

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
      // next/font/google self-hosts these; we do not ship them.
      byHash.set(hash, null); assetMap[uuid] = null; continue;
    } else {
      out = `/images/${hash}.${ext}`;
      writeFileSync(join('public/images', `${hash}.${ext}`), buf);
    }
    byHash.set(hash, out);
    assetMap[uuid] = out;
  }
}

// Pass 2: templates.
for (const [file, slug] of Object.entries(SLUGS)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  writeFileSync(`.source/templates/${slug}.html`, blockAfter(lines, 'template'));
}

writeFileSync('.source/assets.json', JSON.stringify(assetMap, null, 2));
const written = new Set(Object.values(assetMap).filter(Boolean));
console.log(`templates: 7  assets: ${written.size}`);
