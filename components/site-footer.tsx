export function SiteFooter() {
  return (
    <footer id="about" className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-background/60">
              About the archive
            </p>
            <p className="mt-5 max-w-md text-pretty font-serif text-2xl leading-snug md:text-3xl">
              A private little corner of the internet where our family keeps its
              home videos safe, for the kids, the grandkids, and every rainy
              afternoon worth a rewatch.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-background/60">
              For the family
            </p>
            <nav className="flex flex-col gap-3 text-lg text-background/80 md:items-end">
              <a href="#library" className="transition-colors hover:text-background">
                Browse the library
              </a>
              <a href="#collections" className="transition-colors hover:text-background">
                Collections
              </a>
              <a
                href="mailto:hello@giordanos.family"
                className="transition-colors hover:text-background"
              >
                Share a memory
              </a>
            </nav>
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className="mt-16 overflow-hidden border-t border-background/15 pt-10">
          <h2 className="text-balance font-serif text-[18vw] leading-none tracking-tight text-background/90 md:text-[12vw]">
            The Giordanos
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} The Giordano Family.</p>
          <p className="font-mono text-xs uppercase tracking-widest">
            Made with love, kept forever
          </p>
        </div>
      </div>
    </footer>
  )
}
