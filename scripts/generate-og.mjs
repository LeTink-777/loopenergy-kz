/**
 * Renders the 1200x630 social preview used by Google, Telegram, WhatsApp,
 * X and Facebook. Run with `npm run og`.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const mark = readFileSync('public/favicon-source.svg');

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2b2336"/>
      <stop offset="100%" stop-color="#1c1720"/>
    </linearGradient>
    <radialGradient id="halo" cx="78%" cy="22%" r="55%">
      <stop offset="0%" stop-color="#9561e9" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#9561e9" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#b78dff"/>
      <stop offset="100%" stop-color="#9561e9"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#halo)"/>
  <rect x="80" y="196" width="6" height="96" rx="3" fill="url(#accent)"/>

  <text x="112" y="252" font-family="Montserrat, Arial Black, Arial, sans-serif" font-size="76" font-weight="900" fill="#ffffff" letter-spacing="-1">LOOP</text>
  <text x="112" y="252" font-family="Montserrat, Arial Black, Arial, sans-serif" font-size="76" font-weight="900" fill="url(#accent)" letter-spacing="-1" dx="238">Energy</text>

  <text x="112" y="330" font-family="Montserrat, Arial, sans-serif" font-size="33" font-weight="600" fill="rgba(255,255,255,0.86)">Кофеиновые паучи без никотина</text>
  <text x="112" y="382" font-family="Montserrat, Arial, sans-serif" font-size="27" font-weight="400" fill="rgba(255,255,255,0.6)">Официальный дистрибьютор в Казахстане</text>

  <rect x="112" y="436" width="232" height="52" rx="26" fill="rgba(149,97,233,0.16)" stroke="rgba(149,97,233,0.5)"/>
  <text x="228" y="470" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="700" fill="#b78dff" text-anchor="middle">50 мг кофеина</text>

  <text x="112" y="556" font-family="Montserrat, Arial, sans-serif" font-size="28" font-weight="700" fill="#b78dff">loopenergy.kz</text>

  <rect x="1058" y="40" width="86" height="44" rx="14" fill="rgba(149,97,233,0.22)" stroke="rgba(149,97,233,0.6)"/>
  <text x="1101" y="70" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">21+</text>
</svg>`;

const glyph = await sharp(mark, { density: 384 }).resize(240, 240).png().toBuffer();

await sharp(Buffer.from(card))
  .composite([{ input: glyph, top: 195, left: 900 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-image.png');

console.log('public/og-image.png written (1200x630)');
