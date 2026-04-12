/**
 * TrybeTickets Typography System
 * 
 * Font families: Roboto (headings/UI) + Nunito Sans (body)
 * Type scale, weights, and utilities
 */

/**
 * Font Families
 * Already loaded in layout.jsx:
 * - Roboto: --font-roboto
 * - Nunito Sans: --font-nunito-sans
 */
export const fontFamilies = {
  heading: 'var(--font-roboto), system-ui, -apple-system, sans-serif',
  body: 'var(--font-nunito-sans), system-ui, -apple-system, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

/**
 * Font Weights
 */
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

/**
 * Font Sizes (with line heights and letter spacing)
 * Mobile-first with recommended values
 */
export const fontSizes = {
  // Display sizes (for hero sections, landing pages)
  display: {
    xl: {
      mobile: {
        fontSize: '3rem',        // 48px
        lineHeight: '1.1',       // 52.8px
        letterSpacing: '-0.02em',
        fontWeight: fontWeights.bold,
      },
      desktop: {
        fontSize: '4.5rem',      // 72px
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: fontWeights.bold,
      },
    },
    lg: {
      mobile: {
        fontSize: '2.5rem',      // 40px
        lineHeight: '1.15',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.bold,
      },
      desktop: {
        fontSize: '3.5rem',      // 56px
        lineHeight: '1.15',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.bold,
      },
    },
    md: {
      mobile: {
        fontSize: '2rem',        // 32px
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.semibold,
      },
      desktop: {
        fontSize: '3rem',        // 48px
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.semibold,
      },
    },
  },

  // Heading sizes (H1-H6)
  heading: {
    h1: {
      mobile: {
        fontSize: '2rem',        // 32px
        lineHeight: '1.25',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.bold,
      },
      desktop: {
        fontSize: '2.5rem',      // 40px
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        fontWeight: fontWeights.bold,
      },
    },
    h2: {
      mobile: {
        fontSize: '1.75rem',     // 28px
        lineHeight: '1.3',
        letterSpacing: '-0.005em',
        fontWeight: fontWeights.bold,
      },
      desktop: {
        fontSize: '2rem',        // 32px
        lineHeight: '1.25',
        letterSpacing: '-0.005em',
        fontWeight: fontWeights.bold,
      },
    },
    h3: {
      mobile: {
        fontSize: '1.5rem',      // 24px
        lineHeight: '1.35',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
      desktop: {
        fontSize: '1.75rem',     // 28px
        lineHeight: '1.3',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
    },
    h4: {
      mobile: {
        fontSize: '1.25rem',     // 20px
        lineHeight: '1.4',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
      desktop: {
        fontSize: '1.5rem',      // 24px
        lineHeight: '1.35',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
    },
    h5: {
      mobile: {
        fontSize: '1.125rem',    // 18px
        lineHeight: '1.45',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
      desktop: {
        fontSize: '1.25rem',     // 20px
        lineHeight: '1.4',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
    },
    h6: {
      mobile: {
        fontSize: '1rem',        // 16px
        lineHeight: '1.5',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
      desktop: {
        fontSize: '1.125rem',    // 18px
        lineHeight: '1.45',
        letterSpacing: '0',
        fontWeight: fontWeights.semibold,
      },
    },
  },

  // Body text sizes
  body: {
    xl: {
      fontSize: '1.25rem',       // 20px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: fontWeights.normal,
    },
    lg: {
      fontSize: '1.125rem',      // 18px
      lineHeight: '1.65',
      letterSpacing: '0',
      fontWeight: fontWeights.normal,
    },
    base: {
      fontSize: '1rem',          // 16px (base)
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: fontWeights.normal,
    },
    sm: {
      fontSize: '0.875rem',      // 14px
      lineHeight: '1.55',
      letterSpacing: '0',
      fontWeight: fontWeights.normal,
    },
    xs: {
      fontSize: '0.75rem',       // 12px
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      fontWeight: fontWeights.normal,
    },
  },

  // UI text (buttons, labels, badges)
  ui: {
    button: {
      lg: {
        fontSize: '1.125rem',    // 18px
        lineHeight: '1.5',
        letterSpacing: '0.01em',
        fontWeight: fontWeights.semibold,
      },
      md: {
        fontSize: '1rem',        // 16px
        lineHeight: '1.5',
        letterSpacing: '0.01em',
        fontWeight: fontWeights.semibold,
      },
      sm: {
        fontSize: '0.875rem',    // 14px
        lineHeight: '1.5',
        letterSpacing: '0.01em',
        fontWeight: fontWeights.medium,
      },
      xs: {
        fontSize: '0.75rem',     // 12px
        lineHeight: '1.5',
        letterSpacing: '0.02em',
        fontWeight: fontWeights.medium,
      },
    },
    label: {
      fontSize: '0.875rem',      // 14px
      lineHeight: '1.45',
      letterSpacing: '0',
      fontWeight: fontWeights.medium,
    },
    badge: {
      fontSize: '0.75rem',       // 12px
      lineHeight: '1.5',
      letterSpacing: '0.02em',
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',       // 12px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: fontWeights.normal,
    },
    overline: {
      fontSize: '0.625rem',      // 10px
      lineHeight: '1.6',
      letterSpacing: '0.08em',
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
  },
};

/**
 * Tailwind CSS class mappings
 * Use these in components for consistency
 */
export const textStyles = {
  // Display styles
  'display-xl': 'text-5xl md:text-7xl font-bold tracking-tight font-heading leading-tight',
  'display-lg': 'text-4xl md:text-6xl font-bold tracking-tight font-heading leading-tight',
  'display-md': 'text-3xl md:text-5xl font-semibold tracking-tight font-heading leading-tight',

  // Heading styles
  h1: 'text-3xl md:text-4xl font-bold tracking-tight font-heading',
  h2: 'text-2xl md:text-3xl font-bold tracking-tight font-heading',
  h3: 'text-xl md:text-2xl font-semibold font-heading',
  h4: 'text-lg md:text-xl font-semibold font-heading',
  h5: 'text-base md:text-lg font-semibold font-heading',
  h6: 'text-base md:text-lg font-semibold font-heading',

  // Body styles
  'body-xl': 'text-xl leading-relaxed font-body',
  'body-lg': 'text-lg leading-relaxed font-body',
  'body-base': 'text-base leading-normal font-body',
  'body-sm': 'text-sm leading-normal font-body',
  'body-xs': 'text-xs leading-normal font-body',

  // UI styles
  'button-lg': 'text-lg font-semibold tracking-wide font-heading',
  'button-md': 'text-base font-semibold tracking-wide font-heading',
  'button-sm': 'text-sm font-medium tracking-wide font-heading',
  'button-xs': 'text-xs font-medium tracking-wider font-heading',
  
  label: 'text-sm font-medium font-heading',
  badge: 'text-xs font-semibold uppercase tracking-wider font-heading',
  caption: 'text-xs font-body',
  overline: 'text-[10px] font-semibold uppercase tracking-widest font-heading',

  // Semantic styles
  lead: 'text-xl md:text-2xl leading-relaxed text-neutral-600 dark:text-neutral-300 font-body',
  muted: 'text-sm text-neutral-500 dark:text-neutral-400 font-body',
  small: 'text-sm font-body',
  code: 'text-sm font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded',
};

/**
 * CSS Custom Properties for typography
 */
export const typographyCssVariables = {
  '--font-heading': fontFamilies.heading,
  '--font-body': fontFamilies.body,
  '--font-mono': fontFamilies.mono,
  
  '--weight-normal': fontWeights.normal,
  '--weight-medium': fontWeights.medium,
  '--weight-semibold': fontWeights.semibold,
  '--weight-bold': fontWeights.bold,
};

/**
 * Utility function to generate CSS classes
 */
export const getTextClass = (variant) => {
  return textStyles[variant] || textStyles['body-base'];
};

export default {
  fontFamilies,
  fontWeights,
  fontSizes,
  textStyles,
  typographyCssVariables,
  getTextClass,
};
