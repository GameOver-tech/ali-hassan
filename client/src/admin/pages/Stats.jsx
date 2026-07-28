import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const defaultForm = { label: '', value: 0, suffix: '+', order: 0, active: true }

export default function AdminStats() {
  const [stats, setStats] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getStats(); setStats(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) { const res = await adminAPI.updateStat(editing.id, form); console.log(res) }
      else { await adminAPI.createStat(form) }
      showToast(editing ? 'Stat updated!' : 'Stat created!')
      refreshSite(); setShowModal(false); setForm(defaultForm); setEditing(null); fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving stat', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this stat?')) return
    try { await adminAPI.deleteStat(item.id); showToast('Stat deleted!'); refreshSite(); fetchData() }
    catch (err) { showToast(err?.response?.data?.error || 'Error deleting stat', 'error') }
  }

  const columns = [
    { key: 'label', label: 'Label' },
    { key: 'value', label: 'Value' },
    { key: 'suffix', label: 'Suffix' },
    { key: 'order', label: 'Order' },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Stats Counters</h2>
        <button onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true) }} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">Add Stat</button>
      </div>
      <DataTable columns={columns} data={stats} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search stats..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Stat' : 'Add Stat'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <div className="grid grid-cols-3 gap-4">
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })} placeholder="Value" className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                <input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="Suffix" className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} placeholder="Order" className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
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
