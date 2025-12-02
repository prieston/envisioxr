import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line-soft bg-base-bg-alt">
      <div className="mx-auto max-w-container px-6 py-12 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-text-tertiary">Product</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/platform"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Platform
              </Link>
            </nav>
          </div>

          {/* Industries */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-text-tertiary">Industries</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/industries/mobility"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Mobility & ITS
              </Link>
              <Link
                href="/industries/cultural-heritage"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Cultural Heritage
              </Link>
              <Link
                href="/industries/agriculture"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Agriculture & Land Management
              </Link>
              <Link
                href="/industries/urban-infrastructure"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Urban Infrastructure
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-text-tertiary">Company</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/partners"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Partners
              </Link>
            </nav>
            <p className="mt-6 text-sm text-text-tertiary">
              Klorad is developed and operated by Prieston Technologies.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-text-tertiary">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/journal"
                className="text-sm text-text-secondary transition-colors duration-500 hover:text-text-primary"
              >
                Journal
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-line-soft pt-8 text-sm text-text-tertiary md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <Link
              href="/contact"
              className="transition-colors duration-500 hover:text-text-secondary"
            >
              Schedule Demo
            </Link>
            <Link
              href="/contact"
              className="transition-colors duration-500 hover:text-text-secondary"
            >
              Contact Sales
            </Link>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <span>Athens — Thessaloniki — Remote</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
