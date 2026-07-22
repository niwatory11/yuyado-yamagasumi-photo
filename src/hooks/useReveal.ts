import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type UseRevealOptions = {
  threshold?: number
  rootMargin?: string
  /** true(既定)なら一度表示したら監視を解除する */
  once?: boolean
}

/**
 * 要素がビューポートに入ったかどうかを IntersectionObserver で監視する。
 * reduced-motion 環境と IntersectionObserver 非対応環境では即座に可視扱いにする。
 */
export function useReveal<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: UseRevealOptions = {}) {
  const elementRef = useRef<T | null>(null)
  const ref = useCallback((element: T | null) => {
    elementRef.current = element
  }, [])
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setIsVisible(false)
          }
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once, prefersReducedMotion])

  return { ref, isVisible }
}
