// =============================================
// Theme Configuration
// =============================================
// Change colors here to customize the app's look
// Currently: Purple/Pink theme
// For OT theme: Change to Teal/Green (healthcare colors)

export const THEME = {
  // Main brand color (buttons, links, accents)
  primary: '#7c3aed',        // Purple - change to '#0d9488' for teal
  primaryLight: '#a78bfa',   // Light purple - change to '#5eead4' for light teal
  primaryDark: '#5b21b6',    // Dark purple - change to '#0f766e' for dark teal
  
  // Secondary accent color (highlights, decorations)
  accent: '#f472b6',         // Pink - change to '#fb923c' for coral
  
  // Background colors
  background: '#faf5ff',     // Light lavender - change to '#f0fdfa' for mint
  cardBg: '#ffffff',
  
  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  
  // Status colors (keep these consistent)
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
} as const;

// CSS variable mapping (used in globals.css)
export const CSS_VARIABLES = `
  --color-primary: ${THEME.primary};
  --color-primary-light: ${THEME.primaryLight};
  --color-primary-dark: ${THEME.primaryDark};
  --color-accent: ${THEME.accent};
  --color-background: ${THEME.background};
`;
