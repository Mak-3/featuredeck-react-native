import { store } from '../state/store';
import { User, Theme, UserInput } from '../types';

export interface FeatureDeckConfig {
  apiKey: string;
  theme?: Partial<Theme>;
}

class FeatureDeckSDK {
  async init(config: FeatureDeckConfig) {
    if (!config.apiKey) {
      console.error('[FeatureDeck] API key is required');
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

  openFeatureBoard() {
    if (!this.isReady()) {
      console.warn('[FeatureDeck] SDK not initialized. Call init() first.');
      return;
    }
    store.getState().open();
  }

  close() {
    store.getState().close();
  }

  async setUser(user: UserInput | null) {
    await store.getState().setUser(user);
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

  isVisible(): boolean {
    return store.getState().visible;
  }
}

export const FeatureDeck = new FeatureDeckSDK();

export type { FeatureDeckSDK };
