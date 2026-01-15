import type { Metadata } from "next";
import ArtifactsHero from "@/components/sections/artifacts/ArtifactsHero";
import ArtifactsLibrary from "@/components/sections/artifacts/ArtifactsLibrary";
import EvidenceGallery from "@/components/sections/artifacts/EvidenceGallery";

export const metadata: Metadata = {
  title: "Runbooks & Evidence | Jason Teixeira - Cloud Automation",
  description:
    "Download real runbooks, checklists, templates, and evidence (reports/screenshots) used to operate cloud automation systems: CI/CD, testing, reliability, and security.",
};

export default function ArtifactsPage() {
  return (
    <div>
      <ArtifactsHero />
      <ArtifactsLibrary />
      <EvidenceGallery />
    </div>
  );
}
