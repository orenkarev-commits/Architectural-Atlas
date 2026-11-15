#!/usr/bin/env node
/**
 * Sync "Why it matters" from the Obsidian vault INTO the app.
 *
 * The vault is the editable source for this field. Each vault building note has
 * a `## Why it matters` section and an `id:` in its frontmatter; this copies that
 * text into the matching building's `innovation` field in data/buildings.ts.
 *
 * Usage:
 *   node scripts/sync-why-it-matters.js          # dry run — shows what would change
 *   node scripts/sync-why-it-matters.js --apply   # write the changes
 *
 * After --apply, run `npx tsc --noEmit` then `eas update` as usual.
 */
const fs = require('fs');
const path = require('path');

const VAULT = '/Users/orenkarev/Desktop/Obsidian /Architectural Atlas/Buildings';
const APP = path.join(__dirname, '..', 'data', 'buildings.ts');
const apply = process.argv.includes('--apply');

// The app's `innovation` field is PLAIN TEXT. The vault "Why it matters" may use
// Markdown, so strip formatting when copying it across.
function stripMarkdown(s) {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[Link|Alias]] -> Alias
    .replace(/\[\[([^\]]+)\]\]/g, '$1')            // [[Link]] -> Link
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')       // [text](url) -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1')             // **bold** -> bold
    .replace(/(^|[^*])\*([^*]+)\*($|[^*])/g, '$1$2$3') // *italic* -> italic
    .replace(/`([^`]+)`/g, '$1')                   // `code` -> code
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Read every vault building note -> { id: whyText }
const vaultWhy = {};
for (const file of fs.readdirSync(VAULT)) {
  if (!file.endsWith('.md')) continue;
  const text = fs.readFileSync(path.join(VAULT, file), 'utf8');
  const idM = text.match(/^id:\s*(\d+)\s*$/m);
  if (!idM) continue;
  const id = +idM[1];
  // grab the paragraph(s) under "## Why it matters" up to the next "## " heading
  const secM = text.match(/##\s*Why it matters\s*\n+([\s\S]*?)\n+##\s/);
  if (!secM) continue;
  const why = stripMarkdown(secM[1]); // collapse + strip Markdown for the plain-text app field
  if (why) vaultWhy[id] = why;
}

// 2. Read the app, split into entries, replace innovation for each matched id
let app = fs.readFileSync(APP, 'utf8');
const changes = [];
app = app.replace(
  /(\n    id:\s*(\d+),[\s\S]*?\n    whyItMatters:\s*)"([^"]*)"/g,
  (whole, head, idStr, current) => {
    const id = +idStr;
    const next = vaultWhy[id];
    if (next === undefined || next === current) return whole;
    changes.push({ id, from: current, to: next });
    return head + JSON.stringify(next);
  }
);

if (!changes.length) {
  console.log('No differences — app already matches the vault "Why it matters".');
  process.exit(0);
}

console.log(`${changes.length} building(s) would change:\n`);
for (const c of changes) {
  console.log(`--- id ${c.id} ---`);
  console.log(`  APP:   ${c.from.slice(0, 120)}${c.from.length > 120 ? '…' : ''}`);
  console.log(`  VAULT: ${c.to.slice(0, 120)}${c.to.length > 120 ? '…' : ''}\n`);
}

if (apply) {
  fs.writeFileSync(APP, app);
  console.log(`✓ Applied ${changes.length} change(s) to data/buildings.ts. Now run: npx tsc --noEmit`);
} else {
  console.log('Dry run. Re-run with --apply to write these changes.');
}
