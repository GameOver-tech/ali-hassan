import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FaLinkedin, FaTwitter, FaBehance } from 'react-icons/fa'
import SectionReveal from '../components/ui/SectionReveal'
import { staggerContainerFast, staggerItemScale } from '../animations/variants'
import { useApp } from '../context/AppContext'

const socialIconMap = { linkedin: FaLinkedin, twitter: FaTwitter, behance: FaBehance }

export default function Team() {
  const { team, siteSettings } = useApp()
  const content = siteSettings?.section_titles || {}
  const teamMembers = team || []
  return (
    <>
      <Helmet><title>Team | Ali Hassan</title></Helmet>
      <section className="relative pt-24 sm:pt-32 pb-[72px] sm:pb-20 overflow-hidden">
        <div className="blob blob-1" aria-hidden="true" /><div className="blob blob-2" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal type="blur"><div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="text-text-muted text-sm font-semibold tracking-[0.25em] uppercase">{content.team_subtitle || 'Team'}</motion.span>
            <h1 className="text-[clamp(1.8rem,6vw,2.8rem)] sm:text-4xl md:text-6xl font-heading font-bold mt-4 mb-4 sm:mb-6 text-text-primary">{content.team_heading || 'The People'} <span className="text-gradient">{content.team_heading_highlight || 'Behind the Code'}</span></h1>
            <p className="leading-relaxed text-sm sm:text-base text-text-muted">{content.team_description || 'Meet the team building world-class AI solutions.'}</p>
          </div></SectionReveal>
          <motion.div variants={staggerContainerFast} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {teamMembers.map((member, i) => (
              <motion.div key={member.id || i} variants={staggerItemScale}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative p-6 sm:p-8 rounded-2xl border border-border-subtle bg-[#111827] shadow-card hover:border-accent/20 hover:shadow-glow transition-all duration-500 text-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                  <div className="relative">
                    <motion.div className="w-24 sm:w-28 h-24 sm:h-28 mx-auto rounded-full overflow-hidden mb-4 sm:mb-5 ring-1 ring-white/10 group-hover:ring-accent/30 transition-all duration-500" whileHover={{ scale: 1.08 }}>
                      {member.photo_url ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-accent flex items-center justify-center"><span className="text-2xl sm:text-3xl font-bold text-background">{member.name?.[0] || 'A'}</span></div>}
                    </motion.div>
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-text-primary mb-1">{member.name}</h3>
                    <p className="text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">{member.role}</p>
                    {member.description && <p className="mb-4 sm:mb-5 text-xs sm:text-sm leading-relaxed text-text-muted">{member.description}</p>}
                    {member.social_links && (
                      <div className="flex justify-center space-x-3">
                        {Object.entries(member.social_links).map(([platform, url]) => {
                          const Icon = socialIconMap[platform]; if (!Icon) return null
                          return <motion.a key={platform} href={url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:border-accent/30 hover:text-accent hover:bg-accent/10 transition-colors duration-200"><Icon size={14} /></motion.a>
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
