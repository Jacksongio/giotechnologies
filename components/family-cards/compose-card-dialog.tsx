"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Send, ArrowLeft, Check } from "lucide-react"
import { occasions, occasionKeys, type OccasionKey } from "./occasion-config"

export function ComposeCardDialog({
  open,
  onOpenChange,
  defaultOccasion,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultOccasion?: OccasionKey
}) {
  const [step, setStep] = useState<1 | 2>(defaultOccasion ? 2 : 1)
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionKey | null>(
    defaultOccasion ?? null,
  )
  const [message, setMessage] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const familyMembers = useQuery(api.familyCards.listFamilyMembers)
  const sendCard = useMutation(api.familyCards.send)

  function reset() {
    setStep(1)
    setSelectedOccasion(null)
    setMessage("")
    setRecipientId("")
    setSending(false)
    setSent(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function selectOccasion(occasion: OccasionKey) {
    setSelectedOccasion(occasion)
    setStep(2)
  }

  async function handleSend() {
    if (!selectedOccasion || !recipientId || !message.trim()) return
    setSending(true)
    try {
      await sendCard({
        recipientId: recipientId as Id<"users">,
        occasion: selectedOccasion,
        message: message.trim(),
      })
      setSent(true)
      setTimeout(() => handleOpenChange(false), 1500)
    } catch {
      setSending(false)
    }
  }

  const occasionMeta = selectedOccasion ? occasions[selectedOccasion] : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!sent}>
        {sent ? (
          <div className="flex flex-col items-center py-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-7 w-7" />
            </span>
            <p className="mt-4 font-serif text-lg text-foreground">
              Card Sent!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your card is on its way
            </p>
          </div>
        ) : step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">
                Choose an Occasion
              </DialogTitle>
              <DialogDescription>
                Pick an occasion for your family card
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {occasionKeys.map((key) => {
                const meta = occasions[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectOccasion(key)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.colorClasses} text-base`}
                    >
                      {meta.emoji}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {key}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  {occasionMeta && (
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${occasionMeta.colorClasses} text-sm`}
                    >
                      {occasionMeta.emoji}
                    </span>
                  )}
                  <DialogTitle className="font-serif text-lg">
                    {selectedOccasion}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  To
                </label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                >
                  <option value="">Select a family member</option>
                  {familyMembers?.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name ?? member.email ?? "Family Member"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                  placeholder="Write something from the heart..."
                />
              </div>

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={sending || !recipientId || !message.trim()}
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Card"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
