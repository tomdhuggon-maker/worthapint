import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="site-nav">
      <Link href="/" className="nav-logo">Worth a Pint</Link>
      <div className="nav-links">
        <Link href="/about" className="nav-link">About</Link>
        <Link href="/contact" className="nav-link">Contact</Link>
      </div>
    </nav>
  )
}