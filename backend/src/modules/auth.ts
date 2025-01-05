import { AuthService } from "@/services/auth";
import { SessionRepository } from "@/repositories/session";
import { CognitoClient } from "@/clients/cognito";
import { createAuthHandlers } from "@/handlers/auth";

// 認証モジュール
export function createAuthModule() {
  // 依存関係の初期化
  const sessionRepository = new SessionRepository();
  const cognitoClient = new CognitoClient();
  const authService = new AuthService(sessionRepository, cognitoClient);
  return createAuthHandlers(authService);
}
