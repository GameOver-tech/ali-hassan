import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminAbout() {
  const [form, setForm] = useState({ bio: '', mission: '', vision: '', photo_url: '', cv_url: '' })
  const [aboutId, setAboutId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadAbout() }, [])

  const loadAbout = async () => {
    try {
      const res = await adminAPI.getAbout()
      const data = res.data
      if (data) {
        setAboutId(data.id)
        setForm({
          bio: data.bio || '',
          mission: data.mission || '',
          vision: data.vision || '',
          photo_url: data.photo_url || '',
          cv_url: data.cv_url || '',
        })
      }
    } catch (err) {
      console.error('Error loading about:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...(aboutId && { id: aboutId }), ...form }
      await adminAPI.updateAbout(payload)
      showToast('About section saved!')
      refreshSite()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error saving about section', 'error')
      console.error('About save error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">About Section</h2>
      <p className="text-text-muted text-sm mb-6">These values appear on the About page — bio, mission/vision cards, and the download CV button.</p>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Bio & Story</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Mission</label>
              <textarea value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Vision</label>
              <textarea value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Media</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Photo URL</label>
              <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" placeholder="https://..." />
              {form.photo_url && <img src={form.photo_url} alt="preview" className="mt-2 w-32 h-32 rounded-xl object-cover" />}
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">CV / Resume URL</label>
              <input value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" placeholder="https://..." />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
