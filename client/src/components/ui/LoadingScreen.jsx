import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

function Particles() {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5, dur: Math.random() * 4 + 3, del: Math.random() * 4,
    color: i % 3 === 0 ? '#00F0FF' : i % 3 === 1 ? '#7C3AED' : '#FF3B6F',
  })), [])
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles.map(p => (
    <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 10px ${p.color}` }}
      animate={{ y: [0, -20, 0], opacity: [0, 0.8, 0] }} transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: 'easeInOut' }} />
  ))}</div>
}

function LoadingRing({ size, duration, delay = 0, color = 'rgba(0,240,255,0.3)', reverse = false }) {
  return (
    <motion.div className="absolute rounded-full border border-transparent border-t-2" style={{ width: size, height: size, borderTopColor: color }}
      animate={{ rotate: reverse ? -360 : 360 }} transition={{ duration, repeat: Infinity, ease: 'linear', delay }} />
  )
}

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const steps = ['Initializing kernel', 'Loading neural engines', 'Establishing connections', 'Calibrating systems', 'Ready']

  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 2200); return () => clearTimeout(t) }, [])
  useEffect(() => {
    if (!isLoading) return
    const timers = steps.map((_, i) => setTimeout(() => setStep(i), i * 400 + 200))
    // Glitch flash at 40% and 70% progress
    const g1 = setTimeout(() => setGlitch(true), 600)
    const g2 = setTimeout(() => setGlitch(false), 620)
    const g3 = setTimeout(() => setGlitch(true), 1200)
    const g4 = setTimeout(() => setGlitch(false), 1220)
    return () => { timers.forEach(t => clearTimeout(t)); clearTimeout(g1); clearTimeout(g2); clearTimeout(g3); clearTimeout(g4) }
  }, [isLoading])

  // Ring colors cycle through accent palette
  const ringColors = useMemo(() => [
    'rgba(0,240,255,0.3)',
    'rgba(124,58,237,0.3)',
    'rgba(255,59,111,0.25)',
    'rgba(0,230,118,0.25)',
  ], [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
          <Particles />
          <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} className="text-center relative">
            {/* Outer rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 160, height: 160 }}>
              <LoadingRing size={160} duration={3} color={ringColors[0]} />
              <LoadingRing size={140} duration={2.5} delay={0.3} color={ringColors[1]} />
              <LoadingRing size={120} duration={2} delay={0.6} color={ringColors[2]} reverse />
              <LoadingRing size={100} duration={1.8} delay={0.9} color={ringColors[3]} />
            </div>
            <motion.h1
              className="text-5xl sm:text-6xl font-heading font-bold mb-4 relative z-10"
              style={{
                background: 'linear-gradient(135deg, #00F0FF, #7C3AED, #FF3B6F, #00F0FF)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: glitch ? 'url(#glitch)' : 'none',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <motion.span
                animate={glitch ? { x: [0, -2, 3, -1, 0], opacity: [1, 0.85, 0.9, 1] } : {}}
                transition={{ duration: 0.15 }}
              >
                AH
              </motion.span>
            </motion.h1>
            {/* Progress bar */}
            <motion.div className="h-0.5 rounded-full w-32 mx-auto mb-4 relative z-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #00F0FF, #7C3AED)' }}
                animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
            </motion.div>
            {/* Status text */}
            <motion.p className="text-xs font-mono text-text-muted relative z-10 tracking-widest" key={step}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {`> ${steps[step]}...`}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
