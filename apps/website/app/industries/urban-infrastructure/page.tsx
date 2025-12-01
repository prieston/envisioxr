import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Urban Infrastructure | Klorad",
  description:
    "Plan, build, and operate city infrastructure with Klorad's geospatial platform. Coordinate multi-stakeholder projects, manage assets, and optimize operations.",
  openGraph: {
    title: "Urban Infrastructure | Klorad",
    description:
      "Plan, build, and operate city infrastructure with Klorad's geospatial platform.",
  },
  alternates: {
    canonical: "/industries/urban-infrastructure",
  },
};

export default function UrbanInfrastructurePage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Urban Infrastructure & Built Environment
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Plan, build, and operate city infrastructure with unified geospatial intelligence.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Urban infrastructure projects involve multiple stakeholders, complex coordination, and long-term operations. Klorad unifies planning data, construction progress, and operational systems into one platform, enabling effective coordination from design through operations.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
          >
            Schedule Demo
          </Link>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            The challenges you face
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Multi-Stakeholder Coordination</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinating contractors, owners, utilities, and supervising authorities requires sharing accurate, up-to-date information. Without unified visibility, stakeholders work from different data sources, leading to miscommunication and delays.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">As-Built Documentation</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Maintaining accurate records of what was actually built requires linking construction data, inspections, and design changes. Current systems don't integrate these sources effectively, making it difficult to track deviations and ensure compliance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Maintenance Planning</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Planning maintenance and upgrades requires understanding asset condition, usage patterns, and interdependencies. Without integrated data, operators can't optimize schedules or coordinate work effectively.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Compliance & Inspections</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Tracking compliance with regulations, codes, and standards requires maintaining detailed records linked to specific assets and locations. Current tools don't provide this spatial context effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Klorad Solves It */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How Klorad addresses Urban Infrastructure needs
          </h2>
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Unified Project View</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                See design intent, construction progress, and as-built conditions in one 3D view. All stakeholders work from the same accurate data, reducing miscommunication and enabling effective coordination.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Construction Lifecycle Management</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Track progress from early design through commissioning. Contractors, owners, and authorities see how the site evolves relative to specification, how temporary works affect logistics, and what must be resolved before hand-off.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Utility Mapping</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Map utility networks, infrastructure assets, and their relationships accurately. Understand how systems connect and interact, enabling effective planning and operations.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">City Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Plan infrastructure development by understanding existing conditions, constraints, and opportunities. Model scenarios to validate interventions before committing resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Real-world applications
          </h2>
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Construction Lifecycle Management</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Projects track progress from design through commissioning. Stakeholders see how the site evolves relative to specification, coordinate temporary works, and ensure hand-off requirements are met.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Utility Mapping</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Cities map utility networks and infrastructure assets accurately. Operators understand how systems connect, enabling effective planning, maintenance, and emergency response.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">City Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Planners analyze existing conditions and model infrastructure development scenarios. They validate interventions before committing resources, ensuring projects align with city goals and constraints.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Infrastructure Inspections</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Inspection teams document asset condition with spatial precision. They link findings to specific locations, track changes over time, and plan maintenance based on accurate, location-aware data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to transform your infrastructure operations?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a demo to see how Klorad can help you coordinate projects, manage assets, and optimize operations across the urban infrastructure lifecycle.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
          >
            Schedule Demo
          </Link>
        </div>
      </section>
    </article>
  );
}

