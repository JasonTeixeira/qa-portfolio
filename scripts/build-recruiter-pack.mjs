import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const outDir = path.join(process.cwd(), 'public', 'artifacts');
const zipPath = path.join(outDir, 'recruiter-pack.zip');

const files = [
  { src: 'public/artifacts/playbooks/qa-1-page-playbook.md', name: 'QA-Playbook-1-page.md' },
  { src: 'public/artifacts/examples/sample-bug-report.md', name: 'Example-High-Signal-Bug-Report.md' },
  { src: 'public/artifacts/filled/test-strategy-filled.md', name: 'Filled-Test-Strategy.md' },
  { src: 'public/artifacts/filled/test-plan-filled.md', name: 'Filled-Test-Plan.md' },
  { src: 'public/artifacts/filled/release-signoff-filled.md', name: 'Filled-Release-Signoff.md' },
];

for (const f of files) {
  if (!fs.existsSync(path.join(process.cwd(), f.src))) {
    console.error('Missing file:', f.src);
    process.exit(1);
  }
}

await fs.promises.mkdir(outDir, { recursive: true });

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

archive.pipe(output);
for (const f of files) {
  archive.file(path.join(process.cwd(), f.src), { name: f.name });
}

await archive.finalize();

console.log('Created', zipPath);
