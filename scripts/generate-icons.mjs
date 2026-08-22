/**
 * Renders every platform icon from `public/favicon-source.svg`.
 *
 * Run with `npm run icons` after changing the source mark. Everything it writes
 * is committed, so the build itself never depends on sharp.
 */
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'public/favicon-source.svg';
const BG = { r: 32, g: 27, b: 36, alpha: 1 }; // #201b24

const source = readFileSync(SOURCE);

const icons = [
  // Browser tabs
  { size: 16, dest: 'public/favicon-16x16.png' },
  { size: 32, dest: 'public/favicon-32x32.png' },
  { size: 48, dest: 'public/favicon-48x48.png' },
  { size: 64, dest: 'public/favicon-64x64.png' },
  { size: 96, dest: 'public/favicon-96x96.png' },

  // Apple — one per device generation still in the wild
  { size: 57, dest: 'public/apple-touch-icon-57x57.png' },
  { size: 60, dest: 'public/apple-touch-icon-60x60.png' },
  { size: 72, dest: 'public/apple-touch-icon-72x72.png' },
  { size: 76, dest: 'public/apple-touch-icon-76x76.png' },
  { size: 114, dest: 'public/apple-touch-icon-114x114.png' },
  { size: 120, dest: 'public/apple-touch-icon-120x120.png' },
  { size: 144, dest: 'public/apple-touch-icon-144x144.png' },
  { size: 152, dest: 'public/apple-touch-icon-152x152.png' },
  { size: 167, dest: 'public/apple-touch-icon-167x167.png' },
  { size: 180, dest: 'public/apple-touch-icon-180x180.png' },
  { size: 180, dest: 'public/apple-touch-icon.png' },

  // Android densities + PWA
  { size: 36, dest: 'public/icons/android-icon-36x36.png' },
  { size: 48, dest: 'public/icons/android-icon-48x48.png' },
  { size: 72, dest: 'public/icons/android-icon-72x72.png' },
  { size: 96, dest: 'public/icons/android-icon-96x96.png' },
  { size: 144, dest: 'public/icons/android-icon-144x144.png' },
  { size: 192, dest: 'public/icons/android-icon-192x192.png' },
  { size: 256, dest: 'public/icons/android-icon-256x256.png' },
  { size: 384, dest: 'public/icons/android-icon-384x384.png' },
  { size: 512, dest: 'public/icons/android-icon-512x512.png' },

  // Windows tiles
  { size: 70, dest: 'public/icons/ms-icon-70x70.png' },
  { size: 144, dest: 'public/icons/ms-icon-144x144.png' },
  { size: 150, dest: 'public/icons/ms-icon-150x150.png' },
  { size: 310, dest: 'public/icons/ms-icon-310x310.png' },

  // Google Search / Play listing
  { size: 192, dest: 'public/icons/google-192x192.png' },
  { size: 512, dest: 'public/icons/google-512x512.png' },
  { size: 200, dest: 'public/icons/icon-200x200.png' },
];

mkdirSync('public/icons', { recursive: true });

let made = 0;
for (const icon of icons) {
  await sharp(source, { density: 384 })
    .resize(icon.size, icon.size, { fit: 'contain', background: BG })
    .png({ compressionLevel: 9 })
    .toFile(icon.dest);
  made += 1;
}

/**
 * Maskable variants: Android crops to a circle, so the mark needs ~20% padding
 * or the crop eats it.
 */
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.62);
  const glyph = await sharp(source, { density: 384 }).resize(inner, inner, { fit: 'contain', background: { ...BG, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: glyph, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(`public/icons/maskable-${size}x${size}.png`);
  made += 1;
}

/** Multi-resolution favicon.ico (16/32/48) hand-assembled — sharp has no ICO encoder. */
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((size) => sharp(source, { density: 384 }).resize(size, size, { fit: 'contain', background: BG }).png({ compressionLevel: 9 }).toBuffer()),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + sizes.length * 16;
const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngs[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return entry;
});

writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));
made += 1;

console.log(`${made} icon files written from ${SOURCE}`);
