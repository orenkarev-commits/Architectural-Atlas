# Architectural Atlas — implementation notes

Scaffolded from the design handoff bundle (`design_handoff_architectural_atlas/`). This file is
for the dev team, not shown in-app.

## Setup

```bash
npm install
npx expo start
```

- **Android / Expo Go** works directly — the default Google-backed map provider needs no extra
  native config there.
- **iOS with the styled Google map** requires a development build, not Expo Go, because the Google
  Maps iOS config plugin needs native code:
  ```bash
  npx expo prebuild
  npx expo run:ios
  ```
  (needs full Xcode + CocoaPods on your machine).
- Run `npx tsc --noEmit` before booting a simulator to catch typos early.
- The Google Maps API key lives in `.env` (gitignored) as `GOOGLE_MAPS_API_KEY`. It's already
  populated for this build — rotate it if it leaks, since it's baked into any binary you ship.

## Development build (EAS) — for real Google Maps

Expo Go on iOS cannot load the Google Maps SDK, so `PROVIDER_GOOGLE` falls back to Apple Maps and
`lib/mapStyle.ts` never applies. A development build fixes this. EAS project is already linked
(`extra.eas.projectId` in `app.config.ts`); `eas.json` defines the profiles.

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/Claude/architectural-atlas

eas login                       # your credentials — must be run by you

# .env is gitignored, so the cloud builder never receives it.
# The key must be stored as an EAS secret or the build ships with dead maps:
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "<key from .env>"

eas build --profile development --platform ios
```

Then install the resulting build on the iPhone and run `npx expo start --dev-client`.

**Requirements and gotchas:**
- A development build on a *physical* iPhone needs an **Apple Developer Program** membership
  ($99/yr) so EAS can register the device and sign the app. A free Apple account only permits
  7-day locally-signed Xcode builds.
- The `simulator` profile builds without an Apple account but needs **full Xcode** installed to run
  it — this machine has Command Line Tools only.
- Android is cheaper: `eas build --profile development --platform android` needs no paid account,
  and Google Maps works on Android in Expo Go anyway.
- Don't put the API key in `eas.json` — that file is committed. Use `eas secret:create`.
- Verify config resolution with `expo config --type prebuild`, **not** `--type public`; the public
  manifest intentionally strips `ios.config`, so the key looks missing there even when it's fine.

## Deliberate deviations from the web prototype

- **No live geocoding.** Every building's `resolved.lat/lng` is used directly instead of porting
  the web prototype's Geocoding-API probe/cache/fallback logic — the README itself offered this as
  a valid simplification, and it sidesteps a whole class of bugs the original had (a `setState`
  inside a geocode callback detaching the live map). See `data/buildings.ts` and the Building detail
  screen's permanent "Pin from stored coordinates" note.
- No "phone frame" chrome — that was scaffolding for viewing the design on desktop. The RN app is
  just the screens, full-bleed, as they'd appear on a real device.
- `app.config.ts` app icon (`assets/images/icon.png`) is a stretched crop of the placeholder
  building photo — a real icon is needed before shipping.

## Open items carried over from the design handoff

1. **Coordinates** — 8 of 10 buildings are estimates; only Brown–Rabinsky and Engel House are
   user-verified. Berlin House (id 10) is an estimate and should be verified.
2. **Photography** — all 10 buildings share one placeholder photo
   (`assets/images/placeholder-building.png`).
   **Decision (Aug 2026): shot by hand, not sourced from Wikimedia Commons.** Own photographs
   carry no attribution requirement, so the app needs **no photo-credit UI**, and framing stays
   consistent. Commons was considered — Berlin House alone has 17 free-licensed images — but
   coverage would have been uneven and every file would have needed a per-image licence check.
   Route, framing guidance and ids: see `App/Photo Shot List.md` in the vault.
   To add one: drop the file in `assets/images/buildings/` and add a line to `data/photos.ts`.
   No change to `buildings.ts` — it resolves through `photoFor(id)` and falls back per building,
   so photographs can land one at a time.
3. **Story illustrations** — now seven needed (c8 "The top floor is by someone else" added).
4. **Nolli plan** — needed for the Field research band (currently a placeholder box).
5. **Architect quotes** — none sourced; the quote block stays hidden (by design) until real,
   attributable quotes exist. Don't fabricate them.
6. **Greidinger House attribution** — still unresolved. The municipal sign names no architect, and
   the Handasa archive has **no digitized record at all** for 38 Balfour — searched by address and
   by parcel (Gush 7435/13). The absence is itself the likely reason the attribution never settled.
7. **~~82 Rothschild conflict~~ — RESOLVED.** Joseph Berlin's own home is **83** Rothschild (corner
   of Balfour 59), not 82. Handasa file 00080830, Gush 6936/47: permit **68** approved 28/2/1929,
   completion certificate 5/6/1930, and permit **833** of 19/5/1935 for the third floor drawn by his
   son Ze'ev. 82 Rothschild remains the Brown–Rabinsky House. Berlin House added as building id 10.
8. **Photo → building recognition** — the long-term "photograph a façade, get the building" loop
   is not built. Address and location search both work today.

## Berlin House (id 10) — evidence notes

- **Primary source, read off the original 1929 drawing** (permit 68, `DocViewer.aspx?id=570930A8-…`,
  viewed at full resolution in Chrome). The title block reads:

  > **בית גב' מ. ברלין** — שדרות רוטשילד ובלפור № 59/83 — תל-אביב
  > *"House of Mrs. M. Berlin — Rothschild Boulevard and Balfour No. 83/59, Tel Aviv"*

  This independently confirms the Berlin family as owners, the initial **מ. (M.)**, and the exact
  dual address, alongside the `נתאשרה` stamp with permit **68** and **28 FEV 1929**.
- **Resolved — the wife's name.** The drawing's own title block gives **מ. (M.)**, supporting
  **Miriam** over Shoshana, and confirms the property was titled to her ("Mrs."), exactly as
  golden-lotus.co.il described. The app now reflects this.
- **Attribution confidence:** the *architect* is still secondary-source. The drawing names the
  **owner**, not the designer, and the sheet's bottom-right corner — where a signature block would
  sit — is torn away. The 1935 permit's handwritten "granted to" field remains at the edge of
  legibility. Joseph Berlin as architect rests on Wikimedia Commons + golden-lotus + project-tlv,
  now strongly corroborated by primary evidence of Berlin ownership at this exact address.
- **Not claimed:** conservation listing. Handasa renders its four status labels (including
  מבנה לשימור) as a *hidden* legend template, so their presence in the page text proves nothing.
- **Through-line worth using:** Berlin House (1929) tests the bare-silicate-brick idea a year before
  **Beit Mann** (1930, id 9), same architect. And "an architect building for himself" now runs
  through Berlin House and **Mazeh 16** (David Tobia, id 8).
