import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX } from 'react-icons/hi'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { useApp } from '../../context/AppContext'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Projects', path: '/projects' },
  { name: 'Contact', path: '/contact' },
]

const linkVariants = {
  hidden: { y: -10, opacity: 0 },
  visible: (i) => ({ y: 0, opacity: 1, transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

function SidebarBackdrop({ onClick }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClick} aria-hidden="true" />
}

function SidebarPanel({ children }) {
  return (
    <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
      className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-[320px] bg-bg-surface border-l border-border-subtle shadow-2xl lg:hidden flex flex-col" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      {children}
    </motion.aside>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('/')
  const location = useLocation()
  const { isScrolled } = useScrollPosition()
  const { siteSettings, socialLinks, heroData } = useApp()
  const logoText = siteSettings?.logo_text || 'AH'
  const logoImage = siteSettings?.logo_image_url || null

  const handleHomeClick = useCallback((e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname])

  useEffect(() => { setActiveSection(location.pathname) }, [location])
  useEffect(() => { setIsOpen(false) }, [location.pathname])
  useEffect(() => {
    if (isOpen) { document.body.classList.add('no-scroll') }
    else { document.body.classList.remove('no-scroll') }
    return () => { document.body.classList.remove('no-scroll') }
  }, [isOpen])

  // Safety net: ensure no-scroll is never left on body after navigation
  useEffect(() => {
    document.body.classList.remove('no-scroll')
  }, [location.pathname])
  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') setIsOpen(false) }, [])
  useEffect(() => { if (isOpen) { document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown) } }, [isOpen, handleKeyDown])
  const toggle = () => setIsOpen(p => !p)
  const close = () => setIsOpen(false)

  return (
    <>
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${isScrolled ? 'bg-[rgba(8,10,16,0.85)] backdrop-blur-2xl border-b border-border-subtle shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Animated logo */}
            <motion.div whileHover={{ scale: 1.03 }} className="flex-shrink-0">
              <Link to="/" onClick={(e) => { close(); handleHomeClick(e) }}>
                {logoImage ? <img src={logoImage} alt={logoText} className="h-7 md:h-9 w-auto" />
                  : <span className="text-lg md:text-xl font-heading font-bold text-gradient relative">
                      {logoText}
                      <motion.span className="absolute -inset-1 rounded-lg opacity-20 blur-sm" style={{ background: 'linear-gradient(135deg, #00F0FF, #7C3AED)' }}
                        animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} />
                    </span>}
              </Link>
            </motion.div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link, i) => (
                <motion.div key={link.path} custom={i} variants={linkVariants} initial="hidden" animate="visible">
                  <Link to={link.path} onClick={link.path === '/' ? handleHomeClick : undefined}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-300 whitespace-nowrap ${activeSection === link.path ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
                    {link.name}
                    {activeSection === link.path && (
                      <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }} />
                    )}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="ml-3">
                <Link to="/contact"
                  className="block px-4 py-1.5 bg-accent text-background font-semibold rounded-full text-sm shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all duration-300 whitespace-nowrap">
                  Get in Touch
                </Link>
              </motion.div>
            </div>

            {/* Mobile hamburger */}
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-text-primary flex-shrink-0 rounded-full border border-border-subtle bg-bg-glass backdrop-blur transition-transform duration-200"
              aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}>
              <AnimatePresence mode="wait">
                {isOpen ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><HiX size={22} /></motion.span>
                  : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><HiMenu size={22} /></motion.span>}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <SidebarBackdrop onClick={close} />
            <SidebarPanel>
              <div className="flex items-center justify-between px-5 pt-5 pb-2 border-b border-border-subtle">
                <span className="text-lg font-heading font-bold text-gradient">{logoText}</span>
                <motion.button onClick={close} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors" aria-label="Close menu"><HiX size={20} /></motion.button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <Link to={link.path} onClick={link.path === '/' ? (e) => { close(); handleHomeClick(e) } : close}
                      className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${activeSection === link.path ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="border-t border-border-subtle px-5 py-5 space-y-4">
                {heroData?.resume_url && (
                  <motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
                    href={heroData.resume_url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-background font-semibold rounded-full text-sm shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                    Download Resume
                  </motion.a>
                )}
                {socialLinks?.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }} className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="text-xs uppercase tracking-[0.2em] text-text-muted mr-1">Follow</span>
                    {socialLinks.filter(s => s.active !== false).slice(0, 5).map(link => (
                      <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-border-subtle text-text-muted hover:border-accent/30 hover:bg-accent/10 hover:text-accent transition-colors duration-200" aria-label={link.platform}>
                        <span className="text-xs font-medium">{link.platform?.[0]?.toUpperCase()}</span>
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </div>
            </SidebarPanel>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
