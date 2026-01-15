"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Github, ExternalLink, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { projects } from "@/lib/projectsData";

const categories = ["All", "Selenium", "API", "CI/CD", "Performance", "Mobile", "BDD", "Python", "Docker", "Kubernetes"];

export default function ProjectsGrid() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = projects.filter((project) => {
    return selectedCategory === "All" || project.category.includes(selectedCategory);
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-7xl mx-auto">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-primary text-dark"
                    : "bg-dark-card text-gray-300 hover:bg-dark-lighter hover:text-primary border border-dark-lighter"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-dark-card border border-dark-lighter rounded-lg p-8 hover:border-primary transition-all duration-300 group text-foreground h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                  <div className="flex gap-3 ml-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors z-10"
                        aria-label="View on GitHub"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github size={24} />
                      </a>
                    )}
                    {project.liveDemo && (
                      <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors z-10"
                        aria-label="View live demo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={24} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-lighter rounded-lg p-3 text-center">
                    <div className="text-primary font-bold text-lg">{project.metrics.tests}</div>
                    <div className="text-gray-400 text-xs">Tests</div>
                  </div>
                  <div className="bg-dark-lighter rounded-lg p-3 text-center">
                    <div className="text-primary font-bold text-lg">{project.metrics.coverage}</div>
                    <div className="text-gray-400 text-xs">Coverage</div>
                  </div>
                  <div className="bg-dark-lighter rounded-lg p-3 text-center">
                    <div className="text-primary font-bold text-lg">{project.metrics.performance}</div>
                    <div className="text-gray-400 text-xs">Improvement</div>
                  </div>
                </div>

                {/* Problem/Solution */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Problem</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">{project.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Solution</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">{project.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-primary mb-3">Key Results</h4>
                  <ul className="space-y-2">
                    {project.results.slice(0, 2).map((result, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={16} />
                        <span className="line-clamp-1">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-dark-lighter text-foreground text-xs rounded-full font-mono text-white"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 5 && (
                    <span className="px-3 py-1 bg-dark-lighter text-foreground text-xs rounded-full font-mono text-white">
                      +{project.tech.length - 5}
                    </span>
                  )}
                </div>

                {/* Read More Link */}
                <Link href={`/projects/${project.slug}`} className="block">
                  <div className="flex items-center gap-2 text-primary hover:gap-3 transition-all mt-4 pt-4 border-t border-dark-lighter cursor-pointer">
                    <span className="font-semibold text-foreground">View Full Case Study</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}
