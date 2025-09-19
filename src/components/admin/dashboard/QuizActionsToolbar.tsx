/**
 * Quiz Actions Toolbar Component
 * Extracted from admin quizzes page to reduce complexity
 * Handles header, breadcrumb, and action buttons section
 * Now using Mantine UI components for better design
 */

import React from 'react'
import Link from 'next/link'
import { 
  Paper, 
  Group, 
  Button, 
  Title, 
  Text, 
  Badge, 
  Breadcrumbs, 
  Anchor, 
  Menu, 
  Box,
  ActionIcon,
  Loader,
  Flex,
  Stack,
  ThemeIcon,
  Container
} from '@mantine/core'
import { 
  IconBrain, 
  IconHome, 
  IconChevronRight, 
  IconPlus, 
  IconEdit, 
  IconSettings, 
  IconChartBar, 
  IconChevronDown, 
  IconDownload, 
  IconUpload 
} from '@tabler/icons-react'

interface QuizStats {
  total: number
  published: number
}

interface QuizActionsToolbarProps {
  quizStats: QuizStats
  onShowCategoryManagement: () => void
  onShowAnalytics: () => void
  isLoading?: boolean
}

export const QuizActionsToolbar: React.FC<QuizActionsToolbarProps> = ({
  quizStats,
  onShowCategoryManagement,
  onShowAnalytics,
  isLoading = false
}) => {
  const breadcrumbItems = [
    { title: 'Admin', href: '/admin' },
    { title: 'Quiz Management', href: '#' }
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ))

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <Paper p="sm" bg="blue.1" withBorder>
          <Container size="xl">
            <Group justify="center" gap="xs">
              <Loader size="sm" color="blue" />
              <Text size="sm" fw={500} c="blue">Refreshing quizzes...</Text>
            </Group>
          </Container>
        </Paper>
      )}

      {/* Breadcrumb Navigation */}
      <Paper withBorder py="md">
        <Container size="xl">
          <Breadcrumbs>
            {breadcrumbItems}
          </Breadcrumbs>
        </Container>
      </Paper>

      {/* Enhanced Header Section */}
      <Container size="xl" py="xl">
        <Paper p="xl" radius="lg" withBorder shadow="sm">
          <Stack gap="xl">
            {/* Header Content */}
            <Flex justify="space-between" align="flex-start" gap="lg" wrap="wrap">
              <Group gap="lg" flex={1}>
                <ThemeIcon size="xl" variant="filled" color="blue">
                  <IconBrain size="2rem" />
                </ThemeIcon>
                <Box>
                  <Title order={1} size="h1" mb="xs">Quiz Management</Title>
                  <Text size="lg" c="dimmed">Create, edit, and manage interactive assessments for your students</Text>
                </Box>
              </Group>
              
              {/* Quick Stats */}
              <Group gap="md">
                <Paper p="sm" withBorder radius="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">Total Quizzes:</Text>
                    <Text fw={700}>{quizStats.total}</Text>
                  </Group>
                </Paper>
                <Paper p="sm" withBorder radius="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">Published:</Text>
                    <Text fw={700} c="green">{quizStats.published}</Text>
                  </Group>
                </Paper>
              </Group>
            </Flex>

            {/* Action Buttons Row */}
            <Group justify="space-between" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              {/* Primary Actions */}
              <Group gap="md">
                <Menu shadow="md" width={280}>
                  <Menu.Target>
                    <Button 
                      leftSection={<IconPlus size="1.2rem" />} 
                      rightSection={<IconChevronDown size="1rem" />}
                      size="md"
                      variant="filled"
                    >
                      Create New Quiz
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      component={Link}
                      href="/admin/quizzes/create"
                      leftSection={<IconEdit size="1rem" />}
                    >
                      <Box>
                        <Text fw={500}>Create Manually</Text>
                        <Text size="xs" c="dimmed">Build from scratch</Text>
                      </Box>
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconBrain size="1rem" />}
                      disabled
                    >
                      <Box>
                        <Text fw={500}>Create with AI</Text>
                        <Text size="xs" c="dimmed">Coming soon</Text>
                      </Box>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <Button 
                  variant="outline"
                  leftSection={<IconSettings size="1.2rem" />}
                  onClick={onShowCategoryManagement}
                  size="md"
                >
                  Manage Categories
                </Button>
              </Group>

              {/* Secondary Actions */}
              <Group gap="md">
                <Button 
                  variant="subtle"
                  leftSection={<IconChartBar size="1.2rem" />}
                  onClick={onShowAnalytics}
                  size="md"
                >
                  Analytics
                </Button>
                
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button 
                      variant="subtle"
                      rightSection={<IconChevronDown size="1rem" />}
                      size="md"
                    >
                      More
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconDownload size="1rem" />}>
                      Export Quizzes
                    </Menu.Item>
                    <Menu.Item leftSection={<IconUpload size="1rem" />}>
                      Import Quizzes
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item leftSection={<IconSettings size="1rem" />}>
                      Quiz Settings
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </>
  )
}