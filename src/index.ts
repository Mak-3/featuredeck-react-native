// ============================================
// FeaturedDeck React Native SDK
// ============================================

export { FeaturedDeck } from './core/FeaturedDeck';
export type { FeaturedDeckConfig } from './core/FeaturedDeck';

export { FeaturedDeckProvider } from './provider/FeaturedDeckProvider';

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

  FeaturedDeckProviderProps,

  ApiResponse,
  PaginatedResponse,
} from './types';
