"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { collectionMeta } from "@/lib/videos"

export function Collections() {
  const collections = useQuery(api.videos.getCollections)

  if (!collections || collections.length === 0) return null

  return (
    <section id="collections" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
              The Collections
            </p>
            <h2 className="mt-3 max-w-2xl text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
              Sorted the way we remember them
            </h2>
          </div>
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Every reel filed by feeling, not by date, so finding the right
            memory feels like flipping through an old photo album.
          </p>
        </div>

        <div className="mt-14 divide-y divide-border border-t border-border">
          {collections.map((c, i) => (
            <a
              key={c.name}
              href="#library"
              className="group flex items-center gap-6 py-7 transition-colors md:gap-10"
            >
              <span className="font-mono text-sm text-muted-foreground transition-colors group-hover:text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary md:text-4xl">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {collectionMeta[c.name] ?? ""}
                </p>
              </div>
              <span className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block">
                {c.count} {c.count === 1 ? "film" : "films"}
              </span>
              <span
                aria-hidden
                className="text-2xl text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
              >
                &rarr;
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
