import { cuisine } from '../../data/inn'
import { kaisekiPhoto } from '../../data/photos'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Cuisine.module.css'

/** 料理: 会席の流れを品書きの様式で */
export function Cuisine() {
  return (
    <section
      id="cuisine"
      aria-labelledby="cuisine-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="cuisine-heading"
          kana="やまのぜん"
          title="料理"
          lede={cuisine.lede}
        />

        <div className={styles.layout}>
          <Reveal className={styles.menu}>
            <h3 className={styles.menuTitle}>夕餉 — 山の会席(初夏の一例)</h3>
            <dl className={styles.courseList}>
              {cuisine.courses.map((course) => (
                <div key={course.name} className={styles.courseRow}>
                  <dt className={styles.courseName}>
                    <span>{course.name}</span>
                    <span className={styles.dots} aria-hidden="true" />
                  </dt>
                  <dd className={styles.courseItem}>{course.item}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.12} className={styles.breakfast}>
            <figure className={styles.photoFigure}>
              <img
                src={kaisekiPhoto.src}
                alt={kaisekiPhoto.alt}
                loading="lazy"
                className={styles.photo}
              />
              <figcaption className={styles.photoCaption}>
                夕餉の先付(写真はイメージです)
              </figcaption>
            </figure>
            <h3 className={styles.menuTitle}>朝餉</h3>
            <p className={styles.breakfastBody}>{cuisine.breakfast}</p>
            <p className={styles.note}>{cuisine.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
