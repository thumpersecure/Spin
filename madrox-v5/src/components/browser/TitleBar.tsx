/**
 * TitleBar Component
 *
 * Custom window title bar with Spin branding.
 */

import { Group, Text, ActionIcon, Box, Badge } from '@mantine/core';
import {
  IconMinus,
  IconSquare,
  IconX,
  IconUsers,
  IconBrain,
  IconSearch,
  IconSettings,
  IconNetwork,
  IconShieldLock,
} from '@tabler/icons-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { useAppDispatch, useAppSelector } from '../../store';
import { togglePanel, PanelType } from '../../store/slices/uiSlice';

function TitleBar() {
  const dispatch = useAppDispatch();
  const { activePanel } = useAppSelector((state) => state.ui);
  const { activeIdentityId, identities } = useAppSelector((state) => state.identity);
  const { crossReferences } = useAppSelector((state) => state.hivemind);

  const activeIdentity = identities.find((i) => i.id === activeIdentityId);

  const handleMinimize = () => {
    getCurrentWindow().minimize();
  };

  const handleMaximize = () => {
    getCurrentWindow().toggleMaximize();
  };

  const handleClose = () => {
    getCurrentWindow().close();
  };

  const handlePanelToggle = (panel: PanelType) => {
    dispatch(togglePanel(panel));
  };

  return (
    <Box
      className="titlebar-drag-region"
      style={{
        height: 40,
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderBottom: '1px solid var(--mantine-color-dark-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 0,
      }}
    >
      {/* Left: Logo and identity */}
      <Group gap="md" className="titlebar-no-drag">
        <Group gap={6}>
          <Text
            fw={700}
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #7b1feb 0%, #1cdf66 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SPIN
          </Text>
          <Text size="xs" c="dimmed">
            JJ v12
          </Text>
        </Group>

        {activeIdentity && (
          <Badge
            variant="dot"
            color={activeIdentity.id === 'prime' ? 'madroxPurple' : 'hivemindGreen'}
            size="sm"
          >
            {activeIdentity.name} ({activeIdentity.fingerprint.id})
          </Badge>
        )}
      </Group>

      {/* Center: Panel toggles */}
      <Group gap={4} className="titlebar-no-drag">
        <ActionIcon
          variant={activePanel === 'identity' ? 'filled' : 'subtle'}
          color={activePanel === 'identity' ? 'madroxPurple' : 'gray'}
          onClick={() => handlePanelToggle('identity')}
          title="Identities (Dupes)"
        >
          <IconUsers size={18} />
        </ActionIcon>

        <ActionIcon
          variant={activePanel === 'hivemind' ? 'filled' : 'subtle'}
          color={activePanel === 'hivemind' ? 'hivemindGreen' : 'gray'}
          onClick={() => handlePanelToggle('hivemind')}
          title="Hivemind"
          style={{ position: 'relative' }}
        >
          <IconNetwork size={18} />
          {crossReferences.length > 0 && (
            <Badge
              size="xs"
              color="red"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                padding: 0,
              }}
            >
              {crossReferences.length}
            </Badge>
          )}
        </ActionIcon>

        <ActionIcon
          variant={activePanel === 'mcp' ? 'filled' : 'subtle'}
          color={activePanel === 'mcp' ? 'osintBlue' : 'gray'}
          onClick={() => handlePanelToggle('mcp')}
          title="MCP Agents"
        >
          <IconBrain size={18} />
        </ActionIcon>

        <ActionIcon
          variant={activePanel === 'osint' ? 'filled' : 'subtle'}
          color={activePanel === 'osint' ? 'osintBlue' : 'gray'}
          onClick={() => handlePanelToggle('osint')}
          title="OSINT Tools"
        >
          <IconSearch size={18} />
        </ActionIcon>

        <ActionIcon
          variant={activePanel === 'privacy' ? 'filled' : 'subtle'}
          color={activePanel === 'privacy' ? 'violet' : 'gray'}
          onClick={() => handlePanelToggle('privacy')}
          title="Dynamic Privacy"
        >
          <IconShieldLock size={18} />
        </ActionIcon>

        <ActionIcon
          variant={activePanel === 'settings' ? 'filled' : 'subtle'}
          color={activePanel === 'settings' ? 'gray' : 'gray'}
          onClick={() => handlePanelToggle('settings')}
          title="Settings"
        >
          <IconSettings size={18} />
        </ActionIcon>
      </Group>

      {/* Right: Window controls */}
      <Group gap={0} className="window-controls">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleMinimize}
          style={{ borderRadius: 0, height: 40, width: 46 }}
        >
          <IconMinus size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleMaximize}
          style={{ borderRadius: 0, height: 40, width: 46 }}
        >
          <IconSquare size={14} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleClose}
          style={{
            borderRadius: 0,
            height: 40,
            width: 46,
            '&:hover': { backgroundColor: 'var(--mantine-color-red-6)' },
          }}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default TitleBar;
