"use client";

import { ArtifactCategory, ArtifactType } from "@/lib/artifactsData";
import { Search } from "lucide-react";

const TYPE_OPTIONS: (ArtifactType | "All")[] = [
  "All",
  "Playbook",
  "Template",
  "Checklist",
  "Example",
];

const CATEGORY_OPTIONS: (ArtifactCategory | "All")[] = [
  "All",
  "Strategy",
  "Planning",
  "Risk",
  "Execution",
  "Defect Management",
  "Release",
  "Automation",
  "API",
  "Visual",
  "Security",
  "Reporting",
];

export default function ArtifactFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  type: ArtifactType | "All";
  onTypeChange: (v: ArtifactType | "All") => void;
  category: ArtifactCategory | "All";
  onCategoryChange: (v: ArtifactCategory | "All") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <label htmlFor="artifact-search" className="sr-only">
          Search artifacts
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          id="artifact-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-72 bg-dark-card border border-dark-lighter rounded pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as ArtifactType | "All")}
        aria-label="Filter artifacts by type"
        className="bg-dark-card border border-dark-lighter rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as ArtifactCategory | "All")}
        aria-label="Filter artifacts by category"
        className="bg-dark-card border border-dark-lighter rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
