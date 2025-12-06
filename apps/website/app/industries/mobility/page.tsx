import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobility & ITS | Klorad",
  description:
    "Optimize traffic flow, manage infrastructure, and coordinate operations with Klorad's geospatial platform for Mobility & ITS. Deployed with PSM.",
  openGraph: {
    title: "Mobility & ITS | Klorad",
    description:
      "Optimize traffic flow, manage infrastructure, and coordinate operations with Klorad's geospatial platform for Mobility & ITS.",
  },
  alternates: {
    canonical: "/industries/mobility",
  },
};

export default function MobilityPage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Mobility & ITS
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Optimize traffic flow, manage infrastructure, and coordinate operations with a unified geospatial platform.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Klorad reveals the lived state of corridors, junctions, and signaling systems. Traffic flow, maintenance windows, sensor outputs, and policy overlays become visible as one continuous environment.
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
              <h3 className="text-lg font-light text-text-primary">Traffic Congestion</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Managing traffic flow across complex networks requires real-time visibility into how vehicles, signals, and infrastructure interact. Without unified data, operators can&apos;t anticipate bottlenecks or coordinate responses effectively.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Maintenance Coordination</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Scheduling maintenance windows while minimizing disruption requires understanding how work affects traffic patterns, emergency routes, and adjacent infrastructure. Current tools don&apos;t show these relationships clearly.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Signal Optimization</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Optimizing signal timing across corridors requires seeing how changes propagate through the network. Operators need to test scenarios before deployment, but existing systems don&apos;t provide this capability.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Emergency Response</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinating emergency responses requires real-time awareness of traffic conditions, available routes, and infrastructure status. Delays in accessing this information can impact response times and public safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Klorad Solves It */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How Klorad addresses Mobility & ITS needs
          </h2>
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Real-Time Traffic Visualization</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                See traffic flow, signal states, and sensor outputs in real-time 3D. Corridors, junctions, and entire networks become visible as unified environments, not separate data feeds.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Scenario Simulation</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Test signal timing changes, lane closures, and maintenance windows before deployment. Understand how interventions will propagate through the network and impact traffic flow.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Multi-Stakeholder Coordination</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Coordinate operations across control rooms and field teams. Share a common operational picture that updates in real-time, ensuring everyone works from the same accurate data.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Policy Overlay Integration</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Integrate planning rules, regulations, and policy constraints directly into the operational view. Ensure decisions respect regulatory boundaries and operational requirements.
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
              <h3 className="text-lg font-light text-text-primary">Traffic Flow Optimization</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Operators use Klorad to visualize traffic patterns across entire corridors, identify bottlenecks, and test signal timing adjustments. Changes are simulated before deployment, reducing trial-and-error and improving traffic flow.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Infrastructure Maintenance Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Maintenance teams coordinate work windows by seeing how lane closures and detours affect traffic patterns. They can optimize schedules to minimize disruption while ensuring work completes on time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Incident Management</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Emergency responders access real-time traffic conditions and available routes. Control room operators coordinate signal changes to clear paths for emergency vehicles, improving response times.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Corridor Analysis</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Planners analyze how infrastructure changes, new developments, or policy shifts will impact traffic patterns. They can model scenarios and validate interventions before committing resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Deployed with PSM
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            PSM is our exclusive deployment and stewardship partner for the Mobility & ITS sector. Their operational maturity and domain experience ensure that interventions, signaling logic, and field conditions are understood in their proper context.
          </p>
          <Link
            href="/partners"
            className="inline-block text-sm text-text-secondary underline underline-offset-4 transition-colors duration-500 hover:text-text-primary"
          >
            Learn more about our partnership →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to optimize your mobility operations?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a demo to see how Klorad can transform your traffic management and infrastructure operations.
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

