/**
 * SettingsPanel Component
 *
 * Application settings and configuration.
 */

import { Stack, Text, Title, Switch, Divider, Group, Button } from '@mantine/core';
import { IconSettings, IconTrash, IconDownload, IconUpload } from '@tabler/icons-react';

function SettingsPanel() {
  return (
    <Stack gap="md">
      <Group>
        <IconSettings size={20} />
        <Title order={4}>Settings</Title>
      </Group>

      <Divider label="Privacy" labelPosition="left" />

      <Switch
        label="Block trackers"
        description="Block known tracking domains"
        defaultChecked
      />

      <Switch
        label="Clear on exit"
        description="Clear browsing data when closing"
        defaultChecked
      />

      <Switch
        label="Tor integration"
        description="Route traffic through Tor network"
      />

      <Switch
        label="Anti-fingerprinting"
        description="Randomize browser fingerprint"
        defaultChecked
      />

      <Divider label="Hivemind" labelPosition="left" />

      <Switch
        label="Auto-extract entities"
        description="Automatically extract entities from pages"
        defaultChecked
      />

      <Switch
        label="Cross-reference alerts"
        description="Notify when entities are found by multiple identities"
        defaultChecked
      />

      <Divider label="MCP" labelPosition="left" />

      <Switch
        label="Enable MCP agents"
        description="Allow AI agents to assist with research"
        defaultChecked
      />

      <Divider label="Data" labelPosition="left" />

      <Group>
        <Button
          variant="light"
          leftSection={<IconDownload size={16} />}
          size="xs"
        >
          Export Data
        </Button>
        <Button
          variant="light"
          leftSection={<IconUpload size={16} />}
          size="xs"
        >
          Import Data
        </Button>
      </Group>

      <Button
        variant="light"
        color="red"
        leftSection={<IconTrash size={16} />}
        size="xs"
      >
        Clear All Data
      </Button>

      <Divider />

      <Text size="xs" c="dimmed" ta="center">
        MADROX v5.0.0 - The Multiple Man
      </Text>
    </Stack>
  );
}

export default SettingsPanel;
