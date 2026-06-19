"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "@/convex/_generated/api"
import { AuthGuard } from "@/components/auth-guard"
import { SiteHeader } from "@/components/site-header"
import { Check, Eye, EyeOff, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

function ProfileSection() {
  const profile = useQuery(api.account.getProfile)
  const updateProfile = useMutation(api.account.updateProfile)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "")
      setPhone(profile.phone ?? "")
    }
  }, [profile])

  const hasChanges =
    profile && (name !== (profile.name ?? "") || phone !== (profile.phone ?? ""))

  async function handleSave() {
    if (!hasChanges) return
    setSaving(true)
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
      </div>
    )
  }

  const joinDate = new Date(profile._creationTime).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <section>
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
        Profile
      </h2>

      <div className="mt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            value={profile.email ?? ""}
            disabled
            className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-base text-muted-foreground sm:text-sm"
          />
          <p className="text-xs text-muted-foreground/60">
            Email cannot be changed
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground/50">
            Member since {joinDate}
          </p>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </section>
  )
}

function PasswordSection() {
  const { signIn } = useAuthActions()
  const profile = useQuery(api.account.getProfile)

  const [expanded, setExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  )
  const [error, setError] = useState("")

  function handleToggle() {
    setExpanded((v) => !v)
    if (expanded) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError("")
      setStatus("idle")
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setStatus("saving")
    try {
      await signIn("password", {
        email: profile?.email,
        password: currentPassword,
        flow: "signIn",
      })
      await signIn("password", {
        email: profile?.email,
        flow: "reset",
      })
    } catch {
      setError("Current password is incorrect.")
      setStatus("error")
      return
    }

    setStatus("success")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => {
      setStatus("idle")
      setExpanded(false)
    }, 3000)
  }

  return (
    <section>
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
        Password
      </h2>

      <button
        type="button"
        onClick={handleToggle}
        className="mt-5 flex w-full items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
      >
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            {expanded ? "Cancel password change" : "Change your password"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {expanded
              ? "Discard changes and close"
              : "Update your account password"}
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform"
          style={{ transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M7 3v8M3 7h8" />
          </svg>
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <form
            onSubmit={(e) => void handleChangePassword(e)}
            className="flex flex-col gap-5 pt-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-11 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                placeholder="Re-enter new password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {status === "success" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm text-foreground">
                  Password verification passed. Check your email for a reset
                  code to finish updating your password.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  status === "saving" ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "saving" ? "Verifying..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function SignOutSection() {
  const { signOut } = useAuthActions()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push("/login")
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-destructive/30 hover:bg-destructive/[0.03]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-transform group-hover:scale-110">
          <LogOut className="h-5 w-5" />
        </span>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            {signingOut ? "Signing out..." : "Sign Out"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sign out of your account on this device
          </p>
        </div>
      </button>
    </section>
  )
}

function AccountContent() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-2xl space-y-12 px-6 py-10 md:px-10">
        <ProfileSection />
        <div className="h-px bg-border" />
        <PasswordSection />
        <div className="h-px bg-border" />
        <SignOutSection />
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  )
}
