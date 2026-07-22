import { BookingForm } from '../../features/booking/BookingForm'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Reserve.module.css'

/** ご予約: フロントエンドバリデーションのデモフォーム */
export function Reserve() {
  return (
    <section
      id="reserve"
      aria-labelledby="reserve-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="reserve-heading"
          kana="とまるひをえらぶ"
          title="ご予約"
          lede="六室だけの宿のため、ご希望に添えない日もございます。第二希望の日があれば、ご要望欄にお書き添えください。"
        />

        <Reveal className={styles.formWrap}>
          <BookingForm />
        </Reveal>
      </div>
    </section>
  )
}
