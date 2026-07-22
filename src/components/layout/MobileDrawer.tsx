import { useEffect, useRef } from 'react'
import { navItems, reserveNavItem } from '../../data/nav'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './MobileDrawer.module.css'

type MobileDrawerProps = {
  open: boolean
  onClose: () => void
}

/** モバイル用ナビゲーションドロワー(フォーカストラップ付き) */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, { active: open, onEscape: onClose })

  // 開いている間は背面のスクロールを止める
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="メニューを閉じる"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        className={styles.panel}
      >
        <button type="button" className={styles.close} onClick={onClose}>
          閉じる
        </button>
        <nav aria-label="モバイルナビゲーション">
          <ul className={styles.list}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link} onClick={onClose}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={reserveNavItem.href}
                className={`${styles.link} ${styles.reserve}`}
                onClick={onClose}
              >
                {reserveNavItem.label}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
