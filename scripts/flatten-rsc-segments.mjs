// Post-processes a Next.js static export for plain static hosts (GitHub Pages).
//
// Next 16 writes per-segment prefetch payloads into nested folders, e.g.
//   out/przepisy/shakshuka/__next.przepisy/$d$id/__PAGE__.txt
// but the client router requests the dot-joined file name:
//   out/przepisy/shakshuka/__next.przepisy.$d$id.__PAGE__.txt
// A Next.js server maps one to the other; static hosts return 404, which breaks
// prefetching and turns client navigations into full page reloads. This script
// adds a flat copy next to every nested payload.
//
// Usage: node scripts/flatten-rsc-segments.mjs [outDir=out]
import { copyFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const outDir = process.argv[2] ?? "out";
let copied = 0;

function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of filesIn(full)) {
        copyFileSync(file, join(dir, relative(dir, file).split(sep).join(".")));
        copied++;
      }
    } else {
      walk(full);
    }
  }
}

walk(outDir);
console.log(`flatten-rsc-segments: created ${copied} flat segment files in ${outDir}`);
