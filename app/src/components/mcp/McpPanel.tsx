/**
 * McpPanel Component
 *
 * MCP (Model Context Protocol) agents and skills interface.
 */

import { useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Text,
  Card,
  Badge,
  ActionIcon,
  Textarea,
  Tabs,
  ScrollArea,
  Tooltip,
  ThemeIcon,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconBrain,
  IconSend,
  IconSearch,
  IconNetwork,
  IconFileText,
  IconShield,
  IconPlayerPlay,
  IconUsers,
  IconGhost,
  IconCurrencyBitcoin,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectAgent,
  addMessage,
  invokeAgent,
  clearError,
  Agent,
  AgentStatus,
} from '../../store/slices/mcpSlice';

const AGENT_ICONS: Record<string, typeof IconBrain> = {
  analyst: IconBrain,
  gatherer: IconSearch,
  correlator: IconNetwork,
  reporter: IconFileText,
  opsec: IconShield,
  social: IconUsers,
  darkweb: IconGhost,
  crypto: IconCurrencyBitcoin,
};

const AGENT_COLORS: Record<string, string> = {
  analyst: 'blue',
  gatherer: 'cyan',
  correlator: 'grape',
  reporter: 'teal',
  opsec: 'green',
  social: 'pink',
  darkweb: 'dark',
  crypto: 'orange',
};

function McpPanel() {
  const dispatch = useAppDispatch();
  const { agents, selectedAgentId, messages, isLoading, error, isConnected } = useAppSelector(
    (state) => state.mcp
  );
  const [input, setInput] = useState('');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const agentMessages = messages.filter((m) => m.agentId === selectedAgentId);

  const handleSend = async () => {
    if (!selectedAgentId || !input.trim()) return;

    const task = input.trim();
    setInput('');

    // Clear any previous error
    dispatch(clearError());

    // Add user message first, then invoke agent sequentially
    dispatch(
      addMessage({
        agentId: selectedAgentId,
        role: 'user',
        content: task,
      })
    );

    // Invoke agent after message is added
    try {
      await dispatch(
        invokeAgent({
          agentId: selectedAgentId,
          task,
        })
      ).unwrap();
    } catch (err) {
      // Error state is already set by the rejected case in the slice.
      // Add an error message to the chat so the user sees it inline.
      dispatch(
        addMessage({
          agentId: selectedAgentId,
          role: 'agent',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        })
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <IconBrain size={20} style={{ color: 'var(--mantine-color-osintBlue-6)' }} />
          <Title order={4}>MCP Agents</Title>
        </Group>
        <Badge color={isConnected ? 'green' : 'red'} variant="dot">
          {isConnected ? 'Connected' : 'Offline'}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        AI-powered sub-agents for enhanced OSINT capabilities.
      </Text>

      <Tabs defaultValue="agents">
        <Tabs.List>
          <Tabs.Tab value="agents">Agents</Tabs.Tab>
          <Tabs.Tab value="chat" disabled={!selectedAgentId}>
            Chat
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="agents" pt="md">
          <Stack gap="xs">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                onSelect={() => dispatch(selectAgent(agent.id))}
              />
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="chat" pt="md">
          {selectedAgent && (
            <Stack gap="md" style={{ height: 400 }}>
              <Card padding="xs" withBorder>
                <Group>
                  <AgentIcon agentId={selectedAgent.id} />
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {selectedAgent.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {selectedAgent.description}
                    </Text>
                  </Stack>
                </Group>
              </Card>

              {error && (
                <Alert
                  color="red"
                  title="Agent Error"
                  icon={<IconAlertTriangle size={16} />}
                  withCloseButton
                  onClose={() => dispatch(clearError())}
                >
                  {error}
                </Alert>
              )}

              <ScrollArea style={{ flex: 1 }} type="hover">
                <Stack gap="xs">
                  {agentMessages.map((message) => (
                    <Card
                      key={message.id}
                      padding="xs"
                      style={{
                        backgroundColor:
                          message.role === 'user'
                            ? 'var(--mantine-color-dark-6)'
                            : 'var(--mantine-color-dark-7)',
                        marginLeft: message.role === 'user' ? 'auto' : 0,
                        marginRight: message.role === 'agent' ? 'auto' : 0,
                        maxWidth: '80%',
                      }}
                    >
                      <Text size="xs">{message.content}</Text>
                    </Card>
                  ))}
                  {agentMessages.length === 0 && !isLoading && (
                    <Text size="xs" c="dimmed" ta="center">
                      Start a conversation with {selectedAgent.name}
                    </Text>
                  )}
                  {isLoading && (
                    <Group justify="center" gap="xs" py="sm">
                      <Loader size="xs" color="osintBlue" />
                      <Text size="xs" c="dimmed">
                        {selectedAgent.name} is thinking...
                      </Text>
                    </Group>
                  )}
                </Stack>
              </ScrollArea>

              <Group gap="xs">
                <Textarea
                  placeholder={`Ask ${selectedAgent.name}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autosize
                  minRows={1}
                  maxRows={3}
                  style={{ flex: 1 }}
                  disabled={isLoading}
                />
                <ActionIcon
                  variant="filled"
                  color="osintBlue"
                  size="lg"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  loading={isLoading}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <Card
      padding="sm"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected
          ? 'var(--mantine-color-dark-6)'
          : 'var(--mantine-color-dark-7)',
        borderLeft: isSelected
          ? '3px solid var(--mantine-color-osintBlue-6)'
          : '3px solid transparent',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm">
          <AgentIcon agentId={agent.id} />
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              {agent.name}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {agent.description}
            </Text>
          </Stack>
        </Group>
        <Group gap="xs">
          <StatusBadge status={agent.status} />
          <Tooltip label="Quick invoke">
            <ActionIcon variant="subtle" size="sm">
              <IconPlayerPlay size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}

function AgentIcon({ agentId }: { agentId: string }) {
  const Icon = AGENT_ICONS[agentId] || IconBrain;
  const color = AGENT_COLORS[agentId] || 'blue';
  return (
    <ThemeIcon variant="light" color={color} size="md">
      <Icon size={16} />
    </ThemeIcon>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const colors: Record<AgentStatus, string> = {
    ready: 'green',
    busy: 'yellow',
    offline: 'gray',
    error: 'red',
  };

  return (
    <Badge size="xs" color={colors[status]} variant="dot">
      {status}
    </Badge>
  );
}

export default McpPanel;
