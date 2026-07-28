import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminHero() {
  const [form, setForm] = useState({
    name: '', title: '', subtitle: '', badge_text: '',
    typing_titles: '', intro_paragraph: '', photo_url: '', resume_url: '',
  })
  const [heroId, setHeroId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadHero() }, [])

  const loadHero = async () => {
    try {
      const res = await adminAPI.getHero()
      const data = res.data
      if (data) {
        setHeroId(data.id)
        setForm({
          name: data.name || '',
          title: data.title || '',
          subtitle: data.subtitle || '',
          badge_text: data.badge_text || '',
          typing_titles: Array.isArray(data.typing_titles) ? data.typing_titles.join('\n') : '',
          intro_paragraph: data.intro_paragraph || '',
          photo_url: data.photo_url || '',
          resume_url: data.resume_url || '',
        })
      }
    } catch (err) {
      console.error('Error loading hero:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...(heroId && { id: heroId }),
        name: form.name,
        title: form.title,
        subtitle: form.subtitle,
        badge_text: form.badge_text,
        typing_titles: form.typing_titles.split('\n').filter(t => t.trim()),
        intro_paragraph: form.intro_paragraph,
        photo_url: form.photo_url,
        resume_url: form.resume_url,
      }
      await adminAPI.updateHero(payload)
      showToast('Hero section saved!')
      refreshSite()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error saving hero section', 'error')
      console.error('Hero save error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">Hero Section</h2>
      <p className="text-text-muted text-sm mb-6">All text on the homepage hero is editable here.</p>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Main Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Your Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Title (appears below name)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Subtitle</label>
              <textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={2} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Intro Paragraph</label>
              <textarea value={form.intro_paragraph} onChange={(e) => setForm({ ...form, intro_paragraph: e.target.value })} rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Badge Text</label>
              <input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Typing Titles (one per line)</label>
              <textarea value={form.typing_titles} onChange={(e) => setForm({ ...form, typing_titles: e.target.value })} rows={4} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" placeholder="Graphic Designer\nBrand Identity Designer\nUI Designer\nMotion Designer" />
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
              <label className="block text-xs text-text-muted mb-1">Resume URL</label>
              <input value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
