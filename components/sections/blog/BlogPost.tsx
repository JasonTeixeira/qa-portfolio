"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowLeft, Copy, Check, Menu } from "lucide-react";
import Link from "next/link";
import { BlogPost as BlogPostType } from "@/lib/blogData";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/tokyo-night-dark.css";
import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface BlogPostProps {
  post: BlogPostType;
}

interface ToCItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogPost({ post }: BlogPostProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<ToCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showToC, setShowToC] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  // Generate table of contents from markdown
  useEffect(() => {
    const headings = post.fullContent.match(/^#{1,3}\s+(.+)$/gm) || [];
    const toc = headings.map((heading) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s+/, "");
      // Use same ID generation as headings to ensure they match
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) || `heading-${Date.now()}`;
      return { id, text, level };
    });
    setTableOfContents(toc);
  }, [post.fullContent]);

  // Track read progress
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const windowHeight = window.innerHeight;
      const documentHeight = articleRef.current.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = Math.min((scrollTop / trackLength) * 100, 100);
      setReadProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CodeBlockWithCopy = ({ children }: { children: React.ReactNode }) => {
    const codeId = Math.random().toString(36).substring(7);
    const codeText = String(children).replace(/\n$/, "");
    
    return (
      <>
        <button
          onClick={() => copyToClipboard(codeText, codeId)}
          className="absolute right-3 top-3 p-2 rounded-lg bg-dark-lighter/80 hover:bg-dark-lighter transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label="Copy code"
        >
          {copied === codeId ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} className="text-gray-400" />
          )}
        </button>
        {children}
      </>
    );
  };

  // Generate stable ID from heading text (same on server and client)
  const createHeadingId = (children: React.ReactNode): string => {
    const text = String(children)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return text || `heading-${Date.now()}`;
  };

  const SectionObserver = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { ref, inView } = useInView({
      threshold: 0.5,
      rootMargin: "-100px 0px -80% 0px",
    });

    useEffect(() => {
      if (inView) {
        setActiveSection(id);
      }
    }, [inView, id]);

    return <div ref={ref} id={id}>{children}</div>;
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-dark-lighter z-50">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Back Button */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-8 px-4 sm:px-6 lg:px-8 pb-20">
        {/* Table of Contents - Desktop */}
        {tableOfContents.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Menu size={16} />
                <span>Table of Contents</span>
              </div>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm transition-colors ${
                      activeSection === item.id
                        ? "text-primary font-medium"
                        : "text-gray-400 hover:text-gray-300"
                    } ${item.level === 2 ? "pl-4" : item.level === 3 ? "pl-8" : ""}`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Mobile ToC Toggle */}
        {tableOfContents.length > 0 && (
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowToC(!showToC)}
              className="p-4 bg-primary text-dark rounded-full shadow-lg hover:bg-primary-dark transition-colors"
              aria-label="Toggle table of contents"
            >
              <Menu size={20} />
            </button>
            {showToC && (
              <div className="absolute bottom-16 right-0 w-64 bg-dark-card border border-dark-lighter rounded-lg p-4 shadow-xl max-h-96 overflow-y-auto">
                <div className="text-sm font-semibold text-foreground mb-3">Contents</div>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setShowToC(false)}
                      className={`block text-sm transition-colors ${
                        activeSection === item.id
                          ? "text-primary font-medium"
                          : "text-gray-400 hover:text-gray-300"
                      } ${item.level === 2 ? "pl-3" : item.level === 3 ? "pl-6" : ""}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Article Content */}
        <article ref={articleRef} className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-primary" size={16} />
                <span className="text-primary text-sm font-semibold">{post.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-dark-lighter">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-xl text-gray-300 leading-relaxed mb-12 max-w-[70ch]">
                {post.excerpt}
              </p>

              {/* Article Content */}
              <div className="markdown-content prose-enhanced">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children }) => {
                      const id = createHeadingId(children);
                      return (
                        <SectionObserver id={id}>
                          <h1 className="text-3xl font-bold text-foreground mt-16 mb-8 leading-tight max-w-[65ch] scroll-mt-24">
                            {children}
                          </h1>
                        </SectionObserver>
                      );
                    },
                    h2: ({ children }) => {
                      const id = createHeadingId(children);
                      return (
                        <SectionObserver id={id}>
                          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6 leading-tight max-w-[65ch] scroll-mt-24">
                            {children}
                          </h2>
                        </SectionObserver>
                      );
                    },
                    h3: ({ children }) => {
                      const id = createHeadingId(children);
                      return (
                        <SectionObserver id={id}>
                          <h3 className="text-xl font-bold text-foreground mt-10 mb-5 leading-tight max-w-[65ch] scroll-mt-24">
                            {children}
                          </h3>
                        </SectionObserver>
                      );
                    },
                    p: ({ children }) => (
                      <p className="text-gray-300 leading-[1.8] mb-7 text-lg max-w-[70ch]">
                        {children}
                      </p>
                    ),
                    a: ({ children, ...props }) => (
                      <a className="text-primary hover:text-primary-dark underline underline-offset-4 transition-colors" {...props}>
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-primary font-semibold">
                        {children}
                      </strong>
                    ),
                    code: ({ inline, className, children }: {
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                    }) => 
                      inline ? (
                        <code className="text-primary bg-primary/10 px-2 py-1 rounded font-mono text-[0.9em] font-medium">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      ),
                    pre: ({ children }) => (
                      <pre className="relative group bg-[#1a1b26] border border-dark-lighter rounded-xl p-6 overflow-x-auto my-8 shadow-xl max-w-full">
                        <CodeBlockWithCopy>{children}</CodeBlockWithCopy>
                      </pre>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-gray-300 my-8 ml-6 space-y-3 list-disc marker:text-primary max-w-[68ch]">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-gray-300 my-8 ml-6 space-y-3 list-decimal marker:text-primary max-w-[68ch]">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300 leading-[1.75] pl-2">
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary bg-primary/5 pl-6 pr-4 py-4 italic text-gray-300 my-8 rounded-r-lg max-w-[68ch]">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="border-dark-lighter my-12 max-w-[70ch]" />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-8 max-w-full">
                        <table className="min-w-full border border-dark-lighter rounded-lg">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-dark-lighter bg-dark-card px-4 py-3 text-left text-primary font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-dark-lighter px-4 py-3 text-gray-300">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {post.fullContent}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              <div className="mt-16 pt-8 border-t border-dark-lighter">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tagged with:</h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-primary/10 text-foreground text-sm rounded-full font-mono hover:bg-primary/20 transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share / Contact CTA */}
              <div className="mt-12 p-8 bg-gradient-to-br from-dark-card to-dark-card/50 border border-primary/20 rounded-xl text-center shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Found this helpful?
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed max-w-[60ch] mx-auto">
                  I&apos;m available for consulting and full-time QA automation roles. Let&apos;s build quality together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-all hover:shadow-lg hover:scale-105"
                  >
                    Get in Touch
                  </Link>
                  <Link
                    href="/projects"
                    className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-dark transition-all hover:shadow-lg hover:scale-105"
                  >
                    View My Work
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </article>
      </div>
    </div>
  );
}
