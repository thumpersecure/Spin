/**
 * OsintPanel Component
 *
 * OSINT tools for phone intelligence, bookmarks, and entity extraction.
 */

import { useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Text,
  Card,
  TextInput,
  Button,
  Tabs,
  Divider,
  Badge,
  ActionIcon,
  CopyButton,
  Tooltip,
  Accordion,
  Anchor,
} from '@mantine/core';
import {
  IconSearch,
  IconPhone,
  IconBookmark,
  IconCopy,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import { analyzePhone, clearPhoneAnalysis } from '../../store/slices/osintSlice';

function OsintPanel() {
  const dispatch = useAppDispatch();
  const { phoneAnalysis, bookmarks, bookmarkCategories, isLoading } = useAppSelector(
    (state) => state.osint
  );
  const [phoneInput, setPhoneInput] = useState('');

  const handlePhoneAnalyze = () => {
    if (phoneInput.trim()) {
      dispatch(analyzePhone(phoneInput.trim()));
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePhoneAnalyze();
    }
  };

  return (
    <Stack gap="md">
      <Group>
        <IconSearch size={20} style={{ color: 'var(--mantine-color-osintBlue-6)' }} />
        <Title order={4}>OSINT Tools</Title>
      </Group>

      <Tabs defaultValue="phone">
        <Tabs.List>
          <Tabs.Tab value="phone" leftSection={<IconPhone size={14} />}>
            Phone Intel
          </Tabs.Tab>
          <Tabs.Tab value="bookmarks" leftSection={<IconBookmark size={14} />}>
            Resources
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="phone" pt="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Analyze phone numbers and generate search queries.
            </Text>

            <Group>
              <TextInput
                placeholder="Enter phone number..."
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                leftSection={<IconPhone size={16} />}
                style={{ flex: 1 }}
              />
              <Button
                onClick={handlePhoneAnalyze}
                loading={isLoading}
                disabled={!phoneInput.trim()}
              >
                Analyze
              </Button>
            </Group>

            {phoneAnalysis && (
              <Card padding="sm">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Analysis Results
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => dispatch(clearPhoneAnalysis())}
                    >
                      Clear
                    </Button>
                  </Group>

                  <Divider label="Formats" labelPosition="left" />

                  <Stack gap={4}>
                    {phoneAnalysis.formats.map((format, i) => (
                      <Group key={i} justify="space-between">
                        <Text size="xs" ff="monospace">
                          {format}
                        </Text>
                        <CopyButton value={format}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copied' : 'Copy'}>
                              <ActionIcon
                                variant="subtle"
                                size="xs"
                                onClick={copy}
                              >
                                {copied ? (
                                  <IconCheck size={14} />
                                ) : (
                                  <IconCopy size={14} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    ))}
                  </Stack>

                  <Divider label="Search Queries" labelPosition="left" />

                  <Stack gap={4}>
                    {phoneAnalysis.search_queries.map((query, i) => (
                      <Card key={i} padding="xs" withBorder>
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text size="xs" fw={500}>
                              {query.platform}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {query.description}
                            </Text>
                          </Stack>
                          <Anchor
                            href={query.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ActionIcon variant="subtle" size="sm">
                              <IconExternalLink size={14} />
                            </ActionIcon>
                          </Anchor>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="bookmarks" pt="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Curated OSINT resources organized by category.
            </Text>

            <Accordion>
              {bookmarkCategories.map((category) => (
                <Accordion.Item key={category} value={category}>
                  <Accordion.Control>
                    <Group gap="xs">
                      <Text size="sm">{category}</Text>
                      <Badge size="xs" color="gray">
                        {bookmarks.filter((b) => b.category === category).length}
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {bookmarks
                        .filter((b) => b.category === category)
                        .map((bookmark) => (
                          <Card key={bookmark.id} padding="xs" withBorder>
                            <Group justify="space-between" wrap="nowrap">
                              <Stack gap={0}>
                                <Text size="xs" fw={500}>
                                  {bookmark.name}
                                </Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {bookmark.description}
                                </Text>
                              </Stack>
                              <Anchor
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ActionIcon variant="subtle" size="sm">
                                  <IconExternalLink size={14} />
                                </ActionIcon>
                              </Anchor>
                            </Group>
                          </Card>
                        ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            {bookmarkCategories.length === 0 && (
              <Text size="xs" c="dimmed" ta="center">
                Loading bookmarks...
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default OsintPanel;
