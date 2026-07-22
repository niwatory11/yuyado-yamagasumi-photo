import { useEffect, useState } from 'react'
import { navItems, reserveNavItem } from '../../data/nav'
import { MobileDrawer } from './MobileDrawer'
import styles from './SiteHeader.module.css'

/**
 * 山霞の紋: 二つの山稜に霞(破線)がたなびき、右上に月。
 * 装飾のため aria-hidden。色は currentColor で昼夜の状態に追従する。
 */
function Crest() {
  return (
    <svg
      className={styles.crest}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="21.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M11 31.5 20.5 18.5 27 27.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 31.5 30 20.5 37.5 31.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 26.5h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="4.5 3.4"
      />
      <circle className={styles.crestMoon} cx="32.5" cy="12.5" r="2.4" />
    </svg>
  )
}

/**
 * 固定ヘッダー。ヒーロー(夜山)の上では透過+霞色の文字、
 * ヒーロー内の番兵要素が画面外へ出たら生成り地+墨茶文字へ遷移する。
 * ナビは IntersectionObserver によるスクロールスパイで現在地を示す。
 */
export function SiteHeader() {
  const [pastHero, setPastHero] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  /* スクロールスパイ: 画面中央帯に入ったセクションを現在地とする */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const targets = navItems
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [])

  /* ヒーロー上では現在地表示を消す(どのセクションにも居ないため) */
  const currentId = pastHero ? activeId : null

  return (
    <>
      <header
        className={`${styles.header} ${pastHero ? styles.solid : styles.transparent}`}
      >
        <div className={styles.inner}>
          <a href="#top" className={styles.logo}>
            <Crest />
            <span className={styles.logoText}>
              湯宿 山霞
              <span className={styles.logoReading}>ゆやど やまがすみ</span>
            </span>
          </a>

          <nav aria-label="メインナビゲーション" className={styles.nav}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={styles.navLink}
                    aria-current={
                      currentId === item.href.slice(1) ? 'location' : undefined
                    }
                  >
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
