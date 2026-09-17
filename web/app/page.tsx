import { HeroSection } from "@/components/hero-section";
import { StatsBanner } from "@/components/stats-banner";
import { ServicesSection } from "@/components/how-it-works";
import { FeaturedVehicles } from "@/components/featured-vehicles";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import { TrustSignals } from "@/components/trust-signals";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsBanner />
      <ServicesSection />
      <FeaturedVehicles />
      <Testimonials />
      <CTASection />
      <TrustSignals />
    </main>
  );
}
