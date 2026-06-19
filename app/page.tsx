"use client"

import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Collections } from "@/components/collections"
import { VideoGallery } from "@/components/video-gallery"
import { SiteFooter } from "@/components/site-footer"
import { AuthGuard } from "@/components/auth-guard"

export default function Page() {
  return (
    <AuthGuard>
      <main id="top" className="min-h-dvh bg-background">
        <SiteHeader />
        <Hero />
        <Collections />
        <VideoGallery />
        <SiteFooter />
      </main>
    </AuthGuard>
  )
}
