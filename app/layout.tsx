import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import Nav from './components/Nav'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Worth a Pint',
  description: "An honest guide to London's best pubs.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}