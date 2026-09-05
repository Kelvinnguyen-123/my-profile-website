import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PASSWORD } from '../password'

export default function Games() {
  const [games, setGames] = useState(() => {
    try {
      const raw = localStorage.getItem('games')
      if (raw) return JSON.parse(raw)
    } catch (e) {}

    return []
  })

  const fileRef = useRef(null)
  const selectedId = useRef(null)
  const waitingForFileId = useRef(null)

  const [editMode, setEditMode] = useState(false)
  const [checked, setChecked] = useState(new Set())
  const [pendingUpload, setPendingUpload] = useState(null)
  const [draggedId, setDraggedId] = useState(null)

  // =====================================================
  // SAVE GAMES
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'games',
        JSON.stringify(games)
      )
    } catch (e) {}
  }, [games])

  // =====================================================
  // SVG PLACEHOLDER
  // =====================================================

  function svgPlaceholder(name) {
    const initials = name
      .split(' ')
      .map(s => s[0])
      .slice(0, 3)
      .join('')
      .toUpperCase()

    const bg1 = '%23ff4d6d'
    const bg2 = '%239b5cff'

    const svg = `<?xml version='1.0' encoding='UTF-8'?>
<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
  <defs>
    <linearGradient
      id='g'
      x1='0'
      x2='1'
      y1='0'
      y2='1'
    >
      <stop offset='0' stop-color='${bg1}'/>
      <stop offset='1' stop-color='${bg2}'/>
    </linearGradient>
  </defs>

  <rect
    width='100%'
    height='100%'
    rx='18'
    fill='url(%23g)'
  />

  <text
    x='50%'
    y='55%'
    font-size='48'
    font-family='Inter, Arial, sans-serif'
    fill='white'
    font-weight='700'
    text-anchor='middle'
    alignment-baseline='middle'
  >
    ${initials}
  </text>
</svg>`

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }

  // =====================================================
  // ADD GAME
  // =====================================================

  function addGame() {
    const id =
      'g_' +
      Date.now().toString(36) +
      Math.floor(Math.random() * 1000)

    setGames(prev => [
      ...prev,
      {
        id,
        name: 'New Game',
        src: null,
        uploaded: false
      }
    ])
  }

  // =====================================================
  // ADD + UPLOAD
  // =====================================================

  function addAndUpload() {
    const id =
      'g_' +
      Date.now().toString(36) +
      Math.floor(Math.random() * 1000)

    setGames(prev => [
      ...prev,
      {
        id,
        name: 'New Game',
        src: null,
        uploaded: false
      }
    ])

    selectedId.current = id

    waitingForFileId.current = id

    const onFocus = () => {
      setTimeout(() => {
        const files =
          fileRef.current &&
          fileRef.current.files

        if (!files || files.length === 0) {
          setGames(prev =>
            prev.filter(
              g => g.id !== id
            )
          )
        }

        waitingForFileId.current = null

        window.removeEventListener(
          'focus',
          onFocus
        )
      }, 120)
    }

    window.addEventListener(
      'focus',
      onFocus
    )

    fileRef.current &&
      fileRef.current.click()
  }

  // =====================================================
  // CHECKBOX
  // =====================================================

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  // =====================================================
  // EDIT MODE
  // =====================================================

  function attemptEnterEdit() {
    if (editMode) {
      setEditMode(false)
      setChecked(new Set())
      return
    }

    try {
      const p = window.prompt(
        'Nhập mật khẩu để chỉnh sửa:'
      )

      if (p === null) {
        return
      }

      if (p !== PASSWORD) {
        alert('Sai mật khẩu')
        return
      }

      setEditMode(true)
    } catch (e) {
      return
    }
  }

  // =====================================================
  // DELETE SELECTED
  // =====================================================

  function deleteSelected() {
    if (checked.size === 0) {
      return
    }

    if (
      !window.confirm(
        `Delete ${checked.size} selected game(s)?`
      )
    ) {
      return
    }

    setGames(prev =>
      prev.filter(
        g => !checked.has(g.id)
      )
    )

    setChecked(new Set())
  }

  // =====================================================
  // REMOVE GAME
  // =====================================================

  function removeGame(id) {
    setGames(prev =>
      prev.filter(
        g => g.id !== id
      )
    )
  }

  // =====================================================
  // DRAG START
  // =====================================================

  function handleDragStart(e, id) {
    if (!editMode) {
      return
    }

    setDraggedId(id)

    e.dataTransfer.effectAllowed =
      'move'

    e.dataTransfer.setData(
      'text/plain',
      id
    )
  }

  // =====================================================
  // DRAG OVER
  // =====================================================

  function handleDragOver(e) {
    if (!editMode) {
      return
    }

    e.preventDefault()

    e.dataTransfer.dropEffect =
      'move'
  }

  // =====================================================
  // DROP
  // =====================================================

  function handleDrop(
    e,
    targetId
  ) {
    if (!editMode) {
      return
    }

    e.preventDefault()

    const sourceId =
      e.dataTransfer.getData(
        'text/plain'
      ) || draggedId

    if (
      !sourceId ||
      sourceId === targetId
    ) {
      setDraggedId(null)
      return
    }

    setGames(prev => {
      const newGames = [
        ...prev
      ]

      const sourceIndex =
        newGames.findIndex(
          game =>
            game.id === sourceId
        )

      const targetIndex =
        newGames.findIndex(
          game =>
            game.id === targetId
        )

      if (
        sourceIndex === -1 ||
        targetIndex === -1
      ) {
        return prev
      }

      const [
        movedGame
      ] = newGames.splice(
        sourceIndex,
        1
      )

      newGames.splice(
        targetIndex,
        0,
        movedGame
      )

      return newGames
    })

    setDraggedId(null)
  }

  // =====================================================
  // DRAG END
  // =====================================================

  function handleDragEnd() {
    setDraggedId(null)
  }

  // =====================================================
  // UPLOAD CLICK
  // =====================================================

  function onUploadClick(id) {
    selectedId.current = id

    fileRef.current &&
      fileRef.current.click()
  }

  // =====================================================
  // HANDLE FILE
  // =====================================================

  function handleFile(e) {
    const f =
      e.target.files &&
      e.target.files[0]

    if (!f) {
      return
    }

    const id =
      selectedId.current

    const reader =
      new FileReader()

    reader.onload = () => {
      const dataUrl =
        reader.result

      const defaultName =
        f.name.replace(
          /\.[^/.]+$/,
          ''
        )

      setPendingUpload({
        id,
        dataUrl,
        name: defaultName
      })
    }

    reader.readAsDataURL(f)

    e.target.value = ''
  }

  // =====================================================
  // COMMIT UPLOAD
  // =====================================================

  function commitPending() {
    if (!pendingUpload) {
      return
    }

    const {
      id,
      dataUrl,
      name
    } = pendingUpload

    setGames(prev => {
      const exists =
        prev.some(
          g => g.id === id
        )

      if (exists) {
        return prev.map(
          g =>
            g.id === id
              ? {
                  ...g,
                  src: dataUrl,
                  uploaded: true,
                  name
                }
              : g
        )
      }

      return [
        ...prev,
        {
          id,
          name,
          src: dataUrl,
          uploaded: true
        }
      ]
    })

    selectedId.current = null
    waitingForFileId.current = null

    setPendingUpload(null)
  }

  // =====================================================
  // CANCEL UPLOAD
  // =====================================================

  function cancelPending() {
    if (!pendingUpload) {
      return
    }

    const {
      id
    } = pendingUpload

    const slot =
      games.find(
        g => g.id === id
      )

    if (
      slot &&
      !slot.src &&
      slot.name === 'New Game'
    ) {
      removeGame(id)
    }

    setPendingUpload(null)
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section
      id="games"
      className="games-section"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >

        <motion.h3
          initial={{
            x: -20,
            opacity: 0
          }}

          whileInView={{
            x: 0,
            opacity: 1
          }}

          viewport={{
            once: true
          }}
        >
          Games
        </motion.h3>


        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}
        >

          {/* DELETE SELECTED */}

          {editMode &&
            checked.size > 0 && (
              <button
                className="btn white"
                onClick={
                  deleteSelected
                }
              >
                Xóa đã chọn (
                {checked.size}
                )
              </button>
            )}


          {/* =================================================
              NÚT CHỈNH SỬA
              ĐÃ ĐỔI SANG ĐÚNG MẪU ABOUT
          ================================================= */}

          <button
            className="icon-btn"

            onClick={
              attemptEnterEdit
            }

            title={
              editMode
                ? 'Hoàn tất chỉnh sửa'
                : 'Chỉnh sửa'
            }

            aria-label={
              editMode
                ? 'Hoàn tất chỉnh sửa'
                : 'Chỉnh sửa'
            }
          >

            {editMode ? (

              /* CHECK ICON */

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>

            ) : (

              /* EDIT ICON
                 GIỐNG ABOUT */

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />

                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1-1-4Z" />
              </svg>

            )}

          </button>

        </div>

      </div>


      {/* =================================================
          DESCRIPTION
      ================================================= */}

      <motion.p
        initial={{
          opacity: 0
        }}

        whileInView={{
          opacity: 1
        }}

        transition={{
          delay: 0.05
        }}

        viewport={{
          once: true
        }}
      >
        Một vài trò chơi tôi thích.
      </motion.p>


      {/* =================================================
          GAME LIST
      ================================================= */}

      <motion.div
        className="games"

        initial={{
          opacity: 0
        }}

        whileInView={{
          opacity: 1
        }}

        transition={{
          delay: 0.12
        }}

        viewport={{
          once: true
        }}
      >

        {games.map(
          (g, i) => (

            <motion.div
              className="game-card"

              key={g.id}

              draggable={
                editMode
              }

              onDragStart={e =>
                handleDragStart(
                  e,
                  g.id
                )
              }

              onDragOver={
                handleDragOver
              }

              onDrop={e =>
                handleDrop(
                  e,
                  g.id
                )
              }

              onDragEnd={
                handleDragEnd
              }

              initial={{
                y: 12,
                opacity: 0
              }}

              whileInView={{
                y: 0,
                opacity: 1
              }}

              transition={{
                delay:
                  0.06 * i
              }}

              viewport={{
                once: true
              }}


              /* =================================================
                 MOUSE 3D EFFECT
              ================================================= */

              onMouseMove={e => {

                if (editMode) {
                  return
                }

                const el =
                  e.currentTarget

                const rect =
                  el.getBoundingClientRect()

                const x =
                  (e.clientX -
                    rect.left) /
                    rect.width -
                  0.5

                const y =
                  (e.clientY -
                    rect.top) /
                    rect.height -
                  0.5

                const rx =
                  -y * 12

                const ry =
                  x * 12

                const scale =
                  1.12

                if (el._raf) {
                  cancelAnimationFrame(
                    el._raf
                  )
                }

                el._raf =
                  requestAnimationFrame(
                    () => {

                      el.style.transform =
                        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translateY(-12px)`

                      el._raf = null
                    }
                  )
              }}


              /* =================================================
                 MOUSE LEAVE
              ================================================= */

              onMouseLeave={e => {

                const el =
                  e.currentTarget

                if (el._raf) {
                  cancelAnimationFrame(
                    el._raf
                  )
                }

                el.style.transition =
                  'transform 220ms ease'

                el.style.transform =
                  ''

                setTimeout(() => {

                  el.style.transition =
                    ''

                }, 230)
              }}
            >

              {/* CHECKBOX */}

              {editMode && (
                <input
                  className="game-check"

                  type="checkbox"

                  checked={
                    checked.has(
                      g.id
                    )
                  }

                  onChange={() =>
                    toggleCheck(
                      g.id
                    )
                  }
                />
              )}


              {/* GAME ICON */}

              <div className="game-icon">

                {g.src ? (

                  <img
                    src={g.src}
                    alt={g.name}

                    onError={e => {

                      e.currentTarget
                        .onerror = null

                      e.currentTarget.src =
                        svgPlaceholder(
                          g.name
                        )
                    }}
                  />

                ) : (

                  <div className="game-placeholder">
                    🎮
                  </div>

                )}

              </div>


              {/* GAME NAME */}

              <div className="game-title">
                {g.name}
              </div>


              {/* UPLOAD */}

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  gap: 8
                }}
              >

                {!g.src &&
                  !editMode && (

                    <button
                      className="btn"
                      onClick={() =>
                        onUploadClick(
                          g.id
                        )
                      }
                    >
                      Upload
                    </button>

                  )}

              </div>

            </motion.div>

          )
        )}


        {/* =================================================
            ADD GAME CARD
        ================================================= */}

        {editMode && (

          <div
            className="game-card add-card"

            onClick={
              addAndUpload
            }

            role="button"

            tabIndex={0}

            onKeyDown={e => {

              if (
                e.key === 'Enter'
              ) {
                addAndUpload()
              }

            }}
          >

            <div className="game-icon add-icon">
              ＋
            </div>

            <div className="game-title">
              Thêm game
            </div>

          </div>

        )}


        {/* =================================================
            HIDDEN FILE INPUT
        ================================================= */}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{
            display: 'none'
          }}
          onChange={
            handleFile
          }
        />


        {/* =================================================
            UPLOAD MODAL
        ================================================= */}

        {pendingUpload && (

          <div className="upload-modal">

            <div className="upload-card">

              {/* PREVIEW */}

              <div className="upload-preview">

                <img
                  src={
                    pendingUpload.dataUrl
                  }
                  alt="preview"
                />

              </div>


              {/* NAME */}

              <div
                style={{
                  marginTop: 10
                }}
              >

                <input
                  className="upload-name"

                  value={
                    pendingUpload.name
                  }

                  onChange={e =>
                    setPendingUpload({
                      ...pendingUpload,
                      name:
                        e.target.value
                    })
                  }
                />

              </div>


              {/* ACTIONS */}

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 8,
                  justifyContent:
                    'flex-end'
                }}
              >

                <button
                  className="btn ghost"
                  onClick={
                    cancelPending
                  }
                >
                  Cancel
                </button>


                <button
                  className="btn white"
                  onClick={
                    commitPending
                  }
                >
                  Done
                </button>

              </div>

            </div>

          </div>

        )}

      </motion.div>

    </section>
  )
}