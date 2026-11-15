# Photo Studio (back of house)

A desktop tool for cleaning up building photographs with a prompt. **It is not part of the app.**
Nothing here is bundled into the Atlas. It runs on your Mac and works directly on the Atlas's photos folder:

```
~/Claude/architectural-atlas/assets/images/buildings
```

It reads each building's current photo from there and writes approved versions back there.

```
browser (localhost:8787) ──image + prompt──▶ studio server ──▶ Nano Banana (Gemini API)
                         ◀──1–3 versions──                ◀──
          approve ──────────────────────────▶ assets/images/buildings/<id>-<slug>-studio.jpg
                                              data/photos.ts repointed to it
                                              studio/photo-edits.json (provenance log)
                                              optional git commit / push
```

## One-time setup

1. Get a Gemini API key at <https://aistudio.google.com/app/apikey>. Flow has no public API, so the
   Studio calls the same Nano Banana image models directly.
2. Add it to `~/Claude/architectural-atlas/.env` (already gitignored):
   ```
   GEMINI_API_KEY=your-key
   STUDIO_AUTO_PUSH=0        # 1 = push after every approved commit
   ```
3. Install once:
   ```bash
   cd ~/Claude/architectural-atlas/studio && npm install
   ```

## Use

```bash
cd ~/Claude/architectural-atlas/studio && npm start
```

Then open **http://localhost:8787**.

1. **Pick a building** in the sidebar. Its current photo loads from the buildings folder.
   Tick *Only buildings without a photo* to find the gaps.
2. Optionally **drop a different image** (a Flow export, your own shot) to start from instead, and note its source.
3. **Describe the clean-up:** tick presets and/or write your own instruction. **Preserve architecture**
   (on by default) tells the model to leave the building itself untouched.
4. Choose **Best quality** (Nano Banana Pro) or **Fast draft** (Nano Banana 2) and 1–3 versions, then
   **Generate** (⌘ + Enter).
5. **Inspect** a version full-screen, and hold *space* to flip to the original. Choose one and **Approve**.

The approved photo is saved as a JPEG (max 2400 px) in the buildings folder, and `data/photos.ts` is
pointed at it. If Expo is running, the app reloads with it. The previous photo stays in the folder untouched.

## Google Flow (no API key needed)

Flow uses your Google AI subscription credits, but it has no API, so the Studio works with it through a queue:

1. Pick a building, write the prompt and click **Send to Flow**. A job is queued with the source photo
   (`studio/flow/sources/job-…jpg`) and the exact prompt.
2. **Run the job in Flow.** The quickest way is to ask Claude to *"run the Flow queue"*: it opens your
   Flow project in Chrome, uploads each source, edits it with the prompt, and downloads the results at 2K.
   To do it yourself instead: click **Collect downloads**, upload the source in Flow, paste the prompt
   (**Copy prompt**), generate, and download.
3. While a job is collecting, any new image in `~/Downloads` is attached to it automatically. Downloads
   are copied, never moved. You can also drop a Flow download onto the job.
4. Compare the results with the original, choose one and **Approve**. It goes into the buildings folder
   like any other edit, logged as *Google Flow · Nano Banana*.

Your Flow project link and the number of results per run are set in `studio/studio.config.json`.
The first time, macOS may ask whether Terminal can access your Downloads folder. Allow it.
Queue files live in `studio/flow/` and are gitignored.

## Provenance

Every approval is logged in `studio/photo-edits.json`: the building, the new file, the previous file,
the original (in the buildings folder, or in `studio/originals/` if you dropped in a different image),
the source/credit, your prompt, the full instruction sent and the model. Cleaned images always stay
traceable to their straight photographs.

## Notes

- **No key?** *Generate with Gemini API* runs in mock mode, with tinted copies, but **Send to Flow** works normally.
  Gemini image generation needs billing enabled on the key's Google project.
- **Security:** the server only listens on your Mac (127.0.0.1) and only accepts requests from its own page.
- **Tests:** `npm test`.
