import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowLeft, FiClock, FiUser, FiLayers, FiImage } from 'react-icons/fi'
import SectionReveal from '../components/ui/SectionReveal'
import { staggerContainerFast, staggerItemScale } from '../animations/variants'
import { useApp } from '../context/AppContext'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { projects } = useApp()
  const project = projects?.find(p => p.slug === slug)
  if (!project) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><h1 className="text-4xl font-heading font-bold text-text-primary mb-4">Project Not Found</h1><Link to="/projects" className="text-accent hover:underline">Back to Projects</Link></div>
    </motion.div>
  )
  const tags = project.software?.split(',').map(s => s.trim()) || []

  return (
    <>
      <Helmet><title>{project.title} | Ali Hassan</title></Helmet>
      <section className="relative pb-[72px] sm:pb-20 pt-24 sm:pt-32 overflow-hidden">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/projects" className="mb-8 inline-flex items-center space-x-2 text-text-muted transition-colors hover:text-accent"><FiArrowLeft /><span>Back to Projects</span></Link>
          </motion.div>
          <SectionReveal type="scale">
            <motion.div className="relative mb-12 aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-elevated" whileHover={{ scale: 1.005 }}>
              <div className="absolute inset-0 flex items-center justify-center text-text-muted"><div className="flex flex-col items-center space-y-2"><FiImage size={40} /><span className="text-sm">No image</span></div></div>
              {project.thumbnail_url && <img src={project.thumbnail_url} alt={project.title} className="absolute inset-0 w-full h-full object-cover z-10" onError={e => { e.target.style.display = 'none' }} />}
            </motion.div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
            <div className="lg:col-span-2">
              <SectionReveal type="fade">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">{project.category}</span>
                <h1 className="mt-2 mb-6 font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-text-primary">{project.title}</h1>
                <p className="mb-6 text-lg leading-8 text-text-muted">{project.description}</p>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <div className="space-y-6">
                  {project.problem && <motion.div whileHover={{ y: -2 }} className="p-6 rounded-2xl border border-border-subtle bg-bg-card/50 shadow-card"><h3 className="mb-2 font-heading text-lg font-semibold text-accent">The Problem</h3><p className="leading-8 text-text-muted">{project.problem}</p></motion.div>}
                  {project.solution && <motion.div whileHover={{ y: -2 }} className="p-6 rounded-2xl border border-border-subtle bg-bg-card/50 shadow-card"><h3 className="mb-2 font-heading text-lg font-semibold text-accent">The Solution</h3><p className="leading-8 text-text-muted">{project.solution}</p></motion.div>}
                </div>
              </SectionReveal>
              {project.project_images?.length > 0 && (
                <SectionReveal delay={0.2}>
                  <h3 className="mt-12 mb-6 font-heading text-xl font-semibold text-text-primary">Gallery</h3>
                  <motion.div variants={staggerContainerFast} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
                    {project.project_images.map((img, i) => (
                      <motion.div key={img.id} variants={staggerItemScale} whileHover={{ scale: 1.02 }}
                        className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
                        <img src={img.url} alt={`${project.title} ${i + 1}`} className="w-full h-auto" loading="lazy" />
                      </motion.div>
                    ))}
                  </motion.div>
                </SectionReveal>
              )}
            </div>
            <div>
              <SectionReveal type="right" delay={0.2}>
                <div className="sticky top-28 space-y-5">
                  <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border-subtle bg-[#111827] p-6 shadow-card">
                    <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Project Details</h3>
                    <div className="space-y-4">
                      {project.client && <div className="flex items-center space-x-3 text-sm"><FiUser className="text-accent flex-shrink-0" /><span className="text-text-muted">Client: </span><span className="text-text-primary">{project.client}</span></div>}
                      {project.duration && <div className="flex items-center space-x-3 text-sm"><FiClock className="text-accent flex-shrink-0" /><span className="text-text-muted">Duration: </span><span className="text-text-primary">{project.duration}</span></div>}
                      {project.software && <div className="flex items-start space-x-3 text-sm"><FiLayers className="text-accent flex-shrink-0 mt-0.5" /><div><span className="text-text-muted">Tech Stack: </span><div className="flex flex-wrap gap-1.5 mt-2">{tags.map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-text-muted border border-border-subtle">{tag}</span>)}</div></div></div>}
                    </div>
                  </motion.div>
                  {(project.project_url || project.github_url) && (
                    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border-subtle bg-[#111827] p-6 shadow-card">
                      <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Project Links</h3>
                      <div className="space-y-3">
                        {project.project_url && <motion.a whileHover={{ x: 4 }} href={project.project_url} target="_blank" rel="noopener noreferrer" className="group flex w-full items-center space-x-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 transition-all duration-300 hover:bg-accent/10"><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-accent">Live Demo</p><p className="truncate text-xs text-text-muted">{project.project_url.replace(/^https?:\/\//, '')}</p></div></motion.a>}
                        {project.github_url && <motion.a whileHover={{ x: 4 }} href={project.github_url} target="_blank" rel="noopener noreferrer" className="group flex w-full items-center space-x-3 rounded-xl border border-border-subtle bg-white/5 px-4 py-3 transition-all duration-300 hover:bg-white/10"><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-text-primary">GitHub</p><p className="truncate text-xs text-text-muted">{project.github_url.replace(/^https?:\/\//, '')}</p></div></motion.a>}
                      </div>
                    </motion.div>
                  )}
                </div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
