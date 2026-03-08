import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import { Feature } from '../../types';
import { StatusBadge } from './StatusBadge';
import { UpvoteButton } from './UpvoteButton';
import { store, useUser } from '../../state/store';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const theme = useTheme();
  const user = useUser();

  const isAuthor = !!user && !!feature.createdByEndUserId && user.id === feature.createdByEndUserId;

  const handleUpvote = () => {
    store.getState().toggleUpvote(feature.id);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Feature',
      'Are you sure you want to delete this feature request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => store.getState().deleteFeature(feature.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <UpvoteButton
          count={feature.upvotesCount}
          hasUpvoted={feature.hasUpvoted}
          onPress={handleUpvote}
          size="small"
        />

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 15,
              fontWeight: '600',
              lineHeight: 22,
            }}
            numberOfLines={2}
          >
            {feature.title}
          </Text>

          {feature.description && (
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: 13,
                marginTop: 4,
                lineHeight: 19,
              }}
              numberOfLines={2}
            >
              {feature.description}
            </Text>
          )}

          <View style={styles.footer}>
            <StatusBadge status={feature.status} size="small" />

            {isAuthor && (
              <TouchableOpacity
                onPress={handleDelete}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: theme.colors.error + '12',
                    borderRadius: 6,
                  },
                ]}
              >
                <Text style={{ color: theme.colors.error, fontSize: 12, fontWeight: '500' }}>
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
