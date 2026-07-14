export type MapPub = {
  id: number
  name: string
  area: string
  slug: string
  latitude: number
  longitude: number
}

type PubRow = Omit<MapPub, 'latitude' | 'longitude'> & {
  latitude: unknown
  longitude: unknown
  reviews: unknown[] | null
}

function coordinate(value: unknown) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return null
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toMapPubs(rows: PubRow[]): MapPub[] {
  return rows.flatMap((row) => {
    const latitude = coordinate(row.latitude)
    const longitude = coordinate(row.longitude)

    if (
      !row.reviews?.length ||
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return []
    }

    return [{
      id: row.id,
      name: row.name,
      area: row.area,
      slug: row.slug,
      latitude,
      longitude,
    }]
  })
}
