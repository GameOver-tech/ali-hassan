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
          <SectionReveal type="blur"><div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
            <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="text-text-muted text-sm font-semibold tracking-[0.25em] uppercase">{content.contact_subtitle || 'Contact'}</motion.span>
            <h1 className="text-[clamp(1.8rem,6vw,2.8rem)] sm:text-4xl md:text-6xl font-heading font-bold mt-4 mb-4 sm:mb-6 text-text-primary">{content.contact_heading || 'Get in'} <span className="text-gradient">{content.contact_heading_highlight || 'Touch'}</span></h1>
            <p className="leading-relaxed text-sm sm:text-base text-text-muted">{content.contact_description || "Have an AI project in mind? Let's discuss how I can help."}</p>
          </div></SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-10">
            <div className="lg:col-span-3">
              <SectionReveal type="scale">
                <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-4 sm:p-8 shadow-card">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['name', 'email'].map(field => (
                        <div key={field}>
                          <input type={field === 'email' ? 'email' : 'text'} name={field} value={form[field]} onChange={handleChange} placeholder={content[`contact_${field}_placeholder`] || (field === 'name' ? 'Your Name' : 'Your Email')} required
                            className="w-full px-4 min-h-[48px] bg-[#1a1f2e] border border-white/[0.08] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                    {['subject', 'message'].map(field => (
                      <div key={field}>
                        {field === 'message' ? <textarea name={field} value={form[field]} onChange={handleChange} placeholder="Your Message" required rows={5}
                          className="w-full px-4 py-3 min-h-[120px] bg-[#1a1f2e] border border-white/[0.08] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B] resize-none" />
                          : <input type="text" name={field} value={form[field]} onChange={handleChange} placeholder="Subject" required
                            className="w-full px-4 min-h-[48px] bg-[#1a1f2e] border border-white/[0.08] rounded-xl text-white text-sm focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-[#64748B]" />}
                      </div>
                    ))}
                    <button type="submit" disabled={status === 'loading'}
                      className="w-full min-h-[50px] bg-accent text-background font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all duration-300 disabled:opacity-50 active:scale-[0.97]">
                      <FiSend size={16} />
                      <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                    </button>
                    {status === 'success' && <p className="text-accent text-sm text-center">Message sent successfully! I'll get back to you soon.</p>}
                    {status === 'error' && <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>}
                  </form>
                </div>
              </SectionReveal>
            </div>
            <div className="lg:col-span-2">
              <SectionReveal type="right" delay={0.2}>
                <div className="space-y-3 sm:space-y-4">
                  {contactItems.map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }}>
                      <div className="group flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-white/[0.06] bg-[#111827] hover:border-accent/15 hover:shadow-[0_4px_30px_rgba(0,240,255,0.06)] transition-all duration-300 min-h-[68px] overflow-hidden">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(0,240,255,0.08)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-shadow duration-300">
                          <item.icon className="text-accent" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">{item.label}</h3>
                          <p className="text-xs sm:text-sm text-text-primary font-medium break-all leading-snug">{item.value}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="group flex items-center justify-center gap-3 w-full min-h-[52px] sm:min-h-[56px] rounded-2xl border border-[#25D366]/20 bg-[#25D366]/[0.04] hover:bg-[#25D366]/[0.08] hover:border-[#25D366]/40 hover:shadow-[0_0_24px_rgba(37,211,102,0.12)] transition-all duration-300">
                    <FaWhatsapp className="text-[#25D366] text-base sm:text-lg" />
                    <span className="font-medium text-xs sm:text-sm text-text-primary group-hover:text-[#25D366] transition-colors">Chat on WhatsApp</span>
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
