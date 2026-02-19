/**
 * IdentityPanel Component
 *
 * Manage Spin identities (dupes).
 * "Every cover tells a different story."
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
  Alert,
} from '@mantine/core';
import {
  IconUsers,
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconCopy,
  IconArrowRight,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createIdentity,
  deleteIdentity,
  switchIdentity,
  clearError,
  Identity,
} from '../../store/slices/identitySlice';

function IdentityPanel() {
  const dispatch = useAppDispatch();
  const { identities, activeIdentityId, isLoading, error } = useAppSelector(
    (state) => state.identity
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      dispatch(
        createIdentity({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        })
      )
        .unwrap()
        .then(() => {
          setNewName('');
          setNewDescription('');
          setIsCreateOpen(false);
          setEditingIdentity(null);
        })
        .catch(() => {
          // Error is already captured in Redux state via rejected case
        });
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

  const handleClone = (identity: Identity) => {
    dispatch(
      createIdentity({
        name: `Copy of ${identity.name}`,
        description: identity.description,
      })
    );
  };

  const handleEdit = (identity: Identity) => {
    setEditingIdentity(identity);
    setNewName(identity.name);
    setNewDescription(identity.description || '');
    setIsCreateOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateOpen(false);
    setEditingIdentity(null);
    setNewName('');
    setNewDescription('');
  };

  const handleDismissError = () => {
    dispatch(clearError());
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

      {/* Error feedback */}
      {error && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Identity Operation Failed"
          color="red"
          variant="light"
          withCloseButton
          onClose={handleDismissError}
        >
          {error}
        </Alert>
      )}

      <Stack gap="xs">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            isActive={identity.id === activeIdentityId}
            onSwitch={() => handleSwitch(identity.id)}
            onDelete={() => handleDelete(identity.id)}
            onClone={() => handleClone(identity)}
            onEdit={() => handleEdit(identity)}
          />
        ))}
      </Stack>

      {/* Create / Edit Modal */}
      <Modal
        opened={isCreateOpen}
        onClose={handleModalClose}
        title={editingIdentity ? 'Edit Identity' : 'Spawn New Dupe'}
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
            <Button variant="subtle" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={isLoading}>
              {editingIdentity ? 'Save Changes' : 'Spawn'}
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
  onClone: () => void;
  onEdit: () => void;
}

function IdentityCard({ identity, isActive, onSwitch, onDelete, onClone, onEdit }: IdentityCardProps) {
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
            <Menu.Item leftSection={<IconCopy size={14} />} onClick={onClone}>
              Clone Session
            </Menu.Item>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
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
