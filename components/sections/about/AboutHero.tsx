"use client";

import { motion } from "framer-motion";
import { MapPin, Mail } from "lucide-react";
import Image from "next/image";

export default function AboutHero() {
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
            About Me
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            QA Automation Engineer passionate about building test frameworks that actually work
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Photo/Avatar */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 border-4 border-primary rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
              <Image
                src="/images/headshot.jpg"
                alt="Jason Teixeira"
                fill
                sizes="256px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Jason Teixeira</h2>
              <p className="text-xl text-primary font-semibold mb-6">QA Automation Engineer</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="text-primary" size={20} />
                <span>Orlando, FL (Remote-First)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="text-primary" size={20} />
                <a href="mailto:sage@sageideas.org" className="hover:text-primary transition-colors">
                  sage@sageideas.org
                </a>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-gray-400 text-sm">
                <span className="text-primary font-semibold">Languages:</span> English (Native), Portuguese (Native), Spanish (Professional)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
