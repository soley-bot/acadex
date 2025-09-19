/**
 * Reusable Statistics Cards Component
 * Eliminates duplicate Card patterns for dashboard statistics display
 * Now using Mantine UI components for better design
 * 
 * Replaces 4+ duplicate Card variant='interactive' patterns with single component
 */

import React from 'react'
import { Paper, Text, Group, ThemeIcon, Stack, Badge, rem, SimpleGrid } from '@mantine/core'

export interface StatCardData {
  id: string
  label: string
  value: number | string
  description: string
  icon: React.ComponentType<{ size?: string | number }>
  colorTheme: 'blue' | 'green' | 'orange' | 'violet' | 'red'
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
}

interface StatsCardsProps {
  stats: StatCardData[]
  className?: string
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  className = ""
}) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" className={className}>
      {stats.map(({ id, label, value, description, icon: Icon, colorTheme, trend }) => (
        <Paper key={id} p="lg" radius="md" withBorder shadow="sm" style={{ cursor: 'pointer' }}
               className="hover:shadow-lg transition-shadow">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs" flex={1}>
                <Text size="sm" c="dimmed" fw={500}>
                  {label}
                </Text>
                <Text size="xl" fw={700}>
                  {value}
                </Text>
                <Text size="xs" c="dimmed">
                  {description}
                </Text>
              </Stack>
              
              <ThemeIcon size="lg" variant="light" color={colorTheme}>
                <Icon size="1.5rem" />
              </ThemeIcon>
            </Group>

            {trend && (
              <Group gap="xs">
                <Badge 
                  color={trend.isPositive ? 'green' : 'red'} 
                  variant="light" 
                  size="sm"
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Badge>
                <Text size="xs" c="dimmed">
                  {trend.label}
                </Text>
              </Group>
            )}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  )
}