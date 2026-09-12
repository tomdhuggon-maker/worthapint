import type { Metadata } from 'next'

const description = 'Get in touch with Worth a Pint — suggest a pub, share feedback, or say hello.'

export const metadata: Metadata = {
  title: 'Contact',
  description,
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact — Worth a Pint', description, url: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
