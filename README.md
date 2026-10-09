# TYPING TOWER

学校の共同制作で開発した、タイピングと語彙学習を組み合わせたブラウザゲームです。

**このRepositoryがゲーム本体のSource of Truth**です。制作方針・授業ロードマップは別Repositoryの[EliteMay/type-tower](https://github.com/EliteMay/type-tower)に保存しています。両方の履歴は残し、使い終えたという理由だけで削除しません。

## ゲームの内容

- **漢字の塔**：表示された漢字の読みを入力する
- **英訳の塔**：日本語を見て英単語を入力する
- **和訳の塔**：英語を見て日本語を入力する
- 通常 / ENDLESS、問題レベル、時間制限などを選べる構成

詳細なゲーム仕様と学校での制作経緯は[制作方針Repository](https://github.com/EliteMay/type-tower/blob/main/README.md)を参照してください。仕様書と実コードが食い違うときは、**このRepositoryの現在のコード**を優先します。

## ファイルの入口

| パス | 役割 |
| --- | --- |
| [`index.html`](index.html) | ゲームの画面と起動入口 |
| [`js/`](js/) | 画面切替・ゲーム進行・演出 |
| [`css/`](css/) | 画面デザインとローディング表示 |
| [`data/`](data/) | 漢字・英単語・ひらがな解答などの問題データ |
| [`assets/`](assets/) | 画像・動画などのゲーム素材 |

## 起動・検証

静的なHTML / CSS / JavaScriptで構成されています。HTTPで配信される環境（GitHub Pagesなど）で`index.html`を開く方式を想定しています。問題データの読み込みがあるため、`file://`での直開きとWeb配信で動作が一致するとは限りません。

このRepositoryには現時点でGitHub Actionsによる自動テスト設定がありません。READMEの整備は動作検証完了を意味しません。保存時の状態を再利用する場合は、通常 / ENDLESS、各塔、制限時間、結果画面までブラウザで確認してください。

## 保管・変更方針

- 学校制作が一区切りついた作品として、**コード・問題データ・素材・Git履歴の保存を優先**します。
- 別のゲームや共通基盤へ統合する前に、ゲーム固有のデータと参照関係を確認します。
- リポジトリのアーカイブ、改名、削除は現在未実施です。公開URLや連携の影響確認後に判断します。
- 共通の開発ルールは[web-project-guide](https://github.com/EliteMay/web-project-guide)を参照します。
