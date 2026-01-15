"use client";

import { useState } from "react";
import BlogHero from "@/components/sections/blog/BlogHero";
import BlogGrid from "@/components/sections/blog/BlogGrid";

export default function BlogPageClient() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <BlogHero onSearch={setQuery} />
      <BlogGrid searchQuery={query} />
    </div>
  );
}

