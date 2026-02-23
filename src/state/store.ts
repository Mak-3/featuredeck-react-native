import { create } from 'zustand';
import {
  Feature,
  User,
  Theme,
  FeatureFilters,
} from '../types';
import { lightTheme, darkTheme, mergeTheme } from '../theme';
import { 
  fetchFeatures,
  fetchFeature,
  createFeature as createFeatureQuery,
  deleteFeature as deleteFeatureQuery,
  toggleUpvote as toggleUpvoteQuery,
} from '../api';
import { setApiKey } from '../api';

type ViewState = 
  | { type: 'board' }
  | { type: 'feature'; featureId: string }
  | { type: 'add-feature' }
  | { type: 'roadmap' };

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
  selectedFeature: Feature | null;
  
  filters: FeatureFilters;
  
  init: (options: {
    apiKey: string;
    theme?: Partial<Theme>;
  }) => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: Partial<Theme>) => void;
  
  open: () => void;
  close: () => void;
  navigateTo: (view: ViewState) => void;
  openFeature: (featureId: string) => void;
  openAddFeature: () => void;
  goBack: () => void;
  
  loadFeatures: (refresh?: boolean) => Promise<void>;
  loadMoreFeatures: () => Promise<void>;
  loadFeature: (featureId: string) => Promise<void>;
  createFeature: (title: string, description: string, type?: 'bug' | 'feature' | 'improvement' | 'other') => Promise<boolean>;
  deleteFeature: (featureId: string) => Promise<boolean>;
  toggleUpvote: (featureId: string) => Promise<void>;
  setFilters: (filters: Partial<FeatureFilters>) => void;
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
  selectedFeature: null,
  
  filters: {
    sortBy: 'trending',
  },
  
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
      
      console.log('[ProdFeedback] SDK initialized');
    } catch (error: any) {
      console.error('[ProdFeedback] Failed to initialize:', error);
      set({ error: error.message || 'Failed to initialize SDK' });
    }
  },
  
  setUser: (user) => {
    set({ user });
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
      selectedFeature: null,
      error: null,
    });
  },
  
  navigateTo: (view) => {
    set({ viewState: view, error: null });
  },
  
  openFeature: async (featureId) => {
    set({ 
      viewState: { type: 'feature', featureId },
    });
    await get().loadFeature(featureId);
  },
  
  openAddFeature: () => {
    set({ viewState: { type: 'add-feature' }, error: null });
  },
  
  goBack: () => {
    const { viewState } = get();
    if (viewState.type === 'feature' || viewState.type === 'add-feature' || viewState.type === 'roadmap') {
      set({ 
        viewState: { type: 'board' },
        selectedFeature: null,
        error: null,
      });
    } else {
      get().close();
    }
  },

  loadFeatures: async (refresh = false) => {
    const { filters, user } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await fetchFeatures({
        filters,
        userId: user?.id,
        page: 1,
        pageSize: 20,
      });
      
      set({
        features: result.data,
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
    const { filters, featuresPage, featuresHasMore, features, user } = get();
    
    if (!featuresHasMore) return;
    
    const nextPage = featuresPage + 1;
    
    try {
      const result = await fetchFeatures({
        filters,
        userId: user?.id,
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
  
  loadFeature: async (featureId) => {
    const { user } = get();
    
    try {
      const feature = await fetchFeature(featureId, user?.id);
      set({ selectedFeature: feature });
      
      const features = get().features.map(f => 
        f.id === featureId ? feature : f
      );
      set({ features });
    } catch (e: any) {
      set({ error: e.message || 'Failed to load feature' });
    }
  },
  
  createFeature: async (title, description, type = 'feature' as const) => {
    const { user } = get();
    
    if (!user) {
      set({ error: 'User must be set to create feedback. Call ProdFeedback.setUser() first.' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const newFeature = await createFeatureQuery(title, description, user, type);
      
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
      set({ error: 'User must be set to delete a feature. Call ProdFeedback.setUser() first.' });
      return false;
    }
    
    try {
      await deleteFeatureQuery(featureId, user.id);
      
      set({ 
        features: features.filter(f => f.id !== featureId),
        featuresTotal: get().featuresTotal - 1,
        viewState: { type: 'board' },
        selectedFeature: null,
      });
      
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete feature' });
      return false;
    }
  },
  
  toggleUpvote: async (featureId) => {
    const { features, selectedFeature, user } = get();
    
    if (!user) {
      set({ error: 'User must be set to vote. Call ProdFeedback.setUser() first.' });
      return;
    }
    
    const feature = features.find(f => f.id === featureId) || selectedFeature;
    if (!feature) return;
    
    const willUpvote = !feature.hasUpvoted;
    
    const updateFeature = (f: Feature) => ({
      ...f,
      hasUpvoted: willUpvote,
      upvotes: willUpvote ? f.upvotes + 1 : f.upvotes - 1,
    });
    
    set({
      features: features.map(f => f.id === featureId ? updateFeature(f) : f),
      selectedFeature: selectedFeature?.id === featureId 
        ? updateFeature(selectedFeature) 
        : selectedFeature,
    });
    
    try {
      const result = await toggleUpvoteQuery(featureId, user.id);
      
      const serverUpdate = (f: Feature) => ({
        ...f,
        upvotes: result.upvotes,
        hasUpvoted: result.hasUpvoted,
      });
      
      set({
        features: get().features.map(f => 
          f.id === featureId ? serverUpdate(f) : f
        ),
        selectedFeature: get().selectedFeature?.id === featureId 
          ? serverUpdate(get().selectedFeature!) 
          : get().selectedFeature,
      });
    } catch (e) {
      const revert = (f: Feature) => ({
        ...f,
        hasUpvoted: !willUpvote,
        upvotes: willUpvote ? f.upvotes - 1 : f.upvotes + 1,
      });
      
      set({
        features: get().features.map(f => f.id === featureId ? revert(f) : f),
        selectedFeature: get().selectedFeature?.id === featureId 
          ? revert(get().selectedFeature!) 
          : get().selectedFeature,
      });
    }
  },
  
  
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters },
    });
    get().loadFeatures(true);
  },
}));

export const useStore = store;
export const useFeedbackStore = store;
export const useFeatures = () => store(s => s.features);
export const useSelectedFeature = () => store(s => s.selectedFeature);
export const useThemeStore = () => store(s => s.theme);
export const useIsLoading = () => store(s => s.isLoading);
export const useError = () => store(s => s.error);
export const useVisible = () => store(s => s.visible);
export const useViewState = () => store(s => s.viewState);
export const useUser = () => store(s => s.user);
