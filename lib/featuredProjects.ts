import { projects, type Project } from "@/lib/projectsData";

/**
 * Central source of truth for homepage featured projects.
 *
 * We intentionally pick by slug so copy changes (title/description/etc.)
 * in `projectsData.ts` automatically flow through.
 */
const FEATURED_SLUGS = [
  "aws-landing-zone-guardrails",
  "quality-telemetry-dashboard",
  "api-testing-framework",
  "cicd-testing-pipeline",
] as const;

export function getFeaturedProjects(): Project[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p] as const));

  const featured: Project[] = [];
  for (const slug of FEATURED_SLUGS) {
    const project = bySlug.get(slug);
    if (project) featured.push(project);
  }

  return featured;
}

