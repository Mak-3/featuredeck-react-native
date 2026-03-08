import { create } from 'zustand';
import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, Modal, View, StatusBar, Text, TouchableOpacity, Platform, FlatList, RefreshControl, SectionList, KeyboardAvoidingView, ScrollView, TextInput, ActivityIndicator, Animated, Alert } from 'react-native';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/state/store.ts
var defaultColors = {
  // Base - Deep indigo primary
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  // Backgrounds
  background: "#FAFBFC",
  backgroundSecondary: "#F1F5F9",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  // Text
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",
  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  // Feature status
  statusOpen: "#3B82F6",
  statusUnderReview: "#8B5CF6",
  statusPlanned: "#3B82F6",
  statusInProgress: "#F59E0B",
  statusCompleted: "#10B981",
  statusDeclined: "#6B7280",
  // UI
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  shadow: "rgba(15, 23, 42, 0.08)",
  overlay: "rgba(15, 23, 42, 0.5)",
  // Interactive
  upvote: "#94A3B8",
  upvoteActive: "#6366F1"
};
var darkColors = {
  // Base
  primary: "#818CF8",
  primaryLight: "#A5B4FC",
  primaryDark: "#6366F1",
  // Backgrounds
  background: "#0F172A",
  backgroundSecondary: "#1E293B",
  surface: "#1E293B",
  surfaceElevated: "#334155",
  // Text
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#64748B",
  textInverse: "#0F172A",
  // Status
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  // Feature status
  statusOpen: "#60A5FA",
  statusUnderReview: "#A78BFA",
  statusPlanned: "#60A5FA",
  statusInProgress: "#FBBF24",
  statusCompleted: "#34D399",
  statusDeclined: "#9CA3AF",
  // UI
  border: "#334155",
  borderLight: "#1E293B",
  shadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.7)",
  // Interactive
  upvote: "#64748B",
  upvoteActive: "#818CF8"
};
var defaultSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
var defaultTypography = {
  fontFamily: "System",
  fontFamilyBold: "System",
  sizeXs: 11,
  sizeSm: 13,
  sizeMd: 15,
  sizeLg: 18,
  sizeXl: 22,
  sizeXxl: 28,
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75
};
var defaultBorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999
};
var lightTheme = {
  colors: defaultColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  isDark: false
};
var darkTheme = {
  colors: darkColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  isDark: true
};
var ThemeContext = createContext(lightTheme);
var useTheme = () => useContext(ThemeContext);
var ThemeProvider = ThemeContext.Provider;
function mergeTheme(baseTheme, customTheme) {
  var _a;
  if (!customTheme) return baseTheme;
  return {
    colors: { ...baseTheme.colors, ...customTheme.colors },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    typography: { ...baseTheme.typography, ...customTheme.typography },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
    isDark: (_a = customTheme.isDark) != null ? _a : baseTheme.isDark
  };
}
function getStatusColor(status, colors) {
  const statusColorMap = {
    open: colors.statusOpen,
    under_review: colors.statusUnderReview,
    planned: colors.statusPlanned,
    in_progress: colors.statusInProgress,
    completed: colors.statusCompleted,
    declined: colors.statusDeclined
  };
  return statusColorMap[status] || colors.textMuted;
}
function getStatusLabel(status) {
  const statusLabelMap = {
    open: "Open",
    under_review: "Under Review",
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    declined: "Declined"
  };
  return statusLabelMap[status] || status;
}
function createThemeFromColor(primaryColor, isDark = false) {
  return {
    colors: {
      ...isDark ? darkColors : defaultColors,
      primary: primaryColor
    },
    isDark
  };
}

// src/config.ts
var API_BASE_URL = "https://www.featuredeck.in/api";

// src/api/client.ts
var apiKey = null;
function setApiKey(key) {
  apiKey = key;
}
function getApiKey() {
  if (!apiKey) {
    throw new Error("[FeaturedDeck] API key not set. Call FeaturedDeck.init() first.");
  }
  return apiKey;
}
async function request(endpoint, options = {}) {
  const key = getApiKey();
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        ...options.headers
      }
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        data: null,
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      };
    }
    return {
      data: data.data || data,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error.message || "Network error"
    };
  }
}
async function get(endpoint) {
  return request(endpoint, { method: "GET" });
}
async function post(endpoint, body) {
  return request(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : void 0
  });
}
async function del(endpoint) {
  return request(endpoint, { method: "DELETE" });
}

// src/api/queries.ts
async function identifyEndUser(input) {
  const response = await post("/end-users/identify", {
    externalUserId: input.externalUserId,
    username: input.username,
    email: input.email
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to identify user");
  }
  return response.data;
}
async function fetchFeatures(options = {}) {
  const { endUserId, page = 1, pageSize = 20 } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (endUserId) {
    params.append("endUserId", endUserId);
  }
  const response = await get(`/features?${params.toString()}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to fetch features");
  }
  return response.data;
}
async function createFeature(title, description, user) {
  const response = await post("/features", {
    title,
    description,
    endUser: user
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to create feature");
  }
  return response.data;
}
async function deleteFeature(featureId, endUserId) {
  const response = await del(`/features/${featureId}?endUserId=${endUserId}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete feature");
  }
}
async function toggleUpvote(featureId, endUserId) {
  const response = await post(
    `/features/${featureId}/vote`,
    { endUserId }
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to toggle vote");
  }
  return response.data;
}
async function fetchRoadmap() {
  const response = await get("/roadmap");
  if (!response.success) {
    throw new Error(response.error || "Failed to fetch roadmap");
  }
  return response.data || [];
}

// src/state/store.ts
var pendingVotes = /* @__PURE__ */ new Set();
function mergePreservingPendingVotes(incoming, current) {
  if (pendingVotes.size === 0) return incoming;
  const currentMap = new Map(current.map((f) => [f.id, f]));
  return incoming.map((f) => {
    if (pendingVotes.has(f.id)) {
      const local = currentMap.get(f.id);
      if (local) {
        return { ...f, upvotesCount: local.upvotesCount, hasUpvoted: local.hasUpvoted };
      }
    }
    return f;
  });
}
var store = create((set, get2) => ({
  apiKey: null,
  user: null,
  ready: false,
  theme: lightTheme,
  visible: false,
  viewState: { type: "board" },
  isLoading: false,
  error: null,
  features: [],
  featuresTotal: 0,
  featuresPage: 1,
  featuresHasMore: false,
  roadmapFeatures: [],
  roadmapLoading: false,
  init: async (options) => {
    const { apiKey: apiKey2, theme } = options;
    try {
      setApiKey(apiKey2);
      const currentTheme = get2().theme;
      const mergedTheme = theme ? mergeTheme(currentTheme, theme) : currentTheme;
      set({
        apiKey: apiKey2,
        theme: mergedTheme,
        ready: true
      });
      console.log("[FeaturedDeck] SDK initialized");
    } catch (error) {
      console.error("[FeaturedDeck] Failed to initialize:", error);
      set({ error: error.message || "Failed to initialize SDK" });
    }
  },
  setUser: async (input) => {
    if (!input) {
      set({ user: null });
      return;
    }
    try {
      const resolved = await identifyEndUser(input);
      set({ user: resolved });
    } catch (e) {
      console.warn("[FeaturedDeck] Failed to identify user, storing locally:", e.message);
      set({
        user: {
          id: input.externalUserId,
          ...input
        }
      });
    }
  },
  setTheme: (theme) => {
    const currentTheme = get2().theme;
    if (theme.isDark !== void 0 && theme.isDark !== currentTheme.isDark) {
      const baseTheme = theme.isDark ? darkTheme : lightTheme;
      set({ theme: mergeTheme(baseTheme, theme) });
    } else {
      set({ theme: mergeTheme(currentTheme, theme) });
    }
  },
  open: () => {
    set({ visible: true, viewState: { type: "board" }, error: null });
    get2().loadFeatures(true);
  },
  close: () => {
    set({
      visible: false,
      viewState: { type: "board" },
      error: null
    });
  },
  navigateTo: (view) => {
    set({ viewState: view, error: null });
  },
  openAddFeature: () => {
    set({ viewState: { type: "add-feature" }, error: null });
  },
  goBack: () => {
    const { viewState } = get2();
    if (viewState.type === "add-feature") {
      set({
        viewState: { type: "board" },
        error: null
      });
    } else {
      get2().close();
    }
  },
  loadFeatures: async (refresh = false) => {
    const { user } = get2();
    set({ isLoading: true, error: null });
    try {
      const result = await fetchFeatures({
        endUserId: user == null ? void 0 : user.id,
        page: 1,
        pageSize: 20
      });
      const merged = mergePreservingPendingVotes(result.data, get2().features);
      set({
        features: merged,
        featuresTotal: result.total,
        featuresPage: 1,
        featuresHasMore: result.hasMore,
        isLoading: false
      });
    } catch (e) {
      set({
        error: e.message || "Failed to load features",
        isLoading: false
      });
    }
  },
  loadMoreFeatures: async () => {
    const { featuresPage, featuresHasMore, features, user } = get2();
    if (!featuresHasMore) return;
    const nextPage = featuresPage + 1;
    try {
      const result = await fetchFeatures({
        endUserId: user == null ? void 0 : user.id,
        page: nextPage,
        pageSize: 20
      });
      set({
        features: [...features, ...result.data],
        featuresPage: nextPage,
        featuresHasMore: result.hasMore
      });
    } catch (e) {
    }
  },
  createFeature: async (title, description) => {
    const { user } = get2();
    if (!user) {
      set({ error: "User must be set to create feedback. Call FeaturedDeck.setUser() first." });
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const newFeature = await createFeature(title, description, user);
      const features = [newFeature, ...get2().features];
      set({
        features,
        featuresTotal: get2().featuresTotal + 1,
        isLoading: false,
        viewState: { type: "board" }
      });
      return true;
    } catch (e) {
      set({
        error: e.message || "Failed to create feedback",
        isLoading: false
      });
      return false;
    }
  },
  deleteFeature: async (featureId) => {
    const { user, features } = get2();
    if (!user) {
      set({ error: "User must be set to delete a feature. Call FeaturedDeck.setUser() first." });
      return false;
    }
    try {
      await deleteFeature(featureId, user.id);
      set({
        features: features.filter((f) => f.id !== featureId),
        featuresTotal: get2().featuresTotal - 1
      });
      return true;
    } catch (e) {
      set({ error: e.message || "Failed to delete feature" });
      return false;
    }
  },
  toggleUpvote: async (featureId) => {
    const { features, user } = get2();
    if (!user) {
      set({ error: "User must be set to vote. Call FeaturedDeck.setUser() first." });
      return;
    }
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;
    const willUpvote = !feature.hasUpvoted;
    const optimistic = (f) => ({
      ...f,
      hasUpvoted: willUpvote,
      upvotesCount: willUpvote ? f.upvotesCount + 1 : f.upvotesCount - 1
    });
    pendingVotes.add(featureId);
    set({
      features: features.map((f) => f.id === featureId ? optimistic(f) : f)
    });
    try {
      const result = await toggleUpvote(featureId, user.id);
      pendingVotes.delete(featureId);
      const serverUpdate = (f) => ({
        ...f,
        upvotesCount: result.upvotesCount,
        hasUpvoted: result.hasUpvoted
      });
      set({
        features: get2().features.map(
          (f) => f.id === featureId ? serverUpdate(f) : f
        )
      });
    } catch (e) {
      pendingVotes.delete(featureId);
      const revert = (f) => ({
        ...f,
        hasUpvoted: !willUpvote,
        upvotesCount: willUpvote ? f.upvotesCount - 1 : f.upvotesCount + 1
      });
      set({
        features: get2().features.map((f) => f.id === featureId ? revert(f) : f)
      });
    }
  },
  loadRoadmap: async () => {
    set({ roadmapLoading: true, error: null });
    try {
      const features = await fetchRoadmap();
      set({ roadmapFeatures: features, roadmapLoading: false });
    } catch (e) {
      set({
        error: e.message || "Failed to load roadmap",
        roadmapLoading: false
      });
    }
  }
}));
var useStore = store;
var useFeatures = () => store((s) => s.features);
var useThemeStore = () => store((s) => s.theme);
var useIsLoading = () => store((s) => s.isLoading);
var useError = () => store((s) => s.error);
var useVisible = () => store((s) => s.visible);
var useViewState = () => store((s) => s.viewState);
var useUser = () => store((s) => s.user);
var useRoadmapFeatures = () => store((s) => s.roadmapFeatures);
var useRoadmapLoading = () => store((s) => s.roadmapLoading);

// src/core/FeaturedDeck.ts
var FeaturedDeckSDK = class {
  async init(config) {
    if (!config.apiKey) {
      console.error("[FeaturedDeck] API key is required");
      return;
    }
    await store.getState().init({
      apiKey: config.apiKey,
      theme: config.theme
    });
  }
  isReady() {
    return store.getState().ready;
  }
  openFeatureBoard() {
    if (!this.isReady()) {
      console.warn("[FeaturedDeck] SDK not initialized. Call init() first.");
      return;
    }
    store.getState().open();
  }
  close() {
    store.getState().close();
  }
  async setUser(user) {
    await store.getState().setUser(user);
  }
  getUser() {
    return store.getState().user;
  }
  setTheme(theme) {
    store.getState().setTheme(theme);
  }
  enableDarkMode() {
    store.getState().setTheme({ isDark: true });
  }
  enableLightMode() {
    store.getState().setTheme({ isDark: false });
  }
  isVisible() {
    return store.getState().visible;
  }
};
var FeaturedDeck = new FeaturedDeckSDK();
function StatusBadge({ status, size = "medium" }) {
  const theme = useTheme();
  const color = getStatusColor(status, theme.colors);
  const label = getStatusLabel(status);
  const styles3 = useMemo(() => StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start"
    },
    dot: {
      borderRadius: 100
    },
    label: {
      fontWeight: "600"
    }
  }), []);
  const isSmall = size === "small";
  return /* @__PURE__ */ jsxs(
    View,
    {
      style: [
        styles3.badge,
        {
          backgroundColor: color + "18",
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
          borderRadius: theme.borderRadius.full
        }
      ],
      children: [
        /* @__PURE__ */ jsx(
          View,
          {
            style: [
              styles3.dot,
              {
                backgroundColor: color,
                width: isSmall ? 6 : 8,
                height: isSmall ? 6 : 8,
                marginRight: isSmall ? 4 : 6
              }
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Text,
          {
            style: [
              styles3.label,
              {
                color,
                fontSize: isSmall ? theme.typography.sizeXs : theme.typography.sizeSm,
                fontFamily: theme.typography.fontFamily
              }
            ],
            children: label
          }
        )
      ]
    }
  );
}
function formatCount(count) {
  if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + "M";
  }
  if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + "K";
  }
  return String(count);
}
function UpvoteButton({
  count,
  hasUpvoted,
  onPress,
  size = "medium"
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles3 = useMemo(() => StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8
    },
    arrow: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftColor: "transparent",
      borderRightColor: "transparent"
    },
    count: {
      fontWeight: "700"
    }
  }), []);
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 3
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3
      })
    ]).start();
    onPress();
  };
  const sizeConfig = {
    small: { width: 44, height: 52, iconSize: 12, textSize: theme.typography.sizeSm },
    medium: { width: 52, height: 62, iconSize: 14, textSize: theme.typography.sizeMd },
    large: { width: 60, height: 72, iconSize: 16, textSize: theme.typography.sizeLg }
  };
  const config = sizeConfig[size];
  const activeColor = hasUpvoted ? theme.colors.upvoteActive : theme.colors.upvote;
  const bgColor = hasUpvoted ? theme.colors.upvoteActive + "15" : theme.colors.backgroundSecondary;
  return /* @__PURE__ */ jsx(
    TouchableOpacity,
    {
      onPress: handlePress,
      activeOpacity: 0.7,
      children: /* @__PURE__ */ jsxs(
        Animated.View,
        {
          style: [
            styles3.container,
            {
              width: config.width,
              height: config.height,
              backgroundColor: bgColor,
              borderRadius: theme.borderRadius.md,
              borderWidth: hasUpvoted ? 1.5 : 0,
              borderColor: hasUpvoted ? theme.colors.upvoteActive : "transparent",
              transform: [{ scale: scaleAnim }]
            }
          ],
          children: [
            /* @__PURE__ */ jsx(
              View,
              {
                style: [
                  styles3.arrow,
                  {
                    borderLeftWidth: config.iconSize * 0.6,
                    borderRightWidth: config.iconSize * 0.6,
                    borderBottomWidth: config.iconSize,
                    borderBottomColor: activeColor
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Text,
              {
                style: [
                  styles3.count,
                  {
                    color: activeColor,
                    fontSize: config.textSize,
                    fontFamily: theme.typography.fontFamilyBold,
                    marginTop: theme.spacing.xs
                  }
                ],
                children: formatCount(count)
              }
            )
          ]
        }
      )
    }
  );
}
function FeatureCard({ feature }) {
  const theme = useTheme();
  const user = useUser();
  const isAuthor = !!user && !!feature.createdByEndUserId && user.id === feature.createdByEndUserId;
  const handleUpvote = () => {
    store.getState().toggleUpvote(feature.id);
  };
  const handleDelete = () => {
    Alert.alert(
      "Delete Feature",
      "Are you sure you want to delete this feature request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => store.getState().deleteFeature(feature.id)
        }
      ]
    );
  };
  return /* @__PURE__ */ jsx(
    View,
    {
      style: [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: theme.colors.border
        }
      ],
      children: /* @__PURE__ */ jsxs(View, { style: styles.row, children: [
        /* @__PURE__ */ jsx(
          UpvoteButton,
          {
            count: feature.upvotesCount,
            hasUpvoted: feature.hasUpvoted,
            onPress: handleUpvote,
            size: "small"
          }
        ),
        /* @__PURE__ */ jsxs(View, { style: { flex: 1, marginLeft: 14 }, children: [
          /* @__PURE__ */ jsx(
            Text,
            {
              style: {
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: "600",
                lineHeight: 22
              },
              numberOfLines: 2,
              children: feature.title
            }
          ),
          feature.description && /* @__PURE__ */ jsx(
            Text,
            {
              style: {
                color: theme.colors.textSecondary,
                fontSize: 13,
                marginTop: 4,
                lineHeight: 19
              },
              numberOfLines: 2,
              children: feature.description
            }
          ),
          /* @__PURE__ */ jsxs(View, { style: styles.footer, children: [
            /* @__PURE__ */ jsx(StatusBadge, { status: feature.status, size: "small" }),
            isAuthor && /* @__PURE__ */ jsx(
              TouchableOpacity,
              {
                onPress: handleDelete,
                hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
                style: [
                  styles.deleteButton,
                  {
                    backgroundColor: theme.colors.error + "12",
                    borderRadius: 6
                  }
                ],
                children: /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.error, fontSize: 12, fontWeight: "500" }, children: "Delete" })
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
var styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  row: {
    flexDirection: "row"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4
  }
});
var ROADMAP_STATUS_ORDER = ["in_progress", "planned", "completed", "cancelled"];
var ROADMAP_STATUS_LABELS = {
  planned: "\u{1F4CB} Planned",
  in_progress: "\u{1F6A7} In Progress",
  completed: "\u2705 Completed",
  cancelled: "\u274C Cancelled"
};
function FeatureBoard() {
  const theme = useTheme();
  const features = useFeatures();
  const isLoading = useIsLoading();
  const error = useError();
  const hasMore = useStore((s) => s.featuresHasMore);
  const roadmapFeatures = useRoadmapFeatures();
  const roadmapLoading = useRoadmapLoading();
  const [activeTab, setActiveTab] = useState("features");
  useEffect(() => {
    if (activeTab === "roadmap" && roadmapFeatures.length === 0) {
      store.getState().loadRoadmap();
    }
  }, [activeTab]);
  const roadmapSections = useMemo(() => {
    return ROADMAP_STATUS_ORDER.map((status) => ({
      title: ROADMAP_STATUS_LABELS[status],
      status,
      data: roadmapFeatures.filter((f) => f.status === status)
    })).filter((section) => section.data.length > 0);
  }, [roadmapFeatures]);
  const handleRefresh = () => {
    if (activeTab === "features") {
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
  const renderFeaturesEmpty = () => {
    if (isLoading) {
      return /* @__PURE__ */ jsx(View, { style: styles2.emptyContainer, children: /* @__PURE__ */ jsx(ActivityIndicator, { size: "large", color: theme.colors.primary }) });
    }
    if (error) {
      return /* @__PURE__ */ jsxs(View, { style: styles2.emptyContainer, children: [
        /* @__PURE__ */ jsx(Text, { style: { fontSize: 48, marginBottom: 16 }, children: "\u{1F615}" }),
        /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8 }, children: "Something went wrong" }),
        /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: 20 }, children: error }),
        /* @__PURE__ */ jsx(
          TouchableOpacity,
          {
            style: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
            onPress: handleRefresh,
            children: /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textInverse, fontWeight: "600" }, children: "Try Again" })
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs(View, { style: styles2.emptyContainer, children: [
      /* @__PURE__ */ jsx(Text, { style: { fontSize: 64, marginBottom: 16 }, children: "\u{1F4A1}" }),
      /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8 }, children: "No features yet" }),
      /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: 20, paddingHorizontal: 40 }, children: "Be the first to suggest a feature!" })
    ] });
  };
  const renderFeaturesFooter = () => {
    if (!hasMore) return null;
    return /* @__PURE__ */ jsx(View, { style: { paddingVertical: 20 }, children: /* @__PURE__ */ jsx(ActivityIndicator, { size: "small", color: theme.colors.primary }) });
  };
  const renderRoadmapEmpty = () => {
    if (roadmapLoading) {
      return /* @__PURE__ */ jsx(View, { style: styles2.emptyContainer, children: /* @__PURE__ */ jsx(ActivityIndicator, { size: "large", color: theme.colors.primary }) });
    }
    return /* @__PURE__ */ jsxs(View, { style: styles2.emptyContainer, children: [
      /* @__PURE__ */ jsx(Text, { style: { fontSize: 48, marginBottom: 12 }, children: "\u{1F5FA}\uFE0F" }),
      /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8 }, children: "No roadmap items yet" }),
      /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", paddingHorizontal: 40 }, children: "Check back later for upcoming features and plans." })
    ] });
  };
  return /* @__PURE__ */ jsxs(View, { style: [styles2.container, { backgroundColor: theme.colors.background }], children: [
    /* @__PURE__ */ jsxs(
      View,
      {
        style: [
          styles2.header,
          {
            backgroundColor: theme.colors.surface,
            paddingTop: Platform.OS === "ios" ? 54 : 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          }
        ],
        children: [
          /* @__PURE__ */ jsxs(View, { style: styles2.headerRow, children: [
            /* @__PURE__ */ jsx(Text, { style: [styles2.headerTitle, { color: theme.colors.text }], children: "Features" }),
            /* @__PURE__ */ jsx(TouchableOpacity, { onPress: handleClose, hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, children: /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textSecondary, fontSize: 22, fontWeight: "300" }, children: "\u2715" }) })
          ] }),
          /* @__PURE__ */ jsxs(View, { style: styles2.tabRow, children: [
            /* @__PURE__ */ jsx(
              TouchableOpacity,
              {
                style: [
                  styles2.tab,
                  activeTab === "features" && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary }
                ],
                onPress: () => setActiveTab("features"),
                children: /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: [
                      styles2.tabText,
                      {
                        color: activeTab === "features" ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: activeTab === "features" ? "600" : "400"
                      }
                    ],
                    children: "Features"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              TouchableOpacity,
              {
                style: [
                  styles2.tab,
                  activeTab === "roadmap" && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary }
                ],
                onPress: () => setActiveTab("roadmap"),
                children: /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: [
                      styles2.tabText,
                      {
                        color: activeTab === "roadmap" ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: activeTab === "roadmap" ? "600" : "400"
                      }
                    ],
                    children: "Roadmap"
                  }
                )
              }
            )
          ] })
        ]
      }
    ),
    activeTab === "features" && /* @__PURE__ */ jsxs(View, { style: [styles2.banner, { backgroundColor: theme.colors.primary + "08", borderBottomWidth: 1, borderBottomColor: theme.colors.border }], children: [
      /* @__PURE__ */ jsx(Text, { style: { fontSize: 15, marginRight: 10 }, children: "\u{1F4A1}" }),
      /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 }, children: "Suggest and upvote features you'd love to see. Your votes help us decide what to build next." })
    ] }),
    activeTab === "features" ? /* @__PURE__ */ jsx(
      FlatList,
      {
        data: features,
        keyExtractor: (item) => item.id,
        renderItem: ({ item }) => /* @__PURE__ */ jsx(FeatureCard, { feature: item }),
        contentContainerStyle: { padding: 16, paddingTop: 12, flexGrow: 1 },
        ListEmptyComponent: renderFeaturesEmpty,
        ListFooterComponent: renderFeaturesFooter,
        onEndReached: handleLoadMore,
        onEndReachedThreshold: 0.3,
        refreshControl: /* @__PURE__ */ jsx(
          RefreshControl,
          {
            refreshing: isLoading && features.length > 0,
            onRefresh: handleRefresh,
            tintColor: theme.colors.primary,
            colors: [theme.colors.primary]
          }
        ),
        showsVerticalScrollIndicator: false
      }
    ) : /* @__PURE__ */ jsx(
      SectionList,
      {
        sections: roadmapSections,
        keyExtractor: (item) => item.id,
        renderSectionHeader: ({ section }) => /* @__PURE__ */ jsx(
          Text,
          {
            style: {
              color: theme.colors.text,
              fontSize: 15,
              fontWeight: "700",
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 8,
              backgroundColor: theme.colors.background
            },
            children: section.title
          }
        ),
        renderItem: ({ item }) => /* @__PURE__ */ jsxs(
          View,
          {
            style: [
              styles2.roadmapCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: theme.colors.border
              }
            ],
            children: [
              /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.text, fontSize: 15, fontWeight: "600", lineHeight: 22 }, children: item.title }),
              item.description && /* @__PURE__ */ jsx(
                Text,
                {
                  style: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 5, lineHeight: 19 },
                  numberOfLines: 3,
                  children: item.description
                }
              )
            ]
          }
        ),
        ListEmptyComponent: renderRoadmapEmpty,
        contentContainerStyle: { flexGrow: 1, paddingBottom: 24 },
        showsVerticalScrollIndicator: false,
        refreshControl: /* @__PURE__ */ jsx(
          RefreshControl,
          {
            refreshing: roadmapLoading && roadmapFeatures.length > 0,
            onRefresh: handleRefresh,
            tintColor: theme.colors.primary,
            colors: [theme.colors.primary]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      View,
      {
        style: [
          styles2.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.OS === "ios" ? 28 : 12
          }
        ],
        children: [
          activeTab === "features" && /* @__PURE__ */ jsxs(
            TouchableOpacity,
            {
              style: [styles2.addButton, { backgroundColor: theme.colors.text }],
              onPress: handleAddFeature,
              children: [
                /* @__PURE__ */ jsx(Text, { style: { marginRight: 6, fontSize: 14 }, children: "\u270F\uFE0F" }),
                /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textInverse, fontSize: 15, fontWeight: "600" }, children: "Add Feature" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.textMuted, fontSize: 11, textAlign: "center", marginTop: activeTab === "features" ? 12 : 0, letterSpacing: 0.3 }, children: "Powered by FeaturedDeck" })
        ]
      }
    )
  ] });
}
var styles2 = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700"
  },
  tabRow: {
    flexDirection: "row"
  },
  tab: {
    paddingBottom: 10,
    marginRight: 24
  },
  tabText: {
    fontSize: 15
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  roadmapCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 10
  }
});
function Header({ title, showBack = false, rightAction }) {
  const theme = useTheme();
  useViewState();
  const styles3 = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    leftButton: {
      width: 40,
      height: 40,
      alignItems: "flex-start",
      justifyContent: "center"
    },
    backIcon: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center"
    },
    chevron: {
      width: 10,
      height: 10,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      transform: [{ rotate: "45deg" }],
      marginLeft: 4
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontWeight: "700"
    },
    rightButton: {
      width: 40,
      height: 40,
      alignItems: "flex-end",
      justifyContent: "center"
    }
  }), []);
  const handleBack = () => {
    store.getState().goBack();
  };
  const handleClose = () => {
    store.getState().close();
  };
  return /* @__PURE__ */ jsxs(
    View,
    {
      style: [
        styles3.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingTop: Platform.OS === "ios" ? 50 : theme.spacing.md,
          paddingBottom: theme.spacing.md
        }
      ],
      children: [
        /* @__PURE__ */ jsx(
          TouchableOpacity,
          {
            style: styles3.leftButton,
            onPress: showBack ? handleBack : handleClose,
            hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
            children: showBack ? /* @__PURE__ */ jsx(View, { style: styles3.backIcon, children: /* @__PURE__ */ jsx(
              View,
              {
                style: [
                  styles3.chevron,
                  {
                    borderColor: theme.colors.text
                  }
                ]
              }
            ) }) : /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.text, fontSize: 24, fontWeight: "300" }, children: "\u2715" })
          }
        ),
        /* @__PURE__ */ jsx(
          Text,
          {
            style: [
              styles3.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.sizeLg,
                fontFamily: theme.typography.fontFamilyBold
              }
            ],
            numberOfLines: 1,
            children: title
          }
        ),
        /* @__PURE__ */ jsx(View, { style: styles3.rightButton, children: rightAction })
      ]
    }
  );
}
var MAX_TITLE_LENGTH = 100;
var MAX_DESCRIPTION_LENGTH = 2e3;
function AddFeature() {
  const theme = useTheme();
  const isLoading = useIsLoading();
  const error = useError();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState({ title: false, description: false });
  const styles3 = useMemo(() => StyleSheet.create({
    container: {
      flex: 1
    },
    scrollView: {
      flex: 1
    },
    errorBanner: {},
    inputGroup: {},
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    input: {
      height: 50
    },
    textArea: {
      minHeight: 140
    },
    tipsCard: {},
    tipsList: {
      marginTop: 4
    },
    tipItem: {
      fontSize: 14,
      lineHeight: 22
    },
    bottomBar: {},
    submitButton: {
      height: 52,
      alignItems: "center",
      justifyContent: "center"
    }
  }), []);
  const titleError = touched.title && title.trim().length < 5 ? "Title must be at least 5 characters" : null;
  const descriptionError = touched.description && description.trim().length < 20 ? "Description must be at least 20 characters" : null;
  const isValid = title.trim().length >= 5 && description.trim().length >= 20;
  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await store.getState().createFeature(
      title.trim(),
      description.trim()
    );
  };
  return /* @__PURE__ */ jsx(
    KeyboardAvoidingView,
    {
      style: { flex: 1 },
      behavior: Platform.OS === "ios" ? "padding" : void 0,
      children: /* @__PURE__ */ jsxs(View, { style: [styles3.container, { backgroundColor: theme.colors.background }], children: [
        /* @__PURE__ */ jsx(
          Header,
          {
            title: "Submit Feature",
            showBack: true
          }
        ),
        /* @__PURE__ */ jsxs(
          ScrollView,
          {
            style: styles3.scrollView,
            contentContainerStyle: { padding: theme.spacing.md },
            showsVerticalScrollIndicator: false,
            keyboardShouldPersistTaps: "handled",
            children: [
              error && /* @__PURE__ */ jsx(
                View,
                {
                  style: [
                    styles3.errorBanner,
                    {
                      backgroundColor: theme.colors.error + "15",
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.md
                    }
                  ],
                  children: /* @__PURE__ */ jsx(Text, { style: { color: theme.colors.error, fontSize: theme.typography.sizeSm }, children: error })
                }
              ),
              /* @__PURE__ */ jsxs(View, { style: styles3.inputGroup, children: [
                /* @__PURE__ */ jsxs(View, { style: styles3.labelRow, children: [
                  /* @__PURE__ */ jsx(
                    Text,
                    {
                      style: {
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        fontWeight: "600"
                      },
                      children: "Title"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Text,
                    {
                      style: {
                        color: theme.colors.textMuted,
                        fontSize: theme.typography.sizeSm
                      },
                      children: [
                        title.length,
                        "/",
                        MAX_TITLE_LENGTH
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    style: [
                      styles3.input,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: titleError ? 1.5 : 1,
                        borderColor: titleError ? theme.colors.error : theme.colors.border,
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        padding: theme.spacing.md,
                        marginTop: theme.spacing.sm
                      }
                    ],
                    placeholder: "What feature would you like to see?",
                    placeholderTextColor: theme.colors.textMuted,
                    value: title,
                    onChangeText: (text) => setTitle(text.slice(0, MAX_TITLE_LENGTH)),
                    onBlur: () => setTouched((t) => ({ ...t, title: true })),
                    maxLength: MAX_TITLE_LENGTH
                  }
                ),
                titleError && /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: {
                      color: theme.colors.error,
                      fontSize: theme.typography.sizeSm,
                      marginTop: theme.spacing.xs
                    },
                    children: titleError
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(View, { style: [styles3.inputGroup, { marginTop: theme.spacing.lg }], children: [
                /* @__PURE__ */ jsxs(View, { style: styles3.labelRow, children: [
                  /* @__PURE__ */ jsx(
                    Text,
                    {
                      style: {
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        fontWeight: "600"
                      },
                      children: "Description"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Text,
                    {
                      style: {
                        color: theme.colors.textMuted,
                        fontSize: theme.typography.sizeSm
                      },
                      children: [
                        description.length,
                        "/",
                        MAX_DESCRIPTION_LENGTH
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: {
                      color: theme.colors.textMuted,
                      fontSize: theme.typography.sizeXs,
                      marginTop: theme.spacing.xs
                    },
                    children: "Min 20 characters"
                  }
                ),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    style: [
                      styles3.textArea,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: descriptionError ? 1.5 : 1,
                        borderColor: descriptionError ? theme.colors.error : theme.colors.border,
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        padding: theme.spacing.md,
                        marginTop: theme.spacing.sm
                      }
                    ],
                    placeholder: "Describe the feature in detail. What problem does it solve? How would it work?",
                    placeholderTextColor: theme.colors.textMuted,
                    value: description,
                    onChangeText: (text) => setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH)),
                    onBlur: () => setTouched((t) => ({ ...t, description: true })),
                    multiline: true,
                    numberOfLines: 6,
                    textAlignVertical: "top",
                    maxLength: MAX_DESCRIPTION_LENGTH
                  }
                ),
                descriptionError && /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: {
                      color: theme.colors.error,
                      fontSize: theme.typography.sizeSm,
                      marginTop: theme.spacing.xs
                    },
                    children: descriptionError
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                View,
                {
                  style: [
                    styles3.tipsCard,
                    {
                      backgroundColor: theme.colors.info + "10",
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginTop: theme.spacing.xl
                    }
                  ],
                  children: [
                    /* @__PURE__ */ jsx(
                      Text,
                      {
                        style: {
                          color: theme.colors.info,
                          fontSize: theme.typography.sizeMd,
                          fontWeight: "600",
                          marginBottom: theme.spacing.sm
                        },
                        children: "\u{1F4A1} Tips for a great feature request"
                      }
                    ),
                    /* @__PURE__ */ jsxs(View, { style: styles3.tipsList, children: [
                      /* @__PURE__ */ jsx(Text, { style: [styles3.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Be specific about what you want" }),
                      /* @__PURE__ */ jsx(Text, { style: [styles3.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Explain the problem it solves" }),
                      /* @__PURE__ */ jsx(Text, { style: [styles3.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Describe how it would benefit others" }),
                      /* @__PURE__ */ jsx(Text, { style: [styles3.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Search for existing requests first" })
                    ] })
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          View,
          {
            style: [
              styles3.bottomBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                padding: theme.spacing.md,
                paddingBottom: Platform.OS === "ios" ? 30 : theme.spacing.md
              }
            ],
            children: /* @__PURE__ */ jsx(
              TouchableOpacity,
              {
                style: [
                  styles3.submitButton,
                  {
                    backgroundColor: isValid ? theme.colors.primary : theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.md,
                    opacity: isLoading ? 0.7 : 1
                  }
                ],
                onPress: handleSubmit,
                disabled: !isValid || isLoading,
                children: isLoading ? /* @__PURE__ */ jsx(ActivityIndicator, { size: "small", color: theme.colors.textInverse }) : /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: {
                      color: isValid ? theme.colors.textInverse : theme.colors.textMuted,
                      fontSize: theme.typography.sizeMd,
                      fontWeight: "600"
                    },
                    children: "Submit Feature Request"
                  }
                )
              }
            )
          }
        )
      ] })
    }
  );
}
function ModalContent() {
  const viewState = useViewState();
  const theme = useThemeStore();
  const renderContent = () => {
    switch (viewState.type) {
      case "add-feature":
        return /* @__PURE__ */ jsx(AddFeature, {});
      case "board":
      default:
        return /* @__PURE__ */ jsx(FeatureBoard, {});
    }
  };
  return /* @__PURE__ */ jsx(ThemeProvider, { value: theme, children: /* @__PURE__ */ jsxs(View, { style: { flex: 1, backgroundColor: theme.colors.background }, children: [
    /* @__PURE__ */ jsx(
      StatusBar,
      {
        barStyle: theme.isDark ? "light-content" : "dark-content",
        backgroundColor: theme.colors.surface
      }
    ),
    renderContent()
  ] }) });
}
function FeedbackModal() {
  const visible = useVisible();
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    Modal,
    {
      animationType: "slide",
      presentationStyle: "pageSheet",
      visible,
      onRequestClose: () => store.getState().close(),
      children: /* @__PURE__ */ jsx(ModalContent, {})
    }
  );
}
function FeaturedDeckProvider({
  children,
  theme: customTheme
}) {
  const storeTheme = useThemeStore();
  useEffect(() => {
    if (customTheme) {
      store.getState().setTheme(customTheme);
    }
  }, [customTheme]);
  return /* @__PURE__ */ jsxs(ThemeProvider, { value: storeTheme, children: [
    children,
    /* @__PURE__ */ jsx(FeedbackModal, {})
  ] });
}

// src/hooks/index.ts
function useFeatures2() {
  return store((s) => s.features);
}
function useFeature(featureId) {
  return store((s) => s.features.find((f) => f.id === featureId));
}
function useIsLoading2() {
  return store((s) => s.isLoading);
}
function useError2() {
  return store((s) => s.error);
}
function useVisible2() {
  return store((s) => s.visible);
}
function useUser2() {
  return useUser();
}
function useUpvote(featureId) {
  var _a, _b;
  const feature = store((s) => s.features.find((f) => f.id === featureId));
  return {
    upvotesCount: (_a = feature == null ? void 0 : feature.upvotesCount) != null ? _a : 0,
    hasUpvoted: (_b = feature == null ? void 0 : feature.hasUpvoted) != null ? _b : false,
    toggle: () => store.getState().toggleUpvote(featureId)
  };
}
function useRoadmap() {
  const features = store((s) => s.roadmapFeatures);
  const loading = store((s) => s.roadmapLoading);
  return {
    features,
    loading,
    refresh: () => store.getState().loadRoadmap()
  };
}

export { FeaturedDeck, FeaturedDeckProvider, createThemeFromColor, darkTheme, getStatusColor, getStatusLabel, lightTheme, mergeTheme, useError2 as useError, useFeature, useFeatures2 as useFeatures, useIsLoading2 as useIsLoading, useRoadmap, useTheme, useUpvote, useUser2 as useUser, useVisible2 as useVisible };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map