const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = process.cwd();
const input = path.join(root, 'public/path/05-samurai.png');
const outDir = path.join(root, 'public/path/samurai-layers');

const layers = [
  {
    name: 'torso-core',
    points: [[455, 605], [640, 500], [760, 535], [860, 630], [910, 830], [900, 1110], [985, 1185], [930, 1715], [530, 1715], [565, 1460], [465, 1110], [420, 935]],
  },
  {
    name: 'cloak-front',
    points: [[520, 600], [840, 640], [760, 880], [650, 1120], [520, 1370], [600, 1450], [560, 1580], [430, 1545], [292, 1460], [108, 1705], [80, 1540], [130, 1390], [278, 1275], [382, 1172], [420, 1000], [520, 755]],
  },
  {
    name: 'scarf',
    points: [[148, 600], [330, 590], [485, 505], [620, 500], [606, 555], [472, 605], [367, 680], [257, 742], [175, 705]],
  },
  {
    name: 'hat-head',
    points: [[480, 340], [770, 225], [1035, 480], [982, 535], [820, 540], [770, 588], [748, 664], [652, 650], [640, 552], [510, 555], [445, 512]],
  },
  {
    name: 'sword-arm',
    points: [[792, 680], [910, 700], [964, 900], [1045, 1090], [1020, 1220], [1070, 1305], [1362, 1685], [1300, 1720], [988, 1362], [940, 1320], [890, 1145], [845, 912]],
  },
  {
    name: 'legs',
    points: [[545, 1505], [676, 1518], [660, 1960], [538, 1960], [515, 1720], [485, 1690], [505, 1600], [820, 1535], [918, 1580], [905, 1965], [762, 1965], [742, 1725], [690, 1662]],
  },
  {
    name: 'sword-back',
    points: [[130, 1250], [610, 1088], [630, 1138], [152, 1310]],
  },
];

function svgMask(width, height, points) {
  const d = points.map(([x, y]) => `${x},${y}`).join(' ');
  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><polygon points="${d}" fill="white"/></svg>`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const source = sharp(input).removeAlpha();
  const { width, height } = await source.metadata();
  if (!width || !height) throw new Error('Could not read samurai asset dimensions');
  const rgb = await source.raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0, p = 0; i < rgb.length; i += 3, p += 4) {
    const r = rgb[i];
    const g = rgb[i + 1];
    const b = rgb[i + 2];
    const distanceFromWhite = Math.max(255 - r, 255 - g, 255 - b);
    const alpha = Math.max(0, Math.min(255, Math.round((distanceFromWhite - 9) * 4.8)));
    const a = alpha / 255;

    rgba[p + 3] = alpha;
    if (alpha === 0) {
      rgba[p] = 0;
      rgba[p + 1] = 0;
      rgba[p + 2] = 0;
    } else {
      rgba[p] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - a)) / a)));
      rgba[p + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - a)) / a)));
      rgba[p + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - a)) / a)));
    }
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'samurai-clean.png'));

  for (const layer of layers) {
    const mask = await sharp(svgMask(width, height, layer.points))
      .resize(width, height)
      .blur(1.2)
      .greyscale()
      .raw()
      .toBuffer();

    const output = Buffer.from(rgba);
    for (let i = 0, p = 0; i < output.length; i += 4, p += 1) {
      output[i + 3] = Math.round((output[i + 3] * mask[p]) / 255);
    }

    await sharp(output, { raw: { width, height, channels: 4 } })
      .png()
      .toFile(path.join(outDir, `${layer.name}.png`));
  }

  await fs.promises.writeFile(
    path.join(outDir, 'README.md'),
    [
      '# Samurai Rig Layers',
      '',
      'Generated from `public/path/05-samurai.png`.',
      'These are overlapping transparent extractions from the original accepted artwork, not generated AI backplates.',
      '',
      ...layers.map((layer) => `- ${layer.name}.png`),
      '',
    ].join('\n'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
