import { store, useUser as useUserStore } from '../state/store';
import { useTheme } from '../theme';
import { Feature, Comment, Category, FeatureFilters } from '../types';

/**
 * Hook to access the current theme
 */
export { useTheme } from '../theme';

/**
 * Hook to get all features
 */
export function useFeatures(): Feature[] {
  return store(s => s.features);
}

/**
 * Hook to get a specific feature by ID
 */
export function useFeature(featureId: string): Feature | undefined {
  return store(s => s.features.find(f => f.id === featureId));
}

/**
 * Hook to get the currently selected/viewed feature
 */
export function useSelectedFeature(): Feature | null {
  return store(s => s.selectedFeature);
}

/**
 * Hook to get comments for the selected feature
 */
export function useComments(): Comment[] {
  return [];
}

/**
 * Hook to get all categories
 */
export function useCategories(): Category[] {
  return [];
}

/**
 * Hook to get current filters
 */
export function useFilters(): FeatureFilters {
  return store(s => s.filters);
}

/**
 * Hook to get loading state
 */
export function useIsLoading(): boolean {
  return store(s => s.isLoading);
}

/**
 * Hook to get error state
 */
export function useError(): string | null {
  return store(s => s.error);
}

/**
 * Hook to get visibility state
 */
export function useVisible(): boolean {
  return store(s => s.visible);
}

/**
 * Hook to get the current user
 */
export function useUser() {
  return useUserStore();
}

/**
 * Hook to check if current user is the author of a feature
 */
export function useIsFeatureAuthor(featureId: string): boolean {
  const user = store(s => s.user);
  const feature = store(s => s.features.find(f => f.id === featureId));
  
  if (!user || !feature || !feature.author) return false;
  return user.id === feature.author.id;
}

/**
 * Hook to get SDK actions
 */
export function useProdFeedbackActions() {
  return {
    open: store.getState().open,
    close: store.getState().close,
    setFilters: store.getState().setFilters,
    refresh: () => store.getState().loadFeatures(true),
    upvote: store.getState().toggleUpvote,
    deleteFeature: store.getState().deleteFeature,
  };
}

/**
 * Hook for upvoting a feature
 */
export function useUpvote(featureId: string) {
  const feature = store(s => s.features.find(f => f.id === featureId));
  
  return {
    upvotes: feature?.upvotes ?? 0,
    hasUpvoted: feature?.hasUpvoted ?? false,
    toggle: () => store.getState().toggleUpvote(featureId),
  };
}

/**
 * Hook for subscribing to a feature
 */
export function useSubscription(featureId: string) {
  const feature = store(s => s.features.find(f => f.id === featureId));
  
  return {
    isSubscribed: feature?.isSubscribed ?? false,
    toggle: () => {},
  };
}

/**
 * Hook for deleting a feature (only for authors)
 */
export function useDeleteFeature(featureId: string) {
  const user = store(s => s.user);
  const feature = store(s => s.features.find(f => f.id === featureId));
  const canDelete = user && feature && feature.author && user.id === feature.author.id;
  
  return {
    canDelete: !!canDelete,
    deleteFeature: async () => {
      if (!canDelete) return false;
      return store.getState().deleteFeature(featureId);
    },
  };
}
