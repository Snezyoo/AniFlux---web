/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'obsidian-slate': '#0B0C10',
        'dark-slate': '#12131C',
        'sunset-gold': '#F59E0B',
        'amber-dark': '#D97706',
        'amber-light': '#FBBF24',
        'glass-panel': '#1A1B26',
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        orbitron: ['Orbitron', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        glow: 'glowPulse 3s infinite ease-in-out',
        float: 'float 4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
