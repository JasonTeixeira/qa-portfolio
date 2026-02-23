"use client";

import { motion } from "framer-motion";

export default function MyStory() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
            My Story
          </h2>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              My journey into tech took an unconventional path. I started with a degree in <span className="text-primary font-semibold">Finance</span> from 
              Kean University, then pursued <span className="text-primary font-semibold">Computer Science</span> at Full Sail University. This unique 
              combination gives me a perspective that few QA engineers have—I understand both the business impact and the technical implementation.
            </p>

            <p>
              I joined <span className="text-primary font-semibold">The Home Depot</span> as a Software Tester and grew from testing basic workflows to leading enterprise-scale test automation initiatives as an Automation Engineer and Cloud Engineer. I built frameworks that tested systems serving
              <span className="text-primary font-semibold"> 2,300+ stores</span> and millions of customers daily.
            </p>

            <p>
              The scale was massive: POS systems, inventory management, supply chain logistics, and e-commerce platforms. I learned that great testing 
              isn&apos;t just about catching bugs—it&apos;s about <span className="text-primary font-semibold">preventing them from happening in the first place</span>.
            </p>

            <p>
              In 2020, I transitioned to <span className="text-primary font-semibold">HighStrike</span>, a fintech startup building quantitative trading systems. 
              Here, I test systems that process <span className="text-primary font-semibold">$10M+ daily volume</span> in real-time. The stakes are higher, 
              the requirements are stricter, and the testing needs to be bulletproof. No room for flaky tests when money is on the line.
            </p>

            <p>
              Fast forward to 2024—at HighStrike, I&apos;ve scaled our test infrastructure to handle <span className="text-primary font-semibold">50K+ daily trades</span> 
              with a <span className="text-primary font-semibold">95% uptime SLA</span>. My test frameworks have prevented multiple potential multi-million dollar 
              trading errors by catching edge cases that human testing would have missed. We process <span className="text-primary font-semibold">500+ automated tests</span> 
              across microservices in under 8 minutes, enabling rapid deployment cycles.
            </p>

            <p>
              Today, I&apos;m <span className="text-primary font-semibold">ISTQB certified</span> (Foundation Level, Test Automation Engineering, and AI Testing) 
              with <span className="text-primary font-semibold">6 AWS certifications</span>. I specialize in building test frameworks that teams actually want to use. 
              My focus is on API testing, CI/CD integration, and creating maintainable automation that scales—from Fortune 50 enterprises to fast-moving startups.
            </p>

            <p>
              Being <span className="text-primary font-semibold">trilingual</span> (English, Portuguese, Spanish) has also been a huge advantage—I&apos;ve 
              worked with global teams and understand how to build documentation and frameworks that work across cultures.
            </p>

            <p className="text-primary font-semibold pt-4">
              I believe quality isn&apos;t a phase—it&apos;s a culture. And great test automation is the foundation of that culture.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
