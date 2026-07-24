import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowLeft, FiExternalLink, FiCalendar, FiAward, FiCheckCircle } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function CertificateViewer() {
  const { id } = useParams()
  const { certifications } = useApp()
  const [directCert, setDirectCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const contextCert = certifications?.find(c => c.id === id) || null
  const cert = contextCert || directCert

  useEffect(() => {
    if (contextCert) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) { setDirectCert(data || null); setLoading(false) }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, contextCert])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          <p className="text-sm text-text-muted">Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center z-20 max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center">
            <FiAward className="text-text-muted" size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-3">Certificate Not Found</h1>
          <p className="text-text-muted mb-6">This certificate doesn't exist or is no longer available.</p>
          <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all">
            <FiArrowLeft size={16} /> Back to About
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{cert.title} | Certificate | Ali Hassan</title>
        <meta name="description" content={cert.description || `View ${cert.title} certificate from ${cert.issuer}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 bg-[#0d0f17]/90 backdrop-blur-sm border-b border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14 sm:h-16">
              <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors">
                <FiArrowLeft size={16} />
                <span>Back to About</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Certificate header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-neural/20 flex items-center justify-center border border-accent/10"
              >
                <FiAward className="text-accent" size={28} />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-text-primary mb-2">{cert.title}</h1>
              <p className="text-base sm:text-lg text-accent font-medium">{cert.issuer}</p>
            </div>

            {/* Certificate image card */}
            {cert.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="rounded-2xl border border-border-subtle bg-[#0a0c12] overflow-hidden shadow-elevated"
              >
                {!imageLoaded && (
                  <div className="flex items-center justify-center h-64 sm:h-80 bg-bg-surface animate-pulse">
                    <div className="flex flex-col items-center gap-2">
                      <FiAward className="text-text-muted/30" size={32} />
                      <p className="text-xs text-text-muted">Loading certificate...</p>
                    </div>
                  </div>
                )}
                <img
                  src={cert.image_url}
                  alt={cert.title}
                  className={`w-full object-contain max-h-[70vh] sm:max-h-[80vh] ${imageLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => { e.target.style.display = 'none'; setImageLoaded(true) }}
                />
              </motion.div>
            )}

            {/* Details card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-2xl border border-border-subtle bg-[#111827] p-6 sm:p-8 shadow-card"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {cert.issue_date && (
                    <div>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Issue Date</h3>
                      <p className="flex items-center gap-2 text-sm text-text-primary">
                        <FiCalendar size={14} className="text-accent" />
                        {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {cert.expiry_date && (
                    <div>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Expiry Date</h3>
                      <p className="flex items-center gap-2 text-sm text-text-primary">
                        <FiCalendar size={14} className="text-text-muted" />
                        {new Date(cert.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Issued By</h3>
                    <p className="text-sm text-text-primary font-medium">{cert.issuer}</p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {cert.credential_url && (
                    <div>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Credential</h3>
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-all">
                        <FiExternalLink size={14} />
                        Verify Credential
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <FiCheckCircle size={12} className="text-green-400" />
                    <span>Credential ID: {cert.id}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {cert.description && (
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{cert.description}</p>
                </div>
              )}
            </motion.div>

            {/* Footer note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors">
                <FiArrowLeft size={14} />
                <span>Back to all certifications</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
