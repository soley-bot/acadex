/**
 * Smart redirect hook with preemptive loading and caching
 * Optimizes navigation performance in Acadex
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

interface RedirectOptions {
  replace?: boolean;
  preload?: boolean;
  cache?: boolean;
  delay?: number;
  condition?: () => boolean;
}

export function useSmartRedirect() {
  const router = useRouter();
  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Enhanced navigation with preloading
  const navigate = useCallback(async (
    path: string, 
    options: RedirectOptions = {}
  ) => {
    const {
      replace = false,
      preload = true,
      cache = true,
      delay = 0,
      condition
    } = options;

    // Check condition if provided
    if (condition && !condition()) {
      return;
    }

    // Cache current path for back navigation
    if (cache && typeof window !== 'undefined') {
      sessionStorage.setItem('lastPath', window.location.pathname);
    }

    // Preload the route if enabled
    if (preload) {
      router.prefetch(path);
    }

    const performNavigation = () => {
      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    };

    if (delay > 0) {
      setTimeout(performNavigation, delay);
    } else {
      performNavigation();
    }
  }, [router]);

  // Preload multiple routes
  const preloadRoutes = useCallback((routes: string[], delay = 1000) => {
    const timeoutId = setTimeout(() => {
      routes.forEach(route => {
        router.prefetch(route);
      });
    }, delay);

    preloadTimeouts.current.set('bulk', timeoutId);
  }, [router]);

  // Smart redirect based on user role and state
  const smartRedirect = useCallback(async (
    userRole: string | null,
    isAuthenticated: boolean,
    currentPath: string
  ) => {
    // Define route priorities
    const routes = {
      admin: ['/admin', '/admin/courses', '/admin/users'],
      student: ['/dashboard', '/courses', '/quizzes'],
      guest: ['/auth/login', '/auth/signup', '/']
    };

    // Preload appropriate routes based on user state
    if (isAuthenticated && userRole) {
      const userRoutes = userRole === 'admin' ? routes.admin : routes.student;
      preloadRoutes(userRoutes, 500);
    } else {
      preloadRoutes(routes.guest, 500);
    }

    // Handle authentication redirects
    if (!isAuthenticated && requiresAuth(currentPath)) {
      const returnUrl = encodeURIComponent(currentPath);
      await navigate(`/auth/login?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    // Handle role-based redirects
    if (isAuthenticated && userRole) {
      if (currentPath.startsWith('/admin') && userRole !== 'admin') {
        await navigate('/unauthorized', { replace: true });
        return;
      }

      if (currentPath === '/auth/login' || currentPath === '/auth/signup') {
        const defaultRoute = userRole === 'admin' ? '/admin' : '/dashboard';
        await navigate(defaultRoute, { replace: true });
        return;
      }
    }
  }, [navigate, preloadRoutes]);

  // Conditional redirect
  const redirectIf = useCallback((
    condition: boolean,
    path: string,
    options?: RedirectOptions
  ) => {
    if (condition) {
      navigate(path, options);
    }
  }, [navigate]);

  // Go back with fallback
  const goBack = useCallback((fallbackPath = '/') => {
    const lastPath = typeof window !== 'undefined' ? sessionStorage.getItem('lastPath') : null;

    if (lastPath && lastPath !== window.location.pathname) {
      navigate(lastPath);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      navigate(fallbackPath);
    }
  }, [navigate, router]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = preloadTimeouts.current;
    return () => {
      timeouts.forEach(timeout => {
        clearTimeout(timeout);
      });
      timeouts.clear();
    };
  }, []);

  return {
    navigate,
    smartRedirect,
    redirectIf,
    goBack,
    preloadRoutes,
    prefetch: router.prefetch,
    refresh: router.refresh
  };
}

// Helper function to check if route requires authentication
function requiresAuth(path: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/courses',
    '/quizzes',
    '/admin',
    '/progress'
  ];

  return protectedRoutes.some(route => path.startsWith(route));
}

// Cached route loader
export const loadRoute = async (path: string) => {
  // Simple route loader without cache
  await new Promise(resolve => setTimeout(resolve, 100));
  return { path, loaded: true, timestamp: Date.now() };
};

// Preload common routes based on user type
export function preloadCommonRoutes(userRole: string | null, router: any) {
  if (!router.prefetch) return;

  const commonRoutes = {
    admin: ['/admin/courses', '/admin/users', '/admin/analytics'],
    student: ['/courses', '/dashboard/my-courses', '/quizzes'],
    guest: ['/courses', '/about', '/contact']
  };

  const routes = userRole === 'admin' 
    ? commonRoutes.admin 
    : userRole 
    ? commonRoutes.student 
    : commonRoutes.guest;

  // Stagger preloading to avoid overwhelming the browser
  routes.forEach((route, index) => {
    setTimeout(() => {
      router.prefetch(route);
    }, index * 200);
  });
}
