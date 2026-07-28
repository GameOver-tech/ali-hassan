import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const PLATFORM_OPTIONS = [
  'behance', 'linkedin', 'dribbble', 'twitter', 'instagram',
  'facebook', 'youtube', 'github', 'medium', 'whatsapp', 'website', 'other'
]

export default function AdminSocialLinks() {
  const [links, setLinks] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newLink, setNewLink] = useState({ platform: '', url: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getSocialLinks(); setLinks(data) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const toggleActive = async (item) => {
    try {
      await adminAPI.updateSocialLink(item.id, { active: !item.active })
      refreshSite()
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error updating social link', 'error')
    }
  }

  const updateUrl = async (item, url) => {
    try {
      await adminAPI.updateSocialLink(item.id, { url })
      refreshSite()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error updating URL', 'error')
    }
    fetchData()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newLink.platform || !newLink.url) return
    setLoading(true)
    try {
      await adminAPI.createSocialLink(newLink)
      showToast('Social link added!')
      refreshSite()
      setNewLink({ platform: '', url: '' })
      setShowAdd(false)
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error adding social link', 'error')
    }
    setLoading(false)
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.platform}" social link?`)) return
    try {
      await adminAPI.deleteSocialLink(item.id)
      showToast('Social link deleted!')
      refreshSite()
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error deleting social link', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Social Links</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center space-x-2 px-5 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">
          <FiPlus /><span>Add New</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4 p-6 mb-6 rounded-2xl bg-bg-card border border-border-subtle">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-text-muted mb-1">Platform</label>
            <select value={newLink.platform} onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })} required className="w-full px-4 py-2.5 bg-bg-glass border border-border-subtle rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent/30 transition-colors">
              <option value="">Select platform</option>
              {PLATFORM_OPTIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs text-text-muted mb-1">URL</label>
            <input value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://..." required className="w-full px-4 py-2.5 bg-bg-glass border border-border-subtle rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent/30 transition-colors" />
          </div>
          <button type="submit" disabled={loading} className="flex items-center space-x-2 px-5 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
            <FiSave /><span>{loading ? 'Adding...' : 'Add'}</span>
          </button>
        </form>
      )}

      <div className="grid gap-3 max-w-3xl">
        {links.map((link) => (
          <div key={link.id} className="flex items-center space-x-3 p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-border-visible transition-all">
            <span className="w-24 text-sm font-medium capitalize text-text-primary">{link.platform}</span>
            <input value={link.url} onChange={(e) => updateUrl(link, e.target.value)} className="flex-1 px-3 py-2 bg-bg-glass border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent/30 transition-colors" />
            <button onClick={() => toggleActive(link)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${link.active ? 'bg-accent/10 text-accent' : 'bg-white/5 text-text-muted'}`}>
              {link.active ? 'Active' : 'Inactive'}
            </button>
            <button onClick={() => handleDelete(link)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all"><FiTrash2 size={15} /></button>
          </div>
        ))}
        {links.length === 0 && (<p className="text-text-muted text-center py-12">No social links yet. Click "Add New" to create one.</p>)}
      </div>
    </div>
  )
}
