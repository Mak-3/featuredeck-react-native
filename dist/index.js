'use strict';

var zustand = require('zustand');
var react = require('react');
var reactNative = require('react-native');
var jsxRuntime = require('react/jsx-runtime');

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
  upvoteActive: "#6366F1",
  subscribe: "#94A3B8",
  subscribeActive: "#F59E0B"
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
  upvoteActive: "#818CF8",
  subscribe: "#64748B",
  subscribeActive: "#FBBF24"
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
var ThemeContext = react.createContext(lightTheme);
var useTheme = () => react.useContext(ThemeContext);
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
var getEnvVar = (key) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  throw new Error(
    `[ProdFeedback] Missing required environment variable: ${key}. Please set ${key} in your .env file or environment variables.`
  );
};
var API_BASE_URL = getEnvVar("PRODFEEDBACK_API_BASE_URL");

// src/api/client.ts
var apiKey = null;
function setApiKey(key) {
  apiKey = key;
}
function getApiKey() {
  if (!apiKey) {
    throw new Error("[ProdFeedback] API key not set. Call ProdFeedback.init() first.");
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
async function fetchFeatures(options = {}) {
  const { filters, userId, page = 1, pageSize = 20 } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if ((filters == null ? void 0 : filters.status) && filters.status.length > 0) {
    params.append("status", filters.status.join(","));
  }
  if ((filters == null ? void 0 : filters.type) && filters.type.length > 0) {
    params.append("type", filters.type.join(","));
  }
  if (filters == null ? void 0 : filters.searchQuery) {
    params.append("search", filters.searchQuery);
  }
  if (filters == null ? void 0 : filters.sortBy) {
    params.append("sortBy", filters.sortBy);
  }
  if (userId) {
    params.append("userId", userId);
  }
  const response = await get(`/features?${params.toString()}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to fetch features");
  }
  return response.data;
}
async function fetchFeature(featureId, userId) {
  const params = userId ? `?userId=${userId}` : "";
  const response = await get(`/features/${featureId}${params}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to fetch feature");
  }
  return response.data;
}
async function createFeature(title, description, user, type = "feature") {
  const response = await post("/features", {
    title,
    description,
    type,
    user
  });
  if (!response.success) {
    throw new Error(response.error || "Failed to create feature");
  }
  return response.data;
}
async function deleteFeature(featureId, userId) {
  const response = await del(`/features/${featureId}?userId=${userId}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete feature");
  }
}
async function toggleUpvote(featureId, userId) {
  const response = await post(
    `/features/${featureId}/upvote`,
    { userId }
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to toggle upvote");
  }
  return response.data;
}

// src/state/store.ts
var store = zustand.create((set, get2) => ({
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
  selectedFeature: null,
  filters: {
    sortBy: "trending"
  },
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
      console.log("[ProdFeedback] SDK initialized");
    } catch (error) {
      console.error("[ProdFeedback] Failed to initialize:", error);
      set({ error: error.message || "Failed to initialize SDK" });
    }
  },
  setUser: (user) => {
    set({ user });
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
      selectedFeature: null,
      error: null
    });
  },
  navigateTo: (view) => {
    set({ viewState: view, error: null });
  },
  openFeature: async (featureId) => {
    set({
      viewState: { type: "feature", featureId }
    });
    await get2().loadFeature(featureId);
  },
  openAddFeature: () => {
    set({ viewState: { type: "add-feature" }, error: null });
  },
  goBack: () => {
    const { viewState } = get2();
    if (viewState.type === "feature" || viewState.type === "add-feature" || viewState.type === "roadmap") {
      set({
        viewState: { type: "board" },
        selectedFeature: null,
        error: null
      });
    } else {
      get2().close();
    }
  },
  loadFeatures: async (refresh = false) => {
    const { filters, user } = get2();
    set({ isLoading: true, error: null });
    try {
      const result = await fetchFeatures({
        filters,
        userId: user == null ? void 0 : user.id,
        page: 1,
        pageSize: 20
      });
      set({
        features: result.data,
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
    const { filters, featuresPage, featuresHasMore, features, user } = get2();
    if (!featuresHasMore) return;
    const nextPage = featuresPage + 1;
    try {
      const result = await fetchFeatures({
        filters,
        userId: user == null ? void 0 : user.id,
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
  loadFeature: async (featureId) => {
    const { user } = get2();
    try {
      const feature = await fetchFeature(featureId, user == null ? void 0 : user.id);
      set({ selectedFeature: feature });
      const features = get2().features.map(
        (f) => f.id === featureId ? feature : f
      );
      set({ features });
    } catch (e) {
      set({ error: e.message || "Failed to load feature" });
    }
  },
  createFeature: async (title, description, type = "feature") => {
    const { user } = get2();
    if (!user) {
      set({ error: "User must be set to create feedback. Call ProdFeedback.setUser() first." });
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const newFeature = await createFeature(title, description, user, type);
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
      set({ error: "User must be set to delete a feature. Call ProdFeedback.setUser() first." });
      return false;
    }
    try {
      await deleteFeature(featureId, user.id);
      set({
        features: features.filter((f) => f.id !== featureId),
        featuresTotal: get2().featuresTotal - 1,
        viewState: { type: "board" },
        selectedFeature: null
      });
      return true;
    } catch (e) {
      set({ error: e.message || "Failed to delete feature" });
      return false;
    }
  },
  toggleUpvote: async (featureId) => {
    var _a, _b;
    const { features, selectedFeature, user } = get2();
    if (!user) {
      set({ error: "User must be set to vote. Call ProdFeedback.setUser() first." });
      return;
    }
    const feature = features.find((f) => f.id === featureId) || selectedFeature;
    if (!feature) return;
    const willUpvote = !feature.hasUpvoted;
    const updateFeature = (f) => ({
      ...f,
      hasUpvoted: willUpvote,
      upvotes: willUpvote ? f.upvotes + 1 : f.upvotes - 1
    });
    set({
      features: features.map((f) => f.id === featureId ? updateFeature(f) : f),
      selectedFeature: (selectedFeature == null ? void 0 : selectedFeature.id) === featureId ? updateFeature(selectedFeature) : selectedFeature
    });
    try {
      const result = await toggleUpvote(featureId, user.id);
      const serverUpdate = (f) => ({
        ...f,
        upvotes: result.upvotes,
        hasUpvoted: result.hasUpvoted
      });
      set({
        features: get2().features.map(
          (f) => f.id === featureId ? serverUpdate(f) : f
        ),
        selectedFeature: ((_a = get2().selectedFeature) == null ? void 0 : _a.id) === featureId ? serverUpdate(get2().selectedFeature) : get2().selectedFeature
      });
    } catch (e) {
      const revert = (f) => ({
        ...f,
        hasUpvoted: !willUpvote,
        upvotes: willUpvote ? f.upvotes - 1 : f.upvotes + 1
      });
      set({
        features: get2().features.map((f) => f.id === featureId ? revert(f) : f),
        selectedFeature: ((_b = get2().selectedFeature) == null ? void 0 : _b.id) === featureId ? revert(get2().selectedFeature) : get2().selectedFeature
      });
    }
  },
  setFilters: (newFilters) => {
    set({
      filters: { ...get2().filters, ...newFilters }
    });
    get2().loadFeatures(true);
  }
}));
var useStore = store;
var useFeatures = () => store((s) => s.features);
var useSelectedFeature = () => store((s) => s.selectedFeature);
var useThemeStore = () => store((s) => s.theme);
var useIsLoading = () => store((s) => s.isLoading);
var useError = () => store((s) => s.error);
var useVisible = () => store((s) => s.visible);
var useViewState = () => store((s) => s.viewState);
var useUser = () => store((s) => s.user);

// src/core/ProdFeedback.ts
var ProdFeedbackSDK = class {
  async init(config) {
    if (!config.apiKey) {
      console.error("[ProdFeedback] API key is required");
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
  open() {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return;
    }
    store.getState().open();
  }
  openBoard() {
    this.open();
  }
  close() {
    store.getState().close();
  }
  setUser(user) {
    store.getState().setUser(user);
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
  setFilters(filters) {
    store.getState().setFilters(filters);
  }
  async refresh() {
    await store.getState().loadFeatures(true);
  }
  async showRoadmap() {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return;
    }
    store.getState().open();
    store.getState().navigateTo({ type: "roadmap" });
  }
  openFeature(featureId) {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return;
    }
    store.getState().open();
    store.getState().openFeature(featureId);
  }
  openAddFeature() {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return;
    }
    store.getState().open();
    store.getState().openAddFeature();
  }
  isVisible() {
    return store.getState().visible;
  }
  async upvote(featureId) {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return;
    }
    await store.getState().toggleUpvote(featureId);
  }
  async deleteFeature(featureId) {
    if (!this.isReady()) {
      console.warn("[ProdFeedback] SDK not initialized. Call init() first.");
      return false;
    }
    return store.getState().deleteFeature(featureId);
  }
};
var ProdFeedback = new ProdFeedbackSDK();
function Header({ title, showBack = false, rightAction }) {
  const theme = useTheme();
  useViewState();
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    reactNative.View,
    {
      style: [
        styles2.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingTop: reactNative.Platform.OS === "ios" ? 50 : theme.spacing.md,
          paddingBottom: theme.spacing.md
        }
      ],
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.TouchableOpacity,
          {
            style: styles2.leftButton,
            onPress: showBack ? handleBack : handleClose,
            hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
            children: showBack ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles2.backIcon, children: /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.View,
              {
                style: [
                  styles2.chevron,
                  {
                    borderColor: theme.colors.text
                  }
                ]
              }
            ) }) : /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.text, fontSize: 24, fontWeight: "300" }, children: "\u2715" })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.Text,
          {
            style: [
              styles2.title,
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
        /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles2.rightButton, children: rightAction })
      ]
    }
  );
}

// src/hooks/index.ts
function useFeatures2() {
  return store((s) => s.features);
}
function useFeature(featureId) {
  return store((s) => s.features.find((f) => f.id === featureId));
}
function useSelectedFeature2() {
  return store((s) => s.selectedFeature);
}
function useComments() {
  return [];
}
function useCategories() {
  return [];
}
function useFilters() {
  return store((s) => s.filters);
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
function useIsFeatureAuthor(featureId) {
  const user = store((s) => s.user);
  const feature = store((s) => s.features.find((f) => f.id === featureId));
  if (!user || !feature || !feature.author) return false;
  return user.id === feature.author.id;
}
function useProdFeedbackActions() {
  return {
    open: store.getState().open,
    close: store.getState().close,
    setFilters: store.getState().setFilters,
    refresh: () => store.getState().loadFeatures(true),
    upvote: store.getState().toggleUpvote,
    deleteFeature: store.getState().deleteFeature
  };
}
function useUpvote(featureId) {
  var _a, _b;
  const feature = store((s) => s.features.find((f) => f.id === featureId));
  return {
    upvotes: (_a = feature == null ? void 0 : feature.upvotes) != null ? _a : 0,
    hasUpvoted: (_b = feature == null ? void 0 : feature.hasUpvoted) != null ? _b : false,
    toggle: () => store.getState().toggleUpvote(featureId)
  };
}
function useSubscription(featureId) {
  var _a;
  const feature = store((s) => s.features.find((f) => f.id === featureId));
  return {
    isSubscribed: (_a = feature == null ? void 0 : feature.isSubscribed) != null ? _a : false,
    toggle: () => {
    }
  };
}
function useDeleteFeature(featureId) {
  const user = store((s) => s.user);
  const feature = store((s) => s.features.find((f) => f.id === featureId));
  const canDelete = user && feature && feature.author && user.id === feature.author.id;
  return {
    canDelete: !!canDelete,
    deleteFeature: async () => {
      if (!canDelete) return false;
      return store.getState().deleteFeature(featureId);
    }
  };
}
var SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most_upvotes", label: "Most Voted" }
];
var STATUS_OPTIONS = [
  "under_review",
  "planned",
  "in_progress",
  "completed"
];
function FilterBar() {
  const theme = useTheme();
  const categories = useCategories();
  const [searchQuery, setSearchQuery] = react.useState("");
  const [showFilters, setShowFilters] = react.useState(false);
  const currentFilters = useStore((s) => s.filters);
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    container: {},
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 44
    },
    searchInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 12
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16
    },
    filtersExpanded: {},
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12
    }
  }), []);
  const handleSortChange = (sortBy) => {
    store.getState().setFilters({ sortBy });
  };
  const handleStatusToggle = (status) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = currentStatuses.includes(status) ? currentStatuses.filter((s) => s !== status) : [...currentStatuses, status];
    store.getState().setFilters({
      status: newStatuses.length > 0 ? newStatuses : void 0
    });
  };
  const handleCategoryChange = (categoryId) => {
    store.getState().setFilters({ category: categoryId });
  };
  const handleSearch = (text) => {
    setSearchQuery(text);
    clearTimeout(handleSearch.timeout);
    handleSearch.timeout = setTimeout(() => {
      store.getState().setFilters({ searchQuery: text || void 0 });
    }, 300);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.container, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      reactNative.View,
      {
        style: [
          styles2.searchContainer,
          {
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.borderRadius.md,
            marginHorizontal: theme.spacing.md,
            marginBottom: theme.spacing.sm
          }
        ],
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { marginLeft: 12, fontSize: 16 }, children: "\u{1F50D}" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.TextInput,
            {
              style: [
                styles2.searchInput,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd
                }
              ],
              placeholder: "Search features...",
              placeholderTextColor: theme.colors.textMuted,
              value: searchQuery,
              onChangeText: handleSearch
            }
          ),
          searchQuery.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.TouchableOpacity,
            {
              onPress: () => handleSearch(""),
              style: { marginRight: 12 },
              children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textMuted, fontSize: 16 }, children: "\u2715" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      reactNative.ScrollView,
      {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: {
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.sm
        },
        children: [
          SORT_OPTIONS.map((option) => {
            const isActive = currentFilters.sortBy === option.value;
            return /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.TouchableOpacity,
              {
                style: [
                  styles2.chip,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.sm
                  }
                ],
                onPress: () => handleSortChange(option.value),
                children: /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: isActive ? theme.colors.textInverse : theme.colors.text,
                      fontSize: theme.typography.sizeSm,
                      fontWeight: isActive ? "600" : "400"
                    },
                    children: option.label
                  }
                )
              },
              option.value
            );
          }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            reactNative.TouchableOpacity,
            {
              style: [
                styles2.chip,
                {
                  backgroundColor: showFilters ? theme.colors.primary : theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadius.full
                }
              ],
              onPress: () => setShowFilters(!showFilters),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { fontSize: 14 }, children: "\u2699\uFE0F" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: showFilters ? theme.colors.textInverse : theme.colors.text,
                      fontSize: theme.typography.sizeSm,
                      marginLeft: 4
                    },
                    children: "Filters"
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    showFilters && /* @__PURE__ */ jsxRuntime.jsxs(
      reactNative.View,
      {
        style: [
          styles2.filtersExpanded,
          {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            padding: theme.spacing.md
          }
        ],
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.Text,
            {
              style: {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizeSm,
                fontWeight: "600",
                marginBottom: theme.spacing.sm
              },
              children: "Status"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles2.filterRow, children: STATUS_OPTIONS.map((status) => {
            var _a;
            const isActive = (_a = currentFilters.status) == null ? void 0 : _a.includes(status);
            return /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.TouchableOpacity,
              {
                style: [
                  styles2.filterChip,
                  {
                    backgroundColor: isActive ? theme.colors.primary + "20" : theme.colors.backgroundSecondary,
                    borderWidth: isActive ? 1 : 0,
                    borderColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.xs,
                    marginBottom: theme.spacing.xs
                  }
                ],
                onPress: () => handleStatusToggle(status),
                children: /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: isActive ? theme.colors.primary : theme.colors.text,
                      fontSize: theme.typography.sizeSm
                    },
                    children: getStatusLabel(status)
                  }
                )
              },
              status
            );
          }) }),
          categories.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.Text,
              {
                style: {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizeSm,
                  fontWeight: "600",
                  marginTop: theme.spacing.sm,
                  marginBottom: theme.spacing.sm
                },
                children: "Category"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.filterRow, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.TouchableOpacity,
                {
                  style: [
                    styles2.filterChip,
                    {
                      backgroundColor: !currentFilters.category ? theme.colors.primary + "20" : theme.colors.backgroundSecondary,
                      borderWidth: !currentFilters.category ? 1 : 0,
                      borderColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                      marginRight: theme.spacing.xs,
                      marginBottom: theme.spacing.xs
                    }
                  ],
                  onPress: () => handleCategoryChange(void 0),
                  children: /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.Text,
                    {
                      style: {
                        color: !currentFilters.category ? theme.colors.primary : theme.colors.text,
                        fontSize: theme.typography.sizeSm
                      },
                      children: "All"
                    }
                  )
                }
              ),
              categories.map((cat) => {
                const isActive = currentFilters.category === cat.id;
                return /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.TouchableOpacity,
                  {
                    style: [
                      styles2.filterChip,
                      {
                        backgroundColor: isActive ? cat.color + "20" : theme.colors.backgroundSecondary,
                        borderWidth: isActive ? 1 : 0,
                        borderColor: cat.color,
                        borderRadius: theme.borderRadius.sm,
                        marginRight: theme.spacing.xs,
                        marginBottom: theme.spacing.xs
                      }
                    ],
                    onPress: () => handleCategoryChange(cat.id),
                    children: /* @__PURE__ */ jsxRuntime.jsx(
                      reactNative.Text,
                      {
                        style: {
                          color: isActive ? cat.color : theme.colors.text,
                          fontSize: theme.typography.sizeSm
                        },
                        children: cat.name
                      }
                    )
                  },
                  cat.id
                );
              })
            ] })
          ] })
        ]
      }
    )
  ] });
}
function StatusBadge({ status, size = "medium" }) {
  const theme = useTheme();
  const color = getStatusColor(status, theme.colors);
  const label = getStatusLabel(status);
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    reactNative.View,
    {
      style: [
        styles2.badge,
        {
          backgroundColor: color + "18",
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
          borderRadius: theme.borderRadius.full
        }
      ],
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.View,
          {
            style: [
              styles2.dot,
              {
                backgroundColor: color,
                width: isSmall ? 6 : 8,
                height: isSmall ? 6 : 8,
                marginRight: isSmall ? 4 : 6
              }
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.Text,
          {
            style: [
              styles2.label,
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
  const scaleAnim = react.useRef(new reactNative.Animated.Value(1)).current;
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
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
    reactNative.Animated.sequence([
      reactNative.Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 3
      }),
      reactNative.Animated.spring(scaleAnim, {
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.TouchableOpacity,
    {
      onPress: handlePress,
      activeOpacity: 0.7,
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        reactNative.Animated.View,
        {
          style: [
            styles2.container,
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
            /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.View,
              {
                style: [
                  styles2.arrow,
                  {
                    borderLeftWidth: config.iconSize * 0.6,
                    borderRightWidth: config.iconSize * 0.6,
                    borderBottomWidth: config.iconSize,
                    borderBottomColor: activeColor
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.Text,
              {
                style: [
                  styles2.count,
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
function FeatureCard({ feature, onPress }) {
  const theme = useTheme();
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    container: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2
    },
    row: {
      flexDirection: "row"
    },
    content: {
      flex: 1
    },
    title: {
      fontWeight: "600",
      lineHeight: 22
    },
    description: {
      lineHeight: 20
    },
    footer: {
      flexDirection: "row",
      alignItems: "center"
    },
    commentCount: {
      flexDirection: "row",
      alignItems: "center"
    },
    commentText: {
      fontWeight: "500"
    },
    category: {}
  }), []);
  const handleUpvote = () => {
    store.getState().toggleUpvote(feature.id);
  };
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      store.getState().openFeature(feature.id);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.TouchableOpacity,
    {
      style: [
        styles2.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border
        }
      ],
      onPress: handlePress,
      activeOpacity: 0.7,
      children: /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.row, children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          UpvoteButton,
          {
            count: feature.upvotes,
            hasUpvoted: feature.hasUpvoted,
            onPress: handleUpvote,
            size: "small"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.content, { marginLeft: theme.spacing.md }], children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.Text,
            {
              style: [
                styles2.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.sizeMd,
                  fontFamily: theme.typography.fontFamilyBold
                }
              ],
              numberOfLines: 2,
              children: feature.title
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.Text,
            {
              style: [
                styles2.description,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizeSm,
                  marginTop: theme.spacing.xs
                }
              ],
              numberOfLines: 2,
              children: feature.description
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.footer, { marginTop: theme.spacing.sm }], children: [
            /* @__PURE__ */ jsxRuntime.jsx(StatusBadge, { status: feature.status, size: "small" }),
            /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.commentCount, { marginLeft: theme.spacing.md }], children: [
              /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textMuted, fontSize: 12 }, children: "\u{1F4AC}" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.Text,
                {
                  style: [
                    styles2.commentText,
                    {
                      color: theme.colors.textMuted,
                      fontSize: theme.typography.sizeSm,
                      marginLeft: 4
                    }
                  ],
                  children: feature.commentCount
                }
              )
            ] }),
            feature.category && /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.View,
              {
                style: [
                  styles2.category,
                  {
                    backgroundColor: feature.category.color + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: theme.borderRadius.sm,
                    marginLeft: "auto"
                  }
                ],
                children: /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: feature.category.color,
                      fontSize: theme.typography.sizeXs,
                      fontWeight: "500"
                    },
                    children: feature.category.name
                  }
                )
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
function FeatureBoard() {
  const theme = useTheme();
  const features = useFeatures();
  const isLoading = useIsLoading();
  const error = useError();
  const hasMore = useStore((s) => s.featuresHasMore);
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    container: {
      flex: 1
    },
    addButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center"
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24
    },
    addFirstButton: {
      paddingVertical: 14,
      paddingHorizontal: 28
    }
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
  const renderAddButton = () => /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.TouchableOpacity,
    {
      onPress: handleAddFeature,
      hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        reactNative.View,
        {
          style: [
            styles2.addButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full
            }
          ],
          children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textInverse, fontSize: 20, fontWeight: "300" }, children: "+" })
        }
      )
    }
  );
  const renderEmpty = () => {
    if (isLoading) {
      return /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles2.emptyContainer, children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "large", color: theme.colors.primary }) });
    }
    if (error) {
      return /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.emptyContainer, children: [
        /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { fontSize: 48, marginBottom: 16 }, children: "\u{1F615}" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.Text,
          {
            style: {
              color: theme.colors.text,
              fontSize: theme.typography.sizeLg,
              fontWeight: "600",
              marginBottom: 8
            },
            children: "Something went wrong"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.Text,
          {
            style: {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizeMd,
              textAlign: "center",
              marginBottom: 20
            },
            children: error
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.TouchableOpacity,
          {
            style: [
              styles2.retryButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md
              }
            ],
            onPress: handleRefresh,
            children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textInverse, fontWeight: "600" }, children: "Try Again" })
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.emptyContainer, children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { fontSize: 64, marginBottom: 16 }, children: "\u{1F4A1}" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        reactNative.Text,
        {
          style: {
            color: theme.colors.text,
            fontSize: theme.typography.sizeLg,
            fontWeight: "600",
            marginBottom: 8
          },
          children: "No features yet"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        reactNative.Text,
        {
          style: {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizeMd,
            textAlign: "center",
            marginBottom: 20,
            paddingHorizontal: 40
          },
          children: "Be the first to suggest a feature and help shape the product!"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        reactNative.TouchableOpacity,
        {
          style: [
            styles2.addFirstButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.md
            }
          ],
          onPress: handleAddFeature,
          children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textInverse, fontWeight: "600" }, children: "Submit Feature" })
        }
      )
    ] });
  };
  const renderFooter = () => {
    if (!hasMore) return null;
    return /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: { paddingVertical: 20 }, children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.primary }) });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.container, { backgroundColor: theme.colors.background }], children: [
    /* @__PURE__ */ jsxRuntime.jsx(Header, { title: "Feature Requests", rightAction: renderAddButton() }),
    /* @__PURE__ */ jsxRuntime.jsx(FilterBar, {}),
    /* @__PURE__ */ jsxRuntime.jsx(
      reactNative.FlatList,
      {
        data: features,
        keyExtractor: (item) => item.id,
        renderItem: ({ item }) => /* @__PURE__ */ jsxRuntime.jsx(FeatureCard, { feature: item }),
        contentContainerStyle: {
          padding: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          flexGrow: 1
        },
        ListEmptyComponent: renderEmpty,
        ListFooterComponent: renderFooter,
        onEndReached: handleLoadMore,
        onEndReachedThreshold: 0.3,
        refreshControl: /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.RefreshControl,
          {
            refreshing: isLoading && features.length > 0,
            onRefresh: handleRefresh,
            tintColor: theme.colors.primary,
            colors: [theme.colors.primary]
          }
        ),
        showsVerticalScrollIndicator: false
      }
    )
  ] });
}
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
function getInitials(name) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
function CommentItem({ comment }) {
  const theme = useTheme();
  const isOfficial = comment.isOfficial;
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    container: {
      paddingVertical: 4
    },
    header: {
      flexDirection: "row",
      alignItems: "center"
    },
    avatar: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center"
    },
    authorInfo: {
      marginLeft: 10
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center"
    },
    officialBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2
    },
    content: {}
  }), []);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    reactNative.View,
    {
      style: [
        styles2.container,
        {
          backgroundColor: isOfficial ? theme.colors.primary + "08" : "transparent",
          borderLeftWidth: isOfficial ? 3 : 0,
          borderLeftColor: theme.colors.primary,
          paddingLeft: isOfficial ? theme.spacing.md : 0,
          marginBottom: theme.spacing.md
        }
      ],
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.header, children: [
          comment.author.avatar ? /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.View,
            {
              style: [
                styles2.avatar,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadius.full
                }
              ],
              children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.textMuted, fontSize: 10 }, children: getInitials(comment.author.name) })
            }
          ) : /* @__PURE__ */ jsxRuntime.jsx(
            reactNative.View,
            {
              style: [
                styles2.avatar,
                {
                  backgroundColor: theme.colors.primary + "20",
                  borderRadius: theme.borderRadius.full
                }
              ],
              children: /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.Text,
                {
                  style: {
                    color: theme.colors.primary,
                    fontSize: 11,
                    fontWeight: "600"
                  },
                  children: getInitials(comment.author.name)
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.authorInfo, children: [
            /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.nameRow, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.Text,
                {
                  style: {
                    color: theme.colors.text,
                    fontSize: theme.typography.sizeSm,
                    fontWeight: "600"
                  },
                  children: comment.author.name || "Anonymous"
                }
              ),
              isOfficial && /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.View,
                {
                  style: [
                    styles2.officialBadge,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                      marginLeft: theme.spacing.xs
                    }
                  ],
                  children: /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.Text,
                    {
                      style: {
                        color: theme.colors.textInverse,
                        fontSize: 9,
                        fontWeight: "700"
                      },
                      children: "TEAM"
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.Text,
              {
                style: {
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.sizeXs
                },
                children: formatDate(comment.createdAt)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.Text,
          {
            style: [
              styles2.content,
              {
                color: theme.colors.text,
                fontSize: theme.typography.sizeMd,
                lineHeight: theme.typography.sizeMd * theme.typography.lineHeightNormal,
                marginTop: theme.spacing.sm
              }
            ],
            children: comment.content
          }
        )
      ]
    }
  );
}
function formatDate2(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function FeatureDetail() {
  const theme = useTheme();
  const feature = useSelectedFeature();
  const comments = useComments();
  const user = useUser();
  const commentsLoading = store((s) => s.commentsLoading);
  const [newComment, setNewComment] = react.useState("");
  const [submitting, setSubmitting] = react.useState(false);
  const [deleting, setDeleting] = react.useState(false);
  if (!feature) {
    return /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles.container, { backgroundColor: theme.colors.background }], children: [
      /* @__PURE__ */ jsxRuntime.jsx(Header, { title: "Feature", showBack: true }),
      /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles.loadingContainer, children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "large", color: theme.colors.primary }) })
    ] });
  }
  const isAuthor = (user == null ? void 0 : user.id) === feature.author.id;
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
      setNewComment("");
    }
  };
  const handleDelete = () => {
    reactNative.Alert.alert(
      "Delete Feature",
      "Are you sure you want to delete this feature request? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            await store.getState().deleteFeature(feature.id);
            setDeleting(false);
          }
        }
      ]
    );
  };
  const handleDeleteComment = (commentId) => {
    reactNative.Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            store.getState().deleteComment(commentId);
          }
        }
      ]
    );
  };
  const renderHeaderAction = () => {
    if (!isAuthor) return null;
    return /* @__PURE__ */ jsxRuntime.jsx(
      reactNative.TouchableOpacity,
      {
        onPress: handleDelete,
        disabled: deleting,
        hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
        children: deleting ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.error }) : /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.error, fontSize: 16 }, children: "\u{1F5D1}\uFE0F" })
      }
    );
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.KeyboardAvoidingView,
    {
      style: { flex: 1 },
      behavior: reactNative.Platform.OS === "ios" ? "padding" : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles.container, { backgroundColor: theme.colors.background }], children: [
        /* @__PURE__ */ jsxRuntime.jsx(Header, { title: "Feature", showBack: true, rightAction: renderHeaderAction() }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          reactNative.ScrollView,
          {
            style: styles.scrollView,
            contentContainerStyle: { padding: theme.spacing.md },
            showsVerticalScrollIndicator: false,
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs(
                reactNative.View,
                {
                  style: [
                    styles.featureCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.lg,
                      padding: theme.spacing.lg,
                      borderWidth: 1,
                      borderColor: theme.colors.border
                    }
                  ],
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles.headerRow, children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        UpvoteButton,
                        {
                          count: feature.upvotes,
                          hasUpvoted: feature.hasUpvoted,
                          onPress: handleUpvote,
                          size: "large"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles.headerContent, { marginLeft: theme.spacing.md }], children: [
                        /* @__PURE__ */ jsxRuntime.jsx(StatusBadge, { status: feature.status }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          reactNative.Text,
                          {
                            style: [
                              styles.title,
                              {
                                color: theme.colors.text,
                                fontSize: theme.typography.sizeXl,
                                fontFamily: theme.typography.fontFamilyBold,
                                marginTop: theme.spacing.sm
                              }
                            ],
                            children: feature.title
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      reactNative.Text,
                      {
                        style: [
                          styles.description,
                          {
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.sizeMd,
                            lineHeight: theme.typography.sizeMd * theme.typography.lineHeightRelaxed,
                            marginTop: theme.spacing.md
                          }
                        ],
                        children: feature.description
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      reactNative.View,
                      {
                        style: [
                          styles.metaRow,
                          {
                            marginTop: theme.spacing.lg,
                            paddingTop: theme.spacing.md,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.borderLight
                          }
                        ],
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsxs(reactNative.Text, { style: { color: theme.colors.textMuted, fontSize: theme.typography.sizeSm }, children: [
                            "Posted by ",
                            feature.author.name || "Anonymous",
                            " \u2022 ",
                            formatDate2(feature.createdAt)
                          ] }),
                          isAuthor && /* @__PURE__ */ jsxRuntime.jsx(
                            reactNative.View,
                            {
                              style: [
                                styles.authorBadge,
                                {
                                  backgroundColor: theme.colors.primary + "15",
                                  borderRadius: theme.borderRadius.sm,
                                  marginLeft: theme.spacing.sm
                                }
                              ],
                              children: /* @__PURE__ */ jsxRuntime.jsx(
                                reactNative.Text,
                                {
                                  style: {
                                    color: theme.colors.primary,
                                    fontSize: theme.typography.sizeXs,
                                    fontWeight: "600"
                                  },
                                  children: "You"
                                }
                              )
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles.actionsRow, { marginTop: theme.spacing.md }], children: [
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        reactNative.TouchableOpacity,
                        {
                          style: [
                            styles.actionButton,
                            {
                              backgroundColor: feature.isSubscribed ? theme.colors.subscribeActive + "15" : theme.colors.backgroundSecondary,
                              borderRadius: theme.borderRadius.md,
                              borderWidth: feature.isSubscribed ? 1.5 : 0,
                              borderColor: feature.isSubscribed ? theme.colors.subscribeActive : "transparent"
                            }
                          ],
                          onPress: handleSubscribe,
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { fontSize: 16 }, children: feature.isSubscribed ? "\u{1F514}" : "\u{1F515}" }),
                            /* @__PURE__ */ jsxRuntime.jsx(
                              reactNative.Text,
                              {
                                style: {
                                  color: feature.isSubscribed ? theme.colors.subscribeActive : theme.colors.text,
                                  fontSize: theme.typography.sizeSm,
                                  fontWeight: "600",
                                  marginLeft: 6
                                },
                                children: feature.isSubscribed ? "Subscribed" : "Subscribe"
                              }
                            )
                          ]
                        }
                      ),
                      feature.category && /* @__PURE__ */ jsxRuntime.jsx(
                        reactNative.View,
                        {
                          style: [
                            styles.categoryBadge,
                            {
                              backgroundColor: feature.category.color + "20",
                              borderRadius: theme.borderRadius.sm,
                              marginLeft: theme.spacing.sm
                            }
                          ],
                          children: /* @__PURE__ */ jsxRuntime.jsx(
                            reactNative.Text,
                            {
                              style: {
                                color: feature.category.color,
                                fontSize: theme.typography.sizeSm,
                                fontWeight: "500"
                              },
                              children: feature.category.name
                            }
                          )
                        }
                      )
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: { marginTop: theme.spacing.xl }, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(
                  reactNative.Text,
                  {
                    style: {
                      color: theme.colors.text,
                      fontSize: theme.typography.sizeLg,
                      fontWeight: "700",
                      marginBottom: theme.spacing.md
                    },
                    children: [
                      "Comments (",
                      feature.commentCount,
                      ")"
                    ]
                  }
                ),
                commentsLoading ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: { paddingVertical: 20 }, children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.primary }) }) : comments.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs(
                  reactNative.View,
                  {
                    style: [
                      styles.emptyComments,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.md,
                        padding: theme.spacing.lg
                      }
                    ],
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { fontSize: 32, marginBottom: 8 }, children: "\u{1F4AC}" }),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        reactNative.Text,
                        {
                          style: {
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.sizeMd,
                            textAlign: "center"
                          },
                          children: "No comments yet. Be the first to share your thoughts!"
                        }
                      )
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.View,
                  {
                    style: [
                      styles.commentsList,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.lg,
                        padding: theme.spacing.md
                      }
                    ],
                    children: comments.map((comment) => /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(CommentItem, { comment }),
                      (user == null ? void 0 : user.id) === comment.author.id && /* @__PURE__ */ jsxRuntime.jsx(
                        reactNative.TouchableOpacity,
                        {
                          style: [
                            styles.deleteCommentBtn,
                            { marginBottom: theme.spacing.sm }
                          ],
                          onPress: () => handleDeleteComment(comment.id),
                          children: /* @__PURE__ */ jsxRuntime.jsx(
                            reactNative.Text,
                            {
                              style: {
                                color: theme.colors.error,
                                fontSize: theme.typography.sizeXs
                              },
                              children: "Delete"
                            }
                          )
                        }
                      )
                    ] }, comment.id))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: { height: 100 } })
            ]
          }
        ),
        user ? /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.View,
          {
            style: [
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                paddingBottom: reactNative.Platform.OS === "ios" ? 30 : theme.spacing.sm
              }
            ],
            children: /* @__PURE__ */ jsxRuntime.jsxs(
              reactNative.View,
              {
                style: [
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.lg
                  }
                ],
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.TextInput,
                    {
                      style: [
                        styles.input,
                        {
                          color: theme.colors.text,
                          fontSize: theme.typography.sizeMd
                        }
                      ],
                      placeholder: "Add a comment...",
                      placeholderTextColor: theme.colors.textMuted,
                      value: newComment,
                      onChangeText: setNewComment,
                      multiline: true,
                      maxLength: 1e3
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.TouchableOpacity,
                    {
                      style: [
                        styles.sendButton,
                        {
                          backgroundColor: newComment.trim() ? theme.colors.primary : theme.colors.backgroundSecondary,
                          borderRadius: theme.borderRadius.full,
                          opacity: submitting ? 0.6 : 1
                        }
                      ],
                      onPress: handleSubmitComment,
                      disabled: !newComment.trim() || submitting,
                      children: submitting ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.textInverse }) : /* @__PURE__ */ jsxRuntime.jsx(
                        reactNative.Text,
                        {
                          style: {
                            color: newComment.trim() ? theme.colors.textInverse : theme.colors.textMuted,
                            fontSize: 16
                          },
                          children: "\u27A4"
                        }
                      )
                    }
                  )
                ]
              }
            )
          }
        ) : /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.View,
          {
            style: [
              styles.loginPrompt,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                padding: theme.spacing.md,
                paddingBottom: reactNative.Platform.OS === "ios" ? 30 : theme.spacing.md
              }
            ],
            children: /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.Text,
              {
                style: {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizeMd,
                  textAlign: "center"
                },
                children: "Sign in to leave a comment or vote"
              }
            )
          }
        )
      ] })
    }
  );
}
var styles = reactNative.StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  scrollView: {
    flex: 1
  },
  featureCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  headerRow: {
    flexDirection: "row"
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontWeight: "700",
    lineHeight: 28
  },
  description: {},
  metaRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  authorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  emptyComments: {
    alignItems: "center"
  },
  commentsList: {},
  deleteCommentBtn: {
    alignSelf: "flex-start",
    marginLeft: 42,
    marginTop: -4
  },
  inputContainer: {},
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  loginPrompt: {}
});
var MAX_TITLE_LENGTH = 100;
var MAX_DESCRIPTION_LENGTH = 2e3;
function AddFeature() {
  const theme = useTheme();
  const categories = useCategories();
  const isLoading = useIsLoading();
  const error = useError();
  const [title, setTitle] = react.useState("");
  const [description, setDescription] = react.useState("");
  const [selectedCategory, setSelectedCategory] = react.useState();
  const [touched, setTouched] = react.useState({ title: false, description: false });
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
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
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    categoryChip: {
      paddingVertical: 10,
      paddingHorizontal: 16
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
      description.trim(),
      selectedCategory
    );
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.KeyboardAvoidingView,
    {
      style: { flex: 1 },
      behavior: reactNative.Platform.OS === "ios" ? "padding" : void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.container, { backgroundColor: theme.colors.background }], children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          Header,
          {
            title: "Submit Feature",
            showBack: true,
            rightAction: /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.TouchableOpacity,
              {
                onPress: handleSubmit,
                disabled: !isValid || isLoading,
                children: isLoading ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.primary }) : /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: isValid ? theme.colors.primary : theme.colors.textMuted,
                      fontSize: theme.typography.sizeMd,
                      fontWeight: "600"
                    },
                    children: "Submit"
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          reactNative.ScrollView,
          {
            style: styles2.scrollView,
            contentContainerStyle: { padding: theme.spacing.md },
            showsVerticalScrollIndicator: false,
            keyboardShouldPersistTaps: "handled",
            children: [
              error && /* @__PURE__ */ jsxRuntime.jsx(
                reactNative.View,
                {
                  style: [
                    styles2.errorBanner,
                    {
                      backgroundColor: theme.colors.error + "15",
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.md
                    }
                  ],
                  children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: { color: theme.colors.error, fontSize: theme.typography.sizeSm }, children: error })
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.inputGroup, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.labelRow, children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.Text,
                    {
                      style: {
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        fontWeight: "600"
                      },
                      children: "Title"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsxs(
                    reactNative.Text,
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
                /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.TextInput,
                  {
                    style: [
                      styles2.input,
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
                titleError && /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
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
              /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.inputGroup, { marginTop: theme.spacing.lg }], children: [
                /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.labelRow, children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.Text,
                    {
                      style: {
                        color: theme.colors.text,
                        fontSize: theme.typography.sizeMd,
                        fontWeight: "600"
                      },
                      children: "Description"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsxs(
                    reactNative.Text,
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
                /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.TextInput,
                  {
                    style: [
                      styles2.textArea,
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
                descriptionError && /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
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
              categories.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.inputGroup, { marginTop: theme.spacing.lg }], children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
                  {
                    style: {
                      color: theme.colors.text,
                      fontSize: theme.typography.sizeMd,
                      fontWeight: "600",
                      marginBottom: theme.spacing.sm
                    },
                    children: "Category (optional)"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: styles2.categoryGrid, children: categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return /* @__PURE__ */ jsxRuntime.jsx(
                    reactNative.TouchableOpacity,
                    {
                      style: [
                        styles2.categoryChip,
                        {
                          backgroundColor: isSelected ? cat.color + "20" : theme.colors.surface,
                          borderRadius: theme.borderRadius.md,
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? cat.color : theme.colors.border,
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm
                        }
                      ],
                      onPress: () => setSelectedCategory(
                        isSelected ? void 0 : cat.id
                      ),
                      children: /* @__PURE__ */ jsxRuntime.jsx(
                        reactNative.Text,
                        {
                          style: {
                            color: isSelected ? cat.color : theme.colors.text,
                            fontSize: theme.typography.sizeSm,
                            fontWeight: isSelected ? "600" : "400"
                          },
                          children: cat.name
                        }
                      )
                    },
                    cat.id
                  );
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                reactNative.View,
                {
                  style: [
                    styles2.tipsCard,
                    {
                      backgroundColor: theme.colors.info + "10",
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginTop: theme.spacing.xl
                    }
                  ],
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      reactNative.Text,
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
                    /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: styles2.tipsList, children: [
                      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [styles2.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Be specific about what you want" }),
                      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [styles2.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Explain the problem it solves" }),
                      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [styles2.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Describe how it would benefit others" }),
                      /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [styles2.tipItem, { color: theme.colors.textSecondary }], children: "\u2022 Search for existing requests first" })
                    ] })
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactNative.View,
          {
            style: [
              styles2.bottomBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                padding: theme.spacing.md,
                paddingBottom: reactNative.Platform.OS === "ios" ? 30 : theme.spacing.md
              }
            ],
            children: /* @__PURE__ */ jsxRuntime.jsx(
              reactNative.TouchableOpacity,
              {
                style: [
                  styles2.submitButton,
                  {
                    backgroundColor: isValid ? theme.colors.primary : theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.md,
                    opacity: isLoading ? 0.7 : 1
                  }
                ],
                onPress: handleSubmit,
                disabled: !isValid || isLoading,
                children: isLoading ? /* @__PURE__ */ jsxRuntime.jsx(reactNative.ActivityIndicator, { size: "small", color: theme.colors.textInverse }) : /* @__PURE__ */ jsxRuntime.jsx(
                  reactNative.Text,
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
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    container: {
      flex: 1
    }
  }), []);
  const renderContent = () => {
    switch (viewState.type) {
      case "feature":
        return /* @__PURE__ */ jsxRuntime.jsx(FeatureDetail, {});
      case "add-feature":
        return /* @__PURE__ */ jsxRuntime.jsx(AddFeature, {});
      case "board":
      default:
        return /* @__PURE__ */ jsxRuntime.jsx(FeatureBoard, {});
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ThemeProvider, { value: theme, children: /* @__PURE__ */ jsxRuntime.jsxs(reactNative.View, { style: [styles2.container, { backgroundColor: theme.colors.background }], children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      reactNative.StatusBar,
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.Modal,
    {
      animationType: "slide",
      presentationStyle: "pageSheet",
      visible,
      onRequestClose: () => store.getState().close(),
      children: /* @__PURE__ */ jsxRuntime.jsx(ModalContent, {})
    }
  );
}
function ProdFeedbackProvider({
  children,
  theme: customTheme
}) {
  const storeTheme = useThemeStore();
  react.useEffect(() => {
    if (customTheme) {
      store.getState().setTheme(customTheme);
    }
  }, [customTheme]);
  return /* @__PURE__ */ jsxRuntime.jsxs(ThemeProvider, { value: storeTheme, children: [
    children,
    /* @__PURE__ */ jsxRuntime.jsx(FeedbackModal, {})
  ] });
}
function DefaultIcon({ color }) {
  return /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: iconStyles.iconContainer, children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { style: [iconStyles.bubble, { borderColor: color }], children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [iconStyles.plus, { color }], children: "+" }) }) });
}
var iconStyles = reactNative.StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  bubble: {
    width: 24,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  plus: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: -2
  }
});
function FeedbackButton({
  position = "bottom-right",
  offset = { x: 20, y: 40 },
  size = 56,
  icon,
  label = "Feedback",
  showLabel = false,
  style
}) {
  const theme = useThemeStore();
  const scaleAnim = react.useRef(new reactNative.Animated.Value(1)).current;
  const styles2 = react.useMemo(() => reactNative.StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },
    shadow: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    label: {
      fontWeight: "600"
    }
  }), []);
  const handlePressIn = () => {
    reactNative.Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true
    }).start();
  };
  const handlePressOut = () => {
    reactNative.Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true
    }).start();
  };
  const handlePress = () => {
    store.getState().open();
  };
  const positionStyle = react.useMemo(() => {
    const posStyles = { position: "absolute" };
    switch (position) {
      case "bottom-right":
        posStyles.bottom = offset.y;
        posStyles.right = offset.x;
        break;
      case "bottom-left":
        posStyles.bottom = offset.y;
        posStyles.left = offset.x;
        break;
      case "top-right":
        posStyles.top = offset.y;
        posStyles.right = offset.x;
        break;
      case "top-left":
        posStyles.top = offset.y;
        posStyles.left = offset.x;
        break;
    }
    return posStyles;
  }, [position, offset]);
  const buttonStyle = {
    width: showLabel ? void 0 : size,
    height: size,
    borderRadius: showLabel ? size / 2 : size / 2,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: showLabel ? theme.spacing.lg : 0
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.Animated.View,
    {
      style: [
        positionStyle,
        { transform: [{ scale: scaleAnim }] },
        styles2.shadow,
        { shadowColor: theme.colors.shadow },
        style
      ],
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        reactNative.TouchableOpacity,
        {
          style: [styles2.button, buttonStyle],
          onPress: handlePress,
          onPressIn: handlePressIn,
          onPressOut: handlePressOut,
          activeOpacity: 1,
          children: [
            icon || /* @__PURE__ */ jsxRuntime.jsx(DefaultIcon, { color: theme.colors.textInverse }),
            showLabel && /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: [
              styles2.label,
              {
                color: theme.colors.textInverse,
                fontFamily: theme.typography.fontFamilyBold,
                fontSize: theme.typography.sizeMd,
                marginLeft: theme.spacing.sm
              }
            ], children: label })
          ]
        }
      )
    }
  );
}

exports.FeedbackButton = FeedbackButton;
exports.ProdFeedback = ProdFeedback;
exports.ProdFeedbackProvider = ProdFeedbackProvider;
exports.createThemeFromColor = createThemeFromColor;
exports.darkTheme = darkTheme;
exports.getStatusColor = getStatusColor;
exports.getStatusLabel = getStatusLabel;
exports.lightTheme = lightTheme;
exports.mergeTheme = mergeTheme;
exports.useCategories = useCategories;
exports.useComments = useComments;
exports.useDeleteFeature = useDeleteFeature;
exports.useError = useError2;
exports.useFeature = useFeature;
exports.useFeatures = useFeatures2;
exports.useFilters = useFilters;
exports.useIsFeatureAuthor = useIsFeatureAuthor;
exports.useIsLoading = useIsLoading2;
exports.useProdFeedbackActions = useProdFeedbackActions;
exports.useSelectedFeature = useSelectedFeature2;
exports.useSubscription = useSubscription;
exports.useTheme = useTheme;
exports.useUpvote = useUpvote;
exports.useUser = useUser2;
exports.useVisible = useVisible2;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map