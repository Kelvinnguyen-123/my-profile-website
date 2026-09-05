import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from './Avatar'

const menuItems = [
  { number: '01', name: 'Trang chủ', href: '#home' },
  { number: '02', name: 'Giới thiệu', href: '#about' },
  { number: '03', name: 'Games', href: '#games' },
  { number: '04', name: 'Projects', href: '#projects' },
  { number: '05', name: 'Contact', href: '#contact' },
]

export default function Hero() {
  const [scrolled, setScrolled] = useState(false)

  const [activeSection, setActiveSection] = useState('home')

  // Menu chỉ mở khi chuột đang nằm trên menu
  const [menuHovered, setMenuHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      // =========================================
      // SCROLL STATE
      // =========================================

      setScrolled(scrollY > 60)


      // =========================================
      // ACTIVE SECTION
      // =========================================

      const marker = window.innerHeight * 0.35

      let currentSection = 'home'
      let closestTop = -Infinity

      menuItems.forEach(item => {
        const section = document.querySelector(item.href)

        if (!section) return

        const rect = section.getBoundingClientRect()

        /*
          Chọn section gần marker nhất ở phía trên.

          Ví dụ:

          marker
          ─────────────────────

          Projects       ← section này gần marker nhất
          Games
          About
        */

        if (
          rect.top <= marker &&
          rect.top > closestTop
        ) {
          closestTop = rect.top
          currentSection = section.id
        }
      })

      setActiveSection(currentSection)
    }

    handleScroll()

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    )

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      )
    }
  }, [])


  // =========================================
  // MENU CLICK
  // =========================================

  const handleMenuClick = (e, href) => {
    e.preventDefault()

    const target = document.querySelector(href)

    if (!target) return

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    setActiveSection(
      href.replace('#', '')
    )
  }


  return (
    <section
      id="home"
      className="hero"
    >

      {/* =====================================================
          PREMIUM MORPHING NAVIGATION
      ===================================================== */}

      <nav
        className={`
          hero-menu
          ${scrolled ? 'hero-menu-scrolled' : ''}
          ${
            scrolled && menuHovered
              ? 'hero-menu-expanded'
              : ''
          }
        `}

        /*
          Chỉ cần di chuột vào menu khi
          menu đang ở trạng thái dọc.
        */

        onMouseEnter={() => {
          if (scrolled) {
            setMenuHovered(true)
          }
        }}

        onMouseLeave={() => {
          if (scrolled) {
            setMenuHovered(false)
          }
        }}
      >

        {/* =====================================================
            GLOW
        ===================================================== */}

        <div className="hero-menu-glow" />


        {/* =====================================================
            NAVIGATION TITLE
        ===================================================== */}

        <div className="hero-menu-label">

          <span className="hero-menu-dot" />

          <span>
            NAVIGATION
          </span>

        </div>


        {/* =====================================================
            MENU ITEMS
        ===================================================== */}

        <div className="hero-menu-items">

          {menuItems.map(item => {

            const sectionId =
              item.href.replace('#', '')

            const isActive =
              activeSection === sectionId

            return (

              <a
                key={item.href}

                href={item.href}

                className={`
                  hero-menu-item
                  ${isActive ? 'active' : ''}
                `}

                onClick={e =>
                  handleMenuClick(
                    e,
                    item.href
                  )
                }
              >

                {/* Active indicator */}

                <span className="hero-menu-active-bar" />


                {/* Number */}

                <span className="hero-menu-number">
                  {item.number}
                </span>


                {/* Name */}

                <span className="hero-menu-name">
                  {item.name}
                </span>


                {/* Arrow */}

                <span className="hero-menu-arrow">
                  →
                </span>

              </a>
            )
          })}

        </div>


        {/* =====================================================
            BOTTOM LINE
        ===================================================== */}

        <div className="hero-menu-line" />

      </nav>


      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <div className="hero-inner hero-center">

        <div className="hero-content">

          {/* =================================================
              TITLE
          ================================================= */}

          <motion.h1
            initial={{
              y: 8,
              opacity: 0
            }}

            animate={{
              y: 0,
              opacity: 1
            }}

            transition={{
              delay: 0.08
            }}
          >
            Hello You
          </motion.h1>


          {/* =================================================
              SUB TITLE
          ================================================= */}

          <motion.h2
            initial={{
              y: 8,
              opacity: 0
            }}

            animate={{
              y: 0,
              opacity: 1
            }}

            transition={{
              delay: 0.18
            }}
          >
            Welcome to My Profile
          </motion.h2>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <motion.p
            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              delay: 0.35
            }}
          >
            Đây là website cá nhân của tôi, nơi tôi
            chia sẻ về bản thân, các dự án và sở thích
            của mình. Hãy khám phá và liên hệ với tôi
            nếu bạn quan tâm!
          </motion.p>


          {/* =================================================
              AVATAR
          ================================================= */}

          <div
            className="hero-avatar"
            style={{
              marginTop: 18
            }}
          >

            <Avatar
              src="/img/Personal4x4.jpg"
              alt="Avatar"
            />

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <motion.div
            className="hero-cta"

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              delay: 0.6
            }}
          >

            <motion.a
              href="#about"
              className="btn primary"

              whileHover={{
                scale: 1.03
              }}

              whileTap={{
                scale: 0.98
              }}
            >
              Tìm hiểu thêm
            </motion.a>


            <motion.a
              href="#contact"
              className="btn ghost"

              whileHover={{
                scale: 1.03
              }}

              whileTap={{
                scale: 0.98
              }}
            >
              Liên hệ
            </motion.a>

          </motion.div>


          {/* =================================================
              SOCIAL
          ================================================= */}

          <div className="hero-socials">

            <a
              href="https://github.com/Kelvinnguyen-123"
              target="_blank"
              rel="noreferrer"
            >
              Github
            </a>

            <a href="#">
              LinkedIn
            </a>

          </div>

        </div>

      </div>

    </section>
  )
}