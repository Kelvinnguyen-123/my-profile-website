import React, { useEffect, useRef } from 'react'

export default function Background() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let dpr = window.devicePixelRatio || 1
    let raf = null

    const stars = []
    const shooting = []
    const SPEED_MULT = 1.8
    const lights = []
    const bands = []
    const particles = []

    function resize() {
      dpr = window.devicePixelRatio || 1
      // prefer reliable viewport dimensions
      w = canvas.clientWidth || window.innerWidth
      h = canvas.clientHeight || window.innerHeight
      // ensure canvas CSS sized to viewport
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
      initLights()
      initBands()
      initParticles()
    }

    function initBands() {
      bands.length = 0
      const cx = w * 0.5
      const cy = h * 0.4
      const maxR = Math.max(w, h) * 0.8
      // a few translucent nebula/steam bands
      bands.push({ cx, cy, r: maxR * 0.45, color: '155,92,255', speed: 0.00008, phase: Math.random() * 10, offset: 0.12 })
      bands.push({ cx, cy, r: maxR * 0.6, color: '0,224,255', speed: -0.00005, phase: Math.random() * 10, offset: -0.08 })
      bands.push({ cx: w * 0.3, cy: h * 0.75, r: maxR * 0.38, color: '255,77,109', speed: 0.00006, phase: Math.random() * 10, offset: 0.2 })
    }

    function initParticles() {
      particles.length = 0
      const base = Math.floor((w * h) / 90000)
      const count = Math.max(36, base)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.6 + 0.12,
          hue: Math.random() > 0.6 ? '255,255,255' : (Math.random() > 0.5 ? '155,92,255' : '0,224,255')
        })
      }
    }

    function initLights() {
      lights.length = 0
      // relative positions and movement speeds
      lights.push({ x: 0.18, y: 0.18, r: Math.max(w, h) * 0.5, color: '255,92,255', speed: 0.00012, phase: Math.random() * 10 })
      lights.push({ x: 0.78, y: 0.22, r: Math.max(w, h) * 0.4, color: '0,224,255', speed: -0.00008, phase: Math.random() * 10 })
      lights.push({ x: 0.55, y: 0.75, r: Math.max(w, h) * 0.6, color: '255,77,109', speed: 0.00006, phase: Math.random() * 10 })
    }

    function initStars() {
      stars.length = 0
      const base = Math.floor((w * h) / 12000)
      const count = Math.max(180, base)
      for (let i = 0; i < count; i++) {
        const layer = Math.random() < 0.6 ? 'small' : (Math.random() < 0.85 ? 'mid' : 'large')
        const r = layer === 'small' ? (Math.random() * 1.2 + 0.2) : layer === 'mid' ? (Math.random() * 1.8 + 0.6) : (Math.random() * 3 + 1)
        const speed = layer === 'small' ? 0.04 : layer === 'mid' ? 0.08 : 0.16
        const angle = Math.random() * Math.PI * 2
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          vx: Math.cos(angle) * speed * SPEED_MULT * (0.6 + Math.random() * 0.8),
          vy: Math.sin(angle) * speed * SPEED_MULT * (0.6 + Math.random() * 0.8),
          baseAlpha: Math.random() * 0.7 + 0.15,
          twinkle: Math.random() * Math.PI * 2,
          layer
        })
      }
    }

    let mouseX = w / 2
    let mouseY = h / 2

    function onMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h)

      // moving gradient background (nebula-like)
      const g = ctx.createLinearGradient((Math.sin(time / 6000) + 1) * w * 0.5, 0, 0, (Math.cos(time / 7000) + 1) * h * 0.5)
      g.addColorStop(0, 'rgba(12,6,30,0.90)')
      g.addColorStop(0.4, 'rgba(25,6,44,0.90)')
      g.addColorStop(1, 'rgba(2,10,20,0.95)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // subtle colored glow layers
      const glow = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, Math.max(w, h) * 0.8)
      glow.addColorStop(0, 'rgba(155,92,255,0.10)')
      glow.addColorStop(1, 'rgba(155,92,255,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // moving light sources / nebula bands
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (let L of lights) {
        const px = w * L.x + Math.sin(time * L.speed + L.phase) * Math.max(1, w * 0.02)
        const py = h * L.y + Math.cos(time * L.speed * 1.2 + L.phase) * Math.max(1, h * 0.02)
        const rg = ctx.createRadialGradient(px, py, 0, px, py, L.r)
        rg.addColorStop(0, `rgba(${L.color},0.22)`)
        rg.addColorStop(0.3, `rgba(${L.color},0.12)`)
        rg.addColorStop(1, `rgba(${L.color},0)`)
        ctx.fillStyle = rg
        ctx.fillRect(0, 0, w, h)
      }
      ctx.restore()

      // nebula bands (soft elliptical shapes)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (let b of bands) {
        const bx = b.cx + Math.sin(time * b.speed + b.phase) * (Math.max(1, w * 0.03))
        const by = b.cy + Math.cos(time * b.speed * 1.1 + b.phase) * (Math.max(1, h * 0.02))
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r)
        grad.addColorStop(0, `rgba(${b.color},0.26)`)
        grad.addColorStop(0.45, `rgba(${b.color},0.12)`)
        grad.addColorStop(1, `rgba(${b.color},0)`)
        ctx.fillStyle = grad
        // soft ellipse by scaling
        ctx.translate(bx, by)
        ctx.rotate((time * 0.0001 + b.phase) % (Math.PI * 2))
        ctx.scale(1 + b.offset, 0.6 + (b.offset * 0.6))
        ctx.beginPath()
        ctx.arc(0, 0, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      ctx.restore()

      // small floating particles for extra detail
      for (let p of particles) {
        p.x += p.vx
        p.y += p.vy
        // slight parallax
        p.x += (mouseX - w / 2) * 0.00002
        p.y += (mouseY - h / 2) * 0.00002
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        const palpha = Math.min(1, p.alpha * 1.6)
        pg.addColorStop(0, `rgba(${p.hue},${palpha})`)
        pg.addColorStop(0.6, `rgba(${p.hue},${palpha * 0.45})`)
        pg.addColorStop(1, `rgba(${p.hue},0)`)
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // stars
      for (let s of stars) {
        // subtle parallax with mouse and time-based motion
        s.x += s.vx + (mouseX - w / 2) * 0.00006 * (s.r)
        s.y += s.vy + (mouseY - h / 2) * 0.00006 * (s.r)
        if (s.x < -10) s.x = w + 10
        if (s.x > w + 10) s.x = -10
        if (s.y < -10) s.y = h + 10
        if (s.y > h + 10) s.y = -10

        // twinkle effect
        const t = time / 500 + s.twinkle
        const alpha = Math.max(0.08, Math.min(1, s.baseAlpha * (0.85 + 0.45 * Math.sin(t))))
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // occasional shooting star
      if (Math.random() < 0.012) {
        const sx = Math.random() * w * 0.8 + w * 0.1
        const sy = Math.random() * h * 0.3 + h * 0.05
        const speed = Math.random() * 8 + 10
        shooting.push({ x: sx, y: sy, vx: -speed, vy: speed * 0.2, life: 0, len: Math.random() * 220 + 120 })
      }

      for (let i = shooting.length - 1; i >= 0; i--) {
        const st = shooting[i]
        st.x += st.vx
        st.y += st.vy
        st.life += 1
        const grad = ctx.createLinearGradient(st.x, st.y, st.x + st.vx * st.len * 0.05, st.y + st.vy * st.len * 0.05)
        grad.addColorStop(0, 'rgba(255,255,255,0.95)')
        grad.addColorStop(0.6, 'rgba(255,155,200,0.6)')
        grad.addColorStop(1, 'rgba(255,155,200,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(st.x, st.y)
        ctx.lineTo(st.x - st.vx * 4, st.y - st.vy * 4)
        ctx.stroke()
        if (st.x < -200 || st.y > h + 200 || st.life > 180) shooting.splice(i, 1)
      }

      // faint grid lines for tech vibe
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'
      ctx.lineWidth = 1
      const spacing = 160
      ctx.beginPath()
      for (let x = 0; x < w; x += spacing) {
        ctx.moveTo(x + ((time / 8000) % spacing), 0)
        ctx.lineTo(x + ((time / 8000) % spacing), h)
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.moveTo(0, y + ((time / 10000) % spacing))
        ctx.lineTo(w, y + ((time / 10000) % spacing))
      }
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={ref} className="site-background" aria-hidden />
}
