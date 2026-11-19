# Tel Aviv Architectural Atlas: how to research and think (updated 2026-11-19)

Read the memory `handover_architectural_atlas` first. These rules sit on top of it and replace nothing. Where a skill
and a decision disagree, the decision holds (library README, "Precedence").

## Skills applied here
| Skill | Use it for |
|---|---|
| `handasa-research` | All research. **Part L** (lessons from London) and **Part M** (finding the architect: expanded source ladder) are part of every run. |
| `atlas-generator` + `tel-aviv-language` | Writing: one voice; the sourced Tel Aviv dictionary; never "stripped modernism". |
| `architectural-knowledge` (v0.8.5, Architectural Intelligence) | Reading drawings, signatures and photos with provenance, plus illustrated dictionary plates. |
| `facade-elevation` | Straightened façade photos; AI restorations in Google Flow (illustration only). Not applied yet. |
| `3d-arch-model` | Real 3D from Handasa plans and elevations (preferred over schematic diagrams). Not applied yet. |
| ui-craft, motion, Expo skills, web-asset-generator, d3-viz | Design work on the app. |

## The architect and the year come first
- Every pass re-hunts the architect and the exact year. "Unknown" is never final.
- **Work Part M rung by rung**, and log every rung, including negatives, in the vault note
  `Research/Architect Hunt — Part M log and archive requests`:
  - M1, the drawing: the title block, every signature, the builder and the engineer;
  - M2, municipal and press notices;
  - M3, the professional press of the period;
  - M4, the architecture archives (write requests);
  - M5, conservation files and the municipal details catalogues;
  - M6, people and offices;
  - M7, close the loop.
- **The municipal catalogue of typical details for conservation building, Eclectic volume 1920–1930**
  (tel-aviv.gov.il/Forms/הסגנון האקלקטי.pdf) names the architect, or "לא ידוע" (unknown), for each building it
  shows. Search its text, then read the hit on the rendered page. It found **A. Tiner** for Beit Oplatka and Beit
  Karaso. Look for the International Style volume too.
- **Grades A–E:**
  - A: a document names him for this building;
  - B: strong independent evidence;
  - C: sister-building inference;
  - D: secondary claim only;
  - E: a guess, never written into the Atlas.

  Never infer an architect from style.
- **How it shows in the app:** a confirmed architect is shown by name. An official-secondary or otherwise strong
  but unconfirmed one is shown as `"Name (attributed)"`; the app strips the suffix to link the bio. Competing claims
  are recorded in `materials` and in the vault as conflicting until a permit settles them.
- **Every architect named gets a bio** (`data/architects.ts` plus vault `Architects/`). Fields with no source say
  "Not yet documented". Nothing is invented.

## Reading evidence (Architectural Intelligence)
- **Record what is written, and keep normalising separate.** An unreadable signature is `[unclear]` with candidate
  readings, for example Sheinkin 55's "M. Goligus" [Goligun / Golicus / Galigus]. Never turn an OCR guess into a fact.
- **Verify every OCR search hit on the page image** before using it. The NLI press search returned "Tiner" for an
  OCR misreading of **פינר (Piner)** in an unrelated 1926 notice. Hebrew OCR confuses letters such as ט/פ, ד/ר,
  ה/ח and ו/ז.
- The NLI newspaper search works by URL (`nli.org.il/he/newspapers/?a=q…&txq=<terms>&dafyq=<from>&datyq=<to>`).
  The results match the words separately, so open each hit and read it.

## Pictures
- Street View and Google Earth are for looking only: read several positions and every capture date (older captures
  often show the front without the trees). Never capture, edit or upload a Google image.
- An AI restoration (`facade-elevation`, Google Flow) is an **illustration**:
  - captioned as such;
  - the original is kept beside it (for example `47-nastissin-house-original.jpeg`);
  - what it invented is listed in the vault's `App/Photo Credits`;
  - it is never used as evidence of the original state.

## Housekeeping
- Every `data/*.ts` change is mirrored to the Obsidian vault in the same pass.
- Run `node_modules/.bin/tsc --noEmit -p .` before reporting.
- Ask before committing, pushing, downloading archive material, or spending credits.
