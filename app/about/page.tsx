import type { Metadata } from "next";
import AboutHero from "@/components/sections/about/AboutHero";
import MyStory from "@/components/sections/about/MyStory";
import Skills from "@/components/sections/about/Skills";
import CareerTimeline from "@/components/sections/about/CareerTimeline";
import ValueProps from "@/components/sections/about/ValueProps";
import Certifications from "@/components/sections/about/Certifications";

export const metadata: Metadata = {
  title: "About | Jason Teixeira - QA Automation Engineer",
  description: "Learn about my journey from finance to QA automation, 8+ years of experience, ISTQB certifications, and passion for quality engineering.",
};

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <MyStory />
      <Skills />
      <Certifications />
      <CareerTimeline />
      <ValueProps />
    </div>
  );
}
