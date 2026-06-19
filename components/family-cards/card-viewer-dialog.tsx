"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { occasions, type OccasionKey } from "./occasion-config"

interface CardData {
  _id: Id<"familyCards">
  occasion: string
  message: string
  isRead: boolean
  senderName?: string
  recipientName?: string
  _creationTime: number
}

export function CardViewerDialog({
  card,
  open,
  onOpenChange,
  mode,
}: {
  card: CardData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "received" | "sent"
}) {
  const markAsRead = useMutation(api.familyCards.markAsRead)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!open) {
      setStage(0)
      return
    }

    if (card && mode === "received" && !card.isRead) {
      void markAsRead({ cardId: card._id })
    }

    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 600),
      setTimeout(() => setStage(3), 1100),
      setTimeout(() => setStage(4), 1600),
      setTimeout(() => setStage(5), 2100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [open, card, mode, markAsRead])

  if (!card) return null

  const meta = occasions[card.occasion as OccasionKey] ?? {
    emoji: "💌",
    gradientClasses: "from-gray-500 to-gray-700",
    greeting: card.occasion,
  }

  const date = new Date(card._creationTime)
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const personLabel =
    mode === "received"
      ? card.senderName ?? "A family member"
      : card.recipientName ?? "A family member"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-visible border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-sm"
        showCloseButton={false}
      >
        <div className="relative" style={{ perspective: "1000px" }}>
          {/* ── ENVELOPE ── */}
          <div
            className="absolute inset-0 z-20 flex items-center justify-center transition-all duration-700 ease-in-out"
            style={{
              opacity: stage >= 3 ? 0 : 1,
              transform: stage >= 3 ? "scale(0.8) translateY(40px)" : "scale(1)",
              pointerEvents: stage >= 3 ? "none" : "auto",
            }}
          >
            <div className="relative w-full">
              {/* Envelope body */}
              <div
                className={`bg-gradient-to-br ${meta.gradientClasses} relative mx-auto aspect-[4/3] w-full rounded-2xl shadow-2xl`}
              >
                {/* Paper texture overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-[0.07]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Inner fold lines */}
                <div className="absolute inset-0 rounded-2xl" style={{
                  background: "linear-gradient(135deg, transparent 48%, rgba(255,255,255,0.08) 49%, rgba(255,255,255,0.08) 51%, transparent 52%)",
                }} />

                {/* Wax seal */}
                <div
                  className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{
                    animation: stage >= 1 ? "card-seal-break 500ms ease-out forwards" : "none",
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-800 shadow-lg ring-2 ring-red-900/30 sm:h-16 sm:w-16">
                    <span className="font-serif text-xs font-bold tracking-wide text-red-200 sm:text-sm">G</span>
                  </div>
                </div>
              </div>

              {/* Envelope flap */}
              <div
                className="absolute inset-x-0 top-0 z-10"
                style={{
                  transformOrigin: "top center",
                  transform: stage >= 2 ? "rotateX(180deg)" : "rotateX(0deg)",
                  transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className={`bg-gradient-to-b ${meta.gradientClasses} rounded-t-2xl`}
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 70%)",
                    height: "clamp(80px, 20vw, 120px)",
                    backfaceVisibility: "hidden",
                    filter: "brightness(0.85)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── THE CARD ── */}
          <div
            className="relative z-10 transition-all ease-out"
            style={{
              transitionDuration: stage < 3 ? "0ms" : "800ms",
              transform:
                stage >= 3
                  ? "translateY(0) scale(1)"
                  : "translateY(60px) scale(0.85)",
              opacity: stage >= 3 ? 1 : 0,
            }}
          >
            <div className="overflow-hidden rounded-2xl bg-popover shadow-2xl ring-1 ring-foreground/10">
              {/* Gradient header */}
              <div
                className={`bg-gradient-to-br ${meta.gradientClasses} relative overflow-hidden px-5 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12`}
              >
                {/* Shimmer sweep */}
                {stage >= 4 && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      animation: "card-shimmer 1s ease-in-out forwards",
                    }}
                  >
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </div>
                )}

                {/* Emoji */}
                <div className="flex flex-col items-center">
                  <span
                    className="text-5xl drop-shadow-lg sm:text-7xl"
                    style={{
                      animation:
                        stage >= 4
                          ? "card-emoji-bounce 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                          : "none",
                      opacity: stage >= 4 ? undefined : 0,
                      transform: stage >= 4 ? undefined : "scale(0)",
                    }}
                  >
                    {meta.emoji}
                  </span>

                  {/* Greeting */}
                  <h2
                    className="mt-4 text-center font-serif text-2xl leading-tight text-white drop-shadow-md sm:mt-5 sm:text-3xl"
                    style={{
                      animation:
                        stage >= 4
                          ? "card-text-reveal 600ms ease-out 300ms both"
                          : "none",
                      opacity: stage >= 4 ? undefined : 0,
                    }}
                  >
                    {meta.greeting}
                  </h2>
                </div>

                {/* Decorative bottom curve */}
                <div className="absolute -bottom-1 inset-x-0">
                  <svg viewBox="0 0 400 30" preserveAspectRatio="none" className="block w-full h-6 fill-popover">
                    <path d="M0,30 L0,15 Q200,-15 400,15 L400,30 Z" />
                  </svg>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col items-center px-5 pb-8 pt-3 sm:px-8 sm:pb-10 sm:pt-4">
                {/* Message */}
                <div
                  className="transition-all duration-700 ease-out"
                  style={{
                    opacity: stage >= 5 ? 1 : 0,
                    transform: stage >= 5 ? "translateY(0)" : "translateY(16px)",
                    filter: stage >= 5 ? "blur(0)" : "blur(4px)",
                  }}
                >
                  <p className="max-w-xs text-center font-serif text-base italic leading-relaxed text-foreground sm:text-lg">
                    &ldquo;{card.message}&rdquo;
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="mt-4 h-px bg-border transition-all duration-700 ease-out sm:mt-6"
                  style={{
                    width: stage >= 5 ? "48px" : "0px",
                    transitionDelay: "200ms",
                  }}
                />

                {/* Attribution */}
                <div
                  className="mt-4 flex flex-col items-center gap-1 transition-all duration-600 ease-out sm:mt-5"
                  style={{
                    opacity: stage >= 5 ? 1 : 0,
                    transform: stage >= 5 ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: "400ms",
                  }}
                >
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground sm:text-[0.65rem]">
                    {mode === "received" ? "With love, from" : "Sent to"}
                  </p>
                  <p className="font-serif text-sm text-foreground sm:text-base">
                    {personLabel}
                  </p>
                </div>

                {/* Date */}
                <p
                  className="mt-3 font-mono text-[0.55rem] uppercase tracking-widest text-muted-foreground/50 transition-all duration-500 sm:mt-4 sm:text-[0.6rem]"
                  style={{
                    opacity: stage >= 5 ? 1 : 0,
                    transitionDelay: "600ms",
                  }}
                >
                  {dateStr}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
