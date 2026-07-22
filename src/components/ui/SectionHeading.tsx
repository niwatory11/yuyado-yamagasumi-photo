import { Reveal } from './Reveal'
import styles from './SectionHeading.module.css'

type SectionHeadingProps = {
  id: string
  /** ふりがな風の小さな前置きラベル */
  kana: string
  title: string
  /** 夜色セクションで使う場合 true */
  onNight?: boolean
  lede?: string
}

export function SectionHeading({
  id,
  kana,
  title,
  onNight = false,
  lede,
}: SectionHeadingProps) {
  return (
    <Reveal className={onNight ? `${styles.wrap} ${styles.night}` : styles.wrap}>
      <p className={styles.kana} aria-hidden="true">
        {kana}
      </p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lede && <p className={styles.lede}>{lede}</p>}
    </Reveal>
  )
}
