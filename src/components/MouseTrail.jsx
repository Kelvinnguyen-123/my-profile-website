import React, { useEffect } from 'react'

export default function MouseTrail() {
  useEffect(() => {
    const particles = []

    const createParticle = (x, y) => {
      const particle = document.createElement('span')

      particle.className = 'neon-particle'

      const size = Math.random() * 5 + 2

      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Hướng bay ngẫu nhiên
      particle.style.setProperty(
        '--x',
        `${(Math.random() - 0.5) * 60}px`
      )

      particle.style.setProperty(
        '--y',
        `${(Math.random() - 0.5) * 60}px`
      )

      document.body.appendChild(particle)
      particles.push(particle)

      setTimeout(() => {
        particle.remove()

        const index = particles.indexOf(particle)

        if (index !== -1) {
          particles.splice(index, 1)
        }
      }, 800)

      // Giới hạn particle
      if (particles.length > 40) {
        particles.shift()?.remove()
      }
    }

    const handleMouseMove = (e) => {
      // Tạo 1-2 particle mỗi lần di chuyển
      createParticle(e.clientX, e.clientY)

      if (Math.random() > 0.5) {
        createParticle(e.clientX, e.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)

      particles.forEach((particle) => particle.remove())
    }
  }, [])

  return null
}