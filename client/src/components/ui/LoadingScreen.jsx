import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

function Particles({ count = 40 }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 0.5, dur: Math.random() * 5 + 4, del: Math.random() * 5,
    color: i % 4 === 0 ? '#00F0FF' : i % 4 === 1 ? '#7C3AED' : i % 4 === 2 ? '#FF3B6F' : '#00E676',
    driftX: (Math.random() - 0.5) * 30,
    driftY: (Math.random() - 0.5) * 20,
  })), [count])
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles.map(p => (
    <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 12px ${p.color}` }}
      animate={{ x: [0, p.driftX, 0], y: [0, p.driftY, 0], opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: 'easeInOut' }} />
  ))}</div>
}

function LoadingRing({ size, duration, delay = 0, color = 'rgba(0,240,255,0.3)', reverse = false }) {
  return (
    <motion.div className="absolute rounded-full border border-transparent" style={{ width: size, height: size, borderTopColor: color, borderWidth: Math.max(1.5, size / 80) }}
      animate={{ rotate: reverse ? -360 : 360 }} transition={{ duration, repeat: Infinity, ease: 'linear', delay }} />
  )
}

const LOADING_STEPS = [
  'Initializing kernel modules...',
  'Loading neural network...',
  'Establishing secure connections...',
  'Calibrating AI systems...',
  'Syncing data pipelines...',
  'Optimizing performance...',
  'Ready',
]

const STATUS_LINES = [
  '> Booting AI Engine v3.2...',
  '> Loading neural pathways...',
  '> Handshake: OK | Latency: 4ms',
  '> Accelerators calibrated',
  '> 1,024 nodes synchronized',
  '> GPU: Online | Memory: 14.2 GB',
  '> All systems operational',
]

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const [showSubtext, setShowSubtext] = useState(false)

  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 2800); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (!isLoading) return
    const timers = LOADING_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 350 + 150))
    const g1 = setTimeout(() => setGlitch(true), 500)
    const g2 = setTimeout(() => setGlitch(false), 520)
    const g3 = setTimeout(() => setGlitch(true), 1100)
    const g4 = setTimeout(() => setGlitch(false), 1120)
    const g5 = setTimeout(() => setGlitch(true), 1800)
    const g6 = setTimeout(() => setGlitch(false), 1820)
    const st = setTimeout(() => setShowSubtext(true), 800)
    return () => { timers.forEach(t => clearTimeout(t)); clearTimeout(g1); clearTimeout(g2); clearTimeout(g3); clearTimeout(g4); clearTimeout(g5); clearTimeout(g6); clearTimeout(st) }
  }, [isLoading])

  const ringColors = useMemo(() => [
    'rgba(0,240,255,0.35)',
    'rgba(124,58,237,0.3)',
    'rgba(255,59,111,0.25)',
    'rgba(0,230,118,0.2)',
    'rgba(0,240,255,0.15)',
  ], [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          <Particles count={50} />

          {/* Scanning line */}
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent)' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Grid scan overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center relative"
          >
            {/* Outer rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 220, height: 220 }}>
              <LoadingRing size={220} duration={4} color={ringColors[0]} />
              <LoadingRing size={190} duration={3.2} delay={0.2} color={ringColors[1]} />
              <LoadingRing size={160} duration={2.6} delay={0.4} color={ringColors[2]} reverse />
              <LoadingRing size={130} duration={2} delay={0.6} color={ringColors[3]} />
              <LoadingRing size={100} duration={1.6} delay={0.8} color={ringColors[4]} reverse />
            </div>

            {/* Logo with glitch */}
            <motion.h1
              className="text-6xl sm:text-7xl font-heading font-bold relative z-10"
              style={{
                background: 'linear-gradient(135deg, #00F0FF, #7C3AED, #FF3B6F, #00F0FF)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <motion.span
                style={{ display: 'inline-block' }}
                animate={glitch ? { x: [0, -3, 4, -2, 1, 0], opacity: [1, 0.8, 0.85, 0.95, 1], skewX: [0, 2, -1, 0] } : { x: 0, skewX: 0 }}
                transition={{ duration: 0.2 }}
              >
                AH
              </motion.span>
            </motion.h1>

            {/* Sub text */}
            <motion.p
              className="text-[10px] font-mono text-text-muted/40 relative z-10 mt-2 tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={showSubtext ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              AI Engine v3.2
            </motion.p>

            {/* Progress bar */}
            <motion.div className="h-[3px] rounded-full w-40 mx-auto mt-6 relative z-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #00F0FF, #7C3AED, #FF3B6F, #00F0FF)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'], width: ['0%', '100%'] }}
                transition={{ duration: 2.4, ease: 'easeInOut' }} />
            </motion.div>

            {/* Status text */}
            <motion.div className="mt-4 relative z-10" key={step}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-xs font-mono text-text-muted tracking-widest">
                {STATUS_LINES[step] || STATUS_LINES[0]}
              </p>
              <motion.div className="flex items-center justify-center gap-1.5 mt-2">
                {LOADING_STEPS.map((_, i) => (
                  <motion.div key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i <= step ? '#00F0FF' : 'rgba(255,255,255,0.08)' }}
                    animate={i === step ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 0.6, repeat: i === step ? Infinity : 0 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
