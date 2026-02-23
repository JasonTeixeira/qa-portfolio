"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Looking for someone hands-on in QA automation and cloud tooling?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            I build production-minded automation: CI/CD quality gates, evidence-first reporting,
            performance budgets, and security checks.
            <span className="text-gray-400">
              {' '}
              I’m coachable, I learn fast, and I document what I build so the next person can run it.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200 transform hover:scale-105"
            >
              Contact me
            </Link>
            <Link
              href="/platform"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200"
            >
              See the architecture
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
