import dynamic from "next/dynamic";
import HeroV2 from "@/components/hero-v2";
import FAQSection from "@/components/faq-section";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";

// Dynamic imports for below-the-fold content
const StatsBar = dynamic(() => import("@/components/home/stats-bar"), { ssr: true });
const FeaturesSection = dynamic(() => import("@/components/home/features-section"), { ssr: true });
const TestimonialSection = dynamic(() => import("@/components/home/testimonial-section"), { ssr: true });

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      <HeroV2 />
      
      {/* Stats Bar - Dynamically loaded */}
      <StatsBar />

      {/* Features Section - Dynamically loaded */}
      <FeaturesSection features={features} />

      {/* Success Stories - Dynamically loaded */}
      <TestimonialSection testimonials={testimonial} />

      <FAQSection />
    </div>
  );
}

