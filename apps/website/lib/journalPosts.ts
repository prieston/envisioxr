export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  body: string;
};

export const journalPosts: JournalPost[] = [
  {
    slug: "situational-lattices",
    title: "Situational lattices for operational clarity",
    excerpt:
      "Structuring environments so that field decisions inherit the context of the infrastructure itself.",
    date: "2025-03-18",
    body: `Most infrastructure environments are understood through documents, reports, and periodic snapshots. When conditions change, the knowledge required to act is often distributed across different teams, systems, and levels of experience. This fragmentation creates uncertainty in moments when clarity is required most.

A spatial environment is not enough on its own. The question is not only how a site looks, but how its signaling logic, constraints, and dependencies move when conditions shift. Without an explicit representation of these relationships, decision-making defaults to approximation and institutional memory.

Klorad structures environments as situational lattices: connected networks of assets, signals, and operational states. Instead of presenting a static model, the platform reveals how constraints propagate across a system, and what becomes possible — or impossible — when a change is introduced.

This approach allows operators to reason about interventions before they occur. It becomes clear which actions are reversible, which are load-bearing, and which require coordination across agencies or field teams. The environment itself provides guidance, rather than interpretation being delegated to individual judgment.

Clarity in operational environments does not come from more data, but from understanding how that data interacts across real-world structures. The lattice makes those interactions visible.`,
  },
  {
    slug: "accurate-digital-surfaces",
    title: "Keeping digital surfaces accountable to the field",
    excerpt:
      "A spatial model is only useful when it is reconciled with the evolving condition of the asset.",
    date: "2025-02-02",
    body: `Authoring in Klorad Studio carries inspection lineage forward into Klorad Viewer. When an operator records a variance, the engine resolves how it propagates through schedules, traffic, or cultural stewardship obligations. By holding surfaces, schedules, and responsibilities in one computation layer, actions stay anchored to the environment rather than to documents.`,
  },
  {
    slug: "interpreting-heritage-in-real-time",
    title: "Interpreting heritage in real time",
    excerpt:
      "Cultural landscapes require precision without spectacle. Klorad keeps interpretation rigorous while enabling access.",
    date: "2024-12-11",
    body: `For heritage custodians, each intervention needs to be traced to its evidence. Klorad Engine records intent, preservation parameters, and visitor experience data within one spatial stack. The result is a record that guides conservation decisions today while preparing the site for future interpretation technologies.`,
  },
];

export function getJournalPost(slug: string) {
  return journalPosts.find((post) => post.slug === slug) ?? null;
}

