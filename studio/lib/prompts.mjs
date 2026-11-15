/**
 * Prompt building for façade photographs.
 *
 * The Atlas is a research record, so the default is conservative: remove what
 * is in front of the building, never redesign the building itself. The
 * "preserve architecture" guard is appended to every prompt unless the editor
 * switches it off for a deliberate change.
 */

export const PRESERVE_GUARD =
  'Keep the building exactly as photographed: identical geometry, proportions, ' +
  'storey heights, window and door count and positions, balconies, ornament, ' +
  'materials, colours and weathering. Do not add, invent, restore or "improve" ' +
  'any architectural element. Keep the camera position, framing and perspective ' +
  'unless asked otherwise. The result must be a photorealistic photograph, not ' +
  'a rendering or illustration.';

export const PRESETS = [
  {
    id: 'street-clutter',
    label: 'Remove street clutter',
    text:
      'Remove parked cars, scooters, bicycles, pedestrians, rubbish bins, ' +
      'temporary signage and construction barriers in front of the building, ' +
      'and fill the revealed areas with the pavement, street and façade that ' +
      'would plausibly be behind them.',
  },
  {
    id: 'cables-poles',
    label: 'Remove cables & poles',
    text:
      'Remove overhead cables, wires, traffic signs, street lamps and poles that ' +
      'cross in front of the building, reconstructing the façade and sky behind them.',
  },
  {
    id: 'graffiti-posters',
    label: 'Remove graffiti & posters',
    text:
      'Remove graffiti, fly-posters, stickers and temporary banners from the walls, ' +
      'restoring the plaster or stone surface beneath to match the surrounding wall.',
  },
  {
    id: 'even-light',
    label: 'Even daylight',
    text:
      'Relight the scene as soft, even overcast daylight: reduce harsh cast shadows ' +
      'and blown highlights while keeping true colours and material texture.',
  },
  {
    id: 'clear-sky',
    label: 'Clean sky',
    text: 'Replace the sky with a clean, pale, slightly hazy daytime sky with no birds or drones.',
  },
  {
    id: 'verticals',
    label: 'Straighten verticals',
    text:
      'Correct the perspective so the vertical edges of the building are truly ' +
      'vertical, as if shot with a shift lens, cropping minimally.',
  },
];

/**
 * Compose the final instruction sent to the model.
 * @param {{ prompt?: string, presets?: string[], preserve?: boolean }} input
 */
export function buildPrompt({ prompt = '', presets = [], preserve = true } = {}) {
  const parts = ['Edit this photograph of a historic building in Tel Aviv.'];
  for (const id of presets) {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) parts.push(preset.text);
  }
  const own = prompt.trim();
  if (own) parts.push(own);
  if (parts.length === 1) {
    throw new Error('Write a prompt or pick at least one preset.');
  }
  if (preserve) parts.push(PRESERVE_GUARD);
  return parts.join('\n\n');
}
