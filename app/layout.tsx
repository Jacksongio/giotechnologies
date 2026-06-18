import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'The Giordanos: Family Film Library',
    template: '%s · The Giordanos',
  },
  description:
    'A private home for the Giordano family videos: birthdays, holidays, road trips, and all the little moments worth keeping.',
  applicationName: 'The Giordanos Family Film Library',
  keywords: [
    'Giordano family',
    'family videos',
    'home movies',
    'family film library',
  ],
  authors: [{ name: 'The Giordanos' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-light-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'The Giordanos: Family Film Library',
    description:
      'A private home for the Giordano family videos: birthdays, holidays, road trips, and all the little moments worth keeping.',
    siteName: 'The Giordanos Family Film Library',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
