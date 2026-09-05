import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let dpr = window.devicePixelRatio || 1
    let raf = null
    let particles = []

    function resize() {
      dpr = window.devicePixelRatio || 1
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    function initParticles() {
      particles = []
      const count = Math.max(40, Math.floor((w * h) / 12000))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          hue: Math.random() * 360,
          alpha: Math.random() * 0.9 + 0.1,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // subtle nebula background
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, 'rgba(155,92,255,0.06)')
      g.addColorStop(0.5, 'rgba(0,224,255,0.04)')
      g.addColorStop(1, 'rgba(255,77,109,0.06)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // draw particles
      for (let p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8)
        const color1 = `hsla(${(p.hue + 20) % 360},90%,60%,${p.alpha})`
        const color2 = `hsla(${(p.hue + 120) % 360},80%,50%,0)`
        gradient.addColorStop(0, color1)
        gradient.addColorStop(0.4, `hsla(${p.hue},85%,55%,${p.alpha * 0.45})`)
        gradient.addColorStop(1, color2)

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [canvasRef])
}

export default function Loading() {
  const canvasRef = useRef(null)
  useParticles(canvasRef)

  return (
    <div className="loading-root">
      <canvas ref={canvasRef} className="loading-canvas" aria-hidden />
      <div className="starfield" aria-hidden />
      <motion.div
        className="cinema-frame"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="50%" stopColor="#9b5cff" />
              <stop offset="100%" stopColor="#00e0ff" />
            </linearGradient>
          </defs>
          <motion.text
            x="50%"
            y="55%"
            textAnchor="middle"
            fontFamily="Orbitron, sans-serif"
            fontSize="36"
            fill="none"
            stroke="url(#g)"
            strokeWidth="1"
            style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))' }}
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          >
            WELCOME
          </motion.text>
        </motion.svg>

        <motion.div
          className="cinema-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'circOut', delay: 0.6 }}
        />

        <motion.div
          className="glow-pulse"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
