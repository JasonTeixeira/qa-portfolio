"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Linkedin, Github } from "lucide-react";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Platform", href: "/platform" },
  { name: "Telemetry", href: "/platform/quality-telemetry" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Projects", href: "/projects" },
  { name: "Artifacts", href: "/artifacts" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-dark-card/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary-dark transition-colors"
          >
            Jason
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
            <a
              href="/resume.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open("/resume.html", "_blank", "noopener,noreferrer");
              }}
              className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-dark transition-all duration-200"
            >
              Resume
            </a>
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.linkedin.com/in/jason-teixeira/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://www.linkedin.com/in/jason-teixeira/",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="text-foreground hover:text-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com/JasonTeixeira"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://github.com/JasonTeixeira",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="text-foreground hover:text-primary transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-lighter">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-foreground hover:text-primary transition-colors duration-200 py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="/resume.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open("/resume.html", "_blank", "noopener,noreferrer");
                setIsOpen(false);
              }}
              className="block w-full text-center px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-dark transition-all duration-200"
            >
              Resume
            </a>
            {/* Social Links */}
            <div className="flex items-center justify-center space-x-6 pt-4 border-t border-dark-lighter">
              <a
                href="https://www.linkedin.com/in/jason-teixeira/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://www.linkedin.com/in/jason-teixeira/",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  setIsOpen(false);
                }}
                className="text-foreground hover:text-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://github.com/JasonTeixeira"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://github.com/JasonTeixeira",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  setIsOpen(false);
                }}
                className="text-foreground hover:text-primary transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
