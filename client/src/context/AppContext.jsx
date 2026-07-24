import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'

const AppContext = createContext()

function isAdminRoute(pathname) { return pathname.startsWith('/admin') }

export function AppProvider({ children }) {
  const location = useLocation()
  const [loading, setLoading] = useState(!isAdminRoute(location.pathname))
  const [refreshing, setRefreshing] = useState(false)
  const [siteSettings, setSiteSettings] = useState(null)
  const [chatbotConfig, setChatbotConfig] = useState(null)
  const [socialLinks, setSocialLinks] = useState([])
  const [heroData, setHeroData] = useState(null)
  const [aboutData, setAboutData] = useState(null)
  const [stats, setStats] = useState([])
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [team, setTeam] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [faqs, setFAQs] = useState([])
  const [certifications, setCertifications] = useState([])
  const [processSteps, setProcessSteps] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fetched = useRef(false)

  // The actual data-fetching logic — no route guard, so both initial load
  // and admin-triggered refreshSite() always fetch fresh data
  const safeSingle = useCallback(async (table) => {
    const { data } = await supabase.from(table).select('*').limit(1).maybeSingle()
    return data || null
  }, [])

  const loadAllData = useCallback(async () => {
    const settingsRes = await safeSingle('settings')
    const heroRes = await safeSingle('hero')
    const aboutRes = await safeSingle('about')

    const { data: socialRes } = await supabase.from('social_links').select('*').eq('active', true)
    const { data: servicesRes } = await supabase.from('services').select('*').eq('status', 'published')
    const { data: projectsRes } = await supabase.from('projects').select('*, project_images(*)').eq('status', 'published')
    const { data: skillsRes } = await supabase.from('skills').select('*').eq('active', true)
    const { data: teamRes } = await supabase.from('team').select('*').eq('active', true)
    const { data: testimonialsRes } = await supabase.from('testimonials').select('*').eq('status', 'published')
    const { data: statsRes } = await supabase.from('stats').select('*').eq('active', true).order('order')
    const chatbotConfigRes = await safeSingle('chatbot_config')
    const { data: experienceRes } = await supabase.from('experience').select('*').order('start_date', { ascending: false })
    const { data: educationRes } = await supabase.from('education').select('*').order('order')
    const { data: faqsRes } = await supabase.from('faqs').select('*').eq('active', true).order('order')
    const { data: certsRes } = await supabase.from('certifications').select('*').eq('active', true).order('order')
    const { data: processStepsRes } = await supabase.from('process_steps').select('*').eq('active', true).order('order')

    if (settingsRes) setSiteSettings(settingsRes)
    if (socialRes) setSocialLinks(socialRes)
    if (heroRes) setHeroData(heroRes)
    if (aboutRes) setAboutData(aboutRes)
    if (chatbotConfigRes) setChatbotConfig(chatbotConfigRes)
    if (statsRes) setStats(statsRes)
    if (servicesRes) setServices(servicesRes)
    if (projectsRes) setProjects(projectsRes)
    if (skillsRes) setSkills(skillsRes)
    if (teamRes) setTeam(teamRes)
    if (testimonialsRes) setTestimonials(testimonialsRes)
    if (experienceRes) setExperience(experienceRes)
    if (educationRes) setEducation(educationRes)
    if (faqsRes) setFAQs(faqsRes)
    if (certsRes) setCertifications(certsRes)
    if (processStepsRes) setProcessSteps(processStepsRes)
  }, [safeSingle])

  // Stable ref that loadAllData depends on only once — no pathname dep
  const loadAllDataRef = useRef(loadAllData)
  loadAllDataRef.current = loadAllData

  const refetch = useCallback(async () => {
    setRefreshing(true)
    await loadAllDataRef.current()
    setRefreshing(false)
  }, [])

  // Initial load — only on public routes, only once
  useEffect(() => {
    if (!isAdminRoute(location.pathname) && !fetched.current) {
      fetched.current = true
      loadAllData().finally(() => setLoading(false))
    } else if (isAdminRoute(location.pathname)) {
      setLoading(false)
    }
    // Intentionally run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Expose refetch globally for admin pages to trigger frontend refresh
  useEffect(() => {
    window.__refetchSiteData = refetch
    return () => { window.__refetchSiteData = null }
  }, [refetch])

  return (
    <AppContext.Provider value={{
      loading,
      refreshing,
      siteSettings,
      chatbotConfig,
      socialLinks,
      heroData,
      aboutData,
      stats,
      services,
      projects,
      skills,
      team,
      testimonials,
      experience,
      education,
      faqs,
      certifications,
      processSteps,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      refetch,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
