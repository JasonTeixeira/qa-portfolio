"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, ShieldCheck, Github, ExternalLink } from "lucide-react";

const items = [
  {
    title: "Projects",
    description: "8 full case studies with architecture + code snippets.",
    href: "/projects",
    icon: ExternalLink,
  },
  {
    title: "Artifacts",
    description: "Templates + filled examples + recruiter pack.",
    href: "/artifacts#library",
    icon: FileText,
  },
  {
    title: "Evidence",
    description: "Reports/screenshots proving the work is real.",
    href: "/artifacts#evidence",
    icon: ShieldCheck,
  },
  {
    title: "GitHub",
    description: "Repos + CI runs + badges across frameworks.",
    href: "https://github.com/JasonTeixeira",
    icon: Github,
    external: true,
  },
];

export default function ProofStrip() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="h-full bg-dark-card border border-dark-lighter rounded-lg p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-primary">
                      <Icon size={18} />
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );

            if (item.external) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {card}
                </a>
              );
            }

            return (
              <Link key={item.title} href={item.href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
