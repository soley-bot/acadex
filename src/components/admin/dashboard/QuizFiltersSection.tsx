/**
 * Quiz Filters Section Component  
 * Extracted from admin quizzes page to reduce complexity
 * Handles search, category filtering, and difficulty selection
 * Converted to ShadCN UI components
 */

import React from 'react'
import { 
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Filter, 
  Settings,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react'

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
    <div className="container mx-auto mb-6 max-w-7xl">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search and Quick Filters Row */}
            <div className="flex items-end gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search quizzes by title, category, or description..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  disabled={isPending}
                  className="pl-10 pr-10"
                />
                {isPending && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    className="w-48"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {categoryDisplayText}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Categories</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={onClearCategories}
                        className="h-6 text-xs"
                      >
                        Clear All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={onOpenCategoryManagement}
                        className="h-6 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onCategoryChange([...selectedCategories, category])
                        } else {
                          onCategoryChange(selectedCategories.filter(c => c !== category))
                        }
                      }}
                      disabled={isPending}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={selectedDifficulty}
                onValueChange={onDifficultyChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-38">
                  <SelectValue>All Levels</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {difficultiesData.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Categories Tags */}
            {selectedCategories.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  {selectedCategories.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => onRemoveCategory(category)}
                      />
                    </Badge>
                  ))}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onClearCategories}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}