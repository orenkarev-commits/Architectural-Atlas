#!/usr/bin/env node
/**
 * Atlas Photo Studio — back-of-house desktop tool.
 *
 * Not part of the app. Run it on your Mac and open http://localhost:8787:
 * pick a building (its current photo loads from assets/images/buildings) or
 * drop in another image, describe the clean-up, compare versions from Nano
 * Banana, approve one. The approved photo is written back into
 * assets/images/buildings, data/photos.ts is repointed, the edit is logged in
 * studio/photo-edits.json, and (optionally) it's committed to git.
 *
 * Listens on 127.0.0.1 only; the Gemini key never leaves this machine.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadEnv } from './lib/env.mjs';
import { buildPrompt, PRESETS, PRESERVE_GUARD } from './lib/prompts.mjs';
import { editOnce, mockEdit, MODELS } from './lib/gemini.mjs';
import { approveEdit, currentPhoto, listBuildings, paths } from './lib/repo.mjs';
import { createJob, loadJobs, getJob, setStatus, addResult, markApproved, flowFile, watchDownloads } from './lib/flow.mjs';

loadEnv();

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.STUDIO_PORT ?? 8787);
const API_KEY = process.env.GEMINI_API_KEY ?? '';
const MOCK = process.env.STUDIO_MOCK === '1' || !API_KEY;
const AUTO_PUSH = process.env.STUDIO_AUTO_PUSH === '1';
const MAX_BODY = 60 * 1024 * 1024;

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const STATIC_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/** A bare file name (spaces allowed, as in "67-Beit Victor Nagi.jpeg") — no folders, no "..". */
const isPlainFileName = (name) => name.length < 256 && !/[\\/\0]/.test(name) && name !== '.' && name !== '..';

const inbox = watchDownloads();
// Non-secret settings (your Flow project, results per run) live in studio.config.json.
const SETTINGS = (() => {
  try {
    return JSON.parse(readFileSync(resolve(HERE, 'studio.config.json'), 'utf8'));
  } catch {
    return {};
  }
})();
const FLOW_PROJECT_URL = process.env.STUDIO_FLOW_PROJECT_URL ?? SETTINGS.flowProjectUrl ?? '';
const FLOW_RESULTS = Number(SETTINGS.flowResultsPerJob) || 2;

const fail = (status, message) => Object.assign(new Error(message), { status });

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(fail(413, 'Image too large (60 MB limit).'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(fail(400, 'Body is not valid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Only this tool's own page may use the API: the Host must be localhost (blocks
 * DNS-rebinding) and any Origin must be this server (blocks other websites open
 * in your browser from posting to it). POSTs must be JSON, which browsers can't
 * send cross-origin without a preflight this server never approves.
 */
function sameOrigin(req) {
  const host = (req.headers.host ?? '').toLowerCase();
  const okHost = host === `localhost:${PORT}` || host === `127.0.0.1:${PORT}`;
  const origin = req.headers.origin;
  const okOrigin = !origin || origin === `http://localhost:${PORT}` || origin === `http://127.0.0.1:${PORT}`;
  return okHost && okOrigin;
}

function decodeImage(field, b64, mime) {
  if (!b64 || typeof b64 !== 'string') throw fail(400, `Missing ${field}.`);
  const type = (mime || 'image/jpeg').toLowerCase();
  if (!ALLOWED_MIME.has(type)) throw fail(400, `Unsupported image type ${type}.`);
  return { buffer: Buffer.from(b64.replace(/^data:[^;]+;base64,/, ''), 'base64'), mime: type };
}

/** Send the model an upright JPEG of at most 3072px; pass through formats sharp can't read. */
async function normalise(buffer, mime) {
  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 3072, height: 3072, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 92 })
      .toBuffer();
    return { buffer: out, mime: 'image/jpeg' };
  } catch {
    return { buffer, mime };
  }
}

async function handleEdit(body) {
  const decoded = decodeImage('image', body.image, body.mimeType);
  const { buffer, mime } = await normalise(decoded.buffer, decoded.mime);
  const instruction = buildPrompt({ prompt: body.prompt, presets: body.presets, preserve: body.preserve !== false });
  const model = MODELS[body.model] ? body.model : 'pro';
  const count = Math.min(Math.max(Number(body.variants) || 1, 1), 3);
  const imageSize = ['1K', '2K', '4K'].includes(body.imageSize) ? body.imageSize : '2K';

  const settled = await Promise.allSettled(
    Array.from({ length: count }, (_, i) =>
      MOCK
        ? mockEdit({ image: buffer, variant: i })
        : editOnce({ apiKey: API_KEY, model, image: buffer, mimeType: mime, instruction, imageSize })
    )
  );
  const variants = [];
  const errors = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      variants.push({ image: s.value.data.toString('base64'), mimeType: s.value.mimeType, note: s.value.note });
    } else errors.push(s.reason?.message ?? String(s.reason));
  }
  if (!variants.length) throw fail(502, errors[0] ?? 'Edit failed.');
  return { variants, errors, instruction, model: MOCK ? 'mock' : MODELS[model].id, mock: MOCK };
}

async function handleApprove(body) {
  const id = Number(body.buildingId);
  if (!Number.isInteger(id) || id <= 0) throw fail(400, 'Pick a building first.');
  const building = listBuildings().find((b) => b.id === id);
  if (!building) throw fail(400, `No building with id ${id} in data/buildings.ts.`);
  const edited = decodeImage('edited image', body.edited, body.editedMime).buffer;
  const atlasFile =
    typeof body.originalAtlasFile === 'string' && isPlainFileName(body.originalAtlasFile) ? body.originalAtlasFile : null;
  const original = !atlasFile && body.original ? decodeImage('original image', body.original, body.originalMime) : null;
  return approveEdit({
    buildingId: id,
    buildingName: building.name,
    edited,
    original: original?.buffer,
    originalMime: original?.mime,
    originalAtlasFile: atlasFile,
    instruction: body.instruction,
    prompt: body.prompt,
    presets: body.presets,
    model: body.model,
    source: body.source,
    commit: Boolean(body.commit),
    push: Boolean(body.commit) && AUTO_PUSH,
  });
}

function buildingFor(id) {
  const building = listBuildings().find((b) => b.id === Number(id));
  if (!building) throw fail(400, `No building with id ${id} in data/buildings.ts.`);
  return building;
}

async function handleFlowCreate(body) {
  const building = buildingFor(body.buildingId);
  let image;
  let originalAtlasFile = null;
  if (body.image) {
    image = decodeImage('image', body.image, body.mimeType).buffer;
  } else {
    const photo = currentPhoto(building.id);
    if (!photo) throw fail(400, 'This building has no photo yet — drop one in first.');
    image = photo.buffer;
    originalAtlasFile = photo.file;
  }
  const instruction = buildPrompt({ prompt: body.prompt, presets: body.presets, preserve: body.preserve !== false })
    .replace(/^Edit this photograph of a historic building in Tel Aviv\.\n\n/, '');
  const expected = Math.min(Math.max(Number(body.expected) || FLOW_RESULTS, 1), 4);
  return createJob({ building, image, originalAtlasFile, instruction, prompt: body.prompt, presets: body.presets, preserve: body.preserve, source: body.source, expected });
}

async function handleFlowApprove(id, body) {
  const job = getJob(id);
  if (!job) throw fail(404, `No Flow job ${id}.`);
  const result = job.results[Number(body.result)];
  if (!result) throw fail(400, 'Choose one of the Flow results first.');
  const edited = readFileSync(flowFile('results', result.file));
  const out = await approveEdit({
    buildingId: job.buildingId,
    buildingName: job.buildingName,
    edited,
    original: job.originalAtlasFile ? null : readFileSync(flowFile('sources', job.sourceFile)),
    originalMime: 'image/jpeg',
    originalAtlasFile: job.originalAtlasFile,
    instruction: job.instruction,
    prompt: job.prompt,
    presets: job.presets,
    model: 'Google Flow · Nano Banana',
    source: job.source,
    commit: Boolean(body.commit),
    push: Boolean(body.commit) && AUTO_PUSH,
  });
  markApproved(id, out.record.file);
  return out;
}

function serveFile(res, full) {
  const type = full && STATIC_TYPES[extname(full).toLowerCase()];
  if (!type) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
  res.end(readFileSync(full));
}

/** Serve a file from the Atlas photos folder (thumbnails in the building list). */
function servePhoto(res, name) {
  const full = resolve(paths.buildingsDir, decodeURIComponent(name));
  const type = STATIC_TYPES[extname(full).toLowerCase()];
  if (!type || relative(paths.buildingsDir, full).startsWith('..') || !existsSync(full)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
  res.end(readFileSync(full));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: `Open the Studio at http://localhost:${PORT}` });

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(readFileSync(resolve(HERE, 'public/index.html')));
    }
    if (req.method === 'GET' && url.pathname.startsWith('/photos/')) {
      return servePhoto(res, url.pathname.slice('/photos/'.length));
    }
    if (req.method === 'GET' && (url.pathname.startsWith('/flow/sources/') || url.pathname.startsWith('/flow/results/'))) {
      const [, , kind, ...rest] = url.pathname.split('/');
      return serveFile(res, flowFile(kind, decodeURIComponent(rest.join('/'))));
    }
    if (req.method === 'GET' && url.pathname === '/api/flow/jobs') {
      return sendJson(res, 200, { jobs: loadJobs().reverse(), inbox: inbox.state });
    }
    if (req.method === 'GET' && url.pathname === '/api/config') {
      return sendJson(res, 200, {
        flowProjectUrl: FLOW_PROJECT_URL,
        inbox: inbox.state,
        mock: MOCK,
        models: Object.fromEntries(Object.entries(MODELS).map(([k, v]) => [k, v.label])),
        presets: PRESETS.map(({ id, label }) => ({ id, label })),
        guard: PRESERVE_GUARD,
        autoPush: AUTO_PUSH,
        photosFolder: paths.buildingsDir,
      });
    }
    if (req.method === 'GET' && url.pathname === '/api/buildings') {
      return sendJson(res, 200, { buildings: listBuildings() });
    }
    if (req.method === 'GET' && url.pathname === '/api/photo') {
      const photo = currentPhoto(url.searchParams.get('id'));
      if (!photo) return sendJson(res, 404, { error: 'This building has no photograph in assets/images/buildings yet.' });
      return sendJson(res, 200, { file: photo.file, mimeType: photo.mimeType, image: photo.buffer.toString('base64') });
    }
    if (req.method === 'POST') {
      if (!(req.headers['content-type'] ?? '').startsWith('application/json')) throw fail(415, 'Send JSON.');
      if (url.pathname === '/api/edit') return sendJson(res, 200, await handleEdit(await readJson(req)));
      if (url.pathname === '/api/approve') return sendJson(res, 200, await handleApprove(await readJson(req)));
      if (url.pathname === '/api/flow/jobs') return sendJson(res, 200, await handleFlowCreate(await readJson(req)));
      const m = url.pathname.match(/^\/api\/flow\/jobs\/([\w-]+)\/(status|approve|result)$/);
      if (m) {
        const body = await readJson(req);
        if (m[2] === 'status') return sendJson(res, 200, setStatus(m[1], body.status));
        if (m[2] === 'approve') return sendJson(res, 200, await handleFlowApprove(m[1], body));
        // Manual import: a Flow download dragged onto the job.
        const img = decodeImage('image', body.image, body.mimeType);
        const ext = img.mime === 'image/png' ? '.png' : img.mime === 'image/webp' ? '.webp' : '.jpg';
        return sendJson(res, 200, addResult(m[1], img.buffer, ext, body.name ?? null));
      }
    }
    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[studio]', err.message);
    return sendJson(res, err.status ?? 500, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nAtlas Photo Studio → http://localhost:${PORT}`);
  console.log(`  Photos folder: ${paths.buildingsDir}`);
  console.log(MOCK ? '  Mode: MOCK (no GEMINI_API_KEY) — versions are stamped placeholders.' : '  Mode: live — Nano Banana via Gemini API.');
  console.log(inbox.state.ok ? `  Flow inbox: watching ${inbox.state.dir}` : '  Flow inbox: off (see above)');
  if (AUTO_PUSH) console.log('  Auto-push: on — approved commits are pushed.');
  console.log('');
});
