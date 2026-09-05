import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PASSWORD } from '../password'

const MAX_PHOTOS = 9

export default function Life() {
  // =========================
  // LOAD MEMORIES
  // =========================
  const [photos, setPhotos] = useState(() => {
    try {
      const raw = localStorage.getItem('lifeMemories')

      if (raw) {
        const parsed = JSON.parse(raw)

        // Không cho dữ liệu cũ vượt quá 9 ảnh
        return Array.isArray(parsed)
          ? parsed.slice(0, MAX_PHOTOS)
          : []
      }
    } catch (e) {}

    return []
  })

  const [editMode, setEditMode] = useState(false)
  const [checked, setChecked] = useState(new Set())

  const [pendingUpload, setPendingUpload] = useState(null)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  const fileRef = useRef(null)

  // =========================
  // SAVE TO LOCAL STORAGE
  // =========================
  useEffect(() => {
    try {
      localStorage.setItem(
        'lifeMemories',
        JSON.stringify(photos)
      )
    } catch (e) {}
  }, [photos])

  // =========================
  // ENTER / EXIT EDIT MODE
  // =========================
  function attemptEnterEdit() {
    if (editMode) {
      setEditMode(false)
      setChecked(new Set())
      return
    }

    try {
      const password = window.prompt(
        'Nhập mật khẩu để chỉnh sửa:'
      )

      if (password === null) return

      if (password !== PASSWORD) {
        window.alert('Sai mật khẩu')
        return
      }

      setEditMode(true)
    } catch (e) {}
  }

  // =========================
  // OPEN FILE PICKER
  // =========================
  function openUpload() {
    // Đã đủ 9 ảnh
    if (photos.length >= MAX_PHOTOS) {
      window.alert(
        `Life chỉ có thể lưu tối đa ${MAX_PHOTOS} ảnh.`
      )
      return
    }

    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  // =========================
  // HANDLE IMAGE
  // =========================
  function handleFile(e) {
    const file =
      e.target.files &&
      e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      window.alert(
        'Vui lòng chọn một file hình ảnh.'
      )

      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = reader.result

      const defaultName =
        file.name.replace(
          /\.[^/.]+$/,
          ''
        )

      // Lưu thời gian NGAY LÚC CHỌN ẢNH
      const uploadDate = new Date().toISOString()

      setPendingUpload({
        dataUrl,
        name: defaultName,
        date: uploadDate,
      })
    }

    reader.readAsDataURL(file)

    // Cho phép chọn lại cùng một file
    e.target.value = ''
  }

  // =========================
  // SAVE UPLOADED IMAGE
  // =========================
  function commitPending() {
    if (!pendingUpload) return

    // Bảo vệ giới hạn 9 ảnh
    if (photos.length >= MAX_PHOTOS) {
      window.alert(
        `Life chỉ có thể lưu tối đa ${MAX_PHOTOS} ảnh.`
      )

      setPendingUpload(null)
      return
    }

    const id =
      'memory_' +
      Date.now().toString(36) +
      Math.floor(Math.random() * 1000)

    const photo = {
      id,

      src: pendingUpload.dataUrl,

      name:
        pendingUpload.name.trim() ||
        'Khoảnh khắc mới',

      // Giữ nguyên thời gian lúc chọn ảnh
      date:
        pendingUpload.date ||
        new Date().toISOString(),

      createdAt: Date.now(),
    }

    // =========================
    // ẢNH MỚI NHẤT LUÔN Ở ĐẦU
    // =========================
    setPhotos(prev => {
      if (prev.length >= MAX_PHOTOS) {
        return prev
      }

      return [
        photo,
        ...prev
      ]
    })

    setPendingUpload(null)
  }

  // =========================
  // CANCEL UPLOAD
  // =========================
  function cancelPending() {
    setPendingUpload(null)
  }

  // =========================
  // CHECKBOX
  // =========================
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

  // =========================
  // DELETE SELECTED
  // =========================
  function deleteSelected() {
    if (checked.size === 0) return

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa ${checked.size} ảnh đã chọn?`
      )

    if (!confirmed) return

    setPhotos(prev =>
      prev.filter(
        photo => !checked.has(photo.id)
      )
    )

    setChecked(new Set())
  }

  // =========================
  // FORMAT DATE + TIME
  // =========================
  function formatDate(dateString) {
    try {
      const date = new Date(dateString)

      if (Number.isNaN(date.getTime())) {
        return ''
      }

      const datePart =
        new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date)

      const timePart =
        new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(date)

      return `${datePart} • ${timePart}`
    } catch (e) {
      return ''
    }
  }

  // =========================
  // IMAGE ERROR
  // =========================
  function handleImageError(e) {
    e.currentTarget.style.display = 'none'
  }

  // =========================
  // EMPTY STATE
  // =========================
  const isEmpty = photos.length === 0

  // =========================
  // CAN ADD PHOTO
  // =========================
  const canAddPhoto =
    photos.length < MAX_PHOTOS

  return (
    <section
      id="life"
      className="life-section"
    >

      {/* =========================
          HEADER
      ========================= */}

      <div
        className="life-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >

        <div>

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
            Life & Memories
          </motion.h3>

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
            Những khoảnh khắc và thành tựu đáng nhớ.
          </motion.p>

        </div>


        {/* =========================
            ACTIONS
        ========================= */}

        <div
          className="life-actions"
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >

          {editMode &&
            checked.size > 0 && (

              <button
                className="btn white"
                onClick={deleteSelected}
              >
                Xóa đã chọn (
                {checked.size}
                )
              </button>

            )}


          {/* MAIN BUTTON */}

          <button
            className="icon-btn"
            onClick={attemptEnterEdit}
            title={
              editMode
                ? 'Hoàn tất chỉnh sửa'
                : isEmpty
                  ? 'Thêm ảnh'
                  : 'Chỉnh sửa'
            }
            aria-label={
              editMode
                ? 'Hoàn tất chỉnh sửa'
                : isEmpty
                  ? 'Thêm ảnh'
                  : 'Chỉnh sửa'
            }
          >

            {editMode ? (

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

            ) : isEmpty ? (

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>

            ) : (

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />

                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>

            )}

          </button>

        </div>

      </div>


      {/* =========================
          GALLERY
      ========================= */}

      <motion.div
        className="life-gallery"

        initial={{
          opacity: 0
        }}

        whileInView={{
          opacity: 1
        }}

        transition={{
          delay: 0.1
        }}

        viewport={{
          once: true
        }}
      >

        {/* =========================
            ADD PHOTO
            LUÔN LÀ Ô ĐẦU TIÊN
        ========================= */}

        {editMode && canAddPhoto && (

          <motion.button
            className="life-card life-add-card"

            type="button"

            onClick={openUpload}

            initial={{
              scale: 0.96,
              opacity: 0
            }}

            animate={{
              scale: 1,
              opacity: 1
            }}

            whileHover={{
              scale: 1.03
            }}
          >

            <div className="life-add-icon">
              ＋
            </div>

            <div className="life-add-text">
              Thêm ảnh
            </div>

          </motion.button>

        )}


        {/* =========================
            PHOTOS
            ẢNH MỚI NHẤT ĐẦU TIÊN
        ========================= */}

        {photos.map(
          (photo, index) => (

            <motion.div
              className={`life-card ${
                checked.has(photo.id)
                  ? 'selected'
                  : ''
              }`}

              key={photo.id}

              initial={{
                y: 15,
                opacity: 0
              }}

              animate={{
                y: 0,
                opacity: 1
              }}

              transition={{
                delay: index * 0.06
              }}
            >

              {/* CHECKBOX */}

              {editMode && (

                <input
                  className="life-check"

                  type="checkbox"

                  checked={
                    checked.has(photo.id)
                  }

                  onChange={() =>
                    toggleCheck(
                      photo.id
                    )
                  }
                />

              )}


              {/* IMAGE */}

              <button
                className="life-image-button"

                type="button"

                onClick={() => {

                  if (!editMode) {
                    setPreviewPhoto(
                      photo
                    )
                  }

                }}
              >

                <img
                  src={photo.src}
                  alt={photo.name}
                  onError={
                    handleImageError
                  }
                />


                {/* ZOOM */}

                {!editMode && (

                  <div
                    className="life-image-overlay"
                  >

                    <span>

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >

                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                        />

                        <path d="m20 20-4-4" />

                      </svg>

                    </span>

                  </div>

                )}

              </button>


              {/* INFO */}

              <div className="life-info">

                <h4>
                  {photo.name}
                </h4>

                <span>
                  {formatDate(
                    photo.date
                  )}
                </span>

              </div>

            </motion.div>

          )
        )}


        {/* =========================
            EMPTY STATE
        ========================= */}

        {isEmpty &&
          !editMode && (

            <div className="life-empty">

              <div className="life-empty-icon">
                ✦
              </div>

              <div>

                <h4>
                  Chưa có khoảnh khắc nào
                </h4>

                <p>
                  Thêm ảnh để lưu lại những thành tựu
                  và kỷ niệm đáng nhớ.
                </p>

              </div>

            </div>

          )}


        {/* =========================
            FILE INPUT
        ========================= */}

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

      </motion.div>


      {/* =========================
          UPLOAD MODAL
      ========================= */}

      <AnimatePresence>

        {pendingUpload && (

          <motion.div
            className="life-modal"

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            exit={{
              opacity: 0
            }}
          >

            <motion.div
              className="life-modal-card"

              initial={{
                scale: 0.94,
                y: 15
              }}

              animate={{
                scale: 1,
                y: 0
              }}
            >

              <h3>
                Thêm khoảnh khắc
              </h3>


              {/* PREVIEW */}

              <div className="life-upload-preview">

                <img
                  src={
                    pendingUpload.dataUrl
                  }
                  alt="Preview"
                />

              </div>


              {/* NAME */}

              <input
                className="life-upload-name"

                value={
                  pendingUpload.name
                }

                onChange={e =>
                  setPendingUpload(
                    prev => ({
                      ...prev,
                      name:
                        e.target.value,
                    })
                  )
                }

                placeholder="Tên khoảnh khắc"
              />


              {/* DATE + TIME */}

              <div className="life-upload-date">

                Ngày:{' '}

                {formatDate(
                  pendingUpload.date
                )}

              </div>


              {/* BUTTONS */}

              <div
                className="life-modal-actions"
              >

                <button
                  className="btn ghost"
                  onClick={cancelPending}
                >
                  Hủy
                </button>

                <button
                  className="btn white"
                  onClick={commitPending}
                >
                  Lưu ảnh
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =========================
          FULLSCREEN IMAGE
      ========================= */}

      <AnimatePresence>

        {previewPhoto && (

          <motion.div
            className="life-lightbox"

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            exit={{
              opacity: 0
            }}

            onClick={() =>
              setPreviewPhoto(null)
            }
          >

            <motion.div
              className="life-lightbox-content"

              initial={{
                scale: 0.85
              }}

              animate={{
                scale: 1
              }}

              exit={{
                scale: 0.85
              }}

              onClick={e =>
                e.stopPropagation()
              }
            >

              <img
                src={
                  previewPhoto.src
                }
                alt={
                  previewPhoto.name
                }
              />


              <div className="life-lightbox-info">

                <h3>
                  {previewPhoto.name}
                </h3>

                <span>
                  {formatDate(
                    previewPhoto.date
                  )}
                </span>

              </div>


              {/* CLOSE */}

              <button
                className="life-lightbox-close"

                onClick={() =>
                  setPreviewPhoto(null)
                }

                title="Đóng"

                aria-label="Đóng"
              >

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >

                  <path d="M6 6l12 12" />

                  <path d="M18 6 6 18" />

                </svg>

              </button>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </section>
  )
}