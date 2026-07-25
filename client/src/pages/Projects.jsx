import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiSearch, FiArrowRight, FiImage } from 'react-icons/fi'
import SectionReveal from '../components/ui/SectionReveal'
import { staggerContainerFast, staggerItemScale } from '../animations/variants'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

function ProjectCard({ project, i }) {
  const detailLink = project.pdf_url ? `/portfolio/${project.slug}` : `/projects/${project.slug}`
  const externalUrl = project.project_url || '#'
  const tags = project.software?.split(',').map(s => s.trim()) || []
  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, delay: (i || 0) * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-[#111827] shadow-card transition-all duration-500 hover:border-accent/20 hover:shadow-glow">
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} live site`} className="block" onClick={e => { if (externalUrl === '#') e.preventDefault() }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-surface">
          <div className="absolute inset-0 flex items-center justify-center text-text-muted"><div className="flex flex-col items-center space-y-2"><FiImage size={36} /><span className="text-xs">No image</span></div></div>
          {project.thumbnail_url && <img src={project.thumbnail_url} alt={project.title} className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={e => { e.target.style.display = 'none' }} />}
          <motion.div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
        </div>
      </a>
      <Link to={detailLink} className="relative block p-5">
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent shadow-[0_0_10px_rgba(0,240,255,0.1)]">{project.category || 'Uncategorized'}</motion.span>
        <h3 className="mt-3 text-lg font-heading font-semibold text-text-primary break-words pr-2">{project.title}</h3>
        {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.slice(0, 3).map((tag, j) => <motion.span key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: j * 0.1 }} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-text-muted border border-border-subtle">{tag}</motion.span>)}</div>}
        <div className="mt-4 flex items-center space-x-2 text-sm font-medium text-accent"><span>Read More</span><FiArrowRight /></div>
      </Link>
    </motion.div>
  )
}

export default function Projects() {
  const { projects } = useApp()
  const [dbCategories, setDbCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => { supabase.from('categories').select('name').order('name').then(({ data }) => { if (data) setDbCategories(data.map(c => c.name)) }) }, [])
  const allCategories = ['All', ...dbCategories]
  const filteredProjects = (projects || []).filter(p => { const mc = activeCategory === 'All' || p.category === activeCategory; const ms = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()); return mc && ms })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Helmet><title>Portfolio | Ali Hassan</title></Helmet>
      <section className="relative overflow-hidden pb-[72px] sm:pb-20 pt-24 sm:pt-32">
        <div className="blob blob-1" aria-hidden="true" /><div className="blob blob-2" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal type="scale"><div className="mx-auto mb-8 sm:mb-12 max-w-3xl text-center">
            <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Portfolio</motion.span>
            <h1 className="mt-4 mb-4 sm:mb-6 font-heading text-[clamp(1.8rem,6vw,2.8rem)] sm:text-4xl md:text-6xl font-bold text-text-primary">
              {'My Work'.split(' ').map((word, i) => (
                <motion.span key={i} className="inline-block mr-[0.15em]"
                  initial={{ opacity: 0, y: 40, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}>
                  {i === 1 ? <span className="text-gradient">{word}</span> : word}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm sm:text-lg leading-8 text-text-muted">A selection of AI systems, applications, and technical solutions I've built.</motion.p>
          </div></SectionReveal>

          <SectionReveal type="blur"><motion.div className="mb-8 sm:mb-10 flex flex-col items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-[#111827]/60 p-3 sm:p-4 md:flex-row md:p-4 shadow-card">
            <div className="relative w-full md:w-64">
              <label htmlFor="project-search" className="sr-only">Search projects</label>
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={15} aria-hidden="true" />
              <input id="project-search" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects..."
                className="w-full rounded-full border border-border-subtle bg-bg-glass py-2 pl-10 pr-4 text-sm text-text-primary transition-colors focus:border-accent/30 focus:outline-none focus:ring-0 min-h-[40px] placeholder:text-text-muted" />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none">
              {allCategories.map(cat => (
                <motion.button key={cat} onClick={() => setActiveCategory(cat)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3.5 sm:px-4 min-h-[34px] text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? 'bg-accent text-background shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'border border-border-subtle bg-bg-glass text-text-muted hover:text-text-primary hover:border-border-visible'}`}>
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div></SectionReveal>

          <AnimatePresence mode="wait">
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project, i) => <ProjectCard key={project.id} project={project} i={i} />)}
            </motion.div>
          </AnimatePresence>
          {filteredProjects.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border-subtle bg-bg-card/50 backdrop-blur-sm py-20 text-center shadow-card"><p className="text-lg text-text-muted">No projects found.</p></motion.div>}
        </div>
      </section>
    </motion.div>
  )
}
