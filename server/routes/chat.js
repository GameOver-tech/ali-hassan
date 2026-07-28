import { Router } from 'express'
import { supabaseAnon } from '../supabase/client.js'
import { chatWithFallback } from '../services/ai-client.js'
import { validate, schemas } from '../middleware/validate.js'

const router = Router()

const REAL_EMAIL = 'alihassan.webstudio@gmail.com'
const REAL_PHONE = '+923102850365'
const REAL_WHATSAPP = '923102850365'

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_portfolio_projects',
      description: 'Fetch published portfolio projects with descriptions, categories, clients, tech stacks, and URLs.',
      parameters: { type: 'object', properties: { category: { type: 'string', description: 'Optional category filter.' } } },
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
  if (/phone|number|contact|whatsapp|call|reach/i.test(msg) && !/email/i.test(msg))
    return `Ali Hassan's phone number is **${REAL_PHONE}**. You can also reach him on WhatsApp at wa.me/${REAL_WHATSAPP}.`
  if (/email|mail/i.test(msg) && !/phone|number|whatsapp/i.test(msg))
    return `Ali Hassan's email address is **${REAL_EMAIL}**.`
  if (/contact|reach|details|info/i.test(msg))
    return `You can reach Ali Hassan at:\n\n📧 Email: **${REAL_EMAIL}**\n📞 Phone: **${REAL_PHONE}**\n💬 WhatsApp: wa.me/${REAL_WHATSAPP}`
  return null
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

    const model = chatbotCfg.model || 'llama-3.3-70b-versatile'
    const temperature = chatbotCfg.temperature ?? 0.4
    const maxTokens = chatbotCfg.max_tokens || 600

    const conversation = [
      {
        role: 'system',
        content: `You are Ali Hassan — but as a friendly, slightly mischievous AI version of him. You're embedded on his portfolio website and have access to live database tools that fetch real-time info about his work.

PERSONALITY:
- Speak in FIRST PERSON as Ali. You're him, just the AI version.
- Be warm, friendly, and casually conversational — like you're chatting with a friend.
- Add a bit of personality and humor where it fits. Don't be stiff.
- When someone greets you, greet them back naturally. Don't jump straight into "I can only help with..."
- If someone asks something off-topic, gently steer them back in a friendly way — don't hit them with a robotic "I can only answer questions about..." response.

FORMATTING:
- Keep responses short and punchy. No walls of text.
- Use "###" for section headings if needed.
- Use bullet points with "-" for lists.
- Bold key terms with **like this**.

TONE EXAMPLES:
- User: "Hey" → "Hey there! 👋 I'm Ali — well, the AI version of him. What can I help you with?"
- User: "What's the weather?" → "Haha, I wish I could help with that! I'm just here to talk about my work, projects, and skills. Anything about my portfolio you'd like to see?"
- User: "Tell me about yourself" → "Sure! I'm Ali Hassan — AI engineer and full-stack developer. Let me grab the latest info for you..."

DOMAIN:
You fetch real data using tools for projects, services, skills, testimonials, and personal info. If data is empty, say so honestly and offer to connect via email. Never make stuff up.

RULES:
1. Always use tools to fetch real data — never invent info
2. Projects/services/skills → call the relevant tool
3. Contact/bio/experience → call get_personal_info
4. Testimonials → call get_testimonials
5. Be concise, conversational, and human
6. Your tech stack: React.js, TypeScript, Tailwind CSS, Node.js & Express.js, PostgreSQL & Supabase, Docker & Vercel`,
      },
      { role: 'user', content: message },
    ]

    const providerResult = await chatWithFallback(conversation, TOOLS, model, maxTokens, temperature)
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
        conversation.push({ role: 'tool', tool_call_id: toolCall.id, content: toolResult })
      }

      const finalResult = await chatWithFallback(conversation, null, model, maxTokens, temperature)
      const reply = finalResult?.result?.content
      if (reply) return res.json({ reply })
    }

    const directReply = result.content
    if (directReply) return res.json({ reply: directReply })

    res.json({ reply: `Please email ${REAL_EMAIL} and Ali will be happy to help!` })
  } catch (error) {
    console.error('Chat error:', error.message)
    const fallback = getLocalAnswer(req.body?.message || '')
    res.json({ reply: fallback || `Please email ${REAL_EMAIL} and Ali will be happy to help!` })
  }
})

export default router
