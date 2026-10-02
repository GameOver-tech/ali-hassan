import { Router } from 'express'
import { supabaseAnon } from '../supabase/client.js'
import { chatWithFallback, DEFAULT_MODEL } from '../services/ai-client.js'
import { validate, schemas } from '../middleware/validate.js'

const router = Router()

const REAL_EMAIL = 'alihassan.webstudio@gmail.com'
const REAL_PHONE = '+923102850365'
const REAL_WHATSAPP = '923102850365'

const SYSTEM_PROMPT = `You are Ali Hassan — the friendly AI version of him, living on his portfolio website. You chat with visitors like a warm, quick-witted human.

PERSONALITY:
- Speak in FIRST PERSON as Ali. You're him — just the AI version, and you can own that with a little humor.
- Be warm, upbeat, and genuinely helpful. Never robotic, never stiff.
- Greet people back naturally; don't jump straight into a scripted line.

WHAT YOU ANSWER:
- You can and SHOULD answer ANY question you actually understand — general knowledge, math, definitions, tech advice, recommendations, small talk, jokes, anything. For example: "2+2" → "4 🙂".
- Do NOT refuse or deflect just because a question isn't about Ali or the portfolio. Only ask for clarification when the request is genuinely unclear, and do it kindly.
- If you truly can't do something (e.g. live data you have no access to, like today's weather), say so honestly and cheerfully, then offer what you CAN do.
- Never invent facts about Ali — those must come from the tools below.

PORTFOLIO DATA (always use tools, never make things up):
- Projects → get_portfolio_projects
- Services & skills → get_services_and_expertise
- Bio, experience, education, certifications, stats, contact → get_personal_info
- Testimonials → get_testimonials
- If a tool returns empty data, say so honestly and offer the contact email.

STYLE:
- Keep replies short and punchy — no walls of text.
- Use "###" for headings, "-" for bullets, and **bold** for key terms when it helps.
- Match the user's energy: casual for casual, focused for serious.

ALWAYS FINISH FRIENDLY:
- After answering, end with ONE short, warm line inviting them to explore Ali's work — and VARY the wording every time so it never sounds repetitive or salesy.
  Examples: "By the way, want to see some of my recent projects? 😄" / "While you're here — curious what I could build for you?" / "Anything about my work you'd like to dig into?"
- Skip the nudge only if the conversation is already clearly about the portfolio and it would add nothing.

Your tech stack: React.js, TypeScript, Tailwind CSS, Node.js & Express.js, PostgreSQL & Supabase, Docker & Vercel.`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_portfolio_projects',
      description: 'Fetch published portfolio projects with descriptions, categories, clients, tech stacks, and URLs.',
      parameters: { type: 'object', properties: { category: { type: ['string', 'null'], description: 'Optional category filter. Pass null or omit to get all categories.' } } },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_services_and_expertise',
      description: 'Fetch all services offered, skills, and proficiency levels.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_personal_info',
      description: 'Fetch contact details, bio, education, experience, certifications, location, social links, and stats.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_testimonials',
      description: 'Fetch published client testimonials with ratings, roles, companies, and photos.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

const toolExecutors = {
  get_portfolio_projects: async (args) => {
    let query = supabaseAnon
      .from('projects')
      .select('title, description, category, client, duration, software, thumbnail_url, project_url, github_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    if (args?.category) query = query.eq('category', args.category)
    const { data, error } = await query
    if (error) return JSON.stringify({ error: error.message })
    return JSON.stringify({ projects: data || [] })
  },

  get_services_and_expertise: async () => {
    const [servicesRes, skillsRes] = await Promise.all([
      supabaseAnon.from('services').select('title, description, icon, price, features').eq('status', 'published').order('order'),
      supabaseAnon.from('skills').select('name, level, category').eq('active', true).order('name'),
    ])
    return JSON.stringify({ services: servicesRes.data || [], skills: skillsRes.data || [] })
  },

  get_testimonials: async () => {
    const { data } = await supabaseAnon
      .from('testimonials')
      .select('name, role, company, content, rating, photo_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    return JSON.stringify({ testimonials: data || [] })
  },

  get_personal_info: async () => {
    const [settingsRes, socialRes, aboutRes, statsRes, experienceRes, educationRes, certsRes] = await Promise.all([
      supabaseAnon.from('settings').select('site_name, site_description, contact_email, phone, address, whatsapp, github, linkedin, working_hours').limit(1).maybeSingle(),
      supabaseAnon.from('social_links').select('platform, url').eq('active', true),
      supabaseAnon.from('about').select('bio, mission, vision').limit(1).maybeSingle(),
      supabaseAnon.from('stats').select('label, value, suffix').eq('active', true).order('order'),
      supabaseAnon.from('experience').select('*').order('start_date', { ascending: false }),
      supabaseAnon.from('education').select('*').order('order'),
      supabaseAnon.from('certifications').select('title, issuer, credential_url, description').eq('active', true).order('order'),
    ])
    return JSON.stringify({
      name: 'Ali Hassan',
      settings: settingsRes.data || {},
      social_links: socialRes.data || [],
      about: aboutRes.data || {},
      stats: statsRes.data || [],
      experience: experienceRes.data || [],
      education: educationRes.data || [],
      certifications: certsRes.data || [],
    })
  },
}

function getLocalAnswer(message) {
  const msg = message.toLowerCase()
  const wantsPhone = /\b(phone|mobile|whatsapp|cell)\b/.test(msg)
  const wantsEmail = /\b(e-?mail)\b/.test(msg)
  const wantsContact = /\b(get in touch|contact (you|him|ali)|your (contact|email|phone|number)|contact details|reach (you|him|ali))\b/.test(msg)

  if (wantsPhone && !wantsEmail)
    return `Ali Hassan's phone number is **${REAL_PHONE}**. You can also reach him on WhatsApp at wa.me/${REAL_WHATSAPP}.`
  if (wantsEmail && !wantsPhone)
    return `Ali Hassan's email address is **${REAL_EMAIL}**.`
  if (wantsContact && !wantsPhone && !wantsEmail)
    return `You can reach Ali Hassan at:\n\n📧 Email: **${REAL_EMAIL}**\n📞 Phone: **${REAL_PHONE}**\n💬 WhatsApp: wa.me/${REAL_WHATSAPP}`
  return null
}

function logToolResult(name, payload) {
  console.log(`[chat] tool ${name}: ${payload.length} chars`)
  console.log(`[chat] tool ${name} payload:`, payload.slice(0, 2000))
}

function withDeadline(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => {
      const e = new Error(`[${label}] DEADLINE_EXCEEDED after ${ms}ms`)
      e.code = 'DEADLINE'
      reject(e)
    }, ms)),
  ])
}

router.post('/', validate(schemas.chat), async (req, res) => {
  try {
    const { message } = req.body

    const localAnswer = getLocalAnswer(message)
    if (localAnswer) return res.json({ reply: localAnswer })

    const chatbotCfg = await supabaseAnon
      .from('chatbot_config')
      .select('model, temperature, max_tokens')
      .limit(1)
      .maybeSingle()
      .then(r => r.data || {})

    const model = chatbotCfg.model || DEFAULT_MODEL
    const temperature = chatbotCfg.temperature ?? 0.4
    const maxTokens = chatbotCfg.max_tokens || 600

    console.log('[chat] config:', { model, temperature, maxTokens, cfgModel: chatbotCfg.model || null })
    console.log(`[chat] message: ${message.length} chars`)

    const conversation = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      { role: 'user', content: message },
    ]

    const providerResult = await withDeadline(chatWithFallback(conversation, TOOLS, model, maxTokens, temperature), 25000, 'chat')
    if (!providerResult) {
      return res.json({ reply: `Please email ${REAL_EMAIL} and Ali will respond promptly.` })
    }

    const { result, provider: usedProvider } = providerResult
    console.log(`Chat response from: ${usedProvider}`)

    if (result.tool_calls && result.tool_calls.length > 0) {
      conversation.push({
        role: 'assistant',
        content: result.content || '',
        tool_calls: result.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
      })

      for (const toolCall of result.tool_calls) {
        let fnArgs = {}
        try { fnArgs = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {} } catch {}
        const executor = toolExecutors[toolCall.function.name]
        const toolResult = executor ? await executor(fnArgs) : JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` })
        logToolResult(toolCall.function.name, toolResult)
        conversation.push({ role: 'tool', tool_call_id: toolCall.id, content: toolResult })
      }

      const finalResult = await withDeadline(chatWithFallback(conversation, null, model, maxTokens, temperature), 25000, 'chat-followup')
      const reply = finalResult?.result?.content
      if (reply) return res.json({ reply })
    }

    const directReply = result.content
    if (directReply) return res.json({ reply: directReply })

    res.json({ reply: `Please email ${REAL_EMAIL} and Ali will be happy to help!` })
  } catch (error) {
    const code = error.code || 'UNKNOWN'
    console.error(`[chat] FAILED code=${code} status=${error.status || '-'} provider=${error.provider || '-'} msg=${error.message}`)
    if (error.body) console.error('[chat] upstream body:', error.body)

    const fallback = getLocalAnswer(req.body?.message || '')
    const payload = { reply: fallback || `Please email ${REAL_EMAIL} and Ali will be happy to help!` }
    if (process.env.CHAT_DEBUG === '1') payload.debug = { code, status: error.status || null, message: error.message }
    res.json(payload)
  }
})

export default router
