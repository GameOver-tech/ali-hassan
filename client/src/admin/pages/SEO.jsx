import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

export default function AdminSEO() {
  const [form, setForm] = useState({ meta_title: '', meta_description: '', og_title: '', og_description: '', og_image: '', keywords: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    adminAPI.getSEO().then((res) => {
      if (res.data) setForm(prev => ({ ...prev, ...res.data }))
    }).catch((err) => showToast(err?.response?.data?.error || 'Error loading', 'error'))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.updateSEO({ id: form.id || undefined, ...form })
      showToast('SEO settings saved!')
      refreshSite()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error saving SEO settings', 'error')
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"
  const textareaClass = "w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none"

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">SEO Settings</h2>
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="Meta Title" className={inputClass} />
        <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} placeholder="Meta Description" rows={3} className={textareaClass} />
        <div className="grid grid-cols-2 gap-4">
          <input value={form.og_title} onChange={(e) => setForm({ ...form, og_title: e.target.value })} placeholder="OG Title" className={inputClass} />
          <input value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} placeholder="OG Image URL" className={inputClass} />
        </div>
        <textarea value={form.og_description} onChange={(e) => setForm({ ...form, og_description: e.target.value })} placeholder="OG Description" rows={2} className={textareaClass} />
        <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="Keywords (comma separated)" className={inputClass} />
        <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save SEO'}
        </button>
      </form>
    </div>
  )
}
