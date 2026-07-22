import type { ReactNode } from 'react'
import styles from './LinkButton.module.css'

type LinkButtonProps = {
  href: string
  children: ReactNode
  /** solid=灯火色 / ghostNight=夜色面用の枠線 */
  variant?: 'solid' | 'ghostNight'
}

export function LinkButton({ href, children, variant = 'solid' }: LinkButtonProps) {
  return (
    <a
      href={href}
      className={variant === 'solid' ? styles.solid : styles.ghostNight}
    >
      {children}
    </a>
  )
}
