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
            Need someone who can build — and run — automation systems in the cloud?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            I build production-style pipelines and quality telemetry: CI/CD gates, evidence-first reporting,
            performance budgets, and security automation.
            <span className="text-gray-400">
              {' '}
              I don’t disappear after the merge — I document, monitor, and leave systems in a state a team can operate.
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
