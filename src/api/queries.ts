import { get, post, del, ApiResponse } from './client';
import { Feedback, User, FeatureFilters } from '../types';

export interface FetchFeaturesOptions {
  filters?: FeatureFilters;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export interface FetchFeaturesResponse {
  data: Feedback[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function fetchFeatures(options: FetchFeaturesOptions = {}): Promise<FetchFeaturesResponse> {
  const { filters, userId, page = 1, pageSize = 20 } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (filters?.status && filters.status.length > 0) {
    params.append('status', filters.status.join(','));
  }

  if (filters?.type && filters.type.length > 0) {
    params.append('type', filters.type.join(','));
  }

  if (filters?.searchQuery) {
    params.append('search', filters.searchQuery);
  }

  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  if (userId) {
    params.append('userId', userId);
  }

  const response = await get<FetchFeaturesResponse>(`/features?${params.toString()}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch features');
  }

  return response.data;
}

export async function fetchFeature(featureId: string, userId?: string): Promise<Feedback> {
  const params = userId ? `?userId=${userId}` : '';
  const response = await get<Feedback>(`/features/${featureId}${params}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch feature');
  }

  return response.data;
}

export async function createFeature(
  title: string,
  description: string,
  user: User,
  type: 'bug' | 'feature' | 'improvement' | 'other' = 'feature'
): Promise<Feedback> {
  const response = await post<Feedback>('/features', {
    title,
    description,
    type,
    user,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to create feature');
  }

  return response.data;
}

export async function deleteFeature(featureId: string, userId: string): Promise<void> {
  const response = await del(`/features/${featureId}?userId=${userId}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete feature');
  }
}

export async function toggleUpvote(
  featureId: string,
  userId: string
): Promise<{ upvotes: number; hasUpvoted: boolean }> {
  const response = await post<{ upvotes: number; hasUpvoted: boolean }>(
    `/features/${featureId}/upvote`,
    { userId }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to toggle upvote');
  }

  return response.data;
}

export async function fetchRoadmap() {
  const response = await get('/roadmap');

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch roadmap');
  }

  return response.data || [];
}

export async function fetchChangelog() {
  const response = await get('/changelog');

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch changelog');
  }

  return response.data || [];
}

