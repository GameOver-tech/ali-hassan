import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { HiArrowUp } from 'react-icons/hi'
import { useApp } from '../../context/AppContext'

export default function FloatingButtons() {
  const { siteSettings } = useApp()
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const h = () => setShowScroll(window.scrollY > 400)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const openWA = () => { const wa = siteSettings?.whatsapp || '923102850365'; window.open(`https://wa.me/${wa}`, '_blank') }

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] sm:hidden flex items-center justify-around px-6 py-3 bg-[#0d1117]/95 backdrop-blur-md border-t border-white/[0.06]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
        {showScroll && (
          <button onClick={scrollToTop}
            className="flex flex-col items-center gap-0.5 min-w-[44px] justify-center text-text-muted hover:text-accent transition-colors active:scale-90"
            aria-label="Scroll to top">
            <HiArrowUp size={20} />
          </button>
        )}
        <button onClick={openWA}
          className="flex flex-col items-center gap-0.5 min-w-[44px] justify-center text-[#25D366] transition-colors active:scale-90"
          aria-label="Contact via WhatsApp">
          <FaWhatsapp size={22} />
        </button>
      </div>

      {/* Desktop: floating column */}
      <div className="hidden sm:flex fixed flex-col items-center gap-3 z-[999]"
        style={{ bottom: 'max(24px, calc(24px + env(safe-area-inset-bottom, 0px)))', right: 'max(16px, calc(16px + env(safe-area-inset-right, 0px)))' }}>
        
        {/* Scroll to top */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              key="scroll-top"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={scrollToTop}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full border border-white/[0.08] bg-[#111827] flex items-center justify-center text-text-muted hover:border-accent/30 hover:text-accent hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all duration-300 shadow-lg active:scale-90"
              aria-label="Scroll to top">
              <HiArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp */}
        <button onClick={openWA}
          className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,211,102,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-90"
          aria-label="Contact via WhatsApp">
          <FaWhatsapp size={20} />
        </button>
      </div>
    </>
  )
}
