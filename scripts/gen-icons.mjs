// Generates app icons (192, 512, apple-touch 180) from an inline SVG wheel.
// Run with: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const colors = [
  "#FFD93D", "#6BCB77", "#9D4EDD", "#4CC9F0",
  "#4895EF", "#80B918", "#E63946", "#FF9F1C",
];

function wheelSvg(size, padding = 0) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;
  const slice = 360 / colors.length;

  const polar = (deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const slices = colors
    .map((c, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      const [sx, sy] = polar(end);
      const [ex, ey] = polar(start);
      const large = end - start <= 180 ? 0 : 1;
      return `<path d="M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 0 ${ex} ${ey} Z" fill="${c}" />`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#0a0a0a" />
    ${slices}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#ffffff" />
  </svg>`;
}

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, padding: 12 },
  { name: "icon-512.png", size: 512, padding: 32 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 80 },
];

for (const t of targets) {
  const svg = wheelSvg(t.size, t.padding);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(outDir, t.name), png);
  console.log(`✓ ${t.name}`);
}

writeFileSync(join(outDir, "icon.svg"), wheelSvg(512, 32));
console.log("✓ icon.svg");
