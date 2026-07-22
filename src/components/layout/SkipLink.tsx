import styles from './SkipLink.module.css'

/** キーボード利用者向け: 最初のTabで現れる本文スキップリンク */
export function SkipLink() {
  return (
    <a href="#main" className={styles.skipLink}>
      本文へスキップ
    </a>
  )
}
