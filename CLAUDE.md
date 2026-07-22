# 湯宿 山霞 — プロジェクトルール

架空の山あいの温泉旅館「湯宿 山霞(ゆやど やまがすみ)」の単体商業Webサイト。
フロントエンド制作実績(Concept Project)としてGitHub・ライブデモで公開する。
ポートフォリオ3部作の3作目: 月白(世界観・情緒型)・常盤精工(明快さ・信頼型)に対し、
本作は市場調査の「没入型」軸 — **目的のあるWebGL/GLSL表現** — を実装する。

## 成果物の定義

- 最終成果物は**単体の商業Webサイト**である
- Instagram分析サイト・ダッシュボード・スクレイピング管理画面は作らない
- 特定の実在サイトのコピーをしない
- ReelsやSNSの画像・動画・スクリーンショットを転載しない
- 利用条件を確認できる素材だけを使用する(現状はすべて自作GLSL/SVG/CSS)

## 品質基準

- レスポンシブ必須。360 / 375 / 768 / 1024 / 1440px で横スクロールが出ないこと
- アクセシビリティ必須(セマンティックHTML、キーボード操作、フォーカス表示、alt、`prefers-reduced-motion`)
- TypeScriptエラーを残さない(`npm run typecheck`)
- `npm run lint` と `npm run build` を通す
- 変更後は必ずブラウザ表示を確認する
- 作業を計画だけで終了しない

## コンテンツのルール

- 架空の宿である旨をヒーロー・フッター・READMEに明記し続ける
- 実在しない受賞歴・宿泊者数・口コミ・評価を事実のように書かない
- Lorem ipsum等の仮テキストを置かない
- 秘密情報・Cookie・個人情報・Instagramの生データをコミットしない(`research/` は .gitignore 済み)

## WebGL/シェーダーの規約(このプロジェクトの核)

- シェーダーは**世界観の目的があるものだけ**(湯・霞・灯り)。装飾のための装飾は書かない
- Three.js等の3Dライブラリは使わない。素のWebGL2+手書きGLSL(`src/shaders/*.glsl` を `?raw` import)
- すべてのcanvasは `aria-hidden`。**情報はDOM側に必ず存在**させ、WebGLなしでも内容が完結すること
- 必須ガード:
  - WebGL2非対応 → CSSグラデーションのフォールバックを表示
  - `prefers-reduced-motion: reduce` → 1フレームだけ描いて停止
  - 画面外(IntersectionObserver)とタブ非表示で描画ループを停止
  - devicePixelRatio は上限2にクランプ
- シェーダー管理は `src/webgl/` のハーネス(`useShaderCanvas`)に一元化。コンポーネントに生のGL呼び出しを書かない

## 実装規約

- デザイントークンは `src/styles/tokens.css` が単一情報源。色値の直書き禁止(GLSL内と自作SVG内のみ例外)
- ブレークポイントは 480 / 768 / 1024 / 1280px の生値をモバイルファースト(`min-width`)で統一
- 共通レイアウトは `global.css` の `.container` / `.section`、装飾はCSS Modules側に書く
- DOM側のスクロール演出は `useReveal` + `.reveal` の「フェード+16px上昇」のみ
- コピー(文言・料金)は `src/data/` に置き、コンポーネントに直書きしない

## コマンド

```bash
npm run dev        # 開発サーバー
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm run test       # vitest
npm run build      # 型チェック + production build
npm run preview    # buildの確認
```

## 禁止事項

- `git push`・公開デプロイ・外部サービスへの送信は、ユーザーの明示的な許可なしに行わない
