import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "Klorad serves Roads & Mobility, Construction Lifecycle, and Cultural Heritage & Interpretation sectors. See how our spatial operations platform addresses sector-specific challenges.",
  openGraph: {
    title: "Sectors | Klorad",
    description:
      "Klorad serves Roads & Mobility, Construction Lifecycle, and Cultural Heritage & Interpretation sectors.",
  },
  alternates: {
    canonical: "/sectors",
  },
};

export default function SectorsPage() {
  return (
    <article className="space-y-0 text-[16.75px] leading-[1.6] tracking-[0.01em] text-text-secondary">
      <section className="space-y-6 pt-40 md:pt-48">
        <h2 className="text-[26px] font-light uppercase tracking-[0.18em] text-text-primary">
          Roads &amp; Mobility
        </h2>
        <p className="max-w-[620px]">
          Delivered with PSM, Klorad reveals the lived state of corridors, junctions, and signaling systems. Traffic flow, maintenance windows, sensor outputs, and policy overlays become visible as one continuous environment. Operators can anticipate how a decision will propagate through the mobility network before it is enacted.
        </p>
      </section>

      <section className="space-y-6 pt-48 md:pt-56">
        <h2 className="text-[26px] font-light uppercase tracking-[0.18em] text-text-primary">
          Construction Lifecycle
        </h2>
        <p className="max-w-[620px]">
          The platform holds intent from early design through commissioning. Contractors, owners, and supervising authorities see how the site is evolving relative to specification, how temporary works affect logistics, and what must be resolved before hand-off. Nothing is abstracted into slides; the environment itself is what becomes knowable.
        </p>
      </section>

      <section className="space-y-6 pt-48 md:pt-56">
        <h2 className="text-[26px] font-light uppercase tracking-[0.18em] text-text-primary">
          Cultural Heritage &amp; Interpretation
        </h2>
        <p className="max-w-[620px]">
          These environments require a disciplined balance between access and preservation. Klorad lets custodians examine the interplay between visitor movement, climate, and conservation thresholds so that every intervention respects the integrity of the site while keeping interpretation grounded in evidence.
        </p>
      </section>

      <div className="space-y-6 pt-56 pb-40">
        <p className="max-w-[440px] text-sm text-text-tertiary">
          Every environment is different. Conversations begin with context, not assumptions.
        </p>
        <Link
          href="/contact"
          className="inline-flex border border-line-strong px-7 py-3 text-sm tracking-[0.14em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
        >
          Discuss your environment
        </Link>
      </div>
    </article>
  );
}

