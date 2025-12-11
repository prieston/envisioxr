import { prisma } from "@klorad/prisma";

export type SampleWorld = {
  id: string;
  url: string;
  imageThumbnail: string;
  title: string;
  description?: string;
  category?: string;
};

// This function now fetches from the database
export async function getSampleWorlds(): Promise<SampleWorld[]> {
  try {
    const worlds = await prisma.showcaseWorld.findMany({
      where: { isPublished: true },
      include: {
        tags: true,
      },
      orderBy: { priority: "desc" },
    });

    return worlds.map((world) => ({
      id: world.id,
      url: world.url,
      imageThumbnail: world.thumbnailUrl || "/images/samples/default.jpg",
      title: world.title,
      description: world.description || undefined,
      category: world.tags.length > 0 ? world.tags[0].label : "Uncategorized",
    }));
  } catch (error) {
    console.error("Error fetching showcase worlds:", error);
    return [];
  }
}

// Keep the hardcoded list as a fallback or for seeding if needed
// but export it differently to avoid confusion
export const legacySampleWorlds = [
  // ... existing content if needed for reference, otherwise can be removed
];

export async function getSampleWorld(id: string) {
  try {
    const world = await prisma.showcaseWorld.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!world) return null;

    return {
      id: world.id,
      url: world.url,
      imageThumbnail: world.thumbnailUrl || "/images/samples/default.jpg",
      title: world.title,
      description: world.description || undefined,
      category: world.tags.length > 0 ? world.tags[0].label : "Uncategorized",
    };
  } catch (error) {
    console.error("Error fetching showcase world:", error);
    return null;
  }
}
