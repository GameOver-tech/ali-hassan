import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import SectionReveal from '../components/ui/SectionReveal'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../services/api'

export default function Contact() {
  const { siteSettings } = useApp()
  const content = siteSettings?.section_titles || {}
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const contactEmail = siteSettings?.contact_email || 'alihassan.webstudio@gmail.com'
  const contactPhone = siteSettings?.phone || '+92 310 2850365'
  const contactAddress = siteSettings?.address || 'Gojra, Punjab, Pakistan'
  const whatsappNumber = siteSettings?.whatsapp || '923102850365'
  const handleSubmit = async e => { e.preventDefault(); setStatus('loading'); try { await adminAPI.submitContact(form); setStatus('success'); setForm({ name: '', email: '', subject: '', message: '' }); setTimeout(() => setStatus(''), 4000) } catch { setStatus('error'); setTimeout(() => setStatus(''), 4000) } }
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const contactItems = [
    { icon: FiMail, label: 'Email', value: contactEmail },
    { icon: FiPhone, label: 'Phone', value: contactPhone },
    { icon: FiMapPin, label: 'Location', value: contactAddress },
  ]

  return (
    <>
      <Helmet><title>Contact | Ali Hassan</title></Helmet>
      <section className="relative pt-24 sm:pt-32 pb-[72px] sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal type="blur"><div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="text-text-muted text-sm font-semibold tracking-[0.25em] uppercase">{content.contact_subtitle || 'Contact'}</motion.span>
            <h1 className="text-[clamp(1.8rem,6vw,2.8rem)] sm:text-4xl md:text-6xl font-heading font-bold mt-4 mb-4 sm:mb-6 text-text-primary">{content.contact_heading || 'Get in'} <span className="text-gradient">{content.contact_heading_highlight || 'Touch'}</span></h1>
            <p className="leading-relaxed text-sm sm:text-base text-text-muted">{content.contact_description || "Have an AI project in mind? Let's discuss how I can help."}</p>
          </div></SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
            {/* Form column */}
            <div className="lg:col-span-3">
              <SectionReveal type="scale">
                <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-sm p-5 sm:p-8 shadow-card">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {['name', 'email'].map(field => (
                        <div key={field}>
                          <input type={field === 'email' ? 'email' : 'text'} name={field} value={form[field]} onChange={handleChange} placeholder={content[`contact_${field}_placeholder`] || (field === 'name' ? 'Your Name' : 'Your Email')} required
                            className="w-full px-4 min-h-[44px] bg-[#1a1f2e]/80 border border-white/[0.06] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" required
                      className="w-full px-4 min-h-[44px] bg-[#1a1f2e]/80 border border-white/[0.06] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B]" />
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" required rows={4}
                      className="w-full px-4 py-3 min-h-[110px] bg-[#1a1f2e]/80 border border-white/[0.06] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B] resize-none" />
                    <button type="submit" disabled={status === 'loading'}
                      className="w-full min-h-[44px] bg-accent text-background font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] transition-all duration-300 disabled:opacity-50 hover:brightness-110 active:scale-[0.98]">
                      <FiSend size={15} />
                      <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                    </button>
                    {status === 'success' && <p className="text-accent text-sm text-center">Message sent successfully! I'll get back to you soon.</p>}
                    {status === 'error' && <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>}
                  </form>
                </div>
              </SectionReveal>
            </div>
            {/* Info column */}
            <div className="lg:col-span-2 flex flex-col items-center mx-auto w-full max-w-lg lg:max-w-none lg:mx-0">
              <SectionReveal type="right" delay={0.2}>
                <div className="space-y-3 sm:space-y-4 w-full">
                  {contactItems.map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }}>
                      <div className="group flex items-center gap-3 sm:gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-accent/20 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <item.icon className="text-accent" size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-text-muted font-medium mb-0.5">{item.label}</p>
                          <p className="text-sm text-text-primary font-medium break-all leading-snug">{item.value}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    className="group flex items-center justify-center gap-2.5 w-full min-h-[48px] rounded-xl border border-[#25D366]/20 bg-[#25D366]/[0.03] hover:bg-[#25D366]/[0.08] hover:border-[#25D366]/35 transition-all duration-300">
                    <FaWhatsapp className="text-[#25D366] text-base" />
                    <span className="font-medium text-sm text-text-primary group-hover:text-[#25D366] transition-colors">Chat on WhatsApp</span>
                  </motion.a>
                </div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
