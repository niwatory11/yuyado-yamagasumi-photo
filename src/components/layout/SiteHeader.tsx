import { useEffect, useState } from 'react'
import { navItems, reserveNavItem } from '../../data/nav'
import { MobileDrawer } from './MobileDrawer'
import styles from './SiteHeader.module.css'

/**
 * 固定ヘッダー。ヒーロー(夜山)の上では透過+霞色の文字、
 * ヒーロー内の番兵要素が画面外へ出たら生成り地+墨茶文字へ遷移する。
 */
export function SiteHeader() {
  const [pastHero, setPastHero] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      setPastHero(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setPastHero(!entry.isIntersecting)
        }
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header
        className={`${styles.header} ${pastHero ? styles.solid : styles.transparent}`}
      >
        <div className={styles.inner}>
          <a href="#top" className={styles.logo}>
            湯宿 山霞
            <span className={styles.logoReading}>ゆやど やまがすみ</span>
          </a>

          <nav aria-label="メインナビゲーション" className={styles.nav}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={styles.navLink}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <a href={reserveNavItem.href} className={styles.reserveButton}>
              {reserveNavItem.label}
            </a>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
              メニュー
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
