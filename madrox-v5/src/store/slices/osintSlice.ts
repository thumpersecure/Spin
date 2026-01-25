/**
 * OSINT Tools State Slice
 *
 * Manages OSINT tool state and results.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export interface PhoneAnalysis {
  original: string;
  e164?: string;
  national?: string;
  international?: string;
  country_code?: string;
  country_name?: string;
  carrier?: string;
  line_type?: string;
  formats: string[];
  search_queries: SearchQuery[];
}

export interface SearchQuery {
  platform: string;
  url: string;
  description: string;
}

export interface OsintBookmark {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  icon?: string;
}

export interface EmailAnalysis {
  original: string;
  local_part: string;
  domain: string;
  provider_name?: string;
  is_disposable: boolean;
  is_free: boolean;
  search_queries: SearchQuery[];
}

export interface PlatformCheck {
  platform: string;
  url: string;
  icon: string;
}

export interface UsernameAnalysis {
  username: string;
  platforms: PlatformCheck[];
  search_queries: SearchQuery[];
}

export interface DomainAnalysis {
  domain: string;
  search_queries: SearchQuery[];
  subdomains_url: string;
  whois_url: string;
  dns_url: string;
}

interface OsintState {
  phoneAnalysis: PhoneAnalysis | null;
  emailAnalysis: EmailAnalysis | null;
  usernameAnalysis: UsernameAnalysis | null;
  domainAnalysis: DomainAnalysis | null;
  bookmarks: OsintBookmark[];
  bookmarkCategories: string[];
  isLoading: boolean;
  activeTab: 'phone' | 'email' | 'username' | 'domain' | 'bookmarks';
  error: string | null;
  recentSearches: string[];
}

const initialState: OsintState = {
  phoneAnalysis: null,
  emailAnalysis: null,
  usernameAnalysis: null,
  domainAnalysis: null,
  bookmarks: [],
  bookmarkCategories: [],
  isLoading: false,
  activeTab: 'phone',
  error: null,
  recentSearches: [],
};

// Async thunks
export const analyzePhone = createAsyncThunk(
  'osint/analyzePhone',
  async (phone: string) => {
    const analysis = await invoke<PhoneAnalysis>('analyze_phone', { phone });
    return analysis;
  }
);

export const analyzeEmail = createAsyncThunk(
  'osint/analyzeEmail',
  async (email: string) => {
    const analysis = await invoke<EmailAnalysis>('analyze_email', { email });
    return analysis;
  }
);

export const analyzeUsername = createAsyncThunk(
  'osint/analyzeUsername',
  async (username: string) => {
    const analysis = await invoke<UsernameAnalysis>('analyze_username', { username });
    return analysis;
  }
);

export const analyzeDomain = createAsyncThunk(
  'osint/analyzeDomain',
  async (domain: string) => {
    const analysis = await invoke<DomainAnalysis>('analyze_domain', { domain });
    return analysis;
  }
);

export const fetchBookmarks = createAsyncThunk(
  'osint/fetchBookmarks',
  async () => {
    const bookmarks = await invoke<OsintBookmark[]>('get_osint_bookmarks');
    return bookmarks;
  }
);

const osintSlice = createSlice({
  name: 'osint',
  initialState,
  reducers: {
    clearPhoneAnalysis: (state) => {
      state.phoneAnalysis = null;
    },

    clearEmailAnalysis: (state) => {
      state.emailAnalysis = null;
    },

    clearUsernameAnalysis: (state) => {
      state.usernameAnalysis = null;
    },

    clearDomainAnalysis: (state) => {
      state.domainAnalysis = null;
    },

    clearAllAnalysis: (state) => {
      state.phoneAnalysis = null;
      state.emailAnalysis = null;
      state.usernameAnalysis = null;
      state.domainAnalysis = null;
    },

    setActiveTab: (state, action: PayloadAction<OsintState['activeTab']>) => {
      state.activeTab = action.payload;
    },

    addRecentSearch: (state, action: PayloadAction<string>) => {
      // Add to front, remove duplicates, limit to 10
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter((s) => s !== action.payload),
      ].slice(0, 10);
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Analyze phone
    builder
      .addCase(analyzePhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzePhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.phoneAnalysis = action.payload;
      })
      .addCase(analyzePhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to analyze phone number';
      });

    // Analyze email
    builder
      .addCase(analyzeEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailAnalysis = action.payload;
      })
      .addCase(analyzeEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to analyze email';
      });

    // Analyze username
    builder
      .addCase(analyzeUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usernameAnalysis = action.payload;
      })
      .addCase(analyzeUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to analyze username';
      });

    // Analyze domain
    builder
      .addCase(analyzeDomain.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeDomain.fulfilled, (state, action) => {
        state.isLoading = false;
        state.domainAnalysis = action.payload;
      })
      .addCase(analyzeDomain.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to analyze domain';
      });

    // Fetch bookmarks
    builder
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarks = action.payload;
        state.bookmarkCategories = [...new Set(action.payload.map((b) => b.category))];
      });
  },
});

export const {
  clearPhoneAnalysis,
  clearEmailAnalysis,
  clearUsernameAnalysis,
  clearDomainAnalysis,
  clearAllAnalysis,
  setActiveTab,
  addRecentSearch,
  clearRecentSearches,
  clearError,
} = osintSlice.actions;

export default osintSlice.reducer;
