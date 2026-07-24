import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { pdfjs, Document, Page } from 'react-pdf'
import { FiArrowLeft } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function isGoogleDriveUrl(url) {
  return url && url.includes('drive.google.com')
}

function getGoogleDriveEmbedUrl(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview?rm=minimal&embedded=true`
  return url
}

export default function CertificateViewer() {
  const { id } = useParams()
  const { certifications } = useApp()
  const [directCert, setDirectCert] = useState(null)
  const [loading, setLoading] = useState(true)

  // First try from context, then fallback to direct Supabase query
  const contextCert = certifications?.find(c => c.id === id) || null
  const cert = contextCert || directCert

  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageWidth, setPageWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [pdfError, setPdfError] = useState(false)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [showImageFallback, setShowImageFallback] = useState(false)
  const pdfContainerRef = useRef(null)
  const wheelAccumRef = useRef(0)

  // Direct Supabase fetch if context data hasn't loaded yet
  useEffect(() => {
    if (contextCert) {
      setLoading(false)
      return
    }
    let cancelled = false
    supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setDirectCert(data || null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, contextCert])

  // Reset viewer state when cert changes
  useEffect(() => {
    setPageNumber(1)
    setPdfError(false)
    setPdfLoaded(false)
    setShowImageFallback(false)
  }, [id, cert])

  // ── Fit page-width on load & resize ──
  useEffect(() => {
    const update = () => setPageWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── PDF mouse wheel page scroll ──
  const onWheel = useCallback((e) => {
    if (!pdfLoaded || numPages <= 1) return
    wheelAccumRef.current += e.deltaY
    if (Math.abs(wheelAccumRef.current) >= 80) {
      if (wheelAccumRef.current > 0 && pageNumber < numPages) {
        setPageNumber(p => p + 1)
      } else if (wheelAccumRef.current < 0 && pageNumber > 1) {
        setPageNumber(p => p - 1)
      }
      wheelAccumRef.current = 0
    }
  }, [pdfLoaded, numPages, pageNumber])

  // ── Touch swipe for mobile page turning ──
  const touchStartRef = useRef(null)
  const onTouchStart = useCallback((e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])
  const onTouchEnd = useCallback((e) => {
    if (!touchStartRef.current || !pdfLoaded) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && pageNumber < numPages) setPageNumber(p => p + 1)
      if (dx > 0 && pageNumber > 1) setPageNumber(p => p - 1)
    }
    touchStartRef.current = null
  }, [pdfLoaded, pageNumber, numPages])

  const onLoadSuccess = useCallback(({ numPages: n }) => { setNumPages(n); setPdfLoaded(true); setPdfError(false); setPageNumber(1) }, [])
  const onLoadError = useCallback(() => { setPdfError(true); setPdfLoaded(false) }, [])

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
        <div className="text-center z-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center">
            <FiAward className="text-text-muted" size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-3">Certificate Not Found</h1>
          <p className="text-text-muted mb-6">This certificate doesn't exist or is no longer available.</p>
          <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }} className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all">
            <FiArrowLeft size={16} /> Back to About
          </Link>
        </div>
      </div>
    )
  }

  const pdfUrl = cert.pdf_url
  const imageUrl = cert.image_url
  const hasPdf = pdfUrl && !showImageFallback
  const hasImage = imageUrl && !hasPdf
  const driveEmbedUrl = getGoogleDriveEmbedUrl(pdfUrl)

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0c12] flex flex-col overflow-hidden">
      <Helmet>
        <title>{cert.title} | Certificate | Ali Hassan</title>
        <meta name="description" content={cert.description || `View ${cert.title} certificate from ${cert.issuer}`} />
      </Helmet>

      {/* Top bar — back arrow + cert heading, no external links */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[#0d0f17]/90 backdrop-blur-sm border-b border-white/[0.06]">
        <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all shrink-0">
          <FiArrowLeft size={16} />
        </Link>
        <div className="w-px h-5 bg-white/10" />
        <div className="min-w-0 flex items-center gap-3">
          <span className="text-sm font-medium text-text-primary truncate">{cert.title}</span>
          <span className="text-xs text-text-muted hidden sm:inline">— {cert.issuer}</span>
          {cert.issue_date && (
            <span className="text-xs text-text-muted/50 hidden md:inline-flex items-center gap-1">
              <FiCalendar size={10} />
              {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </span>
          )}
        </div>
        {pdfLoaded && numPages > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1}
              className="text-xs text-text-muted hover:text-white disabled:opacity-30 transition-all font-medium px-1">
              Prev
            </button>
            <span className="text-xs text-white font-mono tabular-nums">{pageNumber}/{numPages}</span>
            <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages}
              className="text-xs text-text-muted hover:text-white disabled:opacity-30 transition-all font-medium px-1">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Certificate viewer — edge-to-edge, fills remaining space */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full">
        {/* Google Drive Embedded - clipped to hide native toolbar */}
        {isGoogleDriveUrl(pdfUrl) && driveEmbedUrl && (
          <div className="w-full h-full overflow-hidden relative" style={{ clipPath: 'inset(0 0 48px 0)' }}>
            <iframe
              src={driveEmbedUrl}
              className="w-full h-full"
              style={{ border: 'none', marginBottom: '-48px', height: 'calc(100% + 48px)' }}
              title={cert.title}
            />
            {/* Invisible click interceptor over the bottom-right toolbar area */}
            <div className="absolute bottom-0 right-0 w-32 h-12 z-10 cursor-default" />
          </div>
        )}

        {/* Direct PDF */}
        {!isGoogleDriveUrl(pdfUrl) && hasPdf && (
          <div className="w-full h-full flex items-center justify-center"
            ref={pdfContainerRef}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}>

            {!pdfLoaded && !pdfError && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                <p className="text-sm text-text-muted">Loading certificate...</p>
              </div>
            )}
            {pdfError && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                  <FiAward className="text-red-400" size={24} />
                </div>
                <h3 className="text-base font-heading font-semibold text-text-primary mb-1">Could not load PDF</h3>
                <p className="text-sm text-text-muted mb-4 max-w-md">The certificate file could not be displayed directly.</p>
                {cert.image_url ? (
                  <button onClick={() => setShowImageFallback(true)}
                    className="px-5 py-2 bg-accent/10 text-accent text-sm font-medium rounded-xl border border-accent/20 hover:bg-accent/20 transition-all">
                    Show image version instead
                  </button>
                ) : (
                  <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
                    className="px-5 py-2 bg-accent/10 text-accent text-sm font-medium rounded-xl border border-accent/20 hover:bg-accent/20 transition-all inline-block">
                    Back to certificates
                  </Link>
                )}
              </div>
            )}
            <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}
              loading={null} error={null}
              options={{ cMapUrl: '//unpkg.com/pdfjs-dist@' + pdfjs.version + '/cmaps/', cMapPacked: true }}>
              {numPages > 0 && (
                <motion.div key={`page_${pageNumber}`}
                  initial={{ opacity: 0 }}
                  animate={pdfLoaded ? { opacity: 1 } : {}}
                  transition={{ duration: 0.25 }}
                  style={{ maxWidth: '100vw' }}>
                  <Page pageNumber={pageNumber} width={pageWidth}
                    renderTextLayer={false} renderAnnotationLayer={false}
                    className="pdf-page"
                    loading={<div className="w-screen aspect-[8.5/11] bg-white/5 animate-pulse" />} />
                </motion.div>
              )}
            </Document>
          </div>
        )}

        {/* Image certificate */}
        {hasImage && (
          <img src={imageUrl} alt={cert.title}
            className="w-full h-full object-contain"
            draggable={false}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `<div class="text-center py-16"><div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><svg class="text-red-400" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div><p class="text-sm text-text-muted">Could not load image</p></div>`
            }} />
        )}

        {/* No file */}
        {!hasPdf && !hasImage && !isGoogleDriveUrl(pdfUrl) && (
          <div className="w-full max-w-xl rounded-2xl border border-dashed border-border-subtle bg-bg-card/30 p-10 sm:p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
              <FiAward className="text-accent" size={28} />
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">Certificate viewed on issuer site</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              {cert.title} issued by {cert.issuer} — no file attached for direct viewing.
            </p>
            <Link to="/about" state={{ from: 'certificate', tab: 'certifications' }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all">
              <FiArrowLeft size={16} /> Back to About
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
