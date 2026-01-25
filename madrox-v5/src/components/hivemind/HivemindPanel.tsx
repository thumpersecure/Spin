/**
 * HivemindPanel Component
 *
 * View and manage the collective intelligence of all identities.
 */

import {
  Stack,
  Title,
  Group,
  Text,
  Card,
  Badge,
  TextInput,
  Select,
  Divider,
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import {
  IconNetwork,
  IconSearch,
  IconMail,
  IconPhone,
  IconWorld,
  IconLink,
  IconUser,
  IconHash,
  IconCurrencyBitcoin,
  IconAlertTriangle,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  setFilterType,
  setSearchQuery,
  Entity,
  EntityType,
  CrossReference,
} from '../../store/slices/hivemindSlice';

const ENTITY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'ip_v4', label: 'IPv4' },
  { value: 'ip_v6', label: 'IPv6' },
  { value: 'domain', label: 'Domain' },
  { value: 'url', label: 'URL' },
  { value: 'username', label: 'Username' },
  { value: 'hashtag', label: 'Hashtag' },
  { value: 'bitcoin_address', label: 'Bitcoin' },
  { value: 'ethereum_address', label: 'Ethereum' },
];

function HivemindPanel() {
  const dispatch = useAppDispatch();
  const { entities, crossReferences, filterType, searchQuery } = useAppSelector(
    (state) => state.hivemind
  );

  // Filter entities
  const filteredEntities = entities.filter((entity) => {
    const matchesType = filterType === 'all' || entity.entity_type === filterType;
    const matchesSearch =
      !searchQuery ||
      entity.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Stack gap="md">
      <Group>
        <IconNetwork size={20} style={{ color: 'var(--mantine-color-hivemindGreen-6)' }} />
        <Title order={4}>Hivemind</Title>
        <Badge color="hivemindGreen" variant="light">
          {entities.length} entities
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        All intelligence discovered by any identity is synchronized here.
      </Text>

      {/* Cross-reference alert */}
      {crossReferences.length > 0 && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Cross-References Detected"
          color="orange"
          variant="light"
        >
          {crossReferences.length} entities found by multiple identities
        </Alert>
      )}

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search entities..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          style={{ flex: 1 }}
          size="xs"
        />
        <Select
          data={ENTITY_TYPE_OPTIONS}
          value={filterType}
          onChange={(value) => dispatch(setFilterType((value as EntityType) || 'all'))}
          size="xs"
          style={{ width: 140 }}
        />
      </Group>

      <Divider label="Cross-References" labelPosition="left" />

      {/* Cross-references list */}
      {crossReferences.length > 0 ? (
        <Stack gap="xs">
          {crossReferences.slice(0, 5).map((ref) => (
            <CrossRefCard key={ref.entity_hash} crossRef={ref} />
          ))}
        </Stack>
      ) : (
        <Text size="xs" c="dimmed" ta="center">
          No cross-references yet
        </Text>
      )}

      <Divider label={`Entities (${filteredEntities.length})`} labelPosition="left" />

      {/* Entities list */}
      <Stack gap="xs">
        {filteredEntities.slice(0, 20).map((entity) => (
          <EntityCard key={entity.hash} entity={entity} />
        ))}
        {filteredEntities.length === 0 && (
          <Text size="xs" c="dimmed" ta="center">
            No entities found
          </Text>
        )}
        {filteredEntities.length > 20 && (
          <Text size="xs" c="dimmed" ta="center">
            Showing 20 of {filteredEntities.length} entities
          </Text>
        )}
      </Stack>
    </Stack>
  );
}

interface CrossRefCardProps {
  crossRef: CrossReference;
}

function CrossRefCard({ crossRef }: CrossRefCardProps) {
  return (
    <Card
      padding="xs"
      className="cross-reference"
      style={{
        background:
          'linear-gradient(90deg, rgba(123, 31, 235, 0.1) 0%, rgba(28, 223, 102, 0.1) 100%)',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <EntityIcon type={crossRef.entity_type} />
          <Stack gap={0}>
            <Text size="xs" ff="monospace">
              {crossRef.value.length > 30
                ? crossRef.value.slice(0, 30) + '...'
                : crossRef.value}
            </Text>
            <Text size="xs" c="dimmed">
              Found by {crossRef.identity_ids.length} identities
            </Text>
          </Stack>
        </Group>
        <Badge color="orange" size="xs">
          {crossRef.total_occurrences}x
        </Badge>
      </Group>
    </Card>
  );
}

interface EntityCardProps {
  entity: Entity;
}

function EntityCard({ entity }: EntityCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(entity.value);
  };

  return (
    <Card padding="xs">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <EntityIcon type={entity.entity_type} />
          <Stack gap={0}>
            <Text size="xs" ff="monospace">
              {entity.value.length > 35
                ? entity.value.slice(0, 35) + '...'
                : entity.value}
            </Text>
            <Text size="xs" c="dimmed">
              {entity.sources.length} source(s) | {entity.occurrence_count}x
            </Text>
          </Stack>
        </Group>
        <Group gap={4}>
          <Tooltip label="Copy">
            <ActionIcon variant="subtle" size="xs" onClick={handleCopy}>
              <IconCopy size={14} />
            </ActionIcon>
          </Tooltip>
          {entity.entity_type === 'url' && (
            <Tooltip label="Open">
              <ActionIcon variant="subtle" size="xs">
                <IconExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}

function EntityIcon({ type }: { type: EntityType }) {
  const iconProps = { size: 16 };

  switch (type) {
    case 'email':
      return <IconMail {...iconProps} style={{ color: 'var(--mantine-color-blue-5)' }} />;
    case 'phone':
      return <IconPhone {...iconProps} style={{ color: 'var(--mantine-color-green-5)' }} />;
    case 'ip_v4':
    case 'ip_v6':
      return <IconWorld {...iconProps} style={{ color: 'var(--mantine-color-violet-5)' }} />;
    case 'domain':
      return <IconWorld {...iconProps} style={{ color: 'var(--mantine-color-orange-5)' }} />;
    case 'url':
      return <IconLink {...iconProps} style={{ color: 'var(--mantine-color-cyan-5)' }} />;
    case 'username':
      return <IconUser {...iconProps} style={{ color: 'var(--mantine-color-pink-5)' }} />;
    case 'hashtag':
      return <IconHash {...iconProps} style={{ color: 'var(--mantine-color-grape-5)' }} />;
    case 'bitcoin_address':
    case 'ethereum_address':
      return <IconCurrencyBitcoin {...iconProps} style={{ color: 'var(--mantine-color-yellow-5)' }} />;
    default:
      return <IconWorld {...iconProps} />;
  }
}

export default HivemindPanel;
