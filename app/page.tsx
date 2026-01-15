import Hero from "@/components/sections/Hero";
import ProofStrip from "@/components/sections/ProofStrip";
import StartHere from "@/components/sections/StartHere";
import AboutPreview from "@/components/sections/AboutPreview";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import TestingPhilosophy from "@/components/sections/TestingPhilosophy";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <ProofStrip />
      <StartHere />
      <AboutPreview />
      <FeaturedProjects />
      <TestingPhilosophy />
      <FinalCTA />
    </div>
  );
}
