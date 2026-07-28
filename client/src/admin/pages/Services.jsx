import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const defaultForm = { title: '', description: '', icon: '', status: 'published', order: 0 }

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getServices(); setServices(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) { await adminAPI.updateService(editing.id, form); showToast('Service updated!') }
      else { await adminAPI.createService(form); showToast('Service created!') }
      refreshSite()
      setShowModal(false); setForm(defaultForm); setEditing(null); fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving service', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this service?')) return
    try { await adminAPI.deleteService(item.id); showToast('Service deleted!'); refreshSite(); fetchData() }
    catch (err) { showToast(err?.response?.data?.error || 'Error deleting service', 'error') }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', render: (v) => <span className={`px-2 py-1 rounded-full text-xs ${v === 'published' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-text-muted'}`}>{v}</span> },
    { key: 'order', label: 'Order' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Services</h2>
        <button onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true) }} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">Add Service</button>
      </div>
      <DataTable columns={columns} data={services} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search services..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Service' : 'Add Service'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service Title" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Icon name" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} placeholder="Order" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              </div>
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
