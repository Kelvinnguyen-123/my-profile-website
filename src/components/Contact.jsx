import React from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <motion.h3 initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>Contact</motion.h3>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>Bạn có thể liên hệ qua email hoặc qua LinkedIn. Tôi phản hồi trong vòng 24-48 giờ.</motion.p>

      <motion.a className="btn primary" href="mailto:youremail@example.com" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>Gửi email</motion.a>
    </section>
  )
}
