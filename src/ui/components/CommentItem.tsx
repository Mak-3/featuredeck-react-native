import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Comment } from '../../types';

interface CommentItemProps {
  comment: Comment;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CommentItem({ comment }: CommentItemProps) {
  const theme = useTheme();
  const isOfficial = comment.isOfficial;
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingVertical: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    authorInfo: {
      marginLeft: 10,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    officialBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    content: {},
  }), []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOfficial 
            ? theme.colors.primary + '08' 
            : 'transparent',
          borderLeftWidth: isOfficial ? 3 : 0,
          borderLeftColor: theme.colors.primary,
          paddingLeft: isOfficial ? theme.spacing.md : 0,
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.header}>
        {/* Avatar */}
        {comment.author.avatar ? (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.full,
              },
            ]}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>
              {/* Would use Image in real app */}
              {getInitials(comment.author.name)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.primary + '20',
                borderRadius: theme.borderRadius.full,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              {getInitials(comment.author.name)}
            </Text>
          </View>
        )}

        {/* Author info */}
        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typography.sizeSm,
                fontWeight: '600',
              }}
            >
              {comment.author.name || 'Anonymous'}
            </Text>
            {isOfficial && (
              <View
                style={[
                  styles.officialBadge,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.sm,
                    marginLeft: theme.spacing.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.textInverse,
                    fontSize: 9,
                    fontWeight: '700',
                  }}
                >
                  TEAM
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.sizeXs,
            }}
          >
            {formatDate(comment.createdAt)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text
        style={[
          styles.content,
          {
            color: theme.colors.text,
            fontSize: theme.typography.sizeMd,
            lineHeight: theme.typography.sizeMd * theme.typography.lineHeightNormal,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {comment.content}
      </Text>
    </View>
  );
}



