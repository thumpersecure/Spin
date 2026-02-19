/**
 * Investigation Timeline & Graph State Slice
 *
 * Manages OSINT investigation timelines and relationship graphs.
 * "Alias Investigations. Cases nobody else will touch."
 *
 * MADROX v12 - Jessica Jones Upgrade
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

// --- Type Definitions ---

export type TimelineEventType =
  | 'page_visit'
  | 'entity_discovered'
  | 'identity_switch'
  | 'search_query'
  | 'screenshot'
  | 'note'
  | 'bookmark'
  | 'export'
  | 'alert'
  | 'connection_found'
  | 'evidence_collected'
  | 'hypothesis'
  | 'custom';

export type InvestigationStatus =
  | 'active'
  | 'paused'
  | 'closed'
  | 'archived';

export interface TimelineEvent {
  id: string;
  investigation_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string;
  identity_id: string;
  url?: string;
  entity_hash?: string;
  importance: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface GraphNode {
  id: string;
  node_type: string;
  label: string;
  value: string;
  entity_type?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label: string;
  weight: number;
  discovered_by: string;
  context?: string;
}

export interface D3Node extends GraphNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Link {
  source: string | D3Node;
  target: string | D3Node;
  relationship: string;
  label: string;
  weight: number;
  discovered_by: string;
  context?: string;
}

export interface D3Graph {
  nodes: D3Node[];
  links: D3Link[];
}

export interface InvestigationSummary {
  id: string;
  name: string;
  description: string;
  status: InvestigationStatus;
  event_count: number;
  node_count: number;
  edge_count: number;
  created_at: string;
  updated_at: string;
}

export interface Investigation {
  id: string;
  name: string;
  description: string;
  status: InvestigationStatus;
  timeline: TimelineEvent[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  created_at: string;
  updated_at: string;
}

export interface InvestigationExport {
  investigation: Investigation;
  format: string;
  exported_at: string;
  data: string;
}

// --- State Definition ---

interface InvestigationState {
  investigations: InvestigationSummary[];
  activeInvestigationId: string | null;
  timeline: TimelineEvent[];
  graphData: D3Graph;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvestigationState = {
  investigations: [],
  activeInvestigationId: null,
  timeline: [],
  graphData: { nodes: [], links: [] },
  isLoading: false,
  error: null,
};

// --- Async Thunks ---

export const createInvestigation = createAsyncThunk(
  'investigation/create',
  async (params: { name: string; description: string }) => {
    const investigation = await invoke<Investigation>('create_investigation', {
      name: params.name,
      description: params.description,
    });
    return investigation;
  }
);

export const fetchInvestigations = createAsyncThunk(
  'investigation/fetchAll',
  async () => {
    const investigations = await invoke<InvestigationSummary[]>('get_all_investigations');
    return investigations;
  }
);

export const fetchInvestigation = createAsyncThunk(
  'investigation/fetchOne',
  async (id: string) => {
    const investigation = await invoke<Investigation>('get_investigation', { id });
    return investigation;
  }
);

export const addTimelineEvent = createAsyncThunk(
  'investigation/addTimelineEvent',
  async (params: {
    investigationId: string;
    eventType: TimelineEventType;
    title: string;
    description: string;
    identityId: string;
    url?: string;
    entityHash?: string;
    importance?: number;
    metadata?: Record<string, unknown>;
  }) => {
    const event = await invoke<TimelineEvent>('add_timeline_event', {
      investigationId: params.investigationId,
      eventType: params.eventType,
      title: params.title,
      description: params.description,
      identityId: params.identityId,
      url: params.url,
      entityHash: params.entityHash,
      importance: params.importance ?? 1,
      metadata: params.metadata,
    });
    return event;
  }
);

export const addGraphNode = createAsyncThunk(
  'investigation/addGraphNode',
  async (params: {
    investigationId: string;
    nodeId: string;
    nodeType: string;
    label: string;
    value: string;
    entityType?: string;
    color?: string;
    metadata?: Record<string, unknown>;
  }) => {
    const node = await invoke<GraphNode>('add_graph_node', {
      investigationId: params.investigationId,
      nodeId: params.nodeId,
      nodeType: params.nodeType,
      label: params.label,
      value: params.value,
      entityType: params.entityType,
      color: params.color,
      metadata: params.metadata,
    });
    return node;
  }
);

export const addGraphEdge = createAsyncThunk(
  'investigation/addGraphEdge',
  async (params: {
    investigationId: string;
    source: string;
    target: string;
    relationship: string;
    label: string;
    weight?: number;
    discoveredBy: string;
    context?: string;
  }) => {
    const edge = await invoke<GraphEdge>('add_graph_edge', {
      investigationId: params.investigationId,
      source: params.source,
      target: params.target,
      relationship: params.relationship,
      label: params.label,
      weight: params.weight ?? 1.0,
      discoveredBy: params.discoveredBy,
      context: params.context,
    });
    return edge;
  }
);

export const fetchInvestigationGraph = createAsyncThunk(
  'investigation/fetchGraph',
  async (investigationId: string) => {
    const graph = await invoke<{ nodes: GraphNode[]; edges: GraphEdge[] }>(
      'get_investigation_graph',
      { investigationId }
    );
    // Transform backend graph data into D3-compatible format
    const d3Graph: D3Graph = {
      nodes: graph.nodes.map((node) => ({ ...node })),
      links: graph.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        relationship: edge.relationship,
        label: edge.label,
        weight: edge.weight,
        discovered_by: edge.discovered_by,
        context: edge.context,
      })),
    };
    return d3Graph;
  }
);

export const fetchTimeline = createAsyncThunk(
  'investigation/fetchTimeline',
  async (params: { investigationId: string; eventTypeFilter?: TimelineEventType }) => {
    const timeline = await invoke<TimelineEvent[]>('get_investigation_timeline', {
      investigationId: params.investigationId,
      eventTypeFilter: params.eventTypeFilter,
    });
    return timeline;
  }
);

export const updateInvestigationStatus = createAsyncThunk(
  'investigation/updateStatus',
  async (params: { investigationId: string; status: InvestigationStatus }) => {
    const investigation = await invoke<InvestigationSummary>('update_investigation_status', {
      investigationId: params.investigationId,
      status: params.status,
    });
    return investigation;
  }
);

export const deleteInvestigation = createAsyncThunk(
  'investigation/delete',
  async (investigationId: string) => {
    await invoke('delete_investigation', { investigationId });
    return investigationId;
  }
);

export const exportInvestigation = createAsyncThunk(
  'investigation/export',
  async (investigationId: string) => {
    const exportData = await invoke<InvestigationExport>('export_investigation', {
      investigationId,
    });
    return exportData;
  }
);

// --- Slice ---

const investigationSlice = createSlice({
  name: 'investigation',
  initialState,
  reducers: {
    setActiveInvestigation: (state, action: PayloadAction<string | null>) => {
      state.activeInvestigationId = action.payload;
      if (action.payload === null) {
        state.timeline = [];
        state.graphData = { nodes: [], links: [] };
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create investigation
    builder
      .addCase(createInvestigation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvestigation.fulfilled, (state, action) => {
        state.isLoading = false;
        const inv = action.payload;
        state.investigations.push({
          id: inv.id,
          name: inv.name,
          description: inv.description,
          status: inv.status,
          event_count: 0,
          node_count: 0,
          edge_count: 0,
          created_at: inv.created_at,
          updated_at: inv.updated_at,
        });
        state.activeInvestigationId = inv.id;
      })
      .addCase(createInvestigation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create investigation';
      });

    // Fetch all investigations
    builder
      .addCase(fetchInvestigations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestigations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investigations = action.payload;
      })
      .addCase(fetchInvestigations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch investigations';
      });

    // Fetch single investigation
    builder
      .addCase(fetchInvestigation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestigation.fulfilled, (state, action) => {
        state.isLoading = false;
        const inv = action.payload;
        state.activeInvestigationId = inv.id;
        state.timeline = inv.timeline;
        state.graphData = {
          nodes: inv.graph.nodes.map((node) => ({ ...node })),
          links: inv.graph.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            relationship: edge.relationship,
            label: edge.label,
            weight: edge.weight,
            discovered_by: edge.discovered_by,
            context: edge.context,
          })),
        };
        // Update summary in the list
        const idx = state.investigations.findIndex((i) => i.id === inv.id);
        if (idx !== -1) {
          state.investigations[idx] = {
            ...state.investigations[idx],
            name: inv.name,
            description: inv.description,
            status: inv.status,
            event_count: inv.timeline.length,
            node_count: inv.graph.nodes.length,
            edge_count: inv.graph.edges.length,
            updated_at: inv.updated_at,
          };
        }
      })
      .addCase(fetchInvestigation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch investigation';
      });

    // Add timeline event
    builder
      .addCase(addTimelineEvent.fulfilled, (state, action) => {
        state.timeline.push(action.payload);
        // Update event count in summary
        const summary = state.investigations.find(
          (i) => i.id === action.payload.investigation_id
        );
        if (summary) {
          summary.event_count += 1;
          summary.updated_at = action.payload.created_at;
        }
      })
      .addCase(addTimelineEvent.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add timeline event';
      });

    // Add graph node
    builder
      .addCase(addGraphNode.fulfilled, (state, action) => {
        const existing = state.graphData.nodes.find((n) => n.id === action.payload.id);
        if (!existing) {
          state.graphData.nodes.push({ ...action.payload });
          // Update node count in summary
          if (state.activeInvestigationId) {
            const summary = state.investigations.find(
              (i) => i.id === state.activeInvestigationId
            );
            if (summary) {
              summary.node_count += 1;
            }
          }
        }
      })
      .addCase(addGraphNode.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add graph node';
      });

    // Add graph edge
    builder
      .addCase(addGraphEdge.fulfilled, (state, action) => {
        const edge = action.payload;
        state.graphData.links.push({
          source: edge.source,
          target: edge.target,
          relationship: edge.relationship,
          label: edge.label,
          weight: edge.weight,
          discovered_by: edge.discovered_by,
          context: edge.context,
        });
        // Update edge count in summary
        if (state.activeInvestigationId) {
          const summary = state.investigations.find(
            (i) => i.id === state.activeInvestigationId
          );
          if (summary) {
            summary.edge_count += 1;
          }
        }
      })
      .addCase(addGraphEdge.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add graph edge';
      });

    // Fetch investigation graph
    builder
      .addCase(fetchInvestigationGraph.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvestigationGraph.fulfilled, (state, action) => {
        state.isLoading = false;
        state.graphData = action.payload;
      })
      .addCase(fetchInvestigationGraph.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch investigation graph';
      });

    // Fetch timeline
    builder
      .addCase(fetchTimeline.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch timeline';
      });

    // Update investigation status
    builder
      .addCase(updateInvestigationStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.investigations.findIndex((i) => i.id === updated.id);
        if (idx !== -1) {
          state.investigations[idx] = updated;
        }
      })
      .addCase(updateInvestigationStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update investigation status';
      });

    // Delete investigation
    builder
      .addCase(deleteInvestigation.fulfilled, (state, action) => {
        state.investigations = state.investigations.filter((i) => i.id !== action.payload);
        if (state.activeInvestigationId === action.payload) {
          state.activeInvestigationId = null;
          state.timeline = [];
          state.graphData = { nodes: [], links: [] };
        }
      })
      .addCase(deleteInvestigation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete investigation';
      });

    // Export investigation
    builder
      .addCase(exportInvestigation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(exportInvestigation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportInvestigation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to export investigation';
      });
  },
});

export const { setActiveInvestigation, clearError } = investigationSlice.actions;
export default investigationSlice.reducer;
