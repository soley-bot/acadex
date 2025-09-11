'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dbCache } from '@/lib/optimizedDatabase';

export default function CacheStatusComponent() {
  const [cacheInfo, setCacheInfo] = useState<any>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const updateCacheInfo = useCallback(() => {
    // Only update if component is still mounted
    if (!mountedRef.current) return;
    
    const info = {
      inMemoryCache: dbCache['cache']?.size || 0,
      sessionStorageItems: typeof window !== 'undefined' ? Object.keys(sessionStorage).filter(key => 
        key.startsWith('quiz-') || key.startsWith('course-') || key.startsWith('dashboard-')
      ).length : 0,
      localStorageItems: typeof window !== 'undefined' ? Object.keys(localStorage).filter(key =>
        key.startsWith('acadex-cache-')
      ).length : 0,
      timestamp: new Date().toLocaleTimeString()
    };
    setCacheInfo(info);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial update
    updateCacheInfo();
    
    // Set up interval with proper cleanup
    intervalRef.current = setInterval(updateCacheInfo, 5000); // Reduced frequency to 5 seconds
    
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [updateCacheInfo]);

  return (
    <div className="bg-muted/40 p-3 rounded-lg text-xs">
      <div className="font-semibold mb-1">Cache Status ({cacheInfo.timestamp})</div>
      <div className="space-y-1">
        <div>Memory: {cacheInfo.inMemoryCache} items</div>
        <div>Session: {cacheInfo.sessionStorageItems} items</div>
        <div>Local: {cacheInfo.localStorageItems} items</div>
      </div>
    </div>
  );
}
