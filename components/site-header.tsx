"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { LogOut } from "lucide-react"
import Link from "next/link"

export function SiteHeader() {
  const { signOut } = useAuthActions()

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <a href="#" className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-tight text-foreground md:text-2xl">
            The Giordanos
          </span>
          <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
            Family Film Library
          </span>
        </a>

        <nav className="hidden items-center gap-10 text-sm text-muted-foreground md:flex">
          <a href="#top" className="transition-colors hover:text-foreground">
            Home
          </a>
          <a href="#library" className="transition-colors hover:text-foreground">
            Library
          </a>
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#library"
            className="group flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:gap-3"
          >
            Watch
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
