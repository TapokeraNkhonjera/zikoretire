import Hero from "@/components/sections/home/Hero";
import HowItWorks from "@/components/sections/home/HowItWorks";
import RetirementFeatures from "@/components/sections/home/RetirementFeatures";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RetirementFeatures />
      <HowItWorks />
    </main>
  );
}