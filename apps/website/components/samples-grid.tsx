"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { SampleImage } from "@/components/sample-image";
import type { SampleWorld } from "@/lib/samples";

interface SamplesGridProps {
  worlds: SampleWorld[];
}

export function SamplesGrid({ worlds }: SamplesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    worlds.forEach((world) => {
      if (world.category) {
        cats.add(world.category);
      }
    });
    return Array.from(cats).sort();
  }, [worlds]);

  // Filter worlds based on selected category
  const filteredWorlds = useMemo(() => {
    if (!selectedCategory) {
      return worlds;
    }
    return worlds.filter((world) => world.category === selectedCategory);
  }, [worlds, selectedCategory]);

  const CardContent = (world: SampleWorld) => (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-t-[4px] bg-[#0A0F13]">
        <SampleImage
          src={world.imageThumbnail || "/images/samples/default.jpg"}
          alt={world.title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {world.category && (
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-text-tertiary">
            {world.category}
          </div>
        )}
        <h3 className="mb-2 line-clamp-2 text-lg font-light text-text-primary">
          {world.title}
        </h3>
        {world.url && (
          <span className="mt-auto inline-block text-xs text-text-secondary transition-colors duration-500 group-hover:text-text-primary">
            View →
          </span>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Filter Chips */}
      {categories.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-[4px] border px-4 py-2 text-sm font-light transition-all duration-300 ${
              selectedCategory === null
                ? "border-white/20 bg-white/5 text-text-primary"
                : "border-line-soft bg-transparent text-text-secondary hover:border-white/10 hover:text-text-primary"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-[4px] border px-4 py-2 text-sm font-light transition-all duration-300 ${
                selectedCategory === category
                  ? "border-white/20 bg-white/5 text-text-primary"
                  : "border-line-soft bg-transparent text-text-secondary hover:border-white/10 hover:text-text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredWorlds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredWorlds.map((world) => {
            if (world.url) {
              return (
                <Link
                  key={world.id}
                  href={world.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col overflow-hidden rounded-[4px] border border-line-soft bg-base-bg transition-all duration-500 hover:border-white/[0.06]"
                >
                  {/* Premium gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4C7FFF]/[0.08] via-[#4C7FFF]/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10">
                    {CardContent(world)}
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={world.id}
                className="group relative flex flex-col overflow-hidden rounded-[4px] border border-line-soft bg-base-bg"
              >
                {CardContent(world)}
                <div className="absolute right-2 top-2 rounded bg-text-tertiary/20 px-2 py-1 text-xs uppercase tracking-[0.1em] text-text-tertiary backdrop-blur-sm">
                  Coming Soon
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-lg font-light text-text-secondary">
            No samples found in this category.
          </p>
        </div>
      )}
    </>
  );
}

