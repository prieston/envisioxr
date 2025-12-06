"use client";

import { useEffect, useRef, useState } from "react";
import { VisualizeIcon } from "@/components/icons/VisualizeIcon";
import { AnalyzeIcon } from "@/components/icons/AnalyzeIcon";
import { OperateIcon } from "@/components/icons/OperateIcon";

export function ValueHookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="border-t border-line-soft/55 pt-28 pb-28 md:pt-32 md:pb-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="mb-16 text-3xl font-light tracking-[0.04em] text-text-primary md:text-[36px] md:leading-[1.15]">
          See everything. Understand anything. Act instantly.
        </h2>

        {/* Connecting visual element */}
        <div className="relative mb-16 hidden md:block">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-line-soft/30 to-transparent" />
          <div className="relative flex justify-between">
            <div className="h-2 w-2 rounded-full bg-line-soft/40" />
            <div className="h-2 w-2 rounded-full bg-line-soft/40" />
            <div className="h-2 w-2 rounded-full bg-line-soft/40" />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div
            className={`space-y-4 transition-all duration-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: isVisible ? "0.1s" : "0s" }}
          >
            <div className="mb-4 text-text-secondary opacity-50 transition-opacity duration-300 hover:opacity-60">
              <VisualizeIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-light text-text-primary">Visualize</h3>
            <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Real-time 3D models from photogrammetry, LiDAR, and CAD integrate into a unified view of all infrastructure assets with live sensor data integration.
            </p>
          </div>
          <div
            className={`space-y-4 transition-all duration-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: isVisible ? "0.2s" : "0s" }}
          >
            <div className="mb-4 text-text-secondary opacity-50 transition-opacity duration-300 hover:opacity-60">
              <AnalyzeIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-light text-text-primary">Analyze</h3>
            <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Run simulations, compare scenarios, and track changes over time to understand how systems behave and anticipate outcomes.
            </p>
          </div>
          <div
            className={`space-y-4 transition-all duration-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: isVisible ? "0.3s" : "0s" }}
          >
            <div className="mb-4 text-text-secondary opacity-50 transition-opacity duration-300 hover:opacity-60">
              <OperateIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-light text-text-primary">Operate</h3>
            <p className="text-[17px] font-light leading-[1.6] tracking-[0.01em] text-text-secondary">
              Coordinate teams across control rooms and field devices. Make decisions grounded in accurate, reality-aligned data and execute changes with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

