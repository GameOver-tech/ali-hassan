import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminFAQs() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', order: 0, active: true })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getFAQs(); setItems(data || []) } catch {}
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) { await adminAPI.updateFAQ(editing.id, form); showToast('FAQ updated!') }
      else { await adminAPI.createFAQ(form); showToast('FAQ created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ question: '', answer: '', category: 'General', order: 0, active: true })
      fetchData()
    } catch { showToast('Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this FAQ?')) return
    try { await adminAPI.deleteFAQ(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch { showToast('Error deleting', 'error') }
  }

  const columns = [
    { key: 'question', label: 'Question', render: (v) => <span className="max-w-xs truncate block">{v}</span> },
    { key: 'category', label: 'Category' },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">FAQs</h2>
        <button onClick={() => { setForm({ question: '', answer: '', category: 'General', order: 0, active: true }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add FAQ</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search FAQs..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit FAQ' : 'Add FAQ'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Question" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Answer" rows={4} required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                <div>
                  <label className="block text-sm text-text-muted mb-1">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary" />
                </div>
              </div>
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border-subtle" /><span>Active</span></label>
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
