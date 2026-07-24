import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaWhatsapp } from 'react-icons/fa'
import { HiArrowUp } from 'react-icons/hi'
import { useApp } from '../../context/AppContext'

export default function FloatingButtons() {
  const { siteSettings } = useApp()
  const [showScroll, setShowScroll] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  useEffect(() => {
    const h = () => setShowScroll(window.scrollY > 400)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Poll chatbot open state so we can hide when sidebar is open
  useEffect(() => {
    const interval = setInterval(() => { setChatbotOpen(!!window.__chatbotOpen) }, 200)
    return () => clearInterval(interval)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const openWA = () => { const wa = siteSettings?.whatsapp || '923102850365'; window.open(`https://wa.me/${wa}`, '_blank') }
  const openChatbot = () => { const btn = document.getElementById('chatbot-toggle'); if (btn) btn.click() }

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] sm:hidden flex items-center justify-around px-6 py-3 bg-[#0d1117]/95 backdrop-blur-md border-t border-white/[0.06]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
        {/* Chatbot */}
        {!chatbotOpen && (
          <button onClick={openChatbot}
            className="flex flex-col items-center gap-0.5 min-w-[44px] justify-center text-accent transition-colors active:scale-90"
            aria-label="Open AI Assistant">
            <FaRobot size={20} />
          </button>
        )}
        {/* WhatsApp */}
        <button onClick={openWA}
          className="flex flex-col items-center gap-0.5 min-w-[44px] justify-center text-[#25D366] transition-colors active:scale-90"
          aria-label="Contact via WhatsApp">
          <FaWhatsapp size={22} />
        </button>
        {/* Scroll to top */}
        {showScroll && (
          <button onClick={scrollToTop}
            className="flex flex-col items-center gap-0.5 min-w-[44px] justify-center text-text-muted hover:text-accent transition-colors active:scale-90"
            aria-label="Scroll to top">
            <HiArrowUp size={20} />
          </button>
        )}
      </div>

      {/* Desktop: floating column */}
      <div className="hidden sm:flex fixed flex-col items-center gap-3 z-[999]"
        style={{ bottom: 'max(24px, calc(24px + env(safe-area-inset-bottom, 0px)))', right: 'max(16px, calc(16px + env(safe-area-inset-right, 0px)))' }}>
        
        {/* Chatbot toggle — always on top */}
        {!chatbotOpen && (
          <button id="chatbot-toggle-fab" onClick={openChatbot}
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-background shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] active:scale-90"
            aria-label="Open AI Assistant">
            <FaRobot size={18} />
          </button>
        )}

        {/* WhatsApp — always visible */}
        <button onClick={openWA}
          className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,211,102,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-90"
          aria-label="Contact via WhatsApp">
          <FaWhatsapp size={20} />
        </button>

        {/* Scroll to top — always at bottom */}
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
      </div>
    </>
  )
}
