"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle } from "lucide-react";

const certifications = [
  {
    title: "ISTQB Certified Tester Foundation Level (CTFL)",
    issuer: "ISTQB - International Software Testing Qualifications Board",
    year: "2024",
  },
  {
    title: "ISTQB Test Automation Engineering (TAE)",
    issuer: "ISTQB - International Software Testing Qualifications Board",
    year: "2024",
  },
  {
    title: "ISTQB AI Testing (CT-AI)",
    issuer: "ISTQB - International Software Testing Qualifications Board",
    year: "2024",
  },
  {
    title: "AWS Cloud Essentials",
    issuer: "Amazon Web Services",
    year: "2023",
  },
  {
    title: "AWS Serverless",
    issuer: "Amazon Web Services",
    year: "2023",
  },
  {
    title: "AWS Migration Foundations",
    issuer: "Amazon Web Services",
    year: "2022",
  },
  {
    title: "AWS Amazon Braket",
    issuer: "Amazon Web Services",
    year: "2023",
  },
  {
    title: "Networking Devices and Initial Configuration",
    issuer: "Cisco/Industry Certification",
    year: "2023",
  },
];

export default function Certifications() {
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
            Certifications
          </h2>
          <p className="text-gray-400 text-lg">
            Professional certifications demonstrating expertise and commitment to quality
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-colors duration-300"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="text-primary" size={24} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{cert.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{cert.issuer}</p>
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <CheckCircle size={16} />
                    <span>Earned {cert.year}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-primary/10 border border-primary/20 rounded-lg px-6 py-4">
            <p className="text-gray-300">
              <span className="text-primary font-semibold">Education:</span> BS in Computer Science (Full Sail University) · BS in Finance (Kean University)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
