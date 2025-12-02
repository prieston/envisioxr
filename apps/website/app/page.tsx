import Link from "next/link";
import type { Metadata } from "next";
import { AmbientField } from "@/components/ambient-field";

export const metadata: Metadata = {
  title: "Klorad - The Geospatial Platform for Operating Real-World Infrastructure",
  description:
    "Klorad unifies terrain, structures, equipment, and live operational data into one platform. See how your infrastructure behaves, analyze changes over time, and coordinate operations with confidence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Klorad - The Geospatial Platform for Operating Real-World Infrastructure",
    description:
      "Klorad unifies terrain, structures, equipment, and live operational data into one platform. See how your infrastructure behaves, analyze changes over time, and coordinate operations with confidence.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <AmbientField />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                The Geospatial Platform for Operating Real-World Infrastructure
              </h1>
              <p className="max-w-[620px] text-xl font-light text-text-secondary">
                Klorad unifies terrain, structures, equipment, and live operational data into one platform.
              </p>
              <p className="max-w-[620px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                See how your infrastructure behaves, analyze changes over time, and coordinate operations with confidence.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
              >
                Schedule Demo
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center justify-center text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                View Platform →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Hook Section */}
      <section className="border-t border-line-soft pt-32 pb-28 md:pt-36 md:pb-32">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-16 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            See everything. Understand anything. Act instantly.
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Visualize</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Real-time 3D models from photogrammetry, LiDAR, and CAD. Unified view of all infrastructure assets with live sensor data integration.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Analyze</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Simulate interventions before deployment. Track changes over time and understand how systems interact.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Operate</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate teams across control rooms and field devices. Make decisions grounded in accurate, reality-aligned data and deploy changes with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <p className="mb-8 text-sm uppercase tracking-[0.28em] text-text-tertiary">
            Trusted by leading organizations
          </p>
          <div className="flex flex-wrap items-center gap-8 opacity-60">
            {/* Placeholder for logos - replace with actual logo components */}
            <div className="text-sm text-text-tertiary">Government agencies</div>
            <div className="text-sm text-text-tertiary">Engineering firms</div>
            <div className="text-sm text-text-tertiary">Infrastructure operators</div>
            <div className="text-sm text-text-tertiary">Heritage institutions</div>
          </div>
          <p className="mt-8 text-sm text-text-secondary">
            PSM is our exclusive deployment partner for Mobility & ITS
          </p>
        </div>
      </section>

      {/* Enterprise Value Section */}
      <section className="border-t border-line-soft pt-28 pb-32 md:pt-32 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Built for organizations where decisions carry real-world consequences
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Precision</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Maintain alignment between physical and digital worlds.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Integration</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Unify models, systems, and live operational signals.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Collaboration</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate stakeholders across control rooms and field devices.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Traceability</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Every change traced to source data and reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Grid Section */}
      <section className="border-t border-line-soft pt-28 pb-32 md:pt-32 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Solutions for your industry
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/industries/mobility"
              className="group space-y-4 border border-line-soft p-6 transition-colors duration-500 hover:border-line-strong"
            >
              <h3 className="text-lg font-light text-text-primary">Mobility & ITS</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Optimize traffic flow, manage infrastructure, coordinate operations.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/cultural-heritage"
              className="group space-y-4 border border-line-soft p-6 transition-colors duration-500 hover:border-line-strong"
            >
              <h3 className="text-lg font-light text-text-primary">Cultural Heritage</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Preserve sites while enabling access and interpretation.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/agriculture"
              className="group space-y-4 border border-line-soft p-6 transition-colors duration-500 hover:border-line-strong"
            >
              <h3 className="text-lg font-light text-text-primary">Agriculture & Land Management</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Monitor crops, manage land, optimize operations.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/urban-infrastructure"
              className="group space-y-4 border border-line-soft p-6 transition-colors duration-500 hover:border-line-strong"
            >
              <h3 className="text-lg font-light text-text-primary">Urban Infrastructure</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Plan, build, and operate city infrastructure.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary">
                Learn more →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t border-line-soft py-28 md:py-32">
        <div className="mx-auto max-w-container px-6 md:px-8 text-center">
          <h2 className="mb-6 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to see Klorad in action?
          </h2>
          <p className="mb-8 text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a personalized demo for your organization
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
            >
              Schedule Demo
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
            >
              Contact Sales →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
