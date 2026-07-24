import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminEducation() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ degree: '', institution: '', year: '', description: '', status: 'active', order: 0 })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getEducation(); setItems(data || []) } catch {}
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) { await adminAPI.updateEducation(editing.id, form); showToast('Education updated!') }
      else { await adminAPI.createEducation(form); showToast('Education created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ degree: '', institution: '', year: '', description: '', status: 'active', order: 0 })
      fetchData()
    } catch { showToast('Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this education entry?')) return
    try { await adminAPI.deleteEducation(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch { showToast('Error deleting', 'error') }
  }

  const columns = [
    { key: 'degree', label: 'Degree' },
    { key: 'institution', label: 'Institution' },
    { key: 'year', label: 'Year' },
    { key: 'status', label: 'Status', render: (v) => <span className={v === 'active' ? 'text-accent' : 'text-text-muted'}>{v}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Education</h2>
        <button onClick={() => { setForm({ degree: '', institution: '', year: '', description: '', status: 'active', order: 0 }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add Education</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search education..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Education' : 'Add Education'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree name" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Institution" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Year (e.g., 2024 - Present)" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="w-20 px-3 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary" />
                </div>
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
