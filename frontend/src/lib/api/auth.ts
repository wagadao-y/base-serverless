import { apiClient } from './client';
import { hashPayload } from '$lib/util/postLambdaUrl';

// 認証エラークラス
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'invalid_credentials' | 'invalid_session' | 'network_error'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ログインAPIのレスポンスデータ型
export type LoginResponse = {
  userId: string;
};

// セッション検証APIのレスポンスデータ型
export type VerifyResponse = {
  userId: string;
};

// ログイン処理のAPI呼び出し
export async function login(userId: string, password: string): Promise<LoginResponse> {
  try {
    const payload = { userId, password };
    const response = await apiClient.api.public.auth.login.$post(
      { json: payload },
      {
        headers: {
          'x-amz-content-sha256': await hashPayload(JSON.stringify(payload))
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError('認証に失敗しました', 'invalid_credentials');
      }
      throw new AuthError('ログイン処理に失敗しました', 'network_error');
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // ネットワークエラーなどの基本的なエラーはAuthErrorとして再スローする
    throw new AuthError('サーバーとの通信に失敗しました', 'network_error');
  }
}

// セッション検証のAPI呼び出し
export async function verifySession(): Promise<VerifyResponse> {
  try {
    const response = await fetch('/api/auth/verify-session');

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError('セッションが無効もしくは有効期限が切れました', 'invalid_session');
      }
      throw new AuthError('セッションの検証に失敗しました', 'network_error');
    }

    const data: VerifyResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // ネットワークエラーなどの基本的なエラーはAuthErrorとして再スローする
    throw new AuthError('サーバーとの通信に失敗しました', 'network_error');
  }
}
