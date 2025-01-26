import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { CognitoClient } from "@/clients/cognito";

/**
 * 認証ミドルウェア
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    // アクセストークンを取得
    const accessToken = getCookie(c, "accessToken");
    if (!accessToken) {
      throw new Error("アクセストークンがありません");
    }

    // アクセストークンの検証
    // 認証に成功した場合は、ユーザー情報をコンテキストに追加
    const cognitoClient = new CognitoClient();
    const payload = await cognitoClient.verify(accessToken);
    c.set("user", payload);
  } catch (error) {
    c.json({ message: "トークンの検証に失敗しました" }, 401);
  }

  // 認証に成功した場合は、次のミドルウェアを実行
  await next();
});
