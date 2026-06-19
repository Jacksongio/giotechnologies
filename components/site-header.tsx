"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { LogOut, Settings, Heart, User, Home, BookOpen, Upload } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const { signOut } = useAuthActions()

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-tight text-foreground md:text-2xl">
            The Giordanos
          </span>
          <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
            Family Film Library
          </span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/#library" className="transition-colors hover:text-foreground">
            Library
          </Link>
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#library"
            className="group flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:gap-3"
          >
            Watch
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
              <User className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <div className="md:hidden">
                <DropdownMenuItem render={<Link href="/" />}>
                  <Home className="h-4 w-4" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/#library" />}>
                  <BookOpen className="h-4 w-4" />
                  Library
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/admin" />}>
                  <Upload className="h-4 w-4" />
                  Upload
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem render={<Link href="/account" />}>
                <Settings className="h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/family-cards" />}>
                <Heart className="h-4 w-4" />
                Family Cards
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void signOut()}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
