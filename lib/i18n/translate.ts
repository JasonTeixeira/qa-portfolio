/**
 * Machine-translation pipeline (BLOG_SEO_ENGINE §8). OpenAI-compatible DeepSeek
 * endpoint. Used by both the UI-message translator and the blog-content translator
 * so every locale is produced the same way. Keys/placeholders/brand names are
 * preserved; only human-readable values are translated.
 */
const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

export interface LangTarget {
  code: string
  name: string
}

function apiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured')
  return key
}

async function chat(system: string, user: string, json: boolean): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/** Translate the VALUES of a flat string→string dictionary into the target language. */
export async function translateDictionary(
  dict: Record<string, string>,
  target: LangTarget,
): Promise<Record<string, string>> {
  const system =
    `You are a professional UI localizer translating a product's interface into ${target.name}. ` +
    `You are given a JSON object whose keys are English source strings and whose values must be the ${target.name} translation. ` +
    `Rules: (1) return a JSON object with the SAME keys; (2) translate each value into natural, concise ${target.name} fit for UI; ` +
    `(3) keep placeholders like {year} and {count} and any HTML exactly as-is; (4) keep brand/proper names untranslated: "Sage Ideas", "Jason Teixeira", "Stripe", "AWS", "Next.js", "AI"; ` +
    `(5) preserve leading symbols like "./" or "©"; (6) return ONLY the JSON object, no commentary.`
  const out = await chat(system, JSON.stringify(dict), true)
  return JSON.parse(out) as Record<string, string>
}

/** Translate a long markdown document, preserving structure/code/frontmatter intent. */
export async function translateMarkdown(markdown: string, target: LangTarget): Promise<string> {
  const system =
    `You are a professional technical translator localizing a software engineering blog post into ${target.name}. ` +
    `Translate the prose into natural, accurate ${target.name}. Rules: ` +
    `(1) DO NOT translate fenced code blocks, inline code, URLs, file paths, CLI commands, or identifiers; ` +
    `(2) keep all markdown structure (headings, lists, links, tables) and any [[wiki-links]] exactly; ` +
    `(3) keep brand/proper names and technical terms (RAG, Stripe, AWS, Next.js, Supabase, etc.) untranslated; ` +
    `(4) translate link text but never link targets; (5) return ONLY the translated markdown, no commentary.`
  return chat(system, markdown, false)
}
