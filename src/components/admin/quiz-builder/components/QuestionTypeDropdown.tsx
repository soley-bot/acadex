import React, { memo, useState } from 'react'
import {
  Menu,
  Button,
  Group,
  Text,
  Stack
} from '@mantine/core'
import { IconPlus, IconChevronDown } from '@tabler/icons-react'

interface QuestionTypeDropdownProps {
  onCreateQuestion: (type: string, templateData?: any) => void
}

const questionTypes = [
  { type: 'multiple_choice', label: 'Multiple Choice (Single Answer)', icon: '☑️' },
  { type: 'true_false', label: 'True/False', icon: '✓' },
  { type: 'fill_blank', label: 'Fill in the Blank', icon: '📝' },
  { type: 'essay', label: 'Essay Question', icon: '📄' },
  { type: 'matching', label: 'Matching', icon: '🔗' },
  { type: 'ordering', label: 'Ordering', icon: '🔢' }
]

export const QuestionTypeDropdown = memo<QuestionTypeDropdownProps>(({
  onCreateQuestion
}) => {
  const [opened, setOpened] = useState(false)

  const handleSelect = (type: string) => {
    onCreateQuestion(type)
    setOpened(false)
  }

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withArrow
      shadow="md"
      width={320}
    >
      <Menu.Target>
        <Button
          variant="filled"
          color="red"
          leftSection={<IconPlus size={16} />}
          rightSection={<IconChevronDown size={16} />}
          onClick={() => setOpened(!opened)}
        >
          Add Question
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Stack gap="xs">
          {questionTypes.map(({ type, label, icon }) => (
            <Menu.Item
              key={type}
              onClick={() => handleSelect(type)}
              leftSection={
                <Text size="lg" style={{ lineHeight: 1 }}>
                  {icon}
                </Text>
              }
            >
              <Group gap="sm" align="center">
                <Text size="sm" fw={500}>
                  {label}
                </Text>
              </Group>
            </Menu.Item>
          ))}
        </Stack>
      </Menu.Dropdown>
    </Menu>
  )
})

QuestionTypeDropdown.displayName = 'QuestionTypeDropdown'