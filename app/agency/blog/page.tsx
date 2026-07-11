import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import Link from 'next/link'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import {
  BrowserGridMotif,
  DocTreeMotif,
  EvalLoopMotif,
  GateFunnelMotif,
  WorkflowDagMotif,
} from '@/components/agency/micro-diagrams'
import { DRAFT_POSTS, PUBLISHED_POSTS, type Post, type PostCategory } from '@/data/agency/posts'
import './blog.css'

const BLOG_URL = 'https://agency.sageideas.dev/blog'

export const metadata: Metadata = {
  title: 'The Proof Log — Jason Teixeira',
  description:
    'Field notes from systems that prove they work — eval harnesses, browser QA, release gates, and operational AI workflows.',
  alternates: { canonical: BLOG_URL },
}

/** Category → micro-diagram thumbnail (same motifs as the homepage proof grid). */
function CategoryMotif({ category }: { category: PostCategory }): ReactElement {
  switch (category) {
    case 'AI QUALITY':
      return <EvalLoopMotif />
    case 'BROWSER QA':
      return <BrowserGridMotif />
    case 'RELEASE SAFETY':
      return <GateFunnelMotif />
    case 'OPERATIONS':
      return <WorkflowDagMotif />
    case 'DOCUMENTATION':
      return <DocTreeMotif />
  }
}

function PublishedCard({ post }: { post: Post }) {
  return (
    <li>
      <Link href={`/blog/${post.slug}`} className="ag-blog-card">
        <div className="ag-blog-card-thumb" aria-hidden="true">
          <CategoryMotif category={post.category} />
        </div>
        <div>
          <p className="ag-blog-card-meta">
            <span className="ag-blog-card-cat" style={{ color: post.accent }}>
              {post.category}
            </span>{' '}
            · {post.date} · {post.readMin} MIN READ
          </p>
          <h2 className="ag-blog-card-title">{post.title}</h2>
          <p className="ag-blog-card-dek">{post.dek}</p>
          <div className="ag-blog-card-chips">
            {post.proves.map((item) => (
              <span key={item} className="ag-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </li>
  )
}

function DraftRow({ post }: { post: Post }) {
  return (
    <li className="ag-blog-draft-row">
      <span className="ag-badge ag-badge--draft">DRAFT</span>
      <h3 className="ag-blog-draft-title">{post.title}</h3>
      <p className="ag-blog-draft-dek">{post.dek}</p>
    </li>
  )
}

export default function BlogIndexPage() {
  return (
    <>
      <AgencyNav />
      <main>
        <section className="ag-section ag-blog-head" aria-labelledby="blog-heading">
          <p className="ag-kicker">THE PROOF LOG</p>
          <h1 id="blog-heading" className="ag-blog-h1">
            Field notes from systems that prove they work.
          </h1>
          <p className="ag-blog-sub">
            How I test AI systems, harden browser automation, and gate releases — written from
            builds that shipped, not from theory.
          </p>
        </section>

        <section className="ag-section" aria-label="Published posts">
          <ul className="ag-blog-list">
            {PUBLISHED_POSTS.map((post) => (
              <PublishedCard key={post.slug} post={post} />
            ))}
          </ul>

          <p className="ag-blog-divider">IN THE PIPELINE</p>
          <ul className="ag-blog-draft-list">
            {DRAFT_POSTS.map((post) => (
              <DraftRow key={post.slug} post={post} />
            ))}
          </ul>
        </section>
      </main>
      <AgencyFooter />
    </>
  )
}
