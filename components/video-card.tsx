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
import type { FamilyVideo } from "@/lib/videos"

export function VideoCard({ video }: { video: FamilyVideo }) {
  const [open, setOpen] = useState(false)

  const thumbnailSrc = video.thumbnailUrl ?? "/placeholder.svg"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col text-left"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={thumbnailSrc}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-background/90 text-primary opacity-0 shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </span>
          </div>
          <span className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2.5 py-1 font-mono text-[0.65rem] text-foreground backdrop-blur-sm">
            {video.duration}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
          <span>{video.collection}</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground">{video.year}</span>
        </div>
        <h3 className="mt-2 font-serif text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
          {video.title}
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {video.description}
        </p>
      </button>

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
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <span>{video.collection}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {video.year} · {video.duration}
              </span>
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
    </>
  )
}
