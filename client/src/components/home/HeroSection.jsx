import { useEffect, memo, useMemo, useRef, useCallback, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiActivity, FiZap } from 'react-icons/fi'
import { useMousePosition } from '../../hooks/useMousePosition'
import { useApp } from '../../context/AppContext'
import { useInView } from 'react-intersection-observer'

// ── 80-particle system ──
const Particles = memo(function Particles() {
  const particles = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 0.5, dur: Math.random() * 3 + 2, del: Math.random() * 3,
    color: i % 4 === 0 ? 'rgba(0,240,255,0.5)' : i % 4 === 1 ? 'rgba(124,58,237,0.4)' : i % 4 === 2 ? 'rgba(255,59,111,0.3)' : 'rgba(255,255,255,0.2)',
    glow: i % 3 === 0 ? '0 0 8px rgba(0,240,255,0.3)' : i % 5 === 0 ? '0 0 12px rgba(124,58,237,0.25)' : 'none',
    xDrift: (Math.random() - 0.5) * 40,
    yDrift: (Math.random() - 0.5) * 30,
  })), [])
  return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>{particles.map(p => (
    <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: p.glow, willChange: 'transform' }}
      animate={{ y: [0, -p.yDrift, 0], x: [0, p.xDrift * 0.5, 0], opacity: [0.08, 0.5, 0.08], scale: [1, 1.2, 1] }}
      transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: 'easeInOut' }} />
  ))}</div>
})

// ── Floating neural synapse nodes ──
const NeuralSynapses = memo(function NeuralSynapses() {
  const nodes = useMemo(() => [
    { x: 15, y: 20, size: 4, dur: 8, del: 0, driftX: 10, driftY: 8 },
    { x: 75, y: 15, size: 3, dur: 10, del: 1, driftX: -12, driftY: 6 },
    { x: 85, y: 70, size: 3.5, dur: 7, del: 2, driftX: 8, driftY: -10 },
    { x: 20, y: 80, size: 2.5, dur: 9, del: 0.5, driftX: -6, driftY: -8 },
    { x: 50, y: 40, size: 4.5, dur: 11, del: 3, driftX: 14, driftY: 12 },
  ], [])
  // Connection pairs
  const connections = useMemo(() => [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3], [1, 4],
  ], [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ willChange: 'transform' }}>
      <defs>
        <radialGradient id="synGrad"><stop offset="0%" stopColor="#00F0FF" stopOpacity="0.5" /><stop offset="100%" stopColor="#7C3AED" stopOpacity="0" /></radialGradient>
      </defs>
      {connections.map(([a, b], i) => {
        const n1 = nodes[a], n2 = nodes[b]
        return (
          <motion.line key={`conn-${i}`} x1={`${n1.x}%`} y1={`${n1.y}%`} x2={`${n2.x}%`} y2={`${n2.y}%`}
            stroke="url(#synGrad)" strokeWidth="0.5" strokeDasharray="4 4"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }} />
        )
      })}
      {nodes.map((n, i) => (
        <motion.circle key={`node-${i}`} cx={`${n.x}%`} cy={`${n.y}%`} r={n.size} fill="#00F0FF"
          filter="url(#chipGlow)"
          animate={{ x: [0, n.driftX, 0], y: [0, n.driftY, 0], opacity: [0.2, 0.6, 0.2], r: [n.size, n.size * 1.3, n.size] }}
          transition={{ duration: n.dur, repeat: Infinity, delay: n.del, ease: 'easeInOut' }} />
      ))}
    </svg>
  )
})

// ── SVG Motherboard / Cybernetic Circuit Board ──
const NeuralLines = memo(function NeuralLines() {
  const traces = useMemo(() => [
    { d: 'M 80,0 L 80,200 L 160,280 L 160,700', dur: 2, del: 0 },
    { d: 'M 240,100 L 240,300 L 180,360 L 180,700', dur: 1.8, del: 0.15 },
    { d: 'M 400,0 L 400,120 L 320,200 L 320,500 L 400,580 L 400,700', dur: 2.4, del: 0.3 },
    { d: 'M 560,0 L 560,180 L 480,260 L 480,700', dur: 2.2, del: 0.05 },
    { d: 'M 720,0 L 720,220 L 640,300 L 640,700', dur: 1.9, del: 0.2 },
    { d: 'M 880,0 L 880,140 L 800,220 L 800,700', dur: 2.1, del: 0.1 },
    { d: 'M 0,120 L 240,120 L 320,200', dur: 1.6, del: 0.35 },
    { d: 'M 160,280 L 320,280 L 400,360 L 560,360', dur: 2, del: 0.25 },
    { d: 'M 0,440 L 240,440 L 320,500', dur: 1.7, del: 0.4 },
    { d: 'M 480,260 L 560,260 L 640,300', dur: 1.5, del: 0.45 },
    { d: 'M 640,600 L 400,600 L 400,580', dur: 1.4, del: 0.5 },
    { d: 'M 800,220 L 960,220 L 1040,300 L 1040,700', dur: 2.3, del: 0.15 },
    { d: 'M 240,100 L 320,100 L 400,120', dur: 1.3, del: 0.55 },
    { d: 'M 560,180 L 720,220', dur: 1.2, del: 0.6 },
    { d: 'M 80,600 L 160,600 L 240,500 L 320,500', dur: 1.7, del: 0.3 },
    { d: 'M 480,600 L 640,600', dur: 1, del: 0.65 },
    { d: 'M 800,600 L 960,600 L 1040,500 L 1200,500', dur: 1.9, del: 0.2 },
  ], [])

  const chips = useMemo(() => [
    { x: 240, y: 300, w: 28, h: 20, label: 'CPU' },
    { x: 400, y: 120, w: 20, h: 16, label: 'GPU' },
    { x: 560, y: 260, w: 24, h: 18, label: 'NPU' },
    { x: 720, y: 220, w: 18, h: 14, label: 'RAM' },
    { x: 320, y: 500, w: 22, h: 16, label: 'IO' },
  ], [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"
      style={{ willChange: 'transform' }}>
      <defs>
        <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#00E676" />
        </linearGradient>
        <filter id="chipGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {traces.map((t, i) => (
        <g key={`trace-${i}`}>
          <path d={t.d} stroke="url(#traceGrad)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          <motion.circle r="2.5" fill="#00F0FF" filter="url(#chipGlow)"
            initial={{ offsetDistance: '0%', opacity: 0 }}
            style={{ offsetPath: `path('${t.d}')`, willChange: 'transform' }}
            animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: t.dur, repeat: Infinity, ease: 'linear', delay: t.del }} />
        </g>
      ))}

      {chips.map((c, i) => (
        <g key={`chip-${i}`}>
          <motion.rect x={c.x - c.w / 2} y={c.y - c.h / 2} width={c.w} height={c.h} rx="3" fill="none" stroke="#00F0FF" strokeWidth="1"
            animate={{ opacity: [0.3, 0.7, 0.3], stroke: ['#00F0FF', '#7C3AED', '#00F0FF'] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
          {[0, 1, 2, 3].map(pin => (
            <line key={`pin-${i}-${pin}`} x1={c.x - c.w / 2 - 3} y1={c.y - c.h / 2 + pin * 5 + 2} x2={c.x - c.w / 2} y2={c.y - c.h / 2 + pin * 5 + 2} stroke="#00F0FF" strokeWidth="0.6" opacity="0.4" />
          ))}
          {[0, 1, 2, 3].map(pin => (
            <line key={`pin-r-${i}-${pin}`} x1={c.x + c.w / 2} y1={c.y - c.h / 2 + pin * 5 + 2} x2={c.x + c.w / 2 + 3} y2={c.y - c.h / 2 + pin * 5 + 2} stroke="#00F0FF" strokeWidth="0.6" opacity="0.4" />
          ))}
        </g>
      ))}

      {[[80,200],[160,280],[240,100],[240,300],[320,200],[320,500],[400,120],[400,580],[480,260],[560,180],[560,360],[640,300],[720,220],[800,220],[880,140],[1040,300]].map(([cx, cy], i) => (
        <g key={`via-${i}`}>
          <circle cx={cx} cy={cy} r="3" fill="none" stroke="#00F0FF" strokeWidth="0.8" opacity="0.4" />
          <motion.circle cx={cx} cy={cy} r="1.5" fill="#00F0FF"
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.08 }} />
        </g>
      ))}
    </svg>
  )
})

// ── 3D Tilt Portrait Container ──
function TiltContainer({ children }) {
  const ref = useRef(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { damping: 15, stiffness: 150 })
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { damping: 15, stiffness: 150 })
  const gs = useSpring(useTransform(x, [-0.5, 0.5], [1, 1.02]), { damping: 20, stiffness: 200 })

  const handleMouse = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px); y.set(py)
  }, [x, y])

  const handleLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, scale: gs, perspective: 800, willChange: 'transform' }}
      className="transition-transform duration-100">
      {children}
    </motion.div>
  )
}

// ── Magnetic Button with Liquid Fill / Glow Border Hover ──
function MagneticButton({ children, className = '', to, external = false, variant = 'primary' }) {
  const ref = useRef(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const mx = useSpring(x, { damping: 15, stiffness: 200 })
  const my = useSpring(y, { damping: 15, stiffness: 200 })

  const handleMouse = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = e.clientX - rect.left - rect.width / 2
    const py = e.clientY - rect.top - rect.height / 2
    x.set(px * 0.3); y.set(py * 0.3)
  }, [x, y])
  const handleLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  const baseClasses = variant === 'primary'
    ? 'group inline-flex items-center justify-center gap-2 rounded-full px-7 sm:px-8 min-h-[50px] font-semibold text-sm sm:text-base relative overflow-hidden cursor-pointer'
    : 'group inline-flex items-center justify-center gap-2 rounded-full border border-border-visible bg-bg-glass px-7 sm:px-8 min-h-[50px] font-semibold text-sm sm:text-base text-text-primary relative overflow-hidden cursor-pointer'

  const innerBtn = (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave} style={{ x: mx, y: my, willChange: 'transform' }}
      className={`${baseClasses} ${className}`}>
      {variant === 'primary' ? (
        <>
          <span className="absolute inset-0 w-full h-full bg-accent transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-y-0 origin-bottom rounded-full" />
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: '0 0 40px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.2)', willChange: 'transform' }} />
          <span className="relative z-10 flex items-center gap-2 text-background group-hover:text-accent transition-colors duration-500">
            {children}
          </span>
        </>
      ) : (
        <>
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
            style={{ boxShadow: 'inset 0 0 0 1.5px rgba(0,240,255,0.4), 0 0 30px rgba(0,240,255,0.15)', willChange: 'transform' }} />
          <span className="absolute inset-0 rounded-full bg-accent/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left" />
          <span className="relative z-10 flex items-center gap-2 group-hover:text-accent transition-colors duration-500">
            {children}
          </span>
        </>
      )}
    </motion.div>
  )

  if (external) return <a href={to} target="_blank" rel="noopener noreferrer">{innerBtn}</a>
  return <Link to={to}>{innerBtn}</Link>
}

// ── Animated Counter (used in metrics strip) ──
function AnimatedCounter({ value, suffix, label }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true })
  useEffect(() => {
    if (!inView) return
    let start = 0; const duration = 2000; const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => { start += step; if (start >= value) { setCount(value); clearInterval(timer) } else setCount(start) }, 16)
    return () => clearInterval(timer)
  }, [inView, value])
  return (
    <div ref={ref} className="text-center">
      <motion.span className="text-xl sm:text-2xl font-heading font-bold text-gradient block"
        initial={{ scale: 0.3, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}>
        {count}{suffix}
      </motion.span>
      <motion.p className="text-text-muted/60 text-[11px] mt-0.5 font-medium tracking-wide uppercase"
        initial={{ opacity: 0, y: 6 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.4 }}>
        {label}
      </motion.p>
    </div>
  )
}

// ── Portrait ──
const HeroPortrait = memo(function HeroPortrait({ photoUrl }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TiltContainer>
          <div className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-[280px] sm:w-[280px] md:h-[340px] md:w-[340px] lg:h-[440px] lg:w-[440px]">
            {/* Animated gradient border ring */}
            <motion.div
              className="absolute inset-[-3px] rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(0,240,255,0.15), rgba(124,58,237,0.15), transparent)',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            {/* Glow layers */}
            <motion.div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(0,240,255,0.15), transparent 70%)' }}
              animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
            {/* Rotating rings — 3 rings staggered */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-8px] rounded-full border border-accent/20 sm:inset-[-14px]" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-3px] rounded-full border border-accent-neural/15 sm:inset-[-8px]" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-16px] rounded-full border border-accent-green/10 sm:inset-[-22px]" />
            {/* Orbit ring with 4 data dots */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-16px] sm:inset-[-26px]">
              {[{ color: '#00F0FF', shadow: 'rgba(0,240,255,0.6)', size: 'w-2 h-2' }, { color: '#FF3B6F', shadow: 'rgba(255,59,111,0.5)', size: 'w-1.5 h-1.5' }, { color: '#7C3AED', shadow: 'rgba(124,58,237,0.5)', size: 'w-1.5 h-1.5' }, { color: '#00E676', shadow: 'rgba(0,230,118,0.5)', size: 'w-1.5 h-1.5' }].map((dot, i) => (
                <div key={i} className={`absolute top-0 left-1/2 -translate-x-1/2 ${dot.size} rounded-full`} style={{ background: dot.color, boxShadow: `0 0 10px ${dot.shadow}` }} />
              ))}
            </motion.div>
            {/* Image */}
            <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-bg-surface to-background p-[2px] shadow-elevated">
              <div className="h-full w-full rounded-full bg-bg-surface overflow-hidden">
                {photoUrl ? <img src={photoUrl} alt="Portrait of Ali Hassan, AI Engineer" loading="eager" fetchpriority="high" decoding="async" width="440" height="440" className="h-full w-full rounded-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center text-4xl sm:text-6xl md:text-8xl font-heading font-bold text-gradient">AH</div>}
              </div>
            </div>
            {/* Status dot */}
            <motion.div className="absolute bottom-4 right-4 w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,230,118,0.6)]" style={{ background: '#00E676' }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          </div>
        </TiltContainer>
      </motion.div>
    </motion.div>
  )
})

// ── Metrics strip ──
function MetricsStrip() {
  const metrics = useMemo(() => [
    { value: 50, suffix: '+', label: 'Projects Deployed' },
    { value: 15, suffix: '+', label: 'AI Models Built' },
    { value: 99, suffix: '%', label: 'Client Satisfaction' },
  ], [])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto lg:mx-0"
    >
      {metrics.map((m, i) => (
        <div key={i} className="text-center border-r border-border-subtle last:border-r-0 px-2">
          <AnimatedCounter value={m.value} suffix={m.suffix} label={m.label} />
        </div>
      ))}
    </motion.div>
  )
}

// ── Typing Animation for rotating titles ──
function TypingAnimation({ titles, fallbackTitle }) {
  const [displayText, setDisplayText] = useState('')
  const [titleIndex, setTitleIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)

  const list = titles?.length ? titles : [fallbackTitle]

  useEffect(() => {
    if (list.length === 0) return

    const currentTitle = list[titleIndex % list.length]
    if (!currentTitle) return

    if (!isDeleting && charIndex < currentTitle.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentTitle.slice(0, charIndex + 1))
        setCharIndex(c => c + 1)
      }, 80)
    } else if (!isDeleting && charIndex === currentTitle.length) {
      // Pause at full text
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && charIndex > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentTitle.slice(0, charIndex - 1))
        setCharIndex(c => c - 1)
      }, 40)
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      setTitleIndex(i => i + 1)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [charIndex, isDeleting, titleIndex, list])

  return <>{displayText}<span className="animate-pulse text-accent">|</span></>
}

export default function HeroSection() {
  const { normalized } = useMousePosition()
  const { heroData } = useApp()

  const badgeText = heroData?.badge_text || 'Systems Online'
  const introParagraph = heroData?.intro_paragraph || 'I build production-grade AI systems, robotics control software, and intelligent applications that power the next generation of autonomous technology.'
  const heroName = heroData?.name || 'Ali Hassan'
  const heroTitle = heroData?.title || 'Graphic Designer'
  const heroSubtitle = heroData?.subtitle || ''
  const typingTitles = heroData?.typing_titles

  return (
    <section className="relative min-h-[100dvh] pt-28 md:pt-32 flex items-center overflow-hidden scanlines" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0px))' }}>
      <div className="absolute inset-0 bg-gradient-soft" />
      <div className="absolute inset-0 animated-grid opacity-25" />
      <Particles />
      <NeuralLines />
      <NeuralSynapses />

      {/* Terminal status badge — top right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute top-28 right-4 lg:right-8 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/10 bg-bg-glass/60 backdrop-blur-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
        <span className="text-[11px] font-mono text-text-muted tracking-wide">
          AI Systems: <span className="text-accent-green">Online</span>
          <span className="mx-1.5 opacity-30">|</span>
          Engine: <span className="text-accent">Active</span>
        </span>
      </motion.div>

      {/* Floating gradient orbs */}
      <motion.div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none max-w-[200vw]"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent-neural/4 blur-[150px] pointer-events-none max-w-[200vw]"
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Parallax blobs */}
      <div className="blob blob-1" aria-hidden="true" style={{ transform: `translate(${(normalized.x - 0.5) * 24}px, ${(normalized.y - 0.5) * 24}px)`, willChange: 'transform' }} />
      <div className="blob blob-2" aria-hidden="true" style={{ transform: `translate(${(normalized.x - 0.5) * -24}px, ${(normalized.y - 0.5) * -24}px)`, willChange: 'transform' }} />

      <div className="relative w-full max-w-7xl mx-auto px-[clamp(16px,5vw,32px)] sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-16 items-center">
          <div className="lg:order-2 flex justify-center pt-4 sm:pt-6 lg:pt-0"><HeroPortrait photoUrl={heroData?.photo_url} /></div>
          <div className="lg:order-1 space-y-6 sm:space-y-7 lg:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <motion.span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent backdrop-blur-sm"
                animate={{ boxShadow: ['0 0 20px rgba(0,240,255,0.1)', '0 0 40px rgba(0,240,255,0.25)', '0 0 20px rgba(0,240,255,0.1)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
                <FiZap size={12} className="mr-0.5" />
                {badgeText}
              </motion.span>
            </motion.div>

            {/* Headline with split text animation — h1 for name, h2 for title */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
              <h1 className="text-[clamp(2rem,8vw,3rem)] sm:text-5xl lg:text-7xl xl:text-[5.5rem] font-heading font-bold leading-[1.1] sm:leading-[1] lg:leading-[0.95] tracking-[-0.03em] text-text-primary">
                {heroName.split(' ').map((word, i) => (
                  <motion.span key={i} className="inline-block mr-[0.2em]"
                    initial={{ opacity: 0, y: 40, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}>
                    {word}
                  </motion.span>
                ))}
              </h1>
              <motion.h2
                className="text-gradient-pulse inline-block mt-2 text-[clamp(1.2rem,4vw,2rem)] sm:text-2xl lg:text-3xl font-heading font-bold"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
                <TypingAnimation titles={typingTitles} fallbackTitle={heroTitle} />
              </motion.h2>
              {heroSubtitle && (
                <motion.p className="text-text-muted mt-2 text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  {heroSubtitle}
                </motion.p>
              )}
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
              className="max-w-xl mx-auto lg:mx-0 text-[clamp(0.95rem,3.5vw,1.05rem)] sm:text-lg leading-[1.7] sm:leading-8 text-text-secondary">
              {introParagraph}
            </motion.p>

            {/* Magnetic buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <MagneticButton to="/projects" variant="primary">
                <FiActivity className="animate-pulse-slow" />
                <span>View My Work</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </MagneticButton>
              <MagneticButton to="/contact" variant="secondary">
                <span>Contact Me</span>
              </MagneticButton>
            </motion.div>

            {/* Metrics strip */}
            <MetricsStrip />
          </div>
        </div>
      </div>

      {/* Scroll indicator — mouse icon + animated dot */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-text-muted/60 mb-1">Scroll</span>
        <div className="relative w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center p-1">
          <motion.div
            className="w-1 h-2 rounded-full bg-accent"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
