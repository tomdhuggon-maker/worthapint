import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: pubs } = await supabase
    .from('pubs')
    .select('id, name, area, address, slug, created_at')
    .order('created_at', { ascending: false })
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, pubs(name)')
    .order('published_at', { ascending: false })

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Pubs ({pubs?.length ?? 0})</h2>
        <Link href="/admin/pubs/new" style={addBtn}>+ Add Pub</Link>
      </div>
      <table style={table}>
        <thead><tr style={{ background: '#f5f5f5' }}>
          <th style={th}>Pub</th><th style={th}>Area</th><th style={th}>Address</th>
          <th style={th}>Public page</th>
        </tr></thead>
        <tbody>
          {pubs?.map(pub => (
            <tr key={pub.id}>
              <td style={td}>{pub.name}</td>
              <td style={td}>{pub.area}</td>
              <td style={td}>{pub.address}</td>
              <td style={td}><Link href={`/pubs/${pub.slug}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <h2>Reviews ({reviews?.length ?? 0})</h2>
        <Link href="/admin/reviews/new" style={addBtn}>+ Add Review</Link>
      </div>
      <table style={table}>
        <thead><tr style={{ background: '#f5f5f5' }}>
<th style={th}>Pub</th><th style={th}>Title</th><th style={th}>Beer</th>
          <th style={th}>Atmosphere</th><th style={th}>Value</th><th style={th}>Author</th>
          <th style={th}>Actions</th>
        </tr></thead>
        <tbody>
        {reviews?.map(review => (
            <tr key={review.id}>
              <td style={td}>{review.pubs?.name}</td>
              <td style={td}>{review.title}</td>
              <td style={td}>{review.rating_beer}★</td>
              <td style={td}>{review.rating_atmosphere}★</td>
              <td style={td}>{review.rating_value}★</td>
              <td style={td}>{review.author}</td>
              <td style={td}>
                <Link href={`/admin/reviews/${review.id}/edit`} style={editBtn}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const th: React.CSSProperties = { textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }
const td: React.CSSProperties = { padding: '0.5rem', borderBottom: '1px solid #eee' }
const addBtn: React.CSSProperties = { padding: '0.4rem 1rem', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 4, fontSize: '0.9rem' }
const editBtn: React.CSSProperties = { padding: '0.2rem 0.6rem', background: '#666', color: '#fff', textDecoration: 'none', borderRadius: 4, fontSize: '0.8rem' }
