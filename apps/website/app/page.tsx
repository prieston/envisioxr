import Link from "next/link";
import { AmbientField } from "@/components/ambient-field";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <AmbientField />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-16">
            <div className="space-y-4">
              <span
                className="text-xs uppercase tracking-[0.14em] text-text-tertiary font-[450]"
                style={{ opacity: 0.55 }}
              >
                Klorad
              </span>
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                A platform for spatial operations across real-world infrastructure.
              </h1>
              <p className="text-xl font-light text-text-secondary">
                Model. Observe. Simulate. Act.
              </p>
            </div>

            <p className="max-w-[620px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
              Klorad maintains a continuous alignment between the physical world
              and its digital representation. Models, systems, and live
              operational signals are unified within one spatial layer, so
              organizations can observe change, understand implications, and act
              with clarity.
            </p>

            <div>
              <Link
                href="/contact"
                className="inline-flex items-center border border-line-strong px-8 py-3.5 text-sm uppercase tracking-[0.3em] text-text-primary transition-colors duration-700 hover:border-text-secondary"
              >
                Request a briefing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-14 border-t border-line-soft pt-32 pb-28 md:pt-36 md:pb-32">
        <header className="space-y-5">
          <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
            A single integrated spatial layer.
          </h2>
          <p className="max-w-[540px] text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
            Every environment contains structures, systems, equipment, constraints, and live operational signals. Klorad unifies them into a single spatial layer, so organizations can understand how their infrastructure behaves, how it changes over time, and how interventions will propagate through the real world.
          </p>
        </header>
        <div className="flex flex-col items-stretch gap-9 text-base font-light text-text-secondary md:flex-row md:items-center md:gap-20">
          <span className="inline-flex rounded border border-white/15 px-5 py-3 text-sm uppercase tracking-[0.34em] text-text-tertiary/85 font-light opacity-90">
            Physical World
          </span>
          <span className="text-2xl text-text-tertiary md:py-12">→</span>
          <span className="inline-flex rounded border border-white/25 px-6 py-3 text-sm uppercase tracking-[0.34em] text-text-primary font-light">
            Klorad Spatial Layer
          </span>
          <span className="text-2xl text-text-tertiary md:py-12">→</span>
          <span className="inline-flex rounded border border-white/15 px-5 py-3 text-sm uppercase tracking-[0.34em] text-text-tertiary/85 font-light opacity-90">
            Decisions &amp; Actions
          </span>
        </div>
      </section>

      <section className="space-y-8 border-t border-line-soft pt-28 pb-32 md:pt-32 md:pb-36">
        <h2 className="text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
          The nature of real-world systems.
        </h2>
        <div className="max-w-[620px] space-y-6 text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
          <p>
            Complex environments behave differently than isolated components. When structures, infrastructure networks, equipment, terrain, planning rules, and live operational signals interact, their behavior cannot be understood in isolation.
          </p>
          <p>
            Klorad allows organizations to see their environments as systems — not as separate models, documents, and datasets.
          </p>
          <p>
            By observing how decisions propagate through real-world systems, organizations can coordinate stakeholders, validate interventions, and guide operations with clarity.
          </p>
        </div>
      </section>

      <section className="border-t border-line-soft py-16 md:py-20">
        <div className="mx-auto max-w-container px-6 md:px-8">
          <p className="text-sm uppercase tracking-[0.28em] text-text-tertiary">
            Klorad is used in environments where decisions carry real-world consequences.
          </p>
        </div>
      </section>
    </div>
  );
}

