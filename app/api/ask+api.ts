import { buildings } from '../../data/buildings';
import { architects } from '../../data/architects';
import { terms } from '../../data/terms';
import { stories } from '../../data/stories';

// ── Build a compact, text-only knowledge base from the Atlas data (no images). ──
function buildKB(): string {
  const B = (buildings as any[])
    .map((b) => {
      const life = (b.timeline ?? []).map((t: any) => `${t.year}: ${t.note}`).join(' ');
      return [
        `#${b.id} ${b.name}`,
        `architect: ${b.architect}; year: ${b.year}; style: ${b.style}; address: ${b.address}`,
        b.styleNote ? `note: ${b.styleNote}` : '',
        b.whyItMatters ? `why it matters: ${b.whyItMatters}` : '',
        b.materials ? `materials & construction: ${b.materials}` : '',
        life ? `life: ${life}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const A = (architects as any[])
    .map((a) => {
      const works = (a.works ?? []).map((w: any) => `${w.name}${w.year ? ` (${w.year})` : ''}`).join('; ');
      return [
        `@${a.name}`,
        [a.years, a.active, a.education, a.styleArc].filter((x: string) => x && x !== 'Not yet documented').join('; '),
        a.innovation ? `bio: ${a.innovation}` : '',
        works ? `works: ${works}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const S = (stories as any[])
    .map((s) => `story "${s.title}" (building #${s.buildingId}): ${s.reveal}`)
    .join('\n');

  const T = (terms as any[])
    .map((t) => `${t.term} [${t.category}]: ${t.definition}${t.seenAt?.length ? ` (seen at: ${t.seenAt.join(', ')})` : ''}`)
    .join('\n');

  return `BUILDINGS\n${B}\n\n\nARCHITECTS\n${A}\n\n\nSTORIES\n${S}\n\n\nDICTIONARY\n${T}`;
}

const KB = buildKB();

const SYSTEM = `You are the research assistant for The Architectural Atlas of Tel Aviv. You answer questions about the buildings, architects, styles, materials and history held in the Atlas.

STRICT RULES
- Use ONLY the knowledge base below. Never use outside knowledge, memory, or the web. If the answer is not in the knowledge base, say plainly that the Atlas does not document it.
- Never fabricate. Distinguish documented fact from reasonable inference; when you infer, say so. When something is unknown or unattributed, say so.
- Ground every claim in specific records. Cite buildings by their #id and architects by their @name.
- Understand relationships: all buildings by an architect, architects of a style/period, buildings that share a material, etc. — answer these from the data.
- Write with an architecturally-literate, enticing but precise voice: who built it, why it matters, how it was made, how it mattered to the city. Lead with narrative, carry real data and history.

OUTPUT
Return ONLY a JSON object, no prose outside it:
{"answer": string (markdown ok), "citations": [{"type":"building"|"architect","id": number | null,"name": string}], "mapFocus": number[] (building ids to show on the map, may be empty)}
citations must reference records that exist in the knowledge base. mapFocus lists building #ids relevant to the answer.

KNOWLEDGE BASE
${KB}`;

const buildingIds = new Set((buildings as any[]).map((b) => b.id));
const architectNames = new Set((architects as any[]).map((a) => String(a.name).toLowerCase()));

export async function POST(request: Request): Promise<Response> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({ error: 'assistant_not_configured' }, { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  const history = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  const q = typeof body?.q === 'string' ? body.q : '';
  const messages = q ? [...history, { role: 'user', content: q }] : history;
  if (!messages.length) return Response.json({ error: 'empty' }, { status: 400 });

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 1200,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content ?? ''),
        })),
      }),
    });
  } catch {
    return Response.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (!res.ok) {
    return Response.json({ error: 'upstream_error', status: res.status }, { status: 502 });
  }

  const data: any = await res.json();
  const text: string = (data?.content ?? []).map((c: any) => c?.text ?? '').join('').trim();

  // Parse the model's JSON (tolerate fenced or surrounding text).
  let parsed: any = null;
  try {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : null;
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed.answer !== 'string') {
    return Response.json({ answer: text || 'Sorry — I could not form an answer.', citations: [], mapFocus: [] });
  }

  // Validate citations and mapFocus against real records (never surface invented ids).
  const citations = (Array.isArray(parsed.citations) ? parsed.citations : []).filter((c: any) =>
    c?.type === 'building'
      ? buildingIds.has(c.id)
      : c?.type === 'architect'
      ? architectNames.has(String(c.name ?? '').toLowerCase())
      : false
  );
  const mapFocus = (Array.isArray(parsed.mapFocus) ? parsed.mapFocus : []).filter((id: any) => buildingIds.has(id));

  return Response.json({ answer: parsed.answer, citations, mapFocus });
}
