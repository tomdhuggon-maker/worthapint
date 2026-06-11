import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <nav style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <strong>Worth a Pint Admin</strong>
        <span style={{ margin: '0 1rem' }}>|</span>
        <a href="/admin">Dashboard</a>
        <span style={{ margin: '0 0.5rem' }}>·</span>
        <a href="/admin/pubs/new">Add Pub</a>
        <span style={{ margin: '0 0.5rem' }}>·</span>
        <a href="/admin/reviews/new">Add Review</a>
      </nav>
      {children}
    </div>
  )
}