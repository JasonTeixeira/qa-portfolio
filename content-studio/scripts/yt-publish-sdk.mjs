// yt-publish-sdk.mjs — publish AI Engineering videos PUBLIC via the Composio SDK.
// RAG already uploaded (private test) -> update to public+real metadata. Others -> upload public.
// Sets thumbnails (hosted URL). Run: node scripts/yt-publish-sdk.mjs
import { Composio } from '@composio/core';
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let KEY; for (const l of fs.readFileSync(path.join(root, '..', '.env.local'), 'utf8').split('\n')) { const m = l.match(/^COMPOSIO_API_KEY=(.*)$/); if (m) KEY = m[1].replace(/^["']|["']$/g, ''); }
const ENT = 'pg-test-eeaa6579-9b29-4087-b4db-ad6ef2bbbf7c';
const composio = new Composio({ apiKey: KEY, toolkitVersions: 'latest' });
const exec = (slug, args) => composio.tools.execute(slug, { userId: ENT, dangerouslySkipVersionCheck: true, arguments: args });
const stageVideo = f => composio.files.upload({ file: path.resolve(root, f), toolSlug: 'YOUTUBE_UPLOAD_VIDEO', toolkitSlug: 'youtube' });
const host = f => execSync(`curl -s -F "reqtype=fileupload" -F "fileToUpload=@${path.resolve(root, f)}" https://catbox.moe/user/api.php`).toString().trim();

const meta = JSON.parse(fs.readFileSync(path.join(root, 'scripts/yt-meta.json'), 'utf8'));
const RAG_ID = '9RZLs2jqlV0'; // already-uploaded RAG (private test) -> update in place

const out = [];
for (const v of meta) {
  console.log(`\n▶ ${v.slug}: ${v.title}`);
  let vid;
  if (v.slug === 'rag') {
    const r = await exec('YOUTUBE_UPDATE_VIDEO', { videoId: RAG_ID, title: v.title, description: v.desc, tags: v.tags, categoryId: '27', privacyStatus: 'public' });
    vid = r.successful ? RAG_ID : null;
    console.log('  update:', r.successful, r.error || '');
  } else {
    const f = await stageVideo(v.file);
    const r = await exec('YOUTUBE_UPLOAD_VIDEO', { videoFilePath: f, title: v.title, description: v.desc, tags: v.tags, categoryId: '27', privacyStatus: 'public' });
    vid = r?.data?.response_data?.id || r?.data?.id;
    console.log('  upload:', r.successful, 'id:', vid, r.error || '');
  }
  if (vid) {
    const turl = host(v.thumb);
    const tr = await exec('YOUTUBE_UPDATE_THUMBNAIL', { videoId: vid, thumbnailUrl: turl });
    console.log('  thumb:', tr.successful, tr.error || '');
    out.push({ slug: v.slug, id: vid, url: `https://youtu.be/${vid}` });
  } else out.push({ slug: v.slug, error: true });
}
console.log('\n=== PUBLISHED ===');
for (const o of out) console.log(`  ${o.slug.padEnd(11)} ${o.url || 'FAILED'}`);
fs.writeFileSync(path.join(root, 'renders/published.json'), JSON.stringify(out, null, 2));
