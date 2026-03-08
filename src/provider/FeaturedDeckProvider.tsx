import React, { useEffect } from 'react';
import { store, useThemeStore } from '../state/store';
import { ThemeProvider } from '../theme';
import { FeedbackModal } from '../ui/FeedbackModal';
import { FeaturedDeckProviderProps } from '../types';

export function FeaturedDeckProvider({ 
  children, 
  theme: customTheme 
}: FeaturedDeckProviderProps) {
  const storeTheme = useThemeStore();

  useEffect(() => {
    if (customTheme) {
      store.getState().setTheme(customTheme);
    }
  }, [customTheme]);

  return (
    <ThemeProvider value={storeTheme}>
      {children}
      <FeedbackModal />
    </ThemeProvider>
  );
}

export { ThemeProvider };
