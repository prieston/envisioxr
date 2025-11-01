import Link from "next/link";
import { journalPosts } from "@/lib/journalPosts";

export const metadata = {
  title: "Journal",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

export default function JournalIndexPage() {
  const posts = [...journalPosts].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-light text-text-primary md:text-[48px]">
          Journal
        </h1>
        <p className="max-w-2xl text-lg leading-[1.55] text-text-secondary">
          Notes from the work of building and deploying Klorad across complex
          environments.
        </p>
      </header>

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
  );
}

