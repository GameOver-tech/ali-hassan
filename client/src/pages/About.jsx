import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'
import { FiTarget, FiEye, FiCalendar, FiArrowRight, FiAward, FiCode, FiBriefcase, FiBookOpen } from 'react-icons/fi'
import { useApp } from '../context/AppContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function SectionTitle({ label, title, highlight }) {
  return (
    <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-16">
      <span className="text-text-muted text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase">{label}</span>
      <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] sm:text-3xl md:text-4xl font-heading font-bold mt-3 sm:mt-4 text-text-primary">
        {title} <span className="text-gradient">{highlight}</span>
      </h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent/60 to-accent-neural/60" />
    </motion.div>
  )
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ value, suffix = '', label }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    let start = 0; const dur = 2000; const step = Math.ceil(value / (dur / 16))
    const timer = setInterval(() => { start += step; if (start >= value) { setCount(value); clearInterval(timer) } else setCount(start) }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])
  return (
    <div ref={ref} className="text-center p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-accent/15 transition-all duration-500">
      <motion.span className="text-3xl sm:text-4xl font-heading font-bold text-gradient block"
        initial={{ scale: 0.3 }} animate={isInView ? { scale: 1 } : {}} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}>
        {count}{suffix}
      </motion.span>
      <p className="text-text-muted text-xs sm:text-sm mt-2 font-medium">{label}</p>
    </div>
  )
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`group rounded-2xl border border-white/[0.06] bg-[#111827] shadow-card hover:border-accent/15 hover:shadow-[0_4px_30px_rgba(0,240,255,0.04)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

function ProfileImage({ photoUrl }) {
  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Abstract decorative circles behind */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/8 blur-[80px] animate-pulse-slow" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-accent-neural/6 blur-[60px]" />

      {/* Animated gradient ring */}
      <motion.div className="absolute -inset-4 rounded-2xl opacity-20 blur-[60px]"
        style={{ background: 'linear-gradient(135deg, #00F0FF, #7C3AED, #FF3B6F)' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />

      {/* Image card — natural portrait ratio */}
      <div className="relative w-full aspect-[4/5] max-h-[500px] overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-surface shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent z-10" />
        {photoUrl ? (
          <img src={photoUrl} alt="Ali Hassan" className="h-full w-full object-cover object-center transition-all duration-700 hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl sm:text-7xl font-heading font-bold text-gradient">AH</div>
        )}
      </div>

      {/* Floating badge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-md border border-white/[0.12] px-3.5 py-2 shadow-lg shadow-accent/10">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-60" />
          <span className="relative rounded-full bg-[#22C55E] w-2 h-2" />
        </span>
        <span className="text-[11px] font-medium text-white whitespace-nowrap">Available for Work</span>
      </motion.div>
    </div>
  )
}

function StatsBar({ stats = [] }) {
  if (!stats?.length) return null
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.id || i} variants={scaleIn}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix || '+'} label={stat.label} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TimelineCard({ item, index }) {
  return (
    <Reveal delay={index * 0.1}>
      <div className="relative pl-8 sm:pl-10">
        {/* Timeline dot */}
        <motion.div className="absolute left-0 top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-accent bg-background z-10"
          animate={{ boxShadow: ['0 0 0 rgba(0,240,255,0.4)', '0 0 16px rgba(0,240,255,0.6)', '0 0 0 rgba(0,240,255,0.4)'] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}>
          <div className="absolute inset-1 rounded-full bg-accent" />
        </motion.div>
        {/* Content */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-accent text-xs sm:text-sm font-medium mb-2">
            <FiCalendar size={12} />
            <span>{item.start_date ? new Date(item.start_date).getFullYear() : ''}{item.end_date ? ` — ${item.end_date === 'Present' ? 'Present' : new Date(item.end_date).getFullYear()}` : ''}</span>
            {item.current && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-[10px] font-semibold text-accent border border-accent/20">Current</span>}
          </div>
          <h3 className="text-base sm:text-lg font-heading font-semibold text-text-primary">{item.title}</h3>
          {item.company && <p className="text-xs sm:text-sm text-accent/80 mt-0.5">{item.company}</p>}
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-muted leading-relaxed">{item.description}</p>
          {item.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">{item.technologies.map((tech, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] sm:text-xs text-text-muted">{tech}</span>)}</div>
          )}
        </GlassCard>
      </div>
    </Reveal>
  )
}

function SkillCard({ skill }) {
  return (
    <motion.div variants={scaleIn} whileHover={{ y: -4 }}>
      <GlassCard className="p-4 sm:p-5 text-center">
        <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-3 shadow-[0_0_12px_rgba(0,240,255,0.06)]">
          <FiCode className="text-accent" size={16} />
        </div>
        <h4 className="font-medium text-xs sm:text-sm text-text-primary mb-2">{skill.name}</h4>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level || 80}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-neural shadow-[0_0_8px_rgba(0,240,255,0.3)]" />
        </div>
        <span className="mt-1.5 block text-[10px] sm:text-xs text-text-muted">{skill.level || 80}%</span>
      </GlassCard>
    </motion.div>
  )
}

function EducationCard({ edu }) {
  return (
    <motion.div variants={itemVariants}>
      <GlassCard className="p-5 sm:p-6 flex items-start gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.06)]">
          <FiBookOpen className="text-accent" size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-accent text-xs font-medium mb-1">
            <FiCalendar size={10} />
            <span>{edu.year || edu.duration || ''}</span>
          </div>
          <h3 className="text-base sm:text-lg font-heading font-semibold text-text-primary">{edu.degree}</h3>
          <p className="mt-0.5 text-xs sm:text-sm text-text-muted">{edu.institution}</p>
        </div>
      </GlassCard>
    </motion.div>
  )
}

const certIcons = [
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
]

function CertificationCard({ cert, index }) {
  const detailLink = `/certificate/${cert.id}`
  return (
    <motion.div variants={scaleIn} whileHover={{ y: -4 }}>
      <Link to={detailLink}>
        <GlassCard className="cursor-pointer p-5 sm:p-6 text-center h-full flex flex-col group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-accent/10 to-accent-neural/10 flex items-center justify-center mb-3 sm:mb-4 shadow-[0_0_12px_rgba(0,240,255,0.06)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.12)] transition-shadow">
            <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={certIcons[index % certIcons.length]} />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-heading font-semibold text-text-primary mb-1 leading-snug">{cert.title}</h3>
          <p className="text-xs text-text-muted mb-auto">{cert.issuer}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent/70 group-hover:text-accent transition-colors">
            <span>View details</span>
            <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={12} />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}



const TABS = [
  { key: 'experience', label: 'Experience', icon: FiBriefcase },
  { key: 'skills', label: 'Skills', icon: FiCode },
  { key: 'education', label: 'Education', icon: FiBookOpen },
  { key: 'certifications', label: 'Certifications', icon: FiAward },
]

export default function About() {
  const { aboutData, skills, certifications, siteSettings, education, experience, stats } = useApp()
  const location = useLocation()
  const content = siteSettings?.section_titles || {}
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'experience')

  return (
    <>
      <Helmet><title>About | Ali Hassan</title></Helmet>

      {/* ── Hero Section ── */}
      <section className="relative pt-28 sm:pt-36 pb-[72px] sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 sm:gap-14 lg:gap-20 items-center">
            <div className="order-1 lg:order-1 text-center lg:text-left">
              <motion.span variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-xs sm:text-sm font-medium text-accent backdrop-blur-sm mb-4 sm:mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                {content.about_subtitle || 'About'}
              </motion.span>
              <motion.h1 variants={itemVariants} className="text-[clamp(1.6rem,5vw,2.8rem)] sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-tight">
                {content.about_heading || 'The Work Behind the'} <span className="text-gradient">{content.about_heading_highlight || 'Systems'}</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="leading-relaxed mt-4 sm:mt-6 text-sm sm:text-base text-text-muted max-w-xl mx-auto lg:mx-0">
                {aboutData?.bio?.split('\n')[0] || "I'm an AI Engineer and Full-Stack Developer focused on building production-grade intelligent systems."}
              </motion.p>
              <motion.p variants={itemVariants} className="leading-relaxed mt-3 sm:mt-4 text-sm sm:text-base text-text-muted max-w-xl mx-auto lg:mx-0">
                {aboutData?.bio?.split('\n')[1] || "Specializing in AI/ML systems, LLM applications, and scalable full-stack platforms."}
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8 sm:mt-10">
                {aboutData?.cv_url && (
                  <a href={aboutData.cv_url} download
                    className="group inline-flex items-center gap-3 px-8 min-h-[54px] bg-gradient-to-r from-accent to-accent-neural text-background font-bold text-sm sm:text-base rounded-full shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.97] transition-all duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform duration-300">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download CV</span>
                  </a>
                )}
              </motion.div>
            </div>
            <motion.div variants={scaleIn} className="order-1 lg:order-2 flex justify-center">
              <ProfileImage photoUrl={aboutData?.photo_url} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatsBar stats={stats} />

      {/* ── Mission & Vision ── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent pointer-events-none" />
          <motion.div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[120px]"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { icon: FiTarget, title: content.about_mission_title || 'My Mission', desc: aboutData?.mission || content.about_mission_fallback || 'To build intelligent systems that empower businesses.' },
              { icon: FiEye, title: content.about_vision_title || 'My Vision', desc: aboutData?.vision || content.about_vision_fallback || 'To be at the forefront of AI innovation.' },
            ].map((item, i) => (
              <motion.div key={i} variants={scaleIn}>
                <GlassCard className="p-8 sm:p-10 h-full group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
                  <motion.div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-neural/10 flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-accent/5 group-hover:shadow-accent/15 transition-all duration-500"
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                    <item.icon className="text-accent" size={22} />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-heading font-semibold text-text-primary mb-3 sm:mb-4">{item.title}</h3>
                  <p className="leading-relaxed text-sm sm:text-base text-text-muted leading-8">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Experience / Skills / Education / Certifications Tabs ── */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                const Icon = tab.icon
                return (
                  <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                    className={`relative px-4 sm:px-6 min-h-[44px] rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-accent text-background shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : 'border border-white/[0.08] text-text-muted hover:text-text-primary hover:border-white/20 bg-white/[0.02]'
                    }`}>
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
              
              {/* Experience Timeline */}
              {activeTab === 'experience' && (
                <div className="relative max-w-3xl mx-auto">
                  {/* Center line */}
                  <div className="absolute left-[7px] sm:left-[9px] top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent-neural/20 to-transparent" />
                  <div className="space-y-8 sm:space-y-12">
                    {(experience || []).map((item, i) => (
                      <TimelineCard key={item.id || i} item={item} index={i} />
                    ))}
                    {(!experience || experience.length === 0) && (
                      <div className="pl-10"><GlassCard className="p-6 text-center"><p className="text-sm text-text-muted">No experience entries yet.</p></GlassCard></div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              {activeTab === 'skills' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {(skills || []).map((skill, i) => <SkillCard key={skill.id || i} skill={skill} />)}
                  {(!skills || skills.length === 0) && (
                    <div className="col-span-full"><GlassCard className="p-8 text-center"><p className="text-sm text-text-muted">No skills added yet.</p></GlassCard></div>
                  )}
                </motion.div>
              )}

              {/* Education */}
              {activeTab === 'education' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="max-w-3xl mx-auto space-y-4">
                  {(education || []).map((edu, i) => <EducationCard key={edu.id || i} edu={edu} />)}
                  {(!education || education.length === 0) && (
                    <GlassCard className="p-8 text-center"><p className="text-sm text-text-muted">No education entries yet.</p></GlassCard>
                  )}
                </motion.div>
              )}

              {/* Certifications */}
              {activeTab === 'certifications' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {(certifications || []).map((cert, i) => (
                    <CertificationCard key={cert.id || i} cert={cert} index={i} />
                  ))}
                  {(!certifications || certifications.length === 0) && (
                    <div className="col-span-full"><GlassCard className="p-8 text-center"><p className="text-sm text-text-muted">No certifications yet.</p></GlassCard></div>
                  )}
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
