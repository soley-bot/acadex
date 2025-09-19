/**
 * Quiz Filters Section Component  
 * Extracted from admin quizzes page to reduce complexity
 * Handles search, category filtering, and difficulty selection
 * Now using Mantine UI components for better design
 */

import React from 'react'
import { 
  Paper, 
  TextInput, 
  Select, 
  Group, 
  Button, 
  Badge, 
  Stack, 
  Container,
  Loader,
  Menu,
  Checkbox,
  ActionIcon,
  Text
} from '@mantine/core'
import { 
  IconSearch, 
  IconFilter, 
  IconSettings,
  IconChevronDown,
  IconX
} from '@tabler/icons-react'

interface QuizFiltersSectionProps {
  searchTerm: string
  selectedCategories: string[]
  selectedDifficulty: string
  showCategoryDropdown: boolean
  categories: string[]
  difficulties: string[]
  isPending: boolean
  onSearchChange: (value: string) => void
  onCategoryChange: (categories: string[]) => void
  onDifficultyChange: (difficulty: string) => void
  onToggleCategoryDropdown: () => void
  onCloseCategoryDropdown: () => void
  onClearCategories: () => void
  onRemoveCategory: (category: string) => void
  onOpenCategoryManagement: () => void
  categoryDropdownRef: React.RefObject<HTMLDivElement>
}

export const QuizFiltersSection: React.FC<QuizFiltersSectionProps> = ({
  searchTerm,
  selectedCategories,
  selectedDifficulty,
  showCategoryDropdown,
  categories,
  difficulties,
  isPending,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onToggleCategoryDropdown,
  onCloseCategoryDropdown,
  onClearCategories,
  onRemoveCategory,
  onOpenCategoryManagement,
  categoryDropdownRef
}) => {
  const difficultiesData = difficulties.map(diff => ({
    value: diff,
    label: diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)
  }))

  const categoryDisplayText = selectedCategories.length === 0 
    ? 'All Categories' 
    : selectedCategories.length === 1 
      ? selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)
      : `${selectedCategories.length} Categories`

  return (
    <Container size="xl" mb="lg">
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Search and Quick Filters Row */}
          <Group align="flex-end">
            <TextInput
              flex={1}
              placeholder="Search quizzes by title, category, or description..."
              leftSection={<IconSearch size="1rem" />}
              rightSection={isPending ? <Loader size="xs" /> : null}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.currentTarget.value)}
              disabled={isPending}
              size="md"
            />
            
            <Menu 
              shadow="md" 
              width={300}
              opened={showCategoryDropdown}
              onClose={onCloseCategoryDropdown}
            >
              <Menu.Target>
                <Button
                  variant="outline"
                  leftSection={<IconFilter size="1rem" />}
                  rightSection={<IconChevronDown size="1rem" />}
                  onClick={onToggleCategoryDropdown}
                  disabled={isPending}
                  size="md"
                  w={200}
                >
                  {categoryDisplayText}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Group justify="space-between">
                    <Text size="sm">Categories</Text>
                    <Group gap="xs">
                      <Button size="xs" variant="subtle" onClick={onClearCategories}>
                        Clear All
                      </Button>
                      <Button 
                        size="xs" 
                        variant="subtle" 
                        leftSection={<IconSettings size="0.8rem" />}
                        onClick={onOpenCategoryManagement}
                      >
                        Manage
                      </Button>
                    </Group>
                  </Group>
                </Menu.Label>
                <Menu.Divider />
                {categories.filter(cat => cat !== 'all').map(category => (
                  <Menu.Item key={category} closeMenuOnClick={false}>
                    <Checkbox
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                      checked={selectedCategories.includes(category)}
                      onChange={(event) => {
                        const isChecked = event.currentTarget.checked
                        if (isChecked) {
                          onCategoryChange([...selectedCategories, category])
                        } else {
                          onCategoryChange(selectedCategories.filter(c => c !== category))
                        }
                      }}
                      disabled={isPending}
                    />
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            <Select
              placeholder="All Levels"
              data={difficultiesData}
              value={selectedDifficulty}
              onChange={(value) => value && onDifficultyChange(value)}
              disabled={isPending}
              w={150}
              size="md"
            />
          </Group>

          {/* Selected Categories Tags */}
          {selectedCategories.length > 0 && (
            <Group gap="xs" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <Text size="sm" c="dimmed" fw={500}>Active filters:</Text>
              {selectedCategories.map(category => (
                <Badge
                  key={category}
                  variant="light"
                  rightSection={
                    <ActionIcon 
                      size="xs" 
                      color="blue" 
                      radius="xl" 
                      variant="transparent"
                      onClick={() => onRemoveCategory(category)}
                    >
                      <IconX size="0.8rem" />
                    </ActionIcon>
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              ))}
              <Button size="xs" variant="subtle" onClick={onClearCategories}>
                Clear all
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}