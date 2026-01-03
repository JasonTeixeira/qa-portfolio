import type { Metadata } from "next";
import BlogHero from "@/components/sections/blog/BlogHero";
import BlogGrid from "@/components/sections/blog/BlogGrid";

export const metadata: Metadata = {
  title: "Blog | Jason Teixeira - QA Automation Engineer",
  description: "Technical articles about test automation, API testing, CI/CD, Selenium, pytest, and quality engineering best practices.",
};

export default function BlogPage() {
  return (
    <div>
      <BlogHero />
      <BlogGrid />
    </div>
  );
}
