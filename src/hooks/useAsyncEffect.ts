import { useEffect, useRef, DependencyList } from 'react'

/**
 * Safe async effect hook that prevents state updates after unmount
 * 
 * @example
 * useAsyncEffect(async (isMounted) => {
 *   const data = await fetchData()
 *   if (isMounted()) {
 *     setData(data)
 *   }
 * }, [dependency])
 */
export function useAsyncEffect(
  effect: (isMounted: () => boolean) => Promise<void>,
  deps: DependencyList
): void {
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const isMounted = () => mountedRef.current

    effect(isMounted).catch(error => {
      if (mountedRef.current) {
        console.error('Async effect error:', error)
      }
    })

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
