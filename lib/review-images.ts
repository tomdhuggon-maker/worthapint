export const MAX_REVIEW_IMAGES = 10
export const MAX_IMAGE_SIZE = 6 * 1024 * 1024

export function validateReviewImages(files: File[], existingCount = 0) {
  if (existingCount + files.length > MAX_REVIEW_IMAGES) {
    return `A review can have up to ${MAX_REVIEW_IMAGES} images.`
  }

  const nonImage = files.find(file => !file.type.startsWith('image/'))
  if (nonImage) return `${nonImage.name} is not an image.`

  const oversized = files.find(file => file.size > MAX_IMAGE_SIZE)
  if (oversized) return `${oversized.name} is larger than 6 MB.`

  return null
}

export function storagePath(reviewId: number, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${reviewId}/${crypto.randomUUID()}.${extension}`
}
