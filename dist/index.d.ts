import React$1 from 'react';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
type FeatureStatus = FeedbackStatus;
type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';
interface Category {
    id: string;
    name: string;
    color: string;
    icon?: string;
}
interface User {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    metadata?: Record<string, any>;
}
interface Comment {
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
interface Feedback {
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
interface Feature extends Feedback {
    commentCount?: number;
    isSubscribed?: boolean;
    category?: Category;
}
interface Board {
    id: string;
    name: string;
    description?: string;
    features: Feature[];
    categories: Category[];
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
    subscribe: string;
    subscribeActive: string;
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
interface ProdFeedbackProviderProps {
    children: React.ReactNode;
    theme?: Partial<Theme>;
}
interface FeedbackButtonProps {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    offset?: {
        x: number;
        y: number;
    };
    size?: number;
    icon?: React.ReactNode;
    label?: string;
    showLabel?: boolean;
    style?: any;
}
interface FeatureFilters {
    status?: FeedbackStatus[];
    type?: FeedbackType[];
    sortBy?: 'newest' | 'oldest' | 'most_upvotes' | 'trending';
    searchQuery?: string;
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
    categoryId?: string;
    tags?: string[];
}
interface CreateCommentInput {
    featureId: string;
    content: string;
    parentId?: string;
}

interface ProdFeedbackConfig {
    apiKey: string;
    theme?: Partial<Theme>;
}
declare class ProdFeedbackSDK {
    init(config: ProdFeedbackConfig): Promise<void>;
    isReady(): boolean;
    open(): void;
    openBoard(): void;
    close(): void;
    setUser(user: User | null): void;
    getUser(): User | null;
    setTheme(theme: Partial<Theme>): void;
    enableDarkMode(): void;
    enableLightMode(): void;
    setFilters(filters: FeatureFilters): void;
    refresh(): Promise<void>;
    showRoadmap(): Promise<void>;
    openFeature(featureId: string): void;
    openAddFeature(): void;
    isVisible(): boolean;
    upvote(featureId: string): Promise<void>;
    deleteFeature(featureId: string): Promise<boolean>;
}
declare const ProdFeedback: ProdFeedbackSDK;

declare const lightTheme: Theme;
declare const darkTheme: Theme;
declare const useTheme: () => Theme;
declare function mergeTheme(baseTheme: Theme, customTheme?: Partial<Theme>): Theme;
declare function getStatusColor(status: string, colors: ThemeColors): string;
declare function getStatusLabel(status: string): string;
declare function createThemeFromColor(primaryColor: string, isDark?: boolean): Partial<Theme>;

declare function ProdFeedbackProvider({ children, theme: customTheme }: ProdFeedbackProviderProps): React$1.JSX.Element;

declare function FeedbackButton({ position, offset, size, icon, label, showLabel, style, }: FeedbackButtonProps): React$1.JSX.Element;

/**
 * Hook to get all features
 */
declare function useFeatures(): Feature[];
/**
 * Hook to get a specific feature by ID
 */
declare function useFeature(featureId: string): Feature | undefined;
/**
 * Hook to get the currently selected/viewed feature
 */
declare function useSelectedFeature(): Feature | null;
/**
 * Hook to get comments for the selected feature
 */
declare function useComments(): Comment[];
/**
 * Hook to get all categories
 */
declare function useCategories(): Category[];
/**
 * Hook to get current filters
 */
declare function useFilters(): FeatureFilters;
/**
 * Hook to get loading state
 */
declare function useIsLoading(): boolean;
/**
 * Hook to get error state
 */
declare function useError(): string | null;
/**
 * Hook to get visibility state
 */
declare function useVisible(): boolean;
/**
 * Hook to get the current user
 */
declare function useUser(): User | null;
/**
 * Hook to check if current user is the author of a feature
 */
declare function useIsFeatureAuthor(featureId: string): boolean;
/**
 * Hook to get SDK actions
 */
declare function useProdFeedbackActions(): {
    open: () => void;
    close: () => void;
    setFilters: (filters: Partial<FeatureFilters>) => void;
    refresh: () => Promise<void>;
    upvote: (featureId: string) => Promise<void>;
    deleteFeature: (featureId: string) => Promise<boolean>;
};
/**
 * Hook for upvoting a feature
 */
declare function useUpvote(featureId: string): {
    upvotes: number;
    hasUpvoted: boolean;
    toggle: () => Promise<void>;
};
/**
 * Hook for subscribing to a feature
 */
declare function useSubscription(featureId: string): {
    isSubscribed: boolean;
    toggle: () => void;
};
/**
 * Hook for deleting a feature (only for authors)
 */
declare function useDeleteFeature(featureId: string): {
    canDelete: boolean;
    deleteFeature: () => Promise<boolean>;
};

export { type ApiResponse, type Board, type Category, type Comment, type CreateCommentInput, type CreateFeatureInput, type Feature, type FeatureFilters, type FeaturePriority, type FeatureStatus, FeedbackButton, type FeedbackButtonProps, type PaginatedResponse, ProdFeedback, type ProdFeedbackConfig, ProdFeedbackProvider, type ProdFeedbackProviderProps, type Theme, type ThemeBorderRadius, type ThemeColors, type ThemeSpacing, type ThemeTypography, type User, createThemeFromColor, darkTheme, getStatusColor, getStatusLabel, lightTheme, mergeTheme, useCategories, useComments, useDeleteFeature, useError, useFeature, useFeatures, useFilters, useIsFeatureAuthor, useIsLoading, useProdFeedbackActions, useSelectedFeature, useSubscription, useTheme, useUpvote, useUser, useVisible };
