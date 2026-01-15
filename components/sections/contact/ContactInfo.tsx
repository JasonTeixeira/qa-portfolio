"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Linkedin, Github, Calendar } from "lucide-react";

export default function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
        <p className="text-gray-300 text-lg mb-8">
          I&apos;m currently open to remote Automation opportunities. Whether you need help building test frameworks, improving CI/CD pipelines, or leading quality engineering initiatives, let&apos;s talk.
        </p>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Mail className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Email</p>
            <a href="mailto:sage@sageideas.org" className="text-foreground hover:text-primary transition-colors">
              sage@sageideas.org
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Location</p>
            <p className="text-foreground">Orlando, FL</p>
            <p className="text-gray-400 text-sm">(Remote-First)</p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground mb-4">Connect With Me</h3>
        
        <div className="flex gap-4">
          <a
            href="https://www.linkedin.com/in/jason-teixeira"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-dark-card border border-dark-lighter rounded-lg hover:border-primary transition-colors group"
            aria-label="LinkedIn"
          >
            <Linkedin className="text-gray-400 group-hover:text-primary transition-colors" size={24} />
          </a>
          <a
            href="https://github.com/JasonTeixeira"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-dark-card border border-dark-lighter rounded-lg hover:border-primary transition-colors group"
            aria-label="GitHub"
          >
            <Github className="text-gray-400 group-hover:text-primary transition-colors" size={24} />
          </a>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Calendar className="text-primary mt-1" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Availability</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Open to remote opportunities</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Available for full-time roles</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Open to consulting projects</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-sm text-gray-400">
            <span className="text-primary font-semibold"></span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-primary font-semibold"></span>
          </p>
        </div>
      </div>

      {/* Response Time */}
      <div className="text-center p-6 bg-dark-card rounded-lg border border-dark-lighter">
        <p className="text-gray-300">
          I typically respond within <span className="text-primary font-semibold">24 hours</span>
        </p>
      </div>
    </motion.div>
  );
}
