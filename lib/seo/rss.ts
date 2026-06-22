import { marked } from 'marked'
import type { BlogPost } from '@/lib/blog-server'

const SITE = 'https://www.sageideas.dev'

/** CDATA-wrap, keeping a literal `]]>` from breaking the section. */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`
}

export interface RssChannel {
  title: string
  description: string
  /** Absolute-from-root self path, e.g. `/feed/ai-engineering.xml`. */
  feedPath: string
  /** Absolute-from-root canonical link, e.g. `/topics/ai-engineering`. */
  link: string
}

/**
 * Build a spec-valid RSS 2.0 feed with `content:encoded` full-text (the field
 * serious readers and aggregators index). Shared by the root feed and every
 * per-cluster feed (BLOG_SEO_ENGINE §5) so output stays consistent.
 */
export function buildRssFeed(channel: RssChannel, posts: BlogPost[]): string {
  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`
      const html = marked.parse(post.fullContent || post.content, { async: false }) as string
      return `
    <item>
      <title>${cdata(post.title)}</title>
      <description>${cdata(post.excerpt)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${cdata(post.category)}</category>
      <author>sage@sageideas.dev (Jason Teixeira)</author>
    </item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${cdata(channel.title)}</title>
    <description>${cdata(channel.description)}</description>
    <link>${SITE}${channel.link}</link>
    <atom:link href="${SITE}${channel.feedPath}" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <managingEditor>sage@sageideas.dev (Jason Teixeira)</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>${items}
  </channel>
</rss>`
}
