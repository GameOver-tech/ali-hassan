import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import FloatingButtons from '../components/layout/FloatingButtons'
import CursorEffect from '../components/ui/CursorEffect'
import LoadingScreen from '../components/ui/LoadingScreen'
import Chatbot from '../components/chatbot/Chatbot'
import { useApp } from '../context/AppContext'

export default function MainLayout() {
  const { loading } = useApp()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="fixed -top-20 left-4 z-[9999] bg-accent text-background px-4 py-2 rounded-b-lg text-sm font-semibold focus:top-0 transition-all duration-300 focus:outline-none">
        Skip to main content
      </a>
      <div className="noise-overlay" />
      <CursorEffect />
      <Navbar />
      <main id="main-content">
        <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <FloatingButtons />
      <Chatbot />
    </div>
  )
}
