// import About from "@/components/About";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
// import Brands from "@/components/Brands";
import CallToAction from "@/components/Home/CallToAction";
import Features from "@/components/Home/Features";
import Hero from "@/components/Home/Hero";
// import Portfolio from "@/components/Home/Portfolio";
// import Testimonials from "@/components/Home/Testimonials";
import Pricing from "@/components/Pricing";
import Support from "@/components/Support";
import Team from "@/components/Team";
import { Metadata } from "next";
import { integrations, messages } from "../../../integrations.config";

const siteName = process.env.SITE_NAME;

export const metadata: Metadata = {
  title: `EnvisioXR | Home`,
  description:
    "Create stunning 3D presentations and immersive virtual tours with EnvisioXR. Perfect for businesses, museums, real estate, and more—bringing spaces to life with interactive, web-based experiences.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      {/* <About /> */}
      {/* <Team /> */}
      {/* <Portfolio /> */}
      {/* <Testimonials /> */}
      {/* <Brands /> */}
      <Pricing />
      {integrations?.isSanityEnabled && <HomeBlogSection />}
      <Support />
      <CallToAction />
    </>
  );
}
