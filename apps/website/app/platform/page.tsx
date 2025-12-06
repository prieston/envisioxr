import Link from "next/link";
import type { Metadata } from "next";
import { GeometricHint } from "@/components/geometric-hint";
import { VisualizeIcon } from "@/components/icons/VisualizeIcon";
import { IntegrationIcon } from "@/components/icons/IntegrationIcon";
import { AnalyzeIcon } from "@/components/icons/AnalyzeIcon";
import { OperationalCoordinationIcon } from "@/components/icons/OperationalCoordinationIcon";

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
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <GeometricHint variant="radial-vignette" />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                Enterprise-Grade Geospatial Platform
              </h1>
              <p className="max-w-[640px] text-xl font-light text-text-secondary">
                Unify terrain, structures, equipment, and real-time operational signals into a single, high-fidelity environment.
              </p>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                Klorad provides a spatial engine designed for mission-critical infrastructure. Integrate complex data sources, visualize your environment with precision, analyze system behavior, and coordinate operations with complete confidence.
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
          </div>
        </div>
      </section>

      {/* The Klorad Engine */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <div className="mb-16">
            <h2 className="mb-4 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
              A Unified Engine for Real-World Infrastructure
            </h2>
            <p className="max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Klorad transforms fragmented geospatial, operational, and structural data into a coherent, always-aligned environment. Every model, every sensor, every signal becomes part of one operational picture.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <VisualizeIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Spatial Rendering</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Render terrain, corridors, tunnels, structures, and assets in high fidelity from photogrammetry, LiDAR, and CAD.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <IntegrationIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Real-Time Data Fusion</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Ingest and align live sensor feeds, ITS devices, IoT telemetry, SCADA data, and operational signals in real time.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <AnalyzeIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Simulation & Analysis</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Compare scenarios, evaluate interventions, and understand how conditions propagate across your infrastructure.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <div className="mb-3 text-text-secondary opacity-[0.3]">
                <OperationalCoordinationIcon className="w-8 h-8" />
              </div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Operational Coordination</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Bring control rooms and field teams into the same operational environment - synced, aligned, and always up-to-date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
              Built to Serve Complex, Data-Intensive Infrastructure
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">01</span>
                <h3 className="text-xl font-light text-text-primary">Real-Time 3D Visualization</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Render large-scale assets with millimeter accuracy. Switch between point clouds, meshes, CAD components, and live sensor overlays.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">02</span>
                <h3 className="text-xl font-light text-text-primary">Multi-Source Data Integration</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Unify photogrammetry, LiDAR, BIM/CAD, equipment inventories, IoT sensors, and ITS devices - all spatially aligned.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">03</span>
                <h3 className="text-xl font-light text-text-primary">Field & Mobile Access</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Enable field personnel to record observations, view models, and receive operational updates in real time.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">04</span>
                <h3 className="text-xl font-light text-text-primary">Control Room Tools</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Provide operators with synchronized dashboards, incident views, and infrastructure-wide situational awareness.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">05</span>
                <h3 className="text-xl font-light text-text-primary">Simulation & Scenario Evaluation</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Test interventions before deployment. Understand how changes propagate through infrastructure and operational systems.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">06</span>
                <h3 className="text-xl font-light text-text-primary">Change Tracking & Traceability</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Track every modification, source, and reasoning step. Maintain a complete audit trail across teams and time.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">07</span>
                <h3 className="text-xl font-light text-text-primary">Collaboration Across Roles</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Break silos between engineers, operators, supervisors, and field teams - all working from a shared ground-truth model.
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-light tracking-[0.2em] text-text-tertiary">08</span>
                <h3 className="text-xl font-light text-text-primary">Extensible API & Integrations</h3>
              </div>
              <p className="ml-8 text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Integrate Klorad with SCADA, asset management systems, IoT gateways, traffic systems, and enterprise tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            How Klorad Fits Into Your Operational Ecosystem
          </h2>
          <p className="mb-12 max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Klorad acts as the spatial and operational backbone of your infrastructure:
          </p>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <div className="flex-1">
                <div className="mb-2 text-sm font-light uppercase tracking-[0.2em] text-text-tertiary">Sensors & Devices</div>
                <div className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                  → Data Processing
                </div>
              </div>
              <div className="hidden md:block text-text-tertiary">→</div>
              <div className="flex-1">
                <div className="mb-2 text-sm font-light uppercase tracking-[0.2em] text-text-tertiary">Klorad Engine</div>
                <div className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
                  → Control Rooms & Field Teams
                </div>
              </div>
            </div>
            <div className="grid gap-8 pt-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                  Automatically align raw data into a unified spatial frame
                </p>
              </div>
              <div>
                <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                  Deliver real-time operational context to every team
                </p>
              </div>
              <div>
                <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                  Maintain consistency between physical and digital environments
                </p>
              </div>
              <div>
                <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                  Ensure every decision is backed by accurate, reality-aligned data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Enterprises Choose Klorad */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Why Enterprises Choose Klorad
          </h2>
          <p className="mb-12 max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Engineered for Mission-Critical Environments
          </p>
          <p className="mb-12 max-w-3xl text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Infrastructure operators choose Klorad because operational mistakes have real-world consequences.
          </p>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Precision</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Maintain alignment between physical assets and digital representations - continuously.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Operational Reliability</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Built to support control rooms, emergency response teams, and 24/7 operations.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Interdisciplinary Collaboration</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Unify engineers, operators, analysts, and field technicians in one platform.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Full Traceability</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Every signal, modification, and decision is linked to its source.
              </p>
            </div>
            <div className="md:border-l md:border-line-soft/30 md:pl-8">
              <h3 className="pt-1 pb-1.5 text-2xl font-light text-text-primary">Scalable by Design</h3>
              <p className="text-[17px] font-light leading-[1.5] tracking-[0.01em] text-text-secondary">
                Handle large-scale assets: highways, tunnels, ports, pipelines, industrial facilities, and sprawling infrastructure networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pt-36 pb-32 md:pt-44 md:pb-40">
        <div className="mx-auto max-w-container px-6 md:px-8 text-center">
          <h2 className="mb-6 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            Ready to see the Klorad platform in action?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Experience how Klorad transforms visibility, understanding, and operational coordination across your infrastructure.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
