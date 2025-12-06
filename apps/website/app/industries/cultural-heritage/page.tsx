import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cultural Heritage | Klorad",
  description:
    "Preserve cultural heritage sites while enabling access and interpretation with Klorad's geospatial platform. Monitor visitor flow, climate impacts, and conservation thresholds.",
  openGraph: {
    title: "Cultural Heritage | Klorad",
    description:
      "Preserve cultural heritage sites while enabling access and interpretation with Klorad's geospatial platform.",
  },
  alternates: {
    canonical: "/industries/cultural-heritage",
  },
};

export default function CulturalHeritagePage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Cultural Heritage & Interpretation
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Preserve sites while enabling access and interpretation with precision monitoring and analysis.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Cultural heritage environments require a disciplined balance between access and preservation. Klorad lets custodians examine the interplay between visitor movement, climate, and conservation thresholds so that every intervention respects the integrity of the site while keeping interpretation grounded in evidence.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
          >
            SCHEDULE DEMO
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
              <h3 className="text-lg font-light text-text-primary">Preservation vs. Access Balance</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Managing visitor access while protecting fragile structures requires understanding how foot traffic, humidity, and temperature interact. Without integrated monitoring, custodians can&apos;t make informed decisions about capacity limits or access restrictions.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Climate Impact Monitoring</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Tracking how environmental conditions affect preservation requires correlating sensor data with site conditions over time. Current systems don&apos;t show these relationships clearly, making it difficult to identify trends or plan interventions.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Visitor Management</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Optimizing visitor flow to prevent overcrowding while maximizing access requires real-time awareness of occupancy patterns. Without unified visibility, custodians can&apos;t coordinate entry, routing, or capacity management effectively.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Documentation & Interpretation</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Creating accurate documentation and evidence-based interpretation requires maintaining precise 3D models and linking them to historical records, conservation reports, and research findings. Current tools don&apos;t integrate these data sources effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Klorad Solves It */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How Klorad addresses Cultural Heritage needs
          </h2>
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Precise Site Monitoring</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Monitor environmental conditions, visitor movement, and structural changes in real-time 3D. See how climate sensors, occupancy data, and conservation metrics interact across the entire site.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Visitor Flow Analysis</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Analyze how visitors move through spaces and identify patterns that impact preservation. Test capacity limits and routing changes before implementation to ensure they protect sensitive areas while maintaining access.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Conservation Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Plan conservation interventions by understanding how environmental factors, visitor patterns, and structural conditions interact. Model scenarios to validate approaches before committing resources.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Virtual Interpretation</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Create immersive virtual experiences that ground interpretation in accurate 3D models and historical data. Link visualizations to research findings, conservation reports, and archival materials for evidence-based storytelling.
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
              <h3 className="text-lg font-light text-text-primary">Site Monitoring</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Custodians monitor environmental conditions and visitor patterns in real-time. They can see how humidity, temperature, and foot traffic correlate with structural changes, enabling proactive conservation decisions.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Visitor Flow Analysis</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Heritage sites optimize visitor routing and capacity management by analyzing movement patterns. They can test alternative routes and entry strategies to protect sensitive areas while maintaining public access.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Conservation Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Conservation teams plan interventions by modeling how environmental changes, visitor impacts, and structural conditions interact. They validate approaches before implementation, ensuring resources are used effectively.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Virtual Interpretation</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Institutions create immersive virtual experiences that link accurate 3D reconstructions to historical research and conservation data. Visitors explore sites digitally while learning from evidence-based interpretation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Research & Development
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Klorad is developed by Prieston Technologies, which has extensive experience in geospatial XR and digital heritage work. Projects like MERGIN&apos; MODE and FIREFLY demonstrate our capability in creating immersive heritage experiences and high-end visualization systems.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            These research collaborations are part of Prieston Technologies&apos; ecosystem of geospatial and XR work, showcasing our expertise in combining precise 3D modeling with interactive interpretation.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to preserve and interpret your heritage site?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a demo to see how Klorad can help you balance preservation with access and create evidence-based interpretation experiences.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
          >
            SCHEDULE DEMO
          </Link>
        </div>
      </section>
    </article>
  );
}

