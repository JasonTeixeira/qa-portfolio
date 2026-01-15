/*
  Content validation for the portfolio.

  Goal: prevent “dead projects”, “dead downloads”, and broken proof paths.

  Checks:
  - Every QA artifact downloadPath exists under /public
  - recruiter-pack.zip exists
  - Every project proof.* path that is a local /artifacts/... file exists
  - Every project `github` link is https://github.com/... (basic sanity)
*/

import fs from 'node:fs/promises';
import path from 'node:path';
// NOTE: Keep this script dependency-free (Node-only).

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function isLocalPublicPath(p) {
  return typeof p === 'string' && p.startsWith('/');
}

function toPublicFsPath(urlPath) {
  // urlPath like “/artifacts/foo/bar.md” -> <root>/public/artifacts/foo/bar.md
  return path.join(PUBLIC_DIR, urlPath.replace(/^\//, ''));
}

function isGithubUrl(u) {
  return typeof u === 'string' && u.startsWith('https://github.com/');
}

async function loadTsModule(relPath) {
  // Node can't import .ts by default without a loader.
  // We parse the TS source directly instead.
  const abs = path.join(ROOT, relPath);
  const src = await fs.readFile(abs, 'utf8');
  return { src };
}

function parseExportedArray(src, exportName) {
  // Very pragmatic parser: expects `export const <name> ... = [` in the file.
  // This is safe here because these are static data files in this repo.
  const re = new RegExp(
    `export\\s+const\\s+${exportName}(?:\\s*:[^=]+)?\\s*=\\s*\\[`,
    'm'
  );
  const m = src.match(re);
  if (!m) throw new Error(`Failed to find export const ${exportName} = [`);

  const start = src.indexOf('[', m.index);
  let i = start;
  let depth = 0;
  let inStr = false;
  let strCh = '';
  let escape = false;

  for (; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === strCh) {
        inStr = false;
        strCh = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = true;
      strCh = ch;
      continue;
    }

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        const arrText = src.slice(start, i + 1);
        // Convert TS-ish array literal to JS using Function.
        // This is safe enough here because we only run this against trusted repo files.
        const fn = new Function(`"use strict"; return (${arrText});`);
        return fn();
      }
    }
  }

  throw new Error(`Failed to parse ${exportName} array (unterminated).`);
}

function parseExportedObject(src, exportName) {
  // For `export const blogPosts: BlogPost[] = [` we only need IDs,
  // and for projects we only need fields used in validation.
  // We'll reuse parseExportedArray.
  return parseExportedArray(src, exportName);
}

async function main() {
  const failures = [];

  // 1) recruiter pack
  const recruiterPack = path.join(PUBLIC_DIR, 'artifacts', 'recruiter-pack.zip');
  if (!(await exists(recruiterPack))) {
    failures.push({ kind: 'download', item: '/artifacts/recruiter-pack.zip', reason: 'Missing file' });
  }

  // 2) artifacts catalog
  const { src: artifactsSrc } = await loadTsModule('lib/artifactsData.ts');
  const qaArtifacts = parseExportedObject(artifactsSrc, 'qaArtifacts');
  for (const a of qaArtifacts ?? []) {
    if (!isLocalPublicPath(a.downloadPath)) continue;
    const fp = toPublicFsPath(a.downloadPath);
    if (!(await exists(fp))) {
      failures.push({ kind: 'artifact', item: a.id, path: a.downloadPath, reason: 'Missing file' });
    }
  }

  // 3) projects proof + github link sanity
  const { src: projectsSrc } = await loadTsModule('lib/projectsData.ts');
  const projects = parseExportedObject(projectsSrc, 'projects');
  for (const p of projects ?? []) {
    if (p.github && !isGithubUrl(p.github)) {
      failures.push({ kind: 'project', item: p.slug, field: 'github', value: p.github, reason: 'Not a GitHub HTTPS URL' });
    }

    const proof = p.proof ?? {};
    for (const k of ['reportUrl', 'demoVideoUrl'] ) {
      const v = proof[k];
      if (!v || typeof v !== 'string') continue;
      // Only validate local file paths (we don't want flaky network checks here)
      if (v.startsWith('/artifacts/')) {
        const fp = toPublicFsPath(v);
        if (!(await exists(fp))) {
          failures.push({ kind: 'proof', item: p.slug, field: k, path: v, reason: 'Missing local proof file' });
        }
      }
    }
  }

  if (failures.length) {
    console.error('\nContent validation failures:');
    for (const f of failures) {
      console.error('-', JSON.stringify(f));
    }
    process.exitCode = 1;
    return;
  }

  console.log('OK: content validated (artifacts, downloads, proof paths).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
