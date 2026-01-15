"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { getFeaturedProjects } from "@/lib/featuredProjects";

const projects = getFeaturedProjects();

export default function FeaturedProjects() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Featured Projects
          </h2>
          <p className="text-gray-400 text-lg">
            Cloud automation + test infrastructure systems that work in production
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex gap-2">
                  <a
                    href={project.github ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label="View project"
                  >
                    <ExternalLink size={20} />
                  </Link>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {project.title}
              </h3>

              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-dark-lighter text-foreground text-xs rounded-full font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/projects"
            className="inline-block px-8 py-4 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200"
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
