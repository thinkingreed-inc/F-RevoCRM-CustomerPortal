# F-RevoCRM Customer Portal
F-RevoCRMの顧客担当者に向けて、専用Webサイトを構築するツールです。  
専用Webサイトでは以下のようなことができます。
- 専用サイトからのお問い合わせ → 「サポート依頼」で管理
- 請求書やドキュメントの配布 → F-RevoCRMで登録したデータが閲覧可能

## 事前要件
* PHP cURL extensionを有効にしてください
* Webserver (Apache等)に設置先ディレクトリの書き込み権限を与えてください 
* F-RevoCRM v7.3.0 以上で、CustomerPortalモジュールを有効にしてください

## インストール方法
- `config.sample.php`を`config.php`にコピー、リネームしてください
- `config.php`の変数を更新してください
    - `crm.url` — F-RevoCRMのURLをプロトコル込みのフルで入れてください
    - `portal.url` — カスタマーポータルのURLを入力してください
- `crm.url`は設置サーバーからアクセス可能な場所としてください

### 設置例と手順
```
# pwd
/var/www/html
# tree .
├── crm
│   ├── ...F-RevoCRM v7.3以上の全ファイル
│   └── 
├── portal
│   ├── ...本レポジトリのデータ
│   └── 
```

#### F-RevoCRMの`config.inc.php`に`PORTAL_URL`を指定する
```php
$PORTAL_URL = $site_URL.'/portal';
```

#### カスタマーポータルの設定を行う `config.php`
```php
'crm.url' => 'http://localhost/crm',
// 同一のサーバーに設置する場合は、httpsである必要はなく、ドメインもlocalhostで接続可能です

//Portal URL without trialing/
//Example: http://yourdomain.com/portal
'portal.url' => 'http://example.co.jp/portal',
```

#### F-RevoCRMで以下の設定を行う
1. 送信メールサーバーの設定
1. crontabに、vtigercron.shの設定  
ここでは`/var/www/html/crm/cron/vtigercron.sh`をcrontabに登録する。  
これによって、システム側から自動送信されるメールが送信されるようになる
1. ポータルユーザーへのメール送信設定
    - `設定 > システム設定 > 自動化 > ワークフロー`から「Send Email to user when Portal User is True」を選択し、編集画面へ遷移する
    - 最下部「アクション」の「カスタム関数を実行」をOnに変更して保存
1. 顧客担当者にポータル権限を付与する
    - 顧客担当者の編集画面へ遷移する
    - 「サポート開始日、サポート終了日」を確認の上、「ポータルユーザー」チェックをつけて保存する
    - この時、「メールアドレス」項目に入っているメールアドレス向けにメールが送信される。

## 注意事項
ポータルの設定を行って、顧客担当者の「ポータルユーザー」にチェックをすると自動でメールが送信されるため、準備ができていないうちはご注意ください。
