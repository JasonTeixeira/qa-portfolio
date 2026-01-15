import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog | Jason Teixeira - QA Automation Engineer",
  description:
    "Technical articles about test automation, API testing, CI/CD, Selenium, pytest, and quality engineering best practices.",
};

export default function BlogPage() {
  return <BlogPageClient />;
}
