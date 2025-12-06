"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const industries = [
  { name: "Mobility & ITS", href: "/industries/mobility" },
  { name: "Cultural Heritage", href: "/industries/cultural-heritage" },
  { name: "Agriculture & Land Management", href: "/industries/agriculture" },
  { name: "Urban Infrastructure", href: "/industries/urban-infrastructure" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const industriesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeaderElement>(null);

  // Close dropdowns and mobile menu when clicking outside
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
        mobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    if (industriesOpen || mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [industriesOpen, mobileMenuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-line-soft bg-base-bg-alt/90 backdrop-blur-lg backdrop-saturate-150">
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <Link
            href="/platform"
            className={`transition-colors duration-500 hover:text-text-primary ${
              pathname === "/platform" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Platform
          </Link>
          <div ref={industriesRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndustriesOpen(!industriesOpen);
              }}
              className={`flex items-center gap-1 transition-colors duration-500 hover:text-text-primary ${
                pathname?.startsWith("/industries") ? "text-text-primary" : "text-text-secondary"
              }`}
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
              <div className="absolute left-0 top-full w-64 pt-2 z-[100]">
                <div className="rounded border border-line-soft bg-base-bg-alt p-4 shadow-lg">
                  <div className="flex flex-col gap-1">
                    {industries.map((industry) => (
                      <Link
                        key={industry.name}
                        href={industry.href}
                        onClick={() => {
                          // Close dropdown after a small delay to allow navigation
                          setTimeout(() => setIndustriesOpen(false), 100);
                        }}
                        className="rounded px-3 py-2 text-sm text-text-secondary transition-all duration-200 hover:bg-line-soft hover:text-text-primary"
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
            className={`transition-colors duration-500 hover:text-text-primary ${
              pathname === "/partners" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Partners
          </Link>
          <Link
            href="/samples"
            className={`transition-colors duration-500 hover:text-text-primary ${
              pathname === "/samples" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Showcase
          </Link>
          <Link
            href="/contact"
            className={`transition-colors duration-500 hover:text-text-primary ${
              pathname === "/contact" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className="ml-4 inline-flex items-center justify-center rounded-[4px] border border-[#158CA3] px-6 py-3 text-sm font-medium text-[#158CA3] transition hover:bg-[#158CA3] hover:text-white"
          >
            SCHEDULE DEMO
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <nav
          className={`fixed inset-0 top-[73px] md:hidden border-b border-line-soft bg-base-bg-alt backdrop-blur-md backdrop-saturate-150 min-h-screen transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="mx-auto max-w-container px-6 py-6 space-y-4 overflow-y-auto h-full">
              <Link
                href="/platform"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2 text-sm transition-all duration-300 hover:bg-line-soft hover:text-text-primary ${
                  pathname === "/platform" ? "text-text-primary" : "text-text-secondary"
                } ${
                  mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: mobileMenuOpen ? "0.1s" : "0s" }}
              >
                Platform
              </Link>

              <div className={`space-y-2 transition-all duration-300 ${
                mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`} style={{ transitionDelay: mobileMenuOpen ? "0.15s" : "0s" }}>
                <button
                  onClick={() => {
                    setIndustriesOpen(!industriesOpen);
                  }}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-all duration-200 hover:bg-line-soft hover:text-text-primary ${
                    pathname?.startsWith("/industries") ? "text-text-primary" : "text-text-secondary"
                  }`}
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
                  <div className="pl-4 space-y-2 border-l border-line-soft">
                    {industries.map((industry) => (
                      <Link
                        key={industry.name}
                        href={industry.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIndustriesOpen(false);
                        }}
                        className="block rounded px-3 py-2 text-sm text-text-secondary transition-all duration-200 hover:bg-line-soft hover:text-text-primary"
                      >
                        {industry.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/partners"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2 text-sm transition-all duration-300 hover:bg-line-soft hover:text-text-primary ${
                  pathname === "/partners" ? "text-text-primary" : "text-text-secondary"
                } ${
                  mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: mobileMenuOpen ? "0.2s" : "0s" }}
              >
                Partners
              </Link>

              <Link
                href="/samples"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2 text-sm transition-all duration-300 hover:bg-line-soft hover:text-text-primary ${
                  pathname === "/samples" ? "text-text-primary" : "text-text-secondary"
                } ${
                  mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: mobileMenuOpen ? "0.25s" : "0s" }}
              >
                Showcase
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2 text-sm transition-all duration-300 hover:bg-line-soft hover:text-text-primary ${
                  pathname === "/contact" ? "text-text-primary" : "text-text-secondary"
                } ${
                  mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: mobileMenuOpen ? "0.3s" : "0s" }}
              >
                Contact
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-center inline-flex items-center justify-center rounded-[4px] bg-[#158CA3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#126E83] ${
                  mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: mobileMenuOpen ? "0.35s" : "0s" }}
              >
                SCHEDULE DEMO
              </Link>
            </div>
          </nav>
      </div>
    </header>
  );
}
