/**
 * InvestigationTimeline Component
 *
 * Vertical timeline visualization for investigation events.
 * "Jessica Jones" style case board - every action, every discovery,
 * every note pinned to the wall in chronological order.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Stack,
  Group,
  Text,
  Card,
  Badge,
  Button,
  Select,
  Modal,
  TextInput,
  Textarea,
  Tooltip,
  Box,
  ScrollArea,
} from '@mantine/core';
import {
  IconWorld,
  IconSearch,
  IconPencil,
  IconBrain,
  IconLink,
  IconPhoto,
  IconDownload,
  IconFlag,
  IconFilter,
  IconUser,
  IconClock,
  IconPointFilled,
  IconAlertTriangle,
  IconBulb,
  IconTag,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  addTimelineEvent,
  TimelineEvent,
  TimelineEventType,
} from '../../store/slices/investigationSlice';

interface InvestigationTimelineProps {
  investigationId: string;
}

const EVENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Events' },
  { value: 'page_visit', label: 'Page Visits' },
  { value: 'entity_discovered', label: 'Entity Discovered' },
  { value: 'note', label: 'Notes' },
  { value: 'search_query', label: 'Searches' },
  { value: 'screenshot', label: 'Screenshots' },
  { value: 'identity_switch', label: 'Identity Switches' },
  { value: 'bookmark', label: 'Bookmarks' },
  { value: 'connection_found', label: 'Connections Found' },
  { value: 'evidence_collected', label: 'Evidence Collected' },
  { value: 'hypothesis', label: 'Hypotheses' },
  { value: 'alert', label: 'Alerts' },
  { value: 'export', label: 'Exports' },
  { value: 'custom', label: 'Custom' },
];

const EVENT_ICONS: Record<TimelineEventType, typeof IconWorld> = {
  page_visit: IconWorld,
  entity_discovered: IconSearch,
  note: IconPencil,
  search_query: IconSearch,
  screenshot: IconPhoto,
  identity_switch: IconUser,
  bookmark: IconFlag,
  export: IconDownload,
  alert: IconAlertTriangle,
  connection_found: IconLink,
  evidence_collected: IconBrain,
  hypothesis: IconBulb,
  custom: IconTag,
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  page_visit: 'blue',
  entity_discovered: 'green',
  note: 'yellow',
  search_query: 'orange',
  screenshot: 'cyan',
  identity_switch: 'pink',
  bookmark: 'lime',
  export: 'teal',
  alert: 'red',
  connection_found: 'indigo',
  evidence_collected: 'grape',
  hypothesis: 'violet',
  custom: 'gray',
};

function InvestigationTimeline({ investigationId }: InvestigationTimelineProps) {
  const dispatch = useAppDispatch();
  const { timeline } = useAppSelector((state) => state.investigation);
  const { identities, activeIdentityId } = useAppSelector((state) => state.identity);

  // Filter timeline events for this investigation
  const events = useMemo(
    () => timeline.filter((e) => e.investigation_id === investigationId),
    [timeline, investigationId]
  );

  const [filterType, setFilterType] = useState<string>('all');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const filteredEvents = useMemo(() => {
    const filtered =
      filterType === 'all'
        ? events
        : events.filter((event) => event.event_type === filterType);

    // Sort by created_at descending (newest first)
    return [...filtered].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [events, filterType]);

  const handleFilterChange = (value: string | null) => {
    setFilterType(value || 'all');
  };

  const handleAddNote = useCallback(() => {
    if (noteTitle.trim()) {
      dispatch(
        addTimelineEvent({
          investigationId,
          eventType: 'note',
          title: noteTitle.trim(),
          description: noteContent.trim() || '',
          identityId: activeIdentityId,
          importance: 2,
        })
      )
        .unwrap()
        .then(() => {
          setNoteTitle('');
          setNoteContent('');
          setIsNoteModalOpen(false);
        })
        .catch(() => {
          // Error handled by Redux state
        });
    }
  }, [dispatch, investigationId, noteTitle, noteContent, activeIdentityId]);

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
  };

  const getIdentityName = (identityId?: string): string => {
    if (!identityId) return 'Unknown';
    const identity = identities.find((i) => i.id === identityId);
    return identity?.name ?? identityId;
  };

  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderImportanceDots = (importance: number) => {
    const dots = [];
    const maxDots = 5;
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <IconPointFilled
          key={i}
          size={8}
          style={{
            color:
              i < importance
                ? importance >= 4
                  ? 'var(--mantine-color-red-5)'
                  : importance >= 3
                  ? 'var(--mantine-color-orange-5)'
                  : 'var(--mantine-color-gray-5)'
                : 'var(--mantine-color-dark-5)',
          }}
        />
      );
    }
    return dots;
  };

  return (
    <Stack gap="md">
      {/* Timeline Controls */}
      <Group justify="space-between">
        <Group gap="xs">
          <IconFilter size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Select
            data={EVENT_TYPE_OPTIONS}
            value={filterType}
            onChange={handleFilterChange}
            size="xs"
            style={{ width: 180 }}
            placeholder="Filter events"
          />
          <Badge size="sm" variant="outline" color="gray">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </Badge>
        </Group>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPencil size={14} />}
          onClick={() => setIsNoteModalOpen(true)}
        >
          Add Note
        </Button>
      </Group>

      {/* Timeline */}
      <ScrollArea style={{ maxHeight: 600 }} type="hover" offsetScrollbars>
        {filteredEvents.length === 0 ? (
          <Text size="xs" c="dimmed" ta="center" py="xl">
            {events.length === 0
              ? 'No events recorded yet. Start investigating to build your timeline.'
              : 'No events match the current filter.'}
          </Text>
        ) : (
          <Box style={{ position: 'relative', paddingLeft: 24, paddingRight: 8 }}>
            {/* Vertical line */}
            <Box
              style={{
                position: 'absolute',
                left: 11,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: 'var(--mantine-color-dark-5)',
              }}
            />

            <Stack gap="sm">
              {filteredEvents.map((event, index) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  side={index % 2 === 0 ? 'left' : 'right'}
                  identityName={getIdentityName(event.identity_id)}
                  formattedTime={formatTimestamp(event.created_at)}
                  renderImportanceDots={renderImportanceDots}
                />
              ))}
            </Stack>
          </Box>
        )}
      </ScrollArea>

      {/* Add Note Modal */}
      <Modal
        opened={isNoteModalOpen}
        onClose={handleNoteModalClose}
        title="Add Investigation Note"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Note title or summary"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />
          <Textarea
            label="Details"
            placeholder="Detailed notes, observations, or hypotheses..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            minRows={4}
            maxRows={8}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleNoteModalClose}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteTitle.trim()}>
              Add Note
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

interface TimelineEventCardProps {
  event: TimelineEvent;
  side: 'left' | 'right';
  identityName: string;
  formattedTime: string;
  renderImportanceDots: (importance: number) => JSX.Element[];
}

function TimelineEventCard({
  event,
  side,
  identityName,
  formattedTime,
  renderImportanceDots,
}: TimelineEventCardProps) {
  const Icon = EVENT_ICONS[event.event_type] || IconWorld;
  const color = EVENT_COLORS[event.event_type] || 'gray';

  return (
    <Box style={{ position: 'relative' }}>
      {/* Node dot on the timeline */}
      <Tooltip label={event.event_type.replace(/_/g, ' ')} position="left">
        <Box
          style={{
            position: 'absolute',
            left: -20,
            top: 12,
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: `var(--mantine-color-${color}-6)`,
            border: '2px solid var(--mantine-color-dark-7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Icon size={10} color="white" />
        </Box>
      </Tooltip>

      {/* Event card */}
      <Card
        padding="sm"
        style={{
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderLeft: `3px solid var(--mantine-color-${color}-6)`,
          marginLeft: side === 'right' ? 20 : 0,
          marginRight: side === 'left' ? 20 : 0,
        }}
      >
        <Stack gap={4}>
          {/* Header row: event type icon + title + importance */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
              <Icon size={14} style={{ color: `var(--mantine-color-${color}-5)`, flexShrink: 0 }} />
              <Text fw={500} size="sm" truncate>
                {event.title}
              </Text>
            </Group>
            <Group gap={2}>
              {renderImportanceDots(event.importance)}
            </Group>
          </Group>

          {/* Description */}
          {event.description && (
            <Text size="xs" c="dimmed" lineClamp={3}>
              {event.description}
            </Text>
          )}

          {/* URL if present */}
          {event.url && (
            <Text size="xs" ff="monospace" c="dimmed" truncate>
              {event.url}
            </Text>
          )}

          {/* Footer: timestamp + identity badge */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap={4}>
              <IconClock size={10} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed">
                {formattedTime}
              </Text>
            </Group>
            {event.identity_id && (
              <Badge size="xs" variant="outline" color="madroxPurple">
                {identityName}
              </Badge>
            )}
          </Group>
        </Stack>
      </Card>
    </Box>
  );
}

export default InvestigationTimeline;
