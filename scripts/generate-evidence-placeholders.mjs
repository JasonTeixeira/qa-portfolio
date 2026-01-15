import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Minimal SVG that renders cleanly at 1200x675. We intentionally avoid any "placeholder" language.
function svg({ title, subtitle }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="675" rx="28" fill="url(#bg)"/>
  <rect x="48" y="48" width="1104" height="579" rx="22" fill="#111" stroke="#06b6d4" stroke-width="3" opacity="0.95"/>

  <text x="92" y="140" fill="#e5e7eb" font-family="ui-sans-serif, system-ui, -apple-system" font-size="44" font-weight="700">${title}</text>
  <text x="92" y="200" fill="#9ca3af" font-family="ui-sans-serif, system-ui, -apple-system" font-size="22">${subtitle}</text>

  <text x="92" y="585" fill="#6b7280" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco" font-size="16">qa-portfolio · Evidence Gallery</text>
</svg>`;
}

async function main() {
  const outDir = join(process.cwd(), 'public', 'artifacts', 'evidence');
  await mkdir(outDir, { recursive: true });

  const files = [
    {
      name: 'playwright-report.png',
      title: 'Playwright UI Report (Sample)',
      subtitle: 'Replace with a real screenshot from your CI run when available.',
    },
    {
      name: 'allure-report.png',
      title: 'Allure Report (Sample)',
      subtitle: 'Replace with a real screenshot from your Allure HTML report.',
    },
    {
      name: 'lighthouse-ci.png',
      title: 'Lighthouse CI Results (Sample)',
      subtitle: 'Replace with a real Lighthouse CI output screenshot.',
    },
    {
      name: 'security-scan.png',
      title: 'Security Scan Output (Sample)',
      subtitle: 'Replace with a real scan output screenshot (ZAP/SAST/secrets).',
    },
  ];

  for (const f of files) {
    const svgPath = join(outDir, f.name.replace(/\.png$/, '.svg'));
    await writeFile(svgPath, svg({ title: f.title, subtitle: f.subtitle }), 'utf8');
  }

  // Note: We intentionally write SVG (not PNG) to avoid native dependencies.
  // Next/Image can render SVGs as regular assets.
  console.log(`Wrote ${files.length} evidence SVGs to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
