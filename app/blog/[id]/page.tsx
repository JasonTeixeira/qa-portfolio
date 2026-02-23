import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogPost from "@/components/sections/blog/BlogPost";
import { blogPosts } from "@/lib/blogData";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = blogPosts.find((p) => p.id === parseInt(id));
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Jason Teixeira Blog`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Jason Teixeira Blog`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1600,
              height: 900,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = blogPosts.find((p) => p.id === parseInt(id));

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id.toString(),
  }));
}
