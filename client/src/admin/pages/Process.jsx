import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminProcess() {
  const [steps, setSteps] = useState([])
  const [form, setForm] = useState({ step: '', title: '', description: '', order: 0, active: true })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getProcessSteps(); setSteps(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, order: parseInt(form.order) || 0 }
    try {
      if (editing) { await adminAPI.updateProcessStep(editing.id, payload); showToast('Step updated!') }
      else { await adminAPI.createProcessStep(payload); showToast('Step created!') }
      refreshSite(); setShowModal(false); setForm({ step: '', title: '', description: '', order: 0, active: true }); setEditing(null); fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving step', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this process step?')) return
    try { await adminAPI.deleteProcessStep(item.id); showToast('Step deleted!'); refreshSite(); fetchData() }
    catch (err) { showToast(err?.response?.data?.error || 'Error deleting step', 'error') }
  }

  const columns = [
    { key: 'step', label: 'Step #' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', render: (v) => v?.length > 60 ? v.slice(0, 60) + '...' : v },
    { key: 'order', label: 'Order' },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Process Steps</h2>
        <button onClick={() => { setForm({ step: '', title: '', description: '', order: steps.length + 1, active: true }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">Add Step</button>
      </div>
      <p className="text-sm text-text-muted mb-6">These cards appear in the "My Development Process" section on the Services page.</p>
      <DataTable columns={columns} data={steps} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search steps..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Step' : 'Add Step'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Step Number</label>
                  <input value={form.step} onChange={(e) => setForm({ ...form, step: e.target.value })} placeholder="01" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Discovery" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" required rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
              </div>
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border-subtle" />
                <span className="text-text-primary">Active</span>
              </label>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-border-subtle rounded-xl text-text-muted hover:text-text-primary transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
