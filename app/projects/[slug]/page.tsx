import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/lib/projectsData";
import ProjectDetail from "@/components/sections/projects/ProjectDetail";
import { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all projects
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Jason Teixeira`,
    description: project.tagline,
    keywords: project.tags.join(", "),
    openGraph: {
      title: project.title,
      description: project.tagline,
      type: "article",
      publishedTime: project.startDate,
      modifiedTime: project.lastUpdated,
      tags: project.tags,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
