import { bathInfo } from '../../data/inn'
import { useShaderCanvas } from '../../webgl/useShaderCanvas'
import { useWaterCanvas } from '../../webgl/useWaterCanvas'
import steamFrag from '../../shaders/steam.frag.glsl?raw'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Bath.module.css'

/**
 * 触れる露天風呂。水面は波動方程式のシミュレーション、湯けむりはfbmノイズ。
 * どちらのcanvasも装飾(aria-hidden)で、情報はDOM側の泉質表が持つ。
 */
function WaterScene() {
  const water = useWaterCanvas()
  const steam = useShaderCanvas({ frag: steamFrag, maxDpr: 1.5 })

  if (!water.supported) {
    return <div className={styles.waterFallback} aria-hidden="true" />
  }
  return (
    <div className={styles.waterFrame} aria-hidden="true">
      <canvas ref={water.ref} className={styles.waterCanvas} />
      {steam.supported && (
        <canvas ref={steam.ref} className={styles.steamCanvas} />
      )}
    </div>
  )
}

export function Bath() {
  return (
    <section
      id="bath"
      aria-labelledby="bath-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="bath-heading"
          kana="つきみのゆ"
          title="湯"
          onNight
          lede={bathInfo.lede}
        />

        <div className={styles.layout}>
          <Reveal className={styles.sceneWrap}>
            <WaterScene />
            <p className={styles.hint}>
              水面をなぞると波紋がひろがります(WebGLによる水面シミュレーション)
            </p>
          </Reveal>

          <Reveal delay={0.15} className={styles.info}>
            <dl className={styles.springList}>
              {bathInfo.spring.map((row) => (
                <div key={row.label} className={styles.springRow}>
                  <dt className={styles.springLabel}>{row.label}</dt>
                  <dd className={styles.springValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>{bathInfo.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
