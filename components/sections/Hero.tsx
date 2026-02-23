"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const roles = [
  "QA Automation / SDET (cloud-curious)",
  "Test Automation + CI/CD",
  "API Testing + Quality Telemetry",
  "AWS + IaC (learning by shipping)",
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [delta, setDelta] = useState(150);

  useEffect(() => {
    const tick = () => {
      const fullText = roles[roleIndex];
      const updatedText = isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1);

      setText(updatedText);

      if (isDeleting) {
        setDelta(75);
      }

      if (!isDeleting && updatedText === fullText) {
        setIsDeleting(true);
        setDelta(2000);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setDelta(150);
      }
    };

    const ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta, roleIndex, isDeleting]);

  const stats = [
    { label: "Tests in Production", value: "500+" },
    { label: "Automation Systems", value: "CI/CD + QA + Infra" },
    { label: "Fortune 50 Impact", value: "Yes" },
    { label: "Cloud Focus", value: "AWS + IaC" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Professional Headshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20">
              <Image
                src="/images/headshot.jpg"
                alt="Jason Teixeira"
                fill
                sizes="192px"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary text-lg sm:text-xl mb-4 font-mono"
          >
            Hi, my name is
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4"
          >
            Jason Teixeira
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-400 mb-6 h-16 flex items-center justify-center"
          >
            <span className="font-mono">{text}</span>
            <span className="animate-pulse text-primary">|</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            I build automation systems with a production mindset: CI/CD gates, quality telemetry, and cloud guardrails.
            <span className="text-gray-400">{' '}I’m always learning — and I document what I build so teams can run it.</span>
          </motion.h2>

          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-12"
          >
            <span className="px-3 py-1 bg-dark-card border border-dark-lighter rounded-full text-foreground font-semibold">
              Built with real-world constraints (enterprise + fintech)
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Link
              href="/projects/aws-landing-zone-guardrails"
              className="px-8 py-4 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              View Flagship
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-dark-card border-2 border-primary text-foreground font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              Contact
            </Link>
            <Link
              href="#start-here"
              className="px-8 py-4 border-2 border-primary text-foreground font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              Start here (60 seconds)
            </Link>
            <Link
              href="/projects"
              className="px-8 py-4 border-2 border-primary text-foreground font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              View Projects
            </Link>
            <a
              href="/resume.pdf"
              download
              className="px-8 py-4 border-2 border-primary text-foreground font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              Download Resume
            </a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-colors duration-200"
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="text-primary" size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
