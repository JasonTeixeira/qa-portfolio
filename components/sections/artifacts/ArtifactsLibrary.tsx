"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  qaArtifacts,
  type ArtifactCategory,
  type ArtifactType,
  type QAArtifact,
} from "@/lib/artifactsData";
import ArtifactCard from "@/components/ui/artifacts/ArtifactCard";
import ArtifactFilters from "@/components/ui/artifacts/ArtifactFilters";

function matchesSearch(a: QAArtifact, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    a.title.toLowerCase().includes(query) ||
    a.description.toLowerCase().includes(query) ||
    a.tags.some((t) => t.toLowerCase().includes(query))
  );
}

function groupByType(artifacts: QAArtifact[]) {
  const order: ArtifactType[] = ["Playbook", "Template", "Checklist", "Example"];
  const map = new Map<ArtifactType, QAArtifact[]>();
  for (const t of order) map.set(t, []);
  for (const a of artifacts) {
    const arr = map.get(a.type) ?? [];
    arr.push(a);
    map.set(a.type, arr);
  }
  return { order, map };
}

export default function ArtifactsLibrary() {
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<ArtifactType | "All">("All");
  const [category, setCategory] = useState<ArtifactCategory | "All">("All");

  const filtered = useMemo(() => {
    return qaArtifacts
      .filter((a) => (type === "All" ? true : a.type === type))
      .filter((a) => (category === "All" ? true : a.category === category))
      .filter((a) => matchesSearch(a, search));
  }, [search, type, category]);

  const { order, map } = useMemo(() => groupByType(filtered), [filtered]);

  const total = qaArtifacts.length;
  const shown = filtered.length;

  return (
    <section id="library" className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Download Library</h2>
              <p className="text-gray-400 mt-2">
                Showing <span className="text-foreground font-semibold">{shown}</span> of {total} artifacts.
              </p>
            </div>
            <ArtifactFilters
              search={search}
              onSearchChange={setSearch}
              type={type}
              onTypeChange={setType}
              category={category}
              onCategoryChange={setCategory}
            />
          </div>
        </motion.div>

        {shown === 0 ? (
          <div className="bg-dark-card border border-dark-lighter rounded-lg p-8 text-center">
            <p className="text-gray-300">No artifacts match your filters.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {order
              .filter((t) => (map.get(t)?.length ?? 0) > 0)
              .map((t) => (
                <div key={t}>
                  <h3 className="text-xl font-bold text-foreground mb-4">{t}s</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {map.get(t)!.map((a) => (
                      <ArtifactCard key={a.id} artifact={a} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
