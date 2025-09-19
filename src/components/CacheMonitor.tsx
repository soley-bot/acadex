'use client'

import { useState } from 'react'
import { useCacheStats, courseCache, quizCache, userCache, cacheDebug } from '@/lib/cache'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@mantine/core'
import { Database, Trash2, Eye, RefreshCw } from 'lucide-react'

interface CacheStatsDisplayProps {
  title: string
  cache: any
  color: string
}

function CacheStatsDisplay({ title, cache, color }: CacheStatsDisplayProps) {
  const { stats, clearCache, invalidateByTags } = useCacheStats(cache)
  const [showDetails, setShowDetails] = useState(false)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return (
    <Card variant="elevated" size="md" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          {title}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-600">Entries</div>
              <div className="text-xl font-bold">{stats.size}/{stats.maxSize}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Memory</div>
              <div className="text-xl font-bold">{formatBytes(stats.memoryUsage)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Fresh</span>
              <span className="font-medium">{stats.fresh}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Stale</span>
              <span className="font-medium">{stats.stale}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary">Expired</span>
              <span className="font-medium">{stats.expired}</span>
            </div>
          </div>

          {showDetails && (
            <div className="pt-3 border-t space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-600">Oldest Entry:</span>
                <span className="ml-2">{formatTime(stats.oldestEntry)}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-600">Usage:</span>
                <span className="ml-2">{((stats.size / stats.maxSize) * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cacheDebug.visualize(cache)}
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-1" />
              Log
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="flex-1 text-primary hover:text-primary/80"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CacheMonitor() {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-primary hover:bg-secondary text-white hover:text-black shadow-lg"
        >
          <Database className="w-4 h-4 mr-2" />
          Cache Stats
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto bg-white rounded-lg shadow-2xl border z-50">
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Cache Monitor</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                cacheDebug.logStats(courseCache)
                cacheDebug.logStats(quizCache)
                cacheDebug.logStats(userCache)
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <CacheStatsDisplay
          title="Courses"
          cache={courseCache}
          color="bg-blue-500"
        />
        <CacheStatsDisplay
          title="Quizzes"
          cache={quizCache}
          color="bg-green-500"
        />
        <CacheStatsDisplay
          title="Users"
          cache={userCache}
          color="bg-primary"
        />
      </div>

      <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Cache System v2.0</span>
          <span>Dev Mode</span>
        </div>
      </div>
    </div>
  )
}
