import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getCategories(); setCategories(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await adminAPI.createCategory({ name })
      showToast('Category added!')
      refreshSite()
      setName('')
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error adding category', 'error')
    }
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? Projects using this category will become uncategorized.`)) return
    try {
      await adminAPI.deleteCategory(id)
      showToast('Category deleted!')
      refreshSite()
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error deleting category', 'error')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">Categories</h2>
      <form onSubmit={handleAdd} className="flex space-x-4 mb-8">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required className="flex-1 px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
        <button type="submit" disabled={loading} className="px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">Add</button>
      </form>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle">
            <span className="text-text-primary">{cat.name}</span>
            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-text-muted hover:text-red-400 transition-colors text-sm">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
