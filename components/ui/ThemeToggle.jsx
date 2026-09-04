'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      style={{
        position: 'relative',
        width: 58,
        height: 30,
        borderRadius: 20,
        background: isDark ? 'rgba(26, 27, 38, 0.9)' : 'rgba(238, 238, 245, 0.9)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        boxShadow: isDark
          ? 'inset 0 2px 4px rgba(0,0,0,0.6)'
          : 'inset 0 2px 4px rgba(0,0,0,0.1)',
      }}
      whileTap={{ scale: 0.92 }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      <motion.div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
        }}
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={12} color="#FFF" /> : <Sun size={12} color="#FFF" />}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
