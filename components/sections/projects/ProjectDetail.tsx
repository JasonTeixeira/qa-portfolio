"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowLeft, Copy, Check, Menu, Github, ExternalLink, Users, Target } from "lucide-react";
import Link from "next/link";
import { Project, getRelatedProjects } from "@/lib/projectsData";
import { blogPosts } from "@/lib/blogData";
import ProofBlock from "@/components/ui/projects/ProofBlock";
import ProjectQualityGates from "@/components/sections/projects/ProjectQualityGates";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/tokyo-night-dark.css";
import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface ProjectDetailProps {
  project: Project;
}

interface ToCItem {
  id: string;
  text: string;
  level: number;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<ToCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showToC, setShowToC] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  // Get related content
  const relatedProjects = getRelatedProjects(project.id, 3);
  const relatedBlogs = project.relatedBlogs
    ? blogPosts.filter(blog => project.relatedBlogs?.includes(blog.id))
    : [];

  // Generate table of contents from markdown
  useEffect(() => {
    const headings = project.fullContent.match(/^#{1,3}\s+(.+)$/gm) || [];
    const toc = headings.map((heading) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s+/, "");
      
      // Use same hash-based ID generation as headings
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const id = `${baseId || 'heading'}-${Math.abs(hash)}`;
      
      return { id, text, level };
    });
    setTableOfContents(toc);
  }, [project.fullContent]);

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

  const createHeadingId = (children: React.ReactNode): string => {
    // Convert children to string and create a deterministic ID
    const fullText = String(children);
    
    // Create a simple hash from the full text for uniqueness
    let hash = 0;
    for (let i = 0; i < fullText.length; i++) {
      const char = fullText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Create base ID from text
    const baseId = fullText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    // Append hash to ensure uniqueness while being deterministic
    return `${baseId || 'heading'}-${Math.abs(hash)}`;
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

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Production": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Active": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Archived": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-primary/10 text-foreground border-primary/20";
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-400";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-400";
      case "Advanced": return "bg-red-500/10 text-red-400";
      default: return "bg-primary/10 text-foreground";
    }
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
            href="/projects"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
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
                {tableOfContents.map((item, index) => (
                  <a
                    key={`${item.id}-${index}`}
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
                  {tableOfContents.map((item, index) => (
                    <a
                      key={`${item.id}-${index}`}
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
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {project.category.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 text-primary text-sm font-semibold">
                    <Tag size={14} />
                    {cat}
                  </span>
                ))}
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
                {project.title}
              </h1>

              {/* Tagline */}
              <p className="text-xl text-primary mb-6 font-medium">
                {project.tagline}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-dark-lighter">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Started {new Date(project.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}</span>
                </div>
                {project.teamSize && (
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Team of {project.teamSize}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target size={16} />
                  <span>{project.yourRole}</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-4 mb-8">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-lighter rounded-lg hover:border-primary transition-colors"
                  >
                    <Github size={18} />
                    <span>View on GitHub</span>
                  </a>
                )}
                {project.liveDemo && (
                  <a
                    href={project.liveDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                  >
                    <ExternalLink size={18} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

              {/* Proof / Evidence */}
              {project.proof && <ProofBlock proof={project.proof} />}

              {/* Quality Gates (platform signal) */}
              <ProjectQualityGates project={project} />

              {/* Metrics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {project.metrics.tests && (
                  <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{project.metrics.tests}</div>
                    <div className="text-gray-400 text-sm">Tests</div>
                  </div>
                )}
                {project.metrics.coverage && (
                  <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{project.metrics.coverage}</div>
                    <div className="text-gray-400 text-sm">Coverage</div>
                  </div>
                )}
                {project.metrics.performance && (
                  <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{project.metrics.performance}</div>
                    <div className="text-gray-400 text-sm">Performance</div>
                  </div>
                )}
                {project.metrics.bugs_found && (
                  <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{project.metrics.bugs_found}</div>
                    <div className="text-gray-400 text-sm">Bugs Found</div>
                  </div>
                )}
              </div>

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
                  {project.fullContent}
                </ReactMarkdown>
              </div>

              {/* Tech Stack */}
              <div className="mt-16 pt-8 border-t border-dark-lighter">
                <h3 className="text-lg font-semibold text-foreground mb-4">Technologies Used:</h3>
                <div className="flex flex-wrap gap-3">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-primary/10 text-foreground text-sm rounded-full font-mono hover:bg-primary/20 transition-colors cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Content */}
              {(relatedBlogs.length > 0 || relatedProjects.length > 0) && (
                <div className="mt-16 pt-8 border-t border-dark-lighter">
                  <h3 className="text-2xl font-bold text-foreground mb-8">Related Content</h3>
                  
                  {/* Related Blog Posts */}
                  {relatedBlogs.length > 0 && (
                    <div className="mb-12">
                      <h4 className="text-lg font-semibold text-primary mb-4">📝 Related Blog Posts</h4>
                      <div className="grid gap-4">
                        {relatedBlogs.map((blog) => (
                          <Link
                            key={blog.id}
                            href={`/blog/${blog.id}`}
                            className="p-4 bg-dark-card border border-dark-lighter rounded-lg hover:border-primary transition-colors group"
                          >
                            <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {blog.title}
                            </h5>
                            <p className="text-sm text-gray-400">{blog.excerpt}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Projects */}
                  {relatedProjects.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary mb-4">🚀 Related Projects</h4>
                      <div className="grid gap-4">
                        {relatedProjects.map((relProject) => (
                          <Link
                            key={relProject.id}
                            href={`/projects/${relProject.slug}`}
                            className="p-4 bg-dark-card border border-dark-lighter rounded-lg hover:border-primary transition-colors group"
                          >
                            <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {relProject.title}
                            </h5>
                            <p className="text-sm text-gray-400 mb-3">{relProject.tagline}</p>
                            <div className="flex flex-wrap gap-2">
                              {relProject.tech.slice(0, 4).map((tech) => (
                                <span key={tech} className="text-xs px-2 py-1 bg-primary/10 text-foreground rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final CTA */}
              <div className="mt-12 p-8 bg-gradient-to-br from-dark-card to-dark-card/50 border border-primary/20 rounded-xl text-center shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Impressed by this project?
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
                    View More Projects
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
