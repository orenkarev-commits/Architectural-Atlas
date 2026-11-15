#!/usr/bin/env node
/**
 * Report building images that sit in assets/images/buildings/ but are NOT wired
 * into data/photos.ts (so they never show in the app). Run it after dropping in
 * new photos. A raw image file does nothing until it has a require() in photos.ts.
 *   node scripts/check-images.js
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'assets', 'images', 'buildings');
const PHOTOS = path.join(__dirname, '..', 'data', 'photos.ts');
const BUILDINGS = path.join(__dirname, '..', 'data', 'buildings.ts');

const wired = new Set(
  [...fs.readFileSync(PHOTOS, 'utf8').matchAll(/^\s*(\d+):\s*require\(/gm)].map((m) => +m[1])
);
const realIds = new Set(
  [...fs.readFileSync(BUILDINGS, 'utf8').matchAll(/^\s{4}id:\s*(\d+),/gm)].map((m) => +m[1])
);

const unwired = [];
for (const f of fs.readdirSync(DIR)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const m = f.match(/^(\d+)[-\s]/);
  if (!m) { unwired.push(`${f}  (no id prefix — rename to NN-...)`); continue; }
  const id = +m[1];
  if (wired.has(id)) continue;
  if (!realIds.has(id)) { /* image for a non-existent/deleted building */ unwired.push(`${f}  (id ${id} is NOT a building — skip/delete)`); continue; }
  unwired.push(`${f}  →  add   ${id}: require('../assets/images/buildings/${f}'),`);
}

if (!unwired.length) { console.log('✓ Every building image is wired in photos.ts.'); process.exit(0); }
console.log(`${unwired.length} image(s) NOT wired into photos.ts:\n`);
for (const u of unwired) console.log('  ' + u);
