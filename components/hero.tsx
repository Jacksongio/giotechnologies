"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function Hero() {
  const featured = useQuery(api.videos.getFeatured)
  const allVideos = useQuery(api.videos.list)
  const [open, setOpen] = useState(false)

  // Use featured video, or fall back to first video
  const video = featured ?? allVideos?.[0]

  if (!video) {
    return (
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-10 md:pb-16 md:pt-24">
          <div className="flex flex-col items-center text-center">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-primary">
              Est. 1994 &middot; Kept for keeps
            </p>
            <h1 className="mt-6 max-w-5xl text-balance font-serif text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-8xl">
              The little moments,
              <span className="block italic text-primary">gathered together.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              A private home for the Giordano family videos &mdash; birthdays, beach
              days, holidays, and all the in-between days worth pressing record for.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const thumbnailSrc = video.thumbnailUrl ?? "/placeholder.svg"

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-10 md:pb-16 md:pt-24">
        {/* Editorial intro */}
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-primary">
            Est. 1994 &middot; Kept for keeps
          </p>
          <h1 className="mt-6 max-w-5xl text-balance font-serif text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-8xl">
            The little moments,
            <span className="block italic text-primary">gathered together.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            A private home for the Giordano family videos &mdash; birthdays, beach
            days, holidays, and all the in-between days worth pressing record for.
          </p>
        </div>

        {/* Cinematic featured film */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative mt-14 block w-full overflow-hidden rounded-3xl text-left md:mt-20"
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={thumbnailSrc}
              alt={video.title}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div className="grain absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-foreground/5" />

            {/* Center play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background/90 text-primary shadow-2xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                <Play className="h-7 w-7 translate-x-0.5 fill-current md:h-9 md:w-9" />
              </span>
            </div>

            {/* Bottom meta */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-background/80">
                  <span className="rounded-full bg-background/15 px-3 py-1 backdrop-blur-sm">
                    Featured Film
                  </span>
                  <span>
                    {video.collection} &middot; {video.year}
                  </span>
                </div>
                <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-background text-shadow-soft md:text-5xl">
                  {video.title}
                </h2>
                <p className="mt-2 hidden max-w-md text-pretty text-sm leading-relaxed text-background/85 md:block">
                  {video.description}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-background/80">
                {video.duration}
              </span>
            </div>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="aspect-video w-full bg-foreground"
            />
          ) : (
            <div className="relative aspect-video w-full bg-foreground">
              <Image
                src={thumbnailSrc}
                alt={video.title}
                fill
                sizes="100vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg">
                  <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                </span>
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="font-mono text-xs uppercase tracking-widest text-primary">
              {video.collection} &middot; {video.year} &middot; {video.duration}
            </div>
            <DialogTitle className="mt-2 font-serif text-2xl text-foreground">
              {video.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              {video.description}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
