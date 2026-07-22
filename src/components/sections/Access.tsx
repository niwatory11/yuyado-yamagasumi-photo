import { innInfo } from '../../data/inn'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Access.module.css'

const infoRows = [
  ['屋号', `${innInfo.name}(${innInfo.reading})`],
  ['所在地', innInfo.address],
  ['道順', innInfo.access],
  ['チェックイン', innInfo.checkIn],
  ['チェックアウト', innInfo.checkOut],
  ['客室数', innInfo.rooms],
  ['電話', innInfo.tel],
] as const

/** ご案内: 宿の概要(すべて架空の設定) */
export function Access() {
  return (
    <section
      id="access"
      aria-labelledby="access-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading id="access-heading" kana="やどのごあんない" title="ご案内" />

        <Reveal className={styles.infoWrap}>
          <dl className={styles.infoList}>
            {infoRows.map(([label, value]) => (
              <div key={label} className={styles.infoRow}>
                <dt className={styles.infoLabel}>{label}</dt>
                <dd className={styles.infoValue}>{value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>
            冬期(12月〜3月)は積雪のため送迎が必須です。「霞谷温泉」は本コンセプトサイトのための架空の温泉地で、実在の地名・交通機関とは関係ありません。
          </p>
        </Reveal>
      </div>
    </section>
  )
}
