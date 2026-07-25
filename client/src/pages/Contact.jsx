import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck, FiLoader } from 'react-icons/fi'
import SectionReveal from '../components/ui/SectionReveal'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../services/api'
import { staggerContainer, staggerItem } from '../animations/variants'

export default function Contact() {
  const { siteSettings } = useApp()
  const content = siteSettings?.section_titles || {}
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const contactEmail = siteSettings?.contact_email || 'alihassan.webstudio@gmail.com'
  const contactPhone = siteSettings?.phone || '+92 310 2850365'
  const contactAddress = siteSettings?.address || 'Gojra, Punjab, Pakistan'
  const whatsappNumber = siteSettings?.whatsapp || '923102850365'

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      await adminAPI.submitContact(form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus(''), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(''), 4000)
    }
  }

  const contactItems = [
    { icon: FiMail, label: 'Email', value: contactEmail, href: `mailto:${contactEmail}` },
    { icon: FiPhone, label: 'Phone', value: contactPhone, href: `tel:${contactPhone}` },
    { icon: FiMapPin, label: 'Location', value: contactAddress },
  ]

  return (
    <>
      <Helmet><title>Contact | Ali Hassan</title></Helmet>
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-15" />
        <div className="absolute inset-0 bg-gradient-soft" />

        <div className="relative max-w-7xl mx-auto">
          {/* Section header */}
          <SectionReveal type="blur">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-text-muted text-sm font-semibold tracking-[0.25em] uppercase"
              >
                {content.contact_subtitle || 'Contact'}
              </motion.span>
              <h1 className="text-[clamp(1.8rem,6vw,2.8rem)] sm:text-4xl md:text-6xl font-heading font-bold mt-4 mb-4 sm:mb-6 text-text-primary">
                {content.contact_heading || "Let's Work Together"} <span className="text-gradient">{content.contact_heading_highlight || 'Together'}</span>
              </h1>
              <p className="leading-relaxed text-sm sm:text-base text-text-muted">
                {content.contact_description || "Have an AI project in mind? Let's discuss how I can help."}
              </p>
            </div>
          </SectionReveal>

          {/* 2-column grid: 60% form / 40% info */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 sm:gap-8 lg:gap-12 items-start">

            {/* ─── Left Column: Form ─── */}
            <SectionReveal type="fade">
              <div className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-sm p-6 sm:p-8 shadow-card">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['name', 'email'].map(field => (
                      <div key={field}>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          {field === 'name' ? 'Your Name' : 'Your Email'}
                        </label>
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          name={field}
                          value={form[field]}
                          onChange={handleChange}
                          placeholder={content[`contact_${field}_placeholder`] || (field === 'name' ? 'John Doe' : 'john@example.com')}
                          required
                          className="w-full px-4 min-h-[48px] bg-bg-surface border border-border-subtle rounded-xl text-text-primary text-sm focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated transition-all duration-300 placeholder:text-text-muted"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Project Collaboration"
                      required
                      className="w-full px-4 min-h-[48px] bg-bg-surface border border-border-subtle rounded-xl text-text-primary text-sm focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated transition-all duration-300 placeholder:text-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project..."
                      required
                      rows={5}
                      className="w-full px-4 py-3 min-h-[130px] bg-bg-surface border border-border-subtle rounded-xl text-text-primary text-sm focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated transition-all duration-300 placeholder:text-text-muted resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full min-h-[50px] bg-accent text-background font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <><FiLoader className="animate-spin" size={16} /><span>Sending...</span></>
                    ) : status === 'success' ? (
                      <><FiCheck size={16} /><span>Sent Successfully!</span></>
                    ) : (
                      <><FiSend size={15} /><span>Send Message</span></>
                    )}
                  </motion.button>

                  {status === 'error' && (
                    <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm text-center">
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </form>
              </div>
            </SectionReveal>

            {/* ─── Right Column: Contact Info Cards ─── */}
            <div className="flex flex-col gap-4">
              <SectionReveal type="right" delay={0.15}>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex flex-col gap-4"
                >
                  {contactItems.map((item, i) => (
                    <motion.div key={i} variants={staggerItem}>
                      {item.href ? (
                        <a href={item.href} className="block">
                          <div className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl border border-border-subtle bg-bg-card shadow-card hover:border-accent/20 hover:bg-bg-elevated hover:shadow-glow transition-all duration-400">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-300">
                              <item.icon className="text-accent" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{item.label}</p>
                              <p className="text-sm sm:text-base text-text-primary font-medium break-all leading-snug">{item.value}</p>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl border border-border-subtle bg-bg-card shadow-card hover:border-accent/20 hover:bg-bg-elevated hover:shadow-glow transition-all duration-400">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-300">
                            <item.icon className="text-accent" size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{item.label}</p>
                            <p className="text-sm sm:text-base text-text-primary font-medium break-all leading-snug">{item.value}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* WhatsApp CTA */}
                  <motion.div variants={staggerItem}>
                    <motion.a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex items-center justify-center gap-2.5 w-full min-h-[52px] rounded-2xl border border-[#25D366]/25 bg-[#25D366]/[0.04] hover:bg-[#25D366]/[0.1] hover:border-[#25D366]/40 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="font-medium text-sm text-text-primary group-hover:text-[#25D366] transition-colors">Chat on WhatsApp</span>
                    </motion.a>
                  </motion.div>
                </motion.div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
