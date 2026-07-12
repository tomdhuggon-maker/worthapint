'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { storagePath, validateReviewImages } from '@/lib/review-images'

export default function NewReview() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [pubs, setPubs] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState({
    pub_id: '', title: '', body: '', author: '',
    rating_beer: '3', rating_atmosphere: '3', rating_value: '3',
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const previewUrls = useRef(new Set<string>())

  useEffect(() => {
    supabase.from('pubs').select('id, name').order('name').then(({ data }) => {
      if (data) setPubs(data)
    })
  }, [supabase])

  useEffect(() => {
    const urls = previewUrls.current
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [])

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const validationError = validateReviewImages([...images, ...files])
    if (validationError) {
      setError(validationError)
      e.target.value = ''
      return
    }

    setError('')
    setImages(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    newPreviews.forEach(url => previewUrls.current.add(url))
    setPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }

  function removeImage(index: number) {
    const url = previews[index]
    if (url) {
      URL.revokeObjectURL(url)
      previewUrls.current.delete(url)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadImages(reviewId: number) {
    const uploaded: { path: string; url: string }[] = []

    try {
      for (const file of images) {
        const path = storagePath(reviewId, file)
        const { error } = await supabase.storage
          .from('review-images')
          .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })
        if (error) throw error
        const { data } = supabase.storage.from('review-images').getPublicUrl(path)
        uploaded.push({ path, url: data.publicUrl })
      }
      return uploaded
    } catch (error) {
      if (uploaded.length > 0) {
        await supabase.storage.from('review-images').remove(uploaded.map(image => image.path))
      }
      throw error
    }
  }

  async function handleSubmit() {
    if (!form.pub_id) return setError('Please select a pub')
    if (!form.title) return setError('Title is required')
    setLoading(true)
    setError('')

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        ...form,
        pub_id: parseInt(form.pub_id),
        rating_beer: parseInt(form.rating_beer),
        rating_atmosphere: parseInt(form.rating_atmosphere),
        rating_value: parseInt(form.rating_value),
        published_at: new Date(form.published_at).toISOString()
      }])
      .select()
      .single()

    if (reviewError) { setError(reviewError.message); setLoading(false); return }

    // Upload images
    if (images.length > 0) {
      try {
        const uploaded = await uploadImages(review.id)
        const { error: imageError } = await supabase.from('review_images').insert(
          uploaded.map((image, position) => ({ review_id: review.id, url: image.url, position }))
        )
        if (imageError) {
          await supabase.storage.from('review-images').remove(uploaded.map(image => image.path))
          throw imageError
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError('Review saved but image upload failed: ' + message)
        setLoading(false)
        return
      }
    }

    router.push('/admin')
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Add a Review</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Field label="Pub *">
        <select value={form.pub_id} onChange={set('pub_id')} style={input}>
          <option value="">Select a pub…</option>
          {pubs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>

      <Field label="Title *">
        <input value={form.title} onChange={set('title')} style={input} />
      </Field>

      <Field label="Author">
        <input value={form.author} onChange={set('author')} style={input} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {(['rating_beer', 'rating_atmosphere', 'rating_value'] as const).map(field => (
          <Field key={field} label={field.replace('rating_', '').replace(/^\w/, c => c.toUpperCase())}>
            <select value={form[field]} onChange={set(field)} style={input}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </Field>
        ))}
      </div>

      <Field label="Published at">
        <input type="datetime-local" value={form.published_at} onChange={set('published_at')} style={input} />
      </Field>

      <Field label="Review">
        <textarea value={form.body} onChange={set('body')} rows={6}
          style={{ ...input, resize: 'vertical' }} />
      </Field>

      <Field label="Images">
        <input type="file" accept="image/*" multiple onChange={handleImageChange}
          style={{ marginBottom: '1rem' }} />
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* Blob previews are local admin-only images and do not benefit from Next.js optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`New review image ${i + 1}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                <button type="button" aria-label={`Remove new review image ${i + 1}`} onClick={() => removeImage(i)} style={{
                  position: 'absolute', top: 2, right: 2, background: 'red', color: 'white',
                  border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer',
                  fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0
                }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <button onClick={handleSubmit} disabled={loading} style={btn}>
        {loading ? 'Saving…' : 'Save Review'}
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const input: React.CSSProperties = { width: '100%', padding: '0.5rem', boxSizing: 'border-box', fontSize: '1rem' }
const btn: React.CSSProperties = { padding: '0.6rem 1.5rem', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }
