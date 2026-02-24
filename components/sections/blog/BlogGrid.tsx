"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Clock, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/blogData";
import { formatISODateUTC } from "@/lib/formatDate";

const categories = [
  "All",
  "Cloud Automation",
  "Infrastructure",
  "CI/CD",
  "API Testing",
  "Selenium",
  "Debugging",
  "E-Commerce",
  "Best Practices",
  "Career",
  "Reporting",
];

export default function BlogGrid({ searchQuery = "" }: { searchQuery?: string }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState<string>("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeError, setSubscribeError] = useState<string>("");

  async function handleSubscribe() {
    const nextEmail = email.trim();
    if (!nextEmail) {
      setSubscribeStatus("error");
      setSubscribeError("Please enter an email address.");
      return;
    }

    setSubscribeStatus("loading");
    setSubscribeError("");

    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
      const url = base ? `${base}/newsletter/subscribe` : '/api/newsletter/subscribe';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nextEmail, source: 'blog' }),
      });

      if (!res.ok) {
        let msg = 'Subscription failed';
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 6000);
    } catch (e) {
      setSubscribeStatus("error");
      setSubscribeError(e instanceof Error ? e.message : 'Subscription failed');
    }
  }

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-7xl mx-auto">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-primary text-dark"
                    : "bg-dark-card text-gray-300 hover:bg-dark-lighter hover:text-primary border border-dark-lighter"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-card border border-dark-lighter rounded-lg overflow-hidden hover:border-primary transition-all duration-300 group"
            >
              {/* Cover Image */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-primary text-6xl font-bold opacity-20">Blog</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/0 to-dark/20" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="text-primary" size={16} />
                  <span className="text-primary text-sm font-semibold">{post.category}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatISODateUTC(post.date, "short")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-foreground text-xs rounded font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors text-sm font-semibold"
                >
                  Read Article →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 bg-dark-card border border-primary/20 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Want to Learn More About Test Automation?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            I share weekly tips and lessons learned from building test frameworks at Fortune 50 companies and fintech startups.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-dark border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSubscribe()}
              disabled={subscribeStatus === 'loading'}
              className="px-6 py-3 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscribeStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>

          {subscribeStatus === 'success' && (
            <p className="mt-4 text-sm text-green-400">
              Check your inbox to confirm your subscription.
            </p>
          )}

          {subscribeStatus === 'error' && (
            <p className="mt-4 text-sm text-red-400">
              {subscribeError}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
