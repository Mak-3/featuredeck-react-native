import React$1 from 'react';

type FeatureStatus = 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';
type RoadmapFeatureStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
type RoadmapFeatureVisibility = 'public' | 'private';
interface UserInput {
    externalUserId: string;
    username?: string;
    email?: string;
}
interface User extends UserInput {
    id: string;
}
interface Feature {
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
interface FeatureVote {
    id: string;
    featureRequestId: string;
    endUserId: string;
    createdAt: string;
}
interface RoadmapFeature {
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
interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    statusOpen: string;
    statusUnderReview: string;
    statusPlanned: string;
    statusInProgress: string;
    statusCompleted: string;
    statusDeclined: string;
    border: string;
    borderLight: string;
    shadow: string;
    overlay: string;
    upvote: string;
    upvoteActive: string;
}
interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}
interface ThemeTypography {
    fontFamily: string;
    fontFamilyBold: string;
    sizeXs: number;
    sizeSm: number;
    sizeMd: number;
    sizeLg: number;
    sizeXl: number;
    sizeXxl: number;
    lineHeightTight: number;
    lineHeightNormal: number;
    lineHeightRelaxed: number;
}
interface ThemeBorderRadius {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
}
interface Theme {
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    borderRadius: ThemeBorderRadius;
    isDark: boolean;
}
interface FeaturedDeckProviderProps {
    children: React.ReactNode;
    theme?: Partial<Theme>;
}
interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: string;
}
interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}
interface CreateFeatureInput {
    title: string;
    description: string;
}

interface FeaturedDeckConfig {
    apiKey: string;
    theme?: Partial<Theme>;
}
declare class FeaturedDeckSDK {
    init(config: FeaturedDeckConfig): Promise<void>;
    isReady(): boolean;
    openFeatureBoard(): void;
    close(): void;
    setUser(user: User | null): Promise<void>;
    getUser(): User | null;
    setTheme(theme: Partial<Theme>): void;
    enableDarkMode(): void;
    enableLightMode(): void;
    isVisible(): boolean;
}
declare const FeaturedDeck: FeaturedDeckSDK;

declare const lightTheme: Theme;
declare const darkTheme: Theme;
declare const useTheme: () => Theme;
declare function mergeTheme(baseTheme: Theme, customTheme?: Partial<Theme>): Theme;
declare function getStatusColor(status: string, colors: ThemeColors): string;
declare function getStatusLabel(status: string): string;
declare function createThemeFromColor(primaryColor: string, isDark?: boolean): Partial<Theme>;

declare function FeaturedDeckProvider({ children, theme: customTheme }: FeaturedDeckProviderProps): React$1.JSX.Element;

declare function useFeatures(): Feature[];
declare function useFeature(featureId: string): Feature | undefined;
declare function useIsLoading(): boolean;
declare function useError(): string | null;
declare function useVisible(): boolean;
declare function useUser(): User | null;
declare function useUpvote(featureId: string): {
    upvotesCount: number;
    hasUpvoted: boolean;
    toggle: () => Promise<void>;
};
declare function useRoadmap(): {
    features: RoadmapFeature[];
    loading: boolean;
    refresh: () => Promise<void>;
};

export { type ApiResponse, type CreateFeatureInput, type Feature, type FeaturePriority, type FeatureStatus, type FeatureVote, FeaturedDeck, type FeaturedDeckConfig, FeaturedDeckProvider, type FeaturedDeckProviderProps, type PaginatedResponse, type RoadmapFeature, type RoadmapFeatureStatus, type RoadmapFeatureVisibility, type Theme, type ThemeBorderRadius, type ThemeColors, type ThemeSpacing, type ThemeTypography, type User, type UserInput, createThemeFromColor, darkTheme, getStatusColor, getStatusLabel, lightTheme, mergeTheme, useError, useFeature, useFeatures, useIsLoading, useRoadmap, useTheme, useUpvote, useUser, useVisible };
