import { createAuthHandlers } from "@/modules/auth/controller";
import { AuthService } from "@/modules/auth/service";
import { SessionRepository } from "@/modules/session/repository";
import { CognitoClient } from "@/clients/cognito";

// 認証モジュール
export function createAuthModule() {
  // 依存関係の初期化
  const sessionRepository = new SessionRepository();
  const cognitoClient = new CognitoClient();
  const authService = new AuthService(sessionRepository, cognitoClient);
  return createAuthHandlers(authService);
}
