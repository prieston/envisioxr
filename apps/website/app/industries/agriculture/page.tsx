import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agriculture & Land Management | Klorad",
  description:
    "Monitor crops, manage land, and optimize operations with Klorad's geospatial platform for Agriculture & Land Management. Integrate drone data, field analysis, and yield optimization.",
  openGraph: {
    title: "Agriculture & Land Management | Klorad",
    description:
      "Monitor crops, manage land, and optimize operations with Klorad's geospatial platform for Agriculture & Land Management.",
  },
  alternates: {
    canonical: "/industries/agriculture",
  },
};

export default function AgriculturePage() {
  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="space-y-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[48px] md:leading-[1.05]">
            Agriculture & Land Management
          </h1>
          <p className="max-w-[640px] text-xl font-light text-text-secondary">
            Monitor crops, manage land, and optimize operations with unified geospatial intelligence.
          </p>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Agriculture operations require precise monitoring of crops, soil conditions, and resource use across large areas. Klorad unifies drone imagery, sensor data, and field observations into one platform, enabling data-driven decisions that optimize yields and resource efficiency.
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
              <h3 className="text-lg font-light text-text-primary">Crop Monitoring at Scale</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Monitoring crop health and growth across large fields requires integrating drone imagery, satellite data, and ground observations. Without unified visibility, farmers can&apos;t identify issues early or optimize interventions.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Land Use Planning</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Planning crop rotations, field boundaries, and infrastructure placement requires understanding soil conditions, topography, and historical yields. Current tools don&apos;t integrate these data sources effectively.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Resource Optimization</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Optimizing irrigation, fertilizer application, and pest management requires precise field-level data. Without integrated analysis, resources are applied inefficiently, increasing costs and environmental impact.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Compliance Tracking</h3>
              <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Tracking compliance with regulations, certifications, and best practices requires maintaining detailed records linked to specific field locations. Current systems don&apos;t provide this spatial context effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Klorad Solves It */}
      <section className="border-t border-line-soft pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="space-y-12">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How Klorad addresses Agriculture & Land Management needs
          </h2>
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Unified Field Visualization</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Integrate drone imagery, satellite data, and sensor outputs into one 3D view. See crop health, soil conditions, and field boundaries together, enabling comprehensive field analysis.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Yield Analysis</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Track yield patterns over time and correlate them with management practices, weather conditions, and field characteristics. Identify factors that drive productivity and optimize operations accordingly.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Precision Resource Management</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Plan irrigation, fertilization, and pest management with field-level precision. Test scenarios before implementation to optimize resource use and minimize environmental impact.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Land Use Mapping</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Map field boundaries, infrastructure, and land use patterns accurately. Maintain historical records of crop rotations, management practices, and compliance activities linked to specific locations.
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
              <h3 className="text-lg font-light text-text-primary">Field Monitoring</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Farmers monitor crop health across large fields using integrated drone and satellite imagery. They can identify issues early, target interventions precisely, and track progress over time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Yield Analysis</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Operations analyze yield patterns to understand what drives productivity. They correlate management practices with outcomes, enabling data-driven decisions that optimize yields and profitability.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Irrigation Planning</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Irrigation systems are planned and optimized using field-level soil moisture data and crop requirements. Farmers test scenarios to ensure water is applied efficiently, reducing waste and costs.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-text-primary">Land Use Mapping</h3>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                Land managers maintain accurate maps of field boundaries, infrastructure, and land use patterns. They track crop rotations, management history, and compliance activities with spatial precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to optimize your agricultural operations?
          </h2>
          <p className="max-w-[640px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Schedule a demo to see how Klorad can help you monitor crops, manage land, and optimize yields with unified geospatial intelligence.
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

