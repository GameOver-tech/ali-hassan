import axios from 'axios'

// VITE_API_URL=/api on Vercel → baseURL=/api, route paths must NOT repeat /api
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
    }
    return Promise.reject(error)
  }
)

// Helper: extract data array from paginated or flat responses
function extractData(res) {
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data
  if (Array.isArray(res.data)) return res.data
  return res.data || []
}

export const adminAPI = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Hero
  getHero: () => api.get('/admin/hero'),
  updateHero: (data) => api.put('/admin/hero', data),

  // About
  getAbout: () => api.get('/admin/about'),
  updateAbout: (data) => api.put('/admin/about', data),

  // Services
  getServices: (params) => api.get('/admin/services', { params }).then(extractData),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Projects
  getProjects: (params) => api.get('/admin/projects', { params }).then(extractData),
  createProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  // Categories
  getCategories: () => api.get('/admin/categories').then(extractData),
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Stats
  getStats: () => api.get('/admin/stats').then(extractData),
  createStat: (data) => api.post('/admin/stats', data),
  updateStat: (id, data) => api.put(`/admin/stats/${id}`, data),
  deleteStat: (id) => api.delete(`/admin/stats/${id}`),

  // Skills
  getSkills: () => api.get('/admin/skills').then(extractData),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`),

  // Team
  getTeam: () => api.get('/admin/team').then(extractData),
  createTeam: (data) => api.post('/admin/team', data),
  updateTeam: (id, data) => api.put(`/admin/team/${id}`, data),
  deleteTeam: (id) => api.delete(`/admin/team/${id}`),

  // Messages
  getMessages: (params) => api.get('/admin/messages', { params }).then(extractData),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),

  // Newsletter
  getNewsletter: () => api.get('/admin/newsletter').then(extractData),
  deleteNewsletter: (id) => api.delete(`/admin/newsletter/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // Social Links
  getSocialLinks: () => api.get('/admin/social-links').then(extractData),
  createSocialLink: (data) => api.post('/admin/social-links', data),
  updateSocialLink: (id, data) => api.put(`/admin/social-links/${id}`, data),
  deleteSocialLink: (id) => api.delete(`/admin/social-links/${id}`),

  // Chatbot
  getChatbotConfig: () => api.get('/admin/chatbot'),
  updateChatbotConfig: (data) => api.put('/admin/chatbot', data),

  // SEO
  getSEO: () => api.get('/admin/seo'),
  updateSEO: (data) => api.put('/admin/seo', data),

  // AI Providers
  getAIProviders: () => api.get('/admin/ai-providers').then(extractData),
  createAIProvider: (data) => api.post('/admin/ai-providers', data),
  updateAIProvider: (id, data) => api.put(`/admin/ai-providers/${id}`, data),
  updateAIProviderApiKey: (id, api_key) => api.put(`/admin/ai-providers/${id}/api-key`, { api_key }),
  deleteAIProvider: (id) => api.delete(`/admin/ai-providers/${id}`),

  // Testimonials
  getTestimonials: (params) => api.get('/admin/testimonials', { params }).then(extractData),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // Experience
  getExperience: () => api.get('/admin/experience').then(extractData),
  createExperience: (data) => api.post('/admin/experience', data),
  updateExperience: (id, data) => api.put(`/admin/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/admin/experience/${id}`),

  // Education
  getEducation: () => api.get('/admin/education').then(extractData),
  createEducation: (data) => api.post('/admin/education', data),
  updateEducation: (id, data) => api.put(`/admin/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/admin/education/${id}`),

  // FAQs
  getFAQs: () => api.get('/admin/faqs').then(extractData),
  createFAQ: (data) => api.post('/admin/faqs', data),
  updateFAQ: (id, data) => api.put(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/faqs/${id}`),

  // Certifications
  getCertifications: () => api.get('/admin/certifications').then(extractData),
  createCertification: (data) => api.post('/admin/certifications', data),
  updateCertification: (id, data) => api.put(`/admin/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/admin/certifications/${id}`),
  uploadCertificationFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/certifications/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Process Steps
  getProcessSteps: () => api.get('/admin/process-steps').then(extractData),
  createProcessStep: (data) => api.post('/admin/process-steps', data),
  updateProcessStep: (id, data) => api.put(`/admin/process-steps/${id}`, data),
  deleteProcessStep: (id) => api.delete(`/admin/process-steps/${id}`),

  // Contact Form
  submitContact: (data) => api.post('/contact', data),

  // Newsletter Subscribe
  subscribe: (email) => api.post('/newsletter', { email }),

  // Chatbot
  chat: (message) => api.post('/chat', { message }),
}

export default api
