// ============================================
// ProdFeedback React Native SDK
// ============================================

// Core SDK
export { ProdFeedback } from './core/ProdFeedback';
export type { ProdFeedbackConfig } from './core/ProdFeedback';


// Provider
export { ProdFeedbackProvider } from './provider/ProdFeedbackProvider';

// UI Components
export { FeedbackButton } from './ui/FeedbackButton';

// Theme
export { 
  lightTheme, 
  darkTheme, 
  useTheme,
  mergeTheme,
  createThemeFromColor,
  getStatusColor,
  getStatusLabel,
} from './theme';

// Hooks
export {
  useFeatures,
  useFeature,
  useSelectedFeature,
  useComments,
  useCategories,
  useFilters,
  useIsLoading,
  useError,
  useVisible,
  useUser,
  useIsFeatureAuthor,
  useProdFeedbackActions,
  useUpvote,
  useSubscription,
  useDeleteFeature,
} from './hooks';

// Types
export type {
  // Feature types
  Feature,
  FeatureStatus,
  FeaturePriority,
  FeatureFilters,
  CreateFeatureInput,
  
  // Comment types
  Comment,
  CreateCommentInput,
  
  // User types
  User,
  
  // Category types
  Category,
  
  // Theme types
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,
  
  // Config types
  ProdFeedbackProviderProps,
  FeedbackButtonProps,
  
  // API types
  ApiResponse,
  PaginatedResponse,
  Board,
} from './types';
