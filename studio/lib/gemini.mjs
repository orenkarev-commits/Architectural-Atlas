import sharp from 'sharp';

/**
 * Image models the studio offers. Both are Google's "Nano Banana" family — the
 * same image models behind Google Labs Flow — called directly through the
 * Gemini API, since Flow itself has no public API.
 */
export const MODELS = {
  pro: { id: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro — best quality' },
  fast: { id: 'gemini-3.1-flash-image-preview', label: 'Nano Banana 2 — fast drafts' },
};

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Send one edit request. Returns { data: Buffer, mimeType, note }.
 * @param {{ apiKey: string, model: keyof MODELS, image: Buffer, mimeType: string, instruction: string, imageSize?: '1K'|'2K'|'4K', fetchImpl?: typeof fetch }} opts
 */
export async function editOnce({ apiKey, model, image, mimeType, instruction, imageSize = '2K', fetchImpl = fetch }) {
  const modelId = (MODELS[model] ?? MODELS.pro).id;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ inline_data: { mime_type: mimeType, data: image.toString('base64') } }, { text: instruction }],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { imageSize },
    },
  };

  const res = await fetchImpl(`${ENDPOINT}/${modelId}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Gemini refused the edit: ${msg}`);
  }

  const candidate = json?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  let note = '';
  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      return {
        data: Buffer.from(inline.data, 'base64'),
        mimeType: inline.mimeType ?? inline.mime_type ?? 'image/png',
        note,
      };
    }
    if (part.text) note += part.text;
  }
  const reason = candidate?.finishReason ?? json?.promptFeedback?.blockReason ?? 'no image returned';
  throw new Error(`Gemini returned no image (${reason})${note ? `: ${note.slice(0, 200)}` : ''}`);
}

/**
 * Offline stand-in used when no GEMINI_API_KEY is set (or STUDIO_MOCK=1), so the
 * whole flow — screen, variants, approval, photos.ts update — can be tried
 * without spending credits. Each variant is the original, lightly toned and
 * stamped "MOCK" so it can never be mistaken for a real edit.
 */
export async function mockEdit({ image, variant = 0 }) {
  const tints = [
    { r: 255, g: 244, b: 230 },
    { r: 235, g: 242, b: 255 },
    { r: 240, g: 255, b: 240 },
  ];
  const img = sharp(image).rotate();
  const meta = await img.metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const size = Math.round(Math.min(w, h) / 8);
  const stamp = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
       <text x="50%" y="55%" font-family="sans-serif" font-size="${size}" font-weight="700"
             fill="rgba(194,83,31,0.55)" text-anchor="middle">MOCK ${variant + 1}</text>
     </svg>`
  );
  const data = await img
    .tint(tints[variant % tints.length])
    .composite([{ input: stamp }])
    .png()
    .toBuffer();
  await new Promise((r) => setTimeout(r, 400));
  return { data, mimeType: 'image/png', note: 'Mock edit — set GEMINI_API_KEY for real results.' };
}
