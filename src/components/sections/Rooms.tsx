import type { Room } from '../../data/inn'
import { rooms, roomsNote } from '../../data/inn'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Rooms.module.css'

function RoomCard({ room, delay = 0 }: { room: Room; delay?: number }) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className={room.featured ? `${styles.card} ${styles.cardFeatured}` : styles.card}
    >
      {/* 客室札: 部屋名は木札のように縦書きで */}
      <p className={styles.sign} aria-hidden="true">
        {room.name}
      </p>
      <div className={styles.body}>
        <h3 className={styles.name}>
          「{room.name}」
          <span className={styles.reading}>{room.reading}</span>
        </h3>
        <dl className={styles.specs}>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>間取り</dt>
            <dd className={styles.specValue}>{room.size}</dd>
          </div>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>定員</dt>
            <dd className={styles.specValue}>{room.capacity}</dd>
          </div>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>料金</dt>
            <dd className={styles.specValue}>{room.price}</dd>
          </div>
        </dl>
        <p className={styles.desc}>{room.body}</p>
      </div>
    </Reveal>
  )
}

/** 客室: 六室三タイプ。露天付き「灯」を主役に組む */
export function Rooms() {
  const featured = rooms.find((room) => room.featured)
  const others = rooms.filter((room) => !room.featured)
  return (
    <section
      id="rooms"
      aria-labelledby="rooms-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="rooms-heading"
          kana="むっつのへや"
          title="部屋"
          lede="六室、三つの間取り。どの部屋も窓の外は谷です。"
        />

        <div className={styles.grid}>
          {featured && <RoomCard room={featured} />}
          {others.map((room, index) => (
            <RoomCard key={room.id} room={room} delay={index * 0.1} />
          ))}
        </div>

        <p className={styles.note}>{roomsNote}</p>
      </div>
    </section>
  )
}
