import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useApp } from '../../context/AppContext'
import { adminAPI } from '../../services/api'

const quickReplies = ['What services do you offer?', 'What is your experience?', 'How can I hire you?', 'What technologies do you use?']

function ChatLink({ href, children }) {
  const label = String(children || '').replace(/^🔗\s*/, '')
  const displayText = label || href?.replace(/^https?:\/\//, '').split('/')[0] || 'Visit Link'
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/20 transition-all duration-200 break-all max-w-full">
      <FaExternalLinkAlt size={10} />
      <span className="truncate">{displayText}</span>
    </a>
  )
}

function ChatMarkdown({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      a: ChatLink,
      h1: ({ children }) => <h1 className="text-base font-heading font-bold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-sm font-heading font-semibold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-heading font-semibold text-accent mt-3 mb-1.5 first:mt-0">{children}</h3>,
      h4: ({ children }) => <h4 className="text-xs font-semibold text-text-primary mt-2 mb-1 first:mt-0">{children}</h4>,
      p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed text-sm">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
      li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
      code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-white/5 text-xs font-mono">{children}</code>,
      hr: () => <hr className="border-t border-border-subtle my-2" />,
    }}>{content}</ReactMarkdown>
  )
}

export default function Chatbot() {
  const { chatbotConfig } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: chatbotConfig?.greeting || '👋 Hi! I\'m Ali Hassan\'s AI assistant. Ask me anything!' }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const sidebarRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Scroll lock + focus input when chatbot opens/closes
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.classList.add('no-scroll')
      document.body.style.top = `-${scrollY}px`
      // Small delay so the sidebar animation starts before focusing
      setTimeout(() => inputRef.current?.focus(), 150)
    } else {
      const top = parseFloat(document.body.style.top || '0')
      document.body.classList.remove('no-scroll')
      document.body.style.top = ''
      window.scrollTo(0, -top)
    }
    return () => {
      const top = parseFloat(document.body.style.top || '0')
      document.body.classList.remove('no-scroll')
      document.body.style.top = ''
      window.scrollTo(0, -top)
    }
  }, [isOpen])

  // Escape key closes chatbot
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Focus trap — keep Tab cycling inside the sidebar
  const handleSidebarKeyDown = (e) => {
    if (e.key !== 'Tab' || !sidebarRef.current) return
    const focusable = sidebarRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Forward wheel/touch scroll on the sidebar to the messages container
  const sidebarScrollRef = useRef(null)
  const touchStartY = useRef(0)
  const handleSidebarWheel = (e) => {
    const msgs = sidebarRef.current?.querySelector('.chatbot-scroll')
    if (!msgs) return
    const { scrollTop, scrollHeight, clientHeight } = msgs
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return
    e.preventDefault()
    msgs.scrollTop += e.deltaY
  }
  const handleSidebarTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleSidebarTouchMove = (e) => {
    const msgs = sidebarRef.current?.querySelector('.chatbot-scroll')
    if (!msgs) return
    const dy = touchStartY.current - e.touches[0].clientY
    const { scrollTop, scrollHeight, clientHeight } = msgs
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1
    if ((dy < 0 && atTop) || (dy > 0 && atBottom)) return
    e.preventDefault()
    msgs.scrollTop += dy
    touchStartY.current = e.touches[0].clientY
  }

  if (chatbotConfig && chatbotConfig.enabled === false) return null

  const handleSend = async (message) => {
    const userMessage = message || input
    if (!userMessage.trim() || isLoading) return
    setInput('')
    setMessages(p => [...p, { role: 'user', content: userMessage }])
    setIsLoading(true)
    try {
      const res = await adminAPI.chat(userMessage)
      setMessages(p => [...p, { role: 'assistant', content: res.data.reply || res.data.message }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please email alihassan.webstudio@gmail.com for assistance.' }])
    } finally { setIsLoading(false) }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={sidebarRef}
            onKeyDown={handleSidebarKeyDown}
            onWheel={handleSidebarWheel}
            onTouchStart={handleSidebarTouchStart}
            onTouchMove={handleSidebarTouchMove}
            role="dialog"
            aria-modal="true"
            aria-label="AI Assistant Chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="fixed top-0 right-0 z-[90] h-full w-[400px] max-w-[92vw] bg-bg-surface/95 backdrop-blur-2xl border-l border-border-subtle shadow-elevated flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  <FaRobot className="text-accent text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">AI Assistant</p>
                  <p className="text-xs text-text-muted">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-all duration-200">
                <FaTimes size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-4 chatbot-scroll">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-[1.2rem] p-3.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-accent text-background shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'rounded-bl-sm bg-bg-elevated text-text-secondary border border-border-subtle'
                  }`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {msg.role === 'user' ? msg.content : <ChatMarkdown content={msg.content} />}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[1.2rem] rounded-bl-sm bg-bg-elevated border border-border-subtle p-3.5">
                    <FaSpinner className="animate-spin text-accent" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-6 pb-3 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map(reply => (
                    <button key={reply} onClick={() => handleSend(reply)}
                      className="rounded-full border border-border-subtle bg-bg-glass px-4 py-2 text-xs text-text-muted transition-all duration-300 hover:border-accent/30 hover:text-accent whitespace-nowrap">
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border-subtle px-6 py-5 shrink-0">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border-subtle bg-bg-glass px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/30 focus:outline-none focus:ring-0 transition-all duration-200"
                />
                <button onClick={() => handleSend()} disabled={isLoading}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-background transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 shrink-0">
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
