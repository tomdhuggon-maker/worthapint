'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NewPub() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name: '', address: '', area: '', slug: '',
    latitude: '', longitude: '', google_maps_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(f => ({ ...f, name, slug }))
  }

  async function handleSubmit() {
    if (!form.name) return setError('Name is required')
    if (!form.slug) return setError('Slug is required')
    setLoading(true)
    const { error } = await supabase.from('pubs').insert([{
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }])
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/admin')
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Add a Pub</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Field label="Name *">
        <input value={form.name} onChange={handleNameChange} style={input} />
      </Field>
      <Field label="Slug *" hint="Auto-generated from name — edit if needed">
        <input value={form.slug} onChange={set('slug')} style={input} />
      </Field>
      <Field label="Address">
        <input value={form.address} onChange={set('address')} style={input} />
      </Field>
      <Field label="Area">
        <input value={form.area} onChange={set('area')} style={input} placeholder="e.g. Hackney, Soho" />
      </Field>
      <Field label="Google Maps URL">
        <input value={form.google_maps_url} onChange={set('google_maps_url')} style={input} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Latitude">
          <input value={form.latitude} onChange={set('latitude')} style={input} placeholder="51.5074" />
        </Field>
        <Field label="Longitude">
          <input value={form.longitude} onChange={set('longitude')} style={input} placeholder="-0.1278" />
        </Field>
      </div>

      <button onClick={handleSubmit} disabled={loading} style={btn}>
        {loading ? 'Saving…' : 'Save Pub'}
      </button>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>{label}</label>
      {hint && <small style={{ color: '#888', display: 'block', marginBottom: '0.25rem' }}>{hint}</small>}
      {children}
    </div>
  )
}

const input: React.CSSProperties = { width: '100%', padding: '0.5rem', boxSizing: 'border-box', fontSize: '1rem' }
const btn: React.CSSProperties = { padding: '0.6rem 1.5rem', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }