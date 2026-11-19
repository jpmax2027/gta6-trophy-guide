// main.ts — hand-in program for the gta6-trophy-guide-01 entry.
//
// What it does, in plain terms:
//   1. Finds the output directory ($MAKEFUN_OUTPUT_DIR, default /output).
//   2. Copies this repo's app/ folder and screenshots/ folder into it.
//   3. Asks the vendored make.fun frontend kit to describe that output
//      directory as a dossier, and writes the result to dossier.json.
//
// The program is deterministic: copying the same app/ and screenshots/
// twice produces byte-identical dossier.json files, which the tests rely on.
// Node 22, standard library only — no packages, no network.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The repo root is the folder this file lives in, wherever it is checked out.
const repoRoot = dirname(fileURLToPath(import.meta.url));

// The hand-in directory: an explicit override wins, /output is the default.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Make sure the destination exists before copying anything into it.
mkdirSync(out, { recursive: true });

// Copy the static web app exactly as authored — the dossier is computed
// from these bytes, so nothing may be transformed on the way through.
cpSync(join(repoRoot, "app"), join(out, "app"), { recursive: true });

// Copy the four screenshots the same way.
cpSync(join(repoRoot, "screenshots"), join(out, "screenshots"), { recursive: true });

// Build the dossier with the competition's caps and write it next to the
// copied folders. buildDossier returns the canonical JSON bytes.
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(join(out, "dossier.json"), dossier);

// Report the size as a quick sanity signal: a truncated or empty dossier
// would show up here immediately in the hand-in logs.
console.log("gta6-trophy-guide: app/, screenshots/ and dossier.json (" + dossier.length + " bytes) written to " + out);
