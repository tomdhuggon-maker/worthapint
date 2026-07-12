import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MAX_IMAGE_SIZE,
  MAX_REVIEW_IMAGES,
  storagePath,
  validateReviewImages,
} from '../lib/review-images.ts'

function image(name = 'pub.jpg', size = 1024, type = 'image/jpeg') {
  return { name, size, type }
}

test('accepts valid images within the review limits', () => {
  assert.equal(validateReviewImages([image(), image('garden.webp', 2048, 'image/webp')]), null)
})

test('rejects more than ten images including existing images', () => {
  const files = Array.from({ length: 2 }, (_, index) => image(`pub-${index}.jpg`))

  assert.equal(
    validateReviewImages(files, MAX_REVIEW_IMAGES - 1),
    `A review can have up to ${MAX_REVIEW_IMAGES} images.`,
  )
})

test('rejects files that are not images', () => {
  assert.equal(validateReviewImages([image('notes.txt', 100, 'text/plain')]), 'notes.txt is not an image.')
})

test('rejects images larger than six megabytes', () => {
  assert.equal(
    validateReviewImages([image('huge.jpg', MAX_IMAGE_SIZE + 1)]),
    'huge.jpg is larger than 6 MB.',
  )
})

test('creates unique, safe storage paths inside the review folder', () => {
  const first = storagePath(42, image('front of pub.JPEG'))
  const second = storagePath(42, image('front of pub.JPEG'))

  assert.match(first, /^42\/[0-9a-f-]+\.jpeg$/)
  assert.notEqual(first, second)
})
