'use client'

import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Card, 
  Stack, 
  Progress,
  ThemeIcon,
  Title,
  SimpleGrid
} from '@mantine/core'
import { 
  IconTrendingUp, 
  IconUsers, 
  IconBook, 
  IconCertificate,
  IconChevronRight 
} from '@tabler/icons-react'

// Example component showcasing the new Mantine UI design system
export function ModernDashboardPreview() {
  const stats = [
    {
      title: 'Total Students',
      value: '1,247',
      progress: 85,
      icon: IconUsers,
      color: 'acadexPurple',
      trend: '+12%',
    },
    {
      title: 'Active Courses', 
      value: '42',
      progress: 67,
      icon: IconBook,
      color: 'acadexViolet',
      trend: '+8%',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      progress: 94,
      icon: IconCertificate,
      color: 'acadexPurple',
      trend: '+3%',
    },
  ]

  return (
    <Stack gap="lg">
      <Title order={2} c="acadexPurple.7">
        Modern Mantine UI Design System
      </Title>
      
      <Text c="dimmed" size="sm">
        Showcasing the new Acadex Purple (#4f46e5) and Violet (#6d28d9) brand colors
      </Text>

      {/* Stats Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {stats.map((stat, index) => (
          <Card key={index} padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <ThemeIcon 
                size={40} 
                radius="md" 
                color={stat.color}
                variant="light"
              >
                <stat.icon size={20} />
              </ThemeIcon>
              <Badge 
                variant="light" 
                color="acadexViolet"
                size="sm"
              >
                {stat.trend}
              </Badge>
            </Group>

            <Text size="xl" fw={700} c={`${stat.color}.6`}>
              {stat.value}
            </Text>
            
            <Text size="sm" c="dimmed" mb="md">
              {stat.title}
            </Text>

            <Progress 
              value={stat.progress} 
              color={stat.color}
              size="sm"
              radius="md"
            />
          </Card>
        ))}
      </SimpleGrid>

      {/* Action Buttons Demo */}
      <Paper p="md" withBorder radius="md">
        <Text fw={600} mb="md">Action Buttons with Brand Colors</Text>
        <Group>
          <Button 
            color="acadexRed" 
            leftSection={<IconTrendingUp size={16} />}
          >
            Primary Action
          </Button>
          <Button 
            variant="light" 
            color="acadexBlue"
            rightSection={<IconChevronRight size={16} />}
          >
            Secondary Action
          </Button>
          <Button 
            variant="outline" 
            color="acadexRed"
          >
            Outlined
          </Button>
          <Button 
            variant="subtle" 
            color="acadexBlue"
          >
            Subtle
          </Button>
        </Group>
      </Paper>

      {/* Color Palette Demo */}
      <Paper p="md" withBorder radius="md">
        <Text fw={600} mb="md">Brand Color Palette</Text>
        <Stack gap="xs">
          <Group>
            <Text size="sm" w={100}>Primary:</Text>
            <Group gap={4}>
              {[0,1,2,3,4,5,6,7,8,9].map(shade => (
                <div
                  key={shade}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    backgroundColor: `var(--mantine-color-acadexPurple-${shade})`,
                    border: '1px solid #e0e0e0'
                  }}
                  title={`acadexPurple.${shade}`}
                />
              ))}
            </Group>
          </Group>
          <Group>
            <Text size="sm" w={100}>Secondary:</Text>
            <Group gap={4}>
              {[0,1,2,3,4,5,6,7,8,9].map(shade => (
                <div
                  key={shade}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    backgroundColor: `var(--mantine-color-acadexViolet-${shade})`,
                    border: '1px solid #e0e0e0'
                  }}
                  title={`acadexViolet.${shade}`}
                />
              ))}
            </Group>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )
}