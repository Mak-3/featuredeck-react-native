import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme, getStatusLabel } from '../../theme';
import { useStore, store } from '../../state/store';
import { useCategories } from '../../hooks';
import { FeatureStatus } from '../../types';

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_upvotes', label: 'Most Voted' },
] as const;

const STATUS_OPTIONS: FeatureStatus[] = [
  'under_review',
  'planned',
  'in_progress',
  'completed',
];

export function FilterBar() {
  const theme = useTheme();
  const categories = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const currentFilters = useStore(s => s.filters);
  
  const styles = useMemo(() => StyleSheet.create({
    container: {},
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      paddingHorizontal: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    filtersExpanded: {},
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
  }), []);

  const handleSortChange = (sortBy: typeof SORT_OPTIONS[number]['value']) => {
    store.getState().setFilters({ sortBy });
  };

  const handleStatusToggle = (status: FeatureStatus) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    store.getState().setFilters({ 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handleCategoryChange = (categoryId?: string) => {
    store.getState().setFilters({ category: categoryId });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Debounce search
    clearTimeout((handleSearch as any).timeout);
    (handleSearch as any).timeout = setTimeout(() => {
      store.getState().setFilters({ searchQuery: text || undefined });
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.borderRadius.md,
            marginHorizontal: theme.spacing.md,
            marginBottom: theme.spacing.sm,
          },
        ]}
      >
        <Text style={{ marginLeft: 12, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              fontSize: theme.typography.sizeMd,
            },
          ]}
          placeholder="Search features..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch('')}
            style={{ marginRight: 12 }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        {SORT_OPTIONS.map((option) => {
          const isActive = currentFilters.sortBy === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadius.full,
                  marginRight: theme.spacing.sm,
                },
              ]}
              onPress={() => handleSortChange(option.value)}
            >
              <Text
                style={{
                  color: isActive ? theme.colors.textInverse : theme.colors.text,
                  fontSize: theme.typography.sizeSm,
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Filter Toggle */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: showFilters
                ? theme.colors.primary
                : theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadius.full,
            },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ fontSize: 14 }}>⚙️</Text>
          <Text
            style={{
              color: showFilters ? theme.colors.textInverse : theme.colors.text,
              fontSize: theme.typography.sizeSm,
              marginLeft: 4,
            }}
          >
            Filters
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Expanded Filters */}
      {showFilters && (
        <View
          style={[
            styles.filtersExpanded,
            {
              backgroundColor: theme.colors.surface,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              padding: theme.spacing.md,
            },
          ]}
        >
          {/* Status Filters */}
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizeSm,
              fontWeight: '600',
              marginBottom: theme.spacing.sm,
            }}
          >
            Status
          </Text>
          <View style={styles.filterRow}>
            {STATUS_OPTIONS.map((status) => {
              const isActive = currentFilters.status?.includes(status);
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary + '20'
                        : theme.colors.backgroundSecondary,
                      borderWidth: isActive ? 1 : 0,
                      borderColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                      marginRight: theme.spacing.xs,
                      marginBottom: theme.spacing.xs,
                    },
                  ]}
                  onPress={() => handleStatusToggle(status)}
                >
                  <Text
                    style={{
                      color: isActive ? theme.colors.primary : theme.colors.text,
                      fontSize: theme.typography.sizeSm,
                    }}
                  >
                    {getStatusLabel(status)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category Filters */}
          {categories.length > 0 && (
            <>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizeSm,
                  fontWeight: '600',
                  marginTop: theme.spacing.sm,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Category
              </Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: !currentFilters.category
                        ? theme.colors.primary + '20'
                        : theme.colors.backgroundSecondary,
                      borderWidth: !currentFilters.category ? 1 : 0,
                      borderColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                      marginRight: theme.spacing.xs,
                      marginBottom: theme.spacing.xs,
                    },
                  ]}
                  onPress={() => handleCategoryChange(undefined)}
                >
                  <Text
                    style={{
                      color: !currentFilters.category
                        ? theme.colors.primary
                        : theme.colors.text,
                      fontSize: theme.typography.sizeSm,
                    }}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const isActive = currentFilters.category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isActive
                            ? cat.color + '20'
                            : theme.colors.backgroundSecondary,
                          borderWidth: isActive ? 1 : 0,
                          borderColor: cat.color,
                          borderRadius: theme.borderRadius.sm,
                          marginRight: theme.spacing.xs,
                          marginBottom: theme.spacing.xs,
                        },
                      ]}
                      onPress={() => handleCategoryChange(cat.id)}
                    >
                      <Text
                        style={{
                          color: isActive ? cat.color : theme.colors.text,
                          fontSize: theme.typography.sizeSm,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}



