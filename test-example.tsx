import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  ProdFeedback,
  ProdFeedbackProvider,
  useFeatures,
  useIsLoading,
  useError,
} from './src';

function TestContent() {
  const features = useFeatures();
  const isLoading = useIsLoading();
  const error = useError();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SDK Test App</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text>Ready: {ProdFeedback.isReady() ? 'Yes' : 'No'}</Text>
        <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
        <Text>Error: {error || 'None'}</Text>
        <Text>Features Count: {features.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Button
          title="Open Feedback Board"
          onPress={() => ProdFeedback.open()}
        />
        <View style={styles.spacer} />
        <Button
          title="Refresh Features"
          onPress={() => ProdFeedback.refresh()}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        {features.length === 0 ? (
          <Text>No features yet. Create one using the feedback board!</Text>
        ) : (
          features.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureStatus}>Status: {feature.status}</Text>
              <Text style={styles.featureUpvotes}>Upvotes: {feature.upvotes}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default function TestApp() {
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await ProdFeedback.init({
          apiKey: 'test-api-key-123',
        });
        
        ProdFeedback.setUser({
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
        });
        setInitialized(true);
        console.log('SDK initialized successfully');
      } catch (error: any) {
        console.error('Failed to initialize SDK:', error);
        setInitError(error.message);
      }
    };

    init();
  }, []);

  if (!initialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          {initError ? (
            <>
              <Text style={styles.errorText}>Initialization Failed</Text>
              <Text style={styles.errorMessage}>{initError}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" />
              <Text>Initializing SDK...</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ProdFeedbackProvider>
      <SafeAreaView style={styles.container}>
        <TestContent />
      </SafeAreaView>
    </ProdFeedbackProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  spacer: {
    height: 10,
  },
  featureCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureStatus: {
    fontSize: 14,
    color: '#666',
  },
  featureUpvotes: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

