/**
 * 2× upscale brochure PNGs (Lanczos) for sharper display on retina screens.
 * Run: node scripts/upscale-brochure-assets.mjs
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '../public/brochure-assets');
const SCALE = 2;

const files = (await readdir(assetsDir)).filter(f => f.endsWith('.png'));

for (const file of files) {
  const inputPath = join(assetsDir, file);
  const input = await readFile(inputPath);
  const meta = await sharp(input).metadata();
  const out = await sharp(input)
    .resize(Math.round((meta.width ?? 0) * SCALE), Math.round((meta.height ?? 0) * SCALE), {
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 6 })
    .toBuffer();
  await writeFile(inputPath, out);
  console.log(`${file}: ${meta.width}x${meta.height} -> ${Math.round((meta.width ?? 0) * SCALE)}x${Math.round((meta.height ?? 0) * SCALE)}`);
}

console.log(`Done. Upscaled ${files.length} files.`);
