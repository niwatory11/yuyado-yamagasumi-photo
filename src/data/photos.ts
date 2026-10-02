import roomAkariSrc from '../assets/photos/room-akari.webp'
import roomKasumiSrc from '../assets/photos/room-kasumi.webp'
import roomKodamaSrc from '../assets/photos/room-kodama-v2.webp'
import kaisekiSrc from '../assets/photos/kaiseki-v2.webp'
import approachSrc from '../assets/photos/approach.webp'

/**
 * 部屋「灯」「霞」の2点はCCライセンスのフリー素材を「夜山×灯火」トーンに色調加工したもの。
 * 部屋「谺」と料理・宿の3点は画像生成AI(ChatGPT / GPT Image)による生成イメージ
 * (プロンプトは docs/image-generation-prompts.md)。
 * 出典・作者・ライセンスの一覧は docs/credits.md とフッターに記載する。
 * 架空の宿のため、すべて「写真はイメージ」である旨をサイト内に明記する。
 */
export type Photo = {
  src: string
  alt: string
  credit: string
}

export const roomPhotos: Record<'akari' | 'kasumi' | 'kodama', Photo> = {
  akari: {
    src: roomAkariSrc,
    alt: '床の間と掛け軸のある座敷。天井の灯りがともっている(写真はイメージ)',
    credit: 'halfrain / CC BY-SA 2.0(色調加工)',
  },
  kasumi: {
    src: roomKasumiSrc,
    alt: '障子と広縁のある和室。窓の外に山の気配が見える(写真はイメージ)',
    credit: 'Rawpixel / CC0(色調加工)',
  },
  kodama: {
    src: roomKodamaSrc,
    alt: '行灯のともる広縁の窓辺に椅子を置き、霧の谷を望む(写真はイメージ)',
    credit: '画像生成AIによる生成イメージ(ChatGPT / GPT Image)',
  },
}

export const kaisekiPhoto: Photo = {
  src: kaisekiSrc,
  alt: '囲炉裏の炭火のまわりに、串に刺した岩魚の塩焼きが並ぶ(写真はイメージ)',
  credit: '画像生成AIによる生成イメージ(ChatGPT / GPT Image)',
}

export const aboutPhoto: Photo = {
  src: approachSrc,
  alt: '灯籠に照らされた石段の先に、のれんの掛かる宿の玄関が灯る(写真はイメージ)',
  credit: '画像生成AIによる生成イメージ(ChatGPT / GPT Image)',
}

/** フッターに載せる短いクレジット(完全な出典は docs/credits.md) */
export const photoCreditsLine =
  '写真: halfrain(CC BY-SA 2.0)/ Rawpixel(CC0)— 色調加工のうえ使用。部屋「谺」と料理・宿の写真は画像生成AI(ChatGPT)による生成イメージ。写真はイメージです。'
