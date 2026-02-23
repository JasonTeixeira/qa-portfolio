import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Generates cohesive 1600x900 blog cover images from an SVG template.
// Output: public/images/blog/blog-<id>-cover.png
//
// Design goals:
// - Dark theme to match site
// - High readability at small sizes
// - Consistent brand accent (teal/primary)

const W = 1600;
const H = 900;

const outDir = path.join(process.cwd(), "public", "images", "blog");

/**
 * Keep titles short and readable.
 * Subtitles are optional.
 */
const covers = [
  {
    id: 100,
    category: "Cloud Automation",
    title: "GitHub OIDC → AWS",
    subtitle: "No long‑lived keys in CI",
    accent: "#22d3ee",
  },
  {
    id: 1,
    category: "API Testing",
    title: "Production‑Ready",
    subtitle: "API Testing Framework",
    accent: "#34d399",
  },
  {
    id: 2,
    category: "Selenium",
    title: "Page Object Model",
    subtitle: "Beyond the Basics",
    accent: "#60a5fa",
  },
  {
    id: 3,
    category: "CI/CD",
    title: "Docker Compose",
    subtitle: "Connection Refused in CI",
    accent: "#fbbf24",
  },
  {
    id: 4,
    category: "Performance",
    title: "Performance Testing",
    subtitle: "Zero → Production",
    accent: "#fb7185",
  },
  {
    id: 5,
    category: "Mobile",
    title: "Appium Automation",
    subtitle: "Cross‑platform guide",
    accent: "#a78bfa",
  },
];

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function svgTemplate({ category, title, subtitle, accent }) {
  const safeCategory = escapeXml(category);
  const safeTitle = escapeXml(title);
  const safeSubtitle = subtitle ? escapeXml(subtitle) : "";
  const safeAccent = escapeXml(accent);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="0.55" stop-color="#0a0f1a"/>
      <stop offset="1" stop-color="#070b12"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${safeAccent}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${safeAccent}" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <!-- background -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- accent shapes -->
  <circle cx="1320" cy="220" r="220" fill="url(#accent)" filter="url(#soft)"/>
  <circle cx="1240" cy="780" r="260" fill="url(#accent)" filter="url(#soft)" opacity="0.9"/>
  <rect x="110" y="140" width="120" height="620" rx="60" fill="${safeAccent}" opacity="0.14"/>

  <!-- category pill -->
  <g>
    <rect x="180" y="155" width="520" height="64" rx="32" fill="#0f172a" stroke="${safeAccent}" stroke-opacity="0.35"/>
    <text x="220" y="198" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="28" fill="${safeAccent}">
      ${safeCategory}
    </text>
  </g>

  <!-- title -->
  <text x="180" y="360" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="86" font-weight="800" fill="#e5e7eb">
    ${safeTitle}
  </text>

  <!-- subtitle -->
  ${safeSubtitle ? `<text x="180" y="450" font-family="Inter, ui-sans-serif, system-ui" font-size="54" font-weight="700" fill="#93c5fd" opacity="0.92">${safeSubtitle}</text>` : ""}

  <!-- footer -->
  <text x="180" y="760" font-family="Inter, ui-sans-serif, system-ui" font-size="28" fill="#9ca3af">
    jasonteixeira.dev  •  evidence-first engineering
  </text>
</svg>`;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  for (const c of covers) {
    const svg = svgTemplate(c);
    const outPath = path.join(outDir, `blog-${c.id}-cover.png`);

    // Render SVG -> PNG using sharp (libvips)
    await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toFile(outPath);

    process.stdout.write(`generated ${path.relative(process.cwd(), outPath)}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
