"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { Search } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { VideoCard } from "@/components/video-card"
import { cn } from "@/lib/utils"

export function VideoGallery() {
  const [active, setActive] = useState("All")
  const [query, setQuery] = useState("")
  const allVideos = useQuery(api.videos.list)
  const collections = useQuery(api.videos.getCollections)

  const collectionNames = ["All", ...(collections?.map((c) => c.name) ?? [])]

  const search = query.trim().toLowerCase()
  const filtered = allVideos?.filter((v) => {
    const matchesCollection = active === "All" || v.collection === active
    const matchesSearch =
      search === "" ||
      v.title.toLowerCase().includes(search) ||
      v.year.toLowerCase().includes(search) ||
      v.collection.toLowerCase().includes(search)
    return matchesCollection && matchesSearch
  })

  return (
    <section id="library" className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
            The Library
          </p>
          <h2 className="mt-3 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Every moment, kept for keeps
          </h2>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, year, or collection"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {collectionNames.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-all",
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {filtered?.length === 0 && (
        <p className="mt-14 text-center text-muted-foreground">
          {search
            ? `No videos match "${query.trim()}".`
            : "No videos in this collection yet."}
        </p>
      )}
    </section>
  )
}
