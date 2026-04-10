/**
 * TrybeTickets Color System
 * 
 * Brand Colors: Yellow theme (logo color) with dark neutrals and subtle purple accents
 * Usage: Import and use in Tailwind classes or CSS variables
 */

export const colors = {
  // Brand Colors - Primary Yellow Theme (Logo Colors)
  brand: {
    50: '#fffef5',   // Almost white with yellow tint
    100: '#fffbeb',
    200: '#fef8d3',
    300: '#fef3b0',
    400: '#fbeb78',  // Light yellow (from logo)
    500: '#E6F082',  // Main brand color (light yellow-green from logo)
    600: '#D8D365',  // Olive yellow (from logo)
    700: '#bfb84a',  // Darker yellow-green
    800: '#9a9438',
    900: '#7a7528',
    950: '#605B51',  // Dark grayish brown (from logo)
  },

  // Accent Colors - Subtle Purple (complementary accent)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Subtle purple accent
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Success (Green) - For ticket validation, approvals
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Error (Red) - For errors, cancellations, rejections
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning (Yellow/Amber) - For pending states, warnings
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Info (Blue) - For informational messages
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral/Gray Colors - Dark charcoal tones (from logo)
  neutral: {
    50: '#fafafa',   // Almost white
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',  // Mid gray
    600: '#605B51',  // Logo grayish brown
    700: '#524d44',  // Darker brown-gray
    800: '#454040',  // Dark charcoal (from logo)
    900: '#2d2a28',  // Almost black with warmth
    950: '#1a1816',  // True black with warmth
  },

  // Semantic Colors - Mapped for specific use cases
  semantic: {
    // Text colors
    textPrimary: '#2d2a28',      // neutral-900 (warm dark)
    textSecondary: '#605B51',    // neutral-600 (logo gray-brown)
    textTertiary: '#737373',     // neutral-500
    textInverse: '#fafafa',      // neutral-50

    // Background colors
    bgPrimary: '#ffffff',        // white
    bgSecondary: '#fafafa',      // neutral-50
    bgTertiary: '#f5f5f5',       // neutral-100
    bgDark: '#1a1816',          // neutral-950 (warm black)

    // Border colors
    borderLight: '#e5e5e5',      // neutral-200
    borderMedium: '#d4d4d4',     // neutral-300
    borderDark: '#a3a3a3',       // neutral-400

    // Interactive states
    hover: '#fef8d3',            // brand-200 (light yellow hover)
    hoverDark: '#bfb84a',        // brand-700 (dark yellow)
    active: '#D8D365',           // brand-600 (olive yellow)
    disabled: '#d4d4d4',         // neutral-300
    focus: '#E6F082',            // brand-500 (main yellow)

    // Status colors
    pending: '#f59e0b',          // warning-500
    approved: '#22c55e',         // success-500
    rejected: '#ef4444',         // error-500
    suspended: '#a855f7',        // accent-500 (subtle purple)
  },

  // Role-based colors (for badges, tags)
  roles: {
    admin: {
      bg: '#f3e8ff',            // accent-100 (purple for admin)
      text: '#581c87',          // accent-900
      border: '#c084fc',        // accent-400
    },
    organizer: {
      bg: '#fef3b0',            // brand-300 (yellow for organizer)
      text: '#7a7528',          // brand-900
      border: '#D8D365',        // brand-600
    },
    user: {
      bg: '#dbeafe',            // info-100 (blue for user)
      text: '#1e3a8a',          // info-900
      border: '#60a5fa',        // info-400
    },
  },

  // Ticket status colors
  ticketStatus: {
    valid: {
      bg: '#dcfce7',            // success-100
      text: '#14532d',          // success-900
      border: '#4ade80',        // success-400
    },
    used: {
      bg: '#f5f5f5',            // neutral-100
      text: '#525252',          // neutral-600
      border: '#d4d4d4',        // neutral-300
    },
    cancelled: {
      bg: '#fee2e2',            // error-100
      text: '#7f1d1d',          // error-900
      border: '#f87171',        // error-400
    },
  },

  // Event status colors
  eventStatus: {
    active: {
      bg: '#dcfce7',            // success-100
      text: '#14532d',          // success-900
      border: '#4ade80',        // success-400
    },
    completed: {
      bg: '#dbeafe',            // info-100
      text: '#1e3a8a',          // info-900
      border: '#60a5fa',        // info-400
    },
    cancelled: {
      bg: '#fee2e2',            // error-100
      text: '#7f1d1d',          // error-900
      border: '#f87171',        // error-400
    },
  },

  // Gradient definitions (for hero sections, cards)
  gradients: {
    primary: 'linear-gradient(135deg, #E6F082 0%, #D8D365 100%)',      // Yellow gradient
    primarySubtle: 'linear-gradient(135deg, #fffbeb 0%, #fef8d3 100%)', // Subtle yellow
    accent: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',        // Purple accent
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    dark: 'linear-gradient(135deg, #454040 0%, #2d2a28 100%)',         // Dark charcoal
    hero: 'linear-gradient(135deg, #fbeb78 0%, #a855f7 100%)',         // Yellow to purple
  },

  // Shadow colors (for elevation)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    brand: '0 10px 40px -10px rgba(230, 240, 130, 0.5)',  // Yellow glow
    accent: '0 10px 40px -10px rgba(168, 85, 247, 0.4)',  // Purple glow
  },
};

/**
 * CSS Custom Properties for dynamic theming
 * Export these to be used in globals.css
 */
export const cssVariables = {
  light: {
    '--color-brand-primary': colors.brand[500],     // #E6F082 (yellow-green)
    '--color-brand-hover': colors.brand[600],       // #D8D365 (olive yellow)
    '--color-accent': colors.accent[500],           // #a855f7 (purple)
    '--color-success': colors.success[500],
    '--color-error': colors.error[500],
    '--color-warning': colors.warning[500],
    '--color-info': colors.info[500],
    
    '--color-text-primary': colors.semantic.textPrimary,       // #2d2a28
    '--color-text-secondary': colors.semantic.textSecondary,   // #605B51
    '--color-text-tertiary': colors.semantic.textTertiary,
    
    '--color-bg-primary': colors.semantic.bgPrimary,
    '--color-bg-secondary': colors.semantic.bgSecondary,
    '--color-bg-tertiary': colors.semantic.bgTertiary,
    
    '--color-border': colors.semantic.borderLight,
    '--color-border-hover': colors.semantic.borderMedium,
  },
  
  dark: {
    '--color-brand-primary': colors.brand[400],     // #fbeb78 (light yellow)
    '--color-brand-hover': colors.brand[500],       // #E6F082
    '--color-accent': colors.accent[400],           // #c084fc (lighter purple)
    '--color-success': colors.success[400],
    '--color-error': colors.error[400],
    '--color-warning': colors.warning[400],
    '--color-info': colors.info[400],
    
    '--color-text-primary': colors.semantic.textInverse,
    '--color-text-secondary': colors.neutral[300],
    '--color-text-tertiary': colors.neutral[400],
    
    '--color-bg-primary': colors.semantic.bgDark,    // #1a1816 (warm black)
    '--color-bg-secondary': colors.neutral[900],     // #2d2a28
    '--color-bg-tertiary': colors.neutral[800],      // #454040 (logo charcoal)
    
    '--color-border': colors.neutral[700],
    '--color-border-hover': colors.neutral[600],     // #605B51 (logo gray-brown)
  },
};

export default colors;
