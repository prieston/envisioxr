import Link from "next/link";
import type { Metadata } from "next";
import { GeometricHint } from "@/components/geometric-hint";
import { SamplesGrid } from "@/components/samples-grid";
import { getSampleWorlds } from "@/lib/samples";

export const metadata: Metadata = {
  title: "Showcase | Klorad",
  description:
    "Explore published worlds and samples built with Klorad's geospatial platform. See real-world applications of infrastructure visualization and operational coordination.",
  openGraph: {
    title: "Showcase | Klorad",
    description:
      "Explore published worlds and samples built with Klorad's geospatial platform.",
  },
  alternates: {
    canonical: "/samples",
  },
};

export default async function SamplesPage() {
  const sampleWorlds = await getSampleWorlds();

  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <GeometricHint variant="radial-vignette" />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                Showcase
              </h1>
              <p className="max-w-[640px] text-xl font-light text-text-secondary">
                Explore published worlds built with Klorad.
              </p>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                See real-world applications of our geospatial platform across infrastructure, mobility, heritage, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Samples Grid Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          {sampleWorlds.length > 0 ? (
            <SamplesGrid worlds={sampleWorlds} />
          ) : (
            <div className="py-24 text-center">
              <p className="text-lg font-light text-text-secondary">
                No samples available yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Schedule Demo Section */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-40">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
              Ready to see Klorad in action?
            </h2>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Schedule a demo to explore how Klorad can transform your infrastructure operations.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
            >
              SCHEDULE DEMO
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

