import { ContactForm } from "@/components/contact-form";
import { GeometricHint } from "@/components/geometric-hint";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule a Demo | Klorad",
  description:
    "Schedule a personalized demo of Klorad's geospatial platform. See how we can help you visualize, analyze, and operate your infrastructure with confidence.",
  openGraph: {
    title: "Schedule a Demo | Klorad",
    description:
      "Schedule a personalized demo of Klorad's geospatial platform for operating real-world infrastructure.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <GeometricHint variant="radial-vignette" />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                Schedule a Demo
              </h1>
              <p className="max-w-[620px] text-xl font-light text-text-secondary">
                See how Klorad can transform your infrastructure operations.
              </p>
              <p className="max-w-[620px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                Schedule a personalized demo tailored to your industry and use case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <ContactForm />
        </div>
      </section>
    </article>
  );
}

