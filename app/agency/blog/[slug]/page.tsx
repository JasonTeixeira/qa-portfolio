import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import {
  PUBLISHED_POSTS,
  getPublishedPost,
  parseInline,
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
      return <h2 className="ag-post-h2">{block.text}</h2>
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
      <main>
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
          </div>
        </article>
      </main>
      <AgencyFooter />
    </>
  )
}
