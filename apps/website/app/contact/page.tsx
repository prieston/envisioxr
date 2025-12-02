import { ContactForm } from "@/components/contact-form";

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
    <section className="space-y-12 pt-20">
      <div className="space-y-6">
        <h1 className="text-4xl font-light text-text-primary md:text-[48px]">
          Schedule a Demo
        </h1>
        <p className="max-w-[620px] text-[17px] leading-[1.6] tracking-[0.01em] text-text-secondary">
          See how Klorad can transform your infrastructure operations. Schedule a personalized demo tailored to your industry and use case.
        </p>
      </div>

      <ContactForm />
    </section>
  );
}

