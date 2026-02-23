// ============================================
// ProdFeedback SDK Types
// ============================================

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export type FeedbackStatus = 
  | 'new'
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'declined';

export type FeatureStatus = FeedbackStatus;

// Feature priority
export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// User information
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  featureId: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  isOfficial?: boolean;
  parentId?: string;
  replies?: Comment[];
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: number;
  upvotes: number;
  hasUpvoted: boolean;
  author?: User;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Feature extends Feedback {
  commentCount?: number;
  isSubscribed?: boolean;
  category?: Category;
}

// Board configuration
export interface Board {
  id: string;
  name: string;
  description?: string;
  features: Feature[];
  categories: Category[];
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
  subscribe: string;
  subscribeActive: string;
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
export interface ProdFeedbackProviderProps {
  children: React.ReactNode;
  theme?: Partial<Theme>;
}

// Feedback button props
export interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: { x: number; y: number };
  size?: number;
  icon?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
  style?: any;
}

export interface FeatureFilters {
  status?: FeedbackStatus[];
  type?: FeedbackType[];
  sortBy?: 'newest' | 'oldest' | 'most_upvotes' | 'trending';
  searchQuery?: string;
}

// API response types (kept for compatibility)
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
  categoryId?: string;
  tags?: string[];
}

// Create comment input
export interface CreateCommentInput {
  featureId: string;
  content: string;
  parentId?: string;
}
