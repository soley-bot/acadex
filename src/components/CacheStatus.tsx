'use client';

import React, { useState, useEffect } from 'react';
import { dbCache } from '@/lib/optimizedDatabase';

export default function CacheStatusComponent() {
  const [cacheInfo, setCacheInfo] = useState<any>({});

  useEffect(() => {
    const updateCacheInfo = () => {
      const info = {
        inMemoryCache: dbCache['cache'].size,
        sessionStorageItems: typeof window !== 'undefined' ? Object.keys(sessionStorage).filter(key => 
          key.startsWith('quiz-') || key.startsWith('course-') || key.startsWith('dashboard-')
        ).length : 0,
        localStorageItems: typeof window !== 'undefined' ? Object.keys(localStorage).filter(key =>
          key.startsWith('acadex-cache-')
        ).length : 0,
        timestamp: new Date().toLocaleTimeString()
      };
      setCacheInfo(info);
    };

    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 p-3 rounded-lg text-xs">
      <div className="font-semibold mb-1">Cache Status ({cacheInfo.timestamp})</div>
      <div className="space-y-1">
        <div>Memory: {cacheInfo.inMemoryCache} items</div>
        <div>Session: {cacheInfo.sessionStorageItems} items</div>
        <div>Local: {cacheInfo.localStorageItems} items</div>
      </div>
    </div>
  );
}
