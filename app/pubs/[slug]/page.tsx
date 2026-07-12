import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: pub } = await supabase
    .from('pubs')
    .select('name, area')
    .eq('slug', slug)
    .single()
  if (!pub) return { title: 'Not found' }
  return { title: `${pub.name} — Worth a Pint` }
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="stars" aria-label={`${rounded} out of 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rounded ? 'star star--on' : 'star star--off'}>★</span>
      ))}
    </span>
  )
}

export default async function PubPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: pub } = await supabase
    .from('pubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!pub) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, review_images ( url, position )')
    .eq('pub_id', pub.id)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const allReviews = reviews ?? []

  const overallAvg = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating_beer + r.rating_atmosphere + r.rating_value, 0) / (allReviews.length * 3)).toFixed(1)
    : null

  return (
    <main className="page-wrap">
      <a href="/" className="back-link">← All pubs</a>

      <header className="pub-header">
        <p className="pub-area">{pub.area}</p>
        <h1 className="pub-name">{pub.name}</h1>
        <div className="pub-meta">
          <span>{pub.address}</span>
          {pub.google_maps_url && (
            <a href={pub.google_maps_url} target="_blank" rel="noopener noreferrer" className="map-link">
              Map ↗
            </a>
          )}
        </div>
        {overallAvg && (
          <p className="pub-avg">
            <span className="pub-avg-number">{overallAvg}</span>
            <span className="pub-avg-label"> avg across {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}</span>
          </p>
        )}
      </header>

      <hr className="divider" />

      <section className="reviews">
        {allReviews.length === 0 && (
          <p className="empty">No reviews yet.</p>
        )}
        {allReviews.map(review => {
          const images = [...(review.review_images ?? [])].sort((a, b) => a.position - b.position)
          const overall = (review.rating_beer + review.rating_atmosphere + review.rating_value) / 3
          return (
            <article key={review.id} className="review">
              <div className="review-top">
                <h2 className="review-title">{review.title}</h2>
                <Stars value={overall} />
              </div>
              <p className="review-byline">
                {review.author}
                {review.published_at && (
                  <> · {new Date(review.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                )}
              </p>
              <p className="review-body">{review.body}</p>
              <div className="sub-ratings">
                {[
                  { label: 'Beer', val: review.rating_beer },
                  { label: 'Atmosphere', val: review.rating_atmosphere },
                  { label: 'Value', val: review.rating_value },
                ].map(({ label, val }) => (
                  <div key={label} className="sub-rating">
                    <span className="sub-rating-label">{label}</span>
                    <span className="sub-rating-val">{val}</span>
                  </div>
                ))}
              </div>
              {images.length > 0 && (
                <div className="review-images">
                  {images.map((img, i) => (
                    <img key={i} src={img.url} alt={`Photo from ${review.title}`} className="review-img" />
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}
