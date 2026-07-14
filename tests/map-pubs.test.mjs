import assert from 'node:assert/strict'
import test from 'node:test'

import { toMapPubs } from '../lib/map-pubs.ts'

function pub(overrides = {}) {
  return {
    id: 1,
    name: 'The Example Arms',
    area: 'Camden',
    slug: 'the-example-arms',
    latitude: 51.541,
    longitude: -0.143,
    reviews: [{ id: 1 }],
    ...overrides,
  }
}

test('keeps reviewed pubs with valid coordinates', () => {
  assert.deepEqual(toMapPubs([pub()]), [{
    id: 1,
    name: 'The Example Arms',
    area: 'Camden',
    slug: 'the-example-arms',
    latitude: 51.541,
    longitude: -0.143,
  }])
})

test('normalises numeric coordinate strings', () => {
  const [result] = toMapPubs([pub({ latitude: '51.541', longitude: '-0.143' })])

  assert.equal(result.latitude, 51.541)
  assert.equal(result.longitude, -0.143)
})

test('excludes pubs without a published review in the query result', () => {
  assert.deepEqual(toMapPubs([pub({ reviews: [] })]), [])
})

test('excludes pubs with missing or out-of-range coordinates', () => {
  assert.deepEqual(toMapPubs([
    pub({ id: 2, latitude: null }),
    pub({ id: 3, longitude: '' }),
    pub({ id: 4, latitude: 91 }),
    pub({ id: 5, longitude: -181 }),
  ]), [])
})
