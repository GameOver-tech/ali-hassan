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

export default function AdminSettings() {
  const [form, setForm] = useState({
    site_name: 'Ali Hassan', site_description: '', contact_email: '',
    phone: '', address: '', whatsapp: '', copyright_text: '',
    logo_text: 'AH', logo_image_url: '', section_titles: JSON.stringify(defaultSectionTitles),
  })
  const [loading, setLoading] = useState(false)
  const [settingsId, setSettingsId] = useState(null)

  const getSectionTitles = () => {
    try { return typeof form.section_titles === 'string' ? JSON.parse(form.section_titles) : form.section_titles }
    catch { return defaultSectionTitles }
  }

  const updateSectionTitle = (key, value) => {
    const current = getSectionTitles()
    setForm({ ...form, section_titles: JSON.stringify({ ...current, [key]: value }) })
  }

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
      const payload = {
        ...(settingsId && { id: settingsId }),
        site_name: form.site_name, site_description: form.site_description, contact_email: form.contact_email,
        phone: form.phone, address: form.address, whatsapp: form.whatsapp, copyright_text: form.copyright_text,
        logo_text: form.logo_text, logo_image_url: form.logo_image_url, section_titles: getSectionTitles(),
      }
      await adminAPI.updateSettings(payload)
      showToast('Settings saved!')
      refreshSite()
    } catch (err) {
      showToast('Error saving settings', 'error')
    } finally { setLoading(false) }
  }

  const titles = getSectionTitles()
  const Input = (props) => <input {...props} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none transition-colors" />
  const TextArea = (props) => <textarea {...props} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none transition-colors resize-none" />
  const Label = ({ children }) => <label className="block text-xs text-text-muted mb-1">{children}</label>
  const Section = ({ title, children }) => (
    <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
      <h3 className="text-lg font-heading font-semibold mb-4 text-text-primary">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-8">Site Settings</h2>
      <p className="text-sm mb-6 text-text-muted">These values appear across your website — footer, contact page, homepage sections, and copyright.</p>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <Section title="Brand">
          <div><Label>Site Name</Label><Input value={form.site_name} onChange={e => setForm({ ...form, site_name: e.target.value })} /></div>
          <div><Label>Site Description / Footer Bio</Label><TextArea value={form.site_description} onChange={e => setForm({ ...form, site_description: e.target.value })} rows={3} /></div>
          <div><Label>Copyright Text</Label><Input value={form.copyright_text} onChange={e => setForm({ ...form, copyright_text: e.target.value })} /></div>
        </Section>
        <Section title="Logo">
          <div><Label>Logo Text</Label><Input value={form.logo_text} onChange={e => setForm({ ...form, logo_text: e.target.value })} /></div>
          <div><Label>Logo Image URL</Label><Input value={form.logo_image_url} onChange={e => setForm({ ...form, logo_image_url: e.target.value })} placeholder="https://..." />{form.logo_image_url && <img src={form.logo_image_url} alt="logo preview" className="mt-2 h-10 w-auto" />}</div>
        </Section>
        <Section title="Contact Information">
          <div><Label>Contact Email</Label><Input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} type="email" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>WhatsApp Number</Label><Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
        </Section>
        <Section title="Homepage Section Titles">
          {sectionTitleFields.map(key => (
            <div key={key}><Label>{key.replace(/_/g, ' ')}</Label><Input value={titles[key] || ''} onChange={e => updateSectionTitle(key, e.target.value)} /></div>
          ))}
        </Section>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] transition-all duration-300 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  )
}
