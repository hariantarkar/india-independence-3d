import { useEffect, useState } from 'react'

/**
 * Returns true when the viewport is narrow/tall (vertical reel format)
 * or the device is a touch/mobile device. Used to scale down particle
 * counts, disable shadows, and disable heavy post-processing.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 820 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 820)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

export function usePixelRatio(isMobile) {
  if (typeof window === 'undefined') return 1
  const max = isMobile ? 1.5 : 2
  return Math.min(window.devicePixelRatio || 1, max)
}
