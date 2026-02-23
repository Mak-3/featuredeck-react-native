import React, { useMemo, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { store, useThemeStore } from '../state/store';
import { FeedbackButtonProps } from '../types';

// Default feedback icon (message bubble with plus)
function DefaultIcon({ color }: { color: string }) {
  return (
    <View style={iconStyles.iconContainer}>
      <View style={[iconStyles.bubble, { borderColor: color }]}>
        <Text style={[iconStyles.plus, { color }]}>+</Text>
      </View>
    </View>
  );
}

// Static styles for icon - these are simple and don't need useMemo
const iconStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 24,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: -2,
  },
});

export function FeedbackButton({
  position = 'bottom-right',
  offset = { x: 20, y: 40 },
  size = 56,
  icon,
  label = 'Feedback',
  showLabel = false,
  style,
}: FeedbackButtonProps) {
  const theme = useThemeStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shadow: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    label: {
      fontWeight: '600',
    },
  }), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    store.getState().open();
  };

  const positionStyle = useMemo(() => {
    const posStyles: any = { position: 'absolute' };
    
    switch (position) {
      case 'bottom-right':
        posStyles.bottom = offset.y;
        posStyles.right = offset.x;
        break;
      case 'bottom-left':
        posStyles.bottom = offset.y;
        posStyles.left = offset.x;
        break;
      case 'top-right':
        posStyles.top = offset.y;
        posStyles.right = offset.x;
        break;
      case 'top-left':
        posStyles.top = offset.y;
        posStyles.left = offset.x;
        break;
    }
    
    return posStyles;
  }, [position, offset]);

  const buttonStyle = {
    width: showLabel ? undefined : size,
    height: size,
    borderRadius: showLabel ? size / 2 : size / 2,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: showLabel ? theme.spacing.lg : 0,
  };

  return (
    <Animated.View
      style={[
        positionStyle,
        { transform: [{ scale: scaleAnim }] },
        styles.shadow,
        { shadowColor: theme.colors.shadow },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {icon || <DefaultIcon color={theme.colors.textInverse} />}
        {showLabel && (
          <Text style={[
            styles.label,
            { 
              color: theme.colors.textInverse,
              fontFamily: theme.typography.fontFamilyBold,
              fontSize: theme.typography.sizeMd,
              marginLeft: theme.spacing.sm,
            },
          ]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}



