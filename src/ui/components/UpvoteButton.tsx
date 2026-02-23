import React, { useRef, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme';

interface UpvoteButtonProps {
  count: number;
  hasUpvoted: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return String(count);
}

export function UpvoteButton({
  count,
  hasUpvoted,
  onPress,
  size = 'medium',
}: UpvoteButtonProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    arrow: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
    count: {
      fontWeight: '700',
    },
  }), []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
    
    onPress();
  };

  const sizeConfig = {
    small: { width: 44, height: 52, iconSize: 12, textSize: theme.typography.sizeSm },
    medium: { width: 52, height: 62, iconSize: 14, textSize: theme.typography.sizeMd },
    large: { width: 60, height: 72, iconSize: 16, textSize: theme.typography.sizeLg },
  };

  const config = sizeConfig[size];
  const activeColor = hasUpvoted ? theme.colors.upvoteActive : theme.colors.upvote;
  const bgColor = hasUpvoted 
    ? theme.colors.upvoteActive + '15' 
    : theme.colors.backgroundSecondary;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: config.width,
            height: config.height,
            backgroundColor: bgColor,
            borderRadius: theme.borderRadius.md,
            borderWidth: hasUpvoted ? 1.5 : 0,
            borderColor: hasUpvoted ? theme.colors.upvoteActive : 'transparent',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Triangle Arrow */}
        <View
          style={[
            styles.arrow,
            {
              borderLeftWidth: config.iconSize * 0.6,
              borderRightWidth: config.iconSize * 0.6,
              borderBottomWidth: config.iconSize,
              borderBottomColor: activeColor,
            },
          ]}
        />
        <Text
          style={[
            styles.count,
            {
              color: activeColor,
              fontSize: config.textSize,
              fontFamily: theme.typography.fontFamilyBold,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {formatCount(count)}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}



