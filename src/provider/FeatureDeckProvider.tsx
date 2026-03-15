import React, { useEffect } from 'react';
import { store, useThemeStore } from '../state/store';
import { ThemeProvider } from '../theme';
import { FeedbackModal } from '../ui/FeedbackModal';
import { FeatureDeckProviderProps } from '../types';
import { startEventTracker, stopEventTracker } from '../api/eventTracker';

export function FeatureDeckProvider({ 
  children, 
  theme: customTheme 
}: FeatureDeckProviderProps) {
  const storeTheme = useThemeStore();

  useEffect(() => {
    if (customTheme) {
      store.getState().setTheme(customTheme);
    }
  }, [customTheme]);

  useEffect(() => {
    startEventTracker();
    return () => stopEventTracker();
  }, []);

  return (
    <ThemeProvider value={storeTheme}>
      {children}
      <FeedbackModal />
    </ThemeProvider>
  );
}

export { ThemeProvider };
