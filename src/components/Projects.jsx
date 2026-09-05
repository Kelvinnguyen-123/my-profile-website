import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PASSWORD } from '../password'

export default function Projects({ id }) {

  // =========================
  // LOAD PROJECTS
  // =========================

  const [projects, setProjects] = useState(() => {
    try {
      const raw = localStorage.getItem('projects')

      if (raw) {
        return JSON.parse(raw)
      }
    } catch (e) {}

    return [
      {
        id: 1,
        title: 'Cinematic Portfolio',
        desc: 'Premium intro + particle systems',
        tags: ['React', 'Canvas']
      },
      {
        id: 2,
        title: 'Interactive Data Viz',
        desc: 'Smooth interactions and transitions',
        tags: ['D3', 'Framer Motion']
      },
      {
        id: 3,
        title: 'UI Component Library',
        desc: 'Design system with tokens',
        tags: ['Design', 'Accessibility']
      }
    ]
  })

  // =========================
  // STATES
  // =========================

  const [editMode, setEditMode] = useState(false)

  const [checked, setChecked] = useState(new Set())

  const [draggedId, setDraggedId] = useState(null)

  const [projectModal, setProjectModal] = useState(null)

  const [editingProject, setEditingProject] = useState(null)

  const [tagInput, setTagInput] = useState('')

  const dragId = useRef(null)

  // =========================
  // SAVE TO LOCAL STORAGE
  // =========================

  useEffect(() => {
    try {
      localStorage.setItem(
        'projects',
        JSON.stringify(projects)
      )
    } catch (e) {}
  }, [projects])

  // =========================
  // PASSWORD / EDIT MODE
  // =========================

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

  // =========================
  // CHECK PROJECT
  // =========================

  function toggleCheck(projectId) {

    setChecked(prev => {

      const next = new Set(prev)

      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }

      return next
    })
  }

  // =========================
  // DELETE SELECTED
  // =========================

  function deleteSelected() {

    if (checked.size === 0) return

    const confirmDelete = window.confirm(
      `Xóa ${checked.size} project đã chọn?`
    )

    if (!confirmDelete) return

    setProjects(prev =>
      prev.filter(project =>
        !checked.has(project.id)
      )
    )

    setChecked(new Set())
  }

  // =========================
  // OPEN ADD MODAL
  // =========================

  function openAddProject() {

    setEditingProject({
      id: null,
      title: '',
      desc: '',
      tags: []
    })

    setTagInput('')

    setProjectModal('add')
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================

  function openEditProject(project) {

    setEditingProject({
      ...project,
      tags: [...project.tags]
    })

    setTagInput('')

    setProjectModal('edit')
  }

  // =========================
  // CLOSE MODAL
  // =========================

  function closeProjectModal() {

    setProjectModal(null)

    setEditingProject(null)

    setTagInput('')
  }

  // =========================
  // UPDATE FORM
  // =========================

  function updateProjectField(field, value) {

    setEditingProject(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // =========================
  // ADD TAG
  // =========================

  function addTag() {

    const tag = tagInput.trim()

    if (!tag) return

    if (
      editingProject.tags.some(
        existing =>
          existing.toLowerCase() ===
          tag.toLowerCase()
      )
    ) {
      setTagInput('')
      return
    }

    setEditingProject(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }))

    setTagInput('')
  }

  // =========================
  // ENTER TO ADD TAG
  // =========================

  function handleTagKeyDown(e) {

    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // =========================
  // REMOVE TAG
  // =========================

  function removeTag(index) {

    setEditingProject(prev => ({
      ...prev,
      tags: prev.tags.filter(
        (_, i) => i !== index
      )
    }))
  }

  // =========================
  // SAVE PROJECT
  // =========================

  function saveProject() {

    if (!editingProject) return

    const title =
      editingProject.title.trim()

    const desc =
      editingProject.desc.trim()

    if (!title) {
      alert('Vui lòng nhập tên project.')
      return
    }

    if (!desc) {
      alert('Vui lòng nhập mô tả project.')
      return
    }

    if (
      editingProject.tags.length === 0
    ) {
      alert('Vui lòng thêm ít nhất một tag.')
      return
    }

    // =========================
    // ADD
    // =========================

    if (projectModal === 'add') {

      const newProject = {
        id:
          'p_' +
          Date.now().toString(36) +
          Math.floor(Math.random() * 1000),

        title,

        desc,

        tags: [
          ...editingProject.tags
        ]
      }

      setProjects(prev => [
        ...prev,
        newProject
      ])
    }

    // =========================
    // EDIT
    // =========================

    else if (
      projectModal === 'edit'
    ) {

      setProjects(prev =>
        prev.map(project =>
          project.id ===
          editingProject.id
            ? {
                ...project,
                title,
                desc,
                tags: [
                  ...editingProject.tags
                ]
              }
            : project
        )
      )
    }

    closeProjectModal()
  }

  // =========================
  // DRAG START
  // =========================

  function handleDragStart(
    e,
    projectId
  ) {

    if (!editMode) return

    dragId.current =
      projectId

    setDraggedId(projectId)

    e.dataTransfer.effectAllowed =
      'move'

    e.dataTransfer.setData(
      'text/plain',
      String(projectId)
    )
  }

  // =========================
  // DRAG OVER
  // =========================

  function handleDragOver(e) {

    if (!editMode) return

    e.preventDefault()

    e.dataTransfer.dropEffect =
      'move'
  }

  // =========================
  // DROP
  // =========================

  function handleDrop(
    e,
    targetId
  ) {

    if (!editMode) return

    e.preventDefault()

    const sourceId =
      e.dataTransfer.getData(
        'text/plain'
      ) ||
      dragId.current

    if (
      !sourceId ||
      String(sourceId) ===
        String(targetId)
    ) {
      setDraggedId(null)
      return
    }

    setProjects(prev => {

      const newProjects =
        [...prev]

      const sourceIndex =
        newProjects.findIndex(
          project =>
            String(project.id) ===
            String(sourceId)
        )

      const targetIndex =
        newProjects.findIndex(
          project =>
            String(project.id) ===
            String(targetId)
        )

      if (
        sourceIndex === -1 ||
        targetIndex === -1
      ) {
        return prev
      }

      const [
        movedProject
      ] =
        newProjects.splice(
          sourceIndex,
          1
        )

      newProjects.splice(
        targetIndex,
        0,
        movedProject
      )

      return newProjects
    })

    setDraggedId(null)

    dragId.current = null
  }

  // =========================
  // DRAG END
  // =========================

  function handleDragEnd() {

    setDraggedId(null)

    dragId.current = null
  }

  // =========================
  // RENDER
  // =========================

  return (

    <section
      id={id}
      className="projects"
    >

      {/* =========================
          HEADER
      ========================= */}

      <div className="projects-header">

        <motion.h3
          initial={{
            x: 20,
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
          Projects
        </motion.h3>


        {/* =========================
            ACTIONS
        ========================= */}

        <div className="projects-actions">

          {/* DELETE */}

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
              MAIN ABOUT-STYLE BUTTON
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
                <path
                  d="M20 6L9 17l-5-5"
                />
              </svg>

            ) : (

              /* EDIT ICON */

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

            )}

          </button>

        </div>

      </div>


      {/* =========================
          PROJECT LIST
      ========================= */}

      <div className="project-list">

        {projects.map(
          (p, i) => (

            <motion.div
              className={`project-card ${
                draggedId === p.id
                  ? 'dragging'
                  : ''
              }`}

              key={p.id}

              draggable={
                editMode
              }

              onDragStart={e =>
                handleDragStart(
                  e,
                  p.id
                )
              }

              onDragOver={
                handleDragOver
              }

              onDrop={e =>
                handleDrop(
                  e,
                  p.id
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
                  0.08 * i
              }}

              viewport={{
                once: true
              }}

              onMouseMove={e => {

                if (editMode)
                  return

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
                  (-y) * 8

                const ry =
                  x * 8

                const scale =
                  1.06

                if (el._raf) {
                  cancelAnimationFrame(
                    el._raf
                  )
                }

                el._raf =
                  requestAnimationFrame(
                    () => {

                      el.style.transform =
                        `perspective(900px)
                         rotateX(${rx}deg)
                         rotateY(${ry}deg)
                         scale(${scale})
                         translateY(-12px)`

                      el._raf = null
                    }
                  )
              }}

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

              {/* =========================
                  CHECKBOX
              ========================= */}

              {editMode && (

                <input
                  className="project-check"

                  type="checkbox"

                  checked={
                    checked.has(
                      p.id
                    )
                  }

                  onChange={() =>
                    toggleCheck(
                      p.id
                    )
                  }

                  onClick={e =>
                    e.stopPropagation()
                  }
                />

              )}


              {/* =========================
                  PROJECT EDIT BUTTON
              ========================= */}

              {editMode && (

                <button
                  className="icon-btn project-edit-btn"

                  title="Chỉnh sửa project"

                  aria-label="Chỉnh sửa project"

                  onClick={e => {

                    e.stopPropagation()

                    openEditProject(p)

                  }}
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path
                      d="M12 20h9"
                    />

                    <path
                      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
                    />

                  </svg>

                </button>

              )}


              {/* =========================
                  CONTENT
              ========================= */}

              <h4>
                {p.title}
              </h4>

              <p>
                {p.desc}
              </p>


              {/* =========================
                  TAGS
              ========================= */}

              <div className="tags">

                {p.tags.map(
                  (t, tagIndex) => (

                    <span
                      key={`${t}-${tagIndex}`}
                      className="tag"
                    >
                      {t}
                    </span>

                  )
                )}

              </div>

            </motion.div>

          )
        )}


        {/* =========================
            ADD CARD
        ========================= */}

        {editMode && (

          <motion.div
            className="project-card add-project-card"

            onClick={
              openAddProject
            }

            initial={{
              y: 12,
              opacity: 0
            }}

            animate={{
              y: 0,
              opacity: 1
            }}
          >

            <div className="project-add-icon">
              ＋
            </div>

            <h4>
              Thêm project
            </h4>

            <p>
              Tạo project mới
            </p>

          </motion.div>

        )}

      </div>


      {/* =========================
          PROJECT MODAL
      ========================= */}

      {projectModal &&
        editingProject && (

          <div
            className="project-modal"

            onMouseDown={
              closeProjectModal
            }
          >

            <div
              className="project-form"

              onMouseDown={e =>
                e.stopPropagation()
              }
            >

              <h3>
                {projectModal === 'add'
                  ? 'Thêm Project'
                  : 'Chỉnh sửa Project'}
              </h3>


              {/* NAME */}

              <label>
                Tên project
              </label>

              <input
                className="project-input"

                type="text"

                placeholder="Ví dụ: My Portfolio"

                value={
                  editingProject.title
                }

                onChange={e =>
                  updateProjectField(
                    'title',
                    e.target.value
                  )
                }
              />


              {/* DESCRIPTION */}

              <label>
                Mô tả
              </label>

              <textarea
                className="project-textarea"

                placeholder="Nhập mô tả project..."

                value={
                  editingProject.desc
                }

                onChange={e =>
                  updateProjectField(
                    'desc',
                    e.target.value
                  )
                }
              />


              {/* TAG */}

              <label>
                Tags
              </label>

              <div className="tag-input-row">

                <input
                  className="project-input"

                  type="text"

                  placeholder="Nhập tag..."

                  value={tagInput}

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

                  onClick={
                    addTag
                  }
                >
                  + Thêm
                </button>

              </div>


              {/* CURRENT TAGS */}

              <div className="edit-tags">

                {editingProject.tags.length === 0
                  ? (

                    <span className="no-tags">
                      Chưa có tag
                    </span>

                  )
                  : (

                    editingProject.tags.map(
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
                  FORM BUTTONS
              ========================= */}

              <div
                className="project-form-actions"
              >

                <button
                  className="btn ghost"

                  onClick={
                    closeProjectModal
                  }
                >
                  Hủy
                </button>


                <button
                  className="btn white"

                  onClick={
                    saveProject
                  }
                >
                  Lưu
                </button>

              </div>

            </div>

          </div>

        )}

    </section>
  )
}