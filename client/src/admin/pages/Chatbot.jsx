import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'

const MODEL_OPTIONS = [
  { value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (recommended)' },
  { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (fast)' },
  { value: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
]

export default function AdminChatbot() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)

  const defaults = {
    greeting: '👋 Hi! I\'m Ali\'s AI assistant. Ask me about his work or how to get started!',
    system_prompt: '',
    model: 'openai/gpt-oss-120b',
    temperature: 0.7,
    max_tokens: 500,
    enabled: true
  }

  useEffect(() => { loadConfig() }, [])

  const loadConfig = async () => {
    try {
      const res = await adminAPI.getChatbotConfig()
      const data = res.data
      if (data) {
        setForm({
          greeting: data.greeting || defaults.greeting,
          system_prompt: data.system_prompt || '',
          model: data.model || defaults.model,
          temperature: data.temperature ?? defaults.temperature,
          max_tokens: data.max_tokens || defaults.max_tokens,
          enabled: data.enabled ?? true,
          id: data.id
        })
      } else {
        setForm(defaults)
      }
    } catch (err) {
      console.error('Error loading chatbot config:', err)
      setForm(defaults)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form) return
    setLoading(true)
    try {
      await adminAPI.updateChatbotConfig(form)
      showToast('Chatbot config saved!')
      refreshSite()
    } catch (err) {
      showToast('Error saving config: ' + (err.response?.data?.error || err.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">Chatbot Configuration</h2>
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        <input value={form.greeting} onChange={(e) => setForm({ ...form, greeting: e.target.value })} placeholder="Greeting message" className={inputClass} />
        <textarea value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} placeholder="System prompt (instructions for the AI)" rows={6} className={`${inputClass} resize-none`} />
        <div className="grid grid-cols-3 gap-4">
          <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass}>
            {form.model && !MODEL_OPTIONS.some(m => m.value === form.model) && (
              <option value={form.model}>{form.model} (unlisted)</option>
            )}
            {MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div>
            <label className="block text-xs text-text-muted mb-1">Temperature: {form.temperature}</label>
            <input type="range" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })} min={0} max={1} step={0.1} className="w-full" />
          </div>
          <input type="number" value={form.max_tokens} onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 500 })} placeholder="Max tokens" className={inputClass} />
        </div>
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="rounded border-border-subtle" />
          <span className="text-text-primary">Enable Chatbot</span>
        </label>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Config'}
        </button>
      </form>
    </div>
  )
}
