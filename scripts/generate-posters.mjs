// Genera la miniatura (.webp) de un vídeo a partir de su primer fotograma, igual que
// el resto de testimonios. Usa el ffmpeg que ya trae @ffmpeg-installer.
//
//   node scripts/generate-posters.mjs <video1.mp4> [video2.mp4 ...]
// (rutas relativas a public/import-assets/stories). Por defecto procesa los testimonios nuevos.

import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const DIR = join(process.cwd(), "public", "import-assets", "stories");
const videos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["testimonio-santiago.mp4", "testimonio-alejandra.mp4"];

for (const video of videos) {
  const input = join(DIR, video);
  const output = input.replace(/\.mp4$/i, ".webp");
  if (!existsSync(input)) {
    console.log(`✗ no existe: ${video}`);
    continue;
  }
  // -ss 0.3: primer plano del vídeo (evita un posible frame 0 en negro por el fundido).
  execFileSync(ffmpegPath, [
    "-y",
    "-ss", "0.3",
    "-i", input,
    "-frames:v", "1",
    "-vf", "scale=800:-2",
    "-qscale:v", "3",
    output
  ], { stdio: ["ignore", "ignore", "ignore"] });
  const kb = (statSync(output).size / 1024).toFixed(0);
  console.log(`✓ ${video} → ${output.split(/[\\/]/).pop()} (${kb} KB)`);
}
