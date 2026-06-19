"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AuthGuard } from "@/components/auth-guard"
import { ComposeCardDialog } from "@/components/family-cards/compose-card-dialog"
import { CardViewerDialog } from "@/components/family-cards/card-viewer-dialog"
import {
  occasions,
  occasionKeys,
  type OccasionKey,
} from "@/components/family-cards/occasion-config"
import { SiteHeader } from "@/components/site-header"
import { Pen, Heart } from "lucide-react"

function RelativeDate({ timestamp }: { timestamp: number }) {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / 86_400_000)

  let text: string
  if (days === 0) text = "Today"
  else if (days === 1) text = "Yesterday"
  else if (days < 7) text = `${days} days ago`
  else if (days < 30) text = `${Math.floor(days / 7)}w ago`
  else text = new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground/70">
      {text}
    </span>
  )
}

function FamilyCardsContent() {
  const received = useQuery(api.familyCards.listReceived)
  const sent = useQuery(api.familyCards.listSent)
  const unreadCount = useQuery(api.familyCards.getUnreadCount)

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeOccasion, setComposeOccasion] = useState<
    OccasionKey | undefined
  >()
  const [viewerCard, setViewerCard] = useState<
    (typeof received extends (infer T)[] | undefined ? T : never) | null
  >(null)
  const [viewerMode, setViewerMode] = useState<"received" | "sent">("received")
  const [viewerOpen, setViewerOpen] = useState(false)

  function openCompose(occasion?: OccasionKey) {
    setComposeOccasion(occasion)
    setComposeOpen(true)
  }

  function openViewer(
    card: NonNullable<typeof received>[number] | NonNullable<typeof sent>[number],
    mode: "received" | "sent",
  ) {
    setViewerCard(card as typeof viewerCard)
    setViewerMode(mode)
    setViewerOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        {/* Intro */}
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-primary">
            Celebrate together
          </p>
          <h2 className="mt-4 max-w-lg text-balance font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            Send a card to someone you love
          </h2>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Create and send family cards for holidays, birthdays, and all the
            moments worth celebrating.
          </p>
          <button
            type="button"
            onClick={() => openCompose()}
            className="group mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:gap-3"
          >
            <Pen className="h-4 w-4" />
            Compose a Card
          </button>
        </div>

        {/* Received Cards */}
        <section className="mt-16">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
              Received Cards
            </h3>
            {(unreadCount ?? 0) > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 font-mono text-[0.6rem] font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>

          {received && received.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {received.map((card) => {
                const meta = occasions[card.occasion as OccasionKey]
                return (
                  <button
                    key={card._id}
                    type="button"
                    onClick={() => openViewer(card, "received")}
                    className="group relative flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    {!card.isRead && (
                      <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    )}
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta?.colorClasses ?? "text-gray-600 bg-gray-50"} text-lg transition-transform group-hover:scale-110`}
                    >
                      {meta?.emoji ?? "💌"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {card.occasion}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                        From {card.senderName}
                      </p>
                      <RelativeDate timestamp={card._creationTime} />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border py-14">
              <Heart className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">
                No cards received yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Cards from family members will appear here
              </p>
            </div>
          )}
        </section>

        {/* Send a Card — Occasion Grid */}
        <section className="mt-16">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
            Send a Card
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {occasionKeys.map((key) => {
              const meta = occasions[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openCompose(key)}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.colorClasses} text-xl transition-transform group-hover:scale-110`}
                  >
                    {meta.emoji}
                  </span>
                  <span className="text-center text-xs font-medium text-foreground">
                    {key}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Sent Cards */}
        <section className="mt-16 pb-10">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
            Sent Cards
          </h3>

          {sent && sent.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sent.map((card) => {
                const meta = occasions[card.occasion as OccasionKey]
                return (
                  <button
                    key={card._id}
                    type="button"
                    onClick={() => openViewer(card, "sent")}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta?.colorClasses ?? "text-gray-600 bg-gray-50"} text-lg transition-transform group-hover:scale-110`}
                    >
                      {meta?.emoji ?? "💌"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {card.occasion}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                        To {card.recipientName}
                      </p>
                      <RelativeDate timestamp={card._creationTime} />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border py-14">
              <Pen className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">
                No cards sent yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Pick an occasion above to send your first card
              </p>
            </div>
          )}
        </section>
      </div>

      <ComposeCardDialog
        key={composeOccasion ?? "compose"}
        open={composeOpen}
        onOpenChange={setComposeOpen}
        defaultOccasion={composeOccasion}
      />

      <CardViewerDialog
        card={viewerCard}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        mode={viewerMode}
      />
    </div>
  )
}

export default function FamilyCardsPage() {
  return (
    <AuthGuard>
      <FamilyCardsContent />
    </AuthGuard>
  )
}
