/**
 * Génère les icônes PWA (public/icons/) : un anneau à 4 segments (les
 * couleurs des 4 catégories par défaut) comme logo provisoire — purement
 * vectoriel, sans texte, pour ne dépendre d'aucune police système lors du
 * rendu SVG → PNG. À remplacer par un vrai logo quand il existera : relance
 * ce script après avoir changé `ringSvg` ou les tailles, il régénère tout.
 *
 * Lancer avec : node scripts/gen-icons.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(OUT, { recursive: true });

const COLORS = ["#3F6A86", "#7D6500", "#6A3FC4", "#3D7A1F"]; // cat-fixed, cat-savings, cat-family, cat-pocket (clair)

function ringSvg({ canvas, bg, outerR, innerR, strokeGapDeg = 6 }) {
  const cx = canvas / 2;
  const cy = canvas / 2;
  const segments = 4;
  const gap = (strokeGapDeg * Math.PI) / 180;
  const full = (2 * Math.PI) / segments;
  const start0 = -Math.PI / 2; // commence en haut

  function arcPoint(r, a) {
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  let paths = "";
  for (let i = 0; i < segments; i++) {
    const a0 = start0 + i * full + gap / 2;
    const a1 = start0 + (i + 1) * full - gap / 2;
    const o0 = arcPoint(outerR, a0);
    const o1 = arcPoint(outerR, a1);
    const i1 = arcPoint(innerR, a1);
    const i0 = arcPoint(innerR, a0);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M ${o0.x} ${o0.y} A ${outerR} ${outerR} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
    paths += `<path d="${d}" fill="${COLORS[i]}" />\n`;
  }

  return `<svg width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}" xmlns="http://www.w3.org/2000/svg">
    ${bg !== "none" ? `<rect width="${canvas}" height="${canvas}" fill="${bg}" />` : ""}
    ${paths}
  </svg>`;
}

async function render(name, svg, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, name));
  console.log("écrit:", name);
}

async function main() {
  const canvas = 512;
  // Icônes standard : logo (anneau) à 64 % du carré, fond blanc (règle du handoff).
  const outerStd = canvas * 0.32;
  const innerStd = outerStd * 0.55;
  const svgStd = ringSvg({ canvas, bg: "#FFFFFF", outerR: outerStd, innerR: innerStd });
  await render("icon-512.png", svgStd, 512);
  await render("icon-192.png", svgStd, 192);
  await render("icon-48.png", svgStd, 48);
  await render("apple-touch-icon.png", svgStd, 180);
  await render("favicon-32.png", svgStd, 32);

  // Icône maskable : logo dans le cercle de sécurité à 80 % (48 % du carré).
  const outerMask = canvas * 0.24;
  const innerMask = outerMask * 0.55;
  const svgMask = ringSvg({ canvas, bg: "#FFFFFF", outerR: outerMask, innerR: innerMask });
  await render("icon-maskable-512.png", svgMask, 512);

  // Logo seul (fond transparent), pour la tuile blanche de l'écran de démarrage.
  const svgSplash = ringSvg({ canvas, bg: "none", outerR: outerStd, innerR: innerStd });
  await render("splash-logo.png", svgSplash, 224);

  console.log("Terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
