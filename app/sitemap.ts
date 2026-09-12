import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: pubs } = await supabase
    .from('pubs')
    .select('slug, reviews!inner ( published_at )')
    .lte('reviews.published_at', now)

  const pubEntries: MetadataRoute.Sitemap = (pubs ?? []).map((pub) => {
    const latest = pub.reviews
      .map((review: { published_at: string }) => new Date(review.published_at).getTime())
      .reduce((max: number, time: number) => Math.max(max, time), 0)

    return {
      url: `${SITE_URL}/pubs/${pub.slug}`,
      lastModified: latest ? new Date(latest) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  })

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/map`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [...staticEntries, ...pubEntries]
}
