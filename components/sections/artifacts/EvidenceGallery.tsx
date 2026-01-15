"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { evidenceItems } from "@/lib/evidenceData";

export default function EvidenceGallery() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground">Evidence Gallery</h2>
          <p className="text-gray-400 mt-2 max-w-3xl">
            Recruiter-friendly proof that these artifacts connect to real automation outputs: reports, CI runs,
            and example scan results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evidenceItems.map((e) => (
            <div
              key={e.id}
              className="bg-dark-card border border-dark-lighter rounded-lg overflow-hidden hover:border-primary/40 transition-colors"
            >
              {e.imagePath && (
                <div className="relative w-full aspect-[16/9] bg-dark-lighter">
                  <Image
                    src={e.imagePath}
                    alt={e.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400">{e.type} • Updated {e.lastUpdated}</div>
                    <h3 className="text-lg font-semibold text-foreground mt-1">{e.title}</h3>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{e.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {e.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target={l.url.startsWith("http") ? "_blank" : undefined}
                      rel={l.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-dark-lighter border border-dark-lighter rounded text-sm text-foreground hover:border-primary/50"
                    >
                      <ExternalLink size={16} className="text-primary" />
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Note: evidence screenshots can be swapped with real outputs at any time without changing URLs.
        </div>
      </div>
    </section>
  );
}
