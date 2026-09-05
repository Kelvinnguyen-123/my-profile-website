import React, { useEffect, useState } from 'react'
import Loading from './components/Loading'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Background from './components/Background'
import Games from './components/Games'
import MouseTrail from './components/MouseTrail'
import Life from './components/Life'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="app-root">
      <Background />

      {loading && <Loading />}

      <main className={`site ${loading ? 'blurred' : 'visible'}`}>

        <Hero />

        {/* ABOUT + GAMES bên trái / LIFE bên phải */}
        <div className="about-life-layout">

          {/* CỘT TRÁI */}
          <div className="about-games-left">
            <About />
            <Games />
          </div>

          {/* CỘT PHẢI */}
          <div className="life-right">
            <Life />
          </div>

        </div>

        <Projects id="projects" />

        <Contact />

        <MouseTrail />

      </main>
    </div>
  )
}