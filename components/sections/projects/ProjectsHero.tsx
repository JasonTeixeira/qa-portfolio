"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface ProjectsHeroProps {
  onSearch?: (query: string) => void;
}

export default function ProjectsHero({ onSearch }: ProjectsHeroProps) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Test Automation Projects
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Real frameworks. Real code. Real results.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <label htmlFor="projects-search" className="sr-only">
                Search projects
              </label>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="projects-search"
                type="text"
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-dark-card border border-dark-lighter rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
