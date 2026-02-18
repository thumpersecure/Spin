/**
 * MCP (Model Context Protocol) State Slice
 *
 * Manages AI agents and their skills.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/core';

export type AgentStatus = 'ready' | 'busy' | 'offline' | 'error';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  skills: string[];
  icon: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  parameters: string[];
}

export interface AgentMessage {
  id: string;
  agentId: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export interface AgentResponse {
  agent_id: string;
  task: string;
  result: string;
  confidence: number;
  suggestions: string[];
  entities_found: string[];
  timestamp: string;
}

interface McpState {
  agents: Agent[];
  selectedAgentId: string | null;
  skills: Record<string, AgentSkill[]>;
  messages: AgentMessage[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

const initialState: McpState = {
  agents: [],
  selectedAgentId: null,
  skills: {},
  messages: [],
  isLoading: false,
  error: null,
  isConnected: false,
};

// Async thunks
export const fetchAgents = createAsyncThunk(
  'mcp/fetchAgents',
  async () => {
    const agents = await invoke<Agent[]>('get_agents');
    return agents;
  }
);

export const fetchAgentSkills = createAsyncThunk(
  'mcp/fetchSkills',
  async (agentId: string) => {
    const skills = await invoke<AgentSkill[]>('get_agent_skills', { agentId });
    return { agentId, skills };
  }
);

export const invokeAgent = createAsyncThunk(
  'mcp/invokeAgent',
  async (params: { agentId: string; task: string; context?: object }) => {
    const response = await invoke<AgentResponse>('invoke_agent', {
      invocation: {
        agent_id: params.agentId,
        task: params.task,
        context: params.context,
      },
    });
    return response;
  }
);

export const executeSkill = createAsyncThunk(
  'mcp/executeSkill',
  async (params: { agentId: string; skillId: string; parameters: object }) => {
    const result = await invoke<object>('execute_skill', {
      agentId: params.agentId,
      skillId: params.skillId,
      parameters: params.parameters,
    });
    return result;
  }
);

const mcpSlice = createSlice({
  name: 'mcp',
  initialState,
  reducers: {
    selectAgent: (state, action: PayloadAction<string | null>) => {
      state.selectedAgentId = action.payload;
    },

    addMessage: (state, action: PayloadAction<Omit<AgentMessage, 'id' | 'timestamp'>>) => {
      state.messages.push({
        ...action.payload,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    setAgentStatus: (state, action: PayloadAction<{ agentId: string; status: AgentStatus }>) => {
      const agent = state.agents.find((a) => a.id === action.payload.agentId);
      if (agent) {
        agent.status = action.payload.status;
      }
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch agents
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload;
        state.isConnected = true;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch agents';
        state.isConnected = false;
      });

    // Fetch skills
    builder
      .addCase(fetchAgentSkills.fulfilled, (state, action) => {
        state.skills[action.payload.agentId] = action.payload.skills;
      });

    // Invoke agent
    builder
      .addCase(invokeAgent.pending, (state, action) => {
        const agentId = action.meta.arg?.agentId;
        if (agentId) {
          const agent = state.agents.find((a) => a.id === agentId);
          if (agent) {
            agent.status = 'busy';
          }
        }
      })
      .addCase(invokeAgent.fulfilled, (state, action) => {
        const agent = state.agents.find((a) => a.id === action.payload.agent_id);
        if (agent) {
          agent.status = 'ready';
        }
        // Add response as agent message
        state.messages.push({
          id: `msg-${Date.now()}`,
          agentId: action.payload.agent_id,
          role: 'agent',
          content: action.payload.result,
          timestamp: action.payload.timestamp,
        });
      })
      .addCase(invokeAgent.rejected, (state, action) => {
        const agentId = action.meta.arg?.agentId;
        if (agentId) {
          const agent = state.agents.find((a) => a.id === agentId);
          if (agent) {
            agent.status = 'error';
          }
        }
        const agentLabel = agentId ? `Agent "${agentId}"` : 'Agent';
        state.error = action.error.message
          ? `${agentLabel} invocation failed: ${action.error.message}`
          : `${agentLabel} invocation failed`;
      });
  },
});

export const {
  selectAgent,
  addMessage,
  clearMessages,
  setAgentStatus,
  setConnected,
  clearError,
} = mcpSlice.actions;

export default mcpSlice.reducer;
