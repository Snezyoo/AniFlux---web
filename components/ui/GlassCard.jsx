'use client';

import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  style = {},
  glowOnHover = true,
  padding = '24px',
  onClick,
}) {
  return (
    <motion.div
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        padding,
        ...style,
      }}
      whileHover={
        glowOnHover
          ? {
              y: -4,
              borderColor: 'rgba(245, 158, 11, 0.4)',
              boxShadow: '0 12px 35px rgba(245, 158, 11, 0.25)',
            }
          : {}
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
