my_gulp_template_with_php
=====================

# 自分用のgulpひな形のphp対応版

phpでヘッダーを読み込むサイトなどに向けたもの。

メンテナンスはしない予定なので https://github.com/novogrammer/my_gulp_template をベースにgulpfile.jsを改変してください。

ご自由にどうぞ。

## 前提
* Node.js 10.x
    * `.node-version`が使えるnodenvなどを推奨


## 導入
    npm install

## 実行
### デバッグ実行
    npm run start
    または
    npx gulp

default -> debug

debug -> [clean,build-each,watch]

### 書き出し
    npm run build
    または
    npx gulp build

build -> [clean,build-each,publish]

### PHPのビルトインサーバーで確認
    npm run phpserver
