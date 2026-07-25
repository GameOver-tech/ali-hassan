import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const defaultSectionTitles = {
  home_title: 'Ali Hassan | AI Engineer',
  home_description: 'AI Engineer building production-grade AI systems, web applications, and intelligent software.',
  featured_projects: 'Featured Projects',
  portfolio_subtitle: 'Portfolio',
  portfolio_heading: 'Selected',
  portfolio_heading_highlight: 'Projects',
  projects_view_all: 'View All Projects',
  services: 'Services & Expertise',
  services_subtitle: 'Expertise',
  services_heading: 'Services &',
  services_heading_highlight: 'Capabilities',
  testimonials: 'What Clients Say',
  testimonials_subtitle: 'Testimonials',
  testimonials_heading: 'Client',
  testimonials_heading_highlight: 'Feedback',
  cta_title: "Let's Create Something Amazing",
  cta_subtitle: 'Ready to elevate your brand?',
  cta_button: 'Start a Project',
  cta_button_secondary: 'View Portfolio',
}

const inputClass =
  'w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none transition-colors'
const textareaClass =
  'w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none transition-colors resize-none'

export default function AdminSettings() {
  const [form, setForm] = useState({
    site_name: 'Ali Hassan', site_description: '', contact_email: '',
    phone: '', address: '', whatsapp: '', copyright_text: '',
    logo_text: 'AH', logo_image_url: '', section_titles: JSON.stringify(defaultSectionTitles),
  })
  const [loading, setLoading] = useState(false)
  const [settingsId, setSettingsId] = useState(null)

  const sectionTitleFields = [
    'home_title', 'home_description',
    'featured_projects', 'portfolio_subtitle', 'portfolio_heading', 'portfolio_heading_highlight', 'projects_view_all',
    'services', 'services_subtitle', 'services_heading', 'services_heading_highlight',
    'testimonials', 'testimonials_subtitle', 'testimonials_heading', 'testimonials_heading_highlight',
    'cta_title', 'cta_subtitle', 'cta_button', 'cta_button_secondary',
  ]

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    try {
      const res = await adminAPI.getSettings()
      const data = res.data
      if (data) {
        setSettingsId(data.id)
        setForm({
          site_name: data.site_name || 'Ali Hassan',
          site_description: data.site_description || '',
          contact_email: data.contact_email || '',
          phone: data.phone || '',
          address: data.address || '',
          whatsapp: data.whatsapp || '',
          copyright_text: data.copyright_text || '',
          logo_text: data.logo_text || 'AH',
          logo_image_url: data.logo_image_url || '',
          section_titles: JSON.stringify({ ...defaultSectionTitles, ...(data.section_titles || {}) }),
        })
      }
    } catch (err) { console.error('Error loading settings:', err) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const parsed = typeof form.section_titles === 'string' ? JSON.parse(form.section_titles) : form.section_titles
      const payload = {
        ...(settingsId && { id: settingsId }),
        site_name: form.site_name, site_description: form.site_description, contact_email: form.contact_email,
        phone: form.phone, address: form.address, whatsapp: form.whatsapp, copyright_text: form.copyright_text,
        logo_text: form.logo_text, logo_image_url: form.logo_image_url, section_titles: parsed,
      }
      await adminAPI.updateSettings(payload)
      showToast('Settings saved!')
      refreshSite()
    } catch (err) {
      showToast('Error saving settings', 'error')
    } finally { setLoading(false) }
  }

  const titles = typeof form.section_titles === 'string' ? JSON.parse(form.section_titles) : form.section_titles

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-8">Site Settings</h2>
      <p className="text-sm mb-6 text-text-muted">These values appear across your website — footer, contact page, homepage sections, and copyright.</p>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Brand */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Brand</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Site Name</label>
              <input className={inputClass} value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Site Description / Footer Bio</label>
              <textarea className={textareaClass} value={form.site_description} onChange={e => setForm(f => ({ ...f, site_description: e.target.value }))} rows={3} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Copyright Text</label>
              <input className={inputClass} value={form.copyright_text} onChange={e => setForm(f => ({ ...f, copyright_text: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Logo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Logo Text</label>
              <input className={inputClass} value={form.logo_text} onChange={e => setForm(f => ({ ...f, logo_text: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Logo Image URL</label>
              <input className={inputClass} value={form.logo_image_url} onChange={e => setForm(f => ({ ...f, logo_image_url: e.target.value }))} placeholder="https://..." />
              {form.logo_image_url && <img src={form.logo_image_url} alt="logo preview" className="mt-2 h-10 w-auto" />}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Contact Email</label>
              <input className={inputClass} value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} type="email" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Phone</label>
              <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Address</label>
              <input className={inputClass} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">WhatsApp Number</label>
              <input className={inputClass} value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Homepage Section Titles */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
          <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">Homepage Section Titles</h3>
          <div className="space-y-4">
            {sectionTitleFields.map(key => (
              <div key={key}>
                <label className="block text-xs text-text-muted mb-1">{key.replace(/_/g, ' ')}</label>
                <input className={inputClass} value={titles[key] || ''} onChange={e => {
                  const parsed = typeof form.section_titles === 'string' ? JSON.parse(form.section_titles) : form.section_titles
                  const raw = JSON.stringify({ ...parsed, [key]: e.target.value })
                  setForm(f => ({ ...f, section_titles: raw }))
                }} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] transition-all duration-300 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  )
}
