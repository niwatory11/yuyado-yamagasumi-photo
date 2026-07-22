import type { ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'

type RevealProps = {
  children: ReactNode
  /** 秒単位の遅延(連続する要素の段差用) */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'p'
}

/** スクロールで下から浮かび上がる汎用ラッパー */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      data-visible={isVisible}
      style={delay > 0 ? { ['--reveal-delay' as string]: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  )
}
