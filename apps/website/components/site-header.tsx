"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const industries = [
  { name: "Mobility & ITS", href: "/industries/mobility" },
  { name: "Cultural Heritage", href: "/industries/cultural-heritage" },
  { name: "Agriculture & Land Management", href: "/industries/agriculture" },
  { name: "Urban Infrastructure", href: "/industries/urban-infrastructure" },
] as const;

export function SiteHeader() {
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const industriesRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Don't close if clicking on a link (let navigation happen)
      if ((target as HTMLElement).tagName === "A") {
        return;
      }
      if (
        industriesOpen &&
        industriesRef.current &&
        !industriesRef.current.contains(target)
      ) {
        setIndustriesOpen(false);
      }
      if (
        resourcesOpen &&
        resourcesRef.current &&
        !resourcesRef.current.contains(target)
      ) {
        setResourcesOpen(false);
      }
    }

    if (industriesOpen || resourcesOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [industriesOpen, resourcesOpen]);

  return (
    <header className="border-b border-line-soft bg-base-bg-alt/90 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-text-tertiary"
        >
          <Image
            src="/klorad-logo.png"
            alt="Klorad mark"
            width={24}
            height={24}
            className="h-6 w-6"
            priority
          />
          <span>Klorad</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-text-secondary">
          <Link
            href="/platform"
            className="transition-colors duration-500 hover:text-text-primary"
          >
            Platform
          </Link>
          <div ref={industriesRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndustriesOpen(!industriesOpen);
                setResourcesOpen(false);
              }}
              className="flex items-center gap-1 transition-colors duration-500 hover:text-text-primary"
            >
              Industries
              <span
                className={`inline-block transition-transform duration-200 ${
                  industriesOpen ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>
            {industriesOpen && (
              <div className="absolute left-0 top-full w-64 pt-2 z-50">
                <div className="rounded border border-line-soft bg-base-bg-alt p-4 shadow-lg">
                  <div className="flex flex-col gap-2">
                    {industries.map((industry) => (
                      <Link
                        key={industry.name}
                        href={industry.href}
                        onClick={() => {
                          // Close dropdown after a small delay to allow navigation
                          setTimeout(() => setIndustriesOpen(false), 100);
                        }}
                        className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
                      >
                        {industry.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            href="/partners"
            className="transition-colors duration-500 hover:text-text-primary"
          >
            Partners
          </Link>
          <div ref={resourcesRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setResourcesOpen(!resourcesOpen);
                setIndustriesOpen(false);
              }}
              className="flex items-center gap-1 transition-colors duration-500 hover:text-text-primary"
            >
              Resources
              <span
                className={`inline-block transition-transform duration-200 ${
                  resourcesOpen ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>
            {resourcesOpen && (
              <div className="absolute left-0 top-full w-48 pt-2 z-50">
                <div className="rounded border border-line-soft bg-base-bg-alt p-4 shadow-lg">
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/journal"
                      onClick={() => {
                        // Close dropdown after a small delay to allow navigation
                        setTimeout(() => setResourcesOpen(false), 100);
                      }}
                      className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
                    >
                      Journal
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            href="/contact"
            className="transition-colors duration-500 hover:text-text-primary"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className="ml-4 border border-line-strong px-6 py-2 text-sm uppercase tracking-[0.2em] text-text-primary transition-colors duration-500 hover:border-text-secondary"
          >
            Schedule Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
