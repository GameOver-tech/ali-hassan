import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', role: '', company: '', content: '', rating: 5, photo_url: '', status: 'published' })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getTestimonials(); setItems(data || []) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, rating: Number(form.rating) }
      if (editing) { await adminAPI.updateTestimonial(editing.id, payload); showToast('Testimonial updated!') }
      else { await adminAPI.createTestimonial(payload); showToast('Testimonial created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ name: '', role: '', company: '', content: '', rating: 5, photo_url: '', status: 'published' })
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this testimonial?')) return
    try { await adminAPI.deleteTestimonial(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch (err) { showToast(err?.response?.data?.error || 'Error deleting', 'error') }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'rating', label: 'Rating', render: (v) => '★'.repeat(v || 0) + '☆'.repeat(5 - (v || 0)) },
    { key: 'status', label: 'Status', render: (v) => <span className={`text-xs px-2 py-0.5 rounded-full ${v === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{v}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Testimonials</h2>
        <button onClick={() => { setForm({ name: '', role: '', company: '', content: '', rating: 5, photo_url: '', status: 'published' }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add Testimonial</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search testimonials..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g. CEO)" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              </div>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Testimonial content" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Rating (1-5)</label>
                  <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="Photo URL" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-border-subtle rounded-xl text-text-muted hover:text-text-primary">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
