import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  FiGrid, FiUser, FiBriefcase, FiFolder, FiLayers, FiCode,
  FiUsers, FiMail, FiSend, FiSettings, FiLink, FiMessageSquare,
  FiSearch, FiLogOut, FiTrendingUp, FiCpu, FiHelpCircle,
  FiBookOpen, FiAward, FiStar, FiMenu, FiX
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { path: '/admin', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/hero', icon: FiUser, label: 'Hero' },
  { path: '/admin/about', icon: FiBriefcase, label: 'About' },
  { path: '/admin/services', icon: FiLayers, label: 'Services' },
  { path: '/admin/projects', icon: FiFolder, label: 'Projects' },
  { path: '/admin/categories', icon: FiLayers, label: 'Categories' },
  { path: '/admin/stats', icon: FiTrendingUp, label: 'Stats' },
  { path: '/admin/skills', icon: FiCode, label: 'Skills' },
  { path: '/admin/experience', icon: FiAward, label: 'Experience' },
  { path: '/admin/education', icon: FiBookOpen, label: 'Education' },
  { path: '/admin/certifications', icon: FiAward, label: 'Certifications' },
  { path: '/admin/team', icon: FiUsers, label: 'Team' },
  { path: '/admin/testimonials', icon: FiStar, label: 'Testimonials' },
  { path: '/admin/faqs', icon: FiHelpCircle, label: 'FAQs' },
  { path: '/admin/process', icon: FiTrendingUp, label: 'Process' },
  { path: '/admin/ai-providers', icon: FiCpu, label: 'AI Providers' },
  { path: '/admin/messages', icon: FiMail, label: 'Messages' },
  { path: '/admin/newsletter', icon: FiSend, label: 'Newsletter' },
  { path: '/admin/social-links', icon: FiLink, label: 'Social Links' },
  { path: '/admin/chatbot', icon: FiMessageSquare, label: 'Chatbot' },
  { path: '/admin/seo', icon: FiSearch, label: 'SEO' },
  { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
]

export default function AdminSidebar({ mobileOpen, onClose }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  }

  const isActive = location.pathname
  const linkClass = (path) =>
    `relative flex w-full items-center space-x-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
      isActive === path
        ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(0,240,255,0.15)]'
        : 'text-text-secondary hover:bg-white/5 hover:text-white'
    }`

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 p-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-heading font-bold text-gradient">AH</Link>
        <button onClick={onClose} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted">
          <FiX size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {menuItems.map((item) => {
          const active = isActive === item.path
          return (
            <Link key={item.path} to={item.path} onClick={onClose} className={linkClass(item.path)}>
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
              )}
              <item.icon size={18} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="flex-shrink-0 border-t border-border-subtle p-3 space-y-1">
        <button onClick={handleLogout} className="flex w-full items-center space-x-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-accent/10 hover:text-red-400">
          <FiLogOut size={18} /><span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border-subtle lg:bg-bg-glass lg:backdrop-blur-xl">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose}>
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-bg-surface border-r border-border-subtle shadow-2xl"
              onClick={e => e.stopPropagation()}>
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
