import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import PortfolioViewer from './pages/PortfolioViewer'
import CertificateViewer from './pages/CertificateViewer'
import Team from './pages/Team'
import Contact from './pages/Contact'
import ErrorBoundary from './components/ErrorBoundary'

// Code-split all 22 admin pages — loaded only when navigating to /admin/*
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const AdminLogin = lazy(() => import('./admin/pages/Login'))
const AdminHero = lazy(() => import('./admin/pages/Hero'))
const AdminAbout = lazy(() => import('./admin/pages/About'))
const AdminServices = lazy(() => import('./admin/pages/Services'))
const AdminProjects = lazy(() => import('./admin/pages/Projects'))
const AdminCategories = lazy(() => import('./admin/pages/Categories'))
const AdminSkills = lazy(() => import('./admin/pages/Skills'))
const AdminTeam = lazy(() => import('./admin/pages/Team'))
const AdminMessages = lazy(() => import('./admin/pages/Messages'))
const AdminNewsletter = lazy(() => import('./admin/pages/Newsletter'))
const AdminSettings = lazy(() => import('./admin/pages/Settings'))
const AdminSocialLinks = lazy(() => import('./admin/pages/SocialLinks'))
const AdminChatbot = lazy(() => import('./admin/pages/Chatbot'))
const AdminSEO = lazy(() => import('./admin/pages/SEO'))
const AdminStats = lazy(() => import('./admin/pages/Stats'))
const AdminTestimonials = lazy(() => import('./admin/pages/Testimonials'))
const AdminAIProviders = lazy(() => import('./admin/pages/AIProviders'))
const AdminExperience = lazy(() => import('./admin/pages/Experience'))
const AdminEducation = lazy(() => import('./admin/pages/Education'))
const AdminFAQs = lazy(() => import('./admin/pages/FAQs'))
const AdminCertifications = lazy(() => import('./admin/pages/Certifications'))
const AdminProcess = lazy(() => import('./admin/pages/Process'))

function BodyReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.opacity = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.opacity = ''
  }, [pathname])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const lenis = window.__lenis
    if (lenis) { lenis.scrollTo(0, { immediate: true, lock: true }) }
    else { window.scrollTo(0, 0) }
  }, [pathname])
  return null
}

function isAdminRoute(pathname) { return pathname.startsWith('/admin') }

function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const lenisRef = useRef(null)
  const rafId = useRef(null)
  const prevIsAdmin = useRef(null)

  // Share Lenis instance globally so ScrollToTop can use it
  useEffect(() => {
    window.__lenis = lenisRef.current
    return () => { window.__lenis = null }
  })

  // Create Lenis once on mount for public pages; destroy only when entering admin
  useEffect(() => {
    const isAdmin = isAdminRoute(location.pathname)
    const wasAdmin = prevIsAdmin.current
    prevIsAdmin.current = isAdmin

    const destroyLenis = () => {
      if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null }
      if (lenisRef.current) { lenisRef.current.destroy(); lenisRef.current = null }
      window.__lenis = null
    }

    if (isAdmin && !wasAdmin) { destroyLenis(); return }
    if (!isAdmin && wasAdmin) { destroyLenis() }
    if (!isAdmin && !lenisRef.current) {
      const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1 })
      lenisRef.current = lenis
      window.__lenis = lenis
      function raf(time) { lenis.raf(time); rafId.current = requestAnimationFrame(raf) }
      rafId.current = requestAnimationFrame(raf)
    }
  }, [location.pathname])

  return (
    <>
      <BodyReset />
      <ScrollToTop />
      <Routes location={location}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/portfolio/:slug" element={<PortfolioViewer />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/certificate/:id" element={<CertificateViewer />} />
        <Route path="/admin/login" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
              <AdminLogin />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/admin" element={
          <ErrorBoundary>
            <AdminLayout />
          </ErrorBoundary>
        }>
          <Route index element={<Suspense fallback={<AdminPageLoader />}><AdminDashboard /></Suspense>} />
          <Route path="hero" element={<Suspense fallback={<AdminPageLoader />}><AdminHero /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<AdminPageLoader />}><AdminAbout /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<AdminPageLoader />}><AdminServices /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<AdminPageLoader />}><AdminProjects /></Suspense>} />
          <Route path="stats" element={<Suspense fallback={<AdminPageLoader />}><AdminStats /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<AdminPageLoader />}><AdminCategories /></Suspense>} />
          <Route path="skills" element={<Suspense fallback={<AdminPageLoader />}><AdminSkills /></Suspense>} />
          <Route path="team" element={<Suspense fallback={<AdminPageLoader />}><AdminTeam /></Suspense>} />
          <Route path="testimonials" element={<Suspense fallback={<AdminPageLoader />}><AdminTestimonials /></Suspense>} />
          <Route path="messages" element={<Suspense fallback={<AdminPageLoader />}><AdminMessages /></Suspense>} />
          <Route path="newsletter" element={<Suspense fallback={<AdminPageLoader />}><AdminNewsletter /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<AdminPageLoader />}><AdminSettings /></Suspense>} />
          <Route path="social-links" element={<Suspense fallback={<AdminPageLoader />}><AdminSocialLinks /></Suspense>} />
          <Route path="chatbot" element={<Suspense fallback={<AdminPageLoader />}><AdminChatbot /></Suspense>} />
          <Route path="seo" element={<Suspense fallback={<AdminPageLoader />}><AdminSEO /></Suspense>} />
          <Route path="ai-providers" element={<Suspense fallback={<AdminPageLoader />}><AdminAIProviders /></Suspense>} />
          <Route path="experience" element={<Suspense fallback={<AdminPageLoader />}><AdminExperience /></Suspense>} />
          <Route path="education" element={<Suspense fallback={<AdminPageLoader />}><AdminEducation /></Suspense>} />
          <Route path="faqs" element={<Suspense fallback={<AdminPageLoader />}><AdminFAQs /></Suspense>} />
          <Route path="certifications" element={<Suspense fallback={<AdminPageLoader />}><AdminCertifications /></Suspense>} />
          <Route path="process" element={<Suspense fallback={<AdminPageLoader />}><AdminProcess /></Suspense>} />
        </Route>
      </Routes>
    </>
  )
}
