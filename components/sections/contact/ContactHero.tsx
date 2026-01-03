"use client";

import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Let&apos;s Build Quality Together
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
            Open to remote QA automation opportunities. Let&apos;s talk about how I can help your team ship quality software faster.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
