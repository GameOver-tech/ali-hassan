import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminCertifications() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', issuer: '', credential_url: '', issue_date: '', expiry_date: '', description: '', order: 0, active: true })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getCertifications(); setItems(data || []) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
      }
      if (editing) { await adminAPI.updateCertification(editing.id, payload); showToast('Certification updated!') }
      else { await adminAPI.createCertification(payload); showToast('Certification created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ title: '', issuer: '', credential_url: '', issue_date: '', expiry_date: '', description: '', order: 0, active: true })
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this certification?')) return
    try { await adminAPI.deleteCertification(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch (err) { showToast(err?.response?.data?.error || 'Error deleting', 'error') }
  }

  const columns = [
    { key: 'title', label: 'Certification', render: (v) => <span className="max-w-xs truncate block">{v}</span> },
    { key: 'issuer', label: 'Issuer' },
    { key: 'credential_url', label: 'Link', render: (v) => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs">View</a> : '-' },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Certifications</h2>
        <button onClick={() => { setForm({ title: '', issuer: '', credential_url: '', issue_date: '', expiry_date: '', description: '', order: 0, active: true }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add Certification</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search certifications..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Certification' : 'Add Certification'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Certification title" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Issuer (e.g., AWS)" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="Credential URL" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm text-text-muted">Issue Date
                  <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                </label>
                <label className="text-sm text-text-muted">Expiry Date
                  <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                </label>
              </div>

              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border-subtle" /><span>Active</span></label>
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
