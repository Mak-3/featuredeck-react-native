import React, { createContext, useContext } from 'react';
import { Theme, ThemeColors, ThemeSpacing, ThemeTypography, ThemeBorderRadius } from '../types';

// ============================================
// Default Theme - Sleek & Modern
// ============================================

const defaultColors: ThemeColors = {
  // Base - Deep indigo primary
  primary: '#E85D04',
  primaryLight: '#F07A33',
  primaryDark: '#C84E03',
  
  // Backgrounds
  background: '#FAFBFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Feature status
  statusOpen: '#3B82F6',
  statusUnderReview: '#8B5CF6',
  statusPlanned: '#3B82F6',
  statusInProgress: '#F59E0B',
  statusCompleted: '#10B981',
  statusDeclined: '#6B7280',
  
  // UI
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.5)',
  
  // Interactive
  upvote: '#94A3B8',
  upvoteActive: '#E85D04',
};

const darkColors: ThemeColors = {
  // Base
  primary: '#F07A33',
  primaryLight: '#FF9A57',
  primaryDark: '#E85D04',
  
  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  
  // Text
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  
  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Feature status
  statusOpen: '#60A5FA',
  statusUnderReview: '#A78BFA',
  statusPlanned: '#60A5FA',
  statusInProgress: '#FBBF24',
  statusCompleted: '#34D399',
  statusDeclined: '#9CA3AF',
  
  // UI
  border: '#334155',
  borderLight: '#1E293B',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Interactive
  upvote: '#64748B',
  upvoteActive: '#F07A33',
};

const defaultSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const defaultTypography: ThemeTypography = {
  fontFamily: 'System',
  fontFamilyBold: 'System',
  
  sizeXs: 11,
  sizeSm: 13,
  sizeMd: 15,
  sizeLg: 18,
  sizeXl: 22,
  sizeXxl: 28,
  
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
};

const defaultBorderRadius: ThemeBorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const lightTheme: Theme = {
  colors: defaultColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  isDark: true,
};

// ============================================
// Theme Context
// ============================================

const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ThemeContext.Provider;

// ============================================
// Theme Utilities
// ============================================

export function mergeTheme(baseTheme: Theme, customTheme?: Partial<Theme>): Theme {
  if (!customTheme) return baseTheme;
  
  return {
    colors: { ...baseTheme.colors, ...customTheme.colors },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    typography: { ...baseTheme.typography, ...customTheme.typography },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
    isDark: customTheme.isDark ?? baseTheme.isDark,
  };
}

export function getStatusColor(status: string, colors: ThemeColors): string {
  const statusColorMap: Record<string, string> = {
    open: colors.statusOpen,
    under_review: colors.statusUnderReview,
    planned: colors.statusPlanned,
    in_progress: colors.statusInProgress,
    completed: colors.statusCompleted,
    declined: colors.statusDeclined,
  };
  return statusColorMap[status] || colors.textMuted;
}

export function getStatusLabel(status: string): string {
  const statusLabelMap: Record<string, string> = {
    open: 'Open',
    under_review: 'Under Review',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    declined: 'Declined',
  };
  return statusLabelMap[status] || status;
}

// Create a theme from a single primary color
export function createThemeFromColor(primaryColor: string, isDark = false): Partial<Theme> {
  return {
    colors: {
      ...(isDark ? darkColors : defaultColors),
      primary: primaryColor,
    },
    isDark,
  };
}





