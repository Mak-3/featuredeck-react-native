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
import { setApiKey, NETWORK_ERROR } from '../api';
import { trackEvent } from '../api/eventTracker';

type ViewState = 
  | { type: 'board' }
  | { type: 'add-feature' };

const VOTE_DEBOUNCE_MS = 300;
const MAX_VOTE_RETRIES = 2;

interface PendingVote {
  serverUpvoted: boolean;
  serverCount: number;
  inflight: boolean;
  timer?: ReturnType<typeof setTimeout>;
  retries: number;
}

const pendingVotes = new Map<string, PendingVote>();

function cleanupPendingVote(featureId: string) {
  const pv = pendingVotes.get(featureId);
  if (pv?.timer) clearTimeout(pv.timer);
  pendingVotes.delete(featureId);
}

function scheduleFlush(pv: PendingVote, featureId: string, externalUserId: string) {
  if (pv.timer) clearTimeout(pv.timer);
  pv.timer = setTimeout(() => {
    const current = pendingVotes.get(featureId);
    if (current !== pv) return;
    pv.timer = undefined;
    flushVote(featureId, externalUserId);
  }, VOTE_DEBOUNCE_MS);
}

function mergePreservingOptimisticVotes(incoming: Feature[], current: Feature[]): Feature[] {
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

async function flushVote(featureId: string, externalUserId: string) {
  const pv = pendingVotes.get(featureId);
  if (!pv || pv.inflight) return;

  const feature = store.getState().features.find(f => f.id === featureId);
  if (!feature) {
    cleanupPendingVote(featureId);
    return;
  }

  if (feature.hasUpvoted === pv.serverUpvoted) {
    cleanupPendingVote(featureId);
    return;
  }

  pv.inflight = true;

  try {
    const result = await toggleUpvoteQuery(featureId, externalUserId);
    pv.serverUpvoted = result.hasUpvoted;
    pv.serverCount = result.upvotesCount;
    pv.inflight = false;

    const latest = store.getState().features.find(f => f.id === featureId);
    if (!latest) {
      cleanupPendingVote(featureId);
      return;
    }

    if (latest.hasUpvoted !== pv.serverUpvoted) {
      // Still out of sync — schedule another flush through the debounce
      // (never fire back-to-back API calls; give server time between requests)
      if (!pv.timer) {
        scheduleFlush(pv, featureId, externalUserId);
      }
    } else {
      store.setState(state => ({
        features: state.features.map(f =>
          f.id === featureId
            ? { ...f, upvotesCount: result.upvotesCount, hasUpvoted: result.hasUpvoted }
            : f
        ),
      }));
      cleanupPendingVote(featureId);
    }
  } catch {
    pv.inflight = false;

    if (pv.timer) return;

    if (pv.retries < MAX_VOTE_RETRIES) {
      pv.retries++;
      scheduleFlush(pv, featureId, externalUserId);
    } else {
      store.setState(state => ({
        features: state.features.map(f => {
          if (f.id !== featureId) return f;
          return {
            ...f,
            hasUpvoted: pv!.serverUpvoted,
            upvotesCount: pv!.serverCount,
          };
        }),
      }));
      cleanupPendingVote(featureId);
    }
  }
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
  toggleUpvote: (featureId: string) => void;
  
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
      
      console.log('[FeatureDeck] SDK initialized');
    } catch (error: any) {
      console.error('[FeatureDeck] Failed to initialize:', error);
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
      console.warn('[FeatureDeck] Failed to identify user, storing locally:', e.message);
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
    trackEvent('featureboard_opened');
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
        endUserId: user?.externalUserId,
        page: 1,
        pageSize: 20,
      });
      
      const merged = mergePreservingOptimisticVotes(result.data, get().features);
      
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
        endUserId: user?.externalUserId,
        page: nextPage,
        pageSize: 20,
      });
      
      set({
        features: [...features, ...result.data],
        featuresPage: nextPage,
        featuresHasMore: result.hasMore,
      });
    } catch (e: any) {
      console.warn('[FeatureDeck] Failed to load more features:', e.message);
    }
  },
  
  createFeature: async (title, description) => {
    const { user } = get();
    
    if (!user) {
      set({ error: 'User must be set to create feedback. Call FeatureDeck.setUser() first.' });
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
    const { user, features, featuresTotal } = get();
    
    if (!user) {
      set({ error: 'User must be set to delete a feature. Call FeatureDeck.setUser() first.' });
      return false;
    }
    
    const featureIndex = features.findIndex(f => f.id === featureId);
    const deletedFeature = features[featureIndex];
    
    set({
      features: features.filter(f => f.id !== featureId),
      featuresTotal: featuresTotal - 1,
    });
    
    try {
      await deleteFeatureQuery(featureId, user.externalUserId);
      return true;
    } catch (e: any) {
      const current = get().features;
      const restored = [...current];
      restored.splice(featureIndex, 0, deletedFeature);
      
      set({
        features: restored,
        featuresTotal: get().featuresTotal + 1,
        error: e.message || 'Failed to delete feature',
      });
      return false;
    }
  },
  
  toggleUpvote: (featureId) => {
    const { user } = get();
    
    if (!user) {
      set({ error: 'User must be set to vote. Call FeatureDeck.setUser() first.' });
      return;
    }
    
    const feature = get().features.find(f => f.id === featureId);
    if (!feature) return;
    
    let pv = pendingVotes.get(featureId);
    if (!pv) {
      pv = {
        serverUpvoted: feature.hasUpvoted,
        serverCount: feature.upvotesCount,
        inflight: false,
        retries: 0,
      };
      pendingVotes.set(featureId, pv);
    }
    
    const willUpvote = !feature.hasUpvoted;
    set(state => ({
      features: state.features.map(f => f.id === featureId ? {
        ...f,
        hasUpvoted: willUpvote,
        upvotesCount: Math.max(0, willUpvote ? f.upvotesCount + 1 : f.upvotesCount - 1),
      } : f),
    }));
    
    pv.retries = 0;
    const externalUserId = user.externalUserId;
    scheduleFlush(pv, featureId, externalUserId);
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
