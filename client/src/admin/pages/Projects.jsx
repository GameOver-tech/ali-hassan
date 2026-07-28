import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const defaultForm = {
  title: '', slug: '', description: '', category: '', client: '', duration: '',
  software: '', thumbnail_url: '', project_url: '', github_url: '',
  problem: '', solution: '', status: 'published', featured: false
}

function generateSlug(title) {
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!slug) slug = 'project'
  return slug
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchData(), loadCategories()])
      .finally(() => setTableLoading(false))
  }, [])

  const loadCategories = async () => {
    try {
      const data = await adminAPI.getCategories()
      if (data) setCategories(data.map(c => c.name))
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const fetchData = async () => {
    try {
      const data = await adminAPI.getProjects()
      if (data) setProjects(data)
    } catch (err) {
      console.error('Error fetching projects:', err)
      showToast('Failed to load projects', 'error')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      showToast('Project title is required', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.slug) payload.slug = generateSlug(payload.title)

      if (editing) {
        await adminAPI.updateProject(editing.id, payload)
        showToast('Project updated!')
      } else {
        await adminAPI.createProject(payload)
        showToast('Project created!')
      }

      refreshSite()
      setShowModal(false)
      setForm(defaultForm)
      setEditing(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error'
      showToast(`Error saving project: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = useCallback((item) => {
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      description: item.description || '',
      category: item.category || '',
      client: item.client || '',
      duration: item.duration || '',
      software: item.software || '',
      thumbnail_url: item.thumbnail_url || '',
      project_url: item.project_url || '',
      github_url: item.github_url || '',
      problem: item.problem || '',
      solution: item.solution || '',
      status: item.status || 'published',
      featured: item.featured || false,
    })
    setEditing(item)
    setShowModal(true)
  }, [])

  const handleDelete = async (item) => {
    if (!confirm('Delete this project?')) return
    try {
      await adminAPI.deleteProject(item.id)
      showToast('Project deleted!')
      refreshSite()
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error deleting project', 'error')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (v) => v ? <span>{v}</span> : <span className="text-text-muted italic text-xs">None</span> },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs ${v === 'published' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-text-muted'}`}>
          {v}
        </span>
      ),
    },
    { key: 'featured', label: 'Featured', render: (v) => v ? <span className="text-accent">★</span> : '-' },
  ]

  if (tableLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"
  const textareaClass = "w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Projects</h2>
        <button onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">
          Add Project
        </button>
      </div>

      <DataTable columns={columns} data={projects} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search projects..." />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Project' : 'Add Project'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project Title" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" rows={3} className={textareaClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    <option value="">Select category</option>
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Client</label>
                  <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Duration</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 weeks" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Software Used</label>
                  <input value={form.software} onChange={(e) => setForm({ ...form, software: e.target.value })} placeholder="e.g. Photoshop, Illustrator" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Thumbnail URL</label>
                <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." className={inputClass} />
                {form.thumbnail_url && <img src={form.thumbnail_url} alt="preview" className="mt-2 w-32 h-20 rounded-lg object-cover" />}
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Project URL</label>
                <input value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">GitHub URL</label>
                <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">The Problem</label>
                  <textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="What problem did this project solve?" rows={2} className={textareaClass} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">The Solution</label>
                  <textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} placeholder="How did you solve it?" rows={2} className={textareaClass} />
                </div>
              </div>
              <div className="flex items-center space-x-6 pt-2">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2 text-sm pt-4">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-border-subtle" />
                  <span className="text-text-primary">Featured</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); setEditing(null) }} className="px-6 py-2.5 border border-border-subtle rounded-xl text-text-muted hover:text-text-primary transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center space-x-2">
                  {loading && <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />}
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
