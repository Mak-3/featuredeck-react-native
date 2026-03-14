// ============================================
// FeatureDeck React Native SDK
// ============================================

export { FeatureDeck } from './core/FeatureDeck';
export type { FeatureDeckConfig } from './core/FeatureDeck';

export { FeatureDeckProvider } from './provider/FeatureDeckProvider';

export { 
  lightTheme, 
  darkTheme, 
  useTheme,
  mergeTheme,
  createThemeFromColor,
  getStatusColor,
  getStatusLabel,
} from './theme';

export {
  useFeatures,
  useFeature,
  useIsLoading,
  useError,
  useVisible,
  useUser,
  useUpvote,
  useRoadmap,
} from './hooks';

export type {
  Feature,
  FeatureStatus,
  FeaturePriority,
  FeatureVote,
  CreateFeatureInput,

  RoadmapFeature,
  RoadmapFeatureStatus,
  RoadmapFeatureVisibility,

  User,
  UserInput,

  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,

  FeatureDeckProviderProps,

  ApiResponse,
  PaginatedResponse,
} from './types';
