import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PASSWORD } from '../password'

export default function Avatar({ src, alt = 'Avatar' }) {
  const [avatar, setAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem('avatar')
      if (saved) return saved
    } catch (e) {}

    return src || ''
  })

  const fileRef = useRef(null)
  const [editMode, setEditMode] = useState(false)
  const [pendingUpload, setPendingUpload] = useState(null)

  useEffect(() => {
    try {
      if (avatar) {
        localStorage.setItem('avatar', avatar)
      }
    } catch (e) {}
  }, [avatar])

  function attemptEnterEdit() {
    if (editMode) {
      setEditMode(false)
      setPendingUpload(null)
      return
    }

    try {
      const p = window.prompt('Nhập mật khẩu để chỉnh sửa:')

      if (p === null) return

      if (p !== PASSWORD) {
        alert('Sai mật khẩu')
        return
      }

      setEditMode(true)
    } catch (e) {
      return
    }
  }

  function onAvatarClick() {
    if (!editMode) return

    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  function handleFile(e) {
    const f = e.target.files && e.target.files[0]

    if (!f) return

    if (!f.type.startsWith('image/')) {
      alert('Vui lòng chọn một file ảnh.')
      e.target.value = ''
      return
    }

    if (f.size > 10 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 10MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setPendingUpload({
        dataUrl: reader.result
      })
    }

    reader.readAsDataURL(f)

    e.target.value = ''
  }

  function commitPending() {
    if (!pendingUpload) return

    setAvatar(pendingUpload.dataUrl)
    setPendingUpload(null)
  }

  function cancelPending() {
    setPendingUpload(null)
  }

  return (
    <>
      <motion.div
        className="avatar-wrapper"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className={`avatar-frame ${
            editMode ? 'avatar-edit-active' : ''
          }`}
          onClick={onAvatarClick}
          title={editMode ? 'Bấm để thay đổi Avatar' : ''}
        >
          <div className="avatar-inner">
            {avatar ? (
              <img
                src={avatar}
                alt={alt}
                onError={e => {
                  e.currentTarget.onerror = null

                  if (src) {
                    e.currentTarget.src = src
                  }
                }}
              />
            ) : (
              <div className="avatar-placeholder">A</div>
            )}
          </div>

          {editMode && (
            <div className="avatar-edit-overlay">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
        </div>

        <button
          type="button"
          className="avatar-edit-button"
          onClick={attemptEnterEdit}
          title={
            editMode
              ? 'Hoàn tất chỉnh sửa'
              : 'Chỉnh sửa Avatar'
          }
          aria-label={
            editMode
              ? 'Hoàn tất chỉnh sửa'
              : 'Chỉnh sửa Avatar'
          }
        >
          {editMode ? (
            <>
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

              <span>Hoàn tất</span>
            </>
          ) : (
            <>
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

              <span>Chỉnh sửa</span>
            </>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </motion.div>

      {pendingUpload && (
        <div className="upload-modal">
          <div className="upload-card">
            <div className="avatar-upload-preview">
              <img
                src={pendingUpload.dataUrl}
                alt="Avatar preview"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                Thay đổi Avatar
              </div>

              <div
                style={{
                  marginTop: 5,
                  color: '#8994a9',
                  fontSize: 11,
                  lineHeight: 1.5
                }}
              >
                Bạn có muốn sử dụng ảnh này làm Avatar không?
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end'
              }}
            >
              <button
                className="btn ghost"
                onClick={cancelPending}
              >
                Cancel
              </button>

              <button
                className="btn white"
                onClick={commitPending}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}