import { store } from '../state/store';
import { User, Theme, FeatureFilters } from '../types';

export interface ProdFeedbackConfig {
  apiKey: string;
  theme?: Partial<Theme>;
}

class ProdFeedbackSDK {
  async init(config: ProdFeedbackConfig) {
    if (!config.apiKey) {
      console.error('[ProdFeedback] API key is required');
      return;
    }

    await store.getState().init({
      apiKey: config.apiKey,
      theme: config.theme,
    });
  }

  isReady(): boolean {
    return store.getState().ready;
  }

  open() {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return;
    }
    store.getState().open();
  }

  openBoard() {
    this.open();
  }

  close() {
    store.getState().close();
  }

  setUser(user: User | null) {
    store.getState().setUser(user);
  }

  getUser(): User | null {
    return store.getState().user;
  }

  setTheme(theme: Partial<Theme>) {
    store.getState().setTheme(theme);
  }

  enableDarkMode() {
    store.getState().setTheme({ isDark: true });
  }

  enableLightMode() {
    store.getState().setTheme({ isDark: false });
  }

  setFilters(filters: FeatureFilters) {
    store.getState().setFilters(filters);
  }

  async refresh() {
    await store.getState().loadFeatures(true);
  }

  async showRoadmap() {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return;
    }
    store.getState().open();
    store.getState().navigateTo({ type: 'roadmap' });
  }

  openFeature(featureId: string) {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return;
    }
    store.getState().open();
    store.getState().openFeature(featureId);
  }

  openAddFeature() {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return;
    }
    store.getState().open();
    store.getState().openAddFeature();
  }

  isVisible(): boolean {
    return store.getState().visible;
  }

  async upvote(featureId: string) {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return;
    }
    await store.getState().toggleUpvote(featureId);
  }

  async deleteFeature(featureId: string): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('[ProdFeedback] SDK not initialized. Call init() first.');
      return false;
    }
    return store.getState().deleteFeature(featureId);
  }
}

export const ProdFeedback = new ProdFeedbackSDK();

export type { ProdFeedbackSDK };
