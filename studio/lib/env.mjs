import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the Atlas repo root (the folder that holds package.json and data/). */
export const REPO_ROOT = resolve(here, '..', '..');

/**
 * Minimal .env reader — the Atlas already keeps secrets in the repo-root .env
 * (gitignored), so the studio reads the same file instead of adding a dependency.
 * Values already present in process.env win, so `GEMINI_API_KEY=… npm start` works too.
 */
export function loadEnv(file = resolve(REPO_ROOT, '.env')) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
