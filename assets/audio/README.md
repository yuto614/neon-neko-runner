# audio アセットについて

このフォルダには BGM・効果音(SE)の音源を配置します。

Version 1.3 時点でも音源ファイルは未配置です。`js/main.js` 側は下記パスから `Audio` オブジェクトとして読み込む構成だけを用意しているため、ファイルを配置すれば自動的に再生されます。

## 必要になる音源一覧

### BGM（`assets/audio/bgm/`）

| ファイル名 | 用途 |
| --- | --- |
| `title.mp3` | タイトル画面 |
| `playing.mp3` | ゲームプレイ中 |
| `gameover.mp3` | ゲームオーバー画面 |

### SE（`assets/audio/se/`）

| ファイル名 | 用途 |
| --- | --- |
| `jump.mp3` | ジャンプ |
| `double_jump.mp3` | ダブルジャンプ |
| `fish.mp3` | 魚取得 |
| `rare_fish.mp3` | レア魚取得 |
| `level_up.mp3` | レベルアップ |
| `achievement.mp3` | 実績解除 |
| `game_over.mp3` | ゲームオーバー |
| `select.mp3` | ボタン決定 |
| `item.wav` | アイテム取得（Shield / Magnet） |

## 注意事項

* ファイル形式は基本的に `.mp3` を想定していますが、`item.wav` は `.wav` です（変更する場合は事前に相談してください）。
* ライセンスが不明な素材は使用しないでください。
* 外部素材・AI生成音声を追加する場合は、CLAUDE.md の方針に従い事前にユーザーへ確認してください。
