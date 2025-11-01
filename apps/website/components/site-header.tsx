import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Platform", href: "/platform" },
  { name: "Sectors", href: "/sectors" },
  { name: "Partners", href: "/partners" },
  { name: "Journal", href: "/journal" },
  { name: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line-soft bg-base-bg-alt/90 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.4em] text-text-tertiary"
        >
          Klorad
        </Link>
        <nav className="flex items-center gap-6 text-sm text-text-secondary">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition-colors duration-500 hover:text-text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

