import roomAkariSrc from '../assets/photos/room-akari.webp'
import roomKasumiSrc from '../assets/photos/room-kasumi.webp'
import roomKodamaSrc from '../assets/photos/room-kodama.webp'
import kaisekiSrc from '../assets/photos/kaiseki.webp'
import lampSrc from '../assets/photos/lamp.webp'

/**
 * 実写素材(すべてCCライセンスのフリー素材を「夜山×灯火」トーンに色調加工したもの)。
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
    alt: '文机と座椅子だけの小さな和室(写真はイメージ)',
    credit: 'decade_null / CC BY 2.0(色調加工)',
  },
}

export const kaisekiPhoto: Photo = {
  src: kaisekiSrc,
  alt: '漆の盆に杯と先付の小鉢が並ぶ会席の膳(写真はイメージ)',
  credit: 'Chris 73, Wikimedia Commons / CC BY-SA 3.0(色調加工)',
}

export const lampPhoto: Photo = {
  src: lampSrc,
  alt: '暗い天井にともる竹枠の行灯(写真はイメージ)',
  credit: 'halfrain / CC BY-SA 2.0(色調加工)',
}

/** フッターに載せる短いクレジット(完全な出典は docs/credits.md) */
export const photoCreditsLine =
  '写真: halfrain(CC BY-SA 2.0)/ Rawpixel(CC0)/ decade_null(CC BY 2.0)/ Chris 73, Wikimedia Commons(CC BY-SA 3.0)— いずれも色調加工のうえ使用。写真はイメージです。'
