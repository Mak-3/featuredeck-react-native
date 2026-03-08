import { get, post, del } from './client';
import { Feature, User, UserInput, RoadmapFeature } from '../types';

export async function identifyEndUser(input: UserInput): Promise<User> {
  const response = await post<User>('/end-users/identify', {
    externalUserId: input.externalUserId,
    username: input.username,
    email: input.email,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to identify user');
  }

  return response.data;
}

export interface FetchFeaturesOptions {
  endUserId?: string;
  page?: number;
  pageSize?: number;
}

export interface FetchFeaturesResponse {
  data: Feature[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function fetchFeatures(options: FetchFeaturesOptions = {}): Promise<FetchFeaturesResponse> {
  const { endUserId, page = 1, pageSize = 20 } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (endUserId) {
    params.append('endUserId', endUserId);
  }

  const response = await get<FetchFeaturesResponse>(`/features?${params.toString()}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch features');
  }

  return response.data;
}

export async function fetchFeature(featureId: string, endUserId?: string): Promise<Feature> {
  const params = endUserId ? `?endUserId=${endUserId}` : '';
  const response = await get<Feature>(`/features/${featureId}${params}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch feature');
  }

  return response.data;
}

export async function createFeature(
  title: string,
  description: string,
  user: User
): Promise<Feature> {
  const response = await post<Feature>('/features', {
    title,
    description,
    endUser: user,
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to create feature');
  }

  return response.data;
}

export async function deleteFeature(featureId: string, endUserId: string): Promise<void> {
  const response = await del(`/features/${featureId}?endUserId=${endUserId}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete feature');
  }
}

export async function toggleUpvote(
  featureId: string,
  endUserId: string
): Promise<{ upvotesCount: number; hasUpvoted: boolean }> {
  const response = await post<{ upvotesCount: number; hasUpvoted: boolean }>(
    `/features/${featureId}/vote`,
    { endUserId }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to toggle vote');
  }

  return response.data;
}

export async function fetchRoadmap(): Promise<RoadmapFeature[]> {
  const response = await get<RoadmapFeature[]>('/roadmap');

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch roadmap');
  }

  return response.data || [];
}
