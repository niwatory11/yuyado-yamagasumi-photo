import roomAkariSrc from '../assets/photos/room-akari.webp'
import roomKasumiSrc from '../assets/photos/room-kasumi.webp'
import roomKodamaSrc from '../assets/photos/room-kodama.webp'
import kaisekiSrc from '../assets/photos/kaiseki.webp'
import approachSrc from '../assets/photos/approach.webp'
import heroSrc from '../assets/photos/hero.webp'
import hero960Src from '../assets/photos/hero-960.webp'

/**
 * 全6点とも画像生成AI(ChatGPT / GPT Image)による生成イメージを「夜山×灯火」トーンに
 * 色調加工したもの(プロンプトは docs/image-generation-prompts.md)。
 * 出典・ライセンスの一覧は docs/credits.md とフッターに記載する。
 * 架空の宿のため、すべて「写真はイメージ」である旨をサイト内に明記する。
 */
export type Photo = {
  src: string
  alt: string
  credit: string
}

const generatedCredit = '画像生成AIによる生成イメージ(ChatGPT / GPT Image)'

export const roomPhotos: Record<'akari' | 'kasumi' | 'kodama', Photo> = {
  akari: {
    src: roomAkariSrc,
    alt: '灯りを落とした座敷の先、谷に張り出した石組みの露天風呂に月が映る(写真はイメージ)',
    credit: generatedCredit,
  },
  kasumi: {
    src: roomKasumiSrc,
    alt: '夜明けの和室。障子を開けた広縁の窓の外を、谷いちめんの霞が満たす(写真はイメージ)',
    credit: generatedCredit,
  },
  kodama: {
    src: roomKodamaSrc,
    alt: '文机と座布団、行灯ひとつだけが置かれた夜の小さな和室(写真はイメージ)',
    credit: generatedCredit,
  },
}

export const kaisekiPhoto: Photo = {
  src: kaisekiSrc,
  alt: '囲炉裏の炭火のまわりに、串に刺した岩魚の塩焼きが並ぶ(写真はイメージ)',
  credit: generatedCredit,
}

export const aboutPhoto: Photo = {
  src: approachSrc,
  alt: '灯籠に照らされた石段の先に、のれんの掛かる宿の玄関が灯る(写真はイメージ)',
  credit: generatedCredit,
}

/**
 * ヒーロー背景(夜の谷と山腹の宿)。上に霞シェーダーが重なる装飾レイヤーのため alt は持たない
 * (情報はヒーローのテキスト側にある)。
 */
export const heroPhoto = {
  src: heroSrc,
  srcSet: `${hero960Src} 960w, ${heroSrc} 1536w`,
  credit: generatedCredit,
}

/** フッターに載せる短いクレジット(完全な出典は docs/credits.md) */
export const photoCreditsLine =
  '写真: 画像生成AI(ChatGPT / GPT Image)による生成イメージを色調加工のうえ使用。写真はイメージです。'
