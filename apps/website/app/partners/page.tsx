import Link from "next/link";
import type { Metadata } from "next";
import { GeometricHint } from "@/components/geometric-hint";

export const metadata: Metadata = {
  title: "Partners | Klorad",
  description:
    "Strategic partnerships for organisations that bring real expertise and deliver real impact. Collaborate with Klorad to extend geospatial digital-twin solutions.",
  openGraph: {
    title: "Partners | Klorad",
    description:
      "Strategic partnerships for organisations that bring real expertise and deliver real impact.",
  },
  alternates: {
    canonical: "/partners",
  },
};

export default function PartnersPage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <GeometricHint variant="radial-vignette" />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                Partners
              </h1>
              <p className="max-w-[640px] text-xl font-light text-text-secondary">
                Strategic partnerships for organisations that bring real expertise and deliver real impact.
              </p>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                Klorad collaborates with engineering firms, domain specialists, system integrators, and consultancies that operate in complex, high-stakes environments. Our partners extend Klorad into sectors where spatial accuracy, operational coordination, and real-world decision-making truly matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partners Work With Klorad */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-16 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Why Partners Work With Klorad
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                A powerful platform, built to amplify your expertise
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Klorad gives partners the technical foundation to deliver geospatial digital-twin solutions without having to build or maintain complex engines, data pipelines, or visualization stacks. You bring industry knowledge - we provide the infrastructure that makes large-scale deployments possible.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                Designed for real projects, not experiments
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Partners leverage Klorad to win and deliver substantial projects - infrastructure, mobility, urban systems, heritage, land management, and critical operations. Whether the goal is planning, analysis, monitoring, simulation, or stakeholder coordination, Klorad becomes the backbone of the solution.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                You own the services. We power the platform.
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Consulting, engineering work, integrations, photogrammetry pipelines, onboarding, and domain-specific methodologies remain entirely in your hands. Klorad accelerates your delivery capability while keeping your service value at the center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Partner */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How We Partner
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                We collaborate only where domain expertise matters
              </h3>
              <p className="mb-6 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Klorad partners are selected with discipline. We work with organisations that deeply understand the environments where they operate and can guide deployments responsibly, accurately, and with long-term commitment.
              </p>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Our partners typically bring one or more of the following:
              </p>
              <ul className="mt-4 space-y-2 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                <li>• Proven industry authority (mobility, infrastructure, heritage, agritech, planning, engineering)</li>
                <li>• Operational experience with real-world systems and processes</li>
                <li>• Ability to deliver high-quality solutions to enterprise and public-sector clients</li>
                <li>• Teams capable of coordinating stakeholders, requirements, and delivery timelines</li>
              </ul>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                A unified platform - one powerful product, many applications
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Partners do not need to create sector variations or fragmented stacks. Everything is delivered through the single unified Klorad Platform - stable, evolving, and maintained by Prieston Technologies.
              </p>
              <p className="mt-4 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Your focus stays on solutions, deployments, and client success.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">
                Technical collaboration where it counts
              </h3>
              <p className="mb-4 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Partners receive access to documented APIs, approved integration endpoints, and technical guidance for building external systems and workflows on top of Klorad.
              </p>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                This enables you to combine:
              </p>
              <ul className="mt-4 space-y-2 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                <li>• Your industry-specific tools</li>
                <li>• Your data sources and pipelines</li>
                <li>• Your methodologies</li>
                <li>• Your operational knowledge</li>
              </ul>
              <p className="mt-4 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                …into cohesive, large-scale digital-twin solutions running on a modern geospatial engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where Partners Succeed With Klorad */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-4 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Where Partners Succeed With Klorad
          </h2>
          <p className="mb-16 max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Klorad is used in environments where decisions carry real-world consequences - where accuracy isn&apos;t optional and where operational clarity matters.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-3 pt-1 pb-1.5 text-xl font-light text-text-primary">
                Infrastructure & Urban Systems
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Digital twins of roads, tunnels, cities, utilities, public works, and maintenance operations.
              </p>
            </div>
            <div>
              <h3 className="mb-3 pt-1 pb-1.5 text-xl font-light text-text-primary">
                Mobility & ITS
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Visualizing traffic systems, monitoring operational signals, coordinating interventions, and planning scenarios.
              </p>
            </div>
            <div>
              <h3 className="mb-3 pt-1 pb-1.5 text-xl font-light text-text-primary">
                Cultural Heritage & Digital Interpretation
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                High-fidelity 3D environments for preservation, education, and immersive engagement.
              </p>
            </div>
            <div>
              <h3 className="mb-3 pt-1 pb-1.5 text-xl font-light text-text-primary">
                Agriculture & Land Management
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Monitoring, measuring, and understanding land assets, crops, and environmental conditions.
              </p>
            </div>
            <div>
              <h3 className="mb-3 pt-1 pb-1.5 text-xl font-light text-text-primary">
                Engineering & Planning
              </h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                3D conditions, construction workflows, integration of photogrammetry, CAD, LiDAR, and simulation.
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Klorad adapts to any domain where space, time, and decision-making intersect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Who We&apos;re Looking For
          </h2>
          <p className="mb-8 max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            We collaborate with organisations that:
          </p>
          <ul className="mb-8 max-w-3xl space-y-3 text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            <li>• Want to win large-scale, high-impact projects</li>
            <li>• Bring deep sector expertise</li>
            <li>• Can deliver strategic implementations</li>
            <li>• Require a stable, enterprise-grade engine</li>
            <li>• Value long-term collaboration</li>
            <li>• Operate with professionalism and technical discipline</li>
          </ul>
          <p className="max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            If your team sees opportunities where Klorad can become the backbone of solutions you already deliver - we want to speak with you.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-40">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
              Interested in partnership?
            </h2>
            <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Let&apos;s explore how we can support your upcoming projects and long-term strategy.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
