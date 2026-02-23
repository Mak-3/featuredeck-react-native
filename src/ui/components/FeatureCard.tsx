import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme';
import { Feature } from '../../types';
import { StatusBadge } from './StatusBadge';
import { UpvoteButton } from './UpvoteButton';
import { store } from '../../state/store';

interface FeatureCardProps {
  feature: Feature;
  onPress?: () => void;
}

export function FeatureCard({ feature, onPress }: FeatureCardProps) {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
    },
    content: {
      flex: 1,
    },
    title: {
      fontWeight: '600',
      lineHeight: 22,
    },
    description: {
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    commentCount: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    commentText: {
      fontWeight: '500',
    },
    category: {},
  }), []);

  const handleUpvote = () => {
    store.getState().toggleUpvote(feature.id);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      store.getState().openFeature(feature.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* Upvote Button */}
        <UpvoteButton
          count={feature.upvotes}
          hasUpvoted={feature.hasUpvoted}
          onPress={handleUpvote}
          size="small"
        />

        {/* Content */}
        <View style={[styles.content, { marginLeft: theme.spacing.md }]}>
          {/* Title */}
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.sizeMd,
                fontFamily: theme.typography.fontFamilyBold,
              },
            ]}
            numberOfLines={2}
          >
            {feature.title}
          </Text>

          {/* Description Preview */}
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizeSm,
                marginTop: theme.spacing.xs,
              },
            ]}
            numberOfLines={2}
          >
            {feature.description}
          </Text>

          {/* Footer */}
          <View style={[styles.footer, { marginTop: theme.spacing.sm }]}>
            <StatusBadge status={feature.status} size="small" />
            
            {/* Comments count */}
            <View style={[styles.commentCount, { marginLeft: theme.spacing.md }]}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>💬</Text>
              <Text
                style={[
                  styles.commentText,
                  {
                    color: theme.colors.textMuted,
                    fontSize: theme.typography.sizeSm,
                    marginLeft: 4,
                  },
                ]}
              >
                {feature.commentCount}
              </Text>
            </View>

            {/* Category if exists */}
            {feature.category && (
              <View
                style={[
                  styles.category,
                  {
                    backgroundColor: feature.category.color + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: theme.borderRadius.sm,
                    marginLeft: 'auto',
                  },
                ]}
              >
                <Text
                  style={{
                    color: feature.category.color,
                    fontSize: theme.typography.sizeXs,
                    fontWeight: '500',
                  }}
                >
                  {feature.category.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}



