"use client";

import { motion } from "framer-motion";

export default function TestingPhilosophy() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="mb-8">
            <svg
              className="w-16 h-16 mx-auto text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Quality is not an act, it is a habit.
          </blockquote>

          <p className="text-gray-400 text-lg mb-8">— Aristotle</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-gray-300 text-lg leading-relaxed">
              Great testing isn&apos;t about finding every bug—it&apos;s about building systems that 
              prevent bugs from happening in the first place. My approach focuses on creating 
              robust, maintainable frameworks that make quality a natural outcome, not an afterthought.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
