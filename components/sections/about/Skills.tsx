"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const skillCategories = [
  {
    title: "Test Automation",
    skills: [
      { name: "Selenium WebDriver", level: "Advanced", years: "6+ years", context: "300+ tests in production" },
      { name: "Playwright", level: "Proficient", years: "3 years", context: "Multi-browser testing" },
      { name: "Cypress", level: "Proficient", years: "2 years", context: "E2E test suites" },
      { name: "Appium", level: "Intermediate", years: "2 years", context: "15+ device coverage" },
    ],
  },
  {
    title: "Programming",
    skills: [
      { name: "Python", level: "Advanced", years: "6+ years", context: "6 frameworks built" },
      { name: "JavaScript/TypeScript", level: "Proficient", years: "4 years", context: "Node.js test scripts" },
      { name: "SQL", level: "Proficient", years: "5 years", context: "Data validation testing" },
      { name: "Bash/Shell", level: "Intermediate", years: "4 years", context: "CI/CD automation" },
    ],
  },
  {
    title: "API & Performance",
    skills: [
      { name: "REST API Testing", level: "Advanced", years: "5+ years", context: "125+ API tests" },
      { name: "Postman/pytest", level: "Proficient", years: "5 years", context: "Schema validation" },
      { name: "JMeter", level: "Intermediate", years: "2 years", context: "10K+ concurrent users" },
      { name: "GraphQL Testing", level: "Learning", years: "1 year", context: "Query optimization" },
    ],
  },
  {
    title: "CI/CD & DevOps",
    skills: [
      { name: "Jenkins", level: "Proficient", years: "4 years", context: "500+ tests/8 min" },
      { name: "GitHub Actions", level: "Proficient", years: "3 years", context: "Automated PR testing" },
      { name: "Docker", level: "Proficient", years: "3 years", context: "Containerized test suites" },
      { name: "Kubernetes", level: "Intermediate", years: "2 years", context: "Test infrastructure" },
    ],
  },
  {
    title: "Cloud & Tools",
    skills: [
      { name: "AWS", level: "Proficient", years: "4 years", context: "6 AWS certifications" },
      { name: "Git", level: "Advanced", years: "6+ years", context: "Version control" },
      { name: "Allure Reports", level: "Proficient", years: "3 years", context: "Test reporting" },
      { name: "TestRail/Jira", level: "Proficient", years: "5 years", context: "Test management" },
    ],
  },
  {
    title: "Frameworks & Methodologies",
    skills: [
      { name: "pytest", level: "Advanced", years: "5+ years", context: "Custom fixtures & plugins" },
      { name: "Page Object Model", level: "Advanced", years: "6+ years", context: "Component composition" },
      { name: "BDD/Cucumber", level: "Proficient", years: "3 years", context: "200+ scenarios" },
      { name: "TDD", level: "Proficient", years: "4 years", context: "Test-first development" },
    ],
  },
];

const levelColors = {
  "Advanced": "text-primary",
  "Proficient": "text-teal-400",
  "Intermediate": "text-teal-500",
  "Learning": "text-gray-400"
};

export default function Skills() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Technical Skills
          </h2>
          <p className="text-gray-400 text-lg">
            Real-world production experience with measurable impact
          </p>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary" size={16} />
              <span className="text-gray-300">Advanced: 5+ years production</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-teal-400" size={16} />
              <span className="text-gray-300">Proficient: 3-4 years</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-teal-500" size={16} />
              <span className="text-gray-300">Intermediate: 1-2 years</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-colors duration-300"
            >
              <h3 className="text-xl font-bold text-primary mb-6">{category.title}</h3>
              <div className="space-y-5">
                {category.skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: categoryIndex * 0.1 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <CheckCircle className={`${levelColors[skill.level as keyof typeof levelColors]} flex-shrink-0 mt-0.5`} size={18} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-200 font-medium">{skill.name}</span>
                          <span className={`text-xs font-semibold ${levelColors[skill.level as keyof typeof levelColors]}`}>
                            {skill.level}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <div className="font-mono">{skill.years}</div>
                          <div>{skill.context}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">8+</div>
            <div className="text-sm text-gray-400">Years Experience</div>
          </div>
          <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">6</div>
            <div className="text-sm text-gray-400">Frameworks Built</div>
          </div>
          <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-gray-400">Tests in Production</div>
          </div>
          <div className="bg-dark-card border border-dark-lighter rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">9</div>
            <div className="text-sm text-gray-400">Certifications</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
