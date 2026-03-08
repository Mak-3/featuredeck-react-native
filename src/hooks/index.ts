import { store, useUser as useUserStore } from '../state/store';
import { Feature, RoadmapFeature } from '../types';

export { useTheme } from '../theme';

export function useFeatures(): Feature[] {
  return store(s => s.features);
}

export function useFeature(featureId: string): Feature | undefined {
  return store(s => s.features.find(f => f.id === featureId));
}

export function useIsLoading(): boolean {
  return store(s => s.isLoading);
}

export function useError(): string | null {
  return store(s => s.error);
}

export function useVisible(): boolean {
  return store(s => s.visible);
}

export function useUser() {
  return useUserStore();
}

export function useUpvote(featureId: string) {
  const feature = store(s => s.features.find(f => f.id === featureId));
  
  return {
    upvotesCount: feature?.upvotesCount ?? 0,
    hasUpvoted: feature?.hasUpvoted ?? false,
    toggle: () => store.getState().toggleUpvote(featureId),
  };
}

export function useRoadmap() {
  const features = store(s => s.roadmapFeatures);
  const loading = store(s => s.roadmapLoading);
  
  return {
    features,
    loading,
    refresh: () => store.getState().loadRoadmap(),
  };
}
