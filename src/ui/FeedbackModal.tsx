import React from 'react';
import { Modal, View, StatusBar } from 'react-native';
import { store, useViewState, useThemeStore, useVisible } from '../state/store';
import { ThemeProvider } from '../theme';
import { FeatureBoard } from './FeatureBoard';
import { AddFeature } from './AddFeature';

function ModalContent() {
  const viewState = useViewState();
  const theme = useThemeStore();

  const renderContent = () => {
    switch (viewState.type) {
      case 'add-feature':
        return <AddFeature />;
      case 'board':
      default:
        return <FeatureBoard />;
    }
  };

  return (
    <ThemeProvider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
