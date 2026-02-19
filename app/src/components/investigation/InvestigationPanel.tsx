/**
 * InvestigationPanel Component
 *
 * Main panel for Spin investigation cases.
 * "Jessica Jones" investigation timeline and graph visualization.
 * Manage cases, view timelines, and explore entity relationship graphs.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Title,
  Group,
  Button,
  Card,
  Text,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Tabs,
  Alert,
  Menu,
} from '@mantine/core';
import {
  IconTimeline,
  IconPlus,
  IconGraph,
  IconDotsVertical,
  IconTrash,
  IconPlayerPause,
  IconPlayerPlay,
  IconArchive,
  IconDownload,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createInvestigation,
  fetchInvestigations,
  deleteInvestigation,
  updateInvestigationStatus,
  exportInvestigation,
  setActiveInvestigation,
  clearError,
  InvestigationSummary,
  InvestigationStatus,
} from '../../store/slices/investigationSlice';

import InvestigationTimeline from './InvestigationTimeline';
import InvestigationGraph from './InvestigationGraph';

const STATUS_COLORS: Record<InvestigationStatus, string> = {
  active: 'green',
  paused: 'yellow',
  closed: 'blue',
  archived: 'gray',
};

const STATUS_LABELS: Record<InvestigationStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
  archived: 'Archived',
};

function InvestigationPanel() {
  const dispatch = useAppDispatch();
  const { investigations, activeInvestigationId, isLoading, error } = useAppSelector(
    (state) => state.investigation
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('cases');
  const [activeSubView, setActiveSubView] = useState<'timeline' | 'graph'>('timeline');

  const selectedInvestigation = investigations.find((inv) => inv.id === activeInvestigationId);

  useEffect(() => {
    dispatch(fetchInvestigations());
  }, [dispatch]);

  const handleCreate = useCallback(() => {
    if (newName.trim()) {
      dispatch(
        createInvestigation({
          name: newName.trim(),
          description: newDescription.trim(),
        })
      )
        .unwrap()
        .then(() => {
          setNewName('');
          setNewDescription('');
          setIsCreateOpen(false);
        })
        .catch(() => {
          // Error is already captured in Redux state via rejected case
        });
    }
  }, [dispatch, newName, newDescription]);

  const handleModalClose = () => {
    setIsCreateOpen(false);
    setNewName('');
    setNewDescription('');
  };

  const handleSelectInvestigation = (investigationId: string) => {
    dispatch(setActiveInvestigation(investigationId));
    setActiveTab('active-case');
  };

  const handleStatusChange = (investigationId: string, status: InvestigationStatus) => {
    dispatch(updateInvestigationStatus({ investigationId, status }));
  };

  const handleDelete = (investigationId: string) => {
    dispatch(deleteInvestigation(investigationId));
  };

  const handleExport = (investigationId: string) => {
    dispatch(exportInvestigation(investigationId));
  };

  const handleViewTimeline = (investigationId: string) => {
    dispatch(setActiveInvestigation(investigationId));
    setActiveSubView('timeline');
    setActiveTab('active-case');
  };

  const handleViewGraph = (investigationId: string) => {
    dispatch(setActiveInvestigation(investigationId));
    setActiveSubView('graph');
    setActiveTab('active-case');
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <IconTimeline size={20} style={{ color: 'var(--mantine-color-spinPurple-6)' }} />
          <Title order={4}>Investigations</Title>
          <Badge color="spinPurple" variant="light">
            {investigations.length} cases
          </Badge>
        </Group>
        <Button
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Case
        </Button>
      </Group>

      <Text size="xs" c="dimmed">
        Track and visualize OSINT investigations with timelines and entity graphs.
      </Text>

      {/* Error feedback */}
      {error && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Investigation Error"
          color="red"
          variant="light"
          withCloseButton
          onClose={handleDismissError}
        >
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="cases" leftSection={<IconTimeline size={14} />}>
            Cases
          </Tabs.Tab>
          <Tabs.Tab
            value="active-case"
            leftSection={<IconGraph size={14} />}
            disabled={!activeInvestigationId}
          >
            Active Case
          </Tabs.Tab>
        </Tabs.List>

        {/* Cases List Tab */}
        <Tabs.Panel value="cases" pt="md">
          <Stack gap="xs">
            {investigations.length === 0 && !isLoading && (
              <Text size="xs" c="dimmed" ta="center" py="lg">
                No investigations yet. Create your first case to get started.
              </Text>
            )}
            {investigations.map((investigation) => (
              <InvestigationCard
                key={investigation.id}
                investigation={investigation}
                isSelected={investigation.id === activeInvestigationId}
                onSelect={() => handleSelectInvestigation(investigation.id)}
                onViewTimeline={() => handleViewTimeline(investigation.id)}
                onViewGraph={() => handleViewGraph(investigation.id)}
                onStatusChange={(status) => handleStatusChange(investigation.id, status)}
                onExport={() => handleExport(investigation.id)}
                onDelete={() => handleDelete(investigation.id)}
                formatDate={formatDate}
              />
            ))}
          </Stack>
        </Tabs.Panel>

        {/* Active Case Tab */}
        <Tabs.Panel value="active-case" pt="md">
          {selectedInvestigation ? (
            <Stack gap="md">
              {/* Case Header */}
              <Card
                padding="sm"
                style={{
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  borderLeft: '3px solid var(--mantine-color-spinPurple-6)',
                }}
              >
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={600} size="sm">
                        {selectedInvestigation.name}
                      </Text>
                      <Badge
                        size="xs"
                        color={STATUS_COLORS[selectedInvestigation.status]}
                        variant="light"
                      >
                        {STATUS_LABELS[selectedInvestigation.status]}
                      </Badge>
                    </Group>
                    {selectedInvestigation.description && (
                      <Text size="xs" c="dimmed">
                        {selectedInvestigation.description}
                      </Text>
                    )}
                  </Stack>
                  <Group gap="xs">
                    <Badge size="xs" variant="outline" color="gray">
                      {selectedInvestigation.node_count} nodes
                    </Badge>
                    <Badge size="xs" variant="outline" color="gray">
                      {selectedInvestigation.event_count} events
                    </Badge>
                  </Group>
                </Group>
              </Card>

              {/* Sub-view Selector */}
              <Group gap="xs">
                <Button
                  size="xs"
                  variant={activeSubView === 'timeline' ? 'filled' : 'subtle'}
                  leftSection={<IconTimeline size={14} />}
                  onClick={() => setActiveSubView('timeline')}
                >
                  Timeline
                </Button>
                <Button
                  size="xs"
                  variant={activeSubView === 'graph' ? 'filled' : 'subtle'}
                  leftSection={<IconGraph size={14} />}
                  onClick={() => setActiveSubView('graph')}
                >
                  Graph
                </Button>
              </Group>

              {/* Timeline or Graph View */}
              {activeSubView === 'timeline' ? (
                <InvestigationTimeline investigationId={selectedInvestigation.id} />
              ) : (
                <InvestigationGraph investigationId={selectedInvestigation.id} />
              )}
            </Stack>
          ) : (
            <Text size="xs" c="dimmed" ta="center" py="lg">
              Select an investigation from the Cases tab to view details.
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Create Investigation Modal */}
      <Modal
        opened={isCreateOpen}
        onClose={handleModalClose}
        title="Create New Investigation"
      >
        <Stack gap="md">
          <TextInput
            label="Case Name"
            placeholder='e.g., "Operation Nightfall", "Phishing Ring Analysis"'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the investigation objectives"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            minRows={3}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={isLoading}>
              Create Case
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

interface InvestigationCardProps {
  investigation: InvestigationSummary;
  isSelected: boolean;
  onSelect: () => void;
  onViewTimeline: () => void;
  onViewGraph: () => void;
  onStatusChange: (status: InvestigationStatus) => void;
  onExport: () => void;
  onDelete: () => void;
  formatDate: (isoString: string) => string;
}

function InvestigationCard({
  investigation,
  isSelected,
  onSelect,
  onViewTimeline,
  onViewGraph,
  onStatusChange,
  onExport,
  onDelete,
  formatDate,
}: InvestigationCardProps) {
  const isPaused = investigation.status === 'paused';
  const isActive = investigation.status === 'active';
  const isArchived = investigation.status === 'archived';

  return (
    <Card
      padding="sm"
      style={{
        backgroundColor: isSelected
          ? 'var(--mantine-color-dark-6)'
          : 'var(--mantine-color-dark-7)',
        borderLeft: `3px solid ${
          isSelected
            ? 'var(--mantine-color-spinPurple-6)'
            : `var(--mantine-color-${STATUS_COLORS[investigation.status]}-6)`
        }`,
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={500} size="sm" truncate>
              {investigation.name}
            </Text>
            <Badge
              size="xs"
              color={STATUS_COLORS[investigation.status]}
              variant="light"
            >
              {STATUS_LABELS[investigation.status]}
            </Badge>
          </Group>

          {investigation.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {investigation.description}
            </Text>
          )}

          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {investigation.node_count} nodes
            </Text>
            <Text size="xs" c="dimmed">
              {investigation.edge_count} edges
            </Text>
            <Text size="xs" c="dimmed">
              {investigation.event_count} events
            </Text>
          </Group>

          <Text size="xs" c="dimmed" ff="monospace">
            Created {formatDate(investigation.created_at)}
          </Text>
        </Stack>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item
              leftSection={<IconTimeline size={14} />}
              onClick={onViewTimeline}
            >
              View Timeline
            </Menu.Item>
            <Menu.Item
              leftSection={<IconGraph size={14} />}
              onClick={onViewGraph}
            >
              View Graph
            </Menu.Item>

            <Menu.Divider />

            {isActive && (
              <Menu.Item
                leftSection={<IconPlayerPause size={14} />}
                onClick={() => onStatusChange('paused')}
              >
                Pause Investigation
              </Menu.Item>
            )}
            {isPaused && (
              <Menu.Item
                leftSection={<IconPlayerPlay size={14} />}
                onClick={() => onStatusChange('active')}
              >
                Resume Investigation
              </Menu.Item>
            )}
            {(isActive || isPaused) && (
              <Menu.Item
                leftSection={<IconTimeline size={14} />}
                onClick={() => onStatusChange('closed')}
              >
                Close Case
              </Menu.Item>
            )}
            {!isArchived && (
              <Menu.Item
                leftSection={<IconArchive size={14} />}
                onClick={() => onStatusChange('archived')}
              >
                Archive
              </Menu.Item>
            )}

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={onExport}
            >
              Export JSON
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={onDelete}
            >
              Delete Case
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

export default InvestigationPanel;
