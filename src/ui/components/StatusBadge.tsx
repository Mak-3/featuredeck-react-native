import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, getStatusColor, getStatusLabel } from '../../theme';
import { FeatureStatus } from '../../types';

interface StatusBadgeProps {
  status: FeatureStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const theme = useTheme();
  const color = getStatusColor(status, theme.colors);
  const label = getStatusLabel(status);
  
  const styles = useMemo(() => StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    dot: {
      borderRadius: 100,
    },
    label: {
      fontWeight: '600',
    },
  }), []);

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '18',
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
          borderRadius: theme.borderRadius.full,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            width: isSmall ? 6 : 8,
            height: isSmall ? 6 : 8,
            marginRight: isSmall ? 4 : 6,
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize: isSmall ? theme.typography.sizeXs : theme.typography.sizeSm,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}



