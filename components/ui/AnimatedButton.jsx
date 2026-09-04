'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedButton — Discord spring physics button with Sunset Gold styling.
 */
export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon = null,
  type = 'button',
  className = '',
  id,
}) {
  const sizeStyles = {
    sm: { padding: '7px 16px', fontSize: '0.8rem', gap: 6 },
    md: { padding: '10px 22px', fontSize: '0.875rem', gap: 8 },
    lg: { padding: '14px 32px', fontSize: '1rem', gap: 10 },
    xl: { padding: '18px 40px', fontSize: '1.05rem', gap: 12 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
    },
    secondary: {
      background: 'var(--glass-bg)',
      color: '#F59E0B',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      backdropFilter: 'blur(12px)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    },
    gold: {
      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
      color: '#0B0C10',
      border: 'none',
      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
    },
    portal: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.25)',
      letterSpacing: '0.04em',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      id={id}
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`animated-btn shimmer-effect ${className}`}
      style={{
        ...currentSize,
        ...currentVariant,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.03,
              boxShadow:
                variant === 'portal'
                  ? '0 0 40px rgba(245, 158, 11, 0.7), 0 0 80px rgba(245, 158, 11, 0.4)'
                  : variant === 'primary'
                  ? '0 6px 25px rgba(245, 158, 11, 0.5)'
                  : '0 4px 20px rgba(245, 158, 11, 0.3)',
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.95,
              transition: { type: 'spring', stiffness: 500, damping: 15 },
            }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
