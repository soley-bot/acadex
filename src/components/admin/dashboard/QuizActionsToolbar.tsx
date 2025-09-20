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
        <Paper 
          p="xl" 
          radius="lg" 
          withBorder 
          shadow="md"
          style={{
            background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
            borderColor: '#e9ecef',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="hover:shadow-lg transition-all duration-300"
        >
          {/* Subtle background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(229, 62, 62, 0.05) 0%, transparent 70%)',
            transform: 'translate(50%, -50%)',
          }} />
          
          <Stack gap="xl" style={{ position: 'relative' }}>
            {/* Header Content */}
            <Flex justify="space-between" align="flex-start" gap="lg" wrap="wrap">
              <Group gap="lg" flex={1}>
                <ThemeIcon size="xl" variant="gradient" gradient={{ from: 'red', to: 'pink', deg: 45 }}>
                  <IconBrain size="2rem" />
                </ThemeIcon>
                <Box>
                  <Title order={1} size="h1" mb="xs" style={{ color: '#212529' }}>Quiz Management</Title>
                  <Text size="lg" c="dimmed">Create, edit, and manage interactive assessments for your students</Text>
                </Box>
              </Group>
              
              {/* Enhanced Quick Stats */}
              <Group gap="md">
                <Paper 
                  p="md" 
                  withBorder 
                  radius="md" 
                  shadow="xs"
                  style={{ backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }}
                  className="hover:shadow-sm transition-shadow duration-200"
                >
                  <Group gap="xs">
                    <Text size="sm" c="dimmed" fw={500}>Total Quizzes:</Text>
                    <Text fw={700} c="blue" size="lg">{quizStats.total}</Text>
                  </Group>
                </Paper>
                <Paper 
                  p="md" 
                  withBorder 
                  radius="md" 
                  shadow="xs"
                  style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
                  className="hover:shadow-sm transition-shadow duration-200"
                >
                  <Group gap="xs">
                    <Text size="sm" c="dimmed" fw={500}>Published:</Text>
                    <Text fw={700} c="green" size="lg">{quizStats.published}</Text>
                  </Group>
                </Paper>
              </Group>
            </Flex>

            {/* Enhanced Action Buttons Row */}
            <Group justify="space-between" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
              {/* Primary Actions */}
              <Group gap="md">
                <Menu shadow="lg" width={300} radius="md">
                  <Menu.Target>
                    <Button 
                      leftSection={<IconPlus size="1.2rem" />} 
                      rightSection={<IconChevronDown size="1rem" />}
                      size="lg"
                      variant="gradient"
                      gradient={{ from: 'red', to: 'pink', deg: 45 }}
                      radius="md"
                      style={{ fontWeight: 600 }}
                      className="hover:transform hover:scale-105 transition-transform duration-200"
                    >
                      Create New Quiz
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown style={{ border: '1px solid #e9ecef', boxShadow: 'var(--mantine-shadow-lg)' }}>
                    <Menu.Item 
                      component={Link}
                      href="/admin/quizzes/create"
                      leftSection={<IconEdit size="1rem" />}
                      style={{ borderRadius: '6px', margin: '4px' }}
                    >
                      <Box>
                        <Text fw={500}>Create Manually</Text>
                        <Text size="xs" c="dimmed">Build from scratch</Text>
                      </Box>
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconBrain size="1rem" />}
                      disabled
                      style={{ borderRadius: '6px', margin: '4px' }}
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
                  size="lg"
                  radius="md"
                  style={{ 
                    borderColor: '#e53e3e',
                    color: '#e53e3e',
                    fontWeight: 500,
                  }}
                  className="hover:bg-red-50 hover:border-red-400 hover:transform hover:scale-105 transition-all duration-200"
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
                  size="lg"
                  radius="md"
                  c="gray.7"
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  Analytics
                </Button>
                
                <Menu shadow="lg" width={220} radius="md">
                  <Menu.Target>
                    <Button 
                      variant="subtle"
                      rightSection={<IconChevronDown size="1rem" />}
                      size="lg"
                      radius="md"
                      c="gray.7"
                      className="hover:bg-gray-100 transition-colors duration-200"
                    >
                      More Actions
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown style={{ border: '1px solid #e9ecef', boxShadow: 'var(--mantine-shadow-lg)' }}>
                    <Menu.Item 
                      leftSection={<IconDownload size="1rem" />}
                      style={{ borderRadius: '6px', margin: '2px' }}
                    >
                      Export Quizzes
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconUpload size="1rem" />}
                      style={{ borderRadius: '6px', margin: '2px' }}
                    >
                      Import Quizzes
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      leftSection={<IconSettings size="1rem" />}
                      style={{ borderRadius: '6px', margin: '2px' }}
                    >
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