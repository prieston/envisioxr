import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJournalPost, journalPosts } from "@/lib/journalPosts";

type JournalEntryPageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return journalPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: JournalEntryPageProps): Promise<Metadata> {
  const post = getJournalPost(params.slug);

  if (!post) {
    return {
      title: "Journal",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com";

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `${siteUrl}/journal/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/journal/${params.slug}`,
    },
  };
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const post = getJournalPost(params.slug);

  if (!post) {
    notFound();
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(post.date));

  return (
    <article className="mx-auto max-w-[720px] space-y-12 pt-52 pb-36">
      <header className="space-y-6">
        <div className="text-xs uppercase tracking-[0.24em] text-text-tertiary">
          {dateLabel}
        </div>
        <h1 className="text-[40px] font-light leading-[1.08] text-text-primary md:text-[44px]">
          {post.title}
        </h1>
        <p className="text-[17px] leading-[1.6] tracking-[0.01em] text-text-secondary">
          {post.excerpt}
        </p>
      </header>

      <div className="space-y-6 text-[17px] leading-[1.62] tracking-[0.01em] text-text-secondary">
        {post.body.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="border-t border-line-soft pt-8 text-xs uppercase tracking-[0.28em] text-text-tertiary">
        Klorad Journal
        <br />
        Field observations and architectural reasoning.
      </footer>
    </article>
  );
}

