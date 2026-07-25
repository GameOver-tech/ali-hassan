import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { HiArrowUp } from 'react-icons/hi'
import { FaWhatsapp, FaLinkedin, FaBehance, FaDribbble, FaTwitter, FaInstagram, FaFacebook, FaGithub, FaYoutube } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import { adminAPI } from '../../services/api'
import { staggerContainerFast, staggerItem } from '../../animations/variants'

const quickLinks = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }, { name: 'Services', path: '/services' }, { name: 'Projects', path: '/projects' }, { name: 'Contact', path: '/contact' }]
const socialIconMap = { whatsapp: FaWhatsapp, linkedin: FaLinkedin, behance: FaBehance, dribbble: FaDribbble, twitter: FaTwitter, instagram: FaInstagram, facebook: FaFacebook, github: FaGithub, youtube: FaYoutube }

export default function Footer() {
  const { siteSettings, socialLinks } = useApp()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const handleSubscribe = async e => { e.preventDefault(); if (!email) return; setStatus('loading'); try { await adminAPI.subscribe(email); setStatus('success'); setEmail(''); setTimeout(() => setStatus(''), 3000) } catch { setStatus('error'); setTimeout(() => setStatus(''), 3000) } }

  return (
    <footer className="relative overflow-hidden border-t border-border-subtle bg-background">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <motion.div variants={staggerContainerFast} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          <motion.div variants={staggerItem} className="space-y-5">
            <motion.div whileHover={{ scale: 1.03 }}><Link to="/" className="text-2xl font-heading font-bold text-gradient">AH</Link></motion.div>
            <p className="text-sm leading-7 text-text-muted">{siteSettings?.site_description || 'Building production-grade AI systems and software for businesses.'}</p>
            <div className="flex space-x-2">{(socialLinks || []).filter(s => s.active !== false).map(link => { const Icon = socialIconMap[link.platform] || FiMail; return <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-bg-glass text-text-muted hover:border-accent/30 hover:bg-accent/10 hover:text-accent transition-colors duration-200" title={link.platform}><Icon size={14} /></motion.a> })}</div>
          </motion.div>
          <motion.div variants={staggerItem}><h3 className="mb-5 text-sm font-heading font-semibold text-text-primary tracking-wide uppercase">Quick Links</h3><ul className="space-y-2.5">{quickLinks.map(l => <motion.li key={l.path} whileHover={{ x: 3 }}><Link to={l.path} className="text-sm text-text-muted transition-colors duration-300 hover:text-accent">{l.name}</Link></motion.li>)}</ul></motion.div>
          <motion.div variants={staggerItem}><h3 className="mb-5 text-sm font-heading font-semibold text-text-primary tracking-wide uppercase">Contact</h3><ul className="space-y-3.5">
            <motion.li whileHover={{ x: 3 }} className="flex items-start space-x-3 text-sm text-text-muted"><FiMail className="mt-0.5 flex-shrink-0 text-accent" size={15} /><span>{siteSettings?.contact_email || 'alihassan.webstudio@gmail.com'}</span></motion.li>
            <motion.li whileHover={{ x: 3 }} className="flex items-start space-x-3 text-sm text-text-muted"><FiPhone className="mt-0.5 flex-shrink-0 text-accent" size={15} /><span>{siteSettings?.phone || '+92 310 2850365'}</span></motion.li>
            <motion.li whileHover={{ x: 3 }} className="flex items-start space-x-3 text-sm text-text-muted"><FiMapPin className="mt-0.5 flex-shrink-0 text-accent" size={15} /><span>{siteSettings?.address || 'Lahore, Pakistan'}</span></motion.li>
          </ul></motion.div>
          <motion.div variants={staggerItem}><motion.h3 whileHover={{ x: 3 }} className="mb-5 text-sm font-heading font-semibold text-text-primary tracking-wide uppercase">Newsletter</motion.h3>
            <p className="mb-4 text-sm text-text-muted">Subscribe for AI insights and updates.</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full rounded-xl border border-border-subtle bg-bg-glass px-4 min-h-[48px] text-sm text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300" required />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={status === 'loading'}
                className="w-full rounded-xl bg-accent px-4 min-h-[48px] text-sm font-semibold text-background shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] relative z-10">
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}</motion.button>
              {status === 'success' && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent text-xs">Subscribed successfully!</motion.p>}
              {status === 'error' && <p className="text-red-400 text-xs">Something went wrong.</p>}
            </form>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 sm:flex-row">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p className="text-sm text-text-muted">{siteSettings?.copyright_text || `\u00A9 ${new Date().getFullYear()} ${siteSettings?.site_name || 'Ali Hassan'}. All rights reserved.`}</p>
            <span className="hidden sm:inline text-text-muted/30">|</span>
            <motion.span
              className="text-[11px] font-mono text-text-muted/50 flex items-center gap-1.5"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="w-1 h-1 rounded-full bg-accent-green" />
              AI Engine v2.1 — All systems operational
            </motion.span>
          </div>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border-subtle bg-bg-glass text-text-muted hover:text-accent hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300"
            aria-label="Back to top"
          >
            <HiArrowUp size={16} />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  )
}
