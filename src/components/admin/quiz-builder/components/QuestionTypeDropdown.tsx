import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const handleSelect = (type: string) => {
    onCreateQuestion(type)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <IconPlus size={16} className="mr-2" />
          Add Question
          <IconChevronDown size={16} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80">
        {questionTypes.map(({ type, label, icon }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleSelect(type)}
            className="flex items-center gap-3 p-3"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

QuestionTypeDropdown.displayName = 'QuestionTypeDropdown'