// yt-native.mjs — RELIABLE YouTube upload. Composio's YOUTUBE_UPLOAD_VIDEO corrupts bytes;
// instead we drive YouTube's NATIVE resumable upload API through Composio's authenticated
// proxy (proxyExecute) for the init step, then PUT the video bytes ourselves (correct bytes).
// Metadata is set in the init snippet; thumbnail via UPDATE_THUMBNAIL (CloudFront URL).
// Usage: node scripts/yt-native.mjs --only evals,embeddings,chunking
import { Composio } from '@composio/core';
import fs from 'node:fs'; import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
let KEY; for (const l of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) { const m = l.match(/^COMPOSIO_API_KEY=(.*)$/); if (m) KEY = m[1].replace(/^["']|["']$/g, ''); }
const ENT = 'pg-test-eeaa6579-9b29-4087-b4db-ad6ef2bbbf7c', CA = 'ca_jZceMsY-Gf4k';
const c = new Composio({ apiKey: KEY, toolkitVersions: 'latest' });
const exec = (s, a) => c.tools.execute(s, { userId: ENT, dangerouslySkipVersionCheck: true, arguments: a });

const CF = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3DWykmKyHYu8fTqj3UjqZPP0CO5';
const THUMB = {
  rag: `${CF}/33a783b7-35a2-41f7-be7c-58f7525e6a36.png`, evals: `${CF}/7bacbcb4-620f-4f6b-bb50-e3063a682a13.png`,
  embeddings: `${CF}/9144460d-822c-40d3-9db7-fc091f755813.png`, chunking: `${CF}/f2496798-9e82-4f5c-afb4-fded4108139b.png`,
  agents: `${CF}/ff975de7-71ec-4cf5-bb24-de22dc60b5f4.png`, 'prompt-injection': `${CF}/75afa62e-1911-4108-997c-bbc802e28a48.png`,
  'structured-output': `${CF}/4994f33c-452e-4ea3-aaa8-f469fdf31108.png`, 'context-windows': `${CF}/b093d121-582b-401d-8149-36f885f37e16.png`,
};

async function uploadNative(slug, m) {
  const buf = fs.readFileSync(path.resolve(root, m.file));
  // 1) authenticated resumable init through the proxy
  const init = await c.tools.proxyExecute({
    toolkitSlug: 'youtube', connectedAccountId: CA,
    endpoint: 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    method: 'POST',
    parameters: [{ name: 'X-Upload-Content-Type', in: 'header', value: 'video/mp4' }, { name: 'X-Upload-Content-Length', in: 'header', value: String(buf.length) }],
    body: { snippet: { title: m.title, description: m.desc, tags: m.tags, categoryId: '27' }, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } },
  });
  const loc = init.headers?.location || init.headers?.Location;
  if (!loc) throw new Error('no resumable Location: ' + JSON.stringify(init).slice(0, 200));
  // 2) PUT the bytes ourselves (correct, uncorrupted)
  const put = await fetch(loc, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(buf.length) }, body: buf });
  const j = await put.json();
  if (!j.id) throw new Error('no video id: ' + JSON.stringify(j).slice(0, 200));
  return j.id;
}

const meta = JSON.parse(fs.readFileSync(path.join(root, 'scripts/yt-meta.json'), 'utf8'));
const only = (arg('only', 'rag,evals,embeddings,chunking,agents,prompt-injection,structured-output,context-windows')).split(',');
const out = [];
for (const slug of only) {
  const m = meta.find(x => x.slug === slug); if (!m) { console.log('unknown', slug); continue; }
  console.log(`\n▶ ${slug}: ${m.title}`);
  try {
    const id = await uploadNative(slug, m);
    console.log(`  ✓ uploaded id=${id}  https://youtu.be/${id}`);
    try { const t = await exec('YOUTUBE_UPDATE_THUMBNAIL', { videoId: id, thumbnailUrl: THUMB[slug] }); console.log('  thumbnail:', t.successful); } catch (e) { console.log('  thumb (set later):', e.message.slice(0, 60)); }
    out.push({ slug, id, url: `https://youtu.be/${id}` });
  } catch (e) { console.log('  ✗ FAILED:', e.message.slice(0, 160)); out.push({ slug, error: e.message.slice(0, 120) }); }
}
fs.writeFileSync(path.join(root, 'renders/published.json'), JSON.stringify(out, null, 2));
console.log('\n=== DONE ===');
for (const o of out) console.log(`  ${o.slug.padEnd(11)} ${o.url || 'FAILED: ' + o.error}`);
