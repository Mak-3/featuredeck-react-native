import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import { store } from '../../state/store';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftButton: {
      width: 40,
      height: 40,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    backIcon: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevron: {
      width: 10,
      height: 10,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      transform: [{ rotate: '45deg' }],
      marginLeft: 4,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontWeight: '700',
    },
    rightButton: {
      width: 40,
      height: 40,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  }), []);

  const handleBack = () => {
    store.getState().goBack();
  };

  const handleClose = () => {
    store.getState().close();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.md,
          paddingBottom: theme.spacing.md,
        },
      ]}
    >
      {/* Left side - Back or Close */}
      <TouchableOpacity
        style={styles.leftButton}
        onPress={showBack ? handleBack : handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={showBack ? 'Go back' : 'Close'}
      >
        {showBack ? (
          <View style={styles.backIcon}>
            <View
              style={[
                styles.chevron,
                {
                  borderColor: theme.colors.text,
                },
              ]}
            />
          </View>
        ) : (
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '300' }}>
            ✕
          </Text>
        )}
      </TouchableOpacity>

      {/* Title */}
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.typography.sizeLg,
            fontFamily: theme.typography.fontFamilyBold,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right side - Action or spacer */}
      <View style={styles.rightButton}>
        {rightAction}
      </View>
    </View>
  );
}




