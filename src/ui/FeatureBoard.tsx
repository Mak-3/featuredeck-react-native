import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { store, useError, useFeatures, useIsLoading, useRoadmapFeatures, useRoadmapLoading, useStore } from '../state/store';
import { useTheme } from '../theme';
import { NETWORK_ERROR } from '../api/client';
import { RoadmapFeatureStatus } from '../types';
import { FeatureCard } from './components/FeatureCard';

type Tab = 'features' | 'roadmap';

const ROADMAP_STATUS_ORDER: RoadmapFeatureStatus[] = ['in_progress', 'planned', 'completed', 'cancelled'];
const ROADMAP_STATUS_LABELS: Record<RoadmapFeatureStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function FeatureBoard() {
  const theme = useTheme();
  const features = useFeatures();
  const isLoading = useIsLoading();
  const error = useError();
  const hasMore = useStore(s => s.featuresHasMore);
  const roadmapFeatures = useRoadmapFeatures();
  const roadmapLoading = useRoadmapLoading();
  const [activeTab, setActiveTab] = useState<Tab>('features');

  useEffect(() => {
    if (activeTab === 'roadmap' && roadmapFeatures.length === 0) {
      store.getState().loadRoadmap();
    }
  }, [activeTab]);

  const roadmapSections = useMemo(() => {
    return ROADMAP_STATUS_ORDER
      .map(status => ({
        title: ROADMAP_STATUS_LABELS[status],
        status,
        data: roadmapFeatures.filter(f => f.status === status),
      }))
      .filter(section => section.data.length > 0);
  }, [roadmapFeatures]);

  const handleRefresh = () => {
    if (activeTab === 'features') {
      store.getState().loadFeatures(true);
    } else {
      store.getState().loadRoadmap();
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      store.getState().loadMoreFeatures();
    }
  };

  const handleAddFeature = () => {
    store.getState().openAddFeature();
  };

  const handleClose = () => {
    store.getState().close();
  };

  const renderFeatureItem = useCallback(
    ({ item }: { item: any }) => <FeatureCard feature={item} />,
    []
  );

  const isOffline = error === NETWORK_ERROR;

  const renderOfflineState = () => (
    <View style={styles.emptyContainer} accessibilityLiveRegion="polite">
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        No internet connection
      </Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20, paddingHorizontal: 40 }}>
        Check your connection and try again. You can pull down to refresh once you're back online.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
        onPress={handleRefresh}
        accessibilityRole="button"
        accessibilityLabel="Retry loading"
      >
        <Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeaturesEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (isOffline) {
      return renderOfflineState();
    }

    if (error) {
      return (
        <View style={styles.emptyContainer} accessibilityLiveRegion="assertive">
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          No features yet
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20, paddingHorizontal: 40 }}>
          Be the first to suggest a feature!
        </Text>
      </View>
    );
  };

  const renderFeaturesFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderRoadmapEmpty = () => {
    if (roadmapLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (isOffline) {
      return renderOfflineState();
    }

    if (error) {
      return (
        <View style={styles.emptyContainer} accessibilityLiveRegion="assertive">
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          No roadmap items yet
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
          Check back later for upcoming features and plans.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            paddingTop: Platform.OS === 'ios' ? 54 : 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.colors.text }]}>Features</Text>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 22, fontWeight: '300' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow} accessibilityRole="tablist">
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'features' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('features')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'features' }}
            accessibilityLabel="Features"
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'features' ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: activeTab === 'features' ? '600' : '400',
                },
              ]}
            >
              Features
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'roadmap' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('roadmap')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'roadmap' }}
            accessibilityLabel="Roadmap"
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'roadmap' ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: activeTab === 'roadmap' ? '600' : '400',
                },
              ]}
            >
              Roadmap
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Banner */}
      {activeTab === 'features' && (
        <View style={[styles.banner, { backgroundColor: theme.colors.primary + '08', borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
          <Text style={{ fontSize: 15, marginRight: 10 }}>💡</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 }}>
            Suggest and upvote features you'd love to see. Your votes help us decide what to build next.
          </Text>
        </View>
      )}

      {/* Content */}
      {activeTab === 'features' ? (
        <FlatList
          data={features}
          keyExtractor={(item) => item.id}
          renderItem={renderFeatureItem}
          contentContainerStyle={{ padding: 16, paddingTop: 12, flexGrow: 1 }}
          ListEmptyComponent={renderFeaturesEmpty}
          ListFooterComponent={renderFeaturesFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && features.length > 0}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          sections={roadmapSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text
              accessibilityRole="header"
              style={{
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: '700',
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 8,
                backgroundColor: theme.colors.background,
              }}
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View
              style={[
                styles.roadmapCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginHorizontal: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', lineHeight: 22 }}>
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 5, lineHeight: 19 }}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={renderRoadmapEmpty}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={roadmapLoading && roadmapFeatures.length > 0}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          },
        ]}
      >
        {activeTab === 'features' && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.text }]}
            onPress={handleAddFeature}
            accessibilityRole="button"
            accessibilityLabel="Add a new feature request"
          >
            <Text style={{ marginRight: 6, fontSize: 14 }} accessibilityElementsHidden>✏️</Text>
            <Text style={{ color: theme.colors.textInverse, fontSize: 15, fontWeight: '600' }}>
              Add Feature
            </Text>
          </TouchableOpacity>
        )}
        <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: activeTab === 'features' ? 12 : 0, letterSpacing: 0.3 }}>
          Powered by FeatureDeck
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    paddingBottom: 10,
    marginRight: 24,
  },
  tabText: {
    fontSize: 15,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  roadmapCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
  },
});
