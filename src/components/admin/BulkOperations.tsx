'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  Archive, 
  Download, 
  Copy, 
  ChevronDown,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useFeatureFlag } from '@/lib/featureFlags'
import { logger } from '@/lib/logger'

interface BulkOperationsProps<T> {
  items: T[]
  selectedItems: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  onBulkDelete?: (itemIds: string[]) => Promise<void>
  onBulkPublish?: (itemIds: string[], isPublished: boolean) => Promise<void>
  onBulkArchive?: (itemIds: string[]) => Promise<void>
  onBulkDuplicate?: (itemIds: string[]) => Promise<void>
  onBulkExport?: (itemIds: string[]) => Promise<void>
  getItemId: (item: T) => string
  getItemTitle: (item: T) => string
  getItemStatus?: (item: T) => 'published' | 'draft' | 'archived'
  className?: string
  itemType?: string
}

interface BulkActionConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant: 'primary' | 'secondary' | 'success' | 'destructive' | 'outline' | 'ghost' | 'link'
  requiresConfirmation: boolean
  confirmationTitle: string
  confirmationMessage: string
}

export function BulkOperations<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkDelete,
  onBulkPublish,
  onBulkArchive,
  onBulkDuplicate,
  onBulkExport,
  getItemId,
  getItemTitle,
  getItemStatus,
  className = '',
  itemType = 'items'
}: BulkOperationsProps<T>) {
  const bulkOperationsEnabled = useFeatureFlag('BULK_OPERATIONS')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)
  const [lastAction, setLastAction] = useState<{ type: string; count: number } | null>(null)

  const selectedCount = selectedItems.size
  const allSelected = selectedCount === items.length && items.length > 0
  const someSelected = selectedCount > 0 && selectedCount < items.length

  // Calculate selected items stats
  const selectedItemsData = items.filter(item => selectedItems.has(getItemId(item)))
  const publishedCount = getItemStatus 
    ? selectedItemsData.filter(item => getItemStatus(item) === 'published').length 
    : 0
  const draftCount = getItemStatus 
    ? selectedItemsData.filter(item => getItemStatus(item) === 'draft').length 
    : 0

  // Handle select all/none
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(items.map(getItemId)))
    }
  }, [allSelected, items, getItemId, onSelectionChange])

  // Handle individual item selection
  const handleItemSelect = useCallback((itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    onSelectionChange(newSelection)
  }, [selectedItems, onSelectionChange])

  // Execute bulk action
  const executeBulkAction = useCallback(async (actionId: string) => {
    if (selectedCount === 0) return

    const selectedIds = Array.from(selectedItems)
    setIsLoading(true)

    try {
      switch (actionId) {
        case 'publish':
          await onBulkPublish?.(selectedIds, true)
          setLastAction({ type: 'published', count: selectedCount })
          break
        case 'unpublish':
          await onBulkPublish?.(selectedIds, false)
          setLastAction({ type: 'unpublished', count: selectedCount })
          break
        case 'duplicate':
          await onBulkDuplicate?.(selectedIds)
          setLastAction({ type: 'duplicated', count: selectedCount })
          break
        case 'archive':
          await onBulkArchive?.(selectedIds)
          setLastAction({ type: 'archived', count: selectedCount })
          break
        case 'export':
          await onBulkExport?.(selectedIds)
          setLastAction({ type: 'exported', count: selectedCount })
          break
        case 'delete':
          await onBulkDelete?.(selectedIds)
          setLastAction({ type: 'deleted', count: selectedCount })
          break
      }

      // Clear selection after successful action
      onSelectionChange(new Set())
      
      logger.info('Bulk operation completed', {
        action: actionId,
        itemCount: selectedCount,
        itemType
      })
    } catch (error: any) {
      logger.error('Bulk operation failed', { action: actionId, error })
      // Don't clear selection on error so user can retry
    } finally {
      setIsLoading(false)
      setShowConfirmation(null)
      setPendingAction(null)
    }
  }, [selectedItems, selectedCount, onBulkPublish, onBulkDuplicate, onBulkArchive, onBulkExport, onBulkDelete, onSelectionChange, itemType])

  // Handle action click (with confirmation if needed)
  const handleActionClick = useCallback((action: BulkActionConfig) => {
    if (action.requiresConfirmation) {
      setShowConfirmation(action.id)
      setPendingAction(() => () => executeBulkAction(action.id))
    } else {
      executeBulkAction(action.id)
    }
  }, [executeBulkAction])

  // Auto-hide success message
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastAction])

  // Don't render if feature flag is disabled
  if (!bulkOperationsEnabled) return null

  // Define available bulk actions
  const bulkActions: BulkActionConfig[] = [
    ...(onBulkPublish && publishedCount < selectedCount ? [{
      id: 'publish',
      label: 'Publish Selected',
      icon: Eye,
      variant: 'secondary' as const,
      requiresConfirmation: false,
      confirmationTitle: 'Publish Items',
      confirmationMessage: `Are you sure you want to publish ${selectedCount} ${itemType}?`
    }] : []),
    ...(onBulkPublish && publishedCount > 0 ? [{
      id: 'unpublish',
      label: 'Unpublish Selected',
      icon: EyeOff,
      variant: 'outline' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Unpublish Items',
      confirmationMessage: `Are you sure you want to unpublish ${publishedCount} ${itemType}?`
    }] : []),
    ...(onBulkDuplicate ? [{
      id: 'duplicate',
      label: 'Duplicate Selected',
      icon: Copy,
      variant: 'outline' as const,
      requiresConfirmation: false,
      confirmationTitle: 'Duplicate Items',
      confirmationMessage: `This will create copies of ${selectedCount} ${itemType}.`
    }] : []),
    ...(onBulkArchive ? [{
      id: 'archive',
      label: 'Archive Selected',
      icon: Archive,
      variant: 'secondary' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Archive Items',
      confirmationMessage: `Are you sure you want to archive ${selectedCount} ${itemType}?`
    }] : []),
    ...(onBulkExport ? [{
      id: 'export',
      label: 'Export Selected',
      icon: Download,
      variant: 'outline' as const,
      requiresConfirmation: false,
      confirmationTitle: 'Export Items',
      confirmationMessage: `This will export ${selectedCount} ${itemType}.`
    }] : []),
    ...(onBulkDelete ? [{
      id: 'delete',
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'destructive' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Delete Items',
      confirmationMessage: `Are you sure you want to permanently delete ${selectedCount} ${itemType}? This action cannot be undone.`
    }] : [])
  ]

  return (
    <>
      {/* Selection Controls */}
      <Card className={`${className} transition-all duration-200 ${selectedCount > 0 ? 'border-primary/50 shadow-lg' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                />
                <span className="text-sm font-medium">
                  {selectedCount === 0 
                    ? `Select ${itemType}` 
                    : `${selectedCount} of ${items.length} selected`
                  }
                </span>
              </div>
              
              {selectedCount > 0 && (
                <div className="flex gap-1">
                  {publishedCount > 0 && (
                    <Badge variant="default" className="text-xs">
                      {publishedCount} published
                    </Badge>
                  )}
                  {draftCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {draftCount} draft
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Success feedback */}
            {lastAction && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {lastAction.count} {itemType} {lastAction.type}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {bulkActions.map(action => {
                const IconComponent = action.icon
                return (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <IconComponent className="h-3 w-3" />
                    )}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">
                {bulkActions.find(a => a.id === showConfirmation)?.confirmationTitle}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {bulkActions.find(a => a.id === showConfirmation)?.confirmationMessage}
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(null)
                  setPendingAction(null)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant={bulkActions.find(a => a.id === showConfirmation)?.variant || 'secondary'}
                onClick={pendingAction}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BulkOperations
