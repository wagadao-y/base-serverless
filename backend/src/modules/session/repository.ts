import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

// トランザクションアイテムの型
type TransactWriteItem = NonNullable<
  TransactWriteCommandInput["TransactItems"]
>[number];

// DynamoDBにセッション情報を保存するリポジトリ
export class SessionRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    if (!process.env.TABLE_NAME) {
      throw new Error("TABLE_NAME environment variable is not set");
    }
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.TABLE_NAME;
  }

  // セッション情報を取得
  async get(sessionId: string) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `SESSION#${sessionId}`,
        SK: "METADATA",
      },
    });

    const response = await this.docClient.send(command);
    return response.Item;
  }

  // セッション情報を削除
  async delete(sessionId: string) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `SESSION#${sessionId}`,
        SK: "METADATA",
      },
    });

    await this.docClient.send(command);
  }

  // セッション情報を保存
  async save(sessionData: {
    sessionId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
  }) {
    // 1. 現在のユーザーセッション情報を取得
    const currentSession = await this.getUserCurrentSession(sessionData.userId);

    // 2. トランザクションアイテムを準備
    const transactItems: TransactWriteItem[] = [
      // 新しいセッション情報を保存
      {
        // セッションIDは一意である必要があるため、PKに設定し、SKは固定値とする
        Put: {
          TableName: this.tableName,
          Item: {
            PK: `SESSION#${sessionData.sessionId}`,
            SK: "METADATA",
            ...sessionData,
            ttl: Math.floor(new Date(sessionData.expiresAt).getTime() / 1000),
          },
        },
      },
      // ユーザーの現在のセッション情報を更新
      {
        Put: {
          TableName: this.tableName,
          Item: {
            PK: `USER#${sessionData.userId}`,
            SK: "SESSION",
            currentSessionId: sessionData.sessionId,
          },
        },
      },
    ];

    // 3. 古いセッションが存在する場合、削除を追加
    if (currentSession?.currentSessionId) {
      transactItems.push({
        Delete: {
          TableName: this.tableName,
          Key: {
            PK: `SESSION#${currentSession.currentSessionId}`,
            SK: "METADATA",
          },
        },
      });
    }

    // トランザクションを実行
    const command = new TransactWriteCommand({
      TransactItems: transactItems,
    });

    await this.docClient.send(command);
  }

  // ユーザーの現在のセッション情報を取得
  async getUserCurrentSession(userId: string) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: "SESSION",
      },
    });

    const response = await this.docClient.send(command);
    return response.Item;
  }
}
