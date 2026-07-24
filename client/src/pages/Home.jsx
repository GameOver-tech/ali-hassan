import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiImage } from 'react-icons/fi'
import HeroSection from '../components/home/HeroSection'
import StatsSection from '../components/home/StatsSection'
import SectionReveal from '../components/ui/SectionReveal'
import { useApp } from '../context/AppContext'
import { staggerContainerFast, staggerItemScale, staggerItem } from '../animations/variants'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

function HomeProjectCard({ project }) {
  const detailLink = project.pdf_url ? `/portfolio/${project.slug}` : `/projects/${project.slug}`
  const externalUrl = project.project_url || '#'
  const tags = project.software?.split(',').map(s => s.trim()) || []
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-card shadow-card transition-all duration-500 hover:border-accent/20 hover:shadow-glow-strong">
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} live site`} className="block" onClick={e => { if (externalUrl === '#') e.preventDefault() }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-surface">
          <div className="absolute inset-0 flex items-center justify-center text-text-muted"><div className="flex flex-col items-center space-y-2"><FiImage size={28} /><span className="text-xs">No image</span></div></div>
          {project.thumbnail_url && <img src={project.thumbnail_url} alt={project.title} className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={e => { e.target.style.display = 'none' }} />}
          <motion.div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
        </div>
      </a>
      <Link to={detailLink} className="relative block p-5">
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent shadow-[0_0_10px_rgba(0,240,255,0.1)]">{project.category || 'Featured'}</motion.span>
        <h3 className="mt-3 text-lg font-heading font-semibold text-text-primary group-hover:text-accent transition-colors duration-300">{project.title}</h3>
        {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.slice(0, 3).map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-text-muted border border-border-subtle">{tag}</span>)}</div>}
        <div className="mt-4 flex items-center space-x-2 text-sm font-medium text-accent group-hover:translate-x-1 transition-transform duration-300"><span>View Project</span><FiArrowRight /></div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const { projects, services, testimonials, siteSettings } = useApp()
  const t = siteSettings?.section_titles || {}
  return (
    <>
      <Helmet><title>{t.home_title || 'Ali Hassan | AI Engineer'}</title><meta name="description" content={t.home_description || 'AI Engineer building production-grade AI systems, web applications, and intelligent software.'} /></Helmet>
      <HeroSection />

      <div className="overflow-x-hidden">
        <StatsSection />

        <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-15" /><div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative max-w-7xl mx-auto">
          <SectionReveal type="scale"><div className="mb-8 sm:mb-14 text-center">
            <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted block">{t.portfolio_subtitle || 'Portfolio'}</motion.span>
            <h2 className="mt-4 text-[clamp(1.8rem,6vw,2.5rem)] sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary">
              {(t.portfolio_heading || 'Selected').split(' ').map((word, i) => (
                <motion.span key={i} className="inline-block mr-[0.15em]"
                  initial={{ opacity: 0, y: 40, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}>
                  {word}
                </motion.span>
              ))}{' '}
              <motion.span className="text-gradient inline-block"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
                {t.portfolio_heading_highlight || 'Projects'}
              </motion.span>
            </h2>
          </div></SectionReveal>
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={24} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} className="pb-14">
            {projects?.slice(0, 6).map(project => <SwiperSlide key={project.id}><HomeProjectCard project={project} /></SwiperSlide>)}
          </Swiper>
          <motion.div className="mt-10 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/projects" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-neural px-6 sm:px-8 min-h-[48px] font-semibold text-sm sm:text-base text-background shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all duration-300"><span>{t.projects_view_all || 'View All Projects'}</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionReveal type="blur"><div className="mb-8 sm:mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">{t.services_subtitle || 'Expertise'}</span>
            <h2 className="mt-4 text-[clamp(1.8rem,6vw,2.5rem)] sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary">{t.services_heading || 'Services &'} <span className="text-gradient">{t.services_heading_highlight || 'Capabilities'}</span></h2>
          </div></SectionReveal>
          <motion.div variants={staggerContainerFast} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services?.slice(0, 6).map((service, i) => (
              <motion.div key={service.id} variants={staggerItemScale}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-[#111827] p-7 shadow-card transition-all duration-500 hover:border-accent/15 hover:shadow-glow">
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                  <div className="relative">
                    <motion.div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}>
                      <span className="text-base font-bold">✦</span>
                    </motion.div>
                    <h3 className="mb-3 break-words font-heading text-lg font-semibold text-text-primary group-hover:text-accent transition-colors duration-500">{service.title}</h3>
                    <p className="line-clamp-3 break-words text-sm leading-7 text-text-muted">{service.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {testimonials?.length > 0 && (
        <section className="section-padding relative overflow-hidden">
          <div className="blob blob-1" /><div className="blob blob-2" />
          <div className="relative max-w-7xl mx-auto">
            <SectionReveal type="skew"><div className="mb-8 sm:mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">{t.testimonials_subtitle || 'Testimonials'}</span>
              <h2 className="mt-4 text-[clamp(1.8rem,6vw,2.5rem)] sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary">{t.testimonials_heading || 'Client'} <span className="text-gradient">{t.testimonials_heading_highlight || 'Feedback'}</span></h2>
            </div></SectionReveal>
            <Swiper modules={[Autoplay, Pagination]} spaceBetween={24} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} autoplay={{ delay: 5000 }} pagination={{ clickable: true }} className="pb-14">
              {testimonials.map(t => (
                <SwiperSlide key={t.id}>
                  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-border-subtle bg-[#111827] p-7 shadow-card hover:border-accent/10 transition-all duration-500">
                    <div className="mb-4 flex items-center space-x-1">{[...Array(5)].map((_, i) => <motion.span key={i} className={`text-sm ${i < (t.rating || 5) ? 'text-accent' : 'text-white/10'}`} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>★</motion.span>)}</div>
                    <p className="mb-6 text-sm leading-7 text-text-muted">"{t.content}"</p>
                    <div className="flex items-center space-x-3">
                      <motion.div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-background shadow-[0_0_10px_rgba(0,240,255,0.2)]" whileHover={{ scale: 1.15 }}>{t.name?.[0]}</motion.div>
                      <div><p className="text-sm font-medium text-text-primary">{t.name}</p><p className="text-xs text-text-muted">{t.role} &bull; {t.company}</p></div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      <section className="section-padding relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal type="scale">
            <motion.div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0d1117] p-6 sm:p-10 lg:p-16 shadow-card hover:shadow-[0_0_80px_rgba(0,240,255,0.06)] transition-shadow duration-700 relative overflow-hidden">
              <div className="absolute top-0 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 -right-20 w-40 h-40 bg-accent-neural/5 rounded-full blur-[80px]" />
              <div className="relative">
                <h2 className="text-[clamp(2rem,7vw,2.5rem)] sm:text-4xl md:text-5xl font-heading font-semibold text-text-primary mb-6">{t.cta_title || "Let's Build Something Great"}</h2>
                <p className="mb-8 max-w-2xl mx-auto text-base sm:text-lg text-text-muted">{t.cta_subtitle || 'Have a project in mind? Let\'s discuss how I can help bring your idea to life.'}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full max-w-full">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                    <Link to="/contact" className="group flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 min-h-[50px] bg-gradient-to-r from-accent to-accent-neural text-background font-semibold rounded-full shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] transition-all duration-300"><span>{t.cta_button || 'Start a Project'}</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                    <Link to="/projects" className="group flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 min-h-[50px] border border-border-visible text-text-primary font-semibold rounded-full hover:bg-accent/5 hover:border-accent/30 transition-all duration-300"><span>{t.cta_button_secondary || 'View Portfolio'}</span><FiArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" /></Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </section>
      </div>
    </>
  )
}
