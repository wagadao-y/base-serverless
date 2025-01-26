import { getCookie, setCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { AuthService } from "@/services/auth";
import { HTTPException } from "hono/http-exception";

// TODO 後で各層に分離する *******************************
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// Cognito クライアントの初期化
const cognitoClient = new CognitoIdentityProviderClient({});

// APIの型定義
type SignInBody = {
  username: string;
  password: string;
};

type VerifyTOTPBody = {
  username: string;
  code: string;
  session: string;
};

// ***************** ここまで暫定コード *****************

const factory = createFactory();

// 認証ハンドラー
export const createAuthHandlers = (authService: AuthService) => {
  return {
    // ログイン
    login: factory.createHandlers(async (c) => {
      const { userId, password } = await c.req.json();

      // ユーザーIDとパスワードの入力チェック
      if (!userId || !password) {
        throw new HTTPException(400, {
          message: "ユーザーIDとパスワードは必須です",
        });
      }

      // ログイン認証（失敗時はService層で例外がスローされる）
      const { accessToken, refreshToken, expiresIn } = await authService.login(
        userId,
        password
      );

      const cookies = {
        accessToken,
        refreshToken,
      };

      Object.keys(cookies).forEach((key) => {
        const cookieKey = key as keyof typeof cookies;

        setCookie(c, key, cookies[cookieKey], {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: expiresIn,
        });
      });

      // Cookieにセッションを設定
      setCookie(c, "accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/api",
        maxAge: 60 * 60 * 24, // 24 時間
      });

      return c.json({ userId: userId });
    }),

    // MFA認証ログイン
    loginMfa: factory.createHandlers(async (c) => {
      const { username, password }: SignInBody = await c.req.json();

      const command = new AdminInitiateAuthCommand({
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        ClientId: process.env.USER_POOL_CLIENT_ID,
        UserPoolId: process.env.USER_POOL_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);

      if (response.ChallengeName === "MFA_SETUP") {
        // MFAの初期設定が必要な場合
        const associateTokenCommand = new AssociateSoftwareTokenCommand({
          Session: response.Session,
        });

        const tokenResponse = await cognitoClient.send(associateTokenCommand);

        return c.json({
          success: true,
          challengeName: "MFA_SETUP",
          session: tokenResponse.Session,
          secretCode: tokenResponse.SecretCode,
        });
      } else if (response.ChallengeName === "SOFTWARE_TOKEN_MFA") {
        // MFA認証が必要な場合
        return c.json({
          success: true,
          challengeName: "SOFTWARE_TOKEN_MFA",
          session: response.Session,
        });
      }

      // 通常のサインイン成功（MFAが未設定の場合は発生しない）
      return c.json({
        success: true,
        tokens: {
          accessToken: response.AuthenticationResult?.AccessToken,
          refreshToken: response.AuthenticationResult?.RefreshToken,
          idToken: response.AuthenticationResult?.IdToken,
        },
      });
    }),

    // MFA初期設定の検証
    verifyTotpSetup: factory.createHandlers(async (c) => {
      const { username, code, session }: VerifyTOTPBody = await c.req.json();

      const command = new VerifySoftwareTokenCommand({
        UserCode: code,
        Session: session,
      });

      const response = await cognitoClient.send(command);

      if (response.Status === "SUCCESS") {
        // MFA設定完了後の認証チャレンジに応答
        const challengeCommand = new AdminRespondToAuthChallengeCommand({
          ClientId: process.env.USER_POOL_CLIENT_ID,
          UserPoolId: process.env.USER_POOL_ID,
          ChallengeName: "MFA_SETUP",
          ChallengeResponses: {
            USERNAME: username,
            SOFTWARE_TOKEN_MFA_CODE: code,
          },
          Session: response.Session,
        });

        const challengeResponse = await cognitoClient.send(challengeCommand);

        return c.json({
          success: true,
          tokens: {
            accessToken: challengeResponse.AuthenticationResult?.AccessToken,
            refreshToken: challengeResponse.AuthenticationResult?.RefreshToken,
            idToken: challengeResponse.AuthenticationResult?.IdToken,
          },
        });
      }

      return c.json({ success: false, message: "Failed to verify TOTP" }, 400);
    }),

    // MFA認証応答エンドポイント
    respondToMfa: factory.createHandlers(async (c) => {
      const { username, code, session }: VerifyTOTPBody = await c.req.json();

      const command = new AdminRespondToAuthChallengeCommand({
        ClientId: process.env.USER_POOL_CLIENT_ID,
        UserPoolId: process.env.USER_POOL_ID,
        ChallengeName: "SOFTWARE_TOKEN_MFA",
        ChallengeResponses: {
          USERNAME: username,
          SOFTWARE_TOKEN_MFA_CODE: code,
        },
        Session: session,
      });

      const response = await cognitoClient.send(command);
      const tokens = response.AuthenticationResult;

      if (!tokens?.AccessToken || !tokens.IdToken || !tokens.RefreshToken) {
        return c.json({ success: false, message: "Failed to get tokens" }, 400);
      }

      // Cookieの設定
      setCookie(c, "accessToken", tokens.AccessToken, {
        httpOnly: true, // JavaScriptからのアクセスを防止
        secure: true, // HTTPS経由でのみ送信
        sameSite: "Strict", // CSRF対策
        maxAge: 3600, // アクセストークンの有効期間（1時間）
        path: "/", // 全てのパスで利用可能
      });

      setCookie(c, "idToken", tokens.IdToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 3600,
        path: "/",
      });

      setCookie(c, "refreshToken", tokens.RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 30 * 24 * 3600, // リフレッシュトークンの有効期間（30日）
        path: "/",
      });

      return c.json({
        success: true,
        username,
      });
    }),

    // // セッションの検証
    // verifySession: factory.createHandlers(async (c) => {
    //   const sessionId = getCookie(c, "sessionId");

    //   if (!sessionId) {
    //     throw new HTTPException(400, {
    //       message: "cookieにセッションIDが含まれていません",
    //     });
    //   }

    //   // セッション検証（失敗時はService層で例外がスローされる）
    //   const { userId } = await authService.verifySession(sessionId);
    //   return c.json({ userId: userId });
    // }),
  };
};
