// Platinum Desk — gta6-trophy-guide-01 entry program (Node 22, standard library only).
//
// The guide itself is this repository's app/ folder: plain static files a browser opens
// at app/index.html, fully offline, with the trophy list and every guide in
// app/data/trophies.json. This program hands the entry in. It copies app/ and
// screenshots/ into the output directory and writes dossier.json there with
// buildDossier from vendor/makefun-frontend.ts — the kit's library, left byte for
// byte as the kit issued it, because the scorer rebuilds the dossier with its own
// copy and compares the two.
//
// The output directory's CONTENTS are cleared first (never the directory itself),
// so a re-run into the same directory cannot leave stale files behind and the two
// grading runs write identical bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps, as the kit states them: at most 4 screenshots of at most
// 256 KiB each, at most 993 files and directories in app/, at most 48 MiB of app
// files, and the dossier text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log('Platinum Desk handed in: app/ + screenshots/ + dossier.json written to ' + out);
