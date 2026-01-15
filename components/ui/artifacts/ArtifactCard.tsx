"use client";

import { QAArtifact } from "@/lib/artifactsData";
import { Download, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

function badgeColor(type: QAArtifact["type"]) {
  switch (type) {
    case "Playbook":
      return "bg-primary/20 text-primary border-primary/30";
    case "Template":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "Checklist":
      return "bg-green-500/15 text-green-300 border-green-500/30";
    case "Example":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    default:
      return "bg-gray-500/15 text-gray-300 border-gray-500/30";
  }
}

export default function ArtifactCard({ artifact }: { artifact: QAArtifact }) {
  const canPreview = artifact.format === "md";

  const [open, setOpen] = useState(false);
  const [md, setMd] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => {
    if (!md) return "";
    return marked.parse(md) as string;
  }, [md]);

  useEffect(() => {
    if (!open || !canPreview) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(artifact.downloadPath);
        if (!res.ok) throw new Error(`Preview fetch failed: ${res.status}`);
        const text = await res.text();
        if (!cancelled) setMd(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, canPreview, artifact.downloadPath]);

  return (
    <div className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded border ${badgeColor(artifact.type)}`}>
              {artifact.type}
            </span>
            <span className="text-xs px-2 py-1 rounded border border-dark-lighter text-gray-300">
              {artifact.category}
            </span>
            <span className="text-xs px-2 py-1 rounded border border-dark-lighter text-gray-400">
              .{artifact.format}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">{artifact.title}</h4>
          <p className="text-gray-400 text-sm leading-relaxed">{artifact.description}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {artifact.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded bg-dark-lighter text-gray-300 inline-flex items-center gap-1"
            >
              <Tag size={12} />
              {t}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canPreview && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-dark-lighter text-foreground text-sm font-semibold rounded hover:bg-dark-card transition-all duration-200 inline-flex items-center gap-2 border border-dark-lighter"
            >
              Preview
            </button>
          )}
          <a
            href={artifact.downloadPath}
            download
            className="px-4 py-2 bg-primary text-dark text-sm font-semibold rounded hover:bg-primary-dark transition-all duration-200 inline-flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Updated {artifact.lastUpdated} • Recommended for {artifact.recommendedFor.join(", ")}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${artifact.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="relative w-full max-w-3xl bg-dark-card border border-dark-lighter rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-dark-lighter">
              <div>
                <div className="text-xs text-gray-400">Preview</div>
                <div className="text-foreground font-semibold">{artifact.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-foreground bg-dark-lighter rounded border border-dark-lighter hover:bg-dark-card"
              >
                Close
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-auto">
              {loading && <div className="text-gray-300">Loading preview…</div>}
              {error && <div className="text-red-300">Could not load preview. ({error})</div>}
              {!loading && !error && (
                <article
                  className="prose prose-invert prose-sm max-w-none"
                  // The markdown content is from our own public/ artifacts.
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
