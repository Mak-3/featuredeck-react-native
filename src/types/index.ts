// ============================================
// FeaturedDeck SDK Types
// ============================================

export type FeatureStatus =
  | 'open'
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'declined';

export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

export type RoadmapFeatureStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type RoadmapFeatureVisibility = 'public' | 'private';

// What the SDK consumer passes to setUser()
export interface UserInput {
  externalUserId: string;
  username?: string;
  email?: string;
}

// Resolved end_user from the API (includes DB-assigned id)
export interface User extends UserInput {
  id: string;
}

export interface Feature {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: FeatureStatus;
  priority: FeaturePriority;
  createdByEndUserId: string | null;
  createdAt: string;
  updatedAt: string;
  upvotesCount: number;
  hasUpvoted: boolean;
  author?: User;
}

export interface FeatureVote {
  id: string;
  featureRequestId: string;
  endUserId: string;
  createdAt: string;
}

export interface RoadmapFeature {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: RoadmapFeatureStatus;
  visibility: RoadmapFeatureVisibility;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Theme configuration
export interface ThemeColors {
  // Base colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Feature status colors
  statusOpen: string;
  statusUnderReview: string;
  statusPlanned: string;
  statusInProgress: string;
  statusCompleted: string;
  statusDeclined: string;
  
  // UI colors
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  
  // Interactive
  upvote: string;
  upvoteActive: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyBold: string;
  
  // Font sizes
  sizeXs: number;
  sizeSm: number;
  sizeMd: number;
  sizeLg: number;
  sizeXl: number;
  sizeXxl: number;
  
  // Line heights
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  isDark: boolean;
}

// Provider props
export interface FeaturedDeckProviderProps {
  children: React.ReactNode;
  theme?: Partial<Theme>;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Create feature input
export interface CreateFeatureInput {
  title: string;
  description: string;
}

