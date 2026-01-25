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

interface OsintState {
  phoneAnalysis: PhoneAnalysis | null;
  bookmarks: OsintBookmark[];
  bookmarkCategories: string[];
  isLoading: boolean;
  error: string | null;
  recentSearches: string[];
}

const initialState: OsintState = {
  phoneAnalysis: null,
  bookmarks: [],
  bookmarkCategories: [],
  isLoading: false,
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
  addRecentSearch,
  clearRecentSearches,
  clearError,
} = osintSlice.actions;

export default osintSlice.reducer;
