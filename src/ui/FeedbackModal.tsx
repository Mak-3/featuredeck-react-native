import React, { useMemo } from 'react';
import { Modal, View, StyleSheet, StatusBar } from 'react-native';
import { store, useViewState, useThemeStore, useVisible } from '../state/store';
import { ThemeProvider } from '../theme';
import { FeatureBoard } from './FeatureBoard';
import { FeatureDetail } from './FeatureDetail';
import { AddFeature } from './AddFeature';

function ModalContent() {
  const viewState = useViewState();
  const theme = useThemeStore();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
  }), []);

  const renderContent = () => {
    switch (viewState.type) {
      case 'feature':
        return <FeatureDetail />;
      case 'add-feature':
        return <AddFeature />;
      case 'board':
      default:
        return <FeatureBoard />;
    }
  };

  return (
    <ThemeProvider value={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        {renderContent()}
      </View>
    </ThemeProvider>
  );
}

export function FeedbackModal() {
  const visible = useVisible();

  // Only render Modal when visible - Modal handles its own mounting
  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={() => store.getState().close()}
    >
      <ModalContent />
    </Modal>
  );
}
