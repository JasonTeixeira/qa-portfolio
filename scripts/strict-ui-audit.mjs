import { readFileSync } from 'node:fs';
import { globby } from 'globby';

const PLACEHOLDER_RE = /\bplaceholder\s*=/;

// Extremely small “dead-end” heuristics.
// We only flag blatant cases to avoid false positives.
const DEAD_LINK_RE = /<a[^>]+href=(""|"#"|'#'|'')/;

async function main() {
  const files = await globby([
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
  ], { gitignore: true });

  const failures = [];

  for (const f of files) {
    const src = readFileSync(f, 'utf8');

    if (PLACEHOLDER_RE.test(src)) {
      failures.push({ kind: 'placeholder-attr', file: f });
    }

    if (DEAD_LINK_RE.test(src)) {
      failures.push({ kind: 'dead-link', file: f });
    }
  }

  if (failures.length) {
    console.error('\nSTRICT UI AUDIT FAILED');
    for (const x of failures) {
      console.error(`- [${x.kind}] ${x.file}`);
    }
    console.error('\nFix the issues above (no placeholder attributes, no empty/# href).');
    process.exit(1);
  }

  console.log(`OK: strict UI audit passed (${files.length} files checked)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
