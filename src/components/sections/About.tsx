import { aboutIntro, values } from '../../data/inn'
import { aboutPhoto } from '../../data/photos'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './About.module.css'

/** 宿の紹介: 屋号の由来と、三つの約束 */
export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading id="about-heading" kana="やどのこと" title="山霞について" />

        <div className={styles.introRow}>
          <Reveal className={styles.intro}>
            {aboutIntro.map((paragraph) => (
              <p key={paragraph.slice(0, 8)} className={styles.introText}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15} className={styles.lampWrap}>
            <img
              src={aboutPhoto.src}
              alt={aboutPhoto.alt}
              loading="lazy"
              className={styles.lamp}
            />
          </Reveal>
        </div>

        <ul className={styles.values}>
          {values.map((value, index) => (
            <Reveal
              as="li"
              key={value.title}
              delay={index * 0.12}
              className={styles.value}
            >
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueBody}>{value.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
