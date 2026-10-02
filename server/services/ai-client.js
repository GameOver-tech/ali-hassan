import { supabase } from '../supabase/client.js'

const PROVIDER_ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
}

// Groq retired `llama-3.3-70b-versatile` on 2026-08-16.
// `openai/gpt-oss-120b` is Groq's recommended replacement and supports tool use.
export const DEFAULT_MODEL = 'openai/gpt-oss-120b'

// Env fallbacks — only used when the ai_providers row's api_key is empty.
const ENV_KEY_FALLBACK = {
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
}

const FETCH_TIMEOUT = 8000

function resolveApiKey(provider) {
  const dbKey = (provider.api_key || '').trim()
  if (dbKey) return dbKey
  const envName = ENV_KEY_FALLBACK[provider.provider_name]
  return envName ? (process.env[envName] || '').trim() : ''
}

async function fetchWithTimeout(url, options, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function readErrorBody(res) {
  const text = await res.text().catch(() => '')
  let message = text
  try {
    const parsed = JSON.parse(text)
    message = parsed?.error?.message || parsed?.message || text
  } catch {}
  return { text, message }
}

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'AUTH_ERROR'
  if (status === 429) return 'RATE_LIMIT'
  if (status === 404) return 'MODEL_NOT_FOUND'
  if (status === 400) return 'BAD_REQUEST'
  if (status >= 500) return 'UPSTREAM_5XX'
  return 'UPSTREAM_ERROR'
}

function buildHttpError(providerName, res, text, message) {
  const code = classifyStatus(res.status)
  const err = new Error(`[${providerName}] ${code} ${res.status}: ${message}`)
  err.code = code
  err.status = res.status
  err.provider = providerName
  err.retryAfter = res.headers.get('retry-after') || null
  err.body = text.slice(0, 800)
  return err
}

function summarizeMessages(messages) {
  return messages.map(m => ({
    role: m.role,
    chars: (m.content || '').length,
    tool_calls: m.tool_calls?.length || 0,
    tool_call_id: m.tool_call_id || null,
  }))
}

export async function getEnabledProviders() {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('provider_name, api_key, model, status, priority, is_default')
    .eq('status', 'active')
    .order('priority', { ascending: true })

  if (error) {
    console.error('[ai] getEnabledProviders DB error:', error.message)
    return []
  }

  const providers = data || []
  console.log('[ai] enabled providers:', providers.map(p => ({
    name: p.provider_name,
    model: p.model,
    key: resolveApiKey(p) ? 'set' : 'MISSING',
    priority: p.priority,
  })))
  return providers
}

function buildGeminiPayload(messages, tools, model, maxTokens, temperature) {
  const contents = messages.map(m => {
    if (m.role === 'system') return { role: 'user', parts: [{ text: m.content }] }
    if (m.role === 'user') return { role: 'user', parts: [{ text: m.content }] }
    if (m.role === 'assistant') {
      const parts = []
      if (m.content) parts.push({ text: m.content })
      if (m.tool_calls) {
        m.tool_calls.forEach(tc => {
          let args = {}
          try { args = JSON.parse(tc.function.arguments) } catch {}
          parts.push({
            functionCall: { name: tc.function.name, args }
          })
        })
      }
      return { role: 'model', parts }
    }
    if (m.role === 'tool') {
      return {
        role: 'function',
        parts: [{ functionResponse: { name: 'get_tool_result', response: { response: m.content } } }]
      }
    }
    return null
  }).filter(Boolean)

  const toolDefs = tools?.length ? tools.map(t => ({
    functionDeclarations: [{
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    }],
  })) : undefined

  return {
    contents,
    tools: toolDefs,
    generationConfig: {
      temperature: temperature ?? 0.4,
      maxOutputTokens: maxTokens ?? 600,
    },
  }
}

function parseGeminiResponse(data) {
  const candidate = data?.candidates?.[0]
  if (!candidate) return null

  const content = candidate.content
  if (!content) return null

  const parts = content.parts || []
  const textParts = parts.filter(p => p.text).map(p => p.text).join('')
  const functionCalls = parts.filter(p => p.functionCall).map(p => ({
    id: p.functionCall.name,
    type: 'function',
    function: {
      name: p.functionCall.name,
      arguments: JSON.stringify(p.functionCall.args || {}),
    },
  }))

  return {
    content: textParts || null,
    tool_calls: functionCalls.length > 0 ? functionCalls : null,
  }
}

function buildStandardPayload(messages, tools, model, maxTokens, temperature) {
  return {
    model,
    messages: messages.map(m => {
      const msg = { role: m.role, content: m.content ?? null }
      if (m.tool_calls?.length) msg.tool_calls = m.tool_calls
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id
      return msg
    }),
    ...(tools?.length ? { tools } : {}),
    temperature: temperature ?? 0.4,
    max_tokens: maxTokens ?? 600,
  }
}

export async function chatWithProvider(provider, messages, tools, model, maxTokens, temperature) {
  const endpoint = PROVIDER_ENDPOINTS[provider.provider_name]
  if (!endpoint) throw new Error(`Unknown provider: ${provider.provider_name}`)

  const apiKey = resolveApiKey(provider)
  if (!apiKey) {
    const err = new Error(`[${provider.provider_name}] NO_API_KEY: ai_providers.api_key is empty and no env fallback is set`)
    err.code = 'NO_API_KEY'
    err.provider = provider.provider_name
    throw err
  }

  const actualModel = provider.model || model || DEFAULT_MODEL

  if (provider.provider_name === 'gemini') {
    const url = `${endpoint}/${actualModel}:generateContent?key=${apiKey}`
    const payload = buildGeminiPayload(messages, tools, actualModel, maxTokens, temperature)
    console.log(`[ai] -> gemini model=${actualModel} payload bytes=${JSON.stringify(payload).length} tools=${tools?.length || 0}`)

    let res
    try {
      res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      const err = new Error(`[gemini] ${e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'}: ${e.message}`)
      err.code = e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
      err.provider = 'gemini'
      throw err
    }

    if (!res.ok) {
      const { text, message } = await readErrorBody(res)
      throw buildHttpError('gemini', res, text, message)
    }

    const data = await res.json()
    return parseGeminiResponse(data)
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
  if (provider.provider_name === 'openrouter') {
    headers['HTTP-Referer'] = process.env.VITE_APP_URL || 'https://portfolio.vercel.app'
  }

  const payload = buildStandardPayload(messages, tools, actualModel, maxTokens, temperature)
  console.log(`[ai] -> ${provider.provider_name} model=${actualModel} payload bytes=${JSON.stringify(payload).length} tools=${tools?.length || 0}`)
  console.log('[ai] messages:', summarizeMessages(messages))
  // For deep debugging only (may be large):
  // console.log('[ai] payload:', JSON.stringify(payload).slice(0, 4000))

  let res
  try {
    res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  } catch (e) {
    const err = new Error(`[${provider.provider_name}] ${e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'}: ${e.message}`)
    err.code = e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
    err.provider = provider.provider_name
    throw err
  }

  if (!res.ok) {
    const { text, message } = await readErrorBody(res)
    throw buildHttpError(provider.provider_name, res, text, message)
  }

  const data = await res.json()

  const choice = data.choices?.[0]
  if (!choice) return null

  return {
    content: choice.message?.content || null,
    tool_calls: choice.message?.tool_calls || null,
  }
}

export async function chatWithFallback(messages, tools, preferredModel, maxTokens, temperature) {
  const providers = await getEnabledProviders()
  if (!providers.length) return null

  const errors = []

  for (const provider of providers) {
    try {
      const result = await chatWithProvider(provider, messages, tools, preferredModel, maxTokens, temperature)
      if (result) return { result, provider: provider.provider_name }
    } catch (err) {
      const tag = `${err.code || 'ERROR'}${err.status ? ' ' + err.status : ''}`
      errors.push(`${provider.provider_name}[${tag}]: ${err.message}`)
      console.warn(`AI provider "${provider.provider_name}" failed (${tag}), trying next...`)
    }
  }

  const aggregate = new Error(`All AI providers failed. Errors: ${errors.join('; ')}`)
  aggregate.code = 'ALL_PROVIDERS_FAILED'
  throw aggregate
}

export async function diagnoseProviders() {
  const providers = await getEnabledProviders()
  const results = []

  for (const p of providers) {
    const key = resolveApiKey(p)
    const entry = { provider: p.provider_name, model: p.model || null, hasKey: !!key }

    if (!key) {
      results.push({ ...entry, status: 'skipped', error: 'No API key (DB and env both empty)' })
      continue
    }

    try {
      const t0 = Date.now()
      const r = await chatWithProvider(p, [{ role: 'user', content: 'ping' }], null, 8, 0)
      results.push({ ...entry, status: 'ok', ms: Date.now() - t0, reply: r?.content?.slice(0, 60) || null })
    } catch (e) {
      results.push({
        ...entry,
        status: 'error',
        code: e.code || 'ERROR',
        httpStatus: e.status || null,
        retryAfter: e.retryAfter || null,
        error: e.message,
        body: e.body || null,
      })
    }
  }

  return results
}
