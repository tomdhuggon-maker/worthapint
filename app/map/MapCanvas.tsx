'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import type { MapPub } from '@/lib/map-pubs'

type Props = {
  apiKey: string
  mapId: string
  pubs: MapPub[]
}

let configuredApiKey: string | null = null

export default function MapCanvas({ apiKey, mapId, pubs }: Props) {
  const mapElement = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selectedPub, setSelectedPub] = useState<MapPub | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initialiseMap() {
      if (!mapElement.current) return

      try {
        if (!configuredApiKey) {
          setOptions({
            key: apiKey,
            v: 'weekly',
            language: 'en',
            region: 'GB',
            authReferrerPolicy: 'origin',
            mapIds: [mapId],
          })
          configuredApiKey = apiKey
        }

        const [{ Map }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
          importLibrary('maps'),
          importLibrary('marker'),
        ])

        if (cancelled || !mapElement.current) return

        const map = new Map(mapElement.current, {
          center: { lat: 51.5072, lng: -0.1276 },
          zoom: 11,
          mapId,
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false,
        })

        const bounds = new google.maps.LatLngBounds()

        pubs.forEach((pub) => {
          const position = { lat: pub.latitude, lng: pub.longitude }
          const pin = new PinElement({
            background: '#C8442A',
            borderColor: '#1A1A18',
            glyphColor: '#FAFAF8',
          })
          const marker = new AdvancedMarkerElement({
            map,
            position,
            title: `${pub.name}, ${pub.area}`,
            gmpClickable: true,
          })

          marker.append(pin)
          marker.addEventListener('gmp-click', () => {
            setSelectedPub(pub)
            map.panTo(position)
          })
          bounds.extend(position)
        })

        if (pubs.length === 1) {
          map.setCenter(bounds.getCenter())
          map.setZoom(14)
        } else if (pubs.length > 1) {
          map.fitBounds(bounds, 40)
        }

        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void initialiseMap()

    return () => {
      cancelled = true
    }
  }, [apiKey, mapId, pubs])

  return (
    <div className="map-shell">
      <div
        ref={mapElement}
        className="map-canvas"
        aria-label="Map showing reviewed pubs across London"
      />
      {status === 'loading' && <p className="map-status">Loading map…</p>}
      {status === 'error' && (
        <p className="map-status map-status--error">
          The map could not be loaded. You can still browse every pub in the list below.
        </p>
      )}
      {status === 'ready' && !selectedPub && (
        <p className="map-hint">Select a pin to open its review.</p>
      )}
      {selectedPub && (
        <div className="map-selection" aria-live="polite">
          <div>
            <p className="map-selection-name">{selectedPub.name}</p>
            <p className="map-selection-area">{selectedPub.area}</p>
          </div>
          <Link href={`/pubs/${selectedPub.slug}`} className="map-selection-link">
            Read review →
          </Link>
        </div>
      )}
    </div>
  )
}
