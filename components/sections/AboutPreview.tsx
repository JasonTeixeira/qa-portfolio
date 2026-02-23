"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AboutPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Headshot Image */}
          <div className="relative">
            <div className="aspect-square bg-dark-card border-2 border-primary rounded-lg overflow-hidden relative">
              <Image
                src="/images/headshot.jpg"
                alt="Jason Teixeira"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* About Text */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-foreground mb-6"
            >
              About Me
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4 text-gray-300 text-lg"
            >
              <p>
                I build QA automation and production-minded test systems that catch bugs early and make releases safer.
              </p>
              <p>
                My background includes enterprise and fintech environments, and I try to bring the same habits into what I build: clear docs, evidence, and repeatable workflows.
                <span className="text-primary font-semibold"> ISTQB certified</span>.
              </p>
              <p>
                Currently focused on API testing, CI/CD integration, and building frameworks that teams can maintain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors group"
              >
                <span className="font-semibold">Learn more about me</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
