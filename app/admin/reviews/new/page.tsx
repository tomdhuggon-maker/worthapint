'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NewReview() {
  const router = useRouter()
  const supabase = createClient()
  const [pubs, setPubs] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState({
    pub_id: '', title: '', body: '', author: '',
    rating_beer: '3', rating_atmosphere: '3', rating_value: '3',
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('pubs').select('id, name').order('name').then(({ data }) => {
      if (data) setPubs(data)
    })
  }, [])

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit() {
    if (!form.pub_id) return setError('Please select a pub')
    if (!form.title) return setError('Title is required')
    setLoading(true)
    const { error } = await supabase.from('reviews').insert([{
      ...form,
      pub_id: parseInt(form.pub_id),
      rating_beer: parseInt(form.rating_beer),
      rating_atmosphere: parseInt(form.rating_atmosphere),
      rating_value: parseInt(form.rating_value),
      published_at: new Date(form.published_at).toISOString()
    }])
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/admin')
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
        <textarea value={form.body} onChange={set('body')} rows={6} style={{ ...input, resize: 'vertical' }} />
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