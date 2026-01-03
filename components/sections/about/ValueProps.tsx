"use client";

import { motion } from "framer-motion";
import { Code, Zap, GitBranch, TrendingUp, Users, Shield } from "lucide-react";

const valueProps = [
  {
    icon: Code,
    title: "Framework Architecture",
    description: "Build scalable, maintainable test frameworks using Page Object Model, BDD, and modern design patterns.",
    example: "Built 6+ frameworks used by 50+ engineers",
    impact: "70% reduction in regression testing time"
  },
  {
    icon: Zap,
    title: "API Testing Expertise",
    description: "Deep experience with REST, GraphQL, and microservices testing. Intelligent retry logic and schema validation.",
    example: "125+ API tests with <1% flaky rate",
    impact: "Prevented 12+ breaking changes"
  },
  {
    icon: GitBranch,
    title: "CI/CD Integration",
    description: "Seamless integration with Jenkins, GitHub Actions, and GitLab CI. Pipeline optimization and parallel execution.",
    example: "500+ tests running in 8 minutes",
    impact: "82% faster execution through parallelization"
  },
  {
    icon: TrendingUp,
    title: "Performance Testing",
    description: "Load testing, stress testing, and scalability analysis using JMeter, Locust, and custom solutions.",
    example: "10K+ concurrent users tested",
    impact: "40% API response time improvement"
  },
  {
    icon: Shield,
    title: "Cloud-Native Testing",
    description: "AWS infrastructure testing, containerized tests with Docker, and Kubernetes deployment validation.",
    example: "6 AWS certifications, K8s test infrastructure",
    impact: "95% uptime SLA maintained"
  },
  {
    icon: Users,
    title: "Team Leadership",
    description: "Mentoring junior engineers, establishing best practices, and building a culture of quality engineering.",
    example: "Trained 15+ engineers in test automation",
    impact: "Established QA standards at 2 companies"
  },
];

export default function ValueProps() {
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
            What I Bring to Your Team
          </h2>
          <p className="text-gray-400 text-lg">
            Specialized skills that drive quality and efficiency
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{prop.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">{prop.description}</p>
                
                {/* Example & Impact */}
                <div className="space-y-2 pt-4 border-t border-dark-lighter">
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-xs font-bold">📊</span>
                    <p className="text-sm text-gray-300 font-medium">{prop.example}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-xs font-bold">🎯</span>
                    <p className="text-sm text-primary font-semibold">{prop.impact}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to build quality together?
            </h3>
            <p className="text-gray-300 mb-6">
              I&apos;m currently open to remote opportunities with organizations that value quality engineering and invest in their testing infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200"
              >
                Get In Touch
              </a>
              <a
                href="/resume.pdf"
                download
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200"
              >
                Download Resume
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
