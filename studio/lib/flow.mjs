/**
 * Google Flow hand-off.
 *
 * Flow has no API, so edits made there come back as browser downloads. The
 * Studio keeps a queue of jobs (building + source photo + prompt). A job is
 * run in Flow (by Claude driving Chrome, or by hand), then the results are
 * downloaded. While a job is marked "in Flow", any new image that appears in
 * ~/Downloads is attached to it. You then compare and approve in the Studio.
 *
 * Working files live in studio/flow/ (gitignored); only approved photos go
 * into assets/images/buildings.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { resolve, extname, basename, relative } from 'node:path';
import { homedir } from 'node:os';
import sharp from 'sharp';
import { REPO_ROOT } from './env.mjs';
import { slugify } from './repo.mjs';

const FLOW_DIR = resolve(REPO_ROOT, 'studio/flow');
export const flowPaths = {
  dir: FLOW_DIR,
  jobs: resolve(FLOW_DIR, 'jobs.json'),
  sources: resolve(FLOW_DIR, 'sources'),
  results: resolve(FLOW_DIR, 'results'),
};

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const ACTIVE = 'in_flow';

function ensureDirs() {
  for (const d of [flowPaths.dir, flowPaths.sources, flowPaths.results]) mkdirSync(d, { recursive: true });
}

export function loadJobs() {
  if (!existsSync(flowPaths.jobs)) return [];
  try {
    return JSON.parse(readFileSync(flowPaths.jobs, 'utf8'));
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  ensureDirs();
  writeFileSync(flowPaths.jobs, `${JSON.stringify(jobs, null, 2)}\n`);
}

export function getJob(id) {
  return loadJobs().find((j) => j.id === id) ?? null;
}

function updateJob(id, fn) {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) throw Object.assign(new Error(`No Flow job ${id}.`), { status: 404 });
  fn(job);
  saveJobs(jobs);
  return job;
}

function newId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Queue a job. The source is saved as an upright JPEG with a distinctive name
 * ("job-<id>-<building>.jpg") so it is easy to find in Flow's media picker.
 */
export async function createJob({ building, image, originalAtlasFile, instruction, prompt, presets, preserve, source, expected = 2 }) {
  ensureDirs();
  const id = newId();
  const sourceFile = `job-${id}-${building.id}-${slugify(building.name)}.jpg`;
  const jpeg = await sharp(image)
    .rotate()
    .resize({ width: 3072, height: 3072, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 92 })
    .toBuffer();
  writeFileSync(resolve(flowPaths.sources, sourceFile), jpeg);
  const job = {
    id,
    buildingId: building.id,
    buildingName: building.name,
    status: 'queued',
    sourceFile,
    originalAtlasFile: originalAtlasFile ?? null,
    source: source?.trim() || null,
    prompt: prompt?.trim() || null,
    presets: presets ?? [],
    preserve: preserve !== false,
    instruction,
    expected,
    results: [],
    createdAt: new Date().toISOString(),
    sentAt: null,
    approvedFile: null,
  };
  const jobs = loadJobs();
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

export function setStatus(id, status) {
  if (!['queued', ACTIVE, 'returned', 'discarded'].includes(status)) {
    throw Object.assign(new Error(`Unknown status ${status}.`), { status: 400 });
  }
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) throw Object.assign(new Error(`No Flow job ${id}.`), { status: 404 });
  if (status === ACTIVE) {
    // Only one job collects downloads at a time.
    for (const other of jobs) {
      if (other.id !== id && other.status === ACTIVE) other.status = other.results.length ? 'returned' : 'queued';
    }
    job.sentAt = new Date().toISOString();
  }
  job.status = status;
  saveJobs(jobs);
  return job;
}

/** Attach an image buffer to a job as one of its Flow results. */
export function addResult(id, buffer, ext, downloadName = null) {
  ensureDirs();
  return updateJob(id, (job) => {
    const n = job.results.length + 1;
    const file = `${job.id}-flow-${n}${ext}`;
    writeFileSync(resolve(flowPaths.results, file), buffer);
    job.results.push({ file, downloadName, receivedAt: new Date().toISOString() });
    if (job.results.length >= job.expected) job.status = 'returned';
  });
}

export function markApproved(id, file) {
  return updateJob(id, (job) => {
    job.status = 'approved';
    job.approvedFile = file;
  });
}

/** Serve-safe absolute path for a file inside sources/ or results/, or null. */
export function flowFile(kind, name) {
  const base = kind === 'sources' ? flowPaths.sources : kind === 'results' ? flowPaths.results : null;
  if (!base) return null;
  const full = resolve(base, name);
  if (relative(base, full).startsWith('..') || !existsSync(full)) return null;
  return full;
}

/**
 * Watch a downloads folder by polling (fs.watch is unreliable for browser
 * downloads, which arrive as temp files and are renamed). New, finished image
 * files go to whichever job is currently "in Flow". Downloads are copied,
 * never moved or deleted.
 */
export function watchDownloads(dir = process.env.STUDIO_DOWNLOADS_DIR || resolve(homedir(), 'Downloads'), { intervalMs = 2000, log = console.log } = {}) {
  const state = { dir, ok: false, error: null, lastScan: null };
  let seen = new Map();

  const listImages = () =>
    readdirSync(dir)
      .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()) && !f.startsWith('.'))
      .map((f) => {
        const st = statSync(resolve(dir, f));
        return { f, size: st.size, mtime: st.mtimeMs };
      });

  try {
    for (const it of listImages()) seen.set(it.f, it.size);
    state.ok = true;
  } catch (err) {
    state.error = err.code === 'EPERM' || err.code === 'EACCES'
      ? `No permission to read ${dir}. Allow Terminal access to Downloads in System Settings → Privacy & Security → Files and Folders.`
      : `Can't read ${dir}: ${err.message}`;
    log(`  Flow inbox: ${state.error}`);
  }

  const pending = new Map(); // file -> size at last look (wait for it to stop growing)

  /**
   * Which job does a download belong to? Flow names downloads after the
   * uploaded asset ("job-<id>-…jpg_<hash>_2K.jpg"), so the job id in the name
   * is the reliable match — it works even if collecting was stopped. Anything
   * else goes to the job currently "in Flow", if it arrived after it was sent.
   */
  const jobFor = (name, mtime, jobs) => {
    const byName = jobs.find((j) => name.includes(`job-${j.id}`) && !['approved', 'discarded'].includes(j.status));
    if (byName) return byName;
    const active = jobs.find((j) => j.status === ACTIVE);
    if (active && !(active.sentAt && mtime < Date.parse(active.sentAt) - 5000)) return active;
    return null;
  };

  const attach = (it) => {
    const jobs = loadJobs();
    const job = jobFor(it.f, it.mtime, jobs);
    if (!job || it.size === 0) return;
    if (job.results.some((r) => r.downloadName === it.f)) return;
    try {
      const updated = addResult(job.id, readFileSync(resolve(dir, it.f)), extname(it.f).toLowerCase(), it.f);
      log(`  Flow inbox: ${it.f} → ${updated.buildingName} (result ${updated.results.length})`);
    } catch (err) {
      log(`  Flow inbox: couldn't attach ${it.f}: ${err.message}`);
    }
  };

  // Catch up on downloads named after a job that arrived while the Studio was off.
  if (state.ok) {
    try {
      for (const it of listImages()) if (/job-\d{8}-\d{6}-\w+/.test(it.f)) attach(it);
    } catch { /* ignore */ }
  }

  const tick = () => {
    let items;
    try {
      items = listImages();
      state.ok = true;
      state.error = null;
    } catch (err) {
      state.ok = false;
      state.error = `Can't read ${dir}: ${err.message}`;
      return;
    }
    state.lastScan = new Date().toISOString();
    for (const it of items) {
      if (seen.get(it.f) === it.size) continue;
      if (pending.get(it.f) !== it.size) {
        pending.set(it.f, it.size); // first sighting or still growing
        continue;
      }
      pending.delete(it.f);
      seen.set(it.f, it.size);
      attach(it);
    }
  };

  const timer = setInterval(tick, intervalMs);
  timer.unref?.();
  return { state, stop: () => clearInterval(timer), tick };
}

export { basename };
