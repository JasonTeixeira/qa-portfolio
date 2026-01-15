"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Download, ShieldCheck, ClipboardCheck, FileText } from "lucide-react";

export default function ArtifactsHero() {
  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Runbooks & Evidence
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Download the same templates, checklists, and playbooks I use to operate automation systems:
            CI/CD, cloud delivery, QA strategy, reliability, and security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a
              href="#library"
              className="px-8 py-4 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Browse Downloads
            </a>

            <a
              href="/artifacts/recruiter-pack.zip"
              download
              className="px-8 py-4 bg-dark-card border border-dark-lighter text-foreground font-semibold rounded hover:border-primary hover:bg-dark-lighter transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Recruiter Pack (ZIP)
            </a>
            <Link
              href="/projects"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              View Proof in Projects
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-dark-card border border-dark-lighter rounded-lg p-5 text-left">
              <div className="flex items-center gap-2 text-primary mb-2">
                <FileText size={18} />
                <span className="font-semibold">Strategy</span>
              </div>
              <p className="text-gray-400 text-sm">
                Strategy + plan templates built around scope, environments, risk, and entry/exit criteria.
              </p>
            </div>
            <div className="bg-dark-card border border-dark-lighter rounded-lg p-5 text-left">
              <div className="flex items-center gap-2 text-primary mb-2">
                <ClipboardCheck size={18} />
                <span className="font-semibold">Execution</span>
              </div>
              <p className="text-gray-400 text-sm">
                Operational checklists for regression, API, and visual testing that reduce missed edge cases.
              </p>
            </div>
            <div className="bg-dark-card border border-dark-lighter rounded-lg p-5 text-left">
              <div className="flex items-center gap-2 text-primary mb-2">
                <ShieldCheck size={18} />
                <span className="font-semibold">Security</span>
              </div>
              <p className="text-gray-400 text-sm">
                OWASP-focused checklist + release sign-off to communicate risk clearly.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
