import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform | Klorad",
  description:
    "Klorad is an enterprise-grade geospatial platform that unifies infrastructure data into one integrated view. Visualize, analyze, and operate with precision.",
  openGraph: {
    title: "Platform | Klorad",
    description:
      "Enterprise-grade geospatial platform that unifies infrastructure data into one integrated view.",
  },
  alternates: {
    canonical: "/platform",
  },
};

export default function PlatformPage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Enterprise-Grade Geospatial Platform
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Unify terrain, structures, equipment, and live operational data into one platform.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Klorad integrates models, systems, and live operational signals into a unified geospatial platform. See how your infrastructure behaves, analyze changes over time, and coordinate operations with confidence.
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

      {/* Platform Pillars */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Visualize. Understand. Act.
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Visualize</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                See your infrastructure in real-time 3D. Integrate photogrammetry, LiDAR, CAD models, and sensor data into one unified view. Every asset, every system, every operational signal becomes visible in context.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Understand</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Analyze how systems interact and change over time. Simulate interventions before deployment. Maintain alignment between physical infrastructure and its digital representation.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-light text-text-primary">Act</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate operations across teams and locations. Make decisions grounded in accurate, reality-aligned data. Deploy changes with confidence, knowing how they will propagate through your infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Key Capabilities
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Real-Time 3D Visualization</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Render infrastructure in high-fidelity 3D with real-time updates. Integrate multiple data sources—drones, sensors, CAD files—into one coherent view.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Multi-Source Data Integration</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Unify terrain models, structural data, equipment inventories, and live sensor feeds. All data sources align spatially, enabling comprehensive analysis.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Collaborative Workflows</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate teams across control rooms and field devices. Share a common operational picture that updates in real-time, ensuring everyone works from accurate data.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Mobile and Field Access</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Access platform capabilities from mobile devices and tablets. Field teams can view models, record observations, and coordinate with control rooms in real-time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">API and Integrations</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Integrate Klorad with existing systems through APIs. Connect to SCADA, asset management, and planning tools to create unified workflows.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Change Tracking</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Track every change with full traceability. Every modification links to source data and reasoning, maintaining an audit trail for compliance and analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Value */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Built for organizations where decisions carry real-world consequences
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Precision</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Maintain alignment between physical and digital worlds with accurate, reality-aligned models.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Integration</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Unify models, systems, and live operational signals into one platform.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Collaboration</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate stakeholders across control rooms and field devices with shared situational awareness.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Traceability</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Every change traced to source data and reasoning, maintaining full audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to see the platform in action?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a demo to explore how Klorad can transform your infrastructure operations.
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
