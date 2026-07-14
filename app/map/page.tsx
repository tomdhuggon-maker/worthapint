import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { toMapPubs } from '@/lib/map-pubs'
import MapCanvas from './MapCanvas'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Pub map — Worth a Pint',
  description: 'Explore independent London pubs reviewed by Worth a Pint.',
}

export default async function MapPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('pubs')
    .select(`
      id, name, area, slug, latitude, longitude,
      reviews!inner ( id, published_at )
    `)
    .lte('reviews.published_at', now)
    .order('name')

  const pubs = toMapPubs(data ?? [])
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID

  return (
    <main className="page-wrap">
      <header className="site-header map-header">
        <p className="site-eyebrow">Explore London</p>
        <h1 className="site-title">Pub map</h1>
        <p className="site-strapline">Every pub we have reviewed, all in one place.</p>
      </header>

      {pubs.length === 0 ? (
        <p className="empty">There are no reviewed pubs with map coordinates yet.</p>
      ) : apiKey && mapId ? (
        <MapCanvas apiKey={apiKey} mapId={mapId} pubs={pubs} />
      ) : (
        <p className="map-config-message">
          The interactive map is not configured in this environment. You can still browse the pubs below.
        </p>
      )}

      {pubs.length > 0 && (
        <section className="map-pub-section" aria-labelledby="map-pub-heading">
          <h2 id="map-pub-heading" className="map-pub-heading">Reviewed pubs</h2>
          <div className="pub-list">
            {pubs.map((pub) => (
              <Link key={pub.id} href={`/pubs/${pub.slug}`} className="pub-row">
                <span className="pub-row-left">
                  <span className="pub-row-name">{pub.name}</span>
                  <span className="pub-row-meta">{pub.area}</span>
                </span>
                <span className="map-pub-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
