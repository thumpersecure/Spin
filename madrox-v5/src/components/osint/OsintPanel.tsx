/**
 * OsintPanel Component
 *
 * OSINT tools for phone, email, username, domain intelligence and bookmarks.
 */

import { useState, useEffect } from 'react';
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
  SimpleGrid,
  Paper,
  ThemeIcon,
  Transition,
} from '@mantine/core';
import {
  IconSearch,
  IconPhone,
  IconBookmark,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconMail,
  IconUser,
  IconWorld,
  IconAlertTriangle,
  IconShieldCheck,
} from '@tabler/icons-react';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  analyzePhone,
  analyzeEmail,
  analyzeUsername,
  analyzeDomain,
  fetchBookmarks,
  clearPhoneAnalysis,
  clearEmailAnalysis,
  clearUsernameAnalysis,
  clearDomainAnalysis,
} from '../../store/slices/osintSlice';

function OsintPanel() {
  const dispatch = useAppDispatch();
  const {
    phoneAnalysis,
    emailAnalysis,
    usernameAnalysis,
    domainAnalysis,
    bookmarks,
    bookmarkCategories,
    isLoading,
  } = useAppSelector((state) => state.osint);

  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const handlePhoneAnalyze = () => {
    if (phoneInput.trim()) {
      dispatch(analyzePhone(phoneInput.trim()));
    }
  };

  const handleEmailAnalyze = () => {
    if (emailInput.trim()) {
      dispatch(analyzeEmail(emailInput.trim()));
    }
  };

  const handleUsernameAnalyze = () => {
    if (usernameInput.trim()) {
      dispatch(analyzeUsername(usernameInput.trim()));
    }
  };

  const handleDomainAnalyze = () => {
    if (domainInput.trim()) {
      dispatch(analyzeDomain(domainInput.trim()));
    }
  };

  return (
    <Stack gap="md">
      <Group>
        <IconSearch size={20} style={{ color: 'var(--mantine-color-osintBlue-6)' }} />
        <Title order={4}>OSINT Tools</Title>
      </Group>

      <Tabs defaultValue="phone">
        <Tabs.List grow>
          <Tabs.Tab value="phone" leftSection={<IconPhone size={14} />}>
            Phone
          </Tabs.Tab>
          <Tabs.Tab value="email" leftSection={<IconMail size={14} />}>
            Email
          </Tabs.Tab>
          <Tabs.Tab value="username" leftSection={<IconUser size={14} />}>
            User
          </Tabs.Tab>
          <Tabs.Tab value="domain" leftSection={<IconWorld size={14} />}>
            Domain
          </Tabs.Tab>
          <Tabs.Tab value="bookmarks" leftSection={<IconBookmark size={14} />}>
            Resources
          </Tabs.Tab>
        </Tabs.List>

        {/* Phone Intel Tab */}
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
                onKeyDown={(e) => e.key === 'Enter' && handlePhoneAnalyze()}
                leftSection={<IconPhone size={16} />}
                style={{ flex: 1 }}
              />
              <Button onClick={handlePhoneAnalyze} loading={isLoading} disabled={!phoneInput.trim()}>
                Analyze
              </Button>
            </Group>

            <Transition mounted={!!phoneAnalysis} transition="slide-down" duration={200}>
              {(styles) => (
                <Card padding="sm" style={styles}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Analysis Results</Text>
                      <Button variant="subtle" size="xs" onClick={() => dispatch(clearPhoneAnalysis())}>
                        Clear
                      </Button>
                    </Group>

                    <Divider label="Formats" labelPosition="left" />
                    <Stack gap={4}>
                      {phoneAnalysis?.formats.map((format, i) => (
                        <FormatRow key={i} value={format} />
                      ))}
                    </Stack>

                    <Divider label="Search Queries" labelPosition="left" />
                    <Stack gap={4}>
                      {phoneAnalysis?.search_queries.map((query, i) => (
                        <SearchQueryCard key={i} query={query} />
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Transition>
          </Stack>
        </Tabs.Panel>

        {/* Email Intel Tab */}
        <Tabs.Panel value="email" pt="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Analyze email addresses and check for breaches.
            </Text>

            <Group>
              <TextInput
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAnalyze()}
                leftSection={<IconMail size={16} />}
                style={{ flex: 1 }}
              />
              <Button onClick={handleEmailAnalyze} loading={isLoading} disabled={!emailInput.trim()}>
                Analyze
              </Button>
            </Group>

            <Transition mounted={!!emailAnalysis} transition="slide-down" duration={200}>
              {(styles) => (
                <Card padding="sm" style={styles}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Email Analysis</Text>
                      <Button variant="subtle" size="xs" onClick={() => dispatch(clearEmailAnalysis())}>
                        Clear
                      </Button>
                    </Group>

                    <SimpleGrid cols={2} spacing="xs">
                      <Paper p="xs" withBorder>
                        <Text size="xs" c="dimmed">Local Part</Text>
                        <Text size="sm" ff="monospace">{emailAnalysis?.local_part}</Text>
                      </Paper>
                      <Paper p="xs" withBorder>
                        <Text size="xs" c="dimmed">Domain</Text>
                        <Text size="sm" ff="monospace">{emailAnalysis?.domain}</Text>
                      </Paper>
                    </SimpleGrid>

                    <Group gap="xs">
                      {emailAnalysis?.provider_name && (
                        <Badge color="blue" size="sm">{emailAnalysis.provider_name}</Badge>
                      )}
                      {emailAnalysis?.is_free && (
                        <Badge color="gray" size="sm">Free Provider</Badge>
                      )}
                      {emailAnalysis?.is_disposable && (
                        <Badge color="red" size="sm" leftSection={<IconAlertTriangle size={12} />}>
                          Disposable
                        </Badge>
                      )}
                      {!emailAnalysis?.is_disposable && (
                        <Badge color="green" size="sm" leftSection={<IconShieldCheck size={12} />}>
                          Valid Provider
                        </Badge>
                      )}
                    </Group>

                    <Divider label="Search Queries" labelPosition="left" />
                    <Stack gap={4}>
                      {emailAnalysis?.search_queries.map((query, i) => (
                        <SearchQueryCard key={i} query={query} />
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Transition>
          </Stack>
        </Tabs.Panel>

        {/* Username Search Tab */}
        <Tabs.Panel value="username" pt="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Search for usernames across multiple platforms.
            </Text>

            <Group>
              <TextInput
                placeholder="Enter username..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUsernameAnalyze()}
                leftSection={<IconUser size={16} />}
                style={{ flex: 1 }}
              />
              <Button onClick={handleUsernameAnalyze} loading={isLoading} disabled={!usernameInput.trim()}>
                Search
              </Button>
            </Group>

            <Transition mounted={!!usernameAnalysis} transition="slide-down" duration={200}>
              {(styles) => (
                <Card padding="sm" style={styles}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>
                        Results for: <Text span ff="monospace">{usernameAnalysis?.username}</Text>
                      </Text>
                      <Button variant="subtle" size="xs" onClick={() => dispatch(clearUsernameAnalysis())}>
                        Clear
                      </Button>
                    </Group>

                    <Divider label="Platform Links" labelPosition="left" />
                    <SimpleGrid cols={2} spacing="xs">
                      {usernameAnalysis?.platforms.map((platform, i) => (
                        <Paper key={i} p="xs" withBorder>
                          <Group justify="space-between">
                            <Text size="xs">{platform.platform}</Text>
                            <Anchor href={platform.url} target="_blank" rel="noopener noreferrer">
                              <ActionIcon variant="subtle" size="xs">
                                <IconExternalLink size={14} />
                              </ActionIcon>
                            </Anchor>
                          </Group>
                        </Paper>
                      ))}
                    </SimpleGrid>

                    <Divider label="Search Tools" labelPosition="left" />
                    <Stack gap={4}>
                      {usernameAnalysis?.search_queries.map((query, i) => (
                        <SearchQueryCard key={i} query={query} />
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Transition>
          </Stack>
        </Tabs.Panel>

        {/* Domain Recon Tab */}
        <Tabs.Panel value="domain" pt="md">
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Domain reconnaissance and infrastructure analysis.
            </Text>

            <Group>
              <TextInput
                placeholder="Enter domain (e.g., example.com)..."
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDomainAnalyze()}
                leftSection={<IconWorld size={16} />}
                style={{ flex: 1 }}
              />
              <Button onClick={handleDomainAnalyze} loading={isLoading} disabled={!domainInput.trim()}>
                Recon
              </Button>
            </Group>

            <Transition mounted={!!domainAnalysis} transition="slide-down" duration={200}>
              {(styles) => (
                <Card padding="sm" style={styles}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>
                        Domain: <Text span ff="monospace">{domainAnalysis?.domain}</Text>
                      </Text>
                      <Button variant="subtle" size="xs" onClick={() => dispatch(clearDomainAnalysis())}>
                        Clear
                      </Button>
                    </Group>

                    <SimpleGrid cols={3} spacing="xs">
                      <Anchor href={domainAnalysis?.whois_url} target="_blank">
                        <Paper p="xs" withBorder style={{ textAlign: 'center', cursor: 'pointer' }}>
                          <Text size="xs" fw={500}>WHOIS</Text>
                        </Paper>
                      </Anchor>
                      <Anchor href={domainAnalysis?.dns_url} target="_blank">
                        <Paper p="xs" withBorder style={{ textAlign: 'center', cursor: 'pointer' }}>
                          <Text size="xs" fw={500}>DNS</Text>
                        </Paper>
                      </Anchor>
                      <Anchor href={domainAnalysis?.subdomains_url} target="_blank">
                        <Paper p="xs" withBorder style={{ textAlign: 'center', cursor: 'pointer' }}>
                          <Text size="xs" fw={500}>Subdomains</Text>
                        </Paper>
                      </Anchor>
                    </SimpleGrid>

                    <Divider label="Intelligence Sources" labelPosition="left" />
                    <Stack gap={4}>
                      {domainAnalysis?.search_queries.map((query, i) => (
                        <SearchQueryCard key={i} query={query} />
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Transition>
          </Stack>
        </Tabs.Panel>

        {/* Bookmarks Tab */}
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
                                <Text size="xs" fw={500}>{bookmark.name}</Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>{bookmark.description}</Text>
                              </Stack>
                              <Anchor href={bookmark.url} target="_blank" rel="noopener noreferrer">
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
              <Text size="xs" c="dimmed" ta="center">Loading bookmarks...</Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// Helper Components
function FormatRow({ value }: { value: string }) {
  return (
    <Group justify="space-between">
      <Text size="xs" ff="monospace">{value}</Text>
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy'}>
            <ActionIcon variant="subtle" size="xs" onClick={copy}>
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

interface SearchQueryCardProps {
  query: {
    platform: string;
    url: string;
    description: string;
  };
}

function SearchQueryCard({ query }: SearchQueryCardProps) {
  return (
    <Card padding="xs" withBorder>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="xs" fw={500}>{query.platform}</Text>
          <Text size="xs" c="dimmed">{query.description}</Text>
        </Stack>
        <Anchor href={query.url} target="_blank" rel="noopener noreferrer">
          <ActionIcon variant="subtle" size="sm">
            <IconExternalLink size={14} />
          </ActionIcon>
        </Anchor>
      </Group>
    </Card>
  );
}

export default OsintPanel;
