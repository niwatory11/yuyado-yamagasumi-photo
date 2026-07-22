import { useShaderCanvas } from '../../webgl/useShaderCanvas'
import mistFrag from '../../shaders/mist.frag.glsl?raw'
import { LinkButton } from '../ui/LinkButton'
import styles from './Hero.module.css'

/**
 * ファーストビュー: GLSLで描く夜の霞谷。
 * スクロールで霞が薄れ、宿の灯りが強くなる(シェーダー側のu_scroll)。
 * WebGL2が使えない環境ではCSSグラデーションの静的な夜空に落とす。
 */
export function Hero() {
  const { ref, supported } = useShaderCanvas({
    frag: mistFrag,
    trackScroll: true,
    trackPointer: true,
  })

  return (
    <section id="top" aria-label="湯宿 山霞 — 霞の谷の温泉宿" className={styles.hero}>
      {supported ? (
        <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
      ) : (
        <div className={styles.fallback} aria-hidden="true" />
      )}

      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>信州・霞谷温泉 — 全六室の湯宿</p>
        <h1 className={styles.heading}>
          霞の向こうに、
          <br />
          湯の灯り。
        </h1>
        <p className={styles.subcopy}>
          谷の集落から石段を上がった先。聞こえるのは沢の音と、湯口の雫だけ。
          源泉かけ流しの湯と山の会席で、何もしない一晩を。
        </p>
        <div className={styles.ctas}>
          <LinkButton href="#reserve">泊まる日を選ぶ</LinkButton>
          <LinkButton href="#about" variant="ghostNight">
            宿を知る
          </LinkButton>
        </div>
        <p className={styles.note}>※ 本サイトは架空の宿のコンセプトサイトです</p>
      </div>

      {/* ヘッダーの透過/不透過を切り替える番兵 */}
      <div id="hero-sentinel" className={styles.sentinel} aria-hidden="true" />
    </section>
  )
}
