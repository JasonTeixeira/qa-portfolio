import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import { CopyButton } from '@/components/agency/islands/copy-button'
import {
  PUBLISHED_POSTS,
  getPublishedPost,
  parseInline,
  type Post,
  type PostBlock,
} from '@/data/agency/posts'
import '../blog.css'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return PUBLISHED_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPublishedPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — The Proof Log`,
    description: post.dek,
    alternates: { canonical: `https://agency.sageideas.dev/blog/${post.slug}` },
  }
}

const MONTHS: Record<string, string> = {
  JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
}

/** Convert the display date format ('01 JUL 2026') to ISO ('2026-07-01'). */
function toIsoDate(display: string): string | undefined {
  const parts = display.trim().split(/\s+/)
  if (parts.length !== 3) return undefined
  const month = MONTHS[parts[1].toUpperCase()]
  if (!month) return undefined
  return `${parts[2]}-${month}-${parts[0].padStart(2, '0')}`
}

/** Anchor-slug an h2 heading: 'Stop testing strings. Test properties.' → 'stop-testing-strings-test-properties'. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Minimum h2 count before a table of contents earns its place. */
const TOC_MIN_HEADINGS = 4

/** Renders bold, em, and code inline markers as real elements — no HTML injection. */
function Inline({ text }: { text: string }): ReactElement {
  return (
    <>
      {parseInline(text).map((segment, index) => {
        switch (segment.type) {
          case 'bold':
            return <strong key={index}>{segment.text}</strong>
          case 'em':
            return <em key={index}>{segment.text}</em>
          case 'code':
            return <code key={index}>{segment.text}</code>
          default:
            return <span key={index}>{segment.text}</span>
        }
      })}
    </>
  )
}

function Block({ block }: { block: PostBlock }): ReactElement {
  switch (block.kind) {
    case 'para': {
      const variantClass = block.variant ? ` ag-post-para--${block.variant}` : ''
      return (
        <p className={`ag-post-para${variantClass}`}>
          <Inline text={block.text} />
        </p>
      )
    }
    case 'h2':
      return (
        <h2 id={slugifyHeading(block.text)} className="ag-post-h2">
          {block.text}
        </h2>
      )
    case 'list':
      return (
        <ul className="ag-post-list">
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      )
    case 'code':
      return (
        <div className="ag-post-codewrap">
          <CopyButton text={block.lines.join('\n')} />
          <pre className="ag-post-code">
            <code>
              {block.lines.map((line, index) => (
                <span
                  key={index}
                  className={line.trimStart().startsWith('//') ? 'ag-post-code-comment' : undefined}
                >
                  {line}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        </div>
      )
    case 'callout':
      return (
        <aside className="ag-post-callout">
          <p className="ag-post-callout-label">{block.label}</p>
          <p className="ag-post-callout-text">
            <Inline text={block.text} />
          </p>
        </aside>
      )
    case 'checklist':
      return (
        <div className="ag-post-checklist">
          <p className="ag-post-checklist-label">{block.label}</p>
          <ul>
            {block.items.map((item) => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
      )
  }
}

/** Mono "ON THIS PAGE" anchor list — rendered only when the post has enough h2s to need one. */
function TableOfContents({ post }: { post: Post }): ReactElement | null {
  const headings = post.blocks.filter((block) => block.kind === 'h2')
  if (headings.length < TOC_MIN_HEADINGS) return null
  return (
    <nav className="ag-post-toc" aria-label="On this page">
      <p className="ag-post-toc-label">ON THIS PAGE</p>
      <ol className="ag-post-toc-list">
        {headings.map((heading) => (
          <li key={heading.text}>
            <a href={`#${slugifyHeading(heading.text)}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** ← previous / next → among PUBLISHED_POSTS by array order. */
function PostPager({ post }: { post: Post }): ReactElement | null {
  const index = PUBLISHED_POSTS.findIndex((p) => p.slug === post.slug)
  if (index === -1) return null
  const previous = index > 0 ? PUBLISHED_POSTS[index - 1] : undefined
  const next = index < PUBLISHED_POSTS.length - 1 ? PUBLISHED_POSTS[index + 1] : undefined
  if (!previous && !next) return null

  return (
    <nav className="ag-post-pager" aria-label="More posts">
      <p className="ag-post-pager-kicker">MORE FROM THE PROOF LOG</p>
      <div className="ag-post-pager-row">
        <div className="ag-post-pager-cell">
          {previous ? (
            <>
              <p className="ag-post-pager-dir">← PREVIOUS</p>
              <Link href={`/blog/${previous.slug}`} className="ag-post-pager-link">
                {previous.title}
              </Link>
            </>
          ) : null}
        </div>
        <div className="ag-post-pager-cell ag-post-pager-cell--next">
          {next ? (
            <>
              <p className="ag-post-pager-dir">NEXT →</p>
              <Link href={`/blog/${next.slug}`} className="ag-post-pager-link">
                {next.title}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPublishedPost(slug)
  if (!post) notFound()

  const canonicalUrl = `https://agency.sageideas.dev/blog/${post.slug}`
  // Static, non-user post data only — safe for the JSON.stringify script pattern.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: toIsoDate(post.date),
    description: post.dek,
    author: {
      '@type': 'Person',
      name: 'Jason Teixeira',
      url: 'https://agency.sageideas.dev',
    },
    mainEntityOfPage: canonicalUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <AgencyNav />
      <main id="main-content" tabIndex={-1}>
        <article>
          <header className="ag-section ag-post-header">
            <div className="ag-post-topline">
              <span className="ag-badge" style={{ color: post.accent }}>
                {post.category}
              </span>
              <p className="ag-post-meta">
                {post.date} · {post.readMin} MIN READ
              </p>
            </div>
            <h1 className="ag-post-h1">{post.title}</h1>
            <p className="ag-post-dek">{post.dek}</p>
          </header>

          <div className="ag-section" style={{ paddingTop: 0 }}>
            <TableOfContents post={post} />
            <div className="ag-post-body">
              {post.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>

            <footer className="ag-post-foot">
              <p className="ag-post-proves">
                WHAT THIS PROVES: <strong>{post.proves.join(' · ')}</strong>
              </p>
              {post.caseStudyAnchor ? (
                <Link href={post.caseStudyAnchor} className="ag-post-case-link">
                  SEE THE MATCHING CASE STUDY →
                </Link>
              ) : null}
              <div className="ag-post-cta-row">
                <Link href="/#contact" className="ag-btn ag-btn--solid">
                  HIRE ME TO BUILD THIS →
                </Link>
                <Link href="/blog" className="ag-btn">
                  ← ALL POSTS
                </Link>
              </div>
            </footer>

            <PostPager post={post} />
          </div>
        </article>
      </main>
      <AgencyFooter />
    </>
  )
}
