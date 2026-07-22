# 画像生成AI用プロンプト集(料理・宿の差し替え候補)

対象: 写真併用版「湯宿 山霞」の差し替え希望2箇所。

1. **料理(夕餉)** — 現行 `src/assets/photos/kaiseki.webp`(1400x812)を別の料理写真にする
2. **宿について** — 現行 `src/assets/photos/lamp.webp`(行灯のクローズアップ)を、もっと広い画角で宿が分かる写真にする

生成した画像はどちらも「写真はイメージです」表記のまま使う(架空の宿のため)。

---

## 共通ルール(すべてのプロンプトに適用)

### トーン: 「夜山×灯火」

サイト全体のカラーグレーディングに合わせる。生成段階でプロンプトに含め、
足りなければ後加工(彩度低め・シャドウを青灰に・ハイライトを灯火色に)で寄せる。

英語プロンプト末尾に毎回付けるスタイルブロック:

```text
, muted color palette, cool blue-grey dusk shadows with warm 2700K lantern
highlights, low-key lighting, quiet and still atmosphere, subtle film grain,
photorealistic, shot on 35mm film, Japanese mountain onsen ryokan aesthetic
```

ネガティブプロンプト(対応モデルの場合):

```text
people, faces, hands, text, letters, signage, watermark, logo, oversaturated,
HDR look, bright daylight, blue LED light, modern hotel interior, CGI look
```

### 禁止・注意

- 人物・顔・手が写る構図は使わない(モデルの手癖で入りやすいので必ず確認)
- 実在の宿・地名が特定できる要素(看板・のれんの文字・ロゴ)は不可。文字が生成されたら再生成かレタッチ
- 生成サービスの**商用利用条件と権利帰属を確認**してから採用する(CLAUDE.md「利用条件を確認できる素材だけを使用する」)
- 画風はあくまで「写真」。イラスト調・CG調に寄ったら negative を強める

---

## スロット1: 料理(夕餉)の差し替え

- 実装箇所: `Cuisine.tsx` の `photoFigure`(横位置スロット)。キャプション「夕餉の先付(写真はイメージです)」
- 推奨アスペクト: **3:2 か 4:3(横)**。生成サイズ 1600px 幅以上 → 書き出しは幅1400px前後のWebP
- キャプション文言は採用した案に合わせて `Cuisine.tsx` 側を直す(例: 案Bなら「夕餉より 岩魚の塩焼き」)

### 案A: 先付の小鉢(現行と同じ題材で別カット)

```text
Overhead 45-degree shot of a Japanese kaiseki appetizer course on a dark
lacquered tray: three small ceramic bowls with seasonal mountain vegetables,
a small sake cup, chopsticks on a rest, dark wooden table, single warm
candle-like light from the left, deep shadows
```

### 案B: 囲炉裏の岩魚の塩焼き(山の宿らしさが最も出る)

```text
Salt-grilled river fish (iwana) on skewers standing around a small charcoal
irori hearth, glowing embers, rustic Japanese mountain inn, close but wide
enough to see the hearth stones, warm firelight against dark room
```

### 案C: 土鍋の炊き込みご飯(湯気で温度感を出す)

```text
A clay pot (donabe) of steaming mushroom rice just opened, steam rising,
dark wooden table of a Japanese inn, side light from a paper lantern,
rustic ceramic bowls beside, shallow depth of field
```

---

## スロット2: 宿について(広い画角の宿写真)

- 実装箇所: `About.tsx` の `lampWrap`(デスクトップで幅18remの縦長カラム)
- **生成は3:2(横)で行い、採用時に4:5(縦)へクロップ**して使うのが安全
  (広角の絵でも縦クロップに耐えるよう、主要素を画面中央〜やや左に寄せる)
- カラム自体を横長スロットに改修する選択肢もある(その場合はコード側をこちらで直すので指示ください)
- 推奨生成サイズ: 2048px幅以上(クロップ耐性のため)

### 案A: 夕暮れの玄関アプローチ(推奨。「宿に着いた瞬間」の画)

```text
Wide-angle 24mm shot of the stone-step approach to a small wooden Japanese
onsen ryokan at blue hour, paper lanterns lighting the path, warm light
spilling from the entrance behind a noren curtain, mist drifting between
cedar trees, mountain silhouette behind the roof
```

### 案B: 広縁から谷を見る室内広角(「泊まる側の視点」の画)

```text
Wide-angle interior shot of a Japanese ryokan room's engawa veranda corridor
at dusk, low chairs and a small table by the window, window view of misty
mountain valley, one paper lamp glowing, tatami and shoji in shadow
```

### 案C: 山腹に灯る外観全景(引きの画。ヒーローの世界観と最も近い)

```text
Distant wide shot of a small traditional Japanese inn on a forested mountain
slope at nightfall, a few warm windows glowing, mist rising from the valley
below, deep blue night sky, no other buildings
```

---

## 採用後の組み込み手順

1. 画像を WebP に変換して保存(品質80前後)
   - 料理: `src/assets/photos/kaiseki-v2.webp`(幅1400px前後)
   - 宿: `src/assets/photos/approach.webp`(4:5クロップ後、幅1100px前後)
2. `src/data/photos.ts` を更新
   - `src` のimportを差し替え、`alt` を新しい絵の内容に書き直す(「(写真はイメージ)」は残す)
   - `credit` を「画像生成AIによる生成イメージ(使用モデル名)」に変更
3. `docs/credits.md` の表を更新(生成画像の行は「作者」欄をモデル名、「ライセンス」欄を利用規約リンクに)
4. `src/data/photos.ts` の `photoCreditsLine`(フッター表記)を更新
5. `Cuisine.tsx` / `About.tsx` のキャプション文言を絵に合わせて調整
6. `npm run lint && npm run typecheck && npm run build` + 5画面幅の表示確認

> 生成画像をこのフォルダに置いてもらえれば、2〜6の組み込み作業はこちらで行います。
