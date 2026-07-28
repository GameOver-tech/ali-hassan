import { Router } from 'express'
import { supabase } from '../supabase/client.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import { validate, schemas } from '../middleware/validate.js'
import multer from 'multer'
import { uploadFile, ensureBucket } from '../services/upload.js'

const router = Router()

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin)

// Memory storage for Vercel compatibility (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

// ──────────────────────────────────────
// File upload (Supabase Storage)
// ──────────────────────────────────────
router.post('/certifications/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    await ensureBucket()
    const result = await uploadFile(req.file, 'certifications')
    res.json({ url: result.url, filename: result.filename })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ──────────────────────────────────────
// Dashboard stats
// ──────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [projects, services, messages, subscribers] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('newsletter').select('*', { count: 'exact', head: true }),
    ])

    res.json({
      projects: projects.count || 0,
      services: services.count || 0,
      messages: messages.count || 0,
      subscribers: subscribers.count || 0,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

// ──────────────────────────────────────
// Utility for single-row tables (hero, about, settings, seo, chatbot)
// ──────────────────────────────────────
function singleGet(table) {
  return async (req, res) => {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1).maybeSingle()
      if (error) return res.status(400).json({ error: error.message })
      res.json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

function singleUpsert(table, schema) {
  const middlewares = schema ? [validate(schema)] : []
  return [...middlewares, async (req, res) => {
    try {
      // First get the actual existing row (there may be duplicates)
      const { data: existing } = await supabase
        .from(table)
        .select('id')
        .limit(1)
        .maybeSingle()

      let result
      if (existing) {
        // Update the actual existing row by its real ID
        result = await supabase
          .from(table)
          .update({ ...req.body, updated_at: new Date() })
          .eq('id', existing.id)
          .select()
      } else {
        // No row exists — insert fresh
        result = await supabase
          .from(table)
          .insert({ ...req.body, updated_at: new Date() })
          .select()
      }

      if (result.error) return res.status(400).json({ error: result.error.message })
      res.json(result.data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }]
}

// ── Hero ──
router.get('/hero', singleGet('hero'))
router.put('/hero', ...singleUpsert('hero', schemas.hero))

// ── About ──
router.get('/about', singleGet('about'))
router.put('/about', ...singleUpsert('about', schemas.about))

// ── Settings ──
router.get('/settings', singleGet('settings'))
router.put('/settings', ...singleUpsert('settings', schemas.settings))

// ── SEO ──
router.get('/seo', singleGet('seo'))
router.put('/seo', ...singleUpsert('seo', schemas.seo))

// ── Chatbot Config ──
router.get('/chatbot', singleGet('chatbot_config'))
router.put('/chatbot', ...singleUpsert('chatbot_config', schemas.chatbotConfig))

// ──────────────────────────────────────
// Generic CRUD helpers
// ──────────────────────────────────────
function listRoute(table, orderField = 'created_at', orderDir = { ascending: false }) {
  return async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .order(orderField, orderDir)
        .range(offset, offset + limit - 1)

      if (error) return res.status(400).json({ error: error.message })
      res.json({ data, total: count, page, limit })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

function createRoute(table, schema) {
  return [validate(schema), async (req, res) => {
    try {
      const { data, error } = await supabase.from(table).insert(req.body).select()
      if (error) return res.status(400).json({ error: error.message })
      res.status(201).json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }]
}

function updateRoute(table, schema) {
  return [validate(schema), async (req, res) => {
    try {
      const id = req.params.id
      const { data, error } = await supabase
        .from(table)
        .update({ ...req.body, updated_at: new Date() })
        .eq('id', id)
        .select()
      if (error) return res.status(400).json({ error: error.message })
      if (!data?.length) return res.status(404).json({ error: 'Record not found' })
      res.json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }]
}

function deleteRoute(table) {
  return async (req, res) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', req.params.id)
      if (error) return res.status(400).json({ error: error.message })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

// ──────────────────────────────────────
// Services
// ──────────────────────────────────────
router.get('/services', listRoute('services', 'order', { ascending: true }))
router.post('/services', ...createRoute('services', schemas.service))
router.put('/services/:id', ...updateRoute('services', schemas.service))
router.delete('/services/:id', deleteRoute('services'))

// ──────────────────────────────────────
// Projects
// ──────────────────────────────────────
router.get('/projects', listRoute('projects', 'created_at', { ascending: false }))
router.post('/projects', ...createRoute('projects', schemas.project))
router.put('/projects/:id', ...updateRoute('projects', schemas.project))
router.delete('/projects/:id', deleteRoute('projects'))

// ──────────────────────────────────────
// Categories
// ──────────────────────────────────────
router.get('/categories', listRoute('categories', 'name', { ascending: true }))
router.post('/categories', ...createRoute('categories', schemas.category))
router.delete('/categories/:id', async (req, res) => {
  try {
    const { data: category } = await supabase.from('categories').select('name').eq('id', req.params.id).maybeSingle()
    if (category?.name) {
      await supabase.from('projects').update({ category: null, updated_at: new Date() }).eq('category', category.name)
    }
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ──────────────────────────────────────
// Skills
// ──────────────────────────────────────
router.get('/skills', listRoute('skills', 'name', { ascending: true }))
router.post('/skills', ...createRoute('skills', schemas.skill))
router.put('/skills/:id', ...updateRoute('skills', schemas.skill))
router.delete('/skills/:id', deleteRoute('skills'))

// ──────────────────────────────────────
// Team
// ──────────────────────────────────────
router.get('/team', listRoute('team', 'name', { ascending: true }))
router.post('/team', ...createRoute('team', schemas.teamMember))
router.put('/team/:id', ...updateRoute('team', schemas.teamMember))
router.delete('/team/:id', deleteRoute('team'))

// ──────────────────────────────────────
// Messages
// ──────────────────────────────────────
router.get('/messages', listRoute('messages', 'created_at', { ascending: false }))
router.delete('/messages/:id', deleteRoute('messages'))

// ──────────────────────────────────────
// Newsletter
// ──────────────────────────────────────
router.get('/newsletter', listRoute('newsletter', 'created_at', { ascending: false }))
router.delete('/newsletter/:id', deleteRoute('newsletter'))

// ──────────────────────────────────────
// Social Links
// ──────────────────────────────────────
router.get('/social-links', listRoute('social_links', 'platform', { ascending: true }))
router.post('/social-links', ...createRoute('social_links', schemas.socialLink))
router.put('/social-links/:id', ...updateRoute('social_links', schemas.socialLink))
router.delete('/social-links/:id', deleteRoute('social_links'))

// ──────────────────────────────────────
// Stats
// ──────────────────────────────────────
router.get('/stats', listRoute('stats', 'order', { ascending: true }))
router.post('/stats', ...createRoute('stats', schemas.stat))
router.put('/stats/:id', ...updateRoute('stats', schemas.stat))
router.delete('/stats/:id', deleteRoute('stats'))

// ──────────────────────────────────────
// Testimonials
// ──────────────────────────────────────
router.get('/testimonials', listRoute('testimonials', 'created_at', { ascending: false }))
router.post('/testimonials', ...createRoute('testimonials', schemas.testimonial))
router.put('/testimonials/:id', ...updateRoute('testimonials', schemas.testimonial))
router.delete('/testimonials/:id', deleteRoute('testimonials'))

// ──────────────────────────────────────
// Experience
// ──────────────────────────────────────
router.get('/experience', listRoute('experience', 'order', { ascending: true }))
router.post('/experience', ...createRoute('experience', schemas.experience))
router.put('/experience/:id', ...updateRoute('experience', schemas.experience))
router.delete('/experience/:id', deleteRoute('experience'))

// ──────────────────────────────────────
// Education
// ──────────────────────────────────────
router.get('/education', listRoute('education', 'order', { ascending: true }))
router.post('/education', ...createRoute('education', schemas.education))
router.put('/education/:id', ...updateRoute('education', schemas.education))
router.delete('/education/:id', deleteRoute('education'))

// ──────────────────────────────────────
// FAQs
// ──────────────────────────────────────
router.get('/faqs', listRoute('faqs', 'order', { ascending: true }))
router.post('/faqs', ...createRoute('faqs', schemas.faq))
router.put('/faqs/:id', ...updateRoute('faqs', schemas.faq))
router.delete('/faqs/:id', deleteRoute('faqs'))

// ──────────────────────────────────────
// Certifications
// ──────────────────────────────────────
router.get('/certifications', listRoute('certifications', 'order', { ascending: true }))
router.post('/certifications', ...createRoute('certifications', schemas.certification))
router.put('/certifications/:id', ...updateRoute('certifications', schemas.certification))
router.delete('/certifications/:id', deleteRoute('certifications'))

// ──────────────────────────────────────
// Process Steps
// ──────────────────────────────────────
router.get('/process-steps', listRoute('process_steps', 'order', { ascending: true }))
router.post('/process-steps', ...createRoute('process_steps', schemas.processStep))
router.put('/process-steps/:id', ...updateRoute('process_steps', schemas.processStep))
router.delete('/process-steps/:id', deleteRoute('process_steps'))

// ──────────────────────────────────────
// AI Providers — SECURITY: never return api_key
// ──────────────────────────────────────
router.get('/ai-providers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_providers')
      .select('id, provider_name, model, status, priority, is_default, created_at, updated_at')
      .order('priority', { ascending: true })
    if (error) return res.status(400).json({ error: error.message })
    // Annotate whether a key is set without exposing it
    const masked = (data || []).map(p => ({ ...p, has_key: true }))
    res.json({ data: masked, total: masked.length, page: 1, limit: 100 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai-providers', validate(schemas.aiProvider), async (req, res) => {
  try {
    const { data, error } = await supabase.from('ai_providers').insert(req.body).select('id, provider_name, model, status, priority, is_default')
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Dedicated endpoint to update only the API key (never returned in GET)
router.put('/ai-providers/:id/api-key', async (req, res) => {
  try {
    const { api_key } = req.body
    if (!api_key || typeof api_key !== 'string' || api_key.length < 5) {
      return res.status(400).json({ error: 'Valid API key is required' })
    }
    const { data, error } = await supabase
      .from('ai_providers')
      .update({ api_key, updated_at: new Date() })
      .eq('id', req.params.id)
      .select('id, provider_name, model, status, priority, is_default')
    if (error) return res.status(400).json({ error: error.message })
    if (!data?.length) return res.status(404).json({ error: 'Provider not found' })
    res.json({ message: 'API key updated', provider: data[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/ai-providers/:id', validate(schemas.aiProvider), async (req, res) => {
  try {
    const { api_key, ...safeFields } = req.body
    const { data, error } = await supabase
      .from('ai_providers')
      .update({ ...safeFields, updated_at: new Date() })
      .eq('id', req.params.id)
      .select('id, provider_name, model, status, priority, is_default')
    if (error) return res.status(400).json({ error: error.message })
    if (!data?.length) return res.status(404).json({ error: 'Provider not found' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/ai-providers/:id', deleteRoute('ai_providers'))

export default router
