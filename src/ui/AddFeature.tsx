import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme';
import { store, useIsLoading, useError } from '../state/store';
import { useCategories } from '../hooks';
import { Header } from './components/Header';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export function AddFeature() {
  const theme = useTheme();
  const categories = useCategories();
  const isLoading = useIsLoading();
  const error = useError();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [touched, setTouched] = useState({ title: false, description: false });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    errorBanner: {},
    inputGroup: {},
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    input: {
      height: 50,
    },
    textArea: {
      minHeight: 140,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    categoryChip: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    tipsCard: {},
    tipsList: {
      marginTop: 4,
    },
    tipItem: {
      fontSize: 14,
      lineHeight: 22,
    },
    bottomBar: {},
    submitButton: {
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), []);

  const titleError = touched.title && title.trim().length < 5 
    ? 'Title must be at least 5 characters' 
    : null;
  const descriptionError = touched.description && description.trim().length < 20 
    ? 'Description must be at least 20 characters' 
    : null;
  
  const isValid = 
    title.trim().length >= 5 && 
    description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    
    const success = await store.getState().createFeature(
      title.trim(),
      description.trim(),
      selectedCategory
    );
    
    if (success) {
      // Will navigate back automatically via store
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="Submit Feature" 
          showBack 
          rightAction={
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text
                  style={{
                    color: isValid ? theme.colors.primary : theme.colors.textMuted,
                    fontSize: theme.typography.sizeMd,
                    fontWeight: '600',
                  }}
                >
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ padding: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Message */}
          {error && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme.colors.error + '15',
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              <Text style={{ color: theme.colors.error, fontSize: theme.typography.sizeSm }}>
                {error}
              </Text>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  fontWeight: '600',
                }}
              >
                Title
              </Text>
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.sizeSm,
                }}
              >
                {title.length}/{MAX_TITLE_LENGTH}
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: titleError ? 1.5 : 1,
                  borderColor: titleError ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  padding: theme.spacing.md,
                  marginTop: theme.spacing.sm,
                },
              ]}
              placeholder="What feature would you like to see?"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={(text) => setTitle(text.slice(0, MAX_TITLE_LENGTH))}
              onBlur={() => setTouched(t => ({ ...t, title: true }))}
              maxLength={MAX_TITLE_LENGTH}
            />
            {titleError && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.typography.sizeSm,
                  marginTop: theme.spacing.xs,
                }}
              >
                {titleError}
              </Text>
            )}
          </View>

          {/* Description Input */}
          <View style={[styles.inputGroup, { marginTop: theme.spacing.lg }]}>
            <View style={styles.labelRow}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  fontWeight: '600',
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.sizeSm,
                }}
              >
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: descriptionError ? 1.5 : 1,
                  borderColor: descriptionError ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  padding: theme.spacing.md,
                  marginTop: theme.spacing.sm,
                },
              ]}
              placeholder="Describe the feature in detail. What problem does it solve? How would it work?"
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={(text) => setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))}
              onBlur={() => setTouched(t => ({ ...t, description: true }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            {descriptionError && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.typography.sizeSm,
                  marginTop: theme.spacing.xs,
                }}
              >
                {descriptionError}
              </Text>
            )}
          </View>

          {/* Category Selection */}
          {categories.length > 0 && (
            <View style={[styles.inputGroup, { marginTop: theme.spacing.lg }]}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  fontWeight: '600',
                  marginBottom: theme.spacing.sm,
                }}
              >
                Category (optional)
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected
                            ? cat.color + '20'
                            : theme.colors.surface,
                          borderRadius: theme.borderRadius.md,
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? cat.color : theme.colors.border,
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm,
                        },
                      ]}
                      onPress={() => setSelectedCategory(
                        isSelected ? undefined : cat.id
                      )}
                    >
                      <Text
                        style={{
                          color: isSelected ? cat.color : theme.colors.text,
                          fontSize: theme.typography.sizeSm,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Tips Section */}
          <View
            style={[
              styles.tipsCard,
              {
                backgroundColor: theme.colors.info + '10',
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginTop: theme.spacing.xl,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.info,
                fontSize: theme.typography.sizeMd,
                fontWeight: '600',
                marginBottom: theme.spacing.sm,
              }}
            >
              💡 Tips for a great feature request
            </Text>
            <View style={styles.tipsList}>
              <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                • Be specific about what you want
              </Text>
              <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                • Explain the problem it solves
              </Text>
              <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                • Describe how it would benefit others
              </Text>
              <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                • Search for existing requests first
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Submit Button (for mobile) */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              padding: theme.spacing.md,
              paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isValid ? theme.colors.primary : theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.md,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.textInverse} />
            ) : (
              <Text
                style={{
                  color: isValid ? theme.colors.textInverse : theme.colors.textMuted,
                  fontSize: theme.typography.sizeMd,
                  fontWeight: '600',
                }}
              >
                Submit Feature Request
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}



