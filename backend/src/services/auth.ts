import { SessionRepository } from "@/repositories/session";
import { CognitoClient } from "@/clients/cognito";
import { HTTPException } from "hono/http-exception";

// 認証サービス
export class AuthService {
  private readonly MAX_RETRY_COUNT = 3;

  constructor(
    private sessionRepository: SessionRepository,
    private cognitoClient: CognitoClient
  ) {}

  // // セッションID生成
  // private generateSessionId(): string {
  //   return crypto.randomBytes(64).toString("base64url");
  // }

  // // ユニークなセッションIDを生成する
  // private async createUniqueSessionId(): Promise<string> {
  //   let retryCount = 0;

  //   while (retryCount < this.MAX_RETRY_COUNT) {
  //     const sessionId = this.generateSessionId();
  //     const existingSession = await this.sessionRepository.get(sessionId);

  //     if (!existingSession) {
  //       return sessionId;
  //     }

  //     retryCount++;
  //   }

  //   // 最大リトライ回数を超えた場合はサーバーエラー
  //   throw new HTTPException(500, {
  //     message: "セッションIDの生成に失敗しました。再度お試しください。",
  //   });
  // }

  /**
   * Cognito認証
   * @param userId
   * @param password
   * @returns
   */
  async login(
    userId: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    // Cognitoで認証
    const authResult = await this.cognitoClient.authenticate(userId, password);

    // 認証結果を確認
    if (
      !authResult.success ||
      !authResult.accessToken ||
      !authResult.refreshToken
    ) {
      throw new HTTPException(401, { message: "認証に失敗しました" });
    }

    // 認証結果を返す
    return {
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: 60 * 60 * 24 * 30, // 有効期限を30日に設定（実際はトークン内の有効期限でリフレッシュする）
    };
  }

  // // セッションの検証
  // async verifySession(sessionId: string): Promise<{ userId: string }> {
  //   const session = await this.sessionRepository.get(sessionId);

  //   // セッションIDが存在しているか確認
  //   if (!session) {
  //     throw new HTTPException(401, {
  //       message: "無効なセッションIDです",
  //     });
  //   }

  //   // セッションの有効期限を確認
  //   if (new Date(session.expiresAt) < new Date()) {
  //     throw new HTTPException(401, {
  //       message: "セッションの有効期限が切れています",
  //     });
  //   }

  //   // TODO ユーザーが存在するか確認
  //   // console.log(session);
  //   // console.log(session.userId);

  //   return { userId: session.userId };
  // }
}
