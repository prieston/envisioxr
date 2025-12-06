import Link from "next/link";
import { journalPosts } from "@/lib/journalPosts";
import { GeometricHint } from "@/components/geometric-hint";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes from the work of building and deploying Klorad across complex environments. Field observations and architectural reasoning.",
  openGraph: {
    title: "Journal | Klorad",
    description:
      "Notes from the work of building and deploying Klorad across complex environments.",
  },
  alternates: {
    canonical: "/journal",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

export default function JournalIndexPage() {
  const posts = [...journalPosts].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  return (
    <article className="space-y-0">
      {/* Hero Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden mt-[-6rem] pb-28 md:mt-[-8rem]">
        <GeometricHint variant="radial-vignette" />
        <div className="relative mx-auto max-w-container px-6 pt-28 md:px-8 md:pt-32">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-text-primary md:text-[54px] md:leading-[1.05]">
                Journal
              </h1>
              <p className="max-w-[640px] text-xl font-light text-text-secondary">
                Notes from the work of building and deploying Klorad across complex environments.
              </p>
              <p className="max-w-[640px] text-[17px] font-light leading-[1.55] text-text-secondary tracking-[0.01em]">
                Field observations and architectural reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journal Posts Section */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#090D12] pt-36 pb-32 md:pt-44 md:pb-36">
        <div className="relative mx-auto max-w-container px-6 md:px-8">
          <div className="space-y-10">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="space-y-4 border-b border-line-soft pb-8"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
                  {dateFormatter.format(new Date(post.date))}
                </div>
                <h2 className="text-3xl font-light text-text-primary">
                  <Link
                    href={`/journal/${post.slug}`}
                    className="transition-colors duration-500 hover:text-text-primary/80"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="max-w-2xl text-lg leading-[1.55] text-text-secondary">
                  {post.excerpt}
                </p>
                <div>
                  <Link
                    href={`/journal/${post.slug}`}
                    className="text-sm text-text-secondary underline underline-offset-4 transition-colors duration-500 hover:text-text-primary"
                  >
                    Read
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

