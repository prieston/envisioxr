import Image from "next/image";
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

