/**
 * Download print-ready QR for the public brochure URL.
 * Run: npm run brochure:qr
 */
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const SITE_URL =
  process.env.VITE_BROCHURE_SITE_URL ||
  'https://roomen-nentropy.github.io/nentropy_brochure_ifsfocusdays';

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&margin=24&format=png&data=${encodeURIComponent(SITE_URL)}`;

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../public');
const outPath = join(outDir, 'brochure-qr-print.png');

const res = await fetch(qrUrl);
if (!res.ok) throw new Error(`QR fetch failed: ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
await writeFile(outPath, buf);
console.log(`Saved ${outPath}`);
console.log(`URL encoded in QR: ${SITE_URL}`);
