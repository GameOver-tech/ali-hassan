import { useEffect, useRef, useCallback } from 'react'
import { useMousePosition } from '../../hooks/useMousePosition'

const TRAIL_LEN = 4
const TRAIL_TTL = 600

export default function CursorEffect() {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)
  const trailRef = useRef([])
  const dotsRef = useRef([])
  const rafRef = useRef(null)
  useMousePosition()

  const createDot = useCallback(() => {
    const dot = document.createElement('div')
    dot.className = 'cursor-trail'
    dot.style.width = '4px'
    dot.style.height = '4px'
    document.body.appendChild(dot)
    return dot
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current
    if (!cursor || !follower) return

    // Ensure trail dots exist
    while (dotsRef.current.length < TRAIL_LEN) {
      dotsRef.current.push(createDot())
    }

    let mouseX = -100, mouseY = -100
    let followerX = -100, followerY = -100
    let ringPhase = 0
    let lastClickTime = 0

    const positions = Array.from({ length: TRAIL_LEN }, () => ({ x: -100, y: -100 }))
    const opacities = Array.from({ length: TRAIL_LEN }, () => 0)

    const handleMouse = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    const handleClick = () => {
      lastClickTime = performance.now()
    }

    const animate = (time) => {
      // Follower lerp
      followerX += (mouseX - followerX) * 0.1
      followerY += (mouseY - followerY) * 0.1
      follower.style.transform = `translate(${followerX - 15}px, ${followerY - 15}px)`

      // Trail: shift positions array
      for (let i = TRAIL_LEN - 1; i > 0; i--) {
        positions[i].x = positions[i - 1].x
        positions[i].y = positions[i - 1].y
        opacities[i] = opacities[i - 1]
      }
      positions[0] = { x: mouseX, y: mouseY }
      opacities[0] = 1

      // Fade trail
      for (let i = 0; i < TRAIL_LEN; i++) {
        opacities[i] = Math.max(0, opacities[i] - 0.03)
      }

      // Render trail dots
      for (let i = 0; i < TRAIL_LEN; i++) {
        const dot = dotsRef.current[i]
        if (!dot) continue
        const progress = i / TRAIL_LEN
        const size = 6 - progress * 4
        dot.style.transform = `translate(${positions[i].x - size / 2}px, ${positions[i].y - size / 2}px) scale(${1 - progress * 0.5})`
        dot.style.opacity = String(opacities[i] * 0.3)
        dot.style.width = `${size}px`
        dot.style.height = `${size}px`
      }

      // Ring glow oscillation (slow breathe)
      ringPhase += 0.008
      const glowIntensity = 0.25 + Math.sin(ringPhase) * 0.1
      follower.style.borderColor = `rgba(0,240,255,${glowIntensity})`
      follower.style.boxShadow = `0 0 15px rgba(0,240,255,${glowIntensity * 0.3})`

      // Click pulse
      const elapsed = time - lastClickTime
      if (elapsed < 400) {
        const t = elapsed / 400
        const pulse = 1 + Math.sin(t * Math.PI) * 0.5
        follower.style.transform = `translate(${followerX - 15}px, ${followerY - 15}px) scale(${pulse})`
        follower.style.borderColor = `rgba(0,240,255,${0.35 + Math.sin(t * Math.PI) * 0.15})`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouse, { passive: true })
    window.addEventListener('mousedown', handleClick, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mousedown', handleClick)
      dotsRef.current.forEach(dot => dot?.remove())
      dotsRef.current = []
    }
  }, [createDot])

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-3 h-3 bg-accent rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ transform: 'translate(-50%, -50%)' }} />
      <div ref={followerRef} className="fixed top-0 left-0 w-7 h-7 border border-accent/30 rounded-full pointer-events-none z-[9999] hidden md:block" style={{ transform: 'translate(-50%, -50%)' }} />
    </>
  )
}
