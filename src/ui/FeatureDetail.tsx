import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme';
import { store, useSelectedFeature, useUser } from '../state/store';
import { useComments } from '../hooks';
import { Header } from './components/Header';
import { StatusBadge } from './components/StatusBadge';
import { UpvoteButton } from './components/UpvoteButton';
import { CommentItem } from './components/CommentItem';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function FeatureDetail() {
  const theme = useTheme();
  const feature = useSelectedFeature();
  const comments = useComments();
  const user = useUser();
  const commentsLoading = store(s => s.commentsLoading);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!feature) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Feature" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  // Check if current user is the author
  const isAuthor = user?.id === feature.author.id;

  const handleUpvote = () => {
    store.getState().toggleUpvote(feature.id);
  };

  const handleSubscribe = () => {
    store.getState().toggleSubscription(feature.id);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    const success = await store.getState().addComment(feature.id, newComment.trim());
    setSubmitting(false);
    
    if (success) {
      setNewComment('');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Feature',
      'Are you sure you want to delete this feature request? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await store.getState().deleteFeature(feature.id);
            setDeleting(false);
          },
        },
      ]
    );
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            store.getState().deleteComment(commentId);
          },
        },
      ]
    );
  };

  const renderHeaderAction = () => {
    if (!isAuthor) return null;
    
    return (
      <TouchableOpacity
        onPress={handleDelete}
        disabled={deleting}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {deleting ? (
          <ActivityIndicator size="small" color={theme.colors.error} />
        ) : (
          <Text style={{ color: theme.colors.error, fontSize: 16 }}>🗑️</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Feature" showBack rightAction={renderHeaderAction()} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ padding: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {/* Feature Card */}
          <View
            style={[
              styles.featureCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {/* Header Row */}
            <View style={styles.headerRow}>
              <UpvoteButton
                count={feature.upvotes}
                hasUpvoted={feature.hasUpvoted}
                onPress={handleUpvote}
                size="large"
              />
              <View style={[styles.headerContent, { marginLeft: theme.spacing.md }]}>
                <StatusBadge status={feature.status} />
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontSize: theme.typography.sizeXl,
                      fontFamily: theme.typography.fontFamilyBold,
                      marginTop: theme.spacing.sm,
                    },
                  ]}
                >
                  {feature.title}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text
              style={[
                styles.description,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizeMd,
                  lineHeight: theme.typography.sizeMd * theme.typography.lineHeightRelaxed,
                  marginTop: theme.spacing.md,
                },
              ]}
            >
              {feature.description}
            </Text>

            {/* Meta Info */}
            <View
              style={[
                styles.metaRow,
                {
                  marginTop: theme.spacing.lg,
                  paddingTop: theme.spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.borderLight,
                },
              ]}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizeSm }}>
                Posted by {feature.author.name || 'Anonymous'} • {formatDate(feature.createdAt)}
              </Text>
              {isAuthor && (
                <View
                  style={[
                    styles.authorBadge,
                    {
                      backgroundColor: theme.colors.primary + '15',
                      borderRadius: theme.borderRadius.sm,
                      marginLeft: theme.spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.typography.sizeXs,
                      fontWeight: '600',
                    }}
                  >
                    You
                  </Text>
                </View>
              )}
            </View>

            {/* Actions Row */}
            <View style={[styles.actionsRow, { marginTop: theme.spacing.md }]}>
              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: feature.isSubscribed
                      ? theme.colors.subscribeActive + '15'
                      : theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: feature.isSubscribed ? 1.5 : 0,
                    borderColor: feature.isSubscribed
                      ? theme.colors.subscribeActive
                      : 'transparent',
                  },
                ]}
                onPress={handleSubscribe}
              >
                <Text style={{ fontSize: 16 }}>
                  {feature.isSubscribed ? '🔔' : '🔕'}
                </Text>
                <Text
                  style={{
                    color: feature.isSubscribed
                      ? theme.colors.subscribeActive
                      : theme.colors.text,
                    fontSize: theme.typography.sizeSm,
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  {feature.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
              </TouchableOpacity>

              {/* Category */}
              {feature.category && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: feature.category.color + '20',
                      borderRadius: theme.borderRadius.sm,
                      marginLeft: theme.spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: feature.category.color,
                      fontSize: theme.typography.sizeSm,
                      fontWeight: '500',
                    }}
                  >
                    {feature.category.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Comments Section */}
          <View style={{ marginTop: theme.spacing.xl }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typography.sizeLg,
                fontWeight: '700',
                marginBottom: theme.spacing.md,
              }}
            >
              Comments ({feature.commentCount})
            </Text>

            {commentsLoading ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : comments.length === 0 ? (
              <View
                style={[
                  styles.emptyComments,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.lg,
                  },
                ]}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizeMd,
                    textAlign: 'center',
                  }}
                >
                  No comments yet. Be the first to share your thoughts!
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.commentsList,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                {comments.map((comment) => (
                  <View key={comment.id}>
                    <CommentItem comment={comment} />
                    {/* Delete button for own comments */}
                    {user?.id === comment.author.id && (
                      <TouchableOpacity
                        style={[
                          styles.deleteCommentBtn,
                          { marginBottom: theme.spacing.sm },
                        ]}
                        onPress={() => handleDeleteComment(comment.id)}
                      >
                        <Text
                          style={{
                            color: theme.colors.error,
                            fontSize: theme.typography.sizeXs,
                          }}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Spacer for input */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Comment Input */}
        {user ? (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadius.lg,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.sizeMd,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: newComment.trim()
                      ? theme.colors.primary
                      : theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.full,
                    opacity: submitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={theme.colors.textInverse} />
                ) : (
                  <Text
                    style={{
                      color: newComment.trim()
                        ? theme.colors.textInverse
                        : theme.colors.textMuted,
                      fontSize: 16,
                    }}
                  >
                    ➤
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.loginPrompt,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                padding: theme.spacing.md,
                paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.md,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizeMd,
                textAlign: 'center',
              }}
            >
              Sign in to leave a comment or vote
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  featureCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    lineHeight: 28,
  },
  description: {},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  emptyComments: {
    alignItems: 'center',
  },
  commentsList: {},
  deleteCommentBtn: {
    alignSelf: 'flex-start',
    marginLeft: 42,
    marginTop: -4,
  },
  inputContainer: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loginPrompt: {},
});
