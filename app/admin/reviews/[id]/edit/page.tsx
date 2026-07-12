'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function EditReview() {
  const router = useRouter()
  const { id } = useParams()
  const [supabase] = useState(createClient)
  const [pubs, setPubs] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState({
    pub_id: '', title: '', body: '', author: '',
    rating_beer: '3', rating_atmosphere: '3', rating_value: '3',
    published_at: ''
  })
  const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: pubsData }, { data: review }, { data: images }] = await Promise.all([
        supabase.from('pubs').select('id, name').order('name'),
        supabase.from('reviews').select('*').eq('id', id).single(),
        supabase.from('review_images').select('*').eq('review_id', id).order('position')
      ])
      if (pubsData) setPubs(pubsData)
      if (review) setForm({
        pub_id: String(review.pub_id),
        title: review.title ?? '',
        body: review.body ?? '',
        author: review.author ?? '',
        rating_beer: String(review.rating_beer),
        rating_atmosphere: String(review.rating_atmosphere),
        rating_value: String(review.rating_value),
        published_at: review.published_at
          ? new Date(review.published_at).toISOString().slice(0, 16)
          : ''
      })
      if (images) setExistingImages(images)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeNewImage(index: number) {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function removeExistingImage(imageId: number, url: string) {
    const path = url.split('/review-images/')[1]
    await supabase.storage.from('review-images').remove([path])
    await supabase.from('review_images').delete().eq('id', imageId)
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  async function uploadNewImages(reviewId: number) {
    const urls: string[] = []
    for (const file of newImages) {
      const ext = file.name.split('.').pop()
      const path = `${reviewId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('review-images').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('review-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function handleSave() {
    if (!form.pub_id) return setError('Please select a pub')
    if (!form.title) return setError('Title is required')
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        ...form,
        pub_id: parseInt(form.pub_id),
        rating_beer: parseInt(form.rating_beer),
        rating_atmosphere: parseInt(form.rating_atmosphere),
        rating_value: parseInt(form.rating_value),
        published_at: new Date(form.published_at).toISOString()
      })
      .eq('id', id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    if (newImages.length > 0) {
      try {
        const urls = await uploadNewImages(Number(id))
        const position = existingImages.length
        await supabase.from('review_images').insert(
          urls.map((url, i) => ({ review_id: Number(id), url, position: position + i }))
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError('Review saved but image upload failed: ' + message)
        setSaving(false)
        return
      }
    }

    router.push('/admin')
  }

  if (loading) return <p>Loading…</p>

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Edit Review</h1>
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
        {existingImages.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Existing images:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {existingImages.map(img => (
                <div key={img.id} style={{ position: 'relative' }}>
                  {/* Admin thumbnails are deliberately served directly from storage. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="Existing review image" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                  <button type="button" aria-label="Remove existing review image" onClick={() => removeExistingImage(img.id, img.url)} style={{
                    position: 'absolute', top: 2, right: 2, background: 'red', color: 'white',
                    border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer',
                    fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0
                  }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Add new images:</p>
        <input type="file" accept="image/*" multiple onChange={handleImageChange}
          style={{ marginBottom: '1rem' }} />
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* Blob previews are local admin-only images and do not benefit from Next.js optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`New review image ${i + 1}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                <button type="button" aria-label={`Remove new review image ${i + 1}`} onClick={() => removeNewImage(i)} style={{
                  position: 'absolute', top: 2, right: 2, background: 'red', color: 'white',
                  border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer',
                  fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0
                }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <button onClick={handleSave} disabled={saving} style={btn}>
        {saving ? 'Saving…' : 'Save Changes'}
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
