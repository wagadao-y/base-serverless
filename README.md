# サーバーレスアプリケーションのベース用

## Cognitoにユーザーを追加する方法

https://zenn.dev/ytkhs/articles/efc0a777a73f15

```
# ユーザープールにユーザーを追加する(user-pool-id, usernameを変更する)
aws cognito-idp admin-create-user \
--user-pool-id "ap-northeast-1_XXXXX" \
--username "XXXXXXX" \
--message-action SUPPRESS
```

```
# パスワードを設定する(user-pool-id, username, passwordを変更する)
aws cognito-idp admin-set-user-password \
--user-pool-id "ap-northeast-1_XXXXX" \
--username "XXXXXXX" \
--password 'p@ssw0rd' \
--permanent
```

# AWSインフラの設定手順

## 手動設定が必要な項目

1. Lambda環境変数の設定
   - 環境変数名: ORIGIN_URLS
   - 設定値: POSTメソッドを許可するオリジンURL（https://xxxx形式）
   - 設定方法:
     - AWS Management Console: Lambda > 関数 > 設定 > 環境変数
     - または AWS CLI: `aws lambda update-function-configuration`

- 設定理由: CSRF対策で
