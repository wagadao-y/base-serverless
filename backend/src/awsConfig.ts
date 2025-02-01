import { fromSSO } from "@aws-sdk/credential-provider-sso";

// 環境に応じた設定を取得
const getConfig = () => {
  // 共通の設定
  const config = {
    region: process.env.AWS_REGION || "ap-northeast-1",
  };

  // ローカル開発環境の場合
  if (process.env.NODE_ENV === "development") {
    return {
      ...config,
      credentials: fromSSO({
        profile: process.env.AWS_PROFILE || "default",
      }),
    };
  }

  // Lambda実行環境（本番・ステージング）の場合
  // credentialsを指定しないことで、LambdaのIAMロールが自動的に使用される
  return config;
};

export const awsConfig = getConfig();
