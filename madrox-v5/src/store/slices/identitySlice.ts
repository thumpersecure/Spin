/**
 * Identity State Slice
 *
 * Manages Spin identities (dupes).
 * "Every cover tells a different story."
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export interface Fingerprint {
  id: string;
  user_agent: string;
  platform: string;
  screen: {
    width: number;
    height: number;
    available_width: number;
    available_height: number;
    pixel_ratio: number;
  };
  webgl: {
    vendor: string;
    renderer: string;
  };
  timezone_offset: number;
  languages: string[];
  hardware_concurrency: number;
  device_memory: number;
}

export interface Identity {
  id: string;
  name: string;
  description?: string;
  fingerprint: Fingerprint;
  status: 'active' | 'dormant' | 'destroyed';
  proxy_config?: {
    enabled: boolean;
    proxy_type: string;
    host?: string;
    port?: number;
  };
  created_at: string;
  last_used: string;
  tab_count: number;
  entities_found: number;
}

interface IdentityState {
  identities: Identity[];
  activeIdentityId: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: IdentityState = {
  identities: [],
  activeIdentityId: 'prime',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchIdentities = createAsyncThunk(
  'identity/fetchAll',
  async () => {
    const identities = await invoke<Identity[]>('get_all_identities');
    return identities;
  }
);

export const createIdentity = createAsyncThunk(
  'identity/create',
  async (request: { name: string; description?: string }) => {
    const identity = await invoke<Identity>('create_identity', { request });
    return identity;
  }
);

export const deleteIdentity = createAsyncThunk(
  'identity/delete',
  async (identityId: string) => {
    await invoke('delete_identity', { identityId });
    return identityId;
  }
);

export const switchIdentity = createAsyncThunk(
  'identity/switch',
  async (identityId: string) => {
    const identity = await invoke<Identity>('switch_identity', { identityId });
    return identity;
  }
);

const identitySlice = createSlice({
  name: 'identity',
  initialState,
  reducers: {
    setActiveIdentity: (state, action: PayloadAction<string>) => {
      state.activeIdentityId = action.payload;
    },

    updateIdentityStats: (
      state,
      action: PayloadAction<{ id: string; tabCount?: number; entitiesFound?: number }>
    ) => {
      const identity = state.identities.find((i) => i.id === action.payload.id);
      if (identity) {
        if (action.payload.tabCount !== undefined) {
          identity.tab_count = action.payload.tabCount;
        }
        if (action.payload.entitiesFound !== undefined) {
          identity.entities_found = action.payload.entitiesFound;
        }
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch identities
    builder
      .addCase(fetchIdentities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIdentities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identities = action.payload;
      })
      .addCase(fetchIdentities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch identities';
      });

    // Create identity
    builder
      .addCase(createIdentity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createIdentity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identities.push(action.payload);
      })
      .addCase(createIdentity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create identity';
      });

    // Delete identity
    builder
      .addCase(deleteIdentity.fulfilled, (state, action) => {
        state.identities = state.identities.filter((i) => i.id !== action.payload);
        if (state.activeIdentityId === action.payload) {
          state.activeIdentityId = 'prime';
        }
      });

    // Switch identity
    builder
      .addCase(switchIdentity.fulfilled, (state, action) => {
        state.activeIdentityId = action.payload.id;
      });
  },
});

export const { setActiveIdentity, updateIdentityStats, clearError } = identitySlice.actions;
export default identitySlice.reducer;
