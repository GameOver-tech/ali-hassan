import { z } from 'zod'

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }))
      return res.status(400).json({ error: 'Validation failed', details })
    }
    req.body = result.data
    next()
  }
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const details = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }))
      return res.status(400).json({ error: 'Validation failed', details })
    }
    req.query = result.data
    next()
  }
}

// ── Schemas ──

const emailStr = z.string().email('Invalid email address').max(255)
const nonEmpty = (field) => z.string().trim().min(1, `${field} is required`).max(500)

export const schemas = {
  login: z.object({
    email: emailStr,
    password: z.string().min(1, 'Password is required'),
  }),

  contact: z.object({
    name: nonEmpty('name').max(100),
    email: emailStr,
    subject: nonEmpty('subject').max(200),
    message: nonEmpty('message').max(5000),
  }),

  newsletter: z.object({
    email: emailStr,
  }),

  chat: z.object({
    message: z.string().trim().min(1, 'Message is required').max(4000),
  }),

  hero: z.object({
    name: z.string().max(200).optional(),
    title: z.string().max(200).optional(),
    subtitle: z.string().max(500).optional(),
    badge_text: z.string().max(200).optional(),
    typing_titles: z.any().optional(),
    intro_paragraph: z.string().max(1000).optional(),
    photo_url: z.string().max(1000).optional(),
    resume_url: z.string().max(1000).optional(),
  }),

  about: z.object({
    bio: z.string().max(5000).optional(),
    mission: z.string().max(2000).optional(),
    vision: z.string().max(2000).optional(),
    photo_url: z.string().max(1000).optional(),
    cv_url: z.string().max(1000).optional(),
  }),

  service: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    icon: z.string().max(100).optional(),
    status: z.enum(['published', 'draft']).optional(),
    featured: z.boolean().optional(),
    price: z.string().max(100).optional(),
    features: z.any().optional(),
    image: z.string().max(1000).optional(),
    order: z.number().int().optional(),
  }),

  project: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    slug: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    category: z.string().max(100).optional(),
    client: z.string().max(200).optional(),
    duration: z.string().max(100).optional(),
    software: z.string().max(500).optional(),
    thumbnail_url: z.string().max(1000).optional(),
    project_url: z.string().max(1000).optional(),
    github_url: z.string().max(1000).optional(),
    problem: z.string().max(5000).optional(),
    solution: z.string().max(5000).optional(),
    status: z.enum(['published', 'draft']).optional(),
    featured: z.boolean().optional(),
  }),

  skill: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    level: z.number().int().min(0).max(100).optional(),
    category: z.string().max(100).optional(),
    active: z.boolean().optional(),
    icon: z.string().max(100).optional(),
  }),

  teamMember: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    role: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    photo_url: z.string().max(1000).optional(),
    social_links: z.any().optional(),
    active: z.boolean().optional(),
    order: z.number().int().optional(),
  }),

  category: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().max(100).optional(),
  }),

  stat: z.object({
    label: z.string().min(1, 'Label is required').max(100),
    value: z.number().int().optional(),
    suffix: z.string().max(20).optional(),
    active: z.boolean().optional(),
    order: z.number().int().optional(),
  }),

  experience: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    company: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    start_date: z.string().optional(),
    end_date: z.string().nullable().optional(),
    description: z.string().max(5000).optional(),
    current: z.boolean().optional(),
    order: z.number().int().optional(),
  }),

  education: z.object({
    degree: z.string().min(1, 'Degree is required').max(200),
    institution: z.string().max(200).optional(),
    year: z.string().max(100).optional(),
    description: z.string().max(2000).optional(),
    status: z.string().max(50).optional(),
    order: z.number().int().optional(),
  }),

  faq: z.object({
    question: z.string().min(1, 'Question is required').max(500),
    answer: z.string().min(1, 'Answer is required').max(5000),
    category: z.string().max(100).optional(),
    order: z.number().int().optional(),
    active: z.boolean().optional(),
  }),

  certification: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    issuer: z.string().max(200).optional(),
    credential_url: z.string().max(1000).optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().nullable().optional(),
    description: z.string().max(2000).optional(),
    image_url: z.string().max(1000).optional(),
    pdf_url: z.string().max(1000).optional(),
    order: z.number().int().optional(),
    active: z.boolean().optional(),
  }),

  socialLink: z.object({
    platform: z.string().min(1, 'Platform is required').max(100),
    url: z.string().min(1, 'URL is required').max(1000),
    icon: z.string().max(100).optional(),
    active: z.boolean().optional(),
    order: z.number().int().optional(),
  }),

  settings: z.object({
    site_name: z.string().max(200).optional(),
    site_description: z.string().max(500).optional(),
    contact_email: emailStr.optional().or(z.literal('')),
    phone: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
    whatsapp: z.string().max(50).optional(),
    copyright_text: z.string().max(500).optional(),
    section_titles: z.any().optional(),
    logo_text: z.string().max(50).optional(),
    logo_image_url: z.string().max(1000).optional(),
    favicon: z.string().max(1000).optional(),
    theme_color: z.string().max(50).optional(),
    secondary_color: z.string().max(50).optional(),
    accent_color: z.string().max(50).optional(),
    loader_enabled: z.boolean().optional(),
    animations_enabled: z.boolean().optional(),
    working_hours: z.string().max(200).optional(),
    github: z.string().max(1000).optional(),
    facebook: z.string().max(1000).optional(),
    instagram: z.string().max(1000).optional(),
    twitter: z.string().max(1000).optional(),
    linkedin: z.string().max(1000).optional(),
  }),

  seo: z.object({
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(500).optional(),
    og_title: z.string().max(200).optional(),
    og_description: z.string().max(500).optional(),
    og_image: z.string().max(1000).optional(),
    keywords: z.string().max(500).optional(),
  }),

  chatbotConfig: z.object({
    greeting: z.string().max(500).optional(),
    system_prompt: z.string().max(10000).optional(),
    model: z.string().max(100).optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().min(50).max(32000).optional(),
    enabled: z.boolean().optional(),
  }),

  aiProvider: z.object({
    provider_name: z.string().min(1, 'Provider name is required').max(50),
    api_key: z.string().min(1, 'API key is required').max(500).optional(),
    model: z.string().min(1, 'Model is required').max(100),
    status: z.enum(['active', 'inactive']).optional(),
    priority: z.number().int().optional(),
    is_default: z.boolean().optional(),
  }),

  testimonial: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    role: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    content: z.string().max(5000).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    photo_url: z.string().max(1000).optional(),
    status: z.enum(['published', 'draft']).optional(),
  }),

  processStep: z.object({
    step: z.string().min(1, 'Step is required').max(50),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(1000),
    order: z.number().int().optional(),
    active: z.boolean().optional(),
  }),

  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
}
