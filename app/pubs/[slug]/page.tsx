import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/site'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: pub } = await supabase
    .from('pubs')
    .select('name, area, reviews ( rating_beer, rating_atmosphere, rating_value, published_at, review_images ( url, position ) )')
    .eq('slug', slug)
    .single()

  if (!pub) return { title: 'Not found' }

  const publishedReviews = (pub.reviews ?? []).filter(
    (review: { published_at: string | null }) => review.published_at && review.published_at <= now
  )

  const description = publishedReviews.length
    ? `${pub.name} in ${pub.area} — reviewed by Worth a Pint. ${publishedReviews.length} review${publishedReviews.length !== 1 ? 's' : ''} covering beer, atmosphere and value.`
    : `${pub.name} in ${pub.area} — an independent London pub featured on Worth a Pint.`

  const firstImage = publishedReviews
    .flatMap((review: { review_images: { url: string; position: number }[] | null }) => review.review_images ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)[0]

  return {
    title: pub.name,
    description,
    alternates: {
      canonical: `${SITE_URL}/pubs/${slug}`,
    },
    openGraph: {
      title: pub.name,
      description,
      url: `/pubs/${slug}`,
      type: 'article',
      ...(firstImage ? { images: [{ url: firstImage.url }] } : {}),
    },
    twitter: {
      card: firstImage ? 'summary_large_image' : 'summary',
      title: pub.name,
      description,
    },
  }
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: pub.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pub.address,
      addressLocality: pub.area,
      addressCountry: 'GB',
    },
    ...(pub.latitude && pub.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: pub.latitude, longitude: pub.longitude } }
      : {}),
    ...(pub.google_maps_url ? { hasMap: pub.google_maps_url } : {}),
    url: `${SITE_URL}/pubs/${slug}`,
    ...(overallAvg
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: overallAvg,
            reviewCount: allReviews.length,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
    review: allReviews.map(review => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      datePublished: review.published_at,
      reviewBody: review.body,
      name: review.title,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: ((review.rating_beer + review.rating_atmosphere + review.rating_value) / 3).toFixed(1),
        bestRating: '5',
        worstRating: '1',
      },
    })),
  }

  return (
    <main className="page-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/" className="back-link">← All pubs</Link>

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
                  {images.map(img => (
                    <Image
                      key={img.url}
                      src={img.url}
                      alt={`Photo from ${review.title}`}
                      width={260}
                      height={190}
                      sizes="130px"
                      className="review-img"
                    />
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
