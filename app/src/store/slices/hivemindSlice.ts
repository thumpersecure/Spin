/**
 * Hivemind State Slice
 *
 * Manages the collective intelligence system.
 * All entities discovered by any identity are synchronized here.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export type EntityType =
  | 'email'
  | 'phone'
  | 'ip_v4'
  | 'ip_v6'
  | 'domain'
  | 'url'
  | 'username'
  | 'hashtag'
  | 'bitcoin_address'
  | 'ethereum_address'
  | 'credit_card'
  | 'ssn'
  | 'date'
  | 'coordinate'
  | 'mac_address'
  | 'uuid';

export interface EntitySource {
  identity_id: string;
  url?: string;
  context?: string;
  timestamp: string;
}

export interface Entity {
  hash: string;
  entity_type: EntityType;
  value: string;
  sources: EntitySource[];
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  risk_score?: number;
  tags: string[];
  notes?: string;
}

export interface CrossReference {
  entity_hash: string;
  entity_type: EntityType;
  value: string;
  identity_ids: string[];
  total_occurrences: number;
  first_seen: string;
  last_seen: string;
}

interface HivemindState {
  entities: Entity[];
  crossReferences: CrossReference[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  filterType: EntityType | 'all';
  searchQuery: string;
}

const initialState: HivemindState = {
  entities: [],
  crossReferences: [],
  isLoading: false,
  error: null,
  lastSync: null,
  filterType: 'all',
  searchQuery: '',
};

// Async thunks
export const fetchEntities = createAsyncThunk(
  'hivemind/fetchEntities',
  async () => {
    const entities = await invoke<Entity[]>('get_all_entities');
    return entities;
  }
);

export const addEntity = createAsyncThunk(
  'hivemind/addEntity',
  async (request: {
    entity_type: EntityType;
    value: string;
    source_identity: string;
    source_url?: string;
    context?: string;
  }) => {
    const entity = await invoke<Entity>('add_entity', { request });
    return entity;
  }
);

export const fetchCrossReferences = createAsyncThunk(
  'hivemind/fetchCrossReferences',
  async () => {
    const crossRefs = await invoke<CrossReference[]>('get_cross_references');
    return crossRefs;
  }
);

export const extractEntitiesFromText = createAsyncThunk(
  'hivemind/extractFromText',
  async (params: { text: string; sourceIdentity: string; sourceUrl?: string }) => {
    const entities = await invoke<Entity[]>('extract_entities_from_text', {
      text: params.text,
      sourceIdentity: params.sourceIdentity,
      sourceUrl: params.sourceUrl,
    });
    return entities;
  }
);

export const clearAllEntities = createAsyncThunk(
  'hivemind/clearAll',
  async () => {
    await invoke('clear_entities', { confirm: true });
  }
);

const hivemindSlice = createSlice({
  name: 'hivemind',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<EntityType | 'all'>) => {
      state.filterType = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    addEntityLocal: (state, action: PayloadAction<Entity>) => {
      const existing = state.entities.find((e) => e.hash === action.payload.hash);
      if (existing) {
        // Update existing entity
        existing.sources = [...existing.sources, ...action.payload.sources];
        existing.last_seen = action.payload.last_seen;
        existing.occurrence_count += 1;
      } else {
        state.entities.push(action.payload);
      }
    },

    updateCrossReferences: (state) => {
      // Compute cross-references from entities
      state.crossReferences = state.entities
        .filter((e) => {
          const uniqueIdentities = new Set(e.sources.map((s) => s.identity_id));
          return uniqueIdentities.size > 1;
        })
        .map((e) => ({
          entity_hash: e.hash,
          entity_type: e.entity_type,
          value: e.value,
          identity_ids: [...new Set(e.sources.map((s) => s.identity_id))],
          total_occurrences: e.occurrence_count,
          first_seen: e.first_seen,
          last_seen: e.last_seen,
        }));
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch entities
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entities = action.payload;
        state.lastSync = new Date().toISOString();
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch entities';
      });

    // Add entity
    builder
      .addCase(addEntity.fulfilled, (state, action) => {
        const existing = state.entities.find((e) => e.hash === action.payload.hash);
        if (existing) {
          Object.assign(existing, action.payload);
        } else {
          state.entities.push(action.payload);
        }
      });

    // Fetch cross-references
    builder
      .addCase(fetchCrossReferences.fulfilled, (state, action) => {
        state.crossReferences = action.payload;
      });

    // Extract entities
    builder
      .addCase(extractEntitiesFromText.fulfilled, (state, action) => {
        for (const entity of action.payload) {
          const existing = state.entities.find((e) => e.hash === entity.hash);
          if (!existing) {
            state.entities.push(entity);
          }
        }
      });

    // Clear all
    builder
      .addCase(clearAllEntities.fulfilled, (state) => {
        state.entities = [];
        state.crossReferences = [];
      });
  },
});

export const {
  setFilterType,
  setSearchQuery,
  addEntityLocal,
  updateCrossReferences,
  clearError,
} = hivemindSlice.actions;

export default hivemindSlice.reducer;
