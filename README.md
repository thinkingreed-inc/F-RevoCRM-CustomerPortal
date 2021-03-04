# F-RevoCRM Customer Portal

## 事前要件

* PHP cURL extensionを有効にしてください
* Webserver (Apache等)に設置先ディレクトリの書き込み権限を与えてください 
* F-RevoCRM v7.3.0 以上で、CustomerPortalモジュールを有効にしてください

## インストール方法

* `config.sample.php`を`config.php`にコピー、リネームしてください
* `config.php`の変数を更新してください
    * `crm.url` — F-RevoCRMのURLをプロトコル込みのフルで入れてください
    * `portal.url` — カスタマーポータルのURLを入力してください
* `crm.url`は設置サーバーからアクセス可能な場所としてください

