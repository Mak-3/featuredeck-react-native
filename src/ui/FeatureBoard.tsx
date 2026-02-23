import React, { useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme';
import { useStore, useFeatures, useIsLoading, useError, store } from '../state/store';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { FeatureCard } from './components/FeatureCard';

export function FeatureBoard() {
  const theme = useTheme();
  const features = useFeatures();
  const isLoading = useIsLoading();
  const error = useError();
  const hasMore = useStore(s => s.featuresHasMore);
  
  // Use useMemo for styles - React Compiler compatible
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    addButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    addFirstButton: {
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
  }), []);

  const handleRefresh = () => {
    store.getState().loadFeatures(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      store.getState().loadMoreFeatures();
    }
  };

  const handleAddFeature = () => {
    store.getState().openAddFeature();
  };

  const renderAddButton = () => (
    <TouchableOpacity
      onPress={handleAddFeature}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View
        style={[
          styles.addButton,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
          },
        ]}
      >
        <Text style={{ color: theme.colors.textInverse, fontSize: 20, fontWeight: '300' }}>
          +
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.sizeLg,
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizeMd,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={handleRefresh}
          >
            <Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>💡</Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.sizeLg,
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          No features yet
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizeMd,
            textAlign: 'center',
            marginBottom: 20,
            paddingHorizontal: 40,
          }}
        >
          Be the first to suggest a feature and help shape the product!
        </Text>
        <TouchableOpacity
          style={[
            styles.addFirstButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.md,
            },
          ]}
          onPress={handleAddFeature}
        >
          <Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>
            Submit Feature
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Feature Requests" rightAction={renderAddButton()} />
      
      <FilterBar />
      
      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeatureCard feature={item} />}
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
    </View>
  );
}



