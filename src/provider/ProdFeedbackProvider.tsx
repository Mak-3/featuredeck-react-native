import React, { useEffect } from 'react';
import { store, useThemeStore } from '../state/store';
import { ThemeProvider } from '../theme';
import { FeedbackModal } from '../ui/FeedbackModal';
import { ProdFeedbackProviderProps } from '../types';

export function ProdFeedbackProvider({ 
  children, 
  theme: customTheme 
}: ProdFeedbackProviderProps) {
  const storeTheme = useThemeStore();

  // Apply custom theme if provided via props
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

// Re-export for convenience
export { ThemeProvider };
