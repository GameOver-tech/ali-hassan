import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck, FiLoader, FiArrowUpRight } from 'react-icons/fi'
import SectionReveal from '../components/ui/SectionReveal'
import { showToast } from '../components/ui/Toast'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../services/api'
import { staggerContainer, staggerItem } from '../animations/variants'

// ── Premium Contact Card ──
function ContactCard({ item }) {
  const handleCopy = useCallback(async (e) => {
    if (item.action !== 'copy') return
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(item.value)
      showToast('Email copied successfully.')
    } catch { /* fallback */ }
  }, [item])

  const handleClick = useCallback((e) => {
    if (item.action === 'copy') handleCopy(e)
  }, [item, handleCopy])

  const inner = (
    <motion.div
      onClick={item.action === 'copy' ? handleClick : undefined}
      className={`group relative overflow-hidden rounded-xl border border-border-subtle bg-gradient-to-br from-bg-card via-bg-card to-bg-elevated p-[22px] transition-all duration-400 ${item.action ? 'cursor-pointer' : 'cursor-default'}`}
      whileHover={item.action ? { y: -2, scale: 1.005 } : {}}
      whileTap={item.action ? { scale: 0.99 } : {}}
    >
      {/* Hover glow sweep */}
      <motion.span
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(0,240,255,0.03) 50%, transparent 100%)',
        }}
      />

      {/* Glass inner border glow on hover */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,240,255,0.1), 0 0 30px rgba(0,240,255,0.04)' }} />

      <div className="relative space-y-3">
        {/* Icon row */}
        <div className="flex items-center justify-between">
          <div className="w-[34px] h-[34px] rounded-lg bg-accent/8 flex items-center justify-center group-hover:bg-accent/15 transition-all duration-400"
            style={{ boxShadow: '0 0 0 rgba(0,240,255,0)' }}>
            <item.icon className="text-accent" size={14} />
          </div>

          {/* Action indicator */}
          {item.action === 'copy' && (
            <span className="text-[11px] text-text-muted/40 group-hover:text-accent transition-colors duration-300 flex items-center gap-1">
              <span className="hidden sm:inline">Click to copy</span>
              <FiCheck size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </span>
          )}
          {item.action === 'call' && (
            <span className="text-[11px] text-text-muted/40 group-hover:text-text-muted/70 transition-colors duration-300 flex items-center gap-1">
              <span className="hidden sm:inline">Click to call</span>
              <FiArrowUpRight size={12} className="group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform duration-300" />
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted/50">
          {item.label}
        </p>

        {/* Value */}
        <p className="text-sm font-medium text-text-primary leading-snug">
          {item.value}
        </p>
      </div>
    </motion.div>
  )

  // Email: click-to-copy (no navigation)
  // Phone: tel: link
  // Location: display-only
  if (item.action === 'call' || (item.href && item.action !== 'copy')) {
    return <a href={item.href} className="block">{inner}</a>
  }
  return inner
}

// ── WhatsApp Premium Card ──
function WhatsAppCard({ number }) {
  return (
    <motion.a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-xl block"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/20 via-[#128C7E]/15 to-[#25D366]/5 transition-all duration-500 group-hover:from-[#25D366]/25 group-hover:via-[#128C7E]/20 group-hover:to-[#25D366]/10" />
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        animate={{ background: ['radial-gradient(ellipse at 30% 20%, rgba(37,211,102,0.1), transparent)'] }}
      />

      {/* Border glow */}
      <span className="absolute inset-0 rounded-xl border border-[#25D366]/20 group-hover:border-[#25D366]/35 transition-all duration-500" />
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: '0 0 40px rgba(37,211,102,0.08), inset 0 0 0 1px rgba(37,211,102,0.15)' }} />

      <div className="relative p-[22px]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-lg bg-[#25D366]/12 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-all duration-400"
              style={{ boxShadow: '0 0 0 rgba(37,211,102,0)' }}>
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted/50 mb-0.5">WhatsApp</p>
              <p className="text-sm font-medium text-text-primary">Chat on WhatsApp</p>
            </div>
          </div>
          <motion.div
            className="w-7 h-7 rounded-full bg-[#25D366]/8 flex items-center justify-center group-hover:bg-[#25D366]/15 transition-all duration-400"
            initial={false}
          >
            <FiArrowUpRight size={13} className="text-[#25D366] group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform duration-300" />
          </motion.div>
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse-slow" />
          <span className="text-[11px] text-text-muted/60 font-medium tracking-wide">Usually replies within a few hours</span>
        </div>
      </div>
    </motion.a>
  )
}

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
    { icon: FiMail, label: 'Email', value: contactEmail, action: 'copy' },
    { icon: FiPhone, label: 'Phone', value: contactPhone, href: `tel:${contactPhone}`, action: 'call' },
    { icon: FiMapPin, label: 'Location', value: contactAddress },
  ]

  return (
    <>
      <Helmet><title>Contact | Ali Hassan</title></Helmet>
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-15" />
        <div className="absolute inset-0 bg-gradient-soft" />

        <div className="relative max-w-7xl mx-auto">
          {/* ── Section header ── */}
          <SectionReveal type="blur">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-text-muted text-xs font-semibold tracking-[0.2em] uppercase block"
              >
                {content.contact_subtitle || 'Contact'}
              </motion.span>
              <h2 className="text-[clamp(1.5rem,4.5vw,2.5rem)] sm:text-4xl font-heading font-bold mt-3 mb-3 text-text-primary">
                {content.contact_heading || "Let's Work Together"}{' '}
                <span className="text-gradient">{content.contact_heading_highlight || 'Together'}</span>
              </h2>
              <p className="leading-relaxed text-sm text-text-muted max-w-lg mx-auto">
                {content.contact_description || "Have an AI project in mind? Let's discuss how I can help."}
              </p>
            </div>
          </SectionReveal>

          {/* ── 2-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6 lg:gap-8 items-start">

            {/* ─── Left: Form ─── */}
            <SectionReveal type="fade">
              <div className="rounded-xl border border-border-subtle bg-bg-card/80 backdrop-blur-sm p-6 shadow-card">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {['name', 'email'].map(field => (
                      <div key={field}>
                        <label
                          htmlFor={`contact-${field}`}
                          className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary/70 mb-1.5"
                        >
                          {field === 'name' ? 'Your Name' : 'Your Email'}
                        </label>
                        <input
                          id={`contact-${field}`}
                          type={field === 'email' ? 'email' : 'text'}
                          name={field}
                          value={form[field]}
                          onChange={handleChange}
                          placeholder={content[`contact_${field}_placeholder`] || (field === 'name' ? 'John Doe' : 'john@example.com')}
                          required
                          aria-required="true"
                          className="w-full h-[50px] px-4 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated focus:shadow-[inset_0_0_0_1px_rgba(0,240,255,0.15)] transition-all duration-300"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary/70 mb-1.5"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Project Collaboration"
                      required
                      aria-required="true"
                      className="w-full h-[50px] px-4 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated focus:shadow-[inset_0_0_0_1px_rgba(0,240,255,0.15)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary/70 mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project..."
                      required
                      aria-required="true"
                      rows={3}
                      className="w-full min-h-[175px] px-4 py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-0 focus:bg-bg-elevated focus:shadow-[inset_0_0_0_1px_rgba(0,240,255,0.15)] transition-all duration-300 resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[50px] bg-gradient-to-r from-accent to-accent-neural text-background font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.12)] hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <><FiLoader className="animate-spin" size={15} /><span>Sending...</span></>
                    ) : status === 'success' ? (
                      <><FiCheck size={15} /><span>Sent Successfully!</span></>
                    ) : (
                      <><FiSend size={14} /><span>Send Message</span></>
                    )}
                  </motion.button>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs text-center"
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </form>
              </div>
            </SectionReveal>

            {/* ─── Right: Contact Info Cards ─── */}
            <div className="flex flex-col gap-[18px]">
              <SectionReveal type="right" delay={0.15}>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex flex-col gap-[18px]"
                >
                  {contactItems.map((item, i) => (
                    <motion.div key={i} variants={staggerItem}>
                      <ContactCard item={item} index={i} />
                    </motion.div>
                  ))}

                  {/* WhatsApp Card */}
                  <motion.div variants={staggerItem}>
                    <WhatsAppCard number={whatsappNumber} />
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
