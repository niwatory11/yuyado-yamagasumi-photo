import { innInfo } from '../../data/inn'
import { navItems, reserveNavItem } from '../../data/nav'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.name}>{innInfo.name}</p>
          <p className={styles.tagline}>
            {innInfo.place} — {innInfo.rooms}の湯宿
          </p>
        </div>

        <nav aria-label="フッターナビゲーション">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={reserveNavItem.href} className={styles.navLink}>
                {reserveNavItem.label}
              </a>
            </li>
          </ul>
        </nav>

        <p className={styles.concept}>
          本サイトは、フロントエンド制作実績のために作成した架空の宿のコンセプトサイトです(Concept
          Project)。「湯宿 山霞」は実在せず、掲載している住所・料金・泉質・献立はすべて架空の設定です。フォームに入力された内容は保存・送信されません。WebGLの水面・霞・湯けむりはすべて自作GLSLシェーダーで描画しています。
        </p>
      </div>
    </footer>
  )
}
