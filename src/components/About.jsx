import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PASSWORD } from '../password'

const MAX_LINES = 8

export default function About() {

  // =====================================================
  // ABOUT DATA
  // =====================================================

  const [about, setAbout] = useState(() => {
    try {
      const raw = localStorage.getItem('about')

      if (raw) {
        const data = JSON.parse(raw)

        return {
          content: data.content || '',

          tags: Array.isArray(data.tags)
            ? data.tags.slice(0, 5)
            : []
        }
      }
    } catch (error) {
      console.error(error)
    }

    return {
      content:
        '<p>Tôi là người rất có trách nhiệm với công việc trong giờ làm việc được công ty phân công. Tôi là người định hướng mục tiêu, hướng đến kết quả, tỉ mỉ và tập trung cao độ. Tôi có nhiều năm kinh nghiệm và thành tích trong lĩnh vực này.</p>',

      tags: [
        'React',
        'Framer Motion',
        'Canvas / WebGL',
        'Design Systems'
      ]
    }
  })

  // =====================================================
  // STATES
  // =====================================================

  const [aboutModal, setAboutModal] =
    useState(false)

  const [editingAbout, setEditingAbout] =
    useState(null)

  const [tagInput, setTagInput] =
    useState('')

  const editorRef =
    useRef(null)

  // Nội dung HTML hiện tại của editor
  const editorHtmlRef =
    useRef('')

  // Nội dung HTML hợp lệ cuối cùng
  const lastValidHtmlRef =
    useRef('')

  // Cursor hợp lệ cuối cùng
  const lastValidCaretRef =
    useRef(null)

  // Selection dùng cho toolbar
  const savedRange =
    useRef(null)


  // =====================================================
  // LOCAL STORAGE
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'about',
        JSON.stringify(about)
      )
    } catch (error) {
      console.error(error)
    }
  }, [about])


  // =====================================================
  // INIT EDITOR
  // =====================================================

  useEffect(() => {

    if (
      aboutModal &&
      editingAbout &&
      editorRef.current
    ) {

      const html =
        editingAbout.content || ''

      editorRef.current.innerHTML =
        html

      editorHtmlRef.current =
        html

      lastValidHtmlRef.current =
        html

      lastValidCaretRef.current =
        null

      savedRange.current =
        null
    }

  }, [aboutModal])


  // =====================================================
  // OPEN EDIT
  // =====================================================

  function openEditAbout() {

    const password =
      window.prompt(
        'Nhập mật khẩu để chỉnh sửa:'
      )

    if (password === null) {
      return
    }

    if (password !== PASSWORD) {
      alert('Sai mật khẩu')
      return
    }

    const content =
      about.content || ''

    const tags =
      Array.isArray(about.tags)
        ? [...about.tags.slice(0, 5)]
        : []

    setEditingAbout({
      content,
      tags
    })

    editorHtmlRef.current =
      content

    lastValidHtmlRef.current =
      content

    lastValidCaretRef.current =
      null

    savedRange.current =
      null

    setTagInput('')

    setAboutModal(true)
  }


  // =====================================================
  // CLOSE
  // =====================================================

  function closeAboutModal() {

    setAboutModal(false)

    setEditingAbout(null)

    setTagInput('')

    editorHtmlRef.current =
      ''

    lastValidHtmlRef.current =
      ''

    lastValidCaretRef.current =
      null

    savedRange.current =
      null
  }


  // =====================================================
  // GET CARET POSITION
  // =====================================================

  function getCaretPosition() {

    const editor =
      editorRef.current

    const selection =
      window.getSelection()

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return null
    }

    const range =
      selection.getRangeAt(0)

    if (
      !editor.contains(
        range.startContainer
      )
    ) {
      return null
    }

    const startRange =
      range.cloneRange()

    startRange.selectNodeContents(
      editor
    )

    startRange.setEnd(
      range.startContainer,
      range.startOffset
    )

    const start =
      startRange.toString().length

    const endRange =
      range.cloneRange()

    endRange.selectNodeContents(
      editor
    )

    endRange.setEnd(
      range.endContainer,
      range.endOffset
    )

    const end =
      endRange.toString().length

    return {
      start,
      end
    }
  }


  // =====================================================
  // RESTORE CARET
  // =====================================================

  function restoreCaretPosition(
    position
  ) {

    const editor =
      editorRef.current

    if (
      !editor ||
      !position
    ) {
      return
    }

    const walker =
      document.createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT
      )

    let node

    let currentLength = 0

    let startNode = null
    let startOffset = 0

    let endNode = null
    let endOffset = 0

    while (
      (node = walker.nextNode())
    ) {

      const length =
        node.textContent.length

      if (
        startNode === null &&
        position.start <=
          currentLength + length
      ) {

        startNode =
          node

        startOffset =
          position.start -
          currentLength
      }

      if (
        endNode === null &&
        position.end <=
          currentLength + length
      ) {

        endNode =
          node

        endOffset =
          position.end -
          currentLength

        break
      }

      currentLength +=
        length
    }

    if (!startNode) {

      editor.focus()

      const range =
        document.createRange()

      range.selectNodeContents(
        editor
      )

      range.collapse(false)

      const selection =
        window.getSelection()

      selection.removeAllRanges()

      selection.addRange(range)

      return
    }

    if (!endNode) {

      endNode =
        startNode

      endOffset =
        startOffset
    }

    const range =
      document.createRange()

    range.setStart(
      startNode,
      Math.min(
        startOffset,
        startNode.textContent.length
      )
    )

    range.setEnd(
      endNode,
      Math.min(
        endOffset,
        endNode.textContent.length
      )
    )

    const selection =
      window.getSelection()

    selection.removeAllRanges()

    selection.addRange(range)

    editor.focus()
  }


  // =====================================================
  // SAVE SELECTION
  // =====================================================

  function saveSelection() {

    const editor =
      editorRef.current

    const selection =
      window.getSelection()

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return
    }

    const range =
      selection.getRangeAt(0)

    if (
      editor.contains(
        range.commonAncestorContainer
      )
    ) {

      savedRange.current =
        range.cloneRange()
    }
  }


  // =====================================================
  // RESTORE SELECTION
  // =====================================================

  function restoreSelection() {

    if (
      !savedRange.current
    ) {

      editorRef.current?.focus()

      return
    }

    const selection =
      window.getSelection()

    selection.removeAllRanges()

    selection.addRange(
      savedRange.current
    )
  }


  // =====================================================
  // GET VISUAL LINE COUNT
  // =====================================================

  function getVisualLineCount() {

    const editor =
      editorRef.current

    if (!editor) {
      return 0
    }

    const computed =
      window.getComputedStyle(
        editor
      )

    const lineHeight =
      parseFloat(
        computed.lineHeight
      )

    if (
      !lineHeight ||
      Number.isNaN(lineHeight)
    ) {
      return 1
    }

    const clone =
      editor.cloneNode(true)

    clone.style.position =
      'absolute'

    clone.style.visibility =
      'hidden'

    clone.style.pointerEvents =
      'none'

    clone.style.left =
      '-99999px'

    clone.style.top =
      '0'

    clone.style.width =
      `${editor.getBoundingClientRect().width}px`

    clone.style.height =
      'auto'

    clone.style.minHeight =
      '0'

    clone.style.maxHeight =
      'none'

    clone.style.overflow =
      'visible'

    document.body.appendChild(
      clone
    )

    const cloneStyle =
      window.getComputedStyle(
        clone
      )

    const paddingTop =
      parseFloat(
        cloneStyle.paddingTop
      ) || 0

    const paddingBottom =
      parseFloat(
        cloneStyle.paddingBottom
      ) || 0

    const contentHeight =
      clone.scrollHeight -
      paddingTop -
      paddingBottom

    clone.remove()

    if (
      contentHeight <= 0
    ) {
      return 1
    }

    return Math.max(
      1,
      Math.round(
        contentHeight /
        lineHeight
      )
    )
  }


  // =====================================================
  // SAVE VALID STATE
  // =====================================================

  function saveValidState() {

    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    const html =
      editor.innerHTML

    const caret =
      getCaretPosition()

    editorHtmlRef.current =
      html

    lastValidHtmlRef.current =
      html

    lastValidCaretRef.current =
      caret
  }


  // =====================================================
  // SYNC EDITOR -> EDITING ABOUT
  //
  // QUAN TRỌNG:
  // Luôn đưa nội dung đang gõ vào editingAbout
  // trước khi thao tác tag.
  // =====================================================

  function syncEditorToState() {

    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    const html =
      editor.innerHTML

    editorHtmlRef.current =
      html

    setEditingAbout(prev => {

      if (!prev) {
        return prev
      }

      return {
        ...prev,
        content: html
      }
    })
  }


  // =====================================================
  // RESTORE LAST VALID STATE
  // =====================================================

  function restoreLastValidState() {

    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    const html =
      lastValidHtmlRef.current

    editor.innerHTML =
      html

    editorHtmlRef.current =
      html

    setEditingAbout(prev => {

      if (!prev) {
        return prev
      }

      return {
        ...prev,
        content: html
      }
    })

    requestAnimationFrame(() => {

      restoreCaretPosition(
        lastValidCaretRef.current
      )

    })
  }


  // =====================================================
  // EDITOR INPUT
  // =====================================================

  function handleEditorInput(e) {

    const editor =
      e.currentTarget

    const lines =
      getVisualLineCount()

    // Không cho vượt quá 8 dòng
    if (
      lines > MAX_LINES
    ) {

      restoreLastValidState()

      return
    }

    const html =
      editor.innerHTML

    const caret =
      getCaretPosition()

    // Lưu HTML hiện tại
    editorHtmlRef.current =
      html

    lastValidHtmlRef.current =
      html

    lastValidCaretRef.current =
      caret

    // Đồng bộ ngay với editingAbout
    setEditingAbout(prev => {

      if (!prev) {
        return prev
      }

      return {
        ...prev,
        content: html
      }
    })
  }


  // =====================================================
  // ENTER
  // =====================================================

  function handleEditorKeyDown(e) {

    if (
      e.key !== 'Enter'
    ) {
      return
    }

    const lines =
      getVisualLineCount()

    // 7 -> 8 được phép
    // 8 -> 9 bị chặn

    if (
      lines >= MAX_LINES
    ) {

      e.preventDefault()

      return
    }
  }


  // =====================================================
  // FORMAT TEXT
  // =====================================================

  function formatText(
    command,
    value = null
  ) {

    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    editor.focus()

    restoreSelection()

    const oldHtml =
      editor.innerHTML

    const oldCaret =
      getCaretPosition()

    document.execCommand(
      command,
      false,
      value
    )

    const lines =
      getVisualLineCount()

    if (
      lines > MAX_LINES
    ) {

      editor.innerHTML =
        oldHtml

      editorHtmlRef.current =
        oldHtml

      setEditingAbout(prev => {

        if (!prev) {
          return prev
        }

        return {
          ...prev,
          content: oldHtml
        }
      })

      requestAnimationFrame(() => {

        restoreCaretPosition(
          oldCaret
        )

      })

      return
    }

    saveValidState()

    // Đồng bộ format với state
    syncEditorToState()

    saveSelection()
  }


  // =====================================================
  // TOOLBAR
  // =====================================================

  function handleToolbarMouseDown(
    e,
    command,
    value = null
  ) {

    e.preventDefault()

    saveSelection()

    formatText(
      command,
      value
    )
  }


  // =====================================================
  // COLOR
  // =====================================================

  function handleColorChange(e) {

    saveSelection()

    formatText(
      'foreColor',
      e.target.value
    )
  }


  // =====================================================
  // ADD TAG
  // =====================================================

  function addTag() {

    if (!editingAbout) {
      return
    }

    if (
      editingAbout.tags.length >= 5
    ) {

      alert(
        'Tối đa 5 tag.'
      )

      return
    }

    const tag =
      tagInput.trim()

    if (!tag) {
      return
    }

    /*
     * QUAN TRỌNG:
     * Trước khi thêm tag, lấy nội dung
     * hiện tại trong editor.
     *
     * Điều này tránh việc React state
     * vẫn còn giá trị cũ.
     */

    const currentContent =
      editorRef.current
        ? editorRef.current.innerHTML
        : editingAbout.content

    const exists =
      editingAbout.tags.some(
        existing =>
          existing.toLowerCase() ===
          tag.toLowerCase()
      )

    if (exists) {

      setTagInput('')

      return
    }

    setEditingAbout(prev => {

      if (!prev) {
        return prev
      }

      return {

        // Giữ nguyên nội dung vừa sửa
        ...prev,

        content:
          currentContent,

        // Chỉ thêm tag
        tags: [
          ...prev.tags,
          tag
        ]
      }
    })

    // Cập nhật ref luôn
    editorHtmlRef.current =
      currentContent

    lastValidHtmlRef.current =
      currentContent

    setTagInput('')
  }


  // =====================================================
  // TAG ENTER
  // =====================================================

  function handleTagKeyDown(e) {

    if (
      e.key === 'Enter'
    ) {

      e.preventDefault()

      addTag()
    }
  }


  // =====================================================
  // REMOVE TAG
  // =====================================================

  function removeTag(index) {

    if (!editingAbout) {
      return
    }

    /*
     * Lấy nội dung hiện tại từ editor
     * trước khi xóa tag.
     */

    const currentContent =
      editorRef.current
        ? editorRef.current.innerHTML
        : editingAbout.content

    setEditingAbout(prev => {

      if (!prev) {
        return prev
      }

      return {

        // Giữ nguyên content
        ...prev,

        content:
          currentContent,

        // Chỉ xóa tag
        tags: prev.tags.filter(
          (_, i) =>
            i !== index
        )
      }
    })

    // Đồng bộ ref
    editorHtmlRef.current =
      currentContent

    lastValidHtmlRef.current =
      currentContent
  }


  // =====================================================
  // SAVE ABOUT
  // =====================================================

  function saveAbout() {

    if (!editingAbout) {
      return
    }

    /*
     * Luôn lấy HTML trực tiếp từ editor
     * để đảm bảo dữ liệu mới nhất.
     */

    const content =
      (
        editorRef.current
          ? editorRef.current.innerHTML
          : editingAbout.content
      ).trim()

    if (!content) {

      alert(
        'Vui lòng nhập nội dung giới thiệu.'
      )

      return
    }

    if (
      editorRef.current &&
      getVisualLineCount() >
        MAX_LINES
    ) {

      alert(
        'Nội dung chỉ được tối đa 8 dòng.'
      )

      return
    }

    setAbout({

      content,

      tags: [
        ...editingAbout.tags.slice(0, 5)
      ]
    })

    closeAboutModal()
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section
      id="about"
      className="about"
    >

      {/* =========================
          HEADER
      ========================= */}

      <div className="about-header">

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
          Giới thiệu
        </motion.h3>

        <div className="about-actions">

          <button
            className="icon-btn"

            onClick={
              openEditAbout
            }

            title="Chỉnh sửa"

            aria-label="Chỉnh sửa"
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path d="M12 20h9" />

              <path
                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
              />

            </svg>

          </button>

        </div>

      </div>


      {/* =========================
          ABOUT CONTENT
      ========================= */}

      <motion.div
        className="about-content"

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

        dangerouslySetInnerHTML={{
          __html: about.content
        }}
      />


      {/* =========================
          TAGS
      ========================= */}

      <motion.div
        className="skills"

        initial={{
          opacity: 0
        }}

        whileInView={{
          opacity: 1
        }}

        transition={{
          delay: 0.2
        }}

        viewport={{
          once: true
        }}
      >

        {about.tags.map(
          (tag, index) => (

            <span
              className="skill"

              key={`${tag}-${index}`}
            >
              {tag}
            </span>

          )
        )}

      </motion.div>


      {/* =========================
          EDIT MODAL
      ========================= */}

      {aboutModal &&
        editingAbout && (

          <div
            className="project-modal"

            onMouseDown={
              closeAboutModal
            }
          >

            <div
              className="project-form about-edit-form"

              onMouseDown={e =>
                e.stopPropagation()
              }
            >

              <h3>
                Chỉnh sửa Giới thiệu
              </h3>


              {/* =========================
                  EDITOR
              ========================= */}

              <label>
                Nội dung giới thiệu
              </label>

              <div className="about-editor">

                {/* TOOLBAR */}

                <div className="about-toolbar">

                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'bold'
                      )
                    }

                    title="In đậm"
                  >
                    <strong>B</strong>
                  </button>


                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'italic'
                      )
                    }

                    title="In nghiêng"
                  >
                    <em>I</em>
                  </button>


                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'underline'
                      )
                    }

                    title="Gạch chân"
                  >
                    <u>U</u>
                  </button>


                  {/* COLOR */}

                  <label
                    className="color-picker-btn"

                    title="Màu chữ"
                  >

                    <span>
                      A
                    </span>

                    <input
                      type="color"

                      defaultValue="#ffffff"

                      onChange={
                        handleColorChange
                      }
                    />

                  </label>


                  {/* BULLET LIST */}

                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'insertUnorderedList'
                      )
                    }

                    title="Danh sách"
                  >

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >

                      <path d="M8 6h13" />
                      <path d="M8 12h13" />
                      <path d="M8 18h13" />

                      <path d="M3 6h.01" />
                      <path d="M3 12h.01" />
                      <path d="M3 18h.01" />

                    </svg>

                  </button>


                  {/* NUMBER LIST */}

                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'insertOrderedList'
                      )
                    }

                    title="Danh sách đánh số"
                  >

                    <span className="number-icon">
                      1.
                    </span>

                  </button>


                  {/* REMOVE FORMAT */}

                  <button
                    type="button"

                    onMouseDown={e =>
                      handleToolbarMouseDown(
                        e,
                        'removeFormat'
                      )
                    }

                    title="Xóa định dạng"
                  >
                    Tx
                  </button>

                </div>


                {/* =========================
                    CONTENT EDITABLE
                ========================= */}

                <div
                  ref={editorRef}

                  className="about-editor-content"

                  contentEditable

                  suppressContentEditableWarning

                  onKeyDown={
                    handleEditorKeyDown
                  }

                  onInput={
                    handleEditorInput
                  }

                  onKeyUp={
                    saveSelection
                  }

                  onMouseUp={
                    saveSelection
                  }

                  onFocus={
                    saveSelection
                  }
                />

              </div>


              {/* =========================
                  TAG
              ========================= */}

              <label>
                Tags ({
                  editingAbout.tags.length
                }/5)
              </label>


              <div className="tag-input-row">

                <input
                  className="project-input"

                  type="text"

                  placeholder={
                    editingAbout.tags.length >= 5
                      ? 'Đã đủ 5 tag'
                      : 'Nhập tag...'
                  }

                  value={tagInput}

                  disabled={
                    editingAbout.tags.length >= 5
                  }

                  onChange={e =>
                    setTagInput(
                      e.target.value
                    )
                  }

                  onKeyDown={
                    handleTagKeyDown
                  }
                />


                <button
                  className="btn white"

                  type="button"

                  onClick={addTag}

                  disabled={
                    editingAbout.tags.length >= 5
                  }
                >
                  + Thêm
                </button>

              </div>


              {/* =========================
                  TAG LIST
              ========================= */}

              <div className="edit-tags">

                {editingAbout.tags.length === 0
                  ? (

                    <span className="no-tags">
                      Chưa có tag
                    </span>

                  )
                  : (

                    editingAbout.tags.map(
                      (tag, index) => (

                        <div
                          className="edit-tag"

                          key={`${tag}-${index}`}
                        >

                          <span>
                            {tag}
                          </span>

                          <button
                            type="button"

                            onClick={() =>
                              removeTag(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                        </div>

                      )
                    )

                  )}

              </div>


              {/* =========================
                  ACTIONS
              ========================= */}

              <div className="project-form-actions">

                <button
                  className="btn ghost"

                  type="button"

                  onClick={
                    closeAboutModal
                  }
                >
                  Hủy
                </button>


                <button
                  className="btn white"

                  type="button"

                  onClick={
                    saveAbout
                  }
                >
                  Lưu thay đổi
                </button>

              </div>

            </div>

          </div>

        )}

    </section>
  )
}