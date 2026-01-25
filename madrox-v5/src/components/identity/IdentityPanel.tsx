/**
 * IdentityPanel Component
 *
 * Manage MADROX identities (dupes).
 * "I am Legion, for we are many."
 */

import { useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Button,
  Card,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  IconUsers,
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconCopy,
  IconArrowRight,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createIdentity,
  deleteIdentity,
  switchIdentity,
  Identity,
} from '../../store/slices/identitySlice';

function IdentityPanel() {
  const dispatch = useAppDispatch();
  const { identities, activeIdentityId, isLoading } = useAppSelector(
    (state) => state.identity
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      dispatch(
        createIdentity({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        })
      );
      setNewName('');
      setNewDescription('');
      setIsCreateOpen(false);
    }
  };

  const handleSwitch = (identityId: string) => {
    dispatch(switchIdentity(identityId));
  };

  const handleDelete = (identityId: string) => {
    if (identityId !== 'prime') {
      dispatch(deleteIdentity(identityId));
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <IconUsers size={20} />
          <Title order={4}>Identities</Title>
        </Group>
        <Button
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => setIsCreateOpen(true)}
        >
          Spawn Dupe
        </Button>
      </Group>

      <Text size="xs" c="dimmed">
        Each identity has a unique fingerprint and isolated session data.
      </Text>

      <Stack gap="xs">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            isActive={identity.id === activeIdentityId}
            onSwitch={() => handleSwitch(identity.id)}
            onDelete={() => handleDelete(identity.id)}
          />
        ))}
      </Stack>

      {/* Create Modal */}
      <Modal
        opened={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Spawn New Dupe"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g., Analyst, Ghost, Burner"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Optional description for this identity"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={isLoading}>
              Spawn
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

interface IdentityCardProps {
  identity: Identity;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}

function IdentityCard({ identity, isActive, onSwitch, onDelete }: IdentityCardProps) {
  const isPrime = identity.id === 'prime';

  return (
    <Card
      padding="sm"
      style={{
        backgroundColor: isActive
          ? 'var(--mantine-color-dark-6)'
          : 'var(--mantine-color-dark-7)',
        borderLeft: `3px solid ${
          isPrime
            ? 'var(--mantine-color-madroxPurple-6)'
            : isActive
            ? 'var(--mantine-color-hivemindGreen-6)'
            : 'var(--mantine-color-dark-5)'
        }`,
        cursor: 'pointer',
      }}
      onClick={onSwitch}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={500} size="sm">
              {identity.name}
            </Text>
            {isPrime && (
              <Badge size="xs" color="madroxPurple" variant="light">
                PRIME
              </Badge>
            )}
            {isActive && !isPrime && (
              <Badge size="xs" color="hivemindGreen" variant="light">
                ACTIVE
              </Badge>
            )}
          </Group>

          <Text size="xs" c="dimmed" ff="monospace">
            {identity.fingerprint.id}
          </Text>

          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {identity.tab_count} tabs
            </Text>
            <Text size="xs" c="dimmed">
              {identity.entities_found} entities
            </Text>
          </Group>
        </Stack>

        <Menu shadow="md" width={160}>
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
            <Menu.Item leftSection={<IconArrowRight size={14} />} onClick={onSwitch}>
              Switch to
            </Menu.Item>
            <Menu.Item leftSection={<IconCopy size={14} />}>
              Clone Session
            </Menu.Item>
            <Menu.Item leftSection={<IconEdit size={14} />}>
              Edit
            </Menu.Item>
            {!isPrime && (
              <>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={onDelete}
                >
                  Absorb (Delete)
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

export default IdentityPanel;
