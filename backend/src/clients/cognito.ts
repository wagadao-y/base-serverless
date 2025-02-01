import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { awsConfig } from "@/awsConfig";

// Cognito認証クライアント
// 参考：CognitoのAPI仕様
// https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/javascript_cognito-identity-provider_code_examples.html
export class CognitoClient {
  private userpoolId: string;
  private clientId: string;
  private client: CognitoIdentityProviderClient;
  private verifier;

  constructor() {
    const requiredEnvVars = ["USER_POOL_ID", "USER_POOL_CLIENT_ID"];

    console.log(process.env.USER_POOL_ID, process.env.USER_POOL_CLIENT_ID);

    // 環境変数の設定チェック
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`環境変数が設定されていません: ${envVar}`);
      }
    }

    this.userpoolId = process.env.USER_POOL_ID as string;
    this.clientId = process.env.USER_POOL_CLIENT_ID as string;
    this.client = new CognitoIdentityProviderClient(awsConfig);
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.userpoolId,
      tokenUse: "access",
      clientId: this.clientId,
    });
  }

  /**
   * Cognito認証
   * @param userId
   * @param password
   * @returns
   */
  async authenticate(userId: string, password: string) {
    try {
      const command = new AdminInitiateAuthCommand({
        ClientId: this.clientId,
        UserPoolId: this.userpoolId,
        AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: userId,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);
      return {
        success: true,
        accessToken: response.AuthenticationResult?.AccessToken, // アクセストークン
        refreshToken: response.AuthenticationResult?.RefreshToken, // リフレッシュトークン
        expiresIn: response.AuthenticationResult?.ExpiresIn, // 有効期限（秒）
      };
    } catch (error) {
      console.error("Cognitoの認証に失敗しました:", error);
      return { success: false };
    }
  }

  /**
   * Cognitoアクセストークンの検証
   * @param accessToken
   * @returns
   */
  async verify(accessToken: string) {
    try {
      const payload = await this.verifier.verify(accessToken);
      return payload;
    } catch (error) {
      throw new Error("トークンの検証に失敗しました");
    }
  }
}
