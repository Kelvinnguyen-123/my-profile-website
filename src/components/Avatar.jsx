import React from 'react'
import { motion } from 'framer-motion'

export default function Avatar({ src, alt = 'Avatar' }) {
  return (
    <motion.div className="avatar-frame" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="avatar-inner">
        {src ? <img src={src} alt={alt} /> : <div className="avatar-placeholder">A</div>}
      </div>
    </motion.div>
  )
}
