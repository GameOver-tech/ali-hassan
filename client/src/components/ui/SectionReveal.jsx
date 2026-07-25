import { useState, useEffect, Children, isValidElement } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const variants = {
  fade: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  blur: {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -5, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  skew: {
    hidden: { opacity: 0, skewY: 2, y: 30 },
    visible: { opacity: 1, skewY: 0, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
}

const wordReveal = {
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: (i) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function SectionReveal({ children, className = '', delay = 0, type = 'fade', mode = 'container' }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const variant = variants[type] || variants.fade
  const yOffset = isMobile ? 20 : variant.hidden.y || 40
  const dur = isMobile ? 0.5 : variant.visible.transition?.duration || 0.7

  // Word-by-word mode
  if (mode === 'words') {
    const text = getTextContent(children)
    if (!text) return <>{children}</>
    const words = text.split(' ').filter(Boolean)
    return (
      <motion.div ref={ref} className={className}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.15em]"
            custom={i}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={wordReveal}
            style={{ perspective: 600 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={isMobile ? { opacity: 0, y: 20 } : variant.hidden}
      animate={inView ? (isMobile ? { opacity: 1, y: 0 } : variant.visible) : isMobile ? { opacity: 0, y: 20 } : variant.hidden}
      transition={{ duration: dur, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function getTextContent(node) {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (isValidElement(node) && node.props) {
    const child = node.props.children
    if (typeof child === 'string') return child
    if (Array.isArray(child)) return child.map(getTextContent).join(' ')
  }
  return ''
}
