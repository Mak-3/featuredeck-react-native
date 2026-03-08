import { create } from 'zustand';
import {
  Feature,
  User,
  UserInput,
  RoadmapFeature,
  Theme,
} from '../types';
import { lightTheme, darkTheme, mergeTheme } from '../theme';
import { 
  identifyEndUser,
  fetchFeatures,
  createFeature as createFeatureQuery,
  deleteFeature as deleteFeatureQuery,
  toggleUpvote as toggleUpvoteQuery,
  fetchRoadmap as fetchRoadmapQuery,
} from '../api';
import { setApiKey } from '../api';

type ViewState = 
  | { type: 'board' }
  | { type: 'add-feature' };

const pendingVotes = new Set<string>();

function mergePreservingPendingVotes(incoming: Feature[], current: Feature[]): Feature[] {
  if (pendingVotes.size === 0) return incoming;

  const currentMap = new Map(current.map(f => [f.id, f]));
  return incoming.map(f => {
    if (pendingVotes.has(f.id)) {
      const local = currentMap.get(f.id);
      if (local) {
        return { ...f, upvotesCount: local.upvotesCount, hasUpvoted: local.hasUpvoted };
      }
    }
    return f;
  });
}

interface State {
  apiKey: string | null;
  user: User | null;
  ready: boolean;
  
  theme: Theme;
  
  visible: boolean;
  viewState: ViewState;
  isLoading: boolean;
  error: string | null;
  
  features: Feature[];
  featuresTotal: number;
  featuresPage: number;
  featuresHasMore: boolean;
  
  roadmapFeatures: RoadmapFeature[];
  roadmapLoading: boolean;
  
  init: (options: {
    apiKey: string;
    theme?: Partial<Theme>;
  }) => Promise<void>;
  setUser: (user: UserInput | null) => Promise<void>;
  setTheme: (theme: Partial<Theme>) => void;
  
  open: () => void;
  close: () => void;
  navigateTo: (view: ViewState) => void;
  openAddFeature: () => void;
  goBack: () => void;
  
  loadFeatures: (refresh?: boolean) => Promise<void>;
  loadMoreFeatures: () => Promise<void>;
  createFeature: (title: string, description: string) => Promise<boolean>;
  deleteFeature: (featureId: string) => Promise<boolean>;
  toggleUpvote: (featureId: string) => Promise<void>;
  
  loadRoadmap: () => Promise<void>;
}

export const store = create<State>((set, get) => ({
  apiKey: null,
  user: null,
  ready: false,
  
  theme: lightTheme,
  
  visible: false,
  viewState: { type: 'board' },
  isLoading: false,
  error: null,
  
  features: [],
  featuresTotal: 0,
  featuresPage: 1,
  featuresHasMore: false,
  
  roadmapFeatures: [],
  roadmapLoading: false,
  
  init: async (options) => {
    const { apiKey, theme } = options;
    
    try {
      setApiKey(apiKey);
      
      const currentTheme = get().theme;
      const mergedTheme = theme ? mergeTheme(currentTheme, theme) : currentTheme;
      
      set({
        apiKey,
        theme: mergedTheme,
        ready: true,
      });
      
      console.log('[FeaturedDeck] SDK initialized');
    } catch (error: any) {
      console.error('[FeaturedDeck] Failed to initialize:', error);
      set({ error: error.message || 'Failed to initialize SDK' });
    }
  },
  
  setUser: async (input) => {
    if (!input) {
      set({ user: null });
      return;
    }
    
    try {
      const resolved = await identifyEndUser(input);
      set({ user: resolved });
    } catch (e: any) {
      console.warn('[FeaturedDeck] Failed to identify user, storing locally:', e.message);
      set({
        user: {
          id: input.externalUserId,
          ...input,
        },
      });
    }
  },
  
  setTheme: (theme) => {
    const currentTheme = get().theme;
    
    if (theme.isDark !== undefined && theme.isDark !== currentTheme.isDark) {
      const baseTheme = theme.isDark ? darkTheme : lightTheme;
      set({ theme: mergeTheme(baseTheme, theme) });
    } else {
      set({ theme: mergeTheme(currentTheme, theme) });
    }
  },

  open: () => {
    set({ visible: true, viewState: { type: 'board' }, error: null });
    get().loadFeatures(true);
  },
  
  close: () => {
    set({ 
      visible: false, 
      viewState: { type: 'board' },
      error: null,
    });
  },
  
  navigateTo: (view) => {
    set({ viewState: view, error: null });
  },
  
  openAddFeature: () => {
    set({ viewState: { type: 'add-feature' }, error: null });
  },
  
  goBack: () => {
    const { viewState } = get();
    if (viewState.type === 'add-feature') {
      set({ 
        viewState: { type: 'board' },
        error: null,
      });
    } else {
      get().close();
    }
  },

  loadFeatures: async (refresh = false) => {
    const { user } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await fetchFeatures({
        endUserId: user?.id,
        page: 1,
        pageSize: 20,
      });
      
      const merged = mergePreservingPendingVotes(result.data, get().features);
      
      set({
        features: merged,
        featuresTotal: result.total,
        featuresPage: 1,
        featuresHasMore: result.hasMore,
        isLoading: false,
      });
    } catch (e: any) {
      set({ 
        error: e.message || 'Failed to load features',
        isLoading: false,
      });
    }
  },
  
  loadMoreFeatures: async () => {
    const { featuresPage, featuresHasMore, features, user } = get();
    
    if (!featuresHasMore) return;
    
    const nextPage = featuresPage + 1;
    
    try {
      const result = await fetchFeatures({
        endUserId: user?.id,
        page: nextPage,
        pageSize: 20,
      });
      
      set({
        features: [...features, ...result.data],
        featuresPage: nextPage,
        featuresHasMore: result.hasMore,
      });
    } catch (e) {
    }
  },
  
  createFeature: async (title, description) => {
    const { user } = get();
    
    if (!user) {
      set({ error: 'User must be set to create feedback. Call FeaturedDeck.setUser() first.' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const newFeature = await createFeatureQuery(title, description, user);
      
      const features = [newFeature, ...get().features];
      set({ 
        features,
        featuresTotal: get().featuresTotal + 1,
        isLoading: false,
        viewState: { type: 'board' },
      });
      
      return true;
    } catch (e: any) {
      set({ 
        error: e.message || 'Failed to create feedback',
        isLoading: false,
      });
      return false;
    }
  },
  
  deleteFeature: async (featureId) => {
    const { user, features } = get();
    
    if (!user) {
      set({ error: 'User must be set to delete a feature. Call FeaturedDeck.setUser() first.' });
      return false;
    }
    
    try {
      await deleteFeatureQuery(featureId, user.id);
      
      set({ 
        features: features.filter(f => f.id !== featureId),
        featuresTotal: get().featuresTotal - 1,
      });
      
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete feature' });
      return false;
    }
  },
  
  toggleUpvote: async (featureId) => {
    const { features, user } = get();
    
    if (!user) {
      set({ error: 'User must be set to vote. Call FeaturedDeck.setUser() first.' });
      return;
    }
    
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;
    
    const willUpvote = !feature.hasUpvoted;
    
    const optimistic = (f: Feature) => ({
      ...f,
      hasUpvoted: willUpvote,
      upvotesCount: willUpvote ? f.upvotesCount + 1 : f.upvotesCount - 1,
    });
    
    pendingVotes.add(featureId);
    
    set({
      features: features.map(f => f.id === featureId ? optimistic(f) : f),
    });
    
    try {
      const result = await toggleUpvoteQuery(featureId, user.id);
      
      pendingVotes.delete(featureId);
      
      const serverUpdate = (f: Feature) => ({
        ...f,
        upvotesCount: result.upvotesCount,
        hasUpvoted: result.hasUpvoted,
      });
      
      set({
        features: get().features.map(f => 
          f.id === featureId ? serverUpdate(f) : f
        ),
      });
    } catch (e) {
      pendingVotes.delete(featureId);
      
      const revert = (f: Feature) => ({
        ...f,
        hasUpvoted: !willUpvote,
        upvotesCount: willUpvote ? f.upvotesCount - 1 : f.upvotesCount + 1,
      });
      
      set({
        features: get().features.map(f => f.id === featureId ? revert(f) : f),
      });
    }
  },
  
  loadRoadmap: async () => {
    set({ roadmapLoading: true, error: null });
    
    try {
      const features = await fetchRoadmapQuery();
      set({ roadmapFeatures: features, roadmapLoading: false });
    } catch (e: any) {
      set({ 
        error: e.message || 'Failed to load roadmap',
        roadmapLoading: false,
      });
    }
  },
}));

export const useStore = store;
export const useFeedbackStore = store;
export const useFeatures = () => store(s => s.features);
export const useThemeStore = () => store(s => s.theme);
export const useIsLoading = () => store(s => s.isLoading);
export const useError = () => store(s => s.error);
export const useVisible = () => store(s => s.visible);
export const useViewState = () => store(s => s.viewState);
export const useUser = () => store(s => s.user);
export const useRoadmapFeatures = () => store(s => s.roadmapFeatures);
export const useRoadmapLoading = () => store(s => s.roadmapLoading);
