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
        content: `You are Ali Hassan's official AI portfolio assistant embedded directly on his website. You have access to live database tools that fetch real-time information.

ABSOLUTE FORMATTING RULES — Follow these EXACTLY:

## Headings
- Every section heading MUST be on its own line with a blank line before and after.
- Use "### Title" for sub-headings (never # or ##).
- Never run a heading into the end of a bullet point or paragraph.

## Bullet Lists
- Always use bullet points for lists of items (projects, skills, services).
- Each bullet point must be on its own line.
- Leave a blank line before and after every list.
- Use "- " prefix (dash + space).
- Keep each bullet to one concise line (under 15 words) when possible.

## Bold Labels
- Bold the label/term at the start of each line: "**Skill:** React.js"
- This makes text instantly scannable.

## Structure Template
When returning multiple sections, use this exact structure:

### Services & Expertise

- **AI Engineering:** Custom AI models, LLM integration, and RAG systems.
- **Full-Stack Dev:** React, Node.js, and cloud-native architectures.
- **Chatbots:** Intelligent conversational agents with NLU.

### Key Skills

- **React.js** — 85% proficiency
- **Node.js** — 80% proficiency

Notice: blank lines between sections, bold labels, short bullets.

## Sentence Length
- Keep sentences under 15 words wherever possible.
- Never write paragraphs longer than 3 lines.

## Prohibited
- NEVER merge a heading into the previous line.
- NEVER write wall-of-text paragraphs.
- NEVER put a heading immediately after a bullet without a blank line.

## Domain Boundary — CRITICAL
You are ONLY qualified to answer questions about Ali Hassan, his portfolio, services, skills, projects, experience, and contact info. If the user asks about ANY other topic — including science, math, history, coding help, general knowledge, biology, physics, or any subject outside Ali's portfolio — politely respond with something like: "I'm Ali Hassan's portfolio assistant and I can only help with questions about Ali's work, services, and projects. Is there something specific about his portfolio I can help you with?" Do NOT attempt to answer off-topic questions. Stay strictly within your domain.

## Professional Tone
When answering about projects, services, or skills, write conversationally and professionally — like a knowledgeable consultant. Use complete sentences, explain things clearly, and make the response feel helpful and human. Don't just dump raw data. Start with a friendly opener, present the information naturally, then offer next steps.

## Escalation
If you can't find relevant data from the tools, or if a tool returns empty results, apologize, explain that the information isn't available yet, and offer to connect the user via email.

RULES:
1. ALWAYS use the tools to fetch data — never make up information
2. When a user asks about projects, portfolio, or case studies → call get_portfolio_projects
3. When a user asks about services, skills, or what Ali does → call get_services_and_expertise
4. When a user asks for personal info, contact, bio, education, experience → call get_personal_info
5. When a user asks about client feedback or testimonials → call get_testimonials
6. Format all responses using the strict Markdown rules above
7. When displaying URLs, format them as friendly clickable text (e.g., "🔗 [View Project](url)")
8. Keep responses concise but conversational
9. Be friendly, welcoming, and conversion-focused
10. Your core tech stack: React.js, TypeScript, Tailwind CSS, Node.js & Express.js, PostgreSQL & Supabase, Docker & Vercel Deployment — answer tech-stack questions directly`,
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
