import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export const revalidate = 60

type ReviewSummary = {
  rating_beer: number
  rating_atmosphere: number
  rating_value: number
  published_at: string
}

export default async function HomePage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: pubs } = await supabase
    .from('pubs')
    .select(`
      id, name, area, slug,
      reviews!inner (
        id, rating_beer, rating_atmosphere, rating_value, published_at
      )
    `)
    .lte('reviews.published_at', now)

  const sorted = (pubs ?? [])
    .filter(p => p.reviews.length > 0)
    .sort((a, b) => {
      const aDate = Math.max(...a.reviews.map(r => new Date(r.published_at).getTime()))
      const bDate = Math.max(...b.reviews.map(r => new Date(r.published_at).getTime()))
      return bDate - aDate
    })

  function avgRating(reviews: ReviewSummary[]) {
    const total = reviews.reduce((sum, review) => (
      sum + review.rating_beer + review.rating_atmosphere + review.rating_value
    ), 0)
    return (total / (reviews.length * 3)).toFixed(1)
  }

  return (
    <main className="page-wrap">
      <header className="site-header">
        <p className="site-eyebrow">London pub reviews</p>
        <h1 className="site-title">Worth a Pint</h1>
        <p className="site-strapline">Celebrating the best pints that London has to offer.</p>
      </header>

      <div className="pub-list">
        {sorted.map(pub => (
          <Link key={pub.id} href={`/pubs/${pub.slug}`} className="pub-row">
            <div className="pub-row-left">
              <span className="pub-row-name">{pub.name}</span>
              <span className="pub-row-meta">{pub.area} · {pub.reviews.length} review{pub.reviews.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="pub-row-right">
              <span className="pub-row-rating">{avgRating(pub.reviews)}</span>
              <span className="pub-row-rating-label">avg</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
