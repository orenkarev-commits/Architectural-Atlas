import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setPhotoEntry, slugify, photoEntryFor } from '../lib/repo.mjs';
import { buildPrompt, PRESERVE_GUARD } from '../lib/prompts.mjs';
import { editOnce } from '../lib/gemini.mjs';

const SAMPLE = `const photos: Partial<Record<number, ImageSourcePropType>> = {
  // comment
  1: require('../assets/images/buildings/1-Brown-Rabinsky-House.jpeg'),
  5: require('../assets/images/buildings/5-water-tower.jpg'),
  52: require('../assets/images/buildings/52-balfour-42.jpeg'),
};

export function photoFor() {}
`;

test('replaces an existing entry and reports the previous file', () => {
  const { text, previousFile } = setPhotoEntry(SAMPLE, 5, '5-water-tower-studio.jpg');
  assert.equal(previousFile, '5-water-tower.jpg');
  assert.match(text, /5: require\('\.\.\/assets\/images\/buildings\/5-water-tower-studio\.jpg'\)/);
  assert.equal(text.match(/^\s*5:/gm).length, 1);
  assert.match(text, /52: require/); // id 52 untouched
});

test('does not confuse id 5 with id 52', () => {
  const { previousFile } = setPhotoEntry(SAMPLE, 52, 'x.jpg');
  assert.equal(previousFile, '52-balfour-42.jpeg');
  assert.match(setPhotoEntry(SAMPLE, 52, 'x.jpg').text, /5: require\('\.\.\/assets\/images\/buildings\/5-water-tower\.jpg'\)/);
});

test('adds a new entry inside the map', () => {
  const { text, previousFile } = setPhotoEntry(SAMPLE, 7, '7-new.jpg');
  assert.equal(previousFile, null);
  const mapBody = text.slice(0, text.indexOf('\n};'));
  assert.match(mapBody, /7: require\('\.\.\/assets\/images\/buildings\/7-new\.jpg'\)/);
});

test('rejects a bad id', () => {
  assert.throws(() => setPhotoEntry(SAMPLE, 0, 'a.jpg'));
});

test('slugify handles en dashes and accents', () => {
  assert.equal(slugify('Brown–Rabinsky House'), 'brown-rabinsky-house');
  assert.equal(slugify('Café Noga'), 'cafe-noga');
});

test('buildPrompt combines presets, own prompt and guard', () => {
  const p = buildPrompt({ prompt: 'Remove the blue van', presets: ['street-clutter'] });
  assert.match(p, /parked cars/);
  assert.match(p, /blue van/);
  assert.ok(p.endsWith(PRESERVE_GUARD));
  assert.ok(!buildPrompt({ prompt: 'x', preserve: false }).includes(PRESERVE_GUARD));
  assert.throws(() => buildPrompt({ prompt: '  ' }));
});

test('editOnce sends image + text and decodes the returned image', async () => {
  let sent;
  const fakeFetch = async (url, init) => {
    sent = { url, init, body: JSON.parse(init.body) };
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Done.' }, { inlineData: { mimeType: 'image/png', data: Buffer.from('PNGDATA').toString('base64') } }] } }],
      }),
    };
  };
  const out = await editOnce({ apiKey: 'k', model: 'fast', image: Buffer.from('in'), mimeType: 'image/jpeg', instruction: 'do it', fetchImpl: fakeFetch });
  assert.match(sent.url, /gemini-3\.1-flash-image-preview:generateContent$/);
  assert.equal(sent.init.headers['x-goog-api-key'], 'k');
  assert.equal(sent.body.contents[0].parts[0].inline_data.mime_type, 'image/jpeg');
  assert.equal(sent.body.contents[0].parts[1].text, 'do it');
  assert.equal(out.data.toString(), 'PNGDATA');
  assert.equal(out.note, 'Done.');
});

test('editOnce surfaces API errors and blocked responses', async () => {
  const err = async () => ({ ok: false, status: 400, json: async () => ({ error: { message: 'API key not valid' } }) });
  await assert.rejects(editOnce({ apiKey: 'k', model: 'pro', image: Buffer.from(''), mimeType: 'image/jpeg', instruction: 'x', fetchImpl: err }), /API key not valid/);
  const blocked = async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'IMAGE_SAFETY', content: { parts: [] } }] }) });
  await assert.rejects(editOnce({ apiKey: 'k', model: 'pro', image: Buffer.from(''), mimeType: 'image/jpeg', instruction: 'x', fetchImpl: blocked }), /IMAGE_SAFETY/);
});

test('photoEntryFor finds the registered file without confusing 5 and 52', () => {
  assert.equal(photoEntryFor(SAMPLE, 5), '5-water-tower.jpg');
  assert.equal(photoEntryFor(SAMPLE, 52), '52-balfour-42.jpeg');
  assert.equal(photoEntryFor(SAMPLE, 7), null);
});

test('Flow queue: create, collect a download, approve-ready', async () => {
  const { mkdtempSync, writeFileSync, mkdirSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const sharp = (await import('sharp')).default;
  const downloads = mkdtempSync(join(tmpdir(), 'dl-'));
  const flow = await import('../lib/flow.mjs');
  const img = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#c2531f' } }).png().toBuffer();
  const job = await flow.createJob({ building: { id: 9999, name: 'Test Building' }, image: img, instruction: 'x', expected: 2 });
  assert.equal(job.status, 'queued');
  const w = flow.watchDownloads(downloads, { intervalMs: 1e9, log: () => {} });
  writeFileSync(join(downloads, 'before.png'), img); // arrives while not in Flow → ignored
  w.tick(); w.tick();
  flow.setStatus(job.id, 'in_flow');
  writeFileSync(join(downloads, 'flow-result-1.png'), img);
  w.tick(); // first sighting
  assert.equal(flow.getJob(job.id).results.length, 0);
  w.tick(); // size stable → attached
  writeFileSync(join(downloads, 'flow-result-2.png'), img);
  w.tick(); w.tick();
  const done = flow.getJob(job.id);
  w.stop();
  assert.equal(done.results.length, 2);
  assert.equal(done.status, 'returned');
  assert.deepEqual(done.results.map((r) => r.downloadName), ['flow-result-1.png', 'flow-result-2.png']);
  flow.setStatus(job.id, 'discarded');
});

test('Flow inbox matches a download to its job by name, even when not collecting', async () => {
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const sharp = (await import('sharp')).default;
  const flow = await import('../lib/flow.mjs');
  const downloads = mkdtempSync(join(tmpdir(), 'dl-'));
  const img = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#2c5f4e' } }).jpeg().toBuffer();
  const job = await flow.createJob({ building: { id: 9998, name: 'Name Match' }, image: img, instruction: 'x', expected: 1 });
  // A download that landed before the Studio started is caught up on startup.
  writeFileSync(join(downloads, `${job.sourceFile}_abc123_2K.jpg`), img);
  const w = flow.watchDownloads(downloads, { intervalMs: 1e9, log: () => {} });
  assert.equal(flow.getJob(job.id).results.length, 1);
  assert.equal(flow.getJob(job.id).status, 'returned');
  // An unrelated image with no active job is ignored.
  writeFileSync(join(downloads, 'holiday.jpg'), img);
  w.tick(); w.tick();
  assert.equal(flow.getJob(job.id).results.length, 1);
  w.stop();
  flow.setStatus(job.id, 'discarded');
});
