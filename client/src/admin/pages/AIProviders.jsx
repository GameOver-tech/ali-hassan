import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const PROVIDERS = [
  { value: 'groq', label: 'Groq' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openrouter', label: 'OpenRouter' },
]

const SUGGESTED_MODELS = {
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.0-flash',
  openrouter: 'openai/gpt-4o-mini',
}

export default function AdminAIProviders() {
  const [providers, setProviders] = useState([])
  const [form, setForm] = useState({ provider_name: '', api_key: '', model: '', status: 'active', priority: 1, is_default: false })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const data = await adminAPI.getAIProviders()
      setProviders(data || [])
    } catch (err) { showToast(err?.response?.data?.error || 'Error loading providers', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        // Update non-key fields first
        const { api_key, ...safeFields } = form
        await adminAPI.updateAIProvider(editing.id, safeFields)
        // If a new API key was entered, send it via the secure endpoint
        if (api_key && api_key !== '••••••••') {
          await adminAPI.updateAIProviderApiKey(editing.id, api_key)
        }
        showToast('Provider updated!')
      } else {
        await adminAPI.createAIProvider(form)
        showToast('Provider created!')
      }
      refreshSite()
      setShowModal(false)
      setEditing(null)
      setForm({ provider_name: '', api_key: '', model: '', status: 'active', priority: 1, is_default: false })
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving provider', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => {
    // Don't show the actual API key — show masked placeholder
    setForm({
      provider_name: item.provider_name || '',
      api_key: '••••••••',
      model: item.model || '',
      status: item.status || 'active',
      priority: item.priority || 1,
      is_default: item.is_default || false,
    })
    setEditing(item)
    setShowModal(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this AI provider?')) return
    try {
      await adminAPI.deleteAIProvider(item.id)
      showToast('Provider deleted!')
      refreshSite()
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error deleting provider', 'error') }
  }

  const handleProviderChange = (name) => {
    setForm({ ...form, provider_name: name, model: SUGGESTED_MODELS[name] || '' })
  }

  const columns = [
    { key: 'provider_name', label: 'Provider', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'model', label: 'Model' },
    { key: 'has_key', label: 'API Key', render: (v) => v ? <span className="text-accent text-xs">✓ Configured</span> : <span className="text-text-muted text-xs">—</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={v === 'active' ? 'text-green-400' : 'text-red-400'}>{v}</span> },
    { key: 'priority', label: 'Priority' },
    { key: 'is_default', label: 'Default', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">AI Providers</h2>
        <button onClick={() => { setForm({ provider_name: '', api_key: '', model: '', status: 'active', priority: 1, is_default: false }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300">Add Provider</button>
      </div>
      <DataTable columns={columns} data={providers} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search providers..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Provider' : 'Add Provider'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <select value={form.provider_name} onChange={(e) => handleProviderChange(e.target.value)} required
                className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors">
                <option value="">Select provider...</option>
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder={editing ? "Leave as-is or enter new key" : "API Key"} required={!editing}
                className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" required
                className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Priority</label>
                  <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} min={1} max={10}
                    className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30 transition-colors">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded border-border-subtle" />
                <span className="text-text-primary">Set as default provider</span>
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
