import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { pdfjs, Document, Page } from 'react-pdf'
import { FiArrowLeft, FiDownload, FiShare2, FiZoomIn, FiZoomOut, FiMaximize2, FiMinimize2, FiChevronLeft, FiChevronRight, FiPrinter, FiMail, FiMessageCircle, FiUser, FiClock, FiLayers, FiTag, FiImage, FiLayout } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import SectionReveal from '../components/ui/SectionReveal'
import { useApp } from '../context/AppContext'
import { staggerContainer, staggerItem } from '../animations/variants'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const TOOLBAR_HEIGHT = 64; const PDF_STANDARD_WIDTH = 612

function LoadingSkeleton() { return <div className="flex flex-col items-center space-y-6 py-12">{[1,2,3].map(i => <div key={i} className="w-full max-w-4xl aspect-[8.5/11] rounded-xl bg-white/5 animate-pulse overflow-hidden relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer" /></div>)}</div> }
function PDFError({ pdfUrl }) { return <div className="flex flex-col items-center justify-center py-20 px-4"><div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6"><FiImage className="text-red-400" size={32} /></div><h3 className="text-xl font-heading font-bold text-text-primary mb-2">Unable to load PDF</h3><p className="text-center max-w-md mb-6 text-text-muted">The PDF could not be loaded. It may be unavailable or the URL may be invalid.</p><div className="flex items-center space-x-4"><a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all">Open PDF directly</a></div></div> }

function PDFToolbar({ numPages, pageNumber, setPageNumber, scale, zoomIn, zoomOut, fitWidth, fitPage, isFullscreen, toggleFullscreen, pdfUrl, fileName, onPrint, onShare }) {
  const zi = ZOOM_LEVELS.indexOf(scale); const canIn = zi < ZOOM_LEVELS.length - 1; const canOut = zi > 0
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 z-30 w-full bg-bg-surface/90 backdrop-blur-xl border-b border-border-subtle print:hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-0.5 sm:space-x-1 shrink-0">
          <Link to="/projects" className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all text-xs sm:text-sm whitespace-nowrap"><FiArrowLeft size={14} /><span className="hidden sm:inline">Back</span></Link>
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          <a href={pdfUrl} download={fileName} className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all text-xs sm:text-sm whitespace-nowrap"><FiDownload size={14} /><span className="hidden sm:inline">Download</span></a>
          <button onClick={onShare} className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all text-xs sm:text-sm whitespace-nowrap"><FiShare2 size={14} /><span className="hidden sm:inline">Share</span></button>
        </div>
        <div className="flex items-center space-x-0.5 bg-white/5 rounded-lg px-1.5 sm:px-2 py-1 shrink-0">
          <button onClick={zoomOut} disabled={!canOut} className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-text-primary transition-all disabled:opacity-30"><FiZoomOut size={14} /></button>
          <span className="text-xs sm:text-sm font-mono min-w-[36px] sm:min-w-[48px] text-center text-text-primary select-none">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={!canIn} className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-text-primary transition-all disabled:opacity-30"><FiZoomIn size={14} /></button>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button onClick={fitWidth} className="p-1 sm:p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-text-primary transition-all" title="Fit Width"><FiLayout size={12} /></button>
        </div>
        <div className="flex items-center space-x-0.5 shrink-0">
          <div className="flex items-center space-x-0.5 bg-white/5 rounded-lg px-1.5 sm:px-2 py-1">
            <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-text-primary transition-all disabled:opacity-30"><FiChevronLeft size={14} /></button>
            <input type="number" value={pageNumber} onChange={e => { const v = Math.min(numPages, Math.max(1, parseInt(e.target.value) || 1)); setPageNumber(v) }} className="w-8 sm:w-10 bg-transparent text-center text-xs sm:text-sm text-text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min={1} max={numPages} />
            <span className="text-[11px] sm:text-xs text-text-muted select-none">/ {numPages}</span>
            <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-text-primary transition-all disabled:opacity-30"><FiChevronRight size={14} /></button>
          </div>
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          <button onClick={onPrint} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all"><FiPrinter size={14} /></button>
          <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-all">{isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}</button>
        </div>
      </div>
    </motion.div>
  )
}

function ProjectHero({ project }) {
  const fmt = s => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : ''
  const tags = project.software?.split(',').map(s => s.trim()) || []
  return (
    <section className="relative pt-28 pb-[72px] sm:pb-12 overflow-hidden">
      <div className="blob blob-1" aria-hidden="true" /><div className="blob blob-2" aria-hidden="true" /><div className="absolute inset-0 bg-gradient-to-b from-accent/3 via-transparent to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.nav initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link><span>/</span><Link to="/projects" className="hover:text-accent transition-colors">Projects</Link><span>/</span><span className="text-text-primary">{project.title}</span>
        </motion.nav>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block text-accent text-sm font-semibold uppercase tracking-wider mb-3">{project.category}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary mb-4 leading-tight">{project.title}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg leading-relaxed max-w-2xl text-text-muted">{project.description}</motion.p>
            {tags.length > 0 && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 mt-6">{tags.map((t, i) => <span key={i} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">{t}</span>)}</motion.div>}
          </div>
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border-subtle bg-[#111827] p-6 space-y-4 shadow-card">
              {project.thumbnail_url && <div className="rounded-xl overflow-hidden mb-4"><img src={project.thumbnail_url} alt={project.title} className="w-full aspect-video object-cover" /></div>}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm"><FiUser className="text-accent shrink-0" size={16} /><span className="text-text-muted">Designer:</span><span className="text-text-primary">Ali Hassan</span></div>
                {project.created_at && <div className="flex items-center space-x-3 text-sm"><FiClock className="text-accent shrink-0" size={16} /><span className="text-text-muted">Date:</span><span className="text-text-primary">{fmt(project.created_at)}</span></div>}
                {project.software && <div className="flex items-start space-x-3 text-sm"><FiLayers className="text-accent shrink-0 mt-0.5" size={16} /><div><span className="text-text-muted">Software:</span><span className="text-text-primary ml-1">{project.software}</span></div></div>}
                {project.client && <div className="flex items-center space-x-3 text-sm"><FiTag className="text-accent shrink-0" size={16} /><span className="text-text-muted">Client:</span><span className="text-text-primary">{project.client}</span></div>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RelatedProjects({ current, projects }) {
  if (!projects || projects.length < 2) return null
  const related = projects.filter(p => p.id !== current.id && p.category === current.category && p.status === 'published').slice(0, 3)
  if (related.length === 0) return null
  return (
    <section className="py-20 relative overflow-hidden"><div className="blob blob-2 opacity-30" aria-hidden="true" /><div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionReveal><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">Related <span className="text-gradient">Projects</span></h2><p className="text-text-muted max-w-xl mx-auto">Explore more work in this category</p></div></SectionReveal>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(p => (
          <motion.div key={p.id} variants={staggerItem}>
            <Link to={p.pdf_url ? `/portfolio/${p.slug}` : `/projects/${p.slug}`}>
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-2xl overflow-hidden border border-border-subtle bg-bg-card/50 min-h-[240px] shadow-card">
                <div className="aspect-[4/3] overflow-hidden bg-bg-surface"><div className="absolute inset-0 flex items-center justify-center text-text-muted"><FiImage size={36} /></div>{p.thumbnail_url && <img src={p.thumbnail_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-10" loading="lazy" onError={e => { e.target.style.display = 'none' }} />}</div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"><span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-2">{p.category || 'Uncategorized'}</span><h3 className="text-base font-heading font-bold text-white">{p.title}</h3></div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div></section>
  )
}

function CTASection() {
  const { siteSettings } = useApp(); const w = siteSettings?.whatsapp || '923102850365'
  return (
    <section className="relative py-24 overflow-hidden"><div className="absolute inset-0 animated-grid opacity-15" /><div className="blob blob-1" aria-hidden="true" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionReveal><div className="rounded-3xl border border-border-subtle bg-[#111827]/80 p-8 md:p-12 shadow-card">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-text-primary mb-4">Like the project?</h2>
          <p className="text-text-muted text-lg mb-8 max-w-lg mx-auto">Let's work together and create something great.</p>
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-full">
            <Link to="/contact" className="flex-1 sm:flex-none px-4 sm:px-8 py-3.5 bg-accent text-background font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all duration-300 flex items-center justify-center space-x-2 min-w-0"><FiMail size={18} /><span>Contact Me</span></Link>
            <Link to="/contact" className="flex-1 sm:flex-none px-4 sm:px-8 py-3.5 border border-accent/30 text-accent font-semibold rounded-xl hover:bg-accent/10 transition-all duration-300 flex items-center justify-center space-x-2 min-w-0"><FiMessageCircle size={18} /><span>Hire Me</span></Link>
            <a href={`https://wa.me/${w}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-4 sm:px-8 py-3.5 border border-border-visible text-text-muted font-semibold rounded-xl hover:bg-white/5 hover:text-text-primary transition-all duration-300 flex items-center justify-center space-x-2 min-w-0"><FaWhatsapp size={18} /><span>WhatsApp</span></a>
          </div>
        </div></SectionReveal>
      </div>
    </section>
  )
}

export default function PortfolioViewer() {
  const { slug } = useParams(); const { projects } = useApp(); const project = projects?.find(p => p.slug === slug)
  const [numPages, setNumPages] = useState(null); const [pageNumber, setPageNumber] = useState(1); const [scale, setScale] = useState(1); const [isFullscreen, setIsFullscreen] = useState(false); const [pdfError, setPdfError] = useState(false); const [pdfLoaded, setPdfLoaded] = useState(false)
  const containerRef = useRef(null); const viewerRef = useRef(null)
  const onLoadSuccess = useCallback(({ numPages: n }) => { setNumPages(n); setPdfLoaded(true); setPdfError(false); setPageNumber(1) }, [])
  const onLoadError = useCallback(() => { setPdfError(true); setPdfLoaded(false) }, [])
  useEffect(() => { if (containerRef.current && pdfLoaded) { const cw = containerRef.current.clientWidth - 32; if (cw < PDF_STANDARD_WIDTH) setScale(Math.round((cw / PDF_STANDARD_WIDTH) * 100) / 100) } }, [pdfLoaded])
  const zi = useCallback(() => setScale(p => { const i = ZOOM_LEVELS.indexOf(p); return i < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[i + 1] : p }), [])
  const zo = useCallback(() => setScale(p => { const i = ZOOM_LEVELS.indexOf(p); return i > 0 ? ZOOM_LEVELS[i - 1] : p }), [])
  const fw = useCallback(() => { if (containerRef.current) { const cw = containerRef.current.clientWidth - 32; setScale(Math.round((cw / PDF_STANDARD_WIDTH) * 100) / 100) } }, [])
  const tf = useCallback(async () => { try { if (!document.fullscreenElement) await viewerRef.current?.requestFullscreen(); else await document.exitFullscreen() } catch {} }, [])
  const hp = useCallback(() => window.print(), [])
  const hs = useCallback(() => { if (navigator.share) navigator.share({ title: project?.title || 'Portfolio', url: window.location.href }).catch(() => {}); else navigator.clipboard?.writeText(window.location.href).catch(() => {}) }, [project])
  useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h) }, [])

  if (!project) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h1 className="text-4xl font-heading font-bold text-text-primary mb-4">Project Not Found</h1><Link to="/projects" className="text-accent hover:underline">Back to Projects</Link></div></div>
  const pdfUrl = project.pdf_url

  return (
    <>
      <Helmet><title>{project.title} | Portfolio | Ali Hassan</title><meta name="description" content={project.description?.slice(0, 160)} /></Helmet>
      <ProjectHero project={project} />
      {pdfUrl ? (
        <section className="relative pb-[72px] sm:pb-12"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border-subtle bg-bg-card/50 overflow-hidden shadow-card">
            <PDFToolbar numPages={numPages || 1} pageNumber={pageNumber} setPageNumber={setPageNumber} scale={scale} zoomIn={zi} zoomOut={zo} fitWidth={fw} fitPage={() => {}} isFullscreen={isFullscreen} toggleFullscreen={tf} pdfUrl={pdfUrl} fileName={`${project.slug || 'portfolio'}.pdf`} onPrint={hp} onShare={hs} />
            <div ref={containerRef} className="bg-background relative min-h-[500px]">
              {!pdfLoaded && !pdfError && <LoadingSkeleton />}{pdfError && <PDFError pdfUrl={pdfUrl} />}
              <div ref={viewerRef} className="flex flex-col items-center py-8 space-y-6 print:space-y-0">
                <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError} loading={<LoadingSkeleton />} error={<PDFError pdfUrl={pdfUrl} />}>
                  {numPages > 0 && Array.from({ length: numPages }, (_, i) => (
                    <motion.div key={`page_${i + 1}`} initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} viewport={{ once: true, margin: '-100px' }} className="rounded-lg overflow-hidden shadow-2xl shadow-black/50 print:shadow-none print:rounded-none">
                      <Page pageNumber={i + 1} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} className="pdf-page" loading={<div className="w-[612px] max-w-full aspect-[8.5/11] bg-white/5 animate-pulse rounded-lg" />} />
                    </motion.div>
                  ))}
                </Document>
              </div>
            </div>
          </motion.div></SectionReveal>
        </div></section>
      ) : (
        <section className="py-20"><div className="max-w-4xl mx-auto px-4 text-center"><div className="rounded-2xl border border-border-subtle bg-bg-card/50 backdrop-blur-sm p-12 shadow-card"><FiImage className="mx-auto text-text-muted mb-4" size={48} /><h3 className="text-2xl font-heading font-bold text-text-primary mb-2">No PDF Available</h3><p className="text-text-muted mb-6">This project doesn't have a portfolio PDF to display.</p><Link to="/projects" className="text-accent hover:underline">Back to Projects</Link></div></div></section>
      )}
      <RelatedProjects current={project} projects={projects} />
      <CTASection />
    </>
  )
}
