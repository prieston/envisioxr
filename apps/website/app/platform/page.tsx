import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Klorad is structured as a spatial operations stack with the Spatial Layer, Klorad Engine, Klorad Studio, and Klorad Viewer. Learn about our architecture and components.",
  openGraph: {
    title: "Platform | Klorad",
    description:
      "Klorad is structured as a spatial operations stack with the Spatial Layer, Klorad Engine, Klorad Studio, and Klorad Viewer.",
  },
  alternates: {
    canonical: "/platform",
  },
};

export default function PlatformPage() {
  return (
    <article className="space-y-10 text-[17px] leading-[1.6] tracking-[0.01em] text-text-secondary">
      <p>
        Klorad is structured as a spatial operations stack.
      </p>
      <p>
        At its foundation is the Spatial Layer, which maintains alignment between the physical world and its digital representation. Structures, terrain, equipment, planning rules, and live operational signals are unified into one model that expresses how an environment behaves over time.
      </p>
      <p>
        Beneath the Spatial Layer sits the Klorad Engine — the real-time spatial computation system that resolves how interventions, constraints, and signals interact. The engine is deterministic, aware of physical and regulatory boundaries, and designed to keep organizations operating with architectural clarity.
      </p>
      <p>
        Klorad Studio is the authoring environment for this spatial model. Infrastructure, policy, and operational relationships are described with the precision expected of long-lived assets. Provenance remains intact: every change can be traced to the data and reasoning that informed it.
      </p>
      <p>
        Klorad Viewer is the operational and collaborative surface. Teams use it to observe evolving conditions, coordinate actions, and maintain a shared situational picture across control rooms and field devices. Decisions remain grounded in the spatial truth authored upstream.
      </p>
    </article>
  );
}

