import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminExperience() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', company: '', location: '', start_date: '', end_date: '', description: '', current: false, order: 0 })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getExperience(); setItems(data || []) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert empty date strings to null so Supabase DATE columns don't reject them
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }
      if (editing) { await adminAPI.updateExperience(editing.id, payload); showToast('Experience updated!') }
      else { await adminAPI.createExperience(payload); showToast('Experience created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ title: '', company: '', location: '', start_date: '', end_date: '', description: '', current: false, order: 0 })
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this experience entry?')) return
    try { await adminAPI.deleteExperience(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch (err) { showToast(err?.response?.data?.error || 'Error deleting', 'error') }
  }

  const columns = [
    { key: 'title', label: 'Position' },
    { key: 'company', label: 'Company' },
    { key: 'location', label: 'Location' },
    { key: 'current', label: 'Current', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
    { key: 'start_date', label: 'Start', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Experience</h2>
        <button onClick={() => { setForm({ title: '', company: '', location: '', start_date: '', end_date: '', description: '', current: false, order: 0 }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add Experience</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search experience..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Experience' : 'Add Experience'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Position title" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              </div>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} disabled={form.current} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 disabled:opacity-50" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked, end_date: e.target.checked ? '' : form.end_date })} className="rounded border-border-subtle" /><span>Current position</span></label>
                <div className="flex items-center space-x-2 text-sm"><label>Order:</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="w-20 px-3 py-2 bg-bg-glass border border-border-subtle rounded-xl text-text-primary" /></div>
              </div>
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
