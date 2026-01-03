import type { Metadata } from "next";
import ProjectsHero from "@/components/sections/projects/ProjectsHero";
import ProjectsGrid from "@/components/sections/projects/ProjectsGrid";

export const metadata: Metadata = {
  title: "Projects | Jason Teixeira - QA Automation Engineer",
  description: "Explore test automation frameworks, CI/CD pipelines, and QA projects built with Python, Selenium, pytest, and modern testing tools.",
};

export default function ProjectsPage() {
  return (
    <div>
      <ProjectsHero />
      <ProjectsGrid />
    </div>
  );
}
