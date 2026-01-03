"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const timeline = [
  {
    year: "Jan 2020 - Present",
    title: "Quantitative Finance & Automation",
    company: "HighStrike",
    location: "Boston, MA (Remote)",
    description: "Leading test automation for fintech trading systems. Scaled test infrastructure to handle 50K+ daily trades with 95% uptime SLA. Prevented multi-million dollar trading errors through intelligent automation.",
    highlights: ["500+ automated tests in 8 min", "50K+ daily trades tested", "95% uptime SLA", "<1% flaky test rate"],
  },
  {
    year: "Nov 2016 - Apr 2021",
    title: "Automation Engineer",
    company: "The Home Depot",
    location: "Florida, United States",
    description: "Led enterprise cloud migration testing and built Selenium frameworks serving 2,300+ stores.",
    highlights: ["70% regression time reduction", "AWS migration testing", "300+ automated tests"],
  },
  {
    year: "Dec 2016 - Apr 2020",
    title: "Cloud Engineer",
    company: "The Home Depot",
    location: "Florida, United States",
    description: "Led enterprise cloud migration from on-premise to AWS, architecting scalable infrastructure using Terraform and Kubernetes.",
    highlights: ["35% cost reduction", "CI/CD pipelines", "4 hours → 15 min deployment"],
  },
  {
    year: "Dec 2012 - Nov 2016",
    title: "Software Tester",
    company: "The Home Depot",
    location: "Florida, United States",
    description: "Led end-to-end testing for e-commerce platform handling 2,300+ store inventory systems.",
    highlights: ["POS testing", "Inventory systems", "E-commerce testing"],
  },
];

export default function CareerTimeline() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Career Journey
          </h2>
          <p className="text-gray-400 text-lg">
            From QA engineer to building frameworks at scale
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20"></div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-0 w-5 h-5 bg-primary rounded-full border-4 border-dark"></div>

                <div className="bg-dark-card border border-dark-lighter rounded-lg p-6 hover:border-primary transition-colors duration-300">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="text-primary" size={20} />
                        <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-primary font-semibold">{item.company}</p>
                      <p className="text-gray-400 text-sm">{item.location}</p>
                    </div>
                    <span className="text-primary font-mono text-sm bg-primary/10 px-3 py-1 rounded">
                      {item.year}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4">{item.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {item.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="text-xs bg-dark-lighter text-gray-300 px-3 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
