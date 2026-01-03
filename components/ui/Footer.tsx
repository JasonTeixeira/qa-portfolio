import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/JasonTeixeira",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/jason-teixeira/",
    icon: Linkedin,
  },
  {
    name: "Email",
    href: "mailto:sage@sageideas.org",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-lighter py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label={link.name}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>

          {/* Copyright & Credits */}
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Jason Teixeira. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Built with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Next.js
              </a>
              ,{" "}
              <a
                href="https://tailwindcss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Tailwind CSS
              </a>
              , and{" "}
              <a
                href="https://www.framer.com/motion/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Framer Motion
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
