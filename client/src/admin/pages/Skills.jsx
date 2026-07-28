import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminSkills() {
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState({ name: '', level: 80, category: '', active: true })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getSkills(); setSkills(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) { await adminAPI.updateSkill(editing.id, form); showToast('Skill updated!') }
      else { await adminAPI.createSkill(form); showToast('Skill created!') }
      refreshSite(); setShowModal(false); setForm({ name: '', level: 80, category: '', active: true }); setEditing(null); fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving skill', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this skill?')) return
    try { await adminAPI.deleteSkill(item.id); showToast('Skill deleted!'); refreshSite(); fetchData() }
    catch (err) { showToast(err?.response?.data?.error || 'Error deleting skill', 'error') }
  }

  const columns = [
    { key: 'name', label: 'Skill' },
    { key: 'level', label: 'Level', render: (v) => `${v}%` },
    { key: 'category', label: 'Category' },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Skills</h2>
        <button onClick={() => { setForm({ name: '', level: 80, category: '', active: true }); setEditing(null); setShowModal(true) }} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">Add Skill</button>
      </div>
      <DataTable columns={columns} data={skills} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search skills..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Skill' : 'Add Skill'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Skill name" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Level: {form.level}%</label>
                  <input type="range" value={form.level} onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })} min={1} max={100} className="w-full" />
                </div>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
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
