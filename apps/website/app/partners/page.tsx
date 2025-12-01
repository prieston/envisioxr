import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners | Klorad",
  description:
    "PSM is the exclusive deployment partner for Mobility & ITS. Learn about Klorad's partnership approach and research collaborations.",
  openGraph: {
    title: "Partners | Klorad",
    description:
      "PSM is the exclusive deployment partner for Mobility & ITS.",
  },
  alternates: {
    canonical: "/partners",
  },
};

export default function PartnersPage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Partners
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Strategic partnerships for sector-specific deployment and expertise.
          </p>
        </div>
      </section>

      {/* PSM Partnership */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-8">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Mobility & ITS: Deployed with PSM
          </h2>
          <div className="space-y-6">
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-primary">
              PSM is the exclusive deployment and stewardship partner for the Mobility & ITS sector.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Their operational maturity and domain experience ensure that interventions, signaling logic, and field conditions are understood in their proper context. PSM brings deep expertise in traffic management, infrastructure operations, and ITS systems, enabling effective deployment of Klorad in mobility environments.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Together, Klorad and PSM deliver solutions that optimize traffic flow, coordinate maintenance, and improve operational efficiency across transportation networks.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Approach */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-8">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Partnership Approach
          </h2>
          <div className="space-y-6">
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Klorad does not pursue broad reseller networks. Partnerships are formed only where there is demonstrated responsibility for the environments involved, and a long-term commitment to their operational wellbeing.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Additional sector partners are selected with the same discipline: deep domain expertise, proven capacity to maintain continuity, and the ability to guide environments through change while preserving operational integrity.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-tertiary">
              Partnerships are deliberate, contextual, and designed for longevity.
            </p>
          </div>
        </div>
      </section>

      {/* Research Collaborations */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-8">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Research & Development
          </h2>
          <div className="space-y-6">
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Klorad is developed by Prieston Technologies, which maintains research collaborations and projects that demonstrate expertise across geospatial visualization, XR, and infrastructure operations.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Projects like MERGIN' MODE (cultural heritage XR), FIREFLY (inclusive XR visualization), and collaborations with institutions like IMET (mobility and transport research) are part of Prieston Technologies' ecosystem of geospatial and XR work.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              These research collaborations showcase capabilities in high-end visualization, immersive experiences, and geospatial computation that inform Klorad's development. They demonstrate our commitment to advancing the state of the art in geospatial platforms and XR applications.
            </p>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-tertiary">
              Note: MERGIN' MODE, FIREFLY, and IMET are research projects and collaborations by Prieston Technologies, not Klorad products or modules. They serve as credibility markers demonstrating our expertise in geospatial XR, heritage visualization, and mobility research.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Interested in partnership?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            We work with organizations that share our commitment to responsible deployment and long-term operational excellence.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </article>
  );
}
