import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { REPO_ROOT } from './env.mjs';

const run = promisify(execFile);

export const paths = {
  photosTs: resolve(REPO_ROOT, 'data/photos.ts'),
  edits: resolve(REPO_ROOT, 'studio/photo-edits.json'),
  buildingsDir: resolve(REPO_ROOT, 'assets/images/buildings'),
  originalsDir: resolve(REPO_ROOT, 'studio/originals'),
};

export function slugify(name) {
  return (
    String(name)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'building'
  );
}

function uniqueName(dir, base, ext) {
  let name = `${base}.${ext}`;
  for (let i = 2; existsSync(resolve(dir, name)); i++) name = `${base}-${i}.${ext}`;
  return name;
}

/**
 * Point building `id` at `file` inside data/photos.ts. Replaces the existing
 * line for that id, or adds one at the end of the map. Pure: takes and returns
 * the file's text so it can be tested without touching disk.
 * @returns {{ text: string, previousFile: string | null }}
 */
export function setPhotoEntry(source, id, file) {
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid building id: ${id}`);
  const line = `  ${id}: require('../assets/images/buildings/${file}'), // Photo Studio edit — see studio/photo-edits.json`;
  const existing = new RegExp(`^[ \\t]*${id}:\\s*require\\('\\.\\./assets/images/buildings/([^']+)'\\),?.*$`, 'm');
  const match = source.match(existing);
  if (match) {
    return { text: source.replace(existing, line), previousFile: match[1] };
  }
  const start = source.indexOf('const photos');
  const close = start === -1 ? -1 : source.indexOf('\n};', start);
  if (close === -1) throw new Error('Could not find the photos map in data/photos.ts');
  return { text: `${source.slice(0, close)}\n${line}${source.slice(close)}`, previousFile: null };
}

/** File name currently registered for building `id` in data/photos.ts, or null. Pure. */
export function photoEntryFor(source, id) {
  const re = new RegExp(`^[ \\t]*${Number(id)}:\\s*require\\('\\.\\./assets/images/buildings/([^']+)'\\)`, 'm');
  return source.match(re)?.[1] ?? null;
}

const MIME_BY_EXT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/**
 * Read the photograph the Atlas currently shows for a building, straight from
 * assets/images/buildings — the Studio's default starting image.
 * @returns {{ file: string, buffer: Buffer, mimeType: string } | null}
 */
export function currentPhoto(id) {
  const file = photoEntryFor(readFileSync(paths.photosTs, 'utf8'), id);
  if (!file) return null;
  const full = resolve(paths.buildingsDir, file);
  // The name comes from photos.ts; refuse anything that escapes the buildings folder.
  if (relative(paths.buildingsDir, full).startsWith('..') || !existsSync(full)) return null;
  const ext = file.split('.').pop().toLowerCase();
  return { file, buffer: readFileSync(full), mimeType: MIME_BY_EXT[ext] ?? 'image/jpeg' };
}

/** Convert whatever the model returned into an app-friendly JPEG (≤2400px, ~86 quality). */
export async function toAppJpeg(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

/**
 * File an approved edit into the Atlas: photo into assets, original into
 * studio/originals, photos.ts updated, provenance appended. Optionally commits.
 */
export async function approveEdit({
  buildingId,
  buildingName,
  edited,
  original,
  originalMime = 'image/jpeg',
  instruction,
  prompt,
  presets,
  model,
  source,
  originalAtlasFile = null,
  commit = false,
  push = false,
}) {
  const id = Number(buildingId);
  const slug = slugify(buildingName ?? `building-${id}`);
  mkdirSync(paths.buildingsDir, { recursive: true });
  mkdirSync(paths.originalsDir, { recursive: true });

  const file = uniqueName(paths.buildingsDir, `${id}-${slug}-studio`, 'jpg');
  writeFileSync(resolve(paths.buildingsDir, file), await toAppJpeg(edited));

  // Started from the Atlas's own photo: it stays where it is in
  // assets/images/buildings, so the provenance points there instead of copying it.
  const fromAtlas = typeof originalAtlasFile === 'string' && originalAtlasFile.length > 0;
  let originalFile = null;
  if (original && !fromAtlas) {
    const ext = originalMime.includes('png') ? 'png' : originalMime.includes('webp') ? 'webp' : 'jpg';
    const stamp = new Date().toISOString().slice(0, 10);
    originalFile = uniqueName(paths.originalsDir, `${id}-${slug}-${stamp}`, ext);
    writeFileSync(resolve(paths.originalsDir, originalFile), original);
  }

  const { text, previousFile } = setPhotoEntry(readFileSync(paths.photosTs, 'utf8'), id, file);
  writeFileSync(paths.photosTs, text);

  const log = existsSync(paths.edits) ? JSON.parse(readFileSync(paths.edits, 'utf8')) : [];
  const record = {
    buildingId: id,
    buildingName: buildingName ?? null,
    file: `assets/images/buildings/${file}`,
    previousFile: previousFile ? `assets/images/buildings/${previousFile}` : null,
    original: fromAtlas
      ? `assets/images/buildings/${originalAtlasFile}`
      : originalFile
        ? `studio/originals/${originalFile}`
        : null,
    source: source?.trim() || null,
    prompt: prompt?.trim() || null,
    presets: presets ?? [],
    instruction,
    model,
    approvedAt: new Date().toISOString(),
  };
  log.push(record);
  writeFileSync(paths.edits, `${JSON.stringify(log, null, 2)}\n`);

  let git = null;
  if (commit) git = await commitEdit(record, push);
  return { record, git };
}

async function commitEdit(record, push) {
  const files = [record.file, 'data/photos.ts', 'studio/photo-edits.json'];
  if (record.original) files.push(record.original);
  const opts = { cwd: REPO_ROOT };
  try {
    await run('git', ['add', '--', ...files], opts);
    const msg = `Photo Studio: cleaned photo for ${record.buildingName ?? `building ${record.buildingId}`}`;
    await run('git', ['commit', '-m', msg, '--', ...files], opts);
    const { stdout } = await run('git', ['rev-parse', '--short', 'HEAD'], opts);
    let pushed = false;
    if (push) {
      await run('git', ['push'], opts);
      pushed = true;
    }
    return { committed: stdout.trim(), pushed };
  } catch (err) {
    return { error: String(err.stderr || err.message).trim().slice(0, 300) };
  }
}

export function relToRepo(p) {
  return relative(REPO_ROOT, p);
}

/**
 * Buildings as the Atlas defines them (id, name, address), read from
 * data/buildings.ts so the desktop tool always matches the app. Pure.
 */
export function parseBuildings(source) {
  const str = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
  const re = new RegExp(`\\bid:\\s*(\\d+),\\s*name:\\s*${str}[\\s\\S]*?\\baddress:\\s*${str}`, 'g');
  const unescape = (s) => s.replace(/\\(.)/g, '$1');
  const out = [];
  for (const m of source.matchAll(re)) {
    out.push({ id: Number(m[1]), name: unescape(m[2] ?? m[3]), address: unescape(m[4] ?? m[5]) });
  }
  return out;
}

/** Every building with the photo file the Atlas currently shows for it (or null). */
export function listBuildings() {
  const buildings = parseBuildings(readFileSync(resolve(REPO_ROOT, 'data/buildings.ts'), 'utf8'));
  const photos = readFileSync(paths.photosTs, 'utf8');
  return buildings.map((b) => {
    const file = photoEntryFor(photos, b.id);
    return { ...b, file: file && existsSync(resolve(paths.buildingsDir, file)) ? file : null };
  });
}
