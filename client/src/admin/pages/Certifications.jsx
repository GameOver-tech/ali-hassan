import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'
import { refreshSite } from '../../utils/refresh'
import { FiUpload, FiFile, FiX, FiImage, FiLink } from 'react-icons/fi'

function convertGoogleDriveToDirect(url) {
  if (!url) return url
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`
  return url
}

function getFileName(url) {
  if (!url) return ''
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `Google Drive (${match[1].slice(0, 8)}...)`
  const parts = url.split('/')
  return parts[parts.length - 1] || 'file'
}

export default function AdminCertifications() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', issuer: '', issue_date: '', expiry_date: '', description: '', image_url: '', pdf_url: '', order: 0, active: true })
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const data = await adminAPI.getCertifications(); setItems(data || []) } catch (err) { showToast(err?.response?.data?.error || 'Error loading', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
      }
      if (editing) { await adminAPI.updateCertification(editing.id, payload); showToast('Certification updated!') }
      else { await adminAPI.createCertification(payload); showToast('Certification created!') }
      refreshSite(); setShowModal(false); setEditing(null)
      setForm({ title: '', issuer: '', issue_date: '', expiry_date: '', description: '', image_url: '', pdf_url: '', order: 0, active: true })
      fetchData()
    } catch (err) { showToast(err?.response?.data?.error || 'Error saving', 'error') }
    setLoading(false)
  }

  const handleEdit = (item) => { setForm(item); setEditing(item); setShowModal(true) }
  const handleDelete = async (item) => {
    if (!confirm('Delete this certification?')) return
    try { await adminAPI.deleteCertification(item.id); showToast('Deleted!'); refreshSite(); fetchData() } catch (err) { showToast(err?.response?.data?.error || 'Error deleting', 'error') }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await adminAPI.uploadCertificationFile(file)
      if (data?.url) {
        const isImage = file.type.startsWith('image/')
        if (isImage) {
          setForm({ ...form, image_url: data.url })
        } else {
          setForm({ ...form, pdf_url: data.url })
        }
        showToast('File uploaded!')
      }
    } catch (err) {
      showToast(err?.response?.data?.error || 'Upload failed', 'error')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const columns = [
    { key: 'title', label: 'Certification', render: (v) => <span className="max-w-xs truncate block">{v}</span> },
    { key: 'issuer', label: 'Issuer' },
    {
      key: 'pdf_url', label: 'File',
      render: (v, row) => {
        if (row.image_url) return <span className="text-accent text-xs">Image ✓</span>
        if (v) return <span className="text-accent text-xs">PDF ✓</span>
        return <span className="text-text-muted text-xs">—</span>
      }
    },
    { key: 'active', label: 'Active', render: (v) => v ? <span className="text-accent">✓</span> : '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold">Certifications</h2>
        <button onClick={() => { setForm({ title: '', issuer: '', issue_date: '', expiry_date: '', description: '', image_url: '', pdf_url: '', order: 0, active: true }); setEditing(null); setShowModal(true) }}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">Add Certification</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search certifications..." />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-bold mb-6">{editing ? 'Edit Certification' : 'Add Certification'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Certification title" required className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Issuer (e.g., AWS)" className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm text-text-muted">Issue Date
                  <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                </label>
                <label className="text-sm text-text-muted">Expiry Date
                  <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
                </label>
              </div>

              {/* File Upload & PDF URL */}
              <div className="p-4 rounded-xl bg-bg-glass border border-border-subtle space-y-3">
                <label className="block text-sm text-text-muted font-medium">Certificate File (PDF or Image)</label>

                {/* Upload from computer */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm hover:bg-accent/20 transition-all disabled:opacity-50">
                    <FiUpload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                  <span className="text-xs text-text-muted self-center">or paste a link below</span>
                </div>

                {/* Google Drive / PDF URL input */}
                <div className="relative">
                  <FiLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="url" value={form.pdf_url || ''}
                    onChange={(e) => setForm({ ...form, pdf_url: e.target.value, image_url: form.image_url || '' })}
                    placeholder="Google Drive share link or any PDF URL..."
                    className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>

                {/* Image URL input */}
                <div className="relative">
                  <FiImage size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="url" value={form.image_url || ''}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="Certificate image URL (for image preview)..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>

                {(form.image_url || form.pdf_url) && (
                  <button type="button" onClick={() => { setForm({ ...form, image_url: '', pdf_url: '' }) }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all">
                    <FiX size={14} />
                    <span>Clear files</span>
                  </button>
                )}

                {/* Preview section */}
                {(form.image_url || form.pdf_url) && (
                  <div className="mt-2 p-4 rounded-xl bg-bg-surface border border-border-subtle">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-3">Preview — as seen on site</p>
                    <a href={`/certificate/preview`} onClick={(e) => {
                      e.preventDefault()
                      showToast('Save the certification first, then click "View Certificate" on the public site.')
                    }}
                      className="group block rounded-xl overflow-hidden border border-border-subtle bg-[#0a0c12] hover:border-accent/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-bg-glass">
                        <span className="text-[9px] uppercase tracking-widest text-text-muted font-medium">Certificate — View only</span>
                        <span className="text-[9px] text-text-muted/40">No download</span>
                      </div>
                      <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                        {form.image_url ? (
                          <img src={convertGoogleDriveToDirect(form.image_url)}
                            alt="preview" className="max-h-24 rounded-lg object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { e.target.style.display = 'none' }} />
                        ) : (
                          <FiFile size={32} className="text-accent/40 mb-2" />
                        )}
                        <p className="text-xs text-text-muted mt-2">{form.pdf_url ? getFileName(form.pdf_url) : 'No PDF link'}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-accent/60 group-hover:text-accent transition-colors">
                          <span>Click to view full page</span>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* Empty state placeholder */}
                {!form.image_url && !form.pdf_url && (
                  <div className="mt-2 p-4 rounded-xl bg-bg-surface border border-dashed border-border-subtle text-center">
                    <FiFile size={24} className="mx-auto text-text-muted mb-2" />
                    <p className="text-xs text-text-muted">Upload a PDF or paste a Google Drive link</p>
                    <div className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle">
                      <p className="text-xs text-text-muted">certificate-name.pdf</p>
                      <div className="mt-1 h-1 w-20 mx-auto rounded-full bg-white/5">
                        <div className="h-full w-3/5 rounded-full bg-accent/30" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-bg-glass border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent/30" />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border-subtle" /><span>Active</span></label>
                <div className="flex items-center space-x-2 text-sm"><label>Order:</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="w-20 px-3 py-2 bg-bg-glass border border-border-subtle rounded-xl text-text-primary" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-border-subtle rounded-xl text-text-muted hover:text-text-primary">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
