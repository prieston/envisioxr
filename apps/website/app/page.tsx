import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AmbientField } from "@/components/ambient-field";
import { ValueHookSection } from "@/components/ValueHookSection";
import { PrecisionIcon } from "@/components/icons/PrecisionIcon";
import { IntegrationIcon } from "@/components/icons/IntegrationIcon";
import { CollaborationIcon } from "@/components/icons/CollaborationIcon";
import { TraceabilityIcon } from "@/components/icons/TraceabilityIcon";

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
                className="inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
              >
                SCHEDULE DEMO
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

      <ValueHookSection />

      {/* Trust Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <p className="mb-8 text-sm uppercase tracking-[0.28em] text-text-tertiary">
            Trusted by leading organizations
          </p>
          <div className="flex flex-wrap items-center gap-12 opacity-60">
            <div className="relative h-16 w-auto">
              <Image
                src="/prieston-logo-full-white.svg"
                alt="Prieston"
                width={200}
                height={64}
                className="h-full w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="relative h-16 w-auto">
              <Image
                src="/PSM_LOGO_Med.png"
                alt="PSM"
                width={200}
                height={64}
                className="h-full w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Value Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Built for organizations where decisions carry real-world consequences
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <PrecisionIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Precision</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Maintain alignment between physical and digital worlds.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <IntegrationIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Integration</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Unify models, systems, and live operational signals.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <CollaborationIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Collaboration</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Coordinate stakeholders across control rooms and field devices.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <TraceabilityIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Traceability</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Every change traced to source data and reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Grid Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Solutions for your industry
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/industries/mobility"
              className="group flex flex-col rounded-[4px] border border-line-soft p-6 transition-colors duration-500 hover:border-white/[0.06] hover:bg-white/[0.02]"
            >
              <h3 className="text-lg font-light text-text-primary mb-4">Mobility & ITS</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary mb-4 flex-1">
                Optimize traffic flow, manage infrastructure, coordinate operations.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary mt-auto">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/cultural-heritage"
              className="group flex flex-col rounded-[4px] border border-line-soft p-6 transition-colors duration-500 hover:border-white/[0.06] hover:bg-white/[0.02]"
            >
              <h3 className="text-lg font-light text-text-primary mb-4">Cultural Heritage</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary mb-4 flex-1">
                Preserve sites while enabling access and interpretation.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary mt-auto">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/agriculture"
              className="group flex flex-col rounded-[4px] border border-line-soft p-6 transition-colors duration-500 hover:border-white/[0.06] hover:bg-white/[0.02]"
            >
              <h3 className="text-lg font-light text-text-primary mb-4">Agriculture & Land Management</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary mb-4 flex-1">
                Monitor crops, manage land, optimize operations.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary mt-auto">
                Learn more →
              </span>
            </Link>
            <Link
              href="/industries/urban-infrastructure"
              className="group flex flex-col rounded-[4px] border border-line-soft p-6 transition-colors duration-500 hover:border-white/[0.06] hover:bg-white/[0.02]"
            >
              <h3 className="text-lg font-light text-text-primary mb-4">Urban Infrastructure</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary mb-4 flex-1">
                Plan, build, and operate city infrastructure.
              </p>
              <span className="inline-block text-sm text-text-secondary transition-colors duration-500 group-hover:text-text-primary mt-auto">
                Learn more →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-40">
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
              className="inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
            >
              SCHEDULE DEMO
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
