import { SessionRepository } from "@/repositories/session";
import { CognitoClient } from "@/clients/cognito";
import crypto from "crypto";
import { HTTPException } from "hono/http-exception";

// 認証サービス
export class AuthService {
  private readonly MAX_RETRY_COUNT = 3;

  constructor(
    private sessionRepository: SessionRepository,
    private cognitoClient: CognitoClient
  ) {}

  // セッションID生成
  private generateSessionId(): string {
    return crypto.randomBytes(64).toString("base64url");
  }

  // ユニークなセッションIDを生成する
  private async createUniqueSessionId(): Promise<string> {
    let retryCount = 0;

    while (retryCount < this.MAX_RETRY_COUNT) {
      const sessionId = this.generateSessionId();
      const existingSession = await this.sessionRepository.get(sessionId);

      if (!existingSession) {
        return sessionId;
      }

      retryCount++;
    }

    // 最大リトライ回数を超えた場合はサーバーエラー
    throw new HTTPException(500, {
      message: "セッションIDの生成に失敗しました。再度お試しください。",
    });
  }

  // ログイン
  async login(
    userId: string,
    password: string
  ): Promise<{ sessionId: string }> {
    // Cognitoで認証
    const authResult = await this.cognitoClient.authenticate(userId, password);

    // 認証結果を確認
    if (!authResult.success) {
      throw new HTTPException(401, { message: "認証に失敗しました" });
    }

    // セッションID生成（512bit = 64バイト）
    const sessionId = await this.createUniqueSessionId();

    // セッション情報をDynamoDBに保存
    // 有効期限は24時間
    await this.sessionRepository.save({
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return { sessionId };
  }

  // セッションの検証
  async verifySession(sessionId: string): Promise<{ userId: string }> {
    const session = await this.sessionRepository.get(sessionId);

    // セッションIDが存在しているか確認
    if (!session) {
      throw new HTTPException(401, {
        message: "無効なセッションIDです",
      });
    }

    // セッションの有効期限を確認
    if (new Date(session.expiresAt) < new Date()) {
      throw new HTTPException(401, {
        message: "セッションの有効期限が切れています",
      });
    }

    // TODO ユーザーが存在するか確認
    // console.log(session);
    // console.log(session.userId);

    return { userId: session.userId };
  }
}
